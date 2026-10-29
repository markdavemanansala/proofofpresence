# Loading and keyboard fix review

29 October 2026 · isolated branch `codex/kleros-ui-ux-speed-audit` · base
`99ffe139193edc8f372f7527f7f94dc3f830ab46` plus the current uncommitted UI fixes.

This is a bounded source review and validator unit-test record. Final browser integration,
mobile layout/CLS measurements and release approval remain with the root audit. This document
does not claim the full change is ready to release or that loading speed improved in the field.

## Selected-event bootstrap result

Added only `test/selected-event.test.mjs` for this assignment. The portable
`public/selected-event.js` validator was reviewed read-only; the root owner made its fixes.

The 20 named tests cover:

- Valid v7, normal v8 and the exact test15m result shape; case-insensitive address comparisons.
- Older backends, missing/false/string-valued capability and absent selected result falling back
  to the existing event GET.
- Requested/selected/detail event, server instance, response actor and captured actor mismatches.
- Known anonymous scope (`hasCapturedSession: true`) rejecting an appearing actor, while an
  unknown first-load session can be established by one internally consistent response.
- Malformed server, selected and captured wallets; missing selected-wallet binding.
- Chain/contract mismatch, invalid chain values, and deployment block/version/ABI/policy/template
  mismatches or jointly absent bindings.
- Nonarray or malformed event lists and invalid detail structure returning fallback instead of
  accepting weak data or throwing on null list entries.
- Context-bound HTTP4xx/5xx errors without a public event summary, invalid/unbound errors, and an
  exclusive detail/error union. A private/missing event's bound error does not trigger another
  private-detail read.
- JSON comparisons before/after every fixture call and a recursively frozen fixture/captured
  context, checking that validation does not mutate either input.

The review identified malformed captured-wallet normalization, simultaneous detail/error,
missing binding fields, nonarray/null list entries and nonobject state as cases needing stronger
fallback behavior. The root owner corrected them. The extended run initially reproduced the
null-entry exception (19/20); the final independent rerun passed **20/20**, exit0, in72.14ms:

```text
node --test test/selected-event.test.mjs
```

The test file was formatted with the existing project Prettier binary. No dependency was
installed or changed. No backend, financial, schedule or signing test was modified or run by this
reviewer.

## GET loading and focus source review

No remaining blocker was found in the bounded source paths inspected:

- `public/app.js:1005`: same-route explicit Refresh requests coalesce with the active load.
  Superseding loads cancel UI GETs and retain generation checks. The finalizer changes busy/focus
  state only while `activeLoad === record`; an obsolete load cannot clear a newer load's busy flag.
- `public/app.js:982`: each UI GET has its own35-second deadline, linked to the current load's
  abort signal. Receipt reconciliation and submission/write paths are outside that GET controller;
  no automatic write retry was introduced.
- `public/app.js:717`: the same-hash navigation return now precedes inbox disposal. Clicking the
  active tab therefore does not dispose its controllers without a matching remount.
- `public/app.js:1178`: generation is checked before render. Navigation restoration eligibility
  and the latest silent-refresh focus selector are captured **before** replacing content. This
  prevents removed DOM from making an unrelated focus change appear to be an untouched BODY.
- `public/app.js:1025`: Refresh is restored only for the matching completed load, when its
  original trigger warrants restoration, focus is still on BODY and the main review dialog is
  closed. A still-focused live control is not displaced.
- `public/app.js:1200`: error focus eligibility is also captured before the error markup replaces
  content. Obsolete/aborted reads cannot replace the current view with their error.

The new `public/ui-keyboard.js` helper explicitly checks every closed `details` ancestor instead
of trusting layout rectangles. It retains the first visible summary subtree, excludes hidden/inert,
disabled and negative-tabindex controls, and wraps only dialog Tab boundaries/outside focus. It
leaves Escape and the existing initial heading focus/cancel behavior alone. `focusMain` provides
actual main focus for Skip while preserving modified/non-left link clicks. The helper's syntax check
passed earlier; actual native focus behavior belongs to browser verification.

## Evidence still required from root

Use the dedicated browser evidence for native Tab/Shift+Tab across closed/nested disclosures,
Skip-to-main, focus after delayed navigation/manual refresh, ignored-abort stale responses,
fallback/combined selected-event transport and same-tab organizer continuity. Confirm desktop,
mobile, enlarged text and layout-shift results separately. A pure validator pass does not establish
layout stability, network cancellation, wallet behavior or deployed performance.

This reviewer made no app/helper changes during this review, made no network/browser request,
and performed no hosting, schedule, wallet or financial operation.
