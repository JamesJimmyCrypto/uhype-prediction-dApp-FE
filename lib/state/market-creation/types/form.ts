import {
  ZTG,
  swapFeeFromFloat,
} from "@zeitgeistpm/sdk";
import { ChainTime } from "@zeitgeistpm/utility/dist/time";
import { Fee } from "components/create/editor/inputs/FeeSelect";
import Decimal from "decimal.js";
import { BLOCK_TIME_SECONDS } from "lib/constants";
import { getMetadataForCurrency } from "lib/constants/supported-currencies";
import { union } from "lib/types/union";
import moment from "moment";
import { DeepRequired } from "react-hook-form";
import * as z from "zod";
import { tickersForAnswers } from "../util/tickers";
import { timelineAsBlocks } from "./timeline";
import {
  IOAnswers,
  IOCategoricalAnswers,
  IOCurrency,
  IODescription,
  IOEndDate,
  IOLiquidity,
  IOLiquidityRow,
  IOModerationMode,
  IOOracle,
  IOPeriodDateOption,
  IOPeriodDurationOption,
  IOPeriodOption,
  IOQuestion,
  IOScalarAnswers,
  IOSwapFee,
  IOTags,
  IOTimeZone,
  IOYesNoAnswers,
} from "./validation";
import { Keypair, PublicKey, Connection, Transaction, Signer } from '@solana/web3.js';
/**
 * This is the type of the full market creation form data that is used to create a market.
 * It is infered from the zod schema validation types below.
 *
 * @note - Because we are not in strict ts mode zod allways infers partial form fields.
 *  When we move to strict null checks we can do ```z.infer<ReturnType<typeof createMarketFormValidator>>```
 */
export type MarketFormData = {
  currency?: CurrencyTag;
  question?: Question;
  tags: Tags;
  answers: Answers;
  timeZone: TimeZone;
  endDate: EndDate;
  // gracePeriod: PeriodOption;
  // reportingPeriod: PeriodOption;
  // disputePeriod: PeriodOption;
  oracle: Oracle;
  creatorFee: Fee;
  description?: Description;
  // moderation: Moderation;
  // liquidity: Liquidity;
};

export type Category = { name: string; img?: string | undefined; ticker?: string | undefined; color?: string | undefined; }
export type CreateMarketParams = {
  signer: PublicKey; // Required for identifying the creator
  disputeMechanism: 'Authorized' | 'Court'; // Defines how disputes will be handled
  oracle: z.infer<typeof IOOracle>; // Oracle to determine outcomes
  period: { Timestamp: [number, number]; }; // Event time window
  creatorFee: string; // Fee for the market creator
  marketType: {
    // Scalar?: [string, string]; 
    Categorical?: number;
  }; // Scalar or categorical market type
  metadata: {
    description: string;
    question: string;
    tags: z.infer<typeof IOTags>;
  }; // Market details
  baseAsset: string; // Base currency used in the market
  scoringRule?: 'Lmsr' | 'AmmCdaHybrid'; // Scoring system used for outcomes
  pool?: {
    amount: string;
    swapFee: string;
    spotPrices: string[];
  }; // Liquidity pool for the market
};
// export type CreateMarketParams = {
//   signer: PublicKey;  // Solana public key
//   disputeMechanism: 'Authorized' | 'Court';
//   oracle: z.infer<typeof IOOracle>;
//   period: {
//     Timestamp: [number, number];  // Start and end time in Unix timestamps
//   };
//   deadlines: {
//     gracePeriod: number;  // Grace period in blocks
//     oracleDuration: number;  // Oracle reporting duration in blocks
//     disputeDuration: number;  // Dispute duration in blocks
//   };
//   creatorFee: string;  // Creator fee in string format to handle decimals
//   marketType: {
//     Scalar?: [string, string];  // Scalar market type with two bounds
//     Categorical?: number;  // Categorical market type with a number of options
//   };
//   metadata: {
//     __meta: string;
//     description: string;
//     question: string;
//     slug: string;
//     tags: z.infer<typeof IOTags>;
//     categories?: Category[];
//     scalarType?: NonNullable<"number" | "date"> | undefined;  // Optional scalar type
//   };
//   baseAsset: string;  // Base asset for the market
//   scoringRule?: 'Lmsr' | 'AmmCdaHybrid';  // Scoring rules for the market
//   pool?: {
//     amount: string;  // Pool amount in a string format to handle large numbers
//     swapFee: string;  // Swap fee for the pool
//     spotPrices: string[];  // Initial spot prices
//   };
// };
export type ValidMarketFormData = DeepRequired<MarketFormData>;
export type PartialMarketFormData = Partial<MarketFormData>;

/**
 * Array of all form keys in the market creation form.
 */
export const marketCreationFormKeys = union<keyof MarketFormData>().exhaust([
  "currency",
  "question",
  "tags",
  "answers",
  "timeZone",
  "endDate",
  // "gracePeriod",
  // "reportingPeriod",
  // "disputePeriod",
  "oracle",
  "description",
  // "moderation",
  "creatorFee",
  // "liquidity",
]);

