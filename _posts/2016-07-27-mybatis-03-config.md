---
layout: post
title: Mybatis-03-Config 配置
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# properties 属性

这些是可外部化的、可替换的属性，可以在典型的 Java Properties 文件实例中配置，或通过 properties 元素的子元素传入。 

例如：

```xml
<properties resource="org/mybatis/example/config.properties">
  <property name="username" value="dev_user"/>
  <property name="password" value="F2Fa3!33TYyg"/>
</properties>
```

然后可以在整个配置文件中使用这些属性来替换需要动态配置的值。 

例如：

```xml
<dataSource type="POOLED">
  <property name="driver" value="${driver}"/>
  <property name="url" value="${url}"/>
  <property name="username" value="${username}"/>
  <property name="password" value="${password}"/>
</dataSource>
```

此示例中的用户名和密码将替换为属性元素中设置的值。 

驱动程序和 url 属性将替换为 config.properties 文件中包含的值。 这为配置提供了很多选项。

属性也可以传递到 SqlSessionFactoryBuilder.build() 方法中。 

例如：

```java
SqlSessionFactory factory =
  sqlSessionFactoryBuilder.build(reader, props);

// ... or ...

SqlSessionFactory factory =
  new SqlSessionFactoryBuilder.build(reader, environment, props);
```

如果一个属性存在于多个地方，MyBatis 会按以下顺序加载它们：

- 首先读取 properties 元素主体中指定的属性，

- 从类路径资源加载的属性或 properties 元素的 url 属性被读取，并覆盖任何已经指定的重复属性，

- 作为方法参数传递的属性最后读取，并覆盖可能已从属性主体和资源/url 属性加载的任何重复属性。

因此，最高优先级的属性是作为方法参数传入的属性，其次是资源/url 属性，最后是在 properties 元素的主体中指定的属性。

从 MyBatis 3.4.2 开始，你可以在占位符中指定一个默认值，如下所示：

```xml
<dataSource type="POOLED">
  <!-- ... -->
  <property name="username" value="${username:ut_user}"/> <!-- If 'username' property not present, username become 'ut_user' -->
</dataSource>
```

默认情况下禁用此功能。 如果您为占位符指定默认值，您应该通过添加一个特殊属性来启用此功能，如下所示：

```xml
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <property name="org.apache.ibatis.parsing.PropertyParser.enable-default-value" value="true"/> <!-- Enable this feature -->
</properties>
```

这将与 SQL 定义中属性键中的 `:` 字符（例如 db:username）或 OGNL 表达式的三元运算符（例如 `${tableName != null ? tableName : 'global_constants'}`）冲突。

如果您使用其中任何一个并且想要默认属性值，则必须通过添加此特殊属性来更改默认值分隔符：

```xml
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <property name="org.apache.ibatis.parsing.PropertyParser.default-value-separator" value="?:"/> <!-- Change default value of separator -->
</properties>
```

```xml
<dataSource type="POOLED">
  <!-- ... -->
  <property name="username" value="${db:username?:ut_user}"/>
</dataSource>
```

# setting

## 说明

以下是MyBatis中所有常用的settings设置的描述、有效值以及默认值的表格，按照序号从1开始递增：

