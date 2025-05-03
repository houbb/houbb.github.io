---
layout: post
title: 监控报警系统-14-报警中心系统设计实战之表设计
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, system-design, alarm-center]
published: false
---


# 说明

针对我们的需求，我们设计一些核心的表。

满足我们的需求。

# 申请系统表

## 说明

记录申请的系统表，以及对应的接口能力。

## 语句

```sql
drop table if exists alarm_system_info;
CREATE TABLE alarm_system_info (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    system_id varchar(64) NOT NULL comment '系统标识',
    system_name varchar(64) NOT NULL comment '系统名称',
    config_status varchar(512) NULL comment '配置状态',
    config_remark varchar(512) NULL comment '配置备注',
    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (config_name)
) COMMENT '报警系统信息';
```

接口可以选择是否控制，一般也可以不控制这么细致。

# 报警信息

## 核心表

```sql
drop table if exists alarm_original_info;
CREATE TABLE alarm_original_info (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    alarm_uid varchar(32) NOT NULL comment '报警唯一标识',

    token varchar(64) NOT NULL comment '令牌',
    trace_id varchar(64) NOT NULL comment '请求标识',
    
    request_time bigint(20) NOT NULL comment '请求时间',
    request_system varchar(64) NOT NULL comment '请求系统标识',
    out_alarm_id varchar(64) NOT NULL comment '外部报警标识',
    event_id varchar(64) NOT NULL comment '事件标识',

    alarm_value varchar(128) NULL comment '报警值',
    alarm_type varchar(16) NULL comment '报警类型',
    alarm_level varchar(16) NULL comment '报警等级',
    alarm_status varchar(8) NULL comment '报警状态',
    alarm_time datetime NULL comment '报警时间',

    title varchar(64) NULL comment '报警标题',
    ip varchar(64) NULL comment '报警IP',
    app_name varchar(64) NULL comment '应用',
    content TEXT comment '应用',
    data_map_json TEXT comment '数据信息',
    extra_map_json TEXT comment '附加属性',
    remark TEXT comment '报警备注',

    send_status varchar(16) comment '发送状态',
    send_time datetime comment '发送时间',
    send_info TEXT comment '发送信息',
    ignore_config_id bigint(20) comment '忽略配置标识',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (alarm_uid),
    UNIQUE KEY (out_alarm_id, request_system),
    KEY ix_create_time (create_time)
) COMMENT '报警原始信息';
```

## 事件表

从 eventId 的视角看报警。

```sql
drop table if exists alarm_event_info;
CREATE TABLE alarm_event_info (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    
    request_system varchar(64) NOT NULL comment '请求系统标识',
    event_id varchar(64) NOT NULL comment '事件标识',

    app_name varchar(64) NOT NULL comment '应用',
    alarm_value varchar(128) NULL comment '报警值',
    alarm_type varchar(16) NULL comment '报警类型',
    alarm_level varchar(16) NULL comment '报警等级',
    alarm_status varchar(8) NULL comment '报警状态',
    alarm_time datetime NULL comment '报警时间',

    title varchar(64) NULL comment '报警标题',
    ip varchar(64) NULL comment '报警IP',
    
    content TEXT comment '应用',
    data_map_json TEXT comment '数据信息',
    extra_map_json TEXT comment '附加属性',
    remark TEXT comment '报警备注',

    alarm_count bigint(20) NULL comment '总报警数',
    handle_action varchar(16) NULL comment '处理动作',
    handle_status varchar(16) NULL comment '处理状态',
    handle_time datetime NULL comment '处理时间',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (request_system, event_id),
    KEY ix_update_time (update_time)
) COMMENT '报警事件信息';
```

对应的操作日志表+审批流程等等。


# 收件人

初期可以简单些，直接根据用户传入的为准。

后续可以拓展。

## 类型

email 邮箱

phone 收集

userId 用户标识

## 语句

```sql
drop table if exists alarm_receiver;
CREATE TABLE alarm_receiver (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    alarm_uid varchar(32) NOT NULL comment '报警唯一标识',

    receiver_type varchar(32) NOT NULL comment '收件人类型',
    receiver_info varchar(128) NOT NULL comment '收件人信息',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (alarm_uid),
    UNIQUE KEY (out_alarm_id, request_system),
    KEY ix_create_time (create_time)
) COMMENT '报警收件人信息';
```

辅助的用户表，如果有 cmdb 则不需要，初期可以过渡使用。

