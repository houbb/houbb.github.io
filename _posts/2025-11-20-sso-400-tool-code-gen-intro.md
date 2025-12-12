---
layout: post
title: 权限体系之-400-代码生成工具介绍
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 代码自动生成平台 — 详细设计

下面给出一个面向你现有技术栈（Spring Boot + MyBatis + Flyway + Vue3 + Vite + Element Plus + TypeScript）的 **代码自动生成平台（CodeGen）** 的完整设计方案。设计内容包含系统架构、功能模块、数据模型、API 设计、模板规范、示例模板、字段/类型映射、生成规则、UI/UX、权限与安全、扩展点、测试/部署和交付产物示例。设计遵循你项目已有规范（禁止 Lombok、包前缀 `com.github.houbb.app.plateform.backend`、Flyway 迁移、MyBatis XML、JWT、salt 等）。

---

# 1 架构概览

* 前端：Vue 3 + Vite + TypeScript + Element Plus

  * 管理控制台：项目管理、数据源配置、表选择、映射编辑、模板选择、生成预览、生成任务管理
* 后端：Spring Boot（同当前后端规范）

  * 模块划分：api、service、gen-core、template-store、job-scheduler、auth
* 持久化：MySQL + Flyway 管理迁移脚本
* 模板存储：数据库存储（可扩展到 Git/文件系统）
* 输出：按项目路径直接写入磁盘或打包为 zip 提供下载
* 触发方式：前端触发 / REST API / CLI（mvn plugin 或 gradle plugin） / Webhook
* 安全：基于你现有 JWT 体系鉴权，RBAC 控制生成权限
* 扩展性：插件式模板（支持自定义模板语言，如 FreeMarker / Mustache / Thymeleaf）

图示（文字版）：

```
[Frontend (Vue)] <--> [Backend API (Spring Boot)] --> [Template Store (DB/Git)]
                                               \--> [CodeGen Core] --> [File System / Zip]
                                               \--> [Job Scheduler] --> [Task Log DB]
```

---

# 2 功能模块

1. **项目/工作区管理**

   * 管理生成目标项目（项目路径、包名、作者等）
   * 支持多个项目配置（例如 dev / prod / demo）

2. **数据源管理**

   * 添加/编辑/测试 数据库连接（MySQL 等）
   * 支持读取表/字段/索引/注释

3. **表与字段映射编辑**

   * 选择多张表
   * 对字段进行 Java 类型、校验注解、是否参与 CRUD（select/insert/update/delete）等配置
   * 支持主外键关系识别（自动识别 FK 或手动建立）

4. **模板管理**

   * 预置模板：Entity/DAO/Mapper XML/Service/Controller/DTO/Request/Response/MapperImpl/MapperXml/ Flyway SQL / Vue 页面 / Vue API
   * 自定义模板：编辑并保存模板 （FreeMarker）
   * 模板版本管理

5. **代码生成引擎**

   * 根据模板 + 表映射生成代码
   * 支持文件覆盖策略（skip/overwrite/merge）
   * 支持生成 Flyway migration 脚本（基于当前 DB 与目标模型比较或仅首次生成）

6. **生成结果与预览**

   * 生成前能在线预览文件
   * 生成后能查看生成日志、下载 zip、或直接写入指定项目路径

7. **任务管理**

   * 异步任务（job）调度（可查询状态/日志/结果）
   * 支持重试/回滚（回滚仅针对生成写入操作提供简单撤回，需谨慎）

8. **权限与审计**

   * RBAC：谁能生成、谁能覆写代码
   * 审计日志：生成人、时间、所选表、模板、输出位置等

9. **CLI / CI 集成**

   * 提供 CLI（jar）或 Maven 插件（可在 CI 中运行）来执行已保存的生成任务

---

# 3 数据模型（数据库表）

下面给出关键业务表建议（简化版，实际按需求扩展），Flyway 脚本以 `V1__create_codegen_tables.sql` 命名。

