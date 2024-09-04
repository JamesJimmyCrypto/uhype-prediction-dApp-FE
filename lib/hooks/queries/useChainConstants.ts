import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
// Connect to the Solana network
const connection = new Connection("https://api.mainnet-beta.solana.com");

export type ChainConstants = {
  tokenSymbol: string;
  blockTimeSec: number;
  decimals: number;
  totalSupply: number;
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

export const useChainConstants = () => {
  return useQuery<ChainConstants, Error>(
    ["solana-chain-constants"],
    async () => {
      try {
        // Fetch token information using SPL Token
        const mintAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
        const mintInfo = await getMint(connection, mintAddress);

        // Block time estimation in Solana
        const recentPerformanceSamples = await connection.getRecentPerformanceSamples();
        const blockTimeSec = recentPerformanceSamples.length > 0
          ? recentPerformanceSamples.reduce(
            (acc, sample) => acc + sample.numSlots / sample.samplePeriodSecs,
            0
          ) / recentPerformanceSamples.length
          : 0;

        // Transaction fee, example via fee calculator
        const { blockhash } = await connection.getRecentBlockhash();
        const feeCalculator = await connection.getFeeCalculatorForBlockhash(blockhash);
        const transactionFee = feeCalculator.value?.lamportsPerSignature || 0;

        const config: ChainConstants = {
          tokenSymbol: "SOL", // Or fetch from token program metadata
          decimals: mintInfo.decimals,
          totalSupply: Number(mintInfo.supply),
          blockTimeSec: blockTimeSec,
          transactionFee: transactionFee / 1e9, // Convert lamports to SOL
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
      } catch (error) {
        console.error("Failed to fetch Solana chain constants:", error);
        throw error;
      }
    },
    {
      keepPreviousData: true,
      staleTime: Infinity,
    }
  );
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