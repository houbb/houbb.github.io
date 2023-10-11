---
layout: post
title: SQL 索引建议-02-SqlParser java 如何解析 sql?
date: 2023-10-11 21:01:55 +0800
categories: [SQL]
tags: [sql, index, sh]
published: true
---

# chat

## Q1: java 如何解析 sql

在Java中，你可以使用现有的SQL解析库来解析SQL查询语句。这些库可以将SQL查询语句解析成可操作的数据结构，以便你能够分析、修改或者优化查询。

以下是一些常用的Java SQL解析库：

1. **JSqlParser**：
   JSqlParser是一个开源的Java库，它可以解析SQL查询语句并将其转换为Java对象。它支持标准的SQL语法，能够处理SELECT、UPDATE、DELETE、INSERT等语句，并将其解析成树状结构，方便你进行分析。你可以在GitHub上找到它的源代码和文档。

   GitHub链接：[JSqlParser](https://github.com/JSQLParser/JSqlParser)

   Maven依赖：
   ```xml
   <dependency>
       <groupId>com.github.jsqlparser</groupId>
       <artifactId>jsqlparser</artifactId>
       <version>4.2</version> <!-- 版本号请根据最新版本进行调整 -->
   </dependency>
   ```

2. **ANTLR**：
   ANTLR（ANother Tool for Language Recognition）是一个强大的解析生成器，它支持多种编程语言，包括Java。你可以使用ANTLR来定义自己的SQL语法规则，并生成相应的解析器。ANTLR提供了丰富的文档和社区支持。

   官方网站：[ANTLR](https://www.antlr.org/)

3. **Druid SQL Parser**：
   Druid SQL Parser是阿里巴巴开源的SQL解析库，它能够解析各种SQL语句，包括SELECT、UPDATE、DELETE等，并将其解析为Druid内部的数据结构。Druid是阿里巴巴开源的数据库连接池和SQL执行框架，该解析器是其一个组件。

   GitHub链接：[Druid SQL Parser](https://github.com/alibaba/druid)

   Maven依赖：
   ```xml
   <dependency>
       <groupId>com.alibaba</groupId>
       <artifactId>druid</artifactId>
       <version>1.2.6</version> <!-- 版本号请根据最新版本进行调整 -->
   </dependency>
   ```

这些库中的任何一个都可以用于解析SQL查询语句，你可以选择适合你需求的库来使用。

## Q2: 对比一下这几个解析工具，哪一个更加好用？

每个SQL解析工具都有其优势和适用场景。选择哪一个最适合你的需求取决于项目的具体要求、开发团队的经验、性能要求以及你是否需要定制化的解析规则。

以下是这几个解析工具的一些特点，可以帮助你选择合适的工具：

1. **JSqlParser**：
   - **特点**：JSqlParser是一个轻量级的、易用的SQL解析库。它提供了标准SQL语法的解析和转换功能，适用于大多数常见的SQL查询解析场景。
   - **优势**：简单易用，文档相对完善，活跃的社区支持，支持多种数据库的SQL语法。
   - **适用场景**：对于一般的SQL解析需求，JSqlParser是一个不错的选择。

2. **ANTLR**：
   - **特点**：ANTLR是一个强大的语法解析工具，它可以用于定义自定义的SQL语法规则，并生成相应的解析器。ANTLR的规则定义相对灵活，适用于定制化的、特殊语法的解析需求。
   - **优势**：支持自定义语法规则，广泛用于各种领域的语法解析。
   - **适用场景**：如果你需要处理特殊的SQL语法，或者有定制化的解析需求，ANTLR是一个强大的选择。

3. **Druid SQL Parser**：
   - **特点**：Druid SQL Parser是阿里巴巴出品的SQL解析器，它是Druid连接池的一部分，能够将SQL解析为Druid内部的数据结构。
   - **优势**：适用于与Druid连接池集成，提供了内部数据结构的解析。
   - **适用场景**：如果你使用Druid连接池，并且需要将SQL解析为Druid内部数据结构进行进一步处理，Druid SQL Parser是一个理想的选择。

选择合适的解析工具通常需要考虑项目的具体需求和团队的技术背景。如果你的项目中使用了特定的数据库系统，并且只需要进行标准SQL查询的解析，JSqlParser是一个简单且强大的选择。

如果你需要处理复杂的、自定义的SQL语法，ANTLR提供了更大的灵活性。

如果你使用了Druid连接池，并且需要与其内部数据结构进行交互，那么Druid SQL Parser是一个自然的选择。

# Q3: JSqlParser 使用入门

JSqlParser 是一个用于解析 SQL 查询语句的 Java 库。

它可以将 SQL 查询语句解析成易于操作的数据结构，使你能够分析、修改或优化查询。

以下是 JSqlParser 的入门指南，介绍如何开始使用它：

### 添加 Maven 依赖

首先，你需要在你的项目中添加 JSqlParser 的 Maven 依赖。

在你的 `pom.xml` 文件中加入以下代码：

```xml
<dependency>
    <groupId>com.github.jsqlparser</groupId>
    <artifactId>jsqlparser</artifactId>
    <version>4.2</version> 
    <!-- 版本号请根据最新版本进行调整 -->
</dependency>
```

### 解析 SQL 查询语句

使用 JSqlParser 解析 SQL 查询语句非常简单。下面是一个基本的示例：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.util.TablesNamesFinder;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT * FROM users WHERE age > 18";

        try {
            // 解析 SQL 查询语句
            Statement statement = CCJSqlParserUtil.parse(sqlQuery);

            // 判断是否是 SELECT 语句
            if (statement instanceof Select) {
                Select selectStatement = (Select) statement;

                // 获取查询中的表名
                TablesNamesFinder tablesNamesFinder = new TablesNamesFinder();
                System.out.println("Tables: " + tablesNamesFinder.getTableList(selectStatement));
            } else {
                System.out.println("Not a SELECT statement");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们解析了一个简单的 SELECT 查询语句，并使用 `TablesNamesFinder` 获取了查询中涉及的表名。

### 注意事项

- **异常处理**：在解析 SQL 语句时，可能会抛出异常，因此你需要适当地进行异常处理，以便在出现问题时能够捕获并处理异常。

- **支持的 SQL 语法**：JSqlParser 支持多种 SQL 语法，但是不同的数据库系统可能有一些特定的语法或者扩展，因此在使用时需要注意。通常，JSqlParser 能够处理大多数标准 SQL 语法。

- **进一步的处理**：一旦你将 SQL 查询语句解析成对象，你可以进一步操作这些对象，比如修改查询条件、重构查询等。JSqlParser 提供了丰富的 API，使你能够进行各种操作。

希望这个简单的入门示例能够帮助你开始使用 JSqlParser。

要了解更多详细的用法和 API，你可以查阅 JSqlParser 的官方文档或者浏览其源代码。

# Q4-如何获取 sql 中 where 对应的所有字段？

要获取SQL语句中`WHERE`子句对应的所有字段，你可以使用SQL解析工具（比如JSqlParser）来解析SQL语句，然后提取`WHERE`子句中的条件表达式，分析其中的字段。

以下是一个使用JSqlParser获取`WHERE`子句字段的示例：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import net.sf.jsqlparser.statement.select.SelectItem;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.schema.Column;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT id, name FROM users WHERE age > 18 AND city = 'New York'";

        try {
            // 解析 SQL 查询语句
            Select selectStatement = (Select) CCJSqlParserUtil.parse(sqlQuery);
            SelectBody selectBody = selectStatement.getSelectBody();

            // 判断是否是 SELECT 语句
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                // 获取 WHERE 子句中的条件表达式
                Expression whereExpression = plainSelect.getWhere();

                // 遍历条件表达式，提取字段
                if (whereExpression != null) {
                    whereExpression.accept(new SelectExpressionVisitor());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 自定义Visitor类，用于提取字段
    private static class SelectExpressionVisitor implements ExpressionVisitor {
        @Override
        public void visit(Column column) {
            // 提取字段名
            String fieldName = column.getColumnName();
            System.out.println("Field: " + fieldName);
        }

        @Override
        public void visit(AndExpression andExpression) {
            // 处理 AND 表达式，你可以在这里递归处理更复杂的逻辑
            andExpression.getLeftExpression().accept(this);
            andExpression.getRightExpression().accept(this);
        }

        // 其他Visit方法根据需要实现
    }
}
```

在这个示例中，`SelectExpressionVisitor`类实现了`ExpressionVisitor`接口，该接口定义了处理SQL表达式的方法。

我们在`visit(Column column)`方法中获取了字段名，并在`visit(AndExpression andExpression)`方法中处理了`AND`逻辑。

你可以根据SQL语句的复杂度进一步扩展`SelectExpressionVisitor`类中的方法，以处理更多种类的条件表达式。


# Q5-如何获取 group by 后面的字段

要获取SQL语句中`GROUP BY`后面的字段，你可以使用SQL解析工具（例如JSqlParser）来解析SQL语句，然后提取`GROUP BY`子句中的字段。

以下是一个使用JSqlParser获取`GROUP BY`字段的示例：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import net.sf.jsqlparser.statement.select.SelectItem;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.schema.Column;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT id, name FROM users WHERE age > 18 GROUP BY city, gender";

        try {
            // 解析 SQL 查询语句
            Select selectStatement = (Select) CCJSqlParserUtil.parse(sqlQuery);
            SelectBody selectBody = selectStatement.getSelectBody();

            // 判断是否是 SELECT 语句
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                // 获取 GROUP BY 子句中的字段
                List<Expression> groupByExpressions = plainSelect.getGroupByColumnReferences();
                for (Expression expression : groupByExpressions) {
                    // 判断 expression 是否是 Column
                    if (expression instanceof Column) {
                        Column column = (Column) expression;
                        // 获取字段名
                        String fieldName = column.getColumnName();
                        System.out.println("Group By Field: " + fieldName);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们使用`plainSelect.getGroupByColumnReferences()`方法获取`GROUP BY`子句中的表达式列表，然后遍历这个列表，如果表达式是`Column`类型，我们就可以获取字段名。

请注意，这个示例假设`GROUP BY`子句中的字段都是简单的列名，如果有更复杂的表达式，你需要相应地扩展处理逻辑。

# Q6-如果获取 order by 后面的字段

要获取SQL语句中`ORDER BY`后面的字段，你可以使用SQL解析工具（例如JSqlParser）来解析SQL语句，然后提取`ORDER BY`子句中的字段。

以下是一个使用JSqlParser获取`ORDER BY`字段的示例：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import net.sf.jsqlparser.statement.select.OrderByElement;
import net.sf.jsqlparser.schema.Column;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT id, name FROM users WHERE age > 18 ORDER BY name, age DESC";

        try {
            // 解析 SQL 查询语句
            Select selectStatement = (Select) CCJSqlParserUtil.parse(sqlQuery);
            SelectBody selectBody = selectStatement.getSelectBody();

            // 判断是否是 SELECT 语句
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                // 获取 ORDER BY 子句中的字段
                List<OrderByElement> orderByElements = plainSelect.getOrderByElements();
                for (OrderByElement orderByElement : orderByElements) {
                    // 判断 orderByElement 的 expression 是否是 Column
                    Expression expression = orderByElement.getExpression();
                    if (expression instanceof Column) {
                        Column column = (Column) expression;
                        // 获取字段名
                        String fieldName = column.getColumnName();
                        System.out.println("Order By Field: " + fieldName);

                        // 如果需要获取排序顺序，可以使用 orderByElement.isAsc() 方法
                        if (orderByElement.isAsc()) {
                            System.out.println("Order: ASC");
                        } else {
                            System.out.println("Order: DESC");
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们使用`plainSelect.getOrderByElements()`方法获取`ORDER BY`子句中的表达式列表，然后遍历这个列表，如果表达式是`Column`类型，我们就可以获取字段名。

同时，我们使用`orderByElement.isAsc()`方法判断字段的排序顺序，`isAsc()`返回`true`表示升序（ASC），`false`表示降序（DESC）。

请注意，这个示例假设`ORDER BY`子句中的字段都是简单的列名，如果有更复杂的表达式，你需要相应地扩展处理逻辑。

# Q7-如何判断 order by 后面的字段，属于哪一张表？

在SQL语句中，`ORDER BY`子句后面的字段可能属于查询的多个表中的任意一个。

要判断`ORDER BY`后面的字段属于哪张表，你可以在解析SQL语句时，考虑上下文和查询中的表别名（如果有的话）。

在使用SQL解析工具（例如JSqlParser）解析SQL语句时，你可以考虑以下几个方面来确定`ORDER BY`字段所属的表：

1. **查找表别名（Table Alias）**：
   如果在查询中使用了表别名，`ORDER BY`字段可能会使用这些别名。你可以在解析SQL语句时，获取查询的表别名，然后将`ORDER BY`字段与这些别名进行匹配。

2. **上下文信息**：
   在SQL语句中，`ORDER BY`通常出现在`SELECT`语句的最后。你可以检查`ORDER BY`字段在`SELECT`列表中的位置，并与`SELECT`语句中的表和字段进行匹配。

以下是一个示例，演示了如何使用JSqlParser获取`ORDER BY`后面的字段，包括表别名的情况：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.*;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id ORDER BY u.name, o.order_date DESC";

        try {
            // 解析 SQL 查询语句
            Select selectStatement = (Select) CCJSqlParserUtil.parse(sqlQuery);
            SelectBody selectBody = selectStatement.getSelectBody();

            // 判断是否是 SELECT 语句
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                // 获取 ORDER BY 子句中的字段
                List<OrderByElement> orderByElements = plainSelect.getOrderByElements();
                for (OrderByElement orderByElement : orderByElements) {
                    // 判断 orderByElement 的 expression 是否是 Column
                    Expression expression = orderByElement.getExpression();
                    if (expression instanceof Column) {
                        Column column = (Column) expression;
                        
                        // 获取表别名（如果有的话）
                        String tableName = null;
                        if (column.getTable() != null) {
                            tableName = column.getTable().getName();
                        }
                        
                        // 获取字段名
                        String fieldName = column.getColumnName();
                        
                        // 输出表名和字段名
                        System.out.println("Table Alias: " + tableName + ", Field: " + fieldName);

                        // 如果需要获取排序顺序，可以使用 orderByElement.isAsc() 方法
                        if (orderByElement.isAsc()) {
                            System.out.println("Order: ASC");
                        } else {
                            System.out.println("Order: DESC");
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们获取了`ORDER BY`字段的表别名（如果有的话），并输出了表别名和字段名。

请注意，当解析带有表别名的`ORDER BY`字段时，你需要检查`Column`对象中的`table`属性是否为`null`，以确定是否有表别名。

# Q8-如何根据表名称获取索引信息

要根据表名称获取索引信息，你可以使用数据库的元数据（metadata）查询相关信息。

不同的数据库系统提供了不同的元数据查询方法，以下是几种常见的数据库系统的示例：

### 1. **MySQL/MariaDB**

```java
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;

public class Main {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://localhost:3306/your_database_name";
        String username = "your_username";
        String password = "your_password";

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            DatabaseMetaData metaData = connection.getMetaData();

            // 获取表的索引信息
            String tableName = "your_table_name";
            ResultSet resultSet = metaData.getIndexInfo(null, null, tableName, false, false);
            while (resultSet.next()) {
                String indexName = resultSet.getString("INDEX_NAME");
                String columnName = resultSet.getString("COLUMN_NAME");
                int ordinalPosition = resultSet.getInt("ORDINAL_POSITION");
                
                System.out.println("Index Name: " + indexName);
                System.out.println("Column Name: " + columnName);
                System.out.println("Ordinal Position: " + ordinalPosition);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 2. **PostgreSQL**

```java
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;

public class Main {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:postgresql://localhost:5432/your_database_name";
        String username = "your_username";
        String password = "your_password";

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            DatabaseMetaData metaData = connection.getMetaData();

            // 获取表的索引信息
            String tableName = "your_table_name";
            ResultSet resultSet = metaData.getIndexInfo(null, null, tableName, false, false);
            while (resultSet.next()) {
                String indexName = resultSet.getString("index_name");
                String columnName = resultSet.getString("column_name");
                int ordinalPosition = resultSet.getInt("ordinal_position");
                
                System.out.println("Index Name: " + indexName);
                System.out.println("Column Name: " + columnName);
                System.out.println("Ordinal Position: " + ordinalPosition);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请注意，上述示例中的连接信息（`jdbcUrl`、`username`、`password`）需要根据你的数据库配置进行相应的修改。

另外，具体的数据库驱动程序（如MySQL的`mysql-connector-java`，PostgreSQL的`postgresql`等）也需要根据你的数据库类型引入相应的依赖。

这些示例代码可以作为基础，根据不同的数据库类型和需求进行相应的定制。

# Q9-如何计算字段索引的区分度？

## 基本思想

区分度计算方法为

通过“show table status like”获得表的总行数table_count。

通过计算选择表中已存在的区分度最高的索引best_index，同时Primary key > Unique key > 一般索引

通过计算获取数据采样的起始值offset与采样范围rand_rows：

offset = (table_count / 2) > 10W ? 10W : (table_count / 2)

rand_rows =(table_count / 2) > 1W ? 1W : (table_count / 2)

使用 `select count(1) from (select field from table force index(best_index) order by cl.. desc limit rand_rows) where field_print` 得到满足条件的rows。

cardinality = rows == 0 ? rand_rows : rand_rows / rows;

计算完成选择度后，会根据选择度大小，将该条件添加到该表中的备选索引中。

主要涉及的函数为：mysql_sql_parse_field_cardinality_new() 计算选择度

![mysql_sql_parse_field_cardinality_new](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/3.jpg)


## 计算方式

字段索引的区分度（selectivity）通常用于衡量索引的选择性，即索引中不同值的比例。

区分度越高，表示索引的选择性越好，也就是说，索引可以更好地过滤数据，提高查询效率。

你可以使用以下公式来计算字段索引的区分度：

```
Selectivity = 不同值的数量 / 总行数
```

在数据库中，你可以通过查询来获取字段的不同值数量（distinct values count）和表的总行数（total row count），然后使用上述公式计算区分度。

以下是一个通用的示例，演示如何使用Java和SQL查询计算字段索引的区分度：

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class Main {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://localhost:3306/your_database_name";
        String username = "your_username";
        String password = "your_password";

        String tableName = "your_table_name";
        String columnName = "your_column_name";

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            // 获取不同值的数量
            String distinctCountQuery = "SELECT COUNT(DISTINCT " + columnName + ") FROM " + tableName;
            PreparedStatement distinctCountStatement = connection.prepareStatement(distinctCountQuery);
            ResultSet distinctCountResult = distinctCountStatement.executeQuery();
            int distinctValuesCount = 0;
            if (distinctCountResult.next()) {
                distinctValuesCount = distinctCountResult.getInt(1);
            }

            // 获取总行数
            String rowCountQuery = "SELECT COUNT(*) FROM " + tableName;
            PreparedStatement rowCountStatement = connection.prepareStatement(rowCountQuery);
            ResultSet rowCountResult = rowCountStatement.executeQuery();
            int totalRowCount = 0;
            if (rowCountResult.next()) {
                totalRowCount = rowCountResult.getInt(1);
            }

            // 计算区分度
            double selectivity = (double) distinctValuesCount / totalRowCount;
            System.out.println("Selectivity of column " + columnName + ": " + selectivity);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请确保替换示例中的数据库连接信息（`jdbcUrl`、`username`、`password`）以及表名（`tableName`）和字段名（`columnName`）为你实际使用的数据库信息。

这个示例演示了如何使用SQL查询获取不同值的数量和总行数，然后计算字段索引的区分度。

# Q10-如何获取where解析、join解析对应的字段

要获取`WHERE`条件和`JOIN`语句中涉及的字段，你可以使用SQL解析工具（例如JSqlParser）来解析SQL语句，并在解析树中找到相关的信息。

以下是一个示例，演示如何使用JSqlParser获取`WHERE`条件和`JOIN`语句中的字段：

```java
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import net.sf.jsqlparser.statement.select.SelectItem;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.schema.Column;

public class Main {
    public static void main(String[] args) {
        String sqlQuery = "SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE u.age > 18 AND o.order_date > '2022-01-01'";

        try {
            // 解析 SQL 查询语句
            Select selectStatement = (Select) CCJSqlParserUtil.parse(sqlQuery);
            SelectBody selectBody = selectStatement.getSelectBody();

            // 判断是否是 SELECT 语句
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                // 获取 WHERE 子句中的字段
                Expression whereExpression = plainSelect.getWhere();
                System.out.println("WHERE Fields:");
                extractFieldsFromExpression(whereExpression);

                // 获取 JOIN 语句中的字段
                if (plainSelect.getJoins() != null) {
                    System.out.println("JOIN Fields:");
                    for (Join join : plainSelect.getJoins()) {
                        Expression onExpression = join.getOnExpression();
                        extractFieldsFromExpression(onExpression);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 递归遍历表达式，提取字段
    private static void extractFieldsFromExpression(Expression expression) {
        if (expression instanceof Column) {
            Column column = (Column) expression;
            // 获取字段名
            String fieldName = column.getColumnName();
            System.out.println(fieldName);
        } else if (expression instanceof AndExpression) {
            // 处理 AND 表达式，你可以在这里递归处理更复杂的逻辑
            AndExpression andExpression = (AndExpression) expression;
            extractFieldsFromExpression(andExpression.getLeftExpression());
            extractFieldsFromExpression(andExpression.getRightExpression());
        } else if (expression instanceof EqualsTo) {
            // 处理等式表达式，你可以在这里进一步处理等式左右两边的逻辑
            EqualsTo equalsTo = (EqualsTo) expression;
            extractFieldsFromExpression(equalsTo.getLeftExpression());
            extractFieldsFromExpression(equalsTo.getRightExpression());
        }
        // 其他类型的表达式可以根据需要进行扩展
    }
}
```

在这个示例中，`extractFieldsFromExpression`方法递归遍历表达式，提取字段信息。

`WHERE`条件和`JOIN`语句中的字段会在遍历过程中被打印出来。

请注意，这个示例处理了比较简单的`AND`和等式表达式，你可以根据需要扩展处理更复杂的逻辑。

# 参考资料

chat

* any list
{:toc}