import { Market } from "@/src/types";
import MarketCard from "components/markets/market-card";
import { useMarketsStats } from "lib/hooks/queries/useMarketsStats";
import { useRecommendedMarkets } from "lib/hooks/queries/useRecommendedMarkets";

export const SimilarMarketsSection = ({
  market,
  limit,
}: {
  market?: Market;
  limit?: number;
}) => {
  const { data: recommendedMarkets, isFetched: isMarketsFetched } =
    useRecommendedMarkets(market?.marketKey.toNumber(), limit ?? 2);

  const { data: stats, isFetched: isStatsFetched } = useMarketsStats(
    recommendedMarkets?.markets?.map((m) => m.marketKey.toNumber()) ?? [],
  );

  const isLoading = !isMarketsFetched || !isStatsFetched;

  return (
    <div className="relative z-[-1] flex flex-col gap-4">
      {!isLoading && (
        <>
          {recommendedMarkets && (
            <h4
              className="mb-4 animate-pop-in opacity-0"
              style={{
                animationDelay: `200ms`,
              }}
            >
              {recommendedMarkets.type === "similar"
                ? "Similar Markets"
                : "Popular Markets"}
            </h4>
          )}

          {recommendedMarkets?.markets.map((market, index) => {
            const stat = stats?.find((s) => s.marketId === market.marketKey.toNumber());

            return (
              <div
                key={`market-${market.marketKey.toNumber()}`}
                className="animate-pop-in rounded-xl opacity-0 shadow-lg"
                style={{
                  animationDelay: `${200 * (index + 1)}ms`,
                }}
              >
                <MarketCard
                  key={market.marketKey.toNumber()}
                  market={market}
                  numParticipants={stat?.participants}
                  liquidity={stat?.liquidity}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default SimilarMarketsSection;
