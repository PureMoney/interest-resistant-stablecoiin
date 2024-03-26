// This file was generated by CLI "solang idl ../idl/openbook_v2.json"
// and then edited.
enum OracleType {
	Pyth,
	Stub,
	SwitchboardV1,
	SwitchboardV2,
	RaydiumCLMM
}
enum OrderState {
	Valid,
	Invalid,
	Skipped
}
enum BookSideOrderTree {
	Fixed,
	OraclePegged
}
enum EventType {
	Fill,
	Out
}
enum NodeTag {
	Uninitialized,
	InnerNode,
	LeafNode,
	FreeNode,
	LastFreeNode
}
enum PlaceOrderType {
	Limit,
	ImmediateOrCancel,
	PostOnly,
	Market,
	PostOnlySlide,
	FillOrKill
}
enum PostOrderType {
	Limit,
	PostOnly,
	PostOnlySlide
}
enum OrderParams {
	Market,
	ImmediateOrCancel,
	FillOrKill,
	Fixed,
	OraclePegged
}
enum ImmediateOrCancel {
	price_lots // i64?
}
enum FillOrKill {
	price_lots // i64
}
enum Fixed {
	price_lots,
	order_type // typed: PostOrderType
}
enum OraclePegged {
	price_offset_lots, // i64
	order_type, // typed: PostOrderType
	peg_limit  // i64
}

/// Self trade behavior controls how taker orders interact with resting limit orders of the same account.
/// This setting has no influence on placing a resting or oracle pegged limit order that does not match
/// immediately, instead it's the responsibility of the user to correctly configure his taker orders.
enum SelfTradeBehavior {
	DecrementTake,
	CancelProvide,
	AbortTransaction
}
enum Side {
	Bid,
	Ask
}

/// SideAndOrderTree is a storage optimization, so we don't need two bytes for the data
enum SideAndOrderTree {
	BidFixed,
	AskFixed,
	BidOraclePegged,
	AskOraclePegged
}
enum OrderTreeType {
	Bids,
	Asks
}

// Structs

struct OracleConfigParams {
	uint32 confFilter; // FIXME: need f32 here
	uint32 maxStalenessSlots;
}
struct OracleConfig {
	uint64 confFilter;  // FIXME: need f86 here
	int64 maxStalenessSlots;
	uint8[72] reserved;
}

