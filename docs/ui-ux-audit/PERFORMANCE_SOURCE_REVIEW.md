# Frontend performance source review

Audit only · 29 October 2026 · source `3332f67abd1e8364891feba7b250c1ec87e257bc`

Worktree: `/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects`
Branch: `codex/kleros-ui-ux-speed-audit`

Read `PROJECT_BRAIN.md` and `ui-registry.md` before inspection. This review covers the active root
frontend and its static-serving/build paths, not the retained reference applications. No application
files, dependencies, financial journals or runtime state were changed. No server, browser, network
request, test, build, signing operation, hosting operation or schedule change was run. The pre-existing
untracked `node_modules` link was only read for the optional ethers size comparison.

These are source-supported priorities for measurement, not measured user latency or claims that an
optimization has already worked. Cold/warm desktop/mobile timings and actual response headers belong
to the primary audit. RPC/canonical-state freshness and backend response design remain with the
primary implementation owner.

## Five priorities

### 1. Event content waits for a serial read and recovery chain

**Evidence.** `public/app.js:951` starts every `load()` by disposing the inbox/batch controllers and
invalidating unsigned reviews. Non-silent loads hide the content at `public/app.js:958`. Bootstrap is
awaited at `public/app.js:963`; only then does the event request start at `public/app.js:990`. Pending
submissions are reconciled one at a time at `public/app.js:998`–`1034`, before the first content render
at `public/app.js:1063`. Any newly recovered status recursively runs the complete load again at
`public/app.js:1061`.

Bootstrap is not a small configuration-only read: `src/workbench.mjs:404`–`449` reads financial
summaries for all visible events (`summary()` calls `chainState()` at `src/workbench.mjs:374`) and the
latest block. The selected event detail then reads its state again at `src/workbench.mjs:452`.
This establishes an API/RPC dependency on the visible critical path; it does not establish how many
milliseconds the deployed RPC currently takes.

**Measure.** Separate bootstrap TTFB, detail TTFB, reconciliation time/count and render time. Compare
event deep links with the directory and with a synthetic unresolved receipt. Distinguish shell FCP
from the first usable event panel: the HTML spinner can paint while the event remains unavailable.

**Safe UI work.** Render an event-shaped, non-actionable loading shell with distinct connection,
event-read and pending-receipt progress instead of an unqualified events spinner. An already fetched
read-only snapshot can remain visibly labelled with its observed block during refresh, but it must
not silently authorize actions or show a prior event/account's private data. Moving receipt
reconciliation out of the initial paint requires preserving its pending-action locks from the first
frame; financial controls must remain unavailable until the applicable checks finish.

**Backend dependency.** A cheaper bootstrap, sharing a pinned snapshot between bootstrap/detail, or
concurrent bootstrap/detail requests needs the primary owner's authority/freshness design. Do not
cache canonical balances, reduce validations or bypass receipt reconciliation as a UI speed fix.

### 2. Same-event navigation and repeated refresh can issue redundant loads

**Evidence.** Selecting a view calls `navigate()` at `public/app.js:2350`; tab keyboard navigation does
the same at `public/app.js:2666`. Every hash change calls `load()` at `public/app.js:2687`, including
view-only changes, so changing Your spot → Manage event → Disputes repeats bootstrap/detail. The
global Refresh button calls `load()` at `public/app.js:2668` without a load singleflight/disabled
state. `api()` at `public/app.js:671` passes optional fetch options but the load GETs provide neither
an AbortSignal nor a deadline. Generation checks at `public/app.js:964`, `993` and `1060` correctly
discard obsolete results; they do not cancel their requests or server work.

**Measure.** Count logical fetches and overlapping requests for one view switch and rapid repeated
Refresh clicks; correlate late discarded requests with backend TTFB. A long spinner is not itself
proof of a render bottleneck. The gateway's upstream timeout is 55 seconds at
`netlify/functions/workbench.mjs:125`; that is not an app-specific progress/deadline treatment.

**Safe UI work.** Coalesce identical in-flight GET refreshes in the exact event/account/server scope,
show a busy Refresh control, and abort superseded UI-owned GETs while retaining generation guards.
Abort can stop waiting in the browser; it does not prove that remote RPC work stopped. Keep writes,
submitted hashes and reconciliation outcomes separate: never abort-and-replay a financial or batch
submission. Same-event tabs could render the current read-only projection immediately and refresh
it explicitly, provided old snapshots cannot enable signing or cross a role/scope change. That
freshness treatment needs primary-owner agreement before implementation.

