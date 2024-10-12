import { NextPage } from "next";
import { useRouter } from "next/router";
import { PublicKey } from "@solana/web3.js";
import { useMarketProgram } from "@/src/hooks";
import { Market } from "@/src/types";
import { BgBallGfx } from "components/front-page/BgBallFx";
import FloatingCircles from "components/front-page/FloatingCircles";
import { HeroBanner } from "components/front-page/HeroBanner";
import NetworkStats from "components/front-page/NetworkStats";
import MarketScroll from "components/markets/MarketScroll";
import MarketCard from "components/markets/market-card";
import Skeleton from "@/components/ui/Skeleton";

const IndexPage: NextPage = () => {
  const router = useRouter();
  const { marketid } = router.query;

  const { useGetMarketsQuery } = useMarketProgram();
  const { data: markets, isLoading, error } = useGetMarketsQuery();

  if (error) return <p>Error loading market data</p>;

  return (
    <div
      data-testid="indexPage"
      className="main-container z-1 relative pt-1 md:pt-1"
    >
      <BgBallGfx />

      <HeroBanner
        bannerPlaceholder="" // You can replace with the relevant placeholder logic.
        ztgHistory={{
          prices: [
            [1, 0],
            [1, 0],
          ],
        }} // If you have specific price history data.
      />

      <div className="mb-12">
        <NetworkStats
          marketCount={markets?.length || 0}
          tradersCount={200}
          totalVolumeUsd={1500}
        />
      </div>

      {isLoading ? (
        <Skeleton height={200} />
      ) : (
        markets?.length &&
        markets.length > 0 && (
          <div className="mb-12">
            <MarketScroll
              title="Featured Markets"
              cta="Go to Markets"
              markets={markets}
              link="markets"
            />
          </div>
        )
      )}

      {/* <div className="mb-12">
        <MarketCard
          market={market}
          numParticipants={market?.participants || 0}
          liquidity={market?.liquidity || 0}
        />
      </div> */}
    </div>
  );
};

export default IndexPage;
