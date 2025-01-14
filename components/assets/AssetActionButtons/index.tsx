import { CategoricalAssetId, ScalarAssetId } from "@zeitgeistpm/sdk";
import { useMarket } from "lib/hooks/queries/useMarket";
import { useMarketStage } from "lib/hooks/queries/useMarketStage";
import { useWallet } from "@solana/wallet-adapter-react";

import DisputeButton from "./DisputeButton";
import RedeemButton from "./RedeemButton";
import ReportButton from "./ReportButton";
import AssetTradingButtons from "./AssetTradingButtons";
import { useMarketProgram } from "@/src/hooks";
import { PublicKey } from "@solana/web3.js";

interface AssetActionButtonsProps {
  marketId: string;
  assetId?: ScalarAssetId | CategoricalAssetId;
}

const AssetActionButtons = ({ marketId, assetId }: AssetActionButtonsProps) => {
  const { useGetMarketQuery } = useMarketProgram();
  const {
    data: market,
    isLoading,
    error,
  } = useGetMarketQuery(new PublicKey(marketId!));
  const { data: marketStage } = useMarketStage(market ?? undefined);

  const { publicKey } = useWallet();
  // const isOracle = market?.oracle === publicKey?.toString();

  if (!market || !marketStage) {
    return <></>;
  }

  // if (
  //   marketStage.type === "OpenReportingPeriod" ||
  //   (marketStage.type === "OracleReportingPeriod" && isOracle)
  // ) {
  //   return <ReportButton market={market} assetId={assetId} />;
  // }

  // if (marketStage.type === "Disputed") {
  //   return <></>;
  // }

  // if (marketStage.type === "Reported") {
  //   return <DisputeButton market={market} assetId={assetId} />;
  // }

  // if (marketStage.type === "Resolved") {
  //   return <>{assetId && <RedeemButton assetId={assetId} market={market} />}</>;
  // }

  // if (marketStage.type === "Trading") {
  //   return <>{assetId && <AssetTradingButtons assetId={assetId} />}</>;
  // }

  return <></>;
};

export default AssetActionButtons;
