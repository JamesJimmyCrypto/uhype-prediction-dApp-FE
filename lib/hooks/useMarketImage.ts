import { CATEGORY_IMAGES } from "lib/constants/category-images";
import { useMarketCmsMetadata } from "./queries/cms/useMarketCmsMetadata";
import { FullMarketFragment } from "@zeitgeistpm/indexer";

export const useMarketImage = (
  market: FullMarketFragment | { marketId: string; tags?: string[] },
  opts?: {
    fallback?: string;
  },
) => {
  const cmsQuery = useMarketCmsMetadata(market.marketId);

  return {
    ...cmsQuery,
    data: cmsQuery.data?.imageUrl,
  };
};

export const getFallbackImage = (
  marketTags: FullMarketFragment["tags"],
  marketId: string,
) => {
  const tagIndex = 0;
  const pickedTag = marketTags?.[tagIndex];

  const tag = (
    pickedTag && pickedTag in CATEGORY_IMAGES ? pickedTag : "untagged"
  ) as keyof typeof CATEGORY_IMAGES;

  const category = CATEGORY_IMAGES[tag];

  const fallback = category[category.length];
  return fallback;
};
