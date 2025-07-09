---
layout: post
title: 近期计划
date: 2030-08-31 21:01:55 +0800
categories: [Awesome]
tags: [awesome, java, sh]
published: true
---



# 核心

制作一些开箱就可以使用，有价值的系统。

从最上层的业务层，开始到支撑，最后到底层服务。

从下到上建设，从上到下拆解。

达到一个企业完整的服务支撑为止。MVP 可用。

# 设计蓝图

![整体设计](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%B5%8B%E8%AF%95%E5%B9%B3%E5%8F%B0.png)


# 近期准备做的事情

SSO

passport

CMDB 

schedudle

file-system

-------------------------------------


SQL执行引擎

任务调度

文件管理

作业平台

资源可视化

-------------------------------------

完整的报警系统==》全生命周期

完整的日志处理++cmdb+devOps+流水线?

ci/cd 平台

完整的测试平台？

完整的风控系统

完整的工程效能平台 

度量系统 / 工程效能？

完整的数据库平台


## 通道

sms/email/phone/email 通道平台

可以额外接入各种 IM 通知，做一个标准的平台

## IDE 插件化生态

安全

QA

和流程打通

## 常用脚本

shell 

安全

发布等常用的脚本、命令等，沉淀为资产

## 安全

VPN

加密机

堡垒机

# 技术生态

![](https://gitee.com/houbinbin/imgbed/raw/master/img/UMS%EF%BC%88%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%EF%BC%89.png)

# 容器的统一

- [] nginx

- [] tomcat

## NGINX

- [ ] short-URL 服务 

- [ ] keep-alive

- [ ] cache

- [ ] SSL+CORS+访问控制+防止倒链


# 远程调用的统一

HTTP

RPC: dubbo/grpc...

MQ: kafka/amq/rocketMQ/... 

SOAP?

可以统一为唯一的标识+请求体吗？

# 最近计划做的一些事情

- [ ] UMS+passport+SSO 基础的权限管理系统

- [ ] CMDB 对应的资源管理系统

- [ ] 前沿技术周报

- [ ] 编程思想

- [ ] 风控

路由统一前置

限额限次+黑白名单+功能开关+规则引擎+大模型

- [ ] calicte 统一的数据库理念

- [ ] 统一网关

- [ ] NACOS: 注册中心+服务中心

- [ ] 统一的数据 ETL 平台

- [ ] 统一的数据 对比 平台

- [ ] Ollama + AnythingLLM

数据=》向量=》向量数据库=》大模型  

- [ ] NLP 平台：分词+opencc4j+pinyin+...word-checker

- [ ] cache: multi-layer-cache local=>redis=>mysql  一个通用的多层缓存框架 


# 一些别人已经开源的，如何做的更好？

二次开发？拿来主义？


## 限流

[Sentinel](https://sentinelguard.io/zh-cn/docs/introduction.html)



----------------------------------------------------------------------------------------------------------------

# 前端

## 技术栈

naive-ui-admin: naive-ui

element-ui

ant-design

babel

vue3

vite3

pina

vue-router

ts: ES6

mockjs

## 跨平台

uni-app

electron?

# 测试系列

覆盖率

测试用例

压测

造数

MOCK

断言 ASSERT

## 差异

git 比较代码差异+XML差异

AMS+链路，获取场景差异==》覆盖测试

## 依赖关系

dir(project)=>jar=>classess=>methods

可以针对这个，实现每一个项目的依赖 jar。结合流水线使用。

# 日志系列

auto-log: 日志自动生成

日志的脱敏：sensitive

auto-trace: traceId 自动生成。上下级的调用关系？span 放在 trace 中？

auto-collect: 日志的采集

kafka 中转 MQ

logstash4j: 日志的处理

ES: 日志的持久化+检索   NLP/lucene

日志的查看视图？？？？

## 日志的 ETL

参考 logstash4j

## ETL

数据的转换处理

canal

[Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台。](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

datax

seatunnel: source transfer sink

### 常见需求

kafka=>es

mysql/cdc=>mysql/neo4j

http==>td-engine

## 实现一个自己的数据库

分词之后，存储在文件。

然后结合 calcite 进行信息的检索。

## file

HDFS 这种分布式文件

## mq

rocket-mq

amq

kafka

自己实现 mq

## 关系

应用内：ASM

应用间：span

jvm-sandbox

获取到链路关系 + 场景管理

## 场景的管理

场景配置之后，实时链路定时加载，然后匹配处理。

## 脱敏等的闭环处理

宣导规避

发现存在的问题？

治理+改造解决

测试+验证

最终的检验+持续迭代==》形成闭环

# 监控报警系列

日志异常？

资源不足预警

监控报警平台

## 采集

普米

graphna

loki


## 累计

指标+规则

触发阈值===》采取对应的 action

## 规则 jar

统一的规则 jar 包

## 报警

monitor

cat

alarm

mertric

## 静默升级策略

如何管理？

如何推动？

如何评估结果？

# 参考资料

https://github.com/jobbole/awesome-java-cn

* any list
{:toc}