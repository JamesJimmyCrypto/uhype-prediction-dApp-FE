import "@polkadot/api-augment";
import { useQuery } from "@tanstack/react-query";
import Decimal from "decimal.js";

export const polkadotReferendumVotesRootKey = "polkadot-referendum-votes";

export const useReferendumVotes = (referendumIndex: number) => {

  const enabled = true;
  const query = useQuery(
    [polkadotReferendumVotesRootKey, referendumIndex],
    async () => {
      if (enabled) {
        // const referendum =
        //   await api.query.referenda.referendumInfoFor(referendumIndex);

        // const votes = referendum.unwrapOr(null)?.isOngoing
        //   ? referendum.unwrap().asOngoing.tally
        //   : null;

        // if (!votes) return null;

        // const ayes = new Decimal(votes.ayes.toString());
        // const nays = new Decimal(votes.nays.toString());
        // const total = ayes.plus(nays);
        const ayes = new Decimal(1);
        const nays = new Decimal(1);
        const total = 100;
        return {
          ayes,
          nays,
          ayePercentage: ayes.div(total),
          nayPercentage: nays.div(total),
        };
      }
    },
    {
      enabled: enabled,
      staleTime: Infinity,
      refetchInterval: 60_000,
    },
  );

  return query;
};
