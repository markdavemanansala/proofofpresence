## Progress and recovery update published — 29 October 2026

Core integrated the UI components as `f96ebdf` and published controller/recovery source
`09ac3a9134fc0cf04cd0179774154df5cfe08df4` to
https://kleros-luma-ethereum.netlify.app/ (Netlify `6ae367c7adb51327d1ebbb34`).
The prior local-only status below is historical. [Release closeout](artifacts/setup-progress/hosted-release.json)
records the primary proof SHA and exact limits: seven source assets match, recovery GET401,
public catalog200 with zero events, desktop/mobile screenshots, no errors or wallet/auth/financial actions.
This chat inspected saved evidence only and made no duplicate live probe.

The original wrapped transaction matches its saved reviewed inner call, but its child is still
unadopted/not deposit-ready. Full provenance and delegated-wallet financial compatibility remain
unresolved, as does the MetaMask malicious classification. The new read-only recovery boundary does
not establish registration/adoption or grant financial permission. Core remains the sole publisher.

## Urgent setup progress and owned-event components — 29 October 2026

[SETUP_PROGRESS_OWNED_EVENTS_HANDOFF](docs/SETUP_PROGRESS_OWNED_EVENTS_HANDOFF.md) contains the bounded
pure component API, validation, privacy requirements and Core integration dependencies. Six progress
browser groups and four pure owned-event tests pass. These new components are **not wired or
published**; Core retains the complete setup widget, canonical recovery, wallet/auth and route wiring.
Do not describe the actual event or MetaMask alert as resolved. [Final source-bound evidence](artifacts/setup-progress/2026-10-29T15-05-47.346Z/final-provenance.json)
records the latest mobile label correction and retained owned-unit proof.

## Lean homepage optimization — 29 October 2026

[LEAN_STARTUP_HANDOFF](docs/LEAN_STARTUP_HANDOFF.md) records the current9cac8df baseline, four-file
startup change, exact source/graph/payload evidence, ten focused guards and actual v7/v8 compatibility.
Core owns the separate two safe RPC read reuses and final Netlify/live comparison. Widget829d8c31 is
preserved. Earlier setup-loader publication dependencies are satisfied by the live9cac8df repair.

## Setup wallet loading/recovery fix — 29 October 2026

[SETUP_WALLET_FEEDBACK_HANDOFF](docs/SETUP_WALLET_FEEDBACK_HANDOFF.md) records the reproduced blank
setup bug, two-file fix, final10 focused browser groups, exact source pins and Core integration boundary.
Core owns its separate setup review504 transport/widget; do not overwrite that newer file.

## Live speed improvement verified — 29 October 2026

The source354e045 UI is integrated/published by primary asfec6211. Its controlled live comparison
measured homepage/search23.5568s →3.3589s. See [final handoff](docs/PORTAL_LOADING_UI_HANDOFF.md)
and `artifacts/portal-loading/hosted-release/comparison.json` for actual proofs, source pins and limits.
Only home/directory loading uses the fast metadata route; financial verification stays fresh.

## Current addition — faster public portal (29 October 2026)

Read [PORTAL_LOADING_UI_HANDOFF](docs/PORTAL_LOADING_UI_HANDOFF.md) for the four-file metadata-only
home path, exact source pins, local timing/layout evidence and Core integration requirements. This
addition starts at04bf04ba; it does not replace newer primary memory/backend or the separately reviewed
date widget. Local checks passed; live speed/publication evidence remains Core's responsibility.

# Loading, mobile stability and keyboard handoff

Latest homepage feature: [search public events](docs/PUBLIC_EVENT_SEARCH_UI_HANDOFF.md).

Prior homepage correction: [remove manual deposit-link entry](docs/REMOVE_MANUAL_LINK_HANDOFF.md).

Prior bounded follow-up: [explicit case publication UI](docs/CASE_PUBLICATION_UI_HANDOFF.md).

Production launch scope and locally validated source: [compact Luma UI handoff](docs/LM_UI_HANDOFF.md).
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
