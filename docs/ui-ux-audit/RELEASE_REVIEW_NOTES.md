# Optimized preview release — read-only review

Prepared 29 October 2026. Primary session owns backend changes, integration, origin selection and deployment. No primary files, hosted resources, credentials, financial operations or schedules were changed during this review. No network requests, build/test commands or deploy commands were executed. Only this report was written in the isolated UI worktree.

## Destination recommendation

The maintained general application is **https://kleros-event-workbench-preview.netlify.app**. It is the appropriate eventual destination for the integrated loading/keyboard fixes and reviewed backend performance work. Publish an exact primary-reviewed release commit, preserving its existing A/B backend, registry, durable volume and gateway. Do not publish the old audit branch wholesale or substitute the separate design prototype.

This is a target recommendation, not a declaration that the current financial run permits an immediate rollout. The primary operator must confirm a safe stage boundary and the source expectations of the active financial/role harnesses first. The currently active D deployment should remain untouched pending that explicit primary direction.

| Origin | Recorded purpose and current source | Release treatment |
| --- | --- | --- |
| `https://kleros-event-workbench-preview.netlify.app` | Maintained controlled Chiado A/B application. `artifacts/testnet-hosting.json`: frontend/backend `f4643f8b3a2938d4cbcebe233e202656847a3084`; Netlify site `f6b82f41-9e30-49b0-a836-40fedbab93a4`, deploy `6ae256bf680f9cc3dd92092c`. | Eventual optimized general-app target after primary freeze/guard coordination. |
| `https://kleros-ui-c-20261029-9fe71683.netlify.app` | Isolated real C rehearsal; `artifacts/ui-c-hosting.json`: source `f4643f8`, Netlify site `db303622-4c6c-4034-b289-ccea38f029fc`, deploy `6ae254742b594eb08bab8df5`. | Preserve separately. Do not update incidentally with A/B; C has a strict source-bound remaining financial flow. |
| `https://kleros-fast15m-d-20261029-9fe71683.netlify.app` | Isolated active D fast test; `artifacts/ui-d-hosting.json`: frontend `7bdd40a3478e487f84b0c00aa0d58e25d13e0d5e`, backend `67ee1d9bfac68f6925ca5dff638b07b5e56b5eae`, Netlify site `17e7e27e-1c2a-4411-91a7-cb0da8fece90`, deploy `6ae2a28034076e4185468d63`. | Keep frozen until primary confirms its current stage. No replacement origin, shared backend or merged manifest. |
| `https://kleros-ui-preview-20261028-e32b4c.netlify.app` | Earlier polished static design prototype, independently byte-matched to `1b0ea0e` in the audit. Synthetic role/scenario controls and receipts. | Visual reference only. Not the target for real API performance work or proof of actual payments/registrants. |

Provenance: main `PROJECT_BRAIN.md:19`–`:35`, `docs/HOSTED_DEPLOYMENT.md:3`–`:55`, public hosting JSON above, and the isolated audit `UI_UX_AUDIT.md:20`–`:25`. These are local records; this review did not independently re-check live availability.

### Important D record discrepancy

The primary brain's D paragraph still says only its policy is hosted (`PROJECT_BRAIN.md:178`–`:186`). Newer public records supersede that factual checkpoint: `artifacts/ui-d-hosting.json`, checked `2026-10-29T03:13:23.874Z`, records a healthy application with deposits in progress. `docs/CHIADO_UI_D_ACCEPTANCE.md:191`–`:225` then records the active app and two actual UI deposits with independent deposited audit. This is enough to reject the assumption that D is an unused site; it is not enough to infer D's current stage or permission to redeploy it. Root is awaiting the primary operator's current freeze direction.

## Correct source-bound packaging path

The following describes existing tools for the primary owner; none was run here.

1. Integrate only the bounded UI changes into the primary's current application source, preserving newer D and backend work. The audit source was a frozen older snapshot, so copying its entire tree would discard later primary changes. Review and record one immutable release commit after the intended local checks pass.
2. `scripts/build-hosted-frontend.mjs <reviewedReleaseCommit>` archives that commit's tracked `public/` tree to `dist/netlify-app`, then writes the existing security headers. Supplying the commit matters: without it the builder copies the working tree. `netlify.toml` declares `dist/netlify-app` and `netlify/functions` as the interactive deployment outputs.
3. If the reviewed performance change requires a backend image, `scripts/prepare-hosted-backend.mjs <reviewedReleaseCommit>` constructs the existing closed whitelist from that commit. Its selected source contains `src`, `public`, pinned compiler inputs and only tracked supported registry files. It excludes environment/runtime state and Git history. Reuse the exact existing service/volume for the selected origin; do not initialize another application state or point at another scenario's backend.
4. The documented interactive Netlify path uses pinned official CLI `netlify-cli@27.15.0`, `deploy --no-build --prod`, `--dir dist/netlify-app`, `--functions netlify/functions` and the exact existing site ID. An explicit source-bound frontend build avoids an implicit working-tree rebuild. **The function directory is a separate CLI input:** verify its bytes/config against the same reviewed commit, or stage them from that commit too. Selecting a commit for `public/` alone does not establish gateway provenance.
5. Preserve existing canonical origin and server-only gateway configuration. `netlify/functions/workbench.mjs` requires an exact public HTTPS origin and fixed backend destination. Unique immutable Netlify deploy URLs are useful for static byte inspection but intentionally fail the canonical-origin API check; do not “fix” this by widening CORS or weakening origin checks.

