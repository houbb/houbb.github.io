---
layout: post 
title: web3 以太坊开发-40-以太坊客户端 API JSON RPC
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# JSON-RPC 应用程序接口

为了让软件应用程序与以太坊区块链交互（通过读取区块链数据或向网络发送交易），它必须连接到以太坊节点。

为此目的，每个以太坊客户端都实现了一项 JSON-RPC 规范，因此有一套统一的方法可供应用程序依赖，无论具体的节点或客户端实现如何。

JSON-RPC 是一种无状态的、轻量级远程过程调用 (RPC) 协议。 

它定义了一些数据结构及其处理规则。 

它与传输无关，因为这些概念可以在同一进程，通过接口、超文本传输协议或许多不同的消息传递环境中使用。 

它使用 JSON (RFC 4627) 作为数据格式。

# 客户端实现

每个客户端在执行 JSON-RPC 规范时可以使用不同的编程语言。 

更多与特定编程语言相关的详细信息，请查阅客户端文档。 

我们建议查看每个客户端文档以获取最新的应用程序接口支持信息。

# 便利性库

虽然您可以选择通过 JSON 应用程序接口直接与以太坊客户端交互，但是对于去中心化应用程序开发者来说，常常有更容易的选项。 

许多 JavaScript 和后端应用程序接口库已经存在，可以在 JSON-RPC 应用程序接口之上提供封装。 

通过这些库，开发者可以方便地写下直观的一行函数来初始化（后端的）JSON RPC 请求并用于与以太坊进行交互。

# 共识客户端应用程序接口

本页主要处理以太坊执行客户端使用的 JSON-RPC 应用程序接口。 

但是，共识客户端也有一个远程过程调用应用程序接口，允许用户直接从节点查询有关节点的信息、请求信标区块、信标状态和其他与共识相关的信息。 

此应用程序接口记录在信标应用程序接口网页上。

内部应用程序接口还用于节点内的客户端间通信——也就是说，它使共识客户端和执行客户端能够交换数据。 

这被称为“引擎应用程序接口”，该规范可在 Github 上找到。

## 执行客户端规范

[阅读 GitHub 上完整的 JSON-RPC 应用程序接口规范](https://github.com/ethereum/execution-apis)

# 约定

## 十六进制值编码

两种关键数据类型通过 JSON 传递：未格式化的字节数组和数量。 两者都使用十六进制编码传递，但对格式化有不同的要求。

### 数量

当对数量（整数、编号）进行编码时：编码为十六进制（以“0x”为前缀），最紧凑的表示方法（例外：0 应表示为“0x0”）。

以下是一些示例：

```
0x41（十进制中是 65）
0x400（十进制中是 1024）
错误：0x（后面至少有一位，0 是“0x0”）
错误：0x0400（不允许有前导零）
错误：ff（必须有前缀 0x）
```

## 无格式数据

当对无格式数据（字节数组、帐户地址、哈希、字节码数组）进行编码时：编码为十六进制，以“0x”为前缀，每字节两个十六进制数字。

以下是一些示例：

```
0x41（大小为 1，“A”）
0x004200（大小为 3，“\0B\0”）
0x（大小为 0，“”）
错误：0xf0f0f（位数必须是偶数）
错误：004200（必须以 0x 为前缀）
```

## 默认区块参数

以下方法有额外的默认区块参数：

```
eth_getBalance
eth_getCode
eth_getTransactionCount
eth_getStorageAt
eth_call
```

当发出作用于以太坊状态的请求时，最后一个默认区块参数决定了区块的高度。

默认区块参数可以使用以下选项：

```
HEX String - 整数区块号
String "earliest" - 表示最早/创世区块
String "latest" - 最新挖出的区块
String "pending" - 用于未决状态/交易
```

# 示例

在此页面上，我们提供了如何通过命令行工具 curl 使用单个 JSON_RPC 应用程序接口端点的示例。 

这些单独的端点示例位于下面的 Curl 示例部分。 

在页面下方，我们还提供了一个端到端示例，用于使用 Geth 节点、JSON_RPC 应用程序接口和 curl 编译和部署智能合约。

# CURL 示例

下面提供了通过向以太坊节点发出 curl 请求来使用 JSON_RPC 应用程序接口的示例。 

每个示例都包括对特定端点、其参数、返回类型的描述，以及应该如何使用它的工作示例。

Curl 请求可能会返回与内容类型相关的错误消息。 

这是因为 --data 选项将内容类型设置为 application/x-www-form-urlencoded。 

如果你的节点确实抱怨此问题，请通过在调用开始时放置 `-H "Content-Type: application/json"` 来手动设置标头。 

这些示例也未包括网址/互联网协议与端口组合，该组合必须是 curl 的最后一个参数（例如 127.0.0.1:8545）。 

包含这些附加数据的完整 curl 请求采用以下形式： 

```
curl -H "Content-Type: application/json" -X POST --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}' 127.0.0.1:8545
```

# GOSSIP、STATE、HISTORY

少数核心 JSON-RPC 方法需要来自以太坊网络的数据，并且整齐地分为三个主要类别：Gossip、State 和 History。 

使用这些部分中的链接跳转到每个方法，或使用目录浏览整个方法列表。

## Gossip 方法

这些方法用于跟踪链头。 

这就是交易如何在网络中传播、如何找到进入区块的方式，以及客户端如何发现新区块的方式。

```
eth_blockNumber
eth_sendRawTransaction
```

## State 方法

用于报告所有已存储数据的当前状态的方法。 

“状态”就像一大块共享内存，包括帐户余额、合约数据和燃料估算。

```
eth_getBalance
eth_getStorageAt
eth_getTransactionCount
eth_getCode
eth_call
eth_estimateGas
```

## History 方法

将每个区块的历史记录追溯到创世块。 

这就像一个大的仅附加文件，包括所有区块头、区块体、叔块和交易收据

```
eth_getBlockTransactionCountByHash
eth_getBlockTransactionCountByNumber
eth_getUncleCountByBlockHash
eth_getUncleCountByBlockNumber
eth_getBlockByHash
eth_getBlockByNumber
eth_getTransactionByHash
eth_getTransactionByBlockHashAndIndex
eth_getTransactionByBlockNumberAndIndex
eth_getTransactionReceipt
eth_getUncleByBlockHashAndIndex
eth_getUncleByBlockNumberAndIndex
```

# 参考资料

https://ethereum.org/zh/developers/docs/apis/json-rpc/

* any list
{:toc}