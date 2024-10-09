import { Dialog } from "@headlessui/react";
import Decimal from "decimal.js";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AssetId, IOForeignAssetId } from "@zeitgeistpm/sdk";
import AddressInput, { AddressOption } from "components/ui/AddressInput";
import AssetInput from "components/ui/AssetInput";
import { AssetOption } from "components/ui/AssetSelect";
import FormTransactionButton from "components/ui/FormTransactionButton";
import Modal from "components/ui/Modal";
import SecondaryButton from "components/ui/SecondaryButton";
import {
  FOREIGN_ASSET_METADATA,
  findAssetImageForSymbol,
} from "lib/constants/foreign-asset";
import { useAllAssetMetadata } from "lib/hooks/queries/useAssetMetadata";
import { useBalance } from "lib/hooks/queries/useBalance";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatNumberLocalized } from "lib/util";
import { useNotifications } from "lib/state/notifications";
import { formatNumberCompact } from "lib/util/format-compact";
import { assetsAreEqual } from "lib/util/assets-are-equal";

const isSupportedAsset = (id: number) => {
  return Object.keys(FOREIGN_ASSET_METADATA).includes(`${id}`);
};

export type TransferButtonProps = {
  assetId: AssetId;
};

const TransferButton: React.FC<TransferButtonProps> = ({ assetId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString();

  return (
    <>
      <SecondaryButton onClick={() => setIsOpen(true)} disabled={!pubKey}>
        Transfer
      </SecondaryButton>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        {pubKey && <TransferModal assetId={assetId} address={pubKey} />}
      </Modal>
    </>
  );
};

const TransferModal = ({
  assetId,
  address,
}: {
  assetId: AssetId;
  address: string;
}) => {
  const { data: assetMetadata, isSuccess } = useAllAssetMetadata();
  const notifications = useNotifications();

  const options = useMemo<AssetOption[]>(() => {
    if (!isSuccess) {
      return [];
    }
    let options: AssetOption[] = [];
    for (const [id, meta] of assetMetadata) {
      if (id === "Ztg") {
        options = [
          ...options,
          {
            label: meta.symbol,
            value: { Ztg: null },
            image: findAssetImageForSymbol(),
          },
        ];
      } else {
        if (!isSupportedAsset(id)) {
          continue;
        }
        options = [
          ...options,
          {
            label: meta.symbol,
            value: { ForeignAsset: id },
            image: findAssetImageForSymbol(meta.symbol),
          },
        ];
      }
    }
    return options;
  }, [assetMetadata, isSuccess]);

  const defaultOption = options.find(
    (opt) => JSON.stringify(opt.value) === JSON.stringify(assetId),
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<{
    asset: { amount: string; assetOption?: AssetOption };
    address: AddressOption | null;
  }>({
    reValidateMode: "onChange",
    mode: "all",
  });

  const asset = watch("asset");
  const isNativeCurrency = !IOForeignAssetId.is(asset?.assetOption?.value);

  const { data: balanceRaw } = useBalance(address, asset?.assetOption?.value);
  const balance = 0;

  const targetAddress = watch("address");

  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  const [sdk] = useSdkv2();

  const fee = 0;

  let maxAmount = "";

  if (balance) {
    // if (assetsAreEqual(asset.assetOption?.value, feeRaw?.assetId)) {
    //   maxAmount = balance.sub(fee ?? 0).toString();
    // } else {
    //   maxAmount = balance.toString();
    // }
  }

  const submit = () => {
    if (!isValid) return;
    // send(feeRaw?.assetId);
  };

  return (
    <Dialog.Panel className="w-full max-w-[564px] rounded-[10px] bg-white p-[30px]">
      <h3 className="mb-5 text-lg font-bold">Transfer</h3>
      <form className="flex flex-col" onSubmit={handleSubmit(submit)}>
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <div>Select Asset and Amount</div>
          {balance && (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!maxAmount) return;
                setValue(
                  "asset",
                  { ...asset, amount: maxAmount },
                  { shouldValidate: true },
                );
              }}
            >
              Balance: {formatNumberLocalized(balance)}
            </div>
          )}
        </div>
        {defaultOption && (
          <Controller
            control={control}
            name="asset"
            defaultValue={{ amount: "", assetOption: defaultOption }}
            rules={{
              validate: (v) => {
                if (v.amount === "") {
                  return "Value is required";
                }
                if (Number(v.amount) <= 0) {
                  return "Value cannot be zero or less";
                }
                if (!v.assetOption) {
                  return "Currency selection missing";
                }
                if (
                  new Decimal(maxAmount === "" ? 0 : maxAmount).lessThan(
                    v.amount,
                  )
                ) {
                  return "Insufficient balance";
                }
              },
            }}
            render={({ field: { onChange, value } }) => {
              return (
                <AssetInput
                  options={options}
                  error={errors.asset?.message}
                  amount={value.amount}
                  selectedOption={value.assetOption}
                  onAssetChange={(opt) => {
                    onChange({ ...value, assetOption: opt });
                  }}
                  onAmountChange={(amount) => {
                    onChange({ ...value, amount });
                  }}
                />
              );
            }}
          />
        )}
        <div className="mb-2 text-sm font-semibold">To Address</div>
        <Controller
          name="address"
          control={control}
          rules={{
            validate: (v) => {
              if (!v) {
                return "Value is required";
              }
              if (!v.value) {
                return "Not a valid address";
              }
            },
          }}
          render={({ field: { onChange } }) => {
            return (
              <AddressInput
                onChange={(opt) => onChange(opt)}
                value={targetAddress}
                error={errors.address?.message}
              />
            );
          }}
        />
        <div className="mb-3 text-center text-sm">
          <span className="text-sky-600">
            Transfer Fee: {fee ? `${formatNumberCompact(0)} ${"SOL"}` : ""}
          </span>
        </div>
        <FormTransactionButton loading={true} disabled={!isValid}>
          Transfer
        </FormTransactionButton>
      </form>
    </Dialog.Panel>
  );
};

export default TransferButton;
