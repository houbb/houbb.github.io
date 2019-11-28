---
layout: post
title: POLARDB-01-快速开始
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 服务创建

可以直接在阿里云购买，此处暂时跳过。

# 驱动包

直接去 [客户端和包](https://helpcdn.aliyun.com/document_detail/124998.html?spm=a2c4g.11186623.6.841.6d961772a2GHNk) 下载压缩包。

## 安装

安装之后实际上会有 3 个 jar 

```
edb-jdbc_license.txt  edb-jdbc16.jar  edb-jdbc17.jar  edb-jdbc18.jar  samples/  uninstall-edb-jdbc.dat  uninstall-edb-jdbc.exe*
```

## 驱动包

上面的几个包就是对应的驱动包，如果想使用一般 Maven 的项目会比较麻烦。

建议直接上传到公司级别仓库，然后使用即可。

类似于 oracle 的驱动包。


# 初步使用汇总

## 初步功能测试

使用 seq + mybatis.insert() 测试成功。

## mybatis-plus 自动生成

个人尝试自动生成失败。

## 关键字

OFFSET LIMIT 这两个建表语句关键字冲突，使用【""】可以转义。

备注字段也需要转义。

未测试对查询是否有影响（问了技术说是可能有影响）

页面控台不支持【/】符号，需要统一改为【;】

## 建表问题

create table MY_TAVLE
(
);

create index MY_TAVLE on MY_TAVLE (MY_COLUMN);

### 报错如下

```
报错：ERROR:  relation "MY_TAVLE" already exists
SQL state: 42P07
```

### 错误原因

索引名称不能和表名称相同。

## 警告

执行完成，发现只有警告，但是没有表被创建。

```
WARNING:  GLOBAL is deprecated in temporary table creation
```

## Seq 迁移问题

### 报错

```
ERROR:  value "99999999999999999999" is out of range for type bigint
SQL state: 22003
```

### 解决方案

`99999999999999999999` 修改为一个 bigint 范围内的数字即可。

## PgAdmin 使用问题

### 不报错

有时候执行结果不报错，实际无效果。可能是信息丢失了，需要多执行几次。

### 布局

拖拽可能导致布局混乱

复位：【File】=>【reset layout】即可


# 参考资料

[连接数据库集群](https://helpcdn.aliyun.com/document_detail/116357.html?spm=a2c4g.11186623.6.723.4f51d3318r6fF6)

* any list
{:toc}
