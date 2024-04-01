---
layout: post
title: mysql Tutorial-20-functions 函数
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql 的 function 函数速览

在MySQL中，函数（Function）是一种用于执行特定任务并返回结果的命名代码块。

MySQL提供了丰富的内置函数，涵盖了各种常见的任务，如数学计算、字符串处理、日期时间操作等。

## 说明

### 1. 数值函数（Numeric Functions）：
- 包括数学计算函数、四舍五入函数等，如`ABS()`、`ROUND()`、`CEIL()`、`FLOOR()`等。

### 2. 字符串函数（String Functions）：
- 用于处理字符串的函数，如字符串拼接、长度计算、大小写转换等，如`CONCAT()`、`LENGTH()`、`UPPER()`、`LOWER()`等。

### 3. 日期和时间函数（Date and Time Functions）：
- 用于处理日期和时间的函数，如日期格式化、日期计算、时区转换等，如`DATE_FORMAT()`、`DATE_ADD()`、`NOW()`、`TIMESTAMPDIFF()`等。

### 4. 聚合函数（Aggregate Functions）：
- 用于对数据进行聚合计算的函数，如求和、平均值、最大值、最小值等，如`SUM()`、`AVG()`、`MAX()`、`MIN()`等。

### 5. 控制流函数（Control Flow Functions）：
- 用于执行条件判断和流程控制的函数，如`IF()`、`CASE WHEN`等。

### 6. 系统函数（System Functions）：
- 提供了一些与系统和数据库相关的函数，如当前用户、当前数据库等，如`USER()`、`DATABASE()`等。

### 7. 加密函数（Encryption Functions）：
- 用于数据加密和解密的函数，如`AES_ENCRYPT()`、`AES_DECRYPT()`等。

### 8. JSON函数（JSON Functions）：
- 用于处理JSON格式数据的函数，如提取JSON字段、JSON数组操作等，如`JSON_EXTRACT()`、`JSON_ARRAY()`等。

### 9. 用户自定义函数（User-Defined Functions）：
- 用户可以创建自定义函数来扩展MySQL的功能，这些函数可以用C或C++编写，并通过动态链接库加载到MySQL中。

### 注意事项：
- 在使用函数时，应根据需要选择合适的函数，并注意函数的参数和返回值类型。
- 应当注意函数的性能和效率，避免在大数据量情况下过度使用函数，可能会影响查询性能。
- 需要注意函数的使用限制和兼容性，不同的MySQL版本可能会对函数的支持和行为有所不同。

## 示例：

下面是一些使用MySQL内置函数的示例：

