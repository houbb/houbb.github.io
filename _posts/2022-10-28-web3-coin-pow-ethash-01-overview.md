---
layout: post
title: web3 Ethash 以太坊上的加密货币的共识算法
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [coin, pow, sh]
published: true
---

# Ethash

Ethash是以太坊上的加密货币的共识算法，使用工作量证明。

Ethash也使用Keccak，一种已标准化为SHA-3的散列函数。 

但Ethash与SHA-3并不相同，不应将两者混淆。

由版本1.0开始，Ethash已被设计为抵制ASIC，主要方法为**借着极大量的随机查表，加重存储器的负载，ASIC无法再利用专用线路而加速**。

Ethash是从Dagger-Hashimoto算法改动而成的。

Ethash使用一个初始值为1GB的DAGdataset及一个初始值为16MB的假随机数表cache，它们的内容每30000个区块就会重新计算，这个30000区块的间隔称为epoch。每个epoch所产生的内容都会增大，因此1GB与16MB都只是初始值。

矿工会存储整个dataset和cache，而轻客户端只需要存储cache。

矿工挖矿时将找到的nonce填入区块头，并需要以SHA-3形式不断查表寻求MIX值以计算该区块的解。

# 抵制ASIC的原因

由于工作量证明的核心是Hash运算，运算得愈快的矿工将愈大机会挖掘到新的区块而获得更多货币收益。

矿工的挖矿设备亦由CPU演变为GPU，再由GPU演变为ASIC。

矿机门槛的提升导致了矿工人数下降，大多数的收益集中于少部分矿工，这种节点的集中与区块链的原意去中心化是相违背的。

因此，Ethash的计算过程中增加了对内存的要求而抵抗ASIC矿机的优势。

# 参考资料

https://zh.wikipedia.org/wiki/Ethash

* any list
{:toc}