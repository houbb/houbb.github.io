---
layout: post
title: 数据库基础知识 mysql keyword 关键词汇总
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

自己通过 jdbc 实现了一个 数据库查询工具，不过后来想拓展查询功能时，总觉得不够尽兴。

所以在想能不能把 SQL 的构建单独抽离出来。

这里整理学习下其他的组件。

# 需求

梳理常见的关键词。

# MySQL 关键字以及保留字
 
关键字是在SQL中具有重要意义的单词。

某些关键字，如

[`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html)

[`DELETE`](https://dev.mysql.com/doc/refman/8.0/en/delete.html)

[`BIGINT`](https://dev.mysql.com/doc/refman/8.0/en/integer-types.html)

被保留，需要用作标识符，例如表和列名特殊待遇。内置函数的名称也可能如此。

允许使用非保留关键字作为标识符而无需引用。
 
## A
 
- `ACCESSIBLE` (R)
- `ACCOUNT`
- `ACTION`
- `ACTIVE`; added in 8.0.14 (nonreserved)
- `ADD` (R)
- `ADMIN`; became nonreserved in 8.0.12
- `AFTER`
- `AGAINST`
- `AGGREGATE`
- `ALGORITHM`
- `ALL` (R)
- `ALTER` (R)
- `ALWAYS`
- `ANALYSE`; removed in 8.0.1
- `ANALYZE` (R)
- `AND` (R)
- `ANY`
- `ARRAY`; added in 8.0.17 (reserved); became nonreserved in 8.0.19
- `AS` (R)
- `ASC` (R)
- `ASCII`
- `ASENSITIVE` (R)
- `AT`
- `ATTRIBUTE`; added in 8.0.21 (nonreserved)
- `AUTOEXTEND_SIZE`
- `AUTO_INCREMENT`
- `AVG`
- `AVG_ROW_LENGTH`

### 解释

1. `ACCESSIBLE` (R) - 确定一个用户是否有权限访问表中的某些列。
   
   示例：
   ```sql
   SELECT * FROM my_table WHERE col1 = 'value' AND ACCESSIBLE BY 'user'@'host';
   ```

2. `ACCOUNT` - 用户的登录信息和权限。
   
   示例：
   ```sql
   CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
   ```

3. `ACTION` - 触发器或约束中定义的操作。
   
   示例：
   ```sql
   CREATE TRIGGER my_trigger AFTER INSERT ON my_table FOR EACH ROW BEGIN ... END;
   ```

4. `ACTIVE` - 标识活跃状态，通常用于描述连接或会话。
   
   示例：
   ```sql
   SHOW PROCESSLIST;
   ```

5. `ADD` (R) - 向表中添加新列或索引。
   
   示例：
   ```sql
   ALTER TABLE my_table ADD COLUMN new_column INT;
   ```

6. `ADMIN` - 管理员用户的特殊权限。
   
   示例：
   ```sql
   GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost';
   ```

7. `AFTER` - 指定在表中的某个列之后添加新列。
   
   示例：
   ```sql
   ALTER TABLE my_table ADD COLUMN new_column INT AFTER existing_column;
   ```

8. `AGAINST` - 在全文搜索中使用。
   
   示例：
   ```sql
   SELECT * FROM articles WHERE MATCH (title, content) AGAINST ('MySQL');
   ```

9. `AGGREGATE` - 指与 GROUP BY 一起使用的聚合函数。
   
   示例：
   ```sql
   SELECT AVG(column_name) FROM my_table GROUP BY group_column;
   ```

10. `ALGORITHM` - 指定 MySQL 使用的算法来处理特定操作。
    
    示例：
    ```sql
    ALTER TABLE my_table ALGORITHM=INPLACE;
    ```

11. `ALL` (R) - 用于子查询中返回所有行。
    
    示例：
    ```sql
    SELECT * FROM my_table WHERE column_name > ALL (SELECT other_column FROM other_table);
    ```

12. `ALTER` (R) - 修改表的结构。
    
    示例：
    ```sql
    ALTER TABLE my_table MODIFY COLUMN column_name VARCHAR(100);
    ```

13. `ALWAYS` - 始终执行特定操作或触发器。
    
    示例：
    ```sql
    CREATE TRIGGER my_trigger BEFORE INSERT ON my_table FOR EACH ROW SET NEW.column_name = 'value';
    ```

14. `ANALYZE` (R) - 分析表以获取统计信息以优化查询。
    
    示例：
    ```sql
    ANALYZE TABLE my_table;
    ```

15. `AND` (R) - 逻辑 AND 操作符，用于连接两个条件。
    
    示例：
    ```sql
    SELECT * FROM my_table WHERE column1 = 'value' AND column2 = 'value';
    ```

16. `ANY` - 与子查询中的某些条件匹配。
    
    示例：
    ```sql
    SELECT * FROM my_table WHERE column_name = ANY (SELECT other_column FROM other_table);
    ```

17. `ARRAY` - 存储数组类型的数据。
    
    示例：
    ```sql
    CREATE TABLE my_table (id INT, numbers JSON);
    ```

18. `AS` (R) - 为列或表指定别名。
    
    示例：
    ```sql
    SELECT column_name AS alias_name FROM my_table;
    ```

19. `ASC` (R) - 指定升序排序。
    
    示例：
    ```sql
    SELECT * FROM my_table ORDER BY column_name ASC;
    ```

20. `ASCII` - 返回字符的 ASCII 值。
    
    示例：
    ```sql
    SELECT ASCII('A');
    ```

21. `ASENSITIVE` (R) - 指定对大小写敏感的搜索。
    
    示例：
    ```sql
    SELECT * FROM my_table WHERE column_name COLLATE utf8_general_ci ASENSITIVE;
    ```

22. `AT` - 指定触发器的执行时间。
    
    示例：
    ```sql
    CREATE TRIGGER my_trigger BEFORE INSERT ON my_table FOR EACH ROW AT TIME ZONE 'UTC';
    ```

23. `ATTRIBUTE` - 表示列的特性。
    
    示例：
    ```sql
    ALTER TABLE my_table MODIFY COLUMN column_name INT ATTRIBUTE 'UNSIGNED';
    ```

24. `AUTOEXTEND_SIZE` - 指定自动扩展文件大小的大小。
    
    示例：
    ```sql
    ALTER TABLESPACE my_tablespace AUTOEXTEND_SIZE = 1G;
    ```

25. `AUTO_INCREMENT` - 自动递增列的属性。
    
    示例：
    ```sql
    CREATE TABLE my_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));
    ```

26. `AVG` - 返回列的平均值。
    
    示例：
    ```sql
    SELECT AVG(column_name) FROM my_table;
    ```

27. `AVG_ROW_LENGTH` - 返回表的平均行长度。
    
    示例：
    ```sql
    SHOW TABLE STATUS LIKE 'my_table';
    ```

## B
 
- `BACKUP`
- `BEFORE` (R)
- `BEGIN`
- `BETWEEN` (R)
- `BIGINT` (R)
- `BINARY` (R)
- `BINLOG`
- `BIT`
- `BLOB` (R)
- `BLOCK`
- `BOOL`
- `BOOLEAN`
- `BOTH` (R)
- `BTREE`
- `BUCKETS`; added in 8.0.2 (nonreserved)
- `BY` (R)
- `BYTE`

### 解释
 

1. `BACKUP` - 备份数据库或表的操作或策略。

   示例：
   ```sql
   BACKUP DATABASE my_database TO '/backup/path';
   ```

2. `BEFORE` (R) - 触发器中触发事件之前的时间点。

   示例：
   ```sql
   CREATE TRIGGER my_trigger BEFORE INSERT ON my_table FOR EACH ROW BEGIN ... END;
   ```

3. `BEGIN` - 标识事务的开始。

   示例：
   ```sql
   BEGIN;
   -- SQL statements
   COMMIT;
   ```

4. `BETWEEN` (R) - 用于确定值是否在指定范围内。

   示例：
   ```sql
   SELECT * FROM my_table WHERE column_name BETWEEN 10 AND 100;
   ```

5. `BIGINT` (R) - 用于存储大整数值的数据类型。

   示例：
   ```sql
   CREATE TABLE my_table (id BIGINT PRIMARY KEY, name VARCHAR(100));
   ```

6. `BINARY` (R) - 用于表示二进制数据的数据类型。

   示例：
   ```sql
   CREATE TABLE my_table (id INT, binary_data BINARY(100));
   ```

7. `BINLOG` - MySQL 中二进制日志文件的名称或相关操作。

   示例：
   ```sql
   SHOW BINLOG EVENTS;
   ```

8. `BIT` - 用于存储位字段值的数据类型。

   示例：
   ```sql
   CREATE TABLE my_table (flags BIT(8));
   ```

9. `BLOB` (R) - 用于存储大型二进制对象的数据类型。

   示例：
   ```sql
   CREATE TABLE my_table (id INT, blob_data BLOB);
   ```

10. `BLOCK` - 在 MySQL 中用于数据存储的单元。

    示例：
    ```sql
    ALTER TABLE my_table BLOCK_SIZE = 8192;
    ```

11. `BOOL` - 布尔值数据类型的别名。

    示例：
    ```sql
    CREATE TABLE my_table (is_active BOOL);
    ```

12. `BOOLEAN` - 布尔值数据类型的别名。

    示例：
    ```sql
    CREATE TABLE my_table (is_active BOOLEAN);
    ```

13. `BOTH` (R) - 用于指定两个条件都为真。

    示例：
    ```sql
    SELECT * FROM my_table WHERE condition1 AND condition2;
    ```

14. `BTREE` - 在 MySQL 中指定索引类型。

    示例：
    ```sql
    CREATE INDEX idx_name ON my_table (column_name) USING BTREE;
    ```

15. `BUCKETS` - MySQL 中存储引擎 InnoDB 的一种特性。

    示例：
    ```sql
    ALTER TABLE my_table SET BUCKETS = 10;
    ```

16. `BY` (R) - 用于指定排序顺序或分组条件。

    示例：
    ```sql
    SELECT * FROM my_table ORDER BY column_name ASC;
    ```

17. `BYTE` - 字节数据类型的别名。

    示例：
    ```sql
    CREATE TABLE my_table (data BYTE);
    ```

## C
 
- `CACHE`
- `CALL` (R)
- `CASCADE` (R)
- `CASCADED`
- `CASE` (R)
- `CATALOG_NAME`
- `CHAIN`
- `CHANGE` (R)
- `CHANGED`
- `CHANNEL`
- `CHAR` (R)
- `CHARACTER` (R)
- `CHARSET`
- `CHECK` (R)
- `CHECKSUM`
- `CIPHER`
- `CLASS_ORIGIN`
- `CLIENT`
- `CLONE`; added in 8.0.3 (nonreserved)
- `CLOSE`
- `COALESCE`
- `CODE`
- `COLLATE` (R)
- `COLLATION`
- `COLUMN` (R)
- `COLUMNS`
- `COLUMN_FORMAT`
- `COLUMN_NAME`
- `COMMENT`
- `COMMIT`
- `COMMITTED`
- `COMPACT`
- `COMPLETION`
- `COMPONENT`
- `COMPRESSED`
- `COMPRESSION`
- `CONCURRENT`
- `CONDITION` (R)
- `CONNECTION`
- `CONSISTENT`
- `CONSTRAINT` (R)
- `CONSTRAINT_CATALOG`
- `CONSTRAINT_NAME`
- `CONSTRAINT_SCHEMA`
- `CONTAINS`
- `CONTEXT`
- `CONTINUE` (R)
- `CONVERT` (R)
- `CPU`
- `CREATE` (R)
- `CROSS` (R)
- `CUBE` (R); became reserved in 8.0.1
- `CUME_DIST` (R); added in 8.0.2 (reserved)
- `CURRENT`
- `CURRENT_DATE` (R)
- `CURRENT_TIME` (R)
- `CURRENT_TIMESTAMP` (R)
- `CURRENT_USER` (R)
- `CURSOR` (R)
- `CURSOR_NAME`
 
### 给出解释和示例

1. `CACHE` - 用于存储数据的缓存区域。

   示例：  
   ```sql
   CACHE INDEX my_index INNODB;
   ```

2. `CALL` (R) - 调用存储过程或函数。

   示例：  
   ```sql
   CALL my_stored_procedure();
   ```

3. `CASCADE` (R) - 在删除或更新父表中的行时，同时删除或更新子表中的相关行。

   示例：  
   ```sql
   ALTER TABLE parent_table DROP COLUMN parent_id CASCADE;
   ```

4. `CASCADED` - 指定级联操作。

   示例：  
   ```sql
   ALTER TABLE parent_table DROP COLUMN parent_id CASCADE;
   ```

5. `CASE` (R) - 条件语句中的关键词。

   示例：  
   ```sql
   SELECT CASE WHEN column_name = 'value' THEN 'Result A' ELSE 'Result B' END AS result FROM my_table;
   ```

6. `CATALOG_NAME` - 数据库的目录名称。

   示例：  
   ```sql
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'my_database' AND TABLE_CATALOG = 'my_catalog';
   ```

7. `CHAIN` - 指定多个存储过程或函数之间的链接。

   示例：  
   ```sql
   CREATE PROCEDURE proc1() SQL SECURITY INVOKER COMMENT 'Procedure 1' CHAIN proc2();
   ```

8. `CHANGE` (R) - 修改表中的列或索引。

   示例：  
   ```sql
   ALTER TABLE my_table CHANGE COLUMN old_column new_column VARCHAR(100);
   ```

9. `CHANGED` - 指示最后一次修改的时间。

   示例：  
   ```sql
   SELECT * FROM my_table WHERE CHANGED = '2024-03-25';
   ```

10. `CHANNEL` - 指定复制通道。

    示例：  
    ```sql
    CHANGE MASTER TO MASTER_HOST='host_name', MASTER_CHANNEL='channel_name';
    ```

11. `CHAR` (R) - 字符数据类型。

    示例：  
    ```sql
    CREATE TABLE my_table (char_column CHAR(10));
    ```

12. `CHARACTER` (R) - 字符集相关。

    示例：  
    ```sql
    ALTER DATABASE my_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

13. `CHARSET` - 指定字符集。

    示例：  
    ```sql
    SET NAMES 'utf8mb4';
    ```

14. `CHECK` (R) - 约束中的检查条件。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT CHECK (column_name > 0));
    ```

15. `CHECKSUM` - 表的校验和。

    示例：  
    ```sql
    CHECKSUM TABLE my_table;
    ```

16. `CIPHER` - 加密算法的名称。

    示例：  
    ```sql
    CREATE USER 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password' REQUIRE CIPHER 'AES128';
    ```

17. `CLASS_ORIGIN` - 错误消息的类别。

    示例：  
    ```sql
    SELECT CLASS_ORIGIN FROM INFORMATION_SCHEMA.SYSTEM_ERRORS WHERE ERROR_CODE = 1064;
    ```

18. `CLIENT` - MySQL 客户端相关的属性。

    示例：  
    ```sql
    SHOW VARIABLES LIKE 'client_%';
    ```

19. `CLONE` - 克隆表或数据。

    示例：  
    ```sql
    CLONE TABLE my_table TO my_new_table;
    ```

20. `CLOSE` - 关闭游标。

    示例：  
    ```sql
    CLOSE cursor_name;
    ```

21. `COALESCE` - 返回参数列表中的第一个非空值。

    示例：  
    ```sql
    SELECT COALESCE(column_name, 'default_value') FROM my_table;
    ```

22. `CODE` - 错误代码。

    示例：  
    ```sql
    SELECT CODE FROM INFORMATION_SCHEMA.SYSTEM_ERRORS WHERE ERROR_CODE = 1064;
    ```

23. `COLLATE` (R) - 指定字符集和校对规则。

    示例：  
    ```sql
    SELECT * FROM my_table ORDER BY column_name COLLATE utf8mb4_general_ci;
    ```

24. `COLLATION` - 数据库或表的排序规则。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name VARCHAR(100) COLLATE utf8mb4_general_ci);
    ```

25. `COLUMN` (R) - 列相关的操作。

    示例：  
    ```sql
    ALTER TABLE my_table ADD COLUMN new_column INT;
    ```

26. `COLUMNS` - 表中的列信息。

    示例：  
    ```sql
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'my_table';
    ```

27. `COLUMN_FORMAT` - 列的存储格式。

    示例：  
    ```sql
    ALTER TABLE my_table MODIFY COLUMN column_name VARCHAR(100) COLUMN_FORMAT FIXED;
    ```

28. `COLUMN_NAME` - 列的名称。

    示例：  
    ```sql
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'my_table';
    ```

29. `COMMENT` - 对数据库对象添加注释。

    示例：  
    ```sql
    COMMENT ON TABLE my_table IS 'This is a table comment';
    ```

30. `COMMIT` - 提交事务。

    示例：  
    ```sql
    COMMIT;
    ```

31. `COMMITTED` - 指示是否提交了事务。

    示例：  
    ```sql
    SELECT * FROM my_table WHERE COMMITTED = 1;
    ```

32. `COMPACT` - 压缩表或索引。

    示例：  
    ```sql
    ALTER TABLE my_table COMPACT;
    ```

33. `COMPLETION` - 事务提交时的处理方式。

    示例：  
    ```sql
    SET autocommit = 1;
    ```

34. `COMPONENT` - MySQL 组件。

    示例：  
    ```sql
    INSTALL COMPONENT "file://component_name";
    ```

35. `COMPRESSED` - 表的压缩属性。

    示例：  
    ```sql
    ALTER TABLE my_table ROW_FORMAT=COMPRESSED;
    ```

36. `COMPRESSION` - 表的压缩算法。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT) COMPRESSION='zlib';
    ```

37. . `CONCURRENT` - 并发操作相关。

   示例：  
   ```sql
   ALTER TABLE my_table ADD COLUMN new_column INT, ALGORITHM=INPLACE, LOCK=NONE;
   ```

38. `CONDITION` (R) - 条件语句中的条件。

   示例：  
   ```sql
   IF condition THEN statements;
   ```

39. `CONNECTION` - 客户端连接。

   示例：  
   ```sql
   SHOW STATUS LIKE 'Threads_connected';
   ```

40. `CONSISTENT` - 一致性快照读取。

   示例：  
   ```sql
   SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
   ```

41. `CONSTRAINT` (R) - 约束条件。

   示例：  
   ```sql
   ALTER TABLE my_table ADD CONSTRAINT constraint_name UNIQUE (column_name);
   ```

42. `CONSTRAINT_CATALOG` - 约束的目录名称。

   示例：  
   ```sql
   SELECT CONSTRAINT_CATALOG FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'my_table';
   ```

43. `CONSTRAINT_NAME` - 约束的名称。

   示例：  
   ```sql
   SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'my_table';
   ```

44. `CONSTRAINT_SCHEMA` - 约束所在的数据库名称。

   示例：  
   ```sql
   SELECT CONSTRAINT_SCHEMA FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'my_table';
   ```

45. `CONTAINS` - 判断是否包含指定字符串。

   示例：  
   ```sql
   SELECT * FROM my_table WHERE column_name CONTAINS 'substring';
   ```

46. `CONTEXT` - 事务上下文。

   示例：  
   ```sql
   SELECT @@GLOBAL.autocommit;
   ```

47. `CONTINUE` (R) - 继续循环中的下一次迭代。

   示例：  
   ```sql
   WHILE condition DO ... END WHILE;
   ```

48. `CONVERT` (R) - 数据类型转换。

   示例：  
   ```sql
   SELECT CONVERT('2024-03-25', DATE);
   ```

49. `CPU` - CPU 相关的状态信息。

   示例：  
   ```sql
   SHOW STATUS LIKE 'cpu%';
   ```

50. `CREATE` (R) - 创建数据库对象。

   示例：  
   ```sql
   CREATE TABLE my_table (id INT, name VARCHAR(100));
   ```

51. `CROSS` (R) - 交叉连接。

   示例：  
   ```sql
   SELECT * FROM table1 CROSS JOIN table2;
   ```

52. `CUBE` (R) - 多维数据分析中的 CUBE 操作。

   示例：  
   ```sql
   SELECT * FROM my_cube GROUP BY CUBE(column1, column2);
   ```

53. `CUME_DIST` (R) - 窗口函数，返回当前行的累积分布值。

   示例：  
   ```sql
   SELECT column_name, CUME_DIST() OVER (ORDER BY column_name) AS cume_dist FROM my_table;
   ```

54. `CURRENT` - 返回当前时间戳或用户。

   示例：  
   ```sql
   SELECT CURRENT_TIMESTAMP, CURRENT_USER;
   ```

55. `CURRENT_DATE` (R) - 返回当前日期。

   示例：  
   ```sql
   SELECT CURRENT_DATE;
   ```

56. `CURRENT_TIME` (R) - 返回当前时间。

   示例：  
   ```sql
   SELECT CURRENT_TIME;
   ```

57. `CURRENT_TIMESTAMP` (R) - 返回当前时间戳。

   示例：  
   ```sql
   SELECT CURRENT_TIMESTAMP;
   ```

58. `CURRENT_USER` (R) - 返回当前用户。

   示例：  
   ```sql
   SELECT CURRENT_USER;
   ```

59. `CURSOR` (R) - 游标。

   示例：  
   ```sql
   DECLARE cursor_name CURSOR FOR SELECT * FROM my_table;
   ```

60. `CURSOR_NAME` - 游标的名称。

   示例：  
   ```sql
   DECLARE cursor_name CURSOR FOR SELECT * FROM my_table;
   ```

## D
 
- `DATA`
- `DATABASE` (R)
- `DATABASES` (R)
- `DATAFILE`
- `DATE`
- `DATETIME`
- `DAY`
- `DAY_HOUR` (R)
- `DAY_MICROSECOND` (R)
- `DAY_MINUTE` (R)
- `DAY_SECOND` (R)
- `DEALLOCATE`
- `DEC` (R)
- `DECIMAL` (R)
- `DECLARE` (R)
- `DEFAULT` (R)
- `DEFAULT_AUTH`
- `DEFINER`
- `DEFINITION`; added in 8.0.4 (nonreserved)
- `DELAYED` (R)
- `DELAY_KEY_WRITE`
- `DELETE` (R)
- `DENSE_RANK` (R); added in 8.0.2 (reserved)
- `DESC` (R)
- `DESCRIBE` (R)
- `DESCRIPTION`; added in 8.0.4 (nonreserved)
- `DES_KEY_FILE`; removed in 8.0.3
- `DETERMINISTIC` (R)
- `DIAGNOSTICS`
- `DIRECTORY`
- `DISABLE`
- `DISCARD`
- `DISK`
- `DISTINCT` (R)
- `DISTINCTROW` (R)
- `DIV` (R)
- `DO`
- `DOUBLE` (R)
- `DROP` (R)
- `DUAL` (R)
- `DUMPFILE`
- `DUPLICATE`
- `DYNAMIC`

## 给出解释和示例

1. `DATA` - 数据相关操作或内容。

   示例：  
   ```sql
   LOAD DATA INFILE 'data.txt' INTO TABLE my_table;
   ```

2. `DATABASE` (R) - 数据库的名称。

   示例：  
   ```sql
   CREATE DATABASE my_database;
   ```

3. `DATABASES` (R) - 所有数据库的列表。

   示例：  
   ```sql
   SHOW DATABASES;
   ```

4. `DATAFILE` - 数据文件。

   示例：  
   ```sql
   ALTER TABLESPACE my_tablespace ADD DATAFILE 'datafile_name';
   ```

5. `DATE` - 日期数据类型。

   示例：  
   ```sql
   SELECT DATE('2024-03-25');
   ```

6. `DATETIME` - 日期时间数据类型。

   示例：  
   ```sql
   SELECT DATETIME('2024-03-25 12:00:00');
   ```

7. `DAY` - 一天的时间单位。

   示例：  
   ```sql
   SELECT DAY(date_column) FROM my_table;
   ```

8. `DAY_HOUR` (R) - 天和小时的时间单位。

   示例：  
   ```sql
   SELECT DAY_HOUR(datetime_column) FROM my_table;
   ```

9. `DAY_MICROSECOND` (R) - 天和微秒的时间单位。

   示例：  
   ```sql
   SELECT DAY_MICROSECOND(datetime_column) FROM my_table;
   ```

10. `DAY_MINUTE` (R) - 天和分钟的时间单位。

    示例：  
    ```sql
    SELECT DAY_MINUTE(datetime_column) FROM my_table;
    ```

11. `DAY_SECOND` (R) - 天和秒的时间单位。

    示例：  
    ```sql
    SELECT DAY_SECOND(datetime_column) FROM my_table;
    ```

12. `DEALLOCATE` - 释放预备语句或游标。

    示例：  
    ```sql
    DEALLOCATE PREPARE my_prepared_statement;
    ```

13. `DEC` (R) - 等同于 `DECIMAL`。

    示例：  
    ```sql
    CREATE TABLE my_table (dec_column DEC(10,2));
    ```

14. `DECIMAL` (R) - 十进制数据类型。

    示例：  
    ```sql
    CREATE TABLE my_table (decimal_column DECIMAL(10,2));
    ```

15. `DECLARE` (R) - 声明变量或游标。

    示例：  
    ```sql
    DECLARE variable_name INT DEFAULT 0;
    ```

16. `DEFAULT` (R) - 默认值。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT DEFAULT 0);
    ```

17. `DEFAULT_AUTH` - 指定默认身份验证插件。

    示例：  
    ```sql
    SET DEFAULT_AUTHENTICATION_PLUGIN = 'mysql_native_password';
    ```

18. `DEFINER` - 指定存储过程或函数的定义者。

    示例：  
    ```sql
    CREATE PROCEDURE my_procedure DEFINER='user'@'host' ...
    ```

