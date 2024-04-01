---
layout: post
title: mysql Tutorial-02-var 变量
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# MySQL - Variables

通常情况下，变量是程序中存储一些信息的容器。变量的值可以根据需要更改多次。

每个变量都有一个数据类型，指定我们可以在其中存储的数据类型，例如整数、字符串、浮点数等。

在某些编程语言中，如Java、C、C++等，我们需要在给变量赋值之前声明变量的数据类型。

在像Python这样的语言中，变量的数据类型基于分配给它的值假定。无需单独声明数据类型。

在MySQL中，无需声明数据类型，我们可以使用SET语句简单地定义具有值的变量。

## MySQL中的变量

变量的主要目的是标记一个内存位置或多个内存位置，并在其中存储数据，以便在整个程序中使用。

用于声明和定义变量的字符称为文字(literals)，文字可以是除了特殊字符、数字和保留关键字之外的任何内容。

在MySQL中，有三种类型的变量。具体如下所述：

用户自定义变量

局部变量

系统变量

# 用户自定义变量

用户自定义变量允许我们在一个语句中存储一个值，然后在另一个语句中引用它。

为此，MySQL提供了SET和SELECT命令来声明一个变量。这些变量名的前缀将使用符号"@"。

根据情况，我们可以使用等号 `=` 或 `:=` 符号。

用户定义的数据类型可以是以下任何一种：整数、小数、布尔值等。

语法

以下是使用SET语句在MySQL中声明用户定义变量的语法 -

```sql
SELECT @variable_name = value
```

### 例子 1

在以下查询中，我们使用SET语句将一个值赋给一个变量，如下所示 -

使用SELECT语句，我们可以显示@name变量的值 -

```sql
mysql> SET @Name = 'Michael';
Query OK, 0 rows affected (0.01 sec)

mysql> select @Name;
+---------+
| @Name   |
+---------+
| Michael |
+---------+
1 row in set (0.02 sec)
```

### 例子 2

在这里，我们使用SELECT语句为一个变量赋值 -

```sql
mysql> SELECT @test := 10;
+-------------+
| @test := 10 |
+-------------+
|          10 |
+-------------+
1 row in set, 1 warning (0.00 sec)

mysql> @test;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '@test' at line 1
mysql> select @test;
+-------+
| @test |
+-------+
|    10 |
+-------+
1 row in set (0.01 sec)
```

# 局部变量 Local Variables

## 说明

在MySQL中，局部变量是在存储过程、函数或者触发器中定义的变量，其作用范围仅限于定义它的那个代码块内部。

局部变量在MySQL中的使用可以提供一种临时存储数据的方法，在处理复杂逻辑或者需要多次引用某个值的情况下尤为有用。

以下是关于MySQL局部变量的一些重要特点和用法：

1. **声明**：在存储过程、函数或者触发器中，可以使用`DECLARE`关键字声明局部变量。例如：

```sql
DECLARE variable_name datatype [DEFAULT value];
```

这里`variable_name`是变量名，`datatype`是数据类型，`value`是可选的初始值。

2. **赋值**：可以使用`SET`语句为局部变量赋值。例如：

```sql
SET variable_name = value;
```

3. **使用**：可以在定义的代码块内部使用局部变量。例如：

```sql
DECLARE total INT DEFAULT 0;
SET total = total + 1;
```

4. **作用范围**：局部变量的作用范围仅限于定义它的存储过程、函数或者触发器内部。在外部无法访问这些局部变量。

5. **生命周期**：局部变量的生命周期从其定义处开始到存储过程、函数或者触发器执行完毕为止。

6. **数据类型**：局部变量可以是任何MySQL支持的数据类型，包括整数、浮点数、字符串、日期等。

7. **默认值**：可以为局部变量指定默认值，当没有显式赋值时，局部变量将采用默认值。

8. **注意事项**：
   - 局部变量名不能与存储过程、函数或者触发器的参数名或者表的字段名相同，以免造成冲突。
   - 局部变量只能在存储过程、函数或者触发器内部使用，无法在SQL语句中直接使用。

使用局部变量可以使得存储过程、函数或者触发器更具灵活性和可维护性，能够更方便地处理复杂逻辑和数据操作。

