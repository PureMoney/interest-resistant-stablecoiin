import {
  findAllMarkets,
  IDL,
  MarketAccount,
  OPENBOOK_PROGRAM_ID,
  OpenBookV2Client,
} from "@openbook-dex/openbook-v2";
import { 
  ComputeBudgetProgram,
  SystemProgram,
  PublicKey, 
  TransactionInstruction,
  Connection,
  AddressLookupTableAccount,
  VersionedTransaction,
  Signer
} from "@solana/web3.js";
import {
  useHookConnection,
  useFakeProvider,
} from "../hooks/useOpenbookClient";
import {
  Keypair,
  TransactionMessage
} from "@solana/web3.js";

// MAINNET
// export const RPC = "https://misty-wcb8ol-fast-mainnet.helius-rpc.com/";
export const RPC = "https://solana-devnet.g.alchemy.com/v2/1CWmcO7kQEa6JVhajg7OHFRQ6ez8B4Hn"; 
// "https://misty-wcb8ol-fast-mainnet.helius-rpc.com/";
// DEVNET
// export const RPC = "https://aimil-f4d13p-fast-devnet.helius-rpc.com/";
export const wallet = Keypair.fromSecretKey(Buffer.from([24,105,222,171,35,253,194,201,63,69,117,238,56,78,161,104,145,176,229,183,71,220,44,76,96,168,97,103,63,195,141,140,105,150,65,21,37,101,206,169,91,23,115,252,4,238,124,111,64,255,212,81,56,143,157,239,75,200,189,208,29,236,223,234]));
export const openOrdersAdminE = Keypair.fromSecretKey(Buffer.from([96,174,120,155,96,155,36,145,229,40,187,3,122,248,81,150,176,211,14,237,62,42,103,58,76,92,149,44,4,190,138,208,227,160,177,197,118,160,22,192,64,69,128,241,3,72,96,106,126,75,255,41,110,200,28,149,223,136,92,66,146,107,48,63]));
export const closeMarketAdminE = Keypair.fromSecretKey(Buffer.from([139,3,108,25,70,204,86,129,91,44,96,7,4,56,193,95,18,123,243,128,108,131,122,126,130,165,185,152,243,155,89,78,40,231,67,34,57,76,167,176,242,12,195,61,175,104,64,211,152,111,109,14,164,189,168,236,47,149,169,175,126,34,254,167]));
export const consumeEventsAdminE = Keypair.fromSecretKey(Buffer.from([107,74,194,28,71,139,14,134,55,39,94,67,204,244,71,245,72,189,58,216,253,124,61,100,229,26,91,154,162,201,213,22,112,247,0,120,104,42,64,192,131,107,122,187,136,23,253,50,131,242,218,32,244,141,65,206,228,23,103,203,174,85,195,238]));
export const walletTokenAcct4ROKS = new PublicKey("5VNRZzJfk6Cfzxd1giXPitvf5yrdixLTwgKPdKTgLerJ"); // ROKS container in principal's wallet
export const walletTokenAcct4USDC = new PublicKey("5KGAUASRHPwthAWKooyWMaShoXAy6ogGJn2GP6ChTroX");
export const tokenUSDC = new PublicKey("E6oEFEuYUYEt8U5mmKQvzvRUhRmgHCsVpmcyyrPEbCNy"); // fake usdc
export const tokenROKS = new PublicKey("roksyHbKUYGp2Him7ubyruUXSKXXMy7hZP7u81vxCN8");
// / export const chainlink = new PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny"); // chainlink

// from "@openbook-dex/openbook-v2/dist/types"
// this should have been exported from there
interface Market {
  market: string;
  baseMint: string;
  quoteMint: string;
  name: string;
  timestamp: number | null | undefined;
}

const nonceAcct = new PublicKey("GjbJUK45q4AHRa3GHtwgQbcYpGScBPCGkfXLMmZes3rk");
const lookupTableAddress = new PublicKey("3hA6zazrv9cWJ8hMm4oHVgJcPvdSpmAtzZ2bfsRe1LrN");
// export const connection = new Connection("https://aimil-f4d13p-fast-devnet.helius-rpc.com/");
const connection = new Connection(RPC);

let lookupTableAccount: AddressLookupTableAccount;
connection.getAddressLookupTable(lookupTableAddress)
.then((account) => {
  lookupTableAccount = account.value;
});

export const ixAdvanceNonce = async (compUnits: number) => {
  const advanceNonce = SystemProgram.nonceAdvance({
    noncePubkey: nonceAcct,
    authorizedPubkey: wallet.publicKey
  });
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: compUnits
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 20000
  });
  return [advanceNonce, modifyComputeUnits, addPriorityFee];
};

export const sendVersionedTx = async (instructions: TransactionInstruction[], additionalSigners: Signer[] = []) => {
  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  // construct a v0 compatible transaction `Message`
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions
  }).compileToV0Message([lookupTableAccount]);

  // create a v0 transaction from the v0 message
  const transactionV0 = new VersionedTransaction(messageV0);
  transactionV0.sign([wallet, ...additionalSigners]);

  return await connection.sendTransaction(transactionV0, {
    skipPreflight: true,
  });

};

export const fetchData = async () => {
  const connection = useHookConnection();
  const provider = useFakeProvider();
  console.log("---> openbook v2 public key: ", OPENBOOK_PROGRAM_ID.toBase58());
  const mkts: string[] = [];
  const uniqueMarkets: Market[] = [];
  const markets = await findAllMarkets(connection, OPENBOOK_PROGRAM_ID, provider);
  console.log("==> markets length: ", markets.length);
  markets.forEach(mkt => {
    if (!mkts.includes(mkt.market)) {
      mkts.push(mkt.market);
      uniqueMarkets.push(mkt);
    }
  });
  console.log("==> uniqueMarkets len: ", uniqueMarkets.length);
  return uniqueMarkets;
};

export const getMarket = async (
  client: OpenBookV2Client,
  publicKey: string
): Promise<MarketAccount> => {
  console.log("--> market selected: ", publicKey);
  let market = null;
  if (!!client.getMarketAccount)
    market = await client.getMarketAccount(new PublicKey(publicKey));
  return market ? market : ({} as MarketAccount);
};