19. `DEFINITION` - 定义对象的说明。

    示例：  
    ```sql
    COMMENT ON TABLE my_table IS 'This is a table definition';
    ```

20. `DELAYED` (R) - 延迟插入行。

    示例：  
    ```sql
    INSERT DELAYED INTO my_table VALUES (...);
    ```

21. `DELAY_KEY_WRITE` - 延迟更新索引。

    示例：  
    ```sql
    ALTER TABLE my_table DELAY_KEY_WRITE = TRUE;
    ```

22. `DELETE` (R) - 删除表中的行。

    示例：  
    ```sql
    DELETE FROM my_table WHERE condition;
    ```

23. `DENSE_RANK` (R) - 稠密排名窗口函数。

    示例：  
    ```sql
    SELECT column_name, DENSE_RANK() OVER (ORDER BY column_name) AS dense_rank FROM my_table;
    ```

24. `DESC` (R) - 降序排列。

    示例：  
    ```sql
    SELECT * FROM my_table ORDER BY column_name DESC;
    ```

25. `DESCRIBE` (R) - 显示表结构。

    示例：  
    ```sql
    DESCRIBE my_table;
    ```

26. `DESCRIPTION` - 对象的描述。

    示例：  
    ```sql
    COMMENT ON my_table IS 'This is a table description';
    ```

27. `DIAGNOSTICS` - 获取存储过程或函数的诊断信息。

    示例：  
    ```sql
    GET DIAGNOSTICS variable_name = condition_value;
    ```

28. `DIRECTORY` - 指定目录路径。

    示例：  
    ```sql
    CREATE TABLESPACE my_tablespace ADD DATAFILE DIRECTORY '/path/to/directory';
    ```

29. `DISABLE` - 禁用触发器。

    示例：  
    ```sql
    ALTER TABLE my_table DISABLE TRIGGER trigger_name;
    ```

30. `DISCARD` - 丢弃查询结果。

    示例：  
    ```sql
    DISCARD QUERY CACHE;
    ```

31. `DISK` - 存储介质类型。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT) ENGINE=InnoDB DATA DIRECTORY='/path/to/data';
    ```

32. `DISTINCT` (R) - 去重。

    示例：  
    ```sql
    SELECT DISTINCT column_name FROM my_table;
    ```

33. `DISTINCTROW` (R) - 从结果集中去除重复行。

   示例：  
   ```sql
   SELECT DISTINCTROW column1, column2 FROM my_table;
   ```

34. `DIV` (R) - 整数除法。

   示例：  
   ```sql
   SELECT 10 DIV 3;
   ```

35. `DO` - 执行一个或多个语句。

   示例：  
   ```sql
   DO $$ BEGIN DECLARE i INT DEFAULT 0; WHILE i < 10 DO INSERT INTO my_table VALUES (i); SET i = i + 1; END WHILE; END $$;
   ```

36. `DOUBLE` (R) - 双精度浮点数数据类型。

   示例：  
   ```sql
   CREATE TABLE my_table (double_column DOUBLE);
   ```

37. `DROP` (R) - 删除数据库对象。

   示例：  
   ```sql
   DROP TABLE my_table;
   ```

38. `DUAL` (R) - MySQL 中的伪表，始终只有一行一列。

   示例：  
   ```sql
   SELECT * FROM DUAL;
   ```

39. `DUMPFILE` - 导出数据的文件路径。

   示例：  
   ```sql
   SELECT * INTO OUTFILE 'dumpfile.txt' FROM my_table;
   ```

40. `DUPLICATE` - 复制数据时的处理方式。

   示例：  
   ```sql
   INSERT INTO my_table (column1, column2) VALUES (value1, value2) ON DUPLICATE KEY UPDATE column2 = value2;
   ```

41. `DYNAMIC` - 动态分区类型。

   示例：  
   ```sql
   CREATE TABLE my_table (column_name INT) PARTITION BY RANGE(column_name) (PARTITION p1 VALUES LESS THAN (10));
   ```
 
## E
 
- `EACH` (R)
- `ELSE` (R)
- `ELSEIF` (R)
- `EMPTY` (R); added in 8.0.4 (reserved)
- `ENABLE`
- `ENCLOSED` (R)
- `ENCRYPTION`
- `END`
- `ENDS`
- `ENFORCED`; added in 8.0.16 (nonreserved)
- `ENGINE`
- `ENGINES`
- `ENGINE_ATTRIBUTE`; added in 8.0.21 (nonreserved)
- `ENUM`
- `ERROR`
- `ERRORS`
- `ESCAPE`
- `ESCAPED` (R)
- `EVENT`
- `EVENTS`
- `EVERY`
- `EXCEPT` (R)
- `EXCHANGE`
- `EXCLUDE`; added in 8.0.2 (nonreserved)
- `EXECUTE`
- `EXISTS` (R)
- `EXIT` (R)
- `EXPANSION`
- `EXPIRE`
- `EXPLAIN` (R)
- `EXPORT`
- `EXTENDED`
- `EXTENT_SIZE`

### 给出解释和示例 

1. `EACH` (R) - 用于规定在触发器中触发事件的次数。已保留。

   示例：  
   ```sql
   CREATE TRIGGER my_trigger BEFORE INSERT ON my_table
   FOR EACH ROW INSERT INTO log_table VALUES (NEW.id, 'Inserted');
   ```

2. `ELSE` (R) - 在条件语句中，指定如果条件不成立时要执行的语句。已保留。

   示例：  
   ```sql
   IF condition THEN
       statement1;
   ELSE
       statement2;
   END IF;
   ```

3. `ELSEIF` (R) - 在条件语句中，指定其他条件并在前面的条件不成立时执行。已保留。

   示例：  
   ```sql
   IF condition1 THEN
       statement1;
   ELSEIF condition2 THEN
       statement2;
   END IF;
   ```

4. `EMPTY` (R) - 用于表示空值或空集合。在 MySQL 8.0.4 中添加并保留。

   示例：  
   ```sql
   SELECT * FROM my_table WHERE column_name IS EMPTY;
   ```

5. `ENABLE` - 启用某些功能或选项。

   示例：  
   ```sql
   ALTER TABLE my_table ENABLE KEYS;
   ```

6. `ENCLOSED` (R) - 用于指定字段值的定界符。已保留。

   示例：  
   ```sql
   LOAD DATA INFILE 'data.csv' INTO TABLE my_table FIELDS TERMINATED BY ',' ENCLOSED BY '"';
   ```

7. `ENCRYPTION` - 数据加密相关。

   示例：  
   ```sql
   ALTER TABLE my_table ENCRYPTION='Y';
   ```

8. `END` - 结束某个语句块或代码段。

   示例：  
   ```sql
   IF condition THEN
       statement1;
   END IF;
   ```

9. `ENDS` - 表示一段 SQL 语句的结束。

   示例：  
   ```sql
   DELIMITER $$
   CREATE PROCEDURE my_procedure()
   BEGIN
       -- SQL statements here
   END$$
   DELIMITER ;
   ```

10. `ENFORCED` - 规定约束是否强制执行。在 MySQL 8.0.16 中添加并非保留。

    示例：  
    ```sql
    CREATE TABLE my_table (
        column_name INT,
        CONSTRAINT constraint_name CHECK (column_name > 0) ENFORCED
    );
    ```

11. `ENGINE` - 指定存储引擎。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT) ENGINE=InnoDB;
    ```

12. `ENGINES` - 显示可用的存储引擎。

    示例：  
    ```sql
    SHOW ENGINES;
    ```

13. `ENGINE_ATTRIBUTE` - 存储引擎的属性。在 MySQL 8.0.21 中添加并非保留。

    示例：  
    ```sql
    ALTER TABLE my_table ENGINE_ATTRIBUTE='value';
    ```

14. `ENUM` - 枚举数据类型。

    示例：  
    ```sql
    CREATE TABLE my_table (enum_column ENUM('value1', 'value2', 'value3'));
    ```

15. `ERROR` - 错误相关操作。

    示例：  
    ```sql
    SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'ERROR';
    ```

16. `ERRORS` - 错误日志。

    示例：  
    ```sql
    SHOW ERRORS;
    ```

17. `ESCAPE` - 用于指定转义字符。

    示例：  
    ```sql
    SELECT * FROM my_table WHERE column_name LIKE '100\%';
    ```

18. `ESCAPED` (R) - 指定转义字符。已保留。

    示例：  
    ```sql
    SELECT * FROM my_table WHERE column_name LIKE '100\%';
    ```

19. `EVENT` - 事件调度器相关。

    示例：  
    ```sql
    CREATE EVENT my_event ON SCHEDULE EVERY 1 DAY DO CALL my_procedure();
    ```

20. `EVENTS` - 显示事件调度器的列表。

    示例：  
    ```sql
    SHOW EVENTS;
    ```

21. `EVERY` - 用于指定事件的执行频率。

    示例：  
    ```sql
    CREATE EVENT my_event ON SCHEDULE EVERY 1 DAY DO CALL my_procedure();
    ```

22. `EXCEPT` (R) - 用于组合查询并从第一个查询结果中排除第二个查询结果。已保留。

    示例：  
    ```sql
    SELECT * FROM table1
    EXCEPT
    SELECT * FROM table2;
    ```

23. `EXCHANGE` - 交换分区或表的数据。

    示例：  
    ```sql
    ALTER TABLE my_table1 EXCHANGE PARTITION partition_name WITH TABLE my_table2;
    ```

24. `EXCLUDE` - 排除某些条件。在 MySQL 8.0.2 中添加并非保留。

    示例：  
    ```sql
    CREATE TABLE my_table (column_name INT) EXCLUDE = 'value';
    ```

25. `EXECUTE` - 执行预备语句或动态 SQL 语句。

    示例：  
    ```sql
    EXECUTE my_prepared_statement;
    ```

26. `EXISTS` (R) - 判断子查询是否返回任何行。已保留。

    示例：  
    ```sql
    SELECT * FROM my_table WHERE EXISTS (SELECT * FROM other_table WHERE condition);
    ```

27. `EXIT` (R) - 退出循环或程序。已保留。

    示例：  
    ```sql
    WHILE condition DO
        statement1;
        IF condition THEN
            LEAVE;
        END IF;
        statement2;
    END WHILE;
    ```

28. `EXPANSION` - 扩展操作相关。

    示例：  
    ```sql
    ALTER TABLE my_table ENABLE KEYS WITH VALIDATION;
    ```

29. `EXPIRE` - 指定密码的过期时间。

    示例：  
    ```sql
    ALTER USER 'user'@'host' PASSWORD EXPIRE INTERVAL 90 DAY;
    ```

30. `EXPLAIN` (R) - 解释 SQL 查询的执行计划。已保留。

    示例：  
    ```sql
    EXPLAIN SELECT * FROM my_table WHERE condition;
    ```

31. `EXPORT` - 导出数据。

```sql
EXPORT TABLE my_table INTO OUTFILE 'export_file.txt';
```

32. `EXTENDED` - 显示更详细的信息。

```sql
SHOW STATUS EXTENDED LIKE 'Threads_running';
```

33. `EXTENT_SIZE` - 磁盘块的大小。

```sql
CREATE TABLESPACE my_tablespace ADD DATAFILE 'datafile_name' EXTENT_SIZE = 1M;
```

 
## F
 
- `FAILED_LOGIN_ATTEMPTS`; added in 8.0.19 (nonreserved)
- `FALSE` (R)
- `FAST`
- `FAULTS`
- `FETCH` (R)
- `FIELDS`
- `FILE`
- `FILE_BLOCK_SIZE`
- `FILTER`
- `FIRST`
- `FIRST_VALUE` (R); added in 8.0.2 (reserved)
- `FIXED`
- `FLOAT` (R)
- `FLOAT4` (R)
- `FLOAT8` (R)
- `FLUSH`
- `FOLLOWING`; added in 8.0.2 (nonreserved)
- `FOLLOWS`
- `FOR` (R)
- `FORCE` (R)
- `FOREIGN` (R)
- `FORMAT`
- `FOUND`
- `FROM` (R)
- `FULL`
- `FULLTEXT` (R)
- `FUNCTION` (R); became reserved in 8.0.1

### 给出解释和例子


1. `FAILED_LOGIN_ATTEMPTS`; added in 8.0.19 (nonreserved) - 设置登录失败尝试次数的参数。

   示例：
   ```sql
   ALTER USER 'username'@'localhost' FAILED_LOGIN_ATTEMPTS 5;
   ```

2. `FALSE` (R) - 逻辑假值。已保留。

   示例：
   ```sql
   SELECT * FROM my_table WHERE column_name = FALSE;
   ```

3. `FAST` - 用于指定优化级别或速度。 

   示例：
   ```sql
   SELECT * FROM my_table ORDER BY column_name FAST;
   ```

4. `FAULTS` - 用于检查服务器错误或故障。

   示例：
   ```sql
   SHOW STATUS LIKE 'Faults';
   ```

5. `FETCH` (R) - 用于获取游标中的数据。已保留。

   示例：
   ```sql
   FETCH cursor_name INTO variable_name;
   ```

6. `FIELDS` - 字段相关操作或选项。

   示例：
   ```sql
   LOAD DATA INFILE 'data.csv' INTO TABLE my_table FIELDS TERMINATED BY ',';
   ```

7. `FILE` - 文件相关操作或选项。

   示例：
   ```sql
   CREATE TABLESPACE my_tablespace ADD DATAFILE 'datafile_name';
   ```

8. `FILE_BLOCK_SIZE` - 文件块的大小。

   示例：
   ```sql
   CREATE TABLESPACE my_tablespace ADD DATAFILE 'datafile_name' FILE_BLOCK_SIZE = 1024;
   ```

9. `FILTER` - 用于过滤数据。

   示例：
   ```sql
   SELECT * FROM my_table WHERE column_name FILTER(PARTITION BY partition_column ORDER BY order_column);
   ```

10. `FIRST` - 在排序中指定第一个值。

    示例：
    ```sql
    SELECT * FROM my_table ORDER BY column_name FIRST;
    ```

11. `FIRST_VALUE` (R); added in 8.0.2 (reserved) - 返回窗口中第一个值。已保留。

    示例：
    ```sql
    SELECT column_name, FIRST_VALUE(column_name) OVER (PARTITION BY partition_column ORDER BY order_column) AS first_value FROM my_table;
    ```

12. `FIXED` - 固定长度的数据类型或选项。

    示例：
    ```sql
    CREATE TABLE my_table (column_name CHAR(10) FIXED);
    ```

13. `FLOAT` (R) - 浮点数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name FLOAT);
    ```

14. `FLOAT4` (R) - 单精度浮点数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name FLOAT4);
    ```

15. `FLOAT8` (R) - 双精度浮点数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name FLOAT8);
    ```

16. `FLUSH` - 刷新缓存或重置权限。

    示例：
    ```sql
    FLUSH PRIVILEGES;
    ```

17. `FOLLOWING`; added in 8.0.2 (nonreserved) - 用于窗口函数中指定行范围。已非保留。

    示例：
    ```sql
    SELECT column_name, SUM(column_name) OVER (ORDER BY column_name ROWS BETWEEN CURRENT ROW AND FOLLOWING) AS running_total FROM my_table;
    ```

18. `FOLLOWS` - 用于指定对象的顺序。

    示例：
    ```sql
    CREATE TABLE my_table1 (column_name INT) FOLLOWS my_table2;
    ```

19. `FOR` (R) - 用于循环或指定锁定方式。已保留。

    示例：
    ```sql
    FOR loop_variable IN 1..10 LOOP
        statement;
    END LOOP;
    ```

20. `FORCE` (R) - 强制使用某些选项或索引。已保留。

    示例：
    ```sql
    SELECT * FROM my_table FORCE INDEX (index_name);
    ```

21. `FOREIGN` (R) - 外键相关操作。已保留。

    示例：
    ```sql
    ALTER TABLE child_table ADD FOREIGN KEY (column_name) REFERENCES parent_table (column_name);
    ```

22. `FORMAT` - 数据格式化选项或设置。

    示例：
    ```sql
    SELECT * FROM my_table FORMAT=CSV;
    ```

23. `FOUND` - 用于检查是否找到了结果。 

    示例：
    ```sql
    IF FOUND THEN
        statement;
    END IF;
    ```

24. `FROM` (R) - 用于指定数据源。已保留。

    示例：
    ```sql
    SELECT * FROM my_table;
    ```

25. `FULL` - 全表扫描或完整匹配。 

    示例：
    ```sql
    SELECT * FROM my_table FULL JOIN other_table ON my_table.id = other_table.id;
    ```

26. `FULLTEXT` (R) - 全文搜索相关操作。已保留。

示例：

```sql
    CREATE FULLTEXT INDEX index_name ON my_table (column FULLTEXT(column_name);
```

27. `FUNCTION` (R); became reserved in 8.0.1 - 函数相关操作。已保留。

   示例：
   ```sql
   CREATE FUNCTION my_function(param INT) RETURNS INT RETURN param * 2;
   ```

## G
 
- `GENERAL`
- `GENERATED` (R)
- `GEOMCOLLECTION`; added in 8.0.11 (nonreserved)
- `GEOMETRY`
- `GEOMETRYCOLLECTION`
- `GET` (R)
- `GET_FORMAT`
- `GET_MASTER_PUBLIC_KEY`; added in 8.0.4 (reserved); became nonreserved in 8.0.11
- `GLOBAL`
- `GRANT` (R)
- `GRANTS`
- `GROUP` (R)
- `GROUPING` (R); added in 8.0.1 (reserved)
- `GROUPS` (R); added in 8.0.2 (reserved)
- `GROUP_REPLICATION`


### 给出解释和例子

1. `GENERAL` - 通用性的，一般的。

   示例：
   ```sql
   ALTER TABLE my_table ADD COLUMN column_name VARCHAR(255) COMMENT 'General description';
   ```

2. `GENERATED` (R) - 自动生成的值。已保留。

   示例：
   ```sql
   CREATE TABLE my_table (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(50),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       generated_column INT GENERATED ALWAYS AS (id * 2) STORED
   );
   ```

3. `GEOMCOLLECTION`; added in 8.0.11 (nonreserved) - 几何对象集合类型。已非保留。

   示例：
   ```sql
   CREATE TABLE my_geometries (
       id INT,
       geom_collection GEOMCOLLECTION,
       SPATIAL INDEX(geom_collection)
   );
   ```

4. `GEOMETRY` - 几何对象类型。

   示例：
   ```sql
   CREATE TABLE my_geometries (
       id INT,
       geom GEOMETRY,
       SPATIAL INDEX(geom)
   );
   ```

5. `GEOMETRYCOLLECTION` - 几何对象集合类型。

   示例：
   ```sql
   CREATE TABLE my_geometries (
       id INT,
       geom_collection GEOMETRYCOLLECTION,
       SPATIAL INDEX(geom_collection)
   );
   ```

6. `GET` (R) - 获取信息或数据。已保留。

   示例：
   ```sql
   GET DIAGNOSTICS my_variable = ROW_COUNT;
   ```

7. `GET_FORMAT` - 获取日期格式。

   示例：
   ```sql
   SELECT GET_FORMAT(DATE, 'EUR');
   ```

8. `GET_MASTER_PUBLIC_KEY`; added in 8.0.4 (reserved); became nonreserved in 8.0.11 - 获取主服务器的公钥。在 MySQL 8.0.11 之前是保留关键词，在之后变为非保留。

   示例：
   ```sql
   SHOW MASTER STATUS;
   ```

9. `GLOBAL` - 全局范围的，影响整个系统的。

   示例：
   ```sql
   SET GLOBAL variable_name = value;
   ```

10. `GRANT` (R) - 授权权限给用户或角色。已保留。

    示例：
    ```sql
    GRANT SELECT, INSERT ON my_database.my_table TO 'username'@'localhost';
    ```

11. `GRANTS` - 显示用户或角色的授权信息。

    示例：
    ```sql
    SHOW GRANTS FOR 'username'@'localhost';
    ```

12. `GROUP` (R) - 分组操作或关键词。已保留。

    示例：
    ```sql
    SELECT column_name, COUNT(*) FROM my_table GROUP BY column_name;
    ```

13. `GROUPING` (R); added in 8.0.1 (reserved) - 分组函数。已保留。

    示例：
    ```sql
    SELECT column_name, GROUPING(column_name) FROM my_table GROUP BY column_name;
    ```

14. `GROUPS` (R); added in 8.0.2 (reserved) - 分组数量。已保留。

    示例：
    ```sql
    SELECT column_name, COUNT(*) FROM my_table GROUP BY column_name WITH ROLLUP;
    ```

15. `GROUP_REPLICATION` - 组复制相关操作。

    示例：
    ```sql
    SHOW GROUP_REPLICATION STATUS;
    ```



## H
 
- `HANDLER`
- `HASH`
- `HAVING` (R)
- `HELP`
- `HIGH_PRIORITY` (R)
- `HISTOGRAM`; added in 8.0.2 (nonreserved)
- `HISTORY`; added in 8.0.3 (nonreserved)
- `HOST`
- `HOSTS`
- `HOUR`
- `HOUR_MICROSECOND` (R)
- `HOUR_MINUTE` (R)
- `HOUR_SECOND` (R)

### 给出解释和例子 


1. `HANDLER` - 用于处理表的操作。

   示例：
   ```sql
   HANDLER my_table OPEN;
   ```

2. `HASH` - 哈希函数或哈希索引相关。

   示例：
   ```sql
   CREATE INDEX index_name ON my_table USING HASH(column_name);
   ```

3. `HAVING` (R) - 用于在对查询结果进行分组后进行筛选。已保留。

   示例：
   ```sql
   SELECT column_name, COUNT(*) FROM my_table GROUP BY column_name HAVING COUNT(*) > 5;
   ```

4. `HELP` - 显示帮助信息。

   示例：
   ```sql
   HELP ALTER TABLE;
   ```

5. `HIGH_PRIORITY` (R) - 指定高优先级查询。已保留。

   示例：
   ```sql
   SELECT HIGH_PRIORITY * FROM my_table;
   ```

6. `HISTOGRAM`; added in 8.0.2 (nonreserved) - 直方图相关操作。已非保留。

   示例：
   ```sql
   ANALYZE TABLE my_table COMPUTE HISTOGRAM;
   ```

7. `HISTORY`; added in 8.0.3 (nonreserved) - 历史记录相关操作。已非保留。

   示例：
   ```sql
   SHOW HISTORY;
   ```

8. `HOST` - 主机名或 IP 地址相关。

   示例：
   ```sql
   GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'host';
   ```

9. `HOSTS` - 显示主机列表。

   示例：
   ```sql
   SHOW HOSTS;
   ```

10. `HOUR` - 用于指定时间单位为小时。

    示例：
    ```sql
    SELECT * FROM my_table WHERE HOUR(datetime_column) = 12;
    ```

11. `HOUR_MICROSECOND` (R) - 用于指定时间单位为小时和微秒。已保留。

    示例：
    ```sql
    SELECT HOUR_MICROSECOND('12:30:45.123456');
    ```

12. `HOUR_MINUTE` (R) - 用于指定时间单位为小时和分钟。已保留。

    示例：
    ```sql
    SELECT HOUR_MINUTE('12:30:45');
    ```

13. `HOUR_SECOND` (R) - 用于指定时间单位为小时和秒。已保留。

    示例：
    ```sql
    SELECT HOUR_SECOND('12:30:45');
    ```

## I
 
- `IDENTIFIED`
- `IF` (R)
- `IGNORE` (R)
- `IGNORE_SERVER_IDS`
- `IMPORT`
- `IN` (R)
- `INACTIVE`; added in 8.0.14 (nonreserved)
- `INDEX` (R)
- `INDEXES`
- `INFILE` (R)
- `INITIAL_SIZE`
- `INNER` (R)
- `INOUT` (R)
- `INSENSITIVE` (R)
- `INSERT` (R)
- `INSERT_METHOD`
- `INSTALL`
- `INSTANCE`
- `INT` (R)
- `INT1` (R)
- `INT2` (R)
- `INT3` (R)
- `INT4` (R)
- `INT8` (R)
- `INTEGER` (R)
- `INTERVAL` (R)
- `INTO` (R)
- `INVISIBLE`
- `INVOKER`
- `IO`
- `IO_AFTER_GTIDS` (R)
- `IO_BEFORE_GTIDS` (R)
- `IO_THREAD`
- `IPC`
- `IS` (R)
- `ISOLATION`
- `ISSUER`
- `ITERATE` (R)
 
### 给出解释和例子 


1. `IDENTIFIED` - 用于指定身份验证方式。

   示例：
   ```sql
   CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
   ```

2. `IF` (R) - 条件语句中的关键词。已保留。

   示例：
   ```sql
   IF condition THEN
       statement;
   END IF;
   ```

3. `IGNORE` (R) - 在插入数据时忽略重复键错误。已保留。

   示例：
   ```sql
   INSERT IGNORE INTO my_table (column1, column2) VALUES (value1, value2);
   ```

4. `IGNORE_SERVER_IDS` - 用于复制配置中指定要忽略的服务器ID。

   示例：
   ```sql
   CHANGE MASTER TO MASTER_IGNORE_SERVER_IDS = (server_id1, server_id2);
   ```

5. `IMPORT` - 导入数据。

   示例：
   ```sql
   IMPORT TABLESPACE my_tablespace DATAFILE 'datafile_name';
   ```

6. `IN` (R) - 在条件语句中用于检查值是否在指定的范围内。已保留。

   示例：
   ```sql
   SELECT * FROM my_table WHERE column_name IN (value1, value2, value3);
   ```

7. `INACTIVE`; added in 8.0.14 (nonreserved) - 指定某个对象状态为不活动。

   示例：
   ```sql
   ALTER TABLE my_table SET INACTIVE;
   ```

8. `INDEX` (R) - 用于创建索引。已保留。

   示例：
   ```sql
   CREATE INDEX index_name ON my_table (column_name);
   ```

9. `INDEXES` - 显示索引列表。

   示例：
   ```sql
   SHOW INDEXES FROM my_table;
   ```

10. `INFILE` (R) - 用于加载文件数据。已保留。

    示例：
    ```sql
    LOAD DATA INFILE 'data.txt' INTO TABLE my_table;
    ```

11. `INITIAL_SIZE` - 初始大小参数。

    示例：
    ```sql
    CREATE TABLESPACE my_tablespace ADD DATAFILE 'datafile_name' INITIAL_SIZE = 100M;
    ```

12. `INNER` (R) - 内连接操作。已保留。

    示例：
    ```sql
    SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id;
    ```

13. `INOUT` (R) - 存储过程参数类型。已保留。

    示例：
    ```sql
    CREATE PROCEDURE my_procedure(INOUT param INT) BEGIN ... END;
    ```

14. `INSENSITIVE` (R) - 游标类型。已保留。

    示例：
    ```sql
    DECLARE cursor_name CURSOR INSENSITIVE FOR SELECT * FROM my_table;
    ```

15. `INSERT` (R) - 插入数据。已保留。

    示例：
    ```sql
    INSERT INTO my_table (column1, column2) VALUES (value1, value2);
    ```

16. `INSERT_METHOD` - 插入方式选项。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT) INSERT_METHOD = FIRST;
    ```

17. `INSTALL` - 安装或部署相关操作。

    示例：
    ```sql
    INSTALL PLUGIN my_plugin SONAME 'plugin_name';
    ```

18. `INSTANCE` - 实例相关操作。

    示例：
    ```sql
    CREATE INSTANCE my_instance;
    ```

19. `INT` (R) - 整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT);
    ```

20. `INT1` (R) - 1 字节整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT1);
    ```

