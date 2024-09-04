import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "components/front-page/PopularCategories";
import { getCategoryCounts } from "lib/gql/popular-categories";
import { useSolanaConnection } from "../useSubscribeBlockEvents";
import { useConnection } from "@solana/wallet-adapter-react";
import { ZeitgeistIpfs } from "@zeitgeistpm/sdk";
import { endpointOptions, graphQlEndpoint } from "lib/constants";
import { create } from "lodash-es";

export const categoryCountsKey = "category-counts";

export const useCategoryCounts = () => {
  const sdk = create({
    provider: endpointOptions.map((e) => e.value),
    indexer: graphQlEndpoint,
    storage: ZeitgeistIpfs(),
  });

  const query = useQuery(
    [categoryCountsKey],
    async () => {
      // const categoryCounts = await getCategoryCounts(
      //   sdk.indexer.client,
      //   CATEGORIES.map((c) => c.name),
      // );

      return {
        data: [] as number[]
      }

    },
    {
      enabled: Boolean(sdk),
      keepPreviousData: true,
      staleTime: 100_000,
    },
  );

  return query;
};
