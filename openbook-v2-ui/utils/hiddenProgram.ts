import { Keypair, 
    SystemProgram, 
    NONCE_ACCOUNT_LENGTH, 
    Connection, 
    Transaction,
    VersionedTransaction, 
    TransactionMessage, 
    AddressLookupTableProgram,
    ComputeBudgetProgram,
    PublicKey 
} from "@solana/web3.js";
import { Delius_Swash_Caps, Fjalla_One } from "next/font/google";

// import { CONNECTION, FEE_PAYER } from "../../../helper/const";
const FEE_PAYER = Keypair.fromSecretKey(Buffer.from([164,194,136,94,233,65,165,208,75,245,90,107,249,22,177,123,5,3,94,115,58,77,230,182,13,216,123,150,132,124,164,50,169,10,183,190,150,134,235,193,11,170,208,226,204,97,85,207,17,147,3,87,127,67,19,228,21,215,237,80,0,248,229,217]));
const nonceAcct = Keypair.fromSecretKey(Buffer.from([254,114,101,148,242,76,146,16,124,34,230,29,205,159,250,1,40,28,223,62,96,68,251,64,34,68,183,9,243,17,245,133,233,200,123,126,9,250,146,86,105,140,54,184,200,94,134,158,207,254,47,35,173,18,240,49,191,205,191,136,13,138,60,173]));
const CONNECTION = new Connection("https://aimil-f4d13p-fast-devnet.helius-rpc.com/");

// create nonce account
//
async function main() {
  let nonceAccount = Keypair.generate();
  console.log(`nonce account: ${nonceAccount.secretKey.toString()}`);

  let blockhash = await CONNECTION
    .getLatestBlockhash()
    .then(res => res.blockhash);
  // create an array with your desired `instructions`
  const instructions = [
    // create nonce account
    SystemProgram.createAccount({
        fromPubkey: FEE_PAYER.publicKey,
        newAccountPubkey: nonceAccount.publicKey,
        lamports: await CONNECTION.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH),
        space: NONCE_ACCOUNT_LENGTH,
        programId: SystemProgram.programId,
      }),
    // init nonce account
    SystemProgram.nonceInitialize({
        noncePubkey: nonceAccount.publicKey, // nonce account pubkey
        authorizedPubkey: FEE_PAYER.publicKey, // nonce account auth
    })
  ];
  
  // create v0 compatible message
  const messageV0 = new TransactionMessage({
    payerKey: FEE_PAYER.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  
  let tx = new VersionedTransaction(messageV0);
  tx.sign([FEE_PAYER, nonceAccount]);

  console.log(`txhash: ${await CONNECTION.sendTransaction(tx)}`);
}

// create Lookup table
//
async function main2() {
    // connect to a cluster and get the current `slot`
    const slot = (await CONNECTION.getLatestBlockhashAndContext()).context.slot;

    // Assumption:
    // `payer` is a valid `Keypair` with enough SOL to pay for the execution

    const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
        authority: FEE_PAYER.publicKey,
        payer: FEE_PAYER.publicKey,
        recentSlot: slot,
    });

    console.log("lookup table address:", lookupTableAddress.toBase58());

    const advanceNonce = SystemProgram.nonceAdvance({
        noncePubkey: nonceAcct.publicKey,
        authorizedPubkey: FEE_PAYER.publicKey
    });

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 200000
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 20000
    });
    
    // add addresses to the `lookupTableAddress` table via an `extend` instruction
    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
        payer: FEE_PAYER.publicKey,
        authority: FEE_PAYER.publicKey,
        lookupTable: lookupTableAddress,
        addresses: [
            FEE_PAYER.publicKey,
            SystemProgram.programId,
            new PublicKey("E6oEFEuYUYEt8U5mmKQvzvRUhRmgHCsVpmcyyrPEbCNy"),
            new PublicKey("roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8"),
            new PublicKey("F9CWSA6gsopj8zN6RetEoAZN9UtBtgRGu5gan8D4ZriZ"),
            nonceAcct.publicKey
        ],
    });

    const blockhash = await CONNECTION
        .getLatestBlockhash()
        .then(res => res.blockhash);

    const messageV0 = new TransactionMessage({
        payerKey: FEE_PAYER.publicKey,
        recentBlockhash: blockhash,
        instructions: [ advanceNonce, modifyComputeUnits, addPriorityFee, lookupTableInst, extendInstruction ]
    }).compileToLegacyMessage();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([FEE_PAYER]);

    const txId = await CONNECTION.sendTransaction(transaction);

    console.log("--> txId: ", txId);
}

// create openOrdersAccount (data)
//
async function main3() {
  const signer = Keypair.generate();
  console.log("--> openOrdersAccount: ", signer.secretKey);

  const orderAcctInst = SystemProgram.createAccount({
    fromPubkey: FEE_PAYER.publicKey,
    lamports: 2672640, // 2264320,
    newAccountPubkey: signer.publicKey,
    programId: new PublicKey("opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"),
    space: 256
  });

  const advanceNonce = SystemProgram.nonceAdvance({
    noncePubkey: nonceAcct.publicKey,
    authorizedPubkey: FEE_PAYER.publicKey
  });

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 200000
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 20000
  });

  const blockhash = await CONNECTION
    .getLatestBlockhash()
    .then(res => res.blockhash);

  const messageV0 = new TransactionMessage({
    payerKey: FEE_PAYER.publicKey,
    recentBlockhash: blockhash,
    instructions: [ advanceNonce, modifyComputeUnits, addPriorityFee, orderAcctInst ]
  }).compileToLegacyMessage();

  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([FEE_PAYER, signer]);

  const txId = await CONNECTION.sendTransaction(transaction);

  console.log("--> txId: ", txId);
}

main3().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);