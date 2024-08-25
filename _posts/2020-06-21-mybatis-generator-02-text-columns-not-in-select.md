---
layout: post
title:  MBG Mybatis Generator TEXT 类型字段生成是单独的 ResultMap，不在默认的 select resultMap 中
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, mbg, sh]
published: true
---

# 现象

MBG Mybatis Generator TEXT 类型字段生成是单独的 ResultMap，不在默认的 select resultMap 中

# 解决方式

通过 MyBatis Generator (MBG) 配置中的 `OverrideColumn` 来将 `TEXT` 字段指定为 `VARCHAR`，从而避免生成单独的 `ResultMap`，可以按照以下步骤进行配置：

以下是一个配置示例：

```xml
<generatorConfiguration>
    <context id="MySqlContext" targetRuntime="MyBatis3">
        
        <!-- 数据库连接配置 -->
        <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/your_database"
                        userId="root"
                        password="password">
        </jdbcConnection>

        <!-- 表配置 -->
        <table tableName="your_table_name">
            <columnOverride column="your_text_column_name" jdbcType="VARCHAR" />
        </table>

        <!-- 其他配置 -->
    </context>
</generatorConfiguration>
```

这种方法简单易行，无需自定义 Java 代码，只需在 `generatorConfig.xml` 中添加配置即可解决问题。

# MBG 单独处理的原因?

MyBatis Generator (MBG) 在处理 `TEXT` 类型字段时，会为其生成单独的 `ResultMap`，而不将其包含在默认的 `select` 的 `ResultMap` 中，主要原因是数据库中 `TEXT` 类型字段的处理和映射与其他普通类型字段不同。

以下是原因：

1. **数据库性能与内存消耗**：
   - `TEXT` 类型字段通常用于存储大文本数据，这可能会占用大量的内存和 I/O 资源。
   
   将其与其他字段分开处理，可以优化查询性能，尤其是当你并不总是需要查询大文本字段时。

2. **查询优化**：
   - 将 `TEXT` 字段放在单独的 `ResultMap` 中，使得你可以根据需要选择性地加载这些字段，而不是每次查询都将大文本字段加载到内存中。这有助于提高查询效率。

3. **数据库引擎限制**：
   - 在某些数据库（如 MySQL）中，`TEXT` 类型的字段可能不支持某些索引或排序操作。将其放在单独的 `ResultMap` 中，可以避免不必要的复杂查询操作。

4. **代码的可维护性**：
   - 分离出来的 `TEXT` 字段使得生成的代码更加清晰，便于开发者理解哪些字段是大文本字段，哪些是普通字段，并且可以更灵活地控制查询的行为。

5. **兼容性**：
   - 有些 ORM 框架在处理大数据类型时，可能会有特定的要求或最佳实践。MyBatis Generator 选择将 `TEXT` 字段单独处理，以确保生成的代码在更广泛的场景中能够兼容并表现良好。

# chat

## 为什么 Mybatis Generator TEXT 类型字段生成是单独的 ResultMap，不在默认的 select resultMap 中

MyBatis Generator (MBG) 在处理 `TEXT` 类型字段时，会为其生成单独的 `ResultMap`，而不将其包含在默认的 `select` 的 `ResultMap` 中，主要原因是数据库中 `TEXT` 类型字段的处理和映射与其他普通类型字段不同。

以下是原因：

1. **数据库性能与内存消耗**：
   - `TEXT` 类型字段通常用于存储大文本数据，这可能会占用大量的内存和 I/O 资源。
   
   将其与其他字段分开处理，可以优化查询性能，尤其是当你并不总是需要查询大文本字段时。

2. **查询优化**：
   - 将 `TEXT` 字段放在单独的 `ResultMap` 中，使得你可以根据需要选择性地加载这些字段，而不是每次查询都将大文本字段加载到内存中。这有助于提高查询效率。

3. **数据库引擎限制**：
   - 在某些数据库（如 MySQL）中，`TEXT` 类型的字段可能不支持某些索引或排序操作。将其放在单独的 `ResultMap` 中，可以避免不必要的复杂查询操作。

4. **代码的可维护性**：
   - 分离出来的 `TEXT` 字段使得生成的代码更加清晰，便于开发者理解哪些字段是大文本字段，哪些是普通字段，并且可以更灵活地控制查询的行为。

5. **兼容性**：
   - 有些 ORM 框架在处理大数据类型时，可能会有特定的要求或最佳实践。MyBatis Generator 选择将 `TEXT` 字段单独处理，以确保生成的代码在更广泛的场景中能够兼容并表现良好。

综上所述，MyBatis Generator 这样设计的目的是为了在性能、可维护性和灵活性之间取得平衡。

## 如何解决？

如果你希望 MyBatis Generator (MBG) 在生成 `TEXT` 类型字段时，直接将其包含在默认的 `ResultMap` 中，而不是生成单独的 `ResultMap`，可以通过以下方法解决：

### 1. 自定义 `JavaTypeResolver`
你可以通过自定义 `JavaTypeResolver` 来改变 MBG 对特定数据库类型的处理逻辑。

