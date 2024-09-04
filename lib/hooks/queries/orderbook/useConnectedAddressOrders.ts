import { useQuery } from "@tanstack/react-query";
import { AssetId, isRpcSdk } from "@zeitgeistpm/sdk";
import Decimal from "decimal.js";
import { useSdkv2 } from "lib/hooks/useSdkv2";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOrders } from "./useOrders";

export const userOrdersRootKey = "user-orders";

export type MarketOrder = {
  id: number;
  makerAddress: string;
  makerAmount: Decimal;
  makerAsset: AssetId;
  marketId: number;
  takerAmount: Decimal;
  takerAsset: AssetId;
};

export const useUserOrders = () => {
  const [sdk, id] = useSdkv2();

  const { publicKey } = useWallet();
  const { data: orders } = useOrders();

  const query = useQuery(
    [id, userOrdersRootKey, orders?.length],
    async () => {
      return orders?.filter((order) => order.makerAddress === publicKey?.toString());
    },
    {
      enabled: Boolean(sdk && isRpcSdk(sdk)),
      staleTime: 10_000,
    },
  );

  return query;
};
