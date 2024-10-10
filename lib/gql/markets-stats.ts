import { gql, GraphQLClient } from "graphql-request";

const query = gql`
  query MarketStats($ids: [Int!]!) {
    marketStats(marketId: $ids) {
      participants
      liquidity
      marketId
    }
  }
`;

export type MarketStats = {
  participants: number;
  liquidity: string;
  marketId: string;
};

export const getMarketsStats = async (
  client: GraphQLClient,
  ids: string[],
): Promise<MarketStats[]> => {
  if (ids.length === 0) return [];
  const { marketStats } = await client.request<{
    marketStats: MarketStats[];
  }>(query, { ids });
  return marketStats;
};
