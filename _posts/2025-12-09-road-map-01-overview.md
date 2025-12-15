---
layout: post
title: 近期计划
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
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

D:\github\blog-plateform-design\src\posts

[x] 日志处理 log 平台

[x] 测试平台

[x] SSO+passport 用户+权限

[x] CMDB + 资源可视化

[x] schedudle 分布式调度

[x] file-system 分布式文件管理

[x] 作业平台： shell / sql /http 等，ssh 机器执行。

[x] 与监控系统（Zabbix/Prometheus）集成：故障自愈、触发执行作业 全生命周期

[x] 与CI/CD流水线（Jenkins/GitLab）集成：作为发布流程中的一个步骤

[x] 与ITSM流程集成：工单驱动作业执行

[x] bpm 流程审批

[x] 工程效能平台 代码质量 sonar、类冲突、覆盖率、代码红线、安全性、day0 etc...

[x] 度量平台(万物都是指标，一切都能度量。度量绩效、工程的效率、每个版本的各个指标等等)

[x] 通知通道平台 sms/email/phone/email 通道平台。可以额外接入各种 IM 通知，做一个标准的平台

[x] 完整的数据库平台 面向 DBA+研发

[x] 风控系统

[x] 分布式限流平台

[x] 安全平台 （加密机等服务）

# 其他重要的平台

除了上述的，对于互联网技术公司内部平台而言还有哪些比较重要的平台？

除了上述平台，还有一些同样至关重要的平台，它们更侧重于业务支撑、用户体验、资源效率和创新效率。

以下是重要的补充：

### 一、业务支撑与用户体验类

这类平台直接赋能业务团队，提升用户获取和留存效率。

1.  客户数据平台 (CDP - Customer Data Platform)
    *   核心价值：统一整合来自不同渠道（App、Web、小程序、线下）的用户行为数据和属性数据，形成统一的用户画像（OneID）。
    *   关键能力：用户行为轨迹分析、用户分群、标签体系管理、实时数据更新。
    *   为什么重要：是精准营销、个性化推荐、用户体验优化的核心数据底座。没有CDP，营销和运营就像“盲人摸象”。

2.  营销自动化平台 (MAP - Marketing Automation Platform)
    *   核心价值：基于CDP的用户分群，自动化地执行跨渠道的营销活动（如邮件、短信、Push、广告再投放）。
    *   关键能力：可视化旅程设计器（Customer Journey）、A/B测试、营销效果归因分析。
    *   为什么重要：大幅提升营销效率，实现“千人千面”的自动化运营，促进用户增长和转化。

3.  用户交互与触达平台 (CEP - Customer Engagement Platform)
    *   核心价值：管理和优化所有与用户直接交互的渠道。
    *   关键能力：
        *   推送平台：管理App Push、站内信等。
        *   客服系统：在线客服、机器人、工单系统（这部分常与ITSM有重叠但侧重外部用户）。
        *   短信/邮件通道（您已提及的通知平台是其底层支撑）。
    *   为什么重要：是所有用户沟通的生命线，直接影响用户体验和满意度。

4.  A/B 实验与灰度发布平台 (Experimentation Platform)
    *   核心价值：用数据驱动决策，科学地验证每一个产品改动、算法策略和UI设计对业务指标的影响。
    *   关键能力：流量分割、实验参数配置、数据分析与显著性检验、多层实验正交管理。
    *   为什么重要：避免了“拍脑袋”做决策，是产品迭代和算法优化的核心工具，文化上倡导“用数据说话”。

---

### 二、资源效率与成本优化类

这类平台帮助公司在快速发展中控制云资源成本，实现精细化管理。

1.  云资源管理与成本优化平台 (FinOps Platform)
    *   核心价值：实现云资源的透明化、可观测、可优化和可预测。让技术成本成为一项可控的经营指标。
    *   关键能力：
        *   资源目录：自动发现并纳管所有云上资源（EC2、RDS、S3等）。
        *   成本分账：将云账单按部门、项目、产品线进行拆分和展示。
        *   优化建议：自动识别闲置、未充分利用的资源，提供优化建议（如 rightsizing，购买预留实例）。
        *   预算与预警：设置预算并预警超支风险。
    *   为什么重要：对于上云的公司，云成本是最大支出之一。缺乏管理会导致巨额浪费。

2.  统一资源调度平台 (Beyond Kubernetes)
    *   核心价值：在K8s之上，实现混合云（多云）、批量计算、AI训练任务等异构工作负载的统一调度和资源池化。
    *   关键能力：支持YARN、K8s、Slurm等多种调度器；队列管理；优先级调度；资源配额管理。
    *   为什么重要：最大化集群资源利用率，为AI、大数据等计算密集型任务提供稳定高效的底层支撑。

---

### 三、创新与研发效率类

这类平台进一步降低创新门槛，提升整体协作和交付效率。

1.  低代码/无代码平台 (LCAP/No-Code Platform)
    *   核心价值：让产品、运营、业务等非技术人员也能通过拖拽方式快速构建应用（如后台、报表、审批流），解放开发者生产力。
    *   关键能力：可视化表单/流程设计器、数据模型管理、连接器（与后端API、数据库连接）。
    *   为什么重要：应对长尾、多变的企业内部应用需求，极大提升企业整体数字化效率。

2.  内部知识库与协作平台 (Internal Wiki & Collaboration)
    *   核心价值：沉淀组织知识，减少重复沟通，加速新人成长。是公司文化的载体。
    *   关键能力：易于编辑和搜索、权限管理、与代码库、工单系统等集成。
    *   为什么重要：技术文档、项目复盘、决策记录、团队规范都沉淀于此，是组织避免“失忆”的关键。

3.  开发者门户 (Developer Portal) / 内部开发者平台 (IDP)
    *   核心价值：为内部开发者提供一站式服务窗口，是“平台之平台”。
    *   关键能力：
        *   服务目录：检索和申请所有内部平台和中间件服务（如申请一个MQ主题、一个Redis实例）。
        *   自助服务：一键获取开发环境、资源。
        *   工具链集成：集中展示CI/CD状态、文档、监控链接等。
    *   为什么重要：极大提升开发者体验和效率，是平台工程（Platform Engineering）理念的最终体现。

### 总结

您可以将其视为一个完整的互联网公司技术平台生态图谱：

| 类别 | 核心平台 | 目标 |
| :--- | :--- | :--- |
| 研发与交付 | CI/CD, 代码平台, 测试平台, BPM | 高效、高质量地交付软件 |
| 运维与稳定性 | 监控报警, CMDB, 作业平台, 调度平台, 限流平台 | 保障系统稳定、可靠、高效运行 |
| 数据与智能 | 数据平台, 数仓, 分布式文件平台, 风控平台, CDP | 挖掘数据价值，驱动业务增长和风险控制 |
| 安全与合规 | 安全平台, 用户权限, 加密证书, 审计日志 | 保障数据、应用和基础设施安全 |
| 资源与成本 | 云管平台 (FinOps), 资源调度平台 | 实现资源高效利用和成本优化 |
| 业务与增长 | 营销平台, A/B实验平台, 用户触达平台 | 直接赋能业务，实现用户增长和转化 |
| 组织与效率 | 低代码平台, 知识库, 开发者门户 | 提升组织协作效率，降低创新门槛 |






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

# ALL-STACK

![stack](https://houbb.github.io/static/img/2025-08-16-all-stack-road-map.jpg)

# 参考资料

https://github.com/jobbole/awesome-java-cn

* any list
{:toc}