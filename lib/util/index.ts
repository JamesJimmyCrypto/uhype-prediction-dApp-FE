import { PublicKey } from "@solana/web3.js";

export const shortenAddress = (
  address: string,
  sliceStart: number = 6,
  sliceEnd: number = 4,
) => {
  return `${address?.slice(0, sliceStart)}...${address.slice(-sliceEnd)}`;
};

const hexChars = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

export const formatNumberLocalized = (
  num: number | bigint,
  locale: string = "en-US",
  maximumFractionDigits: number = 2,
) => {
  // Ensure displaying absolute zeros are unsigned(-), because javascript sucks sometimes.
  if (num === 0 || num === 0n) num = 0;

  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(num);
};

export const validateSolanaAddress = async (addr: string) => {
  let publicKey: PublicKey;
  try {
    publicKey = new PublicKey(addr);
    return await PublicKey.isOnCurve(publicKey.toBytes());
  } catch (err) {
    return false;
  }
};

export * from "./solana";