---
layout: post
title: Mybatis-07-SQL 语句构建器
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# 问题

Java 程序员面对的最痛苦的事情之一就是在 Java 代码中嵌入 SQL 语句。

这通常是因为需要动态生成 SQL 语句，不然我们可以将它们放到外部文件或者存储过程中。

如你所见，MyBatis 在 XML 映射中具备强大的 SQL 动态生成能力。

但有时，我们还是需要在 Java 代码里构建 SQL 语句。

此时，MyBatis 有另外一个特性可以帮到你，让你从处理典型问题中解放出来，比如加号、引号、换行、格式化问题、嵌入条件的逗号管理及 AND 连接。

确实，在 Java 代码中动态生成 SQL 代码真的就是一场噩梦。

例如：

```java
String sql = "SELECT P.ID, P.USERNAME, P.PASSWORD, P.FULL_NAME, "
"P.LAST_NAME,P.CREATED_ON, P.UPDATED_ON " +
"FROM PERSON P, ACCOUNT A " +
"INNER JOIN DEPARTMENT D on D.ID = P.DEPARTMENT_ID " +
"INNER JOIN COMPANY C on D.COMPANY_ID = C.ID " +
"WHERE (P.ID = A.ID AND P.FIRST_NAME like ?) " +
"OR (P.LAST_NAME like ?) " +
"GROUP BY P.ID " +
"HAVING (P.LAST_NAME like ?) " +
"OR (P.FIRST_NAME like ?) " +
"ORDER BY P.ID, P.FULL_NAME";
```

# 解决方案

MyBatis 3 提供了方便的工具类来帮助解决此问题。

借助 SQL 类，我们只需要简单地创建一个实例，并调用它的方法即可生成 SQL 语句。

让我们来用 SQL 类重写上面的例子：

```java
private String selectPersonSql() {
  return new SQL() {
    SELECT("P.ID, P.USERNAME, P.PASSWORD, P.FULL_NAME");
    SELECT("P.LAST_NAME, P.CREATED_ON, P.UPDATED_ON");
    FROM("PERSON P");
    FROM("ACCOUNT A");
    INNER_JOIN("DEPARTMENT D on D.ID = P.DEPARTMENT_ID");
    INNER_JOIN("COMPANY C on D.COMPANY_ID = C.ID");
    WHERE("P.ID = A.ID");
    WHERE("P.FIRST_NAME like ?");
    OR();
    WHERE("P.LAST_NAME like ?");
    GROUP_BY("P.ID");
    HAVING("P.LAST_NAME like ?");
    OR();
    HAVING("P.FIRST_NAME like ?");
    ORDER_BY("P.ID");
    ORDER_BY("P.FULL_NAME");
  }.toString();
}
```

这个例子有什么特别之处吗？仔细看一下你会发现，你不用担心可能会重复出现的 "AND" 关键字，或者要做出用 "WHERE" 拼接还是 "AND" 拼接还是不用拼接的选择。

SQL 类已经为你处理了哪里应该插入 "WHERE"、哪里应该使用 "AND" 的问题，并帮你完成所有的字符串拼接工作。

# SQL 类

这里有一些示例：

```java
// 匿名内部类风格
public String deletePersonSql() {
  return new SQL() {
    DELETE_FROM("PERSON");
    WHERE("ID = #{id}");
  }.toString();
}

// Builder / Fluent 风格
public String insertPersonSql() {
  String sql = new SQL()
    .INSERT_INTO("PERSON")
    .VALUES("ID, FIRST_NAME", "#{id}, #{firstName}")
    .VALUES("LAST_NAME", "#{lastName}")
    .toString();
  return sql;
}

// 动态条件（注意参数需要使用 final 修饰，以便匿名内部类对它们进行访问）
public String selectPersonLike(final String id, final String firstName, final String lastName) {
  return new SQL() {
    SELECT("P.ID, P.USERNAME, P.PASSWORD, P.FIRST_NAME, P.LAST_NAME");
    FROM("PERSON P");
    if (id != null) {
      WHERE("P.ID like #{id}");
    }
    if (firstName != null) {
      WHERE("P.FIRST_NAME like #{firstName}");
    }
    if (lastName != null) {
      WHERE("P.LAST_NAME like #{lastName}");
    }
    ORDER_BY("P.LAST_NAME");
  }.toString();
}

public String deletePersonSql() {
  return new SQL() {
    DELETE_FROM("PERSON");
    WHERE("ID = #{id}");
  }.toString();
}

public String insertPersonSql() {
  return new SQL() {
    INSERT_INTO("PERSON");
    VALUES("ID, FIRST_NAME", "#{id}, #{firstName}");
    VALUES("LAST_NAME", "#{lastName}");
  }.toString();
}

public String updatePersonSql() {
  return new SQL() {
    UPDATE("PERSON");
    SET("FIRST_NAME = #{firstName}");
    WHERE("ID = #{id}");
  }.toString();
}

```

注意，SQL 类将原样插入 LIMIT、OFFSET、OFFSET n ROWS 以及 FETCH FIRST n ROWS ONLY 子句。换句话说，类库不会为不支持这些子句的数据库执行任何转换。 因此，用户应该要了解目标数据库是否支持这些子句。如果目标数据库不支持这些子句，产生的 SQL 可能会引起运行错误。

## SQL  方法

