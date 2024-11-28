---
layout: post
title: autoLog-08-日志的全生命周期管理 全生命周期，一站式管理平台？
date:  2023-08-06 +0800
categories: [Trace]
tags: [spring, aop, cglib, log, paper, sh]
published: true
---

# 拓展阅读

[java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[java 注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

![chain](https://img-blog.csdnimg.cn/03cca9b818374ee587465b7aff2a1e1d.jpeg#pic_center)

# 业务背景

我们如果想创建一个使用的日志工具，那么完整的声明周期是什么样的呢？


#  一些问题

日志是什么？

为什么需要日志？

日志的最佳实践？

日志标准化的最佳实践

日志的自动化解析/处理？

日志的解析工具？


# 日志的生成 sdk

自动生成

标准的切面日志

统一：integration

## 业务日志

日志的目的是什么？

记录什么时间，谁对应什么资源，做了什么事情，状态从==》到==》

```
# 事件的处理流转
tid
status
user_id
time
content
```

日志的输出，要考虑方便统一解析？

## 标准化

如何方便人的阅读

如何方便机器的解析处理？

## 安全

日志的脱敏处理

安全+审计

## trace

auto-trace 标准化日志

trace-可以参考 skywalking 这种

open-tracing  开源标准

tid---唯一标识

## agent

client 客户端存在一些问题：

升级会特别麻烦，如果公司很大，推动升级就会变得非常痛苦。

需要接入修改，需要排期改造，往往会遥遥无期。

agent 不失为一种可行的方案，但是要注意灰度推广，注意风险。

## 日志的可视化 visual

ELK

Loki

产生=》收集=》处理=》归档

## 日志的指标处理

日志指标==》报警

监控==》作业

事件

## 日志的归档

定期归档，归档到哪里？

压缩+解压

磁带？网盘？





# 开源地址

为了便于大家学习，项目已开源。

> Github: [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

> Gitee: [https://gitee.com/houbinbin/auto-log](https://gitee.com/houbinbin/auto-log)

# 小结

不要想着一个工具解决所有的问题，要学会多维度、多视角的解决问题。

我是老马，期待与你的下次重逢。

# 参考资料


* any list
{:toc}