import { useQueryClient } from "@tanstack/react-query";
import { isRpcSdk, ZTG } from "@zeitgeistpm/sdk";
import FormTransactionButton from "components/ui/FormTransactionButton";
import Input from "components/ui/Input";
import Decimal from "decimal.js";
import { DEFAULT_SLIPPAGE_PERCENTAGE } from "lib/constants";
import { Amm2Pool, amm2PoolKey } from "lib/hooks/queries/amm2/useAmm2Pool";
import { useBalances } from "lib/hooks/queries/useBalances";
import { lookupAssetMetadata, useMarket } from "lib/hooks/queries/useMarket";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { isPresent } from "lib/types";
import { calculateRestrictivePoolAsset } from "lib/util/calculate-restrictive-pool-asset";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const JoinPoolForm = ({
  marketId,
  pool,
  baseAssetTicker,
  onSuccess,
}: {
  marketId: string;
  pool: Amm2Pool;
  baseAssetTicker?: string;
  onSuccess?: () => void;
}) => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString();
  const { register, watch, handleSubmit, setValue, getValues, formState } =
    useForm({ reValidateMode: "onChange", mode: "all" });
  const [sdk, id] = useSdkv2();
  const notificationStore = useNotifications();
  const [poolSharesToReceive, setPoolSharesToReceive] = useState<Decimal>();
  const { data: market } = useMarket({ marketId });
  const userAssetBalances = useBalances(pool.assetIds, pubKey)
    .map((res) => res.data)
    .filter(isPresent);

  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name) return;
      const changedByUser = type != null;
      const changedAsset = name;
      const userInput = value[changedAsset];
      const reserves = Array.from(pool.reserves).map((reserve) => reserve[1]);

      if (name === "percentage" && changedByUser) {
        const percentage = Number(value["percentage"]);

        reserves.forEach((reserve, index) => {
          setValue(
            index.toString(),
            reserve.div(ZTG).toFixed(3, Decimal.ROUND_DOWN),
            { shouldValidate: true },
          );
        });

        // setPoolSharesToReceive(
        //   pool.totalShares.mul(restrictiveAssetToPoolRatio),
        // );
      } else if (
        changedAsset != null &&
        userInput != null &&
        userInput !== "" &&
        changedByUser &&
        userAssetBalances
      ) {
        const reserve = reserves[Number(changedAsset)];
        const inputToReserveRatio = new Decimal(userInput)
          .div(reserve)
          .mul(ZTG);

        let restrictedAssetAmount: Decimal | undefined;
        reserves.forEach((reserve, index) => {
          const amount = reserve.mul(inputToReserveRatio).div(ZTG);

          if (index.toString() !== changedAsset) {
            setValue(index.toString(), amount.toFixed(3, Decimal.ROUND_DOWN), {
              shouldValidate: true,
            });
          }
        });
        setPoolSharesToReceive(pool.totalShares.mul(inputToReserveRatio));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, userAssetBalances, pool]);

  const onSubmit: SubmitHandler<any> = () => {};

  const prctSharesToReceive = useMemo(() => {
    if (!poolSharesToReceive) return new Decimal(0);
    return poolSharesToReceive
      .div(pool.totalShares.plus(poolSharesToReceive))
      .mul(100);
  }, [pool.totalShares, poolSharesToReceive]);

  return (
    <form
      className="flex flex-col gap-y-4 md:gap-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex max-h-[250px] flex-col gap-y-6 overflow-y-auto py-5 md:max-h-[400px]">
        {market &&
          pool?.assetIds.map((assetId, index) => {
            const assetName = lookupAssetMetadata(market, assetId)?.name;

            return (
              <div
                key={index}
                className="relative h-[56px] w-full text-ztg-18-150 font-medium "
              >
                <div className="absolute left-[15px] top-[14px] h-full w-[40%] truncate capitalize">
                  {assetName}
                </div>
                <Input
                  className={`h-[56px] w-full rounded-[5px] bg-anti-flash-white px-[15px] text-right outline-none
                            ${
                              formState.errors[index.toString()]?.message
                                ? "border-2 border-vermilion text-vermilion"
                                : ""
                            }
              `}
                  key={index}
                  type="number"
                  step="any"
                  {...register(index.toString(), {
                    value: 0,
                    required: {
                      value: true,
                      message: "Value is required",
                    },
                    validate: (value) => {
                      if (value) {
                        return `Insufficient balance. Current balance: ${value.toFixed(
                          3,
                        )}`;
                      } else if (value <= 0) {
                        return "Value cannot be zero or less";
                      }
                    },
                  })}
                />
                <div className="mt-[4px] text-ztg-12-120 text-vermilion">
                  <>{formState.errors[index.toString()]?.message}</>
                </div>
              </div>
            );
          })}
      </div>
      <input
        className="my-[20px] px-0"
        type="range"
        {...register("percentage", { min: 0, value: "0" })}
      />
      {market?.status !== "Active" && (
        <div className="rounded-md bg-provincial-pink p-4 text-sm">
          Liquidity cannot be provided to a closed market
        </div>
      )}
      <div className="center mb-2 flex gap-2 text-sm">
        <label className="block flex-1 font-bold">
          Expected Pool Ownership
        </label>
        {prctSharesToReceive.toFixed(1)} %
      </div>

      <FormTransactionButton
        loading={true}
        disabled={formState.isValid === false || market?.status !== "Active"}
      >
        Join Pool
      </FormTransactionButton>
    </form>
  );
};

export default JoinPoolForm;
