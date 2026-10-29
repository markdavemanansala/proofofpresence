import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  V9_TESTNET_EVENT_ID as eventId,
  V9_TESTNET_MODE as mode,
  V9_TESTNET_PROFILE as profile,
  V9_TESTNET_UI_CONTRACT as core,
  V9_TESTNET_INVALID,
  makeV9TestnetFixture,
  invalidV9TestnetFixture,
  recoveryOnlyV9TestnetFixture,
} from "./fixtures/v9-testnet-ui-fixture.mjs";
import {
  FIXTURE_WALLET as wallet,
  FIXTURE_CONTRACT as contract,
  FIXTURE_OTHER,
} from "./fixtures/production-ui-fixture.mjs";

// TEST ONLY: actual local frontend + explicitly synthetic same-origin HTTP DTOs.
// No runtime imports, public target, real wallet, RPC, transaction execution or chain.
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "artifacts/v9-testnet-ui");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function selfTest() {
  const fixture = makeV9TestnetFixture();
  assert.equal(fixture.bootstrap.mode, mode);
  assert.equal(fixture.bootstrap.chain.chainId, 10200);
  assert.equal(fixture.bootstrap.chain.nativeCurrency.symbol, "XDAI");
  assert.equal(fixture.detail.event.contractVersion, profile);
  assert.equal(fixture.detail.event.abiVersion, profile);
  assert.equal(fixture.detail.event.contractProfile.testOnly, true);
  assert.equal(
    fixture.detail.event.contractProfile.challengeWindowSeconds,
    86400,
  );
  assert.equal(fixture.bootstrap.environment.production, false);
  assert.equal(fixture.bootstrap.governance.label, undefined);
  assert.equal(fixture.detail.upgrade.governanceKind, "single-owner-timelock");
  assert.equal(fixture.detail.upgrade.multisig, undefined);
  const before = JSON.stringify(fixture);
  for (const invalid of V9_TESTNET_INVALID) {
    const changed = invalidV9TestnetFixture(fixture, invalid);
    assert.notEqual(JSON.stringify(changed), before);
    assert.equal(JSON.stringify(fixture), before);
  }
  for (const code of ["UPGRADE_TRUST_MISMATCH", "SELECTED_EVENT_UNAVAILABLE"]) {
    const recovery = recoveryOnlyV9TestnetFixture(fixture, code);
    assert.deepEqual(recovery.bootstrap.events, []);
    assert.equal(recovery.bootstrap.recoveryEvents[0].abiVersion, profile);
    assert.equal(recovery.bootstrap.recoveryEvents[0].chainId, 10200);
    assert.deepEqual(
      Object.keys(recovery.bootstrap.recoveryEvents[0]).sort(),
      ["id", "chainId", "contract", "contractVersion", "abiVersion"].sort(),
    );
  }
  console.log(
    JSON.stringify(
      {
        status: "passed",
        fixtureCases: 1 + V9_TESTNET_INVALID.length + 2,
        networkRequests: 0,
        browserLaunches: 0,
      },
      null,
      2,
    ),
  );
}
async function run() {
  const { chromium, expect } = await import("@playwright/test");
  await fs.mkdir(out, { recursive: true });
  const result = {
    status: "running",
    checks: [],
    requests: [],
    forbidden: [],
    external: [],
    walletCalls: [],
    errors: [],
    screenshots: [],
    limitations: [
      "Local synthetic UI DTOs only. No live deployment, governance, ABI, policy, economic or EOA enforcement proof.",
      "One allowlisted synthetic deposit quote preparation is rendered and cancelled. It is a mock, never executed, signed or submitted.",
      "Auth challenge/verify and original-submission reconciliation are local mocks. All wallet transaction/RPC methods and external traffic are blocked.",
    ],
  };
  let selected = makeV9TestnetFixture(),
    errorCode = null,
    reconcile = null,
    draft = null,
    serial = 0;
  const assets = new Map();
  const apiBase = `/api/events/${eventId}`;
  const allowedPosts = new Set([
    "/api/auth/challenge",
    "/api/auth/verify",
    apiBase + "/drafts",
    apiBase + "/submissions/reconcile",
  ]);
  const send = (res, status, value) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify(value));
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost"),
      record = { method: req.method, path: url.pathname, query: url.search };
    result.requests.push(record);
    try {
      let body;
      if (req.method === "POST") {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
        record.body = body;
      }
      if (
        req.method === "GET" &&
        url.pathname === "/api/bootstrap" &&
        url.searchParams.size === 1 &&
        url.searchParams.get("selectedEventId") === eventId
      )
        return send(res, 200, selected.bootstrap);
      if (req.method === "GET" && url.pathname === apiBase && !url.search)
        return errorCode
          ? send(res, 409, {
              code: errorCode,
              error: "Synthetic deployment trust unavailable",
            })
          : send(res, 200, selected.detail);
      if (req.method === "POST" && url.pathname === "/api/auth/challenge") {
        assert.deepEqual(body, { wallet });
        return send(res, 200, {
          nonce: "synthetic-v9-chiado-nonce",
          message: "SYNTHETIC CHIADO AUTH; NOT A REAL SIGNATURE",
        });
      }
      if (req.method === "POST" && url.pathname === "/api/auth/verify") {
        assert.deepEqual(body, {
          nonce: "synthetic-v9-chiado-nonce",
          signature: "SYNTHETIC_V9_TESTNET_NOT_A_SIGNATURE",
        });
        selected = makeV9TestnetFixture();
        return send(res, 200, {
          wallet,
          label: "Fixture wallet",
          mode: "wallet",
        });
      }
      if (req.method === "POST" && url.pathname === apiBase + "/drafts") {
        assert.deepEqual(body, { action: "deposit", params: {} });
        assert.equal(selected.bootstrap.mode, mode);
        assert.equal(selected.detail.event.chainId, 10200);
        assert.equal(selected.detail.event.abiVersion, profile);
        draft = {
          id: "synthetic-v9-quote-" + ++serial,
          eventId,
          action: "deposit",
          params: {},
          wallet,
          chainId: 10200,
          contract,
          abiVersion: profile,
          contractVersion: profile,
          mode,
          instanceId: selected.bootstrap.instanceId,
          valueWei: selected.detail.event.depositWei,
          method: "deposit",
          args: [],
          summary:
            "SYNTHETIC TEST QUOTE ONLY — no chain simulation or transaction",
          createdAt: Date.now(),
          expiresAt: Date.now() + 300000,
          reviewBlock: selected.detail.state.blockNumber,
          snapshot: selected.detail.state.fingerprint,
          transaction: {
            to: contract,
            from: wallet,
            chainId: 10200,
            value: selected.detail.event.depositWei,
            data: "0x",
          },
        };
        return send(res, 200, draft);
      }
      if (
        req.method === "POST" &&
        url.pathname === apiBase + "/submissions/reconcile" &&
        reconcile
      ) {
        assert.deepEqual(body, {
          draftId: reconcile.draftId,
          hash: reconcile.hash,
        });
        return send(res, 200, reconcile.response);
      }
      if (
        url.pathname.startsWith("/api/") ||
        !["GET", "HEAD"].includes(req.method)
      ) {
        result.forbidden.push(record);
        return send(res, 405, {
          error: "No other API exists in the isolated fixture",
        });
      }
      const name =
        url.pathname === "/"
          ? "index.html"
          : decodeURIComponent(url.pathname.slice(1));
      if (
        name.split("/").some((x) => [".", "..", ""].includes(x)) ||
        name.includes("\\")
      )
        throw Error("Invalid asset path");
      if (!assets.has(name))
        assets.set(name, await fs.readFile(path.join(root, "public", name)));
      const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      };
      res.writeHead(200, {
        "content-type": mime[path.extname(name)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(assets.get(name));
    } catch (error) {
      record.error = error.message;
      send(res, 500, { error: error.message });
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  let browser, page;
  const pass = (label) => result.checks.push(label);
  const count = (pathname) =>
    result.requests.filter((x) => x.method === "POST" && x.path === pathname)
      .length;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    await context.route("**/*", (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (url.origin !== origin) {
        result.external.push(request.url());
        return route.abort("blockedbyclient");
      }
      if (
        !["GET", "HEAD"].includes(request.method()) &&
        !(
          request.method() === "POST" &&
          allowedPosts.has(url.pathname) &&
          !url.search
        )
      ) {
        result.forbidden.push({ method: request.method(), path: url.pathname });
        return route.abort("blockedbyclient");
      }
      return route.continue();
    });
    await context.routeWebSocket("**/*", (route) => {
      result.forbidden.push({ method: "WebSocket", url: route.url() });
      route.close();
    });
    await context.exposeBinding("__v9Wallet", (_source, method, params) => {
      result.walletCalls.push({ method, params });
      if (["eth_requestAccounts", "eth_accounts"].includes(method))
        return [wallet];
      if (method === "eth_chainId") return "0x27d8";
      if (method === "personal_sign")
        return "SYNTHETIC_V9_TESTNET_NOT_A_SIGNATURE";
      result.forbidden.push({ method });
      throw Error("No transaction or RPC wallet method exists in this fixture");
    });
    await context.addInitScript(() => {
      window.ethereum = {
        request: ({ method, params = [] }) => window.__v9Wallet(method, params),
        on() {},
        removeListener() {},
      };
    });
    page = await context.newPage();
    page.on("pageerror", (error) => result.errors.push(error.message));
    let visitId = 0;
    const visit = async (
      scenario = "before-deposit",
      {
        invalid = null,
        authenticated = true,
        view = "participant",
        failure = null,
        recoveryVariant = "minimal",
        appealQuoteWei = undefined,
      } = {},
    ) => {
      selected = makeV9TestnetFixture(scenario, {
        authenticated,
        appealQuoteWei,
      });
      errorCode = failure;
      if (invalid) selected = invalidV9TestnetFixture(selected, invalid);
      if (failure)
        selected = recoveryOnlyV9TestnetFixture(
          selected,
          failure,
          recoveryVariant,
        );
      await page.goto(
        origin +
          "/?synthetic=" +
          ++visitId +
          "#" +
          new URLSearchParams({ event: eventId, view }),
      );
      await expect(page.locator("#content")).toBeVisible();
      await expect(page.locator("#loading")).toBeHidden();
      if (!failure && !invalid)
        await expect(page.locator("#event-switch")).toHaveValue(eventId);
    };
    const capture = async (name) => {
      await page.screenshot({
        path: path.join(out, name + ".png"),
        fullPage: false,
      });
      result.screenshots.push(name + ".png");
    };
    const assertNoDemo = async () => {
      await expect(
        page.locator(
          "#identity-select,#dialog-identity,[data-identity],[data-fund-wallet],[data-advance],[data-ruling],[data-open-appeal],[data-create-event],a[href*='/finance/']",
        ),
      ).toHaveCount(0);
      const text = await page.locator("body").innerText();
      assert(
        !/ETHEREUM MAINNET|transactions use real ETH|15-minute TEST ONLY|local Court mock controls/i.test(
          text,
        ),
      );
    };
    await visit();
    await assertNoDemo();
    await expect(page.locator('[data-tx="deposit"]')).toBeEnabled();
    await expect(page.locator("body")).toContainText("V9 CHIADO TESTNET");
    await expect(page.locator("body")).toContainText(
      "Test XDAI and synthetic data only",
    );
    await expect(page.locator("body")).toContainText(
      "No independent Kleros jury",
    );
    const details = page.locator("[data-v9-testnet-details]").first();
    await details.locator("summary").click();
    await expect(details).toContainText(core.detailContext.upgrade.owner);
    await expect(details).toContainText(core.detailContext.upgrade.authority);
    await expect(details).toContainText("172800");
    await expect(details).not.toContainText(/multisig/i);
    await capture("desktop-context");
    pass(
      "Explicit V9 Chiado/XDAI/controlled arbitration and canonical single-owner governance render without production or demo controls",
    );

    await page.locator('[data-tx="deposit"]').click();
    await expect(page.locator("#review-dialog")).toBeVisible();
    assert.equal(count(apiBase + "/drafts"), 1);
    assert.equal(draft.snapshot, selected.detail.state.fingerprint);
    assert.equal(draft.abiVersion, profile);
    assert.equal(draft.chainId, 10200);
    assert.equal(draft.mode, mode);
    await expect(page.locator("#review-dialog")).toContainText(
      "SYNTHETIC TEST QUOTE ONLY",
    );
    await expect(page.locator("#review-dialog")).toContainText(
      "Chiado · 10200",
    );
    await expect(page.locator("#review-dialog")).toContainText("0.01 XDAI");
    await expect(page.locator("#execute-transaction")).toHaveText(
      "Confirm testnet transaction",
    );
    await expect(page.locator("#dialog-title")).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(i % 2 ? "Tab" : "Shift+Tab");
      assert(
        await page.evaluate(() =>
          document
            .querySelector("#review-dialog")
            .contains(document.activeElement),
        ),
      );
    }
    await capture("synthetic-quote-review");
    await page.keyboard.press("Escape");
    await expect(page.locator("#review-dialog")).toBeHidden();
    await expect(page.locator("#execute-transaction")).toBeHidden();
    await expect(page.locator('[data-tx="deposit"]')).toBeFocused();
    assert.deepEqual(
      await page.evaluate(() =>
        Object.keys(localStorage).filter((key) =>
          key.startsWith("kleros-transactions:"),
        ),
      ),
      [],
    );
    pass(
      "One explicitly mocked deposit preparation uses the exact chain/profile/context and fresh state fingerprint; testnet review is cancelled without signing or journaling a hash",
    );

    await visit("deposit-pending");
    await page.locator(".status-details summary").click();
    await expect(page.locator(".status-details")).toContainText(
      "Host decision pending",
    );
    await expect(page.locator(".status-details")).toContainText(
      "Not registered on chain",
    );
    await visit("matched-unruled", { view: "cases" });
    await expect(page.locator('[data-tx="appealRewards"]')).toBeDisabled();
    await expect(page.locator("[data-appeal-withdrawable]")).toHaveText(
      "Pending · amount unavailable",
    );
    await page
      .locator(".case-card details")
      .filter({ has: page.locator('form[data-form="evidence"]') })
      .locator(":scope > summary")
      .click();
    await expect(
      page.locator('form[data-form="evidence"] input[name="uri"]'),
    ).toBeVisible();
    await visit("paid", { view: "cases", appealQuoteWei: "0" });
    await expect(page.locator("[data-appeal-withdrawable]")).toHaveText(
      "0 XDAI",
    );
    await expect(page.locator('[data-tx="appealRewards"]')).toBeEnabled();
    pass(
      "Deposit, admission and registration stay independent; finality gates rewards, explicit zero remains quoted zero, and the evidence URI review remains available",
    );

    for (const invalid of V9_TESTNET_INVALID) {
      await visit("before-deposit", { invalid });
      const before = count(apiBase + "/drafts"),
        walletBefore = result.walletCalls.length;
      await page.locator("#content").evaluate((content) => {
        const button = document.createElement("button");
        button.id = "synthetic-stale-control";
        button.dataset.tx = "deposit";
        button.textContent = "TEST ONLY stale control";
        content.append(button);
      });
      await page.locator("#synthetic-stale-control").click();
      await expect(page.locator("#toast")).toBeVisible();
      assert.equal(
        count(apiBase + "/drafts"),
        before,
        "Invalid context reached draft API: " + invalid.name,
      );
      assert.deepEqual(
        result.walletCalls.slice(walletBefore),
        [],
        invalid.name,
      );
    }
    pass(
      "Wrong mode/profile/chain/ABI/governance/readiness/arbitration reject tampered prepare controls before any new draft or wallet request",
    );

    await visit("before-deposit", { authenticated: false });
    await page.locator("#top-identity").click();
    await page.locator("#review-dialog [data-connect-wallet]").click();
    await expect(page.locator("#top-identity")).toHaveText("Fixture wallet");
    await expect(page.locator(".identity-address")).toHaveText(wallet);
    assert(result.walletCalls.some((x) => x.method === "eth_chainId"));
    assert(result.walletCalls.some((x) => x.method === "personal_sign"));
    pass(
      "Anonymous wallet authentication requests only chain10200/accounts and a fake nonce signature, never transaction or RPC methods",
    );

    for (const [failure, digit] of [
      ["UPGRADE_TRUST_MISMATCH", "6"],
      ["SELECTED_EVENT_UNAVAILABLE", "7"],
    ]) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await visit();
      const scope = {
        eventId,
        wallet,
        chainId: 10200,
        contract,
        abiVersion: profile,
        mode,
        instanceId: selected.bootstrap.instanceId,
      };
      const original = {
        hash: "0x" + digit.repeat(64),
        draftId: "synthetic-chiado-original-" + digit,
        action: "deposit",
      };
      await page.evaluate(
        async ({ scope, original }) => {
          const { createTransactionJournal } = await import(
            "/transaction-context.js"
          );
          createTransactionJournal(localStorage).record(scope, original);
        },
        { scope, original },
      );
      const journal = () =>
        page.evaluate(async (scope) => {
          const { createTransactionJournal } = await import(
            "/transaction-context.js"
          );
          return createTransactionJournal(localStorage).list(scope);
        }, scope);
      const prior = await journal();
      reconcile = {
        ...original,
        response: {
          ...original,
          eventId,
          wallet,
          chainId: 10200,
          contract,
          recovered: true,
          status: "confirmed",
          blockNumber: 111,
        },
      };
      const before = count(apiBase + "/submissions/reconcile");
      await visit("before-deposit", { failure });
      await expect(page.locator("[data-submitted-recovery]")).toContainText(
        original.hash,
      );
      await expect(page.locator("[data-submitted-recovery]")).toContainText(
        "Chiado",
      );
      await expect(page.locator("[data-submitted-recovery]")).not.toContainText(
        "Ethereum",
      );
      assert.equal(count(apiBase + "/submissions/reconcile"), before);
      assert.deepEqual(await journal(), prior);
      reconcile.response.wallet = FIXTURE_OTHER;
      await page
        .locator(`[data-reconcile-submission="${original.hash}"]`)
        .click();
      await expect(
        page.locator(`[data-reconcile-status="${original.hash}"]`),
      ).toContainText("did not match");
      assert.deepEqual(await journal(), prior);
      reconcile.response.wallet = wallet;
      await page
        .locator(`[data-reconcile-submission="${original.hash}"]`)
        .click();
      await expect(
        page.locator(`[data-reconcile-status="${original.hash}"]`),
      ).toContainText("Confirmed original transaction");
      assert.equal(count(apiBase + "/submissions/reconcile"), before + 2);
      assert.equal((await journal())[0].status, "confirmed");
      pass(
        failure +
          " minimal identity recovery preserves the exact new mode/profile/chain journal and checks only the original submission on explicit clicks",
      );
    }
    reconcile = null;
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await visit("owed");
    await assertNoDemo();
    await page.locator(".status-details summary").click();
    const payout = page
      .locator(".state-fact")
      .filter({ has: page.locator("dt", { hasText: /^Payout$/ }) });
    await expect(payout).toContainText("0.01 XDAI still owed");
    await payout.scrollIntoViewIfNeeded();
    await capture("mobile-owed");
    assert(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.body.scrollWidth <= innerWidth,
      ),
    );
    await page.evaluate(() => {
      const sizes = [...document.querySelectorAll("body,body *")].map((e) => [
        e,
        parseFloat(getComputedStyle(e).fontSize),
      ]);
      for (const [e, size] of sizes)
        if (e instanceof HTMLElement && Number.isFinite(size))
          e.style.setProperty("font-size", size * 2 + "px", "important");
    });
    assert(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.body.scrollWidth <= innerWidth,
      ),
    );
    await payout.scrollIntoViewIfNeeded();
    await capture("mobile-200-text");
    pass(
      "Mobile390px and actual doubled text preserve readable owed status without document overflow",
    );
    assert.equal(count(apiBase + "/drafts"), 1);
    assert.deepEqual(result.forbidden, []);
    assert.deepEqual(result.external, []);
    assert.deepEqual(result.errors, []);
    result.status = "passed";
    console.log(
      JSON.stringify(
        {
          status: result.status,
          groups: result.checks.length,
          mockedPreparations: 1,
          financialSends: 0,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    result.status = "failed";
    result.failure = { message: error.message, stack: error.stack };
    if (page && !page.isClosed())
      await page
        .screenshot({ path: path.join(out, "failure.png") })
        .catch(() => {});
    throw error;
  } finally {
    result.assetSha256 = Object.fromEntries(
      [...assets]
        .filter(([name]) => /\.(js|css|html)$/.test(name))
        .map(([name, bytes]) => [name, sha(bytes)]),
    );
    await fs.writeFile(
      path.join(out, "results.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--self-test") await selfTest();
else if (args.length === 1 && args[0] === "--run-loopback") await run();
else if (!args.length)
  console.log(
    "Prepared; run --self-test offline. --run-loopback only after ROOT source-ready. No public URL accepted.",
  );
else
  throw Error(
    "Only --self-test or authorized --run-loopback is accepted; no public origin is supported.",
  );
