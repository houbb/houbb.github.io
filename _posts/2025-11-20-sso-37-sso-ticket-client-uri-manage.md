---
layout: post
title: 权限体系之-37-sso ticket+client uri 管理
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## CRUD

下面我给出 **两个管理模块** 的完整详细设计，包含：

* **功能点定义**
* **列表/详情/创建/修改/删除交互流程**
* **页面字段设计**
* **校验逻辑**
* **服务端流程**
* **扩展点 & 风险点**
* **数据库结构（在你提供的基础字段上补充业务字段）**

非常适合作为你 SSO 平台后续落地 SSO Client 跨系统认证能力的基础。

---

# 一）模块 1：`sso_client_uri`（系统登记回调域名/登录回调地址表）

用于管理每个统一接入系统（client）允许的 `redirect_uri / logout_uri / callback_uri`。

---

# 1.1 业务背景

* 每个外部系统必须在 SSO 平台登记 **允许的回调地址（redirect_uri）**
* 登录、换票据（ticket → token）时，SSO 会严格校验 redirect_uri 必须在白名单中
* 该表是构建 OAuth-like SSO 的关键基础表

---

# 1.2 `sso_client_uri` 表结构（在你要求的基础字段上扩展业务字段）

```sql
CREATE TABLE sso_client_uri (
  id BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  status TINYINT(4) NOT NULL DEFAULT 1 COMMENT '状态（1-启用,0-禁用）',
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT(20) NULL,
  updater_id BIGINT(20) NULL,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0 COMMENT '是否删除（0-否，1-是）',

  -- === 业务字段 ===
  client_id VARCHAR(128) NOT NULL COMMENT '所属系统的 client_id',
  uri_type TINYINT(4) NOT NULL DEFAULT 1 COMMENT '类型：1-redirect_uri 登录回跳，2-logout_uri 登出回跳，3-post_logout_uri 等模式',
  uri_value VARCHAR(2048) NOT NULL COMMENT '合法的回调地址，例如 https://a.com/sso/callback',
  description VARCHAR(255) NULL COMMENT '用途描述',

  PRIMARY KEY (id),
  KEY idx_client_id (client_id),
  KEY idx_status (status)
);
```

---

# 1.3 核心业务功能点

## （1）列表页

展示所有 client 的回调 URI。

功能点：

* 条件查询（client_id、uri_type、status）
* 分页
* 查看详情
* 编辑 / 启用 / 禁用 / 删除
* 批量删除
* 新增

## （2）创建页

用于给某个 client 添加合法回调 URI。

功能点：

* 选择 client_id（下拉框）
* 填写 uri_value
* 选择 uri_type（登录回跳 / 登出回跳 / 其他）
* description
* 保存 & 校验重复

## （3）编辑页

允许修改 uri_value / description，只允许同类型

## （4）删除（软删）

delete_flag = 1
保留数据用于审计

## （5）启用 / 禁用

status 字段切换
禁用后该 URI 不参与 redirect_uri 校验

---

# 1.4 页面交互流程（重点）

### **新增流程（前端）**

