---
layout: post
title: logstash 日志加工处理-14-jdbc 数据库访问
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# Q: 介绍一下 logstash input/output 中的 jdbc

Logstash 中的 JDBC 插件允许你与关系型数据库建立连接，从中读取数据（Input）或将数据写入数据库（Output）。

这对于处理与数据库相关的日志、事件或其他数据非常有用。以下是 JDBC 插件的主要用途和一些配置示例：

### Logstash JDBC Input 插件：

JDBC Input 插件允许 Logstash 从数据库中读取数据。

#### 主要配置选项：

- **jdbc_connection_string:** 指定数据库的连接字符串。

- **jdbc_user:** 数据库的用户名。

- **jdbc_password:** 数据库的密码。

- **jdbc_driver_library:** 指定 JDBC 驱动程序的 JAR 文件路径。

- **jdbc_driver_class:** 指定 JDBC 驱动程序的类名。

- **statement:** 定义从数据库中检索数据的 SQL 查询语句。

- **schedule:** 设置定时运行查询的时间表。

#### 示例配置：

```ruby
input {
  jdbc {
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydatabase"
    jdbc_user => "myuser"
    jdbc_password => "mypassword"
    jdbc_driver_library => "/path/to/mysql-connector-java.jar"
    jdbc_driver_class => "com.mysql.cj.jdbc.Driver"
    statement => "SELECT * FROM mytable"
    schedule => "*/5 * * * *"
  }
}
```

### Logstash JDBC Output 插件：

JDBC Output 插件允许 Logstash 将事件数据写入数据库。

#### 主要配置选项：

- **jdbc_connection_string:** 指定数据库的连接字符串。

- **jdbc_user:** 数据库的用户名。

- **jdbc_password:** 数据库的密码。

- **jdbc_driver_library:** 指定 JDBC 驱动程序的 JAR 文件路径。

- **jdbc_driver_class:** 指定 JDBC 驱动程序的类名。

- **statement:** 定义将数据插入数据库的 SQL 语句。

- **flush_size:** 指定刷新到数据库的事件数。

#### 示例配置：

```ruby
output {
  jdbc {
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydatabase"
    jdbc_user => "myuser"
    jdbc_password => "mypassword"
    jdbc_driver_library => "/path/to/mysql-connector-java.jar"
    jdbc_driver_class => "com.mysql.cj.jdbc.Driver"
    statement => "INSERT INTO mytable (column1, column2) VALUES (?, ?)"
    flush_size => 1000
  }
}
```

### 注意事项：

- **性能：** 当使用 JDBC 插件时，性能可能是一个关键考虑因素。要确保适当的索引、合适的批量大小和合理的定时策略，以避免对数据库的不必要的负载。

- **数据库连接池：** 在生产环境中，考虑使用数据库连接池以提高性能。

- **数据类型映射：** 注意 Logstash 与数据库之间的数据类型映射，以防止潜在的数据转换问题。

- **安全性：** 尽量避免在配置文件中硬编码敏感信息，如数据库密码。可以使用 Logstash 的安全配置机制来安全地处理这些信息。


# Q: 对于 jdbc 的数据，input 收到的 message 是什么样的？比如一个表 User，两个字段 id 和 name.

对于 JDBC Input 插件，它从数据库中检索数据并将其转换为 Logstash 事件。每个事件都包含一个字段，通常名为 "message"，其中包含从数据库中检索到的整个行的文本表示。

如果你的数据库表是 User，包含两个字段 id 和 name，那么 JDBC Input 插件默认的 "message" 字段将包含类似于以下格式的文本：

```
{"id":1,"name":"John Doe"}
```

这是一个 JSON 格式的文本，其中包含数据库表的每一行的字段及其对应的值。这样的文本是由 Logstash 将数据库中的行数据序列化为 JSON 格式的字符串而得到的。

你可以在 Logstash 的配置中使用 JSON Filter 插件来解析这个字符串，将其转换为更易于处理的字段。例如，以下是一个简单的 Logstash 配置，通过 JSON Filter 插件解析 "message" 字段：

