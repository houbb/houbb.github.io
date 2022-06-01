---
layout: post
title:  Solidity-07-Solidity by Example
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# 投票

以下合约相当复杂，但展示了 Solidity 的许多功能。 

它实现了一个投票合约。 

当然，电子投票的主要问题是如何将投票权分配给正确的人以及如何防止操纵。 

我们不会在这里解决所有问题，但至少我们将展示如何进行委托投票，以便同时自动计算投票并且完全透明。

这个想法是为每张选票创建一份合同，为每个选项提供一个短名称。 

然后，担任主席的合约的创建者将分别授予每个地址的投票权。

然后，地址背后的人可以选择自己投票或将投票委托给他们信任的人。

在投票时间结束时，winningProposal() 将返回得票最多的提案。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.
contract Ballot {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// Create a new ballot to choose one of `proposalNames`.
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // Give `voter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address voter) external {
        // If the first argument of `require` evaluates
        // to `false`, execution terminates and all
        // changes to the state and to Ether balances
        // are reverted.
        // This used to consume all gas in old EVM versions, but
        // not anymore.
        // It is often a good idea to use `require` to check if
        // functions are called correctly.
        // As a second argument, you can also provide an
        // explanation about what went wrong.
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    /// Delegate your vote to the voter `to`.
    function delegate(address to) external {
        // assigns reference
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "You have no right to vote");
        require(!sender.voted, "You already voted.");

        require(to != msg.sender, "Self-delegation is disallowed.");

        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        // Since `sender` is a reference, this
        // modifies `voters[msg.sender].voted`
        Voter storage delegate_ = voters[to];

        // Voters cannot delegate to accounts that cannot vote.
        require(delegate_.weight >= 1);
        sender.voted = true;
        sender.delegate = to;
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
```

## 可能的改进

目前，需要许多交易才能将投票权分配给所有参与者。 

你能想出更好的方法吗？

# 盲拍 Blind Auction

在本节中，我们将展示在以太坊上创建一个完全盲目的拍卖合约是多么容易。 

我们将从公开拍卖开始，每个人都可以看到出价，然后将此合同扩展到盲拍，直到投标期结束才能看到实际出价。

## 简单公开拍卖

以下简单拍卖合约的总体思路是，每个人都可以在一个投标期间发送他们的投标。 

出价已经包括汇款/以太币，以便将投标人绑定到他们的出价。 

如果提出最高出价，则先前的最高出价者将收回他们的钱。 

投标期结束后，必须手动调用合同让受益人收到他们的钱——合同无法自行激活。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract SimpleAuction {
    // Parameters of the auction. Times are either
    // absolute unix timestamps (seconds since 1970-01-01)
    // or time periods in seconds.
    address payable public beneficiary;
    uint public auctionEndTime;

    // Current state of the auction.
    address public highestBidder;
    uint public highestBid;

    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;

    // Set to true at the end, disallows any change.
    // By default initialized to `false`.
    bool ended;

    // Events that will be emitted on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // Errors that describe failures.

    // The triple-slash comments are so-called natspec
    // comments. They will be shown when the user
    // is asked to confirm a transaction or
    // when an error is displayed.

    /// The auction has already ended.
    error AuctionAlreadyEnded();
    /// There is already a higher or equal bid.
    error BidNotHighEnough(uint highestBid);
    /// The auction has not ended yet.
    error AuctionNotYetEnded();
    /// The function auctionEnd has already been called.
    error AuctionEndAlreadyCalled();

    /// Create a simple auction with `biddingTime`
    /// seconds bidding time on behalf of the
    /// beneficiary address `beneficiaryAddress`.
    constructor(
        uint biddingTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionEndTime = block.timestamp + biddingTime;
    }

    /// Bid on the auction with the value sent
    /// together with this transaction.
    /// The value will only be refunded if the
    /// auction is not won.
    function bid() external payable {
        // No arguments are necessary, all
        // information is already part of
        // the transaction. The keyword payable
        // is required for the function to
        // be able to receive Ether.

        // Revert the call if the bidding
        // period is over.
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();

        // If the bid is not higher, send the
        // money back (the revert statement
        // will revert all changes in this
        // function execution including
        // it having received the money).
        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid != 0) {
            // Sending back the money by simply using
            // highestBidder.send(highestBid) is a security risk
            // because it could execute an untrusted contract.
            // It is always safer to let the recipients
            // withdraw their money themselves.
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    /// Withdraw a bid that was overbid.
    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            // msg.sender is not of type `address payable` and must be
            // explicitly converted using `payable(msg.sender)` in order
            // use the member function `send()`.
            if (!payable(msg.sender).send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd() external {
        // It is a good guideline to structure functions that interact
        // with other contracts (i.e. they call functions or send Ether)
        // into three phases:
        // 1. checking conditions
        // 2. performing actions (potentially changing conditions)
        // 3. interacting with other contracts
        // If these phases are mixed up, the other contract could call
        // back into the current contract and modify the state or cause
        // effects (ether payout) to be performed multiple times.
        // If functions called internally include interaction with external
        // contracts, they also have to be considered interaction with
        // external contracts.

        // 1. Conditions
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();

        // 2. Effects
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. Interaction
        beneficiary.transfer(highestBid);
    }
}
```

## 盲拍

下面将之前的公开拍卖扩展到盲拍。盲拍的优点是在投标期结束时没有时间压力。在透明的计算平台上创建盲目拍卖可能听起来很矛盾，但密码学可以解决这个问题。

在投标期间，投标人实际上并没有发送他们的投标，而只是一个经过哈希处理的版本。由于目前认为实际上不可能找到两个（足够长的）哈希值相等的值，因此投标人承诺以此投标。投标期结束后，投标人必须公开他们的投标：他们发送未加密的值，并且合约检查哈希值是否与投标期间提供的值相同。

另一个挑战是如何同时使拍卖具有约束力和盲目性：防止投标人在赢得拍卖后不发送资金的唯一方法是让他们与投标一起发送。

由于以太坊中的价值转移不能被蒙蔽，任何人都可以看到价值。

下面的合约通过接受任何大于最高出价的值来解决这个问题。

由于这当然只能在显示阶段进行检查，因此某些出价可能无效，这是故意的（它甚至提供了一个明确的标志来放置具有高价值转移的无效出价）：投标人可以通过放置几个高或低无效出价。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract BlindAuction {
    struct Bid {
        bytes32 blindedBid;
        uint deposit;
    }

    address payable public beneficiary;
    uint public biddingEnd;
    uint public revealEnd;
    bool public ended;

    mapping(address => Bid[]) public bids;

    address public highestBidder;
    uint public highestBid;

    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;

    event AuctionEnded(address winner, uint highestBid);

    // Errors that describe failures.

    /// The function has been called too early.
    /// Try again at `time`.
    error TooEarly(uint time);
    /// The function has been called too late.
    /// It cannot be called after `time`.
    error TooLate(uint time);
    /// The function auctionEnd has already been called.
    error AuctionEndAlreadyCalled();

    // Modifiers are a convenient way to validate inputs to
    // functions. `onlyBefore` is applied to `bid` below:
    // The new function body is the modifier's body where
    // `_` is replaced by the old function body.
    modifier onlyBefore(uint time) {
        if (block.timestamp >= time) revert TooLate(time);
        _;
    }
    modifier onlyAfter(uint time) {
        if (block.timestamp <= time) revert TooEarly(time);
        _;
    }

    constructor(
        uint biddingTime,
        uint revealTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        biddingEnd = block.timestamp + biddingTime;
        revealEnd = biddingEnd + revealTime;
    }

    /// Place a blinded bid with `blindedBid` =
    /// keccak256(abi.encodePacked(value, fake, secret)).
    /// The sent ether is only refunded if the bid is correctly
    /// revealed in the revealing phase. The bid is valid if the
    /// ether sent together with the bid is at least "value" and
    /// "fake" is not true. Setting "fake" to true and sending
    /// not the exact amount are ways to hide the real bid but
    /// still make the required deposit. The same address can
    /// place multiple bids.
    function bid(bytes32 blindedBid)
        external
        payable
        onlyBefore(biddingEnd)
    {
        bids[msg.sender].push(Bid({
            blindedBid: blindedBid,
            deposit: msg.value
        }));
    }

    /// Reveal your blinded bids. You will get a refund for all
    /// correctly blinded invalid bids and for all bids except for
    /// the totally highest.
    function reveal(
        uint[] calldata values,
        bool[] calldata fakes,
        bytes32[] calldata secrets
    )
        external
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint length = bids[msg.sender].length;
        require(values.length == length);
        require(fakes.length == length);
        require(secrets.length == length);

        uint refund;
        for (uint i = 0; i < length; i++) {
            Bid storage bidToCheck = bids[msg.sender][i];
            (uint value, bool fake, bytes32 secret) =
                    (values[i], fakes[i], secrets[i]);
            if (bidToCheck.blindedBid != keccak256(abi.encodePacked(value, fake, secret))) {
                // Bid was not actually revealed.
                // Do not refund deposit.
                continue;
            }
            refund += bidToCheck.deposit;
            if (!fake && bidToCheck.deposit >= value) {
                if (placeBid(msg.sender, value))
                    refund -= value;
            }
            // Make it impossible for the sender to re-claim
            // the same deposit.
            bidToCheck.blindedBid = bytes32(0);
        }
        payable(msg.sender).transfer(refund);
    }

    /// Withdraw a bid that was overbid.
    function withdraw() external {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `transfer` returns (see the remark above about
            // conditions -> effects -> interaction).
            pendingReturns[msg.sender] = 0;

            payable(msg.sender).transfer(amount);
        }
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd()
        external
        onlyAfter(revealEnd)
    {
        if (ended) revert AuctionEndAlreadyCalled();
        emit AuctionEnded(highestBidder, highestBid);
        ended = true;
        beneficiary.transfer(highestBid);
    }

    // This is an "internal" function which means that it
    // can only be called from the contract itself (or from
    // derived contracts).
    function placeBid(address bidder, uint value) internal
            returns (bool success)
    {
        if (value <= highestBid) {
            return false;
        }
        if (highestBidder != address(0)) {
            // Refund the previously highest bidder.
            pendingReturns[highestBidder] += highestBid;
        }
        highestBid = value;
        highestBidder = bidder;
        return true;
    }
}
```

# 安全远程购买

目前，远程采购商品需要多方相互信任。

最简单的配置涉及卖方和买方。

买方希望从卖方那里收到一件物品，而卖方希望得到金钱（或等价物）作为回报。有问题的部分是这里的货物：无法确定该物品是否到达了买家手中。

有多种方法可以解决这个问题，但都以一种或另一种方式达不到要求。

在以下示例中，双方必须将项目价值的两倍作为托管服务存入合同。

一旦发生这种情况，这笔钱将被锁定在合同中，直到买家确认他们收到了物品。

之后，买方将获得价值（押金的一半），卖方获得三倍的价值（押金加上价值）。

这背后的想法是，双方都有解决问题的动力，否则他们的钱将被永远锁定。

该合约当然不能解决问题，但概述了如何在合约中使用类似状态机的构造。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract Purchase {
    uint public value;
    address payable public seller;
    address payable public buyer;

    enum State { Created, Locked, Release, Inactive }
    // The state variable has a default value of the first member, `State.created`
    State public state;

    modifier condition(bool condition_) {
        require(condition_);
        _;
    }

    /// Only the buyer can call this function.
    error OnlyBuyer();
    /// Only the seller can call this function.
    error OnlySeller();
    /// The function cannot be called at the current state.
    error InvalidState();
    /// The provided value has to be even.
    error ValueNotEven();

    modifier onlyBuyer() {
        if (msg.sender != buyer)
            revert OnlyBuyer();
        _;
    }

    modifier onlySeller() {
        if (msg.sender != seller)
            revert OnlySeller();
        _;
    }

    modifier inState(State state_) {
        if (state != state_)
            revert InvalidState();
        _;
    }

    event Aborted();
    event PurchaseConfirmed();
    event ItemReceived();
    event SellerRefunded();

    // Ensure that `msg.value` is an even number.
    // Division will truncate if it is an odd number.
    // Check via multiplication that it wasn't an odd number.
    constructor() payable {
        seller = payable(msg.sender);
        value = msg.value / 2;
        if ((2 * value) != msg.value)
            revert ValueNotEven();
    }

    /// Abort the purchase and reclaim the ether.
    /// Can only be called by the seller before
    /// the contract is locked.
    function abort()
        external
        onlySeller
        inState(State.Created)
    {
        emit Aborted();
        state = State.Inactive;
        // We use transfer here directly. It is
        // reentrancy-safe, because it is the
        // last call in this function and we
        // already changed the state.
        seller.transfer(address(this).balance);
    }

    /// Confirm the purchase as buyer.
    /// Transaction has to include `2 * value` ether.
    /// The ether will be locked until confirmReceived
    /// is called.
    function confirmPurchase()
        external
        inState(State.Created)
        condition(msg.value == (2 * value))
        payable
    {
        emit PurchaseConfirmed();
        buyer = payable(msg.sender);
        state = State.Locked;
    }

    /// Confirm that you (the buyer) received the item.
    /// This will release the locked ether.
    function confirmReceived()
        external
        onlyBuyer
        inState(State.Locked)
    {
        emit ItemReceived();
        // It is important to change the state first because
        // otherwise, the contracts called using `send` below
        // can call in again here.
        state = State.Release;

        buyer.transfer(value);
    }

    /// This function refunds the seller, i.e.
    /// pays back the locked funds of the seller.
    function refundSeller()
        external
        onlySeller
        inState(State.Release)
    {
        emit SellerRefunded();
        // It is important to change the state first because
        // otherwise, the contracts called using `send` below
        // can call in again here.
        state = State.Inactive;

        seller.transfer(3 * value);
    }
}
```

# 小额支付渠道

在本节中，我们将学习如何构建支付渠道的示例实现。 

它使用加密签名使同一方之间的重复以太币转移安全、即时且无需交易费用。 

例如，我们需要了解如何签名和验证签名，以及设置支付渠道。

## 创建和验证签名

假设 Alice 想向 Bob 发送一些 Ether，即 Alice 是发送者，Bob 是接收者。

Alice 只需要在链下（例如通过电子邮件）向 Bob 发送加密签名的消息，这类似于写支票。

Alice 和 Bob 使用签名来授权交易，这可以通过以太坊上的智能合约实现。 Alice 将构建一个简单的智能合约，让她传输 Ether，但她不会自己调用函数来发起支付，而是让 Bob 这样做，从而支付交易费用。

该合同将按以下方式运作：

1. Alice 部署 ReceiverPays 合约，附加足够的以太币来支付将要支付的款项。

2. Alice 通过使用她的私钥签署消息来授权付款。

3. Alice 将加密签名的消息发送给 Bob。消息不需要保密（稍后解释），发送它的机制无关紧要。

4. Bob 通过向智能合约展示签名消息来索取他的付款，它会验证消息的真实性，然后释放资金。

## 创建签名

Alice 不需要与以太坊网络交互来签署交易，这个过程是完全离线的。 

在本教程中，我们将使用 web3.js 和 MetaMask 使用 EIP-712 中描述的方法在浏览器中对消息进行签名，因为它提供了许多其他安全优势。

```js
var hash = web3.utils.sha3("message to sign");
web3.eth.personal.sign(hash, web3.eth.defaultAccount, function () { console.log("Signed"); });
```

- NOTE

web3.eth.personal.sign 将消息的长度添加到签名数据中。 

因为我们首先散列，所以消息总是正好 32 字节长，因此这个长度前缀总是相同的。

## 签署什么

对于履行付款的合同，签署的消息必须包括：

1. 收件人的地址。

2. 要转移的金额。

3. 防止重放攻击。

重放攻击是指重复使用已签名的消息来声明第二个操作的授权。

**为了避免重放攻击，我们使用与以太坊交易本身相同的技术，即所谓的随机数，即账户发送的交易数量。智能合约检查一个随机数是否被多次使用。**

当所有者部署 ReceiverPays 智能合约，进行一些付款，然后销毁合约时，可能会发生另一种类型的重放攻击。后来，他们决定再次部署 RecipientPays 智能合约，但新合约不知道之前部署中使用的 nonce，因此攻击者可以再次使用旧消息。

Alice 可以通过在消息中包含合约地址来防止这种攻击，并且只有包含合约地址本身的消息才会被接受。您可以在本节末尾的完整合约的 claimPayment() 函数的前两行中找到一个示例。

## 包装参数

现在我们已经确定了要包含在签名消息中的信息，我们准备将消息放在一起，散列并签名。 

为简单起见，我们将数据连接起来。 

ethereumjs-abi 库提供了一个名为 soliditySHA3 的函数，该函数模仿了 Solidity 的 keccak256 函数的行为，该函数应用于使用 abi.encodePacked 编码的参数。 

这是一个为 ReceiverPays 示例创建正确签名的 JavaScript 函数：

```js
// recipient is the address that should be paid.
// amount, in wei, specifies how much ether should be sent.
// nonce can be any unique number to prevent replay attacks
// contractAddress is used to prevent cross-contract replay attacks
function signPayment(recipient, amount, nonce, contractAddress, callback) {
    var hash = "0x" + abi.soliditySHA3(
        ["address", "uint256", "uint256", "address"],
        [recipient, amount, nonce, contractAddress]
    ).toString("hex");

    web3.eth.personal.sign(hash, web3.eth.defaultAccount, callback);
}
```

## 在 Solidity 中恢复消息签名者

通常，ECDSA 签名由两个参数 r 和 s 组成。 

以太坊中的签名包括名为 v 的第三个参数，您可以使用它来验证哪个帐户的私钥用于对消息进行签名，以及交易的发送者。 

Solidity 提供了一个内置函数 ecrecover，它接受消息以及 r、s 和 v 参数，并返回用于签署消息的地址。

## 提取签名参数

web3.js 产生的签名是 r、s 和 v 的串联，所以第一步是将这些参数分开。 

您可以在客户端执行此操作，但在智能合约内部执行此操作意味着您只需要发送一个签名参数而不是三个。 

将字节数组拆分为其组成部分是一团糟，因此我们使用内联汇编在 splitSignature 函数（本节末尾完整合约中的第三个函数）中完成这项工作。

## 计算消息哈希

智能合约需要确切地知道签署了哪些参数，因此它必须根据参数重新创建消息并将其用于签名验证。 

函数 prefixed 和 recoverSigner 在 claimPayment 函数中执行此操作。

## The full contract

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract ReceiverPays {
    address owner = msg.sender;

    mapping(uint256 => bool) usedNonces;

    constructor() payable {}

    function claimPayment(uint256 amount, uint256 nonce, bytes memory signature) external {
        require(!usedNonces[nonce]);
        usedNonces[nonce] = true;

        // this recreates the message that was signed on the client
        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, amount, nonce, this)));

        require(recoverSigner(message, signature) == owner);

        payable(msg.sender).transfer(amount);
    }

    /// destroy the contract and reclaim the leftover funds.
    function shutdown() external {
        require(msg.sender == owner);
        selfdestruct(payable(msg.sender));
    }

    /// signature methods.
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
```

# 编写一个简单的支付渠道

Alice 现在构建了一个简单但完整的支付通道实现。 

支付渠道使用加密签名来安全、即时且无交易费用地重复传输以太币。

## 什么是支付渠道？

支付渠道允许参与者在不使用交易的情况下重复转移以太币。 

这意味着您可以避免与交易相关的延迟和费用。 

我们将探索两方（Alice 和 Bob）之间的简单单向支付渠道。 

它包括三个步骤：

1. Alice 用 Ether 为智能合约提供资金。 这“打开”了支付渠道。

2. 爱丽丝签署消息，指定欠接收者多少以太币。 每次付款都重复此步骤。

3. Bob“关闭”支付通道，提取他的部分以太币并将剩余部分发送回发送者。

- NOTE

只有第 1 步和第 3 步需要以太坊交易，第 2 步意味着发件人通过链下方法（例如电子邮件）向收件人发送加密签名的消息。 

这意味着只需要两笔交易即可支持任意数量的转账。

Bob 可以保证收到他的资金，因为智能合约托管了以太币并兑现了有效的签名消息。 

智能合约还强制执行超时，因此即使接收者拒绝关闭通道，爱丽丝也可以保证最终收回她的资金。 

由支付渠道的参与者决定保持开放多长时间。 

对于短期交易，例如为每分钟网络访问支付网吧费用，支付渠道可能会在有限的时间内保持开放。 

另一方面，对于经常性支付，例如支付员工小时工资，支付渠道可能会保持开放数月或数年。

## 开通支付渠道

为了打开支付通道，Alice 部署了智能合约，附加要托管的 Ether，并指定预期的接收者和通道存在的最长持续时间。

这是合约中的 SimplePaymentChannel 函数，位于本节末尾。

## 付款

爱丽丝通过向鲍勃发送签名消息来付款。此步骤完全在以太坊网络之外执行。消息由发件人加密签名，然后直接传输给收件人。

每条消息都包含以下信息：

1. 智能合约的地址，用于防止跨合约重放攻击。

2. 到目前为止欠收款人的以太币总量。

在一系列转账结束时，支付通道仅关闭一次。因此，只有一条发送的消息被兑换。这就是为什么每条消息都指定了累积的 Ether 欠款总额，而不是单个小额支付的金额。收件人自然会选择兑换最近的消息，因为那是总数最高的消息。

不再需要每条消息的随机数，因为智能合约只接受一条消息。智能合约的地址仍用于防止用于一个支付渠道的消息被用于不同的渠道。

这是修改后的 JavaScript 代码，用于对上一节中的消息进行加密签名：

```js
function constructPaymentMessage(contractAddress, amount) {
    return abi.soliditySHA3(
        ["address", "uint256"],
        [contractAddress, amount]
    );
}