21. `INT2` (R) - 2 字节整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT2);
    ```

22. `INT3` (R) - 3 字节整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT3);
    ```

23. `INT4` (R) - 4 字节整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT4);
    ```

24. `INT8` (R) - 8 字节整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT8);
    ```

25. `INTEGER` (R) - 整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INTEGER);
    ```

26. `INTERVAL` (R) - 时间间隔类型。已保留。

    示例：
    ```sql
    SELECT INTERVAL 1 DAY;
    ```

27. `INTO` (R) - 指定结果存储位置。已保留。

    示例：
    ```sql
    SELECT column_name INTO variable_name FROM my_table;
    ```

28. `INVISIBLE` - 使索引不可见。

    示例：
    ```sql
    ALTER TABLE my_table ALTER INDEX index_name INVISIBLE;
    ```

29. `INVOKER` - 触发器相关操作。

    示例：
    ```sql
    CREATE TRIGGER my_trigger BEFORE INSERT ON my_table FOR EACH ROW INVOKER = 'creator';
    ```

30. `IO` - 输入输出操作。

    示例：
    ```sql
    START SLAVE IO_THREAD;
    ```

31. `IO_AFTER_GTIDS` (R) - 复制线程操作。已保留。

    示例：
    ```sql
    STOP SLAVE IO_AFTER_GTIDS;
    ```

32. `IO_BEFORE_GTIDS` (R) - 复制线程操作。已保留。

    示例：
    ```sql
    START SLAVE IO_BEFORE_GTIDS;
    ```

33. `IO_THREAD` - 复制线程相关操作。

    示例：
    ```sql
    START SLAVE IO_THREAD;
    ```

34. `IPC` - 进程间通信相关操作。

    示例：
    ```sql
    INSTALL COMPONENT 'file://component_name' SONAME 'shared_library';
    ```

35. `IS` (R) - 用于比较两个值是否相等。已保留。

    示例：
    ```sql
    SELECT * FROM my_table
    36. `ISOLATION` - 事务隔离级别设置或查询。

    示例：
    ```sql
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    ```

37. `ISSUER` - SSL 证书颁发者相关信息。

    示例：
    ```sql
    GRANT USAGE ON *.* TO 'username'@'hostname' REQUIRE ISSUER '/C=US/ST=CA/L=City/O=Organization/OU=Unit/CN=CommonName/EMAIL=email@example.com';
    ```

38. `ITERATE` (R) - 用于循环控制中的关键字。已保留。

    示例：
    ```sql
    REPEAT
        statement;
        ITERATE;
    UNTIL condition END REPEAT;

## J+K
 
- `JOIN` (R)
- `JSON`
- `JSON_TABLE` (R); added in 8.0.4 (reserved)
- `JSON_VALUE`; added in 8.0.21 (nonreserved)
 
- `KEY` (R)
- `KEYS` (R)
- `KEY_BLOCK_SIZE`
- `KILL` (R)

### 给出解释和例子 

1. `JOIN` (R) - 用于连接两个或多个表中的行。

   示例：
   ```sql
   SELECT * FROM table1 JOIN table2 ON table1.id = table2.id;
   ```

2. `JSON` - JSON 数据类型或 JSON 函数。

   示例：
   ```sql
   SELECT JSON_OBJECT('key', 'value');
   ```

3. `JSON_TABLE` (R) - 用于将 JSON 数据解析成关系行。

   示例：
   ```sql
   SELECT * FROM JSON_TABLE(json_column, '$.path' COLUMNS (column1 PATH '$.key'));
   ```

4. `JSON_VALUE` - 从 JSON 文档中提取标量值。

   示例：
   ```sql
   SELECT JSON_VALUE(json_column, '$.key');
   ```

5. `KEY` (R) - 表的索引。

   示例：
   ```sql
   CREATE TABLE my_table (column1 INT, column2 VARCHAR(50), KEY index_name (column1));
   ```

6. `KEYS` (R) - 显示表的索引列表。

   示例：
   ```sql
   SHOW KEYS FROM my_table;
   ```

7. `KEY_BLOCK_SIZE` - 指定索引块大小。

   示例：
   ```sql
   CREATE TABLE my_table (column1 INT, column2 VARCHAR(50), INDEX index_name (column1) KEY_BLOCK_SIZE = 8);
   ```

8. `KILL` (R) - 终止指定线程。

   示例：
   ```sql
   KILL QUERY thread_id;
   ```

## L
 
- `LAG` (R); added in 8.0.2 (reserved)
- `LANGUAGE`
- `LAST`
- `LAST_VALUE` (R); added in 8.0.2 (reserved)
- `LATERAL` (R); added in 8.0.14 (reserved)
- `LEAD` (R); added in 8.0.2 (reserved)
- `LEADING` (R)
- `LEAVE` (R)
- `LEAVES`
- `LEFT` (R)
- `LESS`
- `LEVEL`
- `LIKE` (R)
- `LIMIT` (R)
- `LINEAR` (R)
- `LINES` (R)
- `LINESTRING`
- `LIST`
- `LOAD` (R)
- `LOCAL`
- `LOCALTIME` (R)
- `LOCALTIMESTAMP` (R)
- `LOCK` (R)
- `LOCKED`; added in 8.0.1 (nonreserved)
- `LOCKS`
- `LOGFILE`
- `LOGS`
- `LONG` (R)
- `LONGBLOB` (R)
- `LONGTEXT` (R)
- `LOOP` (R)
- `LOW_PRIORITY` (R)
 
### 解释和例子

1. `LAG` (R) - 分析函数之一，在当前行之前返回指定偏移量的行值。

   示例：
   ```sql
   SELECT value, LAG(value) OVER (ORDER BY date_col) AS lag_value FROM my_table;
   ```

2. `LANGUAGE` - 指定编程语言。

   示例：
   ```sql
   CREATE FUNCTION my_function() RETURNS INT LANGUAGE SQL BEGIN RETURN 1; END;
   ```

3. `LAST` - 返回分组中最后一个值。

   示例：
   ```sql
   SELECT id, value FROM my_table ORDER BY id DESC LIMIT 1;
   ```

4. `LAST_VALUE` (R) - 分析函数之一，返回分组中最后一个非空值。

   示例：
   ```sql
   SELECT value, LAST_VALUE(value) OVER (PARTITION BY category ORDER BY date_col) AS last_value FROM my_table;
   ```

5. `LATERAL` (R) - 用于联接中的侧边查询。

   示例：
   ```sql
   SELECT * FROM table1 JOIN LATERAL(SELECT * FROM table2 WHERE table1.id = table2.id) AS lateral_table ON true;
   ```

6. `LEAD` (R) - 分析函数之一，在当前行之后返回指定偏移量的行值。

   示例：
   ```sql
   SELECT value, LEAD(value) OVER (ORDER BY date_col) AS lead_value FROM my_table;
   ```

7. `LEADING` (R) - 用于连接操作中指定连接表。

   示例：
   ```sql
   SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id WHERE table1.id > 100;
   ```

8. `LEAVE` (R) - 用于循环控制结构中的关键字。

   示例：
   ```sql
   WHILE condition DO
       statement;
       LEAVE;
   END WHILE;
   ```

9. `LEAVES` - 返回 JSON 树中的叶节点。

   示例：
   ```sql
   SELECT JSON_SEARCH(json_column, 'one', 'value', NULL, '$**.leaves') FROM my_table;
   ```

10. `LEFT` (R) - 左连接操作。

    示例：
    ```sql
    SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.id;
    ```

11. `LESS` - 小于操作符。

    示例：
    ```sql
    SELECT * FROM my_table WHERE column_name < value;
    ```

12. `LEVEL` - 指定递归查询的层级。

    示例：
    ```sql
    WITH RECURSIVE cte AS (
        SELECT * FROM my_table WHERE parent_id IS NULL
        UNION ALL
        SELECT child.* FROM my_table child JOIN cte ON child.parent_id = cte.id
    )
    SELECT * FROM cte WHERE LEVEL <= 3;
    ```

13. `LIKE` (R) - 用于模式匹配的操作符。

    示例：
    ```sql
    SELECT * FROM my_table WHERE column_name LIKE 'prefix%';
    ```

14. `LIMIT` (R) - 限制结果集的行数。

    示例：
    ```sql
    SELECT * FROM my_table LIMIT 10;
    ```

15. `LINEAR` (R) - 指定索引使用的插入方法。

    示例：
    ```sql
    CREATE TABLE my_table (column_name INT, INDEX(column_name) USING LINEAR HASH);
    ```

16. `LINES` (R) - 用于指定 GEO 几何对象类型。

    示例：
    ```sql
    SELECT ST_AsText(GeomFromText('LINESTRING(0 0, 1 1, 2 2)'));
    ```

17. `LINESTRING` - 用于定义几何对象。

    示例：
    ```sql
    CREATE TABLE my_geometry_table (geometry_column LINESTRING);
    ```

18. `LIST` - 用于聚合操作的函数。

    示例：
    ```sql
    SELECT GROUP_CONCAT(column_name) AS concatenated_list FROM my_table;
    ```

19. `LOAD` (R) - 用于加载外部数据。

    示例：
    ```sql
    LOAD DATA INFILE 'data.txt' INTO TABLE my_table;
    ```

20. `LOCAL` - 指定事件的时区为本地时区。

    示例：
    ```sql
    CREATE EVENT my_event ON SCHEDULE EVERY 1 HOUR STARTS '2024-03-25 00:00:00' ENDS '2024-03-26 00:00:00' DO BEGIN ... END;
    ```

21. `LOCALTIME` (R) - 返回当前时间。

    示例：
    ```sql
    SELECT LOCALTIME();
    ```

22. `LOCALTIMESTAMP` (R) - 返回当前日期时间。

    示例：
    ```sql
    SELECT LOCALTIMESTAMP();
    ```

23. `LOCK` (R) - 锁定表的行。

    示例：
    ```sql
    LOCK TABLES my_table WRITE;
    ```

24. `LOCKED` - 指定连接是否处于锁定状态。

    示例：
    ```sql
    SELECT * FROM performance_schema.threads WHERE locked = 'Y';
    ```

25. `LOCKS` - 返回当前数据库中的锁信息。

    示例：
    ```sql
    SHOW OPEN TABLES WHERE In_use > 0;
    ```

26. `LOGFILE` - 指定日志文件路径。

    示例：
    ```sql
    SET GLOBAL general_log_file = 'log_file_path.log';
    ```

27. `LOGS` - 返回日志文件列表。

    示例：
    ```sql
    SHOW BINARY LOGS;
    ```

28. `LONG` (R) - 长整数数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name LONG);
    ```

29. `LONGBLOB` (R) - 长二进制数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name LONGBLOB);
    ```

30. `LONGTEXT` (R) - 长文本数据类型。已保留。

    示例：
    ```sql
    CREATE TABLE my_table (column_name LONGTEXT);
    ```

31. `LOOP` (R) - 循环控制结构中的关键字。已保留。

    示例：
    ```sql
    LOOP
        statement;
    END LOOP;
    ```

32. `LOW_PRIORITY` (R) - 指定查询的优先级较低。

示例：
    
```sql
SELECT LOW_PRIORITY * FROM my_table;
```

## M
 
- `MASTER`
- `MASTER_AUTO_POSITION`
- `MASTER_BIND` (R)
- `MASTER_COMPRESSION_ALGORITHMS`; added in 8.0.18 (nonreserved)
- `MASTER_CONNECT_RETRY`
- `MASTER_DELAY`
- `MASTER_HEARTBEAT_PERIOD`
- `MASTER_HOST`
- `MASTER_LOG_FILE`
- `MASTER_LOG_POS`
- `MASTER_PASSWORD`
- `MASTER_PORT`
- `MASTER_PUBLIC_KEY_PATH`; added in 8.0.4 (nonreserved)
- `MASTER_RETRY_COUNT`
- `MASTER_SERVER_ID`
- `MASTER_SSL`
- `MASTER_SSL_CA`
- `MASTER_SSL_CAPATH`
- `MASTER_SSL_CERT`
- `MASTER_SSL_CIPHER`
- `MASTER_SSL_CRL`
- `MASTER_SSL_CRLPATH`
- `MASTER_SSL_KEY`
- `MASTER_SSL_VERIFY_SERVER_CERT` (R)
- `MASTER_TLS_CIPHERSUITES`; added in 8.0.19 (nonreserved)
- `MASTER_TLS_VERSION`
- `MASTER_USER`
- `MASTER_ZSTD_COMPRESSION_LEVEL`; added in 8.0.18 (nonreserved)
- `MATCH` (R)
- `MAXVALUE` (R)
- `MAX_CONNECTIONS_PER_HOUR`
- `MAX_QUERIES_PER_HOUR`
- `MAX_ROWS`
- `MAX_SIZE`
- `MAX_UPDATES_PER_HOUR`
- `MAX_USER_CONNECTIONS`
- `MEDIUM`
- `MEDIUMBLOB` (R)
- `MEDIUMINT` (R)
- `MEDIUMTEXT` (R)
- `MEMBER`; added in 8.0.17 (reserved); became nonreserved in 8.0.19
- `MEMORY`
- `MERGE`
- `MESSAGE_TEXT`
- `MICROSECOND`
- `MIDDLEINT` (R)
- `MIGRATE`
- `MINUTE`
- `MINUTE_MICROSECOND` (R)
- `MINUTE_SECOND` (R)
- `MIN_ROWS`
- `MOD` (R)
- `MODE`
- `MODIFIES` (R)
- `MODIFY`
- `MONTH`
- `MULTILINESTRING`
- `MULTIPOINT`
- `MULTIPOLYGON`
- `MUTEX`
- `MYSQL_ERRNO`

### 给出解释和例子 

- `MASTER`: 用于指定主数据库的相关参数。
  - **示例**: `MASTER_HOST='localhost', MASTER_USER='user', MASTER_PASSWORD='password', MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=1234`

- `MASTER_AUTO_POSITION`: 指定是否自动获取主数据库的当前复制位置。
  - **示例**: `MASTER_AUTO_POSITION`

- `MASTER_BIND` (R): 指定主数据库与从数据库之间的连接绑定地址。
  - **示例**: `MASTER_BIND='192.168.1.100'`

- `MASTER_COMPRESSION_ALGORITHMS`: 指定主数据库与从数据库之间传输数据时使用的压缩算法。
  - **示例**: `MASTER_COMPRESSION_ALGORITHMS='zlib'`

- `MASTER_CONNECT_RETRY`: 指定在连接主数据库时的重试次数。
  - **示例**: `MASTER_CONNECT_RETRY=3`

- `MASTER_DELAY`: 指定从数据库延迟复制主数据库的时间。
  - **示例**: `MASTER_DELAY=3600` (延迟1小时)

- `MASTER_HEARTBEAT_PERIOD`: 指定主数据库发送心跳信号的时间间隔。
  - **示例**: `MASTER_HEARTBEAT_PERIOD=10` (每10秒发送一次心跳信号)

- `MASTER_HOST`: 指定主数据库的主机名或IP地址。
  - **示例**: `MASTER_HOST='db.example.com'`

- `MASTER_LOG_FILE`: 指定主数据库的二进制日志文件。
  - **示例**: `MASTER_LOG_FILE='mysql-bin.000001'`

- `MASTER_LOG_POS`: 指定主数据库的二进制日志文件的位置。
  - **示例**: `MASTER_LOG_POS=1234`

- `MASTER_PASSWORD`: 指定主数据库连接的密码。
  - **示例**: `MASTER_PASSWORD='password123'`

- `MASTER_PORT`: 指定主数据库的端口号。
  - **示例**: `MASTER_PORT=3306`

- `MASTER_PUBLIC_KEY_PATH`; added in 8.0.4 (nonreserved): 指定主数据库的公钥路径。
  - **示例**: `MASTER_PUBLIC_KEY_PATH='/path/to/public/key'`

- `MASTER_RETRY_COUNT`: 指定连接主数据库时的重试次数。
  - **示例**: `MASTER_RETRY_COUNT=5`

- `MASTER_SERVER_ID`: 指定主数据库的服务器ID。
  - **示例**: `MASTER_SERVER_ID=1`

- `MASTER_SSL`: 指定是否使用SSL连接到主数据库。
  - **示例**: `MASTER_SSL=1`

- `MASTER_SSL_CA`: 指定SSL连接时使用的CA证书。
  - **示例**: `MASTER_SSL_CA='/path/to/ca_cert.pem'`

- `MASTER_SSL_CAPATH`: 指定SSL连接时使用的CA证书目录。
  - **示例**: `MASTER_SSL_CAPATH='/path/to/ca_certs/'`

- `MASTER_SSL_CERT`: 指定SSL连接时使用的证书。
  - **示例**: `MASTER_SSL_CERT='/path/to/client_cert.pem'`

- `MASTER_SSL_CIPHER`: 指定SSL连接时使用的密码套件。
  - **示例**: `MASTER_SSL_CIPHER='AES128-SHA'`

- `MASTER_SSL_CRL`: 指定SSL连接时使用的CRL文件。
  - **示例**: `MASTER_SSL_CRL='/path/to/crl.pem'`

- `MASTER_SSL_CRLPATH`: 指定SSL连接时使用的CRL文件目录。
  - **示例**: `MASTER_SSL_CRLPATH='/path/to/crls/'`

- `MASTER_SSL_KEY`: 指定SSL连接时使用的私钥。
  - **示例**: `MASTER_SSL_KEY='/path/to/client_key.pem'`

- `MASTER_SSL_VERIFY_SERVER_CERT` (R): 指定是否验证主数据库的服务器证书。
  - **示例**: `MASTER_SSL_VERIFY_SERVER_CERT=1`

- `MASTER_TLS_CIPHERSUITES`; added in 8.0.19 (nonreserved): 指定TLS连接时使用的密码套件。
  - **示例**: `MASTER_TLS_CIPHERSUITES='TLS_AES_256_GCM_SHA384'`

- `MASTER_TLS_VERSION`: 指定TLS连接时使用的TLS版本。
  - **示例**: `MASTER_TLS_VERSION='TLSv1.2'`

- `MASTER_USER`: 指定主数据库连接的用户名。
  - **示例**: `MASTER_USER='replication_user'`

- `MASTER_ZSTD_COMPRESSION_LEVEL`; added in 8.0.18 (nonreserved): 指定主数据库与从数据库之间传输数据时使用的ZSTD压缩级别。
  - **示例**: `MASTER_ZSTD_COMPRESSION_LEVEL=3`

- `MATCH` (R): 用于指定匹配模式或条件。
  - **示例**: `SELECT * FROM table WHERE column MATCH 'pattern';`

- `MAXVALUE` (R): 用于指定列或索引的最大值。
  - **示例**: `CREATE TABLE table_name (column_name INT PRIMARY KEY AUTO_INCREMENT, other_columns);`

- `MAX_CONNECTIONS_PER_HOUR`: 指定每小时允许的最大连接数。
  - **示例**: `GRANT USAGE ON *.* TO 'user'@'localhost' WITH MAX_CONNECTIONS_PER_HOUR 100;`

- `MAX_QUERIES_PER_HOUR`: 指定每小时允许的最大查询数。
  - **示例**: `GRANT USAGE ON *.* TO 'user'@'localhost' WITH MAX_QUERIES_PER_HOUR 1000;`

- `MAX_ROWS`: 指定表的最大行数。
  - **示例**: `CREATE TABLE table_name (column1 INT, column2 VARCHAR(50)) MAX_ROWS=1000;`

- `MAX_SIZE`: 指定表的最大尺寸。
  - **示例**: `CREATE TABLE table_name (column1 INT, column2 VARCHAR(50)) MAX_SIZE=100MB;`

- `MAX_UPDATES_PER_HOUR`: 指定每小时允许的最大更新数。
  - **示例**: `GRANT USAGE ON *.* TO 'user'@'localhost' WITH MAX_UPDATES_PER_HOUR 500;`

- `MAX_USER_CONNECTIONS`: 指定用户的最大连接数。
  - **示例**: `GRANT USAGE ON *.* TO 'user'@'localhost' WITH MAX_USER_CONNECTIONS 10;`

- `MEDIUM`: 用于指定中等大小。
  - **示例**: `CREATE TABLE table_name (column1 MEDIUMINT, column2 MEDIUMTEXT);`

- `MEDIUMBLOB` (R): 用于存储中等大小的二进制对象。
  - **示例**: `CREATE TABLE table_name (column MEDIUMBLOB);`

- `MEDIUMINT` (R): 用于存储中等范围的整数值。
  - **示例**: `CREATE TABLE table_name (column MEDIUMINT);`

- `MEDIUMTEXT` (R): 用于存储中等大小的文本数据。
  - **示例**: `CREATE TABLE table_name (column MEDIUMTEXT);`

- `MEMBER`: 用于指定成员关系。
  - **示例**: `CREATE TABLE members (id INT, name VARCHAR(50), PRIMARY KEY (id)) ENGINE=INNODB;`

- `MEMORY`: 用于指定存储引擎为内存存储引擎。
  - **示例**: `CREATE TABLE table_name (column1 INT, column2 VARCHAR(50)) ENGINE=MEMORY;`

- `MERGE`: 用于指定表合并存储引擎。
  - **示例**: `CREATE TABLE table_name (column1 INT, column2 VARCHAR(50)) ENGINE=MERGE;`

- `MESSAGE_TEXT`: 用于指定消息文本。
  - **示例**: `INSERT INTO log_table (message_text) VALUES ('Error occurred during transaction.');`

- `MICROSECOND`: 用于指定微秒。
  - **示例**: `SELECT MICROSECOND('10:30:15.500000');`

- `MIDDLEINT` (R): 用于存储中等范围的整数值。
  - **示例**: `CREATE TABLE table_name (column MIDDLEINT);`

- `MIGRATE`: 用于指定迁移操作。
  - **示例**: `ALTER TABLE old_table RENAME TO new_table;`

- `MINUTE`: 用于指定分钟。
  - **示例**: `SELECT MINUTE('10:30:15');`

- `MINUTE_MICROSECOND` (R): 用于指定分钟和微秒。
  - **示例**: `SELECT MINUTE_MICROSECOND('10:30:15.500000');`

- `MINUTE_SECOND` (R): 用于指定分钟和秒。
  - **示例**: `SELECT MINUTE_SECOND('10:30:15');`

- `MIN_ROWS`: 用于指定表的最小行数。
  - **示例**: `CREATE TABLE table_name (column1 INT, column2 VARCHAR(50)) MIN_ROWS=100;`

- `MOD` (R): 用于计算除法的余数。
  - **示例**: `SELECT MOD(10, 3);`

- `MODE`: 用于指定模式。
  - **示例**: `SET sql_mode='STRICT_TRANS_TABLES';`

- `MODIFIES` (R): 用于指定函数修改的数据。
  - **示例**: `CREATE FUNCTION myFunction RETURNS INT MODIFIES SQL DATA RETURN 1;`

- `MODIFY`: 用于修改列的属性。
  - **示例**: `ALTER TABLE table_name MODIFY column_name VARCHAR(100);`

- `MONTH`: 用于指定月份。
  - **示例**: `SELECT MONTH('2018-12-25');`

- `MULTILINESTRING`: 用于存储多个线段。
  - **示例**: `CREATE TABLE table_name (column MULTILINESTRING);`

- `MULTIPOINT`: 用于存储多个点。

- `MULTIPOLYGON`: 用于存储多个多边形。
  - **示例**: `CREATE TABLE regions (id INT AUTO_INCREMENT PRIMARY KEY, area MULTIPOLYGON);`

- `MUTEX`: 用于指定互斥锁。
  - **示例**: 
    ```sql
    GET_LOCK('lock_name', timeout);
    RELEASE_LOCK('lock_name');
    ```

- `MYSQL_ERRNO`: 用于指定 MySQL 错误号。
  - **示例**: `SELECT MYSQL_ERRNO();`

## N
 
- `NAME`
- `NAMES`
- `NATIONAL`
- `NATURAL` (R)
- `NCHAR`
- `NDB`
- `NDBCLUSTER`
- `NESTED`; added in 8.0.4 (nonreserved)
- `NETWORK_NAMESPACE`; added in 8.0.16 (nonreserved)
- `NEVER`
- `NEW`
- `NEXT`
- `NO`
- `NODEGROUP`
- `NONE`
- `NOT` (R)
- `NOWAIT`; added in 8.0.1 (nonreserved)
- `NO_WAIT`
- `NO_WRITE_TO_BINLOG` (R)
- `NTH_VALUE` (R); added in 8.0.2 (reserved)
- `NTILE` (R); added in 8.0.2 (reserved)
- `NULL` (R)
- `NULLS`; added in 8.0.2 (nonreserved)
- `NUMBER`
- `NUMERIC` (R)
- `NVARCHAR`

### 给出解释和例子 

1. `NAME`: 
   - 解释：`NAME` 是一个用于指定标识符的关键字，通常用于表名、列名等标识符。
   - 示例：创建一个名为 `employees` 的表格。
     ```sql
     CREATE TABLE employees (
         employee_id INT PRIMARY KEY,
         name VARCHAR(50)
     );
     ```

2. `NAMES`:
   - 解释：`NAMES` 关键字通常用于设置字符集。
   - 示例：设置字符集为 UTF-8。
     ```sql
     SET NAMES 'utf8';
     ```

3. `NATIONAL`:
   - 解释：`NATIONAL` 关键字用于指定国家字符集的数据类型，通常与字符数据类型一起使用。
   - 示例：创建一个使用国家字符集的字符列。
     ```sql
     CREATE TABLE my_table (
         country_name NATIONAL CHAR(50)
     );
     ```

4. `NATURAL`:
   - 解释：`NATURAL` 关键字用于指定自然连接，在自然连接中，表之间通过共同的列进行连接。
   - 示例：执行自然连接。
     ```sql
     SELECT * FROM table1 NATURAL JOIN table2;
     ```

5. `NCHAR`:
   - 解释：`NCHAR` 是用于指定 Unicode 字符的定长字符数据类型。
   - 示例：创建一个 `NCHAR` 类型的列。
     ```sql
     CREATE TABLE my_table (
         my_column NCHAR(10)
     );
     ```

6. `NDB`:
   - 解释：`NDB` 是 MySQL 中 NDB 存储引擎的名称。
   - 示例：在创建表时指定使用 NDB 存储引擎。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         name VARCHAR(50)
     ) ENGINE=NDB;
     ```