```sql
CREATE TABLE codegen_project (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  base_package VARCHAR(128) NOT NULL,
  author VARCHAR(64),
  output_path VARCHAR(512) NOT NULL,
  create_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  status TINYINT DEFAULT 1
);

CREATE TABLE codegen_datasource (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128),
  jdbc_url VARCHAR(512),
  username VARCHAR(128),
  password_encrypted VARCHAR(1024),
  driver_class VARCHAR(128),
  create_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE codegen_template (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128),
  category VARCHAR(64), -- backend/frontend/flyway/other
  path_pattern VARCHAR(256), -- 文件输出相对路径模板
  filename_pattern VARCHAR(128), -- 文件名模板
  content MEDIUMTEXT,
  is_default TINYINT DEFAULT 0,
  create_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE codegen_task (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT,
  datasource_id BIGINT,
  requested_by BIGINT,
  status VARCHAR(32),
  params JSON,
  result_location VARCHAR(512),
  create_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE codegen_table_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT,
  table_name VARCHAR(128),
  domain_name VARCHAR(128), -- 目标实体名
  generate_entity TINYINT DEFAULT 1,
  generate_dao TINYINT DEFAULT 1,
  generate_service TINYINT DEFAULT 1,
  generate_controller TINYINT DEFAULT 1,
  extra JSON,
  create_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE codegen_field_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_mapping_id BIGINT,
  column_name VARCHAR(128),
  field_name VARCHAR(128),
  jdbc_type VARCHAR(64),
  java_type VARCHAR(64),
  ts_type VARCHAR(64),
  is_pk TINYINT DEFAULT 0,
  is_nullable TINYINT DEFAULT 1,
  is_insertable TINYINT DEFAULT 1,
  is_updatable TINYINT DEFAULT 1,
  validation JSON,
  comment VARCHAR(256)
);
```

> 密码要加密存储（例如 AES 加密并保存密文），解密需后端 key 管理。

---

# 4 字段与类型映射规则

建议维护一个稳定的映射表（SQL → Java → TypeScript）：

示例（简表）：

| SQL 类型（MySQL）          |                  Java 类型 | TS 类型                 | 说明              |
| ---------------------- | -----------------------: | --------------------- | --------------- |
| varchar, char, text    |                 `String` | `string`              | 带长度信息           |
| int, integer, smallint |        `Integer` / `int` | `number`              | 是否使用包装类型可配置     |
| bigint                 |          `Long` / `Long` | `number`              | 后端主键建议使用 `Long` |
| decimal(p,s)           |             `BigDecimal` | `string`              | 保证精度，前端用 string |
| datetime, timestamp    |          `LocalDateTime` | `string`              | ISO 格式          |
| date                   |              `LocalDate` | `string`              |                 |
| time                   |              `LocalTime` | `string`              |                 |
| tinyint(1)             |    `Boolean` / `Integer` | `boolean` or `number` | 视用途而定           |
| blob, longblob         | `byte[]` / `InputStream` | `string` or `Blob`    |                 |

生成规则应支持用户自定义覆盖每个字段的 Java / TS 类型。

---

# 5 模板规范与示例（FreeMarker）

默认使用 FreeMarker 作为模板引擎（轻量、可读性好）。模板中可访问的上下文模型字段示例：

```json
{
  "project": {"name":"app-plateform","basePackage":"com.github.houbb.app.plateform.backend","author":"老马啸西风"},
  "table": {"name":"user","domainName":"User","comment":"用户表"},
  "fields": [
    {"columnName":"id","fieldName":"id","javaType":"Long","isPk":true,"comment":"主键"},
    {"columnName":"username","fieldName":"username","javaType":"String","comment":"用户名"}
  ],
  "date":"2025-12-12"
}
```

## 5.1 Java 实体模板（示例）

`Entity.ftl`

```ftl
package ${project.basePackage}.model.entity;

import java.io.Serializable;
<#list fields as f>
<#if f.javaType == "LocalDateTime">
import java.time.LocalDateTime;
</#if>
</#list>

/**
 * ${table.domainName} 实体
 * ${table.comment}
 * @author ${project.author}
 * @date ${date}
 */
public class ${table.domainName} implements Serializable {
    private static final long serialVersionUID = 1L;

<#list fields as f>
    /**
     * ${f.comment?if_exists}
     */
    private ${f.javaType} ${f.fieldName};
</#list>

<#list fields as f>
    public ${f.javaType} get${f.fieldName?cap_first}() {
        return ${f.fieldName};
    }
    public void set${f.fieldName?cap_first}(${f.javaType} ${f.fieldName}) {
        this.${f.fieldName} = ${f.fieldName};
    }
</#list>
}
```

> 注意：禁止 Lombok，因此手动生成 getter/setter。

## 5.2 Mapper 接口模板（示例）

`Mapper.ftl`

