---
layout: post
title: alibaba druid-08-内存泄露 druid oracle Oracle数据库下 PreparedStatementCache 内存问题解决方案
date: 2024-03-27 21:01:55 +0800
categories: [Database]
tags: [database, jdbc, sh]
published: true
---

# 现象

实时链路，同时支持多个 oracle/mysql 的数据源配置

然后，发现 oracle dump 大量的内存数据信息，导致频繁的 GC。

# 怀疑可能1-PreparedStatementCache

## 说明

怀疑是 jdbc 的 PreparedStatementCache，导致的缓存占用过多的内存。

## 修改方式

### 禁用 psCache

将 druid 的 psCache 禁用

```java
DruidDataSource dataSource = new DruidDataSource();
// 是否启用池化 ps
dataSource.setPoolPreparedStatements(false);
```

保险措施：因为 SQL 执行本身就是完整的SQL，同时将代码中的 prepareStatement 改为直接 statement，避免触发 psCache。

当然，不适合的场景不需要这样改。是为了避免内存问题，牺牲了性能。

### 限制 psCache 大小

如果不适应这个场景，可以不做修改，或者限制对应的大小。

## 验证结果

发现效果并不显著。怀疑并不是主要原因。

# Oracle数据库下PreparedStatementCache内存问题解决方案

这篇记录写的不错，直接记录一下：

[Oracle数据库下PreparedStatementCache内存问题解决方案](https://github.com/alibaba/druid/wiki/Oracle%E6%95%B0%E6%8D%AE%E5%BA%93%E4%B8%8BPreparedStatementCache%E5%86%85%E5%AD%98%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)

## 现象

Oracle支持游标，一个PreparedStatement对应服务器一个游标，如果PreparedStatement被缓存起来重复执行，PreparedStatement没有被关闭，服务器端的游标就不会被关闭，性能提高非常显著。

在类似 `SELECT * FROM T WHERE ID = ?` 这样的场景，性能可能是一个数量级的提升。

由于PreparedStatementCache性能提升明显，DruidDataSource、DBCP、JBossDataSource、WeblogicDataSource都实现了PreparedStatementCache。

## PreparedStatementCache带来的问题

阿里巴巴在使用jboss连接池做PreparedStatementCache时，遇到了full gc频繁的问题。

通过mat来分析jmap dump的结果，发现T4CPreparedStatement占内存很多，出问题的几个项目，有的300M，有的500M，最夸张的900M。这些应用都是用jboss连接池访问Oracle数据库，T4CPreparedStatement是Oracle JDBC Driver的PreparedStatement一种实现。 

oracle driver不是开源，通过逆向工程以及mat分析，发现其中占内存的是字段char[] defineChars，defineChars大小的计算公式是这样的：

```
defineChars大小 = rowSize * rowPrefetchCount
```

rowPrefetchCount在Oracle中，缺省值为10。

其中rowSize是执行查询设计的每一列的大小的和。

计算公式是：

```
rowSize = col_1_size + col_2_size + ... + col_n_size
```

很悲剧，有些列数据类型是varchar2(4000)，于是rowSize巨大，很多个表关联的SQL，rowSize可能高达数十K，再乘以rowPrefetchCount，defineChars大小接近1M。可以想想，maxPoolSize设置为30，PreparedStatementCacheSize设置为50的场景下，是可能导致PreparedStatementCache占据上G的内存。 

实际测试得到的结果如下：

```
varchar2(4000)	 col_size 4000 chars
clob -> col_size	 col_size 4000 bytes
```

实际占据内存的公式：

```
占据内存大小峰值 = defineChars大小 * PreparedStatementCacheSize * MaxPoolSize
```

我们实际分析，一个应用运行的SQL大约数百条，PreparedStatementCacheSize为50，PreparedStatementCache的算法为LRU，很多的SQL执行之后，在Cache中HitCount为0就被淘汰了，淘汰的过程，其位置从第1移到第50，这个漫长的过程导致了defineChars不能够被young gc回收。


## Druid的解决方案

使用OracleDriver提供的PreparedStatementCache支持方法，清理PreparedStatement所持有的buffer。 

Oracle在10.x和11.x的Driver中，都提供了如下管理PreparedStatementCache的接口，如下：

```java
 package oracle.jdbc.internal;
 
 import java.sql.SQLException;
 public interface OraclePreparedStatement extends oracle.jdbc.OraclePreparedStatement, OracleStatement {
     public void enterImplicitCache() throws SQLException;
     public void exitImplicitCacheToActive() throws SQLException;
     public void exitImplicitCacheToClose() throws SQLException;
 }
```

DruidDataSource在管理Oracle PreparedStatement Cache时，调用了上述方法。

当调用了enterImplicitCache之后，T4CPreparedStatement中的defineChars和defineBytes都会被清空。

测试表明，通过上述处理，能够有效降低内存。

根据PreparedStatement执行的结果，计算RowPrefetch大小 DrudDataSource对在PreparedStatement.executeQuery和execute方法返回的ResultSet做监控统计执行SQL返回的行数，然后根据统计的结果来设置rowPrefetchSize。例如SQL

```sql
SELECT * FROM ORDER WHERE ID = ?
```

这样的SQL每次返回的纪录数量都是0或者1，根据这个统计的最大值来设置rowPrefetchSize。

如果最大值为1，则需要设置rowPrefetchSize为2。

计算公式如下：

```java
 int maxRowFetchCount = max(resultSet.size) + 1;
 if (maxRowFetchCount > defaultRowPrefetch) {
        maxRowFetchCount = defaultRowPreftech;
 }
 prearedStatement.rowPrefetch = maxRowFetchCount;
```

根据生产环境的监控统计，大多数的SQL返回的行数都是比较小的，通常是1。

通过这种算法，能够减少PreparedStatementCache的内存占用。

添加PreparedStatementCache计数器 包括：

```
 PreparedStatementCacheCurrentSize
 PreparedStatementCacheDeleteCount 缓存删除次数
 PreparedStatementCacheHitCount 缓存命中次数
 PreparedStatementCacheMissCount 缓存不命中次数
 PreparedStatementCacheAccessCount 缓存访问次数
```

通过这五个计数器，我们清晰了解PreparedStatementCache的工作情况，然后根据实际情况调整。

# 参考资料

https://github.com/alibaba/druid/wiki/Oracle%E6%95%B0%E6%8D%AE%E5%BA%93%E4%B8%8BPreparedStatementCache%E5%86%85%E5%AD%98%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88

* any list
{:toc}
