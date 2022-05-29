---
layout: post
title:  Solidity-01-overview
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Solidity

[Solidity](https://soliditylang.org/) 是一种静态类型的花括号编程语言，旨在开发在以太坊上运行的智能合约。

# 特性

## Solidity 正在迅速发展。

作为一门相对年轻的语言，Solidity 正在快速发展。 

我们的目标是每 2-3 周发布一次常规（非破坏性）版本，每年大约发布两次破坏性版本。 

您可以关注 Solidity Github 项目中新功能的实施情况。 

您可以通过从默认分支 (`develop`) 切换到 `breaking branch` 来查看下一个重大版本即将发生的更改。 

您可以通过提供输入和参与语言设计来积极塑造 Solidity。

## 关注 Solidity 博客和 Solidity Twitter，始终保持最新状态。

最近的新闻包括：

Solidity 峰会回顾就在这里。 阅读博客上的摘要或观看播放列表。

2021 年 Solidity 开发者调查结果公布！ 阅读完整报告以了解更多信息。

Solidity v0.8.0 已发布，默认为您带来 SafeMath！ 查看本指南，了解如何最好地更新您的代码。

来自博客的最新消息：用户定义的值类型和 abi.encodeCall Literals Bug。

## 背景

Solidity 是一种静态类型的花括号编程语言，旨在开发在以太坊虚拟机上运行的智能合约。 

智能合约是在点对点网络中执行的程序，没有人对执行具有特殊权限，因此它们允许实现价值代币、所有权、投票和其他类型的逻辑。

部署合约时，您应该使用最新发布的 Solidity 版本。 

这是因为定期引入重大更改以及新功能和错误修复。 

我们目前使用 0.x 版本号来表示这种快速变化。


# 编译与安装

> [文档](https://docs.soliditylang.org/en/latest/installing-solidity.html#building-from-source)

## 安装 Solidity 编译器

### 版本控制

Solidity 版本遵循语义版本控制。此外，主版本 0（即 0.x.y）的补丁级别版本将不包含重大更改。这意味着使用版本 0.x.y 编译的代码可以预期使用 0.x.z 编译，其中 z > y。

除了发布之外，我们还提供夜间开发版本，目的是让开发人员更容易尝试即将推出的功能并提供早期反馈。

但是请注意，虽然夜间构建通常非常稳定，但它们包含来自开发分支的前沿代码，并且不能保证始终有效。尽管我们尽了最大努力，但它们可能包含未记录和/或损坏的更改，这些更改不会成为实际版本的一部分。它们不适用于生产用途。

部署合约时，您应该使用最新发布的 Solidity 版本。这是因为定期引入重大更改以及新功能和错误修复。我们目前使用 0.x 版本号来表示这种快速变化。

### Remix

我们推荐 Remix 用于小型合约和快速学习 Solidity。

在线访问 Remix，您无需安装任何东西。

如果您想在不连接 Internet 的情况下使用它，请转到 https://github.com/ethereum/remix-live/tree/gh-pages 并按照该页面上的说明下载 .zip 文件。 

Remix 也是无需安装多个 Solidity 版本即可测试夜间构建的便捷选项。

此页面上的更多选项详细说明了在您的计算机上安装命令行 Solidity 编译器软件。如果您正在处理更大的合同或需要更多编译选项，请选择命令行编译器。

### npm / Node.js

使用 npm 以方便且可移植的方式安装 solcjs，一个 Solidity 编译器。 

solcjs 程序的功能比本页后面描述的访问编译器的方式要少。使用命令行编译器文档假设您使用的是全功能编译器 solc。 

solcjs 的使用记录在其自己的存储库中。

注意：solc-js 项目是使用 Emscripten 从 C++ solc 派生的，这意味着两者都使用相同的编译器源代码。 

solc-js 可以直接用在 JavaScript 项目中（比如 Remix）。

有关说明，请参阅 solc-js 存储库。

```
npm install -g solc
```

....

# 入门代码

## Hello world

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract MyContract {
    function helloWorld() public pure returns (string memory) {
        return "Hello, World!";
    }
}
```

## ECR20

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract ERC20 {
    string public constant name = "ERC20";
    string public constant symbol = "ERC";
    uint8 public constant decimals = 18;

    mapping(address => uint256) balances;

    event Transfer(address indexed from, address indexed to, uint256 tokens);
    
    uint256 public immutable totalSupply;
    
    constructor(uint256 total) {
        totalSupply = total;
        balances[msg.sender] = total;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }
    
    function transfer(address receiver, uint256 numTokens) public returns (bool) {
        require(balances[msg.sender] >= numTokens);
        balances[msg.sender] = balances[msg.sender] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }
    
    function transferFrom(address owner, address buyer, uint256 numTokens) public returns (bool) {
        require(balances[owner] >= numTokens);
        balances[owner] = balances[owner] - numTokens;
        balances[buyer] = balances[buyer] + numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}
```

## simple auction

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
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

    // The following is a so-called natspec comment,
    // recognizable by the three slashes.
    // It will be shown when the user is asked to
    // confirm a transaction.

    /// Create a simple auction with `_biddingTime`
    /// seconds bidding time on behalf of the
    /// beneficiary address `_beneficiary`.
    constructor(
        uint _biddingTime,
        address payable _beneficiary
    ) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }

    /// Bid on the auction with the value sent
    /// together with this transaction.
    /// The value will only be refunded if the
    /// auction is not won.
    function bid() public payable {
        // No arguments are necessary, all
        // information is already part of
        // the transaction. The keyword payable
        // is required for the function to
        // be able to receive Ether.

        // Revert the call if the bidding
        // period is over.
        require(
            block.timestamp <= auctionEndTime,
            "Auction already ended."
        );

        // If the bid is not higher, send the
        // money back (the failing require
        // will revert all changes in this
        // function execution including
        // it having received the money).
        require(
            msg.value > highestBid,
            "There already is a higher bid."
        );

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
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

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
    function auctionEnd() public {
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
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        // 2. Effects
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. Interaction
        beneficiary.transfer(highestBid);
    }
}
```

## MORE

> [更多例子](https://docs.soliditylang.org/en/latest/solidity-by-example.html#voting)


# 参考资料

https://github.com/ethereum/solidity

* any list
{:toc}