import { ActionableCard, ActionableCardProps } from "../ActionableCard";

export const CreateAccountActionableCard = ({
  animationVariant,
}: {
  animationVariant?: ActionableCardProps["animationVariant"];
}) => (
  <ActionableCard
    title="Create an Account"
    description="Follow a few simple steps to create an account and set up your first Solana-friendly wallet."
    link="/create-account"
    linkText="Create an Account"
    img="/learn/create_account.png"
    timeUsage="~5 minutes"
    animationVariant={animationVariant}
  />
);
