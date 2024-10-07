import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { isRpcSdk } from "@zeitgeistpm/sdk";
import { ZTG } from "lib/constants";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { useExtrinsicFee } from "lib/hooks/queries/useExtrinsicFee";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useUserLocation } from "lib/hooks/useUserLocation";
import { useAccountModals } from "lib/state/account";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC, PropsWithChildren, useMemo } from "react";
import { Loader } from "./Loader";

interface TransactionButtonProps {
  preventDefault?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  className?: string;
  dataTest?: string;
  type?: "button" | "submit" | "reset";
  extrinsic?: SubmittableExtrinsic<"promise", ISubmittableResult>;
  disableFeeCheck?: boolean;
  loading?: boolean;
  connectText?: string;
}

const TransactionButton: FC<PropsWithChildren<TransactionButtonProps>> = ({
  onClick,
  disabled = false,
  className = "",
  dataTest = "",
  children,
  preventDefault,
  type = "button",
  extrinsic,
  disableFeeCheck = false,
  connectText = "Connect Wallet",
  loading,
}) => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  const accountModals = useAccountModals();
  const { locationAllowed } = useUserLocation();

  const click = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (preventDefault) {
      event?.preventDefault();
    }
    if (!pubKey) {
      accountModals.openWalletSelect();
    } else {
      onClick && onClick(event);
    }
  };

  const isDisabled = useMemo(() => {
    if (locationAllowed !== true) {
      return true;
    } else if (!publicKey) {
      return false;
    }
    return disabled;
  }, [locationAllowed, pubKey]);

  const colorClass = "bg-vermilion";

  const getButtonChildren = () => {
    if (loading) {
      return (
        <div className="center w-full rounded-full bg-inherit">
          <Loader variant={"Dark"} className="z-20 h-6 w-6" loading />
        </div>
      );
    } else if (pubKey) {
      return children;
    } else {
      return connectText;
    }
  };
  return (
    <button
      type={type}
      className={`ztg-transition h-[56px] w-full rounded-full text-white 
        focus:outline-none disabled:cursor-default  ${
          !isDisabled && "active:scale-95"
        } ${colorClass} ${className} disabled:!bg-slate-300`}
      onClick={(e) => click(e)}
      disabled={isDisabled}
      data-test={dataTest}
    >
      {getButtonChildren()}
    </button>
  );
};

export default TransactionButton;
