import { ScalarRangeType } from "@zeitgeistpm/sdk";
import { FullMarketFragment } from "@zeitgeistpm/indexer";
import { formatScalarOutcome } from "lib/util/format-scalar-outcome";

export type Primitive = null | number | string | boolean;
export type JSONObject =
  | Primitive
  | { [key: string]: JSONObject }
  | JSONObject[];

export type Environment = "production" | "staging";

export interface EndpointOption {
  value: string;
  label: string;
  environment: Environment;
}

export function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export function isDefined<T>(t: T | undefined): t is T {
  return t !== undefined;
}

export type TradeType = "buy" | "sell";

export const isScalarRangeType = (
  val: string | null,
): val is ScalarRangeType => {
  if (val === null) {
    return true;
  }
  return ["date", "number"].includes(val);
};

export type MarketOutcome = MarketCategoricalOutcome | MarketScalarOutcome;

export type MarketCategoricalOutcome = { categorical: number };
export type MarketScalarOutcome = { scalar: string };

export const displayOutcome = (
  market: FullMarketFragment,
  outcome:
    | MarketCategoricalOutcome
    | (MarketScalarOutcome & { type: ScalarRangeType }),
) => {
  if (isMarketScalarOutcome(outcome)) {
    return formatScalarOutcome(outcome.scalar, outcome.type);
  } else {
    return market.categories?.[outcome.categorical].name;
  }
};

export const isMarketCategoricalOutcome = (
  val: any,
): val is MarketCategoricalOutcome => {
  return val.categorical != null;
};

export const isMarketScalarOutcome = (val: any): val is MarketScalarOutcome => {
  return val.scalar != null;
};

export type MarketReport = {
  at: number;
  by: string;
  outcome: MarketCategoricalOutcome | MarketScalarOutcome;
};

export const isValidMarketReport = (report: any): report is MarketReport => {
  return (
    report != null &&
    report.at != null &&
    report.by != null &&
    report.outcome != null &&
    (report.outcome.categorical != null || report.outcome.scalar != null)
  );
};

export declare type ChainTime = {
  /**
   * Current on chain timestamp.
   */
  now: number;
  /**
   * Current finalized block.
   */
  block: number;
  /**
   * Block production time.
   */
  period: number;
};

export interface ISubmittableResult {
  readonly dispatchError?: DispatchError | undefined;
  readonly dispatchInfo?: DispatchInfo | undefined;
  readonly events: EventRecord[];
  readonly internalError?: Error | undefined;
  readonly status: any;
  readonly isCompleted: boolean;
  readonly isError: boolean;
  readonly isFinalized: boolean;
  readonly isInBlock: boolean;
  readonly isWarning: boolean;
  readonly txHash: any;
  readonly txIndex?: number | undefined;
  filterRecords(section: string, method: string): EventRecord[];
  findRecord(section: string, method: string): EventRecord | undefined;
  toHuman(isExtended?: boolean): any;
}

/** @name EventRecord */
export interface EventRecord {
  readonly phase: any;
  readonly event: Event;
  readonly topics: any;
}

/** @name DispatchInfo */
export interface DispatchInfo {
  readonly weight: any;
  readonly class: any;
  readonly paysFee: any;
}

/** @name DispatchError */
export interface DispatchError {
  readonly isOther: boolean;
  readonly isCannotLookup: boolean;
  readonly isBadOrigin: boolean;
  readonly isModule: boolean;
  readonly asModule: any;
  readonly isConsumerRemaining: boolean;
  readonly isNoProviders: boolean;
  readonly isTooManyConsumers: boolean;
  readonly isToken: boolean;
  readonly asToken: any;
  readonly isArithmetic: boolean;
  readonly asArithmetic: any;
  readonly isTransactional: boolean;
  readonly asTransactional: any;
  readonly isExhausted: boolean;
  readonly isCorruption: boolean;
  readonly isUnavailable: boolean;
  readonly type: 'Other' | 'CannotLookup' | 'BadOrigin' | 'Module' | 'ConsumerRemaining' | 'NoProviders' | 'TooManyConsumers' | 'Token' | 'Arithmetic' | 'Transactional' | 'Exhausted' | 'Corruption' | 'Unavailable';
}

