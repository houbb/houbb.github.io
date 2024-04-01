---
layout: post
title: mysql Tutorial-03-java 访问 mysql 入门例子
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# 说明

java 访问 mysql 的入门例子。

## maven 依赖

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version> <!-- 这里使用的是MySQL Connector/J 8.0.28版本 -->
</dependency>
```

## mysql 建表语句

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 员工ID，作为主键，并自动增长
    name VARCHAR(100), -- 员工姓名，最大长度为100个字符
    age INT, -- 员工年龄
    department VARCHAR(100), -- 员工部门，最大长度为100个字符
    salary DECIMAL(10, 2) -- 员工工资，总共10位，其中小数部分为2位
);
```

初始化几条数据：

```sql
-- 向 employees 表中插入几条初始化数据
INSERT INTO employees (name, age, department, salary) VALUES ('Alice', 30, 'Sales', 5000.00);
INSERT INTO employees (name, age, department, salary) VALUES ('Bob', 35, 'Marketing', 6000.00);
INSERT INTO employees (name, age, department, salary) VALUES ('Charlie', 28, 'IT', 5500.00);
INSERT INTO employees (name, age, department, salary) VALUES ('David', 32, 'HR', 5200.00);
```

数据确认：

```
mysql> select * from employees;
+----+---------+------+------------+---------+
| id | name    | age  | department | salary  |
+----+---------+------+------------+---------+
|  1 | Alice   |   30 | Sales      | 5000.00 |
|  2 | Bob     |   35 | Marketing  | 6000.00 |
|  3 | Charlie |   28 | IT         | 5500.00 |
|  4 | David   |   32 | HR         | 5200.00 |
+----+---------+------+------------+---------+
4 rows in set (0.00 sec)
```

## 代码

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class MySQLExample {
    // MySQL数据库连接信息
    static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
    static final String DB_URL = "jdbc:mysql://localhost:3306/mydatabase";
    static final String USER = "username";
    static final String PASS = "password";

    public static void main(String[] args) {
        Connection conn = null;
        Statement stmt = null;
        try {
            // 注册 JDBC 驱动
            Class.forName(JDBC_DRIVER);

            // 打开连接
            System.out.println("连接数据库...");
            conn = DriverManager.getConnection(DB_URL, USER, PASS);

            // 执行查询
            System.out.println("实例化Statement对象...");
            stmt = conn.createStatement();
            String sql;
            sql = "SELECT id, name, age FROM employees";
            ResultSet rs = stmt.executeQuery(sql);

            // 处理结果集
            while (rs.next()) {
                // 通过字段检索
                int id = rs.getInt("id");
                String name = rs.getString("name");
                int age = rs.getInt("age");

                // 输出数据
                System.out.print("ID: " + id);
                System.out.print(", 姓名: " + name);
                System.out.println(", 年龄: " + age);
            }
            // 关闭结果集、语句和连接
            rs.close();
            stmt.close();
            conn.close();
        } catch (SQLException se) {
            // 处理 JDBC 错误
            se.printStackTrace();
        } catch (Exception e) {
            // 处理 Class.forName 错误
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException se2) {
            }// 什么都不做
            try {
                if (conn != null) conn.close();
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        System.out.println("Goodbye!");
    }
}
```

在这个示例中：

首先，我们在类中定义了MySQL数据库的连接信息，包括JDBC驱动程序类名、数据库URL、用户名和密码。

然后，在main方法中，我们注册了MySQL JDBC驱动程序，打开了数据库连接，并创建了一个Statement对象用于执行SQL查询。

接下来，我们执行了一个简单的查询，并通过结果集（ResultSet）迭代结果，打印出每个员工的ID、姓名和年龄。

最后，我们关闭了结果集、语句和连接，释放了资源。

请确保将DB_URL、USER和PASS替换为你自己的数据库连接信息，并且在数据库中创建一个名为employees的表以便测试该示例。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql-variables.htm

* any list
{:toc}