```java
public class CustomJavaTypeResolver extends JavaTypeResolverDefaultImpl {

    @Override
    protected void initializeTypeMap() {
        super.initializeTypeMap();
        // 将数据库中的 TEXT 类型映射为 String，而不是 Blob
        typeMap.put(Types.LONGVARCHAR, new JdbcTypeInformation("TEXT", new FullyQualifiedJavaType(String.class.getName())));
    }
}
```

然后在 MyBatis Generator 配置文件 (`generatorConfig.xml`) 中指定自定义的 `JavaTypeResolver`：

```xml
<javaTypeResolver type="your.package.name.CustomJavaTypeResolver" />
```

### 2. 使用插件自定义生成逻辑
你可以编写 MyBatis Generator 插件，来定制生成 `ResultMap` 的逻辑，使得 `TEXT` 字段被包含在默认的 `ResultMap` 中。

```java
import org.mybatis.generator.api.IntrospectedColumn;
import org.mybatis.generator.api.IntrospectedTable;
import org.mybatis.generator.api.PluginAdapter;
import org.mybatis.generator.api.dom.xml.XmlElement;

import java.util.List;

public class CustomResultMapPlugin extends PluginAdapter {

    @Override
    public boolean sqlMapResultMapWithoutBLOBsElementGenerated(XmlElement element, IntrospectedTable introspectedTable) {
        // 将 TEXT 字段加入默认的 ResultMap
        introspectedTable.getBLOBColumns().forEach(column -> addResultMapping(element, column));
        return true;
    }

    private void addResultMapping(XmlElement element, IntrospectedColumn column) {
        // 构建一个 <result> 元素，将 TEXT 字段映射到 ResultMap 中
        XmlElement resultElement = new XmlElement("result");
        resultElement.addAttribute(new Attribute("column", column.getActualColumnName()));
        resultElement.addAttribute(new Attribute("property", column.getJavaProperty()));
        resultElement.addAttribute(new Attribute("jdbcType", column.getJdbcTypeName()));
        element.addElement(resultElement);
    }

    @Override
    public boolean validate(List<String> warnings) {
        return true;
    }
}
```

然后在 `generatorConfig.xml` 中配置这个插件：

```xml
<plugin type="your.package.name.CustomResultMapPlugin" />
```

### 3. 修改数据库设计或使用 MyBatis Generator 配置
如果你不希望通过代码定制，可以考虑以下两种替代方案：
- **修改数据库设计**：将 `TEXT` 类型改为 `VARCHAR`，如果你的数据确实不大，可以避免生成独立的 `ResultMap`。
- **使用 `selectByPrimaryKey` 或 `selectByExampleWithBLOBs`**：这是 MBG 提供的查询 `TEXT` 字段的预定义方法。

通过以上方法，你可以调整 MyBatis Generator 的行为，使得它将 `TEXT` 字段包含在默认的 `ResultMap` 中。

## 如何通过 MBG 配置，OverrideColumn 指定其为 varchar 来解决这个问题？

要通过 MyBatis Generator (MBG) 配置中的 `OverrideColumn` 来将 `TEXT` 字段指定为 `VARCHAR`，从而避免生成单独的 `ResultMap`，可以按照以下步骤进行配置：

### 1. 使用 `columnOverride` 配置

在 MyBatis Generator 的配置文件 `generatorConfig.xml` 中，使用 `<columnOverride>` 标签来覆盖特定列的数据库类型。

在这个配置中，你可以将 `TEXT` 类型的列指定为 `VARCHAR`，使其在生成的 `ResultMap` 中被视为 `VARCHAR` 字段。

以下是一个配置示例：

```xml
<generatorConfiguration>
    <context id="MySqlContext" targetRuntime="MyBatis3">
        
        <!-- 数据库连接配置 -->
        <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/your_database"
                        userId="root"
                        password="password">
        </jdbcConnection>

        <!-- 表配置 -->
        <table tableName="your_table_name">
            <columnOverride column="your_text_column_name" jdbcType="VARCHAR" />
        </table>

        <!-- 其他配置 -->
    </context>
</generatorConfiguration>
```

### 2. 配置解释

- **`<columnOverride>`**: 用于覆盖特定列的默认设置。你可以指定列名 (`column` 属性) 和新的 `jdbcType` 类型。
- **`column="your_text_column_name"`**: 这里替换为你实际的 `TEXT` 字段的列名。
- **`jdbcType="VARCHAR"`**: 将 `TEXT` 类型映射为 `VARCHAR`。

### 3. 效果

通过这种配置，MyBatis Generator 会将 `TEXT` 类型的列视为 `VARCHAR`，并将其直接包含在默认的 `ResultMap` 中，而不会为其生成单独的 `ResultMap`。

这种方法简单易行，无需自定义 Java 代码，只需在 `generatorConfig.xml` 中添加配置即可解决问题。


# 参考资料

https://blog.csdn.net/yu97271486/article/details/120005334

* any list
{:toc}