---
layout: post
title: 权限体系之-106-RABC+ resource 资源管理
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 资源中心（MVP 极简版）设计

## 只保留 2 张核心表

我们将资源相关的数据统一在一张主表，减少复杂度。
标签、属性、关系都不做独立表，统一放 JSON。

### **1. resource（主表）**

满足你的字段要求，并保留最基本的 RBAC 所需能力。

必含字段（你要求的公共字段）：

```
id
status
create_time
update_time
creator_id
updater_id
delete_flag
```

业务字段（精简后，只保留真正常用且必要的）：

```
code          唯一编码
name          名称
type          类型：API | MENU | PAGE | ACTION | DATA
parent_id     父级资源 id，支持层级
path          路径（API path / 页面 path）
method        HTTP 方法（API 用）
sort          排序
visible       是否可见
description   描述文字
meta          扩展 JSON，用于标签、属性、标志位等
```

### **2. resource_permission（资源-权限的关联表）**

仅保留必要的一张表，与既有 permission 体系对接。

字段：

```
id
resource_id
permission_id
status
create_time
update_time
creator_id
updater_id
delete_flag
```

---

# 为什么只需要这两张表？

* **资源信息本身已经够完整**：将标签、属性等放到 meta JSON，减少结构复杂度。
* **关联权限是必须的**：其他都不是必须表。
* **没有引入 resource_tag / resource_attribute 等附表**，因为早期阶段用 JSON 存即可。
* **前端可展示树、过滤、属性、标签，全靠 meta**。

---

# 数据库表结构（简洁版）

## resource

```sql
CREATE TABLE `resource` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `creator_id` BIGINT NULL,
  `updater_id` BIGINT NULL,
  `delete_flag` TINYINT NOT NULL DEFAULT 0,

  `code` VARCHAR(128) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `parent_id` BIGINT NULL,
  `path` VARCHAR(512) NULL,
  `method` VARCHAR(16) NULL,
  `sort` INT NOT NULL DEFAULT 0,
  `visible` TINYINT NOT NULL DEFAULT 1,
  `description` VARCHAR(1024) NULL,

  `meta` JSON NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_delete_flag` (`delete_flag`)
);
```

## resource_permission

```sql
CREATE TABLE `resource_permission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `creator_id` BIGINT NULL,
  `updater_id` BIGINT NULL,
  `delete_flag` TINYINT NOT NULL DEFAULT 0,

  `resource_id` BIGINT NOT NULL,
  `permission_id` BIGINT NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resource_permission` (`resource_id`, `permission_id`)
);
```

---

# 初始化数据（精简版）

```sql
INSERT INTO resource (code, name, type, sort, description)
VALUES 
 ('menu.rbac', 'RBAC-PLUS', 'MENU', 1, 'RBAC 扩展菜单'),
 ('menu.rbac.resource', '资源管理', 'MENU', 2, '资源中心');

INSERT INTO resource (code, name, type, path, method, sort, description)
VALUES
 ('api.user.list', '用户列表', 'API', '/api/v1/users', 'GET', 1, '查询用户列表'),
 ('api.user.get', '查询用户', 'API', '/api/v1/users/{id}', 'GET', 2, '按 ID 查询用户');
