import { useMarketProgram } from '@/src/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Market } from 'src/types/index';

export function useInfiniteMarkets() {
  const { getMarkets } = useMarketProgram();

  return useInfiniteQuery<Market[], Error>({
    queryKey: ['infiniteMarkets'],
    queryFn: async ({ pageParam = 0 }) => {
      // Refetch markets if necessary
      const markets = await getMarkets();
      const marketsResult = markets || [];

      console.log({ markets }, "ok");

      // Implement pagination by slicing the markets array
      const paginatedMarkets = marketsResult.slice(pageParam, pageParam + 10); // Example for slicing markets for pagination
      return paginatedMarkets;
    },
    getNextPageParam: (lastPage, pages) => {
      // If we have fewer than 10 markets on the last page, stop loading more
      if (lastPage?.length < 10) return undefined;

      // Otherwise, continue with the next batch
      return pages?.length * 10; // Increment the page parameter by the number of items per page
    },
  });
}
