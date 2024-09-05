import { Menu, Popover, Transition } from "@headlessui/react";
import { ZTG } from "@zeitgeistpm/sdk";
import Avatar from "components/ui/Avatar";
import Modal from "components/ui/Modal";
import Decimal from "decimal.js";
import { useBalance } from "lib/hooks/queries/useBalance";
import { useZtgBalance } from "lib/hooks/queries/useZtgBalance";
import { useAccountModals } from "lib/state/account";
import { useUserLocation } from "lib/hooks/useUserLocation";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatNumberLocalized, shortenAddress } from "lib/util";
import { FaNetworkWired } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, Fragment, PropsWithChildren, useState } from "react";
import {
  ArrowRight,
  BarChart,
  ChevronDown,
  DollarSign,
  Frown,
  Settings,
  User,
} from "react-feather";
import { useChainConstants } from "../../lib/hooks/queries/useChainConstants";
import { DesktopOnboardingModal } from "./OnboardingModal";
import SettingsModal from "components/settings/SettingsModal";
import CopyIcon from "../ui/CopyIcon";
import { useSolanaTokenBalance } from "lib/hooks/solana";
import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";

const BalanceRow = ({
  imgPath,
  balance,
  units,
}: {
  imgPath: string;
  units?: string;
  balance?: Decimal;
}) => {
  return (
    <div className="flex items-center">
      <img src={imgPath} height={"24px"} width="24px" />
      <div
        className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-bold`}
      >
        {balance &&
          `${formatNumberLocalized(balance?.div(ZTG).abs().toNumber())} ${
            units ?? ""
          }`}
      </div>
    </div>
  );
};

const HeaderActionButton: FC<
  PropsWithChildren<{
    onClick: () => void;
    disabled: boolean;
  }>
> = ({ onClick, disabled, children }) => {
  return (
    <button
      className={`flex w-[185px] cursor-pointer items-center justify-center rounded-full border-2 border-white px-6 font-medium leading-[40px] text-white disabled:cursor-default disabled:opacity-30`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const AccountButton: FC<{
  connectButtonClassname?: string;
  autoClose?: boolean;
  avatarDeps?: any[];
}> = ({ connectButtonClassname, autoClose, avatarDeps }) => {
  const accountModals = useAccountModals();
  const { locationAllowed } = useUserLocation();
  const [hovering, setHovering] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGetZtgModal, setShowGetZtgModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { publicKey, disconnect: disconnectWallet } = useWallet();
  const { data: activeBalance } = useZtgBalance(publicKey?.toString());
  // const { data: solanaBalance } = useSolanaTokenBalance(publicKey);
  const { data: constants } = useChainConstants();

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const { pathname } = useRouter();

  return (
    <>
      {!publicKey ? (
        <div
          className="ml-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <UnifiedWalletButton />

          {hovering === true && locationAllowed !== true ? (
            <div className="absolute bottom-0 right-0 rounded bg-white text-sm font-bold text-black">
              Your jurisdiction is not authorised to trade
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div className="relative ml-auto">
          <Menu>
            {({ open }) => (
              <>
                <div>
                  <div className="relative flex h-11">
                    <Menu.Button>
                      <div
                        className={`relative z-30 flex	h-full flex-1 cursor-pointer items-center justify-end rounded-full  ${
                          open
                            ? "border-orange-500"
                            : pathname === "/"
                              ? " border-white"
                              : "border-black"
                        }`}
                      >
                        <div
                          className={`flex h-full items-center rounded-full border-2 bg-black py-1 pl-1.5 text-white transition-all md:py-0 ${
                            open ? "border-sunglow-2" : "border-white"
                          }`}
                        >
                          <div className={`rounded-full ring-2`}>
                            {publicKey && (
                              <Avatar
                                zoomed
                                address={publicKey.toString()}
                                deps={avatarDeps}
                              />
                            )}
                          </div>
                          <span
                            className={`hidden h-full pl-2 text-sm font-medium leading-[40px] transition-all md:block ${
                              open ? "text-sunglow-2" : "text-white"
                            }`}
                          >
                            {publicKey &&
                              shortenAddress(publicKey.toString(), 6, 4)}
                          </span>

                          <div className="pr-1">
                            <ChevronDown
                              size={16}
                              viewBox="4 3 16 16"
                              className={`box-content px-2 ${
                                open && "rotate-180 text-sunglow-2"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </Menu.Button>
                  </div>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 translate-y-2 md:translate-y-0 md:scale-95"
                  enterTo="transform opacity-100 translate-y-0 md:scale-100"
                  leave="transition ease-in translate-y-2 md:translate-y-0 duration-75"
                  leaveFrom="transform opacity-100 translate-y-0 md:scale-100"
                  leaveTo="transform opacity-0 translate-y-2 md:translate-y-0 md:scale-95"
                >
                  <Menu.Items className="fixed left-0 z-40 mt-3 h-full w-full origin-top-right divide-y divide-gray-100 overflow-hidden bg-white py-3 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:absolute md:left-auto md:right-0 md:mt-6 md:h-auto md:w-64 md:rounded-md">
                    <div className="">
                      <div className="mb-3 flex flex-col gap-2 border-b-2 px-6 py-2">
                        <BalanceRow
                          imgPath="/currencies/solana.jpg"
                          units={constants?.tokenSymbol}
                          balance={activeBalance}
                        />
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={`/portfolio/${publicKey}?mainTab=Balances`}
                              className="mt-3"
                            >
                              <div className="mb-3 flex items-center">
                                <div className="text-xs font-medium">
                                  Go to Balances
                                </div>
                                <ArrowRight
                                  size={14}
                                  className="ml-2 md:ml-auto"
                                />
                              </div>
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className="mb-3 flex items-center px-6 hover:bg-slate-100"
                            onClick={() => setShowGetZtgModal(true)}
                          >
                            <DollarSign />
                            <button
                              className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold`}
                            >
                              Get ZTG
                            </button>
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link href={`/portfolio/${publicKey}`}>
                            <div className="mb-3 flex items-center px-6 hover:bg-slate-100">
                              <BarChart />
                              <button
                                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold`}
                              >
                                Portfolio
                              </button>
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className="mb-3 flex cursor-pointer items-center px-6 hover:bg-slate-100"
                            onClick={() => setShowSettingsModal(true)}
                          >
                            <Settings />
                            <button
                              className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold`}
                            >
                              Settings
                            </button>
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className="flex items-center px-6 hover:bg-slate-100"
                            onClick={() => {
                              disconnectWallet();
                            }}
                          >
                            <Frown />
                            <button
                              className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold`}
                            >
                              Disconnect
                            </button>
                          </div>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </div>
      )}
      <SettingsModal
        open={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
        }}
      />
      <>
        <Modal open={showOnboarding} onClose={() => setShowOnboarding(false)}>
          <DesktopOnboardingModal />
        </Modal>
        <Modal open={showGetZtgModal} onClose={() => setShowGetZtgModal(false)}>
          <DesktopOnboardingModal step={4} />
        </Modal>
      </>
    </>
  );
};

export default AccountButton;