```
mysql> -- 数值函数示例
mysql> SELECT ABS(-10), ROUND(3.1415926, 2), CEIL(3.5), FLOOR(3.5);
+----------+---------------------+-----------+------------+
| ABS(-10) | ROUND(3.1415926, 2) | CEIL(3.5) | FLOOR(3.5) |
+----------+---------------------+-----------+------------+
|       10 |                3.14 |         4 |          3 |
+----------+---------------------+-----------+------------+
1 row in set (0.01 sec)

mysql>
mysql> -- 字符串函数示例
mysql> SELECT CONCAT('Hello', 'World'), LENGTH('MySQL'), UPPER('mysql'), LOWER('MYSQL');
+--------------------------+-----------------+----------------+----------------+
| CONCAT('Hello', 'World') | LENGTH('MySQL') | UPPER('mysql') | LOWER('MYSQL') |
+--------------------------+-----------------+----------------+----------------+
| HelloWorld               |               5 | MYSQL          | mysql          |
+--------------------------+-----------------+----------------+----------------+
1 row in set (0.00 sec)

mysql>
mysql> -- 日期和时间函数示例
mysql> SELECT DATE_FORMAT(NOW(), '%Y-%m-%d'), DATE_ADD(NOW(), INTERVAL 1 DAY), TIMESTAMPDIFF(SECOND, '2022-01-01', NOW());
+--------------------------------+---------------------------------+--------------------------------------------+
| DATE_FORMAT(NOW(), '%Y-%m-%d') | DATE_ADD(NOW(), INTERVAL 1 DAY) | TIMESTAMPDIFF(SECOND, '2022-01-01', NOW()) |
+--------------------------------+---------------------------------+--------------------------------------------+
| 2024-04-01                     | 2024-04-02 10:02:59             |                                   70970579 |
+--------------------------------+---------------------------------+--------------------------------------------+
1 row in set (0.00 sec)

mysql>
mysql> -- 聚合函数示例
mysql> SELECT SUM(salary), AVG(age), MAX(score), MIN(price) FROM employees;
ERROR 1146 (42S02): Table 'mysql_learn.employees' doesn't exist
mysql>
mysql> -- 控制流函数示例
mysql> SELECT IF(age >= 18, 'Adult', 'Minor') FROM persons;
ERROR 1146 (42S02): Table 'mysql_learn.persons' doesn't exist
mysql>
mysql> -- 系统函数示例
mysql> SELECT USER(), DATABASE();
+-----------------+-------------+
| USER()          | DATABASE()  |
+-----------------+-------------+
| admin@localhost | mysql_learn |
+-----------------+-------------+
1 row in set (0.00 sec)

mysql>
mysql> -- 加密函数示例
mysql> SELECT AES_ENCRYPT('password', 'secret'), AES_DECRYPT('encrypted_string', 'secret');
+-----------------------------------+-------------------------------------------+
| AES_ENCRYPT('password', 'secret') | AES_DECRYPT('encrypted_string', 'secret') |
+-----------------------------------+-------------------------------------------+
| Nǃ}7¼ùÖb£VM̷                         | NULL                                      |
+-----------------------------------+-------------------------------------------+
1 row in set (0.00 sec)

mysql>
mysql> -- JSON函数示例
mysql> SELECT JSON_EXTRACT('{"name": "John", "age": 30}', '$.name'), JSON_ARRAY(1, 2, 3);
+-------------------------------------------------------+---------------------+
| JSON_EXTRACT('{"name": "John", "age": 30}', '$.name') | JSON_ARRAY(1, 2, 3) |
+-------------------------------------------------------+---------------------+
| "John"                                                | [1, 2, 3]           |
+-------------------------------------------------------+---------------------+
1 row in set (0.00 sec)
```



# 1. 数值函数（Numeric Functions）详细介绍+例子

数值函数（Numeric Functions）是用于对数字进行操作和计算的函数。

MySQL提供了多种数值函数，包括数学计算函数、四舍五入函数、取整函数等。

以下是对MySQL中常用数值函数的详细介绍和示例：

### 1. ABS(x)：
- 返回参数x的绝对值。
- 参数x可以是任何数值类型。
  
**示例：**
```sql
SELECT ABS(-10); -- 返回结果为10
SELECT ABS(10); -- 返回结果为10
```

### 2. ROUND(x, d)：
- 返回参数x的四舍五入值，保留小数点后d位。
- 参数x是需要四舍五入的数字，d是保留的小数位数。

**示例：**
```sql
SELECT ROUND(3.14159, 2); -- 返回结果为3.14
SELECT ROUND(3.14159, 0); -- 返回结果为3
```

### 3. CEIL(x)：
- 返回不小于参数x的最小整数值。
- 参数x可以是任何数值类型。

**示例：**
```sql
SELECT CEIL(3.5); -- 返回结果为4
SELECT CEIL(-3.5); -- 返回结果为-3
```

### 4. FLOOR(x)：
- 返回不大于参数x的最大整数值。
- 参数x可以是任何数值类型。

**示例：**
```sql
SELECT FLOOR(3.5); -- 返回结果为3
SELECT FLOOR(-3.5); -- 返回结果为-4
```

### 5. RAND()：
- 返回一个0到1之间的随机数。
- 每次调用`RAND()`函数都会返回一个新的随机数。

**示例：**
```sql
SELECT RAND(); -- 返回0到1之间的随机数
```

### 6. SQRT(x)：
- 返回参数x的平方根。
- 参数x必须是非负数。

**示例：**
```sql
SELECT SQRT(16); -- 返回结果为4
```

### 7. POW(x, y)：
- 返回x的y次方。
- 参数x和y可以是任何数值类型。

