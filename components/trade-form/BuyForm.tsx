import { ISubmittableResult } from "@polkadot/types/types";
import { OrderStatus } from "@zeitgeistpm/indexer";
import { MarketOutcomeAssetId, parseAssetId, ZTG } from "@zeitgeistpm/sdk";
// import MarketContextActionOutcomeSelector from "components/markets/MarketContextActionOutcomeSelector";

import FormTransactionButton from "components/ui/FormTransactionButton";
import Input from "components/ui/Input";
import Decimal from "decimal.js";
import { DEFAULT_SLIPPAGE_PERCENTAGE } from "lib/constants";
import {
  lookupAssetReserve,
  useAmm2Pool,
} from "lib/hooks/queries/amm2/useAmm2Pool";
import { useOrders } from "lib/hooks/queries/orderbook/useOrders";
import { useAssetMetadata } from "lib/hooks/queries/useAssetMetadata";
import { useBalance } from "lib/hooks/queries/useBalance";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { useMarket } from "lib/hooks/queries/useMarket";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  approximateMaxAmountInForBuy,
  calculateSpotPrice,
  calculateSpotPriceAfterBuy,
  calculateSwapAmountOutForBuy,
  isValidBuyAmount,
} from "lib/util/amm2";
import { assetsAreEqual } from "lib/util/assets-are-equal";
import { formatNumberCompact } from "lib/util/format-compact";
import { selectOrdersForMarketBuy } from "lib/util/order-selection";
import { parseAssetIdString } from "lib/util/parse-asset-id";
import { perbillToNumber } from "lib/util/perbill-to-number";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMarketProgram } from "@/src/hooks";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Market } from "@/src/types";
import { getExplorerUrl } from "@/lib/util";

