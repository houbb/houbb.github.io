---
layout: post
title: java 老矣，尚能饭否？
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, sh]
published: true
---

# 随笔

[从千万粉丝“何同学”抄袭开源项目说起，为何纯技术死路一条？](https://houbb.github.io/2024/11/22/note-02-he-tech)

[数据源的统一与拆分](https://houbb.github.io/2024/11/22/note-03-split-apache-calcite)

[监控报警系统的指标、规则与执行闭环](https://houbb.github.io/2024/11/22/note-04-indicator-rule-execute-mearurement)

[java 老矣，尚能饭否？](https://houbb.github.io/2024/11/22/note-05-is-java-so-old)

[一骑红尘妃子笑，无人知是荔枝来!](https://houbb.github.io/2024/11/22/note-06-lizhi)

# java 老吗？

去年看了一本书，周志华的《凤凰架构》

```
架构演变最重要的驱动力，或者说这种“从大到小”趋势的最根本的驱动力，始终都是为了方便某个服务能够顺利地“死去”与“重生”而设计的，个体服务的生死更迭，是关系到整个系统能否可靠续存的关键因素。
```

我们无法一步到位设计一个最优秀的架构，适合当前的业务，解决具体的问题、持续演进，才是最好的架构。

就像生物一样，不断适应环境的演化存活下来，才是最成功的。

# 成也萧何败萧何

工作中基础过一些语言，比如 java / c# / js / go / python

那么，java 到底老不老呢？

冗长的语法，令人备受诟病。于是 jdk 奋发图强，半年一个版本，大部分开发者直接学不动...

java 的口号是【Write Once，Run Anywhere】

jvm 在设计之初，为了解决跨平台+内存分配问题+性能监控分析优化，功能不可谓不强大；反射作为元数据处理的有力辅助，动态灵活，底层组件爱不释手。

但是这 2 样最引以为傲的东西，在云时代的近代，恰恰成为了 java 最大的阻碍。

jvm 导致启动时占用较多的内存，所以类似于日志采集的 agent 就优先考虑 go 之类的轻量实现；动态反射导致 naive-image 的编译困难。

2018 年 4 月，Oracle Labs 新公开了一项黑科技：Graal VM，口号是【Run Programs Faster Anywhere】

这是一个在 HotSpot 虚拟机基础上增强而成的跨语言全栈虚拟机，可以作为“任何语言”的运行平台使用。

![Graal VM](https://icyfenix.cn/assets/img/grallvm.d917d5ba.png)

java 30 年沉浮，尚且脱骨向前，何况你我呢？

## 自己

不同的理念，造就了后续完全不同的路径。

刚毕业的时候，我是前后端都做的，后来发现前端需求改的过于频繁，且【每个人都自己的审美】。

于是，后续的几年的都偏向于后端，也就是逻辑与流程。

不过现在，对于产品的认知也在变化。前后端只是分工不同，对于使用者而言，**完整的产品才有意义**。

我可以不懂前端开发，但是我必须懂得用户的交互、设计、美学，而这恰恰是我非常欠缺的地方。

**技术只是手段，用完整的服务解决用户的问题才是目的**。

生物的进化是具有趋同性的，优秀的设计与理念值得共同学习。

愿大家找到属于自己的演化架构，大道千万条，不同的路上有不同的景色；条条大路通罗马，愿我们终将抵达属于自己的最初的目标！

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 随笔

[从千万粉丝“何同学”抄袭开源项目说起，为何纯技术死路一条？](https://houbb.github.io/2024/11/22/note-02-he-tech)

[数据源的统一与拆分](https://houbb.github.io/2024/11/22/note-03-split-apache-calcite)

[监控报警系统的指标、规则与执行闭环](https://houbb.github.io/2024/11/22/note-04-indicator-rule-execute-mearurement)

[我们的系统应该配置哪些监控报警项？](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items)

[监控报警系统如何实现自监控?](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items-self-monitor)

[java 老矣，尚能饭否？](https://houbb.github.io/2024/11/22/note-05-is-java-so-old)

[一骑红尘妃子笑，无人知是荔枝来!](https://houbb.github.io/2024/11/22/note-06-lizhi)

[张居正的考成法，对我们有何参考价值？](https://houbb.github.io/2024/11/22/note-07-zhangjuzheng-kaochengfa)

[mongodb/redis/neo4j 如何自己打造一个 web 数据库可视化客户端？](https://houbb.github.io/2024/11/22/note-08-visual)

[DevOps 平台越发展，开发运维越快失业？](https://houbb.github.io/2024/11/22/note-09-devops-how-to-go)

[开源如何健康长久的发展](https://houbb.github.io/2024/11/22/note-10-opensource-way)

[为什么会有流水线？](https://houbb.github.io/2024/11/22/note-11-pipeline)

[既然选择了远方 便只顾风雨兼程](https://houbb.github.io/2024/11/22/note-12-positive-negative)

[银行是如何挣钱的？](https://houbb.github.io/2024/11/22/note-13-bank-profit)

# 参考资料

* any list
{:toc}