| 序号 | Setting名称                     | 描述                                              | 有效值                                           | 默认值                             |
|-----|-------------------------------|--------------------------------------------------|-------------------------------------------------|----------------------------------|
| 1   | cacheEnabled                  | 启用二级缓存                                       | true（启用）, false（禁用）                     | true                               |
| 2   | lazyLoadingEnabled            | 启用懒加载                                         | true（启用）, false（禁用）                     | false                              |
| 3   | aggressiveLazyLoading         | 激进的懒加载                                         | true（启用）, false（禁用）                     | false                              |
| 4   | multipleResultSetsEnabled     | 允许返回多个结果集（多个查询语句）                     | true（启用）, false（禁用）                     | true                               |
| 5   | useColumnLabel                | 使用列标签作为结果集中的列名                             | true（启用）, false（禁用）                     | true                               |
| 6   | useGeneratedKeys              | 允许使用JDBC自动生成的键（比如自增主键）                     | true（启用）, false（禁用）                     | false                              |
| 7   | defaultExecutorType           | 默认的执行器类型                                     | SIMPLE, REUSE, BATCH                             | SIMPLE                             |
| 8   | defaultStatementTimeout       | 默认的SQL语句超时时间（毫秒）                           | 任何非负整数                                       | 不超时（-1）                            |
| 9   | mapUnderscoreToCamelCase      | 启用驼峰命名转换（下划线命名转驼峰命名）                    | true（启用）, false（禁用）                     | false                              |
| 10  | safeRowBoundsEnabled          | 启用安全的RowBounds（避免返回超出限定范围的行）              | true（启用）, false（禁用）                     | false                              |
| 11  | safeResultHandlerEnabled      | 启用安全的ResultHandler（避免返回超出限定范围的行）          | true（启用）, false（禁用）                     | true                               |
| 12  | defaultFetchSize              | 默认的JDBC结果集大小                                 | 任何非负整数                                       | null                               |
| 13  | callSettersOnNulls            | 对于空值，调用setter方法进行赋值                        | true（启用）, false（禁用）                     | false                              |
| 14  | logImpl                       | 日志实现类的全限定名                                   | SLF4J, LOG4J, LOG4J2, JDK_LOGGING, COMMONS_LOGGING, STDOUT_LOGGING, NO_LOGGING | LOG4J                              |
| 15  | localCacheScope               | 本地缓存作用域                                       | SESSION, STATEMENT                               | SESSION                            |
| 16  | jdbcTypeForNull               | 空参数的JDBC类型                                     | NULL, VARCHAR, OTHER                            | OTHER                              |
| 18   | lazyLoadTriggerMethods     | 懒加载触发方法（用于生成代理对象）                | equals, hashCode, toString, clone, finalize | equals, hashCode, toString |
| 19   | defaultScriptingLanguage   | 默认的脚本语言                                 | org.apache.ibatis.scripting.xmltags.XMLLanguageDriver, org.apache.ibatis.scripting.defaults.RawLanguageDriver, org.apache.ibatis.scripting.xmltags.XMLLanguageDriver | org.apache.ibatis.scripting.xmltags.XMLLanguageDriver |
| 20   | defaultEnumTypeHandler     | 默认的枚举类型处理器                            | org.apache.ibatis.type.EnumTypeHandler | null            |
| 21   | defaultResultSetType       | 默认的结果集类型                               | FORWARD_ONLY, SCROLL_SENSITIVE, SCROLL_INSENSITIVE | null            |
| 22   | useActualParamName         | 启用实际参数名作为#{param1}等占位符的名称            | true（启用）, false（禁用）   | true            |
| 23   | returnInstanceForEmptyRow  | 当结果集为空时，返回空对象实例                   | true（启用）, false（禁用）   | false           |
| 24   | logPrefix                  | 日志前缀                                       | 任何字符串                     | null            |
| 25   | logPrefixEnabled           | 启用日志前缀                                   | true（启用）, false（禁用）   | false           |
| 26   | configurationFactory       | 自定义Configuration实例工厂类                   | 任何实现ConfigurationFactory接口的类 | null            |
| 27   | autoMappingBehavior        | 自动映射行为                                   | NONE, PARTIAL, FULL           | PARTIAL         |
| 28   | autoMappingUnknownColumnBehavior | 自动映射未知列的行为                       | NONE, WARNING, FAILING        | NONE            |
| 29   | autoMappingUnknownColumnName | 自动映射未知列的名称                            | 任何字符串                     | null            |
| 30   | defaultScriptingLanguageDriver | 默认的脚本语言驱动类                          | 任何实现LanguageDriver接口的类   | null            |
| 31   | defaultSqlProviderType     | 默认的SQL提供者类型                            | 任何实现SqlProvider接口的类     | null            |
| 32   | defaultEnumValueHandler    | 默认的枚举值处理器                              | 任何实现TypeHandler接口的类     | null            |
| 33   | callSettersOnImmutable     | 对于不可变对象，调用setter方法进行赋值             | true（启用）, false（禁用）   | false           |
| 34   | configurationFactory       | 自定义Configuration实例工厂类                   | 任何实现ConfigurationFactory接口的类 | null            |

请注意，这些设置不一定适用于所有的MyBatis版本，一些设置可能是在较新的版本中引入的。

在使用时，你可以参考相应版本的官方文档以了解具体的设置及其用法。

## 例子

```xml
<settings>
  <setting name="cacheEnabled" value="true"/>
  <setting name="lazyLoadingEnabled" value="true"/>
  <setting name="aggressiveLazyLoading" value="true"/>
  <setting name="multipleResultSetsEnabled" value="true"/>
  <setting name="useColumnLabel" value="true"/>
  <setting name="useGeneratedKeys" value="false"/>
  <setting name="autoMappingBehavior" value="PARTIAL"/>
  <setting name="autoMappingUnknownColumnBehavior" value="WARNING"/>
  <setting name="defaultExecutorType" value="SIMPLE"/>
  <setting name="defaultStatementTimeout" value="25"/>
  <setting name="defaultFetchSize" value="100"/>
  <setting name="safeRowBoundsEnabled" value="false"/>
  <setting name="safeResultHandlerEnabled" value="true"/>
  <setting name="mapUnderscoreToCamelCase" value="false"/>
  <setting name="localCacheScope" value="SESSION"/>
  <setting name="jdbcTypeForNull" value="OTHER"/>
  <setting name="lazyLoadTriggerMethods" value="equals,clone,hashCode,toString"/>
  <setting name="defaultScriptingLanguage" value="org.apache.ibatis.scripting.xmltags.XMLLanguageDriver"/>
  <setting name="defaultEnumTypeHandler" value="org.apache.ibatis.type.EnumTypeHandler"/>
  <setting name="callSettersOnNulls" value="false"/>
  <setting name="returnInstanceForEmptyRow" value="false"/>
  <setting name="logPrefix" value="exampleLogPreFix_"/>
  <setting name="logImpl" value="SLF4J | LOG4J | LOG4J2 | JDK_LOGGING | COMMONS_LOGGING | STDOUT_LOGGING | NO_LOGGING"/>
  <setting name="proxyFactory" value="CGLIB | JAVASSIST"/>
  <setting name="vfsImpl" value="org.mybatis.example.YourselfVfsImpl"/>
  <setting name="useActualParamName" value="true"/>
  <setting name="configurationFactory" value="org.mybatis.example.ConfigurationFactory"/>
</settings>
```

