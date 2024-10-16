---
layout: post
title:  风控资料汇总-04-18-什么是风险？
date:  2021-2-14 16:52:15 +0800
categories: [BIZ]
tags: [biz, risk, risk-control, sh]
published: true
---



# 什么是风险?

我们已经聊了很多做业务风控的手段和技术，可是到现在还没有说清楚“风险控制”中的“风险”是什么。

我一直在想应该从什么角度来写这个问题，最终我决定从金融行业借鉴一些内容。这个行业已经花了几十年研究风险，我们看看这个行业会带给我们什么启示。

橡树资本联合创始人Howard Marks在几篇备忘录中阐述了他对风险的看法，下面就围绕他写过的内容聊一聊。

# 风险来自不确定性

Investing requires us to decide how to position a portfolio for future developments, but the future isn’t knowable.

投资行业要求我们为未来发展设计一套投资组合，但是未来是不可知的。

简单来说，金融投资行业就是今天花一笔钱在一件事情上，未来获得一个结果。有难度的部分是：站在现在，未来是不可知的。

其实投资不是金融行业特有的行为，普通公司、每个人的生活都充满了投资，做一次广告活动、报考大学都是投资，都是花一笔钱或者几年时间在一件事上，未来获得一个结果。同样难的是：站在现在，未来是不可知的。

How can investors deal with the limitations on their ability to know the future? The answer lies in the fact that not being able to know the future doesn’t mean we can’t deal with it. It’s one thing to know what’s going to happen and something very different to have a feeling for the range of possible outcomes and the likelihood of each one happening. Saying we can’t do the former doesn’t mean we can’t do the latter.

那么我们站在现在，该用什么眼光看到未来的结果呢？

The future should be viewed not as a fixed outcome that’s destined to happen and capable of being predicted, but as a range of possibilities and, hopefully on the basis of insight into their respective likelihoods, as a probability distribution.

未来不应被视为一个注定发生、可被预测的结果，而应被视为一个可能性区间，寄希望于对各个可能性的洞悉，未来可以被看做一个概率分布。

拿金融投资来说，花几百万买了一家公司的股票。未来能不能盈利是不能预测的，结果可能是亏损、回本、盈利（当然你可以拆分的更细），每一种结果都有一个可能性区间。当你认真研究基本面后，再加上一些主观直觉，你就得到了一个概率分布。例如：90%的概率会盈利，5%的概率会亏损，还有5%概率不亏不赚。

考大学和金融投资类似，花几万学费和很长时间在大学的某个专业学习，几年后毕业的时候也会有很多结果。对于刚高考完的学生而言是无法预测的。我们站在2018年回首，即便同样是计算机专业的毕业生、同样的学校、同样的努力，毕业于14年和16年的两批学生面临的互联网就业环境是完全不一样的。

这和风险有什么关系呢？

This uncertainty as to which of the possibilities will occur is the source of risk in investing.

哪种可能会真正发生的不确定性，是投资风险的来源。

也就是说金融投资的风险来自于亏本还是盈利的不确定性，读大学的风险来自于最后是进BAT还是去搬砖的不确定性。

基于"风险来自不确定性"，Howard Marks延伸出了几个很有意义的关键点。

Risk means more things can happen than will happen. —— Elroy Dimson

风险意味着可能发生的事总是多于确定发生的事

在评估业务风险时，除了那些大概率会发生的事情，还有更多小概率发生的事，有时那些负面的小概率事件才是风险的来源。所以事前评估风险时应该冷静、开放的思考各个方面，包括小概率事件，甚至将业务逻辑之外的东西也考虑进去。

某家公司曾经通过QQ群发现有人在卖自己网站的用户账号，但是风控系统显示最近撞库并没有异常，通过风控团队和用户团队的配合，发现用户登录量少于风控记录到的登录量。为什么有些用户登录没有进行风控判断呢？排查后发现：当系统判断到用户在请求接口https://example.com/login时会调用风控，黑产通过请求 //login(两个/)绕开了这个判断逻辑，且依然可以访问登录接口(HTTP路径中/和//指向的地址是一样的)。

类似的案例表明风险有时来自于我们很难想到的地方，我们总显得比黑产“笨”一些。所以在风险评估时，应该尽可能从多方面想想，必要时应假设我们的策略失败了，并设计兜底方案。

Knowing the probabilities doesn’t mean you know what’s going to happen.

知道发生的概率不意味着你知道接下来会发生什么