### 例子

计算两个数的和：

执行前，首先要选择一个数据库：

```sql
use test;
```

```sql
DELIMITER //

CREATE PROCEDURE calculateSum(IN a INT, IN b INT)
BEGIN
    DECLARE result INT;

    -- 计算和
    SET result = a + b;

    -- 显示结果
    SELECT result AS 'Sum';
END//

DELIMITER ;
```

调用这个存储过程：

```sql
mysql> call calculateSum(10, 20);
+------+
| Sum  |
+------+
|   30 |
+------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```


# 介绍一下 mysql 的系统变量

MySQL系统变量是MySQL服务器提供的一组全局变量，用于控制服务器的行为和配置参数。

这些变量可以在服务器启动时设置，并且可以在运行时动态修改，以调整服务器的性能、行为和功能。

系统变量可以通过`SET`语句进行动态设置，也可以通过配置文件（如`my.cnf`或`my.ini`）进行永久设置。

以下是一些常见的MySQL系统变量以及它们的作用：

1. **max_connections**：控制MySQL服务器允许的最大并发连接数。

2. **innodb_buffer_pool_size**：InnoDB存储引擎使用的内存池大小，用于缓存数据和索引。

3. **innodb_log_file_size**：InnoDB存储引擎的日志文件大小，影响事务日志的写入性能。

4. **query_cache_size**：查询缓存的大小，用于缓存查询结果，提高查询性能。

5. **tmp_table_size**：临时表的最大内存使用量。

6. **key_buffer_size**：MyISAM存储引擎使用的键缓存大小。

7. **sort_buffer_size**：排序操作使用的缓冲区大小。

8. **join_buffer_size**：连接操作使用的缓冲区大小。

9. **sql_mode**：MySQL的SQL模式，用于控制SQL语句的语法和行为。

10. **character_set_server** 和 **collation_server**：指定服务器的默认字符集和排序规则。

11. **innodb_file_per_table**：控制InnoDB存储引擎是否将每个表存储在单独的文件中。

12. **max_allowed_packet**：单个数据库包或查询的最大大小。

13. **innodb_flush_log_at_trx_commit**：控制InnoDB事务日志的刷新策略。

14. **innodb_thread_concurrency**：InnoDB存储引擎的线程并发度。

15. **innodb_flush_method**：InnoDB存储引擎的日志刷新方法。

这些系统变量的设置可以显著影响MySQL服务器的性能、稳定性和功能。

因此，在调优和配置MySQL服务器时，需要仔细考虑这些变量的设置，并根据具体的应用场景和需求进行调整。

## 测试

```sql
mysql> select @@max_connections;
+-------------------+
| @@max_connections |
+-------------------+
|               200 |
+-------------------+
1 row in set (0.00 sec)
```

## 小问题 

如果 mysql 的 max_connections=200，连接数超过这个数会怎么样？


在MySQL中，如果连接数超过了`max_connections`参数设置的限制，会出现以下情况：

1. **新连接被拒绝**：当连接数达到`max_connections`时，MySQL将不再接受新的连接请求，并返回错误消息给客户端，通知连接被拒绝。这意味着新的应用程序或用户无法连接到MySQL服务器。

2. **现有连接继续运行**：已经建立的连接将继续正常运行，不会受到影响。MySQL不会中断已经建立的连接，直到它们结束或被终止。

3. **错误消息**：当有新的连接尝试连接到MySQL服务器时，如果连接数已达到`max_connections`限制，MySQL会返回一个错误消息，通常为“Too many connections”。

4. **修改参数**：如果需要增加最大连接数，可以通过修改`max_connections`参数来实现。但需要注意的是，增加最大连接数可能会增加服务器的负载和资源消耗，因此需要谨慎考虑。增加连接数可能需要重新启动MySQL服务才能生效。

总之，超过`max_connections`限制的连接将被拒绝，直到有连接释放或者增加了最大连接数为止。

因此，在设计应用程序时，应该根据预期的并发连接数来合理设置`max_connections`参数，以避免因连接数限制而导致的服务不可用问题。


# 参考资料

https://www.tutorialspoint.com/mysql/mysql-variables.htm

* any list
{:toc}