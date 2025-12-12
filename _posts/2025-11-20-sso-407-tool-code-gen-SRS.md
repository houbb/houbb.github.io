---
layout: post
title: 权限体系之-407-代码生成平台 SRS（Software Requirement Specification）
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# **代码生成平台 SRS（Software Requirement Specification）**

Software Requirement Specification
Version 1.0

---

# 1. 引言（Introduction）

## 1.1 目的（Purpose）

本 SRS 文档旨在定义**代码生成平台（Code Generation Platform）**的完整软件需求，包括功能需求、非功能需求、系统接口、外部约束、输入输出和质量属性。文档面向架构师、产品经理、研发工程师、测试工程师和实施团队，为开发、测试和运维提供统一的基线。

## 1.2 范围（Scope）

代码生成平台用于支持前后端、测试、DevOps 等角色进行工程脚手架、代码骨架、组件、接口、文档的自动化生成，涵盖以下核心能力：

* 模型中心（Model Center）
* 模板中心（Template Center）
* DSL 引擎（DSL Engine）
* 代码生成器（Generator Engine）
* 工程脚手架生成（Scaffolding）
* Git 集成
* 权限控制与审计
* 插件扩展机制

本平台构建企业级统一代码生成基础设施，实现研发效率提升、最佳实践固化、工程质量标准化。

## 1.3 定义/缩写（Definitions / Acronyms）

| 缩写  | 含义                                 |
| --- | ---------------------------------- |
| DSL | Domain Specific Language           |
| AST | Abstract Syntax Tree               |
| SRS | Software Requirement Specification |
| PRD | Product Requirement Document       |
| BRD | Business Requirement Document      |
| API | Application Programming Interface  |

## 1.4 参考文档（References）

* 《代码生成平台 PDD》
* 《代码生成平台 BRD》
* 《代码生成平台 PRD》
* 《DSL 设计规范文档》
* 《模板中心系统设计文档》
* 《生成器核心架构设计（Generator Core Architecture）》

---

# 2. 总体描述（Overall Description）

## 2.1 产品背景（Product Perspective）

代码生成平台将作为一个独立系统，同时作为内部研发效能平台的一部分，与以下系统交互：

* IAM / SSO（权限认证）
* Git 平台（GitLab/Gitea/GitHub）
* Swagger / OpenAPI（模型导入）
* 内部 DevOps 平台（Pipeline 集成）

平台采用微服务或单体 + 插件机制架构，前端 Vue3 + 后端 Java/Spring Boot + 模板文件系统。

## 2.2 用户特征（User Characteristics）

| 用户类型       | 技术水平 | 核心场景            |
| ---------- | ---- | --------------- |
| 后端工程师      | 高    | CRUD/API/DTO 生成 |
| 前端工程师      | 中    | 页面/组件脚手架生成      |
| 测试工程师      | 中    | 自动化测试脚本生成       |
| DevOps 工程师 | 中    | CI/CD 脚手架生成     |
| 架构师        | 高    | 模板治理、最佳实践沉淀     |

## 2.3 约束（Constraints）

* 仅支持主流 Git 平台（Gitea、GitLab、GitHub）
* 模板文件大小不得超过 10MB
* 生成行为必须可审计
* DSL 存在向前兼容性要求
* 企业环境对安全性要求高

## 2.4 假设和依赖（Assumptions & Dependencies）

假设：

* 用户具备基本的编程能力
* 企业内部已有 Git 服务
* 系统部署在可信网络环境

依赖：

* Java 17+
* Node.js（模板中可能使用）
* Git CLI

---

# 3. 功能需求（Functional Requirements）

以下采用 **FR-x.y.z** 编号体系。

---

## 3.1 模型中心（Model Center）

### **FR-1.1 模型定义**

* 用户可以通过 UI 或 DSL 方式定义领域模型、API 模型、数据库模型。
* 支持字段属性：类型、长度、注释、校验、约束、默认值。

### **FR-1.2 模型导入**

* 系统应支持从 OpenAPI/Swagger 导入 API 模型。
* 系统应支持从 DDL 导入数据库模型。

### **FR-1.3 模型版本管理**

* 所有模型修改必须记录版本。
* 支持模型 diff 能力。

---

## 3.2 模板中心（Template Center）

### **FR-2.1 模板包管理**

* 支持上传、下载、启用、禁用模板包。
* 支持模板包 metadata（作者、版本、语言、场景）。

### **FR-2.2 模板编辑**

* 支持在线编辑模板内容。
* 支持模板的目录结构与示例项目。

### **FR-2.3 模板预览（调试）**

* 支持基于示例模型与模板实时预览生成结果。
* 支持日志输出与变量跟踪（context viewer）。

---

