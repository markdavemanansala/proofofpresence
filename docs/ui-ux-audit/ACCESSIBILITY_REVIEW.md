# Accessibility and mobile review

Audit-only review of `3332f67abd1e8364891feba7b250c1ec87e257bc`, branch
`codex/kleros-ui-ux-speed-audit`, worktree
`/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects`.
Application source, backend, deployments, wallets and financial state were not changed.

The most useful fixes are the skip-link/router conflict and the event-settings dialog's forward-Tab
trap. The checked screens have useful labels, visible focus, native dialogs and readable mobile
reflow, but these strengths do not establish WCAG conformance.

## Evidence and boundaries

Read `PROJECT_BRAIN.md`, `ui-registry.md`, `docs/SIMPLE_UX.md`, current shell/app/styles and reusable
inbox/batch components. Reviewed existing test sources and stored integration results. No historical
operator identity or account was used as current authorization.

New command actually run, final exit status **0**:

```sh
node test/ui-a11y-audit.mjs > artifacts/ui-ux-audit/a11y/audit.log 2>&1
```

The optional harness serves **current frozen `public/` assets** through a standalone loopback static
server. Its GET responses adapt only the already-public synthetic fixture originally at
`/private/tmp/kleros-ui-redesign/dist/preview/fixtures.js`, now byte-pinned in
`test/fixtures/ui-audit-synthetic.js` for reproduction. The fixture is older v7 data presented with
synthetic v8/Chiado labels and a synthetic role; it is solely rendering evidence, not a validated
v8 financial projection, authentication test, permission test or deployed-app snapshot. Inbox/batch
capabilities are disabled in this fixture. No application server, chain, RPC, provider, private key,
authentication call, browser extension or live API was used. Every non-GET request is rejected.

Final run: **306 loopback GET requests; 0 non-GET requests, 0 external requests and 0 uncaught page
errors**. Six explicit positive checks plus recorded diagnostic observations; this is an audit capture,
not a claim that all accessibility tests passed. Early harness attempts were corrected for the real
skip-link navigation and Chromium's native-select key behavior before the final complete run.

Evidence:

- `artifacts/ui-ux-audit/a11y/results.json`: route/focus traces, dimensions, asset and fixture SHA256,
  request log, checks and observations.
- `artifacts/ui-ux-audit/a11y/audit.log`: final completion.
- PNGs in the same directory: desktop/mobile participant, organizer and cases, recovery, settings,
  loading, error and enlarged text.
- `test/ui-a11y-audit.mjs`: reproducible optional harness; it intentionally does not fix the app.

## Concrete findings

### A11Y-1 · P2 · Skip to content leaves the selected event

**Observed:** From `/#event=event-b&view=participant`, the first Tab reaches “Skip to content”. Enter
initially focuses `#main`, then changes the hash to `#main`. The global hash handler reloads the
application, `readRoute()` finds no `event`, and the directory replaces the event. Recorded result:
`eventSwitchCount: 0`, h1 “Events, with commitment.”

**Reproduce:** Open any event, focus the skip link, press Enter and wait for the normal route load.
Expected bypass: keep the event/view and move focus to main. Actual: leave the event.

**Source:** `public/index.html:33`; `public/app.js:722`–729 and 2687–2690.
**Proof:** `results.json` → `first-tab`, `skip-after-render`; `skip-after-render.png`.

**Recommended acceptance:** Bypass navigation without changing the app's event/view route; focus
remains on main after async work settles. Test the final route and content as well as initial focus.

### A11Y-2 · P2 · Forward Tab stalls at collapsed settings fields

**Observed:** With the synthetic Event B owner, open “Disputes & kickbacks” → “Edit event settings”.
Leave “Optional content & Luma associations” collapsed. Focus its summary and press Tab three times.
All three recorded active elements remain that same summary; the disclosure remains closed. Forward
Tab does not reach Cancel/Save. Escape still closes the dialog, and opening the disclosure offers a
workaround; this is not a total keyboard lockout.

**Cause supported by source:** The explicit trap includes hidden descendant inputs based solely on
`getClientRects().length`. In this Chromium run they have rects while their parent details is closed,
but focusing the hidden input does not move focus. The handler has already prevented the native Tab.

**Source:** `public/app.js:2169`, 2633–2646.
**Proof:** `results.json` → `closed-settings-details-tab`; `settings-closed-details-tab.png`.

**Recommended acceptance:** With the disclosure closed, forward Tab moves from its summary to the
next visible control and wraps normally. With it open, all four association fields join the order.
Check Shift+Tab and Escape too. Preserve modal containment without including unfocusable descendants.

### A11Y-3 · P2 · Content replacement loses event/navigation focus

**Observed:** Clicking an inactive event tab replaces its focused button and leaves the active element
at BODY. Separately, focusing “Your event” and selecting the other event also ends at BODY after the
route load. The focus record includes `#event=event-a&view=participant`. The next sequential keyboard
step therefore resumes from the page rather than the equivalent new control or a deliberate heading.

**Reproduce:** Focus the event selector, change event, and inspect focus after the response. Also click
“Manage event”, then press Tab. The audit uses Playwright's native-select change operation for the
selector; it does not claim an OS-specific dropdown keystroke test. Roving Arrow/Home/End tab
activation **did retain selected-tab focus** in the same audit.