**示例：**
```sql
SELECT POW(2, 3); -- 返回结果为8
```

### 注意事项：

- 在使用数值函数时，需要注意参数的类型和范围，避免出现错误或不一致的结果。
- 在进行数值计算时，应考虑数值的精度和溢出问题，避免出现数据不准确或错误的情况。
- 部分数值函数的行为在不同的数据库管理系统中可能会有所不同，需要根据具体情况进行调整和使用。

# 2. 字符串函数（String Functions）详细介绍+例子

字符串函数（String Functions）是用于对字符串进行操作和处理的函数。

MySQL提供了丰富的字符串函数，包括字符串连接、字符串截取、字符串替换等。

以下是对MySQL中常用字符串函数的详细介绍和示例：

### 1. CONCAT(str1, str2, ...)：
- 将多个字符串连接成一个字符串。
- 参数可以是任意数量的字符串。

**示例：**
```sql
SELECT CONCAT('Hello', ' ', 'World'); -- 返回结果为'Hello World'
```

### 2. LENGTH(str)：
- 返回字符串的长度。
- 参数str是要计算长度的字符串。

**示例：**
```sql
SELECT LENGTH('MySQL'); -- 返回结果为5
```

### 3. UPPER(str) / LOWER(str)：
- 将字符串转换为大写 / 小写。
- 参数str是要转换大小写的字符串。

**示例：**
```sql
SELECT UPPER('mysql'), LOWER('MySQL'); -- 返回结果为'MYSQL', 'mysql'
```

### 4. SUBSTRING(str, start, length) / SUBSTR(str, start, length)：
- 返回从字符串中指定位置开始的指定长度的子字符串。
- 参数str是要截取子字符串的原始字符串，start是起始位置，length是截取的长度。
- 如果省略length参数，则返回从start位置开始到字符串末尾的所有字符。

**示例：**
```sql
SELECT SUBSTRING('MySQL', 2, 3); -- 返回结果为'SQL'
```

### 5. REPLACE(str, from_str, to_str)：
- 将字符串中的所有from_str替换为to_str。
- 参数str是要替换的原始字符串，from_str是要替换的子字符串，to_str是替换后的字符串。

**示例：**
```sql
SELECT REPLACE('Hello World', 'World', 'MySQL'); -- 返回结果为'Hello MySQL'
```

### 6. TRIM([LEADING | TRAILING | BOTH] trim_str FROM str)：
- 移除字符串的前导、尾随或两侧的空格或指定字符。
- 参数trim_str是要移除的字符，可以省略，默认为移除空格。
- 参数FROM str是要处理的原始字符串。

**示例：**
```sql
SELECT TRIM('   MySQL   '); -- 返回结果为'MySQL'
SELECT TRIM(LEADING '0' FROM '000123'); -- 返回结果为'123'
SELECT TRIM(BOTH 'x' FROM 'xxxMySQLxxx'); -- 返回结果为'MySQL'
```

### 7. CONCAT_WS(separator, str1, str2, ...)：
- 将多个字符串使用指定的分隔符连接成一个字符串。
- 参数separator是分隔符，str1, str2, ...是要连接的字符串。

**示例：**
```sql
SELECT CONCAT_WS('-', '2022', '01', '01'); -- 返回结果为'2022-01-01'
```

### 注意事项：

- 在使用字符串函数时，需要注意参数的类型和长度，避免出现截断或错误的结果。

- 部分字符串函数的行为在不同的数据库管理系统中可能会有所不同，需要根据具体情况进行调整和使用。


# 3. 日期和时间函数（Date and Time Functions）详细介绍+例子

日期和时间函数（Date and Time Functions）用于对日期和时间进行操作和计算。

MySQL提供了多种日期和时间函数，包括日期格式化、日期计算、日期比较等。

以下是对MySQL中常用日期和时间函数的详细介绍和示例：

### 1. NOW()：
- 返回当前日期和时间。
  
**示例：**
```sql
SELECT NOW(); -- 返回当前日期和时间
```

### 2. CURDATE() / CURRENT_DATE：
- 返回当前日期（不包含时间部分）。
  
