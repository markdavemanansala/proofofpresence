# UI/UX and loading audit

29 October 2026 · audit only

The largest measured problem is waiting for event data: the live participant panel appeared after
**15.0–19.2 seconds**, even though the first shell painted within **0.23–1.16 seconds**. The approved
focused prototype also has useful deposit/receipt and organizer patterns that are not yet fully
present in the live workbench. Fix the loading/navigation issues, then carry those focused journeys
into the real application before adding another dashboard.

## Scope and source

- Branch: `codex/kleros-ui-ux-speed-audit`.
- Worktree: `/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects`.
- Starting commit: `3332f67abd1e8364891feba7b250c1ec87e257bc`.
- Live anonymous app: `https://kleros-event-workbench-preview.netlify.app`.
- Synthetic read-only prototype: `https://kleros-ui-preview-20261028-e32b4c.netlify.app`.
- Public JavaScript was independently downloaded and byte-matched: live app to `f4643f8`, prototype
  to the delivered `1b0ea0e` static build. The code review uses the newer frozen3332 source. These are
  identified separately; the prototype is not a live payment or registrant source. Their different data
  backends make the prototype a rendering reference, not a direct implementation speed comparison.
- No application source, contract, policy, financial rule, authorization, deployment or schedule was
  changed. No wallet, authentication, transaction, real guest write or direct RPC operation was used.

[Source provenance](artifacts/ui-ux-audit/live-source-provenance.json) ·
[Journey review](docs/ui-ux-audit/JOURNEY_REVIEW.md) ·
[Accessibility review](docs/ui-ux-audit/ACCESSIBILITY_REVIEW.md) ·
[Performance source review](docs/ui-ux-audit/PERFORMANCE_SOURCE_REVIEW.md)

## Measured loading

Single first/repeat lab captures at1440×900 and390×844. Mobile used150ms network latency,
1.6Mbps download and4× CPU slowdown. The following table uses the first capture in each fresh
browser context; this is not a real-user percentile or a device fleet result.

| Screen | Desktop largest paint | Mobile largest paint | Desktop event panel ready | Mobile event panel ready |
| --- | ---: | ---: | ---: | ---: |
| Prototype direct deposit |1.53s|0.60s|Static HTML; not timed separately|Static HTML; not timed separately|
| Prototype organizer |2.38s|1.90s|2.35s|1.86s|
| Prototype disputes |2.59s|2.16s|2.57s|2.13s|
| Live anonymous participant |16.91s|7.81s|16.89s|19.19s|

The live repeated captures still took15.03s desktop and16.23s mobile to show the event panel.
Mobile's largest paint occurred before that panel was ready, demonstrating why a paint metric alone
would understate this particular wait.

The request timeline explains most of the delay:

| Live read | Observed response wait across four samples |
| --- | ---: |
| `/api/bootstrap` |4.46–5.76s TTFB|
| Selected `/api/events/:id` |10.17–11.35s TTFB|

The detail request begins **after** bootstrap completes. Source confirms bootstrap itself obtains
financial summaries, then detail reads the selected event again. No greater-than50ms main-thread
blocking contribution was observed in these load samples. The main route transferred about165.5KiB
of resources. The immediate priority is the read/render dependency chain, not removing the brand
font or claiming a large wallet library is loaded: ethers is not in root startup's import graph.

Mobile layout shift was **0.372** on the live route, versus0–0.050 on the checked prototype routes.
The live first screen also spends substantial space on environment, navigation and deployment
context before the participant's main action. Reserve loading space and keep one compact event
context so slow reads do not replace a small loading region with a much taller page.

