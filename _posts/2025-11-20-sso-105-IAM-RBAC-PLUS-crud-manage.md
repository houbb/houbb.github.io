---
layout: post
title: 权限体系之-104-RBAC+ 第一步新增表的 CRUD
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 新增数据的 CRUD

```
先给出 permission-plateform 的 RBAC+ 完整落地方案（在不破坏已有表结构前提下），主要新增管理表的 CRUD+permission 拓展的 CRUD。

暂时不考虑资源的资源自动发现体系（企业级精准方案）。给出建表语句+详细设计+交互方案
```

# RBAC+ 在 `permission-plateform` 的完整落地方案（在**不破坏现有表结构**前提下）

目标：在你现有的基础 RBAC 表（`permission`, `role`, `role_permission`, `user`, `user_group`, `user_group_relation`, `user_role`）之上，最小且可治理地扩展出 RBAC+ 的关键能力：**动作（Action）粒度、数据范围（Data Scope）、角色继承/授予扩展、岗位(Position) 支持、审计**。
不改变已有表的前提下新增管理表与映射表，并给出完整的建表语句（MySQL 风格）、REST 管理 API 设计（CRUD + 权限扩展相关接口）、前端交互 / 运维流程、校验与审计要求与迁移建议。

---

# 目录（快速导航）

1. 方案概述（简短）
2. 要新增的表（说明与用途）
3. 建表语句（DDL）
4. 管理 API 设计（CRUD + 权限扩展）
5. 前端交互与 UX 设计（管理控制台）
6. 权限扩展（permission → action/data_scope）工作流与示例
7. 鉴权 / 校验 / 缓存 / 一致性说明
8. 审计、回滚与合规要求
9. 迁移与上线步骤（含回退保障）
10. 常见问题与注意点

---

# 1. 方案概述（要点）

* 保持现有表不变（无需改 `permission`、`role`、`role_permission` 等）。
* 用最少表实现 RBAC+ 的三大扩展：**Action、Data Scope、角色继承/授权目标（position/org/group/user/临时授权）**。
* 提供管理 API + 管理控制台页面（CRUD）用于运维和权限管理员操作。
* 所有管理操作写入审计表 `audit_log`（新增），并有操作人、traceId、时间、旧值、新值记录。
* 权限校验路径（AuthZ）保持不变，但 AuthZ Service 将读取新映射（role→permission→action/data_scope）做更精细的判断。

---

# 2. 要新增的表（及用途）

1. `action`：动作目录（系统级标准动作，如 view/add/edit/delete/approve/export 等）。
2. `permission_action`：把现有 `permission` 与 `action` 关联（允许一个 permission 包含多个 action）。
3. `data_scope`：数据范围定义（SELF、DEPT、DEPT_AND_CHILD、CUSTOM、ALL 等）与表达规则。
4. `permission_data_scope`：将 permission 绑定到一个或多个 data_scope（或默认引用）。
5. `role_hierarchy`：角色继承（父角色 -> 子角色）；用于角色自动继承权限。
6. `position`：岗位定义（公司岗位/职能）。
7. `user_position`：用户绑定岗位（映射表）。
8. `role_grant`：扩展角色授予（除了已有 user_role/user_group 外，支持 position/org/temporary grant）。
9. `resource_instance`（可选/小型实现）：记录实例化资源（用于实例级授权/审计，若需要可开启）。
10. `audit_log`：管理操作审计（必须）；记录 CRUD/Publish/Grant/撤销等操作。

上面表集合可以覆盖绝大多数 RBAC+ 场景：操作粒度、数据过滤、岗位/组织授权、角色继承与临时授权、审计。

---

# 3. 建表语句（MySQL，带索引与注释）

> 建表语句按最小依赖写出，生产部署时请补充：charset、engine、分区、审计保留策略、FK 约束与事务策略。所有时间字段用 `datetime(3)`。

