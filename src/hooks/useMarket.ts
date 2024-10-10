import { BN, Idl, IdlAccounts, Program } from "@coral-xyz/anchor";
import useAnchorProvider from "./useAnchorProvider";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, Keypair } from "@solana/web3.js";
import marketIDL from "../idl/dehype.json";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SystemProgram } from "@solana/web3.js";
import { Answer, Market, MarketAccount, MarketResponse } from "src/types/index";
import { ComputeBudgetProgram, SendTransactionError } from "@solana/web3.js";
export function useMarketProgram() {
  const provider = useAnchorProvider();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const program = new Program(
    marketIDL as Idl,
    "4RtM2Uf1xfeMbjXMjXYPZnwoTx9Jom2sFQyZstX2zQvk",
    provider,
  );
  const queryClient = useQueryClient();

  const createMarket = useMutation({
    mutationKey: ["createMarket"],
    mutationFn: async ({
      title,
      description,
      coverUrl,
      answers,
      creatorFeePercentage,
      serviceFeePercentage
    }: {
      title: string;
      description: string;
      coverUrl: string;
      answers: string[];
      creatorFeePercentage: BN; // u64
      serviceFeePercentage: BN; // u64
    }) => {
      const marketKey = new BN(Math.floor(Math.random() * 10000))
      console.log({ connection, publicKey, signTransaction })
      if (!publicKey) throw new Error("Wallet not connected");
      const [marketPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketKey.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [answerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("answer"), marketKey.toArrayLike(Buffer, "le", 8)],
        program.programId
      );



      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("market_vault"), marketKey.toArrayLike(Buffer, "le", 8)],
        program.programId
      );


      // Create a transaction to increase compute units
      // Add the createMarket instruction to the transaction
      const transaction = await program.methods
        .createMarket(
          marketKey,
          title,
          description,
          coverUrl,
          answers,
          creatorFeePercentage,
          serviceFeePercentage,
        )
        .accounts({
          creator: publicKey,
          marketAccount: marketPDA,
          answerAccount: answerPDA,
          vaultAccount: vaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .transaction(); // Use `instruction()` to get the instruction instead of transaction


      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction with the wallet
      if (!signTransaction) {
        throw new Error("Wallet not connected or signTransaction method is not available.");
      }


      try {
        const signedTransaction = await signTransaction(transaction);

        const serializedTransaction = signedTransaction.serialize();
        const signature = await connection.sendRawTransaction(serializedTransaction);
        await connection.confirmTransaction(signature, "confirmed");

        console.log("Transaction Signature:", signature);
        return { signature, marketPubkey: marketPDA };
      } catch (error) {
        if (error instanceof SendTransactionError) {
          // If the error is a SendTransactionError, get logs
          console.error("Transaction logs:", await error.getLogs(connection));
        }

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMarketAccounts"] });
    },
  });





  // const createMarket = useMutation({
  //   mutationKey: ["createMarket"],
  //   mutationFn: async ({
  //     eventName,
  //     outcomeOptions,
  //   }: {
  //     eventName: string;
  //     outcomeOptions: string[];
  //   }) => {
  //     if (!publicKey) return;
  //     const seed = new BN(randomBytes(8));

  //     const marketKeypair = Keypair.generate();

  //     const transaction = await program.methods
  //       .createMarket(eventName, outcomeOptions)
  //       .accounts({
  //         market: marketKeypair.publicKey,
  //         user: publicKey,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([marketKeypair])
  //       .transaction();

  //     // const [market] = PublicKey.findProgramAddressSync(
  //     //   [
  //     //     Buffer.from("market"),
  //     //     publicKey.toBuffer(),
  //     //     seed.toArrayLike(Buffer, "le", 8),
  //     //   ],
  //     //   program.programId,
  //     // );
  //     // console.log("Market PDA:", market.toBase58());
  //     // // Construct the transaction
  //     // const transaction = await program.methods
  //     //   .createMarket(eventName, outcomeOptions)
  //     //   .accounts({
  //     //     market,
  //     //     user: publicKey,
  //     //     systemProgram: SystemProgram.programId,
  //     //   })
  //     //   .transaction();

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     // Log the transaction details
  //     console.log("Transaction:", JSON.stringify(transaction));

  //     try {
  //       // Send the transaction using the wallet's sendTransaction method
  //       const signature = await sendTransaction(transaction, connection, {
  //         skipPreflight: true, // Skip preflight checks
  //         preflightCommitment: "confirmed", // Set preflight commitment level
  //       });

  //       console.log("Transaction Signature:", signature);
  //       return signature;
  //     } catch (error) {
  //       console.error("Transaction Error:", error);
  //       throw error;
  //     }
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["getMarketAccounts"] });
  //   },
  // });

  const getMarkets = async (): Promise<Market[]> => {
    try {
      const responses = (await program.account.marketAccount.all()) as MarketResponse[];

      const marketsWithAnswers = await Promise.all(
        responses.map(async (market) => {
          const marketKey = market.account.marketKey;
          const answers = await getMarketAnswers(marketKey);
          return {
            ...market.account,
            publicKey: market.publicKey,
            answers: answers.answers as Answer[],
          };
        })
      );
      return marketsWithAnswers;
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw error;
    }
  };

  // Using useQuery for getMarkets
  const useGetMarketsQuery = () =>
    useQuery({
      queryKey: ["getMarkets"],
      queryFn: getMarkets,
    });

  // Original getMarket function
  const getMarket = async (marketPublicKey: PublicKey): Promise<Market> => {
    try {
      const marketAccount = await program.account.marketAccount.fetch(marketPublicKey) as MarketResponse;
      console.log({ marketAccount })
      const answers = await getMarketAnswers(marketAccount.account.marketKey);
      console.log({ answers })

      return {
        publicKey: marketPublicKey,
        ...marketAccount.account,
        answers: answers.answers as Answer[],
      };
    } catch (error) {
      console.error("Error fetching market:", error);
      throw error;
    }
  };

  // Using useQuery for getMarket
  const useGetMarketQuery = (marketPublicKey?: PublicKey | string) => {
    if (!marketPublicKey) {
      return {
        data: undefined,
        isLoading: false,
        error: null,
      };
    }
    // Convert string to PublicKey if necessary
    const publicKey = typeof marketPublicKey === "string"
      ? new PublicKey(marketPublicKey)
      : marketPublicKey;

    return useQuery({
      queryKey: ["getMarket", publicKey.toString()],
      queryFn: () => getMarket(publicKey),
      enabled: !!publicKey,  // Only run the query if the publicKey is available
    });
  };

  // const getMyMarketAccounts = async (): Promise<MarketAccount[]> => {
  //   if (!publicKey) {
  //     return []; // Return an empty array if publicKey is not defined
  //   }

  //   try {
  //     const responses = await program.account.marketAccount.all();
  //     // Filter or process accounts if needed
  //     // const myMarkets = responses.filter(account => account.account.owner.equals(publicKey));
  //     // return myMarkets;
  //   } catch (error) {
  //     console.error("Error fetching my markets:", error);
  //     throw error;
  //   }
  // };



  const resolveMarket = useMutation({
    mutationKey: ["resolveMarket"],
    mutationFn: async ({
      market,
      winningOutcome,
    }: {
      market: PublicKey;
      winningOutcome: string;
    }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      // Construct the transaction
      const transaction = await program.methods
        .resolveMarket(winningOutcome)
        .accounts({
          market,
          user: publicKey,
        })
        .transaction();

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction with the user's wallet
      if (!signTransaction) {
        throw new Error("Wallet not connected or signTransaction method is not available.");
      }

      const signedTransaction = await signTransaction(transaction);

      if (!signedTransaction) {
        throw new Error("Failed to sign the transaction with the wallet.");
      }

      try {
        // Serialize the signed transaction
        const serializedTransaction = signedTransaction.serialize();

        // Send the raw transaction to the Solana network
        const signature = await connection.sendRawTransaction(serializedTransaction);

        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed');

        console.log("Transaction Signature:", signature);
        return signature;
      } catch (error) {
        console.error("Transaction Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMarketAccounts"] });
    },
  });



  const answerPDA = (marketKey: BN): PublicKey => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("answer"), marketKey.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];
  };

  const getMarketAnswers = async (marketKey: BN) => {
    const answerPDAKey = answerPDA(marketKey); // Renamed to avoid conflict
    const answerData = await program.account.answerAccount.fetch(answerPDAKey);
    return answerData;
  };

  return {
    program,
    getMarket,
    createMarket,
    resolveMarket,
    getMarkets,
    useGetMarketsQuery,
    useGetMarketQuery,
    getMarketAnswers,
    answerPDA
  };
}


