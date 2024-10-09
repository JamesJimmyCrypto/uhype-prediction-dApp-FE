import HorizontalScroll from "components/ui/HorizontalScroll";
import { BREAKPOINTS } from "lib/constants/breakpoints";
import { useWindowSize } from "lib/hooks/events/useWindowSize";
import { useMarketsStats } from "lib/hooks/queries/useMarketsStats";
import { range } from "lodash-es";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useResizeDetector } from "react-resize-detector";
import MarketCard, { FullMarketFragment } from "./market-card/index";
import { useDebouncedCallback } from "use-debounce";
import { useHasMounted } from "lib/hooks/events/useHasMounted";

const MarketScroll = ({
  title,
  cta,
  markets,
  link,
}: {
  title: string;
  cta?: string;
  markets: FullMarketFragment[];
  link?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const { width: windowWidth } = useWindowSize();
  const { width, ref: containerRef } = useResizeDetector();
  const containerWidth = width || 0;

  const hasMounted = useHasMounted();
  const { data: marketsStats } = useMarketsStats(
    markets.map((m) => m.marketKey?.toNumber()),
  );

  const gap = 16;
  const cardsShown =
    windowWidth < BREAKPOINTS.md ? 1 : windowWidth < BREAKPOINTS.lg ? 2 : 3;
  const cardWidth = (containerWidth - gap * (cardsShown - 1)) / cardsShown;

  const handleRightClick = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleLeftClick = () => {
    setPageIndex(pageIndex - 1);
  };

  const showRange = range(pageIndex, pageIndex + cardsShown);
  const hasReachedEnd = showRange.includes(markets.length - 1);
  const leftDisabled = pageIndex === 0;
  const rightDisabled =
    hasReachedEnd || cardWidth * markets.length < containerWidth;

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setIsResizing(true);
  }, [width]);

  useEffect(
    useDebouncedCallback(() => {
      setPageIndex(0);
      setTimeout(() => setIsResizing(false), 66);
    }, 120),
    [width],
  );

  // Hydration fix: Ensure initial rendering is consistent with the client-side
  const [initialMarkets, setInitialMarkets] = useState<FullMarketFragment[]>(
    hasMounted ? markets : [],
  );

  useLayoutEffect(() => {
    if (hasMounted) {
      setInitialMarkets(markets);
    }
  }, [hasMounted, markets]);

  if (!hasMounted) {
    markets = initialMarkets.slice(0, cardsShown);
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3"
    >
      <div className="flex items-center sm:col-span-2">
        <h2 className="text-center sm:text-start">{title}</h2>
      </div>
      <HorizontalScroll
        classes="order-2 sm:order-none"
        link={link}
        cta={cta}
        handleLeftClick={handleLeftClick}
        handleRightClick={handleRightClick}
        rightDisabled={rightDisabled}
        leftDisabled={leftDisabled}
      />
      <div className="relative col-span-3">
        <div
          ref={scrollRef}
          style={{
            transform: `translateX(${
              windowWidth < BREAKPOINTS.sm
                ? 0
                : -(showRange[0] * cardWidth + pageIndex * gap)
            }px)`,
          }}
          className={`flex ${
            !isResizing && "ztg-transition transition-transform"
          } no-scroll-bar flex-col gap-4 scroll-smooth whitespace-nowrap sm:flex-row`}
        >
          {markets.map((market, cardIndex) => {
            const stat = marketsStats?.find(
              (s) => s.marketId === market.marketKey.toNumber(),
            );

            const isShown =
              showRange.includes(cardIndex) || windowWidth < BREAKPOINTS.md;

            return (
              <MarketCard
                key={market.marketKey?.toNumber()}
                disableLink={!isShown}
                className={`market-card rounded-ztg-10 transition duration-500 ease-in-out ${
                  isShown ? "opacity-1" : "opacity-0"
                }`}
                market={market}
                numParticipants={stat?.participants}
                liquidity={stat?.liquidity}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketScroll;
