---
layout: post
title: 统一的事件管理平台-00-overview
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [basic, user, ums, priviliage, sh]
published: true
---

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)


# 为什么从 ums 开始？

人，作为万物的尺度。

人的关系，作为公司的基石。

## 拓展系统

sso 统一登录

passport 统一权限

ums 统一用户

cmdb 统一资源

事件平台

审批流：便于留痕+追溯==》标准化

度量

# chat

## 事件管理平台

在技术公司内部，统一的事件管理平台通常用于集中管理和处理系统中的各类事件，包括异常、警报、任务状态、用户操作等。

这样的平台通常需要具备以下特点和功能：

### 1. 事件采集与集成
   - 多渠道支持：平台应支持从不同系统和应用收集事件，包括但不限于日志系统、监控系统、API、数据库触发器、用户行为数据等。
   - 支持多种协议和标准：例如，Webhooks、Kafka、RabbitMQ、HTTP、Syslog 等，以适应不同的集成需求。
   
### 2. 事件处理与路由
   - 事件分类与优先级：平台应能根据事件的类型、严重性和优先级来分类事件。比如，系统错误和用户请求的事件可能需要不同的处理方式。
   - 自动化规则引擎：通过配置规则来自动触发处理流程，例如，某些特定事件可能会触发通知、创建工单、执行修复操作等。
   - 事件路由：根据不同的事件类型或内容，将事件路由到合适的处理人员或系统，例如，技术支持团队、运维团队等。

### 3. 实时监控与告警
   - 实时事件流：提供实时的事件流处理能力，快速响应突发事件，减少延迟。
   - 自定义告警规则：根据事件的频率、内容、来源等配置告警规则，支持通过邮件、短信、Slack、钉钉等渠道发送告警信息。
   - 告警抑制与去重：对相同类型的重复事件进行去重和抑制，避免同一问题频繁告警。

### 4. 事件追踪与分析
   - 事件溯源：能够追踪和关联不同事件的来源，帮助分析事件链条，找出根本原因。例如，服务异常可能是由于某个数据库故障引起的。
   - 统计与报告：平台应支持事件数据的统计和分析，生成趋势图表、热力图等报告，帮助团队识别潜在问题和瓶颈。
   - 日志聚合与查询：支持集中查询和分析日志，通常集成如 Elasticsearch、Logstash、Kibana (ELK) 堆栈，帮助开发和运维团队定位问题。

### 5. 用户和权限管理
   - 多级权限控制：根据不同用户角色配置权限，确保只有授权人员可以查看或处理特定事件。
   - 审计日志：记录平台中的所有操作历史，确保操作可追溯，符合合规要求。

### 6. 集成与扩展性
   - 与其他系统的集成：能够与其他企业内部系统（如CI/CD、DevOps工具链、CRM等）无缝集成，确保信息流畅传递。
   - 支持API与插件：平台应开放API，方便其他系统进行集成，支持插件扩展，实现自定义功能。

### 7. 自动化与响应
   - 自动化响应：在某些情况下，可以配置事件的自动响应操作，例如，当系统检测到特定类型的异常时，自动进行重启、故障恢复或通知开发人员。
   - 与ITSM系统集成：与IT服务管理系统（如ServiceNow、Jira等）集成，自动生成工单，跟踪事件的处理和解决过程。

### 8. 用户界面与可视化
   - 直观的UI：提供清晰的界面来查看、过滤、排序事件，支持事件的批量处理和管理。
   - 多维度视图：例如，可以通过事件的类别、状态、优先级等多个维度来展示事件，以便团队能够迅速定位需要关注的事件。
   
这样的事件管理平台能够提高团队对突发事件的响应速度，减少系统停机时间，提升整个公司对事件的管理能力和决策水平。你是否正在考虑实现这样的平台，或者是有特定的技术栈或需求方向呢？

# 参考资料

* any list
{:toc}  