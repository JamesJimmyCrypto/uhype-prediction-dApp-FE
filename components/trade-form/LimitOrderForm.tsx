import { useQueryClient } from "@tanstack/react-query";
import {
  MarketOutcomeAssetId,
  ZTG,
  getIndexOf,
  isRpcSdk,
  parseAssetId,
} from "@zeitgeistpm/sdk";
// import MarketContextActionOutcomeSelector from "components/markets/MarketContextActionOutcomeSelector";

import FormTransactionButton from "components/ui/FormTransactionButton";
import Input from "components/ui/Input";
import Decimal from "decimal.js";
import { useAmm2Pool } from "lib/hooks/queries/amm2/useAmm2Pool";
import {
  ordersRootKey,
  useOrders,
} from "lib/hooks/queries/orderbook/useOrders";
import { useAssetMetadata } from "lib/hooks/queries/useAssetMetadata";
import { useBalance } from "lib/hooks/queries/useBalance";
import { FeeAsset } from "lib/hooks/queries/useFeePayingAsset";
import { useMarket } from "lib/hooks/queries/useMarket";
import { useMarketSpotPrices } from "lib/hooks/queries/useMarketSpotPrices";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { assetsAreEqual } from "lib/util/assets-are-equal";
import { formatNumberCompact } from "lib/util/format-compact";
import { parseAssetIdString } from "lib/util/parse-asset-id";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const DEFAULT_PRICE_ADJUSTMENT = 0.01;

export const LimitBuyOrderForm = ({
  marketId,
  initialAsset,
}: {
  marketId: string;
  initialAsset?: MarketOutcomeAssetId;
}) => {
  const [sdk, id] = useSdkv2();
  const notificationStore = useNotifications();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  // const { data: orders } = useOrders({ marketId_eq: marketId });
  const { data: market } = useMarket({
    marketId,
  });
  const outcomeAssets = market?.outcomeAssets.map(
    (assetIdString) =>
      parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  );
  const [selectedAsset, setSelectedAsset] = useState<
    MarketOutcomeAssetId | undefined
  >(initialAsset ?? outcomeAssets?.[0]);
  const [price, setPrice] = useState<Decimal>();
  const baseAsset = parseAssetIdString(market?.baseAsset);
  const queryClient = useQueryClient();

  const { data: assetMetadata } = useAssetMetadata(baseAsset);

  const { data: baseAssetBalance } = useBalance(pubKey, baseAsset);

  const maxAmount = new Decimal(0);

  return (
    <LimitOrderForm
      marketId={marketId}
      asset={selectedAsset}
      side="buy"
      onSubmit={(price, amount) => {}}
      onAssetChange={(asset) => {
        setSelectedAsset(asset);
      }}
      onPriceChange={(price) => {
        setPrice(price);
      }}
      maxAmount={maxAmount}
      isLoading={true}
      fee={{
        symbol: "SOL",
        amount: new Decimal(0),
        sufficientBalance: true,
        assetId: {
          CategoricalOutcome: [
            Symbol("mySymbol") as any,
            1, // Create instances matching the MarketId type
          ],
        },
      }}
    />
  );
};

export const LimitSellOrderForm = ({
  marketId,
  initialAsset,
}: {
  marketId: string;
  initialAsset?: MarketOutcomeAssetId;
}) => {
  const [sdk, id] = useSdkv2();
  const notificationStore = useNotifications();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  // const { data: orders } = useOrders({ marketId_eq: marketId });
  const { data: market } = useMarket({
    marketId,
  });
  const outcomeAssets = market?.outcomeAssets.map(
    (assetIdString) =>
      parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  );
  const [selectedAsset, setSelectedAsset] = useState<
    MarketOutcomeAssetId | undefined
  >(initialAsset ?? outcomeAssets?.[0]);
  const baseAsset = parseAssetIdString(market?.baseAsset);
  const queryClient = useQueryClient();

  const { data: assetMetadata } = useAssetMetadata(baseAsset);

  const { data: selectedAssetBalance } = useBalance(pubKey, selectedAsset);

  return (
    <LimitOrderForm
      marketId={marketId}
      asset={selectedAsset}
      side="sell"
      onSubmit={(price, amount) => {}}
      onAssetChange={(asset) => {
        setSelectedAsset(asset);
      }}
      maxAmount={new Decimal(0)}
      isLoading={true}
      fee={{
        symbol: "SOL",
        amount: new Decimal(0),
        sufficientBalance: true,
        assetId: {
          CategoricalOutcome: [
            Symbol("mySymbol") as any,
            1, // Create instances matching the MarketId type
          ],
        },
      }}
    />
  );
};

