---
layout: post
title: mysql Tutorial-21-regular expression 正则表达式
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql 的 regular expression 正则表达式

## 说明

正则表达式（Regular Expressions）是一种用于匹配和处理文本模式的强大工具。

在MySQL中，正则表达式可以用于查询语句中的模式匹配，例如在WHERE子句中使用REGEXP操作符。

以下是关于MySQL中正则表达式的详细介绍：

### 1. REGEXP操作符：

- 在MySQL中，使用REGEXP操作符来进行正则表达式的模式匹配。

可以在WHERE子句中使用REGEXP操作符进行条件筛选。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name REGEXP 'pattern';
```

### 2. 常用的正则表达式语法：

- `.`：匹配任意单个字符。
- `^`：匹配字符串的开头。
- `$`：匹配字符串的结尾。
- `*`：匹配前一个字符的零个或多个实例。
- `+`：匹配前一个字符的一个或多个实例。
- `?`：匹配前一个字符的零个或一个实例。
- `[...]`：字符集，匹配括号中的任何一个字符。
- `[^...]`：否定字符集，匹配不在括号中的任何字符。
- `\b`：单词边界，匹配单词的开始或结束位置。
- `\d`：匹配一个数字字符。
- `\w`：匹配一个单词字符。
- `\s`：匹配一个空白字符。
- `|`：或操作符，匹配两个子表达式之一。

### 3. 示例：
- 查找以字母'A'开头的单词：
  ```sql
  SELECT * FROM table_name WHERE column_name REGEXP '^A';
  ```

- 查找以字母'A'结尾的单词：
  ```sql
  SELECT * FROM table_name WHERE column_name REGEXP 'A$';
  ```

- 查找包含'apple'或'orange'的单词：
  ```sql
  SELECT * FROM table_name WHERE column_name REGEXP 'apple|orange';
  ```

- 查找包含数字的单词：
  ```sql
  SELECT * FROM table_name WHERE column_name REGEXP '[0-9]';
  ```

### 注意事项：
- MySQL中的正则表达式不区分大小写，如果需要区分大小写，可以使用BINARY关键字进行区分。
- 正则表达式在进行模式匹配时，会对数据进行遍历和匹配，效率较低，尽量避免在大数据量的表上进行复杂的正则表达式匹配。
- 正则表达式在MySQL中的使用可能受到版本的限制，需查看对应版本的文档以确认支持的功能和语法。

# 详细介绍一下 mysql 的正则表达式相关操作符

在 MySQL 中，正则表达式相关操作符主要用于进行模式匹配。

MySQL 支持两种正则表达式操作符：REGEXP 和 RLIKE（是 REGEXP 的别名）。

这些操作符通常与 SELECT 语句的 WHERE 子句一起使用，用于对文本列进行模式匹配过滤。

以下是对 MySQL 中正则表达式相关操作符的详细介绍：

### 1. REGEXP / RLIKE：
- REGEXP 和 RLIKE 都用于指定模式匹配操作，它们是等效的，都用于实现正则表达式的匹配。
- 使用这些操作符，可以在 WHERE 子句中对列的值应用正则表达式模式，以确定是否与模式匹配。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name REGEXP 'pattern';
SELECT * FROM table_name WHERE column_name RLIKE 'pattern';
```

### 2. NOT REGEXP / NOT RLIKE：
- NOT REGEXP 和 NOT RLIKE 用于否定正则表达式模式的匹配。
- 使用这些操作符，可以在 WHERE 子句中对列的值应用正则表达式模式，以确定是否与模式不匹配。

**示例：**
```sql
SELECT * FROM table_name WHERE column_name NOT REGEXP 'pattern';
SELECT * FROM table_name WHERE column_name NOT RLIKE 'pattern';
```

### 3. REGEXP_LIKE()：
- REGEXP_LIKE() 函数用于执行正则表达式模式匹配，并返回一个布尔值（TRUE 或 FALSE）。
- 这个函数与 REGEXP / RLIKE 操作符类似，但是可以作为函数调用，并且在一些情况下更加灵活。

**示例：**
```sql
SELECT * FROM table_name WHERE REGEXP_LIKE(column_name, 'pattern');
```

### 注意事项：

- 在使用正则表达式操作符时，要确保正确的模式匹配语法，以及模式是否符合预期。

- 正则表达式操作符通常用于对文本列进行过滤和检索，可以提供强大的模式匹配功能。

- 使用正则表达式操作符时要注意效率问题，复杂的正则表达式可能会导致性能下降，尤其是在大数据量的表中。

# mysql 的正则表达式相关函数

在 MySQL 中，除了支持正则表达式操作符（如 REGEXP、RLIKE）外，还提供了一些内置的正则表达式相关函数，用于在查询中进行更复杂的正则表达式操作。

以下是 MySQL 中常用的正则表达式相关函数的详细介绍：

### 1. REGEXP_LIKE(str, pattern)：
- 执行正则表达式模式匹配，并返回一个布尔值（TRUE 或 FALSE）。
- 参数 str 是要进行模式匹配的字符串，pattern 是要匹配的正则表达式模式。

**示例：**
```sql
SELECT REGEXP_LIKE('hello', '^h'); -- 返回 TRUE，因为 'hello' 以 'h' 开头
```

### 2. REGEXP_INSTR(str, pattern[, start[, occurrence[, return_option[, match_type]]]])：
- 在字符串中搜索模式，并返回匹配的位置（索引）。
- 参数 str 是要搜索的字符串，pattern 是要匹配的正则表达式模式，start 是搜索的起始位置，默认为 1，occurrence 是指定匹配的次序，默认为 1，return_option 是返回的选项，默认为 0，match_type 是匹配类型，默认为 0。

**示例：**
```sql
SELECT REGEXP_INSTR('hello world', 'world'); -- 返回 7，因为 'world' 在字符串中的位置是从第 7 个字符开始
```

### 3. REGEXP_SUBSTR(str, pattern[, start[, occurrence]])：
- 从字符串中提取匹配的子串。
- 参数 str 是要提取子串的字符串，pattern 是要匹配的正则表达式模式，start 是提取的起始位置，默认为 1，occurrence 是指定匹配的次序，默认为 1。

**示例：**
```sql
SELECT REGEXP_SUBSTR('hello world', '[a-z]+'); -- 返回 'hello'，因为 'hello' 是字符串中第一个匹配的子串
```

### 4. REGEXP_REPLACE(str, pattern, replacement[, start[, occurrence[, match_type]]])：
- 替换字符串中匹配的模式。
- 参数 str 是要替换的字符串，pattern 是要匹配的正则表达式模式，replacement 是替换的字符串，start 是替换的起始位置，默认为 1，occurrence 是指定替换的次序，默认为 0，match_type 是匹配类型，默认为 0。

**示例：**
```sql
SELECT REGEXP_REPLACE('hello world', 'world', 'mysql'); -- 返回 'hello mysql'，将 'world' 替换为 'mysql'
```

### 注意事项：

- 这些正则表达式相关函数用于在查询中进行更复杂的正则表达式操作，提供了更灵活的功能。
- 在使用正则表达式相关函数时，需要注意参数的格式和含义，确保正确的操作和预期的结果。
- 正则表达式相关函数通常用于处理文本数据，能够在数据处理和转换过程中提供强大的功能。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql-data-types.htm

* any list
{:toc}