1. 点击 “新增回调 URI”
2. 弹出表单（client_id / uri_type / uri_value / description）
3. 前端校验：

   * uri_value 必须是 URL（正则检查）
   * 支持 [https://domain/path，不允许](https://domain/path，不允许) javascript:, ftp 等
4. 提交后端

### **新增流程（后端逻辑）**

1. 校验 client_id 是否存在
2. 校验 uri_value 必须是合法 URL
3. 校验是否在同一个 client + uri_type 下重复
4. 写入数据库
5. 返回成功

---

# 1.5 安全校验策略（必须实现）

* **必须强制 HTTPS**（允许 http 仅限开发环境）
* URI 必须 **精准匹配**，不能放开通配符
* 禁止：

  * `*.evil.com`
  * `http://127.0.0.1:*`
  * `http://localhost:*`（除开发模式）
* `uri_type=1`（redirect_uri）不允许出现 fragment（# 片段）

---

# 1.6 扩展能力（预留）

* 支持“前缀匹配白名单”
* 支持多个 redirect_uri
* 多 client 分环境：dev/stg/prod 多域名
* 允许跨域 JS 回调页（未来扩展）

---

---

# 二）模块 2：`sso_tickets`（一次性票据管理）

用于支持 SSO 登录成功后用一次性 ticket 换取 JWT token。

---

# 2.1 `sso_tickets` 表结构（按你要求的通用字段基础上扩展）

```sql
CREATE TABLE sso_tickets (
  id BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  status TINYINT(4) NOT NULL DEFAULT 1 COMMENT '状态（1=正常,0=禁用）',
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT(20) NULL,
  updater_id BIGINT(20) NULL,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0 COMMENT '是否删除（0 否，1 是）',

  -- === 业务字段 ===
  ticket VARCHAR(128) NOT NULL UNIQUE COMMENT '票据值（高强度随机字符串）',
  client_id VARCHAR(128) NOT NULL COMMENT '目标 client_id，由 login 请求带来',
  user_id BIGINT(20) NOT NULL COMMENT '当前登录用户 ID',
  redirect_uri VARCHAR(2048) NOT NULL COMMENT '请求的回调地址，换票据时要验证',
  state VARCHAR(255) NULL COMMENT '原始 state，回跳到 client 时带回',
  used TINYINT(4) NOT NULL DEFAULT 0 COMMENT '是否已使用，1 表示已换 token',
  expire_time DATETIME(3) NOT NULL COMMENT '过期时间，例如 +60 秒',

  PRIMARY KEY (id),
  KEY idx_ticket (ticket),
  KEY idx_expire (expire_time)
);
```

---

# 2.2 sso_tickets 的 CRUD 设计（管理端）

注意：生产环境 ticket 一般不提供“编辑”功能，但管理后台可以查看、查询、追踪票据使用情况。
**管理后台不允许新建 ticket**（ticket 必须由 SSO 登录流程自动生成）。

---

## 管理端功能点

### （1）列表页

默认按 create_time 降序显示

字段展示：

* ticket（前端显示局部掩码：xxxx****xxxx）
* 用户 ID / 用户名（联查 users）
* client_id
* redirect_uri
* state
* used（未使用/已使用）
* expire_time
* status / delete_flag

支持筛选：

* client_id
* user_id
* used（0/1）
* 时间范围（create_time / expire_time）

### （2）详情页

查看完整 ticket 信息，含审计用途：

* 完整 ticket（不能 copy option）
* 使用时间 / 使用 IP（如果换 token 记录）
* 哪个系统换掉的
* 是否过期

### （3）删除（软删）

delete_flag = 1
这个仅用于数据清理或误生成场景

### （4）禁用（status = 0）

该 ticket 立即不可使用，用于：

* 登录异常处理
* ticket 被怀疑泄露

---

# 2.3 交互流程

## **管理后台：查看票据轨迹**

管理员 → 登录 SSO 管理后台 → 点击 “票据追踪（tickets）”

1. 输入 user_id / client_id / ticket 关键字
2. 查询列表
3. 点击详情可看到：

   * 票据创建时间
   * 票据是否被使用
   * 使用者 IP、UA
   * 是否过期
   * ticket → token 的链路记录（可选）

---

# 2.4 核心校验逻辑（后端）

### （1）换 token 时处理（关键）

按顺序：

1. 查询 ticket
2. 校验：

   * ticket 存在
   * status = 1
   * delete_flag = 0
   * used = 0
   * expire_time > NOW()
   * client_id 一致
   * redirect_uri 一致
3. 校验后 mark used = 1（必须原子操作，防重放）
4. 颁发 JWT token

> ⚠️ used 字段必须保证幂等（更新时带 where used = 0）

---

# 2.5 安全风险点 & 方案

| 场景                 | 风险                  | 解决方案                              |
| ------------------ | ------------------- | --------------------------------- |
| ticket 被二次使用       | 重放攻击                | DB 层 used 原子更新，expire_time 短（60s） |
| 跨系统伪造 redirect_uri | 非法跳转                | 依赖 `sso_client_uri` 白名单严格校验       |
| 暴露 ticket          | 劫持登录                | 管理后台只露局部 ticket + 授权人员可查看完整字段     |
| 增删改敏感数据            | 安全日志（who/when/what） | `creator_id`, `updater_id` 字段记录   |

---

# 2.6 扩展能力

* 可以增加使用日志表：`sso_ticket_usage_log`
* 可以允许 ticket 多用途（MFA 二次验证 / 绑定手机）
* 可以扩展票据类型（如：一次性票据、绑定票据、换 token 票据）

---

---

# 三）SSO Client URI + Ticket 两个模块关系图

```
Client URI 表（白名单）
       ↓（redirect 校验）
SSO /login → 用户登录 → 生成 ticket → 写入 sso_tickets
       ↓（校验 redirect_uri + client_id）
302 回跳 client/callback?ticket=xxx
       ↓
Client 后端向 SSO /token 换 JWT
```

---

# 四）结尾

以上内容已经满足：

* **你提供的基础字段要求**
* **完整 CRUD / 页面交互 / 服务端逻辑 / 安全策略**
* **符合 JWT + MySQL 的 SSO 架构**
* **为后续跨系统 SSO、换 token、单点退出做足准备**

* any list
{:toc}