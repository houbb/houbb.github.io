---
layout: post
title: cmdb 打通防火墙时真实的世界发生了什么？（机器、防火墙、交换机），核心原理+流程
date: 2026-02-28 21:01:55 +0800
categories: [DevOps]
tags: [devops, cmdb, sh]
published: true
---


# chat

这个问题非常好，因为它触及一个**很多平台架构被严重抽象掩盖的现实**：

> CMDB「打通防火墙」
> ≠ 调一个接口
>
> 而是 **整个网络控制平面在修改真实数据转发表**

我们从 **物理世界视角**拆，而不是平台视角。

---

# 一、先给最终物理结论

当你在 CMDB 点击：

```text
允许 A 机器访问 B:3306
```

真实世界发生的是：

> **多个网络设备的包转发决策逻辑被修改**

包括：

✅ Linux 主机
✅ 防火墙设备
✅ 交换机 / 路由器
✅ Overlay 网络节点

最终改变的是：

```text
数据包是否被丢弃
```

---

# 二、整体真实链路（控制面 → 数据面）

完整路径：

```text
CMDB
 ↓
网络自动化平台（NetOps）
 ↓
防火墙控制API
 ↓
防火墙策略引擎更新
 ↓
TCAM / Rule Table 更新
 ↓
交换机路由可达
 ↓
数据包开始通过
```

注意：

> **没有任何“连接被建立”**

只是：

```text
drop → allow
```

---

# 三、先理解：通信为什么原本不通？

假设：

```
App Server ----X---- DB Server
```

数据包路径：

```text
App
 ↓
Host Network Stack
 ↓
TOR交换机
 ↓
核心交换机
 ↓
防火墙
 ❌ DROP
 ↓
DB
```

防火墙默认：

```text
deny any any
```

---

# 四、Step 1：CMDB 中发生什么？

CMDB 写入：

```json
{
  "src": "app01",
  "dst": "db01",
  "port": 3306,
  "action": "allow"
}
```

但这里有一个关键动作：

> CMDB 必须解析 **资产 → 网络身份**

---

## CMDB 做资产解析

例如：

| 资产    | 解析结果      |
| ----- | --------- |
| app01 | 10.1.1.23 |
| db01  | 10.2.5.8  |
| zone  | prod-db   |

变成：

```text
10.1.1.23 → 10.2.5.8:3306 allow
```

---

# 五、Step 2：进入网络控制平台（真正核心）

企业不会让 CMDB 直接改防火墙。

通常：

```text
CMDB
 ↓
NetOps / Firewall Controller
```

类似：

* Palo Alto Panorama
* FortiManager
* SDN Controller

作用：

> **统一生成网络策略**

---

这里发生：

### 策略编译（非常关键）

人类规则：

```text
app → db
```

被编译为：

```text
ACL Rule
Security Policy
NAT Rule
Zone Policy
```

---

# 六、Step 3：防火墙真实发生什么？

控制器调用：

```http
POST /api/security/rules
```

到防火墙。

---

防火墙内部流程：

---

## ① Policy Table 更新

新增规则：

```text
allow
src=10.1.1.23
dst=10.2.5.8
port=3306
```

---

## ② 策略重新排序

防火墙执行：

```text
top-down match
```

重新计算匹配顺序。

---

---

## ③ 写入硬件 TCAM（关键）

现代防火墙不是软件匹配。

而是：

```text
TCAM（Ternary CAM）
```

专用芯片。

规则被写入：

```
SRC IP | DST IP | PORT | ACTION
```

硬件级匹配。

---

物理世界变化：

> ASIC 芯片中的查找表被修改。

---

# 七、Step 4：交换机 / 路由世界变化

很多人不知道：

打通防火墙通常伴随：

---

## 路由确认

控制器验证：

```text
是否存在路由路径？
```

可能下发：

### 静态路由

或

### BGP 更新

例如：

```text
10.2.5.0/24 reachable via FW-01
```

---

交换机更新：

```text
FIB（Forwarding Information Base）
```

---

物理变化：

> 交换芯片转发表改变。

---

# 八、Step 5：Linux 主机发生什么？

如果是云/容器环境：

还可能修改：

---

## Host iptables

例如：

```bash
iptables -A FORWARD ...
```

或：

```bash
nft add rule
```

---

Kernel 更新：

```text
netfilter rule chain
```

---

数据路径：

```text
NIC
 ↓
Kernel Netfilter Hook
 ↓
ACCEPT
```

---

---

# 九、真正关键：第一包通过瞬间

当 App 发起：

```text
TCP SYN
```

真实路径：

---

## 以前

```
FW lookup → no match → DROP
```

---

## 现在

```
FW lookup → rule hit → ALLOW
```

---

随后：

防火墙创建：

```text
Session Table Entry
```

记录：

```
src/dst/port/state
```

之后流量：

✅ 不再查ACL
✅ 直接 fast-path

---

物理世界新增：

> 一个 TCP session 状态。

---

# 十、整个网络真实变化总结

CMDB 打通防火墙，本质修改了：

| 设备    | 变化                   |
| ----- | -------------------- |
| CMDB  | 资产关系                 |
| 控制器   | 策略模型                 |
| 防火墙   | ACL + Session Engine |
| ASIC  | TCAM表                |
| 交换机   | FIB                  |
| Linux | netfilter            |
| 网络    | 允许转发                 |

---

# 十一、最本质的一句话

CMDB 打通防火墙时：

```text
不是建立连接
而是改变网络设备对数据包的判决函数
```

即：

```text
f(packet) = DROP
      ↓
f(packet) = FORWARD
```

---

# 十二、为什么这对 AIOps 极其重要

因为网络故障真实发生在：

```
CMDB状态 ✅
防火墙策略 ✅
但：
TCAM未下发 ❌
Session未刷新 ❌
Route未收敛 ❌
Conntrack冲突 ❌
```

AI 若看不到：

* Session table
* FIB
* Netfilter
* ARP
* Route convergence

就永远误判。

---

# 十三、终极真实视角（工程师级）

一次“开通端口”实际是：

```text
分布式网络状态同步过程
```

涉及：

* 控制面一致性
* 硬件表更新
* 路由收敛
* 状态机建立

# 参考资料

* any list
{:toc}