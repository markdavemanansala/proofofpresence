# Backend optimization and preview integration

29 October 2026 · active work, not a release-completion record.

The human explicitly authorized coordination with the primary session to finish backend optimization,
integrate the UI fixes and update the Netlify preview while preserving financial tests and schedules.
Primary remains backend, integration, deployment and financial owner. UI implementation is
`ab979223912b699da2cc9f3f1744adc2284e43d2`; do not copy the following frozen-memory commit over
primary's newer canonical brain.

## Coordinated implementation

Primary confirmed its backend agent works in isolated `/private/tmp/kleros-selected-bootstrap-67ee1d9`.
The additive selected-event contract guarantees the immutable summary/detail fields expected by our
client. Scope includes request-local selected snapshot reuse, pinned read-only receipt projections,
current disclosure access checks and local HTTP/chain privacy/isolation tests. Original default API,
financial writes and all v7/v8/test15m economics remain compatible.

Our preliminary review identified final access checks running before unrelated directory/clock waits.
The moving candidate now moves those waits before its final canonical/access check and removes the
selected summary/detail if that check fails. This is an observed source correction, not final approval;
a frozen candidate and actual test results are still required. See BACKEND_REVIEW_CHECKLIST.md.

D has confirmed UI deposits/admission and remains pinned through its actual financial proof flow.
No backend, source, Netlify or operator change was made to D by this chat. C and the existing A/B/C
financial continuations are separately scoped. Primary must select the exact release origin/source
and preserve strict financial source guards before a main preview rollout. See RELEASE_REVIEW_NOTES.md.

## Independent release checker

`test/ui-release-readonly.mjs` requires explicit execute/origin/event/full-source inputs; there is
no live default. Fresh anonymous browser contexts permit only source-public assets and the exact
selected bootstrap/detail GETs. Writes, auth/RPC requests, off-origin traffic, wallet access, sockets
and service workers are blocked. Default optimized mode requires one bound bootstrap GET, exact
release asset/validator bytes, empty anonymous private projections and coherent Skip/tab focus.
Optional narrow/large-text captures are available. Offline guard tests pass 62 without importing
Playwright, launching a browser or making any request.

A functional/source pass is not a speed or CLS acceptance gate. Actual panel-ready/LCP/CLS values
must be assessed separately with the recorded conditions. These cold lab checks do not establish
field p75, cache efficiency or real wallet-extension behavior.

## Pre-release live observation, honestly failed

Explicit baseline: maintained main A/B origin `https://kleros-event-workbench-preview.netlify.app`,
public stable A event `chiado-9fe71683-1e9b-48a0-94bd-274da4cf3029-a`, expected source
`f4643f8b3a2938d4cbcebe233e202656847a3084`. No D/C public request was made.

The first launch stopped before browser import because the local dependency symlink was absent;
its empty-device failed record is retained. A package-scope symlink to the installed Playwright
resolved this without installing/upgrading or modifying primary dependencies.

The actual public baseline stopped honestly on an injected main-site Netlify HUD request:
`/.netlify/scripts/hud?variant=public`. It was blocked before delivery. `index.html` differed from
the expected reviewed source; other observed app assets matched. Primary was informed that its
release must disable that hosting injection rather than loosen asset guards. D's separate hosting
configuration must remain untouched.

Partial desktop evidence: two actual API GETs, panel-ready 20,305.6ms and LCP 20,320ms. This is one
unthrottled cold anonymous sample with the HUD blocked, not a clean accepted release baseline,
field result or mobile comparison. It ran before subsequent checker hardening; do not represent
its old proof as containing the newer validator-binding/privacy pass scope.

Evidence: `artifacts/ui-ux-audit/release/2026-10-29T03-31-39-482Z/results.json` and screenshots.
No wallet, financial write, RPC or public mutation was executed. No optimized release is verified yet.

## Clean maintained-main baseline after hosting cleanup

Primary disabled only the maintained site's optional HUD/badge injection, without redeploying the
application or changing D/C hosting or schedules. Its exact fixed326-byte non-executable comment
at byte71 was independently hash-verified. The checker accepts only that exact site/asset/offset/
length/digest and otherwise identical Git bytes; served bytes stay untouched. Altered comments,
extra scripts, different sites/offsets or changed application bytes fail the offline negative tests.

The subsequent clean baseline passed anonymous rendering, exact source/context and read-safety
checks for main f4643f8. Each device used two legacy API GETs. One unthrottled cold sample per device:

| Device          | Panel ready | LCP      | CLS       |
| --------------- | ----------- | -------- | --------- |
| Desktop1440×900 | 19,290.3ms  | 19,304ms | 0.0331931 |
| Mobile390×844   | 18,424.3ms  | 8,320ms  | 0.2755386 |

Proof: `artifacts/ui-ux-audit/release/2026-10-29T03-58-59-777Z/results.json`.
The baseline checker waited for an optional label absent from old HTML before saving the files
named loading; those images actually show ready content and must not be used as initial-state
visual evidence. The browser observer's recorded navigation-to-panel/LCP/CLS measurements are
independent of that later screenshot delay. A following checker fix removes the unnecessary wait.
This source/binding pass alone is not an optimization acceptance or before/after improvement claim.

The isolated P2/P3 follow-up is ready at f7db9b486a666648aa3a01dea5d119019d0ac983, with28validator,
14session browser and27UX checks plus typecheck passed. See SESSION_FIX_REPORT.md. Primary reports
its backend combined25-test run/typecheck passed; final integrated release review remains pending.

## Final isolated candidate and release boundary

Final combined code is8fd010c7dba27434e8e861178848529614121d09. The actual final checks and
source hashes are in INTEGRATED_TEST_REPORT.md. The final authority reorg finding is closed;
root focused40/types/build and real joint12/18load checks passed after earlier broad292/compatibility
runs. No public release has occurred from this chat.

Primary chose the existing isolated D site/backend for deployment only after its full financial
completion and explicit baseline GO. Main A/B and C assets/jobs remain unchanged. Offline D checking
is ready (81 guards); no public D baseline or updated-asset request has been made here. Primary's
settlement receipt confirmation is not yet treated as completed final proof at this checkpoint.
