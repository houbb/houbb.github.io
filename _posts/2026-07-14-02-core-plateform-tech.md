---
layout: post 
title: core-plateform-02-技术规范约束
date: 2026-07-14 21:01:55 +0800
categories: [Core]
tags: [core]
published: true
---


# 目标

要求整体是前后端分类。核心服务前端、后端（面向用户）； 

管理控台前后端（面向管理员），每一个核心的服务分为上面说的4个子项目。

# 整体规划


我非常赞同这个约束，而且我建议**从第一天就强制执行**。

原因很简单：

> **架构最大的成本不是功能，而是不一致。**

很多开源项目做到后面，一个模块只有后台，一个模块只有 API，一个模块前后台混在一起，最后维护成本越来越高。

你的 Core 平台以后可能会有十几个 `core-xxx`，如果现在统一规范，以后新增模块几乎可以直接复制模板。

---

# Core Platform 技术架构规范（v1.0）

## 1. 目标

Core Platform 是整个生态系统的基础设施。

所有业务平台（Trade、Wiki、Monitor、CMS、AI、Blog……）均依赖 Core Platform 提供统一能力。

Core Platform 不直接实现业务，而是提供公共基础设施。

原则：

* Platform First
* API First
* Frontend / Backend Separation
* Convention over Configuration
* Open Source Friendly
* Replaceable Components
* Keep It Simple

---

# 2. 技术选型

## Backend

```text
Java 21 LTS
Spring Boot 3.x
Spring Security
Spring Validation
Spring Mail
Maven
SQLite（默认）
MySQL（可切换）
```

---

## Frontend

```text
Vue3

TypeScript

Vite

Pinia

Vue Router

Axios

UnoCSS（推荐）
```

---

## Database

默认

```text
SQLite
```

原因：

无需安装

零依赖

开箱即用

适合开源

以后仅修改 datasource 即可切换

```text
MySQL

PostgreSQL（预留）
```

禁止：

```text
Redis

MQ

ElasticSearch

MongoDB
```

第一阶段全部不引入。

---

# 3. 项目目录规范

整个仓库：

```text
core-platform/

docs/

frontend/

backend/

scripts/

docker/

LICENSE

README.md
```

---

# 4. Backend 规范

所有核心能力：

```text
backend/

core-identity/

core-notification/

core-storage/

core-ai/

core-workflow/

core-openapi/

core-config/

core-audit/

core-billing/

core-plugin/
```

每一个 Core 都是独立 Maven Module。

例如：

```text
backend/

core-identity

core-storage

core-ai
```

全部：

```text
maven module
```

---

# 5. Frontend 规范

所有用户端：

```text
frontend/

core-identity-web

core-storage-web

core-ai-web

core-notification-web
```

统一：

```text
Vue3
```

每个模块一个前端。

---

# 6. Admin Console

所有后台：

```text
frontend-admin/

core-identity-admin

core-storage-admin

core-ai-admin

core-notification-admin
```

全部统一后台风格。

---

# 7. 一个 Core 的标准结构

例如：

Identity

整个目录：

```text
core-identity/

backend/
frontend/
admin-backend/
admin-frontend/
```

即：

```
core-identity
├── backend
├── frontend
├── admin-backend
└── admin-frontend
```

---

## backend

提供：

```text
REST API

OpenAPI

业务逻辑

数据库
```

---

## frontend

提供：

用户页面

例如：

```text
登录

注册

个人中心

修改密码

API Key
```

---

## admin-backend

提供：

管理员接口。

例如：

```text
用户管理

权限管理

日志

审核
```

---

## admin-frontend

提供：

后台管理。

例如：

```text
用户列表

角色

组织

统计

配置
```

---

# 8. 一个 Core 永远只有四个子项目

例如：

```
core-storage

├── backend
├── frontend
├── admin-backend
└── admin-frontend
```

例如：

Notification

```
core-notification

├── backend
├── frontend
├── admin-backend
└── admin-frontend
```

以后全部一致。

---

# 9. Backend 包结构

统一：

```
src/main/java

controller

service

repository

entity

dto

vo

mapper

config

security

event

exception

util
```

