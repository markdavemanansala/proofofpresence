# Production UI readiness plan — source inventory

29 October 2026. Read-only inventory against isolated UI branch
`codex/kleros-ui-ux-speed-audit`, HEAD
`e6377816f21ab91ab57b0e3ce2f8260a4a2db1d4`. The earlier combined candidate
`8fd010c7dba27434e8e861178848529614121d09` remains the release checkpoint recorded
in the project brain. This document changes no application source or release.

The human authorized production readiness and thorough tests, and explicitly deferred
mainnet deployment. Core owns the production bootstrap, deployment verification,
authorization, wallet policy and arbitration selection. Their exact interface is pending;
the names below describe requirements, not an agreed API. Do not enable chain1 by
removing a guard before that interface is reviewed.

## Current source and minimum changes

| Area | Exact current locations | Required bounded change after core supplies its interface |
| --- | --- | --- |
| Environment classification | `public/app.js:539–543`, `568–652` | Add an explicit production predicate and explicit sandbox predicate from supported server mode/capabilities. Unknown or contradictory mode must not fall through to sandbox actions or grant production wallet access. Never infer production from chain1 alone. |
| Static loading shell | `public/index.html:47–54`, `76–89` | Keep neutral connecting/account placeholders. Replace the initial “How this demo works” label with neutral help while bootstrapping, then select the correct help text from validated mode. Preserve fixed loading/account geometry and keyboard behavior. |
| Production identity path | `public/app.js:797–840`, `879–886`, `914–983`, `1421`, `1606–1609`, `1801` | Use the wallet path for verified production mode, with standard Ethereum account requirement and accurate ETH/network copy. Demo identities, Alice/Bob role instructions and demo funding must stay exclusive to explicit sandbox modes. Production authentication remains the server's nonce flow. |
| Existing mainnet block | `public/app.js:914–922` | Currently rejects `expectedChain === 1` before auth. Replace this only with the agreed explicit production/trust gate; maintain rejection when chain, deployment or server capability is unverified. A chain ID is not sufficient evidence. |
| Chain switching | `public/app.js:924–957` | Use approved bootstrap chain metadata; no local-chain name/native-currency fallbacks in production. Test both ordinary switching and a wallet's unknown-chain response without making a real wallet request. Core must define approved RPC/explorer metadata and whether adding mainnet is appropriate. |
| Demo creation | `public/app.js:1250`, `2295–2311`, `2506–2508`, `2765–2777` | “Create local event” and the `/api/events` demonstration deployment form require explicit sandbox capability in display and handlers. Production event deployment is outside this UI change. The existing handler's `mode === "demo"` check is not a production feature contract. |
| Faucet and clock | `public/app.js:2060–2064`, `2492–2499`, `2553–2561` | Current display/handlers exclude only testnet. Require explicit sandbox allowlisting for `/api/demo/fund` and `/api/demo/advance`; hide and reject them in production and unknown modes. |
| Mock arbitration | `public/app.js:2033`, `2575–2600` | Mock-control display uses `owner && !isTestnet()`; mock ruling/appeal handlers also reject only testnet. Require explicit sandbox capability. Real provider display must use core's reviewed arbitration metadata, not the absence of `controlled`. |
| Legacy advanced tools | `public/app.js:1423` | v7 guest/console links currently appear for v7 plus `!isTestnet()`. Keep historical v7 compatibility intact, but do not expose these routes in production unless core separately confirms their production authentication, deployment scope and compatibility. There is no separate admin link in the inspected root HTML/app. |
| Monetary presentation | `public/app.js:546–547`, `1253`, `1422`, `1536–1593`, `1912–1934`, `2103` | Currency symbol already comes from bootstrap; production must require reviewed native ETH metadata rather than use a silent fallback as trust. Keep integer wei and all independent monetary states. Change non1337 “Confirm testnet transaction” to mode-accurate wording. |
| Arbitration presentation | `public/app.js:542–543`, `623–625`, `1515`, `2007–2028`, `2341–2348` | Controlled test-arbitrator notices must remain for D/Chiado. Production provider label, notice, resolver/arbitrator identities and any verified external case link must come from core metadata. Do not hardcode an official Court/proxy address or claim independent jury arbitration from a boolean default. |
| Recovery review | `public/app.js:2043`, `2067–2105`, `2122–2229` | Keep fresh server simulation/review and the separate confirm step. “Simulated” refers to preflight, not a simulated payment. Verified production sessions must use wallet submission only; the demo `/drafts/:id/execute` fallback must be inaccessible in production even if a malformed session says `mode: "demo"`. |
| Guided help | `public/app.js:643–652`, `1254`, `2341–2348` | Add concise production help using approved metadata: ETH transactions, host approval versus registration, attendance versus settlement, and account support. Do not reuse test-token or mock-Court instructions. No new navigation/redesign is required. |