function signMessage(message, callback) {
    web3.eth.personal.sign(
        "0x" + message.toString("hex"),
        web3.eth.defaultAccount,
        callback
    );
}

// contractAddress is used to prevent cross-contract replay attacks.
// amount, in wei, specifies how much Ether should be sent.

function signPayment(contractAddress, amount, callback) {
    var message = constructPaymentMessage(contractAddress, amount);
    signMessage(message, callback);
}
```

## 关闭支付渠道

当 Bob 准备好接收他的资金时，是时候通过调用智能合约上的关闭函数来关闭支付通道了。

关闭通道会向接收者支付他们所欠的以太币并销毁合约，将剩余的以太币发送回爱丽丝。

要关闭通道，Bob 需要提供由 Alice 签名的消息。

智能合约必须验证消息是否包含来自发件人的有效签名。进行此验证的过程与收件人使用的过程相同。 

Solidity 函数 isValidSignature 和 recoverSigner 的工作方式与上一节中的 JavaScript 对应函数一样，后者函数是从 ReceiverPays 合约中借用的。

只有支付通道接收方可以调用 close 函数，他们自然会传递最近的支付消息，因为该消息带有最高的总欠款。

如果发件人被允许调用这个函数，他们可以提供一个较低金额的消息，并欺骗收件人他们欠他们的东西。

该函数验证签名消息与给定参数匹配。如果一切顺利，接收者将收到他们的部分以太币，而发送者则通过自毁发送其余部分。

你可以在完整的合约中看到 close 函数。

## 支付渠道到期

Bob 可以随时关闭支付通道，但如果他们不这样做，Alice 需要一种方法来收回她的托管资金。 

在合约部署时设置了到期时间。 

一旦达到该时间，Alice 就可以调用 claimTimeout 来收回她的资金。 

您可以在完整的合约中看到 claimTimeout 函数。

调用此函数后，Bob 将无法再接收任何 Ether，因此 Bob 在到期之前关闭通道非常重要。

## The full contract

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract SimplePaymentChannel {
    address payable public sender;      // The account sending payments.
    address payable public recipient;   // The account receiving the payments.
    uint256 public expiration;  // Timeout in case the recipient never closes.

    constructor (address payable recipientAddress, uint256 duration)
        payable
    {
        sender = payable(msg.sender);
        recipient = recipientAddress;
        expiration = block.timestamp + duration;
    }

    /// the recipient can close the channel at any time by presenting a
    /// signed amount from the sender. the recipient will be sent that amount,
    /// and the remainder will go back to the sender
    function close(uint256 amount, bytes memory signature) external {
        require(msg.sender == recipient);
        require(isValidSignature(amount, signature));

        recipient.transfer(amount);
        selfdestruct(sender);
    }

    /// the sender can extend the expiration at any time
    function extend(uint256 newExpiration) external {
        require(msg.sender == sender);
        require(newExpiration > expiration);

        expiration = newExpiration;
    }

    /// if the timeout is reached without the recipient closing the channel,
    /// then the Ether is released back to the sender.
    function claimTimeout() external {
        require(block.timestamp >= expiration);
        selfdestruct(sender);
    }

    function isValidSignature(uint256 amount, bytes memory signature)
        internal
        view
        returns (bool)
    {
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, amount)));

        // check that the signature is from the payment sender
        return recoverSigner(message, signature) == sender;
    }

    /// All functions below this are just taken from the chapter
    /// 'creating and verifying signatures' chapter.

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
```