const BuyForm = ({
  marketId,
  market,
  initialAsset,
  onSuccess,
}: {
  marketId: string;
  market: Market;
  initialAsset?: MarketOutcomeAssetId;
  onSuccess: (
    data: ISubmittableResult,
    outcomeAsset: MarketOutcomeAssetId,
    amountIn: Decimal,
  ) => void;
}) => {
  const { mutateBet } = useMarketProgram();
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
  const notificationStore = useNotifications();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  // const baseAsset = parseAssetIdString(market?.baseAsset);
  // const { data: assetMetadata } = useAssetMetadata(baseAsset);
  // const baseSymbol = assetMetadata?.symbol;
  // const { data: baseAssetBalance } = useBalance(pubKey, baseAsset);
  const { data: pool } = useAmm2Pool(marketId);
  // const { data: orders } = useOrders({
  //   marketId_eq: marketId,
  //   status_eq: OrderStatus.Placed,
  // });

  const swapFee = pool?.swapFee.div(ZTG);
  const creatorFee = new Decimal(perbillToNumber(0));

  // const outcomeAssets = market?.outcomeAssets.map(
  //   (assetIdString) =>
  //     parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  // );
  // const [selectedAsset, setSelectedAsset] = useState<
  //   MarketOutcomeAssetId | undefined
  // >(initialAsset ?? outcomeAssets?.[0]);

  const formAmount = getValues("amount");

  const amountIn = new Decimal(
    formAmount && formAmount !== "" ? formAmount : 0,
  ).mul(ZTG);
  // const assetReserve =
  //   pool?.reserves && lookupAssetReserve(pool?.reserves, selectedAsset);

  const validBuy = useMemo(() => {
    return swapFee;
  }, [pool?.liquidity, amountIn]);

  const maxAmountIn = useMemo(() => {
    return pool;
  }, [pool?.liquidity]);

  const { amountOut, spotPrice, newSpotPrice, priceImpact, maxProfit } =
    useMemo(() => {
      const amountOut = new Decimal(0);

      // const spotPrice =
      //   assetReserve && calculateSpotPrice(assetReserve, pool?.liquidity);

      // const newSpotPrice =
      //   pool?.liquidity &&
      //   assetReserve &&
      //   swapFee &&
      //   calculateSpotPriceAfterBuy(
      //     assetReserve,
      //     pool.liquidity,
      //     amountOut,
      //     amountIn,
      //     swapFee,
      //     creatorFee,
      //   );

      const priceImpact = new Decimal(0);

      const maxProfit = amountOut.minus(amountIn);

      return {
        amountOut,
        spotPrice: new Decimal(0),
        newSpotPrice: new Decimal(0),
        priceImpact,
        maxProfit,
      };
    }, [amountIn, pool?.liquidity]);

  const maxSpendableBalance = 0;

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const changedByUser = type != null;

      if (!changedByUser || !maxSpendableBalance || !maxAmountIn) return;

      if (name === "percentage") {
        const max = maxAmountIn;
        // setValue("amount", Number(Decimal.ROUND_DOWN)));
      } else if (name === "amount" && value.amount !== "") {
        setValue(
          "percentage",
          new Decimal(value.amount)
            .mul(ZTG)
            .div(maxSpendableBalance)
            .mul(100)
            .toString(),
        );
      }
      trigger("amount");
    });
    return () => subscription.unsubscribe();
  }, [watch, maxSpendableBalance, maxAmountIn]);

  const handlePlaceBet = async () => {
    if (!publicKey) return;
    try {
      await mutateBet({
        voter: publicKey,
        marketKey: market.marketKey, // replace with actual market ID
        betAmount: new BN(0.1), // amount to bet
        answerKey: market.answers[0].answerKey, // outcome for the bet
      });
      // console.log("Bet placed successfully with signature:", signature);

      // Optionally call onSuccess if you want to perform further actions
      // onSuccess(signature, market.answers[0].answerKey, new Decimal(0.1));
    } catch (error) {
      console.error("Error placing bet:", error);
      notificationStore.pushNotification("Failed to place bet.", {
        autoRemove: true,
        type: "Error",
        lifetime: 15,
      });
    }
  };
  const onSubmit = () => {
    handlePlaceBet();
  };
  return (
    <div className="flex w-full flex-col items-center gap-8 text-ztg-18-150 font-semibold">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center gap-y-4"
      >
        <div className="flex w-full items-center justify-center rounded-md p-2">
          <div className="mr-4 font-mono">
            {amountOut.div(ZTG).abs().toFixed(3)}
          </div>
          <div>
            {/* {market && selectedAsset && (
              // <MarketContextActionOutcomeSelector
              //   market={market}
              //   selected={selectedAsset}
              //   options={outcomeAssets}
              //   onChange={(assetId) => {
              //     setSelectedAsset(assetId);
              //     trigger();
              //   }}
              // />
            )} */}
          </div>
        </div>
        <div className="text-sm">For</div>
        <div className="center relative h-[56px] w-full rounded-md bg-white text-ztg-18-150 font-normal">
          <Input
            type="number"
            className="w-full bg-transparent font-mono outline-none"
            step="any"
            {...register("amount", {
              value: 0,
              required: {
                value: true,
                message: "Value is required",
              },
              validate: (value) => {
                if (value <= 0) {
                  return "Value cannot be zero or less";
                } else if (value == 0) {
                  return `Maximum amount of that can be traded `;
                } else if (validBuy) {
                  return "OK";
                }
              },
            })}
          />
          {/* <div className="absolute right-0 mr-[10px]">{baseSymbol}</div> */}
        </div>
        {/* <input
          className="mb-[10px] mt-[30px] w-full"
          type="range"
          disabled={!maxSpendableBalance}
          {...register("percentage", { value: "0" })}
        /> */}
        <div className="mb-[10px] flex w-full flex-col items-center gap-2 text-xs font-normal text-sky-600 ">
          <div className="h-[16px] text-xs text-vermilion">
            <>{formState.errors["amount"]?.message}</>
          </div>
          <div className="flex w-full justify-between">
            <div>Max profit:</div>
            <div className="text-black">{maxProfit.toFixed(2)}</div>
          </div>
          <div className="flex w-full justify-between">
            <div>Price after trade:</div>
            <div className="text-black">
              {newSpotPrice?.toFixed(2)} ({priceImpact?.toFixed(2)}%)
            </div>
          </div>
        </div>
        <FormTransactionButton
          className="w-full max-w-[250px]"
          disabled={formState.isValid}
          disableFeeCheck={true}
          loading={false}
        >
          <div>
            <div className="text-center h-[24px]  flex items-center justify-center">
              <div className="font-bold text-[24px] ">
                Buy
              </div>
            </div>
      
          </div>
        </FormTransactionButton>
        <div className="center h-[20px] text-ztg-12-120 font-normal">
              Network fee: {formatNumberCompact(0)} {"SOL"}
            </div>
      </form>
    </div>
  );
};

export default BuyForm;
