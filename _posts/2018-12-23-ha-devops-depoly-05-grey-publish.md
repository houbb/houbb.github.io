---
layout: post
title: 高可用之应用发布？05-如何实现灰度发布
date: 2018-12-24 19:39:35 +0800
categories: [Devops]
tags: [devops, sh]
published: true
---

# 灰度发布

我理解的灰度发布，主要是按照一定策略选取部分用户，让他们先行体验新版本的应用，通过收集这部分用户对新版本应用的反馈（如：微博、微信公众号留言或者产品数据指标统计、用户行为的数据埋点）以及对新版本功能、性能、稳定性等指标进行评论，进而决定继续放大新版本投放范围直至全量升级或回滚至老版本。

## 1、什么是灰度发布

灰度发布（又名金丝雀发布）是指在黑与白之间，能够平滑过渡的一种发布方式。

在其上可以进行A/B testing，即让一部分用户继续用产品特性A，一部分用户开始用产品特性B，如果用户对B没有什么反对意见，那么逐步扩大范围，把所有用户都迁移到B上面来。灰度发布可以保证整体系统的稳定，在初始灰度的时候就可以发现、调整问题，以保证其影响度。灰度期：灰度发布开始到结束期间的这一段时间，称为灰度期。（来源于百度百科）

## 2、好处：

- 提前获得目标用户的使用反馈；

- 根据反馈结果，做到查漏补缺；

- 发现重大问题，可回滚“旧版本”；

- 补充完善产品不足；

- 快速验证产品的 idea。

如果产品有问题，影响面可以很小。

## 灰度发布的流程

![灰度发布的流程](https://img-blog.csdn.net/20180602204911476)

相关解释：

选定策略：包括用户规模、发布频率、功能覆盖度、回滚策略、运营策略、新旧系统部署策略等
筛选用户：包括用户特征、用户数量、用户常用功能、用户范围等
部署系统：部署新系统、部署用户行为分析系统（web analytics）、设定分流规则、运营数据分析、分流规则微调
发布总结：用户行为分析报告、用户问卷调查、社会化媒体意见收集、形成产品功能改进列表
【某宝的案例.来源网络】

产品需求收集和确定 –>； 技术方案出具和分工协调 –>； 开发编码 –>； 内部服务器环境的测试 –>； 联调（又名预发环境） –>； 小淘宝环境发布，内部员工喷喷喷 –>； 小流量（具体有多少取决于业务影响面）公网测试 –>； 收集数据写反馈 –>； 全量上线。

## 灰度发布的方式方法有哪些？

产品Q群、产品微信群、内部用户、app自升级、换量渠道、不会被抓包的小市场，在这些渠道将灰度包放还出去。这里边可控度最强的当属app自升级了。根据时间段，用户版本，升级请求数量，实际升级数等等

## 灰度发布三大类型？

web页面灰度：按照ip或者用户id切流啊。具有随机性，可以控制比例
服务端灰度：考验主系分能力了，可以做逻辑切换开关，按照义务相关属性逐渐切流
客户端灰度：一般按照用户逐渐推送包，主要是PC端(WIN，MAC)、移动端（安卓，OS）内部大规模内测

# 云上云下

云上和云下即使走网络专线，也有一定的延迟。

比如 10ms, 来回就是 20ms。

在 TPS 要求特别高的情况下，就不能忽略。


# 最难的还是全链路灰度

从调用入口开始：

网关==》http===>rpc/mq

需要有一个 traceId 或者类似的标识，通过一个标识，比如用户让信息从头到尾的灰度。

所谓的灰度，就是让这个固定用户（其他过滤条件）流量，到指定的灰度验证机器上。

# 拓展阅读

[单元化]()

[微服务]()



# 参考资料

[灰度发布系统的实现](https://blog.csdn.net/jiangeeq/article/details/80534961)

[蓝绿发布、滚动发布、灰度发布等部署方案对比与总结 ](http://blog.sina.com.cn/s/blog_941cfba00102xvlh.html)

[灰度发布：灰度很简单，发布很复杂](https://blog.csdn.net/justdo2008/article/details/80551247)

* any list
{:toc}