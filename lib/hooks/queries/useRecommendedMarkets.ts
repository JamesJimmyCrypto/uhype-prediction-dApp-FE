import { useQuery } from "@tanstack/react-query";
import {
  MarketOrderByInput,
  MarketStatus,
  ScoringRule,
} from "@zeitgeistpm/indexer";
import { WHITELISTED_TRUSTED_CREATORS } from "lib/constants/whitelisted-trusted-creators";
import { useMarketProgram } from "@/src/hooks";

export const recommendedMarketsRootKey = "recommended-markets";

export const useRecommendedMarkets = (marketId?: string, limit = 2) => {
  const { useGetMarketsQuery, useGetMarketQuery } = useMarketProgram();
  // const { data: market } = useGetMarketQuery(marketId);

  const { data: markets, isLoading, error } = useGetMarketsQuery();
  console.log("markets", markets, marketId);
  // Check if marketId and market exist before running the query
  const query = useQuery(
    [marketId],  // Using marketId as the query key
    async () => {
      // if (!market || !markets) {
      //   return {
      //     markets: [],
      //     type: "none",
      //   };
      // }

      const similarMarkets = markets || [];

      return {
        markets: similarMarkets,
      }

      // if (market?.title && similarMarkets.length > 0) {
      //   return {
      //     markets: similarMarkets
      //       .filter((m) => m.title !== market.title)
      //       .slice(0, limit),
      //     type: "similar" as const,
      //   };
      // } else {
      //   const popularMarkets = similarMarkets
      //   // Add your filtering logic here for popular markets
      //   return {
      //     markets: popularMarkets,
      //     type: "popular" as const,
      //   };
      // }
    },
    {
      enabled: !!marketId,  // Only run the query if market exists
      staleTime: Infinity,
    }
  );

  return query;
};