/// Like `Option`, but implemented for `Pubkey` to be used with `zero_copy`
struct NonZeroPubkeyOption {
	address	key;
}
struct Position {
	/// Base lots in open bids
	int64	bidsBaseLots;
	/// Base lots in open asks
	int64	asksBaseLots;
	uint64	baseFreeNative;
	uint64	quoteFreeNative;
	uint64	lockedMakerFees;
	uint64	referrerRebatesAvailable;
	/// Count of ixs when events are added to the heap
	/// To avoid this, send remaining accounts in order to process the events
	uint64	penaltyHeapCount;
	/// Cumulative maker volume in quote native units (display only)
	uint128	makerVolume;
	/// Cumulative taker volume in quote native units (display only)
	uint128	takerVolume;
	/// Quote lots in open bids
	int64	bidsQuoteLots;
	uint8[64]	reserved;
}
struct OpenOrder {
	uint128	id;
	uint64	clientId;
	/// Price at which user's assets were locked
	int64	lockedPrice;
	uint8	isFree;
	uint8	sideAndTree;
	uint8[6]	padding;
}
struct EventHeapHeader {
	uint16	freeHead;
	uint16	usedHead;
	uint16	count;
	uint16	padd;
	uint64	seqNum;
}
struct EventNode {
	uint16	next;
	uint16	prev;
	uint8[4]	pad;
	AnyEvent	_event;
}
struct AnyEvent {
	uint8	eventType;
	uint8[143]	padding;
}
struct FillEvent {
	uint8	eventType;
	uint8	takerSide;
	uint8	makerOut;
	uint8	makerSlot;
	uint8[4]	padding;
	uint64	timestamp;
	uint64	seqNum;
	address	maker;
	uint64	makerTimestamp;
	address	taker;
	uint64	takerClientOrderId;
	int64	price;
	int64	pegLimit;
	int64	quantity;
	uint64	makerClientOrderId;
	uint8[8]	reserved;
}
struct OutEvent {
	uint8	eventType;
	uint8	side;
	uint8	ownerSlot;
	uint8[5]	padding0;
	uint64	timestamp;
	uint64	seqNum;
	address	owner;
	int64	quantity;
	uint8[80]	padding1;
}
/// InnerNodes and LeafNodes compose the binary tree of orders.
/// 
/// Each InnerNode has exactly two children, which are either InnerNodes themselves,
/// or LeafNodes. The children share the top `prefix_len` bits of `key`. The left
/// child has a 0 in the next bit, and the right a 1.
struct InnerNode {
	uint8	tag;
	uint8[3]	padding;
	/// number of highest `key` bits that all children share
	/// e.g. if it's 2, the two highest bits of `key` will be the same on all children
	uint32	prefixLen;
	/// only the top `prefix_len` bits of `key` are relevant
	uint128	key;
	/// indexes into `BookSide::nodes`
	uint32[2]	children;
	/// The earliest expiry timestamp for the left and right subtrees.
	/// 
	/// Needed to be able to find and remove expired orders without having to
	/// iterate through the whole bookside.
	uint64[2]	childEarliestExpiry;
	uint8[40]	reserved;
}
/// LeafNodes represent an order in the binary tree
struct LeafNode {
	/// NodeTag
	uint8	tag;
	/// Index into the owning OpenOrdersAccount's OpenOrders
	uint8	ownerSlot;
	/// Time in seconds after `timestamp` at which the order expires.
	/// A value of 0 means no expiry.
	uint16	timeInForce;
	uint8[4]	padding;
	/// The binary tree key, see new_node_key()
	uint128	key;
	/// Address of the owning OpenOrdersAccount
	address	owner;
	/// Number of base lots to buy or sell, always >=1
	int64	quantity;
	/// The time the order was placed
	uint64	timestamp;
	/// If the effective price of an oracle pegged order exceeds this limit,
	/// it will be considered invalid and may be removed.
	/// 
	/// Only applicable in the oracle_pegged OrderTree
	int64	pegLimit;
	/// User defined id for this order, used in FillEvents
	uint64	clientOrderId;
}
struct AnyNode {
	uint8	tag;
	uint8[87]	data;
}
struct OrderTreeRoot {
	uint32	maybeNode;
	uint32	leafCount;
}
/// A binary tree on AnyNode::key()
/// 
/// The key encodes the price in the top 64 bits.
struct OrderTreeNodes {
	uint8	orderTreeType;
	uint8[3]	padding;
	uint32	bumpIndex;
	uint32	freeListLen;
	uint32	freeListHead;
	uint8[512]	reserved;
	AnyNode[1024]	nodes;
}
/// Nothing in Rust shall use these types. They only exist so that the Anchor IDL
/// knows about them and typescript can deserialize it.
struct I80F48 {
	int128	val;
}
struct PlaceOrderArgs {
	Side	side;
	int64	priceLots;
	int64	maxBaseLots;
	int64	maxQuoteLotsIncludingFees;
	uint64	clientOrderId;
	PlaceOrderType	orderType;
	uint64	expiryTimestamp;
	SelfTradeBehavior	selfTradeBehavior;
	uint8	limit;
}
struct PlaceMultipleOrdersArgs {
	int64	priceLots;
	int64	maxQuoteLotsIncludingFees;
	uint64	expiryTimestamp;
}
struct PlaceOrderPeggedArgs {
	Side	side;
	int64	priceOffsetLots;
	int64	pegLimit;
	int64	maxBaseLots;
	int64	maxQuoteLotsIncludingFees;
	uint64	clientOrderId;
	PlaceOrderType	orderType;
	uint64	expiryTimestamp;
	SelfTradeBehavior	selfTradeBehavior;
	uint8	limit;
}
struct PlaceTakeOrderArgs {
	Side	side;
	int64	priceLots;
	int64	maxBaseLots;
	int64	maxQuoteLotsIncludingFees;
	PlaceOrderType	orderType;
	uint8	limit;
}

// Events

