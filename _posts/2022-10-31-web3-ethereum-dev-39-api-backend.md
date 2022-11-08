---
layout: post 
title: web3 以太坊开发-39-以太坊客户端 API 后端 API
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 后端应用程序接口库

为了使软件应用程序能够与以太坊区块链进行交互（例如：读取区块链数据或发送交易信息到网络），软件必须连接到以太坊节点。

为此目的，每个以太坊客户端都执行 JSON-RPC 规范，所以应用程序可以依赖统一的端点集。

如果您想使用特定的编程语言去连接以太坊的节点，您可自行选择，但是在社区中已有几个方便的库，可以更方便地实现应用程序与以太坊的连接。 

通过这些库，开发者可以方便地写下直观的一行函数来初始化（后端的）JSON RPC 请求并用于与以太坊进行交互。

# 为什么要使用库？

这些库降低了与一个以太坊节点交互的复杂性。 

它们还提供实用的函数（例如：将 ETH 转化为 Gwei），而作为开发者，您可以花费更少的时间来处理以太坊客户端的复杂问题，从而将更多的时间集中于处理您的应用程序的独特功能。

# 可用的库

[Alchemy - 以太坊开发平台](https://www.alchemy.com/)

[BlockCypher - 以太坊 Web 应用程序接口。](https://www.blockcypher.com/)

[Infura - 以太坊应用程序接口即服务。](https://infura.io/)

[Cloudflare 以太坊网关。](https://cloudflare-eth.com/)

[Figment 的数据中心 - 以太坊主网和测试网的 Web3 应用程序接口服务](https://www.figment.io/datahub)

[Nodesmith - 可对以太坊主网和测试网进行 JSON-RPC 应用程序接口访问。](https://nodesmith.io/network/ethereum/)

[Ethercluster - 运行您自己的支持以太坊和以太坊经典的以太坊应用程序接口服务。](https://www.ethercluster.com/)

[Chainstack - 共享及专用的以太坊节点即服务。](https://chainstack.com/)

[QuickNode - 区块链基础设施即服务。](https://quicknode.com/)

[Python Tooling - 用于通过 Python 进行以太坊交互的各种库。](http://python.ethereum.org/)

[web3j - 以太坊的 Java/Android/Kotlin/Scala 集成库。](https://github.com/web3j/web3j)

[Rivet - 由开源软件提供支持的以太坊和以太坊经典应用程序接口服务。](https://rivet.cloud/)

[Nethereum - 区块链的开源 .NET 集成库。](https://github.com/Nethereum/Nethereum)

[QuikNode - 终极区块链开发平台。](https://tatum.io/)

[Watchdata - 提供对以太坊区块链简单和可靠的应用程序接口访问。](https://watchdata.io/)

[Zmok - 注重速度的以太坊节点即 JSON-RPC/WebSockets 应用程序接口。](https://zmok.io/)

# 参考资料

https://ethereum.org/zh/developers/docs/apis/backend/

* any list
{:toc}