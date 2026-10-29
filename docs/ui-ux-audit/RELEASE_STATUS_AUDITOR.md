# Nonce-only post-release D audit

A separate test/testnet-ui-d-release-status.e2e.mjs preserves the historical D status auditor and
all financial execution/proof inputs. Original source SHA85588a44bc3445779ff35fd3eaae946564b85b70f62b9467d052415a70e39468
is unchanged. New auditor SHA isb420bcf567d104b7afc5bd4cda0ac94c55ecefd61711fac09869d0ac87cc15eb.

Default review and offline self-tests pass30 accepted/160 rejected checks with zero runtime files,
private keys, network, nonce signatures or financial actions. Existing pure phase/canonical/personal
payment/nonce/source invariants remain; artifacts/release-status/copy-preservation.json records five
protected assertion regions preserved. Root independently repeated default/self-test with no runtime
execution. A separate source reviewer found no remaining critical guard issue after the pre-auth actor
expectation was corrected.

The execute path requires explicit UI_D_RELEASE_STATUS_EXECUTE=1, exact D origin, settled phase and
full reviewed --source Git SHA. Git public bytes and imported validator SHA bind before runtime/helper
imports or key access. Actual selected bootstrap detail is consumed unchanged after exact actor,
instance, deployment, permissions and privacy validation. Expected actor is null before a successful
exact-role nonce verification acknowledgment, then fixed to that role; it is never inferred from the
response. Bare preflight/auth-poll bootstrap reads remain session-checked. Browser serial event-detail
fallback is forbidden, as are unknown/extra/duplicate query parameters and all financial APIs/RPC/
wallet sends. All three new source assets must be observed and matched for each role.

Actual private-key/nonces execution is PRIMARY ONLY, after verified D completion and new deployment;
it must produce three settled-role nonce-only views/six captures with zero financial signatures or
broadcasts and unchanged canonical state. Root has not run this actual path. No financial stage may
be rerun to validate a release. Output proof directories are isolated under artifacts/release-status;
original financial status pointers/proofs and the old auditor are not overwritten.

Primary invocation after release approval:

    UI_D_RELEASE_STATUS_EXECUTE=1 UI_D_APP_URL=https://kleros-fast15m-d-20261029-9fe71683.netlify.app node test/testnet-ui-d-release-status.e2e.mjs --phase settled --source <reviewed-40-character-release-sha>

The primary owns the exact release source, original signing files and execution environment. This
handoff contains no credentials or new authorization for financial transactions or mainnet deployment.