```ruby
input {
  jdbc {
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydatabase"
    jdbc_user => "myuser"
    jdbc_password => "mypassword"
    jdbc_driver_library => "/path/to/mysql-connector-java.jar"
    jdbc_driver_class => "com.mysql.cj.jdbc.Driver"
    statement => "SELECT * FROM User"
  }
}

filter {
  json {
    source => "message"
    target => "user_data"
  }
}

output {
  stdout { codec => rubydebug }
}
```

在这个例子中，JSON Filter 插件将 "message" 字段解析为一个名为 "user_data" 的字段，其中包含了数据库行的字段。

这样，你可以在后续处理步骤中直接访问这些字段，而无需手动解析 JSON。

# Q2: java 如何加载不同的 jdbc jar，并且实现基本的数据库访问？

在Java中加载不同的JDBC（Java Database Connectivity）JAR文件并实现基本的数据库访问通常涉及以下几个步骤：

1. **加载JDBC驱动程序：** 不同的数据库供应商提供不同的JDBC驱动程序。你需要根据你使用的数据库选择合适的JDBC驱动，并将其JAR文件包含在你的项目中。

然后，使用`Class.forName()`方法加载驱动程序。

例如，对于MySQL数据库，加载驱动的代码可能如下所示：

    ```java
    Class.forName("com.mysql.cj.jdbc.Driver");
    ```

2. **建立数据库连接：** 使用`DriverManager.getConnection()`方法建立与数据库的连接。传递的参数包括数据库的URL、用户名和密码。

    ```java
    String url = "jdbc:mysql://localhost:3306/your_database";
    String user = "your_username";
    String password = "your_password";
    
    Connection connection = DriverManager.getConnection(url, user, password);
    ```

3. **执行SQL查询：** 一旦建立了连接，你可以使用`Statement`或`PreparedStatement`对象执行SQL查询。以下是一个简单的例子：

    ```java
    Statement statement = connection.createStatement();
    ResultSet resultSet = statement.executeQuery("SELECT * FROM your_table");

    while (resultSet.next()) {
        // 处理结果集
        String column1 = resultSet.getString("column1");
        int column2 = resultSet.getInt("column2");
        // 其他操作...
    }

    resultSet.close();
    statement.close();
    ```

4. **关闭连接：** 在使用完数据库连接后，需要关闭连接以释放资源。

    ```java
    connection.close();
    ```

为了加载不同的JDBC驱动，你可以在运行时根据需要选择加载的驱动类。例如，你可以根据配置文件或命令行参数的值来动态选择要加载的JDBC驱动类。

