---
layout: post
title: web3 以太坊 Ethereum 是一个去中心化的开源的有智能合约功能的公共区块链平台
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [coin, pow, sh]
published: true
---

# 以太坊

以太坊（Ethereum）是一个去中心化的开源的有智能合约功能的公共区块链平台。

以太币（ETH 或 Ξ）是以太坊的原生加密货币。

截至2021 年12月，以太币是市值第二高的加密货币，仅次于比特币。

以太坊是使用最多的区块链。

以太坊的概念首次在2013至2014年间由程序员维塔利克·布特林受比特币启发后提出，大意为“下一代加密货币与去中心化应用平台”，在2014年通过ICO众筹得以开始发展。

以太坊亦被称为“第二代的区块链平台”，仅次于比特币。

# 特点

相较于较大多数其他加密货币或区块链技术，以太坊的特点包括以下几点：

- 智能合约（smart contract）：存储在区块链上的程序，由各节点执行，需要执行程序的人支付手续费给节点的矿工或权益人。

- 分布式应用程序：以太坊上的分布式应用程序不会停机，也不能被关掉。

- 代币（tokens）：智能合约可以创造代币供分布式应用程序使用。分布式应用程序的代币化让用户、投资者以及管理者的利益一致。代币也可以用来进行首次代币发行。

- 叔块（uncle block）：将因为速度较慢而未及时被收入母链的较短区块链并入，以提升交易量。使用的是有向无环图的相关技术。

- 权益证明（proof-of-stake）：相较于工作量证明更有效率，可节省大量在挖矿时浪费的电脑资源，并避免特殊应用集成电路造成网络中心化。2022年9月15日与主链合并。

- 燃料（gas）：由交易手续费的概念扩展，在执行各种运算（computation）时需计算燃料消耗量，并缴交燃料费，包括发送以太币或者其他代币也被视为一种运算动作。

- 分片（sharding）：减少每个节点所需纪录的资料量，并透过平行运算提升效率。预计于2022年实现。

## 第二层功能

除了在主链上执行的各种功能，为了支持智能合约所需的高运算量以及资料容量，以太坊也积极开发第二层功能来**减轻主链的负担、提升交易速度、扩展其实用规模**。

第二层功能大多在2019~2021年发展成形，目前的主要方案包括以下：

状态通道（state channels）：原理同比特币的闪雷网络，将时常交易的一些结点之间的交易给果打包后再把最终结果写入主链。实现的例子包括雷电网络（Raiden）、Connext、Kchannels等。

支链：用较小的分支或平行的区块链执行一部分的运算，只将一部分的资料写入主链，以减轻主链的负担

平行链：可能使用完全不同的区块链接构和验证机制，只在开头和结尾用双向桥接和主链相连。

实现的例子有Skale、xDai、POA等。

Plasma 和 Validium支链：将大部分的合约执行和运算都移到支链上进行，只将最后交易结果写入主链。此方案由于交易资料未写入主链，安全性较差，但扩容效果较佳。实现的例子包括OMG、Polygon、Starkware、Loopring等。

Rollup支链：将链上资料复制一份，在链外用以太坊虚拟机（EVM）执行合约并确认后，将交易数据压缩再写入主链。主链上另有一系列合约可以验证结果正确，可再分为 Optimistic 和零知识证明两种验证方式。

# 以太坊经典（Ethereum Classic）

以太坊经典（Ethereum Classic）是一个开源、公开、 以区块链为基础的分布式计算平台。

它提供了一个分散的具有图灵完备性的虚拟机。该虚拟机可以利用全世界的虚拟机节点网络执行脚本。 

以太坊经典还提供了一种可在各用户之间流通，名为“经典以太坊”的代币。

用户可把代币存到密码货币钱包里，为各节点参与者的算力提供酬劳。

为防止以瘫痪系统为目的之大额交易的出现，经典以太坊设有名为Gas的交易定价制度，所有愿意付出较高交易费者之交易均会获优先处理。

以太坊经典是以太坊平台分叉而成的加密货币。

在分叉前，经典以太坊被直接称为以太坊。分叉以后，旧分叉以太坊经典，新分叉则保留原名。

在第1920000资料块出现前便拥有以太坊者都已获得相等数量的以太坊经典。

## Callisto

Callisto是以太坊经典的分支。

