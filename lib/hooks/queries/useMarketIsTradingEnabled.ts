import { useQuery } from "@tanstack/react-query";
import { useSdkv2 } from "../useSdkv2";
import { Market } from "src/types"
export const rootKey = "market-enabled";

export const useMarketIsTradingEnabled = (
  market?: Market,
) => {
  const [sdk, id] = useSdkv2();

  const enabled = !!sdk && !!market;
  const { data: isEnabled } = useQuery(
    [id, rootKey, market?.publicKey],
    async () => {
      if (!enabled) return;

      return (
        true
      );
    },
    {
      enabled: Boolean(market),
      initialData: false,
    },
  );

  return isEnabled;
};
