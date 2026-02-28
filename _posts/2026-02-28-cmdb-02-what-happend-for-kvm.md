---
layout: post
title: cmdb 分配机器资源时发生了什么？kvm 核心原理+物理世界
date: 2026-02-28 21:01:55 +0800
categories: [DevOps]
tags: [devops, cmdb, sh]
published: true
---





# chat

## kvm 发生了什么？


这个问题非常好，因为很多人**误以为 CMDB 在“分配机器”**，但实际上：

> **CMDB 不负责创建资源，它负责“定义世界 + 驱动资源编排”。**

真正发生的是一条从 **业务 → CMDB → 调度系统 → 虚拟化 → 物理硬件** 的完整链路。

下面我用 **物理世界视角 + KVM 内核机制**，把整个过程拆开。

---

# 一、先纠正一个关键认知

当你在平台点击：

```
申请一台 4C8G Linux 主机
```

很多系统里看起来是：

```
CMDB → 创建机器 ✅
```

但真实世界是：

```
CMDB（状态系统）
        ↓
资源编排系统
        ↓
虚拟化平台(KVM)
        ↓
Linux Kernel
        ↓
CPU / 内存 / 硬盘 / 网卡
```

CMDB **只改变“世界模型”**。

真正改变物理世界的是：

> **Hypervisor（KVM）**

---

# 二、整体真实链路（从点击按钮开始）

我们按时间顺序看。

---

## Step 1：用户申请资源（逻辑世界）

用户提交：

```json
{
  "cpu": 4,
  "memory": 8G,
  "os": "ubuntu",
  "env": "prod"
}
```

此时发生：

### ✅ CMDB 创建 CI

CMDB 新增：

```
CI: vm-10234
status: pending
cpu:4
mem:8G
```

注意：

⚠️ **此时机器不存在**

只是：

> 世界模型中出现了一台“未来机器”。

---

## Step 2：资源调度（真正关键）

资源调度系统开始工作：

类似：

* OpenStack Nova
* VMware vCenter
* 自研调度器

它会查询：

```
CMDB + 资源池
```

例如：

```
Host-A  剩余 16C 64G
Host-B  剩余 2C 4G ❌
Host-C  剩余 32C 128G ✅
```

调度算法：

```
Filter → Score → Select
```

结果：

```
选择 Host-C
```

---

此刻发生的本质：

> **决定 VM 将绑定哪台物理服务器**

---

# 三、进入 KVM 世界（核心开始）

调度器调用：

```
libvirt / QEMU
```

例如：

```bash
virsh create vm.xml
```

这里才是真正的“造机器”。

---

# 四、KVM 的核心原理（物理世界）

KVM 本质不是虚拟机软件。

### ⭐ KVM = Linux Kernel Module

```
kvm.ko
kvm-intel.ko
```

加载后：

Linux 变成：

> Type-1 Hypervisor

---

## CPU 虚拟化发生了什么？

物理 CPU 有特权级：

```
Ring 0  → OS Kernel
Ring 3  → User Program
```

问题：

VM 里的 Guest OS 也想当 Ring0。

怎么办？

---

### Intel VT-x / AMD-V 登场

CPU 新增模式：

```
Root Mode      (Host)
Non-root Mode  (Guest VM)
```

结构：

```
物理CPU
 ├── Host Linux
 └── Guest OS
```

---

执行流程：

```
Guest OS 指令
     ↓
CPU检测特权指令
     ↓
VM Exit
     ↓
KVM Kernel 接管
     ↓
模拟执行
     ↓
VM Resume
```

这叫：

> **Trap & Emulate**

---

换句话说：

👉 VM 以为自己控制 CPU
👉 实际 CPU 在骗它

---

## 内存虚拟化发生了什么？

VM 认为：

```
自己拥有 0~8GB RAM
```

但真实：

```
Guest Virtual Address
        ↓
Guest Physical Address
        ↓
Host Physical Address
```

两层页表：

```
Guest Page Table
+
EPT (Extended Page Table)
```

CPU 自动完成地址转换。

结果：

```
VM memory → Host memory page
```

---

本质：

> VM 的内存只是 Host 内存的一块映射。

---

## 磁盘发生了什么？

VM 看到：

```
/dev/sda
```

