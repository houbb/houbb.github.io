---
layout: post
title: mysql Tutorial-15-operator 操作符号
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# operator 操作符号

在 MySQL 中，操作符（Operator）用于在查询中执行比较、计算和逻辑操作。MySQL 支持各种类型的操作符，包括比较操作符、逻辑操作符、算术操作符等。以下是对 MySQL 中常用操作符的详细介绍：

### 1. 比较操作符（Comparison Operators）：

比较操作符用于比较两个值，并返回一个布尔值（TRUE 或 FALSE）作为结果。

常用的比较操作符包括：

- `=`：等于
- `<>` 或 `!=`：不等于
- `<`：小于
- `>`：大于
- `<=`：小于等于
- `>=`：大于等于
- `BETWEEN`：在指定范围内
- `LIKE`：模式匹配
- `IN`：匹配一个列表中的任何值
- `IS NULL`：检查是否为 NULL 值
- `IS NOT NULL`：检查是否不为 NULL 值

### 2. 逻辑操作符（Logical Operators）：

逻辑操作符用于在条件表达式中组合多个条件，并返回一个布尔值作为结果。常用的逻辑操作符包括：

- `AND`：逻辑 AND，所有条件都为真时返回 TRUE
- `OR`：逻辑 OR，至少有一个条件为真时返回 TRUE
- `NOT`：逻辑 NOT，取反操作

### 3. 算术操作符（Arithmetic Operators）：

算术操作符用于执行数学运算，例如加法、减法、乘法和除法。常用的算术操作符包括：

- `+`：加法
- `-`：减法
- `*`：乘法
- `/`：除法
- `%`：取模（返回除法的余数）

### 4. 位操作符（Bitwise Operators）：

位操作符用于在二进制位级别上执行逻辑运算。常用的位操作符包括：

- `&`：按位 AND
- `|`：按位 OR
- `^`：按位 XOR
- `~`：按位取反
- `<<`：左移
- `>>`：右移

### 5. 其他操作符：

除了上述常用操作符之外，MySQL 还支持一些其他类型的操作符，如字符串连接操作符 `||`、

空间操作符等。

### 注意事项：

- 在使用操作符时，应注意数据类型的兼容性，以避免不必要的错误。

- 在构建复杂的查询条件时，应谨慎使用逻辑操作符，确保逻辑表达式的正确性和可读性。

- 在执行数学运算时，应注意数据类型的精度和范围，以避免计算结果溢出或损失精度。

综上所述，操作符在 MySQL 查询中起着非常重要的作用，通过合理使用不同类型的操作符，可以构建出灵活、高效的查询条件，实现各种数据处理和分析需求。

# 比较操作符

在 MySQL 中，比较操作符用于比较两个值，并返回一个布尔值（TRUE 或 FALSE）作为结果。

这些操作符允许你在查询中执行各种比较操作，例如检查值是否相等、是否大于或小于等等。

以下是对 MySQL 中常用比较操作符的详细介绍：

### 1. `=`：等于
用于检查两个值是否相等。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name = value;
```

### 2. `<>` 或 `!=`：不等于
用于检查两个值是否不相等。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name <> value;
```

### 3. `<`：小于
用于检查一个值是否小于另一个值。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name < value;
```

### 4. `>`：大于
用于检查一个值是否大于另一个值。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name > value;
```

### 5. `<=`：小于等于
用于检查一个值是否小于或等于另一个值。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name <= value;
```

### 6. `>=`：大于等于
用于检查一个值是否大于或等于另一个值。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name >= value;
```

### 7. `BETWEEN`：在指定范围内
用于检查一个值是否在指定的范围内（闭区间）。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name BETWEEN min_value AND max_value;
```

### 8. `LIKE`：模式匹配
用于在查询中进行模式匹配，通常与通配符一起使用。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name LIKE pattern;
```

### 9. `IN`：匹配一个列表中的任何值
用于检查一个值是否在给定的值列表中。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name IN (value1, value2, ...);
```

### 10. `IS NULL`：检查是否为 NULL 值
用于检查一个值是否为 NULL。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name IS NULL;
```

