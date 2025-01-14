import { Transition } from "@headlessui/react";
import Toggle from "components/ui/Toggle";
import WizardStepper from "components/wizard/WizardStepper";
import { nextStepFrom, prevStepFrom } from "components/wizard/types";
import { useChainConstants } from "lib/hooks/queries/useChainConstants";
import { useChainTime } from "lib/state/chaintime";
import {
  disputePeriodOptions,
  gracePeriodOptions,
  reportingPeriodOptions,
} from "lib/state/market-creation/constants/deadline-options";
import { useMarketDraftEditor } from "lib/state/market-creation/editor";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { LuFileWarning } from "react-icons/lu";
import { ErrorMessage } from "./ErrorMessage";
import InfoPopover from "../../ui/InfoPopover";
import { MarketFormSection } from "./MarketFormSection";
import { Publishing } from "./Publishing";
import { EditorResetButton } from "./ResetButton";
import MarketSummary from "./Summary";
import BlockPeriodPicker from "./inputs/BlockPeriod";
import CategorySelect from "./inputs/Category";
import CurrencySelect from "./inputs/Currency";
import DateTimePicker from "./inputs/DateTime";
import { LiquidityInput } from "./inputs/Liquidity";
import ModerationModeSelect from "./inputs/Moderation";
import OracleInput from "./inputs/Oracle";
import { AnswersInput } from "./inputs/answers";
import {
  getMetadataForCurrency,
  supportedCurrencies,
} from "lib/constants/supported-currencies";
import Input from "components/ui/Input";
import TimezoneSelect from "./inputs/TimezoneSelect";
import { Loader } from "components/ui/Loader";
import FeeSelect from "./inputs/FeeSelect";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  marketFormDataToExtrinsicParams,
  Oracle,
} from "lib/state/market-creation/types/form";

const QuillEditor = dynamic(() => import("components/ui/QuillEditor"), {
  ssr: false,
});