真实是：

```
/var/lib/libvirt/images/vm.qcow2
```

即：

> 一个文件。

QEMU 把文件模拟成：

```
虚拟块设备
```

---

## 网络发生了什么？

创建：

```
tap device
```

结构：

```
VM eth0
   ↓
TAP
   ↓
Linux Bridge / OVS
   ↓
物理网卡
```

VM 网络其实是：

> Linux 网络命名空间 + 虚拟网卡。

---

# 五、物理服务器此时真实状态

假设 Host-C：

```
物理机：
CPU: 64 Core
Mem: 256G
```

创建 VM 后：

Linux Kernel 内：

```
QEMU Process
   PID 23124
```

非常重要：

> **VM = 一个 Linux 进程**

你甚至可以：

```bash
top
```

看到它。

---

资源限制来自：

```
cgroups
```

例如：

```
cpu quota
memory limit
```

---

# 六、创建完成后的 CMDB 更新

虚拟机启动成功。

编排系统回写：

```
vm-10234
status: running
host: Host-C
ip: 10.0.1.23
```

CMDB 世界模型更新。

---

注意顺序：

```
先物理创建
再CMDB确认
```

否则出现：

> 幽灵机器（CMDB存在但真实不存在）

---

# 七、整个链路一句话总结

当 CMDB “分配机器”时：

```
CMDB
  ↓ 定义目标状态
Scheduler
  ↓ 选择物理资源
KVM
  ↓ 创建虚拟硬件
Linux Kernel
  ↓ 管理资源
CPU/Memory/NIC/Disk
```

---

# 八、真正的本质（很多人没意识到）

现代数据中心其实是：

```
一台超级计算机
```

而：

| 层         | 本质     |
| --------- | ------ |
| CMDB      | 世界模型   |
| Scheduler | 大脑     |
| KVM       | 虚拟物理定律 |
| Linux     | 操作系统   |
| Server    | 细胞     |

---

# 九、为什么这对 AIOps 极其重要（关键洞察）

当发生报警：

```
VM CPU 100%
```

AI 如果不知道：

```
VM → Host → NUMA → Disk → Network
```

就无法推理：

* noisy neighbor
* CPU steal
* IO contention
* host overload

而这些关系：

👉 全在 CMDB + 虚拟化层。


## 通讯流程？


好，这次我们**严格聚焦一个点**：

> ✅ **当 CMDB 分配机器 → KVM 创建 VM 时，CMDB 如何与 Linux 通讯？到底谁在和谁说话？Linux 内核具体发生了什么？**

我们直接沿着 **真实创建 VM 的 syscall 路径**往下走。

---

# 一、先给最终结论（避免认知偏差）

在 **KVM 资源开辟阶段**：

> ❗CMDB 并不直接与 Linux 通讯
> ❗CMDB 甚至不知道 KVM 存在

真正链路是：

```text
CMDB
 ↓ API
虚拟化管理层（Nova / libvirt / 自研）
 ↓
libvirt
 ↓
QEMU
 ↓ ioctl()
KVM Kernel Module
 ↓
Linux Scheduler / MM / Net / Block
 ↓
物理硬件
```

关键通信发生在：

> **QEMU ↔ Linux Kernel(KVM)**

而不是 CMDB。

---

# 二、从“点击申请VM”开始（真实时间线）

假设你点击：

```text
申请 4C8G VM
```

---

## Step 1️⃣ CMDB 改变世界状态

CMDB 写入：

```text
vm-1001
cpu=4
mem=8G
status=creating
```

然后调用：

```http
POST /create_vm
```

到：

* OpenStack Nova
* 或内部 IaaS Controller

👉 到这里仍然没有 Linux 参与。

---

# 三、真正进入 Linux 的入口

管理系统调用：

```bash
libvirt
```

例如：

```bash
virsh define vm.xml
virsh start vm
```

---

libvirt 做了一件关键事情：

> **启动 QEMU 进程**

---

# 四、关键认知：VM = 一个 Linux 进程

创建后：

```bash
ps aux | grep qemu
```

你会看到：

```text
qemu-system-x86_64
```

这就是你的虚拟机。

---

此刻 Linux 看见的只是：

```text
普通进程
```

---

# 五、QEMU 如何和 Linux Kernel 通讯？

