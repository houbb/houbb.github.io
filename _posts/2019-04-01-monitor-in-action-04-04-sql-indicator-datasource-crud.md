---
layout: post
title: 监控系统实战-04-04-SQL 指标的数据源表的基本增删改查 v1.1.0
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

上一节我们初步定义了相关的数据库表，这一节我们一起来看一下，如何实现对应的表信息管理。


# 基础管理

我们针对上述的 4 张表，实现最基础的增删改查功能。

## 调整一下 admin 的实现

todo...

测试验证功能

SQL 脚本还是使用以前的，将新增的部分拆分出来。

# 数据库备份


## 完整版本的

```
mysqldump -u root -p sql_execute > "D:\db\sql_execute_v20250501.sql"
```

## 简单版本的

```
mysqldump -u root -p --skip-comments --skip-add-drop-table --skip-triggers --skip-routines --events=0 --compact --no-create-db --skip-set-charset --skip-tz-utc --skip-add-locks sql_execute > D:/db/sql_execute_clean.sql
```

字段解释：

```
mysqldump -u 用户名 -p \
--skip-comments \      # 去除注释
--skip-add-drop-table \# 不生成 `DROP TABLE` 语句（若需要删除旧表则去掉此参数）
--skip-triggers \      # 跳过触发器
--skip-routines \      # 跳过存储过程和函数
--events=0 \           # 不导出事件
--compact \            # 精简输出格式
--no-create-db \       # 不生成 `CREATE DATABASE` 语句
--skip-set-charset \   # 不添加 `SET NAMES` 字符集设置
--skip-tz-utc \        # 不处理时区转换
--skip-add-locks \     # 不加锁表语句（`LOCK TABLES`/`UNLOCK TABLES`）
数据库名 > 输出文件.sql
```

## 运行

登录 mysql 之后，直接指定运行文件：

```
source D:\db\sql_execute_v20250501.sql
```

# 小结

基本的表信息就是这样，当然后期可以针对表的变化日志+执行记录等进行新增关联表。

# 参考资料

无

* any list
{:toc}
