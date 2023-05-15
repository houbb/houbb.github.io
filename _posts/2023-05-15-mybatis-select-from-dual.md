---
layout: post
title: sql select 1 from dual 简介，以及 mybatis 中自定义 select 查询 TypeHandler
date:  2023-05-15 +0800
categories: [SQL]
tags: [sql, mybatis, sh]
published: true
---

# 数据库中的介绍

## mysql 中的 select 1 from dual 详解

在 MySQL 中，`SELECT 1 FROM dual` 是一种常见的用法，用于执行一个简单的查询并返回一个常数值。下面是对该语句的详细解释：

1. `SELECT`：这是 SQL 查询语句的关键字，用于从数据库中检索数据。
2. `1`：在这个查询中，`1` 是一个常数值。它可以是任何其他的常数值，比如字符串、日期等。这里选择 `1` 只是为了演示目的。
3. `FROM dual`：`dual` 是 MySQL 中的一个特殊表，它只包含一行一列的数据。使用 `dual` 表的主要目的是执行一些与表无关的查询，而不需要实际的表数据。

将以上三个部分组合在一起，`SELECT 1 FROM dual` 查询的作用是返回一个结果集，其中只包含一个列和一个行，该列的值为 `1`。

该查询的实际用途是测试数据库连接和验证查询语法是否正确。它通常用于简单的测试、验证和编写 SQL 查询语句时进行基本的语法检查。

需要注意的是，`dual` 表在其他数据库系统中可能不存在，因为它是 Oracle 数据库的特殊表。

然而，在 MySQL 中，为了与一些使用 Oracle SQL 的应用程序保持兼容性，MySQL 引擎也提供了 `dual` 表的功能，使得可以使用类似的语法。

## oracle 中 select 1 from dual 详解

在 Oracle 数据库中，`SELECT 1 FROM dual` 是一种常见的用法，用于执行一个简单的查询并返回一个常数值。下面是对该语句的详细解释：

1. `SELECT`：这是 SQL 查询语句的关键字，用于从数据库中检索数据。
2. `1`：在这个查询中，`1` 是一个常数值。它可以是任何其他的常数值，比如字符串、日期等。这里选择 `1` 只是为了演示目的。
3. `FROM dual`：`dual` 是 Oracle 数据库中的一个特殊表，它只包含一行一列的数据。`dual` 表的主要目的是执行一些与表无关的查询，而不需要实际的表数据。

将以上三个部分组合在一起，`SELECT 1 FROM dual` 查询的作用是返回一个结果集，其中只包含一个列和一个行，该列的值为 `1`。该查询的实际用途是测试数据库连接和验证查询语法是否正确。它通常用于简单的测试、验证和编写 SQL 查询语句时进行基本的语法检查。

需要注意的是，`dual` 表是 Oracle 数据库的特殊表，其他数据库系统中可能不存在。

在 Oracle 中，使用 `dual` 表可以执行一些与表无关的查询，而不需要实际的表数据。


# mybatis 中 访问 mysql，可以把 select 1 from dual 中的 1 改成自己的 typeHandler，实现动态返回字符串吗

在 MyBatis 中，可以通过自定义 TypeHandler 实现动态返回字符串，包括将 `select 1 from dual` 中的 `1` 改成自定义的字符串。以下是实现该功能的步骤：

1. 创建自定义的 TypeHandler 类：实现 `org.apache.ibatis.type.TypeHandler` 接口，并指定类型为 `java.lang.String`。在 `setParameter` 方法中，将自定义的字符串值转换为对应的 JDBC 类型；在 `getResult` 方法中，将从数据库获取的值转换为字符串类型。

```java
public class CustomStringTypeHandler implements TypeHandler<String> {

    @Override
    public void setParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter);
    }

    @Override
    public String getResult(ResultSet rs, String columnName) throws SQLException {
        return rs.getString(columnName);
    }

    @Override
    public String getResult(ResultSet rs, int columnIndex) throws SQLException {
        return rs.getString(columnIndex);
    }

    @Override
    public String getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return cs.getString(columnIndex);
    }
}
```

2. 在 MyBatis 的配置文件中注册自定义的 TypeHandler。找到 `<typeHandlers>` 标签，在其中添加 TypeHandler 的配置项。

```xml
<typeHandlers>
    <typeHandler handler="com.example.CustomStringTypeHandler"/>
</typeHandlers>
```

3. 在需要使用自定义 TypeHandler 的查询语句中，将 `select 1 from dual` 修改为自定义的字符串，MyBatis 会自动应用对应的 TypeHandler 进行转换。

```xml
<select id="yourQueryId" resultType="java.lang.String">
    SELECT 'Your Custom String' FROM dual
</select>
```

通过上述步骤，你可以将 `select 1 from dual` 中的 `1` 修改为自定义的字符串，并使用自定义的 TypeHandler 实现动态返回字符串的功能。注意在实际使用中，你需要根据自己的需求修改 TypeHandler 的实现和查询语句。


# 实战

## 背景说明

orcle 中有一个 id 的查询脚本，类似

```sql
<select id="getMyId" resultType="java.lang.String">
     select  TO_CHAR(systimestamp,'YYYY-MM-DD hh24:mi:ss:ff3') from dual
</select>
```

并且附加了一些 seq 的拼接。

这样就可以直接查询出对应的标识，因为是在做 mysql 的同步，所以希望实现同样的功能。

## mysql 原始的脚本

mysql 中有一个模仿的例子：

```xml
<select id="getMyId" resultType="java.lang.String">
     select 1 from dual
</select>
```

这样只能返回一个固定值，然后再 insert 的时候，设置对应的 id 值。

那么，有没有办法，直接 select 一个标识出来呢？

## mybatis TypeHandler

### 定义

我们自定义一个 handler

```java
package com.github.houbb.opensource.server.dal.handler;

import cn.hutool.core.util.IdUtil;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandler;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author d
 * @since 1.0.0
 */
public class CustomStringTypeHandler implements TypeHandler<String> {

    @Override
    public void setParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
        String id = "setParameter-" + IdUtil.randomUUID();
        ps.setString(i, id);
    }

    @Override
    public String getResult(ResultSet rs, String columnName) throws SQLException {
        return IdUtil.randomUUID();
    }

    @Override
    public String getResult(ResultSet rs, int columnIndex) throws SQLException {
        return IdUtil.randomUUID();
    }

    @Override
    public String getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return IdUtil.randomUUID();
    }

}
```

### 调整 sql 脚本

```xml
<select id="getMyId" resultType="java.lang.String">
    select #{id, typeHandler=com.github.houbb.opensource.server.dal.handler.CustomStringTypeHandler} from dual
</select>
```

### 代码测试

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = BootApplication.class)
public class NlpAccessLogMapperTest {

    @Autowired
    private NlpAccessLogMapper nlpAccessLogMapper;

    @Test
    public void getId() {
        String id = nlpAccessLogMapper.getMyId();
        System.out.println(id);
    }

}
```

对应的结果为：

```
setParameter-6412a8b7-7018-4ffb-850c-e0440d8b05f7
```

可以发现 id 对应的值实际上使我们重载的 setParameter 方法。

# 小结

mybatis 的特性还是非常强大的，我们在使用的时候，要不断尝试。

# 参考资料

https://www.cnblogs.com/deepbreath/p/4448224.html

* any list
{:toc}