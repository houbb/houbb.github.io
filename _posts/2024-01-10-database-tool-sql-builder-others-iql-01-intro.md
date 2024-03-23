---
layout: post
title: 数据库查询工具 sql builder-01-IQL
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
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

# IQL

IQL 感觉还不错，不过 github 的热度很低，估计是因为文档是俄文，大家看不懂？

## **创建目的**

IQL 类被设计用于简化编写简单 SQL 查询的时间并最小化语法错误的风险。该

项目不旨在与 ORM 竞争，因为它是另一种方法，或者与像 JOOQ 这样的项目竞争。

## **优势**

* 在编写查询时排除语法错误
* 简化多行数据插入 - 无需连接查询，只需为每个新行调用 insert() 方法即可
* 如果在没有 WHERE 的情况下执行 DELETE 或 UPDATE，则生成异常
* UPSERT 操作，如果指定了 WHERE，则插入或更新记录
* 在插入之前对行进行额外处理的能力（使用特定的功能接口）
* 从 int 数字、String 字符串或 Date 对象自动解析日期
* 命令的顺序不重要，例如，可以在 LIMIT 之后指定 GROUP BY，在 ORDER BY 之后指定 WHERE，在 SELECT 之前指定 JOIN
* 简化处理输入数据 - 无需使用 setString()、setInt() 和其他从 PreparedStatment 输入数据的方法，只需输入相应的变量即可
* 使用 IDE 时语法突出显示（通常直接写 SQL 查询时缺少此功能）
* 每个查询具有类似的结构，并以表输入开头，例如，对于 SELECT 查询，首先通过 addTable() 方法添加所需的表，对于 UPDATE、INSERT、DELETE 查询也需要执行同样的操作
* 可以返回生成的 SQL 代码，与 PreparedStatement 不同
* 插入和更新数据的查询具有相似的结构，与 SQL 不同，在那里处理 INSERT 和 UPDATE 操作完全不同

## **劣势**
* 主要适用于 CRUD 操作，没有复杂的逻辑
* 不支持所有数据类型
* 不能在同一查询中同时使用函数和普通字段选择（将会修复）

## **内置常量**

### **WHERE 比较操作:**
| 常量        | SQL 对应  |
| ----------- | ----------- |
| EQUAL       | "="         |
| NOT_EQUAL   | "!="        |
| MORE        | ">"         |
| MORENEQUAL  | ">="        |
| LESSNEQUAL  | "<="        |
| LESS        | "<"         |
| ISNULL      | "isnull"    |
| ISNTNULL    | "isntnull"  |
| LIKE        | "like"      |

### **JOIN 方向:**
| 常量        | SQL 对应  |
| ----------- | ----------- |
| JOIN_FULL   | "full"      |
| JOIN_LEFT   | "left"      |
| JOIN_RIGHT  | "right"     |

### **JOIN 类型:**
| 常量        | SQL 对应  |
| ----------- | ----------- |
| JOIN_OUTER  | "outer"     |
| JOIN_INNER  | "inner"     |

### **排序方向:**

| 常量   | SQL 对应 |
| ------ | --------- |
| ASC    | "asc"     |
| DESC   | "desc"    |

## **查询中的数据类型**

| **IQL 类型** | **创建表时的类型** | **插入查询时的类型** |
| ------------ | ------------------- | -------------------- |
| %s           | VARCHAR(255)        | String，在插入之前通过静态方法 setStringFilter() 指定的函数式接口 StringFilter 进行额外处理 |
| %v           | VARCHAR(255)        | String，无需额外处理（仅对单引号进行转义） |
| %t           | TEXT                | String，通过静态方法 setTextFilter() 指定的函数式接口 StringFilter 进行额外处理 |
| %i           | INTEGER             | int，无需额外处理 |
| %d           | INTEGER             | int、Date 或 String。对于 String，通过静态方法 setDateFormat() 指定的 SimpleDateFormat 格式化字符串进行处理 |
| %f           | FLOAT               | float 或 String |
| %b           | BOOL                | boolean 或 String |