7. `NDBCLUSTER`:
   - 解释：`NDBCLUSTER` 是 MySQL 中 NDB 集群存储引擎的名称。
   - 示例：创建一个使用 NDB 集群存储引擎的表格。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         name VARCHAR(50)
     ) ENGINE=NDBCLUSTER;
     ```

8. `NESTED`:
   - 解释：`NESTED` 关键字用于表示嵌套表达式，通常用于查询中。
   - 示例：使用嵌套查询获取员工的详细信息。
     ```sql
     SELECT * FROM employees WHERE department_id IN (SELECT department_id FROM departments WHERE location_id = 1700);
     ```

9. `NETWORK_NAMESPACE`:
   - 解释：`NETWORK_NAMESPACE` 是一个 MySQL 8.0.16 新增的关键字，用于指定网络命名空间。
   - 示例：在创建存储过程时使用网络命名空间。
     ```sql
     CREATE PROCEDURE my_procedure () 
     SQL SECURITY INVOKER
     BEGIN
         DECLARE v_network_namespace VARCHAR(50) DEFAULT 'my_network_namespace';
         -- 你的存储过程逻辑
     END;
     ```

10. `NEVER`:
    - 解释：`NEVER` 关键字用于指定一个条件永远不会为真。
    - 示例：使用 `NEVER` 条件来确保触发器永远不会被激活。
      ```sql
      CREATE TRIGGER my_trigger BEFORE INSERT ON my_table
      FOR EACH ROW
      BEGIN
          IF NEW.column_name = 'value' THEN
              SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This trigger should never activate';
          END IF;
      END;
      ```

11. `NEW`:
    - 解释：`NEW` 关键字在触发器中用于引用插入、更新或删除操作中的新行的值。
    - 示例：在触发器中使用 `NEW` 关键字设置默认值。
      ```sql
      CREATE TRIGGER my_trigger BEFORE INSERT ON my_table
      FOR EACH ROW
      BEGIN
          IF NEW.column_name IS NULL THEN
              SET NEW.column_name = 'default_value';
          END IF;
      END;
      ```

12. `NEXT`:
    - 解释：`NEXT` 关键字通常用于指定序列中的下一个值。
    - 示例：获取序列的下一个值。
      ```sql
      SELECT NEXT VALUE FOR my_sequence;
      ```

13. `NO`:
    - 解释：`NO` 关键字通常用于否定操作或设置选项。
    - 示例：禁用外键约束检查。
      ```sql
      SET FOREIGN_KEY_CHECKS = 0;
      ```

14. `NODEGROUP`:
    - 解释：`NODEGROUP` 关键字用于指定表的节点组，通常在 NDB 集群中使用。
    - 示例：创建一个使用指定节点组的表。
      ```sql
      CREATE TABLE my_table (
          id INT PRIMARY KEY,
          name VARCHAR(50)
      ) ENGINE=NDBCLUSTER NODEGROUP=node_group_name;
      ```

15. `NONE`:
    - 解释：`NONE` 关键字通常用于表示无或不适用的选项。
    - 示例：创建一个使用无索引的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          name VARCHAR(50),
          INDEX(id) ALGORITHM=NONE
      );
      ```

16. `NOT`:
    - 解释：`NOT` 关键字用于否定条件。
    - 示例：使用 `NOT` 条件查询未满足特定条件的行。
      ```sql
      SELECT * FROM my_table WHERE NOT column_name = 'value';
      ```

17. `NOWAIT`:
    - 解释：`NOWAIT` 是在 MySQL 8.0.1 中添加的关键字，用于指示不要等待锁定资源，而是立即返回。
    - 示例：尝试获取表的排他锁而不等待。
      ```sql
      LOCK TABLES my_table WRITE NOWAIT;
      ```

18. `NO_WRITE_TO_BINLOG`:
    - 解释：`NO_WRITE_TO_BINLOG` 关键字用于指示不将语句写入二进制日志中。
    - 示例：执行一条不记录到二进制日志的更新语句。
      ```sql
      UPDATE my_table SET column_name = 'new_value' NO_WRITE_TO_BINLOG;
      ```

14. `NODEGROUP`:
    - 解释：`NODEGROUP` 关键字用于将表的分区关联到特定的节点组。
    - 示例：创建一个分区表并将其关联到特定的节点组。
      ```sql
      CREATE TABLE my_partitioned_table (
          id INT,
          name VARCHAR(50)
      ) PARTITION BY HASH(id)
      PARTITIONS 4
      NODEGROUP group1;
      ```

18. `NO_WAIT`:
    - 解释：`NO_WAIT` 是 `NOWAIT` 的另一种拼写方式，用于在执行锁定操作时立即返回而不等待。
    - 示例：类似于 `NOWAIT`，尝试获取锁并立即返回。
      ```sql
      SELECT * FROM my_table WHERE id = 1 FOR UPDATE NO_WAIT;
      ```

19. `NO_WRITE_TO_BINLOG`:
    - 解释：`NO_WRITE_TO_BINLOG` 关键字用于指示某些操作不要将数据写入二进制日志。
    - 示例：在执行某些操作时不将其写入二进制日志。
      ```sql
      INSERT /*+ NO_WRITE_TO_BINLOG */ INTO my_table (id, name) VALUES (1, 'John');
      ```

20. `NULL`:
    - 解释：`NULL` 是表示缺失值或未知值的特殊关键字。
    - 示例：将列的值设置为 `NULL`。
      ```sql
      INSERT INTO my_table (id, name) VALUES (1, NULL);
      ```

21. `NTH_VALUE`:
    - 解释：`NTH_VALUE` 函数用于返回指定位置的值，用于分析窗口函数中。
    - 示例：使用 `NTH_VALUE` 函数返回第二个最高销售额。
      ```sql
      SELECT department, sales, 
             NTH_VALUE(sales, 2) OVER (ORDER BY sales DESC) AS second_highest_sales
      FROM sales_data;
      ```

22. `NTILE`:
    - 解释：`NTILE` 函数用于将排序结果分割成指定数量的桶，每个桶中的行数尽可能相等。
    - 示例：将员工按薪水分成四个桶。
      ```sql
      SELECT name, salary, NTILE(4) OVER (ORDER BY salary) AS quartile
      FROM employees;
      ```

23. `NULLS`:
    - 解释：`NULLS` 关键字通常与 `ORDER BY` 子句一起使用，用于指定 `NULL` 值在排序中的位置。
    - 示例：将 `NULL` 值放在排序结果的末尾。
      ```sql
      SELECT * FROM my_table ORDER BY column_name NULLS LAST;
      ```

24. `NUMBER`:
    - 解释：`NUMBER` 是一个数据类型，表示数字，通常用于存储数值数据。
    - 示例：创建一个 `NUMBER` 类型的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          quantity NUMBER
      );
      ```

25. `NUMERIC`:
    - 解释：`NUMERIC` 是一个精确数值类型，用于存储固定精度和小数位数的数字。
    - 示例：创建一个 `NUMERIC` 类型的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          price NUMERIC(10, 2)
      );
      ```

26. `NVARCHAR`:
    - 解释：`NVARCHAR` 是一个变长 Unicode 字符数据类型，用于存储字符数据。
    - 示例：创建一个 `NVARCHAR` 类型的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          description NVARCHAR(100)
      );
      ```

## O
 
- `OF` (R); added in 8.0.1 (reserved)
- `OFF`; added in 8.0.20 (nonreserved)
- `OFFSET`
- `OJ`; added in 8.0.16 (nonreserved)
- `OLD`; added in 8.0.14 (nonreserved)
- `ON` (R)
- `ONE`
- `ONLY`
- `OPEN`
- `OPTIMIZE` (R)
- `OPTIMIZER_COSTS` (R)
- `OPTION` (R)
- `OPTIONAL`; added in 8.0.13 (nonreserved)
- `OPTIONALLY` (R)
- `OPTIONS`
- `OR` (R)
- `ORDER` (R)
- `ORDINALITY`; added in 8.0.4 (nonreserved)
- `ORGANIZATION`; added in 8.0.4 (nonreserved)
- `OTHERS`; added in 8.0.2 (nonreserved)
- `OUT` (R)
- `OUTER` (R)
- `OUTFILE` (R)
- `OVER` (R); added in 8.0.2 (reserved)
- `OWNER`

### 给出解释和例子

1. `OF`:
   - 解释：`OF` 是用于指定数据库对象的限定符，在引用对象时使用。
   - 示例：查询某个表的列。
     ```sql
     SELECT column_name FROM table_name OF database_name;
     ```

2. `OFF`:
   - 解释：`OFF` 是一个选项，通常用于关闭某些功能或设置。
   - 示例：关闭二进制日志。
     ```sql
     SET GLOBAL binary_log = 'OFF';
     ```

3. `OFFSET`:
   - 解释：`OFFSET` 是用于指定查询结果的偏移量的关键字，通常与 `LIMIT` 一起使用。
   - 示例：获取查询结果的第 11 到 20 行。
     ```sql
     SELECT * FROM my_table LIMIT 10 OFFSET 10;
     ```

4. `OJ`:
   - 解释：`OJ` 是指外连接操作符，用于执行外连接。
   - 示例：执行外连接。
     ```sql
     SELECT * FROM table1 OJ table2 ON table1.id = table2.id;
     ```

5. `OLD`:
   - 解释：`OLD` 是在触发器中引用旧的插入、更新或删除的行的伪行。
   - 示例：在触发器中使用 `OLD` 引用旧的更新前的行。
     ```sql
     CREATE TRIGGER my_trigger BEFORE UPDATE ON my_table
     FOR EACH ROW
     BEGIN
         INSERT INTO log_table (log_message) VALUES ('Row updated with ID: ' || OLD.id);
     END;
     ```

6. `ON`:
   - 解释：`ON` 通常用于指定条件、连接条件或触发器执行时机等。
   - 示例：在创建触发器时指定触发时机。
     ```sql
     CREATE TRIGGER my_trigger BEFORE INSERT ON my_table
     FOR EACH ROW
     BEGIN
         -- 触发器逻辑
     END;
     ```

7. `ONE`:
   - 解释：`ONE` 是一个数量词，通常用于指定一个值。
   - 示例：查询具有唯一值的列。
     ```sql
     SELECT * FROM my_table WHERE column_name = 'value' LIMIT 1;
     ```

8. `ONLY`:
   - 解释：`ONLY` 通常用于限定某些操作只作用于指定对象。
   - 示例：删除表中的所有数据，但不删除表本身。
     ```sql
     DELETE FROM my_table ONLY;
     ```

9. `OPEN`:
   - 解释：`OPEN` 通常用于打开游标。
   - 示例：打开一个名为 `my_cursor` 的游标。
     ```sql
     OPEN my_cursor;
     ```

10. `OPTIMIZE`:
    - 解释：`OPTIMIZE` 是一个优化关键字，用于优化表或查询的性能。
    - 示例：优化表格以提高查询性能。
      ```sql
      OPTIMIZE TABLE my_table;
      ```

11. `OPTIMIZER_COSTS`:
    - 解释：`OPTIMIZER_COSTS` 是一个用于控制优化器成本估算的选项。
    - 示例：启用优化器成本估算。
      ```sql
      SET OPTIMIZER_COSTS = ON;
      ```

12. `OPTION`:
    - 解释：`OPTION` 通常用于指定选项、参数或配置。
    - 示例：使用 `OPTION` 选项在查询中指定提示。
      ```sql
      SELECT * FROM my_table OPTION (MAX_EXECUTION_TIME=1000);
      ```

13. `OPTIONAL`:
    - 解释：`OPTIONAL` 是一个附加的选项，用于指示某些内容是可选的。
    - 示例：指定一个可选参数。
      ```sql
      SELECT * FROM my_table OPTIONAL parameter;
      ```

14. `OPTIONALLY`:
    - 解释：`OPTIONALLY` 通常用于指定某些操作是可选的。
    - 示例：指定可选的列更新。
      ```sql
      UPDATE my_table SET column_name = value OPTIONALLY;
      ```

15. `OPTIONS`:
    - 解释：`OPTIONS` 是一个通用选项关键字，用于指定附加选项或配置。
    - 示例：指定一些其他的查询选项。
      ```sql
      SELECT * FROM my_table OPTIONS (key1='value1', key2='value2');
      ```

16. `OR`:
    - 解释：`OR` 是一个逻辑操作符，用于组合多个条件。
    - 示例：查询满足条件1或条件2的行。
      ```sql
      SELECT * FROM my_table WHERE condition1 OR condition2;
      ```

17. `ORDER`:
    - 解释：`ORDER` 通常与 `BY` 子句一起使用，用于指定排序顺序。
    - 示例：按照某个列对查询结果进行排序。
      ```sql
      SELECT * FROM my_table ORDER BY column_name;
      ```

18. `ORDINALITY`:
    - 解释：`ORDINALITY` 是一个用于返回数组中元素的顺序号的函数。
    - 示例：获取数组中每个元素的顺序号。
      ```sql
      SELECT column_name, ORDINALITY(array_column) AS position FROM my_table;
      ```

19. `ORGANIZATION`:
    - 解释：`ORGANIZATION` 是一个用于指定表的组织方式的关键字。
    - 示例：指定表的存储组织方式。
      ```sql
      CREATE TABLE my_table (
          id INT,
          name VARCHAR(50)
      ) ORGANIZATION ROW;
      ```

20. `OTHERS`:
    - 解释：`OTHERS` 是一个在 CASE 表达式中用于指定其他情况的关键字。
    - 示例：在 CASE 表达式中处理其他情况。
      ```sql
      CASE column_name
          WHEN value1 THEN result1
          WHEN value2 THEN result2
          ELSE 'Other'
      END;
      ```

21. `OUT`:
    - 解释：`OUT` 通常用于指定过程或函数的输出参数。
    - 示例：定义一个输出参数。
      ```sql
      CREATE PROCEDURE my_procedure (OUT param INT)
      BEGIN
      -- 过
      ```
          
22. `OUTER`:
    - 解释：`OUTER` 通常用于指定外连接，例如左外连接、右外连接。
    - 示例：执行左外连接。
      ```sql
      SELECT * FROM table1 LEFT OUTER JOIN table2 ON table1.id = table2.id;
      ```

23. `OUTFILE`:
    - 解释：`OUTFILE` 是一个用于将查询结果写入文件的关键字。
    - 示例：将查询结果写入文件。
      ```sql
      SELECT * FROM my_table INTO OUTFILE 'result.txt';
      ```

24. `OVER`:
    - 解释：`OVER` 通常用于指定窗口函数的窗口规范。
    - 示例：使用 `OVER` 定义窗口规范。
      ```sql
      SELECT column1, SUM(column2) OVER (PARTITION BY column3 ORDER BY column4) AS running_total
      FROM my_table;
      ```

25. `OWNER`:
    - 解释：`OWNER` 是指数据库对象的所有者或创建者。
    - 示例：查看表的所有者。
      ```sql
      SHOW TABLE STATUS LIKE 'my_table';
      ```

## P
 
- `PACK_KEYS`
- `PAGE`
- `PARSER`
- `PARTIAL`
- `PARTITION` (R)
- `PARTITIONING`
- `PARTITIONS`
- `PASSWORD`
- `PASSWORD_LOCK_TIME`; added in 8.0.19 (nonreserved)
- `PATH`; added in 8.0.4 (nonreserved)
- `PERCENT_RANK` (R); added in 8.0.2 (reserved)
- `PERSIST`; became nonreserved in 8.0.16
- `PERSIST_ONLY`; added in 8.0.2 (reserved); became nonreserved in 8.0.16
- `PHASE`
- `PLUGIN`
- `PLUGINS`
- `PLUGIN_DIR`
- `POINT`
- `POLYGON`
- `PORT`
- `PRECEDES`
- `PRECEDING`; added in 8.0.2 (nonreserved)
- `PRECISION` (R)
- `PREPARE`
- `PRESERVE`
- `PREV`
- `PRIMARY` (R)
- `PRIVILEGES`
- `PRIVILEGE_CHECKS_USER`; added in 8.0.18 (nonreserved)
- `PROCEDURE` (R)
- `PROCESS`; added in 8.0.11 (nonreserved)
- `PROCESSLIST`
- `PROFILE`
- `PROFILES`
- `PROXY`
- `PURGE` (R)

### 给出解释和例子

1. `PACK_KEYS`:
   - 解释：`PACK_KEYS` 是一个表选项，用于指定表格索引如何被压缩和打包。
   - 示例：在创建表时指定 `PACK_KEYS` 选项。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) PACK_KEYS = 1;
     ```

2. `PAGE`:
   - 解释：`PAGE` 是 MySQL InnoDB 存储引擎中的一个概念，表示数据文件的一个页面。
   - 示例：查找 InnoDB 存储引擎的页面大小。
     ```sql
     SHOW VARIABLES LIKE 'innodb_page_size';
     ```

3. `PARSER`:
   - 解释：`PARSER` 是一个用于指定解析器的关键字，通常用于指定特定的 SQL 语法解析器。
   - 示例：指定使用特定的解析器。
     ```sql
     SET PARSER my_parser;
     ```

4. `PARTIAL`:
   - 解释：`PARTIAL` 是一个关键字，通常用于描述部分操作或部分结果。
   - 示例：创建部分索引。
     ```sql
     CREATE INDEX my_index ON my_table (column_name) WHERE condition;
     ```

5. `PARTITION`:
   - 解释：`PARTITION` 是用于创建分区表的关键字，可以将表分成多个逻辑部分。
   - 示例：创建一个按日期范围分区的表。
     ```sql
     CREATE TABLE sales (
         id INT,
         amount DECIMAL(10,2),
         sale_date DATE
     ) PARTITION BY RANGE (YEAR(sale_date)) (
         PARTITION p1 VALUES LESS THAN (2010),
         PARTITION p2 VALUES LESS THAN (2015),
         PARTITION p3 VALUES LESS THAN MAXVALUE
     );
     ```

6. `PARTITIONING`:
   - 解释：`PARTITIONING` 是一个关键字，用于指定分区表的分区策略。
   - 示例：指定分区表的分区策略。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) PARTITION BY HASH(id) PARTITIONS 4;
     ```

7. `PARTITIONS`:
   - 解释：`PARTITIONS` 是一个关键字，用于指定分区表的分区数量。
   - 示例：创建一个包含四个分区的表。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) PARTITION BY HASH(id) PARTITIONS 4;
     ```

8. `PASSWORD`:
   - 解释：`PASSWORD` 是一个关键字，通常用于设置或更改用户密码。
   - 示例：更改用户密码。
     ```sql
     ALTER USER 'user'@'host' IDENTIFIED BY 'new_password';
     ```

9. `PASSWORD_LOCK_TIME`:
   - 解释：`PASSWORD_LOCK_TIME` 是一个用于指定密码锁定时间的关键字，用于安全策略。
   - 示例：设置密码锁定时间为 10 分钟。
     ```sql
     SET PASSWORD_LOCK_TIME = 600;
     ```

10. `PATH`:
    - 解释：`PATH` 是一个关键字，通常用于指定文件路径或搜索路径。
    - 示例：指定文件路径。
      ```sql
      LOAD DATA INFILE '/path/to/file.csv' INTO TABLE my_table;
      ```

11. `PERCENT_RANK`:
    - 解释：`PERCENT_RANK` 是一个分析函数，用于计算某行在排序结果中的百分比排名。
    - 示例：计算每个销售额的百分比排名。
      ```sql
      SELECT sales, PERCENT_RANK() OVER (ORDER BY sales) AS percent_rank
      FROM sales_data;
      ```

12. `PERSIST`:
    - 解释：`PERSIST` 是一个选项，用于指定是否将特定配置或设置永久保存。
    - 示例：设置参数永久保存。
      ```sql
      SET PERSIST max_connections = 100;
      ```

13. `PERSIST_ONLY`:
    - 解释：`PERSIST_ONLY` 是一个选项，用于指定仅将特定配置或设置永久保存，但不应用于当前会话。
    - 示例：设置参数仅在重新启动后永久保存。
      ```sql
      SET PERSIST_ONLY max_connections = 100;
      ```

14. `PHASE`:
    - 解释：`PHASE` 是一个关键字，通常用于描述操作的阶段或步骤。
    - 示例：执行备份操作的不同阶段。
      ```sql
      BACKUP DATABASE my_database PHASE=ALL;
      ```

15. `PLUGIN`:
    - 解释：`PLUGIN` 是一个关键字，用于管理 MySQL 中的插件。
    - 示例：安装新的插件。
      ```sql
      INSTALL PLUGIN my_plugin SONAME 'my_plugin.so';
      ```

16. `PLUGINS`:
    - 解释：`PLUGINS` 是一个关键字，用于列出安装的插件。
    - 示例：列出已安装的插件。
      ```sql
      SHOW PLUGINS;
      ```

17. `PLUGIN_DIR`:
    - 解释：`PLUGIN_DIR` 是一个用于指定插件目录的关键字。
    - 示例：指定插件的安装目录。
      ```sql
      SET GLOBAL PLUGIN_DIR = '/path/to/plugins';
      ```

