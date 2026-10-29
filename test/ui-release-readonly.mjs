import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { selectedEventResult } from "../public/selected-event.js";

// Public execution is opt-in and has no default URL, event or source revision.
// --self-test never imports Playwright, launches a browser, or makes a request.
const root = fileURLToPath(new URL("../", import.meta.url));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const reviewedMainComment = Object.freeze({
  origin: "https://kleros-event-workbench-preview.netlify.app",
  asset: "index.html",
  offset: 71,
  bytes: 326,
  sha256: "ac299873ec628300bc3817310defbb2209405f1609debc641b9cdf759c4ff3e8",
  commentSha256:
    "92069763abfc97148ccff5f46fb5b80a9c7249b83b5e0b5c4fe1cc1ddac6f6c5",
});
// Literal and anchor reviewed from the D financial helper source only, never imported.
// The literal includes its final LF; the original Git HTML's charset anchor ends at byte 71.
const reviewedDComment = Object.freeze({
  origin: "https://kleros-fast15m-d-20261029-9fe71683.netlify.app",
  asset: "index.html",
  anchor: '<meta charset="utf-8" />\n',
  anchorOffset: 46,
  offset: 71,
  bytes: 326,
  sha256: "b3371ba22e9850e2b33ce0718c03e1526b7167ed930360d4803449910e3abee0",
  commentSha256:
    "8a2a8b9875a56c0adb41e560eddebfa48daa161f12c49b0bcc153877df6f1e5e",
  anchorReferenceCommit: "7bdd40a3478e487f84b0c00aa0d58e25d13e0d5e",
  anchorReferenceHtmlSha256:
    "dbd0f2cd8a070df519b8928bea1ba82adaf56ec906f7cc6ff6fef60fb957f8aa",
});
const usage =
  "node test/ui-release-readonly.mjs --execute --origin https://EXPLICIT_ORIGIN --event EVENT_ID --source FULL_GIT_SHA [--source-root PATH] [--baseline] [--extended-layout] [--timeout-ms 90000]";
