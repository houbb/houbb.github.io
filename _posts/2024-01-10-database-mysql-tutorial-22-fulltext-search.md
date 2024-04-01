---
layout: post
title: mysql Tutorial-22-fulltext search 全文检索
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql 的全文检索

## 说明

MySQL 提供了全文检索功能，可以用于对表中的文本数据进行高效的搜索。

全文检索功能允许您在文本列上执行复杂的查询，以查找包含特定关键词或短语的行。

以下是 MySQL 中全文检索的详细介绍：

### 1. 全文索引（FULLTEXT Index）：

- 在使用全文检索之前，需要在需要进行检索的文本列上创建全文索引。

- 全文索引是一种特殊的索引类型，用于加快文本数据的搜索速度。

**语法**

```sql
CREATE FULLTEXT INDEX idx_name ON table_name (column_name);
```

### 2. MATCH...AGAINST...语法：

- 使用 MATCH...AGAINST... 语法执行全文检索查询。

- MATCH...AGAINST...语法用于指定要搜索的列和搜索条件。

**语法**

```sql
SELECT * FROM table_name WHERE MATCH(column_name) AGAINST ('search_keyword');
```

### 3. 全文检索查询的限制：

- 全文检索查询只能用于包含 FULLTEXT 索引的列上。

- 搜索关键词必须是长度大于等于指定的最小长度（默认为4）的词。

- 默认情况下，MySQL 忽略常见词（停用词），如“the”、“and”等。

### 4. 全文检索的优势：

- 全文检索可以进行更灵活、更高效的文本搜索，支持包含词形变换（stemming）和近似匹配（fuzzy matching）等功能。

- 全文检索能够自动处理词语的权重，可以根据关键词在文档中出现的频率来进行结果排序。

### 注意事项：

- 全文检索功能在 MySQL 的特定存储引擎（如 MyISAM 和 InnoDB）中才可用。

- 创建全文索引可能会占用较多的存储空间，因此需要权衡存储空间和查询性能。

- 全文检索功能适用于对文本数据进行搜索，但不适用于对数值型数据或其他非文本数据的搜索。

以上是 MySQL 中全文检索的基本概念和用法。

通过合理使用全文检索功能，可以提高对文本数据的搜索效率，为您的应用提供更好的用户体验。


# 具体的例子

假设有一个名为 `articles` 的表，其中包含两个字段：`id` 和 `content`，我们希望对 `content` 字段进行全文检索。

假设我们有以下的 `articles` 表的结构：

```sql
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT
);

INSERT INTO articles (content) VALUES
    ('MySQL is an open-source relational database management system.'),
    ('Full-text searching allows us to search efficiently through large text fields.'),
    ('InnoDB is a storage engine for MySQL providing support for ACID transactions.'),
    ('Regular expressions are powerful tools for pattern matching and text manipulation.');
```

接下来，我们创建 `content` 字段的全文索引：

```sql
CREATE FULLTEXT INDEX idx_content ON articles (content);
```

现在，我们可以执行全文检索查询，例如搜索包含词语 "MySQL" 的文章：

```sql
mysql> SELECT * FROM articles WHERE MATCH(content) AGAINST ('MySQL');
+----+-------------------------------------------------------------------------------+
| id | content                                                                       |
+----+-------------------------------------------------------------------------------+
|  1 | MySQL is an open-source relational database management system.                |
|  3 | InnoDB is a storage engine for MySQL providing support for ACID transactions. |
+----+-------------------------------------------------------------------------------+
```

同样地，我们可以搜索包含词语 "full-text searching" 的文章：

```sql
mysql> SELECT * FROM articles WHERE MATCH(content) AGAINST ('full-text searching');
+----+------------------------------------------------------------------------------------+
| id | content                                                                            |
+----+------------------------------------------------------------------------------------+
|  2 | Full-text searching allows us to search efficiently through large text fields.     |
|  4 | Regular expressions are powerful tools for pattern matching and text manipulation. |
+----+------------------------------------------------------------------------------------+
```

