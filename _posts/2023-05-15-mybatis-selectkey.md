---
layout: post
title: mybatis selectKey 有什么用？
date:  2023-05-15 +0800
categories: [SQL]
tags: [sql, mybatis, sh]
published: true
---

# mybatis selectKey 详解

在 MyBatis 中，`<selectKey>` 元素用于在插入数据到数据库表时，获取数据库生成的主键值或者其他需要返回的值。下面是对 `<selectKey>` 的详细解释：

`<selectKey>` 元素通常嵌套在 `<insert>` 元素内部，并且位于 `<selectKey>` 元素之前。它的作用是在插入数据之前执行一个额外的查询，用于获取生成的主键值或其他需要返回的值。

下面是 `<selectKey>` 元素的常用属性：

- `keyProperty`：指定目标对象中的属性名，用于接收查询结果。
- `resultType`：指定返回值的类型。
- `order`：指定查询语句的执行顺序。可选值为 `BEFORE`（默认）或 `AFTER`。
- `statementType`：指定查询语句的类型。可选值为 `PREPARED`（默认）或 `CALLABLE`。
- `useGeneratedKeys`：指定是否使用数据库生成的主键。可选值为 `true` 或 `false`。

下面是一个示例，演示了如何使用 `<selectKey>` 元素获取数据库生成的主键值：

```xml
<insert id="insertUser" parameterType="User" useGeneratedKeys="true" keyProperty="id">
  <!-- 在插入数据前执行查询，获取生成的主键值 -->
  <selectKey keyProperty="id" resultType="java.lang.Long" order="BEFORE">
    SELECT SEQ_USER.NEXTVAL FROM DUAL
  </selectKey>
  <!-- 执行插入数据的语句 -->
  INSERT INTO users (id, username, password) VALUES (#{id}, #{username}, #{password})
</insert>
```

在上面的示例中，`<selectKey>` 元素通过执行 `SELECT SEQ_USER.NEXTVAL FROM DUAL` 查询来获取数据库生成的主键值，并将结果存储到 `id` 属性中。

然后，`INSERT` 语句将使用这个值进行插入操作。

需要注意的是，`<selectKey>` 元素的使用可以根据具体的需求进行调整。它不仅可以用于获取主键值，还可以用于获取其他需要返回的值，比如数据库的默认值或触发器生成的值等。

# 使用技巧

比如在进行 mybatis 去 O 迁移的时候。

可以通过统一设置对应的 selectKey，然后可以在拦截器中进行统一的处理。

# selectKey 还有哪些其他值得注意的地方？使用技巧之类的

除了前面提到的常见用法外，以下是一些使用 `<selectKey>` 元素时值得注意的其他方面和技巧：

1. 主键生成策略：`<selectKey>` 元素通常与数据库的主键生成策略配合使用。例如，在 Oracle 数据库中使用序列生成主键时，可以通过 `<selectKey>` 查询获取序列的下一个值。

2. order 属性：`<selectKey>` 元素的 `order` 属性用于指定查询语句的执行顺序。默认值是 `BEFORE`，表示在插入语句之前执行查询。你还可以设置为 `AFTER`，表示在插入语句之后执行查询。这取决于你的需求和数据库的限制。

3. statementType 属性：`<selectKey>` 元素的 `statementType` 属性用于指定查询语句的类型。默认值是 `PREPARED`，表示使用预编译的语句。你还可以设置为 `CALLABLE`，表示使用可调用语句。

4. useGeneratedKeys 属性：`<selectKey>` 元素的 `useGeneratedKeys` 属性用于指定是否使用数据库生成的主键。如果设置为 `true`，MyBatis 将尝试使用数据库提供的机制获取主键值，如自增列或触发器生成的值。如果设置为 `false`，则不会尝试获取主键值。

5. 多列返回：除了返回单个主键值之外，`<selectKey>` 元素还可以配置多个 `keyProperty` 和 `resultType`，用于同时返回多个列的值。

6. 使用表达式：在 `<selectKey>` 元素的查询语句中，可以使用 MyBatis 的表达式语言 `${}` 来引用参数或属性。这允许你根据动态条件生成查询语句。

7. 使用数据库函数：查询语句可以包含数据库特定的函数来获取生成的值。例如，在 MySQL 中，可以使用 `LAST_INSERT_ID()` 函数获取最后插入的自增主键值。

综上所述，`<selectKey>` 元素提供了在插入数据时获取数据库生成的值的灵活机制。通过合理配置属性和查询语句，可以满足各种需求，包括获取主键值、默认值、触发器生成的值等。

* any list
{:toc}