### 3. Every route eagerly loads organizer features and their CSS

**Evidence.** `public/index.html:27`–`30` loads all three stylesheets and the root module. Static
imports at `public/app.js:2`–`15` pull reconciliation, the contract inbox, batch actions, their pure
selection store, both journals and profile helpers even for an anonymous directory/participant
visit. `public/batch-actions.js:1` adds the second-level selection-module dependency. The hosted
build copies the public tree without bundling/minification (`scripts/build-hosted-frontend.mjs:16`–`24`).

The nine root-reachable modules total **273,412 raw bytes / 72,562 independently gzipped bytes**.
The organizer-oriented reconciliation/inbox/batch modules plus batch selection/journal account for
**103,237 raw / 27,374 gzip bytes** of that graph. The three stylesheets total **66,763 raw / 13,085
gzip bytes**. Bytes alone do not predict parse time, but this is avoidable work on routes that never
mount these features.

**Measure.** Capture module discovery/waterfall depth, transfer sizes, JS parse/evaluation time and
long tasks on cold mobile, then compare participant versus organizer visits. Check whether API reads
start late because the eager module graph has not finished evaluating.

**Safe UI work.** Consider route/capability-based dynamic loading of reconciliation and organizer
modules/styles, with imports cached in memory and exact scope/generation rechecks after each await.
Initialize durable batch recovery and restore pending locks before enabling any batch controls.
Keep transaction-journal protections available before a wallet action. Do not display functional
buttons before their guarded controller is ready. Minification/bundling is a separate packaging
option; coordinate source-bound served-asset proof expectations with the primary owner.

### 4. Refresh and inbox search rebuild tables, then repeat selection/layout work

**Evidence.** All event markup is replaced on every completed load at `public/app.js:1063`.
`enhanceTables()` then walks all table cells and writes responsive labels at `public/app.js:1127`–`1140`.
The organizer view creates the complete participants/import markup; closing the import-history
disclosure does not defer generating its records (`public/app.js:1644`–`1646`).

The inbox builds a lowercased search string, including each receipt hash, for every payer on every
search/filter render at `public/contract-inbox.js:280`–`306`. It replaces the table at
`public/contract-inbox.js:324`; `render()` invokes this both when refresh starts and when it finishes
(`public/contract-inbox.js:411`, `414`–`418`, `449`–`453`). Search invokes it per input event at
`public/contract-inbox.js:547`–`550`. Replacement triggers the batch observer
(`public/batch-actions.js:1308`), whose update reads candidates, clones selection state and redecorates
rows (`public/batch-actions.js:322`–`365`). Its visible-row pass reads layout via `getClientRects()` and
`getComputedStyle()` at `public/batch-actions.js:218`–`223`. Root candidate/revision callbacks also
walk DOM rows and stringify participant eligibility (`public/app.js:289`–`326`).

**Measure.** On a representative synthetic roster, record search input-to-paint, refresh-start versus
refresh-finish scripting/layout, DOM node counts and observer update counts. This is a scaling risk;
the source does not prove it dominates the current small rehearsal roster.

**Safe UI work.** Avoid rebuilding unchanged rows merely to show “Refreshing”; update status metadata
and disable approval eligibility immediately, then patch changed rows by wallet after the response.
Precompute informational search text when accepting a snapshot and coalesce input rendering to one
frame if measurement warrants it. Preserve exact filtered-visible selection semantics, fresh
eligibility/revision invalidation, observed-block warnings, keyboard focus and selected missing/blocked
records. Never use a skipped repaint to retain actionable stale approval hints. Pagination or
virtualization needs explicit “Select visible” semantics and accessibility review; it is not the
first change to make without roster-scale evidence.

### 5. Static asset reuse is not explicitly versioned in the hosted build

**Evidence.** The local Node server serves its allowlisted static assets through the same `send()`
helper (`src/server.mjs:952`–`984`) that sets `cache-control: no-store` at `src/server.mjs:185`–`198`;
it does not negotiate compression/conditional responses in that path. The hosted build copies
stable asset names and emits security headers only (`scripts/build-hosted-frontend.mjs:24`–`27`).
No content-hash naming or explicit static Cache-Control policy is declared there. Hosted Netlify
static defaults/compression may differ: actual deployed headers, ETags and warm-cache reuse were
not inspected in this source-only review.

