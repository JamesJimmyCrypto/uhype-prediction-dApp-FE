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


import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";

// Function to fetch the SOL balance of a connected wallet
const fetchSolBalance = async (connection: Connection, publicKey: PublicKey): Promise<number> => {
  if (!connection || !publicKey) {
    throw new Error("Connection or Wallet not provided.");
  }

  const balanceLamports = await connection.getBalance(publicKey);
  return balanceLamports / LAMPORTS_PER_SOL; // Convert lamports to SOL
};

// Custom hook to get the SOL balance
export const useSolBalance = (publicKey: PublicKey | null) => {
  const { connection } = useConnection();
  return useQuery<number, Error>(
    ["solBalance", publicKey?.toString()], // Unique query key (stringify the PublicKey for better caching)
    () => {
      if (!publicKey) throw new Error("Public key is not available.");
      return fetchSolBalance(connection, publicKey); // Pass connection and publicKey to the fetch function
    },
    {
      enabled: !!publicKey, // Only run the query if the public key is available
      refetchInterval: 30000, // Optionally refetch every 30 seconds
      staleTime: 60000, // Cache balance for 1 minute
    }
  );
};