**Source:** `public/app.js:954`, 1063–1073, 2198–2201, 2687–2690. Stable focus restoration currently
runs for `app.focusTab` or silent loads, while ordinary hash navigation rebuilds the focused elements.
**Proof:** `results.json` → `click-tab-focus`, `keyboard-event-switch-focus`.

**Recommended acceptance:** Restore intentional focus after event changes and inactive-tab activation
without resurrecting a stale event's controls. Keep the existing Arrow/Home/End behavior.

### A11Y-4 · P2 · GET failure lacks an explicit error announcement

**Observed:** After a synthetic 503 on “Refresh”, the error screen provides a useful visible heading,
plain message, “Try again” and “All events”. Focus remains on the header Refresh button. The injected
`.error-panel` has no alert/status role, its parent `#content` has no live-region attribute, and neither
heading nor retry receives focus. A nonvisual user has no explicit DOM announcement of the new error
beyond whatever their assistive technology independently detects. This audit did not run a screen
reader and does not assert a particular spoken result.

**Source:** `public/app.js:1077`–1083; compare the loading live status in `public/index.html:82` and the
reusable inbox's alert/status pattern in `public/contract-inbox.js:390`.
**Proof:** `results.json` → `load-error`; `load-error.png`.

**Recommended acceptance:** Announce the load failure once and make recovery easy to locate while
preserving a coherent focus policy. Test initial load and refresh failures, not just visual rendering.

### A11Y-5 · P3 · Several secondary targets miss the project's chosen 44px size

At 400×800, the closed “About the event & materials” summary measures about **25.6px high** and the
mobile home logo **30px high**. The source-import CSV links measure about **17px high**. In contrast,
checked primary buttons, selectors and the main recovery dialog's controls meet the chosen height.
The provenance checkbox's 20px native square is **not** reported as a target failure: its surrounding
clickable label has a 44px minimum and a much larger text area.

**Source:** `public/styles.css:2456`–2461 (story summary has no 44px geometry); `public/styles.css:2223`
(onward mobile logo rule); `public/app.js:1645` (CSV text links).
**Proof:** `results.json` → `mobile-participant`, `mobile-organizer`, control dimensions.

**Recommended acceptance:** Extend the existing target pattern to useful secondary actions where
practical. This is a project-pattern discrepancy, **not a blanket WCAG AA failure**: 44px is the
chosen interface standard and some inline links may have target-size exceptions.

## What held up in this bounded audit

- Initial skip-link focus is visible; `main` has a focus destination. The route failure is above.
- Event tabs have labels, tab roles, selected state, relationships and roving keyboard behavior.
  Home/End activation preserved focus in the new capture; existing redesign tests also cover arrows.
- The main recovery form has explicit destination/amount labels, native required/pattern constraints,
  a named dialog title, initial title focus, Tab/Shift+Tab containment and Escape dismissal. It restores
  its original “Withdraw credit” trigger. No recovery form was submitted.
- Native details disclosures expose optional technical content; independent source/status labels and
  full wrapping identifiers remain in source. The settings traversal exception is above.
- Desktop 1440×900 and mobile 400×800 participant/organizer/cases pages had no document/body horizontal
  overflow. The recovery form was visually inspected at 400×800.
- Cases were captured at 400px with each computed font size doubled, without compounding inherited
  font values. Document/body remained400px wide. The source uses fixed pixel type, so changing only
  the root font size would not exercise equivalent text enlargement. The sticky notice occupied about
  207px of800px; it increases scrolling but did not establish an overlap or inaccessible control here.
- The checked styles define a visible 3px focus indicator and a reduced-motion override. The loading
  message uses `role=status` and `aria-live=polite`; errors need the separate handling above.

## Existing evidence reused, not rerun

`test/ui-redesign.e2e.mjs` covers native dialog containment/return, event tab keys, focus outline,
400px reflow and doubled text. Its 44px selector only checks primary `.button` controls/selectors/
non-checkbox fields, which explains why it does not catch A11Y-5. `test/simple-ui.e2e.mjs` covers
simplified presentation, mobile bounds and a non-mutating testnet presentation fixture.

Stored `artifacts/screenshots/contract-inbox-app/results.json` records 26 isolated v8 HTTP/indexer UI
checks, including mobile bounds and securely focused linked-guest navigation. Stored
`artifacts/screenshots/batch-actions-app/results.json` records 28 isolated integration checks including
mobile bounds and durable recovery. Separate prior portable-component evidence at
`/private/tmp/kleros-ui-redesign/artifacts/screenshots/contract-inbox/results.json` and
`.../batch-actions/results.json` records 66 and 48 checks respectively; these are earlier implementation
runs, not fresh audit results or proof that every current integration state is accessible.

## Limits and review scope

No axe package was installed and no screen-reader, Safari, Firefox, iOS, Android, forced-colors,
voice-control or browser-extension wallet accessibility run was performed. DOM label/target heuristics
are diagnostic, not the accessibility tree or a WCAG certification. Text enlargement was 200% computed
font sizing, not browser zoom; 320px reflow and full financial-review dialogs were not newly exercised.
The synthetic cases screen used an empty Event B case list; active-case forms rely on source review and
existing test evidence. Loading/error observations use artificial delay/503 and do not measure live
latency. No form save, nonce login, transaction draft, signing, receipt reconciliation, batch mutation,
financial action, deployment or live service request occurred. Contrast and complete accessible-name
coverage require a separate systematic pass; neither is claimed from these screenshots.
