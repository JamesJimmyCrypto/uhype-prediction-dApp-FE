import { AssetId } from "@zeitgeistpm/sdk";
import { Unpacked } from "@zeitgeistpm/utility/dist/array";
import { isEqual } from "lodash-es";

export type CurrencyMetadata = {
  name: string;
  description: string;
  image: string;
  assetId: AssetId;
  twColor: string;
};

export const supportedCurrencies = [
  {
    name: "DHP" as const,
    description:
      "Create market with the native Dehype token as the base asset.",
    image: "/currencies/ztg.svg",
    twColor: "ztg-blue",
    assetId: { Ztg: null } as const,
  } satisfies CurrencyMetadata,
  {
    name: "SOL" as const,
    description: "Create market with DOT as the base asset.",
    image: "/currencies/dot_filled.png",
    twColor: "solana",
    assetId: { ForeignAsset: 0 } as const,
  } satisfies CurrencyMetadata,
  {
    name: "USDC" as const,
    description: "Create market with USDC as the base asset.",
    image: "/currencies/usdc.svg",
    twColor: "usdc",
    assetId: { ForeignAsset: 1 } as const,
  } satisfies CurrencyMetadata,
] as const;

export type SupportedCurrencyTag = Unpacked<
  typeof supportedCurrencies
>[number]["name"];

export const getMetadataForCurrency = (currency: SupportedCurrencyTag) =>
  supportedCurrencies.find((c) => c.name === currency);

export const getMetadataForCurrencyByAssetId = (assetId: AssetId) =>
  supportedCurrencies.find((c) => isEqual(c.assetId, assetId));
