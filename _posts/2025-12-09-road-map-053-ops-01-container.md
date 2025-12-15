---
layout: post
title: 成熟企业级技术平台-053-容器平台（K8s）
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
published: true
---


# 运维体系（Ops / SRE Platform）

> 目标：让系统“可发布、可回滚、可治理、可恢复”

```
P0（基础运维）
├── CMDB
├── 容器平台（K8s）
├── 发布平台
├── 配置中心

P1（稳定运行）
├── 服务治理（Service Mesh / Dubbo / SpringCloud）
├── 运维工具集

P2（事件驱动）
├── 事件中心（告警 / 事件 / 变更）
├── 灰度平台（Feature Flag）
├── 变更管理平台

P3（可靠性工程）
├── 自动化运维 / 自愈
├── 容量 & 成本管理
├── 运维审计 / 合规
```

# 容器平台（K8s）

下面我将从**体系定位 → 核心架构 → 关键能力 → 运维与治理 → 安全与成本 → 与周边平台协同 → 成熟度演进**七个维度，对**容器平台（Kubernetes / K8s）**做一次**平台化、工程化、可治理**的完整拆解，重点放在**企业级落地与平台视角**，而不仅是组件说明。

---

## 一、容器平台的定位（为什么是 K8s）

### 1️⃣ 一句话定义

> **Kubernetes 是一个以“声明式 + 控制循环”为核心的分布式系统操作系统，用于统一管理容器化工作负载的生命周期。**

关键词：

* 声明式（Desired State）
* 控制循环（Reconcile）
* 去中心调度
* 自愈

---

### 2️⃣ K8s 解决的本质问题

| 传统部署  | 容器平台      |
| ----- | --------- |
| 主机为中心 | **服务为中心** |
| 脚本驱动  | **控制器驱动** |
| 人管状态  | **系统管状态** |
| 静态容量  | **弹性资源**  |

---

## 二、Kubernetes 核心架构（必须理解）

### 1️⃣ 控制面（Control Plane）

#### API Server

* 唯一入口
* 认证 / 鉴权 / 准入控制
* 所有状态都通过 API 改变

#### etcd

* 集群状态数据库
* 强一致（Raft）

#### Scheduler

* 负责 Pod → Node 的调度决策

#### Controller Manager

* 各类控制器（Deployment / Node / Job）

---

### 2️⃣ 数据面（Data Plane）

#### Node 组件

* kubelet：执行 Pod
* kube-proxy：Service 网络
* Container Runtime（containerd）

---

## 三、核心资源模型（平台设计核心）

### 1️⃣ Pod（最小运行单元）

* 一个或多个容器
* 共享网络 / 存储

### 2️⃣ Workload 控制器

* Deployment（无状态）
* StatefulSet（有状态）
* DaemonSet（节点级）
* Job / CronJob（任务）

### 3️⃣ Service & Ingress

* Service：服务发现 & 负载均衡
* Ingress / Gateway：流量入口

### 4️⃣ 配置与密钥

* ConfigMap
* Secret

---

## 四、K8s 的“工程能力”

### 1️⃣ 声明式发布与回滚

```yaml
replicas: 3
image: app:v2
```

系统自动完成：

* 创建
* 对齐
* 回滚

---

### 2️⃣ 自愈能力（Self-Healing）

* Pod Crash → 自动重建
* Node NotReady → Pod 迁移
* 健康探针驱动恢复

---

### 3️⃣ 弹性伸缩

* HPA：基于指标
* VPA：资源推荐
* Cluster Autoscaler

---

## 五、企业级平台能力（K8s 本身不提供）

### 1️⃣ 多租户与资源隔离

* Namespace
* ResourceQuota
* NetworkPolicy

### 2️⃣ 发布治理

* 金丝雀 / 蓝绿
* 流量灰度
* 发布门禁

### 3️⃣ 可观测性

* Metrics（Prometheus）
* Logs（EFK / Loki）
* Traces（Jaeger）

---

## 六、安全体系（企业级重点）

### 1️⃣ 身份与权限

* RBAC
* ServiceAccount
* OIDC

### 2️⃣ 运行时安全

* 镜像扫描
* Admission Controller
* Pod Security Standards

### 3️⃣ 网络安全

* NetworkPolicy
* Service Mesh

---

## 七、K8s 与周边平台的协同

### 1️⃣ CMDB

* Cluster / Node / Pod 资产
* 服务 → 实例关系

### 2️⃣ CI/CD

* 镜像构建
* YAML 渲染
* 发布控制

### 3️⃣ Ops / SRE 平台

* 告警
* 事件
* 自动化 Runbook

---

## 八、典型企业级平台架构视角

```
开发者平台（PaaS）
  ├── 应用中心
  ├── 发布中心
  ├── 配置中心
  └── 运维中心
        └── Kubernetes
              ├── 多集群管理
              ├── 安全治理
              ├── 成本治理
```

---

## 九、K8s 的常见坑（现实经验）

1. YAML 地狱
2. 资源申请不合理
3. 集群当 VM 用
4. 没有治理直接上生产

---

## 十、成熟度演进路径

### L1：基础容器化

* 单集群
* 手工部署

### L2：平台化

* 多集群
* 统一发布

### L3：治理化

* 安全 / 配额 / 发布规范

### L4：SRE 化

* SLO
* 自动扩缩
* 故障自愈

### L5：智能化

* 预测性运维
* AI 调度
* 自动优化

* any list
{:toc}