import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Openbookv2Interface } from "../target/types/openbookv_2_interface";
import { BN } from "bn.js";

describe("anchor-solang", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const dataAccount = anchor.web3.Keypair.generate();
  const wallet = provider.wallet;

  const program = anchor.workspace.Openbookv2Interface as Program<Openbookv2Interface>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .new(128) // , Side.Bid, 2321, 123, 8784364, 734, PlaceOrderType.Market, 89284928, SelfTradeBehavior.AbortTransaction, 128 )
      .accounts({ dataAccount: dataAccount.publicKey, payer: wallet.publicKey })
      .signers([dataAccount])
      .rpc();
    console.log("Your transaction signature", tx);

    const val1 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view();

    console.log("state", val1);

    const val3 = await program.methods
      .calcDiscriminator()
      .view();

    console.log("discriminator: ", val3);

    // Note: ROKS-USDC market has been created
    // This is just for showing how to call into solang.
    const val2 = await program.methods
      .editOrder(
        new BN(100045),
        new BN(100)
      )
      .accounts({ 
        signer: "87AhFAiVEVdFZqaQWnhu7j6WViobUnzmSQoqjCKRW1ys" // ,
        // openOrdersAccount: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // openOrdersAdmin: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // userTokenAccount: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // market: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // bids: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // asks: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // eventHeap: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // marketVault: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // oracleA: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // oracleB: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        // tokenProg: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
      })
      .rpc();

    console.log("edit order return: ", val2.toString());
  });
});