/**
 * These are the individual market form field types.
 * They are infered from the individual field zod schema validation types below.
 *
 * @note - Because we are not in strict ts mode zod allways infers partial form fields
 * so we have to hardcode required for each field that can only be a fully defined object like answers and periods.
 */
export type CurrencyTag = z.infer<typeof IOCurrency>;
export type Question = z.infer<typeof IOQuestion>;
export type Tags = z.infer<typeof IOTags>;
export type Answers = Required<z.infer<typeof IOAnswers>>;
export type YesNoAnswers = Required<z.infer<typeof IOYesNoAnswers>>;
export type CategoricalAnswers = Required<z.infer<typeof IOCategoricalAnswers>>;
export type TimeZone = Required<z.infer<typeof IOTimeZone>>;
export type ScalarAnswers = Required<z.infer<typeof IOScalarAnswers>>;
export type EndDate = z.infer<typeof IOEndDate>;
export type PeriodOption = Required<z.infer<typeof IOPeriodOption>>;
export type PeriodDateOption = Required<z.infer<typeof IOPeriodDateOption>>;
export type PeriodDurationOption = Required<
  z.infer<typeof IOPeriodDurationOption>
>;
export type Oracle = z.infer<typeof IOOracle>;
export type Description = z.infer<typeof IODescription>;
export type Moderation = z.infer<typeof IOModerationMode>;
export type SwapFee = z.infer<typeof IOSwapFee>;
export type Liquidity = z.infer<typeof IOLiquidity>;
export type LiquidityRow = z.infer<typeof IOLiquidityRow>;

export type WithPool = {
  creationType?: undefined;
  scoringRule: "Lmsr" | "AmmCdaHybrid";
  pool: {
    swapFee: string;
    amount: string;
    spotPrices: Array<string>;
  };
}

export type NoPool = {

}
/**
 * Create a the needed params for the market creation extrinsic from the form data.
 */
export const marketFormDataToExtrinsicParams = (
  form: ValidMarketFormData,
  signer: PublicKey,
  chainTime: ChainTime,
): CreateMarketParams => {
  console.log({ cur: form.currency })
  const baseCurrencyMetadata = getMetadataForCurrency(form.currency);
  // const timeline = timelineAsBlocks(form, chainTime).unwrap();

  if (!baseCurrencyMetadata) {
    throw new Error("Invalid market creation form data");
  }

  const hasPool = false;
  // form.moderation === "Permissionless" && form.liquidity.deploy;

  const poolParams: WithPool | NoPool = hasPool
    ? {
      scoringRule: "Lmsr",
      // pool: {
      //   amount: new Decimal(form.liquidity.amount).mul(ZTG).toFixed(0),
      //   swapFee: swapFeeFromFloat(form.liquidity.swapFee?.value).toString(),
      //   spotPrices: form.liquidity.rows.map((row) =>
      //     new Decimal(row.price.price).mul(ZTG).toFixed(0),
      //   ),
      // },
    }
    : {
      scoringRule: "AmmCdaHybrid",
      // creationType: form.moderation,
    };

  let disputeMechanism: CreateMarketParams["disputeMechanism"] =
    "Authorized";

  if (
    process.env.NEXT_PUBLIC_SHOW_COURT === "true" &&
    (form.answers.type === "categorical" || form.answers.type === "yes/no")
  ) {
    disputeMechanism = "Court";
  }

  const params: CreateMarketParams = {
    signer,
    disputeMechanism,
    oracle: form.oracle,
    period: {
      Timestamp: [Date.now(), new Date(form.endDate).getTime()],
    },
    // deadlines: {
    //   gracePeriod: timeline.grace.period,
    //   oracleDuration: timeline.report.period,
    //   disputeDuration: timeline.dispute.period,
    // },
    creatorFee: new Decimal(10).pow(7).mul(form.creatorFee.value).toString(),
    marketType:
    {
      Categorical: form.answers.answers.length,
    },
    // form.answers.type === "scalar"
    // ? {
    //   Scalar: [
    //     new Decimal(form.answers.answers[0]).mul(ZTG).toFixed(),
    //     new Decimal(form.answers.answers[1]).mul(ZTG).toFixed(),
    //   ],
    // }
    // :
    metadata: {
      description: form.description ?? "",
      question: form.question,
      // slug: form.question,
      tags: form.tags,
      // categories: tickersForAnswers(form.answers),
    },
    baseAsset: "TODO",
    ...poolParams,
  };
  return params;

};

export const durationasBlocks = (duration: Partial<PeriodDurationOption>) => {
  return (
    moment.duration(duration.value, duration.unit).asSeconds() /
    BLOCK_TIME_SECONDS
  );
};

export const blocksAsDuration = (blocks: number) => {
  return moment.duration(blocks * BLOCK_TIME_SECONDS * 1000, "milliseconds");
};
