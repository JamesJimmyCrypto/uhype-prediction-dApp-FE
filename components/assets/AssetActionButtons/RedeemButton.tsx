import {
  AssetId,
  getIndexOf,
  getScalarBounds,
  IndexerContext,
  IOCategoricalAssetId,
  Market,
  MarketId,
  parseAssetId,
} from "@zeitgeistpm/sdk";
import SecondaryButton from "components/ui/SecondaryButton";
import Decimal from "decimal.js";
import { ZTG } from "lib/constants";
import {
  AccountAssetIdPair,
  useAccountAssetBalances,
} from "lib/hooks/queries/useAccountAssetBalances";
import { useAssetMetadata } from "lib/hooks/queries/useAssetMetadata";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { calcScalarWinnings } from "lib/util/calc-scalar-winnings";
import { parseAssetIdString } from "lib/util/parse-asset-id";

import { useMemo } from "react";

export type RedeemButtonProps = {
  market: Market<IndexerContext>;
  assetId: AssetId;
};

export const RedeemButton = (props: RedeemButtonProps) => {
  return <RedeemButtonByAssetId {...props} />;
};

export default RedeemButton;

export const RedeemButtonByAssetId = ({
  market,
  assetId,
}: {
  market: Market<IndexerContext>;
  assetId: AssetId;
}) => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString();
  const scalarBounds = getScalarBounds(market);

  const balanceQueries: AccountAssetIdPair[] = market.marketType.categorical
    ? [{ assetId, account: pubKey }]
    : [
        {
          account: pubKey,
          assetId: { ScalarOutcome: [market.marketId as MarketId, "Short"] },
        },
        {
          account: pubKey,
          assetId: { ScalarOutcome: [market.marketId as MarketId, "Long"] },
        },
      ];

  const { isLoading: isLoadingAssetBalance, get: getAccountAssetBalance } =
    useAccountAssetBalances(balanceQueries);

  const value = useMemo(() => {
    const zero = new Decimal(0);
    if (!publicKey || isLoadingAssetBalance) return zero;

    if (market.marketType.categorical && IOCategoricalAssetId.is(assetId)) {
      const resolvedAssetIdString =
        market.outcomeAssets[Number(market.resolvedOutcome)];

      const resolvedAssetId = resolvedAssetIdString
        ? parseAssetId(resolvedAssetIdString).unrightOr(undefined)
        : undefined;

      if (
        !resolvedAssetId ||
        !IOCategoricalAssetId.is(resolvedAssetId) ||
        getIndexOf(resolvedAssetId) !== getIndexOf(assetId)
      )
        return zero;

      if (!pubKey) return zero;
      const balance = 0;
      return balance;
    } else {
      if (!pubKey) return zero;
      // const shortBalance = getAccountAssetBalance(pubKey, {
      //   ScalarOutcome: [market.marketId as MarketId, "Short"],
      // })?.data?.balance;

      // const longBalance = getAccountAssetBalance(pubKey, {
      //   ScalarOutcome: [market.marketId as MarketId, "Long"],
      // })?.data?.balance;
      const shortBalance = 0;
      const longBalance = 0;
      if (!shortBalance || !longBalance) return zero;

      const bounds = scalarBounds.unwrap();
      const lowerBound = bounds[0].toNumber();
      const upperBound = bounds[1].toNumber();
      const resolvedNumber = Number(market.resolvedOutcome);

      return calcScalarWinnings(
        lowerBound,
        upperBound,
        new Decimal(resolvedNumber).div(ZTG),
        new Decimal(resolvedNumber).div(ZTG),
        new Decimal(resolvedNumber).div(ZTG),
      );
    }
  }, [market, assetId, isLoadingAssetBalance, getAccountAssetBalance]);

  return <RedeemButtonByValue market={market} value={new Decimal(0)} />;
};

const RedeemButtonByValue = ({
  market,
  value,
}: {
  market: Market<IndexerContext>;
  value: Decimal;
}) => {
  const [sdk] = useSdkv2();
  const { publicKey } = useWallet();
  const notificationStore = useNotifications();
  const baseAsset = parseAssetIdString(market.baseAsset);
  const { data: baseAssetMetadata } = useAssetMetadata(baseAsset);

  const handleClick = () => {};

  return (
    <>
      {true ? (
        <span className="font-bold text-green-500">Redeemed Tokens!</span>
      ) : (
        <SecondaryButton onClick={handleClick} disabled={value.eq(0)}>
          Redeem Tokens
        </SecondaryButton>
      )}
    </>
  );
};
