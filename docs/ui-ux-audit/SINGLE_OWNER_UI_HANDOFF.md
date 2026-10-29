# Single-owner governance UI checkpoint

29October2026. Branch codex/kleros-ui-ux-speed-audit, isolated worktree
/Users/hashmanansala/.codex/worktrees/kleros-ui-ux-speed-audit/Kleros projects.
Starting checkpoint56e0f02c53afaca72a58be035c1552070adb2389.

The revised source consumes the reviewed single-owner-timelock model. Historical initialOwner,
current upgrade owner, pending upgrade owner and event financial owner are distinct. Pending and
executing operation counts are typed nonnegative integers; positive counts do not blanket-freeze
financial reviews. The48-hour review delay is not a guaranteed withdrawal window. The UI adds no
upgrade/ownership administration action or signing path. Mainnet stays exact chain1, nativeETH,
hosted-production and verified v9 profile; legacy v7/v8/80015 remain explicitly dispatched.

Validation actually completed:64focused unit tests;8actual controller/journal browser groups;
production canonical single-owner regression21browser groups plus26offline checks. All production
captured frontend hashes match current source. No generic transaction-journal changes.
Production source appSHAef71380cb4a4f6f5e7b98a1919fba6bccb26cd44bfa3247a7fd2b1bb895d0982;
environmentSHA4dff09f788f17e32d6ffefba80ba283184d0ac6ade34cd5393ae1b75f2c38a95;
profileSHA00e44f8f22ddeeb88434de711914e08d4f743546885680559834bfd69340a881.
Evidence artifacts/production-ui/final-provenance.json and single-owner-governance-run.log.

The exact dormant Chiado v9 alias/mode was also added while that phase was authorized. It is now
HELD and UNRELEASED after the user switched the primary task to their own mainnet wallet.
An earlier synthetic E browser8-group pass used a preceding app hash, explicitly marked in
artifacts/v9-testnet-ui/scope-held.json; it is not a final current E release proof. No E backend,
contract or app deployment occurred here. The blank Netlify E site5570abe9-77ee-4f9d-8d7e-7c06f33a1ab4
was created and only its optional badge/HUD disabled; all existing sites, jobs and financial states
are untouched. The later management launch brief assigns all hosting to Core; no publish is pending
from this chat. Core alone owns reviewed mainnet wallet deployment and its concrete transaction plan.

The release verifier also tightened required observed environment/profile assets and passed86offline
guards. No public release verification was run. Preserve old A/B/C/D origins, operator files and jobs.

The next bounded UI task is the directly authorized compact Luma launch shell, recorded separately in
docs/LM_UI_HANDOFF.md once complete. Do not merge frozen project memory or this whole branch over
newer primary source; integrate reviewed public/test paths only.
