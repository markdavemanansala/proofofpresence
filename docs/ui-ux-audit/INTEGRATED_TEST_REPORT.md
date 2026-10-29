# Combined candidate verification

29 October 2026 · isolated worktree only. This records the directory-privacy backend patch
`ab8ab6d7653b7faf94773f6ab28a8f62a63539f5e1d25418a50863d517350197` combined with UI
ab979223 and actor/session follow-up f7db9b4. It is the **pre-authority-reorg-delta** checkpoint,
not final release approval or a deployed performance result.

## Actual checks

| Check                         | Result                                                                 | Evidence under artifacts/ui-ux-audit/integrated/    |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| `npm run build`               | PASS, unchanged pinned v7/v8/test15m compiler inputs                   | build.log                                           |
| `npm run typecheck`           | PASS                                                                   | typecheck.log                                       |
| `npm test`                    | PASS292/292,0failures/skips/cancels,702.04s                            | node-tests.log                                      |
| Existing v7 redesign          | PASS49 plus Playwright expectations                                    | browser/redesign-v7-final.log                       |
| Existing simple v7/v8         | PASS13 /18 plus expectations                                           | browser/simple-v7.log, simple-v8.log                |
| Event/wallet/journal context  | PASS4 plus expectations                                                | browser/context-rerun.log                           |
| Session ACK transitions       | PASS14, mocked loopback session/auth only                              | browser/session.log                                 |
| UX/keyboard/CLS               | PASS27, local CLS0.372→0.096 in two runs each                          | browser/ux.log                                      |
| Actual UI+backend joint v7/v8 | PASS12 grouped checks,18 real selected loads,oneGET/zero fallback each | joint-browser/2026-10-29T04-15-27-602Z/results.json |

Broad Node tests execute real local contracts, including v7 compatibility, held-share payouts,
ruling0 economics, v8 payer credits, failed recipients, journals, auth/event isolation and the new
selected read/privacy cases. New selected tests count one versus four selected-event full snapshots
in the private fixture, pin receipt/credit/payment projections, and cover delayed ownership,
directory permission changes, logout, instance boundaries and canonical selected-anchor failure.
These are local synthetic execution, not a public Court or financial-stage completion proof.

The joint browser test uses actual current modules, actual HTTP server responses and independent
local Ganache v7/v8 servers. Its18 bundled bodies passed the actual client validator. Acknowledged
Alice/owner/logout changes, participant/owner/anonymous projections, keyboard focus and mobile
bounds passed. Browser traffic contains no financial action, RPC, wallet, WebSocket or external
request; local fixture contract creation is part of server setup.

The existing browser failures were old fixtures waiting/intercepting only a separate event-detail
GET eliminated by the new combined response. Only exact same-origin GET wait/error/delay/cancel
predicates were adapted to recognize the selected bootstrap or legacy detail path. All financial
assertions, expected outcomes and timeouts remain unchanged. Three original failed logs are retained
beside successful reruns; browser/results.json and compatibility-matcher.patch identify the exact
changes. No failure was relabeled as a pass.

Native Ganache bindings are unavailable on this Node25 host, so its existing JavaScript fallback
and Server-listener warning appear; all checks passed. No dependency upgrade, public transaction,
private key access, production migration, financial schedule update or primary-source edit occurred.

## Remaining release work

Independent source review found a separate final **authority-block** canonicality gap while the
selected financial anchor was already checked. Primary accepted the concern and is providing a
minimal delta plus a targeted reorg regression. Do not treat this checkpoint as covering that later
fix. Apply only the reviewed frozen delta after the broad run, then record final focused/source
checks separately. No live deployment was performed by this UI chat.

The primary owns final integration, approved origin, exact source-bound financial continuation
compatibility and Netlify/backend rollout. D remains pinned through its financial proof stages;
A/B/C schedules and their original journals/locks/source guards must remain active and valid.

## Final authority-hardened isolated candidate

The primary-owned minimal deltaSHA9f67c7a361c9a12d81e15e2225d335ba60fc5dd77fd2e322f7932aeb65030e1f
was verified and applied after the broad run. Final workbenchSHA30d7d6f722bb5eb83b3c6a54a5b62d09d93f1530323bea6674ac93188742d609
and selected-testSHA5b77a05c1ae8e858bfb88d7f0b264246f5861ca9f22c8506cc3dde9c76db0b63
match the primary-reviewed files. Source review closes the authority-anchor finding: uncached
current block number/hash is rechecked as the last await before synchronous disclosure; failure
redacts the directory and selected detail. Its regression changes only the authority anchor while
preserving the older selected financial block.

Actual final checks: focused selected-bootstrap+client-validator40/40,0failures in53.84s;
`npm run typecheck` PASS; final `node scripts/build.mjs` PASS. The real joint v7/v8 browser test
passed again on final hashes:12 groups,18 selected loads,one API GET/no fallback per load,
no browser financial/RPC/wallet/off-origin action. Fresh proof is
`joint-browser/2026-10-29T04-30-28-935Z/results.json`. Logs/provenance:
`authority-focused.log`, `authority-typecheck.log`, `authority-build.log`,
`final-authority-validation.json`, all under the integrated artifact directory.

The earlier broad292 and six compatibility suites remain clearly attributed to the preceding
candidate; they are not relabeled as reruns of this later two-file delta. The final fix changes
only opt-in disclosure canonicality, keeping financial writes and default API behavior intact.

Primary selected the existing isolated D origin/backend for the optimized preview AFTER its full
financial completion and same-Bob canonical payment/collateral proofs pass. A/B main remainsf4643f8
(with hosting HUD cleanup only), C stays unchanged and both original financial jobs retain their
frozen source/journals/schedules. No publish, financial transaction, schedule mutation or primary
source edit was made by this validation chat. Actual deployment/source-bound public checks remain
pending primary GO. No public D baseline request is allowed while its role audits continue.