**Measure.** Separate local-server and Netlify waterfalls. For HTML, JS, CSS and fonts capture
Cache-Control, Content-Encoding, ETag/304 behavior, transferSize and whether a warm reload uses memory,
disk or network. Do not attribute local no-store behavior to Netlify's static CDN without evidence.

**Safe UI/build work.** If warm static transfers are material, introduce content-hashed JS/CSS/font
assets and a versioned manifest before granting them long immutable caching; keep the document
revalidatable so releases cannot strand clients on stale code. Preserve atomic deployment and the
source-bound asset verification used by the rehearsal harness. **API, authorization, financial drafts,
batch status and RPC responses must retain their existing private/no-store protections**
(`netlify/functions/workbench.mjs:127`–`140`). This is a static packaging proposal, not permission to
change hosting or cache chain state.

## Local payload measurements

Read files directly with Node `fs.readFileSync()` and computed `zlib.gzipSync(bytes, {level: 9})`.
No output files/build were generated by that measurement. Gzip values are reproducible local size
estimates, not observed transfer sizes or a claim about Netlify's negotiated encoding. Totals sum
individually compressed responses, not one concatenated bundle.

| Root-reachable JS | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `public/app.js` | 151,981 | 39,168 |
| `public/reconciliation.js` | 11,027 | 3,656 |
| `public/hosted-wallet.js` | 856 | 517 |
| `public/contract-inbox.js` | 28,916 | 8,092 |
| `public/batch-actions.js` | 48,810 | 11,439 |
| `public/batch-pending.js` | 4,819 | 1,725 |
| `public/contract-profiles.js` | 1,891 | 684 |
| `public/transaction-context.js` | 16,447 | 4,819 |
| `public/batch-selection.js` | 8,665 | 2,462 |
| **Total** | **273,412** | **72,562** |

| Other assets | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `public/styles.css` | 46,364 | 8,603 |
| `public/contract-inbox.css` | 11,506 | 2,388 |
| `public/batch-actions.css` | 8,893 | 2,094 |
| `public/index.html` | 3,778 | 1,368 |
| `public/assets/kleros-logo.svg` | 4,891 | 2,043 |
| `public/assets/kleros-symbol.svg` | 1,664 | 901 |
| Geist Latin WOFF2 | 29,288 | 29,316 |
| Instrument Serif regular WOFF2 | 15,040 | 15,039 |
| Instrument Serif italic WOFF2 | 15,684 | 15,690 |
| Geist Mono Latin WOFF2 | 23,108 | 23,136 |
| `ethers.umd.min.js` (comparison only) | 522,095 | 160,312 |

### Fonts and ethers: controls against misdiagnosis

The page preloads **two** fonts totalling **44,328 raw bytes**, not all four (`public/index.html:12`–`25`).
All four font faces use `font-display: swap` (`public/styles.css:2`–`28`); unused faces are not
automatically downloaded merely because a rule exists. The font files are already WOFF2 and gain
essentially nothing from gzip. Check actual font requests and layout shift before changing preload
priority or type; an additional preload could compete with startup JS/API work. There are no remote
font stylesheet dependencies in the root HTML.

The **522,095-byte ethers UMD is not part of the active root startup import graph**. It is available
through the Node/gateway compatibility path (`src/server.mjs:966`, `982`;
`netlify/functions/workbench.mjs:30`), but root HTML and modules do not request it. Do not report it as
a root startup payload saving or remove the legacy endpoint on this evidence.

## Existing protections to retain

- Generation checks already prevent obsolete loads from repainting another event. Add cancellation
  or singleflight around them; do not replace them.
- The owner inbox already singleflights refreshes (`public/contract-inbox.js:416`), skips polling while
  hidden (`613`–`618`) and aborts its own requests on disposal. A poll interval alone is not evidence
  of overlapping inbox fetches.
- Informational stale snapshots, wallet credit, owed funds, receipts and final settlement remain
  independent. Faster UI must not manufacture fresh balances, completed payment or admission.
- Keep private data disposal, exact event/account/server/version scope, native dialog focus, unsigned
  draft invalidation, persisted pending locks and once-only transaction journals intact. Never solve
  latency by caching a signing decision or retrying a write.

## Handoff to measured audit

Use the primary audit's cold/warm desktop/mobile evidence to rank these priorities by observed cost.
In particular, a large bootstrap/detail TTFB calls for primary-owner RPC work; a large gap after both
responses calls for the render/asset investigations above. This document reports five source-backed
candidates and bounded proposals only; no performance improvement has been implemented or verified.
