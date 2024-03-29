---
layout: post
title: 数据分析-01-概览入门
date: 2021-10-12 21:01:55 +0800
categories: [Data]
tags: [data, data-analysis, tool, skill, sh]
published: true
---

# 数据分析

有时候，对于我们的决定只要有一点点的数据支持就够了。一点点的变化，可能就决定了我们产品的好坏。我们可能会因此而作出一些些改变，这些改变可能会让我们打败巨头。

这一点和 Growth 的构建过程也很相像，在最开始的时候我只是想制定一个成长路线。而后，我发现这好像是一个不错的 idea，我就开始去构建这个 idea。于是它变成了 Growth，这时候我需要依靠什么去分析用户喜欢的功能呢？我没有那么多的精力去和那么多的人沟通，也不能去和那么多的人沟通。

我只能借助 Google Analytics 来收集用户的数据。从这些数据里去学习一些东西，而这些就会变成一个新的想法。新的想法在适当的时候就会变成一个产品，接着我们就开始收集用户数据，然后循环。

# 构建-衡量-学习

构建-衡量-学习是在《精益创业》中的一个核心概念，这结合了客户开发、敏捷软件开发方法和精益生产实践。

它们是非常重要的一个循环：

![growth](https://growth.phodal.com/assets/article/chapter5/lean-analytics.png)

这一过程不仅可以改进我们的产品，也可以用于初创企业。

它并不是独立的一个环节，实现上它应该是一整个环节：我们根据我们的想法去创建产品，在使用产品的过程中收集一些数据，再依据这些数据来改进我们的产品。

# 想法-构建

想法实际上便是解决一个痛点的解决方案。如果你和我一样也经常记录自己的想法，就会发现每个月里，你总会跳出一个又一个的想法。

正如，我在那篇《如何去管理你的 Idea》中说的一样：

我们经常说的是我们缺少一个 Idea。

过去我也一直觉得我缺少一些 Idea，今天发现并非如此，我们只是缺少记录的手段。

我们并不缺少 Idea，只是一直没有去记录。随着时间的增长，我发现我的 GitHub 上的 Idea 墙(ideas)一直在不断地增加。以至于，我有一个新的 Idea 就是整理这个 Idea 墙。

而作为一个程序员，我们本身就可以具备构建一个系统的能力，只是对于大多数人来说需要多加的练习。

有意思的一点是，这里的构建系统与一般的构建系统有一点不太一样，我们需要快速地构建出一个 MVP 产品。

MVP 简单地来说，就是最小可用的产品。如下图的右边所示：

![mvp](https://growth.phodal.com/assets/article/chapter5/mvp.png)

在每一层级上都实现一定的功能，使得这个系统可用，而非构建一个非常完整的系统。

随后，我们就可以寻找一些种子用户来改进我们的产品。

# 产品-衡量

按照上面的步骤，到了这里应该就是客户开发。

而如《精益客开发》一书所说，客户开发可以分成五个步骤：

- 形成假设。即我们觉得用

- 找到可以交谈的潜在客户

- 提出恰当的问题

- 从答案中找到有用的信息

- 弄明白现阶段需要构建什么样的产品来保持下一个学习循环

在整个过程中，我们其实就是在了解我们的客户是谁，以及他们的需求。

并且在这个过程中，我们可以为开发确认出清晰的假设，一点点地打造出用户喜爱的产品。

# 数据-学习

当我们收集到一定的用户数据，如网站、应用的数据，就可以开始分析数据。

如《精益创业》所说，在分析数据之前，我们需要确定我们的增长模型，即：

黏着式增长引擎——其重点是让用户成为回头客，即让客户持续使用我们的产品。这就意味着，我们在分析数据和学习的过程中，要侧重于关注流失率和使用频率。

病毒式增长引擎——其只做一件事：让名声传播出去。即通过用户间的不断传播来扩散产品，我们需要考虑所谓的病毒式传播系数，还有用户之间的特定行为。

付费式增长引擎——赚钱与否是识别商业模式是否可持续的指标。

针对不同的增长引擎有不同的学习过程，如媒体网站，我们通过不同的方式来导入流量，这些流量最终会有一些会转化成价值。

这些价值会以不同的形式出现，如订阅率、在线参与度、广告营收等等。

而从这些数据中学习就需要一些特殊的技巧，详情请见下面的参考书籍。

参考书籍：

《精益数据分析》

《精益客户开发》

《精益创业》

# 数据分析

数据分析是一个很有意思的过程，我们可以简单地将这个过程分成四个步骤：

- 识别需求

- 收集数据

- 分析数据

- 展示数据

值得注意的是：在分析数据的过程中，需要不同的人员来参与，需要跨域多个领域的知识点——分析、设计、开发、商业和研究等领域。

因此，在这样的领域里，回归敏捷也是一种不错的选择（源于：《敏捷数据科学》）：

- 通才高于专长

- 小团队高于大团队

- 使用高阶工具和平台：云计算、分布式系统、PaaS

- 持续、迭代地分享工作成果，即使这些工作未完成

# 识别需求

在我们开始分析数据之前，我们需要明确一下，我们的问题是什么？即，我们到底要干嘛，我们想要的内容是什么。

识别信息需求是确保数据分析过程有效性的首要条件，可以为收集数据、分析数据提供清晰的目标。

当我们想要提到我们的网站在不同地区的速度时，就需要去探索我们的用户主要是在哪些地区。

即，现在这是我们的需求。

我们已经有了这样的一个明确的目标，下面要做起来就很轻松了。

# 收集数据

那么现在新的问题来了，我们的数据要从哪里来？

对于大部分的网站来说，都会有访问日志。但是这些访问日志只能显示某个 IP 进入了某个页面，并不能详细地介绍这个用户在这个页面待了多久，做了什么事。

这时候，就需要依赖于类似 Google Analytics 这样的工具来统计网站的流量。

还有类似于New Relic这样的工具来统计用户的一些行为。

在一些以科学研究为目的的数据收集中，我们可以从一些公开的数据中获取这些资料。

而在一些特殊的情况里，我们就需要通过爬虫来完成这样的工作。

# 分析数据

现在，我们终于可以真正的去分析数据了——我的意思是，我们要开始写代码了。从海量的数据中过滤出我们想要的数据，并通过算法来对其进行分析。

一般来说，我们都利用现有的工具来完成大部分的工作。要使用哪一类工具，取决于我们要分析的数据的数量级了。如果只是一般的数量级，我们可以考虑用 R 语言、Python、Octave 等单机工具来完成。如果是大量的数据，那么我们就需要考虑用 Hadoop、Spark 来完成这个级别的工作。

而一般来说，这个过程可能是要经过一系列的工具才能完成。如在之前我在分析我的博客的日志时(1G左右)，我用 Hadoop + Apache Pig + Jython 来将日志中的 IP 转换为 GEO 信息，再将 GEO 信息存储到 ElasticSearch 中。

随后，我们就可以用 AMap、leaflet 这一类 GEO 库将这些点放置到地图上。

# 展示数据

现在，终于来到我最喜欢的环节了，也是最有意思，但是却又最难的环节。

我们过滤数据，得到想要的内容后，就要去考虑如何可视化这些数据。

在我熟悉的 Web GIS领域里，我可以可视化出我过滤后的那些数据。但是对于我不熟悉的领域，要可视化这些数据不是一件容易的事。在少数情况下，可以使用现有的工具完成需求，多数情况下，我们也需要写相当的代码才能将数据最后可视化出来。

而在以什么形式来展示我们的数据时，又是一个问题。如一般的数据结果，到底是使用柱形图、条形图、折线图还是面积图？这要求我们有一些 UX 方面的经验。

参考来源: 精益数据分析。

# 用户数据分析：Google Analytics

Google Analytics 是一个非常赞的分析工具，它不仅可以用于 Web 应用，也可以用于移动应用。

## 受众群体

如下图是 Growth 应用最近两星期的数据：

![受众群体](https://growth.phodal.com/assets/article/chapter5/growth-ga.png)

这是 Google Analytics 中的“受众群体”的概览，在这个视图中：

折线图就是每天的用户数。

下面会有用户数、会话、屏幕浏览量等等的一些信息。

右角的饼图则是回访问用户和新用户的对比。

最下方便是受众的信息——国家、版本等等。

从图中，我们可以读取一些重要的信息，如用户的停留时间、主要面向的用户等等。

在浏览器版本会有：

1. 浏览器与操作系统

2. 移动设备

## 流量获取

除此，不得不说的一点就是流量获取，如下图所示是我博客的热门渠道：

![流量获取](https://growth.phodal.com/assets/article/chapter5/phodal-traffic.png)

可以直接得到一个不错的结论是我的博客的主要流量来源是搜索引擎，再细细一看数据：

主要流量来源就是 Baidu 和 Google，看来国人还是用百度比较多。那我们就可以针对 SEO 进行更多的优化：

- 加快访问速度

- 更表意的 URL

- 更好的标题

- 更好的内容

等等等。

除此，我们可以分析用户的行为，如他们访问的主要网站、URL 等等。

## 移动应用

除此，我们还可以使用它来分析移动应用，不过这受限于 Google 在国内的访问程度。

# 参考资料

https://growth.phodal.com/#%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90

* any list
{:toc}