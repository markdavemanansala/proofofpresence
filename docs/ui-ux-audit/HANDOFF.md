# UI audit handoff

Branch `codex/kleros-ui-ux-speed-audit`; worktree
`/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects`.
Starting source3332f67abd1e8364891feba7b250c1ec87e257bc.

Read `UI_UX_AUDIT.md` first, then the three focused reports. Raw captures and reproducible audit
scripts are included. The live frontend matchesf4643f8; the design preview matches the earlier
1b0ea0e static bundle. Source and live evidence are not conflated.

This branch contains reports and audit harnesses only. No application, backend, contract, policy,
registry, auth, dependency, deployment or automation configuration was changed. The primary session
retains integration and all financial signing. Do not merge snapshot project-memory or other
historical files over newer primary work; only the new audit paths and a short audit-pointer note in PROJECT_BRAIN differ from the starting
commit. Do not replace the primary current brain with this frozen copy.

Root perf command: `node test/ui-performance-audit.mjs`. It requires installed project Playwright
and its Chromium, uses bounded public GET-only requests and fresh browser contexts, and cannot sign.
A11y command: `node test/ui-a11y-audit.mjs`. It uses the included byte-pinned
`test/fixtures/ui-audit-synthetic.js` derived from the old public preview; see the report for its fixture adaptation
and limits. No real app server or chain is started by either script.

Inspect `git diff 3332f67abd1e8364891feba7b250c1ec87e257bc HEAD --stat` and the actual diff.
Keep review findings separate from implementation acceptance. Any later UI fix needs targeted
regressions and equivalent before/after captures; API/canonical-state optimizations require the
primary owner's interface review. Do not deploy these report harnesses as app assets.