这里才是核心。

---

## ⭐ KVM 暴露设备文件

加载模块：

```bash
modprobe kvm
modprobe kvm_intel
```

Linux 出现：

```bash
/dev/kvm
```

非常关键：

> `/dev/kvm` 是 **Kernel 提供给用户态的虚拟化入口**

---

结构：

```text
User Space(QEMU)
        ↓
   /dev/kvm
        ↓ ioctl
KVM Kernel Module
        ↓
CPU/MMU
```

---

# 六、真正的通讯方式：ioctl()

QEMU 打开：

```c
fd = open("/dev/kvm")
```

然后疯狂调用：

```c
ioctl(fd, KVM_CREATE_VM)
```

---

这一步发生什么？

Linux Kernel：

```text
kvm_dev_ioctl()
```

被触发。

---

内核开始：

```text
创建 struct kvm
```

代表：

> 一台虚拟机诞生。

---

# 七、CPU 资源开辟（最核心）

QEMU：

```c
ioctl(KVM_CREATE_VCPU)
```

Kernel：

```text
kvm_arch_vcpu_create()
```

发生：

✅ 分配 vCPU 结构
✅ 绑定物理 CPU 调度
✅ 初始化 VMCS（Intel）

---

CPU 世界变成：

```text
Physical CPU
   ├ Host Task
   └ VM vCPU Thread
```

重要事实：

> **每个 vCPU = Linux Thread**

Linux Scheduler 直接调度它。

---

# 八、内存资源开辟

QEMU 先申请：

```c
mmap()
```

例如：

```c
mmap(8GB)
```

Linux：

```text
do_mmap()
```

分配 Host RAM。

---

然后：

```c
ioctl(KVM_SET_USER_MEMORY_REGION)
```

告诉 KVM：

```text
这块内存属于VM
```

Kernel 建立：

```text
Guest Physical → Host Physical
```

EPT 映射。

---

结果：

VM 的 RAM：

> 只是 Linux 内存页。

---

# 九、磁盘资源发生什么？

QEMU 打开：

```bash
vm.qcow2
```

Linux：

```text
VFS
 ↓
ext4/xfs
 ↓
block layer
```

QEMU 模拟：

```text
virtio-blk
```

Guest OS 认为：

```text
/dev/sda
```

其实：

> 文件 IO。

---

# 十、网络资源开辟

QEMU 调用：

```bash
ip tuntap add tap0
```

Kernel 创建：

```text
tap device
```

路径：

```text
VM
 ↓
virtio-net
 ↓
tap
 ↓
linux bridge / OVS
 ↓
NIC
```

---

# 十一、VM 启动瞬间（最关键）

QEMU 执行：

```c
ioctl(KVM_RUN)
```

CPU 进入：

```text
Guest Mode
```

Intel VT-x：

```text
VM Entry
```

Guest OS 开始执行。

---

这一刻：

> VM 真正“活了”。

---

# 十二、CMDB 此时发生什么？

注意顺序：

```text
VM 已在 Kernel 中运行
        ↓
管理层检测成功
        ↓
回写 CMDB
```

CMDB 更新：

```text
status = running
host = compute-12
```

---

CMDB **只是观察者**。

---

# 十三、完整通讯链（物理级）

最终真实链路：

```text
CMDB
 ↓ REST
Cloud Controller
 ↓ libvirt API
QEMU Process
 ↓ ioctl()
/dev/kvm
 ↓
KVM Kernel Module
 ↓
Linux Scheduler/MM
 ↓
CPU / RAM / NIC
```

---

# 十四、真正本质（很多架构师都会误解）

在 KVM 创建资源时：

| 组件           | 角色      |
| ------------ | ------- |
| CMDB         | 状态定义    |
| Scheduler    | 决策      |
| libvirt      | 翻译器     |
| QEMU         | 用户态硬件模拟 |
| KVM          | CPU虚拟化  |
| Linux Kernel | 真正资源拥有者 |

---

所以答案一句话：

> **CMDB 通过虚拟化控制面间接驱动 QEMU，而 QEMU 通过 `/dev/kvm` 的 ioctl 系统调用与 Linux Kernel 通讯完成资源开辟。**

# 参考资料

* any list
{:toc}