import { OgHead } from "./OgHead";
import { Market } from "src/types";
export const MarketMeta = ({ market }: { market: Market }) => {
  return (
    <>
      <OgHead
        title={market.title ?? ""}
        description="The application interface for Dehype Prediction Markets. Built on Solana, Dehype.fun is the leader in decentralized prediction markets."
        image={
          new URL(
            `/api/og/generate?marketId=${market.publicKey.toString()}`,
            process?.env?.NEXT_PUBLIC_SITE_URL?.match("vercel.app")
              ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
              : process.env.NEXT_PUBLIC_SITE_URL,
          )
        }
      />
    </>
  );
};

export default MarketMeta;
