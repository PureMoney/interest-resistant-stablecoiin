import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Openbookv2Interface } from "../target/types/openbookv_2_interface";

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

    // Note: ROKS-USDC market has been created
    // This is just for showing how to call into solang.
    const val2 = await program.methods
      .createROKSMarket()
      .accounts({ 
        // market: marketMgr,
        // marketAuthority: immutableAndNonSigner,
        // bids: dataAccount1.publicKey,
        // asks: dataAccount2.publicKey,
        // eventHeap: dataAccount3.publicKey,
        // payer: wallet.publicKey,
        // marketBaseVault: dataAccount4.publicKey,
        // marketQuoteVault: dataAccount5.publicKey,
        baseMint: "roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8",
        dataAccount: dataAccount.publicKey })
      .rpc();

    console.log("size", val2.toString());
  });
});
