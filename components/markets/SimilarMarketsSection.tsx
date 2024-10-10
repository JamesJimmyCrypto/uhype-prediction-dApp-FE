import { Market } from "@/src/types";
import MarketCard from "components/markets/market-card";
import { useMarketsStats } from "lib/hooks/queries/useMarketsStats";
import { useRecommendedMarkets } from "lib/hooks/queries/useRecommendedMarkets";

export const SimilarMarketsSection = ({
  market,
  limit,
  size,
}: {
  market?: Market;
  limit?: number;
  size?: "medium" | "large";
}) => {
  const { data: recommendedMarkets, isFetched: isMarketsFetched } =
    useRecommendedMarkets(market?.publicKey.toString(), limit ?? 2);

  const { data: stats, isFetched: isStatsFetched } = useMarketsStats(
    recommendedMarkets?.markets?.map((m) => m.publicKey.toString()) ?? [],
  );

  const fontSize = size === "medium" ? '28px' : '32px';

  const isLoading = !isMarketsFetched || !isStatsFetched;

  return (
    <div className="relative z-[-1] flex flex-col gap-4">
      {!isLoading && (
        <>
          {recommendedMarkets && (
            <h4
              className="mb-4 animate-pop-in opacity-0"
              style={{
                background: 'linear-gradient(90deg, #00b7fb, #ff00df, #ff007f)', // sửa lỗi ở đây
                fontWeight: 'bold', // sửa thành camelCase cho các thuộc tính CSS
                fontSize: fontSize,
                WebkitBackgroundClip: 'text', // sửa thành camelCase
                WebkitTextFillColor: 'transparent', // sửa thành camelCase
                animationDelay: '200ms', // giá trị chuỗi cho `animationDelay`
              }}
            >
              {recommendedMarkets.type === "similar"
                ? "Similar Markets"
                : "Popular Markets"}
            </h4>
          )}

          {recommendedMarkets?.markets.map((market, index) => {
            const stat = stats?.find(
              (s) => s.marketId === market.publicKey.toString(),
            );

            return (
              <div
                key={`market-${market.publicKey.toString()}`}
                className="animate-pop-in rounded-xl opacity-0 shadow-lg"
                style={{
                  animationDelay: `${200 * (index + 1)}ms`,
                }}
              >
                <MarketCard
                  key={market.publicKey.toString()}
                  market={market}
                  numParticipants={stat?.participants}
                  liquidity={stat?.liquidity}
                  size={size}
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
