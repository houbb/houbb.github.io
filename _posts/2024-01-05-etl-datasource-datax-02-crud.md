---
layout: post
title: ETL-01-DataX 是阿里云DataWorks数据集成的开源版本 CRUD 例子
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[DataX集成可视化页面，选择数据源即可一键生成数据同步任务，支持RDBMS、Hive、HBase、ClickHouse、MongoDB等数据源，批量创建RDBMS数据同步任务，集成开源调度系统，支持分布式、增量同步数据、实时查看运行日志、监控执行器资源、KILL运行进程、数据源信息加密等。](https://github.com/WeiYe-Jing/datax-web)

# DataX全量、增量、已删除数据同步方案与实际运用

DataX 是一款可以实现异构数据库间离线数据同步的工具，本文重点将使用DataX做一个oracle到mysql的数据同步，其中会借助datax-web进行可视化配置。

使用场景简单讲下：客户提供了oracle前置库，我们系统每天需要定时从前置库将数据同步到我们自己的mysql数据库。

本文不再细说如何使用datax和data-web，直接从问题的角度触发，主要记录下问题解决思路和办法，欢迎大家指正和探讨！！！


# 2.DataX部分

## 2.1同步数据乱码

jdbcUrl加上指定编码配置即可

## 2.2数据更新问题(主键冲突)：writeMode

默认writeMode为insert，此情况下只能新增数据，有主键冲突就会报错，此时需要设置为写入模式为更新模式（replace）。源码mysqlwriter.md中有解释如下：

* writeMode
* 描述：控制写入数据到目标表采用 `insert into` 或者 `replace into` 或者 `ON DUPLICATE KEY UPDATE` 语句
* 必选：是
* 所有选项：insert/replace/update
* 默认值：insert

mysql比较特殊的写入模式配置为"writeMode": "update"，其他数据库需要酌情配置为"writeMode": "replace"

## 2.3增量同步（根据日期）

按日期进行同步，在reader.parameter增加“where”参数，里面就是需要过滤的数据，例子是只同步30天以内的数据

```sql
"where": "CREATE_TIME > TO_CHAR(TO_DATE(SYSDATE - 30),'yyyy-MM-dd HH24:mi:ss')"
```

# 数据库是oracle，其他数据库可能需要定制。此处的是只同步创建时间在30天内的数据。

可以根据实际业务需要定制where参数来实现数据筛选

## 2.4删除数据同步

datax只有新增和更新两种数据会同步，当源数据库有数据删除时是无法同步的，就会造成源数据库已经删除了，但目标数据库还存在这些数据。

目前想到以下两种方案：

### 2.4.1清空表完全走新增逻辑

在前置sql中配置清空标的sql即可。

唯一的问题就是清空表到数据同步完成期间表是数据确实的，可能对业务影响比较大。

在writer.parameter参数中新增preSql配置即可

```
"preSql": ["truncate table 表名;"],
```

### 2.4.2利用已删除数据不会同步的逻辑

总体思路：

1、需要同步的目标数据库表增加一个SYNC_STATUS字段

2、每次同步时，用前置sql更新SYNC_STATUS=0

3、每次同步数据时将一个常量1同步到SYNC_STATUS，达到SYNC_STATUS=1的目的

4、后置sql执行删除操作，将SYNC_STATUS=0的数据全部删除（源表此数据已经物理删除，目标表此数据不会有更新，所以前置sql更新的SYNC_STATUS=0不会变，可以认定为是已删除数据）

这样目前只能全量同步，需要增量的同步数据（含删除）还需要在进行改造，示例如下：

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3,
        "byte": 1048576
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "xxx",
            "password": "xxx",
            "column": [
              "\"ID\"",
              "1"
            ],
            "splitPk": "ID",
            "connection": [
              {
                "table": [
                  "xxx"
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@//xxx:1521/orcl"
                ]
              }
            ]
          }
        },

        "writer": {
          "name": "mysqlwriter",
          "parameter": {
            "writeMode": "update",
            "username": "xxx",
            "password": "xxx",
            "column": [
              "`ID`",
              "`SYNC_STATUS`"
            ],
            "preSql": [
              "UPDATE xxx SET SYNC_STATUS = '0';"
            ],
            "postSql": [
              "DELETE FROM xxx WHERE SYNC_STATUS = '0';"
            ],
            "connection": [
              {
                "table": [
                  "xxx"
                ],
                "jdbcUrl": "jdbc:mysql://xxx:3306/xxx?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true"
              }
            ]
          }
        }
      }
    ]
  }
}
```


# chat

## datax 如何处理删除操作？

在DataX中，处理删除同步问题通常需要考虑源端和目标端数据的对比，以及如何在目标端删除不再存在于源端的数据。

以下是一些常见的方法：

1. **全量同步：**
   - 通过定期进行全量同步，即将源端的所有数据重新复制到目标端。这确保了目标端的数据与源端完全一致，但在数据量较大时可能效率较低。

2. **增量同步 + 删除标记：**
   - 在源端表中添加一个标记字段，用于标识数据是否被删除。
   - 在数据同步过程中，首先将标记字段为删除状态的数据标记为已删除，并同步到目标端。
   - 在目标端，检测到已删除标记的数据，进行相应的删除操作。

3. **使用时间戳或版本号：**
   - 在源端表中添加时间戳或版本号字段，记录数据的变更时间或版本。
   - 在数据同步过程中，仅同步源端时间戳或版本号大于目标端的数据，确保只同步更新的数据。
   - 对于不再存在于源端的数据，在目标端进行删除操作。

4. **使用第三方工具或脚本：**
   - 利用专门的数据同步工具或脚本，如Debezium、Maxwell等，这些工具能够监控数据库变更并以事件的方式将变更同步到目标端，包括删除操作。

选择哪种方法取决于你的具体场景和需求。在实际应用中，通常需要综合考虑数据量、性能要求、对实时性的需求等因素。

请注意，在删除数据时要小心，确保有合适的备份和恢复机制，以防止误删除。



# 参考资料

https://www.cnblogs.com/simple-young/p/16295488.html#242%E5%88%A9%E7%94%A8%E5%B7%B2%E5%88%A0%E9%99%A4%E6%95%B0%E6%8D%AE%E4%B8%8D%E4%BC%9A%E5%90%8C%E6%AD%A5%E7%9A%84%E9%80%BB%E8%BE%91

[关于离线增量同步删除策略的一个问题](https://github.com/alibaba/DataX/issues/958)

* any list
{:toc}