# Acceptance checks for selected-event bootstrap

29 October 2026 · preparation for the primary backend owner's candidate commit.

This is a read-only source review, not an implementation, test result or deployment approval.
Primary source inspected: `67ee1d9bfac68f6925ca5dff638b07b5e56b5eae`, plus its visible working tree.
UI interface reference: `ab979223912b699da2cc9f3f1744adc2284e43d2`, current
`public/selected-event.js` and `UI_HANDOFF.md`. The primary backend does not yet implement this
optional capability at the inspected checkpoint; that is an expected integration dependency,
not a reported defect in unimplemented code. Line references below describe this baseline and
must be relocated against the supplied candidate.

The primary session alone owns backend implementation, integration, deployment and financial
execution. This reviewer read only the assigned source/docs and wrote this checklist in the
isolated UI worktree. No primary files, backend files, private keys, journals, schedules or
financial state were modified or inspected beyond the authorized public source. No network,
browser, test, build, signing or hosting operation was performed for this review.

## Exact additive contract

`GET /api/bootstrap?selectedEventId=<stable-event-id>` retains the ordinary bootstrap response.
A backend implementing the extension advertises the boolean
`capabilities.selectedEventBootstrap: true`. With a requested ID, it adds one exclusive outcome:

```js
selectedEvent: {
  eventId,
  instanceId, // exactly the outer server instance
  wallet,     // authenticated request session wallet, or explicit null
  detail      // the existing event-detail schema
  // error absent or null
}
// OR, inside the successful bootstrap envelope:
selectedEvent: {
  eventId, instanceId, wallet,
  detail: null,
  error: { status, message, code } // integer HTTP400..599; code optional to the UI
}
```

Do not change the top-level legacy API failure convention (`{error,code}` with an HTTP error
status). A global bootstrap/network failure remains an actual failed bootstrap. A selected-event
denial or missing event can be represented by the bound error above without leaking its detail
or requiring a second private-detail read. An ordinary bootstrap without `selectedEventId`
continues to work, and the standalone event GET remains supported.

## Candidate acceptance checks

### 1. One fresh selected snapshot, reused rather than fetched again

- Instrument a local fixture so that the chain advances between asynchronous reads. Assert that
  the selected summary, detail state, own-wallet facts, participant status/attendance/owed/credit,
  deposits, cases/resolver values and payment projection all use the selected snapshot's anchor.
  Verify `detail.now === detail.state.now` and the exact block/time/fingerprint. The summary's
  phase and role must derive from this same selected state, not a separately read latest owner.
- Assert that the selected event's bootstrap summary is constructed from that known selected
  state. Returning a second independently fetched `detail` with matching deployment metadata
  alone does not prove a shared snapshot; the browser validator cannot detect different blocks.
- Record selected-event state/projection invocations and RPC block tags, with unrelated public
  events present. Demonstrate the intended reduction from the old read path without relying only
  on fewer HTTP requests. Other public summaries may run concurrently and use their own fresh
  anchors; they cannot supply eligibility for the selected event.
- Start a subsequent request after a local state change and prove that it takes a fresh snapshot.
  Request-local reuse is allowed; a previous response, long-lived global promise or TTL financial
  snapshot is not the source for a new request or draft.
- Exercise a canonical-anchor/reorg failure. Follow the existing canonical failure semantics;
  do not label an old or partially read snapshot as a successful fresh bundle.

Baseline: `src/chain.mjs:697`–`728` selects one latest block and uses its number for parallel reads;
`src/chain.mjs:858`–`863` returns the anchor/time/fingerprint. `src/workbench.mjs:374` already accepts
`knownState` for a summary, but bootstrap calls summaries independently at426. Detail calls
`state()` again at452–455. The standalone event route also calls `w.state()` before `w.detail()`
at `src/server.mjs:565`–`568`. Eliminate redundant reads only while preserving their authorization
and current-financial-owner effects.

### 2. Audit downstream reads before claiming a uniformly pinned bundle

- Assert `blockTag === selected state.blockNumber` for the existing own-wallet reads
  (`src/workbench.mjs:458`–`475`), participant contract reads (`478`–`533`), deposit ledger (`537`–`539`)
  and `projectPayments(..., {blockTag})` (`543`). Preserve the distinctions between unused credit,
  admitted principal, held shares, owed transfers, successful direct payments and unattributed
  claims. Do not estimate sent money from pool/balance/reserves.
