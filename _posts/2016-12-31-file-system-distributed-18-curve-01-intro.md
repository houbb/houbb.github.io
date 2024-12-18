---
layout: post
title: 分布式存储系统-18-opencurve/curve 网易开发的现代存储系统，目前支持文件存储（CurveFS）和块存储（CurveBS）。
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, cloud-native, file]
published: true
---

# 前言

https://github.com/opencurve/curve


# curve

一个云原生分布式存储系统

一个由CNCF基金会托管的沙盒项目

##  关于Curve

**Curve**是由网易开发的现代存储系统，目前支持文件存储（CurveFS）和块存储（CurveBS）。现在它作为沙盒项目托管在[CNCF](https://www.cncf.io/)。

CurveBS的核心应用场景主要包括：
- 虚拟机/容器的云盘或持久化卷，以及物理机的远程磁盘
- 存储与计算分离的高性能架构：基于RDMA+SPDK的高性能、低延迟架构，支持各种数据库（如MySQL、Kafka）的分离部署结构

CurveFS的核心应用场景主要包括：
- AI训练场景中的高性价比存储
- 大数据场景中的冷热数据自动分层存储
- 公有云上的高性价比共享文件存储：可用于AI、大数据、文件共享等业务场景
- 混合存储：热数据存储在本地IDC，冷数据存储在公有云

<details>
  <summary><b><font=5>高性能 | 更稳定 | 易于操作 | 云原生</b></font></summary>

- 高性能：CurveBS vs CephBS

  CurveBS: v1.2.0

  CephBS: L/N
  性能：
  CurveBS的随机读写性能远超CephBS，特别是在块存储场景中。

  环境：6节点集群，3副本，每个节点有20个SATA SSD，2个E5-2660 v4和256GB内存。

  单个卷：
  <img src="https://github.com/opencurve/curve/raw/master/docs/images/1-nbd-en.png">

  多个卷：
  <img src="https://github.com/opencurve/curve/raw/master/docs/images/10-nbd-en.png">

- 更稳定
  - Curve在常见异常情况下的稳定性优于Ceph。
    | 故障案例 | 磁盘故障 | 慢磁盘检测 | 服务器故障 | 服务器暂停 |
    | :----: | :----: | :----: | :----: | :----: |
    | CephBS | 波动7秒 | 持续I/O波动 | 波动7秒 | 无法恢复 |
    | CurveBS | 波动4秒 | 无影响 | 波动4秒 | 波动4秒 |

- 易于操作
  - 我们开发了[CurveAdm](https://github.com/opencurve/curveadm/wiki)来帮助运维人员。
    | 工具  | CephAdm | CurveAdm |
    | :--: | :--: | :--: |
    | 安装简便 | ✔️ | ✔️ |
    | 部署简便 | ❌(步骤稍多) | ✔️ |
    | 游乐场 | ❌ | ✔️ |
    | 多集群管理 | ❌ | ✔️ |
    | 扩展简便 | ❌(步骤稍多) | ✔️ |
    | 升级简便 | ✔️ | ✔️ |
    | 停止服务简便 | ❌ | ✔️ |
    | 清理简便 | ❌ | ✔️ |
    | 部署环境测试 | ❌ | ✔️ |
    | 运维审计 | ❌ | ✔️ |
    | 外围组件部署 | ❌ | ✔️ |
    | 日志报告简便 | ❌ | ✔️ |
    | 集群状态统计报告 | ❌ | ✔️ |
    | 错误码分类与解决方案 | ❌ | ✔️ |
  - 运维
    CurveBS的运维操作比CephBS更友好。
    | 运维场景 | 升级客户端 | 平衡 |
    | :----: | :----: | :----: |
    | CephBS | 不支持在线升级 | 通过插件影响I/O |
    | CurveBS | 支持在线升级，轻微波动 | 自动平衡，无I/O影响 |

- 云原生
  - 请参见[我们对云原生的理解](https://github.com/opencurve/curve/wiki/Roadmap)。

</details>
<details>
  <summary><b><font=5>对接OpenStack</b></font></summary>

- 请参见[Curve-cinder](https://github.com/opencurve/curve-cinder)。

</details>
<details>
  <summary><b><font=5>对接Kubernetes</b></font></summary>

- 使用[Curve CSI Driver](https://github.com/opencurve/curve-csi)，该插件实现了容器编排器（CO）与Curve集群之间的容器存储接口（CSI）。它允许动态分配Curve卷并将其附加到工作负载上。
- 文档详情见[CSI Curve Driver文档](https://github.com/opencurve/curve-csi/blob/master/docs/README.md)。
</details>
<details>
  <summary><b><font=5>对接PolarDB | PG </b></font></summary>

- 它作为[Polardb for PostgreSQL](https://github.com/ApsaraDB/PolarDB-for-PostgreSQL)的基础存储，为上层数据库应用提供数据一致性保障、极致弹性扩展和高性能HTAP。

- 部署详情见[PolarDB | PG 高级部署（CurveBS）](https://apsaradb.github.io/PolarDB-for-PostgreSQL/zh/deploying/storage-curvebs.html)。

</details>
<details>
  <summary><b><font=5> 更多...</b></font></summary>

- Curve还可以作为云存储中间件，使用S3兼容的对象存储作为数据存储引擎，为公有云用户提供高性价比的共享文件存储。
</details>

## Curve架构

<div align=center> <img src="https://github.com/opencurve/curve/raw/master/docs/images/Curve-arch.png" width=60%>
<div align=left>

<details>
  <summary><b><font=4>Curve在混合云中的应用</b></font></summary>

Curve支持在私有云和公有云环境中部署，也可以用于混合云：
<div align=center> <img src="https://github.com/opencurve/curve/raw/master/docs/images/Curve-deploy-on-premises-idc.png" width=60%>
<div align=left>

其中，CurveFS共享文件存储系统可以弹性扩展到公有云存储，为用户提供更大的容量弹性、降低成本并提供更好的性能体验。

</details>

<div align=left>

<details>
  <summary><b><font=4>Curve在公有云中的应用</b></font></summary>

在公有云环境中，用户可以部署CurveFS集群，替代云服务商提供的共享文件存

储。Curve的目标是提供一个支持海量数据存储、高并发、高可靠的分布式文件系统，满足开发者对于高效、低成本云存储服务的需求。
</details>



# 参考资料

https://github.com/linweisen/SimpleDFS

* any list
{:toc}