禁止每个项目自己创造目录。

---

# 10. API 规范

统一：

```
/api/v1/
```

例如：

```
POST /api/v1/login

POST /api/v1/logout

GET /api/v1/profile
```

后台：

```
/admin-api/v1/
```

例如：

```
GET /admin-api/v1/users
```

永远不要：

```
/api2/

/system/

/manager/
```

---

# 11. 返回格式统一

所有接口：

```json
{
  "code":0,
  "message":"success",
  "data":{}
}
```

分页：

```json
{
  "total":100,
  "page":1,
  "size":20,
  "records":[]
}
```

---

# 12. 数据库规范

所有表：

统一：

```
id

create_time

update_time

deleted
```

禁止：

```
createDate

CreateTime

gmt_create
```

统一：

snake_case。

---

# 13. 配置规范

全部：

```
application.yml
```

仅保留：

```
datasource

server

logging
```

业务配置全部进入：

```
core-config
```

数据库动态配置。

---

# 14. 文件规范

上传全部：

```
core-storage
```

任何模块禁止：

```
upload/

temp/

image/
```

自己管理文件。

---

# 15. AI 规范

所有 AI：

必须经过：

```
core-ai
```

禁止：

```
直接调用 OpenAI
```

任何业务。

---

# 16. 邮件规范

全部：

```
core-notification
```

禁止：

```
JavaMailSender

直接发送邮件
```

---

# 17. 登录规范

全部：

```
core-identity
```

禁止：

每个项目：

```
User

Role

Permission
```

重新写一遍。

---

# 18. 插件规范

未来：

任何扩展：

```
Plugin

↓

Hook

↓

Extension
```

禁止：

修改源码。

---

# 19. 数据访问规范

统一：

```
Repository

↓

Service

↓

Controller
```

禁止：

Controller

直接：

```
Mapper
```

---

# 20. 开发原则（必须遵守）

## 简单优先（Keep It Simple）

第一阶段拒绝为了未来可能需要的场景而增加复杂度。

## 单一职责（Single Responsibility）

每个 `core-*` 只负责一种平台能力，不承载业务逻辑。

## 默认可运行（Zero External Dependency）

克隆仓库后，仅需 JDK 和 Maven 即可启动，默认使用 SQLite，不依赖 Redis、MQ、MinIO 等额外服务。

## 接口优先（Interface First）

所有外部能力（AI、存储、通知、支付等）先定义接口，再提供默认实现，为后续扩展预留空间。

## 统一约定（Convention over Configuration）

目录、接口、异常、日志、配置、数据库命名全部统一，避免模块间风格差异。

## 可替换（Replaceable）

数据库、AI 模型、对象存储、通知渠道等都应支持无侵入替换。

## API First

所有功能必须先设计 API，再实现前端，前后端通过 OpenAPI 契约协作。

## 开源友好（Open Source Friendly）

模块独立、文档完善、依赖精简，让开发者能够单独理解、运行和复用任意一个 `core-*` 模块。

---

## 我建议再增加一条最重要的约束

你目前是按 **4 个子项目** 来划分（用户端前后端 + 管理端前后端），我建议把它提升为整个 Core Platform 的**最高架构约束**：

> **任何 `core-*` 模块，无论大小，都必须遵循完全相同的工程骨架，不允许因功能简单而省略目录或改变结构。**

例如：

```text
core-identity/
├── backend/
├── frontend/
├── admin-backend/
├── admin-frontend/
└── README.md
```

```text
core-notification/
├── backend/
├── frontend/
├── admin-backend/
├── admin-frontend/
└── README.md
```

```text
core-ai/
├── backend/
├── frontend/
├── admin-backend/
├── admin-frontend/
└── README.md
```

即使某个模块（如 `core-config`）暂时没有用户前端，也保留对应工程（可以为空），而不是删除。

这样整个平台保持**100% 对称**，任何开发者看到一个新模块，都无需重新学习项目结构。

这种一致性，在长期维护和开源协作中的价值，往往远大于节省几个空目录。


# 参考资料

* any list
{:toc}