- Include receipt-verification cases where recovery or registration occurs **after** the selected
  anchor but before detail construction completes. The current detail calls `verifyReceipt()` at
  `src/workbench.mjs:491`; its v8 credit reconstruction/current pending read at806–824 and v7
  history queries/status at831–859 currently read latest separately. The candidate must explicitly
  handle the read-only as-of-snapshot path if it claims uniform pinning, or document the remaining
  limit and avoid treating that mixed result as authoritative eligibility.
- Preserve live receipt, duplicate-evidence, returned-credit and canonical checks on the actual
  admission/draft/commit paths. A request-local detail optimization must not weaken those paths
  by accidentally replacing their fresh checks with an older optional block or a precomputed UI
  result. Read-only projection reuse must not become reusable signing authority.
- Keep immutable deployment verification/provenance checks. Their existing immutable cache is a
  different concern from caching mutable balances or role/eligibility snapshots.

### 3. Actor, instance and deployment binding

- Use the session obtained once by the server for this HTTP request (`src/server.mjs:362`), not
  a wallet query/body parameter, a requested role or a previous response's session. Set the outer
  `session.wallet` and selected `wallet` consistently, using explicit null for anonymous requests.
- Set selected `instanceId` to the exact server-generated outer instance (`src/server.mjs:389`).
  Do not accept a supplied instance, event alias/slug or contract address as a substitute for the
  requested stable registry ID. Validate malformed, empty, encoded-separator and repeated query
  parameters predictably; never turn them into arbitrary backend paths or registry lookups.
- Assert summary/detail equality on ID, chain, contract, deployment block, contract version,
  ABI version, policy URI and template hash. Deployment block is a nonnegative safe integer;
  immutable string fields are present/nonempty. Chain and contract match the outer chain and
  selected registry deployment. Do not manufacture bindings only to satisfy the UI validator.
- Test two concurrent wallets and two events with different role/contact data. Any shared chain
  work must remain separate from per-request private projection; a singleflight keyed only by
  event must never return another actor's assembled detail.

The UI checks these bindings at `public/selected-event.js:13`–`86`. Known captured anonymous
sessions are deliberately different from unknown first-load cookie sessions. Generation checks
remain in app load/render; response binding is not a replacement for them.

### 4. Match the existing private-event and row visibility rules

- Compare combined and standalone responses for anonymous, own participant, owner, authorized
  staff, unrelated participant and unrelated organizer on both public and private/draft events.
  Preserve exact current permissions and filtered fields; this task does not redesign policy.
- Verify private/draft selected denials and unknown IDs return a context-bound error with
  `detail:null`, no forbidden summary, no names/emails, imports, observations, personal history,
  transactions or private configuration hidden inside the error/message. Test an allowed event
  alongside a denied one to expose cross-event leakage.
- Preserve current and pending owner's private financial access when ownership changes. The
  existing `state()` refreshes `financialAccess` before `record()` authorization
  (`src/workbench.mjs:128`–`133`, `452`–`455`); removing a duplicate read must not silently remove
  that refresh or use a global stale owner cache. Roles in the returned detail still derive from
  the pinned selected owner. New writes always revalidate current authority separately.
- Preserve profile-free own-wallet recovery: an authenticated payer without a name/email record
  still receives only their own `ownWallet`; anonymous detail has `ownWallet:null`. v7 does not
  gain a fabricated pending-credit field. Participant names/emails remain filtered as before.

Baseline policy: `src/workbench.mjs:100`–`121`; detail filtering at477–480 and537–562.
`docs/API.md:7`–`16`, `34` and `75`–`77` state the existing recovery and payment semantics.

### 5. Exclusive error union and serial compatibility

- Test successful detail with absent/null error; test a bound error with explicit `detail:null`,
  string message and integer status400..599. Never send both usable detail and a nonnull error.
  Missing/private selected events need no public summary for their error to be accepted.
