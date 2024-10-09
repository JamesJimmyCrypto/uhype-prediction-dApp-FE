import { useQuery } from "@tanstack/react-query";
import { isRpcSdk } from "@zeitgeistpm/sdk";

export const identityRootKey = "identity";

export const useIdentity = (address?: string) => {

  const query = useQuery(
    [identityRootKey, address],
    async () => {

      return null;
    },
    {
      enabled: false,
      staleTime: 100_000,
    },
  );

  return query;
};
