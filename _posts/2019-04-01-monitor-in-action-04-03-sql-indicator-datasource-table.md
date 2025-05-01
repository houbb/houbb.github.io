---
layout: post
title: 监控系统实战-04-03-SQL 指标的数据源表设计 v1.1.0
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

我们希望存储对应的数据源信息，这里我们设计一下对应的数据源表。

初期可以简单些，只管理基本的信息，不做应用间的引用关系限制。

# 建表语句

这里以 mysql 为例

## 数据源基本信息

清空

```sql
drop table if exists jdbc_datasource_info;
CREATE TABLE jdbc_datasource_info (
    id bigint(20) PRIMARY KEY auto_increment comment '物理主键',
    config_name varchar(64) NOT NULL comment '配置名称',
    config_status varchar(2) NOT NULL comment '配置状态(Y:启动;N:禁用)',
    config_remark varchar(512) NULL comment '配置备注',
    jdbc_driver VARCHAR(100) NOT NULL comment '驱动信息',
    jdbc_username VARCHAR(50) NOT NULL comment '数据源用户',
    jdbc_password VARCHAR(256) NOT NULL comment '数据源密码',
    jdbc_password_salt VARCHAR(256) NOT NULL comment '数据源密码盐值',
    jdbc_url VARCHAR(500) NOT NULL comment '链接信息',
    database_type VARCHAR(128) NOT NULL comment '数据库类型',
    initial_pool_size INT DEFAULT 4 comment '线程池初始化大小',
    max_pool_size INT DEFAULT 20 comment '线程池最大大小',
    max_wait_time_ms INT DEFAULT 5000 comment '获取连接超时时间(ms)',
    idle_timeout_ms INT DEFAULT 60000 comment '空闲连接自动回收时间(ms)',
    validation_query VARCHAR(100) comment '验证查询',
    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (config_name)
) COMMENT '数据源信息';
```

## 任务基本信息

```sql
drop table if exists sql_execute_task;
CREATE TABLE sql_execute_task (
    id bigint(20) PRIMARY KEY auto_increment comment '物理主键',
    task_name varchar(64) NOT NULL comment '任务名称',
    task_status varchar(2) NOT NULL comment '任务状态',
    task_remark varchar(512) NULL comment '任务备注',
    ref_datasource_id bigint(20) NOT NULL comment '引用的数据源ID',
    execute_sql TEXT NOT NULL comment '执行脚本',
    value_extra_list TEXT NULL comment '表达式提取列表',
    after_action_condition varchar(512) NOT NULL comment '后置动作触发条件',
    after_action varchar(16) NOT NULL comment '后置动作',
    receive_user_list varchar(1024) NULL comment '信息接收用户列表',
    next_trigger_time datetime NULL comment '下次执行时间',
    schedule_cron_expression varchar(128) NOT NULL comment '调度表达式',
    schedule_start_at datetime NULL comment '调度开始时间',
    schedule_end_at datetime NULL comment '调度结束时间',
    schedule_max_times bigint(20) null comment '最多执行次数',
    schedule_current_times bigint(20) default 0 comment '当前执行次数',
    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (task_name)
) COMMENT 'SQL执行任务信息';
```

## 任务动作历史表

```sql
drop table if exists sql_task_action_history;
CREATE TABLE sql_task_action_history (
    id bigint(20) PRIMARY KEY auto_increment comment '物理主键',
    task_name varchar(64) NOT NULL comment '任务名称',
    after_action varchar(16) NOT NULL comment '后置动作',
    receive_user_list varchar(1024) NULL comment '信息接收用户列表',
    action_content text comment '动作内容',
    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (task_name)
) COMMENT 'SQL执行动作历史表';
```

# 小结

基本的表信息就是这样，当然后期可以针对表的变化日志+执行记录等进行新增关联表。

# 参考资料

无

* any list
{:toc}
