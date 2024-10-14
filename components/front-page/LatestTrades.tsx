import { useMarketProgram } from "@/src/hooks";
import { PublicKey } from "@solana/web3.js";
import Table, { TableColumn, TableData } from "components/ui/Table";
import Link from "next/link";
import { formatNumberLocalized } from "lib/util";
import moment from "moment";
import Avatar from "components/ui/Avatar";

const columns: TableColumn[] = [
  {
    header: "Trader",
    accessor: "trader",
    type: "component",
  },
  {
    header: "Outcome",
    accessor: "outcome",
    type: "text",
  },
  {
    header: "Trade",
    accessor: "trade",
    type: "text",
  },
  {
    header: "Amount",
    accessor: "amount",
    type: "text",
  },
  {
    header: "Time",
    accessor: "time",
    type: "text",
  },
];

const BettingHistoryComponent = ({
  limit = 10,
  marketKey,
}: {
  limit?: number;
  marketKey: PublicKey;
}) => {
  const { useGetBettingHistoryQuery } = useMarketProgram();
  const {
    data: bettingHistory,
    isLoading,
    error,
  } = useGetBettingHistoryQuery(marketKey);

  const now = moment();

  const tableData: TableData[] | undefined = bettingHistory
    ?.slice(0, limit)
    .map((bet) => {
      return {
        trader: (
          <Link href={`/portfolio/${bet.voter}`} className="">
            <Avatar address={bet.voter.toString()} />
          </Link>
        ),
        outcome: bet.answerKey.toString(), // You might want to map this to a human-readable outcome name
        trade: "Buy", // Assuming all bets are "Buy". Adjust if you have different types of bets
        amount: bet.tokens.toString(),
        time: `${moment.duration(now.diff(moment(bet.createTime.toNumber() * 1000))).humanize()} ago`,
      };
    });

  return (
    <div className="rounded-xl shadow-lg">
      <Table
        columns={columns}
        data={tableData}
        noDataMessage="No bets"
        loadingNumber={limit}
      />
      {/* {error && <div>Error fetching betting history: {error.message}</div>} */}
    </div>
  );
};

export default BettingHistoryComponent;