- NOTE

函数 splitSignature 不使用所有安全检查。 真正的实现应该使用经过更严格测试的库，例如该代码的 openzepplin 版本。

## 验证付款

与上一节不同，支付渠道中的消息不会立即兑现。 收件人会跟踪最新消息，并在需要关闭支付渠道时兑现。 这意味着收件人对每条消息执行自己的验证至关重要。 否则无法保证收款人最终能够获得付款。

收件人应使用以下过程验证每条消息：

验证消息中的合约地址是否与支付渠道匹配。

验证新总数是否为预期金额。

验证新的总量不超过托管的以太币数量。

验证签名是否有效并且来自支付渠道发件人。

我们将使用 ethereumjs-util 库来编写此验证。 最后一步可以通过多种方式完成，我们使用 JavaScript。 以下代码从上面的签名 JavaScript 代码中借用了constructPaymentMessage 函数：

```js
// this mimics the prefixing behavior of the eth_sign JSON-RPC method.
function prefixed(hash) {
    return ethereumjs.ABI.soliditySHA3(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", hash]
    );
}

function recoverSigner(message, signature) {
    var split = ethereumjs.Util.fromRpcSig(signature);
    var publicKey = ethereumjs.Util.ecrecover(message, split.v, split.r, split.s);
    var signer = ethereumjs.Util.pubToAddress(publicKey).toString("hex");
    return signer;
}

function isValidSignature(contractAddress, amount, signature, expectedSigner) {
    var message = prefixed(constructPaymentMessage(contractAddress, amount));
    var signer = recoverSigner(message, signature);
    return signer.toLowerCase() ==
        ethereumjs.Util.stripHexPrefix(expectedSigner).toLowerCase();
}
```

