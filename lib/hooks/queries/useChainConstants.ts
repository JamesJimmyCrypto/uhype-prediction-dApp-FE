import { Connection, PublicKey } from "@solana/web3.js";
// Connect to the Solana network
const connection = new Connection("https://api.mainnet-beta.solana.com");

export type ChainConstants = {
  tokenSymbol: string;
  blockTimeSec: number;
  decimals: number;
  transactionFee: number;
  markets: {
    maxDisputes: number;
    disputeBond: number; // initial dispute amount
    oracleBond: number;
    outsiderBond: number;
    advisoryBond: number;
    validityBond: number;
    maxCategories: number;
    minCategories: number;
    advisoryBondSlashPercentage: number;
  };
  swaps: {
    exitFee: number;
  };
  identity: {
    basicDeposit: number;
    fieldDeposit: number;
  };
  balances: {
    existentialDeposit: number;
  };
  court: {
    maxCourtParticipants: number;
    maxAppeals: number;
    minJurorStake: number;
    inflationPeriodBlocks: number;
    maxDelegations: number;
    appealBond: number;
  };
};

export const useChainConstants = (): ChainConstants => {
  const config: ChainConstants = {
    tokenSymbol: "SOL",
    decimals: 9,
    blockTimeSec: 400,
    transactionFee: 0.000005,
    markets: {
      maxDisputes: 0,
      disputeBond: 0, // initial dispute amount
      oracleBond: 0,
      outsiderBond: 0,
      advisoryBond: 0,
      validityBond: 0,
      maxCategories: 0,
      minCategories: 0,
      advisoryBondSlashPercentage: 0
    },
    swaps: {
      exitFee: 0
    },
    identity: {
      basicDeposit: 0,
      fieldDeposit: 0,
    },
    balances: {
      existentialDeposit: 0,
    },
    court: {
      maxCourtParticipants: 0,
      maxAppeals: 0,
      minJurorStake: 0,
      inflationPeriodBlocks: 0,
      maxDelegations: 0,
      appealBond: 0,
    },
  };

  return config;
};


export const CHAIN_PROPERTIES = {
  isEthereum: false, // Solana does not use Ethereum addresses
  tokenDecimals: [9], // Common example: SOL has 9 decimals
  tokenSymbol: ['SOL'], // Example token symbol: SOL
};

// If you need to use it as a TypeScript object, you can define it with a type:

export type ChainProperties = {
  isEthereum: boolean;
  tokenDecimals: number[];
  tokenSymbol: string[];
};

export const solanaChainPropertiesTyped: ChainProperties = {
  isEthereum: false,
  tokenDecimals: [9],
  tokenSymbol: ['SOL'],
};