import Decimal from "decimal.js";
import { CurrencyBalance } from "lib/hooks/queries/useCurrencyBalances";
import { ZTG } from ".";
import { calculateFreeBalance } from "lib/util/calc-free-balance";
import { Cluster } from "@solana/web3.js";

export type ChainName = "Solana";

export type SolanaChain = {
  name: ChainName;
  network: Cluster;
};
export const SOLANA_CHAINS: SolanaChain[] = [
  {
    name: "Solana",
    network: "mainnet-beta",
  },
];


const PROD_CHAINS = [
  {
    name: "Solana",
    isRelayChain: true,
    withdrawFee: "0.0422 SOL", // informed from testing
    depositFee: new Decimal(0.064).mul(ZTG), // informed from testing
    endpoints: [
      "wss://rpc.polkadot.io",
    ],
    fetchCurrencies: async (api, address) => {
      const { data } = await api.query.system.account(address);
      const free = calculateFreeBalance(
        data.free.toString(),
        //@ts-ignore once polkadot is upgraded to match rococo the latter half of this statement can be removed
        data.miscFrozen?.toString() ?? data.frozen?.toString(),
        data.feeFrozen?.toString() ?? "0",
      );

      return [
        {
          symbol: "SOL",
          balance: free,
          chain: "Solana",
          foreignAssetId: 0,
          sourceChain: "Solana",
          existentialDeposit: new Decimal(
            api.consts.balances.existentialDeposit.toString(),
          ),
          decimals: 10,
        },
      ];
    },
    createDepositExtrinsic: (api, address, amount, parachainId) => {
      const accountId = api.createType("AccountId32", address).toHex();

      const destination = {
        parents: 0,
        interior: { X1: { Parachain: parachainId } },
      };
      const account = {
        parents: 0,
        interior: { X1: { AccountId32: { id: accountId } } },
      };
      const asset = [
        {
          id: { Concrete: { parents: 0, interior: "Here" } },
          fun: { Fungible: amount },
        },
      ];

      const tx = api.tx.xcmPallet.reserveTransferAssets(
        { V3: destination },
        { V3: account },
        { V3: asset },
        0,
      );

      return tx;
    },
  },
];

export const CHAINS =
  PROD_CHAINS


export const CHAIN_IMAGES: Record<ChainName, string> = {
  Solana: "/solana.png",
};