```sql
-- 1) 动作目录（Action）
CREATE TABLE IF NOT EXISTS `action` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `action_code` VARCHAR(64) NOT NULL COMMENT '动作编码（唯一，例如 view, create, edit, delete, approve）',
  `action_name` VARCHAR(128) NOT NULL COMMENT '动作名称',
  `action_desc` VARCHAR(256) DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_action_code` (`action_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) permission 与 action 的关联（permission 现有，不改）
CREATE TABLE IF NOT EXISTS `permission_action` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `permission_id` BIGINT(20) NOT NULL COMMENT '关联 permission.id',
  `action_id` BIGINT(20) NOT NULL COMMENT '关联 action.id',
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perm_action` (`permission_id`, `action_id`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_action_id` (`action_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) 数据范围定义（Data Scope）
CREATE TABLE IF NOT EXISTS `data_scope` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `scope_code` VARCHAR(64) NOT NULL COMMENT '范围编码（SELF/DEPT/DEPT_CHILD/CUSTOM/ALL）',
  `scope_name` VARCHAR(128) NOT NULL,
  `scope_type` VARCHAR(64) NOT NULL COMMENT '类型，例如 DEPT, ORG, CUSTOM_SQL, USER_LIST',
  `scope_rule` TEXT DEFAULT NULL COMMENT '规则表达式或 JSON（例如 SQL 片段或模板）',
  `description` VARCHAR(512) DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scope_code` (`scope_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) permission 与 data_scope 关联（允许一个 permission 绑定多个数据范围）