# 类型别名 typeAliases

类型别名只是 Java 类型的简称。 

它只与 XML 配置相关，存在的目的只是为了减少完全限定类名的冗余输入。 

例如：

```xml
<typeAliases>
  <typeAlias alias="Author" type="domain.blog.Author"/>
  <typeAlias alias="Blog" type="domain.blog.Blog"/>
  <typeAlias alias="Comment" type="domain.blog.Comment"/>
  <typeAlias alias="Post" type="domain.blog.Post"/>
  <typeAlias alias="Section" type="domain.blog.Section"/>
  <typeAlias alias="Tag" type="domain.blog.Tag"/>
</typeAliases>
```

通过此配置，Blog 现在可以在 domain.blog.Blog 所在的任何地方使用。

您还可以指定一个包，MyBatis 将在其中搜索 bean。 

例如：

```xml
<typeAliases>
  <package name="domain.blog"/>
</typeAliases>
```

在 domain.blog 中找到的每个 bean，如果没有找到注释，将使用 bean 的非大写非限定类名注册为别名。 

即 domain.blog.Author 将被注册为作者。 

如果找到 `@Alias` 注释，它的值将用作别名。 

请参见下面的示例：

```java
@Alias("author")
public class Author {
    ...
}
```

## 内置类型别名

常见的 Java 类型有许多内置的类型别名。 

它们都不区分大小写，请注意由于名称重载而对原语的特殊处理。

以下是MyBatis中常用的类型别名及其对应的Java类型的表格，按照序号从1开始递增：

| 序号 | 类型别名        | 对应的Java类型                   |
| ---- | -------------- | -------------------------------- |
| 1    | _byte          | byte                             |
| 2    | _short         | short                            |
| 3    | _int           | int                              |
| 4    | _long          | long                             |
| 5    | _float         | float                            |
| 6    | _double        | double                           |
| 7    | _boolean       | boolean                          |
| 8    | string         | java.lang.String                 |
| 9    | byte           | java.lang.Byte                   |
| 10   | short          | java.lang.Short                  |
| 11   | int            | java.lang.Integer                |
| 12   | long           | java.lang.Long                   |
| 13   | float          | java.lang.Float                  |
| 14   | double         | java.lang.Double                 |
| 15   | boolean        | java.lang.Boolean                |
| 16   | date           | java.util.Date                   |
| 17   | decimal        | java.math.BigDecimal             |
| 18   | bigdecimal     | java.math.BigDecimal             |
| 19   | biginteger     | java.math.BigInteger             |
| 20   | object         | java.lang.Object                 |
| 21   | map            | java.util.Map                    |
| 22   | hashmap        | java.util.HashMap                |
| 23   | list           | java.util.List                   |
| 24   | arraylist      | java.util.ArrayList              |
| 25   | collection     | java.util.Collection             |
| 26   | iterator       | java.util.Iterator               |
| 27   | iterable       | java.lang.Iterable               |
| 28   | cursor         | org.apache.ibatis.cursor.Cursor   |
| 29   | resultSet      | java.sql.ResultSet               |
| 30   | jdbcType       | java.sql.JDBCType                |
| 31   | blob           | java.sql.Blob                    |
| 32   | clob           | java.sql.Clob                    |
| 33   | array          | java.sql.Array                   |
| 34   | url            | java.net.URL                     |
| 35   | uri            | java.net.URI                     |
| 36   | uuid           | java.util.UUID                   |
| 37   | properties     | java.util.Properties             |
| 38   | parameter      | org.apache.ibatis.mapping.ParameterMode |

这些类型别名可以在MyBatis的配置文件中使用，简化了Java类型的引用，使代码更加简洁易读。

# 类型处理器 typeHandlers

每当 MyBatis 在 PreparedStatement 上设置参数或从 ResultSet 中检索值时，TypeHandler 用于以适合 Java 类型的方式检索值。 

下表描述了默认的 TypeHandlers。

注意 从 3.4.5 版本开始，MyBatis 默认支持 JSR-310（日期和时间 API）。

## 映射表格

以下是MyBatis中常用的TypeHandler及其对应的Java类型和JDBC类型的表格，按照序号从1开始递增：

