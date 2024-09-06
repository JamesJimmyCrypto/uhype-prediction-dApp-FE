import { ActionableCard, ActionableCardProps } from "../ActionableCard";

export const StartTradingActionableCard = ({
  animationVariant,
}: {
  animationVariant?: ActionableCardProps["animationVariant"];
}) => (
  <ActionableCard
    title="Start Trading"
    description="Our platform provides all you need. Explore markets and place trades based on your predictions."
    link="/markets"
    linkText="Make Predictions"
    img="/learn/start_trading.png"
    timeUsage="No time limits"
    animationVariant={animationVariant}
  />
);
