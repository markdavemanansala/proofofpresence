import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// AUDIT ONLY. Static current assets + older public synthetic snapshots.
// No application server, RPC, wallet bridge, authentication or API write exists.
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "artifacts/ui-ux-audit/a11y");
await fs.mkdir(out, { recursive: true });
const input = fileURLToPath(
  new URL("./fixtures/ui-audit-synthetic.js", import.meta.url),
);
const f = (await import("file://" + input)).default;
let role = "alice",
  failLoad = false,
  delayLoad = 0;
const evidence = {
  sourceCommit: "3332f67abd1e8364891feba7b250c1ec87e257bc",
  fixture: input,
  fixtureSha256: createHash("sha256")
    .update(await fs.readFile(input))
    .digest("hex"),
  checks: [],
  observations: [],
  requests: [],
  writes: [],
  external: [],
  errors: [],
  screenshots: [],
};
const sha = async (name) =>
  createHash("sha256")
    .update(await fs.readFile(path.join(root, "public", name)))
    .digest("hex");
evidence.assetSha256 = Object.fromEntries(
  await Promise.all(
    [
      "app.js",
      "index.html",
      "styles.css",
      "contract-inbox.js",
      "batch-actions.js",
    ].map(async (name) => [name, await sha(name)]),
  ),
);
const bootstrap = () => ({
  ...structuredClone(f.bootstrap),
  instanceId: "a11y-synthetic-only",
  mode: "hosted-testnet",
  identities: [],
  session: {
    ...f.bootstrap.identities.find((x) => x.id === role),
    mode: "wallet",
    label: "Synthetic audit role",
  },
  capabilities: {
    browserWallet: false,
    contractInbox: false,
    batchActions: false,
  },
  arbitration: {
    mode: "controlled",
    notice: "SYNTHETIC AUDIT ONLY; no independent jury",
  },
  chain: {
    chainId: 10200,
    name: "Chiado",
    nativeCurrency: { symbol: "XDAI", decimals: 18 },
  },
  events: f.bootstrap.events.map((e) => ({
    ...e,
    chainId: 10200,
    contractVersion: "kleros-event-v8",
    abiVersion: "kleros-event-v8",
  })),
});
const detail = (id) => {
  const d = structuredClone(f.events[id]);
  const identity = f.bootstrap.identities.find((x) => x.id === role);
  d.event = {
    ...d.event,
    chainId: 10200,
    contractVersion: "kleros-event-v8",
    abiVersion: "kleros-event-v8",
  };
  d.permissions = {
    authenticated: true,
    owner: identity.wallet.toLowerCase() === d.state.owner.toLowerCase(),
    staff: role === "staff-a",
  };
  d.ownWallet = {
    wallet: identity.wallet,
    pendingCreditWei: "2000000000000",
    owedWei: "0",
  };
  d.state.pendingCreditTotalWei = "2000000000000";
  return d;
};
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    evidence.requests.push({ method: req.method, path: u.pathname });
    if (req.method !== "GET" && req.method !== "HEAD") {
      evidence.writes.push({ method: req.method, path: u.pathname });
      res.writeHead(405);
      return res.end("Audit blocks every write");
    }
    if (u.pathname.startsWith("/api/")) {
      if (delayLoad) await new Promise((r) => setTimeout(r, delayLoad));
      res.setHeader("content-type", "application/json");
      if (failLoad) {
        res.writeHead(503);
        return res.end(
          JSON.stringify({
            error: "SYNTHETIC GET failure: source unavailable",
          }),
        );
      }
      if (u.pathname === "/api/bootstrap")
        return res.end(JSON.stringify(bootstrap()));
      if (/^\/api\/events\/event-[ab]$/.test(u.pathname))
        return res.end(JSON.stringify(detail(u.pathname.split("/").at(-1))));
      res.writeHead(404);
      return res.end(JSON.stringify({ error: "No other API exists in audit" }));
    }
    const rel =
      u.pathname === "/"
        ? "index.html"
        : decodeURIComponent(u.pathname.slice(1));
    if (rel.includes("..")) throw Error("invalid asset path");
    const bytes = await fs.readFile(path.join(root, "public", rel));
    res.setHeader(
      "content-type",
      mime[path.extname(rel)] ?? "application/octet-stream",
    );
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("Unavailable audit asset");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await context.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin
      ? route.continue()
      : (evidence.external.push(route.request().url()),
        route.abort("blockedbyclient")),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => evidence.errors.push(e.message));
  const visit = async (view = "participant") => {
    await page.goto(origin + "/#event=event-b&view=" + view);
    await page.reload();
    await expect(page.locator("#content")).toBeVisible();
    await expect(page.locator("#event-switch")).toHaveValue("event-b");
  };
  const capture = async (name) => {
    const file = name + ".png";
    await page.screenshot({ path: path.join(out, file), fullPage: false });
    evidence.screenshots.push(file);
  };
  const bounds = () =>
    page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
  const controls = () =>
    page.evaluate(() =>
      [
        ...document.querySelectorAll(
          "a[href],button,input,select,textarea,summary",
        ),
      ]
        .filter(
          (e) =>
            e.getClientRects().length &&
            getComputedStyle(e).visibility !== "hidden" &&
            !e.closest("details:not([open]) *:not(summary)"),
        )
        .map((e) => {
          const r = e.getBoundingClientRect();
          const label = e.labels?.length
            ? [...e.labels].map((x) => x.textContent).join(" ")
            : "";
          return {
            tag: e.tagName,
            id: e.id,
            text: (
              e.getAttribute("aria-label") ||
              label ||
              e.innerText ||
              e.getAttribute("title") ||
              ""
            )
              .trim()
              .slice(0, 120),
            width: r.width,
            height: r.height,
            disabled: !!e.disabled,
            type: e.getAttribute("type"),
            role: e.getAttribute("role"),
            html:
              !e.innerText && !e.getAttribute("aria-label")
                ? e.outerHTML
                : null,
          };
        }),
    );
  await visit();
  evidence.checks.push(
    "Current frozen main app assets render from a synthetic GET-only fixture",
  );
  await page.keyboard.press("Tab");
  evidence.observations.push({
    name: "first-tab",
    active: await page.evaluate(() => ({
      id: document.activeElement.id,
      text: document.activeElement.textContent,
    })),
  });
  await page.locator(".skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  evidence.checks.push(
    "Skip-to-content link initially moves keyboard focus to main",
  );
  await page.waitForTimeout(300);
  evidence.observations.push({
    name: "skip-after-render",
    hash: await page.evaluate(() => location.hash),
    eventSwitchCount: await page.locator("#event-switch").count(),
    title: await page.locator("h1").first().textContent(),
  });
  await capture("skip-after-render");
  await visit();
  await page.locator("[role=tab][data-view=participant]").focus();
  await page.keyboard.press("End");
  await expect(page.locator("[role=tab][data-view=cases]")).toBeFocused();
  evidence.checks.push("End activates and focuses the last event tab");
  await page.keyboard.press("Home");
  await expect(page.locator("[role=tab][data-view=participant]")).toBeFocused();
  evidence.checks.push("Home activates and focuses the first event tab");
  await page.locator("[data-view=organizer]").click();
  await expect(page.locator("#event-panel"))
    .toBeVisible()
    .catch(() => {});
  await page.waitForTimeout(150);
  evidence.observations.push({
    name: "click-tab-focus",
    active: await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      id: document.activeElement.id,
      view: document.activeElement.getAttribute("data-view"),
    })),
  });
  await visit();
  await page.locator("#event-switch").focus();
  await page.locator("#event-switch").selectOption("event-a");
  await expect(page.locator("#event-switch")).toHaveValue("event-a");
  evidence.observations.push({
    name: "keyboard-event-switch-focus",
    active: await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      id: document.activeElement.id,
    })),
    hash: await page.evaluate(() => location.hash),
  });
  await visit();
  await page.locator("[data-recovery=withdrawPending]").first().click();
  await expect(page.locator("#review-dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toBeFocused();
  for (let n = 0; n < 12; n++) {
    await page.keyboard.press(n % 3 ? "Tab" : "Shift+Tab");
    if (
      !(await page.evaluate(() =>
        document
          .querySelector("#review-dialog")
          .contains(document.activeElement),
      ))
    )
      throw Error("Focus escaped main dialog");
  }
  evidence.checks.push(
    "Recovery dialog receives title focus and contains Tab/Shift+Tab",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#review-dialog")).not.toBeVisible();
  evidence.observations.push({
    name: "dialog-return-focus",
    active: await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      text: document.activeElement.textContent,
      action: document.activeElement.getAttribute("data-recovery"),
    })),
  });
  evidence.checks.push("Escape dismisses the non-submitting recovery form");
  for (const view of ["participant", "organizer", "cases"]) {
    role = view === "organizer" ? "organizer-b" : "alice";
    await visit(view);
    evidence.observations.push({
      name: "desktop-" + view,
      bounds: await bounds(),
      controls: await controls(),
    });
    await capture("desktop-" + view);
  }
  role = "organizer-b";
  await visit("cases");
  await page.locator("[data-edit-event]").click();
  await expect(page.locator("#review-dialog")).toBeVisible();
  const nestedSummary = page.locator("#review-dialog details summary");
  await nestedSummary.focus();
  const trace = [];
  for (let n = 0; n < 3; n++) {
    await page.keyboard.press("Tab");
    trace.push(
      await page.evaluate(() => ({
        tag: document.activeElement.tagName,
        id: document.activeElement.id,
        text: document.activeElement.textContent?.slice(0, 60),
        detailsOpen: document.querySelector("#review-dialog details").open,
      })),
    );
  }
  evidence.observations.push({ name: "closed-settings-details-tab", trace });
  await capture("settings-closed-details-tab");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 400, height: 800 });
  for (const view of ["participant", "organizer", "cases"]) {
    role = view === "organizer" ? "organizer-b" : "alice";
    await visit(view);
    evidence.observations.push({
      name: "mobile-" + view,
      bounds: await bounds(),
      controls: await controls(),
    });
    await capture("mobile-" + view);
  }
  role = "alice";
  await visit();
  await page.locator("[data-recovery=withdrawPending]").first().click();
  await capture("mobile-recovery");
  evidence.observations.push({
    name: "mobile-recovery",
    controls: await controls(),
    bounds: await bounds(),
  });
  await page.keyboard.press("Escape");
  await visit("cases");
  await page.evaluate(() => {
    const values = [...document.querySelectorAll("body,body *")].map(
      (element) => [element, parseFloat(getComputedStyle(element).fontSize)],
    );
    for (const [element, size] of values)
      if (element instanceof HTMLElement && Number.isFinite(size))
        element.style.setProperty("font-size", size * 2 + "px", "important");
  });
  evidence.observations.push({
    name: "mobile-cases-200-text",
    bounds: await bounds(),
    controls: await controls(),
    banner: await page.locator("#testnet-banner").evaluate((e) => ({
      height: e.getBoundingClientRect().height,
      position: getComputedStyle(e).position,
    })),
  });
  await capture("mobile-cases-200-text");
  await page.locator("#event-switch").scrollIntoViewIfNeeded();
  await capture("mobile-cases-200-context");
  role = "alice";
  delayLoad = 1200;
  const loading = page.reload();
  await page.waitForTimeout(250);
  evidence.observations.push({
    name: "loading",
    text: await page.locator("#loading").textContent(),
    role: await page.locator("#loading").getAttribute("role"),
    live: await page.locator("#loading").getAttribute("aria-live"),
  });
  await capture("loading");
  await loading;
  await expect(page.locator("#content")).toBeVisible();
  delayLoad = 0;
  failLoad = true;
  await page.locator("#refresh").click();
  await expect(page.locator(".error-panel")).toBeVisible();
  evidence.observations.push({
    name: "load-error",
    active: await page.evaluate(() => ({
      id: document.activeElement.id,
      tag: document.activeElement.tagName,
    })),
    panelRole: await page.locator(".error-panel").getAttribute("role"),
    contentLive: await page.locator("#content").getAttribute("aria-live"),
    text: await page.locator(".error-panel").textContent(),
  });
  await page.locator(".error-panel").scrollIntoViewIfNeeded();
  await capture("load-error");
  console.log(
    "Audit observations captured. No pass/conformance claim is derived from DOM heuristics.",
  );
} finally {
  await fs.writeFile(
    path.join(out, "results.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