## **方法和接口**

### **StringFilter 接口**

这是一个用于处理字符串的函数式接口。它有以下方法：

String filter(String in);

### **IQL 类的方法：**

以下是简化为Markdown表格形式的翻译：

| **方法**                                      | **描述**                                                                                                                                                   |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| static void setStringFilter(StringFilter sf) | 在插入查询之前设置对类型为 %s 的字符串进行额外过滤。                                                                                                          |
| static void setTextFilter(StringFilter sf)   | 在插入查询之前设置对类型为 %t 的字符串进行额外过滤。                                                                                                          |
| static void setDateFormat(String format)     | 设置用于 SimpleDateFormat 的日期解析格式，如果插入的数据类型为字符串（%d），则使用该格式。默认为 dd.MM.yyyy。                                             |
| void reset()                                | 将 IQL 重置为初始状态（除了连接）。                                                                                                                          |
| IQL setConnection(Connection con)           | 设置与数据库的连接。                                                                                                                                       |
| IQL addTable(String... tables)              | 将表添加到查询中。除了 createTable() 外，此方法应首先调用。如果只添加一个表，则该表将自动设置为活动表。                                                          |
| IQL setTable(int index)                     | 设置活动表。索引是从 addTable() 开始的表的顺序号（从 1 开始）。影响 select()、where()、whereId()、groupBy() 和 orderBy()。                                        |
| IQL setInsertFields(String... fields)       | 设置要插入数据的列。列名必须带有数据类型。                                                                                                                    |
| IQL insert(Object... data)                  | 将数据插入到由 setInsertFields() 指定的列中。可多次调用以插入两行或更多行。                                                                                     |
| IQL setUpdateFields(String... fields)       | 设置要更新数据的列。列名必须带有数据类型。                                                                                                                    |
| IQL update(Object... data)                  | 将数据插入到由 setUpdateFields() 指定的列中。                                                                                                                |
| IQL setUpsertFields(String... fields)       | 设置要插入或更新数据的列。列名必须带有数据类型。                                                                                                              |
| IQL upsert(Object... data)                  | 在由 setUpsertFields() 指定的列中插入或更新数据。                                                                                                             |
| IQL delete(int id)                          | 从表中删除具有指定 id 的记录。                                                                                                                               |
| IQL delete()                                | 从表中删除记录。                                                                                                                                             |
| IQL createTable(String tableName, String... fields) | 创建具有指定字段的表 tableName。字段名必须带有数据类型。                                                                                                           |
| IQL createTable(String tableName)           | 创建具有指定名称的表 tableName。                                                                                                                              |
| IQL addField(String... fields)              | 向正在创建的表中添加字段。字段名必须带有数据类型。                                                                                                              |
| IQL addField(String field)                  | 向正在创建的表中添加字段。字段名必须带有数据类型。                                                                                                              |
| IQL select(String... fields)                | 如果未指定参数，则选择活动表的所有字段，或者选择指定的字段。您可以通过空格为表名指定别名，否则别名将显示为 表_字段。                                             |
| IQL selectRaw(String select)                | 用于 SELECT 的任意参数，例如 COUNT(*)。此方法不能与 select() 一起使用。                                                                                           |
| IQL openBracket()                           | 打开 WHERE 子句的括号。                                                                                                                                      |
| IQL closeBracket()                          | 关闭 WHERE 子句的括号。                                                                                                                                      |
| IQL where(String what, String operation, Object value) | WHERE 子句的条件，其中：what - 要比较的活动表列。操作 - 比较运算（常量或其文本值）。value - 与列比较的值。                                             |
| IQL where(String what, String operation)    | WHERE 子句的条件，不需要值（对于 IQL.ISNULL 和 IQL.ISNTNULL 操作）。                                                                                            |
| IQL whereId(int value)                      | 活动表的 id 比较条件。                                                                                                                                       |
| IQL or()                                    | OR 逻辑操作，连接条件。使用后会重置为 AND。                                                                                                                    |
| IQL and()                                   | AND 逻辑操作，连接条件。默认使用。                                                                                                                            |
| IQL groupBy(String field, int tableIndex)  | 根据表索引号下的字段 field 对获取的数据进行分组。                                                                                                                |
| IQL groupBy(String field)                   | 根据活动表中的字段 field 对获取的数据进行分组。                                                                                                                  |
| IQL orderBy(String field, String type, int tableIndex) | 排序，其中 field - 要排序的列名。type - 排序方向（常量或其文本值）。tableIndex - 表索引。                                                                      |
| IQL orderBy(String field, int tableIndex)   | 根据表索引号下的字段 field 进行排序。                                                                                                                           |
| IQL orderBy(String field, String type)      | 根据活动表中的字段 field 进行排序，方向为 type。                                                                                                                |
| IQL limit(int from, int to)                 | 从 from 到 to 进行 LIMIT。                                                                                                                                    |
| IQL limit(int limit)                        | 从 0 到 limit 进行 LIMIT。                                                                                                                                    |
| IQL join(int index1, String field1, int index2, String field2, String side, String type) | 将表 index1 中的 field1 与表 index2 中的 field2 进行连接。side 表示连接方向，type 表示连接类型。side 可以为 IQL.JOIN_LEFT、IQL.JOIN_RIGHT、IQL.JOIN_FULL，type 可以为 IQL.INNER 或 IQL.OUTER。 |
| IQL join(int index1, String field1, int index2, String field2, String typeOrSide)      | 将表 index1 中的 field1 与表 index2 中的 field2 进行连接，typeOrSide 表示连接方向或连接类型。                                                                  |
| IQL join(int index1, String field1, int index2, String field2)                           | 将表 index1 中的 field1 与表 index2 中的 field2 进行连接。                                                                                                       |
| PreparedStatement getStatement()          | 获取包含生成查询的 PreparedStatement 对象。                                                                                                                    |
| String getSQL()                            | 以文本字符串形式获取生成的

