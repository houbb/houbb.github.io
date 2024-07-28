---
layout: post
title: 分布式存储系统-03-ceph 一个可扩展的分布式存储系统介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---

# Ceph - 一个可扩展的分布式存储系统

有关 Ceph 的最新信息，请访问 [Ceph](https://ceph.com/)。

## 贡献代码

大部分 Ceph 是在 LGPL 2.1 或 3.0 双重许可下发布的。一些杂项代码是公共领域或使用 BSD 风格的许可证。

Ceph 文档使用 Creative Commons Attribution Share Alike 3.0 (CC-BY-SA-3.0) 许可。

`ceph/ceph` 仓库中包含的一些头文件使用 GPL 许可证。有关按文件分类的完整许可证清单，请参见 `COPYING` 文件。

所有代码贡献必须包含有效的 "Signed-off-by" 行。有关详细信息和如何生成和提交补丁的说明，请参见 `SubmittingPatches.rst` 文件。

贡献代码不需要版权转让。代码根据适用的许可证条款进行贡献。

## 检出源代码

在安装了 git 的系统上运行以下命令，从 GitHub 克隆 ceph/ceph 仓库：

```shell
git clone git@github.com:ceph/ceph
```

或者，如果您不是 GitHub 用户，应在安装了 git 的系统上运行以下命令：

```shell
git clone https://github.com/ceph/ceph.git
```

当 `ceph/ceph` 仓库被克隆到您的系统后，运行以下命令进入克隆的 `ceph/ceph` 仓库并检出与之关联的 git 子模块：

```shell
cd ceph
git submodule update --init --recursive --progress
```

## 构建前提条件

*section last updated 27 Jul 2023*

确保已安装 `curl`。这里提供了 Debian 和 Ubuntu 的 `apt` 命令，但如果您使用不同的包管理器，请使用相应的命令：

```shell
apt install curl
```

通过运行以下命令安装 Debian 或 RPM 包依赖项：

```shell
./install-deps.sh
```

安装 `python3-routes` 包：

```shell
apt install python3-routes
```

## 构建 Ceph

这些指令适用于为开发和测试编译代码的开发人员。要构建适合安装的二进制文件，我们建议您构建 `.deb` 或 `.rpm` 包，或参见 `ceph.spec.in` 或 `debian/rules` 以查看用于生产构建的配置选项。

要构建 Ceph，确保您位于包含 `do_cmake.sh` 和 `CONTRIBUTING.rst` 的顶级 `ceph` 目录中，然后运行以下命令：

```shell
./do_cmake.sh
cd build
ninja
```

`do_cmake.sh` 默认创建一个 "调试构建" 的 Ceph，它可能比非调试构建慢五倍。传递 `-DCMAKE_BUILD_TYPE=RelWithDebInfo` 给 `do_cmake.sh` 以创建非调试构建。

[Ninja](https://ninja-build.org/) 是 Ceph 项目用来构建测试构建的构建系统。如果未指定，`ninja` 使用的作业数量取决于构建主机的 CPU 内核数量。如果构建作业耗尽内存，请使用 `-j` 选项限制作业数量。如果您尝试运行 `ninja` 并收到 `g++: fatal error: Killed signal terminated program cc1plus` 消息，则表示内存不足。使用 `-j` 选项并根据运行 `ninja` 命令的硬件适当调整参数，预计可以成功构建。例如，要将作业数量限制为 3，请运行 `ninja -j 3`。平均来说，每个并行运行的 `ninja` 作业需要大约 2.5 GiB 的 RAM。

此文档假设您的构建目录是 `ceph.git` 检出的子目录。如果构建目录位于其他位置，请将 `CEPH_GIT_DIR` 指向正确的检出路径。可以通过在调用 `do_cmake.sh` 之前设置 ARGS 来指定其他 CMake 参数。有关详细信息，请参见 [cmake 选项](#cmake-options)。例如：

```shell
ARGS="-DCMAKE_C_COMPILER=gcc-7" ./do_cmake.sh
```

要仅构建特定目标，请运行以下形式的命令：

```shell
ninja [target name]
```

要安装：

```shell
ninja install
```

### CMake 选项

`-D` 标志可用于 `cmake` 以加快 Ceph 构建过程并自定义构建。

#### 构建不带 RADOS Gateway

默认情况下会构建 RADOS Gateway。要构建不带 RADOS Gateway 的 Ceph，请运行以下形式的命令：

```shell
cmake -DWITH_RADOSGW=OFF [path to top-level ceph directory]
```

#### 构建带调试和任意依赖项位置

运行以下形式的命令以带调试和外部依赖项的备用位置构建 Ceph：

```shell
cmake -DCMAKE_INSTALL_PREFIX=/opt/ceph -DCMAKE_C_FLAGS="-Og -g3 -gdwarf-4" ..
```

Ceph 有几个捆绑的依赖项，如 Boost、RocksDB 和 Arrow。默认情况下，`cmake` 从源代码构建这些捆绑的依赖项，而不是使用系统上已安装的库。只要符合 Ceph 的版本要求，您可以选择使用这些系统库。要使用系统库，请使用 `cmake` 选项，如以下示例：

```shell
cmake -DWITH_SYSTEM_BOOST=ON [...]
```

要查看详尽的 `-D` 选项列表，请调用 `cmake -LH`：

```shell
cmake -LH
```

#### 保留诊断颜色

如果您将 `ninja` 管道传输到 `less` 并希望保留输出中的诊断颜色以使错误和警告更易读，请运行以下命令：

```shell
cmake -DDIAGNOSTICS_COLOR=always ...
```

上述命令仅适用于支持的编译器。

诊断颜色将在运行以下命令时可见：

```shell
ninja | less -R
```

`DIAGNOSTICS_COLOR` 的其他可用值为 `auto`（默认）和 `never`。

## 构建源代码包

要构建一个包含从源代码构建所需的所有内容和/或构建 `.deb` 或 `.rpm` 包的完整源代码包，请运行

```shell
./make-dist
```

这将从 git 创建一个名为 ceph-$version.tar.bz2 的压缩包。（确保您工作目录中的任何更改都已提交到 git。）

## 运行测试集群

在 `ceph/` 目录中运行以下命令启动一个测试 Ceph 集群：

```shell
cd build
ninja vstart        # builds just enough to run vstart
../src/vstart.sh --debug --new -x --localhost --bluestore
./bin/ceph -s
```

大多数 Ceph 命令可在 `bin/` 目录中找到。例如：

```shell
./bin/rbd create foo --size 1000
./bin/rados -p foo bench 30 write
```

要关闭测试集群，请在 `build/` 目录中运行以下命令：

```shell
../src/stop.sh
```

使用 sysvinit 脚本启动或停止单个守护进程：

```shell
./bin/init-ceph restart osd.0
./bin/init-ceph stop
```

## 运行单元测试

要构建并运行所有测试（使用所有处理器并行），请使用 `ctest`：

```shell
cd build
ninja
ctest -j$(nproc)
```

（注意：许多从 src/test 构建的目标不使用 `ctest` 运行。以 "unittest" 开头的目标在 `ninja check` 中运行，因此可以用 `ctest` 运行。以 "ceph_test" 开头的目标不能用 `ctest` 运行，需手动运行。）

当发生故障时，请查看 build/Testing/Temporary 下的日志。

要构建并运行所有测试及其依赖项而不包括 Ceph 中的其他不必要目标：

```shell
cd build
ninja check -j$(nproc)
```

要手动运行单个测试，请使用 `-R`（正则表达式匹配）运行 `ctest`：

```shell
ctest -R [regex matching test name(s)]
```

（注意：`ctest` 不会构建它正在运行的测试或运行该测试所需的依赖项）

要手动运行单个测试并查看所有测试输出，请使用 `-V`（详细）标志运行 `ctest`：

```shell
ctest

 -V -R [regex matching test name(s)]
```

要手动运行测试并并行运行作业，请使用 `-j` 旗运行 `ctest`：

```shell
ctest -j [number of jobs]
```

您可以为 `ctest` 提供许多其他标志，以更好地控制手动测试执行。要查看这些选项，请运行：

```shell
man ctest
```

## 构建文档

### 前提条件

构建文档的包依赖项列表可以在 `doc_deps.deb.txt` 中找到：

```shell
sudo apt-get install `cat doc_deps.deb.txt`
```

### 构建文档

要构建文档，请确保您位于顶级 `/ceph` 目录中，并执行构建脚本。例如：

```shell
admin/build-doc
```

## 报告问题

要报告问题并查看现有问题，请访问 [Ceph Tracker](https://tracker.ceph.com/projects/ceph)。

---------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 分布式存储系统 ceph？

### Ceph 分布式存储系统详细介绍

Ceph 是一个高度可扩展的开源分布式存储系统，旨在提供高性能、可靠性和灵活性。

它支持对象存储、块存储和文件系统，并能在商业硬件上运行。

Ceph 通过独特的 CRUSH 算法实现数据分布和复制，消除了单点故障，提供了自动化管理和高效的数据处理能力。

#### 1. Ceph 架构

Ceph 的架构主要由以下几个关键组件组成：

- **Ceph Monitor (MON)**：跟踪集群的状态，包括映射和认证信息。它维护整个集群的健康状态。
- **Ceph OSD Daemon (OSD)**：负责存储数据、处理数据复制、恢复、重新平衡、以及提供监控信息。每个 OSD 实例管理一个磁盘。
- **Ceph Metadata Server (MDS)**：管理文件系统的元数据，支持 POSIX 文件系统的操作，仅在使用 Ceph 文件系统（CephFS）时需要。
- **Ceph Manager (MGR)**：提供额外的监控和管理功能，并且为 Ceph Dashboard 和其他管理工具提供支持。

#### 2. 数据存储模型

Ceph 提供三种主要的数据存储模型：

- **RADOS (Reliable Autonomic Distributed Object Store)**：Ceph 的核心组件，是一个分布式对象存储系统。所有 Ceph 的存储服务（RBD、CephFS、RGW）都是基于 RADOS 构建的。
- **RBD (RADOS Block Device)**：提供块存储服务，允许用户创建和使用块设备，这些设备可以用于虚拟机存储、数据库等。
- **CephFS (Ceph File System)**：提供 POSIX 兼容的文件系统，允许用户在 Ceph 集群上创建和管理文件系统。
- **RGW (RADOS Gateway)**：提供对象存储服务，兼容 S3 和 Swift 接口，允许用户使用对象存储 API 访问 Ceph 集群。

#### 3. CRUSH 算法

Ceph 使用 CRUSH（Controlled Replication Under Scalable Hashing）算法进行数据分布和复制。CRUSH 算法根据集群状态和用户定义的策略决定数据在集群中的存储位置。它消除了传统的集中式元数据管理，实现了以下优点：

- **无单点故障**：通过分布式映射表替代中心化的元数据管理，避免了单点故障。
- **高效的数据分布**：根据存储策略和集群状态，动态调整数据分布，保证数据均衡。
- **弹性扩展**：自动处理节点的增加和减少，重新分配数据，确保高可用性。

#### 4. 数据复制和恢复

Ceph 通过数据复制和纠删码（Erasure Coding）实现高可用性和数据保护：

- **数据复制**：默认情况下，Ceph 使用三副本策略，将每个数据块复制到三个不同的 OSD 上。即使一个 OSD 故障，数据也可以从其他副本中恢复。
- **纠删码**：为了提高存储效率，Ceph 还支持纠删码，通过增加冗余数据实现故障恢复，减少存储空间占用。

#### 5. 管理和监控

Ceph 提供丰富的管理和监控工具：

- **Ceph CLI**：命令行工具，用于配置和管理 Ceph 集群。
- **Ceph Dashboard**：基于 Web 的管理界面，提供图形化的监控和管理功能。
- **Ceph REST API**：提供 RESTful 接口，支持自动化脚本和第三方工具集成。

#### 6. 使用场景

Ceph 适用于多种场景：

- **云存储**：提供高性能、可扩展的存储解决方案，适合云存储平台。
- **大数据分析**：支持大规模数据处理任务，适合数据密集型应用。
- **虚拟化**：为虚拟机提供高性能块存储，支持 OpenStack、Kubernetes 等平台。
- **企业存储**：提供统一存储解决方案，支持文件、块和对象存储。

#### 7. 安装和配置

以下是 Ceph 集群的基本安装步骤：

1. **准备工作**：配置网络、时间同步和防火墙。
2. **安装 Ceph 软件**：在所有节点上安装 Ceph 软件包。
3. **配置集群**：初始化 Monitor 节点，创建初始的 Monitor 映射。
4. **部署 OSD**：在存储节点上创建和启动 OSD 实例。
5. **配置客户端**：根据需要配置 RBD、CephFS 或 RGW 客户端。

示例命令（基于 `ceph-deploy` 工具）：

```sh
# 安装 ceph-deploy 工具
sudo apt install ceph-deploy

# 创建 Ceph 集群目录
mkdir my-cluster
cd my-cluster

# 初始化 Monitor 节点
ceph-deploy new mon1

# 安装 Ceph 软件包
ceph-deploy install mon1 osd1 osd2 osd3

# 部署 Monitor 和 Manager
ceph-deploy mon create-initial
ceph-deploy mgr create mon1

# 部署 OSD
ceph-deploy osd create osd1:/dev/sdb osd2:/dev/sdb osd3:/dev/sdb

# 验证集群状态
ceph health
```

### 结论

Ceph 是一个功能强大且灵活的分布式存储系统，适用于多种应用场景。

它通过独特的架构设计和高效的算法实现高可用性、可扩展性和高性能，成为企业和云存储解决方案中的重要组成部分。

## 为什么要选择 ceph? 有哪些优缺点？

### 选择 Ceph 的理由

Ceph 是一个功能强大且灵活的分布式存储系统，适用于多种应用场景。以下是选择 Ceph 的主要理由：

1. **高可扩展性**：Ceph 能够水平扩展到数千个节点，适应不断增长的存储需求。
2. **多种存储模型**：支持对象存储、块存储和文件系统，提供统一的存储解决方案。
3. **无单点故障**：通过 CRUSH 算法和分布式架构，消除单点故障，提高系统可靠性。
4. **高性能**：通过并行 I/O 操作和智能数据分布机制，提供高性能的数据访问和处理能力。
5. **自动化管理**：具备自动故障恢复、数据再平衡和集群管理功能，降低运维复杂度。
6. **开源和社区支持**：Ceph 是开源项目，拥有活跃的社区和丰富的文档资源，便于获取支持和贡献代码。

### Ceph 的优缺点

#### 优点

1. **弹性扩展**
   - Ceph 可以在不影响服务的情况下，动态添加或移除存储节点，轻松扩展存储容量。

2. **高可靠性**
   - Ceph 通过多副本和纠删码机制确保数据的高可用性和持久性，即使在硬件故障情况下也能保证数据不丢失。

3. **多协议支持**
   - Ceph 同时支持对象存储（S3、Swift）、块存储（RBD）和文件系统（CephFS），满足不同应用的存储需求。

4. **自动化运维**
   - Ceph 具备自动故障检测和恢复功能，能够自动重新平衡数据，减轻管理员的运维压力。

5. **统一存储架构**
   - 提供统一的存储平台，支持不同类型的存储需求，简化了存储基础设施的管理。

6. **开源**
   - 作为一个开源项目，Ceph 允许用户自由使用、修改和分发，同时享受开源社区的支持和贡献。

#### 缺点

1. **复杂的部署和管理**
   - Ceph 的部署和管理较为复杂，需要深入了解其架构和配置，对运维人员的技术要求较高。

2. **高硬件要求**
   - Ceph 需要较高性能的网络和存储设备，以确保其高性能和可靠性。这可能导致较高的初始硬件成本。

3. **学习曲线陡峭**
   - 由于 Ceph 的功能丰富且灵活，初学者需要花费较多时间来学习和掌握其各项特性和最佳实践。

4. **性能开销**
   - 尽管 Ceph 提供了高性能，但其内置的冗余和数据保护机制会带来一定的性能开销，尤其是在写入操作较多的场景下。

5. **社区支持不均**
   - 尽管 Ceph 社区非常活跃，但某些特性或功能的支持可能不如商业存储解决方案那么完善和及时。

### 结论

选择 Ceph 作为分布式存储系统可以带来许多好处，尤其是在需要高扩展性和多样化存储需求的场景中。

然而，使用 Ceph 也需要考虑其复杂性和硬件要求。

总体而言，Ceph 是一个强大的解决方案，适合有能力管理复杂分布式系统并需要统一存储平台的企业和组织。

## ceph 的使用场景？

Ceph 的灵活性和高可扩展性使其适用于多种应用场景。以下是一些主要的使用场景：

### 1. 云存储平台

Ceph 可以作为云存储平台的基础，支持多租户环境，提供对象存储、块存储和文件系统。它与 OpenStack、Kubernetes 等云计算平台集成良好。

- **对象存储**：使用 Ceph 的 RADOS Gateway 提供兼容 S3 和 Swift 的对象存储服务。
- **块存储**：使用 Ceph 的 RADOS Block Device (RBD) 提供块存储服务，适用于虚拟机磁盘、数据库存储等。
- **文件存储**：使用 CephFS 提供 POSIX 兼容的文件系统服务。

### 2. 大数据分析

Ceph 能处理大规模的数据存储需求，适用于大数据分析场景。它提供高吞吐量的数据访问能力，适合 Hadoop、Spark 等大数据处理框架。

- **数据湖**：作为数据湖存储，集中存储和管理大规模结构化和非结构化数据。
- **数据处理**：支持高效的数据读取和写入，提升大数据分析任务的性能。

### 3. 高性能计算（HPC）

Ceph 提供高性能和低延迟的存储服务，适用于高性能计算环境，支持并行 I/O 操作。

- **科研计算**：用于科研计算集群的存储需求，提供高带宽和高 IOPS 的存储服务。
- **模拟与仿真**：支持复杂的模拟与仿真计算任务，满足高性能数据存储需求。

### 4. 企业存储

Ceph 可作为企业级存储解决方案，统一管理和提供文件、块和对象存储服务，满足企业多样化的存储需求。

- **备份和恢复**：提供高可靠性的备份和恢复服务，确保数据安全和持久性。
- **共享存储**：通过 CephFS 提供企业内部的共享文件存储，支持协作办公和数据共享。

### 5. 容器化存储

Ceph 与容器编排平台（如 Kubernetes）集成良好，提供持久化存储服务，支持容器化应用的存储需求。

- **持久卷**：通过 RBD 提供持久卷（Persistent Volume），支持容器化应用的数据持久化。
- **动态卷供应**：通过 CSI 插件实现动态卷供应，自动化管理容器存储资源。

### 6. 多媒体存储

Ceph 的对象存储能力适用于多媒体文件存储和流媒体服务，提供高吞吐量和大容量存储。

- **视频点播**：存储和分发视频内容，支持大规模并发访问。
- **内容分发网络（CDN）**：作为 CDN 的存储后端，提供高效的内容存储和分发服务。

### 7. 备份和归档

Ceph 提供高可靠性和数据保护功能，适合作为备份和归档存储解决方案。

- **数据备份**：提供数据备份和恢复服务，支持自动化备份策略。
- **数据归档**：存储长期归档数据，确保数据的持久性和可访问性。

### 具体应用示例

#### 1. 云服务提供商

- **OpenStack 集成**：许多 OpenStack 部署使用 Ceph 作为后端存储，为虚拟机磁盘、对象存储和共享文件系统提供支持。
- **Kubernetes 集成**：Ceph 作为 Kubernetes 的持久化存储后端，支持 StatefulSets 和其他持久化应用。

#### 2. 科研机构

- **大型科学计算项目**：科研机构使用 Ceph 存储和处理大规模科学数据，如基因组数据、天文数据等。
- **模拟和仿真**：支持高性能计算集群的存储需求，用于复杂的模拟和仿真任务。

#### 3. 媒体公司

- **视频存储和分发**：媒体公司使用 Ceph 存储和分发视频内容，支持视频点播和实时流媒体服务。
- **多媒体归档**：存储和管理大量的多媒体文件，实现高效的检索和访问。

#### 4. 大型企业

- **企业级备份**：企业使用 Ceph 进行数据备份和灾难恢复，确保业务连续性。
- **文件共享和协作**：通过 CephFS 提供企业内部的文件共享和协作平台，支持多用户访问。

Ceph 的灵活性、高可扩展性和丰富的功能使其成为各种场景下的理想存储解决方案。

## ceph 的入门使用例子，最好是 java 版本

要在 Java 项目中使用 Ceph，可以通过 RADOS Java 绑定来实现。RADOS 是 Ceph 的底层对象存储层，可以直接与之交互来进行对象存储操作。以下是一个简单的 Ceph 入门示例，演示如何在 Java 中连接到 Ceph 集群并执行基本的对象存储操作（如写入和读取数据）。

### 准备工作

1. **安装 Ceph 集群**：确保 Ceph 集群已经部署并运行。
2. **获取 Ceph 配置文件**：需要获取 `ceph.conf` 配置文件和密钥文件（通常是 `client.admin` 密钥环）。

### 使用 RADOS Java 绑定

#### 1. 添加依赖

首先，确保你的项目中包含 Ceph RADOS Java 绑定的依赖。以下是一个 Maven 项目的 `pom.xml` 配置：

```xml
<dependency>
    <groupId>org.ceph</groupId>
    <artifactId>rados</artifactId>
    <version>0.3.0</version>
</dependency>
```

#### 2. 编写 Java 代码

以下是一个简单的 Java 类，演示如何连接到 Ceph 集群并进行对象存储操作：

```java
import org.ceph.rados.IoCTX;
import org.ceph.rados.Rados;
import org.ceph.rados.RadosException;

public class CephExample {

    public static void main(String[] args) {
        String cephConfigFile = "/path/to/ceph.conf"; // Ceph 配置文件路径
        String cephKeyringFile = "/path/to/ceph.client.admin.keyring"; // Ceph 密钥环文件路径
        String poolName = "mypool"; // 使用的 Ceph pool 名称

        Rados rados = null;
        IoCTX ioctx = null;

        try {
            // 创建 Rados 对象
            rados = new Rados("admin");
            rados.confReadFile(cephConfigFile);
            rados.connect();

            System.out.println("Connected to Ceph cluster!");

            // 获取 IoCTX 对象
            ioctx = rados.ioCtxCreate(poolName);

            // 写入数据到 Ceph 对象存储
            String objectName = "exampleObject";
            byte[] data = "Hello Ceph!".getBytes();
            ioctx.write(objectName, data);

            System.out.println("Data written to object: " + objectName);

            // 读取数据从 Ceph 对象存储
            byte[] readData = new byte[data.length];
            ioctx.read(objectName, readData, 0);

            System.out.println("Data read from object: " + new String(readData));

        } catch (RadosException e) {
            e.printStackTrace();
        } finally {
            if (ioctx != null) {
                try {
                    ioctx.close();
                } catch (RadosException e) {
                    e.printStackTrace();
                }
            }
            if (rados != null) {
                try {
                    rados.shutDown();
                } catch (RadosException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

### 代码解释

1. **连接 Ceph 集群**：
   - 创建 `Rados` 对象并读取 Ceph 配置文件。
   - 使用 `connect()` 方法连接到 Ceph 集群。

2. **获取 IoCTX 对象**：
   - 使用 `rados.ioCtxCreate(poolName)` 方法获取指定 pool 的 `IoCTX` 对象。

3. **写入数据**：
   - 使用 `ioctx.write(objectName, data)` 方法将数据写入到 Ceph 对象存储中。

4. **读取数据**：
   - 使用 `ioctx.read(objectName, readData, 0)` 方法从 Ceph 对象存储中读取数据。

5. **关闭资源**：
   - 在 `finally` 块中，关闭 `IoCTX` 和 `Rados` 对象以释放资源。

### 注意事项

- **路径配置**：确保 `ceph.conf` 配置文件和密钥环文件路径正确。
- **权限配置**：使用合适的权限和密钥环文件，确保可以访问 Ceph 集群和 pool。
- **依赖管理**：确保项目中正确配置了 Ceph RADOS Java 绑定的依赖。

通过上述代码示例，你可以在 Java 项目中使用 Ceph 实现基本的对象存储操作。

更多高级功能可以参考 Ceph 的官方文档和 RADOS Java 绑定的文档。

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}