// old market
// const dep-createMarket = useMutation({
//   mutationKey: ["createMarket"],
//   mutationFn: async ({
//     eventName,
//     outcomeOptions,
//   }: {
//     eventName: string;
//     outcomeOptions: string[];
//   }) => {
//     if (!publicKey) throw new Error("Wallet not connected");

//     const seed = new BN(randomBytes(8)); // Generate a random seed

//     // Derive the PDA for the market
//     const [market] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("market"),
//         publicKey.toBuffer(),
//         seed.toArrayLike(Buffer, "le", 8),
//       ],
//       program.programId,  // Ensure this program ID matches the on-chain program
//     );

//     console.log("Market PDA:", market.toBase58());

//     // Construct the transaction
//     const transaction = await program.methods
//       .createMarket(eventName, outcomeOptions)
//       .accounts({
//         market,  // PDA for the market
//         user: publicKey,
//         systemProgram: SystemProgram.programId, // System program
//       })
//       .transaction();

//     const { blockhash } = await connection.getLatestBlockhash();
//     transaction.recentBlockhash = blockhash;
//     transaction.feePayer = publicKey;

//     try {
//       const signature = await sendTransaction(transaction, connection, {
//         skipPreflight: true,
//         preflightCommitment: "confirmed",
//       });

//       console.log("Transaction Signature:", signature);

//       const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
//       console.log("View Transaction on Solana Explorer:", explorerUrl);

//       return signature;
//     } catch (error) {
//       console.error("Transaction Error:", error);
//       throw error;
//     }
//   },
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ["getMarketAccounts"] });
//   },
// });