```ftl
package ${project.basePackage}.mapper;

import java.util.List;
import ${project.basePackage}.model.entity.${table.domainName};

public interface ${table.domainName}Mapper {
    ${table.domainName} selectById(Long id);
    int insert(${table.domainName} record);
    int update(${table.domainName} record);
    int deleteById(Long id);
    List<${table.domainName}> selectAll();
}
```

## 5.3 Mapper XML 模板（示例）

`MapperXml.ftl`

```ftl
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
 "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="${project.basePackage}.mapper.${table.domainName}Mapper">

    <resultMap id="${table.domainName}Map" type="${project.basePackage}.model.entity.${table.domainName}">
    <#list fields as f>
        <result column="${f.columnName}" property="${f.fieldName}" />
    </#list>
    </resultMap>

    <select id="selectById" resultMap="${table.domainName}Map" parameterType="long">
        SELECT
        <#list fields as f>${f.columnName}<#if f_has_next>,</#if></#list>
        FROM ${table.name} WHERE id = #{id}
    </select>

    <insert id="insert" parameterType="${project.basePackage}.model.entity.${table.domainName}">
        INSERT INTO ${table.name} (
        <#list fields as f>${f.columnName}<#if f_has_next>,</#if></#list>
        ) VALUES (
        <#list fields as f>#{${f.fieldName}}<#if f_has_next>,</#if></#list>
        )
    </insert>

    <update id="update" parameterType="${project.basePackage}.model.entity.${table.domainName}">
        UPDATE ${table.name}
        SET
        <#list fields as f>
          <#if !f.isPk>${f.columnName} = #{${f.fieldName}}<#if f_has_next>,</#if></#if>
        </#list>
        WHERE id = #{id}
    </update>

    <delete id="deleteById" parameterType="long">
        DELETE FROM ${table.name} WHERE id = #{id}
    </delete>
</mapper>
```

## 5.4 Controller 模板（示例）

`Controller.ftl`

```ftl
package ${project.basePackage}.controller;

import org.springframework.web.bind.annotation.*;
import ${project.basePackage}.service.${table.domainName}Service;
import ${project.basePackage}.dto.request.*;
import ${project.basePackage}.dto.response.*;
import java.util.List;

/**
 * ${table.domainName} Controller
 */
@RestController
@RequestMapping("/api/${table.name}")
public class ${table.domainName}Controller {

    private final ${table.domainName}Service ${table.domainName?uncap_first}Service;

    public ${table.domainName}Controller(${table.domainName}Service ${table.domainName?uncap_first}Service) {
        this.${table.domainName?uncap_first}Service = ${table.domainName?uncap_first}Service;
    }

    @GetMapping("/{id}")
    public BaseResponse<${table.domainName}DTO> getById(@PathVariable Long id) {
        return BaseResponse.success(${table.domainName?uncap_first}Service.getById(id));
    }
    // ... list, create, update, delete
}
```

## 5.5 Vue 页面模板（示例）

`ListPage.vue.ftl`（使用 Composition API + TypeScript + Element Plus）

```ftl
<template>
  <div>
    <el-button type="primary" @click="onCreate">新增</el-button>
    <el-table :data="rows">
      <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label"/>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="mini" @click="onEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import api from '@/api/${table.domainName?uncap_first}';

const rows = ref([]);
const columns = [
  <#list fields as f>
  { prop: '${f.fieldName}', label: '${f.comment?if_exists?replace("\n"," ")}' }<#if f_has_next>,</#if>
  </#list>
];

onMounted(async () => {
  rows.value = await api.list();
});

function onCreate() { /* 跳转或显示弹窗 */ }
function onEdit(row: any) { /* 编辑 */ }
</script>
```

---

# 6 生成流程（典型一次生成任务）

1. 用户在前端选择 Project、DataSource、表（或上传 SQL）
2. 系统读取表结构并生成默认字段映射（类型、注释）
3. 用户校正映射（修改 Java/TS 类型、字段名、是否生成 CRUD）
4. 用户选择模板集合（或使用默认）
5. 预览生成文件（逐文件预览）
6. 执行生成：

   * 若目标为磁盘路径，则后端以文件写入方式输出（注意权限）
   * 或打包为 zip 并返回供下载
   * 同时创建 Flyway migration 脚本（如果选中）
7. 记录任务日志与审计条目

注意：文件写入策略要谨慎，默认 **不覆盖** 已存在文件或要求用户显式选择覆盖策略（skip/overwrite/backup to .bak）。

