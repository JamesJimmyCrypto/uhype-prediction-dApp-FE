export const getExplorerUrl = (
  signature: string,
  cluster: "devnet" | "testnet" | "mainnet-beta" = "devnet"
): string => {
  const clusterUrl = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/tx/${signature}${clusterUrl}`;
};