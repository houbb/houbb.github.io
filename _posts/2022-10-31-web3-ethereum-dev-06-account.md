---
layout: post
title: web3 以太坊开发-06-以太坊帐户 ethereum accounts
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 以太坊帐户

一个以太坊帐户是一个具有以太币 (ETH) 余额的实体，可以在以太坊上发送交易。 

帐户可以由用户控制，也可以作为智能合约部署。

# 前置要求

帐户是一个很适合初学者的主题。 

但为了帮助您更好地理解这个页面，我们建议您首先阅读我们的以太坊简介。

# 帐户类型

以太坊有两种帐户类型：

外部持有 – 私钥的所有者控制

合约 – 一种由代码控制，部署在网络上的智能合约。 

了解智能合约。

这两种帐户类型都能：

接收、持有和发送 ETH 和 token

与已部署的智能合约进行交互

## 主要区别

### 外部持有

- 创建帐户是免费的

- 可以发起交易

- 外部所有的帐户之间只能进行 ETH 和代币交易

### 合约

- 创建合约存在成本，因为需要使用网络存储空间

- 只能在收到交易时发送交易

- 从外部帐户向合约帐户发起的交易能触发可执行多种操作的代码，例如转移代币甚至创建新合约

# 理解帐户

以太坊帐户有四个字段：

nonce – 显示从帐户发送的交易数量的计数器。 这将确保交易只处理一次。 在合约帐户中，这个数字代表该帐户创建的合约数量

balance – 这个地址拥有的 Wei 数量。 Wei 是以太币的计数单位，每个 ETH 有 1e+18 Wei。

codeHash - 该哈希表示以太坊虚拟机 (EVM) 上的帐户代码。 合约帐户具有编程的代码片段，可以执行不同的操作。 如果帐户收到消息调用，则执行此 EVM 代码。 与其他帐户字段不同，不能更改。 所有代码片段都被保存在状态数据库的相应哈希下，供后续检索。 此哈希值称为 codeHash。 对于外部所有的帐户，codeHash 字段是空字符串的哈希。

storageRoot – 有时被称为存储哈希。 Merkle Patricia trie 根节点的 256 位哈希已编码了帐户的存储内容（256 位整数值映射），并编码为 Trie，作为来自 256 的 Keccak 256 位哈希的映射位整数键，用于 RLP 编码的 256 位整数值。 此 Trie 对此帐户存储内容的哈希进行编码，默认情况下为空。

![account](https://ethereum.org/static/19443ab40f108c985fb95b07bac29bcb/302a4/accounts.png)

# 外部持有的帐户和密钥对

帐户由公钥和私钥加密对组成。 

它们有助于证明交易实际上是由发送者签名的，并防止伪造。 

您的私钥是您用来签名交易的密钥，所以它保障您对与您帐户相关的资金进行管理。 

您从未真正持有加密货币，您持有私钥 – 资金总是在以太坊的账本上。

这将防止恶意参与者广播虚假交易，因为您总是可以验证交易的发送者。

如果 Alice 想要从她自己的帐户发送 ETH 到 Bob 的帐户，Alice 需要创建交易请求并将其发送到网络进行验证。 

以太坊对公钥加密的使用确保了 Alice 可以证明她最初发起了交易请求。 

没有加密机制，恶意对手 Eve 可以简单地公开广播一个看起来像“从 Alice 的帐户发送 5 ETH 到 Eve 帐户”的请求。而且没有人能够证实它不是来自 Alice 的。

# 帐户创建

当你想要创建一个帐户时，大多数库将生成一个随机的私钥。

私钥由 64 个十六进制字符组成，可以用密码加密保存。

例如：

```
fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036415f
```

使用椭圆曲线数字签名算法从私钥生成公钥。 

通过获取公钥 Keccak-256 哈希的最后 20 个字节并校验码前面添加 0x，可以为帐户获取公共地址。

下面是使用 GETH 的 personal_newAccount 在控制台中创建一个帐户的例子

```
> personal.newAccount()
Passphrase:
Repeat passphrase:
"0x5e97870f263700f46aa00d967821199b9bc5a120"

> personal.newAccount("h4ck3r")
"0x3d80b31a78c30fc628f20b2c89d7ddbf6e53cedc"
```

可以通过您的私钥获取公钥，但您不能通过公钥获取私钥。 

这意味着保持私人密钥的安全至关重要，如同名称所建议的 PRIVATE。

您需要一个私钥来签署消息和交易并输出签名。 然后其他人可以使用签名获取您的公钥，证明信息的作者。 

在您的应用程序中，您可以使用 javascript 库向网络发送交易。

# 合约帐户

合约帐户也有一个 42 个字符组成的十六进制地址：

例如：

```
0x06012c8cf97bead5deae237070f9587f8e7a266d
```

合约地址通常在将合约部署到以太坊区块链时给出。 

地址产生自创建人的地址和从创建人地址发送的交易数量（“nonce”）。

# 验证者密钥

以太坊还有一另种类型的密钥，它们是在以太坊从工作量证明过渡到权益证明共识时引入的。 

它们是“BLS”密钥，用来识别验证者。 

这些密钥可以有效地聚合，减少网络达成共识所需要的带宽。 

没有这种密钥集合，验证者的最小质押金额将会高出许多。

# 关于钱包的说明

帐户和钱包不同。 

帐户是用户拥有的以太坊帐户的密钥对。 

钱包是界面或应用程序，可以让你与以太坊帐户交互。


# 参考资料

https://ethereum.org/zh/developers/docs/accounts/

* any list
{:toc}