---
layout: post
title: DevOps pipeline 一个包含了 devops 全流程的流水线应该是什么样的？
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, pipeline, devops, sh]
published: true
---

# 前言

大家好，我是老马。


# 流程管理

信息流

审批流

# 流程


## ascii

```
+------------------+     +------------------+     +------------------+
|   规划阶段        |     |   开发阶段        |     |   CI/CD流水线     |
+------------------+     +------------------+     +------------------+
| [需求分析]        | ==> | [代码编写]        | ==> | [持续集成]        |
|                  |     | (Git/GitHub)     |     | (Jenkins)        |
| [技术选型]        | ==> | [单元测试]        | ==> | [自动化构建]      |
|                  |     | (JUnit)          |     | (Maven)          |
| [测试策略]        | ==> | [代码审查]        | ==> | [自动化测试]      |
|                  |     | (GitLab)         |     | (Selenium)       |
| [资源规划]        | ==> +------------------+ ==> | [容器化部署]      |
+------------------+           ||                | (Docker)          |
           ||                  \/                | [持续部署]        |
           ||          +------------------+     | (Kubernetes)      |
           ||          |  监控运维         |     +------------------+
           ||          +------------------+             ||
           ||          | [性能监控]        | <===========//
           ||          | (Prometheus)     |             ||
           ||          | [日志分析]        |             ||
           ||          | (ELK)            |             ||
           ||          | [安全审计]        |             \/
           ||          | (SonarQube)      |     +------------------+
           ||          +------------------+     |  反馈优化         |
           ||                  /\               +------------------+
           ||                  ||               | [用户反馈]        |
           \/==================||============== | [数据分析]        |
                                ||               | [流程改进]        |
                                \/               +------------------+
```

## 线性

```
调研=====》需求===》设计====》研发===》测试====》部署====》运维===》监控
```

## 调研

## 需求

需求文档

版本、文件

## 设计

文档

UI

交互

## 研发

编码

文档

接口

自测

## 测试

功能

性能

兼容性

## 部署

SQL 

配置

编码

cmdb、ops 等系统联动

## 监控

物理：cpu/disk/mem/   zabbix/普米

应用：日志 / GC / CAT

业务：SQL 

性能：慢日志 / 慢SQL





# chat

## Devops

以下是一个基于Mermaid.js库实现的DevOps全流程HTML流程图，整合了规划、开发、持续集成/交付、监控与反馈等核心阶段，并标注了各环节的关键工具链：

```html
<!DOCTYPE html>
<html>
<head>
    <title>DevOps全流程图表</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.0.2/dist/mermaid.min.js"></script>
    <style>
        .mermaid {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
        .node rect {
            fill: #e6f7ff;
            stroke: #1890ff;
        }
        .cluster rect {
            fill: #f6ffed;
            stroke: #52c41a;
        }
    </style>
</head>
<body>
    <div class="mermaid">
        flowchart TD
        subgraph 规划阶段
            A[["需求分析"]] --> B[["技术选型"]]
            B --> C[["制定测试策略"]]
            C --> D[["资源规划"]]
        end

        subgraph 开发阶段
            E[["代码编写<br>(Git/GitHub)"]]
            F[["单元测试<br>(JUnit)"]]
            G[["代码审查<br>(GitLab)"]]
            E --> F --> G
        end

        subgraph CI/CD
            H[["持续集成<br>(Jenkins)"]]
            I[["自动化构建<br>(Maven)"]]
            J[["自动化测试<br>(Selenium)"]]
            K[["容器化部署<br>(Docker)"]]
            L[["持续部署<br>(Kubernetes)"]]
            H --> I --> J --> K --> L
        end

        subgraph 监控运维
            M[["性能监控<br>(Prometheus)"]]
            N[["日志分析<br>(ELK)"]]
            O[["安全审计<br>(SonarQube)"]]
            M --> N --> O
        end

        subgraph 反馈优化
            P[["用户反馈"]]
            Q[["数据分析"]]
            R[["流程改进"]]
            P --> Q --> R
        end

        规划阶段 --> 开发阶段
        开发阶段 --> CI/CD
        CI/CD --> 监控运维
        监控运维 --> 反馈优化
        反馈优化 --> 规划阶段

        classDef phase fill:#fff,stroke:#333,stroke-width:2px
        classDef tool fill:#e6f3ff,stroke:#4a90e2,stroke-width:1.5px
        class 规划阶段,开发阶段,CI/CD,监控运维,反馈优化 phase
        class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R tool
    </div>
</body>
</html>
```


### 流程图结构说明（引用资料依据）：
1. **规划阶段**：包含需求分析、技术选型、测试策略制定和资源规划，构成项目基础框架 
2. **开发阶段**：
   - 代码版本控制使用Git/GitHub 
   - 单元测试工具JUnit 
   - 代码审查通过GitLab实现 
![](https://metaso-static.oss-cn-beijing.aliyuncs.com/metaso/pdf2texts/figures/019d6154-d142-4464-bbfe-85e2c8261196/2_8.jpg)
3. **CI/CD流水线**：
   - Jenkins作为持续集成核心 
   - Maven进行依赖管理和构建 
   - Selenium执行自动化测试 
   - Docker容器化和Kubernetes编排部署 
4. **监控运维**：
   - Prometheus监控系统性能 
   - ELK(Elasticsearch, Logstash, Kibana)处理日志 
   - SonarQube进行代码质量审计 
5. **反馈优化**：
   - 收集用户反馈并分析数据 
   - 形成闭环持续改进流程 

### 关键设计要素：
1. **阶段划分**：采用5个逻辑分组对应DevOps核心阶段，符合"规划→开发→交付→监控→反馈"的无限循环模型 
2. **工具标注**：每个节点标注典型工具，展示完整工具链集成 
3. **视觉层次**：
   - 主阶段使用浅色背景框划分 
   - 工具节点采用蓝绿色系区分功能类型 
4. **流程闭环**：通过反馈优化到规划阶段的连接箭头，体现持续改进理念 
5. **响应式支持**：Mermaid.js自动适配容器尺寸，支持移动端查看 

该流程图可通过任何现代浏览器查看，完整呈现DevOps生命周期中的工具集成与阶段衔接关系。

用户可根据实际技术栈调整工具标注，但核心流程结构保持跨组织的通用性。








# 小结



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