Google's reference good thresholds are LCP≤2.5s, CLS≤0.1 and INP≤200ms at the75th percentile of real
visits. These lab samples are diagnostic; INP/real-user percentiles were not measured, and this audit
does not claim a Core Web Vitals pass/fail for the whole service. [Web Vitals guidance](https://web.dev/articles/vitals).

**Cache limit:** request interception enforced GET-only/off-origin protection but disables browser
HTTP cache. “Repeat” therefore measures connection/process/session reuse, not browser-cache benefit.
Observed public assets use `public,max-age=0,must-revalidate`; API reads use `private,no-store`.
Versioned static assets can be investigated separately; financial eligibility must remain fresh.
[Playwright routing behavior](https://playwright.dev/docs/api/class-browsercontext#browser-context-route).

[Raw timings/headers/request trace](artifacts/ui-ux-audit/performance/results.json) ·
[Live mobile capture](artifacts/ui-ux-audit/performance/screenshots/live-participant-mobile-cold.png) ·
[Prototype mobile organizer](artifacts/ui-ux-audit/performance/screenshots/preview-organizer-mobile-cold.png)

## Findings to address first

| Priority | Finding | Evidence / required outcome |
| --- | --- | --- |
| P1 | Event loading waits for slow serialized reads | Show a non-actionable, stable loading shell immediately. Primary owner should profile/bootstrap and detail RPC work; agree a lighter or shared pinned read contract. Do not cache a signing decision. |
| P1 | Main entry and receipt handoff remain workbench-shaped | Port the approved event commitment and durable copyable receipt patterns to the real routes. Name/email policy stays authoritative; a receipt does not imply admission. |
| P1 | Organizer view leads with imports and overlaps guest/inbox sections | Lead with the contract verification queue; keep guest decisions, door check-in, import and financial publishing as distinct tasks. Reuse existing batch/receipt dialogs. |
| P2 | Skip link leaves the selected event | `href="#main"` is interpreted by the app router as a new directory route. Bypass navigation while preserving event/view and intentional focus. |
| P2 | Collapsed settings fields trap forward Tab | Three Tab presses at the collapsed association summary remain there. Include only actually focusable visible controls in the modal order. Escape works; this is not total keyboard lockout. |
| P2 | Event/tab replacement loses focus; GET error has no explicit announcement | Restore scope-safe focus and announce a load failure once with a clear retry destination. |
| P2 | Mobile page jumps during loading | Reserve stable banner/context/content space; verify actual CLS after the change. Keep dynamic status and monetary facts honest. |
| P2 | Personal case/payment information is dispersed | Put the wallet's case, deadline and next action first; use separate progress for ordinary payout, held share, delivered ruling, settlement and actual payment. |
| P3 | Secondary targets and static packaging need refinement | Some secondary links/disclosures fall below the chosen44px target. Consider scoped lazy organizer imports and content-versioned assets only after measuring their benefit. |

Four keyboard/error findings were reproduced in a synthetic current-asset fixture. These are rendering
and focus tests, not live authorization or finance tests. Current recovery dialog containment/return,
roving tab keys and400px/200% text reflow held up in the bounded checks. A full screen-reader,
Safari/mobile-wallet and conformance audit remains unperformed.

## Best next screens

1. **Event commitment + deposit receipt.** Exact event/amount/network, one primary step, durable pending/
   verified/failed receipt, full transaction ID copy/fallback and safe configured return-to-registration.
2. **Organizer verification queue.** Contract depositors first, search/status, separate admission and
   check-in selection, existing complete server review, and exact-selected registration follow-up.
3. **Your case status.** Challenge → match → final result → settlement → payment, with the actual
   deadline and one appropriate action. Whole-event treasury data becomes secondary for participants.
4. **Your kickback activity.** Explain the current wait and show canonical attendance payments, top-ups,
   credit withdrawals, refunds and claims as separate records. “Finalized” alone never means paid.

Detailed acceptance checks and interface dependencies are in the journey report. Do not add a Luma
API requirement, infer identity from a wallet string, or combine the separate approval/check-in/
registration/attendance transactions to shorten the page.

## Verification and implementation handoff

Actually run for this audit:

- `node test/ui-performance-audit.mjs`:16 public browser load captures,276 observed GET requests,
 8 live API GETs, zero blocked mutations, wallet touches, WebSockets, page errors or page-load failures.
 No horizontal document overflow in the measured viewports. All requests remained on each page's
 origin; no account login or signing took place.
- `node test/ui-a11y-audit.mjs`:306 loopback GET requests, zero writes/external requests/page errors,
 six positive checks plus diagnostic observations and13 screenshots. Uses adapted older synthetic
 fixture data only; it is not a financial/authentication model or an assertion that all a11y tests pass.
- Two public asset GETs verified source hashes. Static fs/zlib inspection measured module/style sizes.
- Existing C role captures were visually reviewed as existing evidence, not rerun or called D proof.
- No root build/typecheck/full Node/contract/payment suite was rerun: application source is unchanged.

The reviewer skill's three layers are: **plan alignment—issues found** (focused prototype versus main
journeys); **system integrity—bounded review** (authority and financial isolation retained, backend
performance work must stay with its owner); **readiness—issues found** (latency, shifts and keyboard/
error handling). No optimization has yet been implemented or proven by this audit.

Recommended sequence: fix keyboard routing/focus/error behavior; measure and address the bootstrap/
detail bottleneck with the primary owner; stabilize loading layout; then build the commitment/receipt
and queue screens. Keep changes in an isolated implementation branch, validate exact event/account/
server/version scopes and pending journals, and compare the same lab captures after each relevant
change. Dynamic import or cancellation must never re-enable an unresolved write or replay a submitted
transaction. Preserve existing public A/B/C/D source-bound financial runs until their owner schedules
integration; this audit does not authorize replacing a served financial build.
