import { Video } from "react-feather";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { DepositActionableCard } from "components/ui/actionable/cards/Deposit";
import { StartTradingActionableCard } from "components/ui/actionable/cards/StartTrading";

const CreateAccountPage: NextPage = () => {
  return (
    <>
      <div className="p-2 [&>*:not(:last-child)]:mb-6">
        <h2>Create an account</h2>
        <p className="mt-3">
          Congrats! You're a few steps away from making predictions on the App.
          Make a few simple steps to create an account and install your first
          Solana friendly wallet.
        </p>
        <p>
          The first thing any Web3 user needs is a crypto wallet to interact
          with various applications. In our case, we make use of Solana's
          blockchain technology, and thus you need a Solana-based wallet in
          order to interact with our app.
        </p>
        <p>
          There are a number of technologists who have built outstanding wallet
          technology, including{" "}
          <Link href="https://phantom.app/" className="underline">
            Phantom
          </Link>
          ,
          <Link href="https://solflare.com/" className="underline">
            Solflare
          </Link>
          . In this specific tutorial, we show you how to get a Solana-based
          wallet:
        </p>
      </div>
      <div className="mt-9 grid grid-cols-3 gap-x-8"></div>
      {/* <div className="my-9 flex p-2 text-blue">
        <a
          href="https://www.youtube.com/playlist?list=PLdOlgpqyU8RP-ZK2A2qbcfxOlzoeuR6sx"
          target="_blank"
          rel="noreferrer"
          className=" flex gap-3"
        >
          <div>Watch this tutorial about how to buy tokens using crypto</div>
          <Video />
        </a>
      </div> */}
      <h2 className="mb-9 p-2">Next Steps</h2>
      <div className="flex flex-col gap-4 md:flex-row">
        <DepositActionableCard />
        <StartTradingActionableCard />
      </div>
    </>
  );
};

export default CreateAccountPage;
