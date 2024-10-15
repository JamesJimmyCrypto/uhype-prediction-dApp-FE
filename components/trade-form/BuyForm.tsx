import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import Decimal from "decimal.js";
import { useMarketProgram } from "@/src/hooks";
import { useNotifications } from "lib/state/notifications";
import { Market } from "@/src/types";
import { formatNumberCompact } from "lib/util/format-compact";
import { Button } from "src/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import FormTransactionButton from "../ui/FormTransactionButton";
import { useSolBalance } from "@/lib/util";

export type BuyFormProps = {
  marketId: string;
  market: Market;
  answerKey: BN;
  // initialAsset?: MarketOutcomeAssetId;
  // onSuccess: (
  //   data: ISubmittableResult,
  //   outcomeAsset: MarketOutcomeAssetId,
  //   amountIn: Decimal,
  // ) => void;
};
const BuyForm = ({ marketId, market, answerKey }: BuyFormProps) => {
  const { mutateBet } = useMarketProgram();
  const { publicKey } = useWallet();
  const { data: solBalance = 0, isLoading: isLoadingBalance } =
    useSolBalance(publicKey);
  const notificationStore = useNotifications();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      amount: 0,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchAmount = watch("amount");

  // Simulating a max balance for demonstration
  const maxBalance = solBalance;

  const handlePlaceBet = async (data) => {
    setLoading(true);
    if (!publicKey) return;

    const betAmount = new Decimal(data.amount);
    const betAmountInLamports = betAmount.mul(1e9).toNumber();
    try {
      console.log("vcl");
      await mutateBet({
        voter: publicKey,
        marketKey: new BN(market.marketKey),
        betAmount: new BN(betAmountInLamports),
        answerKey: answerKey,
      });
      console.log(new BN(betAmountInLamports), "lamport", betAmount, "sol");
      // notificationStore.pushNotification("Bet placed successfully!", {
      //   type: "Success",
      //   autoRemove: true,
      //   lifetime: 5,
      // });
      setLoading(false);
    } catch (error) {
      notificationStore.pushNotification("Failed to place bet.", {
        type: "Error",
        autoRemove: true,
        lifetime: 15,
      });
      setLoading(false);
    }
  };

  const setAmount = (amount) => {
    setValue("amount", amount);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handlePlaceBet)}
        className="flex flex-col justify-center space-y-4"
      >
        <div className="focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark relative flex min-h-[124px] flex-col space-y-3 rounded-xl border border-transparent bg-dark p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-v2-lily text-sm font-medium">
              You're Buying
            </span>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1">
                <div className="text-v2-lily/50 whitespace-nowrap text-xs font-normal">
                  <span translate="no">{watchAmount}</span> <span>SOL</span>
                </div>
              </div>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  onClick={() => setAmount(maxBalance / 2)}
                  className="bg-v2-background-page text-v2-lily/50 hover:border-v2-primary hover:text-v2-primary cursor-pointer rounded-md border border-transparent !px-[6px] !py-1 !text-[10px] font-medium leading-4"
                >
                  HALF
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(maxBalance)}
                  className="bg-v2-background-page text-v2-lily/50 hover:border-v2-primary hover:text-v2-primary cursor-pointer rounded-md border border-transparent !px-[6px] !py-1 !text-[10px] font-medium leading-4"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-center space-x-2">
            <div className="group/select flex items-center justify-between">
              <button
                type="button"
                className="bg-v2-background-page group-hover/select:border-v2-primary/50 group-hover/select:shadow-swap-input-dark flex h-10 items-center space-x-3 rounded-lg border border-transparent px-3 py-2 group-hover/select:bg-[rgba(199,242,132,0.2)]"
              >
                <div className="rounded-full">
                  <span className="relative">
                    <img
                      src="/currencies/solana.png"
                      alt="SOL"
                      width="24"
                      height="24"
                      className="rounded-full object-cover"
                      style={{ maxWidth: "24px", maxHeight: "24px" }}
                    />
                  </span>
                </div>
                <div className="text-sm font-semibold" translate="no">
                  SOL
                </div>
                <div className="group-hover/select:text-v2-primary fill-current text-white/25">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="inherit"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.292893 0.292893C0.683416 -0.097631 1.31658 -0.097631 1.7071 0.292893L4.99999 3.58579L8.29288 0.292893C8.6834 -0.0976311 9.31657 -0.0976311 9.70709 0.292893C10.0976 0.683417 10.0976 1.31658 9.70709 1.70711L5.7071 5.70711C5.31657 6.09763 4.68341 6.09763 4.29289 5.70711L0.292893 1.70711C-0.0976309 1.31658 -0.0976309 0.683417 0.292893 0.292893Z"
                      fill="inherit"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
            <span className="flex-1 text-right">
              <div className="flex h-full flex-col text-right">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="text-v2-lily h-full w-full bg-transparent text-right text-xl font-semibold outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:text-black disabled:opacity-100"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            console.log(e.target.value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="text-white-35 text-xs">
                  <div className="text-v2-lily/50 !text-xs text-xs font-normal"></div>
                </div>
              </div>
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <FormTransactionButton
            className="w-full max-w-[250px]"
            disabled={!publicKey || watchAmount <= 0}
            disableFeeCheck={true}
            loading={false}
            onClick={() => {
              handleSubmit(handlePlaceBet);
            }}
          >
            {loading ? "Buying..." : "Buy"}
          </FormTransactionButton>
        </div>
        <div className="text-center text-sm text-gray-500">
          Network fee: {formatNumberCompact(0)} SOL
        </div>
      </form>
    </Form>
  );
};

export default BuyForm;
