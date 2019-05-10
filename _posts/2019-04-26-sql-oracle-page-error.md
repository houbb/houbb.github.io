---
layout: post
title: Oracle 分页错误问题
date:  2019-4-16 10:55:13 +0800
categories: [SQL]
tags: [sql, oracle, error, sh]
published: true
---

# 场景

页面查询分页数据重复。可是分页数和总数都是正确的

# 问题排查思路

- 数据库是否重复？

因为前段时间发生类似的事情，结果分页代码没问题，是因为数据本身就重复了。

- 前段分页码传错了？

看了一下，分页码传的是对的。

- 分页代码的问题？

数据库使用的是 mybtis，分页插件用的是 pageHelper。

后来打印了日志，发现确实分页代码有问题。

测试了  myabtis-plus 自带的分页，也是同样的问题。

# 分页代码

## 代码简化如下

```sql
SELECT * FROM ( SELECT TMP_PAGE.*, ROWNUM ROW_ID FROM ( SELECT * FROM TABLE_NAME
                                                        WHERE (XXX)
ORDER BY CREATE_TIME DESC ) TMP_PAGE WHERE ROWNUM <= 20 ) WHERE ROW_ID > 10;

SELECT * FROM ( SELECT TMP_PAGE.*, ROWNUM ROW_ID FROM ( SELECT * FROM TABLE_NAME
                                                        WHERE (XXX)
ORDER BY CREATE_TIME DESC ) TMP_PAGE WHERE ROWNUM <= 30 ) WHERE ROW_ID > 20;
```

## 问题导致的原因

因为这些数据使用了脚本刷的，10-30 的数据创建时间全部一样。

oracle 分页并不能吧保证数据的正确性。

## 如何解决

1. 每一个创建时间都不同。所以建议时间精确到毫秒。刷库的时候使用当前时间。

2. 添加一个唯一标识，比如主键

## 最后解决方案

因为目前数据无法精确毫秒，所以采用方案2

```sql
ORDER BY CREATE_TIME DESC, ID DESC 
```

# 小结

1. 这些世界后很多坑，多到你无法想象。

# 参考资料

* any list
{:toc}