18. `POINT`:
    - 解释：`POINT` 是一个几何数据类型，表示二维点。
    - 示例：创建一个 `POINT` 类型的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          location POINT
      );
      ```

19. `POLYGON`:
    - 解释：`POLYGON` 是一个几何数据类型，表示一个多边形。
    - 示例：创建一个 `POLYGON` 类型的列。
      ```sql
      CREATE TABLE my_table (
          id INT,
          area POLYGON
      );
      ```

20. `PORT`:
    - 解释：`PORT` 是一个用于指定连接端口的关键字，通常用于连接数据库服务器。
    - 示例：连接到 MySQL 服务器的特定端口。

21. `PRECEDES`:
    - 解释：`PRECEDES` 是一个用于比较两个值的相对顺序的关键字，通常用于排序或比较操作。
    - 示例：比较两个日期的先后顺序。
      ```sql
      SELECT * FROM events WHERE event_date1 PRECEDES event_date2;
      ```

22. `PRECEDING`:
    - 解释：`PRECEDING` 是一个用于指定窗口函数中的行或范围的关键字，通常用于指定相对位置。
    - 示例：指定窗口函数的行范围为当前行之前的两行。
      ```sql
      SELECT value, SUM(value) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS sum_values
      FROM my_table;
      ```

23. `PRECISION`:
    - 解释：`PRECISION` 是一个与数值数据类型相关的关键字，通常用于指定数值的精度。
    - 示例：创建一个 DECIMAL 类型的列，并指定精度为 10 位。
      ```sql
      CREATE TABLE my_table (
          id INT,
          amount DECIMAL(10, 2)
      );
      ```

24. `PREPARE`:
    - 解释：`PREPARE` 是一个用于准备执行动态 SQL 语句的关键字，通常与 `EXECUTE` 结合使用。
    - 示例：准备执行一个动态 SQL 语句。
      ```sql
      PREPARE stmt FROM 'SELECT * FROM my_table WHERE id = ?';
      EXECUTE stmt USING @id;
      ```

25. `PRESERVE`:
    - 解释：`PRESERVE` 是一个关键字，通常用于指示某些操作应保持或保留某些特性。
    - 示例：创建一个保留表的备份。
      ```sql
      CREATE TABLE backup_table LIKE original_table PRESERVE ROW FORMAT;
      ```

26. `PREV`:
    - 解释：`PREV` 是一个用于引用前一行数据的伪行，在某些情况下可用于触发器或窗口函数中。
    - 示例：在触发器中使用 `PREV` 引用前一行的数据。
      ```sql
      CREATE TRIGGER my_trigger BEFORE UPDATE ON my_table
      FOR EACH ROW
      BEGIN
          INSERT INTO log_table (log_message) VALUES ('Previous value of column: ' || PREV.column_name);
      END;
      ```

27. `PRIMARY`:
    - 解释：`PRIMARY` 是一个关键字，通常用于指定主键约束或主键索引。
    - 示例：在创建表时指定主键。
      ```sql
      CREATE TABLE my_table (
          id INT PRIMARY KEY,
          name VARCHAR(50)
      );
      ```

28. `PRIVILEGES`:
    - 解释：`PRIVILEGES` 是一个关键字，用于指定数据库或表的权限。
    - 示例：授予用户对特定表的查询权限。
      ```sql
      GRANT SELECT ON my_table TO 'user'@'localhost';
      ```

29. `PRIVILEGE_CHECKS_USER`:
    - 解释：`PRIVILEGE_CHECKS_USER` 是一个用于指定特定用户进行权限检查的选项。
    - 示例：将权限检查委托给指定的用户。
      ```sql
      SET GLOBAL PRIVILEGE_CHECKS_USER = 'admin'@'localhost';
      ```

30. `PROCEDURE`:
    - 解释：`PROCEDURE` 是一个关键字，用于定义存储过程。
    - 示例：创建一个简单的存储过程。
      ```sql
      CREATE PROCEDURE my_procedure()
      BEGIN
          SELECT 'Hello, World!';
      END;
      ```

31. `PROCESS`:
    - 解释：`PROCESS` 是一个用于表示 MySQL 进程的关键字。
    - 示例：列出当前运行的 MySQL 进程。
      ```sql
      SHOW PROCESSLIST;
      ```

32. `PROCESSLIST`:
    - 解释：`PROCESSLIST` 是一个用于查看 MySQL 当前活动进程的关键字。
    - 示例：查看当前 MySQL 进程列表。
      ```sql
      SHOW PROCESSLIST;
      ```

33. `PROFILE`:
    - 解释：`PROFILE` 是一个用于启用查询分析功能的关键字，用于查看查询执行计划和性能统计信息。
    - 示例：分析查询执行计划。
      ```sql
      EXPLAIN SELECT * FROM my_table;
      ```

34. `PROFILES`:
    - 解释：`PROFILES` 是一个用于列出查询分析配置文件的关键字。
    - 示例：查看当前配置的查询分析配置文件。
      ```sql
      SHOW PROFILES;
      ```

35. `PROXY`:
    - 解释：`PROXY` 是一个用于代理访问或操作的关键字。
    - 示例：配置 MySQL 代理。
      ```sql
      SET GLOBAL PROXY_USERS = 'user1'@'host1', 'user2'@'host2';
      ```

36. `PURGE`:
    - 解释：`PURGE` 是一个关键字，通常用于清除或删除不需要的数据或对象。
    - 示例：清除二进制日志。
      ```sql
      PURGE BINARY LOGS BEFORE '2023-01-01 00:00:00';
      ```

## Q
 
- `QUARTER`
- `QUERY`
- `QUICK`

### 给出解释和例子 

1. `QUARTER`:
   - 解释：`QUARTER` 是一个用于提取日期的季度部分的函数。它返回一个整数，表示给定日期所在的季度（1 到 4）。
   - 示例：查询每个销售发生的季度。
     ```sql
     SELECT sale_date, QUARTER(sale_date) AS quarter FROM sales_data;
     ```

2. `QUERY`:
   - 解释：`QUERY` 是一个通用关键字，表示查询操作。在 SQL 中，它用于指代对数据库的检索或操作。
   - 示例：执行一个简单的查询操作。
     ```sql
     SELECT * FROM my_table WHERE condition;
     ```

3. `QUICK`:
   - 解释：`QUICK` 是一个选项或参数，通常用于 MySQL 查询操作中，用于提高查询速度，但可能牺牲一些准确性。
   - 示例：在 `SELECT` 查询中使用 `QUICK` 选项以加快检索速度。
     ```sql
     SELECT QUICK * FROM my_table WHERE condition;
     ```

## R
 
- `RANDOM`; added in 8.0.18 (nonreserved)
- `RANGE` (R)
- `RANK` (R); added in 8.0.2 (reserved)
- `READ` (R)
- `READS` (R)
- `READ_ONLY`
- `READ_WRITE` (R)
- `REAL` (R)
- `REBUILD`
- `RECOVER`

### 给出解释和例子 

1. `RANDOM`:
   - 解释：`RANDOM` 是一个用于生成随机数的函数，在 MySQL 8.0.18 中添加。它返回一个在指定范围内的随机数。
   - 示例：生成一个 1 到 100 之间的随机数。
     ```sql
     SELECT RAND() * 100 AS random_number;
     ```

2. `RANGE`:
   - 解释：`RANGE` 是用于指定范围条件的关键字，通常与 `BETWEEN` 或 `IN` 运算符一起使用。
   - 示例：查询销售额在特定范围内的订单。
     ```sql
     SELECT * FROM sales WHERE amount RANGE BETWEEN 1000 AND 2000;
     ```

3. `RANK`:
   - 解释：`RANK` 是一个分析函数，用于为结果集中的行分配排名。在 MySQL 8.0.2 中添加。
   - 示例：为销售额按照金额排名。
     ```sql
     SELECT sale_id, amount, RANK() OVER (ORDER BY amount DESC) AS rank FROM sales_data;
     ```

4. `READ`:
   - 解释：`READ` 是一个关键字，通常用于指定读取数据的操作或权限。
   - 示例：使用 `READ` 锁来防止其他事务修改数据。
     ```sql
     SELECT * FROM my_table FOR READ;
     ```

5. `READS`:
   - 解释：`READS` 是一个关键字，通常用于指定事务的隔离级别或权限。
   - 示例：设置事务的隔离级别为 `READ COMMITTED`。
     ```sql
     SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
     ```

6. `READ_ONLY`:
   - 解释：`READ_ONLY` 是一个关键字，通常用于指定数据库连接的只读模式。
   - 示例：设置数据库连接为只读模式。
     ```sql
     SET GLOBAL read_only = ON;
     ```

7. `READ_WRITE`:
   - 解释：`READ_WRITE` 是一个关键字，通常用于指定数据库连接的读写模式。
   - 示例：设置数据库连接为读写模式。
     ```sql
     SET GLOBAL read_only = OFF;
     ```

8. `REAL`:
   - 解释：`REAL` 是一个数据类型，用于存储单精度浮点数。
   - 示例：创建一个 `REAL` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         value REAL
     );
     ```

9. `REBUILD`:
   - 解释：`REBUILD` 是一个关键字，通常用于重新构建索引或其他数据库对象。
   - 示例：重建表的索引。
     ```sql
     ALTER TABLE my_table REBUILD INDEX my_index;
     ```

10. `RECOVER`:
    - 解释：`RECOVER` 是一个关键字，通常用于恢复数据库中的损坏或丢失的数据。
    - 示例：尝试从错误中恢复数据库。
      ```sql
      RECOVER DATABASE my_database;
      ```


- `RECURSIVE` (R); added in 8.0.1 (reserved)
- `REDOFILE`; removed in 8.0.3
- `REDO_BUFFER_SIZE`
- `REDUNDANT`
- `REFERENCE`; added in 8.0.4 (nonreserved)
- `REFERENCES` (R)
- `REGEXP` (R)
- `RELAY`


11. `RECOVER`:
   - 解释：`RECOVER` 是一个关键字，通常用于恢复数据库或数据，以使其恢复到正常状态。
   - 示例：执行数据库恢复操作。
     ```sql
     RECOVER DATABASE my_database;
     ```

12. `RECURSIVE`:
   - 解释：`RECURSIVE` 是一个关键字，用于在 SQL 中定义递归查询或递归操作，允许查询或操作自身的结果。
   - 示例：执行递归查询以获取员工及其所有下属的层次结构。
     ```sql
     WITH RECURSIVE EmployeeHierarchy AS (
         SELECT emp_id, emp_name, manager_id FROM employees WHERE emp_id = 1
         UNION ALL
         SELECT e.emp_id, e.emp_name, e.manager_id FROM employees e
         JOIN EmployeeHierarchy eh ON e.manager_id = eh.emp_id
     )
     SELECT * FROM EmployeeHierarchy;
     ```

13. `REDO_BUFFER_SIZE`:
   - 解释：`REDO_BUFFER_SIZE` 是一个用于配置 MySQL InnoDB 存储引擎的重做日志缓冲区大小的参数。
   - 示例：设置重做日志缓冲区大小为 64MB。
     ```sql
     SET GLOBAL innodb_redo_log_buffer_size = 64M;
     ```

14. `REDUNDANT`:
   - 解释：`REDUNDANT` 是一个关键字，通常用于描述数据冗余或冗余信息。
   - 示例：在创建表时指定数据冗余选项。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50),
         PRIMARY KEY (id) REDUNDANT
     );
     ```

15. `REFERENCE`:
   - 解释：`REFERENCE` 是一个关键字，通常用于指定外键约束。
   - 示例：创建一个带有外键约束的表。
     ```sql
     CREATE TABLE orders (
         order_id INT,
         customer_id INT,
         FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
     );
     ```

16. `REFERENCES`:
   - 解释：`REFERENCES` 是一个关键字，通常用于指定外键约束。
   - 示例：创建一个带有外键约束的表。
     ```sql
     CREATE TABLE orders (
         order_id INT,
         customer_id INT,
         FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
     );
     ```

17. `REGEXP`:
   - 解释：`REGEXP` 是一个用于在 SQL 中进行正则表达式匹配的运算符。
   - 示例：查找名字以 "J" 开头的所有员工。
     ```sql
     SELECT * FROM employees WHERE emp_name REGEXP '^J';
     ```

18. `RELAY`:
   - 解释：`RELAY` 是一个用于描述中继日志或中继文件的关键字，通常与 MySQL 复制相关。
   - 示例：查看中继日志信息。
     ```sql
     SHOW RELAYLOG EVENTS;
     ```

- `RELAYLOG`
- `RELAY_LOG_FILE`
- `RELAY_LOG_POS`
- `RELAY_THREAD`
- `RELEASE` (R)
- `RELOAD`
- `REMOTE`; added in 8.0.3 (nonreserved); removed in 8.0.14
- `REMOVE`
- `RENAME` (R)
- `REORGANIZE`

19. `RELAYLOG`:
   - 解释：`RELAYLOG` 是 MySQL 复制中使用的中继日志，记录主服务器上已提交的事务，但尚未在从服务器上执行的事务。
   - 示例：查看当前中继日志文件列表。
     ```sql
     SHOW RELAYLOG EVENTS;
     ```

20. `RELAY_LOG_FILE`:
   - 解释：`RELAY_LOG_FILE` 是一个用于指定中继日志文件的参数，通常用于 MySQL 复制配置中。
   - 示例：设置从服务器的中继日志文件。
     ```sql
     CHANGE MASTER TO MASTER_LOG_FILE = 'mysql-bin.000001';
     ```

21. `RELAY_LOG_POS`:
   - 解释：`RELAY_LOG_POS` 是一个用于指定中继日志位置的参数，通常用于 MySQL 复制配置中。
   - 示例：设置从服务器的中继日志位置。
     ```sql
     CHANGE MASTER TO MASTER_LOG_POS = 12345;
     ```

22. `RELAY_THREAD`:
   - 解释：`RELAY_THREAD` 是 MySQL 复制中使用的线程，负责读取主服务器上的二进制日志并将其复制到从服务器。
   - 示例：查看当前的中继线程状态。
     ```sql
     SHOW PROCESSLIST;
     ```

23. `RELEASE`:
   - 解释：`RELEASE` 是一个关键字，通常用于释放锁或资源。
   - 示例：释放表级锁。
     ```sql
     RELEASE LOCKS;
     ```

24. `RELOAD`:
   - 解释：`RELOAD` 是一个关键字，通常用于重新加载 MySQL 的配置或重新加载特定的模块。
   - 示例：重新加载 MySQL 的配置文件。
     ```sql
     FLUSH PRIVILEGES;
     ```

25. `REMOTE`:
   - 解释：`REMOTE` 是一个关键字，通常用于描述远程连接或远程操作。
   - 示例：执行远程查询操作。
     ```sql
     SELECT * FROM remote_database.remote_table;
     ```

26. `REMOVE`:
   - 解释：`REMOVE` 是一个关键字，通常用于从数据结构中删除元素或删除对象。
   - 示例：从列表中删除指定的元素。
     ```sql
     DELETE FROM my_list WHERE value = 'deleted_value';
     ```

27. `RENAME`:
   - 解释：`RENAME` 是一个关键字，通常用于重命名对象或更改对象的名称。
   - 示例：重命名表格。
     ```sql
     RENAME TABLE old_table TO new_table;
     ```

28. `REORGANIZE`:
   - 解释：`REORGANIZE` 是一个关键字，通常用于重新组织或重建数据库对象，以优化性能或修复碎片化。
   - 示例：重新组织表格以优化性能。
     ```sql
     ALTER TABLE my_table REORGANIZE PARTITION;
     ```

- `REPAIR`
- `REPEAT` (R)
- `REPEATABLE`
- `REPLACE` (R)
- `REPLICA`; added in 8.0.22 (nonreserved)
- `REPLICAS`; added in 8.0.22 (nonreserved)
- `REPLICATE_DO_DB`
- `REPLICATE_DO_TABLE`
- `REPLICATE_IGNORE_DB`
- `REPLICATE_IGNORE_TABLE`



29. `REPAIR`:
   - 解释：`REPAIR` 是一个关键字，通常用于修复损坏的表格或索引。
   - 示例：修复损坏的表格。
     ```sql
     REPAIR TABLE my_table;
     ```

30. `REPEAT`:
   - 解释：`REPEAT` 是一个关键字，通常用于执行循环操作。
   - 示例：使用 `REPEAT` 构造循环来执行一系列操作。
     ```sql
     REPEAT
         SET @x = @x + 1;
     UNTIL @x > 10 END REPEAT;
     ```

31. `REPEATABLE`:
   - 解释：`REPEATABLE` 是一个关键字，通常用于设置事务的隔离级别，确保在同一事务内的读取操作会返回一致的结果。
   - 示例：设置事务隔离级别为可重复读。
     ```sql
     SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
     ```

32. `REPLACE`:
   - 解释：`REPLACE` 是一个关键字，用于替换表中的数据行，如果数据行存在则替换，如果不存在则插入新行。
   - 示例：替换表中的数据行。
     ```sql
     REPLACE INTO my_table (id, name) VALUES (1, 'John');
     ```

33. `REPLICA`:
   - 解释：`REPLICA` 是一个关键字，通常用于描述从服务器，即用于复制主服务器的数据的服务器。
   - 示例：执行与从服务器相关的操作。
     ```sql
     SHOW REPLICA STATUS;
     ```

34. `REPLICAS`:
   - 解释：`REPLICAS` 是一个关键字，通常用于描述从服务器的数量，即用于复制主服务器的数据的服务器数量。
   - 示例：设置复制配置以指定从服务器数量。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_PORT = 3306, MASTER_REPLICAS = 3;
     ```

35. `REPLICATE_DO_DB`:
   - 解释：`REPLICATE_DO_DB` 是一个用于指定应复制的数据库的参数，通常用于 MySQL 复制配置中。
   - 示例：设置只复制指定的数据库。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_DO_DB = 'db1';
     ```

36. `REPLICATE_DO_TABLE`:
   - 解释：`REPLICATE_DO_TABLE` 是一个用于指定应复制的表格的参数，通常用于 MySQL 复制配置中。
   - 示例：设置只复制指定的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_DO_TABLE = 'table1';
     ```

37. `REPLICATE_IGNORE_DB`:
   - 解释：`REPLICATE_IGNORE_DB` 是一个用于指定应忽略复制的数据库的参数，通常用于 MySQL 复制配置中。
   - 示例：设置忽略复制的数据库。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_IGNORE_DB = 'db2';
     ```

38. `REPLICATE_IGNORE_TABLE`:
   - 解释：`REPLICATE_IGNORE_TABLE` 是一个用于指定应忽略复制的表格的参数，通常用于 MySQL 复制配置中。
   - 示例：设置忽略复制的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_IGNORE_TABLE = 'table2';
     ```


- `REPLICATE_REWRITE_DB`
- `REPLICATE_WILD_DO_TABLE`
- `REPLICATE_WILD_IGNORE_TABLE`
- `REPLICATION`
- `REQUIRE` (R)
- `REQUIRE_ROW_FORMAT`; added in 8.0.19 (nonreserved)
- `RESET`
- `RESIGNAL` (R)
- `RESOURCE`; added in 8.0.3 (nonreserved)
- `RESPECT`; added in 8.0.2 (nonreserved)



39. `REPLICATE_REWRITE_DB`:
   - 解释：`REPLICATE_REWRITE_DB` 是一个用于在复制过程中重写数据库名称的参数，通常用于 MySQL 复制配置中。
   - 示例：设置复制过程中重写数据库名称。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_REWRITE_DB = 'new_db';
     ```

40. `REPLICATE_WILD_DO_TABLE`:
   - 解释：`REPLICATE_WILD_DO_TABLE` 是一个用于指定应复制的表格模式的参数，通常用于 MySQL 复制配置中。
   - 示例：设置复制指定模式的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_WILD_DO_TABLE = 'db1.table%';
     ```

41. `REPLICATE_WILD_IGNORE_TABLE`:
   - 解释：`REPLICATE_WILD_IGNORE_TABLE` 是一个用于指定应忽略复制的表格模式的参数，通常用于 MySQL 复制配置中。
   - 示例：设置忽略指定模式的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_WILD_IGNORE_TABLE = 'db1.table%';
     ```

42. `REPLICATION`:
   - 解释：`REPLICATION` 是一个关键字，通常用于描述 MySQL 复制过程，即将主服务器上的数据复制到一个或多个从服务器上。
   - 示例：启动 MySQL 复制过程。
     ```sql
     START REPLICA;
     ```

43. `REQUIRE`:
   - 解释：`REQUIRE` 是一个关键字，通常用于指定所需的条件或要求。
   - 示例：创建视图时指定所需的权限。
     ```sql
     CREATE VIEW my_view AS SELECT * FROM my_table REQUIRE VIEW_METADATA_READ;
     ```

44. `REQUIRE_ROW_FORMAT`:
   - 解释：`REQUIRE_ROW_FORMAT` 是一个用于指定所需的行格式的参数，通常用于 MySQL 复制配置中。
   - 示例：设置复制过程中所需的行格式。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REQUIRE_ROW_FORMAT = 'DYNAMIC';
     ```

45. `RESET`:
   - 解释：`RESET` 是一个关键字，通常用于重置特定的 MySQL 服务器变量为其默认值。
   - 示例：重置会话级别的所有变量为默认值。
     ```sql
     RESET SESSION;
     ```

46. `RESIGNAL`:
   - 解释：`RESIGNAL` 是一个关键字，用于重新抛出异常，通常用于异常处理程序中。
   - 示例：在异常处理程序中重新抛出异常。
     ```sql
     BEGIN
         DECLARE custom_exception CONDITION FOR SQLSTATE '45000';
         DECLARE EXIT HANDLER FOR custom_exception
         BEGIN
             RESIGNAL;
         END;
         -- 这里执行一些操作，如果出现异常，则重新抛出
     END;
     ```

47. `RESOURCE`:
   - 解释：`RESOURCE` 是一个关键字，通常用于描述资源或资源管理。
   - 示例：执行资源管理操作。
     ```sql
     CREATE RESOURCE POOL my_pool WITH (MAX_MEMORY = '1G');
     ```

48. `RESPECT`:
   - 解释：`RESPECT` 是一个关键字，用于遵循或尊重特定规则或条件。
   - 示例：创建一个视图时遵循表的引用完整性。
     ```sql
     CREATE VIEW my_view AS SELECT * FROM my_table RESPECT CONSTRAINTS;
     ```

- `RESTART`; added in 8.0.4 (nonreserved)
- `RESTORE`
- `RESTRICT` (R)
- `RESUME`
- `RETAIN`; added in 8.0.14 (nonreserved)
- `RETURN` (R)
- `RETURNED_SQLSTATE`
- `RETURNING`; added in 8.0.21 (nonreserved)
- `RETURNS`
- `REUSE`; added in 8.0.3 (nonreserved)



39. `REPLICATE_REWRITE_DB`:
   - 解释：`REPLICATE_REWRITE_DB` 是一个用于指定复制操作中要重写的数据库名称的参数，通常用于 MySQL 复制配置中。
   - 示例：配置复制操作以重写数据库名称。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_REWRITE_DB = 'db_rewrite';
     ```

40. `REPLICATE_WILD_DO_TABLE`:
   - 解释：`REPLICATE_WILD_DO_TABLE` 是一个用于指定应复制的通配符表格的参数，通常用于 MySQL 复制配置中。
   - 示例：设置复制操作以复制满足通配符条件的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_WILD_DO_TABLE = 'db1.table%';
     ```

41. `REPLICATE_WILD_IGNORE_TABLE`:
   - 解释：`REPLICATE_WILD_IGNORE_TABLE` 是一个用于指定应忽略复制的通配符表格的参数，通常用于 MySQL 复制配置中。
   - 示例：设置复制操作以忽略满足通配符条件的表格。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server', MASTER_REPLICATE_WILD_IGNORE_TABLE = 'db2.table%';
     ```

42. `REPLICATION`:
   - 解释：`REPLICATION` 是一个用于描述数据库复制过程的关键字，指的是将主服务器上的更改同步到一个或多个从服务器的过程。
   - 示例：设置主服务器以允许复制操作。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'master_server';
     ```

43. `REQUIRE`:
   - 解释：`REQUIRE` 是一个关键字，通常用于指定外部依赖条件，例如存储过程的编译条件。
   - 示例：在存储过程中指定编译条件。
     ```sql
     CREATE PROCEDURE my_procedure()
     SQL SECURITY DEFINER
     COMMENT 'This is my procedure'
     LANGUAGE SQL
     NOT DETERMINISTIC
     CONTAINS SQL
     SQL SECURITY DEFINER
     SQL SECURITY DEFINER
     BEGIN
         -- Procedure body
     END;
     ```

44. `REQUIRE_ROW_FORMAT`:
   - 解释：`REQUIRE_ROW_FORMAT` 是一个用于指定存储引擎行格式的参数，通常用于 MySQL 表格创建或修改中。
   - 示例：设置表格的行格式要求。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) ENGINE = InnoDB ROW_FORMAT = COMPRESSED;
     ```

45. `RESET`:
   - 解释：`RESET` 是一个关键字，通常用于重置特定的服务器参数或会话变量为其默认值。
   - 示例：重置会话变量为默认值。
     ```sql
     RESET SESSION my_variable;
     ```

46. `RESIGNAL`:
   - 解释：`RESIGNAL` 是一个关键字，通常用于重新引发异常，用于处理异常情况。
   - 示例：重新引发异常。
     ```sql
     DECLARE my_exception CONDITION FOR SQLSTATE 'HY000';
     SIGNAL my_exception SET MESSAGE_TEXT = 'Custom error message';
     ```

47. `RESOURCE`:
   - 解释：`RESOURCE` 是一个关键字，通常用于描述数据库资源或资源管理。
   - 示例：管理数据库资源。
     ```sql
     ALTER RESOURCE GROUP my_group ADD THREAD_PRIORITY 1;
     ```

48. `RESPECT`:
   - 解释：`RESPECT` 是一个关键字，通常用于表示遵循某些条件或规则。
   - 示例：在权限管理中使用 `RESPECT` 选项。
     ```sql
     GRANT SELECT ON my_table TO 'user'@'localhost' WITH GRANT OPTION RESPECT QUOTA;
     ```


- `REVERSE`
- `REVOKE` (R)
- `RIGHT` (R)
- `RLIKE` (R)
- `ROLE`; became nonreserved in 8.0.1
- `ROLLBACK`
- `ROLLUP`
- `ROTATE`
- `ROUTINE`
- `ROW` (R); became reserved in 8.0.2



49. `REVERSE`:
   - 解释：`REVERSE` 是一个函数，用于将字符串反转。
   - 示例：反转字符串。
     ```sql
     SELECT REVERSE('hello'); -- Output: 'olleh'
     ```

50. `REVOKE`:
   - 解释：`REVOKE` 是一个关键字，用于撤销对数据库对象的权限授予。
   - 示例：撤销对用户的某些权限。
     ```sql
     REVOKE SELECT, INSERT ON my_table FROM 'user'@'localhost';
     ```

51. `RIGHT`:
   - 解释：`RIGHT` 是一个字符串函数，用于从字符串的右侧返回指定数量的字符。
   - 示例：从字符串右侧返回指定数量的字符。
     ```sql
     SELECT RIGHT('MySQL', 3); -- Output: 'SQL'
     ```

52. `RLIKE`:
   - 解释：`RLIKE` 是一个操作符，用于执行正则表达式匹配，类似于 `REGEXP`。
   - 示例：使用正则表达式匹配操作符。
     ```sql
     SELECT * FROM my_table WHERE column RLIKE '^A';
     ```

53. `ROLE`:
   - 解释：`ROLE` 是一个关键字，用于定义数据库角色，管理和分配权限。
   - 示例：创建一个数据库角色。
     ```sql
     CREATE ROLE my_role;
     ```

54. `ROLLBACK`:
   - 解释：`ROLLBACK` 是一个关键字，用于取消当前事务中的所有未提交更改。
   - 示例：回滚当前事务。
     ```sql
     ROLLBACK;
     ```

55. `ROLLUP`:
   - 解释：`ROLLUP` 是一个关键字，用于在聚合查询中生成一系列子总计行。
   - 示例：使用 `ROLLUP` 生成聚合查询的子总计。
     ```sql
     SELECT column1, SUM(column2) FROM my_table GROUP BY column1 WITH ROLLUP;
     ```

56. `ROTATE`:
   - 解释：`ROTATE` 是一个函数，用于将字符串中的字符向左旋转指定数量的位置。
   - 示例：将字符串向左旋转两个位置。
     ```sql
     SELECT ROTATE('MySQL', 2); -- Output: 'SQLMy'
     ```

57. `ROUTINE`:
   - 解释：`ROUTINE` 是一个关键字，通常用于描述数据库中的存储过程和函数。
   - 示例：查找所有存储过程和函数。
     ```sql
     SHOW ROUTINES;
     ```

58. `ROW`:
   - 解释：`ROW` 是一个关键字，通常用于描述数据行或记录。
   - 示例：使用 `ROW` 构造一个数据行。
     ```sql
     INSERT INTO my_table VALUES ROW(1, 'John', 'Doe');
     ```

- `ROWS` (R); became reserved in 8.0.2
- `ROW_COUNT`
- `ROW_FORMAT`
- `ROW_NUMBER` (R); added in 8.0.2 (reserved)
- `RTREE`



59. `ROW_COUNT`:
   - 解释：`ROW_COUNT` 是一个系统变量，用于获取最后一个 `SELECT`、`INSERT`、`UPDATE` 或 `DELETE` 语句所影响的行数。
   - 示例：获取最近一次修改的行数。
     ```sql
     SELECT ROW_COUNT();
     ```

60. `ROW_FORMAT`:
   - 解释：`ROW_FORMAT` 是一个用于指定 InnoDB 表格行格式的参数，可以影响存储和检索数据的方式。
   - 示例：在创建表格时指定行格式。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
     ```

