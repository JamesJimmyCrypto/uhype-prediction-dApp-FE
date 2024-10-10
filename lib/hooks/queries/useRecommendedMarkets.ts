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
  const { data: market } = useGetMarketQuery(marketId?.toString());

  const { data: markets, isLoading, error } = useGetMarketsQuery();

  const query = useQuery(
    [recommendedMarketsRootKey, market?.publicKey.toString()],
    async () => {
      const similarMarkets = markets || [];

      if (market?.title && similarMarkets.length > 0) {
        return {
          markets: similarMarkets
            .filter((m) => m.title !== market.title)
            .slice(0, limit),
          type: "similar" as const,
        };
      } else {
        const popularMarkets = similarMarkets

        /// => popular mentric
        //   m.status === MarketStatus.Active &&
        // m.marketId !== marketId &&
        // m.volume > 0 &&
        // m.scoringRule !== ScoringRule.Parimutuel &&
        // m.disputeMechanism !== null &&
        // WHITELISTED_TRUSTED_CREATORS.includes(m.creator)
        return {
          markets: popularMarkets,
          type: "popular" as const,
        };
      }
    },
    {
      enabled: Boolean(market),
      staleTime: Infinity,
    },
  );

  return query;
};