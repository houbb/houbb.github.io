---
layout: post
title:  MySQL-21-查询时的特殊字符 反斜杠
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# 场景

mysql 基本的字符串字段存在 `\` 字符，导致数据查不出来。

## 解释

在MySQL中，反斜杠`\`是一个转义字符，用于转义其他特殊字符。如果你的字符串字段中包含反斜杠，并且你想要在查询中使用这些数据，你需要对反斜杠进行转义。这可以通过在反斜杠前再添加一个反斜杠来实现，即使用`\\`。

例如，如果你有一个字符串`example\\text`，并且你想要在查询中搜索这个字符串，你应该这样写查询条件：

```sql
SELECT * FROM your_table WHERE your_column = 'example\\\\text';
```

这里，`\\`实际上是代表了一个反斜杠字符。第一个反斜杠转义了第二个反斜杠，因此数据库会将其视为一个普通的反斜杠字符。

如果你使用的是程序代码来构建查询，并且你的编程语言也使用反斜杠作为转义字符（如Python），你可能需要使用四个反斜杠`\\\\`来表示一个数据库中的反斜杠：

```python
query = "SELECT * FROM your_table WHERE your_column = 'example\\\\\\\\text'";
```

在这种情况下，Python代码中的`\\\\`会被解释为一个反斜杠，然后在MySQL中再次被转义，最终变成一个普通的反斜杠。

记住，当你从数据库中检索数据时，如果数据中包含反斜杠，你可能也需要在显示或处理这些数据时进行适当的转义处理。


* any list
{:toc}