61. `ROW_NUMBER`:
   - 解释：`ROW_NUMBER` 是一个窗口函数，用于为结果集中的每一行分配一个唯一的序号。
   - 示例：使用 `ROW_NUMBER` 函数对结果集进行编号。
     ```sql
     SELECT *,
            ROW_NUMBER() OVER (ORDER BY id) AS row_num
     FROM my_table;
     ```

62. `RTREE`:
   - 解释：`RTREE` 是一个空间索引类型，用于高效存储和查询空间数据。
   - 示例：在表格上创建 RTREE 空间索引。
     ```sql
     CREATE SPATIAL INDEX my_spatial_index ON my_table (spatial_column) USING RTREE;
     ```





## S
 
- `SAVEPOINT`
- `SCHEDULE`
- `SCHEMA` (R)
- `SCHEMAS` (R)
- `SCHEMA_NAME`
- `SECOND`
- `SECONDARY`; added in 8.0.16 (nonreserved)
- `SECONDARY_ENGINE`; added in 8.0.13 (nonreserved)
- `SECONDARY_ENGINE_ATTRIBUTE`; added in 8.0.21 (nonreserved)
- `SECONDARY_LOAD`; added in 8.0.13 (nonreserved)



64. `SAVEPOINT`:
   - 解释：`SAVEPOINT` 是一个关键字，用于在事务中设置保存点，以便在后续的事务操作中回滚到特定的保存点。
   - 示例：在事务中设置保存点。
     ```sql
     START TRANSACTION;
     INSERT INTO my_table (column1) VALUES (1);
     SAVEPOINT my_savepoint;
     UPDATE my_table SET column2 = 2 WHERE id = 1;
     ROLLBACK TO my_savepoint;
     COMMIT;
     ```

65. `SCHEDULE`:
   - 解释：`SCHEDULE` 是一个关键字，通常用于描述计划任务或事件的执行计划。
   - 示例：创建一个每天执行的计划任务。
     ```sql
     CREATE EVENT my_event
     ON SCHEDULE EVERY 1 DAY
     DO
     BEGIN
         -- Event body
     END;
     ```

66. `SCHEMA`:
   - 解释：`SCHEMA` 是一个关键字，用于描述数据库的结构，包括表格、视图、索引等对象的集合。
   - 示例：在特定的数据库中创建表格。
     ```sql
     CREATE TABLE my_database.my_table (
         id INT,
         name VARCHAR(50)
     );
     ```

67. `SCHEMAS`:
   - 解释：`SCHEMAS` 是一个关键字，用于获取数据库服务器上的所有数据库的列表。
   - 示例：显示数据库服务器上的所有数据库。
     ```sql
     SHOW SCHEMAS;
     ```

68. `SCHEMA_NAME`:
   - 解释：`SCHEMA_NAME` 是一个函数，用于返回指定表格的模式名称。
   - 示例：获取表格所属的模式名称。
     ```sql
     SELECT SCHEMA_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'my_table';
     ```

69. `SECOND`:
   - 解释：`SECOND` 是一个函数，用于从时间戳或日期时间中提取秒部分。
   - 示例：从时间戳中提取秒部分。
     ```sql
     SELECT SECOND('2022-03-30 12:45:30'); -- Output: 30
     ```

70. `SECONDARY`:
   - 解释：`SECONDARY` 是一个关键字，通常用于描述从服务器或辅助资源。
   - 示例：配置从服务器的相关参数。
     ```sql
     CHANGE MASTER TO MASTER_HOST = 'secondary_server';
     ```

71. `SECONDARY_ENGINE`:
   - 解释：`SECONDARY_ENGINE` 是一个关键字，通常用于指定辅助存储引擎。
   - 示例：在表格上使用辅助存储引擎。
     ```sql
     CREATE TABLE my_table ENGINE = InnoDB SECONDARY_ENGINE = TokuDB;
     ```

72. `SECONDARY_ENGINE_ATTRIBUTE`:
   - 解释：`SECONDARY_ENGINE_ATTRIBUTE` 是一个关键字，用于指定辅助存储引擎的属性。
   - 示例：指定辅助存储引擎的属性。
     ```sql
     CREATE TABLE my_table ENGINE = InnoDB SECONDARY_ENGINE_ATTRIBUTE = 'key_block_size=8';
     ```

73. `SECONDARY_LOAD`:
   - 解释：`SECONDARY_LOAD` 是一个关键字，用于从辅助源加载数据。
   - 示例：从辅助源加载数据到表格。
     ```sql
     LOAD DATA FROM SECONDARY SOURCE INTO TABLE my_table;
     ```



- `SECONDARY_UNLOAD`; added in 8.0.13 (nonreserved)
- `SECOND_MICROSECOND` (R)
- `SECURITY`
- `SELECT` (R)
- `SENSITIVE` (R)
- `SEPARATOR` (R)
- `SERIAL`
- `SERIALIZABLE`
- `SERVER`
- `SESSION`



74. `SECONDARY_UNLOAD`:
   - 解释：`SECONDARY_UNLOAD` 是一个关键字，用于从主服务器卸载数据到辅助资源。
   - 示例：从主服务器卸载数据到辅助资源。
     ```sql
     UNLOAD DATA TO SECONDARY TARGET FROM TABLE my_table;
     ```

75. `SECOND_MICROSECOND`:
   - 解释：`SECOND_MICROSECOND` 是一个函数，用于从时间戳或日期时间中提取秒和微秒部分。
   - 示例：从日期时间中提取秒和微秒部分。
     ```sql
     SELECT SECOND_MICROSECOND('2022-03-30 12:45:30.123456'); -- Output: 30.123456
     ```

76. `SECURITY`:
   - 解释：`SECURITY` 是一个关键字，通常用于描述数据库对象的安全性设置。
   - 示例：设置存储过程的安全性。
     ```sql
     CREATE PROCEDURE my_procedure() SECURITY DEFINER;
     ```

77. `SELECT`:
   - 解释：`SELECT` 是一个关键字，用于从数据库中检索数据。
   - 示例：选择所有行和列。
     ```sql
     SELECT * FROM my_table;
     ```

78. `SENSITIVE`:
   - 解释：`SENSITIVE` 是一个关键字，通常用于描述敏感数据或查询的安全性设置。
   - 示例：设置查询结果为敏感数据。
     ```sql
     SELECT * FROM sensitive_table SENSITIVE;
     ```

79. `SEPARATOR`:
   - 解释：`SEPARATOR` 是一个关键字，用于指定用于分隔字符的分隔符。
   - 示例：设置逗号作为分隔符。
     ```sql
     SELECT CONCAT_WS(',', col1, col2, col3) FROM my_table;
     ```

80. `SERIAL`:
   - 解释：`SERIAL` 是一个数据类型，通常用于定义自动增长的整数列。
   - 示例：创建一个带有自动增长列的表格。
     ```sql
     CREATE TABLE my_table (
         id SERIAL PRIMARY KEY,
         name VARCHAR(50)
     );
     ```

81. `SERIALIZABLE`:
   - 解释：`SERIALIZABLE` 是一个事务隔离级别，通常用于设置最高级别的事务隔离。
   - 示例：设置事务隔离级别为可串行化。
     ```sql
     SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
     ```

82. `SERVER`:
   - 解释：`SERVER` 是一个关键字，通常用于描述数据库服务器或外部数据源。
   - 示例：创建外部数据源。
     ```sql
     CREATE SERVER my_server FOREIGN DATA WRAPPER mysql OPTIONS (HOST 'localhost', DATABASE 'my_database', USER 'user', PASSWORD 'password');
     ```

83. `SESSION`:
   - 解释：`SESSION` 是一个关键字，通常用于描述当前数据库会话的属性或设置。
   - 示例：设置会话变量。
     ```sql
     SET SESSION my_variable = 'value';
     ```



- `SET` (R)
- `SHARE`
- `SHOW` (R)
- `SHUTDOWN`
- `SIGNAL` (R)
- `SIGNED`
- `SIMPLE`
- `SKIP`; added in 8.0.1 (nonreserved)
- `SLAVE`
- `SLOW`



74. `SET`:
   - 解释：`SET` 是一个关键字，用于设置会话变量或执行赋值操作。
   - 示例：设置会话变量。
     ```sql
     SET @my_variable = 'value';
     ```

75. `SHARE`:
   - 解释：`SHARE` 是一个关键字，通常用于共享锁定数据以防止写入冲突。
   - 示例：在数据上应用共享锁。
     ```sql
     LOCK TABLES my_table SHARE MODE;
     ```

76. `SHOW`:
   - 解释：`SHOW` 是一个关键字，用于显示数据库服务器的元数据、状态或配置信息。
   - 示例：显示所有数据库服务器上的表格。
     ```sql
     SHOW TABLES;
     ```

77. `SHUTDOWN`:
   - 解释：`SHUTDOWN` 是一个关键字，用于关闭 MySQL 服务器。
   - 示例：关闭 MySQL 服务器。
     ```sql
     SHUTDOWN;
     ```

78. `SIGNAL`:
   - 解释：`SIGNAL` 是一个关键字，用于生成异常或信号。
   - 示例：生成一个自定义异常。
     ```sql
     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Custom error message';
     ```

79. `SIGNED`:
   - 解释：`SIGNED` 是一个数据类型修饰符，用于指定整数类型是带符号的。
   - 示例：声明一个带符号的整数列。
     ```sql
     CREATE TABLE my_table (id SIGNED);
     ```

80. `SIMPLE`:
   - 解释：`SIMPLE` 是一个关键字，通常用于描述简单的查询执行计划。
   - 示例：在查询中使用简单的执行计划。
     ```sql
     EXPLAIN SIMPLE SELECT * FROM my_table;
     ```

81. `SKIP`:
   - 解释：`SKIP` 是一个关键字，用于在语法中指示跳过某些元素。
   - 示例：在备份过程中跳过索引。
     ```sql
     BACKUP TABLE my_table SKIP INDEX;
     ```

82. `SLAVE`:
   - 解释：`SLAVE` 是一个关键字，通常用于描述从服务器或复制进程。
   - 示例：启动从服务器的复制进程。
     ```sql
     START SLAVE;
     ```

83. `SLOW`:
   - 解释：`SLOW` 是一个关键字，通常用于描述慢查询或慢日志相关的操作。
   - 示例：查看慢查询日志。
     ```sql
     SHOW SLOW LOG;
     ```



- `SMALLINT` (R)
- `SNAPSHOT`
- `SOCKET`
- `SOME`
- `SONAME`
- `SOUNDS`
- `SOURCE`
- `SPATIAL` (R)
- `SPECIFIC` (R)
- `SQL` (R)
- `SQLEXCEPTION` (R)



84. `SMALLINT`:
   - 解释：`SMALLINT` 是一个数据类型，用于存储小范围的整数值。
   - 示例：创建一个 `SMALLINT` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id SMALLINT,
         name VARCHAR(50)
     );
     ```

85. `SNAPSHOT`:
   - 解释：`SNAPSHOT` 是一个关键字，通常用于描述数据库的快照或备份。
   - 示例：创建数据库的快照。
     ```sql
     CREATE DATABASE my_database SNAPSHOT;
     ```

86. `SOCKET`:
   - 解释：`SOCKET` 是一个关键字，通常用于描述网络通信中的套接字。
   - 示例：指定 MySQL 服务器监听的套接字。
     ```sql
     START SERVER SOCKET = '/var/run/mysql.sock';
     ```

87. `SOME`:
   - 解释：`SOME` 是一个关键字，通常用于描述条件中的一些满足情况。
   - 示例：使用 `SOME` 条件。
     ```sql
     SELECT * FROM my_table WHERE column1 > SOME (SELECT column2 FROM another_table);
     ```

88. `SONAME`:
   - 解释：`SONAME` 是一个关键字，通常用于指定动态链接库的名称。
   - 示例：指定动态链接库的名称。
     ```sql
     CREATE FUNCTION my_function RETURNS INT SONAME 'my_library.so';
     ```

89. `SOUNDS`:
   - 解释：`SOUNDS` 是一个函数，用于比较两个字符串的声音相似性。
   - 示例：比较两个字符串的声音相似性。
     ```sql
     SELECT * FROM my_table WHERE SOUNDS LIKE 'John';
     ```

90. `SOURCE`:
   - 解释：`SOURCE` 是一个关键字，通常用于执行 SQL 脚本文件。
   - 示例：执行 SQL 脚本文件。
     ```sql
     SOURCE /path/to/script.sql;
     ```

91. `SPATIAL`:
   - 解释：`SPATIAL` 是一个关键字，用于创建空间索引或处理空间数据。
   - 示例：在表格上创建空间索引。
     ```sql
     CREATE SPATIAL INDEX my_spatial_index ON my_table(geometry_column);
     ```

92. `SPECIFIC`:
   - 解释：`SPECIFIC` 是一个关键字，通常用于引用特定的存储过程或函数。
   - 示例：调用特定的存储过程。
     ```sql
     CALL my_procedure SPECIFIC my_procedure_name;
     ```

93. `SQL`:
   - 解释：`SQL` 是结构化查询语言的缩写，用于操作和管理关系数据库。
   - 示例：执行 SQL 查询。
     ```sql
     SELECT * FROM my_table WHERE column1 = 'value';
     ```

94. `SQLEXCEPTION`:
   - 解释：`SQLEXCEPTION` 是一个关键字，用于处理 SQL 异常。
   - 示例：捕获 SQL 异常并处理。
     ```sql
     BEGIN
         -- SQL statements
     EXCEPTION
         WHEN SQLEXCEPTION THEN
             -- Handle exception
     END;
     ```



- `SQLSTATE` (R)
- `SQLWARNING` (R)
- `SQL_AFTER_GTIDS`
- `SQL_AFTER_MTS_GAPS`
- `SQL_BEFORE_GTIDS`
- `SQL_BIG_RESULT` (R)
- `SQL_BUFFER_RESULT`
- `SQL_CACHE`; removed in 8.0.3
- `SQL_CALC_FOUND_ROWS` (R)
- `SQL_NO_CACHE`



84. `SQLSTATE`:
   - 解释：`SQLSTATE` 是一个系统变量，用于返回最后一个 SQL 操作的状态码。
   - 示例：获取最后一个 SQL 操作的状态码。
     ```sql
     SELECT SQLSTATE;
     ```

85. `SQLWARNING`:
   - 解释：`SQLWARNING` 是一个系统变量，用于返回最后一个 SQL 操作的警告信息。
   - 示例：获取最后一个 SQL 操作的警告信息。
     ```sql
     SELECT SQLWARNING;
     ```

86. `SQL_AFTER_GTIDS`:
   - 解释：`SQL_AFTER_GTIDS` 是一个选项，用于指定在备份中要处理的 GTID 事务范围。
   - 示例：在备份操作中指定处理的 GTID 事务范围。
     ```sql
     BACKUP DATABASE my_database TO '/backup' WITH SQL_AFTER_GTIDS = 'xxxxxx:yyyyyy';
     ```

87. `SQL_AFTER_MTS_GAPS`:
   - 解释：`SQL_AFTER_MTS_GAPS` 是一个选项，用于指定在备份中要跳过的多线程复制的事务范围。
   - 示例：在备份操作中指定跳过的多线程复制事务范围。
     ```sql
     BACKUP DATABASE my_database TO '/backup' WITH SQL_AFTER_MTS_GAPS = 'xxxxxx:yyyyyy';
     ```

88. `SQL_BEFORE_GTIDS`:
   - 解释：`SQL_BEFORE_GTIDS` 是一个选项，用于指定在备份中要跳过的 GTID 事务范围。
   - 示例：在备份操作中指定跳过的 GTID 事务范围。
     ```sql
     BACKUP DATABASE my_database TO '/backup' WITH SQL_BEFORE_GTIDS = 'xxxxxx:yyyyyy';
     ```

89. `SQL_BIG_RESULT`:
   - 解释：`SQL_BIG_RESULT` 是一个查询修饰符，用于指示查询返回的结果集可能很大。
   - 示例：在查询中使用 `SQL_BIG_RESULT`。
     ```sql
     SELECT SQL_BIG_RESULT * FROM my_table;
     ```

90. `SQL_BUFFER_RESULT`:
   - 解释：`SQL_BUFFER_RESULT` 是一个查询修饰符，用于指示查询结果应该被缓存。
   - 示例：在查询中使用 `SQL_BUFFER_RESULT`。
     ```sql
     SELECT SQL_BUFFER_RESULT * FROM my_table;
     ```

91. `SQL_CACHE`:
   - 解释：`SQL_CACHE` 是一个查询缓存选项，在 MySQL 8.0.3 中被移除。
   - 示例：在查询中使用 `SQL_CACHE`。
     ```sql
     SELECT SQL_CACHE * FROM my_table;
     ```

92. `SQL_CALC_FOUND_ROWS`:
   - 解释：`SQL_CALC_FOUND_ROWS` 是一个查询修饰符，用于计算符合条件的行数，通常与 `FOUND_ROWS()` 函数一起使用。
   - 示例：在查询中使用 `SQL_CALC_FOUND_ROWS`。
     ```sql
     SELECT SQL_CALC_FOUND_ROWS * FROM my_table WHERE condition LIMIT 10;
     ```

93. `SQL_NO_CACHE`:
   - 解释：`SQL_NO_CACHE` 是一个查询缓存选项，用于禁用查询结果的缓存。
   - 示例：在查询中使用 `SQL_NO_CACHE`。
     ```sql
     SELECT SQL_NO_CACHE * FROM my_table;
     ```




- `SQL_SMALL_RESULT` (R)
- `SQL_THREAD`
- `SQL_TSI_DAY`
- `SQL_TSI_HOUR`
- `SQL_TSI_MINUTE`
- `SQL_TSI_MONTH`
- `SQL_TSI_QUARTER`
- `SQL_TSI_SECOND`
- `SQL_TSI_WEEK`
- `SQL_TSI_YEAR`



84. `SQL_SMALL_RESULT`:
   - 解释：`SQL_SMALL_RESULT` 是一个查询提示，用于告知 MySQL 在执行查询时使用较小的临时表格。
   - 示例：在查询中使用 `SQL_SMALL_RESULT` 查询提示。
     ```sql
     SELECT SQL_SMALL_RESULT * FROM my_table;
     ```

85. `SQL_THREAD`:
   - 解释：`SQL_THREAD` 是一个关键字，用于描述 MySQL 服务器中的 SQL 线程。
   - 示例：查看当前 SQL 线程的状态。
     ```sql
     SHOW PROCESSLIST;
     ```

86. `SQL_TSI_DAY`:
   - 解释：`SQL_TSI_DAY` 是一个常量，用于在日期函数中表示以天为单位的时间间隔。
   - 示例：使用 `SQL_TSI_DAY` 常量计算日期差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_DAY, '2022-01-01', '2022-03-01'); -- Output: 59
     ```

87. `SQL_TSI_HOUR`:
   - 解释：`SQL_TSI_HOUR` 是一个常量，用于在日期函数中表示以小时为单位的时间间隔。
   - 示例：使用 `SQL_TSI_HOUR` 常量计算小时差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_HOUR, '2022-01-01 00:00:00', '2022-01-01 03:00:00'); -- Output: 3
     ```

88. `SQL_TSI_MINUTE`:
   - 解释：`SQL_TSI_MINUTE` 是一个常量，用于在日期函数中表示以分钟为单位的时间间隔。
   - 示例：使用 `SQL_TSI_MINUTE` 常量计算分钟差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_MINUTE, '2022-01-01 00:00:00', '2022-01-01 00:30:00'); -- Output: 30
     ```

89. `SQL_TSI_MONTH`:
   - 解释：`SQL_TSI_MONTH` 是一个常量，用于在日期函数中表示以月为单位的时间间隔。
   - 示例：使用 `SQL_TSI_MONTH` 常量计算月份差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_MONTH, '2022-01-01', '2022-03-01'); -- Output: 2
     ```

90. `SQL_TSI_QUARTER`:
   - 解释：`SQL_TSI_QUARTER` 是一个常量，用于在日期函数中表示以季度为单位的时间间隔。
   - 示例：使用 `SQL_TSI_QUARTER` 常量计算季度差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_QUARTER, '2022-01-01', '2022-07-01'); -- Output: 2
     ```

91. `SQL_TSI_SECOND`:
   - 解释：`SQL_TSI_SECOND` 是一个常量，用于在日期函数中表示以秒为单位的时间间隔。
   - 示例：使用 `SQL_TSI_SECOND` 常量计算秒差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_SECOND, '2022-01-01 00:00:00', '2022-01-01 00:00:10'); -- Output: 10
     ```

92. `SQL_TSI_WEEK`:
   - 解释：`SQL_TSI_WEEK` 是一个常量，用于在日期函数中表示以周为单位的时间间隔。
   - 示例：使用 `SQL_TSI_WEEK` 常量计算周差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_WEEK, '2022-01-01', '2022-01-15'); -- Output: 2
     ```

93. `SQL_TSI_YEAR`:
   - 解释：`SQL_TSI_YEAR` 是一个常量，用于在日期函数中表示以年为单位的时间间隔。
   - 示例：使用 `SQL_TSI_YEAR` 常量计算年份差值。
     ```sql
     SELECT TIMESTAMPDIFF(SQL_TSI_YEAR, '2020-01-01', '2022-01-01'); -- Output: 2
     ```



- `SRID`; added in 8.0.3 (nonreserved)
- `SSL` (R)
- `STACKED`
- `START`
- `STARTING` (R)
- `STARTS`
- `STATS_AUTO_RECALC`
- `STATS_PERSISTENT`
- `STATS_SAMPLE_PAGES`
- `STATUS`
- `STOP`



94. `SRID`:
   - 解释：`SRID` 是一个关键字，用于描述空间数据的坐标参考系统标识符。
   - 示例：在创建空间数据列时指定 SRID。
     ```sql
     CREATE TABLE spatial_table (
         id INT,
         geom GEOMETRY(SRID=4326)
     );
     ```

95. `SSL`:
   - 解释：`SSL` 是一个关键字，用于描述 MySQL 连接中使用的安全套接字层。
   - 示例：在 MySQL 连接中启用 SSL 加密。
     ```sql
     ALTER INSTANCE ROTATE INNODB MASTER KEY, ROTATE BINLOG MASTER KEY;
     ```

96. `STACKED`:
   - 解释：`STACKED` 是一个关键字，通常用于描述存储过程或触发器的堆栈大小。
   - 示例：设置存储过程的堆栈大小。
     ```sql
     SET SESSION stack_size = 32K;
     ```

97. `START`:
   - 解释：`START` 是一个关键字，通常用于描述事件的开始时间。
   - 示例：定义事件的开始时间。
     ```sql
     CREATE EVENT my_event ON SCHEDULE EVERY 1 DAY STARTS '2024-03-27' DO ...;
     ```

98. `STARTING`:
   - 解释：`STARTING` 是一个关键字，通常用于描述事件的起始点。
   - 示例：定义事件的起始时间。
     ```sql
     CREATE EVENT my_event ON SCHEDULE EVERY 1 DAY STARTING '2024-03-27' DO ...;
     ```

