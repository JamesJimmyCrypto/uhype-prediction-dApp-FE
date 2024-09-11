import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { useNotifications } from "lib/state/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { extrinsicCallback, signAndSend } from "lib/util/tx";
import { NextPage } from "next";
import { ChangeEvent, useState } from "react";
import airdrop from "../public/airdrop.json";
import { environment } from "lib/constants";
import NotFoundPage from "./404";

const TOTAL_AIRDROP_ZTG = 1_000_000;
const ZTG_PER_ADDRESS = TOTAL_AIRDROP_ZTG / airdrop.length;
const AIRDROP_REMARK_PREFIX = "dehype.airdrop-1";

const ClaimPage: NextPage = () => {
  if (process.env.NEXT_PUBLIC_SHOW_AIRDROP !== "true") {
    return <NotFoundPage />;
  }
  const [showEligibility, setShowEligibility] = useState(false);
  const [solanaAddress, setSolanaAddress] = useState("");

  return (
    <div className="relative mt-10 flex items-center justify-center">
      <div
        className="absolute z-[-1] h-full w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(254, 207, 255, 0.3) 20.83%, rgba(205, 222, 255, 0.3) 54.17%, rgba(201, 232, 255, 0.3) 57.29%, rgba(245, 245, 245, 0) 100%)",
        }}
      ></div>
      <div className="flex max-w-[850px] flex-col items-center justify-center gap-y-5">
        <div className="flex w-full gap-x-10">
          <div className="w-full  text-4xl font-bold sm:text-5xl sm:!leading-[77px] md:text-6xl">
            Find out if you are eligible for the Airdrop
          </div>
          <img
            className="relative mr-auto hidden w-2/5 scale-110 sm:block"
            src="/airdrop.svg"
            alt="Airdrop"
          />
        </div>
        <div className="w-full whitespace-pre-wrap text-lg">
          The snapshot was taken February 14th, 2024 (22:14:54 UTC). Only
          wallets that stake Dehype before the snapshot will be eligible. Claims
          will be open until July 1st, 2024.{" "}
          <span className="mt-4 italic underline">
            Users will receive their HYPE tokens after the claim period.
          </span>
        </div>
        {showEligibility === false ? (
          <>
            <div className="w-full text-xl font-bold">
              Enter your Solana address below to check your eligibility:
            </div>
            <div className="flex w-full flex-col gap-4 rounded-md bg-[#DFE5ED] p-7 sm:flex-row">
              <div className="relative flex w-full flex-col">
                <input
                  className="w-full rounded-md bg-white p-2"
                  placeholder="Enter Solana address"
                  spellCheck={false}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setSolanaAddress(event.target.value);
                  }}
                />
                {
                  <div className="absolute top-10 text-xs text-red-600">
                    Invalid address
                  </div>
                }
              </div>

              <button
                className="h-[40px] w-full rounded-md bg-[#2468E2] text-white disabled:opacity-50 sm:w-[200px]"
                onClick={() => {
                  setShowEligibility(true);
                }}
                disabled={
                  solanaAddress === "" ||
                  solanaAddress == null ||
                  !solanaAddress
                }
              >
                Check Eligibility
              </button>
            </div>
          </>
        ) : (
          <Eligibility
            solanaAddress={solanaAddress}
            onCheckAgain={() => {
              setShowEligibility(false);
              setSolanaAddress("");
            }}
          />
        )}
      </div>
    </div>
  );
};

const Eligibility = ({
  solanaAddress,
  onCheckAgain,
}: {
  solanaAddress: string;
  onCheckAgain: () => void;
}) => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString();
  const notifications = useNotifications();

  const [claimAddress, setClaimAddress] = useState<string | null>(null);

  const isEligible = airdrop.some(
    (airdropAddress) => airdropAddress === solanaAddress,
  );

  const isValid = claimAddress === null || validateAddress(claimAddress);
  const tx = `${AIRDROP_REMARK_PREFIX}-${claimAddress}`;

  const connectedWalletMatchesSolanaAddress = addressesMatch(
    solanaAddress,
    pubKey ?? "",
  );

  // const txHex = tx?.toHex();

  const submitClaim = () => {
    if (!tx) return;
    if (!publicKey) return;
  };
  //   signAndSend(
  //     tx,
  //     publicKey,
  //     extrinsicCallback({
  //       api: api,
  //       notifications,
  //       broadcastCallback: () => {
  //         notifications?.pushNotification("Broadcasting transaction...", {
  //           autoRemove: true,
  //         });
  //       },
  //       successCallback: (data) => {
  //         notifications?.pushNotification(`Successfully claimed`, {
  //           autoRemove: true,
  //           type: "Success",
  //         });
  //       },
  //       failCallback: (error) => {
  //         notifications.pushNotification(error, { type: "Error" });
  //       },
  //     }),
  //   ).catch((error) => {
  //     notifications.pushNotification(error?.toString() ?? "Unknown Error", {
  //       type: "Error",
  //     });
  //   });
  // };

  return (
    <>
      {isEligible ? (
        <>
          <div className="w-full text-xl font-bold">
            You are eligible for at least {Math.floor(ZTG_PER_ADDRESS)} ZTG,
            enter Zeitgeist address to claim
          </div>
          <div className="flex w-full flex-col">
            <div className="flex w-full flex-col gap-4 rounded-md bg-[#DFE5ED] p-7 sm:flex-row">
              <div className="relative flex w-full flex-col">
                <input
                  className="w-full rounded-md bg-white p-2"
                  placeholder="Zeitgeist Address"
                  spellCheck={false}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setClaimAddress(event.target.value);
                  }}
                />
                {isValid === false && (
                  <div className="absolute top-10 text-xs text-red-600">
                    Invalid Zeitgeist address
                  </div>
                )}
                {isValid === true &&
                  claimAddress != null &&
                  connectedWalletMatchesSolanaAddress === false && (
                    <div className="absolute top-10 text-xs text-red-600">
                      Connected wallet doesn't match Solana address
                    </div>
                  )}
              </div>
              <button
                className="h-[40px] w-full rounded-md bg-[#2468E2] text-white disabled:opacity-50 sm:w-[200px]"
                disabled={
                  claimAddress === null ||
                  isValid === false ||
                  !publicKey ||
                  connectedWalletMatchesSolanaAddress === false
                }
                onClick={() => submitClaim()}
              >
                Claim Airdrop
              </button>
            </div>
            <a
              href={`https://solscan.io/tx/${"TOBEUPDATED"}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 text-sm text-blue-700"
            >
              Wallet not supported? Enter the Solana transaction address and
              view details on Solscan
            </a>
          </div>
        </>
      ) : (
        <div className="w-full text-xl font-bold">
          You are not eligible for this airdrop
        </div>
      )}
      <div className="flex w-full">
        <button
          className="h-[40px] w-[200px] rounded-md bg-[#2468E2] text-white"
          onClick={() => onCheckAgain()}
        >
          Check another address
        </button>
      </div>
    </>
  );
};

const validateAddress = (address: string) => {
  try {
    const encodedAddress = encodeAddress(decodeAddress(address)).toString();
    return encodedAddress === address;
  } catch {
    return false;
  }
};

const addressesMatch = (address1: string, address2: string) => {
  try {
    const encodedAddress1 = encodeAddress(
      decodeAddress(address1),
      0,
    ).toString();
    const encodedAddress2 = encodeAddress(
      decodeAddress(address2),
      0,
    ).toString();
    return encodedAddress1 === encodedAddress2;
  } catch {
    return false;
  }
};

export default ClaimPage;
