import { SupportedCurrencyTag } from "lib/constants/supported-currencies";

/**
 * A map of the minimum liquidity required for a market creation
 * pr supported currency.
 */

export const minBaseLiquidity: Record<SupportedCurrencyTag, number> = {
  DHP: 200,
  SOL: 10,
  USDC: 50,
};
