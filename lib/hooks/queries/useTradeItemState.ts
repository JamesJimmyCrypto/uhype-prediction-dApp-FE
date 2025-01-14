import { useQuery } from "@tanstack/react-query";
import {
  getAssetWeight,
  getIndexOf,
  getMarketIdOf,
  parseAssetId,
} from "@zeitgeistpm/sdk";
import Decimal from "decimal.js";
import { MAX_IN_OUT_RATIO, ZTG } from "lib/constants";
import { calcSpotPrice } from "lib/math";
import { useWallet } from "@solana/wallet-adapter-react";
import { TradeItem } from "../trade";
import { useSdkv2 } from "../useSdkv2";
import { useAccountAssetBalances } from "./useAccountAssetBalances";
import { useBalance } from "./useBalance";
import { useMarket } from "./useMarket";
import { usePoolAccountIds } from "./usePoolAccountIds";
import { usePoolBaseBalance } from "./usePoolBaseBalance";
import { usePoolsByIds } from "./usePoolsByIds";

export const tradeItemStateRootQueryKey = "trade-item-state";

export const useTradeItemState = (item: TradeItem) => {
  const [sdk, id] = useSdkv2();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  const slippage = 1;

  const marketId = getMarketIdOf(item.assetId);
  const { data: pools } = usePoolsByIds([{ marketId: marketId }]);
  // const { data: market } = useMarket({ marketId });

  const pool = pools?.[0];
  const baseAsset = pool?.baseAsset
    ? parseAssetId(pool.baseAsset).unwrap()
    : undefined;

  const { data: traderBaseBalance } = useBalance(pubKey, baseAsset);

  const { data: poolBaseBalance } = usePoolBaseBalance(pool?.poolId);

  const traderAssets = useAccountAssetBalances([
    { account: pubKey, assetId: item.assetId },
  ]);
  const traderAssetBalance = new Decimal(0);

  const poolAccountIds = usePoolAccountIds(pools ?? []);
  const poolAccountId = pool?.poolId ? poolAccountIds[pool.poolId] : undefined;

  const poolAssetBalances = useAccountAssetBalances([
    { account: poolAccountId, assetId: item.assetId },
  ]);

  const poolAssetBalance = new Decimal(0);

  const balances = {
    poolBaseBalance: "1",
    poolAssetBalance: "1",
    traderBaseBalance: "1",
    traderAssetBalance: "1",
  };

  const enabled =
    !!sdk &&
    !!item &&
    !!pool &&
    !!poolBaseBalance &&
    !!poolAssetBalance &&
    !!baseAsset

  const query = useQuery(
    [
      id,
      tradeItemStateRootQueryKey,
      poolAccountId,
      publicKey,
      balances,
      item.action,
      JSON.stringify(item.assetId),
    ],
    () => {
      if (!enabled) return;
      const baseWeight = getAssetWeight(pool, baseAsset).unwrap();
      const assetWeight = getAssetWeight(pool, item.assetId).unwrap();
      const assetIndex = getIndexOf(item.assetId);
      // const asset = market.categories?.[assetIndex];
      const swapFee = new Decimal(
        pool.swapFee === "" ? "0" : pool.swapFee ?? "0",
      ).div(ZTG);
      const tradeablePoolAssetBalance = poolAssetBalance.mul(MAX_IN_OUT_RATIO);

      if (!baseWeight || !assetWeight) return;

      const spotPrice = calcSpotPrice(
        poolBaseBalance,
        baseWeight,
        poolAssetBalance,
        assetWeight,
        0,
      );

      return {
        pool,
        spotPrice,
        baseAssetId: baseAsset,
        poolAccountId,
        poolBaseBalance,
        poolAssetBalance,
        assetId: item.assetId,
        tradeablePoolAssetBalance,
        traderBaseBalance,
        traderAssetBalance,
        baseWeight,
        assetWeight,
        swapFee,
        slippage,
      };
    },
    {
      enabled: enabled,
      keepPreviousData: true,
    },
  );

  return query;
};