## **使用示例**

### **简单查询:**

```java
Connection con = DriverManager.getConnection("url","login","password");

IQL iql = new IQL(con);  
iql.addTable("table1");  
iql.select();  
PreparedStatement st = iql.getStatement();
```

同样的代码可以这样写:

```java
PreparedStatement st = new IQL(con).addTable("table1").select().getStatement();
```

这段代码将创建一个 PreparedStatement 对象，其中包含以下 SQL 代码:

```sql
SELECT * FROM table1
```

### **条件:**

简单条件:

```java
IQL iql = new IQL(con);  
iql.addTable("table1");  
iql.select();  
iql.where("id %i", IQL.EQUAL, 11);  
PreparedStatement st = iql.getStatement();
```

生成的代码为:

```sql
SELECT * FROM table1 WHERE table1.id = 11
```

复杂条件:

```java
IQL iql = new IQL(con);  
iql.addTable("table1");  
iql.select();  
iql.where("id %i", IQL.EQUAL, 11);  
iql.openBracket().  
    where("name %s", IQL.LIKE, "John%").
    or().
    where("name %s", IQL.LIKE, "Michael%").  
closeBracket();  
PreparedStatement st = iql.getStatement();
```

SQL:

```sql
SELECT * FROM table1 WHERE table1.id = 11 AND (table1.name LIKE 'John%' OR table1.name LIKE 'Michael%')
```

### **选择特定字段:**

```java
IQL iql = new IQL(con);  
iql.addTable("table1");  
iql.select("id", "name");  
PreparedStatement st = iql.getStatement();
```

生成的 SQL 代码为:

```sql
SELECT table1.id AS table1_id, table1.name AS table1_name FROM table1
```

从示例中可以看出，对于 select() 方法指定的字段，会在查询中使用 AS 来指定字段的别名，形式为 _**tablename_fieldname**_。这是为了在表联接时避免字段名称重叠。如果要指定自定义的字段别名，可以在字段名后面加一个空格：

```java
iql.select("id id", "name name");
```

例如:

```java
IQL iql = new IQL(con);  
iql.addTable("table1");  
iql.select("id id", "name username");  
PreparedStatement st = iql.getStatement();
```

将生成以下代码:

```sql
SELECT table1.id AS id, table1.name AS username FROM table1
```

### **表联接:**

```java
IQL iql = new IQL(con);  
iql.addTable("users", "messages");  
iql.join(1, "id", 2, "user_id");  
iql.setTable(1).select("id user_id", "login login");  
iql.setTable(2).select("id message_id", "date", "text text");  
PreparedStatement st = iql.getStatement();
```

将生成以下代码:

```sql
SELECT
users.id AS user_id,
users.login AS login,
messages.id AS message_id,
messages.date AS messages_date,
messages.text AS text
FROM users
JOIN messages ON users.id = messages.user_id
```

### **更多简单从两个表中选择的示例**

```java
IQL iql = new IQL(con);
iql.addTable("domains").select("subdomain subdomain", "domain domain").where("domain %s", IQL.ISNTNULL);
iql.addTable("orgs").select("org_name name", "org_address address").where("org_name %s", IQL.LIKE, "%организация%");
iql.join(2, "id", 1, "org_id");
String SQL = iql.getSQL();
```

这里特别需要注意的是，当仅添加一个表时，addTable() 方法会将添加的表设置为当前活动表，否则活动表不会改变。这在立即在添加表后指定要选择的字段时是有用的，就像这个例子中所看到的一样 (iql.addTable().select().where())

生成的 SQL 代码为:

```sql
SELECT 
`domains`.`subdomain` AS `subdomain`, 
`domains`.`domain` AS `domain`, 
`orgs`.`org_name` AS `name`, 
`orgs`.`org_address` AS `address` 
FROM `orgs` 
JOIN `domains` ON `orgs`.`id` = `domains`.`org_id` 
WHERE 
`domains`.`domain` IS NOT NULL AND 
`orgs`.`org_name` LIKE '%организация%'
```

### **从多个表中选择并使用 LIMIT、GROUP BY 和 ORDER BY**

```java
IQL iql = new IQL(con);  
iql.addTable("users","organisation_user","organisations");
iql.join(1, "id", 2, "user_id");
iql.join(2, "organisation_id", 3, "id");  
iql.setTable(1).select("login login").where("login %s", IQL.LIKE, "d0%");  
iql.setTable(3).select("organisation_name orgname").where("type %i", "=", 1);  
iql.groupBy("organisation_name", 3);  
iql.orderBy("organisation_name", IQL.DESC, 3);  
iql.limit(10);  
PreparedStatement ps = iql.getStatement();
```

生成的 SQL 代码为:

```sql
SELECT
users.login AS login,
organisations.organisation_name AS orgname
FROM users
JOIN organisation_user ON users.id = organisation_user.user_id
JOIN organisations ON organisation_user.organisation_id = organisations.id
WHERE
users.login LIKE 'd0%' AND
organisations.type = 1
GROUP BY organisations.organisation_name
ORDER BY organisations.organisation_name DESC
LIMIT 0, 10
```

### **创建表:**

方式1:

```java
PreparedStatement st = new IQL(con).createTable("mytable", "name %s", "date %d", "desc %t", "price %i").getStatement();
```

方式2:

```java
IQL iql = new IQL(con);  
iql.createTable("mytable");  
iql.addField("name %s", "date %d", "desc %t", "price %i");  
PreparedStatement st = iql.getStatement();
```

方式3:

```java
IQL iql = new IQL(con);  
iql.createTable("mytable");  
iql.addField("name %s");  
iql.addField("date %d");  
iql.addField("desc %t");  
iql.addField("price %i");  
PreparedStatement st = iql.getStatement();
```

生成的 SQL 代码为:

```sql
CREATE TABLE mytable(id INTEGER PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), date INTEGER, desc TEXT, price INTEGER)
```

### **插入数据:**

```java
IQL iql = new IQL(con);  
iql.addTable("mytable");  
iql.setInsertFields("name %s", "register_date %d", "level %i");  
iql.insert("User1", "17.05.2017", 4);  
iql.insert("User2", "12.03.2016", 5);  
Statement st = iql.getStatement();
```