**示例：**
```sql
SELECT CURDATE(); -- 返回当前日期
```

### 3. CURTIME() / CURRENT_TIME：
- 返回当前时间（不包含日期部分）。
  
**示例：**
```sql
SELECT CURTIME(); -- 返回当前时间
```

### 4. DATE_FORMAT(date, format)：
- 格式化日期和时间。
- 参数date是要格式化的日期或时间，format是格式化的格式。

**示例：**
```sql
SELECT DATE_FORMAT(NOW(), '%Y-%m-%d'); -- 返回当前日期的年月日格式
```

### 5. DATE_ADD(date, INTERVAL expr unit)：
- 在日期上添加一定的时间间隔。
- 参数date是原始日期，expr是要添加的时间量，unit是时间单位。

**示例：**
```sql
SELECT DATE_ADD(NOW(), INTERVAL 1 DAY); -- 返回当前日期的后一天日期
```

### 6. DATEDIFF(date1, date2)：
- 计算两个日期之间的天数差。
- 参数date1和date2是要比较的两个日期。

**示例：**
```sql
SELECT DATEDIFF('2022-01-01', '2021-12-31'); -- 返回结果为1
```

### 7. TIMESTAMPDIFF(unit, start, end)：
- 计算两个日期或时间之间的差值。
- 参数unit是时间单位，start和end是要比较的两个日期或时间。

**示例：**
```sql
SELECT TIMESTAMPDIFF(DAY, '2022-01-01', '2022-01-10'); -- 返回结果为9
```

### 8. DAYOFWEEK(date)：
- 返回日期对应的星期几，范围为1到7，1代表星期日，7代表星期六。
  
**示例：**
```sql
SELECT DAYOFWEEK('2022-04-01'); -- 返回结果为6（星期五）
```

### 注意事项：

- 在使用日期和时间函数时，需要注意参数的类型和格式，避免出现错误或不一致的结果。

- 部分日期和时间函数的行为在不同的数据库管理系统中可能会有所不同，需要根据具体情况进行调整和使用。

# 4. 聚合函数（Aggregate Functions）详细介绍+例子

聚合函数（Aggregate Functions）用于对一组值进行聚合计算，如求和、平均值、最大值、最小值等。

在MySQL中，常用的聚合函数包括SUM、AVG、MAX、MIN等。

以下是对MySQL中常用的聚合函数的详细介绍和示例：

### 1. SUM(expression)：
- 计算指定列或表达式的总和。
- expression是要进行求和的列或表达式。

**示例：**
```sql
SELECT SUM(salary) FROM employees; -- 计算员工工资的总和
```

### 2. AVG(expression)：
- 计算指定列或表达式的平均值。
- expression是要进行平均值计算的列或表达式。

**示例：**
```sql
SELECT AVG(age) FROM persons; -- 计算人员年龄的平均值
```

### 3. MAX(expression)：
- 计算指定列或表达式的最大值。
- expression是要进行最大值计算的列或表达式。

**示例：**
```sql
SELECT MAX(salary) FROM employees; -- 获取员工工资的最高值
```

### 4. MIN(expression)：
- 计算指定列或表达式的最小值。
- expression是要进行最小值计算的列或表达式。

**示例：**
```sql
SELECT MIN(salary) FROM employees; -- 获取员工工资的最低值
```

### 5. COUNT(expression)：
- 计算指定列或表达式的行数（非NULL值的数量）。
- expression是要进行行数计算的列或表达式。如果expression为星号（*），则计算所有行的数量。

**示例：**
```sql
SELECT COUNT(*) FROM employees; -- 计算员工表中的总行数
SELECT COUNT(DISTINCT department) FROM employees; -- 计算员工表中不同部门的数量
```

### 注意事项：

- 在使用聚合函数时，需要注意参数的类型和范围，避免出现错误或不一致的结果。

- COUNT函数可以用于计算行数，也可以用于计算非NULL值的数量。

- 部分聚合函数的行为在不同的数据库管理系统中可能会有所不同，需要根据具体情况进行调整和使用。


# 5. 控制流函数（Control Flow Functions）详细介绍+例子