| 序号 | TypeHandler                 | Java类型                              | JDBC类型                               |
|-----|---------------------------|---------------------------------------|----------------------------------------|
| 1   | BooleanTypeHandler         | java.lang.Boolean                     | BIT, BOOLEAN                           |
| 2   | ByteTypeHandler            | java.lang.Byte                        | TINYINT                                |
| 3   | ShortTypeHandler           | java.lang.Short                       | SMALLINT                               |
| 4   | IntegerTypeHandler         | java.lang.Integer                     | INTEGER, INT                           |
| 5   | LongTypeHandler            | java.lang.Long                        | BIGINT                                 |
| 6   | FloatTypeHandler           | java.lang.Float                       | REAL, FLOAT                            |
| 7   | DoubleTypeHandler          | java.lang.Double                      | DOUBLE, FLOAT                          |
| 8   | BigDecimalTypeHandler      | java.math.BigDecimal                  | DECIMAL, NUMERIC                       |
| 9   | StringTypeHandler          | java.lang.String                      | CHAR, VARCHAR                          |
| 10  | ClobTypeHandler            | java.sql.Clob                         | CLOB                                   |
| 11  | BlobTypeHandler            | java.sql.Blob                         | BLOB, LONGVARBINARY, VARBINARY, BINARY |
| 12  | ByteArrayTypeHandler       | byte[]                                | BLOB, LONGVARBINARY, VARBINARY, BINARY |
| 13  | DateTypeHandler            | java.util.Date                        | DATE                                   |
| 14  | DateOnlyTypeHandler        | java.util.Date                        | DATE                                   |
| 15  | TimeOnlyTypeHandler        | java.util.Date                        | TIME                                   |
| 16  | TimestampTypeHandler       | java.util.Date                        | TIMESTAMP                              |
| 17  | LocalDateTimeTypeHandler  | java.time.LocalDateTime               | TIMESTAMP                              |
| 18  | LocalDateTypeHandler       | java.time.LocalDate                   | DATE                                   |
| 19  | LocalTimeTypeHandler       | java.time.LocalTime                   | TIME                                   |
| 20  | OffsetDateTimeTypeHandler  | java.time.OffsetDateTime              | TIMESTAMP WITH TIME ZONE                |
| 21  | OffsetTimeTypeHandler      | java.time.OffsetTime                  | TIME WITH TIME ZONE                     |
| 22  | ZonedDateTimeTypeHandler   | java.time.ZonedDateTime               | TIMESTAMP WITH TIME ZONE                |
| 23  | EnumTypeHandler            | Enum                                  | VARCHAR, CHAR                          |
| 24  | EnumOrdinalTypeHandler     | Enum                                  | INTEGER                                |
| 25  | ObjectTypeHandler          | java.lang.Object                      | OTHER                                  |
| 26  | ArrayTypeHandler           | Array                                 | ARRAY                                  |
| 27  | ListTypeHandler            | java.util.List                        | ARRAY                                  |
| 28  | SetTypeHandler             | java.util.Set                         | ARRAY                                  |
| 29  | MapTypeHandler             | java.util.Map                         | OTHER                                  |
| 30  | JSONTypeHandler            | com.alibaba.fastjson.JSONObject        | OTHER                                  |
| 31  | XMLTypeHandler             | org.w3c.dom.Document                  | OTHER                                  |
| 32  | XMLGregorianCalendarTypeHandler | javax.xml.datatype.XMLGregorianCalendar | TIMESTAMP                              |

这些TypeHandler可以用于处理Java对象和数据库字段之间的类型转换。

## 自定义

您可以覆盖类型处理程序或创建自己的处理程序来处理不受支持或非标准的类型。 

为此，实现接口 org.apache.ibatis.type.TypeHandler 或扩展便利类 org.apache.ibatis.type.BaseTypeHandler 并可选择将其映射到 JDBC 类型。 

例如：

```java
// ExampleTypeHandler.java
@MappedJdbcTypes(JdbcType.VARCHAR)
public class ExampleTypeHandler extends BaseTypeHandler<String> {

  @Override
  public void setNonNullParameter(PreparedStatement ps, int i,
    String parameter, JdbcType jdbcType) throws SQLException {
    ps.setString(i, parameter);
  }

  @Override
  public String getNullableResult(ResultSet rs, String columnName)
    throws SQLException {
    return rs.getString(columnName);
  }

  @Override
  public String getNullableResult(ResultSet rs, int columnIndex)
    throws SQLException {
    return rs.getString(columnIndex);
  }

  @Override
  public String getNullableResult(CallableStatement cs, int columnIndex)
    throws SQLException {
    return cs.getString(columnIndex);
  }
}
```

配置信息：

```xml
<!-- mybatis-config.xml -->
<typeHandlers>
  <typeHandler handler="org.mybatis.example.ExampleTypeHandler"/>
</typeHandlers>
```

使用这样的 TypeHandler 将覆盖 Java String 属性和 VARCHAR 参数和结果的现有类型处理程序。 

请注意，**MyBatis 不会内省数据库元数据来确定类型，因此您必须在参数和结果映射中指定它是一个 VARCHAR 字段，以挂钩正确的类型处理程序。 这是因为 MyBatis 在执行语句之前不知道数据类型**。

MyBatis 会通过自省其泛型类型知道您希望使用此 TypeHandler 处理的 Java 类型，但您可以通过两种方式覆盖此行为：

1. 将 javaType 属性添加到 typeHandler 元素（例如：javaType="String"）

2. 将 @MappedTypes 注释添加到您的 TypeHandler 类，指定要与之关联的 java 类型列表。 如果还指定了 javaType 属性，则将忽略此注释。

可以通过两种方式指定关联的 JDBC 类型：

1. 将 jdbcType 属性添加到 typeHandler 元素（例如：jdbcType="VARCHAR"）。

2. 将 @MappedJdbcTypes 注释添加到您的 TypeHandler 类，指定要与之关联的 JDBC 类型列表。 如果还指定了 jdbcType 属性，则将忽略此注释。

在决定在 ResultMap 中使用哪个 TypeHandler 时，Java 类型是已知的（从结果类型），但 JDBC 类型是未知的。 因此 MyBatis 使用组合 javaType=[TheJavaType], jdbcType=null 来选择一个 TypeHandler。 

这意味着使用 @MappedJdbcTypes 注释会限制 TypeHandler 的范围，并使其无法在 ResultMaps 中使用，除非明确设置。

