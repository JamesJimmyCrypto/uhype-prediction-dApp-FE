import { Market } from "@/src/types";
import { useMarketCmsMetadata } from "lib/hooks/queries/cms/useMarketCmsMetadata";
import { useMarketsStats } from "lib/hooks/queries/useMarketsStats";
import { useMarketImage } from "lib/hooks/useMarketImage";
import { isMarketImageBase64Encoded } from "lib/types/create-market";
import { MarketOutcome, MarketOutcomes } from "lib/types/markets";
import { getCurrentPrediction } from "lib/util/assets";
import { isAbsoluteUrl } from "next/dist/shared/lib/utils";
import Image from "next/image";
import Link from "next/link";
const TrendingMarketsCompact = ({ markets }: { markets: Market[] }) => {
  const { data: marketsStats } = useMarketsStats(
    markets.map((m) => m.marketKey.toNumber()),
  );

  return (
    <div>
      <div className="flex w-full flex-col divide-y divide-solid overflow-hidden rounded-lg bg-white text-sm">
        {markets.map((market) => (
          <TrendingMarketRow
            key={market.marketKey.toNumber()}
            market={market}
          />
        ))}
      </div>
    </div>
  );
};

const TrendingMarketRow = ({ market }: { market: Market }) => {
  const { coverUrl, marketKey, title } = market;
  const image = coverUrl;
  const marketId = market.marketKey.toNumber();
  // useMarketImage(market, {
  //   fallback:
  //     coverUrl &&
  //     isAbsoluteUrl(coverUrl) &&
  //     !isMarketImageBase64Encoded(coverUrl)
  //       ? coverUrl
  //       : undefined,
  // });

  const { data: cmsMetadata } = useMarketCmsMetadata(marketId);

  const prediction = {
    name: "Yes",
    price: "0.5",
    percentage: 60,
  };
  // getCurrentPrediction(market.assets, market);

  return (
    <Link
      href={`/markets/${marketId}`}
      className="flex h-[70px] items-center p-4 hover:bg-[#D4E7F4]"
    >
      <div className="mr-4 flex h-[45px] w-[45px] flex-none rounded-md">
        <Image
          priority
          alt="Market image"
          src={image}
          width={45}
          height={45}
          className="overflow-hidden rounded-md"
          sizes={"45px"}
          style={{
            objectFit: "cover",
            objectPosition: "50% 50%",
          }}
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-sm">{title}</div>
        <div className="flex text-sm text-ztg-blue">
          <div>
            {prediction.name != null && prediction.name !== ""
              ? market.answers.length > 2
                ? prediction.name
                : `${Intl.NumberFormat("en-US", {
                    maximumSignificantDigits: 3,
                  }).format(Number(prediction.name))}`
              : "No Prediction"}
          </div>
          {market.answers.length > 2 && (
            <div className="ml-2 font-bold">{prediction.percentage}%</div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TrendingMarketsCompact;