以下是MyBatis SQL类中常用的方法及其说明的表格，按照序号从1开始递增：

| 序号 | 方法                            | 说明                                                                                                                        |
|-----|---------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| 1   | select(String statement)        | 执行查询操作，并返回一个结果集对象。                                                                                     |
| 2   | insert(String statement)        | 执行插入操作，并返回受影响的行数。                                                                                         |
| 3   | update(String statement)        | 执行更新操作，并返回受影响的行数。                                                                                         |
| 4   | delete(String statement)        | 执行删除操作，并返回受影响的行数。                                                                                         |
| 5   | selectOne(String statement)     | 执行查询操作，并返回单个结果对象。                                                                                         |
| 6   | selectList(String statement)    | 执行查询操作，并返回结果对象列表。                                                                                         |
| 7   | insertBatch(String statement)   | 执行批量插入操作，并返回受影响的行数。                                                                                     |
| 8   | updateBatch(String statement)   | 执行批量更新操作，并返回受影响的行数。                                                                                     |
| 9   | deleteBatch(String statement)   | 执行批量删除操作，并返回受影响的行数。                                                                                     |
| 10  | commit()                        | 提交事务。                                                                                                                 |
| 11  | rollback()                      | 回滚事务。                                                                                                                 |
| 12  | close()                         | 关闭SQL会话。                                                                                                              |
| 13  | flushStatements()               | 刷新挂起的SQL语句。                                                                                                         |
| 14  | clearCache()                    | 清空本地缓存。                                                                                                             |
| 15  | getMapper(Class&lt;T&gt; clazz) | 获取指定类型的Mapper对象，用于执行映射器接口中定义的方法。                                                                   |
| 16  | startManagedSession()           | 启动一个托管的SQL会话，将SQL会话的生命周期交给MyBatis管理，自动管理事务的提交、回滚和关闭。                                  |
| 17  | startManagedSession(ExecutorType executorType) | 启动一个托管的SQL会话，并指定执行器类型。                                                                  |
| 18  | startManagedSession(Connection connection) | 启动一个托管的SQL会话，并指定数据库连接对象。                                                              |
| 19  | isManagedSessionStarted()       | 检查是否已经启动了托管的SQL会话。                                                                                           |
| 20  | getConnection()                 | 获取当前SQL会话使用的数据库连接对象。                                                                                     |

这些方法可以在MyBatis SQL类中使用，用于执行SQL语句、管理事务、关闭会话等操作。通过调用这些方法，可以方便地操作数据库并处理相关的事务。

## 例子

从版本 3.4.2 开始，你可以像下面这样使用可变长度参数：

```java
public String selectPersonSql() {
  return new SQL()
    .SELECT("P.ID", "A.USERNAME", "A.PASSWORD", "P.FULL_NAME", "D.DEPARTMENT_NAME", "C.COMPANY_NAME")
    .FROM("PERSON P", "ACCOUNT A")
    .INNER_JOIN("DEPARTMENT D on D.ID = P.DEPARTMENT_ID", "COMPANY C on D.COMPANY_ID = C.ID")
    .WHERE("P.ID = A.ID", "P.FULL_NAME like #{name}")
    .ORDER_BY("P.ID", "P.FULL_NAME")
    .toString();
}

public String insertPersonSql() {
  return new SQL()
    .INSERT_INTO("PERSON")
    .INTO_COLUMNS("ID", "FULL_NAME")
    .INTO_VALUES("#{id}", "#{fullName}")
    .toString();
}

public String updatePersonSql() {
  return new SQL()
    .UPDATE("PERSON")
    .SET("FULL_NAME = #{fullName}", "DATE_OF_BIRTH = #{dateOfBirth}")
    .WHERE("ID = #{id}")
    .toString();
}
```

从版本 3.5.2 开始，你可以像下面这样构建批量插入语句：

```java
public String insertPersonsSql() {
  // INSERT INTO PERSON (ID, FULL_NAME)
  //     VALUES (#{mainPerson.id}, #{mainPerson.fullName}) , (#{subPerson.id}, #{subPerson.fullName})
  return new SQL()
    .INSERT_INTO("PERSON")
    .INTO_COLUMNS("ID", "FULL_NAME")
    .INTO_VALUES("#{mainPerson.id}", "#{mainPerson.fullName}")
    .ADD_ROW()
    .INTO_VALUES("#{subPerson.id}", "#{subPerson.fullName}")
    .toString();
}
```

从版本 3.5.2 开始，你可以像下面这样构建限制返回结果数的 SELECT 语句,：

```java
public String selectPersonsWithOffsetLimitSql() {
  // SELECT id, name FROM PERSON
  //     LIMIT #{limit} OFFSET #{offset}
  return new SQL()
    .SELECT("id", "name")
    .FROM("PERSON")
    .LIMIT("#{limit}")
    .OFFSET("#{offset}")
    .toString();
}

public String selectPersonsWithFetchFirstSql() {
  // SELECT id, name FROM PERSON
  //     OFFSET #{offset} ROWS FETCH FIRST #{limit} ROWS ONLY
  return new SQL()
    .SELECT("id", "name")
    .FROM("PERSON")
    .OFFSET_ROWS("#{offset}")
    .FETCH_FIRST_ROWS_ONLY("#{limit}")
    .toString();
}
```



# 参考资料

https://mybatis.org/mybatis-3/zh/statement-builders.html

* any list
{:toc}
