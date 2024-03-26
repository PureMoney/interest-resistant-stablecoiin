// Script for creating the ROKS market
// C. Tapang 03/24/2024
// Parameters (as recommended in )
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Openbookv2Interface } from "../target/types/openbookv_2_interface";

// Configure the client to use the local cluster.
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const dataAccount = anchor.web3.Keypair.generate();
const wallet = provider.wallet;

const program = anchor.workspace.Openbookv2Interface as Program<Openbookv2Interface>;

// Add your test here.
program.methods
    .new(128)
    .accounts({ dataAccount: dataAccount.publicKey, payer: wallet.publicKey })
    .signers([dataAccount])
    .rpc()
    .then((tx) => {
        console.log("Your transaction signature", tx);

        return program.methods
            .get()
            .accounts({ dataAccount: dataAccount.publicKey })
            .view();
    })
    .then((val1) => {
        console.log("state", val1);

        return program.methods
            .getOrderInfoSize()
            .accounts({ dataAccount: dataAccount.publicKey })
            .view();
    })
    .then((bn) => {
        console.log("size: ", bn.toString());
    })
    .catch((error) => {
        console.error("failed, error: ", error);
    });

