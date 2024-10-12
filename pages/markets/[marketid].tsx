import { Disclosure, Tab, Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { FullMarketFragment, MarketStatus } from "@zeitgeistpm/indexer";
import {
  MarketOutcomeAssetId,
  ScalarRangeType,
  parseAssetId,
} from "@zeitgeistpm/sdk";
import { from } from "@zeitgeistpm/utility/dist/aeither";
import LatestTrades from "components/front-page/LatestTrades";
import { MarketLiquiditySection } from "components/liquidity/MarketLiquiditySection";
import DisputeResult from "components/markets/DisputeResult";
import { AddressDetails } from "components/markets/MarketAddresses";
import MarketAssetDetails from "components/markets/MarketAssetDetails";
import {
  CategoricalMarketChart,
  ScalarMarketChart,
} from "components/markets/MarketChart";
import { MarketDescription } from "components/markets/MarketDescription";
import MarketHeader from "components/markets/MarketHeader";
import PoolDeployer from "components/markets/PoolDeployer";
import ReportResult from "components/markets/ReportResult";
import ScalarPriceRange from "components/markets/ScalarPriceRange";
import MarketMeta from "components/meta/MarketMeta";
import OrdersTable from "components/orderbook/OrdersTable";
import CategoricalDisputeBox from "components/outcomes/CategoricalDisputeBox";
import CategoricalReportBox from "components/outcomes/CategoricalReportBox";
import ScalarDisputeBox from "components/outcomes/ScalarDisputeBox";
import ScalarReportBox from "components/outcomes/ScalarReportBox";
import Amm2TradeForm from "components/trade-form/Amm2TradeForm";
import { TradeTabType } from "components/trade-form/TradeTab";
import ReferendumSummary from "components/ui/ReferendumSummary";
import Skeleton from "components/ui/Skeleton";
import { ChartSeries } from "components/ui/TimeSeriesChart";
import Toggle from "components/ui/Toggle";
import { GraphQLClient } from "graphql-request";
import { PromotedMarket } from "lib/cms/get-promoted-markets";
import {
  FullCmsMarketMetadata,
  getCmsFullMarketMetadataForMarket,
} from "lib/cms/markets";
import { ZTG, environment } from "lib/constants";
import {
  MarketPageIndexedData,
  WithCmsEdits,
  getMarket,
  getRecentMarketIds,
} from "lib/gql/markets";
import { getResolutionTimestamp } from "lib/gql/resolution-date";
import { useMarketCaseId } from "lib/hooks/queries/court/useMarketCaseId";
import { useOrders } from "lib/hooks/queries/orderbook/useOrders";
import { useAssetMetadata } from "lib/hooks/queries/useAssetMetadata";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { useMarket } from "lib/hooks/queries/useMarket";
import { useMarketDisputes } from "lib/hooks/queries/useMarketDisputes";
import { useMarketPoolId } from "lib/hooks/queries/useMarketPoolId";
import { useMarketSpotPrices } from "lib/hooks/queries/useMarketSpotPrices";
import { useMarketStage } from "lib/hooks/queries/useMarketStage";
import { useTradeItem } from "lib/hooks/trade";
import { useQueryParamState } from "lib/hooks/useQueryParamState";
import { useWallet } from "@solana/wallet-adapter-react";
import { extractChannelName, isLive } from "lib/twitch";
import {
  MarketCategoricalOutcome,
  MarketReport,
  MarketScalarOutcome,
  isMarketCategoricalOutcome,
  isValidMarketReport,
} from "lib/types";
import { MarketDispute } from "lib/types/markets";
import { parseAssetIdString } from "lib/util/parse-asset-id";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import NotFoundPage from "pages/404";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, X } from "react-feather";
import { AiOutlineFileAdd } from "react-icons/ai";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { CgLivePhoto } from "react-icons/cg";
import { FaChevronUp, FaTwitch } from "react-icons/fa";
import { useMarketProgram } from "@/src/hooks";
import { PublicKey } from "@solana/web3.js";
import type { Market } from "@/src/types";

const TradeForm = dynamic(() => import("../../components/trade-form"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "606px" }} />,
});

const TwitchPlayer = dynamic(
  () => import("../../components/twitch/TwitchPlayer"),
  {
    ssr: false,
    loading: () => <div style={{ width: "100%", height: "606px" }} />,
  },
);

const SimilarMarketsSection = dynamic(
  () => import("../../components/markets/SimilarMarketsSection"),
  {
    ssr: false,
  },
);

