import React, { FC, useMemo } from "react";
import { LogOut } from "react-feather";
import AccountSelect, { AccountOption } from "./AccountSelect";
import { useWallet } from "@solana/wallet-adapter-react";
import { useZtgBalance } from "lib/hooks/queries/useZtgBalance";
import { ZTG } from "@zeitgeistpm/sdk";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { formatNumberLocalized } from "lib/util";

const AccountModalContent: FC = () => {
  const { publicKey, disconnect: disconnectWallet } = useWallet();
  const { data: activeBalance } = useZtgBalance(publicKey?.toString());
  const constants = useChainConstants();

  return (
    <div className="flex flex-col">
      <AccountSelect
        options={[]}
        value={{
          label: publicKey?.toString() ?? "",
          value: publicKey?.toString() ?? "",
        }}
        onChange={() => {}}
      />
      <div className="mt-4 flex h-12.5 items-center justify-between">
        <div className="flex h-full w-full items-center rounded-lg bg-sky-100 px-2">
          <div className="flex items-center px-2">
            <div className="center rounded-full bg-white">
              <div className="center rounded-full bg-sky-100">
                <div className="center h-6 w-6 rounded-full">
                  <img
                    src="/currencies/ztg.svg"
                    alt="Account balance"
                    style={{ marginTop: "-1px" }}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex flex-col">
              <div className="text-xxs font-bold uppercase text-sky-600">
                balance
              </div>
              <div className="font-mono text-sm font-bold text-blue"></div>
            </div>
          </div>
        </div>
        <div
          className="ml-4 flex h-12.5 cursor-pointer items-center justify-center gap-2 rounded-lg bg-border-light px-2 text-white md:w-44"
          onClick={() => {
            disconnectWallet();
          }}
        >
          <div className="capitalize">disconnect</div>
          <LogOut size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default AccountModalContent;
