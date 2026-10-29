# Loading and keyboard fix verification

29 October 2026 · isolated `codex/kleros-ui-ux-speed-audit` worktree. These results belong to the
UI changes after 99ffe139; historical/public financial results in other documents are separate.

| Command/check                                                  | Actual result                                                                                                                                                | Evidence                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `npm run build`                                                | PASS: historical pinned v7, v8 and explicit test15m compilation plus app syntax/build checks.                                                                | Command transcript; final `node scripts/build.mjs` also PASS after final app changes. |
| `npm run typecheck`                                            | PASS, repeated after final JS changes.                                                                                                                       | `artifacts/ui-ux-audit/fixes/typecheck.log`                                           |
| `npm test`                                                     | PASS 253/253,0 failures/skips/cancels,641.15 s; existing local contract/economics/auth/journal/application tests.                                            | `node-tests.log`                                                                      |
| `node --test test/selected-event.test.mjs`                     | PASS 20/20,0 failures; new bundle validator, separately run on final source.                                                                                 | `selected-event.log`                                                                  |
| `node test/ui-ux-fixes.e2e.mjs`                                | PASS 27; final frozen assets match recorded hashes.198loopback GETs,0 writes/external requests/wallet calls/WebSockets/page errors.                          | `results.json`, `run.log`, seven PNGs                                                 |
| `node test/simple-ui.e2e.mjs`                                  | PASS 13 + Playwright expectations, real local v7 deposit; testnet portion presentation-only.                                                                 | `simple-v7.log`                                                                       |
| `CONTRACT_VERSION=kleros-event-v8 node test/simple-ui.e2e.mjs` | PASS 18 + expectations, real local v8 unused-credit recovery; no public transaction.                                                                         | `simple-v8.log`                                                                       |
| `npm run test:ui`                                              | PASS 49 + expectations, real isolated v7 UI flow.                                                                                                            | `redesign.log`                                                                        |
| `node test/ui-context.e2e.mjs`                                 | PASS 4 + expectations after updating the request-cancellation expectation; event/deployment/owner review and terminal journal checks retained, no broadcast. | `context-final.log`                                                                   |
| Financial schedules, read-only                                 | Existing A/B and C jobs both ACTIVE; no job mutation.                                                                                                        | `schedules-readonly.json`                                                             |
| `git diff --check`                                             | PASS.                                                                                                                                                        | Command transcript.                                                                   |

All evidence paths in this table are under `artifacts/ui-ux-audit/fixes/` unless qualified otherwise.
The full Node suite enumerated its files before the new validator tests were finalized; 253 and 20 are
separate run counts and must not be added to imply one combined final run. Financial test source
and contract/economic policy were not changed. The context browser test changed only obsolete-read
expectations, retaining every financial assertion.

The first context run waited for a response from a GET that now intentionally aborts and timed out;
its log is retained at `context-initial.log`. The updated test requires one actual ABORTED request,
then proves B's review and journal state remain correct. The new GET-only harness independently
covers late responses through a test transport that deliberately ignores AbortSignal. A transient
harness-only nested-summary selector ambiguity was corrected before the final 27-check run.

Environment notes: system Node 25.8.1 uses Ganache's JavaScript fallback because the bundled native
µWS/bigint binding is unavailable. The full existing suite also emits its Server-listener warning;
all tests still passed. No dependency was upgraded. A temporary local node_modules symlink used
installed dependencies read-only and is removed before delivery.

Mobile CLS was measured with PerformanceObserver in two cold 390×844 contexts per version and
artificial 800 ms/900 ms reads. Frozen baseline 0.371880438 both; final 0.096341825 both (~74.1% less).
This is not live network performance, field Web Vitals p75, browser-cache validation or an INP test.
Remaining notice insertion and real backend latency are documented in UI_HANDOFF.md. No hosted
release, public signing, external write, chain-time change or schedule edit occurred.
