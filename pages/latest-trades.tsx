import LatestTrades from "components/front-page/LatestTrades";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { PublicKey } from "@solana/web3.js";

const LatestTradesPage: NextPage = () => {
  const { query } = useRouter();
  const marketId = query["marketId"] as string[] | undefined;

  let marketKey: PublicKey | undefined;

  // Safely convert marketId to PublicKey if it exists
  if (marketId && marketId[0]) {
    try {
      marketKey = new PublicKey(marketId[0]);
    } catch (e) {
      console.error("Invalid marketId", e);
    }
  }

  return (
    <div className="mt-4">
      <h1 className="mb-7 text-center sm:col-span-2 sm:text-start">
        Latest Trades
      </h1>
      {marketKey ? (
        <LatestTrades limit={30} marketKey={marketKey} />
      ) : (
        <p>Invalid or missing market key</p>
      )}
    </div>
  );
};

export default LatestTradesPage;
