---
layout: post
title: 成熟企业级技术平台-10-跳板机 / 堡垒机（Bastion Host）详解
date: 2025-12-09 21:01:55 +0800
categories: [Awesome]
tags: [awesome, java, sh]
published: true
---


# 概览

[UMS 平台](https://houbb.github.io/2025/12/09/road-map-010-id-01-UMS)

[PASSPORT 平台](https://houbb.github.io/2025/12/09/road-map-010-id-02-passport)

[SSO 平台](https://houbb.github.io/2025/12/09/road-map-010-id-03-SSO)

[PERMISSION 平台](https://houbb.github.io/2025/12/09/road-map-010-id-04-PERMISSION)

[应用管理](https://houbb.github.io/2025/12/09/road-map-010-id-05-app-manage)

[审计中心](https://houbb.github.io/2025/12/09/road-map-010-id-06-audit)

[IGA（Identity Governance & Administration，身份治理与管理）平台](https://houbb.github.io/2025/12/09/road-map-010-id-07-IGA)

[跳板机 / 堡垒机（Jump Server / Bastion Host）](https://houbb.github.io/2025/12/09/road-map-010-id-08-jump-server)

---

[统一的特权访问控制平台（Privileged Access Management / PAM）](https://houbb.github.io/2025/12/09/road-map-09-boastin-host-plateform)

[KMSS（Key Management & Security Service）](https://houbb.github.io/2025/12/09/road-map-09-security-KMSS)

[安全平台 security plateform](https://houbb.github.io/2025/12/09/road-map-09-security-plateform)

[数据脱敏平台 Data Masking / Data Protection Platform](https://houbb.github.io/2025/12/09/road-map-09-sensitive-plateform)

# 相关开源项目

可以参考一下老马开源的项目：

敏感词核心库: https://github.com/houbb/sensitive-word

敏感词控台：https://github.com/houbb/sensitive-word-admin

日志脱敏：https://github.com/houbb/sensitive

加密工具：https://github.com/houbb/encryption-local




# 跳板机 / 堡垒机（Bastion Host）详解

跳板机本质上是一个 **统一的特权访问控制平台（Privileged Access Management / PAM）**，将对服务器、数据库、网络设备、云主机等资源的访问进行统一认证、授权、审计和安全管控。

它通常是企业安全体系中的关键能力之一，属于 **Zero Trust & 企业安全运营体系** 的核心组成。

---

# 1. 定义与定位

**跳板机 / 堡垒机是一种集中式的安全访问控制系统，用于：**

1. **统一入口访问企业内外部资源**
2. **隔离外部访问与内网资源**
3. **替代直连服务器的 SSH、RDP、数据库连接**
4. **提供强制的多因子认证、审批、授权、防护、安全审计**

它是运维人员访问企业资源的“必经之路”，也是安全运营和合规要求的重要基础设施。

---

# 2. 为什么需要堡垒机

企业一般是因为以下痛点而引入堡垒机：

| 痛点                     | 堡垒机解决方式                |
| ---------------------- | ---------------------- |
| 多个系统无统一入口，账号分散         | 集中化访问门户                |
| 无法做到“人、资源、操作”的可控       | 精细化授权：人 × 资源 × 操作      |
| 服务器被人私下 SSH 登录，难追踪     | 强制通过跳板机，禁止直连           |
| 无操作记录、审计缺失             | 全量命令记录、屏幕录像            |
| 高危命令无法阻断               | 风险命令实时检测 + 拦截          |
| 账号共享（root / admin）无法溯源 | 临时授权 + 账号托管 + 派发子账户    |
| 外包运维缺少登录审批             | 工单审批 + 会话授权            |
| 防止横向移动攻击               | 0trust isolation + MFA |

---

# 3. 核心功能体系

总体能力可以分为 6 大类：

## 3.1 统一访问入口

* Web Portal（访问所有目标资源的统一界面）
* SSH / RDP / VNC / Database Proxy (MySQL/PostgreSQL/Redis/MongoDB…)
* 多协议支持（Telnet、K8s、API 调用）

## 3.2 身份认证与账号治理

* 对接 UMS/IDP（OIDC/SAML）
* 强制 MFA（二次验证）
* 动态风险评分（IP 异常、设备异常、隐私代理等）
* 账号托管（托管 root / admin 密码，不外泄）
* 临时凭证派发（short-lived credential）

## 3.3 访问控制（Authorization）

支持 RBAC / ABAC：

* 人员角色 → 资源组授权
* 操作级控制（禁用 rm -rf、删除、DROP DATABASE）
* 限制登录时间（工作时间、夜间自动阻断）
* 双人授权 / 四眼原则（Four-Eyes Principle）

## 3.4 安全策略与风控

* 异常会话检测（机器流量、人类行为模式）
* 高危命令识别与拦截
* SQL 注入行为识别
* 命令注入、横向移动、隧道代理检测
* 自动封禁异常 IP / 账号

## 3.5 审计记录（Audit）

* 全量命令记录
* 全量键盘输入记录
* 全量屏幕录像，并支持回放
* 会话实时监管（Admin 可实时观看）
* 操作回溯、责任人可溯源
* DB 操作 SQL 解析
* 文件上传下载审计

## 3.6 运维中台能力

* 工单审批与派发访问权限
* 自动登录脚本（无需告诉用户密码）
* 主机资产管理（Host Inventory）
* Session 管理（阻断会话）

---

# 4. 系统架构

一个标准堡垒机架构如下：

```
       用户浏览器 / SSH 客户端
                  │
               MFA/SSO
                  │
         ┌──────────────┐
         │  跳板机 Portal │ 
         └──────────────┘
              │  RBAC/ABAC
              ▼
      ┌───────────────┐
      │   Access Proxy │  ←  SSH/RDP/DB/HTTP
      └───────────────┘
              │
              ▼
      目标主机 / 数据库 / 云资源
```

### 核心组件

| 组件                 | 职责               |
| ------------------ | ---------------- |
| Portal             | 统一访问入口、导航、审计检索   |
| Auth Service       | 身份认证、MFA、单点登录    |
| RBAC/ABAC Engine   | 权限控制决策           |
| Proxy Gateway      | SSH/RDP/DB 流量代理层 |
| Audit Engine       | 命令记录、屏幕录像、SQL 解析 |
| Risk Engine        | 高危行为识别、拦截        |
| Asset Service      | 资产管理、同步 CMDB     |
| Approval Service   | 工单审批、临时授权        |
| Session Controller | 会话监控、阻断、回放       |

---

# 5. 访问流程（交互级）

以“运维人员访问生产服务器”为例：

1. 登录跳板机（SSO+MFA）
2. 风险分析（IP/设备/行为评分）
3. 运维人员申请访问生产主机（自动或审批）
4. RBAC/ABAC 判断是否有权限
5. 跳板机托管 root/admin 凭证
6. 用户通过代理层进入主机，无需知道密码
7. 全操作实时记录
8. 异常命令实时阻断（如 rm -rf /）
9. 会话结束 -> 审计记录入库
10. 生成操作报告（给审计中心/安全中心）

---

# 6. 与企业其他系统的关系

## 6.1 与 UMS（用户中心）

* 用户基础信息、部门、角色同步
* 离职自动回收所有运维权限
* 多租户组织结构打通

## 6.2 与 IAM（权限中心）

* 堡垒机自身权限（resource/action）
* 访问控制走 IAM 的 PolicyEngine（可选）
* 最终授权=IAM Policy × Bastion Policy

## 6.3 与 审计中心

* 发送会话元数据、命令日志、风险事件
* 将录像索引发送到审计中心归档
* 审计中心进行时序相关分析（多系统链路）

## 6.4 与 安全平台（风控、0trust）

* 行为风险检测/可信设备校验
* 登录风险判断（如办公地 vs 异地）
* 自动处置策略（封禁账号、锁定主机）

## 6.5 与 CMDB

* 自动同步资产（IP、HostName、OS）
* 资产变更同步到跳板机（避免重复维护）

---

# 7. 高级能力（企业级需求）

### 7.1 零信任访问（Zero Trust）

* 无论内外网都强制认证
* 强设备信任（证书+设备指纹）
* 动态权限（based on context）

### 7.2 无代理与有代理混合

* 无代理：大部分主机通过 SSH Proxy
* 有代理：支持在主机上安装 Agent 上报行为

### 7.3 隐私隔离

* 屏蔽敏感数据（如密码）
* 隐藏完整命令参数

### 7.4 SaaS 化多租户

* 企业版支持多组织
* 每个租户隔离资源、隔离审计

---

# 8. 企业落地指南

## 8.1 第一步：禁止直连服务器

* 全部服务器只允许堡垒机 IP
* 禁止公网 SSH 访问

## 8.2 第二步：打通 IAM/UMS

* 人员自动同步
* 权限自动回收

## 8.3 第三步：自动记录所有操作

* 命令与屏幕全记录
* 审计中心接收数据

## 8.4 第四步：细粒度授权

* 阻断高危命令
* 限制操作范围（文件、目录、数据库）

## 8.5 第五步：风险联动

* 异常操作自动封锁会话
* 风控平台处理攻击活动

---

# 9. 总结

跳板机 / 堡垒机是 MVE（最小可行企业级架构）中不可或缺的安全基石，提供：

1. 统一访问入口
2. 全流程权限控制（认证-授权-审批）
3. 操作全量审计
4. 风控联动与异常行为拦截
5. 账号托管，彻底消灭共享账号
6. 审计数据沉淀，为安全分析提供高价值数据

它有效消除“最薄弱环节”——**人员操作风险**，并构建企业级 0Trust 访问体系。

---

# NEXT

* 堡垒机系统的详细 PRD/BRD
* 跳板机与 IAM/SSO 的集成架构
* 跳板机前端交互流、操作界面设计
* 跳板机的 landing page 宣传稿与官网
* 堡垒机的数据库 ERD


* any list
{:toc}