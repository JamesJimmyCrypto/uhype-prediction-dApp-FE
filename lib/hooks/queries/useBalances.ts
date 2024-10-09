import { useQueries } from "@tanstack/react-query";
import { AssetId, isRpcSdk } from "@zeitgeistpm/sdk";
import { useSdkv2 } from "../useSdkv2";
import { balanceRootKey, fetchAssetBalance } from "./useBalance";

export const useBalances = (
  assetIds: AssetId[],
  address?: string,
  blockNumber?: number,
) => {
  const [sdk, id] = useSdkv2();

  const queries = useQueries({
    queries: assetIds.map((assetId) => {
      return {
        queryKey: [id, balanceRootKey, address, assetId, blockNumber],
        queryFn: async () => {

        },
        enabled: Boolean(sdk && address && isRpcSdk(sdk) && assetId),
        keepPreviousData: true,
      };
    }),
  });

  return queries;
};