function parse(argv, env = {}) {
  const flags = new Set([
      "--execute",
      "--baseline",
      "--extended-layout",
      "--self-test",
      "--help",
    ]),
    values = new Set([
      "--origin",
      "--event",
      "--source",
      "--source-root",
      "--timeout-ms",
    ]);
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!flags.has(key) && !values.has(key))
      throw Error("Unknown argument: " + key);
    if (Object.hasOwn(args, key)) throw Error("Duplicate argument: " + key);
    if (flags.has(key)) args[key] = true;
    else {
      if (!argv[i + 1] || argv[i + 1].startsWith("--"))
        throw Error("Missing value for " + key);
      args[key] = argv[++i];
    }
  }
  if (args["--help"]) return { help: true };
  if (args["--self-test"]) {
    if (argv.length !== 1)
      throw Error("--self-test cannot be combined with execution inputs");
    return { selfTest: true };
  }
  if (!args["--execute"])
    throw Error(
      "No execution authorized: require --execute and explicit origin/event/source. " +
        usage,
    );
  const originInput = args["--origin"] ?? env.UI_RELEASE_ORIGIN,
    eventId = args["--event"] ?? env.UI_RELEASE_EVENT_ID,
    source = args["--source"] ?? env.UI_RELEASE_SOURCE_COMMIT;
  if (!originInput || !eventId || !source)
    throw Error(
      "Explicit origin, event and source inputs are all required. " + usage,
    );
  let url;
  try {
    url = new URL(originInput);
  } catch {
    throw Error("Origin must be an absolute URL");
  }
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(loopback && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error(
      "Origin must be HTTPS (or loopback HTTP), without credentials, path, query or fragment",
    );
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(eventId))
    throw Error("Invalid stable event ID");
  if (!/^[a-fA-F0-9]{40}$/.test(source))
    throw Error("Expected source must be a full 40-character Git SHA");
  const timeoutMs = Number(args["--timeout-ms"] ?? 90000);
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 10000 ||
    timeoutMs > 120000
  )
    throw Error("Timeout must be 10000..120000 milliseconds");
  return {
    origin: url.origin,
    eventId,
    source: source.toLowerCase(),
    sourceRoot: path.resolve(
      args["--source-root"] ?? env.UI_RELEASE_SOURCE_ROOT ?? root,
    ),
    baseline: !!args["--baseline"],
    extendedLayout: !!args["--extended-layout"],
    timeoutMs,
  };
}
function requiredFrontendAssets(publicFiles, { baseline = false } = {}) {
  if (baseline) return ["index.html", "app.js", "styles.css"];
  return [
    "index.html",
    "app.js",
    "styles.css",
    "loading.css",
    "ui-keyboard.js",
    "selected-event.js",
    ...["environment.js", "contract-profiles.js"].filter((name) =>
      publicFiles.has(name),
    ),
  ];
}
function assetName(url) {
  if (url.pathname === "/" || url.pathname === "/index.html")
    return "index.html";
  try {
    const decoded = decodeURIComponent(url.pathname.slice(1));
    if (
      !decoded ||
      decoded.split("/").some((x) => x === ".." || x === "." || x === "") ||
      decoded.includes("\\")
    )
      return null;
    return decoded;
  } catch {
    return null;
  }
}
function allowedRequest(plan, input, method, body, publicFiles) {
  let url;
  try {
    url = new URL(input);
  } catch {
    return { allowed: false, reason: "malformed URL" };
  }
  if (url.origin !== plan.origin)
    return { allowed: false, reason: "off-origin or non-HTTP transport" };
  if (!["GET", "HEAD"].includes(method) || body)
    return { allowed: false, reason: "mutation or request body" };
  if (url.username || url.password)
    return { allowed: false, reason: "URL credentials" };
  if (url.pathname === "/api/bootstrap") {
    const keys = [...url.searchParams.keys()];
    if (plan.baseline && keys.length === 0)
      return { allowed: true, kind: "bootstrap" };
    if (
      keys.length === 1 &&
      keys[0] === "selectedEventId" &&
      url.searchParams.get("selectedEventId") === plan.eventId
    )
      return { allowed: true, kind: "bootstrap" };
    return {
      allowed: false,
      reason: "bootstrap must request only the explicit selected event",
    };
  }
  if (
    url.pathname === `/api/events/${encodeURIComponent(plan.eventId)}` &&
    !url.search
  )
    return { allowed: true, kind: "event-detail" };
  const name = assetName(url);
  if (name && publicFiles.has(name) && !url.search)
    return { allowed: true, kind: "asset", name };
  return {
    allowed: false,
    reason: "not a source-public asset or authorized read endpoint",
  };
}
function compareAssetBytes(origin, name, served, expected) {
  const servedSha256 = sha(served),
    expectedSha256 = sha(expected);
  const exact = {
    matches: served.equals(expected),
    servedSha256,
    normalizedSha256: servedSha256,
    expectedSha256,
    transform: "exact-bytes",
    removedBytes: 0,
  };
  if (exact.matches) return exact;
  if (origin === reviewedDComment.origin && name === reviewedDComment.asset) {
    const anchor = Buffer.from(reviewedDComment.anchor, "utf8");
    if (
      served.length !== expected.length + reviewedDComment.bytes ||
      expected.indexOf(anchor) !== reviewedDComment.anchorOffset ||
      expected.lastIndexOf(anchor) !== reviewedDComment.anchorOffset ||
      reviewedDComment.anchorOffset + anchor.length !==
        reviewedDComment.offset ||
      !served
        .subarray(reviewedDComment.anchorOffset, reviewedDComment.offset)
        .equals(anchor)
    )
      return exact;
    const removed = served.subarray(
      reviewedDComment.offset,
      reviewedDComment.offset + reviewedDComment.bytes,
    );
    if (sha(removed) !== reviewedDComment.sha256) return exact;
    const normalized = Buffer.concat([
      served.subarray(0, reviewedDComment.offset),
      served.subarray(reviewedDComment.offset + reviewedDComment.bytes),
    ]);
    if (!normalized.equals(expected)) return exact;
    return {
      matches: true,
      servedSha256,
      normalizedSha256: sha(normalized),
      expectedSha256,
      transform: "remove-exact-reviewed-d-netlify-comment-for-comparison",
      removedBytes: reviewedDComment.bytes,
      removedOffset: reviewedDComment.offset,
      removedSha256: sha(removed),
      anchorOffset: reviewedDComment.anchorOffset,
      anchorSha256: sha(anchor),
      responseDelivered:
        "Unchanged; normalization applies only to byte comparison",
    };
  }
  if (
    origin !== reviewedMainComment.origin ||
    name !== reviewedMainComment.asset ||
    served.length !== expected.length + reviewedMainComment.bytes
  )
    return exact;
  const removed = served.subarray(
    reviewedMainComment.offset,
    reviewedMainComment.offset + reviewedMainComment.bytes,
  );
  if (sha(removed) !== reviewedMainComment.sha256) return exact;
  const normalized = Buffer.concat([
    served.subarray(0, reviewedMainComment.offset),
    served.subarray(reviewedMainComment.offset + reviewedMainComment.bytes),
  ]);
  if (!normalized.equals(expected)) return exact;
  return {
    matches: true,
    servedSha256,
    normalizedSha256: sha(normalized),
    expectedSha256,
    transform: "remove-exact-reviewed-main-netlify-comment-for-comparison",
    removedBytes: reviewedMainComment.bytes,
    removedOffset: reviewedMainComment.offset,
    removedSha256: sha(removed),
    responseDelivered:
      "Unchanged; normalization applies only to byte comparison",
  };
}
function validatorSourceBinding(
  localBytes,
  expectedBytes,
  { baseline = false } = {},
) {
  const localSha256 = sha(localBytes);
  if (baseline)
    return {
      mode: "baseline-serial-context-compatibility",
      localSha256,
      expectedSha256: null,
      releaseSourceCompared: false,
      note: "Actual serial HTTP responses use a synthetic bundle wrapper for local compatibility validation; the old release need not contain this helper.",
    };
  assert(expectedBytes != null, "Missing expected release validator source");
  const expectedSha256 = sha(expectedBytes);
  assert.equal(
    localSha256,
    expectedSha256,
    "Local selected-event validator differs from expected release source; stopping before browser launch",
  );
  return {
    mode: "release-source-matched",
    localSha256,
    expectedSha256,
    releaseSourceCompared: true,
  };
}
const normalizedPhase = (value) =>
  typeof value === "number"
    ? (["open", "listed", "finalized", "cancelled"][value] ?? String(value))
    : String(value)
        .toLowerCase()
        .replace(/[\s_-]/g, "");
