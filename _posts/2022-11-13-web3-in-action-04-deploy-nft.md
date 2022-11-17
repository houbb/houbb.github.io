---
layout: post 
title: web3 学习实战笔记-04-如何撰写和部署非同质化代币 NFT
date: 2022-10-28 21:01:55 +0800
categories: [web3] 
tags: [web3, dev, ethereum, sh]
published: true
---

# 说明

随着非同质化代币将区块链带入公众视野，现在是一个极好的机会，可以通过在以太坊区块链上发布自己的非同质化代币（ERC-721 代币）来了解炒作情况。

Alchemy 非常自豪能够推动非同质化代币领域的一些巨头，包括 Makersplace（最近在克利斯蒂拍卖行创造了 6900 万美元的数字艺术品销售记录）、Dapper Labs（NBA Top Shot & Crypto Kitties 的创作者）、OpenSea（世界上最大的非同质化代币市场）、Zora、Super Rare、NFTfi、Foundation、Enjin、Origin Protocol、Immutable 等。

在本教程中，我们将学习使用 MetaMask、Solidity、安全帽、Pinata 和 Alchemy 在 Ropsten 测试网络上创建和部署 ERC-721 智能合约的全过程（如果您还不明白其中的含义，不要着急，我们会加以解释！）。

在本教程的第二部分，我们将了解如何使用我们的智能合约来铸造非同质化代币；在第三部分，我们将说明如何在 MetaMask 上查看您的非同质化代币。

当然，如果您有任何问题，请随时通过 Alchemy Discord 联系我们或阅读 Alchemy 的非同质化代币应用程序接口相关文档！

# 步骤 1：连接到以太坊网络

有很多方法可以向以太坊区块链发出请求，但为了方便起见，我们将使用 Alchemy 上的免费帐户。

Alchemy 是一个区块链开发平台，能够提供应用程序接口，让我们无需运行自己的节点，即可与以太坊区块链进行通信。

在本教程中，我们将利用 Alchemy 平台的开发者工具进行监测和分析，以便了解智能合约部署的底层逻辑。 

如果您还没有 Alchemy 帐户，您可以在此处免费注册。

> [Alchemy](https://alchemy.com/signup/eth)

创建好账户，选择对应的 NFTS/以太坊链。

https://dashboard.alchemy.com/

# 步骤 2：创建应用程序（和应用程序接口密钥）

创建了 Alchemy 帐户后，您可以通过创建应用程序来生成应用程序接口密钥。 

我们可以用它向 Ropsten 测试网络发起请求。 

如果您想了解更多关于测试网络的信息，请查看本指南。

在您的 Alchemy 仪表板中的“创建应用程序”页面上，将鼠标悬停在导航栏中的“应用程序”上 ，然后点击“创建应用程序”

![创建应用程序（和应用程序接口密钥）](https://ethereum.org/static/c1e444ea2f94e39f8b1971fca8cbc182/d61c2/create-your-app.png)

2、为您的应用程序命名（我们起名为“我的第一个非同质化代币！”），提供简短的描述

![在这里插入图片描述](https://img-blog.csdnimg.cn/7d9d27722fc84835b0425bdc37477f7f.png)

**网络：以太网测试网络 Goerli。**

3、点击"创建应用程序"，完成！ 您的应用程序应该会出现在下面的表格中。

# 步骤 3：创建一个以太坊帐户（地址）

我们需要一个以太坊帐户来发送和接收交易。 

在本教程中，我们将使用 MetaMask——浏览器中的虚拟钱包，用来管理您的以太坊帐户地址。 

如果您想了解更多关于以太坊交易的运作方式，请查看以太坊基金会的这个页面。

您可以在这里免费下载并创建一个 MetaMask 帐户。 

创建帐户时，或者如果您已经有一个帐户时，确保切换到右上方的“Goerli 测试网络”（这样我们就不会用实际货币进行交易）。

**网络：以太网测试网络 Goerli。**

# 步骤 4：从水龙头添加以太币

为了将我们的智能合约部署到测试网络，我们需要一些虚拟以太币。 

要获取以太币，您可以前往 [FaucETH](https://fauceth.komputing.org/) 并输入您的 Goerli 帐户地址，

单击“Request funds”，然后在下拉菜单中选择“Ethereum Testnet Goerli”，最后再次单击“Request funds”按钮。 

您应该会很快在您的 MetaMask 帐户中看到以太币！

步骤 5：查看帐户余额

# 参考资料

https://ethereum.org/zh/developers/tutorials/how-to-write-and-deploy-an-nft/

[如何在 Goerli 网络中获取测试 ETH](https://juejin.cn/post/7151234940045099044)

* any list
{:toc}
