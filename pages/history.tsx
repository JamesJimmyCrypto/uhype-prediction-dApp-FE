import { useMarketProgram } from "@/src/hooks";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const BettingHistoryComponent = () => {
  const { useGetBettingHistoryQuery } = useMarketProgram();
  const {
    data: bettingHistory,
    isLoading,
    error,
  } = useGetBettingHistoryQuery(
    new PublicKey("7GL9fMUzY9r6WPCvJbtbJAhNdLr1h8pNf9Je9oqjxapf"),
  );

  if (isLoading) return <div>Loading betting history...</div>;

  return (
    <div>
      <h2>Betting History</h2>
      {bettingHistory?.map((bet, index) => (
        <div key={index}>
          <p>Voter: {bet.voter.toBase58()}</p>
          <p>Answer Key: {bet.answerKey.toString()}</p>
          <p>Tokens: {bet.tokens.toString()}</p>
          <p>
            Time: {new Date(bet.createTime.toNumber() * 1000).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BettingHistoryComponent;