function boundSnapshot(
  boot,
  eventId,
  { baseline = false, fallbackDetail = null } = {},
) {
  assert(boot && typeof boot === "object", "Bootstrap must be JSON object");
  assert(
    boot.session == null,
    "Fresh anonymous browser unexpectedly has an authenticated session",
  );
  assert.equal(
    typeof boot.instanceId,
    "string",
    "Missing backend instance binding",
  );
  assert(boot.instanceId.length > 0, "Missing backend instance binding");
  const capable = boot.capabilities?.selectedEventBootstrap === true;
  let result;
  if (capable) {
    assert.equal(
      boot.selectedEvent?.wallet,
      null,
      "Anonymous selected-event actor must explicitly be null",
    );
    result = selectedEventResult(boot, {
      eventId,
      capturedWallet: null,
      hasCapturedSession: true,
    });
    assert(
      result,
      "Advertised selected-event bundle failed the actual client validator",
    );
    if (result.error)
      throw Error(
        `Selected-event read failed (${result.error.status}): ${result.error.message}`,
      );
  } else {
    assert(
      baseline,
      "Optimized release did not advertise selected-event bootstrap",
    );
    assert(
      fallbackDetail,
      "Baseline requires the actual fallback detail response",
    );
    result = selectedEventResult(
      {
        ...boot,
        capabilities: { ...boot.capabilities, selectedEventBootstrap: true },
        selectedEvent: {
          eventId,
          instanceId: boot.instanceId,
          wallet: null,
          detail: fallbackDetail,
          error: null,
        },
      },
      { eventId, capturedWallet: null, hasCapturedSession: true },
    );
    assert(
      result?.detail,
      "Baseline fallback deployment context did not match bootstrap",
    );
  }
  const detail = result.detail,
    summary = boot.events.find((e) => e?.id === eventId);
  for (const flag of ["authenticated", "owner", "staff"])
    if (detail.permissions?.[flag] != null)
      assert.equal(
        detail.permissions[flag],
        false,
        "Anonymous response exposed " + flag + " authority",
      );
  // Anonymous rendering must not receive application-only participant/contact data.
  for (const field of [
    "participants",
    "deposits",
    "unmatched",
    "imports",
    "attendance",
    "transactions",
  ]) {
    if (detail[field] != null)
      assert(
        Array.isArray(detail[field]) && detail[field].length === 0,
        "Anonymous response exposed protected records: " + field,
      );
  }
  for (const field of ["ownWallet", "personal"])
    assert(
      detail[field] == null,
      "Anonymous response exposed private facts: " + field,
    );
  const comparisons = [];
  for (const field of ["blockNumber", "blockHash"]) {
    if (summary[field] != null && detail.state[field] != null) {
      const left =
          field === "blockHash"
            ? String(summary[field]).toLowerCase()
            : String(summary[field]),
        right =
          field === "blockHash"
            ? String(detail.state[field]).toLowerCase()
            : String(detail.state[field]);
      assert.equal(left, right, "Summary/detail " + field + " disagree");
      comparisons.push(field);
    }
  }
  if (summary.financialPhase != null && detail.state.phase != null) {
    assert.equal(
      normalizedPhase(summary.financialPhase),
      normalizedPhase(detail.state.phase),
      "Summary/detail financial phase disagree",
    );
    comparisons.push("financialPhase");
  }
  assert(
    Number.isSafeInteger(Number(detail.state.blockNumber)) &&
      Number(detail.state.blockNumber) >= 0,
    "Missing canonical detail block number",
  );
  return {
    bundleObserved: capable,
    eventId,
    instanceId: boot.instanceId,
    actorWallet: null,
    chainId: detail.event.chainId,
    contract: detail.event.contract,
    contractVersion: detail.event.contractVersion,
    deploymentBlock: detail.event.deploymentBlock,
    policyURI: detail.event.policyURI,
    templateHash: detail.event.templateHash,
    detailBlockNumber: detail.state.blockNumber,
    detailBlockHash: detail.state.blockHash ?? null,
    summaryBlockNumber: summary.blockNumber ?? null,
    summaryBlockHash: summary.blockHash ?? null,
    summaryFinancialPhase: summary.financialPhase ?? null,
    detailFinancialPhase: detail.state.phase ?? null,
    comparedFields: comparisons,
    sharedSnapshotLimit: comparisons.some(
      (x) => x === "blockNumber" || x === "blockHash",
    )
      ? null
      : "No common block metadata exposed; shared-snapshot reuse requires primary backend tests/source review.",
  };
}
async function selfTest() {
  let checks = 0;
  const ok = (value, message) => {
      assert(value, message);
      checks++;
    },
    throws = (fn, message) => {
      assert.throws(fn, undefined, message);
      checks++;
    };
  const argv = [
      "--execute",
      "--origin",
      "https://release.example.invalid",
      "--event",
      "event-a",
      "--source",
      "a".repeat(40),
    ],
    plan = parse(argv);
  ok(
    plan.origin === "https://release.example.invalid",
    "Exact explicit origin",
  );
  throws(() => parse([]), "Missing execute blocks all work");
  throws(() => parse(["--execute"]), "Missing inputs rejected");
  throws(
    () => parse(["--self-test", "--execute"]),
    "Self-test cannot run public",
  );
  for (const origin of [
    "http://example.invalid",
    "https://u:p@example.invalid",
    "https://example.invalid/path",
    "https://example.invalid/?x=1",
    "https://example.invalid/#event=x",
    "file:///private/tmp",
  ])
    throws(
      () => parse([...argv.slice(0, 2), origin, ...argv.slice(3)]),
      "Unsafe origin rejected",
    );
  throws(
    () => parse([...argv, "--origin", "https://other.invalid"]),
    "Duplicate inputs rejected",
  );
  throws(
    () => parse([...argv.slice(0, -1), "main"]),
    "Symbolic source rejected",
  );
  ok(
    parse(["--execute"], {
      UI_RELEASE_ORIGIN: plan.origin,
      UI_RELEASE_EVENT_ID: plan.eventId,
      UI_RELEASE_SOURCE_COMMIT: plan.source,
    }).eventId === plan.eventId,
    "Explicit environment inputs supported",
  );
  const legacyRequired = [
    "index.html",
    "app.js",
    "styles.css",
    "loading.css",
    "ui-keyboard.js",
    "selected-event.js",
  ];
  ok(
    JSON.stringify(requiredFrontendAssets(new Set())) ===
      JSON.stringify(legacyRequired),
    "Older optimized source retains all six existing required assets without inventing new files",
  );
  for (const added of [
    ["environment.js"],
    ["contract-profiles.js"],
    ["environment.js", "contract-profiles.js"],
  ])
    ok(
      JSON.stringify(requiredFrontendAssets(new Set(added))) ===
        JSON.stringify([...legacyRequired, ...added]),
      "Each new release module is independently mandatory exactly when present in expected Git: " +
        added.join(","),
    );
  ok(
    JSON.stringify(
      requiredFrontendAssets(
        new Set(["environment.js", "contract-profiles.js"]),
        { baseline: true },
      ),
    ) === JSON.stringify(["index.html", "app.js", "styles.css"]),
    "Explicit historical baseline keeps its original exact required asset set",
  );
  const files = new Set(["index.html", "app.js", "assets/font.woff2"]);
  ok(
    !allowedRequest(plan, plan.origin + "/api/bootstrap", "GET", null, files)
      .allowed,
    "Optimized guard rejects unselected bootstrap",
  );
  ok(
    allowedRequest(
      { ...plan, baseline: true },
      plan.origin + "/api/bootstrap",
      "GET",
      null,
      files,
    ).allowed,
    "Explicit baseline permits the old bootstrap read",
  );
  ok(
    allowedRequest(plan, plan.origin + "/app.js", "GET", null, files).allowed,
    "Source asset GET allowed",
  );
  ok(
    allowedRequest(
      plan,
      plan.origin + "/api/bootstrap?selectedEventId=event-a",
      "GET",
      null,
      files,
    ).allowed,
    "Exact selected-event GET allowed",
  );
  for (const [url, method, body] of [
    [plan.origin + "/api/auth/nonce", "POST", null],
    [plan.origin + "/api/events/event-a/drafts", "POST", "{}"],
    [plan.origin + "/api/events/event-b", "GET", null],
    [plan.origin + "/rpc", "GET", null],
    ["https://other.invalid/app.js", "GET", null],
    ["wss://release.example.invalid/socket", "GET", null],
    [plan.origin + "/api/bootstrap?selectedEventId=event-b", "GET", null],
    [
      plan.origin +
        "/api/bootstrap?selectedEventId=event-a&selectedEventId=event-a",
      "GET",
      null,
    ],
    [plan.origin + "/app.js", "GET", "{}"],
    [plan.origin + "/.runtime/key.json", "GET", null],
  ])
    ok(
      !allowedRequest(plan, url, method, body, files).allowed,
      "Forbidden network request blocked",
    );
  const commentFixture = await fs.readFile(
    new URL("./fixtures/netlify-main-reviewed-comment.txt", import.meta.url),
  );
  ok(
    commentFixture.length === reviewedMainComment.bytes,
    "Trusted comment fixture has exactly the reviewed insertion length",
  );
  ok(
    sha(commentFixture) === reviewedMainComment.sha256,
    "Trusted comment fixture matches the fixed full-insertion digest",
  );
  ok(
    sha(commentFixture.subarray(0, -1)) === reviewedMainComment.commentSha256 &&
      commentFixture.at(-1) === 10,
    "Trusted fixture is the exact reviewed comment plus one newline",
  );
  const htmlFixture = Buffer.from(
    "<!doctype html>\n<html><head>" +
      " ".repeat(96) +
      "</head><body>Exact synthetic source</body></html>\n",
  );
  const inserted = (comment, offset = reviewedMainComment.offset) =>
    Buffer.concat([
      htmlFixture.subarray(0, offset),
      comment,
      htmlFixture.subarray(offset),
    ]);
  const servedFixture = inserted(commentFixture);
  const reviewedMatch = compareAssetBytes(
    reviewedMainComment.origin,
    "index.html",
    servedFixture,
    htmlFixture,
  );
  ok(
    reviewedMatch.matches &&
      reviewedMatch.removedBytes === 326 &&
      reviewedMatch.removedOffset === 71 &&
      reviewedMatch.servedSha256 === sha(servedFixture) &&
      reviewedMatch.normalizedSha256 === sha(htmlFixture) &&
      reviewedMatch.transform ===
        "remove-exact-reviewed-main-netlify-comment-for-comparison",
    "Only the reviewed main insertion matches with explicit comparison metadata",
  );
  const exactMatch = compareAssetBytes(
    "https://other.invalid",
    "app.js",
    htmlFixture,
    htmlFixture,
  );
  ok(
    exactMatch.matches && exactMatch.transform === "exact-bytes",
    "Identical bytes always pass without a comment exception",
  );
  const alteredComment = Buffer.from(commentFixture);
  alteredComment[20] ^= 1;
  const alteredSource = Buffer.from(servedFixture);
  alteredSource[reviewedMainComment.offset + reviewedMainComment.bytes + 1] ^=
    1;
  for (const [origin, name, bytes, reason] of [
    [
      reviewedMainComment.origin,
      "index.html",
      inserted(alteredComment),
      "altered comment byte",
    ],
    [
      reviewedMainComment.origin,
      "index.html",
      alteredSource,
      "altered source byte outside the comment",
    ],
    [
      reviewedMainComment.origin,
      "index.html",
      inserted(Buffer.from("<!-- Unknown comment -->\n")),
      "unknown comment",
    ],
    ["https://other.invalid", "index.html", servedFixture, "wrong origin"],
    [
      "https://kleros-ui-c-20261029-9fe71683.netlify.app",
      "index.html",
      servedFixture,
      "isolated C origin",
    ],
    [
      "https://kleros-fast15m-d-20261029-9fe71683.netlify.app",
      "index.html",
      servedFixture,
      "isolated D origin",
    ],
    [reviewedMainComment.origin, "app.js", servedFixture, "wrong asset"],
    [
      reviewedMainComment.origin,
      "index.html",
      inserted(commentFixture, reviewedMainComment.offset + 1),
      "moved comment offset",
    ],
    [
      reviewedMainComment.origin,
      "index.html",
      Buffer.concat([
        servedFixture,
        Buffer.from("<script src='/unknown.js'></script>"),
      ]),
      "extra script",
    ],
    [
      reviewedMainComment.origin,
      "index.html",
      inserted(Buffer.concat([commentFixture, commentFixture])),
      "repeated comment",
    ],
  ]) {
    const rejected = compareAssetBytes(origin, name, bytes, htmlFixture);
    ok(
      !rejected.matches && rejected.removedBytes === 0,
      "Reviewed comment exception rejects " + reason,
    );
  }
  const dCommentFixture = await fs.readFile(
    new URL("./fixtures/netlify-d-reviewed-comment.txt", import.meta.url),
  );
  ok(
    dCommentFixture.length === reviewedDComment.bytes,
    "D trusted literal includes exactly 326 reviewed bytes",
  );
  ok(
    sha(dCommentFixture) === reviewedDComment.sha256,
    "D trusted literal matches its fixed full digest",
  );
  ok(
    dCommentFixture.at(-1) === 10 &&
      sha(dCommentFixture.subarray(0, -1)) === reviewedDComment.commentSha256,
    "D literal already includes the LF removed by its financial helper",
  );
  const dHtmlFixture = execFileSync(
    "git",
    ["show", `${reviewedDComment.anchorReferenceCommit}:public/index.html`],
    { cwd: root, maxBuffer: 1_000_000 },
  );
  ok(
    sha(dHtmlFixture) === reviewedDComment.anchorReferenceHtmlSha256,
    "D anchor reference is the exact reviewed original Git HTML",
  );
  const dAnchor = Buffer.from(reviewedDComment.anchor, "utf8");
  ok(
    dHtmlFixture.indexOf(dAnchor) === reviewedDComment.anchorOffset &&
      dHtmlFixture.lastIndexOf(dAnchor) === reviewedDComment.anchorOffset &&
      reviewedDComment.anchorOffset + dAnchor.length ===
        reviewedDComment.offset,
    "D unique charset anchor derives insertion offset 71 from original Git bytes",
  );
  const dInserted = (
    comment,
    offset = reviewedDComment.offset,
    body = dHtmlFixture,
  ) =>
    Buffer.concat([body.subarray(0, offset), comment, body.subarray(offset)]);
  const dServed = dInserted(dCommentFixture);
  const dMatch = compareAssetBytes(
    reviewedDComment.origin,
    "index.html",
    dServed,
    dHtmlFixture,
  );
  ok(
    dMatch.matches &&
      dMatch.removedBytes === 326 &&
      dMatch.removedOffset === 71 &&
      dMatch.anchorOffset === 46 &&
      dMatch.removedSha256 === reviewedDComment.sha256 &&
      dMatch.servedSha256 === sha(dServed) &&
      dMatch.normalizedSha256 === sha(dHtmlFixture) &&
      dMatch.transform ===
        "remove-exact-reviewed-d-netlify-comment-for-comparison",
    "D exact-origin index insertion alone normalizes to identical reviewed Git bytes",
  );
  ok(
    compareAssetBytes(
      reviewedDComment.origin,
      "index.html",
      dHtmlFixture,
      dHtmlFixture,
    ).transform === "exact-bytes",
    "D unmodified source passes without applying any exception",
  );
  const dAlteredComment = Buffer.from(dCommentFixture);
  dAlteredComment[20] ^= 1;
  const dAlteredSource = Buffer.from(dServed);
  dAlteredSource[reviewedDComment.offset + reviewedDComment.bytes + 1] ^= 1;
  const dWrongAnchor = Buffer.from(dHtmlFixture);
  dWrongAnchor[reviewedDComment.anchorOffset + 2] ^= 1;
  for (const [origin, name, bytes, expected, reason] of [
    [
      reviewedMainComment.origin,
      "index.html",
      dServed,
      dHtmlFixture,
      "MAIN origin",
    ],
    [
      "https://kleros-ui-c-20261029-9fe71683.netlify.app",
      "index.html",
      dServed,
      dHtmlFixture,
      "C origin",
    ],
    [
      "https://other.invalid",
      "index.html",
      dServed,
      dHtmlFixture,
      "unknown site",
    ],
    [
      reviewedDComment.origin,
      "app.js",
      dServed,
      dHtmlFixture,
      "non-index asset",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(dCommentFixture, reviewedDComment.offset + 1),
      dHtmlFixture,
      "moved byte offset",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(dAlteredComment),
      dHtmlFixture,
      "altered comment byte",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dAlteredSource,
      dHtmlFixture,
      "altered source byte",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(Buffer.concat([dCommentFixture, dCommentFixture])),
      dHtmlFixture,
      "repeated literal",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      Buffer.concat([
        dServed,
        Buffer.from("<script src='/unknown.js'></script>"),
      ]),
      dHtmlFixture,
      "extra script",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(dCommentFixture.subarray(0, -1)),
      dHtmlFixture,
      "missing literal LF",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(Buffer.concat([dCommentFixture, Buffer.from("\n")])),
      dHtmlFixture,
      "extra literal LF",
    ],
    [
      reviewedDComment.origin,
      "index.html",
      dInserted(dCommentFixture, reviewedDComment.offset, dWrongAnchor),
      dWrongAnchor,
      "changed charset anchor even when remaining body matches",
    ],
  ]) {
    const rejected = compareAssetBytes(origin, name, bytes, expected);
    ok(
      !rejected.matches && rejected.removedBytes === 0,
      "D comment exception rejects " + reason,
    );
  }
  const validatorFixture = "export const syntheticValidator = 'exact-binding';";
  ok(
    validatorSourceBinding(validatorFixture, validatorFixture)
      .releaseSourceCompared,
    "Matching validator bytes bind to the exact release source",
  );
  throws(
    () =>
      validatorSourceBinding(
        validatorFixture,
        "export const syntheticValidator = 'different-binding';",
      ),
    "Changed release validator is rejected without Git, browser or network",
  );
  ok(
    validatorSourceBinding(validatorFixture, null, { baseline: true }).mode ===
      "baseline-serial-context-compatibility",
    "Old baseline without a helper stays explicitly compatibility-only",
  );
  const event = {
    id: "event-a",
    contract: "0x" + "c".repeat(40),
    chainId: 10200,
    deploymentBlock: 1,
    contractVersion: "kleros-event-v8",
    abiVersion: "kleros-event-v8",
    policyURI: "/synthetic-policy",
    templateHash: "d".repeat(64),
    financialPhase: "Open",
    blockNumber: 100,
  };
  const boot = {
    session: null,
    instanceId: "synthetic-self-test",
    chain: { chainId: 10200 },
    capabilities: { selectedEventBootstrap: true },
    events: [event],
    selectedEvent: {
      eventId: "event-a",
      instanceId: "synthetic-self-test",
      wallet: null,
      detail: {
        event: { ...event },
        state: { phase: "Open", blockNumber: 100 },
        transactions: [],
        participants: [],
        permissions: { owner: false, staff: false, authenticated: false },
      },
      error: null,
    },
  };
  ok(
    boundSnapshot(boot, "event-a").bundleObserved,
    "Actual validator accepts anonymous bound fixture",
  );
  for (const edit of [
    (b) => (b.selectedEvent.wallet = "0x" + "a".repeat(40)),
    (b) => (b.selectedEvent.instanceId = "foreign"),
    (b) => (b.events[0].blockNumber = 101),
    (b) => (b.events[0].financialPhase = "Listed"),
    (b) => (b.selectedEvent.detail.permissions.owner = true),
    (b) => {
      b.selectedEvent.detail = null;
      b.selectedEvent.error = {
        status: 503,
        message: "Synthetic source unavailable",
      };
    },
  ]) {
    const bad = structuredClone(boot);
    edit(bad);
    throws(
      () => boundSnapshot(bad, "event-a"),
      "Mismatched context/error fails honestly",
    );
  }
  for (const field of [
    "participants",
    "deposits",
    "unmatched",
    "imports",
    "attendance",
    "transactions",
    "ownWallet",
    "personal",
  ]) {
    const leaked = structuredClone(boot);
    leaked.selectedEvent.detail[field] = ["ownWallet", "personal"].includes(
      field,
    )
      ? { syntheticPrivateValue: true }
      : [{ syntheticPrivateValue: true }];
    throws(
      () => boundSnapshot(leaked, "event-a"),
      "Anonymous protected record must be absent: " + field,
    );
  }
  const missing = structuredClone(boot);
  delete missing.capabilities.selectedEventBootstrap;
  throws(
    () => boundSnapshot(missing, "event-a"),
    "Capability required by default",
  );
  ok(
    !boundSnapshot(missing, "event-a", {
      baseline: true,
      fallbackDetail: missing.selectedEvent.detail,
    }).bundleObserved,
    "Explicit baseline can assess actual separate response",
  );
  const proof = {
    status: "passed",
    checks,
    networkRequests: 0,
    browserLaunches: 0,
    playwrightImported: false,
    executedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.join(root, "artifacts/ui-ux-audit/release"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(root, "artifacts/ui-ux-audit/release/guard-self-test.json"),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(JSON.stringify(proof, null, 2));
}
async function run(plan) {
  const resolved = execFileSync(
    "git",
    ["rev-parse", "--verify", `${plan.source}^{commit}`],
    { cwd: plan.sourceRoot, encoding: "utf8" },
  ).trim();
  assert.equal(resolved, plan.source, "Expected exact source commit");
  const paths = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", plan.source, "--", "public"],
    { cwd: plan.sourceRoot, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter((x) => x.startsWith("public/"))
    .map((x) => x.slice(7));
  const publicFiles = new Set(paths),
    requiredAssets = requiredFrontendAssets(publicFiles, plan);
  for (const name of requiredAssets)
    assert(
      publicFiles.has(name),
      "Expected source lacks required frontend asset " + name,
    );
  // Bind the validator before importing Playwright or launching any browser.
  const localValidatorBytes = await fs.readFile(
    path.join(root, "public/selected-event.js"),
  );
  const expectedValidatorBytes = plan.baseline
    ? null
    : execFileSync("git", ["show", `${plan.source}:public/selected-event.js`], {
        cwd: plan.sourceRoot,
        maxBuffer: 20_000_000,
        stdio: ["ignore", "pipe", "ignore"],
      });
  const validatorBinding = validatorSourceBinding(
    localValidatorBytes,
    expectedValidatorBytes,
    { baseline: plan.baseline },
  );
  const stamp = new Date().toISOString().replace(/[:.]/g, "-"),
    output = path.join(root, "artifacts/ui-ux-audit/release", stamp);
  await fs.mkdir(output, { recursive: true });
  const proof = {
    status: "running",
    origin: plan.origin,
    eventId: plan.eventId,
    expectedSource: plan.source,
    checkerSha256: sha(await fs.readFile(fileURLToPath(import.meta.url))),
    conditions: {
      contexts: "fresh anonymous",
      assertionTimeoutMs: plan.timeoutMs,
      network: "unthrottled",
      cpuThrottleRate: 1,
      httpCache: "disabled by Playwright routing",
      serviceWorkers: "blocked",
    },
    mode: plan.baseline ? "explicit-baseline" : "optimized-release",
    startedAt: new Date().toISOString(),
    validatorSha256: validatorBinding.localSha256,
    validatorBinding,
    requiredFrontendAssets: requiredAssets,
    assetComparisonPolicy: {
      default: "Exact bytes",
      reviewedMainComment,
      reviewedDComment,
      deliveredResponse: "Never modified by this checker",
    },
    passScope: {
      functional: plan.baseline
        ? "Anonymous selected-event rendering only; no post-fix interaction claim."
        : "Anonymous rendering, skip/tab focus and any explicitly requested layout checks.",
      binding: plan.baseline
        ? "Actual serial HTTP responses checked with a synthetic bundle wrapper and local compatibility validator; no release-validator source claim."
        : "Returned selected-event context checked by the exact release-source validator.",
      source:
        "Observed required frontend assets match the explicit Git source commit; only the fixed reviewed MAIN or D index comment may be removed for its exact corresponding origin and position.",
      requestCount: plan.baseline
        ? "Legacy arrival API requests are observed, without an optimized request-count gate."
        : "Selected-event arrival uses exactly one API GET.",
      safety:
        "Only authorized same-origin GET/HEAD reads; no wallet, RPC, writes, WebSocket or service worker access.",
    },
    devices: [],
    checks: [],
    limitations: [
      "Anonymous presentation only; no authenticated owner/participant, wallet extension or financial operation.",
      "Lab cold-load observations, not field Core Web Vitals or WCAG conformance.",
      "No speed, latency, LCP or CLS acceptance gate is applied. A pass does not prove before/after performance improvement; report the measured observations separately.",
      "Summary/detail shared-snapshot reuse is proven here only to the extent actual returned pin metadata permits.",
      "A failed or missing capability/bundle is not reported as optimization success.",
    ],
  };
  let browser;
  try {
    const playwright = await import("@playwright/test");
    const { chromium } = playwright;
    const expect = playwright.expect.configure({ timeout: plan.timeoutMs });
    browser = await chromium.launch({ headless: true });
    for (const device of ["desktop", "mobile"]) {
      const mobile = device === "mobile",
        data = {
          device,
          viewport: mobile ? "390x844" : "1440x900",
          requests: [],
          blocked: [],
          responses: [],
          assets: [],
          pageErrors: [],
          captureErrors: [],
          screenshots: [],
          checks: [],
        },
        bodies = [],
        pending = [],
        metrics = {};
      proof.devices.push(data);
      let phase = "arrival";
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        serviceWorkers: "block",
        acceptDownloads: false,
      });
      await context.route("**/*", async (route) => {
        const req = route.request(),
          policy = allowedRequest(
            plan,
            req.url(),
            req.method(),
            req.postData(),
            publicFiles,
          );
        if (!policy.allowed) {
          data.blocked.push({
            phase,
            method: req.method(),
            url: req.url(),
            reason: policy.reason,
          });
          return route.abort("blockedbyclient");
        }
        return route.continue();
      });
      await context.routeWebSocket("**/*", (socket) => {
        data.blocked.push({
          phase,
          method: "WebSocket",
          url: socket.url(),
          reason: "WebSocket blocked",
        });
        socket.close({ code: 1008, reason: "Read-only release check" });
      });
      await context.addInitScript(() => {
        window.__release = {
          layoutShifts: [],
          lcp: null,
          panelReady: null,
          walletAccess: [],
          webSockets: [],
          serviceWorkers: [],
        };
        Object.defineProperty(window, "ethereum", {
          configurable: false,
          get() {
            window.__release.walletAccess.push("provider getter");
            return undefined;
          },
          set() {
            window.__release.walletAccess.push("provider setter");
          },
        });
        window.WebSocket = class {
          constructor(url) {
            window.__release.webSockets.push(String(url));
            throw Error("WebSocket blocked by read-only release check");
          }
        };
        try {
          navigator.serviceWorker.register = (...args) => {
            window.__release.serviceWorkers.push(String(args[0]));
            return Promise.reject(Error("Service worker registration blocked"));
          };
        } catch {}
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              if (!e.hadRecentInput)
                window.__release.layoutShifts.push({
                  value: e.value,
                  time: e.startTime,
                });
          }).observe({ type: "layout-shift", buffered: true });
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              window.__release.lcp = {
                ms: e.startTime,
                size: e.size,
                tag: e.element?.tagName ?? null,
                id: e.element?.id ?? null,
              };
          }).observe({ type: "largest-contentful-paint", buffered: true });
        } catch {}
        new MutationObserver(() => {
          const content = document.querySelector("#content");
          if (
            window.__release.panelReady === null &&
            content &&
            !content.hidden &&
            content.querySelector('[role="tabpanel"]')
          )
            window.__release.panelReady = performance.now();
        }).observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["hidden"],
        });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(plan.timeoutMs);
      page.on("pageerror", (error) => data.pageErrors.push(error.message));
      page.on("request", (req) =>
        data.requests.push({
          phase,
          method: req.method(),
          url: req.url(),
          resourceType: req.resourceType(),
          startedAt: Date.now(),
        }),
      );
      page.on("requestfailed", (req) =>
        data.responses.push({
          url: req.url(),
          failure: req.failure()?.errorText ?? "unknown",
          phase,
        }),
      );
      page.on("response", (response) => {
        const responsePhase = phase;
        pending.push(
          (async () => {
            const req = response.request(),
              url = new URL(response.url()),
              policy = allowedRequest(
                plan,
                response.url(),
                req.method(),
                req.postData(),
                publicFiles,
              );
            const record = {
              phase: responsePhase,
              url: response.url(),
              status: response.status(),
              responseObservedAt: Date.now(),
              timing: req.timing(),
            };
            data.responses.push(record);
            if (!policy.allowed) return;
            if (policy.kind === "bootstrap" || policy.kind === "event-detail") {
              let value;
              try {
                value = await response.json();
              } catch {
                throw Error(
                  "Read endpoint returned non-JSON HTTP " + response.status(),
                );
              }
              record.timing = req.timing();
              record.completedAt = Date.now();
              bodies.push({
                kind: policy.kind,
                url: response.url(),
                phase: responsePhase,
                status: response.status(),
                value,
              });
              return;
            }
            if (policy.kind === "asset" && response.ok()) {
              const bytes = await response.body(),
                expected = execFileSync(
                  "git",
                  ["show", `${plan.source}:public/${policy.name}`],
                  {
                    cwd: plan.sourceRoot,
                    maxBuffer: 20_000_000,
                    stdio: ["ignore", "pipe", "ignore"],
                  },
                );
              record.timing = req.timing();
              record.completedAt = Date.now();
              data.assets.push({
                path: policy.name,
                sha256: sha(bytes),
                ...compareAssetBytes(plan.origin, policy.name, bytes, expected),
                bytes: bytes.length,
              });
            }
          })().catch((error) => data.captureErrors.push(error.message)),
        );
      });
      const destination =
        plan.origin +
        "/#" +
        new URLSearchParams({ event: plan.eventId, view: "participant" });
      await page.goto(destination, {
        waitUntil: "domcontentloaded",
        timeout: plan.timeoutMs,
      });
      const loading = page.locator("#loading");
      data.loadingCapture = {
        visible: await loading.isVisible(),
        text: await page.evaluate(
          () => document.querySelector("#loading-status")?.textContent ?? null,
        ),
      };
      await page.screenshot({
        path: path.join(output, device + "-loading.png"),
        fullPage: false,
      });
      data.screenshots.push(device + "-loading.png");
      await expect(page.locator("#content")).toBeVisible();
      await expect(page.locator("#event-switch")).toHaveValue(plan.eventId);
      await expect(loading).toBeHidden();
      await page.waitForTimeout(350);
      await Promise.all(pending);
      assert.deepEqual(data.captureErrors, [], "Response capture failed");
      const initialBoot = bodies.find(
        (x) => x.kind === "bootstrap" && x.phase === "arrival",
      );
      assert(initialBoot, "No actual selected bootstrap response observed");
      assert(
        initialBoot.status >= 200 && initialBoot.status < 300,
        "Bootstrap HTTP " + initialBoot.status,
      );
      const fallback = bodies.find(
        (x) => x.kind === "event-detail" && x.phase === "arrival",
      );
      if (fallback)
        assert(
          fallback.status >= 200 && fallback.status < 300,
          "Fallback detail HTTP " + fallback.status,
        );
      data.snapshot = boundSnapshot(initialBoot.value, plan.eventId, {
        baseline: plan.baseline,
        fallbackDetail: fallback?.value,
      });
      data.arrivalApiRequests = data.requests
        .filter(
          (x) =>
            x.phase === "arrival" &&
            new URL(x.url).pathname.startsWith("/api/"),
        )
        .map((x) => ({ method: x.method, url: x.url }));
      if (!plan.baseline) {
        assert.equal(
          data.arrivalApiRequests.length,
          1,
          "Optimized arrival must use exactly one API read",
        );
        assert.equal(
          new URL(data.arrivalApiRequests[0].url).pathname,
          "/api/bootstrap",
        );
      }
      data.checks.push(
        plan.baseline
          ? "Actual baseline serial responses assessed with a synthetic bundle wrapper for local compatibility only; no bundled optimization or release-validator source claim"
          : "Actual anonymous bound selected-event response renders with exactly one API GET",
      );
      Object.assign(
        metrics,
        await page.evaluate(() => {
          let sum = 0,
            max = 0,
            start = 0,
            last = 0;
          for (const e of window.__release.layoutShifts) {
            if (e.time - last > 1000 || e.time - start > 5000) {
              sum = 0;
              start = e.time;
            }
            sum += e.value;
            max = Math.max(max, sum);
            last = e.time;
          }
          return {
            cls: max,
            layoutShifts: window.__release.layoutShifts,
            lcp: window.__release.lcp,
            panelReadyMs: window.__release.panelReady,
            navigation: performance.getEntriesByType("navigation").map((n) => ({
              domContentLoadedMs: n.domContentLoadedEventEnd,
              loadMs: n.loadEventEnd,
              responseStartMs: n.responseStart,
              transferSize: n.transferSize,
            })),
          };
        }),
      );
      data.metrics = metrics;
      await page.screenshot({
        path: path.join(output, device + "-ready.png"),
        fullPage: false,
      });
      data.screenshots.push(device + "-ready.png");
      if (!plan.baseline) {
        phase = "interaction";
        const originalHash = await page.evaluate(() => location.hash);
        await page.locator(".skip").focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(120);
        assert.equal(
          await page.evaluate(() => location.hash),
          originalHash,
          "Skip changed the selected route",
        );
        await expect(page.locator("#main")).toBeFocused();
        for (const view of ["organizer", "cases", "participant"]) {
          const tab = page.locator(`[role="tab"][data-view="${view}"]`);
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await expect(tab).toBeFocused();
          await expect(page.locator("#event-switch")).toHaveValue(plan.eventId);
        }
        await Promise.all(pending);
        assert.deepEqual(data.captureErrors, [], "Response capture failed");
        for (const item of bodies)
          if (item.kind === "bootstrap") {
            assert(
              item.status >= 200 && item.status < 300,
              "Interaction bootstrap failed",
            );
            boundSnapshot(item.value, plan.eventId, {
              baseline: plan.baseline,
              fallbackDetail: bodies.find(
                (x) => x.kind === "event-detail" && x.phase === item.phase,
              )?.value,
            });
          }
        data.checks.push(
          "Skip and each event tab preserve route, rendered selection and keyboard focus",
        );
      } else
        data.checks.push(
          "Baseline makes no navigation interactions or post-fix keyboard assertions",
        );
      if (plan.extendedLayout && mobile) {
        await page.setViewportSize({ width: 320, height: 800 });
        assert(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <= innerWidth &&
              document.body.scrollWidth <= innerWidth,
          ),
          "320px horizontal overflow",
        );
        await page.screenshot({
          path: path.join(output, "mobile-320.png"),
          fullPage: false,
        });
        data.screenshots.push("mobile-320.png");
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => {
          const sizes = [...document.querySelectorAll("body,body *")].map(
            (e) => [e, parseFloat(getComputedStyle(e).fontSize)],
          );
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
          "200% text horizontal overflow",
        );
        await page.screenshot({
          path: path.join(output, "mobile-200-text.png"),
          fullPage: false,
        });
        data.screenshots.push("mobile-200-text.png");
        data.checks.push(
          "Optional 320px and 390px doubled-computed-text checks have no document overflow",
        );
      }
      const sideEffects = await page.evaluate(() => ({
        walletAccess: window.__release.walletAccess,
        webSockets: window.__release.webSockets,
        serviceWorkers: window.__release.serviceWorkers,
      }));
      data.sideEffects = sideEffects;
      assert.deepEqual(
        sideEffects,
        { walletAccess: [], webSockets: [], serviceWorkers: [] },
        "Forbidden browser capability accessed",
      );
      assert.deepEqual(data.blocked, [], "Forbidden request attempted");
      assert.deepEqual(data.pageErrors, [], "Uncaught browser error");
      assert(
        data.responses.every(
          (x) => !x.failure && (x.status == null || x.status < 400),
        ),
        "Unexpected HTTP or transport failure",
      );
      assert(data.assets.length > 0, "No source assets hashed");
      assert(
        data.assets.every((x) => x.matches),
        "Frontend bytes differ from expected source",
      );
      for (const name of requiredAssets)
        assert(
          data.assets.some((x) => x.path === name && x.matches),
          "Required source asset not observed: " + name,
        );
      data.checks.push(
        "Observed frontend assets match Git source under the exact-byte policy and narrowly reviewed origin-specific MAIN/D index comment exceptions; no writes, off-origin traffic, RPC, wallet, WS, service worker or page error",
      );
      await context.close();
    }
    proof.status = "passed";
    proof.completedAt = new Date().toISOString();
    console.log(
      JSON.stringify(
        {
          status: proof.status,
          origin: plan.origin,
          eventId: plan.eventId,
          expectedSource: plan.source,
          output,
          passScope: proof.passScope,
          performanceAcceptance:
            "Measurements only; no speed or CLS acceptance gate and no before/after improvement claim.",
          devices: proof.devices.map((x) => ({
            device: x.device,
            arrivalApiRequests: x.arrivalApiRequests.length,
            cls: x.metrics.cls,
            lcpMs: x.metrics.lcp?.ms ?? null,
            panelReadyMs: x.metrics.panelReadyMs,
          })),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    proof.status = "failed";
    proof.failure = { message: error.message, stack: error.stack };
    throw error;
  } finally {
    await fs.writeFile(
      path.join(output, "results.json"),
      JSON.stringify(proof, null, 2) + "\n",
    );
    if (browser) await browser.close();
  }
}
try {
  const plan = parse(process.argv.slice(2), process.env);
  if (plan.help)
    console.log(
      usage +
        "\n--self-test runs guard validation without Playwright or network.",
    );
  else if (plan.selfTest) await selfTest();
  else await run(plan);
} catch (error) {
  console.error("Read-only release check stopped: " + error.message);
  process.exitCode = 1;
}
