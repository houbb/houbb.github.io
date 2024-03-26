---
layout: post
title: 数据库基础知识 mysql 如何获取 sql 查询的字段别名？
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, sql-basic, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-01-Hibernate、MyBatis、EclipseLink、Spring Data JPA、TopLink、ActiveJDBC、Querydsl 和 JOOQ 对比](https://houbb.github.io/2016/05/21/orm-01-overview)

[ORM-02-Hibernate 对象关系映射（ORM）框架](https://houbb.github.io/2016/05/21/orm-02-hibernate)

[ORM-02-JPA Java Persistence API 入门介绍](https://houbb.github.io/2016/05/21/orm-03-jpa)

[orm-04-Spring Data JPA 入门介绍](https://houbb.github.io/2016/05/21/orm-04-spring-data-jpa)

[ORM-05-javalite activejdbc](https://houbb.github.io/2016/05/21/orm-05-javalite-activejdbc)

[ORM-06-jooq 入门介绍](https://houbb.github.io/2016/05/21/orm-06-jooq)

[ORM-07-querydsl 入门介绍](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-08-EclipseLink 入门介绍](https://houbb.github.io/2016/05/21/orm-08-EclipseLink)

[ORM-09-TopLink](https://houbb.github.io/2016/05/21/orm-09-Toplink)

# 前言

有时候我们期望获取到对应的 sql 字段信息别名称。

## 思路

有两种思路：

1）思路1：直接解析查询结果

2）思路2：解析 SQL


# 测试验证

下面我们来测试验证一下。

## 数据准备

以 mysql 为例子。

```sql
create database jdbc_alias;
use jdbc_alias;

CREATE TABLE user_info
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(255) NOT NULL,
    status      VARCHAR(50),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into user_info (username, status) values ('u1', 'Y');
insert into user_info (username, status) values ('u2', 'N');

--  select * from user_info;
```

# 方法1-解析查询结果

## maven 

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.27</version> <!-- 此处替换为你需要的版本 -->
</dependency>
```


## 代码

```java
package com.github.houbb.jdbc.alias;

import java.sql.*;

public class JdbcMain {


    public static void main(String[] args) {
        // JDBC连接参数
        String url = "jdbc:mysql://localhost:3306/jdbc_alias";
        String username = "admin";
        String password = "123456";

        // SQL查询语句
        String sql = "SELECT COUNT(*) AS val, status AS userStatus FROM user_info GROUP BY status";

        try (Connection conn = DriverManager.getConnection(url, username, password); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                final int columnLen = rs.getMetaData().getColumnCount();

                for(int i = 1; i <= columnLen; i++) {
                    // 别名
                    String label = rs.getMetaData().getColumnLabel(i);
                    Object value = rs.getObject(i);

                    System.out.printf("label=%s, value=%s%n", label, value);
                }

                System.out.println("------------ \r\n");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


}
```

测试效果：

```
label=val, value=1
label=userStatus, value=N
------------ 

label=val, value=1
label=userStatus, value=Y
------------ 
```

可以发现已经正确的解析了。

## 优缺点

这种方式的优点就是数据非常准确相对简单。

但是缺点是数据没有数据的话，就无法实现。

### 测试代码

```java
package com.github.houbb.jdbc.alias;

import java.sql.*;

public class JdbcMain2 {


    public static void main(String[] args) {
        // JDBC连接参数
        String url = "jdbc:mysql://localhost:3306/jdbc_alias";
        String username = "admin";
        String password = "123456";

        // SQL查询语句
        String sql = "SELECT COUNT(*) AS val, status AS userStatus FROM user_info where 1=2 GROUP BY status";

        try (Connection conn = DriverManager.getConnection(url, username, password); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {

            final int columnLen = rs.getMetaData().getColumnCount();
            for(int i = 1; i <= columnLen; i++) {
                // 别名
                String label = rs.getMetaData().getColumnLabel(i);
                Object value = rs.getObject(i);

                System.out.printf("label=%s, value=%s%n", label, value);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
```

会直接报错

```
java.sql.SQLException: Illegal operation on empty result set.
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:129)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:97)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:89)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:63)
	at com.mysql.cj.jdbc.result.ResultSetImpl.checkRowPos(ResultSetImpl.java:517)
	at com.mysql.cj.jdbc.result.ResultSetImpl.getObject(ResultSetImpl.java:1109)
	at com.github.houbb.jdbc.alias.JdbcMain2.main(JdbcMain2.java:23)
```

我们可以考虑第二种方式，解析 SQL

# 方法2-解析 SQL

我们可以借助 jsqlparser 这种 sql 解析工具。

## maven 依赖

```xml
<dependency>
    <groupId>com.github.jsqlparser</groupId>
    <artifactId>jsqlparser</artifactId>
    <version>4.2</version>
</dependency>
```

## java 实现

```java
package com.github.houbb.jdbc.alias;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.*;

import java.util.List;

public class JSqlParserMain {


    public static void main(String[] args) {
        String sql = "SELECT COUNT(*) AS val, status AS userStatus, create_time FROM user_info where 1=2 GROUP BY status";

        try {
            Statement statement = CCJSqlParserUtil.parse(sql);

            // 检查是否为SELECT语句
            if (statement instanceof Select) {
                Select selectStatement = (Select) statement;
                SelectBody selectBody = selectStatement.getSelectBody();

                // 检查是否为简单SELECT语句
                if (selectBody instanceof PlainSelect) {
                    PlainSelect plainSelect = (PlainSelect) selectBody;

                    // 获取SELECT项列表
                    List<SelectItem> selectItems = plainSelect.getSelectItems();

                    // 遍历SELECT项列表
                    for (SelectItem selectItem : selectItems) {
                        // 检查是否为别名项
                        if (selectItem instanceof SelectExpressionItem) {
                            SelectExpressionItem selectExpressionItem = (SelectExpressionItem) selectItem;
                            Expression expression = selectExpressionItem.getExpression();

                            // 如果该项有别名，则获取别名并输出
                            if (selectExpressionItem.getAlias() != null) {
                                String alias = selectExpressionItem.getAlias().getName();
                                System.out.println("别名: " + alias);
                            } else {
                                System.out.println("别名不存在");
                            }
                        }
                    }
                }
            }
        } catch (JSQLParserException e) {
            e.printStackTrace();
        }
    }


}
```


效果：

```
别名: val
别名: userStatus
别名不存在
```

PS：测试发现这里支持 ? 的占位符 SQL.

## 问题

### plainSelect

PlainSelect 是 JSQLParser 中的一个类，表示了 SQL 中的简单 SELECT 语句，即不包含 UNION、JOIN、子查询等复杂结构的 SELECT 语句。

在 JSQLParser 中，SelectBody 是 SELECT 语句的主体部分，可以包含各种不同类型的 SELECT 语句，比如简单的 PlainSelect、UNION SELECT、子查询等等。

而PlainSelect 是其中一种，它表示了一个普通的 SELECT 语句，通常包含了 FROM、WHERE、GROUP BY、HAVING 和 ORDER BY 等子句，但不包含任何 JOIN、UNION 或子查询。

因此，在你提供的代码片段中，if (selectBody instanceof PlainSelect) 这一行检查了 SELECT 语句的主体部分是否是简单的 SELECT 语句，如果是，则进入条件体执行相应的操作。

测试了下 

```sql
String sql = "SELECT COUNT(*) AS val, status AS userStatus, create_time FROM user_info " +
                "where status in (select status from user_info) GROUP BY status";
```

这个是支持的。

## 复杂的场景

如果你想写一个不是 `PlainSelect` 的查询SQL，可以考虑使用更复杂的查询，比如包含 JOIN、子查询、UNION 等的查询语句。下面是一个示例，展示了一个包含 JOIN 的查询：

假设你有另外一个名为 `user_status_info` 的表，用来存储用户的状态信息，结构如下：

```sql
CREATE TABLE user_status_info (
    user_id INT,
    user_status VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);
```

现在，你可以编写一个包含 JOIN 的查询，以获取用户信息和状态信息：

```sql
SELECT ui.id, ui.username, ui.status, usi.user_status, usi.last_updated
FROM user_info ui
JOIN user_status_info usi ON ui.id = usi.user_id;
```

这个查询将会联合两个表 `user_info` 和 `user_status_info`，通过 `id` 字段进行匹配。查询结果将包含用户的基本信息以及对应的状态信息。

这个查询中的 `SELECT` 语句的主体部分不再是 `PlainSelect`，因为它包含了 `JOIN` 子句。

### 实际测试

```java
package com.github.houbb.jdbc.alias;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.*;

import java.util.List;

public class JSqlParserMain3 {


    public static void main(String[] args) {
        String sql = "SELECT ui.id as id, ui.username as username, ui.status as status1, usi.user_status as status2, " +
                "usi.last_updated as last_updated\n" +
                "FROM user_info ui\n" +
                "JOIN user_status_info usi ON ui.id = usi.user_id;";

        try {
            Statement statement = CCJSqlParserUtil.parse(sql);

            // 检查是否为SELECT语句
            if (statement instanceof Select) {
                Select selectStatement = (Select) statement;
                SelectBody selectBody = selectStatement.getSelectBody();

                // 检查是否为简单SELECT语句
                if (selectBody instanceof PlainSelect) {
                    PlainSelect plainSelect = (PlainSelect) selectBody;

                    // 获取SELECT项列表
                    List<SelectItem> selectItems = plainSelect.getSelectItems();

                    // 遍历SELECT项列表
                    for (SelectItem selectItem : selectItems) {
                        // 检查是否为别名项
                        if (selectItem instanceof SelectExpressionItem) {
                            SelectExpressionItem selectExpressionItem = (SelectExpressionItem) selectItem;
                            Expression expression = selectExpressionItem.getExpression();

                            // 如果该项有别名，则获取别名并输出
                            if (selectExpressionItem.getAlias() != null) {
                                String alias = selectExpressionItem.getAlias().getName();
                                System.out.println("别名: " + alias);
                            } else {
                                System.out.println("别名不存在");
                            }
                        }
                    }
                }
            }
        } catch (JSQLParserException e) {
            e.printStackTrace();
        }
    }


}
```

效果:

```
别名: id
别名: username
别名: status1
别名: status2
别名: last_updated
```


# 参考资料

* any list
{:toc}