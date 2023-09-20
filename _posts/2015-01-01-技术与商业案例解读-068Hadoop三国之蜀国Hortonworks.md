---
layout: post
title:  技术与商业案例解读-068Hadoop三国之蜀国Hortonworks
date:   2015-01-01 23:20:27 +0800
categories: [技术与商业案例解读]
tags: [技术与商业案例解读, other]
published: true
---



068 Hadoop三国之蜀国Hortonworks
我把Hortonworks类比为“蜀国”，主要有两个原因：一是它也算正统出身，是原来雅虎里面写Hadoop的那个团队被剥离以后成立的；二是“蜀中无大将，廖化作先锋”，Hortonworks和其他公司比起来，真是没什么大神。Cloudera有Hadoop的创始人在，MapR的CTO精通文件系统，而Hortonworks缺了一个标杆式的人物。

Hortonworks的起源要追溯到2011年，那年雅虎决定将Hadoop团队拆分出去，与人合资成立一家新公司。

我想，这在很大程度上是因为雅虎一直是Hadoop源代码的最大贡献者，而Cloudera则拿着雅虎的源代码赚钱。雅虎里面做Hadoop的人看着对方发财，心里肯定很不爽，起了单干的雄心壮志，这是可以理解的。

主导这次拆分的人是埃里克 · 巴尔德施维勒（Eric Baldeschwieler），他当年也是雅虎Hadoop软件开发副总裁，掌管了整个Hadoop团队。拆分后，他先后就任Hortonworks公司的CEO和CTO。下台以后的他很久没有再找一份正式的工作，而是以投资人和导师的身份混迹于硅谷的IT圈。直到最近，他终于去了亚马逊旗下的子公司A9做了搜索部门的一把手。

这个埃里克就是那个当年和道格 · 卡丁（Doug Cutting）不和的人，他在一定程度上导致了卡丁决定离开雅虎，加盟Cloudera。后来卡丁发达了，埃里克“没落”了，所谓人生起伏莫过于此，不知道两位相见是否会感触良多。

**Hortonworks早年赚钱很困难。竞争对手Cloudera不但先一步进入了市场，挖到了Hadoop的精神领袖，而且更重要的是，很早就开始专注于一些企业需求，包括权限管理、资源管理，以及对用户行为的监督等企业级应用的必需品。这些东西当然一部分被Cloudera给贡献进了Hadoop，但另外一部分则成为了Cloudera收费的Cloudera Manager。**

**而写了Hadoop大部分程序的Hortonworks没有这个觉悟，他们认为“开源”就是好的。这个公司从一开始就打出口号：我们的东西100%是开源的。**

“100%开源”这件事到底好不好，就是“仁者见仁，智者见智”的事了。但是不可否认，既然是“100%开源”的，那么其他人也很容易就能组个局，就可以卖自己的Hadoop了，为什么非要用Hortonworks的呢？事实上这事情英特尔干过，Oracle想过。

所以这样一看，Hortonworks的竞争优势，最后只剩下“更廉价”了。Hortonworks到处打价格战抢客户，这个生意显然也没做成功。我想主要原因还是有钱的不缺那点钱，没钱的希望更便宜。

**而这种100%开源的做法，意味着Hortonworks的发行版并不能比开源版带来额外的附加价值，从而也使得Hortonworks的定价没有太多的空间。这让Hortonworks成了“廉价”的代名词。**

Hortonworks成立的时候，最大的一单生意来自于微软。那个时候微软特别得恐慌，因为Hadoop只能跑在Linux上，不能跑在Windows上。长久下去，这必然会影响到Windows的销售。在那个以Windows为纲的年代里，微软对任何会影响到Windows销量的问题，都要想办法解决。

微软的解决方法就是：把Hadoop做到Windows上来。据说微软和几家商谈，Hortonworks开价最便宜，于是微软决定让Hortonworks来做Hadoop的Windows版本。2013年的时候，Hadoop终于能够在Windows上跑起来了，而微软的重点却已经从Windows转移到云计算了。

**因为版权的问题，在云上，Windows的虚拟机比Linux的虚拟机更贵，所以大家都宁可用Linux而不用Windows。微软自己的Windows Azure也不得不加入对Linux的支持里来，因此让Hortonworks做Hadoop的Windows版本这单生意，并没有让Windows的销量上去多少，微软多少有点赔本赚吆喝，但是Hortonworks的确很需要微软的钱。**

Hortonworks当时被投资人问的最多的问题就是：你们的钱从哪里赚的，是不是还是主要从微软来？而Hortonworks可能觉得自己出身于硅谷，硅谷的传统又是“反微软”，与微软绑定似乎就是硅谷的敌人了，因此虽然拿了微软的钱，但态度却依然暧昧。

具体的表现是Hortonworks一方面和微软的合作扭扭捏捏，不太愿意和微软保持类似Cloudera和Intel那样很紧密的合作关系，也不太愿意微软注资拿一部分股份。另外一方面，Hortonworks在投资人面前非常强调自己在如何如何地努力增加非微软的收入。

**Hortonworks与微软暧昧踟躇的关系并不是好事。微软毕竟家大业大，有很多企业客户，而Hortonworks最缺的就是客户。Cloudera这方面明显聪明太多了，接受了英特尔的投资让其成为自己的大股东，从而获得了英特尔这家大企的支持。**

当Hortonworks有了更多的合作伙伴，其他各处的总收入超过微软给的钱时，与微软的合作就从若即若离，变得同床异梦起来。而萨蒂亚 · 纳德拉（Satya Nadella）的上台也让微软从“以Windows为纲”彻底转向了云计算。Hadoop能不能在Windows上运行，这一点已经不是重点了。

