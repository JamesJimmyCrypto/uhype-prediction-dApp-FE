import { Dialog, Tab } from "@headlessui/react";
import Modal from "components/ui/Modal";
import { useIdentity } from "lib/hooks/queries/useIdentity";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { Fragment } from "react";
import AcccountSettingsForm from "./AccountSettingsForm";
import FeePayingAssetSelect from "./FeePayingAssetSelect";
import OtherSettingsForm from "./OtherSettingsForm";

export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

enum TabSelection {
  Account,
  Proxy,
  Fees,
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [tabSelection, setTabSelection] = React.useState(TabSelection.Account);

  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";

  const { data: identity } = useIdentity(pubKey);

  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className="w-full max-w-[564px] rounded-md bg-white p-8">
        <h3 className="mb-5 text-center text-2xl">Settings</h3>
        <Tab.Group
          onChange={(index) => setTabSelection(index)}
          defaultIndex={tabSelection}
        >
          <Tab.List as={Fragment}>
            <div className="mb-5 flex justify-center border-b-1 border-b-sky-200 pb-3 text-sky-600">
              <div className="center flex-grow">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <span
                      className={
                        "cursor-pointer text-sm " +
                        (selected ? "font-semibold text-black" : "")
                      }
                    >
                      Account
                    </span>
                  )}
                </Tab>
              </div>
              <div className="center flex-grow">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <span
                      className={
                        "cursor-pointer text-sm " +
                        (selected ? "font-semibold text-black" : "")
                      }
                    >
                      Proxy
                    </span>
                  )}
                </Tab>
              </div>
              <div className="center flex-grow">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <span
                      className={
                        "cursor-pointer text-sm " +
                        (selected ? "font-semibold text-black" : "")
                      }
                    >
                      Fee Paying Asset
                    </span>
                  )}
                </Tab>
              </div>
            </div>
          </Tab.List>
        </Tab.Group>
        {
          {
            [TabSelection.Account]: identity ? (
              <AcccountSettingsForm identity={identity} />
            ) : (
              <></>
            ),
            [TabSelection.Proxy]: <OtherSettingsForm />,
            [TabSelection.Fees]: <FeePayingAssetSelect />,
          }[tabSelection]
        }
      </Dialog.Panel>
    </Modal>
  );
};

export default SettingsModal;
