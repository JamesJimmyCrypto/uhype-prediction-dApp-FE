import { Dialog } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ZTG } from "@zeitgeistpm/sdk";
import Modal from "components/ui/Modal";
import TransactionButton from "components/ui/TransactionButton";
import { BLOCK_TIME_SECONDS, DAY_SECONDS } from "lib/constants";
import { useConnectedCourtParticipant } from "lib/hooks/queries/court/useConnectedCourtParticipant";
import { courtParticipantsRootKey } from "lib/hooks/queries/court/useCourtParticipants";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

const CourtUnstakeButton = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const constants = useChainConstants();
  const [sdk, id] = useSdkv2();
  const notificationStore = useNotifications();
  const { publicKey } = useWallet();
  const participant = useConnectedCourtParticipant();
  const queryClient = useQueryClient();

  return (
    <>
      <button
        className={`rounded-md bg-[#670031] px-4 py-2 text-white ${className}`}
        onClick={() => setIsOpen(true)}
      >
        Unstake
      </button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Panel className="w-full max-w-[564px] rounded-[10px] bg-white p-[30px]">
          <h3 className="mb-8">Unstake</h3>
          <div className="flex flex-col">
            <div className="flex">
              <div className="mr-auto">Stake:</div>
              <div>
                {participant?.stake.div(ZTG).toNumber()}{" "}
                {constants?.tokenSymbol}
              </div>
            </div>
            <div className="flex">
              <div className="mr-auto">Wait time:</div>
              {constants?.court.inflationPeriodBlocks && (
                <div>
                  {(constants?.court.inflationPeriodBlocks *
                    BLOCK_TIME_SECONDS) /
                    DAY_SECONDS}{" "}
                  Days
                </div>
              )}
            </div>
          </div>
          <div className="mt-[20px] flex w-full flex-col items-center gap-8 text-ztg-18-150 font-semibold">
            <div className="center mb-[10px] text-ztg-12-120 font-normal text-sky-600">
              <span className="ml-1 text-black">
                Network Fee: {0} {"SOL"}
              </span>
            </div>
            {/* <TransactionButton
              className="w-full max-w-[250px]"
              disabled={isPrepareLeaveLoading}
              onClick={() => prepareLeaveCourt()}
            >
              Confirm Leave
            </TransactionButton> */}
          </div>
        </Dialog.Panel>
      </Modal>
    </>
  );
};

export default CourtUnstakeButton;
