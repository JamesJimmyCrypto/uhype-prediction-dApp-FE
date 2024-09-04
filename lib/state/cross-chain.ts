import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { atom, useAtom } from "jotai";
import { loadable } from "jotai/utils";
import { ChainName, SOLANA_CHAINS } from "lib/constants/chains"; // Assume you have a similar structure


type Connections = { [key: string]: Connection };

const solanaConnectionsAtom = loadable(
  atom(async () => {
    const connections = SOLANA_CHAINS.map((chain) =>
      new Connection(clusterApiUrl(chain.network)) // Use clusterApiUrl for common clusters (e.g., 'mainnet-beta', 'devnet')
    );

    return connections.reduce(
      (conns, conn, index) => ({ ...conns, [SOLANA_CHAINS[index].name]: conn }),
      {}
    ) as Connections;
  })
);


export type UseSolanaConnections = {
  connections: { [key: string]: Connection };
  isLoading: boolean;
};


export const useSolanaConnections = () => {
  const [value] = useAtom(solanaConnectionsAtom);

  if (value.state === "hasData") {
    return { connections: value.data, isLoading: false };
  } else {
    return { connections: null, isLoading: value.state === "loading" };
  }
};

export const useChain = (chainName: ChainName) => {
  const { connections } = useSolanaConnections();

  const chain = SOLANA_CHAINS.find((chain) => chain.name === chainName);
  const connection = chain?.name ? connections?.[chain?.name] : undefined;

  return { connection, chain };
};
