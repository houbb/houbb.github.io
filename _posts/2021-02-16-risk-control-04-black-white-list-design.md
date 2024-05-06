---
layout: post
title:  风控-04-黑白名单设计
date:  2021-2-14 16:52:15 +0800
categories: [BIZ]
tags: [biz, risk, sh]
published: true
---

# 说明

所有的业务系统中。

都需要对用户的风险做把控，黑白名单一般是非常重要的手段。

# chat

## 如果设计一套风控名单服务

设计一套风控名单服务是一个复杂的过程，它涉及到数据收集、存储、处理、分析以及用户交互等多个方面。

以下是设计一套风控名单服务的一般步骤：

1. **需求分析**：
   - 确定服务的目标用户和使用场景。
   - 明确风控名单服务需要实现的功能。

2. **数据收集**：
   - 收集黑名单数据，可能包括但不限于：个人信用记录、法律诉讼记录、欺诈行为记录等。
   - 收集白名单数据，如经过验证的可信用户或实体。

3. **数据存储**：
   - 设计数据库来存储名单数据，需要考虑数据的安全性和可扩展性。
   - 实现数据的加密存储，以保护个人隐私和数据安全。

4. **数据处理**：
   - 对收集的数据进行清洗和标准化处理，以确保数据的准确性和一致性。
   - 实现数据的实时更新机制，以保持名单的时效性。

5. **风险评估模型**：
   - 构建风险评估模型，根据用户的行为、历史记录等信息评估其风险等级。

6. **名单管理**：
   - 实现名单的添加、删除、更新等管理功能。
   - 设计审核流程，确保名单的准确性和合法性。

7. **接口设计**：
   - 提供API接口供外部系统查询和使用名单服务。
   - 确保接口的安全性，如使用令牌验证、SSL加密等。

8. **用户界面**：
   - 设计用户界面，供管理员和用户查询和管理名单。
   - 提供友好的用户交互设计，简化操作流程。

9. **合规性检查**：
   - 确保服务遵守相关的法律法规，如数据保护法、反洗钱法等。

10. **测试**：
    - 对系统进行全面的测试，包括单元测试、集成测试和性能测试。

11. **部署与监控**：
    - 将系统部署到生产环境。
    - 实施系统监控，确保系统的稳定运行。

12. **用户培训与文档**：
    - 提供用户培训，帮助用户熟悉系统操作。
    - 编写详细的用户手册和操作指南。

13. **反馈与迭代**：
    - 收集用户反馈，不断优化系统功能。
    - 定期更新风险评估模型，以适应新的风控需求。

在设计风控名单服务时，还需要考虑以下因素：

- **隐私保护**：确保遵守数据保护法规，对用户数据进行脱敏处理。
- **数据安全**：采用强加密算法保护数据，防止数据泄露。
- **可扩展性**：设计时考虑未来可能的扩展，如增加新的数据源或服务功能。
- **性能**：确保系统能够处理高并发请求，提供快速响应。
- **容错性**：系统应能够处理部分组件故障，不影响整体服务的可用性。

设计风控名单服务是一个持续的过程，需要不断地根据新的数据、用户需求和技术发展进行调整和优化。

## 让你给黑白名单设计一套数据库表，存储数据。你会设计哪些表？表对应的字段？为什么

设计一套数据库表来存储黑白名单数据时，需要考虑数据的完整性、一致性、可扩展性和查询效率。

以下是一些基本的表设计和对应的字段，以及设计这些表和字段的原因：

1. **黑名单表（Blacklist）**：
   - `id`：主键，唯一标识每个黑名单记录。
   - `entity_type`：标识实体类型，如个人、企业等。
   - `entity_id`：实体的唯一标识，如个人身份证号或企业注册码。
   - `reason`：列入黑名单的原因。
   - `list_type`：黑名单的类型，如IP、邮箱、身份证号等。
   - `created_at`：记录创建的时间戳。
   - `updated_at`：记录最后更新的时间戳。
   - `valid_until`：黑名单记录的有效期，可用来自动清理过期记录。

2. **白名单表（Whitelist）**：
   - `id`：主键。
   - `entity_type`：标识实体类型。
   - `entity_id`：实体的唯一标识。
   - `list_type`：白名单的类型。
   - `created_at`和`updated_at`：同黑名单表。

3. **实体信息表（Entity_Info）**：
   - `entity_id`：主键，与黑白名单表的`entity_id`相对应。
   - `entity_type`：实体类型。
   - `name`：实体名称。
   - `additional_info`：其他相关信息，如联系信息、地址等。

4. **变更日志表（Change_Log）**：
   - `id`：主键。
   - `entity_id`：涉及变更的实体ID。
   - `list_type`：变更的名单类型（黑白名单）。
   - `action`：变更动作（如添加、删除）。
   - `action_by`：执行变更的用户或系统。
   - `action_time`：变更发生的时间。

5. **名单类型表（List_Type）**：
   - `list_type_id`：主键。
   - `type_name`：名单类型的名称，如IP地址、手机号码等。
   - `type_description`：类型描述，用于说明该类型的特点。

6. **名单原因表（Reason）**：
   - `reason_id`：主键。
   - `reason_description`：列入名单的具体原因。

