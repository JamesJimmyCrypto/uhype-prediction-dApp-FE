import { useQuery } from "@tanstack/react-query";
import { Context, isRpcSdk } from "@zeitgeistpm/sdk";
import { useSdkv2 } from "../useSdkv2";
import { marketsRootQuery } from "./useMarket";
import { useChainTime } from "lib/state/chaintime";
import { Market } from "src/types"
export const marketStageRootKey = "market-stage";

/**
 * Get the current stage of a market.
 *
 * @param market Market<Context>
 * @returns useQuery<MarketStage, unknown, MarketStage>
 */
export const useMarketStage = (market?: Market) => {
  const [sdk, id] = useSdkv2();

  const now = useChainTime();

  return useQuery(
    [id, marketsRootQuery, market?.publicKey.toString(), marketStageRootKey],
    async () => {

      return null;
    },
    {
      enabled: Boolean(sdk && isRpcSdk(sdk) && market && now),
      staleTime: 10_000,
    },
  );
};
