---
layout: post
title: mybatis 如何指定单个语句的超时时间
date: 2025-11-13 14:12:33 +0800
categories: [Mybatis]
tags: [mybatis, sh]
published: true
---




# mybatis 如何指定对应的语句的超时时间 不影响其他的语句?

在 MyBatis 里，如果你只想**单独给某个 SQL 语句设置超时时间（timeout）**，而**不影响全局或其他语句**，有几种方式可以做到。

---

## ✅ 方式一：在 XML 映射文件里指定 `timeout`

这是最常见、最推荐的做法。

在对应的 `<select>`、`<update>`、`<insert>` 或 `<delete>` 标签上加上 `timeout` 属性即可：

```xml
<select id="getUserById" parameterType="long" resultType="User" timeout="5">
    SELECT * FROM user WHERE id = #{id}
</select>
```

* 单位：**秒**
* 含义：超过 5 秒没执行完，抛出 `QueryTimeoutException`
* 不会影响其他语句

👉 适合大多数情况。

---

## ✅ 方式二：在注解（Mapper 接口）中指定

如果你是用 **注解方式（非 XML）** 定义 SQL，也可以加上 `@Options(timeout = 秒数)`：

```java
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    @Options(timeout = 5)
    User getUserById(Long id);
}
```

同样，单位是秒，只对这个方法有效。

---

## ✅ 方式三：运行时临时指定（动态控制）

如果你需要**运行时动态指定超时时间**，可以在代码中通过 `SqlSession` 或 `Executor` 层面去控制。

### 方案1：通过 `RowBounds` 的构造函数参数（旧方式，不推荐）

部分版本支持超时参数，但兼容性不太好，不推荐。

### 方案2：手动创建一个新的 `MappedStatement`（高级玩法）

如果你的业务需要临时修改某个语句的超时时间（例如用户传入了一个 `timeout` 参数），可以在执行前动态修改对应的 `MappedStatement`：

```java
MappedStatement ms = sqlSession.getConfiguration().getMappedStatement("UserMapper.getUserById");
MappedStatement.Builder builder = new MappedStatement.Builder(
    ms.getConfiguration(),
    ms.getId(),
    ms.getSqlSource(),
    ms.getSqlCommandType()
);
builder.timeout(10); // 动态设置超时
MappedStatement newMs = builder.build();

sqlSession.getConfiguration().addMappedStatement(newMs);
sqlSession.selectOne(newMs.getId(), 123L);
```

⚠️ 这种方式一般用于框架二次开发或动态 SQL 引擎里，不适合普通业务代码。

---

## ✅ 方式四：全局默认 + 局部覆盖（组合策略）

如果你的全局配置文件里已经设置了超时时间：

```xml
<settings>
    <setting name="defaultStatementTimeout" value="30"/>
</settings>
```

那么每个语句会默认继承这个值。
当你在 `<select>` 或注解里单独指定 `timeout` 时，会**覆盖默认值**。

---

## 🔍 总结对比表

| 场景                   | 配置位置                      | 是否影响其他 SQL | 推荐度     |
| -------------------- | ------------------------- | ---------- | ------- |
| XML 中设置 `timeout`    | `<select timeout="5">`    | ❌ 否        | ✅✅✅     |
| 注解方式设置               | `@Options(timeout = 5)`   | ❌ 否        | ✅✅✅     |
| 全局默认                 | `defaultStatementTimeout` | ✅ 是        | ⚠️      |
| 动态修改 MappedStatement | Java 代码层动态构建              | ❌ 否        | 🔧 高级用法 |


# 参考资料

https://mybatis.org/mybatis-3/zh_CN/sqlmap-xml.html#Parameters


* any list
{:toc}