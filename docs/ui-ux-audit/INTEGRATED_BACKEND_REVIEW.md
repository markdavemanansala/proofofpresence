# Applied selected-bootstrap backend source review

29 October 2026 · bounded independent source review; no application edits or test execution.

Reviewed the backend patch applied in the isolated UI worktree against local HEAD
`ea9fadaad2191da04ec1a5104ffe1efdcabfcd03`. Root identified its provenance as primary source
`f7…` and patch SHA256 `ab8ab6d7653b7faf94773f6ab28a8f62a63539f5e1d25418a50863d517350197`.
That provenance was supplied by root; the file digests below were independently computed for the
actual applied source inspected.

| Reviewed file | SHA256 |
| --- | --- |
| `src/chain.mjs` | `daf91b522bcdc876ddc4abd8bcde4641d94e7eac908e1cf78a4862957ccd643b` |
| `src/server.mjs` | `f9903eb55ed4234ae7e0cbd8a3db4c4bc4a95daa850b9ac8745b0b65d5f07439` |
| `src/workbench.mjs` | `cc755e77f10f50d638cfbb0fb4b0a8cd3f030af64f7609d35b0a05967ec144d1` |
| `test/selected-bootstrap.test.mjs` | `72359705087d024c59b5498a62feb1c104ddf060710f4da985dd75efe44841bf` |

## Finding requiring primary feedback

**Final authority-block canonicality is not checked independently of the older selected snapshot.**

`selectedDisclosure()` selects a fresh authority block at `src/workbench.mjs:617`, then reads each
directory event's owner/pending owner at that block number (`623`–`625`). The parallel canonical
read at647 and comparison at682–683 cover the **selected financial snapshot** block. The code does
not subsequently verify the canonical hash of the newer authority block after the parallel owner
reads finish.

Concrete boundary: private nonselected event B is visible to Alice only through current financial
ownership. Its guard owner read returns Alice at blockN, thenN is reorganized during another
guard RPC and the replacement canonicalN makes Bob the owner. Selected event A's older financial
anchor remains canonical. The selected-anchor check can pass while B's old owner result still
authorizes its private summary through `financialAccess` and `record()`.

Suggested resolution: after all authority reads, compare the canonical block hash at the authority
block number with the hash chosen for those reads, and fail closed on disagreement before any
synchronous disclosure checks. Keep it separate from the selected-snapshot hash check. A targeted
local regression should change only the guard anchor while leaving the selected anchor valid.
This was reported promptly to root. It is a source-supported race scenario, not a test reproduced
by this reviewer; approval remains pending primary feedback/resolution and final evidence.

## Improvements confirmed in the applied source

- **Earlier post-selected-guard delay is addressed.** Directory summaries, selected detail, clock
  and network work are awaited at `src/workbench.mjs:525`–`530`. The final disclosure pass follows
  them. No further asynchronous metadata read follows that pass before the workbench returns.
- **Whole-directory access is rechecked.** The final pass collects current owner/pending-owner
  facts for every disclosed target, refreshes financial access, then synchronously checks current
  definition visibility/staff/organizer lists (`603`–`712`). Revoked nonselected summaries are
  dropped, and only current access metadata/role is refreshed; selected financial fields retain
  their pinned values. A selected failure removes its summary as well as private detail.
- **Logout/session expiry is rechecked by the HTTP boundary.** After the workbench await,
  `src/server.mjs:384` reads the original request cookie again. A changed/expired session yields
  null detail, an empty directory and a bounded401 error; the outer and selected wallets agree
  with that re-read. `getSession()` returns the stored session reference (`200`–`212`), so this
  identity comparison detects deletion/replacement rather than comparing newly constructed
  wrapper objects. No awaited work follows this server check before response construction/send.
- **Errors are exclusive and sanitized.** Selected failures use null detail and the known
  message/status/code mapping at `src/workbench.mjs:580`–`601`; raw provider errors stay internal.
  Unknown/malformed selected IDs cannot become arbitrary routes. Duplicate query parameters are
  rejected by `src/server.mjs:371`–`377`. Server instance and actor are supplied at the boundary.
- **Request-local selected pinning is retained.** The selected snapshot promise is reused for
  access, summary and detail. Own-wallet, participant facts, deposit ledger and payments use
  that block. Optional internal blockHash is excluded from the public detail state; the existing
  fingerprint is still computed from the original state object (`src/chain.mjs:862`–`867`).
- **Receipt projection and write verification remain distinct.** Only the known-state read path
  supplies its selected block to `verifyReceipt()` (`src/workbench.mjs:754`–`760`). The verifier
  bounds receipt height, credit reconstruction, v7 history and contract reads by that optional
  block. Actual receipt linking, admission/action specification and reconciliation still omit the
  new argument and use `"latest"` (`1208`, `1327`, `1371`, `2037`, `2043`). Draft creation and
  validation still call fresh `state()` and simulation (`1622`–`1634`, `1689`–`1703`); the request
  snapshot map is not passed into these write paths.
- **Legacy response shape is opt-in compatible.** Without the selected query, the old bootstrap
  path remains separate; standalone event GET retains its state/access/detail sequence
  (`src/server.mjs:610`–`613`). The added `chainState` option defaultsfalse, so ordinary callers
  do not gain a blockHash field. No economic rule, contract dispatch, signing/journal or submit
  retry code appears changed in the inspected diff.
- **Node compatibility:** runtime additions use standard syntax/APIs supported by the declared
  Node22.15 minimum. No new runtime dependency/import was added. The new integration test's
  local TLS fixture requires `/usr/bin/openssl`; that is a test-environment dependency, not a
  production transport change.

## Test source inspected, not executed

The applied integration file includes meaningful cases for legacy/opt-in response equality,
concurrent actor privacy, pinned receipt/credit/payment facts with a later fresh request,
selected-owner changes while another event is slow, sanitized selected failures/reorg, signed
test15m sessions and separate server instances. It now additionally covers:

- Pending-owner-only private access and later revocation.
- Nonselected private directory removal after a third event delays the response: owner transfer,
  pending-owner revocation, staff removal and public-to-private definition changes. It checks
  removal of the private title from the entire response and that the cheap final authority pass
  does not take another full financial snapshot.
- Logout during a delayed request, requiring null session/detail/selected wallet and an empty
  directory, with no seeded contact leakage.

The legacy RPC-count expectation is explicitly4 versus selected1 for the selected event's full
`chainState` phase read in the private fixture (`test/selected-bootstrap.test.mjs:242`–`266`).
This is an expected structural reduction; it is not a deployed latency measurement.

Primary reported combined30/30 plus focused5 and typecheck passes before this review. Those
results were not independently rerun here. Root's integrated build/validation and resolution of
the authority-anchor finding must be recorded separately before a release decision.

This reviewer changed only this report. No candidate/backend edit, tests, browser/network/RPC,
private-key/journal access, signing, deployment or schedule change was performed. Existing D role
review notes were preserved; ruled/settled screenshots were not inspected without a stage notice.
