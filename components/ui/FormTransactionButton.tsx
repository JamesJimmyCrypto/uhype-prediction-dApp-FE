import { FC, PropsWithChildren } from "react";
import TransactionButton from "./TransactionButton";

interface TransactionButtonProps {
  disabled?: boolean;
  className?: string;
  dataTest?: string;
  disableFeeCheck?: boolean;
  type?: "button" | "submit" | "reset";
  loading: boolean | undefined;
  onClick?: () => void;
}

const FormTransactionButton: FC<PropsWithChildren<TransactionButtonProps>> = ({
  onClick,
  disabled = false,
  className = "",
  dataTest = "",
  disableFeeCheck = false,
  type = "submit",
  children,
  loading = undefined,
}) => {
  return (
    <TransactionButton
      type={type}
      disabled={disabled}
      className={className}
      dataTest={dataTest}
      disableFeeCheck={disableFeeCheck}
      loading={loading}
      onClick={onClick}
    >
      {children}
    </TransactionButton>
  );
};

export default FormTransactionButton;
