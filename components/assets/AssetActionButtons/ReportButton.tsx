import { Dialog } from "@headlessui/react";
import { CategoricalAssetId, ScalarAssetId } from "@zeitgeistpm/sdk";
import ScalarReportBox from "components/outcomes/ScalarReportBox";
import Modal from "components/ui/Modal";
import SecondaryButton from "components/ui/SecondaryButton";
import { useMarketStage } from "lib/hooks/queries/useMarketStage";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Market } from "@/src/types";

const ReportButton = ({
  market,
  assetId,
}: {
  market: Market;
  assetId?: ScalarAssetId | CategoricalAssetId;
}) => {
  const { publicKey } = useWallet();
  const notificationStore = useNotifications();
  const [scalarReportBoxOpen, setScalarReportBoxOpen] = useState(false);

  if (!market) return <></>;

  const { data: stage } = useMarketStage(market);

  // const outcomeName = assetId
  //   ? market.categories?.[getIndexOf(assetId)]?.name
  //   : "";

  // const connectedWalletIsOracle = market.oracle === publicKey?.toString();

  // const reportDisabled =
  //   !isRpcSdk(sdk) ||
  //   !stage ||
  //   isLoading ||
  //   isSuccess ||
  //   (stage.type === "OracleReportingPeriod" && !connectedWalletIsOracle);

  const handleClick = async () => {
    // if (!isRpcSdk(sdk)) return;
    // if (market.marketType.scalar) {
    //   setScalarReportBoxOpen(true);
    // } else {
    //   send();
    // }
  };

  return (
    <>
      <SecondaryButton onClick={handleClick} disabled={true}>
        Report Outcome
      </SecondaryButton>

      <Modal
        open={scalarReportBoxOpen}
        onClose={() => setScalarReportBoxOpen(false)}
      >
        <Dialog.Panel className="rounded-ztg-10 bg-white p-[15px]">
          <div className="min-w-[380px]">
            <div className="mb-2 text-base font-bold text-black">
              Report outcome
            </div>
            {/* /   <ScalarReportBox market={market} /> */}
          </div>
        </Dialog.Panel>
      </Modal>
    </>
  );
};

export default ReportButton;