**Wrong path for this release:** `scripts/build-netlify-preview.mjs` creates synthetic read-only v7 snapshot data in `dist/netlify-preview`; `scripts/deploy-netlify-preview.py` publishes that ZIP. Its default site name is the maintained main site's name. Running that historical helper could replace the interactive app with an old read-only snapshot. It is not the source-bound interactive application deployment path. Historical same-site immutable read-only deploys in `docs/NETLIFY_DEPLOYMENT.md` are also distinct from the separate teal prototype origin.

Source references: `scripts/build-hosted-frontend.mjs:7`–`:39`, `scripts/prepare-hosted-backend.mjs:6`–`:83`, `netlify.toml:1`–`:14`, `scripts/deploy-netlify-preview.py:18`–`:19` and `:53`, `docs/HOSTED_DEPLOYMENT.md` interactive build/deployment sequence.

## Freeze and integration boundaries

- A/B and C retain independent scheduled financial continuations, contracts, deadlines, manifests, persistent application records and once-only journals. D is a separate chain10200-only profile, application origin and backend. No financial action, registry merge, deadline adjustment, contract replacement, replay, journal copy or schedule change is part of this UI/performance release.
- A/B/C operator code has a reviewed frozen source, but their browser/role harnesses also verify **published HTML/script/style bytes**. Keeping operator code frozen does not by itself make a new frontend compatible with those guards. Primary must choose a safe stage boundary and explicitly bind the exact reviewed served source, or leave the scenario's hosted source unchanged. Do not introduce a broad source-guard exception or accept arbitrary Netlify-injected scripts. C's narrow historical non-executable-comment exception is not a general exemption.
- The new UI changes do not alter contracts or authoritative interfaces. The current primary `src/server.mjs:953`–`:974` static allowlist contains neither `/loading.css` nor `/ui-keyboard.js`; adding those exact public resources is an expected integration dependency. The frontend archive includes them only after they are tracked in the selected release commit. Browser imports, root Node serving, packaged Netlify serving and strict asset verifiers must agree on that asset set.
- Backend performance work must retain full deployment/manifest identity and canonical-anchor verification. Mutable phase, owner, credit, fee, deadline, balance, attendance, finality and signing eligibility remain fresh and authoritative; faster loading is not permission to cache financial eligibility or weaken draft validation.
- Keep `hosted-testnet`, public-testnet disclosure, exact chain10200/profile dispatch, signed-wallet nonce auth, no impersonation/faucet/time travel, unchanged proxy/RPC policy and no Luma activation. No secret/config value was inspected for this report; only public source and public artifact metadata were read.

## No-impact evidence needed from the primary release owner

Before rollout, record the exact source commit, frontend/gateway asset hashes and backend package/image identity; identify which one origin/service will change. Carry forward current deployment IDs so rollback can select a reviewed image/frontend without restoring or resetting durable application state. Confirm no in-flight financial stage or unresolved submission will be disrupted and that all source-bound continuation checks remain satisfiable.

For the integrated local candidate, run the primary-required build/typecheck and targeted loading/keyboard tests, plus relevant existing event-scope, journal, signing-safety and hosted tests for the actual diff. Verify both new resources return correct MIME types and successful status from the Node server and built frontend. A synthetic fixture browser pass proves interaction/layout, not public financial state or live API speed.

After the primary-authorized deployment, use the **canonical selected origin** for read-only health/bootstrap/event checks and the unchanged exact registry/profile/network projection. Compare authorized financial snapshots and persistent receipt/participant linkage against the primary's baseline, allowing fresh block/time fields while preserving actual accounting and case state. Verify source bytes, CSP, script imports and the absence of injected or missing assets. Maintain existing A/B/C/D separation; an origin not selected for rollout must keep its recorded deployment/source and backend configuration.

Repeat measured anonymous cold/warm load and mobile CLS checks against that deployed origin; report API waiting time separately from bundle/render cost. Check desktop/mobile/200% text and keyboard skip/tab/disclosure behavior. Authentication-only role checks may be performed by the primary's authorized harness, with zero financial signatures/broadcasts and exact served-source matching. Do not rerun consumed financial acceptance stages merely to validate a UI release, and do not report settlement/payment completion from hosting health, `Finalized`, a synthetic prototype or transaction confirmation alone.

## Review limits

This report does not verify the current hosted response, authenticate any role, access private signing/runtime files, change service variables or approve a release window. The maintained destination and commands are supported by local public records; the primary operator remains responsible for the current D stage, final integration, exact release acceptance and deployment execution.