---

# 7 REST API 设计（关键接口）

以下为简化的接口规格示例（路径 & 请求体）：

* `POST /api/codegen/projects` — 创建项目
* `GET /api/codegen/datasources` — 列出数据源
* `POST /api/codegen/datasources/test` — 测试连接（body: {jdbcUrl, username, password})
* `GET /api/codegen/tables?datasourceId=xx` — 列出表
* `GET /api/codegen/tables/{tableName}/columns?datasourceId=xx` — 列出字段（含注释）
* `POST /api/codegen/preview` — 预览生成文件（body: task 配置） → 返回 list of {path, content}
* `POST /api/codegen/generate` — 执行生成，响应任务 id
* `GET /api/codegen/tasks/{id}` — 查询任务状态与日志
* `GET /api/codegen/tasks/{id}/download` — 下载 zip

示例 `POST /api/codegen/generate` 请求体核心字段：

```json
{
  "projectId": 1,
  "datasourceId": 2,
  "tables": [
    {
      "tableName": "user",
      "domainName": "User",
      "generate": {"entity": true, "dao": true, "service": true, "controller": true},
      "fields": [
        {"columnName":"id","fieldName":"id","javaType":"Long","isPk":true}
      ]
    }
  ],
  "templates": ["entity","mapper","mapperXml","service","controller","vueList","vueForm"],
  "output": {"mode":"disk","path":"/workspace/projects/app-plateform-backend"},
  "fileConflictStrategy": "skip" // or overwrite/backup
}
```

---

# 8 权限/安全策略

* 所有管理接口需 JWT 鉴权（继承现有鉴权中间件）
* RBAC：角色/权限控制谁能创建项目、谁能执行生成、谁能覆盖文件
* 数据源敏感信息（密码）在 DB 中加密存储
* 对写入磁盘的操作需要检查后端运行账户的文件系统权限、安全白名单（只允许写入预先配置的根目录）
* 审计日志：记录生成人、模板、表、时间、输出路径、操作（生成/覆盖）

---

# 9 异常/回滚/审计

* 生成过程需要记录每一步（读取表、生成文件、写入磁盘）；若写入失败，提供回滚策略：

  * 若选择 `backup` 策略：将被覆盖文件备份到 `.backup/{timestamp}/{file}` 目录
  * 若写入失败并回滚：尝试恢复备份
* 任务日志保存在 DB，可导出
* 每次生成在 audit 表写入一条记录，便于追溯

---

# 10 CI / CLI / 插件支持

* 提供 jar 可执行 CLI：`java -jar codegen-cli.jar --task-id=xxx` 或 `--config config.yml`
* Maven 插件或 Gradle task：在 CI 中执行生成，输出到源码树并提交（注意：CI 模式通常用于非覆盖场景）
* 支持 webhook（例如从 PR 或设计工具触发生成）

---

# 11 模板管理与版本控制

* 模板存储于 DB，支持导入/导出（zip）
* 支持绑定模板版本到项目（避免模板漂移）
* 支持将模板同步到 Git 仓库（可选集成）

---

# 12 UI/UX 建议（主要页面 & 交互）

1. **概览页**：项目列表 / 最近任务 / 模板快速选择
2. **项目配置页**：项目基础信息（包名、作者、输出路径、默认模板）
3. **数据源页**：新增/测试/编辑数据源
4. **表选择页**：树状展示 DB -> 表 -> 列，勾选要生成的表
5. **映射编辑页**（关键）：

   * 自动映射建议（点击应用）
   * 字段级别可编辑：fieldName、javaType、tsType、validation（非空/长度/正则）
   * 批量操作（全部 camelCase、全部转 Long 等）
6. **模板选择页**：列出可用模板、预览模板内容、选择目标文件输出路径
7. **预览与生成页**：显示要生成文件的树，单文件预览，高亮差异（若目标已存在）
8. **任务页**：任务进度、日志、下载/回滚选项

---

# 13 日志/监控/测试

* 记录生成日志（INFO/ERROR），严格使用 `slf4j + log4j2`，不要使用 System.out
* 单元测试：对 CodeGen Core 的模板渲染、映射转换、文件写入策略进行覆盖
* 集成测试：对数据库读取、Flyway 脚本生成进行集成测试（可用内存 MySQL 或 Testcontainers）
* 运行监控：暴露 Prometheus 指标（任务成功率、平均耗时、失败详情）

