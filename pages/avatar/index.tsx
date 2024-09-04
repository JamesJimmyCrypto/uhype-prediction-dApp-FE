import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import NotFoundPage from "pages/404";
import * as React from "react";

const Avatar = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const pubKey = publicKey?.toString() || "";
  if (pubKey) {
    router.replace(`/avatar/${pubKey}`);
    return <></>;
  }

  return <NotFoundPage />;
};

export default Avatar;
