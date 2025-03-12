---
layout: post
title: IM 即时通讯系统 SSO 系列-03-初始化建表语句
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# 基础的表设计

设计一下用户生命周期管理，一个普通用户，固定在一个小组内，小组固定在一个部门内，部门固定在一个公司内。

用户还区分为普通真实用户、系统虚拟用户，首先给出这部分的 mysql 表设计，包括数据库建表语句等

```sql
create database sso;
use sso;

-- 组织架构管理系统数据库表结构

-- 公司表
CREATE TABLE company (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '公司ID',
    name VARCHAR(100) NOT NULL COMMENT '公司名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司信息表';

-- 部门表
CREATE TABLE department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    company_id BIGINT NOT NULL COMMENT '所属公司ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门信息表';

-- 小组表
CREATE TABLE team (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '小组ID',
    department_id BIGINT NOT NULL COMMENT '所属部门ID',
    name VARCHAR(100) NOT NULL COMMENT '小组名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小组信息表';

-- 用户表
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    team_id BIGINT NOT NULL COMMENT '所属小组ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    user_type TINYINT DEFAULT 0 COMMENT '用户类型（0-真实用户 1-虚拟用户）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 创建索引
CREATE INDEX idx_company_name ON company(name);
CREATE INDEX idx_department_company ON department(company_id);
CREATE INDEX idx_team_department ON team(department_id);
CREATE INDEX idx_user_team ON user(team_id);
```

# 参考资料

* any list
{:toc}