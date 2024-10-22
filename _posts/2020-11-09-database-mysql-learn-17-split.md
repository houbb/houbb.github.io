---
layout: post
title:  mysql-17-mysql 字段如何 split?
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, log, buffer, sf]
published: true
---

# 背景

mysql 中的表标题字段，基本的格式为 `xxxx;yyyy` yyyy 是一些无关的信息拼接。

希望按照 `;` 分割，或者 xxxx 部分的内容。

# 实现方式

在MySQL中，你可以使用`SUBSTRING_INDEX()`函数来截取分号`;`之前的内容。

`SUBSTRING_INDEX()`函数接受三个参数：字符串、分隔符和一个数字，表示在分隔符之前或之后返回多少个子字符串。

如果你想要获取分号`;`之前的内容，可以这样使用这个函数：

```sql
SELECT SUBSTRING_INDEX('xxxx;yyyy', ';', 1) AS result;
```

这里的`1`表示返回第一个分隔符之前的子字符串。执行这个查询后，`result`列将包含`xxxx`。

如果你的字符串中包含多个分号，并且你想要获取第一个分号之前的内容，这个方法同样适用。

# 拓展阅读

[SQL 2PC-两阶段提交 SQL 分布式事务两阶段提交协议(2PC)是一种原子承诺协议(ACP)。](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pc)

# 参考资料

[揭开 Buffer Pool 的面纱](https://xiaolincoding.com/mysql/buffer_pool/buffer_pool.html#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E6%9C%89-buffer-pool)

* any list
{:toc}

