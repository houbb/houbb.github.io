---
layout: post
title:  Quartz 15-JDBCJobStore 模式介绍
date:  2017-12-19 14:43:25 +0800
categories: [Java]
tags: [java, java-tool, sh]
published: true
---

# 表关系和解释

## 表关系

![表关系](https://img-blog.csdn.net/20170204145258590?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY0ODU1NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

## 解释

```
QRTZ_CALENDARS 以 Blob 类型存储 Quartz 的 Calendar 信息 
QRTZ_CRON_TRIGGERS 存储 Cron Trigger，包括 Cron表达式和时区信息 
QRTZ_FIRED_TRIGGERS 存储与已触发的 Trigger 相关的状态信息，以及相联 Job的执行信息 QRTZ_PAUSED_TRIGGER_GRPS 存储已暂停的 Trigger 组的信息 
QRTZ_SCHEDULER_STATE 存储少量的有关 Scheduler 的状态信息，和别的 Scheduler实例(假如是用于一个集群中) 
QRTZ_LOCKS 存储程序的悲观锁的信息(假如使用了悲观锁) 
QRTZ_JOB_DETAILS 存储每一个已配置的 Job 的详细信息 
QRTZ_JOB_LISTENERS 存储有关已配置的 JobListener 的信息 
QRTZ_SIMPLE_TRIGGERS 存储简单的Trigger，包括重复次数，间隔，以及已触的次数 
QRTZ_BLOG_TRIGGERS Trigger 作为 Blob 类型存储(用于 Quartz 用户用 JDBC创建他们自己定制的 Trigger 类型，JobStore 并不知道如何存储实例的时候) 
QRTZ_TRIGGER_LISTENERS 存储已配置的 TriggerListener 的信息 
QRTZ_TRIGGERS 存储已配置的 Trigger 的信息 
```

## 数据库脚本

mysql 脚本：

```sql
/*
Navicat MySQL Data Transfer

Source Server : localhost
Source Server Version : 50508
Source Host : 127.0.0.1:3306
Source Database : task

Target Server Type : MYSQL
Target Server Version : 50508
File Encoding : 65001

Date: 2016-07-25 21:31:53
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for qrtz_blob_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_blob_triggers`;
CREATE TABLE `qrtz_blob_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`BLOB_DATA` blob,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`),
KEY `SCHED_NAME` (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`) USING BTREE,
CONSTRAINT `QRTZ_BLOB_TRIGGERS_ibfk_1` FOREIGN KEY (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`) REFERENCES `qrtz_triggers` (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_calendars
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_calendars`;
CREATE TABLE `qrtz_calendars` (
`SCHED_NAME` varchar(120) NOT NULL,
`CALENDAR_NAME` varchar(200) NOT NULL,
`CALENDAR` blob NOT NULL,
PRIMARY KEY (`SCHED_NAME`,`CALENDAR_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_cron_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_cron_triggers`;
CREATE TABLE `qrtz_cron_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`CRON_EXPRESSION` varchar(120) NOT NULL,
`TIME_ZONE_ID` varchar(80) DEFAULT NULL,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`),
CONSTRAINT `QRTZ_CRON_TRIGGERS_ibfk_1` FOREIGN KEY (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`) REFERENCES `qrtz_triggers` (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_fired_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_fired_triggers`;
CREATE TABLE `qrtz_fired_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`ENTRY_ID` varchar(95) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`INSTANCE_NAME` varchar(200) NOT NULL,
`FIRED_TIME` bigint(13) NOT NULL,
`PRIORITY` int(11) NOT NULL,
`STATE` varchar(16) NOT NULL,
`JOB_NAME` varchar(200) DEFAULT NULL,
`JOB_GROUP` varchar(200) DEFAULT NULL,
`IS_NONCONCURRENT` varchar(1) DEFAULT NULL,
`REQUESTS_RECOVERY` varchar(1) DEFAULT NULL,
PRIMARY KEY (`SCHED_NAME`,`ENTRY_ID`),
KEY `IDX_QRTZ_FT_TRIG_INST_NAME` (`SCHED_NAME`,`INSTANCE_NAME`) USING BTREE,
KEY `IDX_QRTZ_FT_INST_JOB_REQ_RCVRY` (`SCHED_NAME`,`INSTANCE_NAME`,`REQUESTS_RECOVERY`) USING BTREE,
KEY `IDX_QRTZ_FT_J_G` (`SCHED_NAME`,`JOB_NAME`,`JOB_GROUP`) USING BTREE,
KEY `IDX_QRTZ_FT_JG` (`SCHED_NAME`,`JOB_GROUP`) USING BTREE,
KEY `IDX_QRTZ_FT_T_G` (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`) USING BTREE,
KEY `IDX_QRTZ_FT_TG` (`SCHED_NAME`,`TRIGGER_GROUP`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_job_details
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_job_details`;
CREATE TABLE `qrtz_job_details` (
`SCHED_NAME` varchar(120) NOT NULL,
`JOB_NAME` varchar(200) NOT NULL,
`JOB_GROUP` varchar(200) NOT NULL,
`DESCRIPTION` varchar(250) DEFAULT NULL,
`JOB_CLASS_NAME` varchar(250) NOT NULL,
`IS_DURABLE` varchar(1) NOT NULL,
`IS_NONCONCURRENT` varchar(1) NOT NULL,
`IS_UPDATE_DATA` varchar(1) NOT NULL,
`REQUESTS_RECOVERY` varchar(1) NOT NULL,
`JOB_DATA` blob,
PRIMARY KEY (`SCHED_NAME`,`JOB_NAME`,`JOB_GROUP`),
KEY `IDX_QRTZ_J_REQ_RECOVERY` (`SCHED_NAME`,`REQUESTS_RECOVERY`) USING BTREE,
KEY `IDX_QRTZ_J_GRP` (`SCHED_NAME`,`JOB_GROUP`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_locks
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_locks`;
CREATE TABLE `qrtz_locks` (
`SCHED_NAME` varchar(120) NOT NULL,
`LOCK_NAME` varchar(40) NOT NULL,
PRIMARY KEY (`SCHED_NAME`,`LOCK_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_paused_trigger_grps
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_paused_trigger_grps`;
CREATE TABLE `qrtz_paused_trigger_grps` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_scheduler_state
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_scheduler_state`;
CREATE TABLE `qrtz_scheduler_state` (
`SCHED_NAME` varchar(120) NOT NULL,
`INSTANCE_NAME` varchar(200) NOT NULL,
`LAST_CHECKIN_TIME` bigint(13) NOT NULL,
`CHECKIN_INTERVAL` bigint(13) NOT NULL,
PRIMARY KEY (`SCHED_NAME`,`INSTANCE_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_simple_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_simple_triggers`;
CREATE TABLE `qrtz_simple_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`REPEAT_COUNT` bigint(7) NOT NULL,
`REPEAT_INTERVAL` bigint(12) NOT NULL,
`TIMES_TRIGGERED` bigint(10) NOT NULL,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`),
CONSTRAINT `QRTZ_SIMPLE_TRIGGERS_ibfk_1` FOREIGN KEY (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`) REFERENCES `qrtz_triggers` (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_simprop_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_simprop_triggers`;
CREATE TABLE `qrtz_simprop_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`STR_PROP_1` varchar(512) DEFAULT NULL,
`STR_PROP_2` varchar(512) DEFAULT NULL,
`STR_PROP_3` varchar(512) DEFAULT NULL,
`INT_PROP_1` int(11) DEFAULT NULL,
`INT_PROP_2` int(11) DEFAULT NULL,
`LONG_PROP_1` bigint(20) DEFAULT NULL,
`LONG_PROP_2` bigint(20) DEFAULT NULL,
`DEC_PROP_1` decimal(13,4) DEFAULT NULL,
`DEC_PROP_2` decimal(13,4) DEFAULT NULL,
`BOOL_PROP_1` varchar(1) DEFAULT NULL,
`BOOL_PROP_2` varchar(1) DEFAULT NULL,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`),
CONSTRAINT `QRTZ_SIMPROP_TRIGGERS_ibfk_1` FOREIGN KEY (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`) REFERENCES `qrtz_triggers` (`SCHED_NAME`, `TRIGGER_NAME`, `TRIGGER_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for qrtz_triggers
-- ----------------------------
DROP TABLE IF EXISTS `qrtz_triggers`;
CREATE TABLE `qrtz_triggers` (
`SCHED_NAME` varchar(120) NOT NULL,
`TRIGGER_NAME` varchar(200) NOT NULL,
`TRIGGER_GROUP` varchar(200) NOT NULL,
`JOB_NAME` varchar(200) NOT NULL,
`JOB_GROUP` varchar(200) NOT NULL,
`DESCRIPTION` varchar(250) DEFAULT NULL,
`NEXT_FIRE_TIME` bigint(13) DEFAULT NULL,
`PREV_FIRE_TIME` bigint(13) DEFAULT NULL,
`PRIORITY` int(11) DEFAULT NULL,
`TRIGGER_STATE` varchar(16) NOT NULL,
`TRIGGER_TYPE` varchar(8) NOT NULL,
`START_TIME` bigint(13) NOT NULL,
`END_TIME` bigint(13) DEFAULT NULL,
`CALENDAR_NAME` varchar(200) DEFAULT NULL,
`MISFIRE_INSTR` smallint(2) DEFAULT NULL,
`JOB_DATA` blob,
PRIMARY KEY (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`),
KEY `IDX_QRTZ_T_J` (`SCHED_NAME`,`JOB_NAME`,`JOB_GROUP`) USING BTREE,
KEY `IDX_QRTZ_T_JG` (`SCHED_NAME`,`JOB_GROUP`) USING BTREE,
KEY `IDX_QRTZ_T_C` (`SCHED_NAME`,`CALENDAR_NAME`) USING BTREE,
KEY `IDX_QRTZ_T_G` (`SCHED_NAME`,`TRIGGER_GROUP`) USING BTREE,
KEY `IDX_QRTZ_T_STATE` (`SCHED_NAME`,`TRIGGER_STATE`) USING BTREE,
KEY `IDX_QRTZ_T_N_STATE` (`SCHED_NAME`,`TRIGGER_NAME`,`TRIGGER_GROUP`,`TRIGGER_STATE`) USING BTREE,
KEY `IDX_QRTZ_T_N_G_STATE` (`SCHED_NAME`,`TRIGGER_GROUP`,`TRIGGER_STATE`) USING BTREE,
KEY `IDX_QRTZ_T_NEXT_FIRE_TIME` (`SCHED_NAME`,`NEXT_FIRE_TIME`) USING BTREE,
KEY `IDX_QRTZ_T_NFT_ST` (`SCHED_NAME`,`TRIGGER_STATE`,`NEXT_FIRE_TIME`) USING BTREE,
KEY `IDX_QRTZ_T_NFT_MISFIRE` (`SCHED_NAME`,`MISFIRE_INSTR`,`NEXT_FIRE_TIME`) USING BTREE,
KEY `IDX_QRTZ_T_NFT_ST_MISFIRE` (`SCHED_NAME`,`MISFIRE_INSTR`,`NEXT_FIRE_TIME`,`TRIGGER_STATE`) USING BTREE,
KEY `IDX_QRTZ_T_NFT_ST_MISFIRE_GRP` (`SCHED_NAME`,`MISFIRE_INSTR`,`NEXT_FIRE_TIME`,`TRIGGER_GROUP`,`TRIGGER_STATE`) USING BTREE,
CONSTRAINT `QRTZ_TRIGGERS_ibfk_1` FOREIGN KEY (`SCHED_NAME`, `JOB_NAME`, `JOB_GROUP`) REFERENCES `qrtz_job_details` (`SCHED_NAME`, `JOB_NAME`, `JOB_GROUP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
```

## jdbc 操作顺序

主要的JDBC操作类，执行sql顺序。

```
Simple_trigger ：插入顺序
qrtz_job_details --->  qrtz_triggers --->  qrtz_simple_triggers
qrtz_fired_triggers

Cron_Trigger：插入顺序
qrtz_job_details --->  qrtz_triggers --->  qrtz_cron_triggers
qrtz_fired_triggers
```

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

# 参考资料

[通过maven添加quartz-spring 整合](https://www.cnblogs.com/jgig11/p/4383302.html )

[开源框架-PowerJob](https://github.com/KFCFans/PowerJob)

[Establishing SSL connection without server's identit](https://blog.csdn.net/weixin_44779019/article/details/93342054)

* any list
{:toc}