99. `STARTS`:
   - 解释：`STARTS` 是一个关键字，通常用于描述事件的起始时间。
   - 示例：定义事件的起始时间。
     ```sql
     CREATE EVENT my_event ON SCHEDULE EVERY 1 DAY STARTS '2024-03-27' DO ...;
     ```

100. `STATS_AUTO_RECALC`:
    - 解释：`STATS_AUTO_RECALC` 是一个关键字，用于指定表格的统计信息是否自动重新计算。
    - 示例：在创建表格时指定是否自动重新计算统计信息。
      ```sql
      CREATE TABLE my_table (...) STATS_AUTO_RECALC = ON;
      ```

101. `STATS_PERSISTENT`:
    - 解释：`STATS_PERSISTENT` 是一个关键字，用于指定表格的统计信息是否持久化存储。
    - 示例：在创建表格时指定是否持久化存储统计信息。
      ```sql
      CREATE TABLE my_table (...) STATS_PERSISTENT = ON;
      ```

102. `STATS_SAMPLE_PAGES`:
    - 解释：`STATS_SAMPLE_PAGES` 是一个关键字，用于指定表格的统计信息采样页数。
    - 示例：在创建表格时指定统计信息的采样页数。
      ```sql
      CREATE TABLE my_table (...) STATS_SAMPLE_PAGES = 100;
      ```

103. `STATUS`:
    - 解释：`STATUS` 是一个关键字，用于描述服务器的状态或指标。
    - 示例：查看 MySQL 服务器的运行状态。
      ```sql
      SHOW GLOBAL STATUS;
      ```

104. `STOP`:
    - 解释：`STOP` 是一个关键字，用于停止执行正在进行的事件。
    - 示例：停止执行名为 `my_event` 的事件。
      ```sql
      ALTER EVENT my_event DISABLE;
      ```



- `STORAGE`
- `STORED` (R)
- `STRAIGHT_JOIN` (R)
- `STREAM`; added in 8.0.20 (nonreserved)
- `STRING`
- `SUBCLASS_ORIGIN`
- `SUBJECT`
- `SUBPARTITION`
- `SUBPARTITIONS`
- `SUPER`



105. `STORAGE`:
   - 解释：`STORAGE` 是一个关键字，用于描述存储引擎或存储参数。
   - 示例：在创建表格时指定存储引擎。
     ```sql
     CREATE TABLE my_table (...) ENGINE = InnoDB STORAGE = DISK;
     ```

106. `STORED`:
   - 解释：`STORED` 是一个关键字，通常用于描述存储过程或函数是否是存储的。
   - 示例：创建一个存储过程。
     ```sql
     CREATE PROCEDURE my_procedure () SQL SECURITY INVOKER LANGUAGE SQL NOT DETERMINISTIC CONTAINS SQL STORED;
     ```

107. `STRAIGHT_JOIN`:
   - 解释：`STRAIGHT_JOIN` 是一个查询提示，用于强制 MySQL 使用 `STRAIGHT_JOIN` 方式连接表格。
   - 示例：在查询中使用 `STRAIGHT_JOIN` 查询提示。
     ```sql
     SELECT STRAIGHT_JOIN * FROM table1, table2 WHERE table1.id = table2.id;
     ```

108. `STREAM`:
   - 解释：`STREAM` 是一个关键字，通常用于描述数据流或流处理相关的操作。
   - 示例：处理数据流。
     ```sql
     SELECT * FROM my_stream;
     ```

109. `STRING`:
   - 解释：`STRING` 是一个关键字，通常用于描述字符数据类型或字符串相关的操作。
   - 示例：声明一个字符串变量。
     ```sql
     DECLARE my_string VARCHAR(255);
     ```

110. `SUBCLASS_ORIGIN`:
   - 解释：`SUBCLASS_ORIGIN` 是一个关键字，用于描述数据类型的子类来源。
   - 示例：查看数据类型的子类来源。
     ```sql
     SELECT SUBCLASS_ORIGIN FROM information_schema.COLUMNS WHERE TABLE_NAME = 'my_table';
     ```

111. `SUBJECT`:
   - 解释：`SUBJECT` 是一个关键字，通常用于描述主题或对象的相关信息。
   - 示例：设置邮件主题。
     ```sql
     SEND MAIL TO 'recipient@example.com' SUBJECT 'Meeting Agenda';
     ```

112. `SUBPARTITION`:
   - 解释：`SUBPARTITION` 是一个关键字，用于描述分区表的子分区。
   - 示例：创建一个带有子分区的分区表。
     ```sql
     CREATE TABLE my_partitioned_table (...) PARTITION BY RANGE (...) SUBPARTITION BY HASH (...) SUBPARTITIONS 4;
     ```

113. `SUBPARTITIONS`:
   - 解释：`SUBPARTITIONS` 是一个关键字，用于指定分区表的子分区数量。
   - 示例：创建一个带有子分区的分区表。
     ```sql
     CREATE TABLE my_partitioned_table (...) PARTITION BY RANGE (...) SUBPARTITION BY HASH (...) SUBPARTITIONS 4;
     ```

114. `SUPER`:
   - 解释：`SUPER` 是一个关键字，通常用于描述超级用户或特权相关的操作。
   - 示例：授予超级用户权限。
     ```sql
     GRANT SUPER ON *.* TO 'user'@'host';
     ```



- `SUSPEND`
- `SWAPS`
- `SWITCHES`
- `SYSTEM` (R); added in 8.0.3 (reserved)



105. `SUSPEND`:
   - 解释：`SUSPEND` 是一个关键字，通常在存储过程或函数中用于挂起执行。
   - 示例：在存储过程中使用 `SUSPEND` 关键字。
     ```sql
     CREATE PROCEDURE my_procedure()
     BEGIN
         -- Some logic
         IF condition THEN
             SUSPEND;
         END IF;
         -- More logic
     END;
     ```

106. `SWAPS`:
   - 解释：`SWAPS` 是一个关键字，用于描述操作系统的交换空间使用情况。
   - 示例：查看当前系统的交换空间使用情况。
     ```sql
     SHOW GLOBAL STATUS LIKE 'Swaps';
     ```

107. `SWITCHES`:
   - 解释：`SWITCHES` 是一个关键字，通常用于描述 MySQL 服务器的切换操作。
   - 示例：查看 MySQL 服务器的切换次数。
     ```sql
     SHOW GLOBAL STATUS LIKE 'Switches';
     ```

108. `SYSTEM`:
   - 解释：`SYSTEM` 是一个关键字，通常用于描述系统级别的操作或属性。
   - 示例：查看系统级别的变量。
     ```sql
     SHOW VARIABLES LIKE 'system%';
     ```



## T
 
- `TABLE` (R)
- `TABLES`
- `TABLESPACE`
- `TABLE_CHECKSUM`
- `TABLE_NAME`
- `TEMPORARY`
- `TEMPTABLE`
- `TERMINATED` (R)
- `TEXT`



109. `TABLE`:
   - 解释：`TABLE` 是一个关键字，用于描述数据库中的表格对象。
   - 示例：创建一个名为 `my_table` 的表格。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         name VARCHAR(50)
     );
     ```

110. `TABLES`:
   - 解释：`TABLES` 是一个关键字，用于描述数据库中的表格。
   - 示例：显示数据库中的所有表格。
     ```sql
     SHOW TABLES;
     ```

111. `TABLESPACE`:
   - 解释：`TABLESPACE` 是一个关键字，用于描述数据库中的表空间。
   - 示例：创建一个名为 `my_tablespace` 的表空间。
     ```sql
     CREATE TABLESPACE my_tablespace
         ADD DATAFILE 'my_tablespace.ibd'
         ENGINE = InnoDB;
     ```

112. `TABLE_CHECKSUM`:
   - 解释：`TABLE_CHECKSUM` 是一个关键字，用于描述表格的校验和属性。
   - 示例：在创建表格时启用校验和功能。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     ) TABLE_CHECKSUM = 1;
     ```

113. `TABLE_NAME`:
   - 解释：`TABLE_NAME` 是一个关键字，用于描述数据库中表格的名称。
   - 示例：查询信息模式视图以获取表格名称。
     ```sql
     SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'my_database';
     ```

114. `TEMPORARY`:
   - 解释：`TEMPORARY` 是一个关键字，用于描述临时表格或对象。
   - 示例：创建一个临时表格。
     ```sql
     CREATE TEMPORARY TABLE temp_table (
         id INT PRIMARY KEY,
         name VARCHAR(50)
     );
     ```

115. `TEMPTABLE`:
   - 解释：`TEMPTABLE` 是一个关键字，用于描述在查询执行中是否使用了临时表格。
   - 示例：在查询中使用临时表格进行处理。
     ```sql
     SELECT * FROM my_table1 JOIN my_table2 USE INDEX FOR JOIN (PRIMARY) ORDER BY id;
     ```

116. `TERMINATED`:
   - 解释：`TERMINATED` 是一个关键字，通常在 LOAD DATA INFILE 语句中使用，用于指定字段的终止字符。
   - 示例：使用 `TERMINATED BY` 在加载数据时指定字段终止字符。
     ```sql
     LOAD DATA INFILE 'data.txt' INTO TABLE my_table FIELDS TERMINATED BY ',';
     ```

117. `TEXT`:
   - 解释：`TEXT` 是一个数据类型，用于存储长文本数据。
   - 示例：创建一个 TEXT 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         content TEXT
     );
     ```



- `THAN`
- `THEN` (R)
- `THREAD_PRIORITY`; added in 8.0.3 (nonreserved)
- `TIES`; added in 8.0.2 (nonreserved)
- `TIME`
- `TIMESTAMP`
- `TIMESTAMPADD`
- `TIMESTAMPDIFF`
- `TINYBLOB` (R)
- `TINYINT` (R)



118. `THAN`:
   - 解释：`THAN` 是一个关键字，通常用于比较操作或语句中，表示一个值大于另一个值。
   - 示例：使用 `THAN` 比较两个值。
     ```sql
     SELECT * FROM my_table WHERE value1 > value2;
     ```

119. `THEN`:
   - 解释：`THEN` 是一个关键字，通常与 `CASE` 表达式一起使用，表示条件为真时执行的结果。
   - 示例：使用 `THEN` 表示 `CASE` 表达式的条件分支。
     ```sql
     CASE WHEN condition THEN result ELSE alternative END;
     ```

120. `THREAD_PRIORITY`:
   - 解释：`THREAD_PRIORITY` 是一个关键字，用于设置线程的优先级。
   - 示例：设置线程的优先级。
     ```sql
     SET GLOBAL thread_priority = 10;
     ```

121. `TIES`:
   - 解释：`TIES` 是一个关键字，用于描述在排序中出现的平局情况。
   - 示例：在排序结果中标记平局。
     ```sql
     SELECT * FROM my_table ORDER BY score DESC TIES ('Tie');
     ```

122. `TIME`:
   - 解释：`TIME` 是一个数据类型，用于存储时间值。
   - 示例：创建一个 TIME 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         time_column TIME
     );
     ```

123. `TIMESTAMP`:
   - 解释：`TIMESTAMP` 是一个数据类型，用于存储日期和时间值，通常用于记录时间戳。
   - 示例：创建一个 TIMESTAMP 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         timestamp_column TIMESTAMP
     );
     ```

124. `TIMESTAMPADD`:
   - 解释：`TIMESTAMPADD` 是一个函数，用于在日期时间值中添加一定数量的时间间隔。
   - 示例：使用 `TIMESTAMPADD` 函数在日期时间值中添加一天。
     ```sql
     SELECT TIMESTAMPADD(DAY, 1, '2022-01-01');
     ```

125. `TIMESTAMPDIFF`:
   - 解释：`TIMESTAMPDIFF` 是一个函数，用于计算两个日期时间值之间的时间间隔。
   - 示例：使用 `TIMESTAMPDIFF` 函数计算两个日期时间值之间的天数差。
     ```sql
     SELECT TIMESTAMPDIFF(DAY, '2022-01-01', '2022-01-10');
     ```

126. `TINYBLOB`:
   - 解释：`TINYBLOB` 是一个数据类型，用于存储最大长度为 255 字节的二进制数据。
   - 示例：创建一个 TINYBLOB 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         data TINYBLOB
     );
     ```

127. `TINYINT`:
   - 解释：`TINYINT` 是一个数据类型，用于存储范围较小的整数值。
   - 示例：创建一个 TINYINT 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         age TINYINT
     );
     ```



- `TINYTEXT` (R)
- `TLS`; added in 8.0.21 (nonreserved)
- `TO` (R)
- `TRAILING` (R)
- `TRANSACTION`
- `TRIGGER` (R)
- `TRIGGERS`
- `TRUE` (R)
- `TRUNCATE`
- `TYPE`
- `TYPES`



118. `TINYTEXT`:
   - 解释：`TINYTEXT` 是一个数据类型，用于存储短文本数据，最大长度为 255 个字符。
   - 示例：创建一个 `TINYTEXT` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         description TINYTEXT
     );
     ```

119. `TLS`:
   - 解释：`TLS` 是一个关键字，用于描述传输层安全协议。
   - 示例：在 MySQL 连接中启用 TLS 加密。
     ```sql
     ALTER INSTANCE ROTATE INNODB MASTER KEY, ROTATE BINLOG MASTER KEY;
     ```

120. `TO`:
   - 解释：`TO` 是一个关键字，通常用于描述目标或接收者。
   - 示例：将数据从一个表格复制到另一个表格。
     ```sql
     INSERT INTO target_table SELECT * FROM source_table;
     ```

121. `TRAILING`:
   - 解释：`TRAILING` 是一个关键字，通常用于描述字符串操作，表示去除字符串末尾的空格。
   - 示例：使用 `TRAILING` 去除字符串末尾的空格。
     ```sql
     SELECT TRAILING('  Hello  ') AS trimmed_string;
     ```

122. `TRANSACTION`:
   - 解释：`TRANSACTION` 是一个关键字，用于描述数据库事务。
   - 示例：开始一个事务。
     ```sql
     START TRANSACTION;
     ```

123. `TRIGGER`:
   - 解释：`TRIGGER` 是一个关键字，用于描述数据库触发器。
   - 示例：创建一个触发器。
     ```sql
     CREATE TRIGGER my_trigger BEFORE INSERT ON my_table FOR EACH ROW INSERT INTO log_table VALUES (NEW.id, NOW());
     ```

124. `TRIGGERS`:
   - 解释：`TRIGGERS` 是一个关键字，用于描述数据库中的触发器。
   - 示例：显示数据库中的所有触发器。
     ```sql
     SHOW TRIGGERS;
     ```

125. `TRUE`:
   - 解释：`TRUE` 是一个布尔值，表示真值。
   - 示例：使用 `TRUE` 在查询中筛选真值。
     ```sql
     SELECT * FROM my_table WHERE condition = TRUE;
     ```

126. `TRUNCATE`:
   - 解释：`TRUNCATE` 是一个关键字，用于快速清空表格的内容，但保留表结构。
   - 示例：清空名为 `my_table` 的表格。
     ```sql
     TRUNCATE TABLE my_table;
     ```

127. `TYPE`:
   - 解释：`TYPE` 是一个关键字，用于描述数据类型或对象类型。
   - 示例：定义一个自定义数据类型。
     ```sql
     CREATE TYPE my_type AS ENUM ('A', 'B', 'C');
     ```

128. `TYPES`:
   - 解释：`TYPES` 是一个关键字，用于描述数据库中可用的数据类型。
   - 示例：显示数据库中的所有数据类型。
     ```sql
     SHOW TYPES;
     ```



## U
 
- `UNBOUNDED`; added in 8.0.2 (nonreserved)
- `UNCOMMITTED`
- `UNDEFINED`
- `UNDO` (R)
- `UNDOFILE`
- `UNDO_BUFFER_SIZE`
- `UNICODE`
- `UNINSTALL`
- `UNION` (R)
- `UNIQUE` (R)



129. `UNBOUNDED`:
   - 解释：`UNBOUNDED` 是一个关键字，用于描述在窗口函数中表示无边界。
   - 示例：在窗口函数中使用 `UNBOUNDED` 表示无边界。
     ```sql
     SELECT val, SUM(val) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM my_table;
     ```

130. `UNCOMMITTED`:
   - 解释：`UNCOMMITTED` 是一个关键字，用于描述事务的隔离级别，表示事务不需要等待其他事务的提交。
   - 示例：在启动事务时指定隔离级别为 `UNCOMMITTED`。
     ```sql
     START TRANSACTION ISOLATION LEVEL UNCOMMITTED;
     ```

131. `UNDEFINED`:
   - 解释：`UNDEFINED` 是一个关键字，通常用于描述变量或状态的未定义性。
   - 示例：使用 `UNDEFINED` 表示状态未定义。
     ```sql
     DECLARE my_var INT DEFAULT UNDEFINED;
     ```

132. `UNDO`:
   - 解释：`UNDO` 是一个关键字，通常用于描述数据库事务中的回滚操作。
   - 示例：执行事务回滚操作。
     ```sql
     ROLLBACK;
     ```

133. `UNDOFILE`:
   - 解释：`UNDOFILE` 是一个关键字，用于指定用于存储事务日志的文件名。
   - 示例：在 MySQL 配置文件中指定 UNDOFILE。
     ```sql
     undo_log = undo_file_name
     ```

134. `UNDO_BUFFER_SIZE`:
   - 解释：`UNDO_BUFFER_SIZE` 是一个关键字，用于指定 UNDO 缓冲区的大小。
   - 示例：在 MySQL 配置文件中设置 UNDO 缓冲区大小。
     ```sql
     undo_buffer_size = size
     ```

135. `UNICODE`:
   - 解释：`UNICODE` 是一个关键字，用于描述字符集或编码。
   - 示例：在连接 MySQL 数据库时指定字符集为 UNICODE。
     ```sql
     mysql -u username -p --default-character-set=UNICODE
     ```

136. `UNINSTALL`:
   - 解释：`UNINSTALL` 是一个关键字，用于卸载插件或扩展。
   - 示例：卸载名为 `my_plugin` 的插件。
     ```sql
     UNINSTALL PLUGIN my_plugin;
     ```

137. `UNION`:
   - 解释：`UNION` 是一个关键字，用于合并两个或多个查询的结果集。
   - 示例：使用 `UNION` 合并两个查询的结果。
     ```sql
     SELECT column1 FROM table1 UNION SELECT column2 FROM table2;
     ```

138. `UNIQUE`:
   - 解释：`UNIQUE` 是一个关键字，用于描述表格中的唯一约束。
   - 示例：在创建表格时定义唯一约束。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         name VARCHAR(50) UNIQUE
     );
     ```



- `UNKNOWN`
- `UNLOCK` (R)
- `UNSIGNED` (R)
- `UNTIL`
- `UPDATE` (R)
- `UPGRADE`
- `USAGE` (R)
- `USE` (R)
- `USER`
- `USER_RESOURCES`
- `USE_FRM`



129. `UNBOUNDED`:
   - 解释：`UNBOUNDED` 是一个关键字，通常用于描述窗口函数中的边界，表示未限定的边界。
   - 示例：在窗口函数中使用 `UNBOUNDED`。
     ```sql
     SELECT val, SUM(val) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM my_table;
     ```

130. `UNCOMMITTED`:
   - 解释：`UNCOMMITTED` 是一个关键字，通常用于描述事务的隔离级别，表示未提交读取。
   - 示例：设置事务的隔离级别为 `UNCOMMITTED`。
     ```sql
     SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
     ```

131. `UNDEFINED`:
   - 解释：`UNDEFINED` 是一个关键字，通常用于描述未定义的值或状态。
   - 示例：使用 `UNDEFINED` 描述未定义的行为。
     ```sql
     ALTER TABLE my_table ALTER COLUMN col SET DEFAULT UNDEFINED;
     ```

132. `UNDO`:
   - 解释：`UNDO` 是一个关键字，通常用于描述数据库中的撤销日志。
   - 示例：查看 MySQL 中的撤销日志。
     ```sql
     SHOW ENGINE INNODB STATUS;
     ```

133. `UNDOFILE`:
   - 解释：`UNDOFILE` 是一个关键字，用于描述撤销日志文件的名称。
   - 示例：在 MySQL 中配置撤销日志文件。
     ```sql
     SET GLOBAL innodb_undo_directory = '/path/to/undo/logs';
     ```

134. `UNDO_BUFFER_SIZE`:
   - 解释：`UNDO_BUFFER_SIZE` 是一个关键字，用于描述撤销日志缓冲区的大小。
   - 示例：配置 MySQL 中的撤销日志缓冲区大小。
     ```sql
     SET GLOBAL innodb_undo_buffer_size = 256MB;
     ```

135. `UNICODE`:
   - 解释：`UNICODE` 是一个关键字，用于描述统一字符编码标准。
   - 示例：在数据库中存储 Unicode 字符串。
     ```sql
     CREATE TABLE my_table (
         id INT,
         text_column VARCHAR(100) CHARACTER SET utf8mb4
     );
     ```

136. `UNINSTALL`:
   - 解释：`UNINSTALL` 是一个关键字，用于描述卸载或移除软件或插件。
   - 示例：卸载 MySQL 插件。
     ```sql
     UNINSTALL PLUGIN my_plugin;
     ```

137. `UNION`:
   - 解释：`UNION` 是一个关键字，用于组合多个查询结果集。
   - 示例：使用 `UNION` 合并两个查询结果集。
     ```sql
     SELECT col1 FROM table1
     UNION
     SELECT col2 FROM table2;
     ```

138. `UNIQUE`:
   - 解释：`UNIQUE` 是一个关键字，用于描述唯一约束或索引。
   - 示例：在列上创建唯一约束。
     ```sql
     ALTER TABLE my_table ADD CONSTRAINT unique_constraint UNIQUE (column_name);
     ```



- `USING` (R)
- `UTC_DATE` (R)
- `UTC_TIME` (R)
- `UTC_TIMESTAMP` (R)
 


139. `USING`:
   - 解释：`USING` 是一个关键字，通常用于指定连接条件或指定被更新的列和其对应的值。
   - 示例：在 `JOIN` 操作中使用 `USING` 指定连接条件。
     ```sql
     SELECT * FROM table1 JOIN table2 USING (common_column);
     ```

140. `UTC_DATE`:
   - 解释：`UTC_DATE` 是一个系统函数，返回当前UTC日期，不包含时间部分。
   - 示例：使用 `UTC_DATE` 获取当前UTC日期。
     ```sql
     SELECT UTC_DATE();
     ```

141. `UTC_TIME`:
   - 解释：`UTC_TIME` 是一个系统函数，返回当前UTC时间，不包含日期部分。
   - 示例：使用 `UTC_TIME` 获取当前UTC时间。
     ```sql
     SELECT UTC_TIME();
     ```

142. `UTC_TIMESTAMP`:
   - 解释：`UTC_TIMESTAMP` 是一个系统函数，返回当前UTC日期和时间。
   - 示例：使用 `UTC_TIMESTAMP` 获取当前UTC日期和时间。
     ```sql
     SELECT UTC_TIMESTAMP();
     ```

## V
 
- `VALIDATION`
- `VALUE`
- `VALUES` (R)
- `VARBINARY` (R)
- `VARCHAR` (R)
- `VARCHARACTER` (R)
- `VARIABLES`
- `VARYING` (R)
- `VCPU`; added in 8.0.3 (nonreserved)
- `VIEW`
- `VIRTUAL` (R)
- `VISIBLE`
 
 

143. `VALIDATION`:
   - 解释：`VALIDATION` 是一个关键字，通常用于描述验证过程或规则。
   - 示例：在表格定义中使用 `VALIDATION` 规则。
     ```sql
     CREATE TABLE my_table (
         id INT PRIMARY KEY,
         name VARCHAR(50) VALIDATION 'non_empty_string'
     );
     ```

144. `VALUE`:
   - 解释：`VALUE` 是一个关键字，通常用于描述数值或数据。
   - 示例：在查询中使用 `VALUE`。
     ```sql
     SELECT VALUE FROM my_table WHERE id = 1;
     ```

145. `VALUES`:
   - 解释：`VALUES` 是一个关键字，通常用于描述插入或更新操作中的值列表。
   - 示例：使用 `VALUES` 插入新行。
     ```sql
     INSERT INTO my_table (col1, col2) VALUES (value1, value2);
     ```

146. `VARBINARY`:
   - 解释：`VARBINARY` 是一个数据类型，用于存储二进制数据，最大长度取决于指定的大小。
   - 示例：创建一个 `VARBINARY` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         binary_data VARBINARY(100)
     );
     ```

147. `VARCHAR`:
   - 解释：`VARCHAR` 是一个数据类型，用于存储可变长度的字符数据，最大长度取决于指定的大小。
   - 示例：创建一个 `VARCHAR` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHAR(50)
     );
     ```

148. `VARCHARACTER`:
   - 解释：`VARCHARACTER` 是 `VARCHAR` 的同义词，用于存储可变长度的字符数据。
   - 示例：创建一个 `VARCHARACTER` 类型的列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         name VARCHARACTER(50)
     );
     ```

149. `VARIABLES`:
   - 解释：`VARIABLES` 是一个关键字，通常用于描述系统变量或用户定义的变量。
   - 示例：显示 MySQL 中的所有系统变量。
     ```sql
     SHOW VARIABLES;
     ```

150. `VARYING`:
   - 解释：`VARYING` 是一个关键字，通常用于描述可变长度的数据类型。
   - 示例：在列定义中使用 `VARYING`。
     ```sql
     CREATE TABLE my_table (
         id INT,
         description VARCHAR(255) VARYING
     );
     ```

151. `VCPU`:
   - 解释：`VCPU` 是一个关键字，通常用于描述虚拟中央处理单元。
   - 示例：配置虚拟机的 vCPU 数量。
     ```sql
     SET VCPU = 4;
     ```