要使 TypeHandler 可用于 ResultMap，请在 @MappedJdbcTypes 注释上设置 includeNullJdbcType=true。 
 
然而，从 Mybatis 3.4.0 开始，如果注册了一个 TypeHandler 来处理一个 Java 类型，它将在使用该 Java 类型的 ResultMaps 中默认使用（即即使没有 includeNullJdbcType=true）。

最后你可以让 MyBatis 搜索你的 TypeHandlers：

```xml
<!-- mybatis-config.xml -->
<typeHandlers>
  <package name="org.mybatis.example"/>
</typeHandlers>
```

请注意，当使用自动发现功能时，JDBC 类型只能用注释指定。

您可以创建一个能够处理多个类的通用 TypeHandler。 

为此，添加一个接收类作为参数的构造函数，MyBatis 将在构造 TypeHandler 时传递实际的类。

```java
//GenericTypeHandler.java
public class GenericTypeHandler<E extends MyObject> extends BaseTypeHandler<E> {

  private Class<E> type;

  public GenericTypeHandler(Class<E> type) {
    if (type == null) throw new IllegalArgumentException("Type argument cannot be null");
    this.type = type;
  }
```

EnumTypeHandler 和 EnumOrdinalTypeHandler 是通用类型处理程序。 

我们将在下一节中了解它们。

# 处理枚举

如果要映射枚举，则需要使用 EnumTypeHandler 或 EnumOrdinalTypeHandler。

例如，假设我们需要存储应该与某个数字一起使用的舍入模式，如果它需要四舍五入的话。 

默认情况下，MyBatis 使用 EnumTypeHandler 将 Enum 值转换为它们的名称。

注意 EnumTypeHandler 的特殊之处在于它与其他处理程序不同，它不只处理一个特定的类，而是处理扩展 Enum 的任何类

但是，我们可能不想存储名称。 我们的 DBA 可能会坚持使用整数代码。 

这很简单：将 EnumOrdinalTypeHandler 添加到配置文件中的 typeHandlers，现在每个 RoundingMode 都将使用其序数值映射到一个整数。

```xml
<!-- mybatis-config.xml -->
<typeHandlers>
  <typeHandler handler="org.apache.ibatis.type.EnumOrdinalTypeHandler"
    javaType="java.math.RoundingMode"/>
</typeHandlers>
```

但是，如果你想将同一个枚举在一个地方映射到一个字符串，在另一个地方映射到整数怎么办？

自动映射器将自动使用 EnumOrdinalTypeHandler，所以如果我们想回到使用普通的旧 EnumTypeHandler，我们必须通过显式设置用于那些 SQL 语句的类型处理程序来告诉它。

（直到下一节才会介绍映射器文件，所以如果这是您第一次通读文档，您可能想暂时跳过这一节，稍后再回来阅读。）

```xml
<!DOCTYPE mapper
    PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="org.apache.ibatis.submitted.rounding.Mapper">
    <resultMap type="org.apache.ibatis.submitted.rounding.User" id="usermap">
        <id column="id" property="id"/>
        <result column="name" property="name"/>
        <result column="funkyNumber" property="funkyNumber"/>
        <result column="roundingMode" property="roundingMode"/>
    </resultMap>

    <select id="getUser" resultMap="usermap">
        select * from users
    </select>
    <insert id="insert">
        insert into users (id, name, funkyNumber, roundingMode) values (
            #{id}, #{name}, #{funkyNumber}, #{roundingMode}
        )
    </insert>

    <resultMap type="org.apache.ibatis.submitted.rounding.User" id="usermap2">
        <id column="id" property="id"/>
        <result column="name" property="name"/>
        <result column="funkyNumber" property="funkyNumber"/>
        <result column="roundingMode" property="roundingMode"
         typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    </resultMap>
    <select id="getUser2" resultMap="usermap2">
        select * from users2
    </select>
    <insert id="insert2">
        insert into users2 (id, name, funkyNumber, roundingMode) values (
            #{id}, #{name}, #{funkyNumber}, #{roundingMode, typeHandler=org.apache.ibatis.type.EnumTypeHandler}
        )
    </insert>

</mapper>
```

请注意，这会强制我们在 select 语句中使用 resultMap 而不是 resultType。

# 对象工厂 objectFactory

每次 MyBatis 创建一个结果对象的新实例时，它使用一个 ObjectFactory 实例来这样做。 

默认的 ObjectFactory 只是使用默认构造函数或参数化构造函数（如果存在参数映射）实例化目标类。 

如果您想覆盖 ObjectFactory 的默认行为，您可以创建自己的行为。 

例如：

```java
// ExampleObjectFactory.java
public class ExampleObjectFactory extends DefaultObjectFactory {
  @Override
  public <T> T create(Class<T> type) {
    return super.create(type);
  }

  @Override
  public <T> T create(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
    return super.create(type, constructorArgTypes, constructorArgs);
  }

  @Override
  public void setProperties(Properties properties) {
    super.setProperties(properties);
  }

  @Override
  public <T> boolean isCollection(Class<T> type) {
    return Collection.class.isAssignableFrom(type);
  }
}
```

```xml
<!-- mybatis-config.xml -->
<objectFactory type="org.mybatis.example.ExampleObjectFactory">
  <property name="someProperty" value="100"/>
</objectFactory>
```

