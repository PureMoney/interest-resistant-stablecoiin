import "../styles/globals.css";
require("@solana/wallet-adapter-react-ui/styles.css");
import React from "react";

import { ConnectionProvider } from "@solana/wallet-adapter-react";

// You can use any of the other enpoints here
export const NETWORK = RPC;

import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import ActiveLink from "../components/ActiveLink";
import { RPC } from "../utils/openbook";
import { RecentPrioritizationFees, GetRecentPrioritizationFeesConfig, Connection } from "@solana/web3.js";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {

  const connection = new Connection(RPC, { commitment: "confirmed" });
  connection.getRecentPrioritizationFees()
  .then((priorityFee: RecentPrioritizationFees[]) => {
    console.log("===>>> recent prioritization fees: ", priorityFee);
  })
  .catch((error: Error) => {
    console.error("==>> Error: ", error);
  });

  return (
    <ConnectionProvider endpoint={NETWORK}>

          <div className={`${inter.className} dark`}>
            <div className="w-full px-4 py-2 border-b-2">
              <div className="flex flex-row flex-wrap space-x-4">
                <div className="inline">
                  <ActiveLink href="/">Markets</ActiveLink>
                </div>
                <div className="inline">
                  <ActiveLink href="/create_market">Create Market</ActiveLink>
                </div>
              </div>
            </div>
            <Component {...pageProps} />
          </div>
    </ConnectionProvider>
  );
}
