---
layout: post
title: 权限体系之-32-sso 什么是 LDAP?
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 是什么？

下面我给你一份 **既通俗易懂、又适合架构设计层面的 LDAP 全面讲解**。
不会讲得太学术，但比网上碎片化信息更系统、完整。

---

# 🧩 1. LDAP 是什么？

**LDAP = Lightweight Directory Access Protocol**

直译：轻量级目录访问协议。
它不是一个软件，而是一套 **查询目录结构数据的协议**。

更接地气一点说：

> **LDAP 是一个能存企业人员账号、组织架构、权限信息的树形数据库，并且能通过标准协议进行查询和认证。**

企业里常见的用户目录系统，如：

* Windows AD（Active Directory）
* OpenLDAP
* 389 Directory Server
* Apache Directory

本质上都遵循 **LDAP 协议**。

---

# 🏢 2. 企业为什么需要 LDAP？

因为企业里 “用户” 是跨系统的：

* 邮件系统
* VPN
* GitLab
* Jenkins
* 内网门户
* SSO 单点登录

每个都要登录，如果每个系统的用户不统一，简直灾难。

所以企业需要一个集中目录，统一管理：

* 员工账号（username）
* 密码
* 手机、邮箱、部门、职位
* 角色、权限（少部分存）
* 入职、离职、禁用统一同步

这个统一目录一般就是 LDAP 或 Active Directory。

---

# 🌲 3. LDAP 最大的特点：**树结构（Tree）**

不像 MySQL 的表，LDAP 用的是：

```
dc=example,dc=com
  ├── ou=People
  │       ├── uid=zhangsan
  │       └── uid=lisi
  └── ou=Groups
          ├── cn=admins
          └── cn=dev
```

关键词：

* **dc**（domain component）域名：example.com → dc=example,dc=com
* **ou**（organizational unit）组织（部门）
* **uid**（user id）用户
* **cn**（common name）名字（多用于组）

所以 LDAP 最核心就是：

**所有数据都以树状方式组织，通过 DN 唯一定位。**

例如用户：
`uid=zhangsan,ou=People,dc=example,dc=com`

这就是用户的唯一标识（就像数据库主键）。

---

# 🔐 4. LDAP 最重要的两个功能

## ✔（1）认证（Authentication）

LDAP 可以验证账号/密码是否正确：

你的系统会尝试用：

```
DN = uid=zhangsan,ou=People,dc=example,dc=com
password = ****
```

绑定（bind）LDAP 服务器，如果成功 → 用户存在且密码正确。

这就像你用 SSH 登录服务器一样。

---

## ✔（2）查询用户信息（Directory）

LDAP 是用来“查询”的，不是用来做 CRUD 的主数据存储。

可以查询：

* 某用户所在部门
* 部门下有哪些人
* 某组下有哪些成员
* 某个属性（如邮箱）

典型查询：

```
base: ou=People,dc=example,dc=com
filter: (uid=zhangsan)
attributes: cn, mail, mobile
```

---




# 👥 5. LDAP 适合存什么数据？

非常典型的：

| 字段           | 例子                                                  |
| ------------ | --------------------------------------------------- |
| uid          | zhangsan                                            |
| cn           | 张三                                                  |
| sn           | San                                                 |
| mail         | [zhangsan@example.com](mailto:zhangsan@example.com) |
| mobile       | 13800138000                                         |
| department   | 技术部                                                 |
| title        | 高级工程师                                               |
| userPassword | 加密密码                                                |

LDAP 不适合存：

* 日志
* 大字段
* 高频变更数据
* 列表型数据（如帖子、订单）

它是“目录”，不是关系型数据库。

---

# 🏛️ 6. LDAP 与 AD 有什么关系？

Active Directory（Windows 域控）是：

> **微软实现的 LDAP + Kerberos + 域策略 + 组策略 + 计算机管理的超集**

也就是说：

* AD 中 **用户数据的部分就是 LDAP**
* 所以 SSO、VPN、GitLab 也都可以集成 AD（用的就是 LDAP 协议）

企业里 80% 的“LDAP 集成”，其实就是“连接 Windows AD”。

---

# 🎯 7. LDAP 与 MySQL 用户体系的关系？

两者定位完全不同：

| 项目   | MySQL    | LDAP         |
| ---- | -------- | ------------ |
| 本质   | 数据库      | 目录服务（树结构）    |
| 用户标识 | id       | DN           |
| 密码校验 | 由系统业务判断  | LDAP 服务器判断   |
| 适合场景 | 小系统本地登录  | 企业级 SSO、统一身份 |
| 用户同步 | 本地业务系统管理 | 企业 IT 部门统一维护 |

你要做的是：

> **本地 MySQL 用户表 + LDAP 用户同步/映射 + 登录策略可配置**

这样就能支持企业接入 LDAP/AD。

---

# 📡 8. LDAP 登录验证原理（你系统需要实现的）

流程很简单：

### 🔹 步骤 1：根据配置拼用户 DN

例如：

配置：

```
uid={0},ou=People,dc=example,dc=com
```

用户输入：
zhangsan

拼成：

```
uid=zhangsan,ou=People,dc=example,dc=com
```

---

### 🔹 步骤 2：LDAP Bind 认证密码

```
ldap.bind(dn=拼好的DN, password)
```

成功 → 密码正确
失败 → 密码错误

---

### 🔹 步骤 3：读取用户属性

```
cn, mail, mobile, department, title...
```

---

### 🔹 步骤 4：同步/更新到你的本地 user 表

如果 user 不存在 → insert
存在 → update 部门、邮箱、真实姓名等

并记录：

```
source_type = LDAP
```

---

### 🔹 步骤 5：进入你本地登录流程（JWT、TOTP、冻结逻辑）

---

# 🧪 9. LDAP 测试方式（个人开发者也能用）

你可用：

### ✔ Docker 启动 OpenLDAP（最推荐）

5 分钟即可模拟企业 LDAP。

### ✔ phpldapadmin

可视化管理界面。

我已经告诉你完整步骤（你需要我再贴一次也可以）。

---

# 🧱 10. 总结（让你记得住）

用一句话概括 LDAP：

> **LDAP 是企业专用的用户目录协议，可以用来统一账号体系、验证密码、查询用户信息，并被各种系统用于单点登录与统一身份认证。**

你作为个人开发者常见的需求：

* 如何连接 LDAP？
* 如何绑定 DN？
* 如何同步用户？
* 如何设计兼容 LDAP 的登录体系？
* 如何给 SaaS 用户支持“本地 + LDAP”两种策略？

你现在做 Passport，这正是 LDAP 的典型场景。


* any list
{:toc}