## 3.3 DSL 引擎（DSL Engine）

### **FR-3.1 DSL 解析**

* 系统应提供 DSL 解析器，将 DSL 转换成 AST。
* DSL 语法错误应提供准确提示。

### **FR-3.2 模板 DSL**

* 模板可定义变量、循环、判断、文件生成路径。

### **FR-3.3 DSL 扩展**

* 支持用户自定义 DSL 语法扩展和内置函数。

---

## 3.4 代码生成器（Generator Engine）

### **FR-4.1 自动生成**

* 输入：模型 + 模板
* 输出：文件集合（代码、配置、文档等）

### **FR-4.2 文件合并规则**

* 提供三种合并策略：覆盖、跳过、智能合并（diff-based）
* 对冲突文件进行提示

### **FR-4.3 生成记录**

* 系统需要记录每次生成的内容、文件数、耗时、模板版本。

---

## 3.5 工程脚手架生成（Scaffolding）

### **FR-5.1 工程创建**

* 一键生成基础工程（Spring Boot、Vue、React、Node.js、Python）
* 可选择预定义插件（monitor、log、db、mq）

### **FR-5.2 依赖注入**

* 根据用户选择自动注入依赖（pom、package.json、build.gradle）

---

## 3.6 集成 Git 能力

### **FR-6.1 Git Push**

* 支持将生成的工程代码推送至 Git 仓库指定分支。

### **FR-6.2 Merge Request / Pull Request**

* 用户可选择自动创建 PR，带变更描述。

### **FR-6.3 Git 凭证管理**

* 支持 Token、SSH Key。

---

## 3.7 权限与审计

### **FR-7.1 权限控制**

* 模型、模板、生成历史必须基于 RBAC 授权。

### **FR-7.2 操作审计**

* 必须记录模板发布、工程生成、Git 操作。

---

## 3.8 插件扩展机制

### **FR-8.1 插件框架**

* 支持注册 hook：BeforeGenerate、AfterGenerate、ParserExtend 等。

### **FR-8.2 插件市场（可选）**

* 允许团队共享自定义模板与插件。

---

# 4. 外部接口需求（External Interface Requirements）

## 4.1 用户界面（UI）

* Dashboard：模板使用情况、生成记录、统计图表
* 模型编辑器：字段编辑、校验配置
* 模板中心：列表、编辑器、预览
* 生成器界面：选择模型/模板/Git 仓库
* 审计界面：全量操作日志

## 4.2 API 接口

提供 RESTful API：

* /models
* /templates
* /generate
* /git
* /audit

## 4.3 系统接口

* Git：通过 Git CLI 或 API
* Swagger/OpenAPI：导入 JSON
* SSO：通过 OAuth2 / JWT 集成

---

# 5. 非功能需求（Non-functional Requirements）

## 5.1 性能需求（Performance）

* 生成 200+ 文件的工程耗时 < 5 秒
* 模板解析延迟 < 100ms

## 5.2 可靠性（Reliability）

* 生成服务可用性 ≥ 99.9%
* 模板上传错误回滚机制

## 5.3 可扩展性（Scalability）

* DSL、模板、生成器均可插件化扩展

## 5.4 安全性（Security）

* 审计日志不可篡改
* 权限控制依托 RBAC/ABAC
* 模板包必须进行扫描（病毒、敏感信息）

## 5.5 可维护性（Maintainability）

* 模块间低耦合
* 代码生成器提供清晰策略模式接口

## 5.6 可用性（Usability）

* 页面操作流程 < 3 步
* 模板创建向导

---

# 6. 数据需求（Data Requirements）

## 6.1 数据模型

主要实体：

* Model
* Template
* TemplateVersion
* GenerateRecord
* Plugin
* User / Role
* GitCredential

## 6.2 日志需求

* 操作日志
* 模板执行日志
* 生成器运行日志
* Git 错误日志

---

# 7. 系统架构（System Architecture Overview）

（详细架构在《Generator Core Architecture》和《模板中心系统设计文档》中提供）

本 SRS 只需定义：

* 前端：Vue3 + TypeScript
* 后端：Spring Boot / Java17
* 模板运行沙箱：独立容器执行，隔离风险
* DSL 引擎：AST + Visitor + Render Pipeline
* Git 集成：基于 JGit 或 Git CLI

---

# 8. 验收标准（Acceptance Criteria）

* 能成功生成完整工程（Spring Boot + Vue）
* 模型导入 Swagger 正常解析
* 模板执行无错误
* Git Push/PR 正常流程
* 生成历史可回溯
* 权限限制有效

---

# 9. 附录（Appendix）

* DSL 语法示例
* 模板包结构示例
* API 示例
* 权限矩阵参考


* any list
{:toc}