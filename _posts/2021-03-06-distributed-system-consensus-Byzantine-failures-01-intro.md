---
layout: post
title: Byzantine failures 拜占庭将军问题
date:  2021-3-06 16:52:15 +0800
categories: [Distributed]
tags: [algorithm, distributed, bit-coin, block-chain, sh]
published: true
---

# 拜占庭将军问题

拜占庭将军问题（Byzantine failures），是由莱斯利·兰伯特提出的点对点通信中的基本问题。

含义是在**存在消息丢失的不可靠信道上试图通过消息传递的方式达到一致性是不可能的**

## 起源

拜占庭位于如今的土耳其的伊斯坦布尔，是东罗马帝国的首都。由于当时拜占庭罗马帝国国土辽阔，为了达到防御目的，每个军队都分隔很远，将军与将军之间只能靠信差传消息。

在战争的时候，拜占庭军队内所有将军和副官必须达成一致的共识，决定是否有赢的机会才去攻打敌人的阵营。

但是，在军队内有可能存有叛徒和敌军的间谍，左右将军们的决定又扰乱整体军队的秩序。

在进行共识时，结果并不代表大多数人的意见。

这时候，在已知有成员谋反的情况下，其余忠诚的将军在不受叛徒的影响下如何达成一致的协议，拜占庭问题就此形成

## 简介

拜占庭将军问题是一个协议问题，拜占庭帝国军队的将军们必须全体一致的决定是否攻击某一支敌军。

问题是这些将军在地理上是分隔开来的，并且将军中存在叛徒。

叛徒可以任意行动以达到以下目标：欺骗某些将军采取进攻行动；促成一个不是所有将军都同意的决定，如当将军们不希望进攻时促成进攻行动；或者迷惑某些将军，使他们无法做出决定。如果叛徒达到了这些目的之一，则任何攻击行动的结果都是注定要失败的，只有完全达成一致的努力才能获得胜利。

拜占庭假设是对现实世界的模型化，由于硬件错误、网络拥塞或断开以及遭到恶意攻击，计算机和网络可能出现不可预料的行为。

## 根本难题

在中本聪发明比特币以前，世界上并没有一个非常完美的方法来解决“拜占庭将军问题” 。

究其根底，“拜占庭将军问题”最终想解决的是互联网交易、合作过程中的四个问题：

（1）信息发送的身份追溯

（2）信息的私密性

（3）不可伪造的签名

（4）发送信息的规则

“拜占庭将军问题”其实就是网络世界的模型化

仅拿比特币世界来说，我们可以将每一个比特币交易账号看作一个将军，这些账号分布在世界各地，无法聚在一起，很可能会有恶意账号，账号之间的沟通也很可能因为机器坏了、网络断了、黑客攻击等受到破坏，并且有关账号是不是要支付、具体支付多少的讨论也会浪费很多时间

# 解决方法

区块链轻而易举地解决了这一问题，它为信息发送加入了成本，降低了信息传递的速率，而且加入了一个随机元素使得在一定时间内只有一个将军可以广播信息。这里所说的成本就是区块链系统中基于随机哈希算法的“工作量证明”。哈希算法所做的事情就是计算获得的输入，得到一串64位的随机数字和字母的字符串。

区块链系统计算的输入数据是指节点发送的当前时间点的整个总账。当前计算机的算力使其可以实时计算出单个哈希值，但是区块链系统只接受前13个字符是0的哈希值结果作为“工作量证明”。而前13个字符是0的哈希值是非常罕见的，需要整个网络花费10分钟的时间才在数以亿计的数据中找到一个。在一个有效的哈希值被计算出来之前，网络中已经生产了无数个无效值，这就是降低信息传递速率并使得整个系统成功运行的“工作量证明”。

在拜占庭将军问题中，第一个广播信息的将军就是第一个发现有效哈希值的计算机，只要其他将军接收到并验证通过了这个有效哈希值和附着在上面的信息，他们就只能使用新的信息更新他们的总账复制，然后重新计算哈希值。下一个计算出有效哈希值的将军就可以将自己再次更新的信息附着在有效哈希值上广播给大家。然后哈希计算竞赛从一个新的开始点重新开始。由于网络信息的持续同步，所有网络上的计算机都使用着同一版本的总账。

比特币区块链系统找到有效哈希值的时间间隔为10分钟，这是算法设置好的。算法难度每隔两周调整一次就是为了保证这10分钟的间隔，不能多也不能少。每隔10分钟，总账的信息就会在区块链更新并在全网同步一次。因此分散的交易记录是在所有网络上的计算机之间进行对账和同步的。

当个人用户在区块链系统发起一笔交易的时候，他们会使用私钥和公钥为这笔交易签名，而内嵌在比特币系统的标准公钥则承担了加密工具的角色，对应在拜占庭将军问题中，加密工具就是用于签名和验证消息的印章。

因此，哈希算法对信息传递速率的限制加上加密工具使得区块链构成了一个无须信任的数据交互系统。在区块链上，一系列的交易、时间约定、域名记录、政治投票系统或者任何其他需要建立分布式协议的地方，参与者都可以达成一致。

# 延伸编辑

“拜占庭将军问题”可以进一步延伸到各个领域。

人们在互联网上进行数据交易的时候，总会习惯性依赖强大的第三方平台来进行信任担保。

然而，这些解决人们信任问题的第三方正在逐渐失效，因为总有黑客能够抓住第三方平台的漏洞进行金融诈骗。

“拜占庭将军问题”中的“叛徒”就是互联网金融交易中的“骗子”，如果第三方平台出现了大漏洞或者为了规避过多的步骤将第三方信任机构撤走，“叛徒”就会利用信息在没有第三方信任机构的担保之下进行“行骗”。

在不去花费大量时间、资源揪出这个“叛徒”的情况下，能够让交易者双方都彼此信任、进行正常交易的方式就是区块链。

# 参考资料

https://baike.baidu.com/item/%E6%8B%9C%E5%8D%A0%E5%BA%AD%E5%B0%86%E5%86%9B%E9%97%AE%E9%A2%98

https://www.lishixinzhi.com/shijielishi/547930.html

https://baijiahao.baidu.com/s?id=1722335764072253414&wfr=spider&for=pc

https://zhuanlan.zhihu.com/p/33666461

https://www.zhihu.com/question/23167269

https://www.jianshu.com/p/5a020981a48b

https://baijiahao.baidu.com/s?id=1685958104377851541&wfr=spider&for=pc

* any list
{:toc}