Callisto将会被分拆为另一种加密货币，代号CLO。

# 开发历史

## 起源

以太坊最初由维塔利克·布特林在2013年提出。

布特林本是一名参与比特币社群的程序员，曾向比特币核心开发人员主张比特币平台应该要有个更完善的编程语言让人开发程序，但未得到他们的同意，因此决定开发一个新的平台作此用途。

布特林认为很多程序都可以用类似比特币的原理来达成进一步的发展，在2013年写下了《以太坊白皮书》，说明了建造去中心化程序的目标。

然后2014年透过网络公开募资得到开发的资金，投资人用比特币向基金会购买以太币。

最初以太坊程序是由一间位在瑞士的公司 Ethereum Switzerland GmbH 开发，之后转移至一个非营利机构“以太坊基金会”（Ethereum Foundation）。

在平台开始发展的最初，有人称赞以太坊的科技创新，但也有人质疑其安全和可扩展性。

开发项目分为四个阶段：边境（Frontier，也有“前锋”的意思）、家园（Homestead）、都会（Metropolis）、宁静（Serenity）。

## 边境（2015年）

以太坊的公共区块链在2015年7月30日启动，最初的版本称为“边境”，用的是工作量证明（proof-of-work）的算法，但未来预期会转换成权益证明（proof-of-stake）。

激活后不久进行了第一次分叉，调整未来挖矿的难度，确保未来的用户会有转换至权益证明的动机[18]。边境最初只能挖矿，主要功能是让用户有时间加入以太链，过了几天后才能交易和使用智能合约。

## 家园（2016年）

2016年春季进行了第二次分叉，发布了第一个稳定版本，称作“家园”（Homestead）。

2016年六月，以太坊上的一个去中心化自治组织 The DAO 被骇，造成市值五千万美元的以太币被移动到只有该黑客可以控制的“分身DAO”。

因为程序不允许黑客立即提取这些以太币，以太坊用户有时间讨论如何处理此事，考虑的方案包括取回以太币和关闭DAO，而DAO去中心化的本质也表示没有中央权力可以立即反应，而需要用户的共识。

最后在2016年7月20日，以太坊进行硬分叉，作出一个向后不兼容的改变，让所有的以太币（包括被移动的）回归原处，而不接受此改变的区块链则成为以太坊经典。

这是第一次有主流区块链为了补偿投资人，而透过分叉来更动交易记录。

在分叉以前就持有以太币的人会同时持有以太币和以太币经典（Classic Ether, ETC），存在交易所或在线钱包中的以太币也不例外。

这些在线服务大多选择只支持其中一种以太币，并让用户领回另一种以太币。

在这次分叉之后，造成了在两个区块链之间进行重放攻击的可能，加上其他网络攻击，让以太坊和以太坊经典又各自进行了数次分叉来避免攻击。

其中2016年11月底的分叉因为沟通疏失，短暂造成以太坊的两个主要客户端程序 Parity 和 Geth 失去共识而产生意外的分叉，但问题在数小时内即被找出并修正。

## 都会（2017~2019年）

“都会”的开发遇到许多延迟，升级分成了三次分叉，2017年10月的“拜占庭”、2019年2月的“君士坦丁堡”和“圣彼德堡”、以及2019年12月的“伊斯坦布尔”。

这些升级主要改善智能合约的编写、提高安全性、加入难度炸弹以及一些核心架构的修改，以协助未来从工作量证明转至权益证明。

安全性升级包括让以太坊可以使用零知识证明的zk-SNARKs和zk-STARKs，也能和Zcash链互通。

在使用方面，2017年以太坊和比特币首次进行了原子交换（atomic swap），用智能合约让不同链上的加密货币互相交易。

ERC-20也在2017年成为标准，成千上万个项目透过以此进行集资，称作“首次代币发行”（Initial Coin Offering, ICO）。

2019年DeFi和MakerDAO等金融商品成为以太链上最大的产业。

三星手机、Opera浏览器以及微软都开发了以太坊的相关程序。

在以太币的价格方面，2017年从年初的10美金开始暴涨，至2018年初涨到1400美元。

然而在2018年，人们对区块链的热潮慢慢退却，至年底价格又跌至85美元。

## 宁静（2020年至今）

“宁静”又称为“以太坊2.0”，是项目的最终阶段，将转至权益证明，并开发第二层扩容方案。