控制流函数（Control Flow Functions）用于执行条件判断和流程控制，根据条件决定返回的值或执行的操作。

在MySQL中，常用的控制流函数包括IF、CASE WHEN等。

以下是对MySQL中常用的控制流函数的详细介绍和示例：

### 1. IF(expr, true_value, false_value)：

- 根据条件表达式的值返回不同的结果。

- 如果expr为真，则返回true_value；否则返回false_value。

**示例：**
```sql
SELECT IF(5 > 3, 'Yes', 'No'); -- 返回结果为'Yes'
```

### 2. CASE WHEN expression THEN result [WHEN ...] [ELSE result] END：

- 根据条件判断返回不同的结果。

- 当expression满足某个条件时，返回对应的result；如果没有满足任何条件，则返回ELSE后面的result（如果有）。

**示例：**
```sql
SELECT 
    CASE 
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        ELSE 'D'
    END AS grade
FROM students;
```

PS: 这个类似于 java 处理中的 switch ... case ....

### 注意事项：

- 控制流函数用于根据条件决定返回的值或执行的操作，可以根据具体情况选择合适的函数进行流程控制。

- IF函数适用于简单的条件判断，而CASE WHEN适用于复杂的条件判断和多个条件的判断。

# 6. 系统函数（System Functions）详细介绍+例子

系统函数（System Functions）是用于获取和操作系统相关信息的函数。

在MySQL中，常用的系统函数包括VERSION、DATABASE、USER等。

以下是对MySQL中常用的系统函数的详细介绍和示例：

### 1. VERSION()：
- 返回MySQL服务器的版本信息。

**示例：**
```sql
SELECT VERSION(); -- 返回MySQL服务器的版本信息
```

### 2. DATABASE()：
- 返回当前数据库的名称。

**示例：**
```sql
SELECT DATABASE(); -- 返回当前数据库的名称
```

### 3. USER() / CURRENT_USER()：
- 返回当前MySQL用户的用户名和主机名。

**示例：**
```sql
SELECT USER(), CURRENT_USER(); -- 返回当前MySQL用户的用户名和主机名
```

### 4. CONNECTION_ID()：
- 返回当前连接的连接ID。

**示例：**
```sql
SELECT CONNECTION_ID(); -- 返回当前连接的连接ID
```

### 5. LAST_INSERT_ID()：
- 返回最后插入操作生成的自增ID值。

**示例：**
```sql
SELECT LAST_INSERT_ID(); -- 返回最后插入操作生成的自增ID值
```

### 6. UUID()：
- 返回一个UUID（Universally Unique Identifier）值。

**示例：**
```sql
SELECT UUID(); -- 返回一个UUID值
```

### 注意事项：

- 系统函数用于获取和操作系统相关信息，可以根据具体需求选择合适的函数进行使用。

- 系统函数的行为和返回值可能会受到MySQL版本和配置的影响，需要注意兼容性和可靠性。


# 7. 加密函数（Encryption Functions）详细介绍+例子

在MySQL中，加密函数（Encryption Functions）用于对数据进行加密和解密操作。这些函数可以用于加密敏感信息，以确保数据在传输和存储过程中的安全性。以下是对MySQL中常用的加密函数的详细介绍和示例：

## 说明

### 1. ENCRYPT(str [,salt])：
- 对字符串进行单向加密。
- 参数str是要加密的字符串，salt是可选参数，用于增加加密强度。

**示例：**
```sql
SELECT ENCRYPT('password'); -- 返回经过加密后的密码
```

实际测试一下：

```
mysql> SELECT ENCRYPT('password');
+---------------------+
| ENCRYPT('password') |
+---------------------+
| NULL                |
+---------------------+
1 row in set, 1 warning (0.00 sec) 
```

为啥直接返回 NULL？

在MySQL中，`ENCRYPT()`函数默认使用的是DES算法进行加密，而自MySQL 5.7.6版本开始，默认已经不再支持DES算法。

因此，如果尝试在MySQL 5.7.6及更新版本中使用`ENCRYPT()`函数，会直接返回NULL。