就像扔骰子，我们都知道扔一次每个面的概率是1/6，但是我们却无法准确预测某一次扔出的结果。即便我们通过分析，得出风险很低(或者很高)，也不意味着未来真的是这样。

Even though many things can happen, only one will.

即便一件事有很多可能性，但最终只有一种会发生

在很多时候我们当然可以用均值作为判断，但是我们要谨记的是即便得出的均值是一个很好的结果，单次结果仍然有可能很差，甚至超过我们的承受能力。

I have no interest in being a skydiver who’s successful 95% of the time.

我没有兴趣成为一个成功率有95%的跳伞运动员

No ambiguity is evident when we view the past. Only the things that happened happened. But that definiteness doesn’t mean the process that creates outcomes is clear-cut and dependable. Many things could have happened in each case in the past, and the fact that only one did happen understates the variability that existed.

回顾过往时，模棱两可的事总是不清晰的。只有那些发生了的事情真正发生了。这不意味事情的发展注定如此，清晰且恒定。过去的每个案例都有可能发生很多事情，只是最终只有一种变成了现实，这让我们低估了历史中存在的多样性。

因为最后只有一个结果会发生，我们有时会进入一个误区：事后去评估事前发生的风险时，大大低估那些最后没发生的可能结果的概率。下面这些想法你也许听说过：

我就知道这个活动会失败！
之前分析报告已经写了，成功率80%，我们果然成功了
这个误区不仅会让我们看不清过去，也很容易导致我们过度自信，从而影响我们未来的决策。

# 风险的定义

我们说清了风险的来源，接着看看Howard Marks给风险的定义是什么：

The possibility of permanent loss. A downward fluctuation – which by definition is temporary – doesn’t present a big problem if the investor is able to hold on and come out the other side.

风险就是发生永久性损失的概率。一个暂时的向下波动并不是一个大问题，只要投资者可以承受，且之后可以翻盘。

业务方投入资源(包括时间和经费)去做拉新、促销，是为了获取回报，也就是更多用户、更多订单，当然说到底都是为了利润。对应Howard Marks给出的定义，业务方面临的永久性损失是什么？

一家成熟公司投入了10万元进行了一次为期1个月的促销活动，最后只多带来了1万元收入。那么差值（9万元）是永久性损失吗？

In the short run, it can be very hard to differentiate between a downward fluctuation and a permanent loss. Often this can really be done only in retrospect. Thus it’s clear that a professional investor may have to bear consequences for a temporary downward fluctuation simply because of its resemblance to a permanent loss.

短期来看是很难区分向下波动和永久性损失。经常我们只能事后复盘的时候区分出来。因为这种相似性，很显然一个专业投资者必须忍受向下波动的后果。

对于例子中的9万差值，简单来看，可以考虑这个促销活动是否有长期效应，例如大大提高了品牌知名度，只是知名度转化为顾客购买有滞后。如果有长期效应，且后续真的持续带来了大量顾客订单，那么这就是一次临时的向下波动；如果没有长期效应，那么这9万元就是永久性损失了。

上面是一个简化了的分析，实际上站在运营人员、企业老板、投资人的角度。即便活动没有长期效应，不同的人也会因为投入和报酬的方式不同而得出不同的结论。读者可以自己思考一下为什么。

# 风险控制是什么

In order to achieve superior results, an investor must be able – with some regularity – to find asymmetries: instances when the upside potential exceeds the downside risk. That’s what successful investing is all about.

为了能获得过人的回报，投资者必须能常态的找到不对称：向上潜力超过向下的风险。成功的投资不外乎这样。

和投资行业一样，成功的互联网企业想要盈利也应找到“向上潜力超过向下的风险”的情况。那么具体到风控是做什么呢？

Effective risk management requires deep insight and a deft touch. It has to be based on a superior understanding of the probability distributions that will govern future events. Those who would achieve it have to have a good sense for what the crucial moving parts are, what will influence them, what outcomes are possible, and how likely each one is.

高效的风险控制需要深入的洞见和灵敏的感知。这构建在对“未来是一个概率分布”这个观点出众的理解。成为风控专家的人必须能理解哪些是关键组件，知道什么会影响它们，有哪些可能结果，每个结果的概率是多少。

例如很多公司都有建立用户钱包的冲动，这样可以建立资金池，从而进一步获利。

风控专家应该在用户钱包业务上线前了解自己公司的各个业务流程，例如用户体系、充值、消费、退款。应该了解这些流程对钱包的影响，例如撞库、盗绑银行卡、信用卡套现、恶意退单等行为和钱包的关系。最后要清楚这些会导致用户账户损失、支付不合规等结果。当然还应结合主观经验和客观分析得出这些结果的概率。