ObjectFactory 接口非常简单。 

它包含两个创建方法，一个处理默认构造函数，另一个处理参数化构造函数。 

最后，setProperties 方法可用于配置 ObjectFactory。 objectFactory 元素主体内定义的属性将在 ObjectFactory 实例初始化后传递给 setProperties 方法。

# 插件
MyBatis 允许您在执行映射语句时拦截对某些点的调用。 默认情况下，MyBatis 允许插件拦截以下方法调用：

- 执行器（更新、查询、flushStatements、提交、回滚、getTransaction、关闭、isClosed）

- ParameterHandler (getParameterObject, setParameters)

- ResultSetHandler (handleResultSets, handleOutputParameters)

- StatementHandler（准备、参数化、批处理、更新、查询）

这些类方法的详细信息可以通过查看每个方法的完整方法签名以及每个 MyBatis 版本中可用的源代码来发现。 

你应该了解你覆盖的方法的行为，假设你正在做的不仅仅是监视调用。 

如果你试图修改或覆盖给定方法的行为，你很可能会破坏 MyBatis 的核心。 

这些是低级类和方法，因此请谨慎使用插件。

考虑到插件提供的强大功能，使用插件非常简单。 

只需实现拦截器接口，确保指定要拦截的签名。

```java
// ExamplePlugin.java
@Intercepts({@Signature(
  type= Executor.class,
  method = "update",
  args = {MappedStatement.class,Object.class})})
public class ExamplePlugin implements Interceptor {
  private Properties properties = new Properties();

  @Override
  public Object intercept(Invocation invocation) throws Throwable {
    // implement pre-processing if needed
    Object returnObject = invocation.proceed();
    // implement post-processing if needed
    return returnObject;
  }

  @Override
  public void setProperties(Properties properties) {
    this.properties = properties;
  }
}
```

```xml
<!-- mybatis-config.xml -->
<plugins>
  <plugin interceptor="org.mybatis.example.ExamplePlugin">
    <property name="someProperty" value="100"/>
  </plugin>
</plugins>
```

上面的插件将拦截对 Executor 实例上的“update”方法的所有调用，Executor 实例是一个内部对象，负责映射语句的低级执行。

## 注意覆盖配置类

除了使用插件修改核心 MyBatis 行为之外，您还可以完全覆盖 Configuration 类。 

只需扩展它并覆盖其中的任何方法，然后将其传递到对 SqlSessionFactoryBuilder.build(myConfig) 方法的调用中。 

不过，这可能会对 MyBatis 的行为产生严重影响，因此请谨慎使用。

# 环境

MyBatis 可以配置多种环境。 这有助于您出于多种原因将 SQL 映射应用于多个数据库。 

例如，您的开发、测试和生产环境可能有不同的配置。 

或者，您可能有多个共享相同模式的生产数据库，并且您希望对两者使用相同的 SQL 映射。 有很多用例。

不过要记住一件重要的事情：虽然您可以配置多个环境，但每个 SqlSessionFactory 实例只能选择一个。

所以如果你想连接到两个数据库，你需要创建两个 SqlSessionFactory 的实例，一个一个。 对于三个数据库，您需要三个实例，依此类推。 真的很容易记住：

## 每个数据库一个 SqlSessionFactory 实例

要指定要构建的环境，您只需将其作为可选参数传递给 SqlSessionFactoryBuilder。 接受环境的两个签名是：

```java
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment, properties);
```

如果省略环境，则加载默认环境，如下所示：

```java
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, properties);
```

环境元素定义了环境如何配置：

```xml
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC">
      <property name="..." value="..."/>
    </transactionManager>
    <dataSource type="POOLED">
      <property name="driver" value="${driver}"/>
      <property name="url" value="${url}"/>
      <property name="username" value="${username}"/>
      <property name="password" value="${password}"/>
    </dataSource>
  </environment>
</environments>
```

注意这里的关键部分：

默认环境 ID（例如 default="development"）。
定义的每个环境的环境 ID（例如 id="development"）。
TransactionManager 配置（例如 type="JDBC"）
DataSource 配置（例如 type="POOLED"）
默认环境和环境 ID 是不言自明的。 随心所欲地命名它们，只需确保默认值与其中之一匹配即可。

## 事务管理器 TransactionManager

MyBatis 包含两种 TransactionManager 类型（即 type="[JDBC|MANAGED]"）：

JDBC – 此配置直接使用 JDBC 提交和回滚工具。 它依赖于从数据源检索到的连接来管理事务的范围。 

默认情况下，它在关闭连接时启用自动提交以与某些驱动程序兼容。 

然而，对于某些驱动程序来说，启用自动提交不仅是不必要的，而且是一项昂贵的操作。 因此，从版本 3.5.10 开始，您可以通过将“skipSetAutoCommitOnClose”属性设置为 true 来跳过此步骤。 

例如：

```xml
<transactionManager type="JDBC">
  <property name="skipSetAutoCommitOnClose" value="true"/>
</transactionManager>
```

MANAGED——这个配置几乎什么都不做。 它从不提交或回滚连接。 

相反，它让容器管理事务的整个生命周期（例如 JEE 应用服务器上下文）。 默认情况下它会关闭连接。 

但是，有些容器不希望这样，因此如果您需要阻止它关闭连接，请将“closeConnection”属性设置为 false。 