7. **用户操作表（User_Operations）**：
   - `operation_id`：主键。
   - `user_id`：执行操作的用户标识。
   - `entity_id`：被操作的实体ID。
   - `list_type`：操作影响的名单类型。
   - `operation_type`：操作类型（如查询、添加、删除）。
   - `operation_time`：操作发生的时间。

这些表和字段的设计旨在确保数据的规范化和查询效率。例如，通过使用`entity_id`和`entity_type`，可以避免数据冗余，并能够跨不同类型的实体进行查询。`list_type`字段允许系统灵活地扩展新的名单类型。变更日志表和用户操作表有助于审计和追踪系统的变化，这对于风控管理是非常重要的。

在实际应用中，可能还需要考虑索引优化、视图、存储过程、触发器等数据库对象来进一步提升查询效率和自动化管理。

同时，还需要考虑数据的安全性和隐私保护，对敏感信息进行加密存储，并限制对这些数据的访问权限。


## 给出对应的 mysql 建表语句。

以下是包含字段注释的MySQL建表语句：

```sql
-- 黑名单表
CREATE TABLE Blacklist (
    id INT AUTO_INCREMENT COMMENT '主键ID',
    entity_type VARCHAR(255) NOT NULL COMMENT '实体类型，如个人、企业',
    entity_id VARCHAR(255) NOT NULL COMMENT '实体的唯一标识，如身份证号或企业注册码',
    reason VARCHAR(255) NOT NULL COMMENT '列入黑名单的原因',
    list_type VARCHAR(255) NOT NULL COMMENT '黑名单的类型，如IP、邮箱、身份证号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建的时间戳',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新的时间戳',
    valid_until DATETIME COMMENT '黑名单记录的有效期',
    INDEX (entity_type),
    INDEX (list_type),
    PRIMARY KEY (id)
) COMMENT='黑名单表';

-- 白名单表
CREATE TABLE Whitelist (
    id INT AUTO_INCREMENT COMMENT '主键ID',
    entity_type VARCHAR(255) NOT NULL COMMENT '实体类型',
    entity_id VARCHAR(255) NOT NULL COMMENT '实体的唯一标识',
    list_type VARCHAR(255) NOT NULL COMMENT '白名单的类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建的时间戳',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新的时间戳',
    INDEX (entity_type),
    INDEX (list_type),
    PRIMARY KEY (id)
) COMMENT='白名单表';

-- 实体信息表
CREATE TABLE Entity_Info (
    entity_id VARCHAR(255) COMMENT '实体的唯一标识' PRIMARY KEY,
    entity_type VARCHAR(255) NOT NULL COMMENT '实体类型',
    name VARCHAR(255) NOT NULL COMMENT '实体名称',
    additional_info TEXT COMMENT '其他相关信息，如联系信息、地址等'
) COMMENT='实体信息表';

-- 变更日志表
CREATE TABLE Change_Log (
    id INT AUTO_INCREMENT COMMENT '主键ID',
    entity_id VARCHAR(255) NOT NULL COMMENT '涉及变更的实体ID',
    list_type ENUM('Blacklist', 'Whitelist') NOT NULL COMMENT '变更的名单类型',
    action VARCHAR(255) NOT NULL COMMENT '变更动作，如添加、删除',
    action_by VARCHAR(255) NOT NULL COMMENT '执行变更的用户或系统',
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变更发生的时间',
    INDEX (entity_id),
    INDEX (list_type),
    PRIMARY KEY (id)
) COMMENT='变更日志表';

-- 名单类型表
CREATE TABLE List_Type (
    list_type_id INT AUTO_INCREMENT COMMENT '主键ID',
    type_name VARCHAR(255) NOT NULL UNIQUE COMMENT '名单类型的名称',
    type_description TEXT NOT NULL COMMENT '类型描述',
    PRIMARY KEY (list_type_id)
) COMMENT='名单类型表';

-- 名单原因表
CREATE TABLE Reason (
    reason_id INT AUTO_INCREMENT COMMENT '主键ID',
    reason_description VARCHAR(255) NOT NULL COMMENT '列入名单的具体原因',
    PRIMARY KEY (reason_id)
) COMMENT='名单原因表';

-- 用户操作表
CREATE TABLE User_Operations (
    operation_id INT AUTO_INCREMENT COMMENT '主键ID',
    user_id VARCHAR(255) NOT NULL COMMENT '执行操作的用户标识',
    entity_id VARCHAR(255) NOT NULL COMMENT '被操作的实体ID',
    list_type ENUM('Blacklist', 'Whitelist') NOT NULL COMMENT '操作影响的名单类型',
    operation_type VARCHAR(255) NOT NULL COMMENT '操作类型，如查询、添加、删除',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作发生的时间',
    INDEX (user_id),
    INDEX (entity_id),
    INDEX (list_type),
    PRIMARY KEY (operation_id)
) COMMENT='用户操作表';
```

在MySQL中，可以使用`COMMENT`关键字为表和字段添加注释，这有助于数据库的维护和开发人员的理解。

注释会存储在数据库的元数据中，可以通过`SHOW CREATE TABLE`语句查看。

# 参考资料

[多线程使用redis进行累加结果不对，不能保证原子性解决方案](https://blog.csdn.net/cucgyfjklx/article/details/124338511)

[redis 对单个key进行大数据量incr](https://blog.csdn.net/qq_44112474/article/details/115543832)

* any list
{:toc}