# 模块化合同

构建合约的模块化方法可帮助您降低复杂性并提高可读性，这将有助于在开发和代码审查期间识别错误和漏洞。 

如果您单独指定和控制行为或每个模块，则您必须考虑的交互只是模块规范之间的交互，而不是合约的所有其他移动部分。 

在下面的示例中，合约使用 Balances 库的 move 方法来检查地址之间发送的余额是否符合您的预期。 

通过这种方式，余额库提供了一个独立的组件，可以正确跟踪账户余额。 

很容易验证 Balances 库永远不会产生负余额或溢出，并且所有余额的总和在合约的整个生命周期内都是不变量。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

library Balances {
    function move(mapping(address => uint256) storage balances, address from, address to, uint amount) internal {
        require(balances[from] >= amount);
        require(balances[to] + amount >= balances[to]);
        balances[from] -= amount;
        balances[to] += amount;
    }
}

contract Token {
    mapping(address => uint256) balances;
    using Balances for *;
    mapping(address => mapping (address => uint256)) allowed;

    event Transfer(address from, address to, uint amount);
    event Approval(address owner, address spender, uint amount);

    function transfer(address to, uint amount) external returns (bool success) {
        balances.move(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount);
        return true;

    }

    function transferFrom(address from, address to, uint amount) external returns (bool success) {
        require(allowed[from][msg.sender] >= amount);
        allowed[from][msg.sender] -= amount;
        balances.move(from, to, amount);
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint tokens) external returns (bool success) {
        require(allowed[msg.sender][spender] == 0, "");
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function balanceOf(address tokenOwner) external view returns (uint balance) {
        return balances[tokenOwner];
    }
}
```

# 参考资料

https://docs.soliditylang.org/en/latest/solidity-by-example.html

* any list
{:toc}