- Test an older backend ignoring the query/capability, absent/false capability, incomplete bundle
  and mismatched binding. The UI must issue the existing standalone detail GET, never consume the
  rejected detail or claim a successful optimized request. Preserve the old endpoint's behavior.
- Test a valid bound selected error: the UI shows it without a second private-detail GET. This
  differs from an invalid/unbound error, which is discarded for the legacy fallback.
- Preserve response types for amounts, timestamps, arrays and state. The unchanged detail shape
  is consumed by the existing UI/journals; `Number` coercion is not a reason to change API wei or
  deadline types. Document the new query/capability/union in primary `docs/API.md`.

Existing UI unit tests cover20 binding/fallback cases; those tests do not prove actual server
pinning/privacy. They were not rerun during this checklist review.

### 6. Profile compatibility and unchanged financial authority

- Cover historical v7, normal `kleros-event-v8`, and exact
  `kleros-event-v8-test15m` on local fixtures with their applicable chain constraints. Preserve
  v7's compatibility dispatch and one-day normal-v8 terms. Test15m stays VERSION80015,
  chain10200 and900-second challenge/matching periods; no aliases or broad version-prefix gate.
- Compare before/after data and behavior for payer-credit withdrawal, owed claims, separate
  admission/registration/check-in, unresolved held shares, ordinary payout, final ruling and
  settlement. A bootstrap read must not approve admission, reconcile a transaction, issue a draft,
  post attendance or claim completion.
- Keep draft validation, fresh simulation, signed-hash journaling, duplicate suppression and
  recovery routes independent. Never reuse the bundled snapshot as a cached financial decision,
  or retry a write because a GET was cancelled/timed out.

### 7. Transport and measured improvement

- Keep the existing protected gateway/host/session boundary and API no-store behavior
  (`src/server.mjs:185`–`198`, `332`–`362`; `docs/API.md:244`–`250`). The optimization must not enable
  CDN/browser caching of authenticated bootstrap/detail, expose the private backend URL/key,
  or move RPC access into the browser.
- On a locally served supporting backend, verify an accepted selected response uses one logical
  bootstrap GET and no standalone detail GET. On an old backend, verify the two-read fallback.
  Test delayed responses, account/event changes and an ignored client abort: the old response
  cannot repaint, reopen a private view or release pending-action locks.
- Collect comparable cold/warm desktop/mobile waterfall timings, selected RPC/read counts,
  response bytes and first usable event paint. Report both success and error paths. One HTTP
  request alone is not proof that the previous multi-second RPC wait was reduced; the combined
  response may be larger, and unrelated summary latency can still dominate bootstrap.

## Primary review and rollout gate

The candidate should supply its exact commit/diff, API docs, deterministic local pinning/privacy
evidence and relevant compatibility/build/typecheck/browser results. Review it against this list
before integration. Record actual commands/results rather than carrying forward old pass counts.

Integrate only the reviewed UI implementation `ab979223` and the chosen backend changes at the
primary owner's safe checkpoint. Preserve newer primary memory, manifests, private persisted
state and active financial schedules. D's frontend/source remains pinned while its proof sequence
requires it; no audit-branch release should replace that source during a financial stage. Preview
deployment and post-deploy read checks remain primary-owned and require its source-bound release
evidence. This checklist grants no separate deployment or financial authority.

## Preliminary inspection of the moving backend candidate

29 October 2026 · read-only files under `/private/tmp/kleros-selected-bootstrap-67ee1d9`.
This was an **uncommitted candidate under active editing**, not the frozen primary commit.
No Git initialization, source edit, test, server, network request or financial operation was run
there. The observations below describe the source seen during this pass and must be checked
again against the supplied final commit.

### Concrete guard-placement finding sent to root

In the inspected `src/workbench.mjs`, `selectedAccessCheck()` runs inside the selected-detail
promise at490. That promise checks the current owner/pending owner and the canonical selected
anchor at601–633. However, `selectedBootstrap()` then waits for all directory summaries at536
and performs further awaited chain/network/clock reads in the return assembly at545 and574.

A slow unrelated event can therefore leave a material wait **after** the final selected-event
access check. For example: a transferred-in owner who is not in `definition.organizers` requests
private event A; its privileged contacts are assembled and the selected check passes; unrelated
event B's slow summary delays the response; A transfers ownership during that delay. The
observed control flow still sends the earlier privileged detail after the access change. The
same window applies to removal of pending-owner-only private access and to a selected-anchor
change during later awaited work.

