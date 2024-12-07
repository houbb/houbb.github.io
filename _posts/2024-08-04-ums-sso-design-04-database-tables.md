---
layout: post
title: UMS sso-04-内网权限 sso 表要如何设计？
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [sso, user, ums, priviliage, sh]
published: true
---


# 前言

大家好，我是老马。

今天我们来一起讨论下 sso 系统应该设计哪些核心的表？

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)

# 核心表

最基本的表；

### 1. **用户基本信息表 (`user_info`)**
```sql
CREATE TABLE `user_info` (
  `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一标识符',
  `first_name` VARCHAR(255) COMMENT '用户的名字',
  `last_name` VARCHAR(255) COMMENT '用户的姓氏',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT '用户的电子邮件地址，用于登录和通知',
  `phone_number` VARCHAR(20) COMMENT '用户的手机号码',
  `status` ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '用户账户状态，表示是否可用',
  `is_email_verified` TINYINT(1) DEFAULT 0 COMMENT '电子邮件是否通过验证，0=未验证，1=已验证',
  `is_sms_verified` TINYINT(1) DEFAULT 0 COMMENT '短信是否通过验证，0=未验证，1=已验证',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '用户账户创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '用户信息最后更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存储用户的基本信息';
```

### 2. **用户账密信息表 (`user_credentials`)**
```sql
CREATE TABLE `user_credentials` (
  `user_id` BIGINT PRIMARY KEY COMMENT '用户唯一标识符，关联用户基本信息',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  `salt` VARCHAR(255) NOT NULL COMMENT '密码的盐值，用于增强密码安全性',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '密码信息创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '密码信息更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存储用户的账户密码信息';
```

### 3. **认证令牌表 (`auth_tokens`)**
```sql
CREATE TABLE `auth_tokens` (
  `token_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '令牌唯一标识符',
  `user_id` BIGINT NOT NULL COMMENT '关联的用户 ID',
  `token` VARCHAR(255) NOT NULL COMMENT '生成的认证令牌',
  `expires_at` TIMESTAMP NOT NULL COMMENT '令牌的过期时间',
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '令牌的发放时间',
  `status` ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '令牌的状态，标识是否有效'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存储用户认证令牌，用于跨系统 SSO';
```

### 4. **会话表 (`sessions`)**
```sql
CREATE TABLE `sessions` (
  `session_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '会话唯一标识符',
  `user_id` BIGINT NOT NULL COMMENT '关联的用户 ID',
  `session_token` VARCHAR(255) NOT NULL COMMENT '会话标识符，通常是一个随机生成的字符串',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '会话创建时间',
  `expires_at` TIMESTAMP NOT NULL COMMENT '会话过期时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录用户的会话信息，帮助管理用户登录状态';
```

session 的日志：

```sql
CREATE TABLE `session_log` (
  `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志记录唯一标识',
  `user_id` BIGINT NOT NULL COMMENT '关联的用户 ID',
  `session_token` VARCHAR(255) NOT NULL COMMENT '会话标识符',
  `operation_type` ENUM('create', 'expire', 'renew', 'delete') NOT NULL COMMENT '会话操作类型：创建、过期、续期、删除',
  `status` ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '会话状态：活跃、过期、撤销',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '会话创建时间',
  `expires_at` TIMESTAMP NOT NULL COMMENT '会话过期时间',
  `ip_address` VARCHAR(45) COMMENT '会话创建或操作时的 IP 地址',
  `user_agent` VARCHAR(255) COMMENT '会话创建或操作时的客户端信息',
  `operator_id` BIGINT COMMENT '执行该操作的管理员或系统 ID',
  `reason` VARCHAR(255) COMMENT '操作原因（如：会话过期、会话被撤销等）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录用户会话的操作日志，帮助管理会话生命周期';
```

### 5. **登录登出及操作日志表 (`user_login_logout_log`)**
```sql
CREATE TABLE `user_login_logout_log` (
  `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志记录唯一标识',
  `user_id` BIGINT NOT NULL COMMENT '关联的用户 ID',
  `event_type` ENUM('login', 'logout', 'failed_login') NOT NULL COMMENT '事件类型：登录、登出、登录失败',
  `status` ENUM('success', 'failed', 'expired', 'revoked') NOT NULL COMMENT '事件状态：成功、失败、过期、撤销',
  `ip_address` VARCHAR(45) COMMENT '登录/登出事件的 IP 地址',
  `user_agent` VARCHAR(255) COMMENT '登录/登出事件的客户端信息',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '日志记录时间',
  `reason` VARCHAR(255) COMMENT '失败登录的原因，如密码错误、账户锁定等'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录用户的登录登出事件日志';
```

### 6. **二次验证日志表 (`verification_codes_log`)**
```sql
CREATE TABLE `verification_codes_log` (
  `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志记录唯一标识',
  `code_id` BIGINT NOT NULL COMMENT '验证码 ID',
  `user_id` BIGINT NOT NULL COMMENT '关联的用户 ID',
  `verification_type` ENUM('email', 'sms') NOT NULL COMMENT '验证类型（如电子邮件、短信）',
  `code` VARCHAR(10) NOT NULL COMMENT '验证码值',
  `status` ENUM('valid', 'used', 'expired', 'revoked') DEFAULT 'valid' COMMENT '验证码状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '验证码创建时间',
  `expires_at` TIMESTAMP NOT NULL COMMENT '验证码过期时间',
  `operation_type` ENUM('insert', 'update', 'delete') NOT NULL COMMENT '操作类型：插入、更新或删除',
  `operator_id` BIGINT COMMENT '执行该操作的管理员或系统 ID',
  `ip_address` VARCHAR(45) COMMENT '操作的 IP 地址',
  `user_agent` VARCHAR(255) COMMENT '操作的客户端信息'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录二次验证验证码的操作日志';
```

通过这种合并与优化后的设计，历史操作日志表（如 `user_login_logout_log` 和 `verification_codes_log`）能够记录系统中的所有重要变更事件，无需为每个表单独创建历史记录。

每次插入、更新或删除数据时，日志表将记录相关信息，确保在数据变动时有审计轨迹。

此外，采用 `ENUM` 类型来限制状态字段的值，有助于避免数据不一致性。

这样设计能够简化数据库结构，同时确保全面的日志记录功能，有助于后续的安全审计和问题追踪。

# chat

## 如果要考虑实现分布式的 sso 登录验证、session 管理、token 验证、登出 等核心能力，表需要哪些调整和拓展？

### 登出与会话注销机制**

分布式环境下，登出和会话注销需要通知所有节点注销会话。

可以通过以下方式进行：

- 在数据库中更新会话状态（例如将 `status` 设置为 `'revoked'`）。
- 使用分布式缓存（如 Redis）来共享注销的状态信息。
- 在 `sessions` 表中添加 **`revoked_at`** 字段：
  ```sql
  ALTER TABLE `sessions`
  ADD COLUMN `revoked_at` TIMESTAMP COMMENT '会话撤销时间';
  ```

### 跨节点同步（如使用 Redis）

对于分布式架构，您可以使用 **Redis** 等缓存系统来同步会话信息、认证令牌等。

具体方式如下：

- **Session 信息**：可以将会话信息存储到 Redis 中，采用会话 ID 作为 Redis 的 Key，值存储用户 ID、创建时间、过期时间等信息。
- **Token 信息**：将认证令牌存储到 Redis 中，采用 token 作为 Key，值存储用户信息及过期时间。
- **登出机制**：在用户登出时，可以使用 Redis 发布/订阅机制，通知所有节点注销该用户的 Session 和 Token。

### 负载均衡与会话粘性

在分布式环境中，通常会使用负载均衡器来分配请求。

为了确保用户请求始终路由到同一个后端服务节点，您可以启用 **会话粘性**（session sticky）。

这可以通过以下方式实现：

- 基于 **cookie**（如 JSESSIONID）来标识用户会话。
- 或者通过 **负载均衡器**（如 Nginx 或 HAProxy）来实现 IP 地址或会话 ID 的粘性路由。

# 参考资料

* any list
{:toc}  