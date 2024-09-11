// mostly taken from https://unified.jup.ag/
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import { TipLinkWalletAutoConnectV2 } from "@tiplink/wallet-adapter-react-ui";
import { useRouter } from "next/router";
import { useMemo } from "react";

const TIPLINK_CLIENT_ID = process.env.NEXT_PUBLIC_TIPLINK_CLIENT_ID;
export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const { query, isReady } = useRouter();

  const wallets = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const allwalletAdapters = {
      PhantomWalletAdapter: PhantomWalletAdapter,
    };

    const walletAdapters = Object.keys(allwalletAdapters)
      .filter((key) => key.includes("Adapter"))
      .map((key) => (allwalletAdapters as any)[key])
      .map((WalletAdapter: any) => new WalletAdapter());
    // add TipLinkWalletAdapter to adapters
    walletAdapters.push(
      new TipLinkWalletAdapter({
        title: "Dehype",
        // ask us if you don't have a client id already
        clientId: TIPLINK_CLIENT_ID!,
        theme: "dark",
      }),
    );

    return [...walletAdapters].filter((item) => item && item.name && item.icon);
  }, []);

  return (
    // If you want our autoconnect logic to work, need to wrap the provider with TipLinkWalletAutoConnect
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: true,
        env: "mainnet-beta",
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
        theme: "dark",
        lang: "en",
      }}
    >
      <TipLinkWalletAutoConnectV2 isReady={isReady} query={query}>
        {children}
      </TipLinkWalletAutoConnectV2>
    </UnifiedWalletProvider>
  );
}
