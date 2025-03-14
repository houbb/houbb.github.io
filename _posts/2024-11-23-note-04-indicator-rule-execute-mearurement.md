---
layout: post
title: 监控报警系统的指标、规则与执行闭环
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, sh]
published: true
---


# 有所依

我们如何知道系统交易是否安全（风控）？应用的质量如何？版本迭代的周期如何（度量）？服务的运行是否健康（报警）？

就如同在没有红绿灯的时代，我们希望提升一下交通的效率。

首先呢，我们需要一个类似于【红绿灯】的服务，来制定交通的【规则】

风控、度量、报警这3个系统处理流程是类似的：

![流程](https://gitee.com/houbinbin/imgbed/raw/master/img/%E8%A7%84%E5%88%99.drawio.png)

当然，单把报警系统拿出来，也做了一起其他的事情：

![报警系统](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%8A%A5%E8%AD%A6%E7%B3%BB%E7%BB%9F.drawio.png)

当然，我们可能还要做其他事情，比如老系统的数据同步迁移。

假设我们排除万难，建好了我们的【红绿灯】服务，一切就结束了吗？

以前的我，一直认为到这里就结束了，我们的监控服务已经创建完成。不是吗？

其实，还远远不够。

# 执必严

路上安装了红绿灯，并不能保证交通效率的提升，

1）交通规则是什么，需要宣导推广

2）大家有没有遵守交通规则呢？需要反馈处理

针对反馈处理，我们的系统需要进一步扩展：

![反馈](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%8A%A5%E8%AD%A6%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%8F%8D%E9%A6%88.drawio.png)

有了这些反馈，我们的系统才能持续改进。

那么，到这里就结束了吗？

# 违必究

中国的历史发展中，诸子百家，每一家都有自己都有自己的理念。

比如，以孟子为代表的【儒家】，主张人性本善，以德服人。

![以德服人](https://gitee.com/houbinbin/imgbed/raw/master/img/bee4b9cf4186d0b72415d1a8977d4086.jpeg)

以韩非子为代表的【法家】，主张人性趋利避害，治理国家必须依靠法律的威慑力，而非道德约束。

当然，社会是复杂的，一般主张先礼后兵。

所以交易有监管部门。系统也需要有相关的度量标准，避免整个系统腐烂。

虽然熵增在独立的系统内是必然的，但是我们改进一寸自该有一寸的欢喜。

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