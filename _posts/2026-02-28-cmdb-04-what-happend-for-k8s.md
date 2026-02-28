---
layout: post
title: cmdb 分配机器资源时发生了什么？ k8s 核心原理+物理世界的真实变化
date: 2026-02-28 21:01:55 +0800
categories: [DevOps]
tags: [devops, cmdb, sh]
published: true
---


# chat

很好，这一步其实已经进入 **现代云计算真正的执行路径**了。

你问的是：

> ✅ 当 CMDB 在 Kubernetes 中“分配机器资源（创建实例 / Pod）”时
> **从控制面到 Linux Kernel，物理世界到底发生了什么？**

我们直接按 **真实生产级时间线**拆解。

---

# 一、先给最终物理结论

当你在 CMDB / 平台点击：

```text
申请一个应用实例（K8s）
```

最终物理世界发生的是：

> **某台 Linux 服务器新增了一组被 cgroup + namespace 隔离的进程。**

但相比 Docker：

✅ 多了一整层 **分布式控制系统**

---

整体本质：

```text
Kubernetes = 分布式容器状态机
```

---

# 二、完整链路总览（极其重要）

真实路径：

```text
CMDB
 ↓
平台API / PaaS
 ↓
Kubernetes API Server
 ↓
etcd（状态存储）
 ↓
Scheduler
 ↓
kubelet（目标Node）
 ↓
container runtime
 ↓
runc
 ↓ syscall
Linux Kernel
 ↓
CPU / Memory / Network / Disk
```

真正改变物理世界的位置只有：

> ✅ kubelet → runtime → runc → Kernel

---

# 三、Step 1：CMDB 发生了什么？

CMDB 创建：

```json
{
  "app": "order-service",
  "cpu": "2",
  "memory": "4Gi"
}
```

然后调用：

```http
POST /apis/apps/v1/deployments
```

发送给：

```text
Kubernetes API Server
```

---

关键认知：

> Kubernetes **不创建资源**
>
> Kubernetes 只记录 **期望状态（Desired State）**

---

# 四、Step 2：API Server 写入 etcd

API Server 做：

```text
validate
auth
admission
```

然后写入：

```text
etcd
```

etcd 内：

```yaml
Pod:
  name: order-xxx
  cpu: 2
  mem: 4Gi
  node: null
```

注意：

⚠️ Pod 仍不存在。

---

K8s 此刻只是说：

> 世界应该存在一个 Pod。

---

# 五、Step 3：Scheduler 开始工作

Scheduler 持续 Watch：

```text
未绑定Node的Pod
```

---

它查询：

```text
Node-A  剩余 8CPU
Node-B  剩余 1CPU ❌
Node-C  剩余 32CPU ✅
```

执行：

```text
Filter → Score → Bind
```

最终：

```text
Pod → Node-C
```

Scheduler 更新 etcd：

```yaml
nodeName: node-c
```

---

⚠️ 仍然没有容器。

---

# 六、Step 4：kubelet 接管（关键转折）

每台机器运行：

```bash
kubelet
```

它持续 Watch：

```text
API Server
```

当发现：

```text
有Pod属于自己
```

kubelet 开始：

> **让现实世界符合声明状态**

---

这一步极其重要：

```text
K8s = reconciliation loop
```

---

# 七、Step 5：kubelet 调用 Container Runtime

kubelet 不创建容器。

它调用：

```text
CRI（Container Runtime Interface）
```

例如：

* containerd
* CRI-O

调用：

```text
RunPodSandbox()
CreateContainer()
StartContainer()
```

---

进入 runtime。

---

# 八、Step 6：containerd → runc

containerd：

1. 拉镜像
2. 准备 rootfs
3. 生成 OCI spec

然后执行：

```bash
runc create
runc start
```

---

真正进入 Linux Kernel。

---

# 九、Step 7：Linux Kernel 真实变化（核心）

现在开始是**物理世界变化**。

---

## ① 创建 Namespace

runc 调用：

```c
clone()
```

Kernel 创建：

| Namespace | 隔离内容     |
| --------- | -------- |
| PID       | 进程       |
| NET       | 网络       |
| MNT       | 文件系统     |
| IPC       | 信号       |
| UTS       | hostname |
| USER      | 用户       |

---

结果：

```text
新的进程视角宇宙
```

---

## ② 创建 cgroup（真正资源分配）

kubelet 提前创建：

```bash
/sys/fs/cgroup/kubepods/
```

结构：

```text
kubepods
 └ burstable
     └ podUID
         └ containerID
```

---

写入：

### CPU

```text
cpu.max
```

限制 CPU 时间片。

---

### Memory

```text
memory.max=4G
```

Kernel memcg 生效。

---

物理世界改变：

> Linux Scheduler 调度策略发生变化。

---

## ③ OverlayFS 挂载

镜像层：

```text
readonly layers
+
writable layer
```

Kernel：

```text
mount overlayfs
```

生成容器 rootfs。

---

## ④ 网络创建（最复杂）

kubelet 调用：

```text
CNI Plugin
```

如：

* Calico
* Flannel
* Cilium

---

CNI 执行：

```bash
ip netns add
veth pair create
```

结构：

```text
Pod eth0
   ↓
veth
   ↓
host bridge / vxlan / ebpf
   ↓
Node Network
```

---

物理变化：

✅ routing table 修改
✅ iptables/eBPF rule 注入

---

# 十、Step 8：容器进程启动

最终：

```c
execve()
```

例如：

```text
/nginx
```

Linux 创建：

```text
普通进程
```

只是属于：

```text
namespace + cgroup
```

---

Pod Running。

---

# 十一、CMDB 最后才更新

流程：

```text
Container Running
      ↓
kubelet report status
      ↓
API Server
      ↓
平台同步
      ↓
CMDB status=Running
```

---

CMDB 永远是：

> 最后知道的人。

---

# 十二、整个流程一句话（核心理解）

当 CMDB 在 K8s 中分配资源：

```text
CMDB 定义期望
↓
K8s 保存状态
↓
Scheduler 选择节点
↓
kubelet 驱动 runtime
↓
runc 调 syscall
↓
Linux Kernel 创建隔离进程
↓
硬件调度规则改变
```

---

# 十三、物理服务器真实发生的变化

假设 Node：

```text
64 CPU
256G RAM
```

新增一个 Pod 后：

物理世界仅新增：

✅ 几个 Linux 进程
✅ 新 cgroup
✅ namespace
✅ overlay mount
✅ veth
✅ iptables/eBPF 规则

没有 VM。

---

# 十四、最重要的认知升级（AIOps核心）

K8s 故障 ≠ Pod 问题。

真实层级：

```text
Pod
 ↓
cgroup
 ↓
Linux Scheduler
 ↓
NUMA
 ↓
CPU Cache
 ↓
Hardware
```

AI Root Cause 如果看不到：

```text
cgroup throttle
memory reclaim
runqueue latency
```

就永远定位不到问题。

# 参考资料

* any list
{:toc}