风控专家也应该在这个业务上线后持续的运营，随着业务的发展进行新的判断。

# 风险控制是谁的责任？

当你找一家企业的员工，无论基层还是老板，无论是金融还是零售，问他们“风险控制在你们的流程中重要吗？”。

你通常都会得到Yes的答复。但是在实际项目中，特别是早期，风控都被人抛之脑后。

The task of managing risk shouldn’t be left to designated risk managers.

风险管理的工作不应被丢弃给专职的风险经理们。

做风控的人可能都有一个感觉：向Passport、支付等部门推广风控是一件相对容易的事，但是向订单、售前等部门推广时就比较难。这主要是各个部门的职责不同导致风险不同，且在事后责任方有区别。

Passport部门有一个天生的职责就是保护用户密码，没做到这一点的passport系统是不完整的，所以passport部门会重视这个问题。

订单团队比较有趣，每家公司不同。我之前在和某公司订单部门初次接触时，对方总是支支吾吾，就是不允许我们在用户下单时对可疑用户进行拦截。

最后订单部门的老板说出了实话：(这家公司)订单部门最重要的KPI是订单量，无论是季度、全年还是大促时，最看重的是下单量。如果我们在下单时拦截，担心会影响到这个KPI的完成。最后我们在下单后和物流部门中间找到了20分钟，插入了一段近实时审单逻辑，对于恶意订单在这个阶段进行砍单。

再来看售前部门，国内某现金贷公司的风控部门很难做，不停抱怨低质贷款申请太多，违约率降不下来。

朋友抱怨道：售前部门的KPI是成单量、每日电话呼出次数等鼓励售前多拉单的KPI，没有一个是关于违约的。最后违约了由风控部门背锅，售前部门无需背责任，自然售前部门就可以忽视风险，尽量找成单难度低的用户，找了一堆自控力薄弱的大学生（国家禁止前）和生活不稳定人群。

由此可以看出：

成为风控专家的人必须能理解哪些是关键组件，知道什么会影响它们，有哪些可能结果，每个结果的概率是多少。并能在各个组件中找到合理的介入点。
在整个公司推广风险控制，除了通过培训、宣传提高大家风险意识这种途径外，也离不开自顶向下合理的目标体系、责任体系的支持。

# 风控是必要的吗

While risk should be dealt with constantly, investors are often tempted to do so only sporadically. Since risk only turns into loss when bad things happen, this can cause investors to apply risk control only when the future seems ominous. At other times they may opt to pile on risk in the expectation that good things lie ahead. But since we can’t predict the future, we never really know when risk control will be needed. Risk control is unnecessary in times when losses don’t occur, but that doesn’t mean it’s wrong to have it. The best analogy is to fire insurance: do you consider it a mistake to have paid the premium in a year in which your house didn’t burn

虽然对抗风险是一个持续的过程，但投资者通常是三天打鱼两天晒网。因为风险只在坏事发生时才会显现出真正的损失，这会导致投资者只在未来悲观时才想起风控。其他时候投资者会相信前景一片光明并忽视风险。但是因为我们不能预测未来，我们永远不知道何时需要风控。风控在损失未发生时是不必要的，但这不意味着进行风险控制是错的。最好的类比是火灾险：即便你的房子没着火，你会认为每年支付火灾险保费是一个错误吗？

Risk control may restrain results during a rebound from crisis conditions or extreme under-valuations, when those who take the most risk generally make the most money. But it will also extend an investment career and increase the likelihood of long-term success. That’s why Oaktree was built on the belief that risk control is “the most important thing.”

也许风控会制约你在危机或极度低估期回弹时的收益，眼看那些承受最大风险的公司这时赚了很多钱。但是风控会延长投资视野并且增长长期成功的可能性。这就是为什么橡树资本是建立在风控是“最重要的事”这个信念之上。

这两句十分朴实，却意义深刻。读者不妨自行参透，并应用到非经融领域中。

参考文献：

《Risk Management: History, Definition and Critique》(Georges Dionne)

《Risk Revisited》(Howard Marks)

致谢：

感谢上海工程技术大学翻译专业的Cecilia对本章内容的帮助。



# 参考资料

https://github.com/WalterInSH/risk-management-note/blob/master/%E4%BB%80%E4%B9%88%E6%98%AF%E9%A3%8E%E9%99%A9.md

* any list
{:toc}