These are readiness gaps in a currently demo/testnet-only interface, not evidence of a
deployed production vulnerability. No production mode is currently enabled here.

## Exact interface decisions required from core

1. **Explicit environment and capability contract.** Supported production mode enum;
   permitted chain(s); meaning and location of verified deployment/trust status;
   public read versus wallet-auth versus financial-review capabilities; unknown-mode
   behavior. `isProduction` and `isSandbox` should consume this reviewed contract.
   Current `contractInbox`, `batchActions` and `selectedEventBootstrap` capabilities
   remain separate features (`public/app.js:179`, `438`; `public/selected-event.js:72`).
2. **Verified deployment context.** Chain1 plus exact contract, supported ABI/version,
   deployment block, policy/template bindings and arbitration metadata must agree
   across summary/detail/review. Decide how the server reports verification failure
   and whether public event data can still be browsed. The UI must withhold wallet
   financial review when production context is unverified or contradictory. Existing
   optional bundle binding is useful but is not a production trust verifier
   (`public/selected-event.js:106–145`); its serial fallback must not bypass the new
   production gate.
3. **EOA-only account support.** Initial supported flow is a standard Ethereum EOA.
   Contract wallets, EIP1271 and EIP7702 delegated accounts are unsupported until
   separately tested because refund/reward delivery has real send constraints.
   Core freshly enforces this; exact support capability/notice/reason fields and
   pre-review error codes are TBD. The UI should state the requirement before review
   and show the authoritative unsupported-wallet reason. Do not implement duplicate
   browser RPC wallet classification or claim Safe support. Clarify whether unsupported
   wallets may authenticate for read-only use or must be rejected at auth.
4. **Native asset and arbitration metadata.** Authoritative Ethereum/ETH/18-decimal
   labels, public explorer links if supported, actual selected provider name/mode,
   addresses, deployment verification status and concise provider notice. Historic
   compatible proxy versus official default selection belongs to the primary session.
   Escaping and URL restrictions remain mandatory for external labels/links.
5. **Production journals and restart recovery.** `public/batch-pending.js:23` currently
   admits only1337/10200. Do not remove this allowlist broadly. Core must explicitly
   authorize supported production profiles and define durable receipt/reconciliation
   semantics across server restarts. Its identity intentionally includes instance only
   for1337 (`public/batch-pending.js:36–47`). The financial journal already accepts
   positive chain IDs and includes mode/instance/event/contract/wallet/ABI in its
   namespace (`public/transaction-context.js:41–66`); confirm production instance
   stability/recovery behavior without migrating or clearing existing journals.
6. **Backend mutation safeguards.** Confirm production disables demo impersonation,
   faucet, time travel, mock adjudication, demonstration event deployment and server
   demo-signer execution independently of hidden UI. Existing draft validation and
   canonical receipt verification remain server authority. No cache, payment rule,
   policy, contract or authorization redesign belongs in this UI change.

## Preserve existing behavior

- Preserve exact v7/v8 dispatch and all immutable snapshots. Do not accept a version
  prefix as compatibility. `public/contract-profiles.js:1–12` is an interface list,
  not deployment verification.
- Keep `kleros-event-v8-test15m`, VERSION80015, 900-second windows strictly Chiado10200
  with its exact ABI/profile checks (`public/contract-profiles.js:14–49`) and visible
  TEST ONLY notices (`public/app.js:562–566`, `623`). It must remain unsupported on1.