export const QuillViewer = dynamic(
  () => import("../../components/ui/QuillViewer"),
  {
    ssr: false,
  },
);

// export async function getStaticPaths() {
//   const client = new GraphQLClient(graphQlEndpoint);
//   const marketIds = await getRecentMarketIds(client);

//   const paths = marketIds.map((market) => ({
//     params: { marketid: market.toString() },
//   }));

//   return { paths, fallback: "blocking" };
// }

// export async function getStaticProps({ params }) {
//   const client = new GraphQLClient(graphQlEndpoint);
//   // const { getMarket } = useMarketProgram();
//   // const market = await getMarket(params.marketid);
//   // const [cmsMetadata] = await Promise.all([
//   //   getCmsFullMarketMetadataForMarket(params.marketid),
//   // ]);

//   // const chartSeries: ChartSeries[] = market?.categories?.map(
//   //   (category, index) => {
//   //     return {
//   //       accessor: `v${index}`,
//   //       label: category.name,
//   //       color: category.color,
//   //     };
//   //   },
//   // );

//   let resolutionTimestamp: string | undefined;
//   // if (market) {
//   //   const { timestamp } = await getResolutionTimestamp(client, market.marketId);
//   //   resolutionTimestamp = timestamp ?? undefined;

//   //   if (cmsMetadata?.question || cmsMetadata?.description) {
//   //     market.hasEdits = true;
//   //     (market as MarketPageIndexedData & WithCmsEdits).originalMetadata = {};
//   //   }

//   //   if (cmsMetadata?.imageUrl) {
//   //     market.img = cmsMetadata?.imageUrl;
//   //   }

//   //   if (cmsMetadata?.question) {
//   //     (
//   //       market as MarketPageIndexedData & WithCmsEdits
//   //     ).originalMetadata.question = market.question;
//   //     market.question = cmsMetadata?.question;
//   //   }

//   //   if (cmsMetadata?.description) {
//   //     (
//   //       market as MarketPageIndexedData & WithCmsEdits
//   //     ).originalMetadata.description = market.description as string;
//   //     market.description = cmsMetadata?.description;
//   //   }
//   // }

//   // const hasLiveTwitchStream = await from(async () => {
//   //   const channelName = extractChannelName(cmsMetadata?.twitchStreamUrl);
//   //   if (channelName) {
//   //     return await isLive(channelName);
//   //   }
//   //   return false;
//   // });

//   return {
//     props: {
//       // indexedMarket: market ?? null,
//       // chartSeries: chartSeries ?? null,
//       // resolutionTimestamp: resolutionTimestamp ?? null,
//       // promotionData: null,
//       // cmsMetadata: cmsMetadata ?? null,
//       // hasLiveTwitchStream: hasLiveTwitchStream,
//     },
//     revalidate:
//       environment === "production"
//         ? 5 * 60 //5min
//         : 60 * 60,
//   };
// }

type MarketPageProps = {
  indexedMarket: MarketPageIndexedData;
  chartSeries: ChartSeries[];
  resolutionTimestamp: string;
  promotionData: PromotedMarket | null;
  cmsMetadata: FullCmsMarketMetadata | null;
  hasLiveTwitchStream: boolean;
};

export async function getServerSideProps(context) {
  const { marketid } = context.params;
  // Fetch your data here
  return {
    props: {
      // Your props
    },
  };
}