152. `VIEW`:
   - 解释：`VIEW` 是一个关键字，用于描述数据库中的视图对象。
   - 示例：创建一个视图。
     ```sql
     CREATE VIEW my_view AS SELECT * FROM my_table WHERE condition;
     ```

153. `VIRTUAL`:
   - 解释：`VIRTUAL` 是一个关键字，用于描述虚拟列或虚拟索引。
   - 示例：在表格中定义一个虚拟列。
     ```sql
     ALTER TABLE my_table ADD COLUMN virtual_column VARCHAR(50) VIRTUAL;
     ```

154. `VISIBLE`:
   - 解释：`VISIBLE` 是一个关键字，通常用于描述对象的可见性。
   - 示例：在创建索引时设置索引的可见性。
     ```sql
     CREATE INDEX idx ON my_table (column_name) VISIBLE;
     ```

## W
 
- `WAIT`
- `WARNINGS`
- `WEEK`
- `WEIGHT_STRING`
- `WHEN` (R)
- `WHERE` (R)
- `WHILE` (R)
- `WINDOW` (R); added in 8.0.2 (reserved)
- `WITH` (R)
- `WITHOUT`
- `WORK`
- `WRAPPER`
- `WRITE` (R)



143. `WAIT`:
   - 解释：`WAIT` 是一个关键字，通常用于描述等待或暂停操作。
   - 示例：等待一段时间后执行下一个操作。
     ```sql
     SELECT * FROM my_table WHERE condition WAIT 10;
     ```

144. `WARNINGS`:
   - 解释：`WARNINGS` 是一个关键字，用于描述查询或操作产生的警告消息。
   - 示例：显示最近一次操作产生的警告消息。
     ```sql
     SHOW WARNINGS;
     ```

145. `WEEK`:
   - 解释：`WEEK` 是一个关键字，通常用于描述一年中的周数。
   - 示例：获取当前日期所在的周数。
     ```sql
     SELECT WEEK(NOW());
     ```

146. `WEIGHT_STRING`:
   - 解释：`WEIGHT_STRING` 是一个关键字，用于描述字符串的重量比较。
   - 示例：使用 `WEIGHT_STRING` 比较字符串的重量。
     ```sql
     SELECT * FROM my_table WHERE col1 = col2 WEIGHT_STRING;
     ```

147. `WHEN`:
   - 解释：`WHEN` 是一个关键字，通常用于描述条件逻辑。
   - 示例：在 `CASE` 表达式中使用 `WHEN`。
     ```sql
     SELECT CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE default_result END;
     ```

148. `WHERE`:
   - 解释：`WHERE` 是一个关键字，用于筛选行。
   - 示例：使用 `WHERE` 筛选符合条件的行。
     ```sql
     SELECT * FROM my_table WHERE column1 = 'value';
     ```

149. `WHILE`:
   - 解释：`WHILE` 是一个关键字，用于循环语句中描述循环条件。
   - 示例：在存储过程中使用 `WHILE` 循环。
     ```sql
     WHILE condition DO
         -- loop body
     END WHILE;
     ```

150. `WINDOW`:
   - 解释：`WINDOW` 是一个关键字，用于描述窗口函数的命名窗口。
   - 示例：在使用窗口函数时定义一个命名窗口。
     ```sql
     SELECT column1, SUM(column2) OVER my_window AS running_total FROM my_table WINDOW my_window AS (ORDER BY column1);
     ```

151. `WITH`:
   - 解释：`WITH` 是一个关键字，通常用于描述公共表表达式或递归查询。
   - 示例：使用 `WITH` 定义一个公共表表达式。
     ```sql
     WITH cte AS (SELECT * FROM my_table WHERE condition) SELECT * FROM cte;
     ```

152. `WITHOUT`:
   - 解释：`WITHOUT` 是一个关键字，通常用于描述排除某些条件或属性。
   - 示例：在查询中使用 `WITHOUT` 排除某些行。
     ```sql
     SELECT * FROM my_table WHERE condition WITHOUT row_locks;
     ```

153. `WORK`:
   - 解释：`WORK` 是一个关键字，通常用于描述数据库事务。
   - 示例：在事务中使用 `WORK` 关键字。
     ```sql
     START TRANSACTION WORK;
     ```

154. `WRAPPER`:
   - 解释：`WRAPPER` 是一个关键字，通常用于描述外部函数的包装器。
   - 示例：创建一个包装器函数。
     ```sql
     CREATE FUNCTION my_wrapper(p1 INT) RETURNS INT SONAME 'my_library';
     ```

155. `WRITE`:
   - 解释：`WRITE` 是一个关键字，通常用于描述对数据库的写入操作。
   - 示例：使用 `WRITE` 在表格中插入新行。
     ```sql
     INSERT INTO my_table VALUES (1, 'value') WRITE;
     ```


## X + Y + Z
 
- `X509`
- `XA`
- `XID`
- `XML`
- `XOR` (R)
 
- `YEAR`
- `YEAR_MONTH` (R)
 
- `ZEROFILL` (R)
- `ZONE`; added in 8.0.22 (nonreserved)



156. `X509`:
   - 解释：`X509` 是一个关键字，通常用于描述基于 X.509 标准的数字证书。
   - 示例：使用 `X509` 格式的数字证书进行身份验证。
     ```sql
     GRANT ALL PRIVILEGES ON my_database.* TO 'user'@'host' IDENTIFIED BY 'password' REQUIRE X509;
     ```

157. `XA`:
   - 解释：`XA` 是一个关键字，通常用于描述分布式事务处理中的分布式事务管理器。
   - 示例：在 MySQL 中使用 XA 分布式事务。
     ```sql
     XA START 'xa_transaction_id';
     ```

158. `XID`:
   - 解释：`XID` 是一个关键字，通常用于描述分布式事务中的事务标识符。
   - 示例：使用 `XID` 标识符管理分布式事务。
     ```sql
     XA END 'xa_transaction_id';
     ```

159. `XML`:
   - 解释：`XML` 是一个关键字，通常用于描述可扩展标记语言（XML）。
   - 示例：将数据从 XML 格式导入到数据库中。
     ```sql
     LOAD XML LOCAL INFILE '/path/to/file.xml' INTO TABLE my_table;
     ```

160. `XOR`:
   - 解释：`XOR` 是一个关键字，用于描述逻辑运算中的异或操作。
   - 示例：在条件语句中使用 `XOR` 进行逻辑判断。
     ```sql
     SELECT * FROM my_table WHERE col1 = 'value1' XOR col2 = 'value2';
     ```

161. `YEAR`:
   - 解释：`YEAR` 是一个关键字，通常用于描述年份数据类型。
   - 示例：使用 `YEAR` 数据类型定义一个年份列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         year_column YEAR
     );
     ```

162. `YEAR_MONTH`:
   - 解释：`YEAR_MONTH` 是一个关键字，通常用于描述年份和月份组合数据类型。
   - 示例：使用 `YEAR_MONTH` 数据类型定义一个年份和月份组合的列。
     ```sql
     CREATE TABLE my_table (
         id INT,
         year_month_column YEAR_MONTH
     );
     ```

163. `ZEROFILL`:
   - 解释：`ZEROFILL` 是一个关键字，通常用于描述填充数字字段值的前导零。
   - 示例：在定义数字列时使用 `ZEROFILL`。
     ```sql
     CREATE TABLE my_table (
         id INT ZEROFILL,
         value INT
     );
     ```

164. `ZONE`:
   - 解释：`ZONE` 是一个关键字，通常用于描述时区或区域。
   - 示例：在查询中使用 `ZONE` 来处理时区信息。
     ```sql
     SELECT CONVERT_TZ('2024-03-28 12:00:00', 'UTC', 'America/New_York') AS converted_time;
     ```


## MySQL 8.0新关键字和保留字
 
下表显示了与MySQL 5.7相比在MySQL 8.0中添加的关键字和保留字。保留的关键字标有（R）。
 
#### A
 
- `ACTIVE`
- `ADMIN`
- `ARRAY`
- `ATTRIBUTE`
 
#### B
 
- `BUCKETS`
 
#### C
 
- `CLONE`
- `COMPONENT`
- `CUME_DIST` (R)
 
#### D
 
- `DEFINITION`
- `DENSE_RANK` (R)
- `DESCRIPTION`
 
#### E
 
- `EMPTY` (R)
- `ENFORCED`
- `ENGINE_ATTRIBUTE`
- `EXCEPT` (R)
- `EXCLUDE`
 
#### F
 
- `FAILED_LOGIN_ATTEMPTS`
- `FIRST_VALUE` (R)
- `FOLLOWING`
 
#### G
 
- `GEOMCOLLECTION`
- `GET_MASTER_PUBLIC_KEY`
- `GROUPING` (R)
- `GROUPS` (R)
 
#### H
 
- `HISTOGRAM`
- `HISTORY`
 
#### I
 
- `INACTIVE`
- `INVISIBLE`
 
#### J
 
- `JSON_TABLE` (R)
- `JSON_VALUE`
 
#### L
 
- `LAG` (R)
- `LAST_VALUE` (R)
- `LATERAL` (R)
- `LEAD` (R)
- `LOCKED`
 
#### M
 
- `MASTER_COMPRESSION_ALGORITHMS`
- `MASTER_PUBLIC_KEY_PATH`
- `MASTER_TLS_CIPHERSUITES`
- `MASTER_ZSTD_COMPRESSION_LEVEL`
- `MEMBER`
 
#### N
 
- `NESTED`
- `NETWORK_NAMESPACE`
- `NOWAIT`
- `NTH_VALUE` (R)
- `NTILE` (R)
- `NULLS`
 
#### O
 
- `OF` (R)
- `OFF`
- `OJ`
- `OLD`
- `OPTIONAL`
- `ORDINALITY`
- `ORGANIZATION`
- `OTHERS`
- `OVER` (R)
 
#### P
 
- `PASSWORD_LOCK_TIME`
- `PATH`
- `PERCENT_RANK` (R)
- `PERSIST`
- `PERSIST_ONLY`
- `PRECEDING`
- `PRIVILEGE_CHECKS_USER`
- `PROCESS`
 
#### R
 
- `RANDOM`
- `RANK` (R)
- `RECURSIVE` (R)
- `REFERENCE`
- `REPLICA`
- `REPLICAS`
- `REQUIRE_ROW_FORMAT`
- `RESOURCE`
- `RESPECT`
- `RESTART`
- `RETAIN`
- `RETURNING`
- `REUSE`
- `ROLE`
- `ROW_NUMBER` (R)
 
#### S
 
- `SECONDARY`
- `SECONDARY_ENGINE`
- `SECONDARY_ENGINE_ATTRIBUTE`
- `SECONDARY_LOAD`
- `SECONDARY_UNLOAD`
- `SKIP`
- `SRID`
- `STREAM`
- `SYSTEM` (R)
 
#### T
 
- `THREAD_PRIORITY`
- `TIES`
- `TLS`
 
#### U
 
- `UNBOUNDED`
 
#### V
 
- `VCPU`
- `VISIBLE`
 
#### W
 
- `WINDOW` (R)
 
#### Z
 
- `ZONE`
 
## MySQL 8.0删除了关键字和保留字
 
下表显示了与MySQL 5.7相比在MySQL 8.0中删除的关键字和保留字。保留的关键字标有（R）。
 
- `ANALYSE`
- `DES_KEY_FILE`
- `PARSE_GCOL_EXPR`
- `REDOFILE`
- `SQL_CACHE`


-------------------------------------------------------------------------------------------------------------------------------------------------


# chat

# mysql 基础知识

## 列出 mysql 所有的关键词，给出表格，序号，关键词，描述，例子。

以下是 MySQL 的所有关键词，包括 SQL 关键词、保留字和函数名称。我将它们按照字母顺序排列，并提供了描述和例子。

| 序号 | 关键词      | 描述                                                         | 例子                                                  |
|------|------------|--------------------------------------------------------------|-------------------------------------------------------|
| 1    | ADD        | 用于在表中添加列或添加索引                                   | `ALTER TABLE table_name ADD column_name datatype;`    |
| 2    | ALL        | 用于指定操作应该应用于查询中的所有行                         | `SELECT * FROM table_name WHERE condition ALL;`       |
| 3    | ALTER      | 用于修改数据库表的结构                                       | `ALTER TABLE table_name ADD column_name datatype;`    |
| 4    | AND        | 用于在 WHERE 子句中将多个条件结合在一起                     | `SELECT * FROM table_name WHERE condition1 AND condition2;` |
| 5    | AS         | 用于重命名列或表                                             | `SELECT column_name AS alias_name FROM table_name;`   |
| 6    | ASC        | 用于按升序对结果集进行排序                                   | `SELECT * FROM table_name ORDER BY column_name ASC;`  |
| 7    | AVG        | 用于计算数值列的平均值                                       | `SELECT AVG(column_name) FROM table_name;`            |
| 8    | BETWEEN    | 用于在给定范围内检索值                                       | `SELECT * FROM table_name WHERE column_name BETWEEN value1 AND value2;` |
| 9    | BY         | 用于指定排序顺序                                             | `SELECT * FROM table_name ORDER BY column_name ASC|DESC;` |
| 10   | CASE       | 用于在 SELECT 子句中执行条件语句                              | `SELECT column_name, CASE WHEN condition THEN result END FROM table_name;` |
| 11   | CAST       | 用于将一个数据类型转换为另一个数据类型                         | `SELECT CAST(column_name AS new_data_type) FROM table_name;` |
| 12   | CHAR       | 定义固定长度的字符串类型                                     | `CREATE TABLE table_name (column_name CHAR(length));` |
| 13   | COLUMN     | 用于定义表中的列                                             | `ALTER TABLE table_name ADD column_name datatype;`    |
| 14   | COUNT      | 用于计算选择的行数                                           | `SELECT COUNT(column_name) FROM table_name;`          |
| 15   | CREATE     | 用于创建数据库或表                                           | `CREATE DATABASE database_name;`                      |
| 16   | DATE       | 用于定义日期格式的数据类型                                   | `CREATE TABLE table_name (column_name DATE);`         |
| 17   | DELETE     | 用于删除表中的行或表                                         | `DELETE FROM table_name WHERE condition;`             |
| 18   | DESC       | 用于按降序对结果集进行排序                                   | `SELECT * FROM table_name ORDER BY column_name DESC;` |
| 19   | DISTINCT   | 用于返回唯一不同的值                                         | `SELECT DISTINCT column_name FROM table_name;`        |
| 20   | DROP       | 用于删除数据库、表、索引、触发器等                           | `DROP TABLE table_name;`                              |
| 21   | EXISTS     | 用于测试子查询是否为空                                       | `SELECT column_name FROM table_name WHERE EXISTS (subquery);` |
| 22   | FOREIGN    | 用于定义外键                                                 | `CREATE TABLE table_name (column_name datatype, FOREIGN KEY (column_name) REFERENCES another_table(column_name));` |
| 23   | FROM       | 用于指定要查询数据的表名或表达式                             | `SELECT * FROM table_name;`                           |
| 24   | GROUP      | 用于将查询结果分组                                           | `SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;` |
| 25   | HAVING     | 用于在 GROUP BY 子句中指定条件                               | `SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name HAVING condition;` |
| 26   | INDEX      | 用于创建或删除索引                                           | `CREATE INDEX index_name ON table_name(column_name);` |
| 27   | INSERT     | 用于将新行插入表中                                           | `INSERT INTO table_name (column1, column2) VALUES (value1, value2);` |
| 28   | INNER      | 用于根据连接条件返回匹配行                                   | `SELECT * FROM table1 INNER JOIN table2 ON table1.column_name = table2.column_name;` |
| 29   | INTO       | 用于将查询结果插入表中                                       | `INSERT INTO table_name (column1, column2) SELECT column1, column2 FROM another_table_name;` |
| 30   | IS         | 用于测试表达式是否为 true、false 或未知                      | `SELECT * FROM table_name WHERE column_name IS NULL;` |
| 31   | JOIN       | 用于将行从两个或多个表中组合起来                             | `SELECT * FROM table1 JOIN table2 ON table1.column_name = table2.column_name;` |
| 32   | KEY        | 用于定义列或列组合的索引                                     | `CREATE TABLE table_name (column1 datatype, column2 datatype, KEY (column1, column2));` |
| 33   | LEFT       | 用于返回从左表（table1）中的所有记录和右表（table2）中的匹配记录 | `SELECT * FROM table1 LEFT JOIN table2 ON table1.column_name = table2.column_name;` |
| 34   | LIKE       | 用于搜索与指定模式匹配的数据                                 | `SELECT * FROM table_name WHERE column_name LIKE pattern;` |
| 35   | LIMIT      | 用于限制结果集的数量                                         | `SELECT * FROM table_name LIMIT number;`              |
| 36   | MAX        | 用于计算数值列的最大值                                       | `SELECT MAX(column_name) FROM table_name;`            |
| 37   | MIN        | 用于计算数值列的最小值                                       | `SELECT MIN(column_name) FROM table_name;`            |
| 38   | NOT        | 用于否定条件                                                 | `SELECT * FROM table_name WHERE NOT condition;`       |
| 39   | NULL       | 用于测试值是否为 NULL                                        | `SELECT * FROM table_name WHERE column_name IS NULL;`

## mysql 列出 DML 和 DQL 中会用到的所有关键词，group by ... having 之类的也加上。

以下是 MySQL 中在 DML (Data Manipulation Language) 和 DQL (Data Query Language) 中经常使用的关键词，包括 SELECT 查询语句中的聚合函数和分组语句：

以下是完整的 MySQL 关键词列表，包括 DML、DQL、DDL、以及其他常用的关键词：

### DML (Data Manipulation Language)
1. **SELECT**: 从数据库中检索数据。
2. **INSERT**: 将新行插入数据库表中。
3. **UPDATE**: 更新数据库表中的现有行。
4. **DELETE**: 从数据库表中删除行。
5. **WHERE**: 用于指定条件，过滤要返回的数据。
6. **ORDER BY**: 用于对结果集进行排序。
7. **LIMIT**: 限制结果集的行数。
8. **GROUP BY**: 将结果集按照一个或多个列进行分组。
9. **HAVING**: 在 GROUP BY 中指定条件。
10. **JOIN**: 将两个或多个表中的行组合起来，基于连接条件。
11. **INNER JOIN**: 返回匹配两个表中行的行。
12. **LEFT JOIN**: 返回左表中的所有行，以及右表中匹配的行。
13. **RIGHT JOIN**: 返回右表中的所有行，以及左表中匹配的行。
14. **FULL JOIN**: 返回左表和右表中的所有行，以及匹配的行。
15. **UNION**: 合并两个或多个 SELECT 语句的结果集。

### DDL (Data Definition Language)
1. **CREATE**: 用于创建数据库、表、索引等。
2. **ALTER**: 用于修改数据库对象，如表结构。
3. **DROP**: 用于删除数据库对象，如表、索引等。
4. **TRUNCATE**: 用于删除表中的所有数据。

### DCL (Data Control Language)
1. **GRANT**: 授予用户特定的权限。
2. **REVOKE**: 撤销用户的权限。

### Other Common Keywords
1. **AS**: 用于为列或表指定别名。
2. **AND**: 在 WHERE 子句中将多个条件结合在一起。
3. **OR**: 在 WHERE 子句中指定多个可能的条件。
4. **IN**: 指定条件范围，条件为多个值之一。
5. **BETWEEN**: 指定范围内的条件。
6. **LIKE**: 用于搜索与指定模式匹配的数据。
7. **IS NULL**: 用于测试值是否为 NULL。
8. **IS NOT NULL**: 用于测试值是否不为 NULL。
9. **COUNT()**: 计算选择的行数。
10. **SUM()**: 计算数值列的总和。
11. **AVG()**: 计算数值列的平均值。
12. **MIN()**: 计算数值列的最小值。
13. **MAX()**: 计算数值列的最大值。
14. **DISTINCT**: 返回唯一不同的值。
15. **FROM**: 指定要查询数据的表名或表达式。
16. **AS**: 用于为列或表指定别名。
17. **ON**: 用于指定连接条件。
18. **ASC**: 用于按升序对结果集进行排序。
19. **DESC**: 用于按降序对结果集进行排序。
20. **UNION ALL**: 合并两个或多个 SELECT 语句的结果集，包括重复行。

这些关键词涵盖了 MySQL 中常用的语句和功能，你可以根据需要使用它们。

## 帮我写一个 java 枚举类，列出上面所有的 mysql 关键词，形如：COUNT("COUNT", "计算选择的行数")

以下是更新后的 Java 枚举类，包含了所有 MySQL 关键词及其描述：

```java
public enum MySQLKeyword {
    // DML (Data Manipulation Language)
    SELECT("SELECT", "从数据库中检索数据。"),
    INSERT("INSERT", "将新行插入数据库表中。"),
    UPDATE("UPDATE", "更新数据库表中的现有行。"),
    DELETE("DELETE", "从数据库表中删除行。"),
    WHERE("WHERE", "用于指定条件，过滤要返回的数据。"),
    ORDER_BY("ORDER BY", "用于对结果集进行排序。"),
    LIMIT("LIMIT", "限制结果集的行数。"),
    GROUP_BY("GROUP BY", "将结果集按照一个或多个列进行分组。"),
    HAVING("HAVING", "在 GROUP BY 中指定条件。"),
    JOIN("JOIN", "将两个或多个表中的行组合起来，基于连接条件。"),
    INNER_JOIN("INNER JOIN", "返回匹配两个表中行的行。"),
    LEFT_JOIN("LEFT JOIN", "返回左表中的所有行，以及右表中匹配的行。"),
    RIGHT_JOIN("RIGHT JOIN", "返回右表中的所有行，以及左表中匹配的行。"),
    FULL_JOIN("FULL JOIN", "返回左表和右表中的所有行，以及匹配的行。"),
    UNION("UNION", "合并两个或多个 SELECT 语句的结果集。"),

    // DDL (Data Definition Language)
    CREATE("CREATE", "用于创建数据库、表、索引等。"),
    ALTER("ALTER", "用于修改数据库对象，如表结构。"),
    DROP("DROP", "用于删除数据库对象，如表、索引等。"),
    TRUNCATE("TRUNCATE", "用于删除表中的所有数据。"),

    // DCL (Data Control Language)
    GRANT("GRANT", "授予用户特定的权限。"),
    REVOKE("REVOKE", "撤销用户的权限。"),

    // Other Common Keywords
    AS("AS", "用于为列或表指定别名。"),
    AND("AND", "在 WHERE 子句中将多个条件结合在一起。"),
    OR("OR", "在 WHERE 子句中指定多个可能的条件。"),
    IN("IN", "指定条件范围，条件为多个值之一。"),
    BETWEEN("BETWEEN", "指定范围内的条件。"),
    LIKE("LIKE", "用于搜索与指定模式匹配的数据。"),
    IS_NULL("IS NULL", "用于测试值是否为 NULL。"),
    IS_NOT_NULL("IS NOT NULL", "用于测试值是否不为 NULL。"),
    COUNT("COUNT()", "计算选择的行数。"),
    SUM("SUM()", "计算数值列的总和。"),
    AVG("AVG()", "计算数值列的平均值。"),
    MIN("MIN()", "计算数值列的最小值。"),
    MAX("MAX()", "计算数值列的最大值。"),
    DISTINCT("DISTINCT", "返回唯一不同的值。"),
    FROM("FROM", "指定要查询数据的表名或表达式。"),
    ON("ON", "用于指定连接条件。"),
    ASC("ASC", "用于按升序对结果集进行排序。"),
    DESC("DESC", "用于按降序对结果集进行排序。"),
    UNION_ALL("UNION ALL", "合并两个或多个 SELECT 语句的结果集，包括重复行。");

    private final String keyword;
    private final String description;

    MySQLKeyword(String keyword, String description) {
        this.keyword = keyword;
        this.description = description;
    }

    public String getKeyword() {
        return keyword;
    }

    public String getDescription() {
        return description;
    }
}
```

现在这个枚举类包含了所有 MySQL 关键词以及相应的描述。你可以按需使用这些枚举常量来执行各种 MySQL 操作。

## 给出 mysql 关键词语法文档的网址，及相关学习资料

你可以在 MySQL 官方文档中找到关于 MySQL 关键字的详细信息。

以下是 MySQL 官方文档的网址：

[MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

在该文档中，你可以找到关于 MySQL 中所有语句、函数、关键字等的详尽说明。

此外，以下是一些学习 MySQL 的相关资源：

1. [MySQL Tutorial](https://www.mysqltutorial.org/): 一个面向初学者的 MySQL 教程，从基础知识到高级概念都有涵盖。

2. [W3Schools MySQL Tutorial](https://www.w3schools.com/sql/sql_intro.asp): W3Schools 提供的 MySQL 教程，包含了大量的例子和练习，适合快速入门和参考。

3. [Coursera - Learn SQL Basics for Data Science](https://www.coursera.org/learn/sql-basics): 由 Coursera 提供的在线课程，适合想要系统学习 SQL 的人群。

4. [MySQL YouTube Channel](https://www.youtube.com/user/MySQL): MySQL 官方 YouTube 频道，提供了许多关于 MySQL 的视频教程和演示。

5. [MySQL Documentation](https://dev.mysql.com/doc/): MySQL 官方文档，提供了详尽的 MySQL 相关资料和文档，适合进行深入学习和参考。

这些资源将帮助你建立对 MySQL 的扎实理解，并能够熟练使用 MySQL 进行数据库管理和查询操作。



# 参考资料

https://www.cnblogs.com/yuchuan/p/mysql_keyword.html

* any list
{:toc}