```sql
drop table if exists alarm_user;
CREATE TABLE alarm_user (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    user_id varchar(32) NOT NULL comment '用户唯一标识',
    user_name varchar(8) NOT NULL comment '用户名',
    user_status varchar(8) NOT NULL comment '用户状态',
    user_remark varchar(128) NULL comment '用户备注',
    phone varchar(16) NULL comment '手机号',
    email varchar(64) NULL comment '邮箱',
    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY (user_id),
    KEY ix_create_time (create_time)
) COMMENT '报警用户';
```

# 实际通知+渠道

```sql
drop table if exists alarm_notify;
CREATE TABLE alarm_notify (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    alarm_uid varchar(32) NOT NULL comment '报警唯一标识',
    alarm_uid varchar(32) NOT NULL comment '报警唯一标识',

    channel_type varchar(32) NOT NULL comment '通知渠道',
    receiver_type varchar(32) NOT NULL comment '收件人类型',
    receiver_info varchar(128) NOT NULL comment '收件人信息',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    KEY ix_alarm_uid(alarm_uid),
    KEY ix_create_time (create_time)
) COMMENT '报警通知信息';
```


# 屏蔽

## 说明

针对各种条件的处理

## 建表

ALL 匹配所有。

condition_expression and/or/define

```sql
drop table if exists alarm_ignore;
CREATE TABLE alarm_ignore (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    config_name varchar(64) NOT NULL comment '配置名称',
    config_status varchar(8) NOT NULL comment '配置状态',
    config_remark varchar(512) NULL comment '配置备注',
    app_name varchar(64) NOT NULL comment '应用信息',

    condition_logic varchar(32) NOT NULL comment '条件逻辑',
    condition_expression varchar(512) NULL comment '条件表达式',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY uk_config_name(config_name),
    KEY ix_create_time (create_time)
) COMMENT '报警忽略配置';

drop table if exists alarm_ignore_condition;
CREATE TABLE alarm_ignore_condition (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
         bigint(20) NOT NULL comment '引用忽略主键',

    conditon_name varchar(64) NOT NULL comment '条件名称',
    conditon_remark varchar(512) NULL comment '条件备注',

    left_value varchar(128) NULL comment '左值',
    match_operator varchar(32) NULL comment '操作符',
    right_value varchar(128) NULL comment '右值',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    KEY ix_ref_action_id(ref_action_id),
    KEY ix_create_time (create_time)
) COMMENT '报警忽略配置条件';
```

核心逻辑：

https://github.com/houbb/match

https://github.com/houbb/expression-integration

# 后置处理动作

## 说明

针对报警的后续操作处理

## 建表

```sql
drop table if exists alarm_action;
CREATE TABLE alarm_action (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    config_name varchar(64) NOT NULL comment '配置名称',
    config_status varchar(8) NOT NULL comment '配置状态',
    config_remark varchar(512) NULL comment '配置备注',
    app_name varchar(64) NOT NULL comment '应用信息',

    condition_logic varchar(32) NOT NULL comment '条件逻辑',
    condition_expression varchar(512) NULL comment '条件表达式',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    UNIQUE KEY uk_config_name(config_name),
    KEY ix_create_time (create_time)
) COMMENT '报警动作配置';

drop table if exists alarm_action_condition;
CREATE TABLE     (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    ref_action_id bigint(20) NOT NULL comment '引用动作主键',

    conditon_name varchar(64) NOT NULL comment '条件名称',
    conditon_remark varchar(512) NULL comment '条件备注',

    left_value varchar(128) NULL comment '左值',
    match_operator varchar(32) NULL comment '操作符',
    right_value varchar(128) NULL comment '右值',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    KEY ix_ref_action_id(ref_action_id),
    KEY ix_create_time (create_time)
) COMMENT '报警动作配置条件';
```

# 处理闭环（优先级较低）

## 说明

相关的处理动作

记录对应的日志+审计

## 建表

```sql
drop table if exists alarm_handle_history;
CREATE TABLE alarm_handle_history (
    id bigint(20) PRIMARY KEY auto_increment comment '主键',
    alarm_event_id bigint(20) NOT NULL comment '报警事件标识',

    handle_action varchar(16) NULL comment '处理动作',
    handle_status varchar(16) NULL comment '处理状态',
    handle_time datetime NULL comment '处理时间',

    create_time datetime comment '创建时间',
    update_time datetime comment '更新时间',
    create_by VARCHAR(64) comment '创建人',
    update_by VARCHAR(64) comment '更新人',
    KEY ix_alarm_event_id(alarm_event_id),
    KEY ix_create_time (create_time)
) COMMENT '报警处理历史';
```

# 聚合、收敛

todo...

# 通知模板

todo...


# 参考资料




* any list
{:toc}