若您需要在MySQL中进行加密操作，推荐使用其他加密函数，如`MD5()`、`SHA1()`、`SHA2()`等。这些函数在较新的MySQL版本中仍然被支持，并且提供了更安全的加密算法。

### 2. MD5(str)：
- 对字符串进行MD5哈希加密。
- 参数str是要加密的字符串。

**示例：**
```sql
SELECT MD5('password'); -- 返回经过MD5哈希加密后的字符串 5f4dcc3b5aa765d61d8327deb882cf99
```

### 3. SHA1(str)：
- 对字符串进行SHA-1哈希加密。
- 参数str是要加密的字符串。

**示例：**
```sql
SELECT SHA1('password'); -- 返回经过SHA-1哈希加密后的字符串 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
```

### 4. SHA2(str, hash_length)：
- 对字符串进行SHA-2哈希加密。
- 参数str是要加密的字符串，hash_length是哈希值的长度（可选参数，默认为256位）。

**示例：**
```sql
SELECT SHA2('password', 256); -- 返回经过SHA-2哈希加密后的字符串 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
```

### 注意事项：

- 加密函数用于对数据进行加密操作，但是一般情况下是单向加密，无法解密。

- 在选择加密算法时，应根据具体需求和安全要求选择合适的算法。

- 加密函数的行为和返回值可能会受到MySQL版本和配置的影响，需要注意兼容性和安全性。

# 8. JSON函数（JSON Functions）详细介绍+例子

JSON函数（JSON Functions）用于在MySQL中对JSON格式的数据进行操作和处理。

这些函数允许您从JSON数据中提取信息、修改JSON数据、创建新的JSON对象等。

以下是对MySQL中常用的JSON函数的详细介绍和示例：

### 1. JSON_EXTRACT(json_doc, path)：
- 从JSON文档中提取指定路径的值。
- 参数json_doc是要提取值的JSON文档，path是要提取的路径。

**示例：**
```sql
SELECT JSON_EXTRACT('{"name": "John", "age": 30}', '$.name'); -- 返回结果为'John'
```

### 2. JSON_SET(json_doc, path, value[, path, value]...)：
- 设置JSON文档中指定路径的值。
- 参数json_doc是要修改的JSON文档，path是要修改的路径，value是要设置的值。

**示例：**
```sql
SELECT JSON_SET('{"name": "John", "age": 30}', '$.age', 40); -- 返回结果为'{"name": "John", "age": 40}'
```

### 3. JSON_ARRAY([value, ...])：
- 创建一个JSON数组。
- 可以接受任意数量的值作为数组元素。

**示例：**
```sql
SELECT JSON_ARRAY('apple', 'banana', 'orange'); -- 返回结果为'["apple", "banana", "orange"]'
```

### 4. JSON_OBJECT(key, value[, key, value]...)：
- 创建一个JSON对象。
- 参数key和value依次对应JSON对象的键和值。

**示例：**
```sql
SELECT JSON_OBJECT('name', 'John', 'age', 30); -- 返回结果为'{"name": "John", "age": 30}'
```

### 5. JSON_ARRAY_APPEND(json_doc, path, val[, path, val]...)：
- 向JSON数组的末尾添加一个或多个元素。
- 参数json_doc是要修改的JSON文档，path是要添加元素的数组路径，val是要添加的值。

**示例：**
```sql
SELECT JSON_ARRAY_APPEND('[1, 2]', '$', 3); -- 返回结果为'[1, 2, 3]'
```

### 6. JSON_ARRAY_INSERT(json_doc, path, val[, path, val]...)：
- 在JSON数组的指定位置插入一个或多个元素。
- 参数json_doc是要修改的JSON文档，path是要插入元素的数组路径，val是要插入的值。

**示例：**
```sql
SELECT JSON_ARRAY_INSERT('[1, 3]', '$[1]', 2); -- 返回结果为'[1, 2, 3]'
```

### 注意事项：
- JSON函数提供了丰富的功能，可以对JSON数据进行灵活的操作和处理。
- 在使用JSON函数时，需要注意参数的格式和路径，确保正确操作JSON数据。
- 部分JSON函数的行为在不同的MySQL版本中可能会有所不同，需要注意兼容性和功能支持。

