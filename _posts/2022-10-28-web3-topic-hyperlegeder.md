---
layout: post
title: web3 超级账本 Hyperledger
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, sh]
published: true
---

# Hyperledger 

Hyperledger (或 Hyperledger项目)是一个旨在推动区块链跨行业应用的开源项目，由Linux基金会在2015年12月主导发起该项目，成员包括金融，银行，物联网，供应链，制造和科技行业的领头羊。


# 历史和目的

2015年12月，Linux基金会宣布了Hyperleger项目的启动。

创始成员于2016年的2月被宣布。随后的3月29日，另外的10名成员及治理理事会被公布.

5月19日Brian Behlendorf被任命为项目的执行总监.

项目的目标是区块链及分布式记账系统的跨行业发展与协作，并着重发展性能和可靠性（相对于类似的数字货币的设计）使之可以支持主要的技术、金融和供应链公司中的全球商业交易。

该项目将继承独立的开放协议和标准，通过框架方法和专用模块，包括各区块链的共识机制和存储方式，以及身份服务、访问控制和智能合约。

# Hyperledger的区块链平台

## Hyperledger Burrow

Burrow 是一个包含了“built-to-specification”的以太坊 虚拟机.区块链客户端。

其主要由Monax贡献，并由Monax和英特尔赞助。

## Hyperledger Fabric

Hyperledger Fabric是一个许可的区块链架构(permissioned blockchain infrastructure)。

其由IBM和Digital Asset最初贡献给Hyperledger项目。

它提供一个模块化的架构，把架构中的节点、智能合约的执行(Fabric项目中称为"chaincode") 以及可配置的共识和成员服务. 一个Fabric网络包含同伴节点（"Peer nodes"）执行chaincode合约，访问账本数据，背书交易并称为应用程序的接口。排序节点（"Orderer nodes"）负责确保此区块链的一致性并传达被背书的交易给网络中的同伴们；以及MSP服务，主要作为证书权威（Certificate Authority）管理X.509证书用于验证成员身份以及角色.

## Hyperledger Iroha

Iroha是一个基于Hyperledger Fabric主要面向移动应用的协议，由Soramitsu贡献.

## Hyperledger Sawtooth

由Intel贡献的Sawtooth利用一种新型公式机制称为时间流逝证明（"Proof of Elapsed Time,"）一种基于可信的执行环境的彩票设计模式的共识协议由英特尔的Software Guard Extensions (SGX)提供.[

# 推荐阅读

[DAG 有向无环图（Directed Acyclic Graph）](https://houbb.github.io/2020/01/23/data-struct-learn-03-dag)

[java 实现有向图(Direct Graph)](https://houbb.github.io/2020/01/23/data-struct-learn-03-direct-graph)

# 参考资料

https://zh.wikipedia.org/wiki/%E8%B6%85%E7%BA%A7%E8%B4%A6%E6%9C%AC

* any list
{:toc}