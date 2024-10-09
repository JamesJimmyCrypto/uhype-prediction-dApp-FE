import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IndexerContext, isIndexedSdk } from "@zeitgeistpm/sdk";
import { FullCmsMarketMetadata } from "lib/cms/markets";
import { useFavoriteMarketsStorage } from "lib/state/favorites";
import { MarketOutcomes } from "lib/types/markets";
import { useSdkv2 } from "../useSdkv2";
import { marketCmsDatakeyForMarket } from "./cms/useMarketCmsMetadata";
import { Market } from "src/types";
import { FullMarketFragment } from "@/components/markets/market-card";

export const rootKey = "markets-favorites";


export const useFavoriteMarkets = () => {
  const [sdk, id] = useSdkv2();
  const queryClient = useQueryClient();
  const storage = useFavoriteMarketsStorage();

  const query = useQuery({
    queryKey: [
      id,
      rootKey,
      ...storage.favorites.map((favorite) => favorite.marketId),
    ],
    queryFn: async () => {
      return [] as Market[];
    },
    keepPreviousData: true,
    enabled: isIndexedSdk(sdk) && Boolean(sdk),
  });

  return query;
};
