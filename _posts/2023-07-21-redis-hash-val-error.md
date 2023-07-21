---
layout: post
title: Redis exception ERR hash value is not an integer
date:  2023-07-21 +0800
categories: [Redis]
tags: [redis, exception, sh]
published: true
---

# 报错

## redis 报错

```
ERR hash value is not an integer
```

## 代码

其实是通过 redis 操作

```java
redisTemplate.incr("key", String.valueOf(dbVo.getCount()))
```

dbVo 是从数据库获取的数据，count 对应的字段类型是 BigDecimal。

在 oracle 该字段定义是 Number，对应的 mysql 是 Decimal(20, 2)


# 原因分析

## redis 的 incr

```
127.0.0.1:6379> set "intVal" 1
OK
127.0.0.1:6379> get "intVal"
"1"
127.0.0.1:6379> incr "intVal"
(integer) 2

127.0.0.1:6379> set "strVal" "1"
OK
127.0.0.1:6379>
127.0.0.1:6379>
127.0.0.1:6379> get "strVal"
"1"
127.0.0.1:6379> incr "strVal"
(integer) 2


127.0.0.1:6379> set "doubleVal" 16.00
OK
127.0.0.1:6379> incr "doubleVal"
(error) ERR value is not an integer or out of range

127.0.0.1:6379> set "doubleStrVal" "16.00"
OK
127.0.0.1:6379> incr "doubleStrVal"
(error) ERR value is not an integer or out of range
```

会发现 redis 的 incr 命令只支持 int 类型，或者对应的字符串 int。


## 数据库的差异

在 count 存储时，oracle 对于数字比如 16，返回处理时应该是 16，但是 mysql 会被处理为 16.00。

导致 redis incr 报错。

# 解决方案

直接把代码调整一下，确认取 int 值

```java
redisTemplate.incr("key", String.valueOf(dbVo.getCount().intValue()))
```

# 参考资料

[](https://stackoverflow.com/questions/52476224/redis-err-hash-value-is-not-an-integer)

* any list
{:toc}