例如：

```xml
<transactionManager type="MANAGED">
  <property name="closeConnection" value="false"/>
</transactionManager>
```

如果您计划将 MyBatis 与 Spring 一起使用，则无需配置任何 TransactionManager，因为 Spring 模块将设置自己的一个来覆盖任何先前设置的配置。

这些 TransactionManager 类型都不需要任何属性。 

但是，它们都是类型别名，因此换句话说，您可以放置自己的完全限定类名或引用您自己的 TransactionFactory 接口实现的类型别名，而不是使用它们。

```java
public interface TransactionFactory {
  default void setProperties(Properties props) { // Since 3.5.2, change to default method
    // NOP
  }
  Transaction newTransaction(Connection conn);
  Transaction newTransaction(DataSource dataSource, TransactionIsolationLevel level, boolean autoCommit);
}
```

在 XML 中配置的任何属性都将在实例化后传递给 setProperties() 方法。

您的实现还需要创建一个事务实现，这也是一个非常简单的接口：

```java
public interface Transaction {
  Connection getConnection() throws SQLException;
  void commit() throws SQLException;
  void rollback() throws SQLException;
  void close() throws SQLException;
  Integer getTimeout() throws SQLException;
}
```

## datasource

dataSource 元素使用标准 JDBC DataSource 接口配置 JDBC Connection 对象的源。

大多数 MyBatis 应用程序都会像示例中那样配置一个数据源。 但是，这不是必需的。 但是要意识到，为了促进延迟加载，这个数据源是必需的。

共有三种内置数据源类型（即 type="[UNPOOLED|POOLED|JNDI]"）：

### UNPOOLED

UNPOOLED – DataSource 的这种实现只是在每次请求时打开和关闭连接。 

虽然它有点慢，但对于不需要立即可用连接性能的简单应用程序来说，这是一个不错的选择。 

不同的数据库在这个性能方面也不同，所以对于某些人来说，pool 可能不太重要，这种配置将是理想的。 UNPOOLED 数据源具有以下要配置的属性：

driver – 这是 JDBC 驱动程序的完全限定 Java 类（如果您的驱动程序包含一个，则不是 DataSource 类）。
url – 这是您的数据库实例的 JDBC URL。
username – 用于登录的数据库用户名。
password - 用于登录的数据库密码。
defaultTransactionIsolationLevel – 连接的默认事务隔离级别。
defaultNetworkTimeout – 等待数据库操作完成的默认网络超时值（以毫秒为单位）。 有关详细信息，请参阅 java.sql.Connection#setNetworkTimeout() 的 API 文档。

或者，您也可以将属性传递给数据库驱动程序。 为此，请在属性前加上 driver.，例如：

驱动程序.encoding=UTF8

这将通过 DriverManager.getConnection(url, driverProperties) 方法将值为 UTF8 的属性编码传递给您的数据库驱动程序。

### POOLED 

DataSource 的这种实现将 JDBC Connection 对象合并在一起，以避免创建新的 Connection 实例所需的初始连接和身份验证时间。 这是并发 Web 应用程序实现最快响应的流行方法。

除了上面的 (UNPOOLED) 属性之外，还有更多属性可用于配置 POOLED 数据源：

poolMaximumActiveConnections – 这是在任何给定时间可以存在的活动（即使用中）连接数。 默认值：10
poolMaximumIdleConnections – 在任何给定时间可以存在的空闲连接数。
poolMaximumCheckoutTime – 这是连接在强制返回之前可以从池中“签出”的时间量。 默认值：20000 毫秒（即 20 秒）
poolTimeToWait——这是一个低级别的设置，它让池有机会打印日志状态并在花费异常长的情况下重新尝试获取连接（以避免在池配置错误时永远静默失败）。 默认值：20000 毫秒（即 20 秒）
poolMaximumLocalBadConnectionTolerance – 这是一个低级别的设置，用于容忍任何线程获得的错误连接。 如果一个线程得到了一个错误的连接，它可能还有另一次机会重新尝试获得另一个有效的连接。 但重试次数不应超过 poolMaximumIdleConnections 和 poolMaximumLocalBadConnectionTolerance 的总和。 默认值：3（自：3.4.5）
poolPingQuery – Ping 查询被发送到数据库以验证连接是否处于良好的工作状态并准备好接受请求。 默认值为“NO PING QUERY SET”，这将导致大多数数据库驱动程序失败并显示适当的错误消息。
poolPingEnabled – 这启用或禁用 ping 查询。 如果启用，您还必须使用有效的 SQL 语句（最好是非常快的语句）设置 poolPingQuery 属性。 默认值：假。
poolPingConnectionsNotUsedFor – 这配置了 poolPingQuery 的使用频率。 这可以设置为匹配数据库连接的典型超时，以避免不必要的 ping。 默认值：0（即每次都会对所有连接执行 ping 操作——当然前提是 poolPingEnabled 为真）。

### JNDI

DataSource 的这个实现旨在与 EJB 或应用程序服务器等容器一起使用，这些容器可以集中或外部配置 DataSource 并在 JNDI 上下文中放置对它的引用。 这个 DataSource 配置只需要两个属性：

