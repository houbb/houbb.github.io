---
layout: post
title:  H2 Database-03-h2 csv 读写
date:  2018-1-16 16:44:12 +0800
categories: [SQL]
tags: [sql, h2, test]
published: true
---

# csv 的读取

## csv 文件准备

我在在 h2-*.jar 相同目录下准备一个 csv 文件：

- user.csv

```
id,name,password
1,ryo,123456
```

## sql 读取 csv 执行

```sql
sql> SELECT * FROM CSVREAD('user.csv');

ID | NAME | PASSWORD
1  | ryo  | 123456
(1 row, 57 ms)
```

## 导入 csv 文件

### 命令

```sql
CREATE TABLE TEST1 AS SELECT * FROM CSVREAD('user.csv');

CREATE TABLE TEST2(ID INT PRIMARY KEY, NAME VARCHAR(255), PASSWORD VARCHAR(255)) AS SELECT * FROM CSVREAD('user.csv');
```

### 查看

```
sql> select * from TEST1;
ID | NAME | PASSWORD
1  | ryo  | 123456
(1 row, 4 ms)

sql> select * from TEST2;
ID | NAME | PASSWORD
1  | ryo  | 123456
(1 row, 0 ms)
```

## 导出 csv 文件

### 命令

```sql
CALL CSVWRITE('user_bak.csv', 'SELECT * FROM TEST1');
```

### 文件内容

```
"ID","NAME","PASSWORD"
"1","ryo","123456"
```

# java 代码实现 csv 读写

## 写入

```java
SimpleResultSet rs = new SimpleResultSet();
rs.addColumn("NAME", Types.VARCHAR, 255, 0);
rs.addColumn("EMAIL", Types.VARCHAR, 255, 0);
rs.addRow("Bob Meier", "bob.meier@abcde.abc");
rs.addRow("John Jones", "john.jones@abcde.abc");
new Csv().write("test.csv", rs, null);
```

- 生成的文件

test.csv 文件如下：

```
"NAME","EMAIL"
"Bob Meier","bob.meier@abcde.abc"
"John Jones","john.jones@abcde.abc"
```

## 读取

```java
ResultSet rs = new Csv().read("test.csv", null, null);
ResultSetMetaData meta = rs.getMetaData();
while (rs.next()) {
    for (int i = 0; i < meta.getColumnCount(); i++) {
        System.out.println(
                meta.getColumnLabel(i + 1) + ": " +
                        rs.getString(i + 1));
    }
    System.out.println();
}

rs.close();
```

输出信息

```
NAME: Bob Meier
EMAIL: bob.meier@abcde.abc

NAME: John Jones
EMAIL: john.jones@abcde.abc
```

# 小结

csv 作为数据库存储常用的格式，h2 提供了非常方便的工具类。

这种可以脱离数据库使用的高度抽象是非常优秀的设计理念，值得我们学习。

* any list
{:toc}