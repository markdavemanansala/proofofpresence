# Selected-bundle actor and session follow-up

29 October 2026 · isolated follow-up to implementation ab979223. This is a local UI fix, not a
hosting release or a public financial-stage proof. Integrate this follow-up before enabling the
selected-event bootstrap capability with that UI implementation.

Primary review identified two issues: an actor-bound envelope could still carry another wallet's
ownWallet projection or anonymous private data; successful session mutations captured the old
bootstrap actor for the next load, causing an unnecessary serial fallback.

## Changes

- `public/selected-event.js`: nonnull ownWallet needs a valid wallet matching the bound server actor.
  Anonymous protected arrays must be empty/absent; ownWallet/personal must be null/absent and
  supplied permission flags false. Supplied permission flags and arrays must have the documented
  types. Authenticated nonprivileged participant rows belong only to that actor. Owner/staff
  projections remain accepted through explicit server flags; the client grants no authority and
  strips no fields. Invalid optional bundles return null and use the existing authorized detail GET.
- `public/app.js`: a successful session mutation's acknowledged wallet becomes the next read's
  captured actor. A confirmed logout supplies explicit null. Signed wallet authentication also
  requires the acknowledged wallet to match the account that signed. Invalid acknowledgments
  do not begin a load. The existing bootstrap remains unchanged until fresh data returns; generation,
  instance, actor mismatch, cancellation, journals and server write authority remain intact.
- `test/ui-ux-fixes.e2e.mjs`: the synthetic participant fixture now reflects actual endpoint row
  visibility instead of reusing an organizer roster. Production code did not receive synthetic data.
- `test/selected-event.test.mjs` and `test/ui-session-bootstrap.e2e.mjs`: negative projection and
  session-transition regressions. All original validator and UX cases are retained.

## Actual checks

| Command                                    | Result                                                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `node --test test/selected-event.test.mjs` | PASS28/28, including original20 and8 projection regressions.                                                                            |
| `npm run typecheck`                        | PASS with installed dependencies linked read-only into the isolated worktree.                                                           |
| `node test/ui-ux-fixes.e2e.mjs`            | PASS27; real local mobile CLS remains about0.096 versus0.372 frozen baseline.                                                           |
| `node test/ui-session-bootstrap.e2e.mjs`   | PASS14.108loopback requests,14 explicitly simulated local session/auth writes;0financial/RPC/off-origin/forbidden requests/page errors. |

Session checks cover anonymous→Alice→Bob→logout, mock wallet authentication and account-change
logout using one post-ack bootstrap and no fallback; mismatched selected wallet with exactly one
safe current-actor fallback and no foreign DOM frames; failed/malformed acknowledgments and
logout; wrong signed-account acknowledgment; and a delayed acknowledgment after navigation.
The wallet stub uses a visibly non-cryptographic literal, no key, signature or transaction broadcast.

Evidence is in `artifacts/ui-ux-audit/session/` and the refreshed `artifacts/ui-ux-audit/fixes/`.
The earlier full Node253/253, v7/v8 and redesign runs remain separate historical local results.
They are not represented as a fresh full integrated backend/release run. Primary owns that integrated
financial regression, source-safe release and deployment. Existing financial test sources, schedules,
contracts, backend and signing files were untouched by this follow-up.
