# Loading, mobile stability and keyboard handoff

Latest production launch scope and locally validated source: [compact Luma UI handoff](docs/LM_UI_HANDOFF.md).
Older sections below retain their original validation scope.

29 October 2026 · ready for primary-session review; not deployed.

Current validated follow-up: [production UI guards and recovery handoff](docs/ui-ux-audit/PRODUCTION_UI_HANDOFF.md).
The extra D performance publish is paused under the newer production-readiness priority.
The earlier performance validation below remains historical; no optimized Netlify release is claimed.

The subsequent [actor/session follow-up](docs/ui-ux-audit/SESSION_FIX_REPORT.md) must be integrated
before enabling selected-event bootstrap. It preserves all original cases and adds projection and
successful-session-transition checks; the original checkpoint results below remain historical.

## Branch and source

- Branch: `codex/kleros-ui-ux-speed-audit`.
- Worktree: `/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects`.
- Starting commit: `3332f67abd1e8364891feba7b250c1ec87e257bc`.
- Previous audit checkpoint: `99ffe139193edc8f372f7527f7f94dc3f830ab46`.
- The next implementation commit after that checkpoint contains these fixes. A separate later memory
  commit must not replace the primary session's current PROJECT_BRAIN.

The primary chat owns integration, financial execution and hosting. This worktree did not change
contracts, economic rules, authorization, migrations, signing files or transaction/batch journals.
No push, merge, live deployment or public transaction was performed. The two existing financial
schedules were read-only checked ACTIVE; their configuration was not changed.

## Changes and files

| Files                                                                                  | Change                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/app.js`                                                                        | Stage-aware loading; duplicate refresh coalescing; superseded GET cancellation; 35-second per-GET timeout; generation-bound rendering; optional bound bootstrap adapter; route-scoped navigation focus; announced retryable read errors. |
| `public/index.html`                                                                    | Preallocated account control and accessible loading scaffold; the loading status stays outside busy content.                                                                                                                             |
| `public/loading.css`                                                                   | Compact mobile navigation before data arrives, stable account slot, 44px mobile refresh, static loading cards, restrained teal accent and reduced motion.                                                                                |
| `public/ui-keyboard.js`                                                                | Skip-to-main focus without changing the event hash; Tab containment uses visible controls and explicitly excludes closed/nested disclosure contents.                                                                                     |
| `public/selected-event.js`                                                             | Validates the optional selected-event bundle; unsupported/mismatched bundles fall back to the existing detail GET.                                                                                                                       |
| `src/server.mjs`                                                                       | Adds only the three new static asset paths to the existing allowlist. No API implementation changes.                                                                                                                                     |
| `test/ui-context.e2e.mjs`                                                              | Requires actual cancellation of the obsolete read rather than waiting for its now-canceled response. All event/owner/review/journal and no-broadcast assertions remain.                                                                  |
| `test/selected-event.test.mjs`                                                         | 20 response-binding and fallback unit tests.                                                                                                                                                                                             |
| `test/ui-ux-fixes.e2e.mjs`                                                             | Reproducible frozen-baseline/current comparison and 27 browser regressions.                                                                                                                                                              |
| `ui-registry.md`                                                                       | Loading and focus patterns for future components.                                                                                                                                                                                        |
| `docs/ui-ux-audit/FIX_REVIEW.md`, `FIX_TEST_REPORT.md`, `artifacts/ui-ux-audit/fixes/` | Bounded review, actual test results, source hashes, screenshots and logs.                                                                                                                                                                |

Refresh coalescing applies only to the active same-route read. Completed snapshots are not cached
as action authority. Mutations still force their own fresh load. Cancellation and timeout signals
are passed only to GETs; pending reconciliation POSTs, wallet submissions and once-only recovery
journals retain their existing behavior and locks. Same-tab activation retains organizer components.

## Measured result and limits

Cold loopback Chromium at 390×844 with 800 ms bootstrap and 900 ms detail delays:

| Metric                     | Frozen baseline, two runs | Current, two runs         |
| -------------------------- | ------------------------- | ------------------------- |
| Cumulative layout shift    | 0.371880438 / 0.371880438 | 0.096341825 / 0.096341825 |
| Header height before→after | 135.39→77px               | 77→77px                   |

This is about 74.1% less CLS. The remaining shift is the authoritative environment notice arriving
with bootstrap. Desktop, mobile and actual doubled text were inspected; no new clipping or
horizontal overflow was observed. The settings capture includes an explicitly synthetic nested
keyboard-test disclosure.

These are local rendering/transport tests, not field p75, INP, cache validation or a public speed
claim. The existing deployed backend still has the measured slow serial reads. The optional
combined-response browser fixture proves one accepted bootstrap GET replaces bootstrap+detail;
it does not prove backend RPC speed. Do not tell users the deployed 15-second wait is solved yet.

## Exact additive interface dependency

The primary session agreed to own backend support at a stable financial checkpoint:

`GET /api/bootstrap?selectedEventId=<stable-event-id>`

A supporting response advertises `capabilities.selectedEventBootstrap: true` and includes:

```js
selectedEvent: {
  eventId, instanceId, wallet, // server-authenticated request wallet, or null
  detail                    // unchanged existing event-detail shape
}
// Or a context-bound error, with no private payload:
selectedEvent: { eventId, instanceId, wallet, detail: null,
  error: { code, status, message } }
```

Selected summary, detail and payment facts must reuse one fresh canonical pinned selected snapshot.
Other public summaries may load concurrently but cannot decide eligibility. Client acceptance
requires the current requested ID/load generation; equal nonempty server instance; selected wallet
matching bootstrap session and a known captured actor (including known anonymous scope); and
summary/detail agreement on ID, chain, contract, deployment block, contract/ABI version, policy URI
and template hash. Deployment block must be an integer; immutable string bindings must be present.
The initial unknown cookie session can be established only by the one internally bound response.
Old backends ignore the query/capability and retain the original serial detail GET. Invalid bundles
are discarded. A bound 4xx/5xx error is shown without an extra private-detail read.

The UI validator cannot prove the server reused one block; core must implement and independently
test pinning, privacy, ownership and canonical payment projections. No speculative parallel unbound
reads, financial caching, stale eligibility or optimistic transaction completion was introduced.

## Tests actually run

See [FIX_TEST_REPORT](docs/ui-ux-audit/FIX_TEST_REPORT.md) and saved logs. Build and typecheck passed;
existing Node 253/253; new validator 20/20 separately; UX browser 27; existing simple UI v7 13/v8 18;
existing redesign 49; context 4 plus Playwright expectations. Read-only schedules: both ACTIVE.

## Review and integration

1. Inspect the implementation commit after 99ffe139 and `git diff 99ffe139 HEAD -- public src/server.mjs test UI_HANDOFF.md ui-registry.md docs/ui-ux-audit artifacts/ui-ux-audit/fixes`.
2. Apply only the reviewed implementation commit/paths to the primary branch at its chosen stable
   checkpoint. Do not overwrite its newer PROJECT_BRAIN, registry, financial operator artifacts,
   deployment manifests or scheduled-run state with this frozen worktree.
3. Implement the optional backend interface above, or keep the compatible serial fallback. Test
   authoritative selected-snapshot binding, session changes, denied private events and all three
   contract profiles. Preserve existing signing/journal guards.
4. Run build/typecheck and the listed browser/financial checks in the integrated branch. The current
   read-only harness requires installed project Playwright plus Chromium and runs only on loopback.
5. Keep the ongoing Chiado rehearsal's frontend/source pinned through its financial proof captures.
   Deploy only in the primary session's separately reviewed release; this branch performed no deployment.
