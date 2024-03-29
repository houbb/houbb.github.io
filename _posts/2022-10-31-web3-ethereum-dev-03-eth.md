---
layout: post
title: web3 以太坊开发-03-ETH 以太币简介
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 什么是加密货币？

加密货币是一种基于分布式账本（区块链）的交换媒介。

交换媒介是指被广泛接受、可支付任何商品和服务的物品，而分类账是记录交易的数据存储系统。 

区块链技术允许用户在分类账上进行交易，而不必依赖受信赖的第三方来维护分类账。

第一个加密货币是由 Satoshi Nakamoto 创建的比特币。 

自 2009 年比特币发行以来，人们已经在许多不同的区块链上制作了数以千计的加密货币。

# 什么是以太币 (ETH)？

以太币 (ETH) 是用于以太坊网络上许多事物的加密货币。 

从根本上讲，以太币是唯一可接受的交易费支付方式，并且在合并之后，在主网上验证和提议区块将需要以太币。 

以太币还被用作 DeFi 借贷市场的主要抵押形式，NFT 市场的主要记账单位以及提供服务、销售实体商品赚取的付款等。

以太坊允许开发者创建 去中心化应用 (dapp)，它们共享算力池。 

这个共享池是有限的，因此以太坊需要一种机制来确定谁可以使用它。 

否则，某个 dapp 可能会意外或恶意地消耗所有网络资源，从而导致其他应用程序无法访问算力池。

ETH 加密货币支持以太坊算力的定价机制。 当用户想要完成一笔交易时，他们必须支付以太币，使他们的交易被区块链识别。 

这些使用成本被称为 gas 费用，gas 费用的多少取决于执行交易所需的算力和全网当时的算力需求。

因此，**即使某恶意 dapp 无限循环提交，交易最终也会耗尽 ETH 并终止，从而使网络恢复正常。**

# 铸造 ETH

铸造是指在以太坊分类账上创造新以太币的过程。 

底层以太坊协议创造出新以太币，单一用户不可能创造。

以太币铸造出来，用来奖励提议的每个区块，以及在每个时段的检查点奖励验证者执行的和达成共识有关的其他活动。 

总发行量取决于验证者的数量和它们质押的以太币数量。 

在所有验证者都诚实且在线的理想情况下，以太币总发行量会在所有验证者中等分，但现实中分配情况会因验证者的表现而异。 

总发行量的大约 1/8 会奖励给区块提议者，剩余部分在其它验证者中分配。 

区块提议者还会获得交易费小费和矿工可提取价值，但这些都来自流通中的以太币，而非新发行的以太币。

# 燃烧 ETH

除了通过区块奖励创造 ETH，也可以通过被称为“燃烧”的过程销毁 ETH。 

当 ETH 被燃烧掉，它也就永久退出流通。

以太坊上的每一笔交易都会发生以太币销毁。 

当用户为他们的交易支付费用时，网络根据交易需求设置的基础燃料费会被销毁。 

以太币销毁再加上可变区块大小和最高燃料费，简化了以太坊上的交易费估算。 

网络需求量高时，区块燃烧的以太币数量可以多于铸造的以太币数量，有效地抵消了以太币的发行。

燃烧基础费可以防止区块生产者以各种方式操纵它。 

例如，如果区块生产者获得了基础费，他们可以免费添加自己的交易，并提高其他所有人的基础费。 

或者，矿工可以将基础费退还给一些链下用户，造成交易费市场更加不透明和复杂。

# ETH 面额

由于以太坊上许多交易规模较小，以太币有一些面额单位表示较小金额。 

在这些面额中，Wei 与 Gwei 特别重要。

Wei 是最小的以太币面额，因此在以太坊黄皮书等众多技术实现中，都以 Wei 为单位进行计算。

Gwei（giga-wei 的缩写），常用于描述以太坊上的燃料费用。

```
Wei	10^-18	技术实施
Gwei	10^-9	可读 gas 费用
```

# 传输 ETH

以太坊上的每笔交易都包含一个 value 字段，指定从发送者地址发送到接收者地址的以太币转账金额（以 Wei 为单位）。

当接收者地址是智能合约时，在智能合约执行其代码后，这些转账的以太币可用于支付燃料费用。

# 查询 ETH

用户可以通过检查帐户的 balance 字段来查询任何帐户的以太币余额，该字段显示以太币持有数量（以 Wei 为单位）。

Etherscan 是一种常用工具，用于通过基于 Web 的应用程序检查地址余额。 

例如，此 Etherscan 页面显示以太坊基金会的余额。 

也可以通过使用钱包或直接向节点提出请求来查询帐户余额。

# 参考资料

https://ethereum.org/zh/developers/docs/intro-to-ether/


* any list
{:toc}