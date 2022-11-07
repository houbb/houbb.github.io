---
layout: post 
title: web3 以太坊开发-30-以太坊智能合约部署 smart contracts deploy
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 部署智能合约

需要部署智能合约才能提供给以太坊网络的用户使用。

要部署一个智能合约，只需发送一个包含编译后的智能合约代码的以太坊交易，而不需要指定任何收件人。

# 如何部署智能合约

## 您所需要的

您的合约字节码 – 这是通过编译获得的。

用作燃料的以太币 – 像其他交易一样，您需要设定燃料限制，这样就知道部署合约比简单的以太币交易需要更多的燃料。

一个部署脚本或插件。

访问以太坊节点，通过运行自己的节点连接到公共节点，或通过应用程序接口秘钥使用节点服务，如 Infura 和 Alchemy。

## 部署智能合约的步骤

所涉及的具体步骤将取决于您使用的工具。 

例如，查看关于部署合约的安全帽文档或关于网络和应用程序部署的 Truffle 文档。 

这是两个最受欢迎的智能合约部署工具，它们涉及到编写脚本来处理部署步骤。

一旦部署，您的合约将有一个以太坊地址，就像其它帐户一样。

# 相关工具

Remix - Remix 集成开发环境可以开发、部署和管理类似区块链的以太坊智能合约。

Tenderly - 用实时数据模拟、调试和监视以太坊虚拟机兼容链上的任何内容

安全帽 - 用于编译、部署、测试和调试您的以太坊软件的开发环境

Truffle - 开发环境、测试框架、部署通道及其他工具。

# 拓展阅读

[部署第一个智能合约](https://ethereum.org/zh/developers/tutorials/deploying-your-first-smart-contract/)

[通过SOLIDITY与其他合约进行交互](https://ethereum.org/zh/developers/tutorials/interact-with-other-contracts-from-solidity/)

[如何缩减合约以规避合约大小限制](https://ethereum.org/zh/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/)

# 参考资料

https://ethereum.org/zh/developers/docs/smart-contracts/deploying/

* any list
{:toc}