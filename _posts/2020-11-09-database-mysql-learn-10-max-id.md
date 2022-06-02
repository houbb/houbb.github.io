---
layout: post
title:  mysql-10-MySQL查询数据表的Auto_Increment(自增id)
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, tx, sf]
published: true
---

# 场景

有时候我们希望获取当前表的最大自增主键信息。

# 获取方式

## 方式 1

一般数据表的id都是设置成auto_increment的，所以当插入一条记录后，可以使用下面的命令来获取最新插入记录的id值

```sql
select last_insert_id();
```

注意：

1. 必须是在使用 insert 语句后，紧接着使用select last_insert_id()才有效，在没有使用过Insert语句的情况下，查询返回的结果为0;

2. 如果在同一条 Insert 语句插入多条记录，返回的结果是第一条记录对于的id，如

```sql
insert into school.student 
(name, age) values 
('s1', 18),
('s2', 18),
('s3', 28),
('s4', 19),
('s5', 18);
```

返回的结果是s1对应的id号。

## 为什么不直接使用 select max(id) from tableName;

因为：如果手动删除了最新的数据，使用 max(id)查询的结果是当前剩下数据中最大的记录，

而新插入数据则不一定从这个数字开始计数

## 从元数据表中查询

所以为了准确的获取下一条插入记录的id，应该查询的是auto_increment, 对应的SQL语句如下：

```sql
SELECT auto_increment FROM information_schema.tables where table_schema="dbName" and table_name="tableName";
```

注意：

auto_increment 可以通过 show table status where `name`='tableName' 查询得到，所以相当于一个字段了; 

auto_increment返回的是下一条插入记录的id值，而不是当前的最大id值

information_schema.tables 照写即可，

table_schema="dbName"，指的是数据库的名字，注意要使用双引号，

table_name="tableName"，指的是表的名字，也要使用双引号。

# 获取插入后的数据

有时候我们在数据库中插入一条数据，然后希望获取对应的 id。

应该如何实现呢？

## 几种方式

通常我们在应用中对mysql执行了insert操作后，需要获取插入记录的自增主键。

本文将介绍java环境下的4种方法获取insert后的记录主键auto_increment的值：

- 通过JDBC2.0提供的insertRow()方式

- 通过JDBC3.0提供的getGeneratedKeys()方式

- 通过SQL select LAST_INSERT_ID()函数

- 通过SQL @@IDENTITY 变量

## 1. 通过JDBC2.0提供的insertRow()方式

自jdbc2.0以来，可以通过下面的方式执行。

```java
Statement stmt = null;
ResultSet rs = null;
try {
    stmt = conn.createStatement(java.sql.ResultSet.TYPE_FORWARD_ONLY,  // 创建Statement
                                java.sql.ResultSet.CONCUR_UPDATABLE);
    stmt.executeUpdate("DROP TABLE IF EXISTS autoIncTutorial");
    stmt.executeUpdate(                                                // 创建demo表
            "CREATE TABLE autoIncTutorial ("
            + "priKey INT NOT NULL AUTO_INCREMENT, "
            + "dataField VARCHAR(64), PRIMARY KEY (priKey))");
    rs = stmt.executeQuery("SELECT priKey, dataField "                 // 检索数据
       + "FROM autoIncTutorial");
    rs.moveToInsertRow();                                              // 移动游标到待插入行(未创建的伪记录)
    rs.updateString("dataField", "AUTO INCREMENT here?");              // 修改内容
    rs.insertRow();                                                    // 插入记录
    rs.last();                                                         // 移动游标到最后一行
    int autoIncKeyFromRS = rs.getInt("priKey");                        // 获取刚插入记录的主键preKey
    rs.close();
    rs = null;
    System.out.println("Key returned for inserted row: "
        + autoIncKeyFromRS);
}  finally {
    // rs,stmt的close()清理
}
```

优点：早期较为通用的做法

缺点：需要操作ResultSet的游标，代码冗长。

## 2. 通过JDBC3.0提供的getGeneratedKeys()方式

```java
Statement stmt = null;
ResultSet rs = null;
try {
    stmt = conn.createStatement(java.sql.ResultSet.TYPE_FORWARD_ONLY,
                                java.sql.ResultSet.CONCUR_UPDATABLE);  
    // ...
    // 省略若干行（如上例般创建demo表）
    // ...
    stmt.executeUpdate(
            "INSERT INTO autoIncTutorial (dataField) "
            + "values ('Can I Get the Auto Increment Field?')",
            Statement.RETURN_GENERATED_KEYS);                      // 向驱动指明需要自动获取generatedKeys！
    int autoIncKeyFromApi = -1;
    rs = stmt.getGeneratedKeys();                                  // 获取自增主键！
    if (rs.next()) {
        autoIncKeyFromApi = rs.getInt(1);
    }  else {
        // throw an exception from here
    } 
    rs.close();
    rs = null;
    System.out.println("Key returned from getGeneratedKeys():"
        + autoIncKeyFromApi);
}  finally { ... }
```

