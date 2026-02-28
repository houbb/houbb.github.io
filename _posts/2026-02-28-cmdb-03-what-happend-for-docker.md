---
layout: post
title: cmdb 分配机器资源时发生了什么？docker 核心原理+物理世界的真实变化
date: 2026-02-28 21:01:55 +0800
categories: [DevOps]
tags: [devops, cmdb, sh]
published: true
---





# chat

这次我们把问题**严格限定在 Docker 场景**：

> ✅ 当 CMDB “分配一台机器（Docker实例/容器）”时
> **物理世界到底发生了什么？Linux 内核具体改变了什么？**

这里和 KVM 完全不同。

因为：

> **Docker 不创建机器，它重新切割 Linux 本身。**

下面按 **真实内核执行路径**拆。

---

# 一、先给最终物理结论（非常关键）

当 CMDB 分配一个 Docker 实例时：

❌ 没有新机器
❌ 没有虚拟 CPU
❌ 没有虚拟内存

真实发生的是：

> **Linux Kernel 创建了一组被隔离与限额控制的进程。**

一句话：

```text
Docker Container = 带 namespace + cgroup 的 Linux Process
```

---

# 二、整体链路（从点击申请开始）

假设你在平台点击：

```text
申请一个 2C4G 应用实例
```

真实链路：

```text
CMDB
 ↓
调度系统（K8s / PaaS）
 ↓
Container Runtime
 ↓
containerd
 ↓
runc
 ↓ syscall
Linux Kernel
 ↓
namespace + cgroup + overlayfs
 ↓
CPU / Memory / Network / Disk
```

真正改变物理世界的是：

> **runc → Linux syscall**

---

# 三、Step 1：CMDB 世界发生什么？

CMDB 创建：

```json
{
  "instance": "app-1021",
  "cpu":2,
  "mem":4G,
  "image":"nginx"
}
```

此时：

⚠️ 容器不存在。

只是：

> 世界模型新增一个“期望实例”。

---

# 四、Step 2：调度节点（关键）

调度器选择：

```text
Node-A 剩余资源：
CPU: 8
MEM: 16G
```

决定：

```text
容器将在 Node-A 上运行
```

然后调用：

```bash
containerd create
```

---

这里才真正进入 Linux。

---

# 五、Docker 真正启动流程

Docker CLI 实际早已退出历史舞台。

真实组件：

```text
dockerd
  ↓
containerd
  ↓
runc（核心）
```

---

## ⭐ runc 是关键

runc 是：

> OCI 标准容器执行器

它直接调用 Linux syscall。

---

# 六、物理世界第一变化：创建 Namespace

runc 调用：

```c
clone()
```

带参数：

```c
CLONE_NEWNS
CLONE_NEWPID
CLONE_NEWNET
CLONE_NEWUTS
CLONE_NEWIPC
CLONE_NEWUSER
```

---

Linux Kernel 执行：

```text
copy_namespaces()
```

系统产生：

---

## 1️⃣ PID Namespace

容器内：

```bash
ps
```

看到：

```text
PID 1 nginx
```

真实物理世界：

```text
Host PID 38291
```

Kernel 维护：

```text
pid mapping table
```

---

没有新机器。

只是：

> 不同视角。

---

## 2️⃣ Network Namespace

Kernel 创建：

```text
独立网络栈
```

包括：

* routing table
* iptables
* socket space

容器认为：

```text
自己拥有 eth0
```

但实际上：

```text
veth pair
```

结构：

```text
Container eth0
     ↓
vethxxxx
     ↓
Linux bridge (docker0)
     ↓
Host NIC
```

---

物理网卡没有变化。

只是：

> Kernel 网络路径新增转发规则。

---

## 3️⃣ Mount Namespace

容器看到：

```text
/
```

其实是：

```text
overlayfs mount
```

---

# 七、物理世界第二变化：文件系统（OverlayFS）

镜像：

```text
nginx:latest
```

结构：

```text
lower layer  (readonly)
upper layer  (write)
merged layer
```

Kernel 执行：

```text
mount overlayfs
```

结果：

```text
容器拥有独立文件系统视图
```

但磁盘：

✅ 没复制
✅ 没创建系统

只是：

> Union Mount。

---

# 八、物理世界第三变化：资源限制（最核心）

真正的“分配资源”发生在这里。

---

## cgroup 创建

runc 写入：

```bash
/sys/fs/cgroup/
```

例如：

---

### CPU 限制

```bash
cpu.max
```

写入：

```text
200000 100000
```

含义：

```text
最多使用2个CPU时间片
```

---

Kernel Scheduler 开始：

```text
CFS bandwidth control
```

限制该进程组。

---

### Memory 限制

```bash
memory.max = 4G
```

Kernel：

```text
memcg subsystem
```

追踪：

```text
page allocation
```

超过：

👉 OOM Kill。

---

注意：

> 没有分配4G内存
> 只是限制最多能用4G

---

# 九、物理世界第四变化：启动进程

最终：

```c
execve("/nginx")
```

Linux：

```text
创建普通进程
```

区别仅在：

```text
namespace + cgroup
```

---

容器运行时：

```bash
top
```

你能看到：

```text
nginx
```

它只是 Host 进程。

---

# 十、此刻物理服务器真实状态

假设：

```text
64 Core
256G RAM
```

创建 100 个容器后：

物理世界只有：

✅ 更多 Linux 进程
✅ 更多 cgroup
✅ 更多 namespace
✅ overlay mount
✅ veth 网络

没有 VM。

---

# 十一、CMDB 此时发生什么？

runtime 返回：

```text
container_id=abc123
node=node-A
```

CMDB 更新：

```text
status=running
```

CMDB 仍然：

> 状态观察者。

---

# 十二、Docker vs KVM 本质差异（物理级）

|        | KVM   | Docker |
| ------ | ----- | ------ |
| 是否新OS  | ✅     | ❌      |
| Kernel | 独立    | 共享     |
| CPU    | 虚拟CPU | 调度限制   |
| 内存     | 独立映射  | 限额     |
| 启动     | 秒级    | 毫秒     |
| 本质     | 虚拟机器  | 隔离进程   |

---

# 十三、真正震撼的一点（很多人没意识到）

当 CMDB “创建1000容器”：

物理世界只是：

```text
Linux 新增1000个进程
```

而不是：

```text
1000台机器
```

---

# 十四、终极一句话总结

当 CMDB 分配 Docker 资源时：

```text
CMDB 定义期望状态
↓
调度系统选择节点
↓
runc 调用 clone()/cgroup/mount
↓
Linux Kernel 创建隔离进程
↓
CPU/Memory 调度规则改变
```

---

# 十五、这对 AIOps 极其关键

容器问题本质来自：

```text
共享 Kernel
```

因此产生：

* CPU throttle
* memory reclaim
* IO contention
* noisy neighbor

而这些：

👉 全发生在 Kernel scheduler 与 cgroup。


# 参考资料

* any list
{:toc}