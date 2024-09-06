import { ActionableCard, ActionableCardProps } from "../ActionableCard";

export const DepositActionableCard = ({
  animationVariant,
}: {
  animationVariant?: ActionableCardProps["animationVariant"];
}) => (
  <ActionableCard
    title="Deposit Tokens"
    description="Choose from several methods to deposit crypto tokens on Dehype.fun and start trading."
    link="/deposit"
    linkText="Make a Deposit"
    img="/learn/deposit.png"
    timeUsage="~5—15 minutes"
    animationVariant={animationVariant}
  />
);
