---
layout: post
title: 开源的分布式文件系统 fastcfs-01-安装入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---


# FastCFS -- 可以跑数据库的高性能通用分布式文件系统

## 1. 简介

FastCFS 是一款强一致性、高性能、高可用、支持百亿级海量文件的通用分布式文件系统，可以作为MySQL、PostgreSQL、Oracle等数据库，k8s、KVM、FTP、SMB和NFS等系统的后端存储。

### FastCFS 主要特点

* 保证数据强一致前提下实现了高性能：性能完胜Ceph；
* 完全兼容POSIX文件接口，支持文件锁，64G内存即可支持百亿级海量文件；
* 高可用：不存在单点，自动failover；
* 简洁高效的架构和原生实现，不依赖第三方组件，内置运维工具，易用性较好；
* 随机写性能强悍：FCFS基于trunk顺序分配空间，将客户端的随机写转换为顺序写。

### FastCFS 典型应用场景

* **数据库**：支持常规的独享数据和高阶的共享数据两种存储方式，支持数据库云化；
* **文件存储**：如文档、图片、视频等等，FastCFS比对象存储更容易与通用软件集成；
* **超融合存储**：数据库和文件存储共用一个存储集群，显著提升存储资源利用率；
* **高性能计算**：高可靠和高性能的FastCFS，支持RDMA，天然适合高性能计算场景；
* **视频监控**：FastCFS采用顺序写盘方式，使用SATA硬盘也可保证多路视频流畅写入。

## 2. 当前版本：V5.3.2

[FastCFS重大版本一览](docs/version-history-zh_CN.md)

## 3. 支持的操作系统

* Linux: Kernel version >= 3.10 （完全支持，推荐使用4.18及更高版本）
* MacOS or FreeBSD  （仅支持服务端，不支持FUSE）

## 4. 依赖

* [libfuse](https://gitee.com/mirrors/libfuse) (版本 3.9.4 或更高版本，推荐3.10.5)
    * [Python](https://python.org/) (版本 3.5 或更高版本)
    * [Ninja](https://ninja-build.org/) (版本 1.7 或更高版本)
    * [gcc](https://www.gnu.org/software/gcc/) (版本 4.7.0 或更高版本)
* [libfastcommon](https://gitee.com/fastdfs100/libfastcommon) (tag: V1.0.75)
* [libserverframe](https://gitee.com/fastdfs100/libserverframe) (tag: V1.2.5)
* [libdiskallocator](https://gitee.com/fastdfs100/libdiskallocator) (tag: V1.1.9)
* [fastDIR](https://gitee.com/fastdfs100/fastDIR) (tag: V5.3.2)
* [faststore](https://gitee.com/fastdfs100/faststore) (tag: V5.3.2)
* [FastCFS](https://gitee.com/fastdfs100/FastCFS) (tag: V5.3.2)

## 5. 部署 & 运维

FastCFS包含 libfastcommon、libserverframe、libdiskallocator、fastDIR、faststore和FastCFS 六个安装包。

### 一键部署

如果你打算快速体验一下FastCFS，可以一键搭建(包括部署和运行)单节点（需要root身份执行）：
```
git clone https://gitee.com/fastdfs100/FastCFS.git; cd FastCFS/
./helloWorld.sh

# 注意：helloWorld.sh将更改FastCFS相关配置文件，请不要在多节点集群上执行！
```

上述操作完成后，执行命令：
```
df -h /opt/fastcfs/fuse | grep fuse
```
可以看到FastCFS挂载的文件目录，你可以当作本地文件系统访问该目录。

一键部署的详细说明，请参见这里[一键部署详细说明](docs/Easy-install-detail-zh_CN.md)

### 集群部署工具

推荐使用 [FastCFS集群运维工具](docs/fcfs-ops-tool-zh_CN.md)

### DIY安装

如果你要自己搭建FastCFS环境，可以采用如下三种安装方式之一：

* yum安装（针对CentOS、Rocky、Fedora、RHEL等），参阅 [yum安装文档](docs/YUM-INSTALL-zh_CN.md)
* apt安装（针对Ubuntu、Debian 和 Deepin），参阅 [apt 安装文档](docs/APT-INSTALL-zh_CN.md)
* 源码编译安装，参阅 [安装文档](docs/INSTALL-zh_CN.md)

### 配置指南

FastCFS安装完成后，请参阅[配置指南](docs/CONFIGURE-zh_CN.md)

### 集群扩容

详情参见 [FastCFS集群扩容手册](docs/cluster-expansion-zh_CN.md)

## 6. 性能测试

FastCFS性能明显优于Ceph：顺序写是Ceph的6.x倍，顺序读是Ceph的2.x倍，随机写大约是Ceph的2倍。

* [FastCFS与Ceph性能对比测试结果概要](docs/benchmark.md)

* 详情参见 [完整PDF文档](docs/benchmark-20210621.pdf)

* 如何进行性能测试点击 [这里](docs/benchmark-step-by-step.md)

## 7. K8s CSI驱动

参见项目 [fastcfs-csi](https://gitee.com/fastdfs100/fastcfs-csi)

## 8. 技术文章

参见 <a href="https://my.oschina.net/u/3334339" target="_blank">技术博客</a>

## 9. 常见问题

参见 [FastCFS常见问题](docs/FAQ-zh_CN.md)

## 10. 待完成工作

*  [fstore] 单盘故障恢复后，自动恢复数据（已完成）
*  [fstore] 机器故障或网络短暂故障恢复后，master需重新均衡分配（已完成）
*  [fauth & fdir & fstore] leader选举支持过半原则，防止脑裂（已完成）
*  [fauth & fdir & fstore] 实现公用选举节点，双副本防脑裂（已完成）
*  [fdir & fstore] binlog去重及历史数据清理（已完成）
*  [fdir & fstore] 数据提交采用多数派确认机制保证数据一致性和可靠性（已完成）
*  [fdir & fstore] 针对两副本，数据提交多数派机制智能化（已完成）
*  [fstore] 文件读写性能优化（已完成）
*  [fdir & api] POSIX兼容性测试及改进（已完成）
*  [fstore] slice存储引擎插件，有限内存支持海量数据（已完成）
*  [all] 适配RDMA网络，突破网络瓶颈（已完成）
*  [api] 提供Java Native API（进行中）
*  [all] 支持集群在线扩容

参见更多 [TODO List](docs/TODO-zh_CN.md)，欢迎大家参与。

## 11. 商业支持

我们提供商业技术支持和定制化开发，欢迎微信或邮件洽谈。

email: 384681(at)qq(dot)com

* any list
{:toc}