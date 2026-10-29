# Selected bootstrap — authority-block reorg correction

The reviewed ab8ab6 candidate could disclose nonselected private B after its final
authority block N reorganized: the owner/pending reads came from orphan N while
the older selected financial block M remained canonical. A real ephemeral local
chain reproduction confirmed the leak before the correction. No public request,
live runtime, signing file or root source was involved.

The correction adds one final `getBlock(current.number)` after **all** owner and
pending-owner reads finish. Number and hash must still match the authority header.
This is the last awaited work before synchronous access/disclosure checks and
before any financialAccess projection is updated. A changed/missing authority
anchor uses the existing safe409 response: `events: []`, selected `detail: null`,
`error.code: SELECTED_EVENT_REORG`. A transport failure uses the existing generic
safe error. The no-query route and financial behavior are unchanged.

Choose exactly one patch:

- `selected-bootstrap-authority-anchor.delta.patch`: minimal delta against the
  exact ab8ab6 candidate. It changes only `src/workbench.mjs` and adds one real
  regression to the existing selected-bootstrap test file. Use this for the UI
  peer's already combined ab8ab6 source.
- `selected-bootstrap-67ee1d9-authority-anchor.patch`: the complete replacement
  backend patch against `67ee1d9bfac68f6925ca5dff638b07b5e56b5eae`. Use this on
  the original source, instead of either previous full patch.

Do not apply the delta and the full patch together. Exact patch and source hashes
are in `selected-bootstrap-authority-anchor-provenance.json`. The prior ab8ab6
patch, its provenance and30-pass log remain unchanged. Its exact four source files
are preserved under `baselines/ab8ab6/`; no new root integration was performed.

Actual validation:

- The new test failed on ab8ab6 as expected: B's private title was present even
  after all six authority values came from old N and only N was replaced. Assertions
  confirmed M stayed canonical and the current B owner had changed before the
  privacy assertion failed. Negative evidence:
  `artifacts/selected-bootstrap-authority-reorg-reproduced.log`.
- After the correction, that same test passed1/1. Its actual proof reads
  “selected block7 unchanged; guard block8 replaced”. Test-case time3.89seconds,
  whole focused process12.66seconds. Positive evidence:
  `artifacts/selected-bootstrap-authority-reorg-focused.log`.
- Final compatibility command passed31/31 in96.38seconds:
  `node --test --test-concurrency=1 test/selected-bootstrap.test.mjs test/http.test.mjs test/testnet-runtime.test.mjs test/v8-chain-adapter.test.mjs`.
  Actual output: `artifacts/selected-bootstrap-authority-reorg-final.log`.
- `npm run typecheck`, `git diff --check`, forward delta applicability against an
  ab8ab6 index, forward full-patch applicability against the67ee1d9 index and
  reverse applicability checks all passed.
- Independent read-only review by `testnet_readiness` found no material issue in
  the correction or isolated guard-block reproduction. That review did not rerun
  tests or make requests.

The previous optimization and privacy regressions still pass: one selected full
state read versus four in the preserved serial private-event HTTP path, pinned
monetary receipt/payment facts, delayed-directory ownership/staff/visibility loss,
logout redaction, actual local-TLS wallet authentication and instance isolation.

No public performance, browser/mobile deployment or completed financial checkpoint
is claimed. Root retains control of integration, active D financial work and hosting.
