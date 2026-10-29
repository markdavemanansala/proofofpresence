# Selected bootstrap — final directory privacy candidate

Base: `67ee1d9bfac68f6925ca5dff638b07b5e56b5eae`.
Use `selected-bootstrap-67ee1d9-directory-privacy.patch` **instead of** the older
`selected-bootstrap-67ee1d9.patch`; do not apply both. Both patches, the prior
25-test proof and the prior provenance JSON remain preserved in this sandbox.
This new patch has not been integrated, committed in root or deployed.

The original API description is in `SELECTED_BOOTSTRAP_HANDOFF.md`. All opt-in
selected-event behavior, pinned receipt/payment checks, source/profile handling,
server-instance/session binding and unchanged no-query compatibility are retained.

This candidate closes the previously noted nonselected-private-directory timing
gap. After directory summaries, selected detail, clock and network work complete,
`selectedDisclosure` reads current owner/pending owner for every potential returned
event at one fresh block. Those reads run together; no additional full financial
snapshot is taken. All final visibility, staff, participant/organizer and financial
access checks then run synchronously. A revoked or unavailable entry is omitted,
including its title. Public entries are checked too, covering a late change to
private visibility. Current access metadata/roles are refreshed; immutable financial
fields and the selected summary's shared detail.event object are preserved.

Selected role/canonical checks use the same final disclosure boundary. After that,
the server's original-request-cookie check still redacts the entire old directory,
detail and session if logout, expiry or session replacement occurred during loading.
The default bootstrap route keeps its existing behavior and capability shape.

Independent read-only review by `testnet_readiness` found no material blocker and
confirmed that the prior nonselected-directory limitation is addressed. This review
was source-only and is distinct from the actual local test runs below.

Actual validation:

- Focused delayed-C privacy run passed5/5 Node checks (one group and four scenarios)
  in28.25seconds. B lost owner access, pending-owner access, staff access, or changed
  from public to private while C delayed the response. Each response omitted B's
  title while retaining authorized selected A and C. B used one phase/state read
  and a second cheap owner getter; no second chainState was used.
  Log: `artifacts/selected-bootstrap-directory-privacy-focused.log`.
- Final combined command passed30/30 in88.03seconds:
  `node --test --test-concurrency=1 test/selected-bootstrap.test.mjs test/http.test.mjs test/testnet-runtime.test.mjs test/v8-chain-adapter.test.mjs`.
  Log: `artifacts/selected-bootstrap-directory-privacy-final.log`.
- `npm run typecheck` passed. Log:
  `artifacts/selected-bootstrap-directory-privacy-typecheck.log`.
- Forward patch applicability against the unchanged67ee1d9 index, reverse
  applicability against the candidate, and `git diff --check` passed.
- The existing private-selected optimization remains one chainState versus four
  in the preserved legacy serial bootstrap+detail path.

Only sandbox source, ephemeral loopback HTTP/TLS and synthetic local chain fixtures
were used. Root source/Git, A/B/C/D runtime files and journals, live signing files,
public hosting and public chain state remain untouched. No live/mobile browser
or deployment performance result is claimed.

UI integration must independently validate contradictory detail actor/permission
fields. The old server's static asset allowlist also needs the UI candidate's exact
`/selected-event.js` entry when combining local frontend and backend tests; that
separate frontend integration change is not part of this backend API patch.
