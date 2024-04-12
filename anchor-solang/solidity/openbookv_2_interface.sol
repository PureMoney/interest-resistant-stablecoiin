import "solana";
import "./openbook_v2.sol";

@program_id("4b6V88qC7MXuvFhnTf1wSTQVJj7eswky6WkETaNqTJtm")
contract openbookv_2_interface {

    // A private instance of the PlaceOrderArgs struct
    // This is the data that is stored in the account
    PlaceOrderArgs private placeOrderArgs;
    // OracleConfigParams private oracleConfigParams;

    @payer(payer) // "payer" is the account that pays to create the dataAccount
    constructor(
        @space uint16 space // "space" allocated to the account (maximum 10240 bytes, maximum space that can be reallocate when creating account in program via a CPI) 
    ) {
        // Setup Oracles setting
        // oracleConfigParams = OracleConfigParams(
        //     1.0, // confFilter (f32)
        //     100  // maxStalenessSlots (u32)
        // );
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

    function calcDiscriminator() public returns (bytes8) {
        bytes funcName = bytes("global:editOrder");
        bytes8 discriminator = bytes8(sha256(funcName));
        // print("discriminator: {}".format(discriminator));

        return discriminator;
    }

    // A function for editing or modifying the ROKS market perpetual order
    // Ensure that this gets called only by our account
    @mutableSigner(signer)
    // @mutableSigner(openOrdersAccount)
    // @account(openOrdersAdmin)
    // @mutableAccount(userTokenAccount)
    // @mutableAccount(market)
    // @mutableAccount(bids)
    // @mutableAccount(asks)
    // @mutableAccount(eventHeap)
    // @account(marketVault)
    // @account(oracleA)
    // @account(oracleB)
    // @account(tokenProg)
    function editOrder(
            uint64 clientOrderId,
            int64 expectedCancelSize
            // PlaceOrderArgs placeOrder
    ) external returns(string) {

        // number of accounts needed is 21 minus 5 optional
        AccountMeta[1] am = [
            AccountMeta({ pubkey: tx.accounts.signer.key,                 is_writable: true,  is_signer: true  })
            // AccountMeta({ pubkey: tx.accounts.openOrdersAccount.key,      is_writable: true,  is_signer: true  }),
            // AccountMeta({ pubkey: tx.accounts.openOrdersAdmin.key,        is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.userTokenAccount.key,       is_writable: true,  is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.market.key,                 is_writable: true,  is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.bids.key,                   is_writable: true,  is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.asks.key,                   is_writable: true,  is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.eventHeap.key,              is_writable: true,  is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.marketVault.key,            is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.oracleA.key,                is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.oracleB.key,                is_writable: false, is_signer: false }),
            // AccountMeta({ pubkey: tx.accounts.tokenProg.key,              is_writable: false, is_signer: false })
            ];

        // // market has been created and perpetual order placed, we can only edit the order
        // openbook_v2.editOrder{accounts: am}(
        //     clientOrderId,
        //     expectedCancelSize,
        //     placeOrder
        // );
        return "It's good";
    }
}