export const MarketEditor = () => {
  const { publicKey } = useWallet();
  const editor = useMarketDraftEditor();
  const chainTime = useChainTime();
  const headerRef = useRef<HTMLDivElement>(null);

  const {
    form,
    steps,
    currentStep,
    setStep,
    isWizard,
    toggleWizard,
    input,
    fieldsState,
    mergeFormData,
  } = editor;

  const constants = useChainConstants();

  const timezone = form?.timeZone;

  // const currencyMetadata = getMetadataForCurrency(form?.currency ?? "DHP");

  const back = () => {
    const prevStep = prevStepFrom(steps, currentStep);
    if (prevStep) {
      setStep(prevStep);
    }
    headerRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const next = () => {
    const nextStep = nextStepFrom(steps, currentStep);
    if (nextStep) {
      setStep(nextStep);
    }
    headerRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handlePoolDeploymentToggle = (checked: boolean) => {
    mergeFormData({
      // liquidity: {
      //   deploy: checked,
      // },
    });
  };

  const showLiquidityWarning = false;
  // fieldsState.liquidity.isTouched && form.liquidity?.deploy && isWizard;

  const isLoaded = Boolean(true);

  type FormValue = {
    currency: string;
    question: string;
    tags: string[];
    answers: {
      type: "yes/no";
      answers: ["Yes", "No"];
    };
    type: "yes/no";
    timeZone: string;
    endDate: string;
    // gracePeriod?: PeriodOption;
    // Add other properties as needed
    oracle: Oracle;
    creatorFee: {
      type: "custom";
      value: 0.01;
    };
    description: string;
  };

  const defaultformValue: FormValue = {
    currency: "SOL",
    question: "Is SOL reached ATH at the end of this year",
    tags: ["Politics"],
    answers: {
      type: "yes/no",
      answers: ["Yes", "No"],
    },
    type: "yes/no",
    timeZone: "UTC",
    endDate: "20/10/2024",
    oracle: "Anp4eSYXvJ4unKmy9Ac5zZa1MZ3p8gAjYiCLx8iS7bKH",
    creatorFee: {
      type: "custom",
      value: 0.01,
    },
    description: "ok",
  };

  const formValue = {
    ...defaultformValue,
    ...editor.form,
  };
  //TODO URGENT ADD editor.isValid &&
  const creationParams = publicKey
    ? marketFormDataToExtrinsicParams(formValue, publicKey, chainTime!)
    : undefined;

  return (
    <>
      {isLoaded === false && (
        <div
          className="flex items-center justify-center bg-dark "
          style={{ height: "calc(100vh - 100px)" }}
        >
          <Loader
            loading={true}
            className="h-[100px] w-[100px]"
            variant={"Info"}
          />
        </div>
      )}
      <Transition
        show={isLoaded}
        enter="transition-opacity duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <h2
          className="font-3xl relative mb-6 flex items-center justify-center gap-3 text-center"
          ref={headerRef}
        >
          <div className="relative items-center justify-center md:flex">
            Create Market
            {/* <EditorResetButton editor={editor} />  */}
          </div>
        </h2>

        {/* <div className="center mb-8 flex">
          <div className="mr-3 font-light">One Page</div>
          <Toggle checked={isWizard} onChange={toggleWizard} />
          <div className="ml-3 font-light">Wizard</div>
        </div> */}

        <div className="mb-8 md:mb-12">
          {isWizard && (
            <WizardStepper
              steps={steps}
              current={currentStep}
              onChange={(step) => setStep(step)}
            />
          )}
        </div>

        <form>
          <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Currency"}
            onClickNext={next}
            nextDisabled={!fieldsState.currency.isValid}
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="flex items-center justify-center gap-2 text-base">
                Market Currency
                <InfoPopover
                  title={
                    <h3 className="mb-4 flex items-center justify-center gap-2">
                      <AiOutlineInfoCircle />
                      Market Base Asset
                    </h3>
                  }
                >
                  <p>
                    The base asset used to provide liquidity to the market and
                    what you use when making trades for market outcome tokens.
                  </p>
                </InfoPopover>
              </h2>
            </div>
            <CurrencySelect
              options={supportedCurrencies.map((currency) => currency.name)}
              {...input("currency")}
            />
            {showLiquidityWarning && (
              <div className="center mb-8 mt-4">
                <div className="w-full text-center text-sm text-gray-400 md:max-w-lg">
                  <LuFileWarning size={22} className="mr-2 inline" />
                  You have already added liquidity to this market. If you change
                  the base currency liquidity settings will be reset to
                  defaults.
                </div>
              </div>
            )}
          </MarketFormSection>
          <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Question"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={
              !fieldsState.question.isValid || !fieldsState.tags.isValid
            }
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="mb-4 text-base md:mb-8">What is your question?</h2>
              <div>
                <Input
                  autoComplete="off"
                  className={`mb-4 h-12 w-full rounded-md px-4 py-7 text-center md:w-2/3
                  ${
                    !fieldsState.question.isValid
                      ? "border-vermilion bg-dark text-white"
                      : "bg-primary/10 text-primary"
                  }
                `}
                  placeholder="Ask a question that is specific and has a timeframe."
                  {...input("question", { type: "text" })}
                />
                <div className="center flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.question} />
                </div>
              </div>
            </div>
            <h2 className="mb-4 flex justify-center text-center text-base md:mb-8">
              <span className="hidden md:block">
                Which categories does the market relate to?
              </span>
              <span className="block md:hidden">Select market categories.</span>
            </h2>
            <div className="flex justify-center">
              <div className="mb-6 max-w-2xl">
                <CategorySelect {...input("tags")} />
              </div>
            </div>
            <div className="center flex h-5 text-xs text-red-400">
              <ErrorMessage field={fieldsState.tags} />
            </div>
          </MarketFormSection>

          <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Answers"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={!fieldsState.answers.isValid}
          >
            <div className="relative mb-4 text-center md:mb-8">
              <h2 className="center gap-2 text-base">
                Answers
                <InfoPopover
                  title={<h4 className="answer-types mb-4">Answer Types</h4>}
                  className="!text-left"
                >
                  <h4 className="mb-1 text-left text-base">
                    Outcomes (Categorical)
                  </h4>
                  <p className="mb-4 text-left font-light">
                    Outcomes will create a categorical market from the options
                    you specify.{" "}
                  </p>
                  <h4 className="mb-1 text-left text-base">Scalar</h4>
                  <p className="mb-4 text-left">
                    A scalar market is a market where the outcome is a number or
                    date in a the range specified by the lower(<b>short</b>) and
                    upper(
                    <b>long</b>) bound.{" "}
                    <a className="text-ztg-blue" href="" target="_blank">
                      Learn more.
                    </a>
                  </p>
                  <h4 className="mb-1 text-left text-base">Yes/No</h4>
                  <p className="text-left">
                    Choosing yes/no will create a categorical market with two
                    preset outcomes, yes and no.
                  </p>
                </InfoPopover>
              </h2>
            </div>
            <AnswersInput
              {...input("answers", { mode: "onChange" })}
              fieldState={fieldsState.answers}
            />
            {showLiquidityWarning && (
              <div className="mb-4 mt-8">
                <div className="center">
                  <div className="w-full text-center text-sm text-gray-400 md:max-w-xl">
                    <LuFileWarning size={22} className="mr-2 inline" />
                    You have already added liquidity to this market. If you
                    change the number of answers the liquidity settings will be
                    reset to defaults.
                  </div>
                </div>
              </div>
            )}
            <div className="center flex h-5 text-xs text-red-400">
              <ErrorMessage field={fieldsState.answers} />
            </div>
          </MarketFormSection>

          <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Time Period"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={!fieldsState.endDate.isValid}
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="text-base">When does the market end?</h2>
            </div>
            {/* <div className="mb-4">
              <div className="center mb-3 flex">
                <DateTimePicker
                  timezone={timezone}
                  placeholder="Set End Date"
                  isValid={fieldsState.endDate.isValid}
                  {...input("endDate", { mode: "all" })}
                />
                <TimezoneSelect {...input("timeZone")} />
              </div>
              <div className="center flex h-5  text-xs text-red-400">
                <ErrorMessage field={fieldsState.endDate} />
              </div>
            </div> */}

            <div>
              {/* <div className="mb-6">
                <div className="mb-4 text-center">
                  <h2 className="flex items-center justify-center gap-2 text-base">
                    Set Grace Period
                    <InfoPopover
                      title={
                        <h3 className="mb-4 flex items-center justify-center gap-2">
                          <AiOutlineInfoCircle />
                          Grace Period
                        </h3>
                      }
                    >
                      <p className="font-light">
                        Grace period starts after the market ends. During this
                        period, trading, reporting and disputing is disabled.
                      </p>
                    </InfoPopover>
                  </h2>
                </div>
                <div className="flex justify-center">
                  <BlockPeriodPicker
                    timezone={timezone}
                    disabled={!fieldsState.endDate.isValid}
                    isValid={fieldsState.gracePeriod.isValid}
                    options={gracePeriodOptions}
                    chainTime={chainTime ?? undefined}
                    {...input("gracePeriod", { mode: "all" })}
                  />
                </div>
                <div className="center mt-4 flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.gracePeriod} />
                </div>
              </div> */}

              <div className="mb-6 ">
                {/* <div className="mb-4 text-center">
                  <h2 className="flex items-center justify-center gap-2 text-base">
                    Set Report Period
                    <InfoPopover
                      title={
                        <h3 className="mb-4 flex items-center justify-center gap-2">
                          <AiOutlineInfoCircle />
                          Report Period
                        </h3>
                      }
                    >
                      <p className="font-light">
                        Reporting starts after the market ends and grace period
                        has finished. In this period the market outcome can only
                        be resolved by the designated oracle. If the oracle
                        fails to report the market goes into open reporting
                        where anyone can submit the outcome.
                      </p>
                    </InfoPopover>
                  </h2>
                </div> */}
                {/* <div className="flex justify-center">
                  <BlockPeriodPicker
                    disabled={!fieldsState.endDate.isValid}
                    isValid={fieldsState.reportingPeriod.isValid}
                    options={reportingPeriodOptions}
                    chainTime={chainTime ?? undefined}
                    {...input("reportingPeriod", { mode: "all" })}
                  />
                </div> */}
                {/* <div className="center mt-4 flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.reportingPeriod} />
                </div> */}
              </div>

              <div className="mb-0">
                {/* <div className="mb-4 text-center">
                  <h2 className="flex items-center justify-center gap-2 text-base">
                    Set Dispute Period
                    <InfoPopover
                      title={
                        <h3 className="mb-4 flex items-center justify-center gap-2">
                          <AiOutlineInfoCircle />
                          Dispute Period
                        </h3>
                      }
                    >
                      <p className="font-light">
                        The dispute period starts when the market has been
                        reported. If no dispute is raised during this period the
                        market is resolved to the reported outcome.
                      </p>
                    </InfoPopover>
                  </h2>
                </div> */}
                {/* <div className="flex justify-center">
                  <BlockPeriodPicker
                    disabled={!fieldsState.endDate.isValid}
                    isValid={fieldsState.disputePeriod.isValid}
                    options={disputePeriodOptions}
                    chainTime={chainTime ?? undefined}
                    {...input("disputePeriod", { mode: "all" })}
                  />
                </div>
                <div className="center mt-4 flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.disputePeriod} />
                </div> */}
              </div>
            </div>
          </MarketFormSection>

          {/* <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Oracle"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={!fieldsState.oracle.isValid}
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="mb-4 text-base md:mb-8">Set Up Oracle</h2>
              <div className="center">
                <p className="mb-6 text-sm font-light text-gray-500 md:mb-12 md:max-w-2xl">
                  This is the account that will be{" "}
                  <b className="font-semibold text-gray-600">
                    responsible for submitting the outcome
                  </b>{" "}
                  when the market ends.
                  <br />
                  If the Oracle fails to submit; or submits an answer that turns
                  out to be wrong according to a dispute, you will lose your
                  bonded oracle deposit of{" "}
                  <span className="font-bold">
                    {constants?.markets.oracleBond} DHP
                  </span>
                </p>
              </div>

              <div>
                <div className="center mb-6">
                  <OracleInput
                    className="md:w-2/3"
                    {...input("oracle", { mode: "all" })}
                  />
                </div>
                <div className="center flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.oracle} />
                </div>
              </div>
            </div>
          </MarketFormSection> */}

          {/* <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Description"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={!fieldsState.description.isValid}
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="mb-4 text-base md:mb-8">Market Description</h2>
              <div>
                <div className="center flex min-w-full">
                  <QuillEditor
                    className="mb-6 h-full w-full max-w-full md:mb-0 md:w-2/3"
                    placeHolder={
                      "Additional information you want to provide about the market, such as resolution source, special cases, or other details."
                    }
                    {...input("description", { mode: "all" })}
                  />
                </div>
                <div className="center flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.description} />
                </div>
              </div>
            </div>
          </MarketFormSection> */}

          {/* <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Moderation"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={!fieldsState.moderation.isValid}
          >
            <div className="mb-4 text-center md:mb-8">
              <h2 className="mb-4 text-base md:mb-8">Market Moderation</h2>
              <div>
                <div className="center flex min-w-full">
                  <ModerationModeSelect
                    {...input("moderation")}
                    onChange={(event) => {
                      mergeFormData({
                        liquidity: {
                          deploy:
                            event.target.value == "Advised"
                              ? false
                              : form.liquidity?.deploy,
                        },
                        moderation: event.target.value,
                      });
                    }}
                  />
                </div>
                <div className="center flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.moderation} />
                </div>
              </div>
            </div>
          </MarketFormSection> */}

          {/* <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Liquidity"}
            onClickNext={next}
            onClickBack={back}
            nextDisabled={
              // !fieldsState.liquidity.isValid ||
              !fieldsState.answers.isValid
            }
          >
            {form.currency && (
              <div className="flex flex-col items-center">
                <div className="mb-2 flex items-center gap-2 text-center md:mb-4">
                  <h2 className="mb-0 text-base">Creator Fee</h2>
                  <InfoPopover>
                    <p>
                      Creators will be paid a fee based on trading volume.
                      Higher fees may discourage trading and liquidity provision
                    </p>
                  </InfoPopover>
                </div>
                <FeeSelect
                  {...input("creatorFee", { mode: "all" })}
                  label="% Creator Fee"
                  presets={[
                    { value: 0, type: "preset" },
                    { value: 0.1, type: "preset" },
                    { value: 0.5, type: "preset" },
                  ]}
                  isValid={fieldsState.creatorFee?.isValid}
                />
                <div className="center mt-6 flex h-5 text-xs text-red-400">
                  <ErrorMessage field={fieldsState.creatorFee} />
                </div>
              </div>
            )}
            {form.moderation === "Permissionless" && form.currency ? (
              <>
                <div className="mb-2 text-center md:mb-4">
                  <h2 className="mb-0 text-base">Market Liquidity</h2>
                </div>

                <div className="mb-10 flex justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 text-sm font-light">Deploy Pool?</div>
                    <Toggle
                      checked={form?.liquidity?.deploy ?? false}
                      activeClassName={`bg-${currencyMetadata?.twColor}`}
                      onChange={handlePoolDeploymentToggle}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  {!form?.liquidity?.deploy ? (
                    <div>
                      <div className="center mb-4 text-gray-500">
                        <LuFileWarning size={32} />
                      </div>
                      <div className="center">
                        <p className="text-center text-gray-400 md:max-w-lg">
                          No liquidity pool will be deployed for the market.
                          <b className="inline">
                            You can deploy a pool after you create the market
                          </b>{" "}
                          from the market page.
                        </p>
                      </div>
                    </div>
                  ) : !fieldsState.answers.isValid ? (
                    <div className="text-center text-red-500">
                      Answers must be filled out correctly before adding
                      liquidity.
                    </div>
                  ) : (
                    <LiquidityInput
                      {...input("liquidity", { mode: "all" })}
                      currency={form.currency}
                      errorMessage={
                        !fieldsState.answers.isValid
                          ? "Answers must be filled out correctly before adding liquidity."
                          : ""
                      }
                    />
                  )}

                  <div className="center mt-6 flex h-5 text-xs text-red-400">
                    <ErrorMessage field={fieldsState.liquidity} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4">
                  <div className="center mb-2 text-gray-500">
                    <LuFileWarning size={22} />
                  </div>
                  <div className="center mb-12">
                    <div className="text-center text-lg text-gray-500 md:max-w-xl">
                      You have selected <b>advised</b> moderation. This means
                      that the market could be rejected by the moderators.
                      <br />
                      <br />
                      If the market is rejected, you will be refunded most of
                      your bonded deposit{" "}
                      <i>
                        (the refunded amount might incur a slash depending on
                        the chain configuration, currently at{" "}
                        {constants?.markets.advisoryBondSlashPercentage}%)
                      </i>
                      <br />
                      <br />
                      If the market is <b>approved</b>, you will be able to{" "}
                      <b>add liquidity </b>
                      or request it from the community.
                    </div>
                  </div>
                </div>
              </>
            )}
          </MarketFormSection> */}
          {/* 
          <MarketFormSection
            wizard={isWizard}
            isCurrent={currentStep.label == "Summary"}
            disabled={!isWizard}
          >
            <div className="center flex">
              <MarketSummary creationParams={creationParams} editor={editor} />
            </div>
          </MarketFormSection> */}

          {/* {(!editor.isWizard || currentStep.label == "Summary") && (
            <Publishing creationParams={creationParams} editor={editor} />
          )} */}
        </form>
      </Transition>
    </>
  );
};

export default MarketEditor;
