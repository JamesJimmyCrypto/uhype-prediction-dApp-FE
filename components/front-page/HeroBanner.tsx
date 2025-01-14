import ZeitgeistIcon from "components/icons/ZeitgeistIcon";
import { getColour } from "components/ui/TableChart";
import { ZtgPriceHistory } from "lib/hooks/queries/useAssetUsdPrice";
import Image from "next/image";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import Link from "next/link";

export const HeroBanner = ({
  ztgHistory,
  bannerPlaceholder,
}: {
  ztgHistory: ZtgPriceHistory;
  bannerPlaceholder: string;
}) => {
  const chartData = ztgHistory.prices?.map(([timestamp, price]) => {
    return { v: price, t: 1 };
  });

  const firstPrice = ztgHistory.prices?.[0]?.[1];
  const latestPrice = ztgHistory.prices?.[ztgHistory.prices.length - 1]?.[1];
  const prctChange = ((latestPrice - firstPrice) / firstPrice) * 100;

  return (
    <div className="main-container md:mt-18 z-2 relative mb-14 mt-12">
      <div className="relative flex flex-col-reverse md:flex-row md:gap-8">
        <div className="md:w-[890px] md:pt-8 lg:w-[690px]">
          <h1
            className="mb-8 text-5xl leading-tight"
            style={{
              background: "linear-gradient(90deg, #00BFFF, #8A2BE2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to the Future of Predictions
          </h1>
          <h2 className="mb-8 text-xl leading-6">
            Where prediction market mixed with memecoin launchpad and
            marketplace
          </h2>
          <div className="mb-14 flex gap-4">
            <Link
              href="https://openverse.tech"
              target="_blank"
              className="flex-1 rounded-md border-2 border-vermilion bg-vermilion px-6 py-3 text-white sm:flex-none"
              style={{
                fontWeight: "bold",
                background: "linear-gradient(90deg, #FF1493, #FF8C00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Learn More
            </Link>
            <Link
              href="/create-account"
              className="flex-1 rounded-md border-2 border-black bg-dark px-6 py-3 text-white sm:flex-none"
              style={{
                fontWeight: "bold", // Đảm bảo sử dụng camelCase
              }}
            >
              Get Started
            </Link>
          </div>
          {/* <a href="https://www.coingecko.com/en/coins/solana" target="_blank">
            <div
              className="flex w-full gap-2 rounded-md px-4 py-3"
              style={{ backgroundColor: "rgba(28, 100, 242, 0.2)" }}
            >
              <div className="flex w-1/3 items-center justify-start gap-3">
                <div>
                  <ZeitgeistIcon variant="blue" height={32} width={32} />
                </div>
                <div>
                  <div className="text-lg font-medium">Dehype</div>
                  <div className="text-sm">{"SOL"}</div>
                </div>
              </div>
              <div className="center flex w-1/3">
                <ResponsiveContainer width={"100%"} height="65%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      dot={false}
                      strokeWidth={2}
                      stroke={getColour(
                        chartData?.[0].v,
                        chartData?.[chartData.length - 1].v,
                      )}
                    />
                    <YAxis hide={true} domain={["dataMin", "dataMax"]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {latestPrice && (
                <div className="flex flex-1 items-center justify-end gap-2">
                  <div>
                    <div className="text-md text-center font-semibold">
                      ${latestPrice.toFixed(3)}
                    </div>
                    <div className="text-center text-sm">
                      {!isNaN(prctChange) ? prctChange.toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </a> */}
        </div>
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:mb-0 md:h-auto">
          <Image
            alt="Futuristic City Image"
            fill={true}
            sizes="100vw"
            priority
            className="object-cover"
            blurDataURL={bannerPlaceholder}
            // placeholder="blur"
            src="/banner.jpg"
          />
        </div>
      </div>
    </div>
  );
};