---

# 14 Flyway 集成

两类策略：

1. **生成表结构脚本（初始）**：当选择生成 Flyway 脚本时，按 `V<timestamp>__create_<table>.sql` 生成 `CREATE TABLE ...` 脚本，放在项目 `src/main/resources/db/migration` 下
2. **基于差异生成**：如果要更新已有结构，生成 `ALTER TABLE` 语句（需谨慎，强烈保留在 review 阶段）

示例 Flyway SQL 片段（生成）：

```sql
-- V20251212_01__create_user_table.sql
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(128),
  `password` VARCHAR(256),
  `email` VARCHAR(256),
  `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

# 15 日志与审计示例

生成任务执行日志条目示例：

```
[2025-12-12 10:00:00] TASK-123 START - user: echo echo - project: app-plateform - templates: entity,mapper,controller
[2025-12-12 10:00:01] READ TABLES - user,role,permission
[2025-12-12 10:00:02] RENDER FILE - /src/main/java/.../model/entity/User.java (created)
[2025-12-12 10:00:03] RENDER FILE - /src/main/resources/mapper/UserMapper.xml (skipped - exists)
[2025-12-12 10:00:05] TASK-123 COMPLETE - 5 files created, 1 skipped
```

---

# 16 扩展点（可插拔）

* **模板引擎**：支持 FreeMarker / Thymeleaf / Mustache
* **输出目标**：文件系统 / Git（自动 commit）/ Artifact 存储（例如 Nexus）/ Zip
* **代码风格检查**：生成后运行格式化工具（Spotless/Prettier）
* **自定义脚本 Hook**：生成前/后执行脚本（例如自动运行 `mvn -q -DskipTests package`）

---

# 17 示例配置（YAML） — 用户保存的生成任务配置

```yaml
project:
  id: 1
  name: app-plateform
  basePackage: com.github.houbb.app.plateform.backend
  author: 老马啸西风
datasource:
  id: 2
tables:
  - tableName: user
    domainName: User
    generate:
      entity: true
      dao: true
      service: true
      controller: true
    fields:
      - columnName: id
        fieldName: id
        javaType: Long
        isPk: true
      - columnName: username
        fieldName: username
        javaType: String
templates:
  - entity
  - mapper
  - mapperXml
  - service
  - controller
output:
  mode: disk
  path: /workspace/projects/app-plateform-backend
conflictStrategy: skip
```

---

# 18 交付产物（示例文件树）

```
app-plateform-backend/
└── src
    └── main
        └── java
            └── com/github/houbb/app/plateform/backend
                ├── model/entity/User.java
                ├── mapper/UserMapper.java
                ├── service/UserService.java
                ├── controller/UserController.java
        └── resources
            ├── mapper/UserMapper.xml
            └── db/migration/V20251212_01__create_user_table.sql
```

---

# 19 非功能性要求（要点）

* **安全**：敏感信息加密、鉴权、写入路径白名单
* **可用性**：生成任务应支持异步且可查询状态
* **可维护性**：模板可版本化、易于扩展
* **可审计性**：完整任务审计日志
* **可测试性**：提供单元/集成测试覆盖

---

# 20 实施建议（迭代交付）

为了尽快可用建议分阶段交付（列出功能点而非时间）：

* **阶段 A（最小可行）**：数据源管理、读取表结构、基础模板（Entity/Mapper/MapperXml/Service/Controller）、预览 + 生成 zip。
* **阶段 B（改进）**：文件写入到磁盘、覆盖策略、任务管理、审计日志、权限控制。
* **阶段 C（企业级）**：模板版本管理、Flyway 脚本生成、CI/CLI 插件、Git 自动提交、差异化脚本生成、复杂关联映射支持。
* **阶段 D（完善）**：模板市场/共享、自定义插件接口、支持更多 DB/ORM 风格、可视化模板编辑器。

---

# 21 风险与注意事项

1. **覆盖风险**：自动覆盖生产代码风险高，默认配置应为不覆盖或要求显式确认。
2. **数据库差异化脚本**：自动生成 `ALTER TABLE` 需人工审核，避免数据丢失。
3. **模板质量**：初期模板需要与团队代码风格严格对齐（格式、异常处理、日志、事务等）。
4. **事务与依赖**：生成的 Service/Controller 需注入事务边界、全局异常、统一响应（符合你现有 BaseResponse/BizException 规范）。



* any list
{:toc}