这种方式只需要2个步骤：

1. 在executeUpdate时激活自动获取key； 

2. 调用Statement的getGeneratedKeys()接口

优点：

1. 操作方便，代码简洁

2. jdbc3.0的标准

3. 效率高，因为没有额外访问数据库

这里补充下，

a.在jdbc3.0之前，每个jdbc driver的实现都有自己获取自增主键的接口。

在mysql jdbc2.0的driver  org.gjt.mm.mysql中，getGeneratedKeys（）函数就实现在org.gjt.mm.mysql.jdbc2.Staement.getGeneratedKeys()中。这样直接引用的话，移植性会有很大影响。JDBC3.0通过标准的getGeneratedKeys很好的弥补了这点。

b.关于getGeneratedKeys（）,官网还有更详细解释：[OracleJdbcGuide](http://docs.oracle.com/javase/1.4.2/docs/guide/jdbc/getstart/statement.html#1000569)

## 3. 通过SQL select LAST_INSERT_ID()

```java
Statement stmt = null;
ResultSet rs = null;
try {
    stmt = conn.createStatement();
    // ...
    // 省略建表
    // ...
    stmt.executeUpdate(
            "INSERT INTO autoIncTutorial (dataField) "
            + "values ('Can I Get the Auto Increment Field?')");
    int autoIncKeyFromFunc = -1;
    rs = stmt.executeQuery("SELECT LAST_INSERT_ID()");             // 通过额外查询获取generatedKey
    if (rs.next()) {
        autoIncKeyFromFunc = rs.getInt(1);
    }  else {
        // throw an exception from here
    } 
    rs.close();
    System.out.println("Key returned from " +
                       "'SELECT LAST_INSERT_ID()': " +
                       autoIncKeyFromFunc);
}  finally {...}
```

这种方式没什么好说的，就是额外查询一次函数LAST_INSERT_ID().

优点：简单方便

缺点：相对JDBC3.0的getGeneratedKeys（）,需要额外多一次数据库查询。

补充：

1. 这个函数，在mysql5.5手册的定义是：“returns a BIGINT (64-bit) value representing the first automatically generated value successfully inserted for an AUTO_INCREMENT column as a result of the most recently executed INSERT statement.”。文档点此

2. 这个函数，在connection维度上是“线程安全的”。就是说，每个mysql连接会有个独立保存LAST_INSERT_ID()的结果，并且只会被当前连接最近一次insert操作所更新。也就是2个连接同时执行insert语句时候，分别调用的LAST_INSERT_ID()不会相互覆盖。举个栗子：连接A插入表后LAST_INSERT_ID()返回100，连接B插入表后LAST_INSERT_ID()返回101，但是连接A重复执行LAST_INSERT_ID()的时候，始终返回100，而不是101。这个可以通过监控mysql连接数和执行结果来验证，这里不详述实验过程。

3. 在上面那点的基础上，如果在同一个连接的前提下同时执行insert，那可能2次操作的返回值会相互覆盖。因为LAST_INSERT_ID()的隔离程度是连接级别的。这点，getGeneratedKeys()是可以做的更好，因为getGeneratedKeys()是statement级别的。同个connection的多次statement，getGeneratedKeys()是不会被相互覆盖。

## 4. 通过SQL SELECT @@IDENTITY

这个方式和 LAST_INSERT_ID()效果是一样的。

官网文档如此表述：“This variable is a synonym for the last_insert_id variable. It exists for compatibility with other database systems. You can read its value with SELECT @@identity, and set it using SET identity.” 文档点此

重要补充：

无论是 `SELECT LAST_INSERT_ID()` 还是 `SELECT @@IDENTITY`,对于一条insert语句插入多条记录，永远只会返回第一条插入记录的generatedKey.

如：

```sql
INSERT INTO t VALUES (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');
```

LAST_INSERT_ID(), @@IDENTITY都只会返回'Mary'所在的那条记录的generatedKey

## 小结

所以，最好还是通过JDBC3 提供的getGeneratedKeys()函数来获取insert记录的主键。

不但简单，而且效率高。

在 mybatis 中，就有相关设置：

```xml
<insert id="save" parameterType="MappedObject" useGeneratedKeys="true" keyProperty="id">
</insert>
```

# 小结

# 参考资料

[MySQL查询数据表的Auto_Increment(自增id) ](https://blog.51cto.com/u_15311900/3179916)

[MYSQL获取自增主键【4种方法】](https://blog.csdn.net/UltraNi/article/details/9351573)

https://blog.csdn.net/dingd1234/article/details/123032400

* any list
{:toc}

