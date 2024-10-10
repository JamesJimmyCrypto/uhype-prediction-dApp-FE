import { useAtom } from "jotai";
import { blake2AsU8a, mnemonicGenerate } from "@polkadot/util-crypto";
import Opaque, { create } from "ts-opaque";
import { persistentAtom } from "../util/persistent-atom";
import { useWallet } from "@solana/wallet-adapter-react";
import { CourtSaltPhraseStorage } from "./CourtSaltPhraseStorage";
import { useConfirmation } from "../confirm-modal/useConfirmation";
import { downloadText } from "lib/util/download";
import { shortenAddress } from "lib/util";
import {
  CourtCaseJurorCompositeId,
  courtCaseJurorCompositeId,
} from "./CourtCaseJurorCompositeId";
import { useCourtVote } from "./useVoteOutcome";
import { useMarket } from "lib/hooks/queries/useMarket";
import { getIndexOf } from "@zeitgeistpm/sdk";

export type UseCourtSaltParams = {
  marketId: string;
  caseId: number;
};

export type CourtSalt = Opaque<Uint8Array, "CourtSalt">;

export type UseCourtSalt = {
  salt: CourtSalt;
  phraseStorage: CourtSaltPhraseStorage;
  isBackedUp: boolean;
  restoreBackup: (phraseSeed: CourtSaltPhraseStorage) => Promise<boolean>;
  downloadBackup: () => void;
  resetBackedUpState: () => void;
};

const courtSaltPhrasesAtom = persistentAtom<
  Record<CourtCaseJurorCompositeId, CourtSaltPhraseStorage>
>({
  key: "court-phrase-seeds",
  defaultValue: {},
});

const courtSaltBackupDownloadedAtom = persistentAtom<
  Record<CourtCaseJurorCompositeId, boolean>
>({
  key: "court-phrase-backup-downloaded",
  defaultValue: {},
});

export const useCourtSalt = ({
  marketId,
  caseId,
}: UseCourtSaltParams): UseCourtSalt => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() ?? "";
  const { prompt } = useConfirmation();
  const [saltPhrases, setSaltPhrases] = useAtom(courtSaltPhrasesAtom);
  const [backupDownloads, setBackupDownloads] = useAtom(
    courtSaltBackupDownloadedAtom,
  );

  const { data: market } = useMarket({ marketId });

  const { vote } = useCourtVote({
    caseId,
    marketId,
  });

  const id = courtCaseJurorCompositeId({
    marketId,
    caseId,
    juror: pubKey!,
  });

  let phraseStorage = saltPhrases[id];

  if (!phraseStorage) {
    phraseStorage = {
      caseId,
      marketId,
      juror: pubKey!,
      createdAt: Date.now(),
      phrase: mnemonicGenerate(),
    };

    setSaltPhrases((state) => ({
      ...state,
      [id]: phraseStorage,
    }));
  }

  const salt = create<CourtSalt>(blake2AsU8a(phraseStorage.phrase));

  const restoreBackup = async (backup: CourtSaltPhraseStorage) => {
    let error: Error | undefined;
    let proceed = true;

    if (backup.juror !== pubKey) {
      error = new Error(
        "Juror stored in backup file does not match current juror. This might be a backup for a different juror account.",
      );
    }

    if (backup.marketId !== marketId) {
      error = new Error(
        "Market id stored in backup file phrase does not match current market. This might be a backup for a different market.",
      );
    }

    if (backup.caseId !== caseId) {
      error = new Error(
        "Case id stored in backup phrase does not match current case. This might be a backup for a different court case.",
      );
    }

    if (error) {
      proceed = await prompt({
        title: "Invalid Backup",
        description: (
          <div>
            <div className="mb-3">{error.message}</div>
            <div className="font-bold">
              Are you sure you want to replace the current phrase?
            </div>
          </div>
        ),
        confirmLabel: "Proceed and replace",
      });
    }

    if (proceed) {
      setSaltPhrases((state) => ({
        ...state,
        [id]: {
          ...backup,
          caseId,
          marketId,
          juror: publicKey!,
        },
      }));

      return true;
    }

    return true;
  };

  const isBackedUp = backupDownloads[id];

  const downloadBackup = () => {
    const outcome =
      vote && market ? market?.categories?.[getIndexOf(vote)].name : vote;
    downloadText(
      `zeitgeist-court-case[${caseId}]-juror[${shortenAddress(pubKey!)}].txt`,
      JSON.stringify({ ...phraseStorage, vote: outcome }, undefined, 2),
    );
    setBackupDownloads((state) => ({
      ...state,
      [id]: true,
    }));
  };

  const resetBackedUpState = () => {
    setBackupDownloads((state) => ({
      ...state,
      [id]: false,
    }));
  };

  return {
    salt,
    phraseStorage,
    isBackedUp,
    restoreBackup,
    downloadBackup,
    resetBackedUpState,
  };
};