```

---

# 后端接口（极简版）

## 查询资源列表

```
GET /api/resource?page=1&size=20&type=API&parent_id=0&q=user
```

## 资源树

```
GET /api/resource/tree
```

## 获取详情

```
GET /api/resource/{id}
```

## 新建

```
POST /api/resource
```

## 修改

```
PUT /api/resource/{id}
```

## 删除

```
DELETE /api/resource/{id}
```

## 设置关联权限

```
POST /api/resource/{id}/permissions
```

---

# 前端页面设计（更简洁、更现代）

## 页面结构

### 1. 搜索区（可折叠）

* 搜索框（名称/编码）
* 类型下拉（宽一些）
* 状态/可见性开关
* 折叠按钮

### 2. 列表区

* 现代紧凑表格
* 图标按钮操作栏：

  * 查看
  * 编辑
  * 删除
  * 权限绑定

### 3. 详情抽屉（右侧）

分成 3 块：

* 基本信息（名称/类型/path/method）
* Meta 扩展信息（JSON 展示）
* 关联权限（列表）

### 4. 新建 / 编辑 弹窗（现代化 UI）

* Key Info 区块
* Path/Method 区块
* Meta JSON 编辑区（可折叠）
* 右侧实时预览（可选）

---

# 最终总结：这是最简单、可用的 RBAC+ 资源中心

你现在只需要维护：

* **resource（一个主表）**
* **resource_permission（一个关联表）**

标签、属性、附加信息通通放 meta 中。

页面也不用复杂，主要是：

* 列表 + 详情抽屉 + 新建/编辑弹窗
* 搜索区折叠
* 图标按钮紧凑操作栏




# 为什么需要映射表？

**为什么 RBAC+ 里必须要 resource_permission 这个表？什么时候可以不要？什么时候必须要？**

---

# 1. 先说结论

**如果你希望实现“资源级权限控制”（不是简单菜单权限），并且资源与权限是多对多关系，那么就必须要 `resource_permission`。
如果你只做传统 RBAC（角色 = 权限，权限绑定菜单），那就不需要。**

换句话说：

* **简单业务**：确实可以不要
* **要做企业级资源中心 / 可扩展的权限体系**：必须要

---

# 2. 为什么很多企业架构里必须有这个表？

因为你的系统不是只有“菜单权限”，而是：

* REST API（GET /users/1, POST /orders）
* 页面 / 菜单
* 数据行（订单 #123）
* 数据列（工资字段）
* MQ topic
* Dubbo 接口
* 文件、文档
* 业务对象（例如「某个租户」「某个项目」「某个业务域」）

这些都是“资源”。

## 核心问题：资源与权限之间 **不是一对一的关系**。

### 举例

一个 API 资源：

```
/api/orders
```

你可能会创建多个权限：

* 查看订单（order:read）
* 修改订单（order:update）
* 删除订单（order:delete）

同一个资源 → 多个权限
多个权限 → 同一个资源也可能引用

如果你直接在 `resource` 表里加一个 permission_id，将无法表达“多权限绑定一个资源”。

这就是需要中间表的原因。

---

# 3. 资源与权限必须是多对多吗？

大部分可扩展的权限系统里是 **YES**。

| 关系            | 是否现实存在    | 举例                                     |
| ------------- | --------- | -------------------------------------- |
| 资源 → 权限（1 对多） | 常见        | 一个资源对应多个操作（读/写/删）                      |
| 权限 → 资源（多对多）  | 很常见       | 某个“查看权限”可能对应多个资源，例如 10 个页面都用一个 read 权限 |
| 权限 → 资源（单对单）  | 只有菜单系统才这样 | 菜单 = 权限，最简体系                           |

如果你要做“统一资源中心”，第 3 种是不够的。

---

# 4. 如果不要 resource_permission，会怎样？

你会遇到这些痛点：

### 1）无法绑定多个权限到同一个资源

例如订单详情页页面，可能包含多个 API、多个按钮。
你无法描述哪些权限影响这个资源。

### 2）无法复用权限

比如“读取权限”适用于多个资源，你没法复用。

### 3）扩展资源类型时会非常痛苦

未来加 MQ、Kafka、文件、任意资源类型，都无法通用处理。

### 4）无法表达资源实例级授权

例如：用户只允许访问 “project_id = 123”
你也无法用权限去绑定多个资源实例。

对 IAM 平台来说这是灾难。

---

# 5. 那我到底该不该保留这个表？

### 情况 A：你要做“简单菜单 + API 权限”

→ 你确实可以删除 resource_permission，权限直接挂在资源表中即可（资源包含一个 permission_id）

### 情况 B：你要做“通用资源中心”，未来要支持更多资源

→ 必须保留

### 情况 C：你要做“企业级权限”，支持跨系统接入

→ 必须保留

### 情况 D：你要做“实例级权限”

例如：

* 仅能查看自己所属项目
* 仅能管理某几个租户

→ 必须保留

你现在在做的 IAM 平台倾向于 B/C/D，因此这个表是基础设施。

---

# 6. 如果你想“足够简单但可扩展”，我可以给你一个极简版设计

三个表就够：

```
resource
permission
resource_permission
```

没有 resource_type、resource_instance 等复杂字段。

并且 resource 只关心：

```
id
name
code   （资源唯一码，如 api:/users, page:/dashboard）
type   （api/page/button）
```

permission：

```
id
code  （read/write/delete）
name
```

关联表：

```
resource_id
permission_id
```

你未来想扩展，只需加字段，不需要改变模型。

---

# 7. 如果你想更简单，我可以帮你再瘦身到 2 张表

你说一句：
“我只需要菜单权限，不做资源中心。”

我就给你：

```
menu_role
menu
role
```

但是这种根本不是你想做的 IAM 平台。

---

# 8. 总结

你现在看到的复杂，是因为你在做的是 **可扩展、多资源类型、支持实例级授权的企业级 IAM 平台**。

* 如果只是做菜单系统：确实可以删掉
* 如果做资源中心：这个表是核心，没有它将完全无法扩展
* resource_permission 是为了解决资源与权限的多对多关系，是行业标准

* any list
{:toc}