import { AnchorProvider } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { useFakeProvider } from "./useOpenbookClient";
import { wallet } from "../utils/openbook";
import VirtualWallet from "./VirtualWallet";

export function useProvider() {
  const { connection } = useConnection();
  // const wallet = useWallet();
  const vWallet = new VirtualWallet(wallet);

  console.log("+++ useProvider, wallet address: ", wallet.publicKey.toBase58());

  const provider = useMemo(
    () => new AnchorProvider(connection, vWallet,
      {
        /** disable transaction verification step */
        skipPreflight: false,
        /** desired commitment level */
        commitment: "confirmed",
        /** preflight commitment level */
        preflightCommitment: "processed",
        /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
        maxRetries: 3,
        /** The minimum slot that the request can be evaluated at */
        minContextSlot: 10,
      }),
    [connection]
  );

  return provider;
}
