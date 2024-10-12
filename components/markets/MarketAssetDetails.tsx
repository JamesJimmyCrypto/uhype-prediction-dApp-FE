import {
  AssetId,
  CategoricalAssetId,
  MarketOutcomeAssetId,
  ScalarAssetId,
} from "@zeitgeistpm/sdk";
import AssetActionButtons from "components/assets/AssetActionButtons";
import Table, { TableColumn, TableData } from "components/ui/Table";
import Decimal from "decimal.js";
import { useMarket } from "lib/hooks/queries/useMarket";
import { useMarket24hrPriceChanges } from "lib/hooks/queries/useMarket24hrPriceChanges";
import { useMarketSpotPrices } from "lib/hooks/queries/useMarketSpotPrices";

import { useAssetUsdPrice } from "lib/hooks/queries/useAssetUsdPrice";
import { parseAssetIdString } from "lib/util/parse-asset-id";
import dynamic from "next/dynamic";
import { Answer, MarketStats } from "@/src/types";
import { m } from "framer-motion";

const columns: TableColumn[] = [
  { header: "Outcome", accessor: "outcome", type: "text" },
  {
    header: "Percentage(%)",
    accessor: "percentage",
    type: "percentage",
    collapseOrder: 1,
  },
  { header: "Total Value", accessor: "totalValue", type: "currency" },
  // {
  //   header: "24Hr Change",
  //   accessor: "change",
  //   type: "change",
  //   width: "120px",
  //   collapseOrder: 2,
  // },
];

const MarketAssetDetails = ({
  marketId,
  answers,
  marketStats,
}: {
  marketId: string;
  answers?: Answer[];
  marketStats?: MarketStats;
}) => {
  // const { data: market } = useMarket({ marketId });
  // const baseAsset = parseAssetIdString(market?.baseAsset);
  // const { data: usdPrice } = useAssetUsdPrice(baseAsset);

  // const { data: spotPrices } = useMarketSpotPrices(marketId);
  // const { data: priceChanges } = useMarket24hrPriceChanges(marketId);

  const totalAssetPrice = 0;

  const answerStats = marketStats?.answerStats;

  const tableData: TableData[] | undefined = answerStats?.map(
    (answer, index) => {
      const outcomeName = answer.name;
      const percentage = answer.percentage;
      const totalTokens = answer.totalTokens;
      // const priceChange = priceChanges?.get(index);

      return {
        // assetId: market?.pool?.weights[index]?.assetId,
        id: index,
        outcome: outcomeName,
        totalValue: {
          value: totalTokens.toNumber() / 1e9,
          usdValue: totalTokens.toNumber(),
        },
        percentage: percentage,
        // change: priceChange,
      };
    },
  );

  return <Table columns={columns} data={tableData} />;
};

export default dynamic(() => Promise.resolve(MarketAssetDetails), {
  ssr: false,
});