const Market = () => {
  const router = useRouter();
  const { marketid } = router.query;
  const marketIdString = Array.isArray(marketid) ? marketid[0] : marketid;
  const { useGetMarketQuery } = useMarketProgram();
  const { publicKey } = useWallet();
  const [showLiquidity, setShowLiquidity] = useState(false);
  const [showTwitchChat, setShowTwitchChat] = useState(true);
  // const { data: orders, isLoading: isOrdersLoading } = useOrders({
  //   marketId_eq: marketId,
  //   makerAccountId_eq: pubKey,
  // });

  // const tradeItem = useTradeItem();

  const {
    data: market,
    isLoading,
    error,
  } = useGetMarketQuery(
    marketIdString ? new PublicKey(marketIdString) : undefined,
  );
  if (!marketIdString) {
    return <NotFoundPage backText="Back To Markets" backLink="/" />;
  }

  if (error || (!isLoading && !market)) {
    return <NotFoundPage backText="Back To Markets" backLink="/" />;
  }

  // const outcomeAssets = market?.outcomeAssets?.map(
  //   (assetIdString) =>
  //     parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  // );

  // useEffect(() => {
  //   tradeItem.set({
  //     assetId: outcomeAssets[0],
  //     action: "buy",
  //   });
  // }, [marketId]);

  const [_, setShowLiquidityParam, unsetShowLiquidityParam] =
    useQueryParamState("showLiquidity");

  // const [poolDeployed, setPoolDeployed] = useState(false);

  // const { data: disputes } = useMarketDisputes(marketId);

  // const { data: marketStage } = useMarketStage(market ?? undefined);
  // const { data: spotPrices } = useMarketSpotPrices(marketId);
  // const { data: poolId, isLoading: poolIdLoading } = useMarketPoolId(marketId);
  // const baseAsset = parseAssetIdString(indexedMarket?.baseAsset);
  // const { data: metadata } = useAssetMetadata(baseAsset);

  // const [showTwitchChat, setShowTwitchChat] = useState(true);

  const handlePoolDeployed = () => {
    // setPoolDeployed(true);
    setShowLiquidityParam("");
  };

  const toggleLiquiditySection = () => {
    const nextState = !showLiquidity;
    if (nextState) {
      setShowLiquidityParam("");
    } else {
      unsetShowLiquidityParam();
    }
  };

  const token = "SOL";
  // metadata?.symbol;

  // const isOracle = market?.oracle === pubKey;
  const canReport = true;

  // const lastDispute = useMemo(() => {
  //   // if (disputes) {
  //   //   const lastDispute = disputes?.[disputes.length - 1];
  //   //   const at = lastDispute?.at!;
  //   //   const by = lastDispute?.by!;
  //   //   const marketDispute: MarketDispute = {
  //   //     at,
  //   //     by,
  //   //   };
  //   //   return marketDispute;
  //   // }
  // }, [market]);

  // const report = useMemo(() => {
  //   // if (
  //   //   market?.report &&
  //   //   market?.status === "Reported" &&
  //   //   isValidMarketReport(market.report)
  //   // ) {
  //   //   const report: MarketReport = {
  //   //     at: market.report.at,
  //   //     by: market.report.by,
  //   //     outcome: isMarketCategoricalOutcome(market.report.outcome)
  //   //       ? { categorical: market.report.outcome.categorical }
  //   //       : { scalar: market.report.outcome.scalar?.toString() },
  //   //   };
  //   //   return report;
  //   // }
  // }, [market]);

  const hasChart = Boolean(false);
  // const hasChart = Boolean(chartSeries && (market?.pool || market.neoPool));

  // const twitchStreamChannelName = extractChannelName(
  //   cmsMetadata?.twitchStreamUrl,
  // );

  // const hasTwitchStream = Boolean(twitchStreamChannelName);

  // const activeTabsCount = [hasChart, hasTwitchStream].filter(Boolean).length;

  // const { data: hasLiveTwitchStreamClient } = useQuery(
  //   [],
  //   async () => {
  //     if (!twitchStreamChannelName) return undefined;
  //     return isLive(twitchStreamChannelName);
  //   },
  //   {
  //     enabled: Boolean(hasTwitchStream),
  //     refetchInterval: 1000 * 30,
  //     refetchOnWindowFocus: false,
  //     initialData: hasLiveTwitchStreamServer,
  //   },
  // );

  // const hasLiveTwitchStream =
  //   hasLiveTwitchStreamClient || hasLiveTwitchStreamServer;

  const marketHasPool = true;

  // const poolCreationDate = new Date(
  //   indexedMarket.pool?.createdAt ?? indexedMarket.neoPool?.createdAt ?? "",
  // );

  return (
    <div className="mt-6">
      <div className="relative flex flex-auto gap-12 md:flex-row">
        {isLoading ? (
          <Skeleton height={200} />
        ) : market ? (
          <>
            <div className="flex-1 overflow-hidden">
              <MarketMeta market={market} />

              <MarketHeader
                market={market}
                resolvedOutcome={undefined}
                token={token}
                promotionData={null}
                rejectReason={undefined}
              />

              <div className="mt-4">
                {/* Tab.Group and other commented out code removed for brevity */}
              </div>

              <div className="my-8">
                <MarketAssetDetails
                  marketId={marketIdString}
                  answers={market.answers}
                />
              </div>

              <div className="mb-12 max-w-[90vw]">
                <MarketDescription market={market} />
              </div>

              {marketHasPool === true && (
                <div className="mt-10 flex flex-col gap-4">
                  <h3 className="mb-5 text-2xl">Latest Trades</h3>
                  <Link
                    className="w-full text-center text-ztg-blue"
                    href={`/latest-trades?marketId=${marketid}`}
                  >
                    View more
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden md:-mr-6 md:block md:w-[320px] lg:mr-auto lg:w-[460px]">
              <div className="sticky top-28">
                <div
                  className="mb-12 animate-pop-in rounded-lg opacity-0 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(49, 125, 194, 0.2) 0%, rgba(225, 210, 241, 0.2) 100%)",
                  }}
                >
                  <Amm2TradeForm marketId={marketIdString} market={market} />

                  <SimilarMarketsSection
                    market={market ?? undefined}
                    size="large"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>Market not found</div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div className="-mr-6 block w-full md:hidden">
        <div className="sticky top-28">
          <div
            className="mb-12 animate-pop-in rounded-lg opacity-100 shadow-lg"
            style={{
              background:
                "linear-gradient(180deg, rgba(49, 125, 194, 0.2) 0%, rgba(225, 210, 241, 0.2) 100%)",
            }}
          >
            <SimilarMarketsSection market={market ?? undefined} size="medium" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileContextButtons = ({ market }: { market: Market }) => {
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString();
  const { data: marketStage } = useMarketStage(market);
  // const isOracle = market?.oracle === pubKey;
  const canReport = true;

  // const outcomeAssets = market.outcomeAssets.map(
  //   (assetIdString) =>
  //     parseAssetId(assetIdString).unwrap() as MarketOutcomeAssetId,
  // );

  const { data: tradeItem, set: setTradeItem } = useTradeItem();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Transition
        show={open}
        enter="transition-opacity ease-in-out duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in-out duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed left-0 top-0 h-full w-full"
      >
        <div
          onClick={() => setOpen(false)}
          className="fixed left-0 top-0 z-40 h-full w-full bg-black/20 md:hidden"
        />
      </Transition>

      <div
        className={`fixed bottom-20 left-0 z-50 w-full rounded-t-lg bg-white pb-12 transition-all duration-500 ease-in-out md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* {market?.status === MarketStatus.Active ? (
          <Amm2TradeForm
            marketId={market.marketId}
            showTabs={false}
            selectedTab={
              tradeItem?.action === "buy" ? TradeTabType.Buy : TradeTabType.Sell
            }
          />
        ) : market?.status === MarketStatus.Closed && canReport ? (
          <>
            <ReportForm market={market} />
          </>
        ) : market?.status === MarketStatus.Reported ? (
          <>
            <DisputeForm market={market} />
          </>
        ) : (
          <></>
        )} */}
      </div>

      {/* {(market?.status === MarketStatus.Active ||
        market?.status === MarketStatus.Closed ||
        market?.status === MarketStatus.Reported) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="flex h-20 cursor-pointer text-lg font-semibold">
            {market?.status === MarketStatus.Active ? (
              <>
                <div
                  className={`center h-full flex-1  ${
                    tradeItem?.action === "buy"
                      ? "bg-fog-of-war text-gray-200"
                      : "bg-white text-black"
                  } `}
                  onClick={() => {
                    setTradeItem({
                      assetId: tradeItem?.assetId ?? outcomeAssets[0],
                      action: "buy",
                    });
                    if (open && tradeItem?.action === "buy") {
                      setOpen(false);
                    } else {
                      setOpen(true);
                    }
                  }}
                >
                  Buy{" "}
                  <X
                    className={`center h-full w-0 transition-all  ${
                      open && tradeItem?.action === "buy" && "w-6"
                    }`}
                  />
                </div>
                <div
                  className={`center h-full flex-1 ${
                    tradeItem?.action === "sell"
                      ? "bg-fog-of-war text-gray-200"
                      : "bg-white text-black"
                  }`}
                  onClick={() => {
                    setTradeItem({
                      assetId: tradeItem?.assetId ?? outcomeAssets[0],
                      action: "sell",
                    });
                    if (open && tradeItem?.action === "sell") {
                      setOpen(false);
                    } else {
                      setOpen(true);
                    }
                  }}
                >
                  Sell
                  <X
                    className={`center h-full w-0 transition-all  ${
                      open && tradeItem?.action === "sell" && "w-6"
                    }`}
                  />
                </div>
              </>
            ) : market?.status === MarketStatus.Closed && canReport ? (
              <>
                <div
                  className={`center h-full flex-1 transition-all ${
                    !open ? "bg-ztg-blue text-white" : "bg-slate-200"
                  }`}
                  onClick={() => setOpen(!open)}
                >
                  {open ? <X /> : "Report"}
                </div>
              </>
            ) : market?.status === MarketStatus.Reported ? (
              <div
                className={`center h-full flex-1 ${
                  !open ? "bg-ztg-blue text-white" : "bg-slate-200"
                }`}
                onClick={() => setOpen(!open)}
              >
                {open ? <X /> : "Dispute"}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      )} */}
    </>
  );
};

const DisputeForm = ({ market }: { market: FullMarketFragment }) => {
  const reportedOutcome = market.report?.outcome;

  const [hasReportedDispute, setHasReportedDispute] = useState(false);

  return (
    <div className="relative">
      {hasReportedDispute ? (
        <DisputeResult market={market} />
      ) : (
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={`relative z-20 flex w-full items-center rounded-md px-5 py-2 ${
                  !open && "bg-orange-400 "
                }`}
              >
                <h3
                  className={`flex-1 text-left text-base ${
                    open ? "opacity-0" : "text-white opacity-100"
                  }`}
                >
                  Market can be disputed
                </h3>
                {open ? (
                  <X />
                ) : (
                  <FaChevronUp
                    size={18}
                    className={`justify-end text-gray-600 ${
                      !open && "rotate-180 text-white"
                    }`}
                  />
                )}
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
                className="relative z-10 -mt-[30px]"
              >
                <Disclosure.Panel>
                  {isMarketCategoricalOutcome(reportedOutcome) ? (
                    <CategoricalDisputeBox
                      market={market}
                      onSuccess={() => setHasReportedDispute(true)}
                    />
                  ) : (
                    <ScalarDisputeBox
                      market={market}
                      onSuccess={() => setHasReportedDispute(true)}
                    />
                  )}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      )}
    </div>
  );
};

const ReportForm = ({ market }: { market: Market }) => {
  const [reportedOutcome, setReportedOutcome] = useState<
    | MarketCategoricalOutcome
    | (MarketScalarOutcome & { type: ScalarRangeType })
    | undefined
  >();

  const { publicKey } = useWallet();

  const pubKey = publicKey?.toString();
  const { data: stage } = useMarketStage(market);
  const constants = useChainConstants();

  // const connectedWalletIsOracle = market.oracle === pubKey;

  const userCanReport = false;
  // stage?.type === "OpenReportingPeriod" || connectedWalletIsOracle;

  return !userCanReport ? (
    <></>
  ) : (
    <div className="px-5 py-10">
      {reportedOutcome ? (
        <ReportResult market={market} outcome={reportedOutcome} />
      ) : (
        <>
          <h4 className="mb-4 flex items-center gap-2">
            <AiOutlineFileAdd size={20} className="text-gray-600" />
            <span>Report Market Outcome</span>
          </h4>

          <p className="mb-6 text-sm">
            Market has closed and the outcome can now be reported.
          </p>

          {/* {stage?.type === "OpenReportingPeriod" && (
            <>
              <p className="-mt-3 mb-6 text-sm italic text-gray-500">
                Oracle failed to report. Reporting is now open to all.
              </p>
              <p className="mb-6 text-sm">
                Bond cost: {constants?.markets.outsiderBond}{" "}
                {constants?.tokenSymbol}
              </p>
            </>
          )} */}

          <div className="mb-4">
            {/* {market.marketType?.scalar ? (
              <ScalarReportBox market={market} onReport={setReportedOutcome} />
            ) : ( */}
            <>
              {/* <CategoricalReportBox
                  market={market}
                  onReport={setReportedOutcome}
                /> */}
            </>
            {/* )} */}
          </div>
        </>
      )}
    </div>
  );
};

// const CourtCaseContext = ({ market }: { market: FullMarketFragment }) => {
//   const { data: caseId, isFetched } = useMarketCaseId(market.marketId);
//   const router = useRouter();

//   return (
//     <div className="px-5 py-8">
//       <h4 className="mb-3 flex items-center gap-2">
//         <Image width={22} height={22} src="/icons/court.svg" alt="court" />
//         <span>Market Court Case</span>
//       </h4>

//       <p className="mb-5 text-sm">
//         Market has been disputed and is awaiting a ruling in court.
//       </p>

//       <button
//         disabled={!isFetched}
//         onClick={() => router.push(`/court/${caseId}`)}
//         onMouseEnter={() => router.prefetch(`/court/${caseId}`)}
//         className={`ztg-transition h-[56px] w-full rounded-full bg-purple-400 text-white focus:outline-none disabled:cursor-default disabled:bg-slate-300`}
//       >
//         View Case
//       </button>
//     </div>
//   );
// };

export default Market;