// event DepositLog (
// 	address	 openOrdersAccount,
// 	address	 signer,
// 	uint64	 baseAmount,
// 	uint64	 quoteAmount
// );
// event FillLog (
// 	address	 market,
// 	uint8	 takerSide,
// 	uint8	 makerSlot,
// 	bool	 makerOut,
// 	uint64	 timestamp,
// 	uint64	 seqNum,
// 	address	 maker,
// 	uint64	 makerClientOrderId,
// 	uint64	 makerFee,
// 	uint64	 makerTimestamp,
// 	address	 taker,
// 	uint64	 takerClientOrderId,
// 	uint64	 takerFeeCeil,
// 	int64	 price,
// 	int64	 quantity
// );
// event MarketMetaDataLog (
// 	address	 market,
// 	string	 name,
// 	address	 baseMint,
// 	address	 quoteMint,
// 	uint8	 baseDecimals,
// 	uint8	 quoteDecimals,
// 	int64	 baseLotSize,
// 	int64	 quoteLotSize
// );
// event TotalOrderFillEvent (
// 	uint8	 side,
// 	address	 taker,
// 	uint64	 totalQuantityPaid,
// 	uint64	 totalQuantityReceived,
// 	uint64	 fees
// );
// event SweepFeesLog (
// 	address	 market,
// 	uint64	 amount,
// 	address	 receiver
// );
// event OpenOrdersPositionLog (
// 	address	 owner,
// 	uint32	 openOrdersAccountNum,
// 	address	 market,
// 	int64	 bidsBaseLots,
// 	int64	 bidsQuoteLots,
// 	int64	 asksBaseLots,
// 	uint64	 baseFreeNative,
// 	uint64	 quoteFreeNative,
// 	uint64	 lockedMakerFees,
// 	uint64	 referrerRebatesAvailable,
// 	uint128	 makerVolume,
// 	uint128	 takerVolume
// );

// Finally, the interface!