initial_context – 此属性用于从 InitialContext 进行上下文查找（即 initialContext.lookup(initial_context)）。 此属性是可选的，如果省略，则将直接针对 InitialContext 查找 data_source 属性。
data_source – 这是可以找到对 DataSource 实例的引用的上下文路径。 它将针对 initial_context 查找返回的上下文进行查找，或者如果未提供 initial_context 则直接针对 InitialContext 进行查找。
与其他 DataSource 配置类似，可以通过在这些属性前加上 env. 将属性直接发送到 InitialContext，例如：

环境编码=UTF8
这将在实例化时将具有 UTF8 值的属性编码发送到 InitialContext 的构造函数。

您可以通过实现接口 org.apache.ibatis.datasource.DataSourceFactory 来插入任何第 3 方数据源：


```java
public interface DataSourceFactory {
  void setProperties(Properties props);
  DataSource getDataSource();
}
```

org.apache.ibatis.datasource.unpooled.UnpooledDataSourceFactory 可以用作超类来构建新的数据源适配器。 

例如，这是插入 C3P0 所需的代码：

```java
import org.apache.ibatis.datasource.unpooled.UnpooledDataSourceFactory;
import com.mchange.v2.c3p0.ComboPooledDataSource;

public class C3P0DataSourceFactory extends UnpooledDataSourceFactory {

  public C3P0DataSourceFactory() {
    this.dataSource = new ComboPooledDataSource();
  }
}
```

要设置它，请为您希望 MyBatis 调用的每个 setter 方法添加一个属性。 

以下是连接到 PostgreSQL 数据库的示例配置：

```xml
<dataSource type="org.myproject.C3P0DataSourceFactory">
  <property name="driver" value="org.postgresql.Driver"/>
  <property name="url" value="jdbc:postgresql:mydb"/>
  <property name="username" value="postgres"/>
  <property name="password" value="root"/>
</dataSource>
```

# databaseIdProvider

MyBatis 能够根据您的数据库供应商执行不同的语句。 

多数据库供应商支持基于映射语句的 databaseId 属性。 

MyBatis 将加载所有没有 databaseId 属性或 databaseId 与当前匹配的语句。 

如果在有和没有 databaseId 的情况下发现相同的语句，后者将被丢弃。 

要启用多供应商支持，请将 databaseIdProvider 添加到 mybatis-config.xml 文件，如下所示：

```xml
<databaseIdProvider type="DB_VENDOR" />
```

DB_VENDOR 实现 databaseIdProvider 将 DatabaseMetaData#getDatabaseProductName() 返回的字符串设置为 databaseId。 

鉴于通常该字符串太长并且同一产品的不同版本可能返回不同的值，您可能希望通过添加如下属性将其转换为较短的字符串：

```xml
<databaseIdProvider type="DB_VENDOR">
  <property name="SQL Server" value="sqlserver"/>
  <property name="DB2" value="db2"/>
  <property name="Oracle" value="oracle" />
</databaseIdProvider>
```

提供属性时，DB_VENDOR databaseIdProvider 将搜索与返回的数据库产品名称中找到的第一个键对应的属性值，如果没有匹配的属性，则搜索“null”。 

在这种情况下，如果 getDatabaseProductName() 返回“Oracle (DataDirect)”，则 databaseId 将设置为“oracle”。

你可以通过实现接口 org.apache.ibatis.mapping.DatabaseIdProvider 并在 mybatis-config.xml 中注册它来构建你自己的 DatabaseIdProvider：

```java
public interface DatabaseIdProvider {
  default void setProperties(Properties p) { // Since 3.5.2, changed to default method
    // NOP
  }
  String getDatabaseId(DataSource dataSource) throws SQLException;
}
```

# mappers 映射器

现在 MyBatis 的行为已经用上面的配置元素配置好了，我们准备好定义映射的 SQL 语句了。 

但首先，我们需要告诉 MyBatis 在哪里可以找到它们。 Java 在这方面并没有真正提供任何好的自动发现方法，所以最好的方法是简单地告诉 MyBatis 在哪里可以找到映射文件。 

您可以使用类路径相关资源引用、完全限定的 url 引用（包括 file:/// URL）、类名或包名。 例如：

```xml
<!-- Using classpath relative resources -->
<mappers>
  <mapper resource="org/mybatis/builder/AuthorMapper.xml"/>
  <mapper resource="org/mybatis/builder/BlogMapper.xml"/>
  <mapper resource="org/mybatis/builder/PostMapper.xml"/>
</mappers>
<!-- Using url fully qualified paths -->
<mappers>
  <mapper url="file:///var/mappers/AuthorMapper.xml"/>
  <mapper url="file:///var/mappers/BlogMapper.xml"/>
  <mapper url="file:///var/mappers/PostMapper.xml"/>
</mappers>
<!-- Using mapper interface classes -->
<mappers>
  <mapper class="org.mybatis.builder.AuthorMapper"/>
  <mapper class="org.mybatis.builder.BlogMapper"/>
  <mapper class="org.mybatis.builder.PostMapper"/>
</mappers>
<!-- Register all interfaces in a package as mappers -->
<mappers>
  <package name="org.mybatis.builder"/>
</mappers>
```

这些语句只是告诉 MyBatis 从这里到哪里去。 

其余的细节在每个 SQL 映射文件中，这正是下一节将要讨论的内容。

# 参考资料

https://mybatis.org/mybatis-3/configuration.html

* any list
{:toc}
