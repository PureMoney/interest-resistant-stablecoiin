import Head from "next/head";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";

import React from "react";
import { 
  fetchData, 
  getMarket, 
  walletTokenAcct4ROKS, 
  wallet, 
  ixAdvanceNonce, 
  sendVersionedTx,
  openOrdersAdminE,
  getAccountInfo
} from "../utils/openbook";
import { BN } from "@coral-xyz/anchor";

import { LinkIcon } from "@heroicons/react/24/outline";
import {
  MarketAccount,
  OrderType,
  SelfTradeBehavior,
  Side,
  nameToString,
  priceLotsToUi,
} from "@openbook-dex/openbook-v2";
import { useOpenbookClient } from "../hooks/useOpenbookClient";
import { Keypair, PublicKey } from "@solana/web3.js";
// import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

function priceData(key) {
  const shiftedValue = key.shrn(64); // Shift right by 64 bits
  return shiftedValue.toNumber(); // Convert BN to a regular number
}

export default function Home() {
  // const { publicKey } = wallet; //useWallet();
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  // const [isLoading, setIsLoading] = React.useState(true);
  const [markets, setMarkets] = useState([
    { market: "", baseMint: "", quoteMint: "", name: "" },
  ]);
  const [market, setMarket] = useState({} as MarketAccount);
  const [marketPubkey, setMarketPubkey] = useState(new PublicKey("EU5dWkUXRgHRQBkvMhm8wtQcAF9Lgkpe9KsRuoyp9ke5"));
  // const [txState, setTxState] = React.useState<ButtonState>("initial");

  const columns = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "market",
      label: "Pubkey",
    },
    {
      key: "baseMint",
      label: "Base Mint",
    },
    {
      key: "quoteMint",
      label: "Quote Mint",
    },
  ];

  const columnsBook = [
    {
      key: "owner",
      label: "OWNER",
    },
    {
      key: "quantity",
      label: "SIZE",
    },
    {
      key: "key",
      label: "PRICE",
    },
  ];

  const openbookClient = useOpenbookClient();

  useEffect(() => {
    if (markets.length === 1 && markets[0].market === "") {
      fetchData()
      .then((res) => {
        setMarkets(res);
        fetchMarket(res[0].market);
        setMarketPubkey(new PublicKey(res[0].market));
      })
      .catch((e) => {
        console.log(e);
      });
    }
  }, []);

  function priceDataToUI(key) {
    const shiftedValue = key.shrn(64); // Shift right by 64 bits
    const priceLots = shiftedValue.toNumber(); // Convert BN to a regular number

    return priceLotsToUi(market, priceLots);
  }

  const fetchMarket = async (key: string) => {
    const market = await getMarket(openbookClient, key);
    setMarket(market);
    setMarketPubkey(new PublicKey(key));

    if (!openbookClient.getBookSide) return;

    const booksideAsks = await openbookClient.getBookSide(market.asks);
    const booksideBids = await openbookClient.getBookSide(market.bids);
    if (booksideAsks === null || booksideBids === null) return;
    const asks = openbookClient.getLeafNodes(booksideAsks).sort((a, b) => {
      const priceA = priceData(a.key);
      const priceB = priceData(b.key);
      return priceB - priceA;
    });
    setAsks(asks);
    const bids = openbookClient.getLeafNodes(booksideBids).sort((a, b) => {
      const priceA = priceData(a.key);
      const priceB = priceData(b.key);
      return priceB - priceA;
    });
    setBids(bids);
  };

  const linkedPk = (pk: string) => (
    <div>
      {pk}
      <a
        href={`https://solscan.io/account/${pk}`}
        target="_blank"
        className="pl-2"
      >
        <LinkIcon className="w-4 h-4 inline" />
      </a>
    </div>
  );

  const crankMarket = async () => {
    let accountsToConsume = await openbookClient.getAccountsToConsume(market);
    console.log("accountsToConsume", accountsToConsume);
    console.log("marketPubkey: ", marketPubkey.toBase58());

    try {
      if (accountsToConsume.length > 0) {
        const tx = await openbookClient.consumeEvents(
          marketPubkey,
          market,
          new BN(5),
          accountsToConsume
        );
        console.log("consume events tx", tx);
        toast("Consume events tx: " + tx.toString());
      }
    }
    catch (error) {
      console.error(error);
    };
  };

  // create open orders indexer
  const createIndexer = async () => {
    const indexerAccount = Keypair.generate();
    const ixMoveNonce = await ixAdvanceNonce(20000);
    const ixOpenOrdersIndexer = await openbookClient.createOpenOrdersIndexerInstruction(indexerAccount.publicKey, wallet.publicKey);

    return await sendVersionedTx([...ixMoveNonce, ixOpenOrdersIndexer]);
  };

  // place uneditable order
  const placeOrder = async () => {
      console.log("market pub key picked up from app:");
      console.log(marketPubkey.toBase58());

    try {
      const openOrdersDelegate = null;
      const args = {
        side: Side.Ask,
        priceLots: new BN(100_000_000),
        maxBaseLots: new BN(92_233_720),
        maxQuoteLotsIncludingFees: new BN(92_233_720_360),
        clientOrderId: new BN(7999999999),
        orderType: OrderType.Limit,
        expiryTimestamp: undefined,
        selfTradeBehavior: SelfTradeBehavior.AbortTransaction,
        limit: 200 // count of orders to fill - must be unlimited
      };
      const marketVault = /* args.side === Side.Bid ? market.marketQuoteVault : */ market.marketBaseVault;
      const remainingAccounts = [
        // nonceAcct.publicKey,
        // lookupTableAddress,
      ];
      const accountsMeta = remainingAccounts.map((remaining) => ({
          pubkey: remaining,
          isSigner: false,
          isWritable: true,
      }));

      // the instruction for createOpenOrders (below) searches for the indexer
      // rather than pass an indexer as a param; we pre-create it.
      // await createIndexer();
      // console.log("--> indexer created");

      const [ixCreateOpenOrders, openOrdersPubkey] = await openbookClient.createOpenOrdersInstruction(
        marketPubkey,
        new BN(1),
        "RockStable Open Orders",
        wallet.publicKey,
        openOrdersDelegate
      );

      // console.log("--> look for open orders accoun in market ", openbookMarket.publicKey.toBase58());
      // const openOrdersPubkey = openbookClient.findOpenOrders(openbookMarket.publicKey, new BN(0), wallet.publicKey);
      // if (!openOrdersPubkey) {
      //   console.error("--> open orders account not found");
      //   throw new Error("No open orders");
      // }

      const ixPlaceOrder = await openbookClient.program.methods
      .placeOrder(args)
      .accounts({
        signer: openOrdersDelegate != null
              ? openOrdersDelegate.publicKey
              : wallet.publicKey,
        market: marketPubkey,
        asks: market.asks,
        bids: market.bids,
        marketVault,
        eventHeap: market.eventHeap,
        openOrdersAccount: openOrdersPubkey,
        oracleA: market.oracleB.key, // nothing
        oracleB: market.oracleB.key, // nothing
        tokenProgram: TOKEN_PROGRAM_ID,
        // if below set to market.openOrdersAdmin.key: Error: failed to send transaction: Transaction signature verification failure;
        // wallet.publicKey, Error: failed to send transaction: Transaction simulation failed: Error processing Instruction 3: custom program error: 0x7d6 (2006)
        // [2006 is ConstraintSeeds error]
        openOrdersAdmin: openOrdersAdminE.publicKey,
        userTokenAccount: walletTokenAcct4ROKS
      })
      .remainingAccounts(accountsMeta)
      .instruction();

      const signers = [];
      if (openOrdersDelegate != null) {
          signers.push(openOrdersDelegate);
      }
      signers.push(wallet);
      signers.push(openOrdersAdminE);

      const ixMoveNonce2 = await ixAdvanceNonce(100000);

      let tx = null;

      const openOrdersAcct = openOrdersPubkey.toBase58();
      console.log("--> open orders: ", openOrdersAcct);
      if (openOrdersAcct.length === 44) {
        console.log("--> examine openOrdersAccount to make sure it doesn't belong to another market");
        const acctInfo = await getAccountInfo(openOrdersAcct);
        console.log("--> openOrdersAcctInfo: ", acctInfo);
      }
      else {
        tx = await sendVersionedTx([...ixMoveNonce2, ...ixCreateOpenOrders, ixPlaceOrder], signers);
      }
      console.log("placeOrder events tx", tx);
    } catch (error) {
      console.error(error);
    };
  };

  return (
    <div>
      <Head>
        <title>Openbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full h-full relative ">
        <div className="flex flex-col gap-3 pb-2.5">
          <Table
            isStriped
            selectionMode="single"
            aria-label="Markets"
            onRowAction={async (key) => fetchMarket(key.toString())}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={markets}>
              {(item) => (
                <TableRow key={item.market}>
                  {(columnKey) => (
                    <TableCell>
                      {columnKey == "name"
                        ? getKeyValue(item, columnKey)
                        : linkedPk(getKeyValue(item, columnKey))}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {market.asks ? (
          <div>
            <div className="grid grid-cols-2 gap-2 text-center border-r-4 border-b-4 border-l-4">
              <div className="">
                <p className="font-bold">Name </p>
                {market.asks ? nameToString(market.name) : ""}
                <p className="font-bold">Base Mint </p>
                {market.asks ? market.baseMint.toString() : ""}
                <p className="font-bold">Quote Mint </p>
                {market.asks ? market.quoteMint.toString() : ""}
                <p className="font-bold">Bids </p>
                {market.asks ? market.bids.toString() : ""}
                <p className="font-bold">Asks </p>
                {market.asks ? market.asks.toString() : ""}
                <p className="font-bold">Event Heap </p>
                {market.asks ? market.eventHeap.toString() : ""}
              </div>

              <div className="">
                <p className="font-bold">Base Deposits </p>
                {market.asks ? market.baseDepositTotal.toString() : ""}
                <p className="font-bold">Quote Deposits </p>
                {market.asks ? market.quoteDepositTotal.toString() : ""}
                <p className="font-bold">Taker Fees </p>
                {market.asks ? market.takerFee.toString() : ""}
                <p className="font-bold">Maker Fees </p>
                {market.asks ? market.makerFee.toString() : ""}
                <p className="font-bold">Base Lot Size </p>
                {market.asks ? market.baseLotSize.toString() : ""}
                <p className="font-bold">Quote Lot Size </p>
                {market.asks ? market.quoteLotSize.toString() : ""}
                <p className="font-bold">Base Decimals </p>
                {market.asks ? market.baseDecimals : ""}
                <p className="font-bold">Quote Decimals </p>
                {market.asks ? market.quoteDecimals : ""}
              </div>
            </div>

            <button
              className="items-center text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={(e: any) => crankMarket()}
            >
              CRANK
            </button>

            <button
              className="items-center text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={(e: any) => placeOrder()}
            >
              PLACE ORDER
            </button>

            <div>
              <h3 className="text-center mt-8 mb-5 text-xl">
                ASKS -------- The Book -------- BIDS
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 border-2">
              <Table isStriped selectionMode="single" aria-label="OrderBook">
                <TableHeader className="text-left" columns={columnsBook}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={asks}>
                  {(item) => (
                    <TableRow key={priceData(item.key)}>
                      {(columnKey) => (
                        <TableCell>
                          {columnKey == "owner"
                            ? getKeyValue(item, columnKey)
                                .toString()
                                .substring(0, 4) +
                              ".." +
                              getKeyValue(item, columnKey).toString().slice(-4)
                            : columnKey == "quantity"
                            ? getKeyValue(item, columnKey).toString()
                            : priceDataToUI(item.key)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Table isStriped selectionMode="single" aria-label="OrderBook">
                <TableHeader columns={columnsBook}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={bids}>
                  {(item) => (
                    <TableRow key={priceData(item.key)}>
                      {(columnKey) => (
                        <TableCell>
                          {columnKey == "owner"
                            ? getKeyValue(item, columnKey)
                                .toString()
                                .substring(0, 4) +
                              ".." +
                              getKeyValue(item, columnKey).toString().slice(-4)
                            : columnKey == "quantity"
                            ? getKeyValue(item, columnKey).toString()
                            : priceDataToUI(item.key)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <h1 className="text-center">This market has been closed!</h1>
        )}

        <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2023{" "}
              <a
                href="https://twitter.com/openbookdex"
                className="hover:underline"
              >
                Openbook Team
              </a>
              . All Rights Reserved.
            </span>
            <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
              <li>
                <a
                  href="https://twitter.com/openbookdex"
                  className="mr-4 hover:underline md:mr-6"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/openbook-dex"
                  className="mr-4 hover:underline md:mr-6"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="gofuckyourselfifyouwanttocontactus@weloveyou.shit"
                  className="hover:underline"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}