目前预计分成三阶段升级：柏林、伦敦、以及双链合并。

权益证明所需的信标链在2020年12月1日上线，并允许权益证明的抵押，但尚不能提领。至2021年11月，已有8百万以太币加入权益证明的抵押，约占总发行量的7%。

2021年进行了柏林和伦敦分叉，并升级了信标链，为未来转换至权益证明作准备，并透过销毁手续费和降低区块奖励的方式控制总发行量。

2022年北京时间9月15日14时，以太坊合并完成，主网与PoS共识层信标链（Beacon链）结合、将此前PoW工作量证明机制转变为PoS权益证明机制，宣布以太坊正式进入2.0时代。

此举意味着，以太坊将告别大规模矿机挖矿时代，持有者通过质押以太坊代币（ETH）即可挖矿，质押门槛为32个ETH。

# 以太币（Ether）

以太坊区块链上的代币称为以太币（Ether），代码为ETH，可在许多加密货币的外汇市场上交易，它也是以太坊上用来支付交易手续费和运算服务的介质。

以太币的总发行量不明，因为权益证明的具体运作方式仍在研究中，而虽然难度炸弹限制了工作量证明的挖矿的区块数量上限，但因为叔块也有奖励，而且叔块的数量并不一定，造成确切数量难以估算。

以太币对其他实体货币的汇率可能在短时间内大幅变化，例如2016年The DAO被骇时，对美元的汇率从 $21.50 跌至 $15，而2017年初到2018年初的的一年间从大约10美金涨到1400美元。

布特林在 2016 年 4 月售出手上持有的四分之一以太币，造成一些人质疑，而他本人则说这是理财上很合理的分散风险，并引用前比特币开发员 Gavin Andresen 说这一切都还只是一场实验，仍有失败的可能。

根据金管会释令，具证券性质的虚拟货币获利大于本金，需缴纳30%个人所得税。

# 智能合约

以太坊最重要的技术贡献就是智能合约。

智能合约是存储在区块链上的程序，可以协助和验证合约的谈判和执行。以太坊的智能合约可以数种用图灵完备的编程语言写成。

纽约时报称以太坊平台是一台由众多用户构成的网络来运转的公用电脑，并用以太币来分配和支付这台电脑的使用权。

经济学人则说明智能合约可以让众多组织的数据库得以用低廉的成本交互，并且让用户写下精密的合约，功能之一是产生去中心化自治组织，也就是一间只是由以太坊合约构成的虚拟公司。

因为合约内容公开，合约可以证明其宣称的功能是真实的，例如虚拟赌场可以证明它是公平的。

另一方面，合约的公开性也表示如果合约中有漏洞，任何人都可以立刻看到，而修正程序可能会需要一些时间。

The DAO 就是一个例子，无法即时阻止。

智能合约的许多细节仍在研究中，包括如何验证合约的功能。

微软研究院的报告指出要写出完善的合约可能非常困难，讨论了微软开发的一些可以用来验证合约的工具，并提到如果大规模分析各个已发布的合约，可能发现找出大量的漏洞。

报告也说可以证明Solidity程序和以太虚拟机编码的等同性。

## 编程语言

Gavin Wood写的《以太坊黄皮书》中定义了以太虚拟机的运作流程。

智能合约可以专门为此开发的Solidity编程语言写成，或是Python的一个变体Serpent，或是LLL。

以太虚拟机也可以在Mutan上运行。

智能合约之后会编译成字节码，然后发布在以太坊区块链上。

## 运行效率

将所有合约存在区块链上每个结点的作法有好有坏。

主要的缺点是所有的结点都同时要运算所有的合约，因此速度较慢。

开发人员正研究将资料切分（Sharding）的技术套用至以太坊。

2016年9月布特林发表了改善可扩展性的企画。

截至2016年1月，以太坊每秒可以处理25个交易。

# 实现

智能合约的潜在应用很多。彭博社商业周刊称它是“所有人共享但无法篡改的软件”。

更高端的软件有可能用以太坊创建网络商店。

## 区块链程序

以太坊可以用来创建去中心化的程序、自治组织和智能合约，据纽约时报的报导，在2016年5月已经有数十个可用的程序。

预期的应用目标涵盖金融、物联网、农田到餐桌（farm-to-table）、智能电网、体育赌博等。

