import { CategoricalAssetId, isRpcSdk } from "@zeitgeistpm/sdk";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { createCourtCommitmentHash } from "lib/util/create-vote-commitment-hash";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CourtSalt } from "./useCourtSalt";

export type UseCourtCommitmentHash = {
  commitmentHash?: Uint8Array;
};

export type UseCourtCommitmentHashParams = {
  salt: CourtSalt;
  selectedOutcome?: CategoricalAssetId;
};

export const useCourtCommitmentHash = ({
  salt,
  selectedOutcome,
}: UseCourtCommitmentHashParams): UseCourtCommitmentHash => {
  const [sdk] = useSdkv2();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  const commitmentHash = useMemo(() => {
    if (isRpcSdk(sdk) && selectedOutcome && publicKey) {
      return createCourtCommitmentHash(
        sdk,
        pubKey!,
        selectedOutcome,
        salt,
      );
    }
  }, [salt, selectedOutcome, publicKey]);

  return {
    commitmentHash,
  };
};
