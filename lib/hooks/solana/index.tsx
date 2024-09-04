import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export const useSolanaTokenBalance = (publicKey: PublicKey | null) => {
  const [balance, setBalance] = useState<number | null>(null);
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((balance) => {
        setBalance(balance / 1e9); // Convert lamports to SOL
      });
    }
  }, [publicKey]);

  return { data: balance };
};
