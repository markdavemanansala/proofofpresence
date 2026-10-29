import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = path.join(root, "artifacts/ui-ux-audit/performance");
await fs.mkdir(path.join(out, "screenshots"), { recursive: true });
const manifest = JSON.parse(
  await fs.readFile(
    path.join(root, "registry/chiado-v8-controlled.json"),
    "utf8",
  ),
);
const definition = manifest.events[0].definition;
const liveEventId = definition.id ?? definition.eventId;
if (typeof liveEventId !== "string")
  throw new Error("No public A/B stable event identity");
const targets = [
  {
    id: "preview-deposit",
    kind: "synthetic read-only preview",
    url: "https://kleros-ui-preview-20261028-e32b4c.netlify.app/deposit/event-b/",
    ready: "#deposit-title, h1",
  },
  {
    id: "preview-organizer",
    kind: "synthetic read-only preview",
    url: "https://kleros-ui-preview-20261028-e32b4c.netlify.app/admin/?example=organizer-b#event=event-b&view=organizer",
    ready: "#content:not([hidden])",
  },
  {
    id: "preview-disputes",
    kind: "synthetic read-only preview",
    url: "https://kleros-ui-preview-20261028-e32b4c.netlify.app/admin/?example=organizer-a#event=event-a&view=cases",
    ready: "#content:not([hidden])",
  },
  {
    id: "live-participant",
    kind: "anonymous hosted Chiado app; GET only",
    url: `https://kleros-event-workbench-preview.netlify.app/#event=${encodeURIComponent(liveEventId)}&view=participant`,
    ready: "#content:not([hidden])",
  },
];
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const device of ["desktop", "mobile"])
    for (const target of targets) {
      const mobile = device === "mobile";
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const client = await context.newCDPSession(page);
      await client.send("Network.enable");
      if (mobile) {
        await client.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: 1_600_000 / 8,
          uploadThroughput: 750_000 / 8,
          connectionType: "cellular4g",
        });
        await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      let requests = [],
        responses = [],
        errors = [],
        blocked = [],
        sockets = [];
      await context.route("**/*", (route) => {
        const req = route.request(),
          url = new URL(req.url());
        if (
          !["GET", "HEAD"].includes(req.method()) ||
          url.origin !== new URL(target.url).origin
        ) {
          blocked.push({ method: req.method(), url: req.url() });
          return route.abort("blockedbyclient");
        }
        requests.push({ method: req.method(), url: req.url() });
        return route.continue();
      });
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("websocket", (socket) => sockets.push(socket.url()));
      client.on("Network.responseReceived", ({ response, type }) =>
        responses.push({
          url: response.url,
          status: response.status,
          type,
          fromDiskCache: !!response.fromDiskCache,
          fromServiceWorker: !!response.fromServiceWorker,
          headers: Object.fromEntries(
            Object.entries(response.headers).filter(([key]) =>
              [
                "cache-control",
                "content-encoding",
                "content-length",
                "content-type",
                "etag",
                "age",
              ].includes(key.toLowerCase()),
            ),
          ),
        }),
      );
      await context.addInitScript(() => {
        window.__audit = {
          lcp: null,
          cls: 0,
          longTasks: [],
          appReady: null,
          walletTouches: [],
        };
        Object.defineProperty(window, "ethereum", {
          configurable: true,
          get() {
            window.__audit.walletTouches.push(performance.now());
            throw new Error("Audit must not access wallets");
          },
        });
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              window.__audit.lcp = {
                ms: e.startTime,
                size: e.size,
                element: e.element?.tagName,
                id: e.element?.id,
                text: e.element?.textContent?.trim().slice(0, 100),
              };
          }).observe({ type: "largest-contentful-paint", buffered: true });
        } catch {}
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              if (!e.hadRecentInput) window.__audit.cls += e.value;
          }).observe({ type: "layout-shift", buffered: true });
        } catch {}
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              window.__audit.longTasks.push({
                start: e.startTime,
                duration: e.duration,
              });
          }).observe({ type: "longtask", buffered: true });
        } catch {}
        new MutationObserver(() => {
          const c = document.querySelector("#content");
          if (
            window.__audit.appReady === null &&
            c &&
            !c.hidden &&
            c.textContent.trim()
          )
            window.__audit.appReady = performance.now();
        }).observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["hidden"],
        });
      });
      for (const cache of ["cold", "warm"]) {
        requests = [];
        responses = [];
        errors = [];
        blocked = [];
        sockets = [];
        const started = new Date().toISOString();
        let failure = null;
        try {
          if (cache === "cold")
            await page.goto(target.url, {
              waitUntil: "domcontentloaded",
              timeout: 45000,
            });
          else
            await page.reload({
              waitUntil: "domcontentloaded",
              timeout: 45000,
            });
          await page
            .locator(target.ready)
            .first()
            .waitFor({ state: "visible", timeout: 35000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(1200); // Observe late font/layout candidates; this is not a speed assertion.
        } catch (error) {
          failure = error.message.slice(0, 600);
        }
        const observed = await page
          .evaluate(() => {
            const n = performance.getEntriesByType("navigation")[0];
            const resources = performance
              .getEntriesByType("resource")
              .map((r) => ({
                url: r.name,
                initiator: r.initiatorType,
                start: r.startTime,
                duration: r.duration,
                ttfb: r.responseStart - r.requestStart,
                transferBytes: r.transferSize,
                encodedBytes: r.encodedBodySize,
                decodedBytes: r.decodedBodySize,
              }));
            const a = window.__audit;
            return {
              title: document.title,
              navigation: n
                ? {
                    ttfbMs: n.responseStart - n.requestStart,
                    domContentLoadedMs: n.domContentLoadedEventEnd,
                    loadMs: n.loadEventEnd,
                    transferBytes: n.transferSize,
                  }
                : null,
              fcpMs:
                performance.getEntriesByName("first-contentful-paint")[0]
                  ?.startTime ?? null,
              appReadyMs: a?.appReady,
              lcp: a?.lcp,
              cls: a?.cls,
              longTasks: a?.longTasks ?? [],
              observedBlockingMs: (a?.longTasks ?? []).reduce(
                (s, e) => s + Math.max(0, e.duration - 50),
                0,
              ),
              walletTouches: a?.walletTouches ?? [],
              viewport: { width: innerWidth, height: innerHeight },
              horizontalOverflow:
                document.documentElement.scrollWidth > innerWidth + 1,
              resources,
              headingText: [...document.querySelectorAll("h1")].map((e) =>
                e.textContent.trim(),
              ),
              contentVisible:
                !!document.querySelector("#content:not([hidden])") ||
                !!document.querySelector(".deposit-shell"),
            };
          })
          .catch((error) => ({ evaluationError: error.message }));
        const shot = `${target.id}-${device}-${cache}.png`;
        await page.screenshot({
          path: path.join(out, "screenshots", shot),
          fullPage: false,
        });
        const record = {
          target: target.id,
          kind: target.kind,
          url: target.url,
          device,
          cache,
          startedAt: started,
          conditions: mobile
            ? {
                viewport: "390×844",
                latencyMs: 150,
                downloadMbps: 1.6,
                cpuSlowdown: 4,
              }
            : { viewport: "1440×900", network: "unthrottled", cpuSlowdown: 1 },
          failure,
          ...observed,
          requests,
          responses,
          blocked,
          sockets,
          pageErrors: errors,
          screenshot: `screenshots/${shot}`,
        };
        results.push(record);
        await fs.writeFile(
          path.join(out, "results.json"),
          JSON.stringify(
            {
              method:
                "Single cold+warm lab samples per route/device. Fresh browser context per pair, routing blocks non-GET and off-origin requests. Routing disables HTTP cache, so warm means connection/process/session reuse, not browser-cache validation. Mobile emulates constrained network/4xCPU; no claim of real-user INP or p75 Core Web Vitals. Main backend only anonymously read; no auth or financial actions.",
              sourceCommit: "3332f67abd1e8364891feba7b250c1ec87e257bc",
              results,
            },
            null,
            2,
          ) + "\n",
        );
        console.log(
          JSON.stringify({
            target: target.id,
            device,
            cache,
            failure: !!failure,
            fcpMs: observed.fcpMs,
            lcpMs: observed.lcp?.ms,
            appReadyMs: observed.appReadyMs,
            cls: observed.cls,
            requests: requests.length,
            overflow: observed.horizontalOverflow,
            walletTouches: observed.walletTouches?.length,
          }),
        );
      }
      await context.close();
    }
} finally {
  await browser.close();
}
