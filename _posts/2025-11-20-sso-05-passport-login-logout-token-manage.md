---
layout: post
title: 权限体系之-05-passport 用户 token 管理
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 系统级用户 Token 管理设计方案（管理员管理端为主）

> 目标：在现有登录体系中增加 token 管理功能，单独记录用户 token，支持管理员查看、维护 token 黑名单，保证安全性与可审计性。

---

## 一、核心能力定义

### 1. Token 生命周期管理

* 用户登录成功后，系统生成 token 返回给前端
* Token 需存储在数据库表中，以便管理与黑名单校验
* Token 属性包括：类型（access / refresh）、有效期、签发时间、关联用户、设备信息等
* 支持 token 手动吊销（管理员操作）、自动过期

### 2. Token 黑名单控制

* 管理员可以将某些 token 拉入、移出黑名单
* Token 拦截器（历史已有）在校验 token 时，如果在黑名单中立即拒绝访问
* 便于应对被盗或异常登录场景

---

## 二、数据库表设计

### 1. 用户 Token 表：`user_token`（示例扩展字段）

| 字段          | 类型           | 说明                 |
| ----------- | ------------ | ------------------ |
| id          | bigint(20)   | 主键                 |
| status      | tinyint(4)   | 状态：1-有效，0-失效       |
| create_time | datetime(3)  | 创建时间               |
| update_time | datetime(3)  | 更新时间               |
| creator_id  | bigint(20)   | 创建人                |
| updater_id  | bigint(20)   | 更新人                |
| delete_flag | tinyint(4)   | 逻辑删除               |
| user_id     | bigint(20)   | 用户ID               |
| token       | varchar(512) | token 值            |
| token_type  | tinyint      | 1=access 2=refresh |
| expire_time | datetime(3)  | 过期时间               |
| client_ip   | varchar(64)  | 登录 IP              |
| user_agent  | varchar(255) | 登录设备/浏览器信息         |
| blacklisted | tinyint(4)   | 是否在黑名单 1=是 0=否     |
| remark      | varchar(255) | 备注                 |

### 2. 表设计原则

* 一条记录对应一个 token
* token 生命周期全程可追溯
* 黑名单字段用于快速拦截

---

## 三、功能设计

### 管理端视角

#### 功能模块

1. Token 列表查看

   * 查询所有 token
   * 支持按用户、状态、过期时间、是否黑名单筛选

2. Token 详情查看

   * 包含 token 值、类型、关联用户、IP、UA、状态、创建/更新时间、备注

3. 黑名单维护

   * 将 token 加入黑名单
   * 将 token 移出黑名单
   * 支持批量操作

4. Token 统计报表

   * 在线 token 数量
   * 已失效 token 数量
   * 黑名单 token 数量

#### 页面布局建议

* 列表页：表格展示，操作列支持手动吊销/黑名单维护
* 详情页：展示 token 的完整信息
* 筛选条件：用户、状态、类型、是否黑名单、时间范围

---

### 用户视角

* 不提供 token 管理页面
* 用户只接收登录 token
* 复杂管理操作由管理员负责

---

## 四、后端模块设计

### 1. Controller 拆分

* AdminUserTokenController：管理端，提供 token 查询、黑名单维护接口

* UserController#login：登录成功后颁发 token 并写入数据库（复用历史逻辑）

### 2. Service 拆分

* UserTokenService：封装 token 写入、更新、黑名单标记
* TokenBlacklistService：专门管理黑名单逻辑，可在拦截器中调用

### 3. 拦截器逻辑

历史已有 JwtInterceptor，增加新的特性：

* 用户请求带 token
* 拦截器查询 token 表

  * 是否存在
  * 是否有效
  * 是否在黑名单中
* 不符合条件直接拒绝访问

---

## 五、数据初始化建议

* 给每个测试用户生成一条 access_token 和 refresh_token
* 部分 token 加入黑名单用于测试
* 初始化字段示例：

  * user_id: 1
  * token: random UUID
  * token_type: 1
  * expire_time: now()+7天
  * client_ip: 127.0.0.1
  * user_agent: Chrome/Edge
  * blacklisted: 0

---

## 六、开发规范遵循

* 后端高内聚、低耦合
* 不使用 lombok + beanCopy
* mybatis XML 避免 >、< 符号，做好转义
* 前端 Vue3 组件化，复用已有表格、分页、筛选组件
* API 与 Controller 拆分，管理端独立

---

## 七、视角拆分总结

| 视角  | 功能             | 接口                       | 页面                  |
| --- | -------------- | ------------------------ | ------------------- |
| 管理端 | 查询 token、维护黑名单 | AdminUserTokenController | Token 列表页、详情页、黑名单操作 |
| 用户端 | 获取登录 token     | UserController#login       | 无管理页面               |

---

## 八、扩展建议

* 支持 token 类型扩展，如 API key、session token
* 支持 token 自动失效清理任务
* 支持 token 多设备绑定管理
* 支持 token 异常审计与报表


* any list
{:toc}