于是，在某次宣传Windows Azure的活动里，Cloudera作为合作伙伴，也在邀请之列。这样一来，Hortonworks和微软的蜜月期结束了，之后两家公司渐行渐远。没有抱住微软的“大腿”，这是Hortonworks发展史上非常遗憾的一幕。

**Hortonworks在Hadoop社区里有一场非常知名的“互撕事件”，事件的另一主角是Cloudera**。这都要从2011年说起，曾经的雅虎Hadoop团队重要成员，后来的Hortonworks创始人之一，也就是欧文 · 奥马利（Owen O’Malley）写了一篇博文：“The Yahoo！Effect”。

这篇文章总结来说就是：Apache基金会很厉害，开源项目很多。但是，这篇文章同样传递出这样一个意思：雅虎在里面做了大部分的贡献。至于竞争对手Cloudera，在文中就显得非常惨不忍睹。

也许文章的本意是唤醒大家“Hortonworks才是Hadoop正统”的意识，但是Hortonworks已经没什么牛人了，即便正统又怎么样呢?

Cloudera看到此文，自然不干了，他们辛辛苦苦挖来了道格 · 卡丁装点门面，就是想让自己显得更为正宗。这篇文章却直接“打脸”，似乎是说他们不劳而获，拿了雅虎的东西卖钱。

Cloudera的辩解方式简单总结就是：这个当年写代码的人——“Hadoop之父”道格 · 卡丁，都在我们公司了，他所有写的代码，包括过去未被我们雇用时写的代码，现在也应该算是我们公司的贡献了。

经过这样修改之后，Cloudera迅速成为了第三大贡献者，当然前两位依然是Hortonworks和雅虎。但不管怎么说，这也只是让Cloudera显得好看一点而已。Cloudera一下子从不重要的贡献者跻身为第三位贡献者的地位，我想Cloudera大致也就只能修饰到如此程度了吧。

非常有意思的是，Hortonworks里面原本就最不爽道格 · 卡丁的埃里克跳了出来，也就是前雅虎Hadoop软件开发副总裁，后来又先后做了Hortonworks CEO和CTO的那位。

埃里克说Cloudera这个统计也有问题。因为这个统计里面，用的指标是每个公司分别给系统提交了多少个补丁，而在统计的过程中并没有考虑每个补丁的大小是不一样的。于是埃里克说，我们干脆来看看每个公司分别提交了多少行源代码吧。

这一统计，雅虎的源代码还是占据了大部分，Hortonworks和Cloudera基本上旗鼓相当。但是埃里克说Hortonworks作为一家公司成立，晚了好几年，可是提交的源代码数量已经和Cloudera旗鼓相当了。Cloudera单位时间内提交的代码数量不如Hortonworks，所以Cloudera自然是名不符实。

**这次事件主要就是在争夺Hadoop的控制权。而两位主角因为忙于互撕，直接导致Hadoop在两年内没有什么新版本发布。这样一来围观者看不下去了：天天叫着Hadoop的新版本怎么还没来，我们没空看你们互撕。**

我们必须说资本的力量是无穷的，道格 · 卡丁顺利荣升Apache基金会主席，他的影响力一时无二；而埃里克这次跳出来发表意见，难免引起公司内外包括投资人的一些反应，之后他也从Hortonworks离职，然后很长一段时间里没有找到全职的工作。

最后的结果是，阿帕奇Hadoop项目委员会的成员里，Hortonworks和Cloudera的人大致占了一半，谁也不是赢家。Hortonworks可能更惨一些，毕竟CTO因为跳出来发表意见，之后就辞职了。

**更重要的是，“二虎相争”又让第三方的软件有机可乘，比如MapR就趁机拓展了地盘，亚马逊的Elastic MapReduce更是迅速占领市场**。|因为Elastic MapReduce这个版本在云上面的服务是基于S3的，而不是原生的Hadoop文件系统。

另外一方面，随着大数据技术的发展，引领大数据潮流的谷歌新推出了一个叫作BigQuery的服务，它主要是提供交互式分析查询，而交互式分析查询在Hadoop的生态系统里也越来越重要，客户越来越需要。但是这种交互式查询HIVE做不了，因此Cloudera启动了Impala项目，MapR也以Drill项目来响应。

但是Hortonworks却坚持说：HIVE才是交互式分析查询最自然的选择。虽然现在HIVE因为性能问题做不到交互式，但是Hortonworks决定大举进军HIVE，提高它的性能。Hortonworks相信经过性能改造，HIVE能够提供交互式分析查询。

结果，这条路走得不但艰难，而且很失败。Hortonworks始终没能够把HIVE改造到可以和Impala或者Drill相提并论的程度。而在合适的时候没有开始新产品的开发，没有了“大杀器”的Hortonworks，其产品销售比起其他两家来越加困难。

**因为产品销售困难，Hortonworks的融资之路也开始受困。在此背景下，Hortonworks决定率先IPO；既然拿不到投资者的钱，不妨去股市里找钱。资金链的危机，据说正是Hortonworks急速上市的重要原因。**

但是，这个上市过程就显得有点“血淋淋”了：上市的时候大概10亿美金，上市后不到半年，就腰斩一半只剩下5亿美金了。

Hortonworks这个正统出身的Hadoop公司，今天混到这步田地，只能说是“小二黑过年，一年不如一年”了。

Hortonworks公司既无大公司支持，又没有自己独特的功能。100%的开源，没有自己主导的开源项目，也没有自己开发的闭源的套件，它的未来之路会好走吗？




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%8a%80%e6%9c%af%e4%b8%8e%e5%95%86%e4%b8%9a%e6%a1%88%e4%be%8b%e8%a7%a3%e8%af%bb/068%20Hadoop%e4%b8%89%e5%9b%bd%e4%b9%8b%e8%9c%80%e5%9b%bdHortonworks.md

* any list
{:toc}