Repeat or move the final selected access/anchor validation to after all remaining awaited work,
immediately before returning the selected outcome. On failure, sanitize it to the bound error
union and omit its summary; do not leave the previously assembled private payload in either
location. Add a deterministic local regression which pauses an unrelated summary **after** the
first selected guard, changes owner/pending-owner access or the selected canonical anchor, then
releases the pause. This finding was reported to root for primary feedback; it is not a claim
that the still-moving candidate has been fixed or approved.

### Other inspected boundaries

- The snapshot map is local to `selectedBootstrap()` (466–478); the selected summary reuses
  `selected.detail.event` (526–527). No persistent mutable snapshot cache appeared in these paths.
- Server wrapping supplies its own instance and session wallet (candidate `src/server.mjs:403`–`409`)
  and rejects duplicate query parameters (371–377). Selected errors use a bounded message/code/status
  whitelist (candidate `src/workbench.mjs:578`–`599`) and have `detail:null`.
- The known-state detail path now passes the selected block to receipt verification (674–680).
  The verifier bounds receipt height, v8 credit reconstruction/pending reads and v7 history/status
  by that optional block (candidate939–1080). Existing mutation call sites continue to omit the
  new argument and use its `"latest"` default; no mutation was observed consuming the request map.
- `chainState(..., {includeBlockHash:true})` adds an internal anchor hash only on the optional
  read path (candidate `src/chain.mjs:697`–`706`,862–867). The hash is excluded from the public
  known-state projection and the existing financial fingerprint remains based on the same state
  object. These are source observations, not substitutes for pinning/reorg/financial regressions.

Final approval remains pending the primary's frozen commit and actual test/integration evidence.

### Follow-up: revised guard ordering and test source

A subsequent read-only pass of the **still-uncommitted, moving** candidate found the earlier guard
placement addressed in source. Candidate `src/workbench.mjs:535` now awaits directory summaries,
selected detail, the clock block and local network metadata together. The selected access/canonical
check at546 follows that work as the final awaited operation. Its failure replaces the selected
detail with the sanitized error union and the return filters that event's summary at565–567.
No further concrete guard blocker was found in this bounded inspection. This is not frozen-commit
approval or a test-pass claim.

The candidate's new `test/selected-bootstrap.test.mjs` was inspected, not executed. It contains
these five named integration tests:

1. `v7 opt-in selection preserves default API and shares private-state work without leaking between actors`
2. `v8 selected receipt, own credit and payment facts use one canonical block while the next request sees changed money`
3. `a slow directory event cannot expose selected private contacts after ownership changes`
4. `selected read failures and a changed canonical anchor return safe scoped errors while other events remain usable`
5. `fast-profile HTTPS testnet selection binds actual signed sessions and separate server instances`

The slow-directory regression at385–497 exercises the reported ordering gap meaningfully: it
pauses event B's phase read, waits for selected A's payment work, asserts that the final owner
guard has not already completed, transfers/accepts A's ownership, then releases B. It requires
null selected detail, a409 access-change error, no A summary and no seeded email; the new owner's
subsequent read is privileged and the former owner's is not. The v8 pinning test separately
changes unused credit after the selected anchor and checks the old response's pinned facts and
the next request's changed money. The error/reorg test requires scoped sanitized failure and a
subsequent successful read. The external-profile fixture limits its transport to local RPC/TLS
and checks instance/session isolation and read-only backend RPC methods.

Remaining targeted coverage gaps in this inspected file:

- Pending-owner-only private access being revoked/replaced while B remains paused.
- A transferred-in current owner, absent from the original `definition.organizers` and participant
  lists, losing private access entirely during that pause. The existing slow-B test starts with
  the original creator, who retains definition-level access after transfer; it proves privilege
  downgrade/409 sanitization rather than the final `record()`403 denial branch.

The revised final `record()` check appears to cover both cases in source. They are test gaps to
resolve or explicitly account for in primary evidence, not newly demonstrated application bugs.
The unchanged requirement is final review against the primary's frozen commit and actual results.
