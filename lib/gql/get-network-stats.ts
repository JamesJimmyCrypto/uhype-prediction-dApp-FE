import { BaseAssetId, FullContext, Sdk, ZTG } from "@zeitgeistpm/sdk";
import Decimal from "decimal.js";
import { fetchAllPages } from "lib/util/fetch-all-pages";
import { parseAssetIdString } from "lib/util/parse-asset-id";
import { getBaseAssetHistoricalPrices, lookupPrice } from "./historical-prices";
import {
  PoolOrderByInput,
  MarketOrderByInput,
  NeoPoolOrderByInput,
  HistoricalSwapOrderByInput,
} from "@zeitgeistpm/indexer";
import { MarketsOrderBy } from "lib/types/market-filter";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export async function getMarketCounter() {
  try {
    const marketCounterAccount = new PublicKey('Cyg6eBrhpC3hCPTutCxDGaL7KRoaPf8EiJGrDivDYXr8');
    const { connection } = useConnection();

    // Fetch account information using the connection
    const accountInfo = await connection.getAccountInfo(marketCounterAccount);


    if (accountInfo === null) {
      console.error('Account not found');
      return;
    }

    // Deserialize the data according to your program's layout
    const data = accountInfo.data;

    // Assuming `marketCounter` is a u64 (64-bit unsigned integer) and the first 8 bytes of the data
    // Adjust the offset and length based on your account data structure
    const marketCounter = new DataView(data.buffer).getBigUint64(0, true);

    return marketCounter ?? 0;
    console.log('Market Counter:', marketCounter.toString());
  } catch (error) {
    console.error('Error fetching market counter:', error);
  }
}
export const getNetworkStats = async (sdk: Sdk<FullContext>) => {
  const [marketCountBN, basePrices, markets, historicalSwaps] =
    await Promise.all([
      getMarketCounter(),
      getBaseAssetHistoricalPrices(),
      fetchAllPages(async (pageNumber, limit) => {
        const { markets } = await sdk.indexer.markets({
          limit: limit,
          offset: pageNumber * limit,
          order: MarketOrderByInput.IdAsc,
        });
        return markets;
      }),
      fetchAllPages(async (pageNumber, limit) => {
        const { historicalSwaps } = await sdk.indexer.historicalSwaps({
          limit: limit,
          offset: pageNumber * limit,
          order: HistoricalSwapOrderByInput.IdAsc,
        });
        return historicalSwaps;
      }),
    ]);

  const totalMarketVolumeUsd = markets.reduce<Decimal>((total, market) => {
    const poolCreationBaseAssetPrice = lookupPrice(
      basePrices,
      parseAssetIdString(market.baseAsset) as BaseAssetId,
      new Date(market.pool?.createdAt ?? market.neoPool?.createdAt).getTime(),
    );

    const volumeUsd = new Decimal(market.volume).mul(
      poolCreationBaseAssetPrice ?? 0,
    );

    return total.plus(volumeUsd);
  }, new Decimal(0));

  const tradersCount = historicalSwaps.reduce<Set<string>>(
    (traders, swap) => traders.add(swap.accountId),
    new Set(),
  ).size;

  return {
    marketCount: marketCountBN || 0,
    tradersCount,
    volumeUsd: totalMarketVolumeUsd.div(ZTG).toNumber(),
  };
};