以下是一个简单的例子，演示如何加载不同的JDBC驱动和执行查询：

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseAccessExample {

    public static void main(String[] args) {
        try {
            // 根据需要加载不同的JDBC驱动
            String driverClassName = "com.mysql.cj.jdbc.Driver"; // MySQL驱动
            Class.forName(driverClassName);

            // 建立数据库连接
            String url = "jdbc:mysql://localhost:3306/your_database";
            String user = "your_username";
            String password = "your_password";
            Connection connection = DriverManager.getConnection(url, user, password);

            // 执行查询
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM your_table");

            // 处理结果集
            while (resultSet.next()) {
                String column1 = resultSet.getString("column1");
                int column2 = resultSet.getInt("column2");
                System.out.println("Column1: " + column1 + ", Column2: " + column2);
                // 其他操作...
            }

            // 关闭资源
            resultSet.close();
            statement.close();
            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请注意，上述代码中的异常处理非常简化，实际上，在真实的应用程序中，你可能需要更详细和健壮的错误处理。

# Q: statement => "INSERT INTO mytable (column1, column2) VALUES (?, ?)"  这种写法，数据的入参怎么确定的呢？

在 Logstash 的 JDBC Output 插件中，`statement` 用于指定插入数据的 SQL 语句。在这种语句中，插入参数通常使用问号 `?` 占位符，这样可以通过 Logstash 配置中的 `bind_vars` 选项提供实际的参数值。

以下是一个简单的示例，演示了如何通过 `bind_vars` 提供参数值：

```ruby
output {
  jdbc {
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydatabase"
    jdbc_user => "myuser"
    jdbc_password => "mypassword"
    jdbc_driver_library => "/path/to/mysql-connector-java.jar"
    jdbc_driver_class => "com.mysql.cj.jdbc.Driver"
    statement => "INSERT INTO mytable (column1, column2) VALUES (?, ?)"
    bind_vars => ["field1", "field2"]
  }
}
```

在这个例子中，`bind_vars` 是一个数组，包含了要插入的实际字段值。Logstash 将在执行 SQL 语句时使用这些值替换问号占位符。请确保 `bind_vars` 的顺序与 SQL 语句中占位符的顺序匹配。

需要注意的是，`bind_vars` 的值可以是字段引用，例如 `"%{[fieldname]}"`，这样它将使用事件中的实际字段值。这对于动态地从事件中提取数据并插入数据库非常有用。例如：

```ruby
output {
  jdbc {
    # 其他配置...
    statement => "INSERT INTO mytable (column1, column2) VALUES (?, ?)"
    bind_vars => ["%{[field1]}", "%{[field2]}"]
  }
}
```

这里，`%{[field1]}` 和 `%{[field2]}` 将从 Logstash 事件中提取 `field1` 和 `field2` 字段的值用于插入数据库。

# Q3: 如果我把 mysql-connect-java 的 jar 包放在指定的 path 下面，不是直接在 java 项目中。java 项目要如何引用到这个 jar 包？

如果你将MySQL Connector/J的JAR文件放在指定的路径下，而不是直接在Java项目中引用，你有几种方法可以使Java项目能够访问到这个JAR包：

### 1. 使用 `-classpath` 参数运行 Java 程序

在运行Java程序时，可以使用`-classpath`（或简写为`-cp`）参数指定类路径，包括MySQL Connector/J的JAR文件所在的路径。例如：

```bash
java -cp /path/to/mysql-connector-java.jar:/path/to/your/project YourMainClass
```

其中，`/path/to/mysql-connector-java.jar`是MySQL Connector/J的JAR文件路径，`/path/to/your/project`是你的项目路径，`YourMainClass`是包含`main`方法的主类。

### 2. 在 MANIFEST.MF 中指定 Class-Path

如果你正在构建可执行的JAR文件，可以在JAR文件的`MANIFEST.MF`文件中指定Class-Path。在`MANIFEST.MF`文件中添加一行类似于以下内容：

```plaintext
Class-Path: /path/to/mysql-connector-java.jar
```

这将使Java运行时在指定的路径中查找所需的类。

### 3. 将 JAR 文件复制到项目的 lib 目录

你可以创建一个`lib`目录，并将MySQL Connector/J的JAR文件放在其中。然后，将`lib`目录添加到Java项目的类路径中。在大多数IDE中，你可以通过项目设置或构建路径设置来完成这一步。

### 4. 使用构建工具（如 Maven 或 Gradle）

如果你使用构建工具管理项目，比如Maven或Gradle，推荐使用它们来管理依赖项。在项目的构建文件中，添加MySQL Connector/J的依赖项，并让构建工具自动下载和管理JAR文件。这样可以简化项目配置和依赖项管理。

#### Maven 示例：

在Maven的`pom.xml`文件中，添加如下依赖项：

```xml
<dependencies>
    <!-- Other dependencies -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.23</version> <!-- 版本号根据你的实际情况调整 -->
    </dependency>
</dependencies>
```

Maven将自动下载并管理所需的JAR文件。

#### Gradle 示例：

在Gradle的`build.gradle`文件中，添加如下依赖项：

```groovy
dependencies {
    // Other dependencies
    implementation 'mysql:mysql-connector-java:8.0.23' // 版本号根据你的实际情况调整
}
```

Gradle将自动下载并管理所需的JAR文件。

使用构建工具管理依赖项是一种良好的实践，因为它们可以简化项目配置、版本管理和构建过程。





# 参考资料

chat

* any list
{:toc}