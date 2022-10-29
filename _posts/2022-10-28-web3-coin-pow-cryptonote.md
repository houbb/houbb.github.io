---
layout: post
title: web3 CryptoNote  门罗币 Monero
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [coin, pow, sh]
published: true
---

# CryptoNote

CryptoNote 是一个关于加密货币的应用层协议。它致力于解决在比特币核心中暴露出的若干问题。

包括门罗币和 MobileCoin 在内的几种注重隐私的加密货币已经或曾经使用 CryptoNote 协议。

其中门罗币的 PoW 算法后来升级为 CryptoNight。经历多次升级后，目前门罗币 PoW 算法为 RandomX。

CryptoNote 协议的作者，Nicolas van Saberhagen 的真实身份未知。

# 门罗币

门罗币（Monero，缩写：XMR）是一个创建于2014年4月开源加密货币，它着重于隐私、分权和可扩展性。

与自比特币衍生的许多加密货币不同，Monero基于CryptoNote协议，并在区块链模糊化方面有显著的算法差异。

Monero的模块化代码结构得到了比特币核心维护者之一的Wladimir J. van der Laan的赞赏。

Monero在2016年经历了市值（从5百万美元至1.85亿美元)和交易量的快速增长，这部分是因为它在2016年夏季末期得到了主要的暗网市场AlphaBay的采用。

截至2022年1月，Monero市值超过39亿美元，排名第42。

# 特性

Monero是一个开源软件纯工作证明加密货币。它可以在 Windows、Mac、Linux 和 FreeBSD 上执行。

其主要发行曲线将在约8年内发行约1840万枚币。

（确切地说是1822.3万个硬币，于2022年6月9日#2641623进入Tail Emission，区块奖励减少至0.6XMR并维持）。

其工作验证算法CryptoNight是为 AES 密集型和很消耗 RAM 的操作，这显著降低了 GPU 对 CPU 的优势。

## 抗ASIC理念

由于ASIC(特殊应用集成电路)的专一性，经过被特别设计的ASIC通常能够拥有比一般CPU、GPU甚至是FPGA的算力还要来的高上许多。

目前比特币(BTC)等采用SHA256算法的币种，几乎所有的算力都来自于ASIC所供给。在一开始以对抗ASIC理念的莱特币(LTC)与达世币(DASH)，两者分别使用Scypt与X11算法。但后来仍然有IC设计公司开发出对应上述两种算法且具有比一般CPU、GPU甚至是FPGA的算力还要高上许多甚至更为省电的ASIC。而ASIC几乎只能由少数的公司设计，这使得由于ASIC的出现，将导致算力过于集中甚至能够被单一中心化机构垄断的问题。例如，政府可能向ASIC制造商要求增加一个"自杀开关"，这样使得其能从远端关闭或是控制矿机，而这将可能导致对整个区块链网络的运作造成威胁甚至完全失效。

门罗币从一开始的开发理念中，就包含了对抗ASIC的理念。但其采用的CryptoNight算法为了能够让大多数CPU甚至FPGA能够参与并且获得挖矿奖励，而不是只有GPU能够有效率地进行挖矿。因此并没有像以太坊(ETH)等Ethash算法的币种，利用逐步增长的DAG来要求高速内存容量，以借由硬件制造成本来对抗ASIC。因此，门罗币的核心开发团队在过一定的时间会对共识机制的算法进行修改与进行硬分叉，以确保能够有效对抗ASIC的出现与算力垄断。

(UTC+8) 的 2019/3/9 一般使用CPU与GPU挖矿的用户将必须更新挖矿软件方能继续在硬分叉后进行挖矿。

新一次的分叉于 (UTC+8) 的 2019/12/1 上午 3:00 进行硬分叉至版本 v0.15.0.1 Carbon Chamaeleon，此次硬分叉可以说是在门罗币史上最大的一次共识机制算法 (PoW) 的更改，以长久的对抗 ASIC 对整个 XMR 网络带来的威胁。

本次硬分叉会将算法更改为 RandomX，不同于以往以 CryptoNight 为基底的部分更改，RandomX 在整个算法方面有着相当大的改动，从硬件算力可以得知，以往在 CryptoNight 上几乎已经没有任何优势的 CPU 挖矿，这回在 RandomX 上却是有着非常大的优势，尤其是以 AMD Ryzen 这种大 L3 快取的 CPU 系列而言。

门罗币在先前一直都有针对 PoW 共识算法以硬分叉做出更改的传统，以应付 ASIC 对整个门罗币的区块链网络带来的威胁，但基底一直都是 CryptoNight，也因此在硬分差后约莫 6 个多月就有可能出现相关的 ASIC，门罗币的相关开发者团队在与部分社群商讨后，决定要开发出一种可以有效长久抵御 ASIC 的 PoW 算法，以避免按照传统不断硬分叉的方式，虽然可以抵御 ASIC，但也致使自身的网络安全性产生质疑。

## 隐私

实施环形签名后，区块分析结果的变化。

## 分叉

2018年，门罗币的开发团队为了抵制比特大陆所制作出来的Antminer X3系列矿机，避免其网络受到矿工侵害，于是进行硬分叉，并且升级门罗币的网络算法，但硬分叉出来的项目却依旧使用CryptoNight算法，相关项目为：Monero Zero（XMZ）零系门罗币、Monero Original（XMO）原生门罗币、Monero-Classic（XMC）经典-门罗币、Monero Classic（XMC）经典门罗币、MoneroV（XMV）V版门罗币，而当前仍有效的项目为Monero-Classic（XMC）经典-门罗币及MoneroV（XMV）V版门罗币。

## 可扩展性

## 挖矿

门罗币当前的算法为RandomX，挖掘能使用CPU、GPU、RSIC(如Apple M1)等，唯CPU、RSIC效率较高，GPU则是因内存延时较高，效率低下。

虽说如此，因botnet泛滥，只有部分高阶CPU能达到收支平衡，大部分“矿工”都只是为了维护网络安全而挖矿。

# 技术

## RandomX

RandomX，为Random code eXecution的简写，RandomX通过执行浮点运算来避免ASICs/FPGAs等专用矿机。

## Ring Signatures

Ring Signature是隐匿支付者身份的技术。Ring Signature以多个一次性密钥组成“环状签名”，不参与交易的第三方只能知道实质支付者为其中一人。

## Key Image

Key Image，为Ring Signature之衍生品。为防止Double Spending，Ring Signature的输入端需计算出一组Key Image，每组Key Image在Blockchain上只能使用一次。Key Image不可反推出与Ring Signature支付者的关系（类似SHA-2的hash sum与input的关系，目前已知无有效攻击手段）。

## RingCT

RingCT，全称Ring Confidential Transaction，意即环状机密交易。此技术能防止第三方窥探交易金额。

## Stealth Address

Stealth Address，为隐匿收款者身份的技术。在每次交易中，都会生成Stealth Address，作为一次性的公开密钥。该密钥指明收款者才能在后续交易中，将款项作为输出使用。Stealth Address无法联系到收/付款者的身份或钱包位址，在Blockchain上收款者及款项没有联系，仅有支付者知道收款者的身份（或钱包位址）。

# 参考资料

https://zh.wikipedia.org/wiki/%E6%A5%B5%E5%85%89%E5%B9%A3

https://zh.wikipedia.org/wiki/Bitconnect

* any list
{:toc}