- Preserve D and A/B/C source, schedules, once-only journals and financial drafts;
  do not change current deployments or release candidate while preparing this patch.
- Preserve independent deposit receipt, host approval, registration, trusted check-in,
  posted attendance, unused credit, held shares, owed delivery, ordinary payments and
  settled challenge states. A final ruling is not settlement; a held or owed amount
  is not a delivered attendance payment. Preserve ruling0 economics.
- Preserve GET-only cancellation, load generation/actor/instance binding, private DOM
  disposal and timeout behavior. Production gating must apply to bundled and serial
  loads, fresh review and submission; it must not convert reads into automatic writes.
- Keep existing local/hosted sandbox behavior and Chiado wallet behavior unchanged.
  No contact fixtures, role switcher or simulated transactions enter production.

## Bounded implementation sequence

1. Freeze the exact core bootstrap/mode/trust/account-support contract and fixtures.
   Parent reviews the field names and semantics before implementation.
2. Add a small environment/context validator or centralized predicates, then patch
   only the existing render/handler gates above. Apply wallet support denial before
   opening a financial review and again through authoritative fresh validation.
3. Make minimal metadata-driven copy changes in the current layouts. No redesign,
   cosmetic expansion, backend financial policy or production deployment controls.
4. Coordinate only the explicit production batch-journal profile support that core
   authorizes. Keep unresolved records locked until validated reconciliation; do not
   retry a wallet or batch commit on reload, mode change, error or timeout.
5. Parent runs the focused tests below and existing release checks, then hands the
   reviewed patch to primary. Deployment remains a separately authorized operation.

## Required tests once the interface is fixed

| Check | Evidence needed; use local/synthetic transports only |
| --- | --- |
| Mode matrix | local-demo, hosted-demo, testnet, hosted-testnet, explicit production, missing/unknown/conflicting mode. Only sandbox exposes identities/faucet/clock/mock/local deploy. Trigger handlers directly as well as inspect visibility. Unknown mode cannot connect or sign. |
| Production trust | chain1 alone, missing/false verification, wrong chain/contract/version/ABI/policy/template/deployment block, expired/missing capability, test15m on1: no financial review/wallet send. Valid approved production fixture uses wallet-only flow. |
| Account support | Supported EOA; server-rejected contract/EIP1271/EIP7702; missing/unknown support metadata; support changes between read, draft and validate. No unsupported wallet prompt/send and accurate accessible reason. No client RPC policy clone. |
| Metadata/copy | Production ETH and actual provider labels everywhere, full wallet/network/event/recipient/value/wei/policy in review; no local/testnet/mock claims. Controlled Chiado still explicitly says no independent jury. Malicious labels/URLs remain escaped/restricted. |
| Scope/privacy | Event, wallet, network, deployment, mode and instance changes during slow load/draft/validate; logout, role loss, old cookie and late responses. Bound-bundle rejection and legacy serial fallback cannot bypass production trust or expose another actor's contacts. |
| Journals | Separate local/Chiado/production scopes, storage unavailable, unresolved wallet request, known hash, ambiguous batch commit, restart/new instance per core contract, wrong receipt scope. One send per explicit action; no replay, auto-sign or automatic commit retry. |
| Participant/organizer states | Free route, deposit unconfirmed/confirmed, pending credit, admitted commitment, host approval separate, trusted check-in separate, not-yet-posted attendance, challenge unmatched/matched/unruled/final-unsettled/settled, ordinary payments with protected held share, owed versus actual delivery, recovery limits and ruling0. Reuse approved v7/v8 fixtures, not invented mainnet behavior. |
| Browser/accessibility | Desktop/mobile and keyboard modal/skip/focus behavior with production notices and unsupported-account error; readable exact amounts and IDs at200%; loading CLS/skeleton and refresh singleflight remain covered. |

After code changes, run root build/typecheck and the relevant actual local-chain,
validator, wallet-context/journal and browser regressions. Attribute results to the
commands and exact source tested. None were run for this read-only plan. No live API,
RPC, browser wallet, signing, mainnet transaction, deployment, hosting change or
schedule change was performed.