@program_id("opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb")
interface openbook_v2 {
	/// Create a [`Market`](crate::state::Market) for a given token pair.
	@selector([0x67,0xe2,0x61,0xeb,0xc8,0xbc,0xfb,0xfe])
	function createMarket(string name,OracleConfigParams oracleConfig,int64 quoteLotSize,int64 baseLotSize,int64 makerFee,int64 takerFee,int64 timeExpiry) external;
	/// Close a [`Market`](crate::state::Market) (only
	/// [`close_market_admin`](crate::state::Market::close_market_admin)).
	@selector([0x58,0x9a,0xf8,0xba,0x30,0x0e,0x7b,0xf4])
	function closeMarket() external;
	/// Create an [`OpenOrdersIndexer`](crate::state::OpenOrdersIndexer) account.
	@selector([0x40,0x40,0x99,0xff,0xd9,0x47,0xf9,0x85])
	function createOpenOrdersIndexer() external;
	/// Close an [`OpenOrdersIndexer`](crate::state::OpenOrdersIndexer) account.
	@selector([0x67,0xf9,0xe5,0xe7,0xf7,0xfd,0xc5,0x88])
	function closeOpenOrdersIndexer() external;
	/// Create an [`OpenOrdersAccount`](crate::state::OpenOrdersAccount).
	@selector([0xcc,0xb5,0xaf,0xde,0x28,0x7d,0xbc,0x47])
	function createOpenOrdersAccount(string name) external;
	/// Close an [`OpenOrdersAccount`](crate::state::OpenOrdersAccount).
	@selector([0xb0,0x4a,0x73,0xd2,0x36,0xb3,0x5b,0x67])
	function closeOpenOrdersAccount() external;
	/// Place order --> bytes8 discriminator = bytes8(sha256(bytes("global:placeOrder")));
	//@selector([])
	function placeOrder(PlaceOrderArgs args) external returns (uint128);
	/// Place an order that shall take existing liquidity off of the book, not
	/// add a new order off the book.
	/// 
	/// This type of order allows for instant token settlement for the taker.
	@selector([0x03,0x2c,0x47,0x03,0x1a,0xc7,0xcb,0x55])
	function placeTakeOrder(PlaceTakeOrderArgs args) external;
	/// Process up to `limit` [events](crate::state::AnyEvent).
	/// 
	/// When a user places a 'take' order, they do not know beforehand which
	/// market maker will have placed the 'make' order that they get executed
	/// against. This prevents them from passing in a market maker's
	/// [`OpenOrdersAccount`](crate::state::OpenOrdersAccount), which is needed
	/// to credit/debit the relevant tokens to/from the maker. As such, Openbook
	/// uses a 'crank' system, where `place_order` only emits events, and
	/// `consume_events` handles token settlement.
	/// 
	/// Currently, there are two types of events: [`FillEvent`](crate::state::FillEvent)s
	/// and [`OutEvent`](crate::state::OutEvent)s.
	/// 
	/// A `FillEvent` is emitted when an order is filled, and it is handled by
	/// debiting whatever the taker is selling from the taker and crediting
	/// it to the maker, and debiting whatever the taker is buying from the
	/// maker and crediting it to the taker. Note that *no tokens are moved*,
	/// these are just debits and credits to each party's [`Position`](crate::state::Position).
	/// 
	/// An `OutEvent` is emitted when a limit order needs to be removed from
	/// the book during a `place_order` invocation, and it is handled by
	/// crediting whatever the maker would have sold (quote token in a bid,
	/// base token in an ask) back to the maker.
	@selector([0xdd,0x91,0xb1,0x34,0x1f,0x2f,0x3f,0xc9])
	function consumeEvents(uint64 limit) external;
	/// Process the [events](crate::state::AnyEvent) at the given positions.
	@selector([0xd1,0xe3,0x36,0x04,0x6d,0xac,0x29,0x47])
	function consumeGivenEvents(uint64[] slots) external;
	/// Cancel an order by its `order_id`.
	/// 
	/// Note that this doesn't emit an [`OutEvent`](crate::state::OutEvent) because a
	/// maker knows that they will be passing in their own [`OpenOrdersAccount`](crate::state::OpenOrdersAccount).
	@selector([0x5f,0x81,0xed,0xf0,0x08,0x31,0xdf,0x84])
	function cancelOrder(uint128 orderId) external;
	/// Cancel an order by its `client_order_id`.
	/// 
	/// Note that this doesn't emit an [`OutEvent`](crate::state::OutEvent) because a
	/// maker knows that they will be passing in their own [`OpenOrdersAccount`](crate::state::OpenOrdersAccount).
	@selector([0x73,0xb2,0xc9,0x08,0xaf,0xb7,0x7b,0x77])
	function cancelOrderByClientOrderId(uint64 clientOrderId) external returns (int64);
	/// Deposit a certain amount of `base` and `quote` lamports into one's
	/// [`Position`](crate::state::Position).
	/// 
	/// Makers might wish to `deposit`, rather than have actual tokens moved for
	/// each trade, in order to reduce CUs.
	@selector([0xf2,0x23,0xc6,0x89,0x52,0xe1,0xf2,0xb6])
	function deposit(uint64 baseAmount,uint64 quoteAmount) external;
	/// Refill a certain amount of `base` and `quote` lamports. The amount being passed is the
	/// total lamports that the [`Position`](crate::state::Position) will have.
	/// 
	/// Makers might wish to `refill`, rather than have actual tokens moved for
	/// each trade, in order to reduce CUs.
	@selector([0x80,0xcf,0x8e,0x0b,0x36,0xe8,0x26,0xc9])
	function refill(uint64 baseAmount,uint64 quoteAmount) external;
	/// Withdraw any available tokens.
	@selector([0xee,0x40,0xa3,0x60,0x4b,0xab,0x10,0x21])
	function settleFunds() external;
	/// Withdraw any available tokens when the market is expired (only
	/// [`close_market_admin`](crate::state::Market::close_market_admin)).
	@selector([0x6b,0x12,0x38,0x45,0xe4,0x38,0x37,0xa4])
	function settleFundsExpired() external;
	/// Sweep fees, as a [`Market`](crate::state::Market)'s admin.
	@selector([0xaf,0xe1,0x62,0x47,0x76,0x42,0x22,0x94])
	function sweepFees() external;
	/// Update the [`delegate`](crate::state::OpenOrdersAccount::delegate) of an open orders account.
	@selector([0xf2,0x1e,0x2e,0x4c,0x6c,0xeb,0x80,0xb5])
	function setDelegate() external;
	/// Set market to expired before pruning orders and closing the market (only
	/// [`close_market_admin`](crate::state::Market::close_market_admin)).
	@selector([0xdb,0x52,0xdb,0xec,0x3c,0x73,0xc5,0x40])
	function setMarketExpired() external;
	/// Remove orders from the book when the market is expired (only
	/// [`close_market_admin`](crate::state::Market::close_market_admin)).
	@selector([0x1b,0xd5,0x9f,0xbf,0x0c,0x74,0x70,0x79])
	function pruneOrders() external;
	@selector([0x5c,0x89,0x2d,0x03,0x2d,0x3c,0x75,0xe0])
	function stubOracleClose() external;
}