# 拓展阅读

用户自定义函数（User-Defined Functions，UDF）是由用户编写的、用于扩展MySQL功能的自定义函数。

用户可以使用C或C++编写自己的函数，并将其编译成动态链接库（DLL或SO文件），然后加载到MySQL中。

一旦加载成功，用户自定义函数就可以像内置函数一样在SQL查询中使用。

以下是用户自定义函数的详细介绍：

## 说明

### 1. 创建自定义函数：
- 首先，用户需要使用C或C++编写自己的函数代码，并将其编译成动态链接库（DLL或SO文件）。
- 在编写代码时，需要遵循MySQL定义的UDF接口，包括函数名称、参数数量和类型、返回值类型等。
- 创建完成动态链接库后，可以使用MySQL提供的`CREATE FUNCTION`语句将自定义函数加载到MySQL中。

### 2. 加载自定义函数：
- 使用`CREATE FUNCTION`语句将自定义函数加载到MySQL中。
- 在`CREATE FUNCTION`语句中，需要指定函数名称、动态链接库路径、函数符号等信息。
- 加载完成后，用户自定义函数就可以在数据库中使用了。

### 3. 使用自定义函数：
- 加载完成后，用户自定义函数可以像内置函数一样在SQL查询中使用。
- 可以在SELECT语句、WHERE语句、GROUP BY语句等任何地方调用自定义函数，并使用其返回的结果。

### 4. 卸载自定义函数：
- 使用`DROP FUNCTION`语句可以从MySQL中卸载用户自定义函数。
- 在`DROP FUNCTION`语句中，需要指定要卸载的函数名称。

### 5. 注意事项：
- 在编写自定义函数时，需要仔细了解MySQL的UDF接口和规范，确保函数的参数和返回值类型与MySQL的要求一致。
- 自定义函数的性能和安全性需谨慎考虑，避免出现内存泄漏、缓冲区溢出等问题。
- 加载自定义函数时，需要确保动态链接库的路径正确，并具有执行权限。
- 在使用自定义函数时，需要注意函数的命名规范和调用方式，避免与已有的内置函数冲突。
- 在卸载自定义函数时，需要确保没有任何正在使用该函数的查询或连接，否则会出现错误。

### 示例：

下面是一个简单的示例，展示了如何创建、加载和使用一个简单的用户自定义函数：

1. 编写自定义函数的源代码，保存为`my_udf.c`文件：

```c
#include <stdio.h>
#include <string.h>
#include <mysql.h>

my_bool my_udf_init(UDF_INIT *initid, UDF_ARGS *args, char *message);
void my_udf_deinit(UDF_INIT *initid);
double my_udf(UDF_INIT *initid, UDF_ARGS *args, char *is_null, char *error);

my_bool my_udf_init(UDF_INIT *initid, UDF_ARGS *args, char *message) {
    // 检查参数数量是否正确
    if (args->arg_count != 2) {
        strcpy(message, "my_udf requires two arguments");
        return 1;
    }
    // 检查参数类型是否正确
    if (args->arg_type[0] != REAL_RESULT || args->arg_type[1] != REAL_RESULT) {
        strcpy(message, "my_udf requires real arguments");
        return 1;
    }
    return 0;
}

void my_udf_deinit(UDF_INIT *initid) {
    // 清理函数资源
}

double my_udf(UDF_INIT *initid, UDF_ARGS *args, char *is_null, char *error) {
    // 计算两个实数参数的平均值并返回
    double result = (args->args[0] + args->args[1]) / 2.0;
    return result;
}
```

2. 编译自定义函数源代码为动态链接库：

```bash
gcc -shared -o my_udf.so my_udf.c -I/usr/include/mysql
```

3. 将动态链接库加载到MySQL中：

```sql
CREATE FUNCTION my_udf RETURNS REAL SONAME 'my_udf.so';
```

4. 在SQL查询中使用自定义函数：

```sql
SELECT my_udf(10, 20); -- 返回结果为15
```

# 参考资料

https://www.tutorialspoint.com/mysql/mysql-data-types.htm

* any list
{:toc}