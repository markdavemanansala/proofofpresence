import {
  PRODUCTION_UI_CONTRACT,
  FIXTURE_OWNER,
  makeProductionFixture,
  invalidProductionFixture,
  recoveryOnlyProductionFixture,
} from "./production-ui-fixture.mjs";

// TEST ONLY: synthetic UI projections, not a deployed ABI, policy or financial test.
export const V9_TESTNET_EVENT_ID = "v9-chiado-synthetic-event";
export const V9_TESTNET_MODE = "hosted-v9-testnet";
export const V9_TESTNET_PROFILE = "kleros-event-v9-uups-chiado";
const core = structuredClone(PRODUCTION_UI_CONTRACT);
core.modes = [V9_TESTNET_MODE];
core.profile.contractVersion = V9_TESTNET_PROFILE;
core.profile.abiVersion = V9_TESTNET_PROFILE;
Object.assign(core.profile.contractProfile, {
  contractVersion: V9_TESTNET_PROFILE,
  abiVersion: V9_TESTNET_PROFILE,
  chainId: 10200,
  testOnly: true,
});
Object.assign(core.capabilities, { production: false, v9Testnet: true });
Object.assign(core.bootstrapContext, {
  environment: { production: false, network: "chiado", chainId: 10200 },
  chain: {
    chainId: 10200,
    name: "Chiado",
    rpcUrl: "https://rpc.v9-fixture.invalid",
    nativeCurrency: { name: "Chiado xDAI", symbol: "XDAI", decimals: 18 },
  },
  arbitration: {
    mode: "controlled",
    verified: true,
    resolver: "0x" + "c".repeat(40),
    arbitrator: "0x" + "d".repeat(40),
    label: "Controlled Chiado arbitration",
    notice: "Synthetic Chiado test. No independent Kleros jury.",
  },
  // Canonical DTO intentionally has no optional presentation label or notice.
  governance: {
    kind: "single-owner-timelock",
    initialOwner: FIXTURE_OWNER,
    minimumDelaySeconds: 172800,
  },
});
Object.assign(core.eventContext, {
  id: V9_TESTNET_EVENT_ID,
  slug: "v9-chiado-fixture",
  title: "Chiado V9 synthetic event",
  chainId: 10200,
  resolver: core.bootstrapContext.arbitration.resolver,
  arbitrator: core.bootstrapContext.arbitration.arbitrator,
});
export const V9_TESTNET_UI_CONTRACT = Object.freeze(core);
export function makeV9TestnetFixture(
  scenario = "before-deposit",
  options = {},
) {
  return makeProductionFixture(scenario, { core, ...options });
}
export { invalidProductionFixture as invalidV9TestnetFixture };
export { recoveryOnlyProductionFixture as recoveryOnlyV9TestnetFixture };
export const V9_TESTNET_INVALID = [
  { name: "legacy-mode", bootstrap: { mode: "hosted-testnet" } },
  { name: "wrong-production-mode", bootstrap: { mode: "hosted-production" } },
  {
    name: "wrong-chain",
    bootstrap: { chain: { chainId: 1 } },
    event: { chainId: 1 },
  },
  { name: "wrong-abi", event: { abiVersion: "kleros-event-v9-uups" } },
  { name: "wrong-profile", event: { contractProfile: { testOnly: false } } },
  {
    name: "wrong-governance-kind",
    bootstrap: { governance: { kind: "multisig" } },
  },
  { name: "missing-owner", detail: { upgrade: { owner: null } } },
  {
    name: "invalid-pending-owner",
    detail: { upgrade: { pendingOwner: "not-an-address" } },
  },
  {
    name: "negative-operation-count",
    detail: { upgrade: { pendingOperationCount: -1 } },
  },
  { name: "short-governance-delay", detail: { upgrade: { delaySeconds: 1 } } },
  {
    name: "transactions-unready",
    bootstrap: { capabilities: { transactionsReady: false } },
  },
  {
    name: "wrong-arbitration-mode",
    bootstrap: { arbitration: { mode: "kleros-v1" } },
  },
];
