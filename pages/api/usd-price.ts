import { COIN_GECKO_API_KEY } from "lib/constants";
import { NextApiRequest, NextApiResponse } from "next";

//discourage others from using this endpoint as proxy for coingecko
const allowedAssets = ["dhp", "solana", "usdc"];

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  response.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=300"); //Vercel's Edge Cache to have a TTL (Time To Live) of 300 seconds
  response.setHeader("CDN-Cache-Control", "public, s-maxage=60"); //Downstream CDNs to have a TTL of 60 seconds
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=10", //Clients to have a TTL of 10 seconds
  );
  const assetQuery = request.query["asset"];
  const asset = Array.isArray(assetQuery) ? assetQuery[0] : assetQuery;
  if (allowedAssets.includes(asset?.toLowerCase() ?? "") === false) {
    return response.status(200).json({
      body: {},
    });
  }

  const url = COIN_GECKO_API_KEY
    ? `https://pro-api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd&x_cg_pro_api_key=${COIN_GECKO_API_KEY}`
    : `https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd`;

  const res = await fetch(url);
  const json = await res?.json();

  const price = asset ? json[asset]?.usd : null;

  return response.status(200).json({
    body: {
      price,
    },
  });
}
