import { atom, getDefaultStore, useAtom } from "jotai";
import { Subscription } from "rxjs";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { ChainTime } from 'lib/types';
// Create an atom to store the chain time, default is `null`
export const chainTimeAtom = atom<ChainTime | null>(null);

const store = getDefaultStore();

let sub: Subscription | null = null;

const connection = new Connection(clusterApiUrl("mainnet-beta")); // Connect to Solana cluster

/**
 * Fetches the latest block time from Solana blockchain.
 */
const fetchChainTime = async () => {
  try {
    // Step 1: Get the latest slot
    const slot = await connection.getSlot();

    // Step 2: Get the block time (timestamp) for the slot
    const blockTime = await connection.getBlockTime(slot);

    // Step 3: Get the block production time (period)
    const epochInfo = await connection.getEpochInfo();
    const period = epochInfo.slotsInEpoch / epochInfo.epoch; // Example calculation, adjust as needed

    // Update the atom with the latest chain time
    if (blockTime !== null) {
      const chainTime: ChainTime = {
        now: blockTime * 1000, // Convert to milliseconds for consistency with JS Date
        block: slot,
        period: period,
      };
      store.set(chainTimeAtom, chainTime);
    }
  } catch (error) {
    console.error("Error fetching Solana chain time:", error);
  }
};

/**
 * Set up the subscription to regularly fetch chain time.
 */
const onSdkChange = () => {
  // Unsubscribe from previous subscription, if it exists
  if (sub) {
    sub.unsubscribe();
    sub = null;
  }

  // Create a new subscription to poll the chain time
  sub = new Subscription();

  // Example: Poll the chain time every 10 seconds
  // const intervalId = setInterval(fetchChainTime, 30000);

  // Add to the subscription so it can be unsubscribed later
  sub.add({
    unsubscribe: () => { },
  });
};

/**
 * Initialize SDK subscription if not already set up.
 */
onSdkChange();

/**
 * Hook to use chain time in a component.
 */
export const useChainTime = (): ChainTime | null => {
  const [chainTime] = useAtom(chainTimeAtom);
  return chainTime;
};