去中心化自治组织有潜力让许多原本无法执行或成本过高的营运模型成为可能。

目前较知名的应用有：

- 游戏：CryptoKitties让玩家繁殖及交易虚拟猫。

- 类庞氏骗局的赌局游戏：Fomo 3D，不同于传统的庞氏骗局，最后一位加入赌局中的人可获得总资金盘中的48%

- 虚拟宝物交易平台：FreeMyVunk。

- 去中心化创业投资：The DAO用以太币资金创立，目标是为商企业和非营利机构创建新的去中心化营业模式、The Rudimental让独立艺术家在区块链上进行群众募资。

- 社会经济平台：Backfeed。

- 去中心化预测市场：Augur。

- 物联网：Ethcore（一间以太坊公司）研发的客户端、Chronicled（一间区块链公司）发表了以太坊区块链的实物资产验证平台；芯片公司、物理IP创建者和生产者可以用植入的蓝牙或近场通信进行验证。Slock.It开发的智能锁可以在付费后自动开启，让
用- 户在付费后可以帮电动车充电、或是打开租屋的房门。

- 著作权授权：Ujo Music平台让创作人用智能合约发布音乐，消费者可以直接付费给创作人。伊莫珍·希普用此平台发布了一首单曲。

- 智能电网：TransActive Grid让用户可以和邻居买卖能源。

- 去中心化期权市场：Etheropt。

- 钉住汇率的代币：DigixDAO提供与黄金挂钩的代币，在2016年四月正式营运。Decentralized Capital提供和各种货币挂钩的代币。

- 移动支付：Everex让外劳汇款回家乡。

## 客户端软件

以太坊的2个主要的客户端软件是Geth和Parity。

### 企业软件

企业软件公司也正测试用以太坊作为各种用途。已知有兴趣的公司包括微软、IBM、摩根大通。

德勤和ConsenSys在2016年宣布成立数字银行Project ConsenSys。

R3公司在Microsoft Azure上执行私人以太坊区块链，将11间银行连接至一本分布式帐薄（distributed ledger）。

Microsoft Visual Studio提供程序开发者使用Solidity编程语言。

英国政府中负责推动创新的机构Innovate UK提供了近25万英镑给Tramonex用以太坊发展跨国支付系统。

## 认许制记账

目前有许多方案正在研究使用以太坊创建认许制的区块链。

摩根大通打算用以太坊上创建一个私人区块链“Quorum”。

其功能是洗乱派生性金融产品及其交易纪录来保护交易者的隐私，但同时符合金融管制单位在信息公开上的要求，以期在保障隐私和信息公开之间找到平衡。

苏格兰皇家银行用以太坊的分布式记账和智能合约平台创建了一个结算交割机制（Clearing and Settlement Mechanism, CSM），可以达成每秒100笔交易、模拟六间银行，平均每个trip在3到8秒间完成，这些数值用在于全国的支付系统是可接受的。

# 采用

2016年五月，纽约时报指出以太坊的采用仍在初期阶段，并可能遇到让成长率减缓的技术或法律问题。

许多比特币支持者认为以太坊比比特币复杂，所以可能需要面对更多的安全问题。报导也指出这个系统复杂到熟知这个系统的人也很难用普通人的语言来描述它。

微软和 ConsenSys合作，在 Microsoft Azure上提供第三方开发的区块链工具，包括交易股票和跨境支付等用途。

卢森堡交易所在2016年10月开始提供用以太坊产生的数字签名来证明文件的真实性。

新加坡金融管理局使用以太坊将新加坡元数字化。

# 交易以外的用途

因区块链技术难以删改资料的特质，部分人会运用加密货币**上传资料以免被他人删改**。 

2018年4月，在北大岳昕事件中，有用户把岳昕的公开信上载到以太坊的交易记录，以免被校方删除。

2019年6月，部分香港警察的个人资料被示威者上载到以太坊的交易记录，令有关当局难以追查上载者身份及删除资料。

# 参考资料

https://zh.wikipedia.org/wiki/%E4%BB%A5%E5%A4%AA%E5%9D%8A

https://zh.wikipedia.org/wiki/%E4%BB%A5%E5%A4%AA%E5%9D%8A%E7%B6%93%E5%85%B8

* any list
{:toc}