import { useWallet } from "@solana/wallet-adapter-react";
import { useCourtParticipants } from "./useCourtParticipants";

export const useConnectedCourtParticipant = () => {
  const { data: participants } = useCourtParticipants();
  const { publicKey } = useWallet();

  const participant = participants?.find(
    (p) => p.address === publicKey?.toString(),
  );

  return participant;
};
