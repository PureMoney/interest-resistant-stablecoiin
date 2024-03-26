import "solana";
import "./openbook_v2.sol";

@program_id("2VN914zCR1WkHwXeP8vRdimBWMYuNGL9MqJbbQ28SmMy")
contract openbookv_2_interface {

    // A private instance of the PlaceOrderArgs struct
    // This is the data that is stored in the account
    PlaceOrderArgs private placeOrderArgs;

    @payer(payer) // "payer" is the account that pays to create the dataAccount
    constructor(
        @space uint16 space // "space" allocated to the account (maximum 10240 bytes, maximum space that can be reallocate when creating account in program via a CPI) 
        // Side	_side,
        // int64	_priceLots,
        // int64	_maxBaseLots,
        // int64	_maxQuoteLotsIncludingFees,
        // uint64	_clientOrderId,
        // PlaceOrderType	_orderType,
        // uint64	_expiryTimestamp,
        // SelfTradeBehavior	_selfTradeBehavior,
        // uint8	_limit
    ) {
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

    // A function to get the PlaceOrderArgs data stored on the account
    function get() public view returns (PlaceOrderArgs) {
	    bytes8 discriminator = bytes8(sha256(bytes("global:placeOrder")));
        print("discriminator: {}".format(discriminator));
        return placeOrderArgs;
    }

    // A function to get the size in bytes of the stored PlaceOrderArgs
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
}