这将返回包含词语 "full-text searching" 的所有文章。

通过这样的方式，我们可以利用全文检索功能在大型文本数据集上执行高效的搜索。

# 全文检索的优缺点

MySQL 全文检索的设计具有一些优点和缺点

下面是它们的详细介绍：

### 优点：

1. **快速搜索：** 全文检索允许在大型文本数据集上执行高效的搜索，因为它使用了特殊的索引结构和搜索算法。
  
2. **灵活性：** 全文检索可以处理复杂的搜索需求，例如搜索包含特定词语或短语、模糊匹配、词干提取等。

3. **支持自然语言：** 全文检索支持自然语言查询，用户可以使用常见的自然语言来进行搜索，而不需要了解复杂的查询语法。

4. **自动权重：** 全文检索会自动计算文档中关键词的权重，从而可以根据关键词在文档中出现的频率来进行结果排序，提高搜索结果的相关性。

5. **支持停用词：** 全文检索可以忽略常见的停用词（如 "the"、"and" 等），从而减少搜索结果中的噪音。

### 缺点：

1. **存储空间：** 创建全文索引可能会占用较多的存储空间，特别是对于大型文本数据集而言，全文索引可能会占用相当大的空间。

2. **性能消耗：** 全文检索需要额外的计算资源和时间来构建索引和执行搜索操作，因此可能会对数据库的性能产生一定的影响。

3. **查询限制：** 全文检索只能用于特定存储引擎（如 MyISAM 和 InnoDB）中，而且只能用于包含全文索引的列上进行搜索。

4. **复杂性：** 对于一些复杂的搜索需求，可能需要编写较复杂的正则表达式或使用多个关键词来进行搜索，增加了使用的复杂性。

5. **不支持所有语言：** 全文检索可能不支持所有语言的自然语言查询，特别是对于一些非常规的语言或文字处理需求，可能需要特殊的处理。

综上所述，MySQL 全文检索的设计在处理文本数据搜索方面具有显著的优势，但也存在一些限制和缺点，需要在设计和使用时进行权衡和考虑。


# 实际工作中，为什么很少见到直接用 mysql 的全文检索？而是采用 lucene 或者 ES?

在实际工作中，很少直接使用 MySQL 的全文检索，而更倾向于使用专门的全文搜索引擎，如Lucene或Elasticsearch，主要是因为以下几个原因：

1. **性能和扩展性：** 全文搜索引擎通常专门针对文本搜索进行了优化，具有更高的性能和更好的扩展性。它们可以处理大型文本数据集和高并发的搜索请求，而不会影响数据库的性能。

2. **功能丰富性：** 全文搜索引擎提供了丰富的搜索功能和高级特性，如复杂的查询语法、文本分析、聚合分析、分布式搜索等。这些功能使得在实际应用中更容易实现复杂的搜索需求。

3. **实时索引更新：** 全文搜索引擎支持实时索引更新，可以在文档被添加、修改或删除时立即更新索引，从而保持索引与数据的实时同步。而 MySQL 的全文检索功能在某些情况下可能需要手动触发索引的重建或更新，无法实现实时的索引更新。

4. **分布式架构：** 全文搜索引擎通常采用分布式架构，可以水平扩展到多个节点，提供更高的可用性和容错性。这使得全文搜索引擎能够应对大规模数据和高并发请求的挑战，而 MySQL 的全文检索功能在单节点上的性能和扩展性有一定限制。

5. **社区和生态系统：** 全文搜索引擎拥有庞大的社区和丰富的生态系统，有大量的开源工具、插件和解决方案可供选择，使得在实际应用中更容易找到合适的解决方案和支持。




# 参考资料

https://www.tutorialspoint.com/mysql/mysql-fulltext-search.htm

* any list
{:toc}