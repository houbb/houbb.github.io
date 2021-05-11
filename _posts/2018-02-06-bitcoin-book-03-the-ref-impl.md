---
layout: post
title:  bitcoin book-03-比特币的核心实现
date:  2018-2-7 13:55:12 +0800
categories: [Bitcoin]
tags: [Bitcoin, sh]
published: true
---

# 比特币核心：参考实现

比特币是一个开源项目，其源代码在开放（MIT）许可下可用，可以免费下载和用于任何目的。开源不仅仅意味着免费使用。这也意味着比特币是由开放的志愿者社区开发的。

最初，该社区仅由中本聪组成。到2016年，比特币的源代码已经有400多个贡献者，大约有十几个开发人员几乎全职从事该代码的开发，还有几十个兼职人员。任何人都可以为代码做出贡献，包括您在内！

中本聪（Satoshi Nakamoto）创建比特币时，实际上是在编写[satoshi_whitepaper]中复制的白皮书之前完成了该软件。中本聪希望在撰写之前先确保它能正常工作。最初的实现（后来简称为“ Bitcoin”或“ Satoshi客户端”）已经过大量修改和改进。它已经发展成为所谓的比特币核心，以区别于其他兼容的实现。比特币核心是比特币系统的参考实现，这意味着它是有关如何实现该技术各部分的权威参考。 Bitcoin Core实现了比特币的所有方面，包括钱包，交易和区块验证引擎以及对等比特币网络中的完整网络节点。

- 警告

即使Bitcoin Core包含钱包的参考实现，也不打算将其用作用户或应用程序的生产钱包。

建议应用程序开发人员使用BIP-39和BIP-32等现代标准构建钱包（请参阅[mnemonic_code_words]和[hd_wallets]）。 

BIP代表比特币改进提案。

比特币核心体系结构（来源：Eric Lombrozo）展示了比特币核心体系结构。

- Figure 1. Bitcoin Core architecture (Source: Eric Lombrozo)

![Bitcoin Core architecture (Source: Eric Lombrozo)](https://github.com/bitcoinbook/bitcoinbook/blob/develop/images/mbc2_0301.png)

# 比特币开发环境

如果您是开发人员，则需要使用所有用于编写比特币应用程序的工具，库和支持软件来设置开发环境。 

在这一高度技术性的章节中，我们将逐步介绍该过程。 

如果材料太稠密（并且您实际上并没有设置开发环境），请随时跳到下一章，这是技术性较低的一章。

# 从源代码编译比特币核心

Bitcoin Core的源代码可以作为存档下载，也可以通过从GitHub克隆权威的源存储库来下载。 

在Bitcoin Core下载页面上，选择最新版本并下载源代码的压缩存档，例如bitcoin-0.15.0.2.tar.gz。 

或者，使用git命令行从GitHub比特币页面创建源代码的本地副本。

在本章的许多示例中，我们将使用通过“终端”应用程序访问的操作系统的命令行界面（也称为“外壳”）。 

外壳将显示提示； 您键入命令； 然后Shell会以一些文本和一个新提示来响应您的下一个命令。 

该提示在您的系统上可能看起来有所不同，但是在以下示例中，该提示用$符号表示。 

在示例中，当您看到$符号后面的文本时，请不要键入$符号，而是紧随其后键入命令，然后按Enter执行该命令。

在示例中，每个命令下面的行是操作系统对该命令的响应。 
 
看到下一个 `$` 前缀时，您将知道这是一个新命令，应重复此过程。

> [https://github.com/bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)


TODO...

涉及到源码，暂时跳过。

# 参考资料

https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch03.asciidoc

* any list
{:toc}