---
layout: post
title:  BlockChain 02 block chain 区块链是什么？
date:  2018-02-06 23:20:18 +0800
categories: [BlockChain]
tags: [blockchain]
published: true
---


# BlockChain

[区块链](https://en.wikipedia.org/wiki/Blockchain) 是一种新型**去中心化协议**，能安全地存储比特币交易或其它数据，信息不可伪造和篡改，可以自动执行智能合约，无需任何中心化机构的审核。

## wiki

区块链（英语：blockchain 或block chain）是借由密码学与共识机制等技术创建与存储庞大交易资料区块链的点对点网络系统。

每一个区块包含了前一个区块的加密散列、相应时间戳记以及交易资料（通常用默克尔树（Merkle tree）算法计算的散列值表示），这样的设计使得区块内容具有难以篡改的特性。

用区块链技术所串接的分布式账本能让两方有效记录交易，且可永久查验此交易。

目前区块链技术最大的应用是数字货币，例如比特币的发明。

因为支付的本质是“将账户A中减少的金额增加到账户B中”。如果人们有一本公共账簿，记录了所有的账户至今为止的所有交易，那么对于任何一个账户，人们都可以计算出它当前拥有的金额数量。而区块链恰恰是用于实现这个目的的公共账簿，其保存了全部交易记录。在比特币体系中，比特币地址相当于账户，比特币数量相当于金额。

# 优点

- 任何节点都可以创建交易，在经过一段时间的确认之后，就可以合理地确认该交易是否为有效，区块链可有效地防止双花问题的发生。

- 对于试图重写或者修改交易记录而言，它的成本是非常高的。

- 区块链实现了两种记录：交易（transactions）以及区块（blocks）。

交易是被存储在区块链上的实际数据，而区块则是记录确认某些交易是在何时，以及以何种顺序成为区块链数据库的一部分。
交易是由参与者在正常过程中使用系统所创建的（在加密数字货币的例子中，一笔交易是由bob将代币发送给alice所创建的），而区块则是由我们称之为矿工（miners）的单位负责创建。

# 工作原理

## 区块

数据通过称之为区块(block)的文件，永久记录在数字货币网络上。它们好比是一个股票交易账本。新的区块会被添加到记录（区块链）的末端，而且一旦书写就很难修改或移除。

## 区块结构

| 大小 | 字段  | 描述 |
|:----|:----|:----|
| 4字节 | 区块大小 | 用字节表示的该字段之后的区块大小 |
| 80字节 | 区块头 | 组成区块头的几个字段 |
| 1-9 （可变整数） | 交易计数器 | 交易的数量 |
| 可变的 | 交易 | 记录在区块里的交易信息 |

## 区块头

区块头由三组区块元数据组成。首先是一组引用父区块哈希值的数据，这组元数据用于将该区块与区块链中前一区块相连接。第二组元数据，即难度、时间戳和nonce，与挖矿竞争相关 。
第三组元数据是merkle树根（一种用来有效地总结区块中所有交易的数据结构）。

<table>
<thead>
<tr>
<th>大小</th>
<th>字段</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td>4字节</td>
<td>版本</td>
<td>版本号，用于跟踪软件/协议的更新</td>
</tr>
<tr>
<td>32字节</td>
<td>父区块哈希值</td>
<td>引用区块链中父区块的哈希值</td>
</tr>
<tr>
<td>32字节</td>
<td>Merkle根</td>
<td>该区块中交易的merkle树根的哈希值</td>
</tr>
<tr>
<td>4字节</td>
<td>时间戳</td>
<td>该区块产生的近似时间（精确到秒的Unix时间戳）</td>
</tr>
<tr>
<td>4字节</td>
<td>难度目标</td>
<td>该区块工作量证明算法的难度目标</td>
</tr>
<tr>
<td>4字节</td>
<td>Nonce</td>
<td>用于工作量证明算法的计数器</td>
</tr>
</tbody>
</table>

## 创始区块

比特币区块链的第一个区块，创建于2009年，我们称之为创世区块。它是比特币区块链里所有区块的共同祖先，这意味着你从任一区块，循链向后回溯，最终都将到达创世区块。

每一个节点都“知道”创世区块的哈希值、结构、被创建的时间和里面的一个交易。因此，每个节点都把该区块作为区块链的首区块，从而构建了一个安全的、可信的区块链的根。

创世区块的哈希值为：

```
0000000000 19d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
```

# 区块链分叉

诚实矿工只创建最长有效链上的最新区块。

“长度”（Length）指区块链的**累计计算难度**，而不是是区块数目。当包括在链中的所有区块以及交易都有效，且是从创世区块开始的链，才是被我们承认的有效区块链。

对于区块链中的任意一个区块，到达创世块的路径只有一条。然而，从创世块开始，会有分叉的情况出现。当创建两个区块的时间差只有几秒时，
经常会创建出一个分叉区块。当发生这种情况时，节点就会在他们最先接收到的那个区块上创建区块。无论哪一个区块包含在下一个区块中，它都会成为主链的一部分，因为这条链更长。

短链（无效链）中的区块没有什么作用。当比特币客户端切换至另外一条更长的区块链时，短链中的所有有效交易区块都重新添加到序列交易池中，
且会包含在下一个区块中。短链中的区块奖励不会呈现在最长的区块链中，因此实际上他们是有损失的，这就是为什么需要网络强制的100个区块的成熟时间来让产生存在。

在短链中的区块，我们通常称之为“孤儿块”（orphans）。这是因为，在长链中这个生成交易并没有父系区块，因为这些生成交易在交易PRC列表中显示为孤儿。
一些矿池误解这些信息，声称他们的区块是”孤儿“。事实上，这些区块都有父系区块，而且甚至可能有子系。

# 区块链衍生概念

## 公链（public blockchain）

公链，是指全世界任何人都可读取、发送交易且能获得有效确认的共识区块链。公链的安全由工作量证明机制（pow）或权益证明机制(pos)等方式负责维护。
它们是以经济奖励与加密数字验证相结合的方式而存在的，并遵循着一般原则：每个人从中可获得的经济奖励，与对共识过程作出的贡献成正比。这些区块链通常被认为是“完全去中心化”的。

## 共同体区块链：（Consortium blockchains）

共同体区块链，是指其共识过程受到预选节点控制的区块链；例如，有15个金融机构组成一个共同体，每个机构都运行着一个节点，而且为了使每个区块生效需要获得其中10个机构的确认。
区块链或许允许每个人都可读取，或者只受限于参与者，或走混合型的路线，例如区块的根哈希及其API（应用程序接口）对外公开，API可允许外界用来作有限次数的查询和获取区块链状态的信息。这些区块链可视为“部分去中心化”。

## 私链（private blockchain)

又称无代币区块链（Token-less blockchain）。

完全私有的区块链 , 是指其写入权限仅在一个组织手里的区块链。读取权限或者对外开放，或者被任意程度地进行了限制。相关的应用囊括数据库管理、审计、甚至一个公司，但在很多的情形下，公共的可读性并非是必须的。

关于没有原生代币的系统，是否能被称为区块链，仍然有着很大的争议。一些人认为，没有代币的区块链，可以一种分布式多版本并发控制(MVCC)数据库的形式而存在。
多版本并发控制，可防止两笔交易在数据库中修改一个单一列，而区块链，则是阻止两笔交易在区块链中的单个输出（ output）。

# 公链和私链的特点

共同体区块链结合了公链的“低信任”和私链的“单一高度信任” , 提供了一种混合的模式，而私链可以更精确地描述为带有一定程度数字加密功能，可管理（permissioned）的传统中心化系统。

## 公链特点

<ol>
<li>中立、开放、去中心化；</li>
<li>不可更改，不可撤销；</li>
<li>拥有网络效应。</li>
<li>&nbsp;抗审查性高；</li>
</ol>

## 私链特点

<ol>
<li>规则易于修改（交易，余额等）；</li>
<li>&nbsp;交易成本低（交易只需几个受信节点验证即可）；</li>
<li>读取权限受限；</li>
</ol>

# 区块链发展及应用

区块链技术作为数字货币的底层技术，已引起了金融世界的高度重视，包括高盛、摩根大通、汇丰银行、花旗银行、纽约梅隆银行、巴克莱银行、瑞银（UBS）、苏格兰皇家银行、摩根士丹利在内的众多金融机构，
均与区块链公司进行了合作，研究区块链技术在金融市场的应用。世界经济论坛更是大胆预测，到2027年世界GDP的10％将被存储在区块链网络上


# ICO代币

首次代币发行（英语：Initial Coin Offering，简称ICO），也称为ICO众筹，是用区块链筹集资金，以便开发新型区块链社区的项目。

## 非营利组织

比尔及梅琳达·盖茨基金会《基层项目／Level One Project》旨在利用区块链技术帮助世界各地20亿缺乏银行账户的民众。

联合国世界粮食计划署的《区块建设／Building Blocks》旨在使粮食计划署越来越多的现金扶贫业务更快，更便宜，更安全。

“区块建设”于2017年1月在巴基斯坦开展了现场试点工作，将在整个春季继续进行。

2017年6月，该项目已经扩大到叙利亚等国，计划在2030年前在全球实现零饥饿。

## 去中心化的社会网络

回馈项目（Backfeed project）正在基于区块链分布式自治系统，开发共识主动性创建和分配价值的社会网络。

亚历山大项目（The Alexandria project）是一个基于区块链开发的去中心化图书馆网络。

它自主（Tezos）是一个根据它代币（token）持有者们的投票结果，让电脑程序自我演变，来实现区块链自主的开发项目。

比特币区块链是一个去中心化的加密货币和支付的金融自主体系。以太坊区块链在前者的基础上增加了去中心化的智能合约的法律自主体系。

它自主将在前两者的基础上增加去中心化的电脑程序开发功能，以便创建社会管理自主权体系。

## 区块链数据库

甲骨文公司在Oracle Database 21c中，首次引入了区块链资料表功能。

不过，Oracle Database的区块链不是去中心化。

甲骨文称，中央化的区块链数据库较去中心化更高吞吐量及更少延迟交易问题。

# 参考资料

[区块链](https://zh.wikipedia.org/zh-cn/%E5%8C%BA%E5%9D%97%E9%93%BE)

* any list
{:toc}