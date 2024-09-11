import { AssetId, BaseAssetId, IOForeignAssetId } from "@zeitgeistpm/sdk";
import { ChainName } from "./chains";

type ForeignAssetMetadata = {
  [foreignAssetId: number]: {
    coinGeckoId: string;
    originChain?: ChainName;
    image: string;
    withdrawSupported: boolean;
    withdrawDestinationFee?: string;
    tokenSymbol: string;
    subsquidId?: string;
  };
};

export const lookupAssetImagePath = (assetId?: AssetId | null) => {
  if (IOForeignAssetId.is(assetId)) {
    return FOREIGN_ASSET_METADATA[assetId.ForeignAsset]?.image;
  } else {
    return "/currencies/ztg.svg";
  }
};

export const lookupAssetSymbol = (baseAssetId?: BaseAssetId) => {
  const foreignAssetId = IOForeignAssetId.is(baseAssetId)
    ? baseAssetId.ForeignAsset
    : null;
  if (foreignAssetId == null) {
    return "ZTG";
  } else {
    return FOREIGN_ASSET_METADATA[foreignAssetId].tokenSymbol;
  }
};

const BATTERY_STATION_FOREIGN_ASSET_METADATA: ForeignAssetMetadata = {
  0: {
    image: "/currencies/solana.png",
    withdrawSupported: false,
    coinGeckoId: "solana",
    tokenSymbol: "SOL",
    subsquidId: "SOL",
  },
  1: {
    image: "/currencies/solana.png",
    withdrawSupported: false,
    coinGeckoId: "solana",
    tokenSymbol: "SOL",
    subsquidId: "SOL",
  },
  2: {
    //todo: add WSX logo
    image: "/currencies/usdc.jpg",
    withdrawSupported: false,
    coinGeckoId: "solana",
    tokenSymbol: "USDCS",
  },

};

const PROD_FOREIGN_ASSET_METADATA: ForeignAssetMetadata = {
  0: {
    originChain: "Solana",
    image: "/currencies/solana.png",
    withdrawSupported: true,
    coinGeckoId: "solana",
    tokenSymbol: "SOL",
    subsquidId: "SOL",
  },
};

export const FOREIGN_ASSET_METADATA: ForeignAssetMetadata =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? PROD_FOREIGN_ASSET_METADATA
    : BATTERY_STATION_FOREIGN_ASSET_METADATA;

export const findAssetImageForSymbol = (symbol?: string): string => {
  const foreignAssetId = Object.keys(FOREIGN_ASSET_METADATA).find(
    (foreignAssetId) =>
      FOREIGN_ASSET_METADATA[foreignAssetId].tokenSymbol === symbol,
  );
  if (symbol === undefined || foreignAssetId === undefined) {
    return lookupAssetImagePath();
  }
  return lookupAssetImagePath({ ForeignAsset: Number(foreignAssetId) });
};
