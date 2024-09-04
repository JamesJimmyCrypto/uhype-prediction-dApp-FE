import "react-datetime/css/react-datetime.css";
import "styles/index.css";

import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import * as Fathom from "fathom-client";

import Devtools from "components/devtools";
import DefaultLayout from "layouts/DefaultLayout";
import { appQueryClient } from "lib/query-client";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { hotjar } from "react-hotjar";

// font optimization from @next/font
import { inter, kanit, roboto_mono } from "lib/util/fonts";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppWalletProvider } from "components/account/Wallet";

// environment variables set in .env.local or vercel interface
const fathomSiteId = process.env["NEXT_PUBLIC_FATHOM_SITE_ID"];
const domain = process.env["NEXT_PUBLIC_DOMAIN"];
const hotjarSiteId = process.env["NEXT_PUBLIC_HOTJAR_SITE_ID"];
const isProduction =
  process.env.NEXT_PUBLIC_SITE_URL === "https://dehype.openverse.tech";

const MyApp = ({ Component, pageProps }) => {
  const Layout = Component.Layout ? Component.Layout : React.Fragment;
  const router = useRouter();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!isProduction) {
      return;
    }
    // disable fathom analyitics if not set
    if (!fathomSiteId) {
      return;
    }

    if (domain) {
      Fathom.load(fathomSiteId, {
        includedDomains: [domain],
      });
    }

    function onRouteChangeComplete() {
      Fathom.trackPageview();
    }

    router.events.on("routeChangeComplete", onRouteChangeComplete);

    if (hotjarSiteId) {
      hotjar.initialize(Number(hotjarSiteId), 6);
    }

    return () =>
      router.events.off("routeChangeComplete", onRouteChangeComplete);
  }, []);

  return (
    <div
      className={`${inter.variable} ${kanit.variable} ${roboto_mono.variable} font-sans `}
    >
      <style jsx global>
        {`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-kanit: ${kanit.style.fontFamily};
            --font-roboto-mono: ${roboto_mono.style.fontFamily};
          }
        `}
      </style>
      <AppWalletProvider>
        <QueryClientProvider client={appQueryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <Head>
              <title>Dehype - Prediction Markets</title>
            </Head>
            <DefaultLayout>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </DefaultLayout>
            {/* <Devtools /> */}
          </Hydrate>
        </QueryClientProvider>
      </AppWalletProvider>
    </div>
  );
};

export default MyApp;
