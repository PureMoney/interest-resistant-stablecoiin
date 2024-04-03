import "solana";
import "./openbook_v2.sol";

@program_id("4b6V88qC7MXuvFhnTf1wSTQVJj7eswky6WkETaNqTJtm")
contract openbookv_2_interface {

    // A private instance of the PlaceOrderArgs struct
    // This is the data that is stored in the account
    PlaceOrderArgs private placeOrderArgs;
    OracleConfigParams private oracleConfigParams;

    @payer(payer) // "payer" is the account that pays to create the dataAccount
    constructor(
        @space uint16 space // "space" allocated to the account (maximum 10240 bytes, maximum space that can be reallocate when creating account in program via a CPI) 
    ) {
        // Setup Oracles setting
        oracleConfigParams = OracleConfigParams(
            1.0, // confFilter (f32)
            100  // maxStalenessSlots (u32)
        );
        // The PlaceOrderArgs instance is initialized with the data passed to the constructor
        placeOrderArgs = PlaceOrderArgs(
            Side.Bid,
            1024, // _priceLots,
            2048, // _maxBaseLots,
            347090, // _maxQuoteLotsIncludingFees,
            47823, // _clientOrderId,
            PlaceOrderType.Market, // _orderType,
            9077520, // _expiryTimestamp,
            SelfTradeBehavior.AbortTransaction, // _selfTradeBehavior,
            80 // _limit
        );
    }

    // Only for testing: A function to get the PlaceOrderArgs data stored on the account
    function get() public view returns (PlaceOrderArgs) {
	    // bytes8 discriminator = bytes8(sha256(bytes("global:placeOrder")));
        // print("discriminator: {}".format(discriminator));
        return placeOrderArgs;
    }

    // Only for testing: A function to get the size in bytes of the stored PlaceOrderArgs
    function getOrderInfoSize() public pure returns(uint) {
        uint size = 0;
        size += 1; // cannot convert enum to a byte
        size += 8; // bytes(placeOrderArgs.priceLots).length;
        size += 8; // bytes(placeOrderArgs.maxBaseLots).length;
        size += 8; // bytes(placeOrderArgs.maxQuoteLotsIncludingFees).length;
        size += 8; // bytes(placeOrderArgs.client_order_id).length;
        size += 1; // bytes(placeOrderArgs.orderType).length;
        size += 8; // bytes(placeOrderArgs.expiryTimestamp).length;
        size += 1; // bytes(placeOrderArgs.selfTradeBehavior).length;
        size += 1; // bytes(placeOrderArgs.limit).length;
        print("size = {}".format(size));
        return size;
    }

    // A function for creating the ROKS market
    // Ensure that this gets called only by our account
    @mutableSigner(market)
    @account(marketAuthority)
    @mutableAccount(bids)
    @mutableAccount(asks)
    @mutableAccount(eventHeap)
    @mutableSigner(payer)
    @mutableAccount(marketBaseVault)
    @mutableAccount(marketQuoteVault)
    @account(baseMint)
    @account(quoteMint)
    // @account(systemProgram)
    // @account(tokenProgram)
    // @account(associatedTokenProgram)
    @account(oracleA)
    @account(oracleB)
    @account(collectFeeAdmin)
    @account(openOrdersAdmin)
    @account(consumeEventsAdmin)
    @account(closeMarketAdmin)
    @account(eventAuthority)
    @account(program)
    function createROKSMarket() external {

        // number of accounts needed is 21 minus 5 optional
        AccountMeta[13] am = [
            AccountMeta({ pubkey: tx.accounts.market.key,                 is_writable: true,  is_signer: true  }),
            AccountMeta({ pubkey: tx.accounts.marketAuthority.key,        is_writable: false, is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.bids.key,                   is_writable: true,  is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.asks.key,                   is_writable: true,  is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.eventHeap.key,              is_writable: true,  is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.payer.key,                  is_writable: true,  is_signer: true  }),
            AccountMeta({ pubkey: tx.accounts.marketBaseVault.key,        is_writable: true,  is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.marketQuoteVault.key,       is_writable: true,  is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.baseMint.key,               is_writable: false, is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.quoteMint.key,              is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.systemProgram.key,          is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.tokenProgram.key,           is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.associatedTokenProgram.key, is_writable: false, is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.collectFeeAdmin.key,        is_writable: false, is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.eventAuthority.key,         is_writable: false, is_signer: false }),
            AccountMeta({ pubkey: tx.accounts.program.key,                is_writable: false, is_signer: false })
        ];

        // market has been created; this is just for illustration
        openbook_v2.createMarket{accounts: am}(
            "ROKS: Inflation Resistant Stablecoin",
            oracleConfigParams,
            100000000, // quoteLotSize
            100000000, // baseLotSize
            1000000,   // makerFee
            1000000,   // takerFee
            0          // timeExpiry
        );
    }
}
