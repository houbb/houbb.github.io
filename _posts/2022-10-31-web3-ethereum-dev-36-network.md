---
layout: post 
title: web3 以太坊开发-36-以太坊开发网络 development-networks
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 开发网络

当使用智能合约来开发一个以太坊应用时，您可能想要在部署之前在本地查看它是如何工作的。

这和在本地运行一个本地网页服务器相似。为了测试您的去中心化应用程序，您可以使用开发网络创建一个本地的区块链。 

这些以太坊开发网络提供了能够比公共测试网更快的迭代功能（例如您不需要从测试网获取以太币）。

# 什么是开发网络？

实质上开发网络是指哪些对本地开发特殊设计的以太坊客户端（会对以太坊进行部署应用）。

为什么不在本地运行一个标准的以太坊节点？

你可以运行节点，但由于开发网络是以开发为目的而建立的，它们往往会打包一些快捷方便的功能，例如：

1. 为本地区块链提供数据，这个功能很重要（例如使用以太币余额的帐户）

2. 在接受到每个交易时就立即按顺序和没有延迟地挖掘区块。

3. 增强调试和日志功能

# 可用工具

注意：大多数开发框架包含一个内置的开发网络。 

我们建议从一个框架开始设置您的本地开发环境。

## Ganache

快速构建一个个人的以太坊区块链，您可以用它来运行测试，执行命令，并在控制链的运行方式时检查状态。

Ganache 提供了一个桌面应用程序 (Ganache UI) 以及一个命令行工具 (ganache-cli)。 它是 Truffle 工具套装的一部分。

> https://www.trufflesuite.com/ganache

## Hardhat 网络

一个专门用于开发的本地以太坊网络。 

该网络允许您部署合约，运行测试并调试代码。

Hardhat 网络内置了安全帽，安全帽是专业人员的以太坊开发环境。

> https://hardhat.org/

## 本地信标链

一些共识客户端具有内置工具，用于启动本地信标链以进行测试。

提供了 Lighthouse、Nimbus 和 Lodestar 的说明：

[Lodestar](https://chainsafe.github.io/lodestar/usage/local/)

[Lighthouse](https://chainsafe.github.io/lodestar/usage/local/)

[NimBus](https://github.com/status-im/nimbus-eth1/blob/master/fluffy/docs/local_testnet.md)

## 公共以太坊测试链

当前有三个公共的、用于测试的以太坊实现。 

建议使用长期受支持的 Goerli 测试网。 

Sepolia 测试网在可预见的将来预期也会一直维护，但其验证者集合是经许可产生的，这意味着此测试网上的新验证者没有一般访问权限。 

Ropsten 链预计将被弃用。

[Goerli 质押启动板](https://goerli.launchpad.ethereum.org/)

[Ropsten 质押启动板](https://ropsten.launchpad.ethereum.org/)

# 参考资料

https://ethereum.org/zh/developers/docs/development-networks/

* any list
{:toc}