const LimitOrderForm = ({
  marketId,
  asset,
  onAssetChange,
  onPriceChange,
  onSubmit,
  maxAmount,
  side,
  isLoading,
  fee,
}: {
  marketId: string;
  asset?: MarketOutcomeAssetId;
  maxPrice?: Decimal;
  minPrice?: Decimal;
  maxAmount?: Decimal;
  side: "buy" | "sell";
  isLoading: boolean;
  fee?: FeeAsset | null;
  onSubmit: (price: Decimal, amount: Decimal) => void;
  onAssetChange?: (assetId: MarketOutcomeAssetId) => void;
  onPriceChange?: (price: Decimal) => void;
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState,
    watch,
    setValue,
    trigger,
  } = useForm({
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { data: market } = useMarket({
    marketId,
  });
  const { publicKey } = useWallet();
  const baseAsset = parseAssetIdString(market?.baseAsset);
  const { data: pool } = useAmm2Pool(marketId);

  const { data: spotPrices } = useMarketSpotPrices(marketId);
  const [initialPriceSetAsset, setInitialPriceSetAsset] = useState<
    MarketOutcomeAssetId | undefined
  >();
  const spotPrice = undefined;

  useEffect(() => {
    // default price to current spot price
    if (!assetsAreEqual(initialPriceSetAsset, asset)) {
      const adjustedPrice = DEFAULT_PRICE_ADJUSTMENT;
      setInitialPriceSetAsset(asset);
      trigger("price"); // reset validation
    }
  }, [spotPrice, initialPriceSetAsset]);

  const { data: assetMetadata } = useAssetMetadata(baseAsset);
  const baseSymbol = assetMetadata?.symbol;

  const outcomeAssets = market?.outcomeAssets.map(
    (assetIdString) =>
      parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const changedByUser = type != null;

      if (name === "price" && value.price !== "") {
        onPriceChange?.(new Decimal(value.price ?? 0));
      }
      if (!changedByUser || !maxAmount) return;

      if (name === "percentage") {
        const max = maxAmount;

        setValue(
          "amount",
          Number(
            max
              .mul(value.percentage)
              .abs()
              .div(100)
              .div(ZTG)
              .toFixed(3, Decimal.ROUND_DOWN),
          ),
        );
      } else if (name === "amount" && value.amount !== "") {
        setValue(
          "percentage",
          new Decimal(value.amount).mul(ZTG).div(maxAmount).mul(100).toString(),
        );
      }
      trigger("amount");
    });
    return () => subscription.unsubscribe();
  }, [watch, maxAmount]);

  const amount = new Decimal(getValues("amount") || 0);
  const total = amount.mul(getValues("price") || 0);
  const maxProfit = amount.minus(total);

  return (
    <div className="flex w-full flex-col items-center gap-8 text-ztg-18-150 font-semibold">
      <form
        onSubmit={handleSubmit((value) => {
          onSubmit(
            new Decimal(value["price"] || 0),
            new Decimal(value["amount"] || 0),
          );
        })}
        className="flex w-full flex-col gap-y-4"
      >
        <div>
          <div className="mb-1 text-sm">Amount</div>
          <div className="flex w-full items-center justify-center rounded-md bg-white pr-2 font-mono">
            <Input
              type="number"
              className="w-full bg-transparent outline-none"
              step="any"
              {...register("amount", {
                value: 0,
                required: {
                  value: true,
                  message: "Value is required",
                },
                validate: (value) => {
                  if (value > (maxAmount?.div(ZTG).toNumber() ?? 0)) {
                    return `Insufficient balance. Max: ${maxAmount
                      ?.div(ZTG)
                      .toFixed(1)}`;
                  } else if (value <= 0) {
                    return "Amount must be greater than 0";
                  }
                },
              })}
            />
            <div>
              {/* {market && asset && (
                <MarketContextActionOutcomeSelector
                  market={market}
                  selected={asset}
                  options={outcomeAssets}
                  onChange={(assetId) => {
                    onAssetChange?.(assetId);
                  }}
                />
              )} */}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm">Price</div>
          <div className="center relative h-[56px] w-full rounded-md bg-white text-ztg-18-150 font-normal">
            <Input
              type="number"
              className="w-full bg-transparent font-mono outline-none"
              step="any"
              {...register("price", {
                value: 0,
                required: {
                  value: true,
                  message: "Value is required",
                },
                validate: (value) => {
                  if (Number(value) >= 1) {
                    return `Price must be less than 1`;
                  } else if (Number(value) <= 0) {
                    return `Price must be greater than 0`;
                  }
                },
              })}
            />
            <div className="absolute right-0 mr-[10px]">{baseSymbol}</div>
          </div>
        </div>

        <input
          className="mb-[10px] mt-[30px] w-full"
          type="range"
          {...register("percentage", { value: "0" })}
        />
        <div className="flex w-full flex-col items-center gap-2 text-xs font-normal text-sky-600 ">
          <div className="h-[16px] text-xs text-vermilion">
            <>{Object.values(formState.errors)[0]?.message}</>
          </div>
          <div className="flex w-full justify-between">
            <div>Total:</div>
            <div className="text-black">
              {total.toFixed(2)} {baseSymbol}
            </div>
          </div>
          {side === "buy" && (
            <div className="flex w-full justify-between">
              <div>Max Profit:</div>
              <div className="text-black">
                {maxProfit.toFixed(2)} {baseSymbol}
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-center">
          <FormTransactionButton
            loading={isLoading}
            className="w-full max-w-[250px]"
            disabled={formState.isValid === false || isLoading}
            disableFeeCheck={true}
          >
            <div>
              <div className="center h-[20px] font-normal">
                {side === "buy" ? "Place Buy Order" : "Place Sell Order"}
              </div>
              <div className="center h-[20px] text-ztg-12-120 font-normal">
                Network fee: {formatNumberCompact(0)} {"SOL"}
              </div>
            </div>
          </FormTransactionButton>
        </div>
      </form>
    </div>
  );
};

export default LimitOrderForm;
