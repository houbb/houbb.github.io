---
layout: post
title: 权限体系之-05-passport 登录登出 session 管理
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 系统级登录 / 登出 Session 管理设计方案

> 目标：构建一套统一、可控、可审计的用户 Session 生命周期管理体系，覆盖登录态创建、续期、失效、强制下线、设备管理等能力，同时清晰拆分管理员与用户两个视角，保障系统安全与用户体验。

---

## 一、建设目标

1. 统一管理所有用户登录 Session
2. 可视化展示当前在线状态与历史会话
3. 支持强制下线、多端控制与风险阻断
4. 为后续安全风控提供基础数据
5. 支撑分布式、微服务 Session 协同

关键词：

* 生命周期可控
* 权限清晰
* 审计可追溯
* 易扩展

---

## 二、Session 管理总体架构

### 核心流程

```
登录成功 → 创建 Session → 写入 Session 表 → 返回 Token
                    ↓
           定期心跳 / 刷新
                    ↓
        用户登出 / 超时 / 强制失效
```

### 模块划分

* session-core：Session 生命周期核心逻辑
* session-manager：管理员管理模块
* session-self：用户自管理模块

---

## 三、数据库设计

新增表：`sys_user_session`

### 基础字段（必须包含）

```
id           bigint(20)   PK 自增
status       tinyint(4)   状态
create_time  datetime(3)  创建时间
update_time  datetime(3)  更新时间
creator_id   bigint(20)   创建人
updater_id   bigint(20)   修改人
delete_flag  tinyint(4)   逻辑删除标识
```

### 业务字段设计

| 字段               | 类型           | 说明                  |
| ---------------- | ------------ | ------------------- |
| user_id          | bigint       | 用户ID                |
| username         | varchar(100) | 用户名                 |
| session_id       | varchar(128) | Session 唯一标识        |
| token            | varchar(512) | 登录凭证                |
| device_id        | varchar(128) | 设备指纹                |
| device_type      | varchar(50)  | 设备类型                |
| os               | varchar(100) | 操作系统                |
| browser          | varchar(100) | 浏览器                 |
| ip_address       | varchar(64)  | 登录IP                |
| location         | varchar(100) | 登录地                 |
| login_time       | datetime(3)  | 登录时间                |
| last_active_time | datetime(3)  | 最近活跃时间              |
| expire_time      | datetime(3)  | 过期时间                |
| session_status   | tinyint      | 会话状态：1在线 2已失效 3被踢下线 |
| logout_reason    | tinyint      | 登出原因：1主动 2超时 3管理员强制 |
| risk_level       | tinyint      | 风险等级                |

推荐索引：

* idx_user_id
* idx_session_id
* idx_status
* idx_last_active_time

---

## 四、开发规范约束方案

### 后端规范引用

* 参考 1~2 个旧 Session 或 Token 管理类设计风格
* 复用已有工具类：

  * 时间处理工具
  * IP 工具
  * Token 工具

设计原则：

* 高内聚、低耦合
* 单职责清晰
* 禁止 lombok + beanCopy
* XML 查询必须进行 < > 符号转义

---

## 五、角色视角拆分

### 管理员视角

定位：全局 Session 管控中心

菜单路径：

```
安全设计 → Session 管理
```

权限范围：

* 查看所有用户 Session
* 强制下线任意用户
* 批量清理异常 Session
* 风险标记

### 用户视角

定位：个人设备与登录态管理

菜单路径：

```
头像下拉 → 登录设备管理
```

权限范围：

* 查看自己的 Session
* 下线其他设备
* 查看登录设备历史

---

## 六、管理员 Session 管理页面设计

### 页面结构

```
筛选区
会话列表
分页
详情抽屉
```

### 筛选条件

* 用户名 / ID
* IP 地址
* 设备类型
* Session 状态
* 时间范围
* 风险等级

### 列表字段

| 字段        | 说明 |
| --------- | -- |
| 用户名       |    |
| IP地址      |    |
| 设备        |    |
| 浏览器       |    |
| 最近活跃      |    |
| Session状态 |    |
| 风险等级      |    |
| 操作        |    |

### 操作按钮

* 强制下线
* 标记为风险
* 查看详情
* 导出

### 详情抽屉

分区：

* 基本信息
* 设备信息
* 网络轨迹
* 活跃记录

---

## 七、用户 Session 管理页面设计

### 页面风格

参考：/user/apikey-management

呈现形式：卡片 + 时间轴

展示内容：

* 当前设备（高亮）
* 登录时间
* IP地址
* 地区
* 最近活跃
* 在线状态

操作：

* 下线该设备
* 设置为常用设备

---

## 八、Session 生命周期说明

### 生命周期阶段

1. 创建（login）
2. 活跃（heartbeat）
3. 续期（refresh）
4. 失效（timeout）
5. 主动登出
6. 被强制下线

状态流转示意：

```
在线 → 失效
在线 → 强制下线
在线 → 超时关闭
```

---

## 九、关键交互流程

### 登录创建 Session

```
登录成功
   ↓
生成 session_id
   ↓
写入 session 表
   ↓
返回 token
```

### 用户退出

```
点击退出
   ↓
调用 logout
   ↓
Session 状态更新
   ↓
Token 失效
```

### 强制下线

```
管理员点击下线
   ↓
更新 session_status
   ↓
通知前端
   ↓
跳转登录页
```

---

## 十、API 拆分建议

### 管理员 Controller

* AdminSessionController

  * querySessionList
  * forceOffline
  * markRisk
  * clearExpired

### 用户 Controller

* UserSessionController

  * queryMySessions
  * offlineOtherDevice
  * getCurrentSession

---

## 十一、扩展能力设计

1. 多端登录限制策略
2. 登录互踢机制
3. 常用设备策略
4. 风险自动封禁
5. Session 使用趋势分析
6. 设备指纹绑定

---

## 十二、系统价值

| 价值   | 描述        |
| ---- | --------- |
| 安全   | 阻断异常会话    |
| 可控   | 登录态可精细化管理 |
| 可审计  | 全流程可追溯    |
| 扩展   | 支撑风控增强    |
| 用户体验 | 自主感知安全    |

---

## 十三、推荐后续深化方向

* Session 风控算法设计
* API 调用权限联动
* 单点登录 Session 协同
* 分布式 Session 同步方案
* 在线态监控大屏



* any list
{:toc}