CREATE TABLE IF NOT EXISTS `permission_data_scope` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `permission_id` BIGINT(20) NOT NULL,
  `data_scope_id` BIGINT(20) NOT NULL,
  `config` JSON DEFAULT NULL COMMENT '扩展配置，例如参数模板映射',
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perm_scope` (`permission_id`, `data_scope_id`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_data_scope_id` (`data_scope_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) 角色继承（Role Hierarchy）
CREATE TABLE IF NOT EXISTS `role_hierarchy` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `parent_role_id` BIGINT(20) NOT NULL,
  `child_role_id` BIGINT(20) NOT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_hierarchy` (`parent_role_id`, `child_role_id`),
  KEY `idx_parent_role` (`parent_role_id`),
  KEY `idx_child_role` (`child_role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) 岗位（Position）
CREATE TABLE IF NOT EXISTS `position` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `position_code` VARCHAR(128) NOT NULL,
  `position_name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(512) DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_position_code` (`position_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) 用户-岗位关联
CREATE TABLE IF NOT EXISTS `user_position` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) NOT NULL,
  `position_id` BIGINT(20) NOT NULL,
  `start_time` DATETIME(3) DEFAULT NULL,
  `end_time` DATETIME(3) DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_position` (`user_id`, `position_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_position_id` (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8) 角色授予扩展（通用授予目标：USER/GROUP/POSITION/ORG）
CREATE TABLE IF NOT EXISTS `role_grant` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT(20) NOT NULL,
  `grant_type` VARCHAR(32) NOT NULL COMMENT 'USER | GROUP | POSITION | ORG',
  `grant_target_id` VARCHAR(128) NOT NULL COMMENT '目标 id 或 code（userId / groupId / positionId / orgId）',
  `start_time` DATETIME(3) DEFAULT NULL,
  `end_time` DATETIME(3) DEFAULT NULL,
  `granted_by` BIGINT(20) DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_grant_type_target` (`grant_type`, `grant_target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9) 资源实例（optional：用于实例级授权）
CREATE TABLE IF NOT EXISTS `resource_instance` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `resource_key` VARCHAR(255) NOT NULL COMMENT '对应 permission.permission_code 或 resource 规范 key',
  `instance_id` VARCHAR(255) NOT NULL COMMENT '实例id，例如 order:12345',
  `owner_user_id` BIGINT(20) DEFAULT NULL,
  `owner_org_id` BIGINT(64) DEFAULT NULL,
  `meta` JSON DEFAULT NULL,
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resource_instance` (`resource_key`, `instance_id`),
  KEY `idx_resource_key` (`resource_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10) 审计日志（管理操作）
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(64) NOT NULL COMMENT 'CREATE/UPDATE/DELETE/GRANT/PUBLISH/ROLLBACK etc.',
  `operator_id` BIGINT(20) DEFAULT NULL,
  `operator_name` VARCHAR(128) DEFAULT NULL,
  `target_type` VARCHAR(64) DEFAULT NULL COMMENT 'permission/action/data_scope/role/role_grant',
  `target_id` VARCHAR(255) DEFAULT NULL,
  `trace_id` VARCHAR(128) DEFAULT NULL,
  `details` JSON DEFAULT NULL COMMENT '变更前后快照,notes等',
  `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_operator` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> 说明：以上表使用 `permission` 表的 `permission_code`/`id` 作为对接点，`permission_action` / `permission_data_scope` 作为扩展，不修改原表结构，避免影响现有逻辑与历史数据。

---

# 4. 管理 API 设计（CRUD + permission 拓展）

> 规范：所有管理接口需走 `/api/v1/` 前缀，返回统一 envelope（code/msg/data），并且受权限保护（例如 `permission:manage:*` 或 `role:manage`）。

## 4.1 Action 管理（动作目录）

* `GET /api/v1/actions` — 列表（支持分页/模糊搜索）
* `POST /api/v1/actions` — 创建（body: action_code, action_name, action_desc）
* `GET /api/v1/actions/{id}` — 详情
* `PUT /api/v1/actions/{id}` — 更新
* `DELETE /api/v1/actions/{id}` — 删除（若被 permission_action 引用必须先解绑）

> 权限：`permission:action:manage`

## 4.2 Permission-Action 绑定（为 permission 增加动作）

* `POST /api/v1/permission-actions` — 批量绑定（body: permission_id, action_ids[]）
* `DELETE /api/v1/permission-actions` — 批量解绑（body: permission_id, action_ids[]）
* `GET /api/v1/permissions/{permission_id}/actions` — 查询某 permission 的动作集

> 权限：`permission:permission_action:manage`

## 4.3 Data Scope 管理

* `GET /api/v1/data-scopes` — 列表
* `POST /api/v1/data-scopes` — 创建（body: scope_code, scope_name, scope_type, scope_rule (JSON/string), description）
* `GET /api/v1/data-scopes/{id}` — 详情
* `PUT /api/v1/data-scopes/{id}` — 更新
* `DELETE /api/v1/data-scopes/{id}` — 删除（先解除引用）

> 权限：`permission:data_scope:manage`

## 4.4 Permission-DataScope 绑定（将数据范围应用到 permission）

* `POST /api/v1/permission-data-scopes` — 绑定（body: permission_id, data_scope_id, config(optional json)）
* `DELETE /api/v1/permission-data-scopes/{id}` — 删除绑定
* `GET /api/v1/permissions/{permission_id}/data-scopes` — 查看绑定

> 权限：`permission:permission_data_scope:manage`

## 4.5 Role Hierarchy（角色继承）

* `GET /api/v1/role-hierarchy?roleId=` — 查看某角色父/子关系
* `POST /api/v1/role-hierarchy` — 创建继承（body: parent_role_id, child_role_id）
* `DELETE /api/v1/role-hierarchy/{id}` — 删除继承关系

> 权限：`role:hierarchy:manage`

## 4.6 Position 与 User-Position

* `GET /api/v1/positions`、`POST /api/v1/positions`、`PUT /api/v1/positions/{id}`、`DELETE /api/v1/positions/{id}`
* `POST /api/v1/user-positions` — 绑定（body: user_id, position_id, start_time, end_time）
* `DELETE /api/v1/user-positions/{id}`

> 权限：`position:manage`

## 4.7 Role Grant（通用授予）

* `GET /api/v1/role-grants?roleId=` — 列表
* `POST /api/v1/role-grants` — 授予（body: role_id, grant_type, grant_target_id, start_time, end_time, notes）
* `DELETE /api/v1/role-grants/{id}` — 回收/撤销

> 权限：`role:grant:manage`

## 4.8 Resource Instance（若启用实例级授权）

* `GET /api/v1/resource-instances` / `POST` / `DELETE` 等

> 权限：`resource:instance:manage`

## 4.9 Audit Log

* `GET /api/v1/audit-logs` — 支持按 event_type/operator/target_type/timeRange 搜索（只读给审计员）

> 权限：`audit:read`

---

# 5. 前端交互与 UX（管理控制台）

为权限管理员/运维人员设计的控制台模块，建议放在现有后台“权限管理”模块下，新增分区与页面：

## 页面一：动作管理（Action）

* 列表 + 新建/编辑/删除按钮
* 动作示例说明（建议预置 CRUD、APPROVE、EXPORT 等）
* 删除时若被任何 permission 使用，弹窗提示并提供“解除引用”跳转链接。

## 页面二：数据范围管理（Data Scope）

* 列表视图、规则预览（支持 JSON/SQL 模板的折叠展示）
* 新建规则时提供模板：SELF、DEPT、DEPT_AND_CHILD、CUSTOM（模板编辑器）
* 测试工具：输入示例上下文（user_id/dept_id） → 预览生效 SQL 或结果集（只做模拟查询）

## 页面三：Permission 详情（扩展页面）

在现有 permission 列表点击某条进入详情页，新增 Tab：**动作 / 数据范围 / 绑定角色 / 审计历史**

* 动作 Tab：显示已绑定动作，支持批量绑定/解绑（checkbox + save）
* 数据范围 Tab：显示已绑定 data_scope，支持编辑 config（例如参数映射）
* 角色绑定 Tab：显示 role_permission（复用现有），并给出“基于 action 的角色分配视图”按钮

## 页面四：角色继承管理（Role Hierarchy）

* 角色树或关系图，支持「拖拽建立继承关系」与「批量删除」操作
* 给出继承传播效果预览（点击某角色 → 显示它拥有的权限包含继承来的）

## 页面五：岗位/授予（Position / Role Grant）

* 岗位列表/编辑
* 给岗位分配角色（类似给用户分配角色的界面）
* role_grant 页面：支持按角色查看所有授予目标并可批量回收

## 页面六：审计中心（Audit Log）

* 列表 + 详情（JSON 变更快照） + 导出

### UX 要点

* 所有修改操作弹出确认框，关键操作（删除、回收、发布）提示强确认并需要输入原因（写入 audit_log）。
* 支持「回滚」或「撤销最近一次改动」。
* 对于数据范围（CUSTOM）强制要求有 owner 与审批流程（半自动发布策略）。
* 用户/操作员必须具备相应的管理权限才能访问这些页面（本身的权限也在 permission 表管理）。

---

# 6. 权限扩展的工作流与示例（典型：给 permission 增加 action 并绑定 data scope）

## 场景：为 `permission`（如 `order:list`）添加 `export` 动作并限制为部门内数据导出（DEPT）

### 操作步骤（管理端）：

1. 管理员创建 Data Scope：`scope_code=DEPT`, `scope_name=本部门`, `scope_type=DEPT`, `scope_rule` = 模板 `dept_id = {{user.dept_id}}`。保存（写入 `data_scope`）。记录 audit_log。
2. 管理员在 Action 列表确认存在 `export`（若无则新增 `action`）。
3. 在 `Permission 详情页` 的 Actions Tab，勾选 `export` → 保存（写入 `permission_action`）。记录 audit_log。
4. 在 `Permission 详情页` 的 DataScope Tab，选择 `DEPT` 并配置 `config`（若需要字段映射），保存（写入 `permission_data_scope`）。记录 audit_log。
5. 如需启用，管理员可立即生效或走审批流程（可选）：审批通过后触发消息队列通知 Authz Service 更新缓存。

### AuthZ 执行（运行时）

* 当用户请求 `order/export` 时（请求头含 userId），网关或 service 调用 `authz/check(userId, permission_code=order:list, action=export, ctx={})`。
* Authz Service：查询 `user` 的 roles → 合并 role_permission → 检查该 permission 是否绑定到 `export` action → 若有，查找 `permission_data_scope`（DEPT），通过 `scope_rule` 生成 SQL 过滤： `WHERE dept_id = <user.dept_id>` → 根据结果决定是否允许与返回使用该过滤器的执行策略（并记录审计）。

---

# 7. 鉴权 / 校验 / 缓存 / 一致性（关键说明）

## 鉴权（管理 API）

* 管理 API 自身也应纳入权限控制，至少在初期用一个超级管理员角色（例如 `platform:admin`）分配接口访问权限。
* 推荐采用 JWT + 权限校验（AuthZ Service）对管理端调用做二次校验。

## 校验规则（输入校验）

* `action_code`、`scope_code` 命名规范（小写 + 英文 + 下划线）并做唯一校验。
* `permission_action` 绑定时若 permission 不存在返回 400。
* 删除动作若被 role_permission 间接使用要阻止或给出解除引用窗口。

## 缓存（运行时权限判断的性能）

* 缓存键（Redis）：

  * `role_res:{roleId}` => set(permission_code#action_code)
  * `user_perm:{userId}` => set(permission_code#action_code)（或动态合并）
  * `permission_data_scope:{permissionId}` => JSON 规则
* 更新策略：所有写变更（permission_action、permission_data_scope、role_permission、role_grant、user_role、user_group_relation、user_position、role_hierarchy）需发布消息（MQ）通知 Authz Service 去刷新缓存或主动 invalidate。
* 可选强一致模式：管理 API 在成功写 DB 后同步调用 Authz Service 的 invalidation endpoint 并等待确认（会增加延迟）。

## 一致性注意

* 批量修改建议在事务内写 DB，并在事务提交后 publish MQ 事件（保证 eventual consistency）。
* 对于临时授权（role_grant 的 start/end）需要有定时器/cron job 来激活/失效并同步缓存。

---

# 8. 审计、回滚与合规（强制项）

* 所有写操作均写入 `audit_log`，内容包括：operatorId、operatorName、traceId、eventType、targetType、targetId、改变前后快照（JSON）。
* 审计保存策略：默认保存 1 年，且对敏感操作（删除权限、回收角色授予）做 WORM/不可修改处理（或把审计日志复制到只读分析库）。
* 回滚：对于误操作，管理控制台提供“撤销最近一次变更”或“回滚到上一个版本”的操作（基于 audit_log 快照实现）。回滚动作也记录为 audit log。
* 合规：对 `permission_data_scope` 中的 `CUSTOM` SQL 模板做白名单检查与安全审计，避免注入风险。必须审批后才能生效。

---

# 9. 迁移与上线步骤（稳健可回退）

> 目标：最小影响、可验证、可回退

1. **准备**

   * 在 staging 环境创建新表（DDL）。
   * 配置 MQ/事件通道与 Authz Service 的订阅。
   * 准备一个超级管理员账号并配置相应权限。

2. **灰度上线（Read-Only）**

   * 在测试服务中启用对新扩展表的写权限但不影响现有逻辑。
   * 管理端启用 `action` / `data_scope` 的只读视图供管理员熟悉展示（不允许写入）。

3. **小范围写入功能启用（半自动）**

   * 允许管理员为少量 test-permission 添加 action 与数据范围（dry-run 模式：不会触发缓存 invalidation）。
   * 运行一段时间，收集 audit 与一致性差异。

4. **切换到生产（自动生效/审批策略）**

   * 开启写入并在写入后 publish MQ 事件让 Authz 更新缓存（先采用 eventual-consistency 模式）。
   * 观察指标：authz latency、cache hit、拒绝率。

5. **若出现问题回滚**

   * 使用 audit_log 回滚或手动撤销变更。
   * 若严重，回滚 DB（如用版本控制的 resource_version）并发布事件清空/恢复缓存。

6. **文档与培训**

   * 提供管理员手册：Action 与 Data Scope 的使用范例、审批流程、回滚操作。
   * 对开发团队说明 Authz check 的新入参（action/data_scope context）。

---

# 10. 常见问题与注意点

* **为什么不改 permission 表？**
  为了兼容现有系统和历史数据，避免生产风险。采用映射表 `permission_action` 和 `permission_data_scope` 可实现同样功能且回滚简单。后续若需要，也可以做 DB migration 把数据合并到 `permission` 表字段中。

* **Data Scope 的安全性如何保证？**
  `scope_rule` 不应允许任意 SQL，建议采用参数化模板（例如 `dept_id = {{user.dept_id}}`）并在服务端用安全模板引擎解析。对于 `CUSTOM_SQL`，必须审批并建议在沙箱执行与人工审计。

* **Role Hierarchy 的循环依赖如何防止？**
  插入时校验（不允许 parent==child，且禁止产生闭环）。UI 禁止拖拽造成环。

* **临时授权（start/end）如何生效？**
  后端有定时任务/调度（或数据库触发）检查到期并发布 invalidation 事件。不要依赖 cache TTL 仅实现延迟失效。

* **是否需要 Resource Instance 表？**
  若短期内无实例级授权需求，可不启用；设计中保留 `resource_instance` 表为可选，必要时启用。

---

# 附录：示例管理场景与 API 调用示例

## 示例：给 `permission` 绑定动作与数据范围（REST 伪例）

1. 绑定动作 `export` 到 permission id=101

```
POST /api/v1/permission-actions
Content-Type: application/json
Body:
{
  "permission_id": 101,
  "action_ids": [5]   // 5 对应 action.action_code = "export"
}
```

2. 为 permission id=101 绑定 data_scope id=2（DEPT）

```
POST /api/v1/permission-data-scopes
Body:
{
  "permission_id": 101,
  "data_scope_id": 2,
  "config": {"dept_field": "dept_id", "param_template": "{{user.dept_id}}"}
}
```

3. 授予角色给岗位（positionId=12）

```
POST /api/v1/role-grants
Body:
{
  "role_id": 3,
  "grant_type": "POSITION",
  "grant_target_id": "12",
  "start_time": "2025-12-11T00:00:00",
  "end_time": "2026-12-11T00:00:00",
  "notes": "给产品岗位授权订单管理权限"
}
```

* any list
{:toc}