生成的 SQL 代码为:

```sql
INSERT INTO mytable(name, register_date, level) VALUES ('User1', 1494968400, 4), ('User2', 1457730000, 5)
```

需要注意的是，对于 %d 类型的字段，如果接收到 String 对象，默认的日期格式为 dd.MM.yyyy

### **更新数据:**

```java
IQL iql = new IQL(con);  
iql.addTable("organisations");  
iql.setUpdateFields("name %s", "address %s");  
iql.update("New orgname", "New address");  
iql.whereId(112);  
PreparedStatement ps = iql.getStatement();
```

生成的 SQL 代码为:

```sql
UPDATE organisations SET name = 'New orgname', address = 'New address' WHERE organisations.id = 112
```

值得注意的是，对于此查询，如果未调用 where() 或 whereId() 方法，则 getStatement() 和 getSQL() 方法可能会引发 InsecureOperationException (RuntimeException) 异常。

### **UPSERT 操作**

这个操作不是直接的 SQL 操作，而只是 UPDATE 和 INSERT 的包装。

例如，修改前一个示例:

```java
IQL iql = new IQL(con);  
iql.addTable("organisations");  
iql.setUpsertFields("name %s", "address %s");  
iql.upsert("New orgname", "New address");  
iql.whereId(112);  
PreparedStatement ps = iql.getStatement();
```

将生成相同的代码:

```sql
UPDATE organisations SET name = 'New orgname', address = 'New address' WHERE organisations.id = 112
```

然而，如果没有调用 where() 或 whereId() 方法，例如:

```java
IQL iql = new IQL(con);  
iql.addTable("organisations");  
iql.setUpsertFields("name %s", "address %s");  
iql.upsert("New orgname", "New address");  
PreparedStatement ps = iql.getStatement();
```

那么将生成插入数据的 SQL 代码:

```sql
INSERT INTO organisations(name, address) VALUES ('New orgname', 'New address')
```

### **删除数据**

按 id 删除:

```java
IQL iql = new IQL(con);  
iql.addTable("users");  
iql.delete(12);  
PreparedStatement ps = iql.getStatement();
```

将生成以下代码:

```sql
DELETE FROM users WHERE users.id = 12
```

按任意字段删除:

```java
IQL iql = new IQL(con);  
iql.addTable("users");  
iql.delete();  
iql.where("login_date %d", IQL.LESS, "18.05.2015");  
PreparedStatement ps = iql.getStatement();
```

将生成以下代码:

```sql
DELETE FROM users WHERE users.login_date < 1431896400
```

值得注意的是，对于这个查询，如果没有调用 where() 或 whereId() 方法，getStatement() 和 getSQL() 方法可能会引发 InsecureOperationException（RuntimeException）异常。

### **在插入之前对行进行额外过滤**

IQL 类中提供了用于处理 %s 类型的字符串的功能接口 StringFilter 和 IQL 类的静态方法:

- setStringFilter(StringFilter sf): 用于过滤插入前 %s 类型的字符串
- setTextFilter(StringFilter sf): 用于过滤插入前 %t 类型的字符串

假设我们的任务是用 HTML 实体替换 HTML 标签，例如，将 &lt; 替换为 &amp;lt;。 我们可以使用以下结构:

```java
IQL.setStringFilter((s) -> s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"));
```

然后，所有插入到查询中的 %s 类型的字符串将使用此方法进行处理:

```java
IQL iql = new IQL(con);
iql.addTable("myvals");
iql.setInsertFields("price %f", "name %s");
iql.insert(3.22, "<h1>спички</h1>");
String SQL = iql.getSQL();
```

生成的 SQL 代码如下:

```sql
INSERT INTO `myvals`(`price`, `name`) VALUES (3.22, '&lt;h1&gt;спички&lt;/h1&gt;')
```


# 参考资料

https://github.com/r0ck3r/IQL/wiki

* any list
{:toc}