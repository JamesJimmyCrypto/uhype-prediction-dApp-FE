export const getExplorerUrl = (
  signature: string,
  cluster: "devnet" | "testnet" | "mainnet-beta" = "devnet"
): string => {
  const clusterUrl = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/tx/${signature}${clusterUrl}`;
};

/**
 * Convert Lamports to SOL.
 * @param lamports - The amount in Lamports.
 * @returns The equivalent value in SOL.
 */
export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / 1e9;
}