### 11. `IS NOT NULL`：检查是否不为 NULL 值
用于检查一个值是否不为 NULL。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name IS NOT NULL;
```

# 逻辑操作符

在 MySQL 中，逻辑操作符用于在条件表达式中组合多个条件，并返回一个布尔值（TRUE 或 FALSE）作为结果。

这些操作符允许你构建复杂的逻辑条件，以便对数据进行更精确的筛选和分析。

以下是 MySQL 中常用的逻辑操作符的详细介绍：

### 1. `AND`：逻辑 AND

`AND` 操作符用于连接两个条件，只有当两个条件都为真时，整个表达式才为真。

**示例：**
```sql
SELECT * FROM table_name WHERE condition1 AND condition2;
```

### 2. `OR`：逻辑 OR

`OR` 操作符用于连接两个条件，只要其中一个条件为真，整个表达式就为真。

**示例：**
```sql
SELECT * FROM table_name WHERE condition1 OR condition2;
```

### 3. `NOT`：逻辑 NOT

`NOT` 操作符用于对条件进行取反操作，即如果条件为真，则返回 FALSE，如果条件为假，则返回 TRUE。

**示例：**
```sql
SELECT * FROM table_name WHERE NOT condition;
```

### 4. 逻辑操作符的优先级：

在构建复杂的逻辑条件时，逻辑操作符的优先级非常重要。

MySQL 中逻辑操作符的优先级如下（从高到低）：

1. `NOT`
2. `AND`
3. `OR`

你也可以使用圆括号来明确指定操作符的执行顺序，以确保表达式的逻辑正确性。

**示例：**
```sql
SELECT * FROM table_name WHERE condition1 AND (condition2 OR condition3);
```

### 5. 注意事项：

- 在构建复杂的逻辑条件时，应考虑到操作符的优先级，以避免产生意外的结果。

- 在使用 `NOT` 操作符时，应注意条件的取反效果，确保逻辑表达式的正确性。

- 在查询中合理使用逻辑操作符，可以构建出更精确和准确的查询条件，提高查询的效率和性能。

这些逻辑操作符在 MySQL 中用于构建复杂的查询条件，以满足各种数据分析和筛选的需求。

通过合理使用逻辑操作符，你可以根据特定的条件组合出所需的数据集。

# 算术操作符

在 MySQL 中，算术操作符用于执行数学运算，例如加法、减法、乘法和除法。

这些操作符允许你在查询中对数值进行计算，以便进行各种数据处理和分析。以下是 MySQL 中常用的算术操作符的详细介绍：

### 1. `+`：加法

用于将两个数相加。

**示例：**

```sql
SELECT column1 + column2 AS sum FROM table_name;
```

### 2. `-`：减法

用于将一个数减去另一个数。

**示例：**
```sql
SELECT column1 - column2 AS difference FROM table_name;
```

### 3. `*`：乘法

用于将两个数相乘。

**示例：**
```sql
SELECT column1 * column2 AS product FROM table_name;
```

### 4. `/`：除法

用于将一个数除以另一个数。

**示例：**
```sql
SELECT column1 / column2 AS quotient FROM table_name;
```

### 5. `%`：取模

用于计算两个数相除后的余数。

**示例：**
```sql
SELECT column1 % column2 AS remainder FROM table_name;
```

### 注意事项：

- 在执行除法操作时，应注意被除数不能为零，否则会导致错误。

- 在执行算术运算时，应注意数据类型的兼容性和精度问题，以避免产生意外的结果。

- 算术操作符可以与其他操作符结合使用，例如与比较操作符和逻辑操作符一起构建复杂的查询条件。

这些算术操作符在 MySQL 中用于执行各种数学运算，以满足数据处理和分析的需求。通过合理使用这些操作符，你可以在查询中对数值进行计算，从而实现各种复杂的数据处理操作。

# 位操作符

在 MySQL 中，位操作符用于在二进制位级别上执行逻辑运算。这些操作符允许你对整数数据的二进制表示进行位操作，例如按位与、按位或、按位异或等。

以下是 MySQL 中常用的位操作符的详细介绍：

### 1. `&`：按位 AND

按位 AND 操作符将两个数的对应位进行逻辑与运算，如果两个数的对应位都为 1，则结果为 1，否则为 0。

**示例：**
```sql
SELECT column1 & column2 AS result FROM table_name;
```

### 2. `|`：按位 OR

按位 OR 操作符将两个数的对应位进行逻辑或运算，如果两个数的对应位至少有一个为 1，则结果为 1，否则为 0。

**示例：**
```sql
SELECT column1 | column2 AS result FROM table_name;
```

### 3. `^`：按位 XOR

按位 XOR 操作符将两个数的对应位进行逻辑异或运算，如果两个数的对应位不相同，则结果为 1，否则为 0。

**示例：**
```sql
SELECT column1 ^ column2 AS result FROM table_name;
```

### 4. `~`：按位取反

按位取反操作符将一个数的所有位取反（0 变为 1，1 变为 0）。

**示例：**
```sql
SELECT ~column AS result FROM table_name;
```

### 5. `<<`：左移

左移操作符将一个数的所有位向左移动指定的位数，右侧空出的位用 0 填充。

**示例：**
```sql
SELECT column << n AS result FROM table_name;
```

### 6. `>>`：右移

右移操作符将一个数的所有位向右移动指定的位数，左侧空出的位用原来的符号位填充。

**示例：**
```sql
SELECT column >> n AS result FROM table_name;
```

### 注意事项：

- 在执行位操作时，应确保操作的是整数数据类型，否则会导致错误。

- 位操作符通常用于对二进制数据进行处理，例如 IP 地址、权限掩码等。

- 在进行位操作时，应仔细考虑位移的方向和位数，以确保得到正确的结果。

这些位操作符在 MySQL 中用于对整数数据的二进制位进行逻辑运算，从而实现各种复杂的数据处理需求。

通过合理使用这些操作符，你可以对二进制数据进行精确的控制和处理。

# 详细介绍一下 mysql 其他操作符

除了比较操作符、逻辑操作符、算术操作符和位操作符之外，MySQL 还支持一些其他类型的操作符，包括字符串操作符、空间操作符等。

以下是对 MySQL 中其他常用操作符的详细介绍：

### 1. 字符串操作符：

MySQL 中的字符串操作符用于对字符串进行处理和操作，常用的字符串操作符包括：

- `CONCAT()`：用于连接两个或多个字符串。
- `LENGTH()` 或 `CHAR_LENGTH()`：用于返回字符串的长度。
- `SUBSTRING()` 或 `SUBSTR()`：用于提取字符串的子串。
- `LOWER()` 或 `LCASE()`：用于将字符串转换为小写。
- `UPPER()` 或 `UCASE()`：用于将字符串转换为大写。
- `TRIM()`：用于删除字符串的首尾空格或指定字符。
- `REPLACE()`：用于替换字符串中的子串。

### 2. 空间操作符：

MySQL 中的空间操作符用于处理地理空间数据（例如点、线、面等），常用的空间操作符包括：

- `ST_GeomFromText()`：用于将文本表示的几何对象转换为几何对象。
- `ST_AsText()`：用于将几何对象转换为文本表示。
- `ST_Contains()`：用于检查一个几何对象是否包含另一个几何对象。
- `ST_Within()`：用于检查一个几何对象是否包含在另一个几何对象内部。
- `ST_Distance()`：用于计算两个几何对象之间的距离。

### 3. 日期和时间操作符：

MySQL 中的日期和时间操作符用于处理日期和时间数据，常用的日期和时间操作符包括：

- `DATE()`：用于提取日期部分。
- `TIME()`：用于提取时间部分。
- `YEAR()`、`MONTH()`、`DAY()`：用于提取年、月、日部分。
- `HOUR()`、`MINUTE()`、`SECOND()`：用于提取时、分、秒部分。
- `DATE_ADD()`、`DATE_SUB()`：用于对日期进行加法和减法操作。
- `DATEDIFF()`：用于计算两个日期之间的天数差。

### 4. JSON 操作符：

MySQL 5.7 及以上版本支持 JSON 数据类型，并提供了一些 JSON 操作符用于处理 JSON 数据，常用的 JSON 操作符包括：

- `JSON_EXTRACT()`：用于提取 JSON 对象中的值。
- `JSON_UNQUOTE()`：用于去除 JSON 字符串的引号。
- `JSON_ARRAY()`：用于创建 JSON 数组。
- `JSON_OBJECT()`：用于创建 JSON 对象。
- `JSON_CONTAINS()`：用于检查 JSON 数组或对象中是否包含指定值。

### 注意事项：

- 在使用操作符时，应注意数据类型的兼容性和操作符的语法规则，以避免产生错误。

- 不同版本的 MySQL 可能支持不同的操作符和功能，应根据具体版本进行选择和使用。

* any list
{:toc}