import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "components/front-page/PopularCategories";
import { create } from "lodash-es";

export const categoryCountsKey = "category-counts";

export const useCategoryCounts = () => {


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
      enabled: true,
      keepPreviousData: true,
      staleTime: 100_000,
    },
  );

  return query;
};
