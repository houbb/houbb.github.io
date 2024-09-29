---
layout: post
title:  风控资料汇总-04-19-安全从自身做起
date:  2021-2-14 16:52:15 +0800
categories: [BIZ]
tags: [biz, risk, risk-control, sh]
published: true
---



# 安全从自身做起

威胁可能来自公司外部，也可能来自公司内部。

## 泄露密码

每一年都会发生因为密码泄露导致的恶性事件，其中大部分都是人为疏忽导致的。

有时被泄露的是企业邮箱，导致了内部信息泄露。甚至出现过服务器密码在github上泄露，导致服务器被黑。

对于企业，避免类似问题的方法有

- 日常灌输安全意识

- 3个月左右强迫员工更改密码

- 敏感信息禁止在邮件或者第三方提供的工具中沟通

## 公司无线网络

有些公司会为来访人员提供Wifi，这就给了外部人员访问内网的可趁之机。有恶意的人完全可以趁机对内网做一次扫描，很可能会泄露信息。

解决这个问题较为简单

1. 给访客提供独立的无线网

2. 访客的无线网络和公司内网完全隔离


实例

我们在github上随便搜一下 “smtp password 163.com”，可以搜到大量网易邮箱的账号和密码，随便试了两个，就有一个成功了。

邮件泄露 有趣的是，网易明显对Github做了扫描，并在明显位置给用户了一个提示

邮件泄露 但是这个人的信息还是泄露了，行程一览无余。 邮件泄露

# 让风控贯穿产品

如果你认识到风控有多重要，如果你恰巧在负责一个产品，那么下一个问题是“我们什么时候开始考虑风控？”

答案其实很简单，思考风控最好的时间点就是产品设计阶段，或者是一个功能的设计阶段。

在产品设计之初，就要考虑产品上线后会面临什么样的风险。这种风险可能来自于黑产，也可能来自产品的设计不合理。

- 用户账户是否足够安全？

- 用户是否可以信用卡套现？

- 用户是否可以绕过优惠的限制策略？

- ...

之前某一版本iOS刚发布时，就被爆出可以绕过锁屏密码，直接浏览用户相册。原因其实就是新功能缺少安全考虑。

在产品的开发阶段，我们使用了大量的开源项目，黑产可以利用开源项目还未修复的Bug攻击我们，如果这个Bug是发生在身份认证阶段，后果很难估量。

我们的产品发布后，我们也不能掉以轻心，特别是手机App。黑产很可能会反编译你的软件，从你的代码中寻找攻击你的机会。

在产品版本的新旧迭代中，我们可以在新版本中堵上有问题的模块，除非是基于Web的服务，那么一定会有不少用户仍在使用旧版本。如果设计不合理就很有可能出现

新版本很安全，但是老版本用户连基本功能都不能用了，除非升级
为了用户体验（不强迫用户升级），问题还是不能修复

## 点和面

站在黑产角度，只需要找到你产品中的一个缺陷点，就可以或多或少的威胁到你。

所以站在企业角度，就要考虑到方方面面，这是一个很考验智慧和耐心的事情。


# 谈判技巧 - 我的谈判学习笔记

谈判不是商业领域特有的行为，而是我们每日都在进行的事情。

谈判不是讲计谋，而是讲如何更好的沟通。谈判不能让我们得到所有，但可以让我们得到更多。

## 公开课

Successful Negotiation: Essential Strategies and Skills
Coursera上经典的课程，中文译名《成功的谈判：基本策略与技巧》。是我接触谈判的第一课，对于很多内容讲的很浅，但是很适合初学者建立谈判的知识框架，躲过常犯的错误。

## 读书笔记

Getting More
《Getting More》是我读的第一本谈判类书籍，中文译名《沃顿商学院最受欢迎的谈判课》。

Getting-More-知识点总结

可以下载xmind原始版本和PNG版本。

Getting to Yes
《Getting to Yes》中文译名《谈判力》，是一本硬核的谈判书籍。核心是原则谈判法，因为作者Fisher教授生前在哈佛大学任教，这个方法也被叫做哈佛谈判法(The Harvard Approach)。

There is a third way to negotiate, a way neither hard nor soft, but rather both hard and soft. The method of principled negotiation developed at the Harvard Negotiation Project is to decide issues on their merits rather than through a haggling process focused on what each side says it will and won’t do. It suggests that you look for mutual gains whenever possible, and that where your interests conflict, you should insist that the result be based on some fair standards independent of the will of either side. The method of principled negotiation is hard on the merits, soft on the people. It employs no tricks and no posturing. Principled negotiation shows you how to obtain what you are entitled to and still be decent. It enables you to be fair while protecting you against those who would take advantage of your fairness.

我之所以喜欢原则谈判法，不仅仅因为它是一个谈判方法，可以引导我解决冲突，保护自己的利益。也是因为它让我可以成为一个善良的人。

通过对比软、硬两种谈判风格，原则谈判法主要特点如红字所示。

Positional-Bargaining-VS-Principled-Negotiation


# 参考资料

https://github.com/WalterInSH/risk-management-note/blob/master/%E5%AE%89%E5%85%A8%E4%BB%8E%E8%87%AA%E8%BA%AB%E5%81%9A%E8%B5%B7.md

https://github.com/WalterInSH/risk-management-note/blob/master/%E8%AE%A9%E9%A3%8E%E6%8E%A7%E8%B4%AF%E7%A9%BF%E4%BA%A7%E5%93%81.md

https://github.com/WalterInSH/negotiation-skills

* any list
{:toc}
