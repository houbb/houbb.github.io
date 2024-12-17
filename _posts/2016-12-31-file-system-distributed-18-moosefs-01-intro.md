---
layout: post
title: 分布式存储系统-18-moosefs MooseFS 分布式存储 – 开源、千兆字节级、容错、高性能、可扩展的网络分布式文件系统/软件定义存储
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---

#  MooseFS

MooseFS 分布式存储 – 开源、千兆字节级、容错、高性能、可扩展的网络分布式文件系统/软件定义存储

![MooseFS](https://moosefs.com/Content/Images/moosefs.png)

# MooseFS – 一个千兆字节级分布式文件系统

MooseFS 是一个千兆字节级开源网络分布式文件系统。

它易于部署和维护，具有高可靠性、容错性、高性能、易扩展，并且符合 POSIX 标准。

MooseFS 将数据分布在多个普通服务器上，用户可以将其视为一个资源。

对于标准文件操作，MooseFS 的表现类似于普通的类 Unix 文件系统：

* **层次结构** – **目录树**

* 存储 **POSIX 文件属性** – 权限、最后访问和修改时间等
* 支持 **访问控制列表（ACL）**
* 支持 POSIX 和 BSD **文件锁** – 包括对 **分布式文件锁** 的支持
* 支持 **特殊文件** – 块设备和字符设备、管道和套接字
* 支持 **符号链接** – 文件名指向目标文件，不一定在 MooseFS 上
* 支持 **硬链接** – 不同的文件名指向相同的数据

MooseFS 的特点：

* **高可靠性** – 文件存储在多个服务器上，每个文件有多个副本，副本数量可配置
* **无单点故障** – 所有硬件和软件组件都可以冗余
* **并行数据操作** – 多个客户端可以并发访问多个文件
* **容量可动态扩展** – 通过简单地添加新的服务器或磁盘来扩展
* **可随时移除淘汰的硬件**
* **删除的文件会保留一段可配置的时间**（相当于文件系统级别的“回收站”）
* **一致的“原子”快照** – 即使文件正在被写入或访问，也能创建文件的快照
* **可以根据 IP 地址和/或密码限制对文件系统的访问**（类似于 NFS）
* **数据分层** – 支持不同的存储策略，适用于不同的文件/目录（存储类机制）
* 每个目录的 **“项目”配额** – 可配置 RAW 空间、可用空间和 inode 数量，并支持硬性和软性配额
* 除文件系统存储外，MooseFS 还提供 **块存储** (`mfsbdev`)
* 高效的 **纯 C** 实现
* 支持 **以太网**  

## 支持的平台

MooseFS 可以安装在任何 POSIX 兼容的操作系统上，包括多种 Linux 发行版、FreeBSD 和 macOS：

* Ubuntu
* Debian
* RHEL / CentOS
* OpenSUSE
* FreeBSD
* macOS

MooseFS 客户端使用 FUSE 库，支持 [Linux 和 BSD](https://github.com/libfuse/libfuse) 和 [macOS](https://github.com/osxfuse/osxfuse)。

也有专门为 Microsoft Windows 提供的 MooseFS 客户端，基于 [Dokany](https://github.com/dokan-dev/dokany) 构建。

## 快速入门
你可以使用你喜欢的包管理器，在以下平台上通过 [官方支持的仓库](https://moosefs.com/download) 安装 MooseFS：

* Ubuntu 16 / 18 / 20 / 22 / 24
* Debian 9 / 10 / 11 / 12 / 13
* RHEL / CentOS 7 / 8 / 9
* FreeBSD 11 / 12 / 13 / 14
* macOS 10.12+
* Ubuntu 20 / 22 – Raspberry Pi
* Debian 11 / 12 – Raspberry Pi

CentOS 6 的包也可以使用，但不再支持。

Debian 包兼容 Proxmox。CentOS 包兼容 Rocky Linux、AlmaLinux 和 openSUSE Leap。

运行 MooseFS 所需的最小包：

* `moosefs-master` – MooseFS 主服务器（元数据服务器）
* `moosefs-chunkserver` – MooseFS 数据存储服务器（Chunkserver）
* `moosefs-client` – MooseFS 客户端包，用于挂载文件系统

### 源代码
你可以从我们的 GitHub 代码库中下载源代码！

在从源代码构建 MooseFS 之前，需要安装以下依赖：

* Debian/Ubuntu: `sudo apt install build-essential libpcap-dev zlib1g-dev libfuse3-dev pkg-config`  
（如果你的系统没有 FUSE v. 3，请使用 `sudo apt install build-essential libpcap-dev zlib1g-dev libfuse-dev pkg-config`）
* CentOS/RHEL: `sudo yum install gcc make libpcap-devel zlib-devel fuse3-devel pkgconfig`  
（如果你的系统没有 FUSE v. 3，请使用 `sudo yum install gcc make libpcap-devel zlib-devel fuse-devel pkgconfig`）

推荐的包：

* Debian/Ubuntu: `sudo apt install fuse3`  
（如果你的系统没有 FUSE v. 3，请使用 `sudo apt install fuse`）
* CentOS/RHEL: `sudo yum install fuse3`  
（如果你的系统没有 FUSE v. 3，请使用 `sudo yum install fuse`）

在 Linux 上构建 MooseFS 可以通过运行 `./linux_build.sh` 来完成。类似地，在 FreeBSD 上使用 `./freebsd_build.sh`，在 macOS 上使用 `./macosx_build.sh`。记住，这些脚本不会安装二进制文件（即不执行 `make install`）。你需要手动执行此命令。

### 最小设置
只需三步即可启动 MooseFS：

#### 1. 安装至少一个主服务器
1. 安装 `moosefs-master` 包
2. 准备默认配置（以 `root` 身份）：
```
cd /etc/mfs
cp mfsmaster.cfg.sample mfsmaster.cfg
cp mfsexports.cfg.sample mfsexports.cfg
```
3. 准备元数据文件（以 `root` 身份）：
```
cd /var/lib/mfs
cp metadata.mfs.empty metadata.mfs
chown mfs:mfs metadata.mfs
rm metadata.mfs.empty
```
4. 启动主服务器（以 `root` 身份）：`mfsmaster start`
5. 使该机器在所有运行 MooseFS 组件的服务器上可见，可以通过添加 DNS 条目（推荐）或在 `/etc/hosts` 中添加它。

#### 2. 安装至少两个 Chunkserver
1. 安装 `moosefs-chunkserver` 包
2. 准备默认配置（以 `root` 身份）：
```
cd /etc/mfs
cp mfschunkserver.cfg.sample mfschunkserver.cfg
cp mfshdd.cfg.sample mfshdd.cfg
```
3. 在 `mfshdd.cfg` 文件的末尾添加一个或多个路径，指定用于存储数据块的硬盘或分区路径，例如：
```
/mnt/chunks1
/mnt/chunks2
/mnt/chunks3
```
推荐使用 XFS 作为存储数据块的底层文件系统。强烈建议使用两个以上的 Chunkserver。

4. 更改上述路径的所有权和权限为 `mfs:mfs`：
```
chown mfs:mfs /mnt/chunks1 /mnt/chunks2 /mnt/chunks3
chmod 770 /mnt/chunks1 /mnt/chunks2 /mnt/chunks3
```
5. 启动 Chunkserver：`mfschunkserver start`

对第二个（第三个等）Chunkserver 执行相同的步骤。

#### 3. 客户端：挂载 MooseFS 文件系统
1. 安装 `moosefs-client` 包
2. 挂载 MooseFS（以 `root` 身份）：
```
mkdir /mnt/mfs
mount -t moosefs mfsmaster: /mnt/mfs
```
或：如果上面的方法不被系统支持，可以使用 `mfsmount -H mfsmaster /mnt/mfs`。

3. 你也可以添加 `/etc/fstab` 条目，在系统启动时自动挂载 MooseFS：
```
mfsmaster:    /mnt/mfs    moosefs    defaults,mfsdelayedinit    0 0
```

有更多的配置参数可用，但大多数可以保持默认。我们尽量使 MooseFS 易于部署和维护。

MooseFS 为测试目的，甚至可以安装在单台机器上！

#### 附加工具
建议设置 `moosefs-cli` 或 `moosefs-cgi` 与 `moosefs-cgiserv`，它们可以让你实时监控集群：

1. 安装 `moosefs-cli moosefs-cgi moosefs-cgiserv` 包（通常在主服务器上安装）
2. 启动 MooseFS CGI 服务器（以 `root` 身份）：`mfscgiserv start`
3. 在浏览器中打开 `http://mfsmaster:9425`

强烈建议在与主服务器不同的机器上设置至少一个 Metalogger（例如

，在一个 Chunkserver 上）。Metalogger 会不断同步并备份元数据：

1. 安装 `moosefs-metalogger` 包
2. 准备默认配置（以 `root` 身份）：
```
cd /etc/mfs
cp mfsmetalogger.cfg.sample mfsmetalogger.cfg
```
3. 启动 Metalogger（以 `root` 身份）：`mfsmetalogger start`

---

## 一些事实

* 第一个公开发布的日期：2008年5月30日
* 项目官网：https://moosefs.com
* 安装和使用 MooseFS：https://moosefs.com/support
* （旧）Sourceforge 项目网站：https://sourceforge.net/projects/moosefs

## 联系我们

* 报告 Bug：[GitHub issue](https://github.com/moosefs/moosefs/issues) 或 [support@moosefs.com](mailto:support@moosefs.com)
* 一般问题：[contact@moosefs.com](mailto:contact@moosefs.com)

## 版权声明

版权 (c) 2008-2024 Jakub Kruszona-Zawadzki, Saglabs SA

本文件是 MooseFS 的一部分。

MooseFS 是自由软件；你可以在 GNU 通用公共许可证（版本 2）下重新分发和/或修改它。

MooseFS 被发布是希望它有用，但不提供任何形式的担保，包括对特定用途的适销性和适用性的隐含担保。

# 参考资料

https://github.com/owncloud/core/blob/master/README.md

* any list
{:toc}