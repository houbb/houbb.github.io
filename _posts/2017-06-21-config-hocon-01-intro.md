---
layout: post
title: config HOCON（Human-Optimized Config Object Notation）配置文件 人类优化配置对象标记
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [config, overview]
published: true
---


# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# chat

## hocon 配置文件是什么？

HOCON（Human-Optimized Config Object Notation）是一种配置文件格式，它旨在提供一种人类可读和可编辑的配置数据表达方式。

HOCON是Typesafe（Lightbend）公司开发的，现在由Lightbend Config Library支持。它被设计为易于人类阅读和编写，同时也易于机器解析和生成。

### HOCON配置文件的特点：

- **简洁性**：HOCON的语法简洁，避免了不必要的复杂性，使得配置文件更加清晰。
- **JSON兼容**：HOCON与JSON兼容，这意味着任何有效的JSON文件也是有效的HOCON文件。
- **注释支持**：HOCON支持单行和多行注释，使得配置文件的可读性和可维护性得到提升。
- **包含机制**：HOCON允许包含其他配置文件，这有助于重用配置片段，提高配置的可维护性。
- **替换机制**：HOCON支持变量替换，允许在配置文件中定义变量并在其他地方引用它们。
- **数据合并**：HOCON允许合并来自不同源的配置数据，这在处理不同环境的配置时非常有用。
- **路径表达式**：HOCON支持路径表达式，可以方便地引用和操作配置文件中的特定部分。
- **类型安全**：HOCON提供了基本的类型安全，包括整数、浮点数、布尔值和字符串。

### HOCON配置文件的语法元素：

- **对象**：由大括号`{}`包围，包含键值对。
- **数组**：由方括号`[]`包围，包含一系列值。
- **键值对**：由键和值组成，键和值之间用冒号`:`分隔。
- **注释**：以`#`开始的单行注释，或以`/*`开始以`*/`结束的多行注释。

### HOCON配置文件示例：

```hocon
# 这是一个注释

# 定义变量
db {
  user = "admin"
  password = "secret"
}

# 使用变量
server {
  url = "http://${db.user}:${db.password}@example.com"
}

# 包含其他配置文件
include "other.conf"

# 数组示例
hosts = ["192.168.1.1", "192.168.1.2"]

# 嵌套结构
app {
  name = "MyApp"
  settings {
    debug = true
    port = 8080
  }
}
```

### 使用场景：

HOCON通常用于配置服务和应用程序，特别是在以下场景中：

- **微服务架构**：在微服务架构中，HOCON可以用于服务的配置管理。
- **分布式系统**：在分布式系统中，HOCON可以用于不同节点的配置同步。
- **开发和生产环境**：HOCON支持环境特定的配置，方便在不同环境之间切换。

### 工具和库支持：

HOCON被多种编程语言的库支持，包括但不限于：

- **Java**：通过Lightbend Config Library。
- **Scala**：同样通过Lightbend Config Library。
- **.NET**：通过HOCON for .NET。
- **Node.js**：通过node-config库。

这些库提供了解析和操作HOCON配置文件的功能，使得在不同编程环境中使用HOCON变得容易。

总的来说，HOCON是一种灵活、强大且易于使用的配置文件格式，特别适合需要高度可配置性和可维护性的现代应用程序。

## hocon 配置文件是如何使用的？给出常见的例子

HOCON（Human-Optimized Config Object Notation）配置文件的使用非常灵活，它支持多种特性，如变量替换、文件包含、注释等。以下是一些常见的HOCON配置文件使用示例：

### 基本语法

HOCON文件由键值对组成，键和值之间用冒号分隔，对象用大括号`{}`包围。

```hocon
key: value
```

### 对象和嵌套

可以创建嵌套的对象来组织配置。

```hocon
database {
  host: "localhost"
  port: 5432
  user: "dbuser"
  password: "dbpassword"
}
```

### 数组

HOCON支持数组，数组中的元素用逗号分隔。

```hocon
servers: ["server1.example.com", "server2.example.com"]
```

### 变量替换

可以在配置文件中定义变量，并在其他部分引用这些变量。

```hocon
{
  dbHost: "localhost"
  db {
    host: ${dbHost}
    port: 5432
  }
}
```

### 包含其他文件

HOCON允许包含其他配置文件，这有助于重用配置片段。

```hocon
include "db.conf" // 包含名为db.conf的文件
```

### 路径表达式

可以使用路径表达式来引用配置值。

```hocon
{
  db: ${database}
  database: "prod-db"
}
```

### 默认值

可以为配置项设置默认值。

```hocon
{
  timeout: ${?TIMEOUT:30s}
}
```

在上面的例子中，如果环境变量`TIMEOUT`没有被设置，`timeout`将默认为`30s`。

### 条件包含

HOCON支持根据条件包含配置。

```hocon
{
  profiles: ["dev", "prod"]
  ${profiles} {
    dev {
      db {
        connection-timeout: 5s
      }
    }
    prod {
      db {
        connection-timeout: 10s
      }
    }
  }
}
```

### 复杂数据类型

HOCON支持更复杂的数据类型，如列表和嵌套对象。

```hocon
features {
  enabled: ["feature1", "feature2"]
  disabled: ["feature3"]
}
```

### 导入系统环境变量

HOCON可以导入系统环境变量。

```hocon
{
  import sys.env.HOME as homeDirectory
}
```

### 使用示例

假设有一个应用程序需要连接到数据库，并且根据运行环境的不同（开发、测试、生产）使用不同的配置。HOCON配置文件可以这样组织：

```hocon
{
  application {
    name: "MyApp"
    environment: dev // 默认环境，也可以通过系统属性或环境变量覆盖
  }
  db {
    host: "localhost"
    port: 5432
    user: "user"
    password: "pass"
  }
}

include "${application.environment}.conf" // 根据环境变量包含不同的配置文件
```

对应的`dev.conf`可能包含开发环境特有的配置：

```hocon
{
  db {
    user: "devuser"
    password: "devpass"
  }
  application {
    port: 8080
  }
}
```

## java 如何解析 hocon 配置？

在Java中解析和处理HOCON配置文件，通常可以通过以下几种方式实现：

### 使用Lightbend Config库

Lightbend Config（之前称为Typesafe Config）是一个强大且灵活的库，用于处理HOCON配置文件。以下是使用Lightbend Config库的基本步骤：

1. **添加依赖**：在你的项目中添加Lightbend Config库的依赖。如果你使用Maven，可以在`pom.xml`文件中添加如下依赖项：

   ```xml
   <dependency>
     <groupId>com.typesafe</groupId>
     <artifactId>config</artifactId>
     <version>1.4.1</version> <!-- 请使用最新版本 -->
   </dependency>
   ```

2. **读取配置文件**：使用`ConfigFactory`来加载配置文件，并使用`Config`对象来访问配置值。

   ```java
   import com.typesafe.config.Config;
   import com.typesafe.config.ConfigFactory;

   public class HoconConfigExample {
       public static void main(String[] args) {
           // 加载默认的HOCON配置文件（通常是application.conf）
           Config config = ConfigFactory.load();
           
           // 读取配置项
           String dbUser = config.getString("productDatabase.user");
           String dbPassword = config.getString("productDatabase.password");
           // ... 其他配置项
       }
   }
   ```

### 使用Jackson库结合HOCON模块

除了Lightbend Config库，还可以使用Jackson库结合HOCON模块来解析HOCON文件：

1. **添加依赖**：在项目中添加Jackson核心库和HOCON模块的依赖。

   ```xml
   <dependency>
     <groupId>com.fasterxml.jackson.core</groupId>
     <artifactId>jackson-databind</artifactId>
     <version>2.13.0</version> <!-- 使用最新版本 -->
   </dependency>
   <dependency>
     <groupId>com.fasterxml.jackson.dataformat</groupId>
     <artifactId>jackson-dataformat-hocon</artifactId>
     <version>2.13.0</version> <!-- 使用最新版本 -->
   </dependency>
   ```

2. **解析HOCON文件**：使用`ObjectMapper`结合`HoconFactory`来读取和解析HOCON文件。

   ```java
   import com.fasterxml.jackson.databind.ObjectMapper;
   import com.fasterxml.jackson.dataformat.hocon.HoconFactory;
   import com.typesafe.config.Config;
   import java.io.File;
   import java.io.IOException;

   public class HoconParserExample {
       public static void main(String[] args) {
           try {
               ObjectMapper mapper = new ObjectMapper(new HoconFactory());
               Config config = mapper.readValue(new File("application.hcl"), Config.class);
               
               // 读取配置项
               String value = config.getString("key");
               // ... 其他配置项
           } catch (IOException e) {
               e.printStackTrace();
           }
       }
   }
   ```

### 使用Hutool库

Hutool是一个小型工具类库，也提供了对HOCON格式的支持：

1. **添加依赖**：在项目中添加Hutool库的依赖。

   ```xml
   <dependency>
     <groupId>cn.hutool</groupId>
     <artifactId>hutool-setting</artifactId>
     <version>5.7.16</version> <!-- 使用最新版本 -->
   </dependency>
   ```

2. **读取配置文件**：使用`HoconSetting`来加载和读取HOCON配置文件。

   ```java
   import cn.hutool.setting.dialect.HoconSetting;

   public class HutoolHoconExample {
       public static void main(String[] args) {
           // 创建HoconSetting对象并加载配置文件
           HoconSetting setting = new HoconSetting("config.hcl");
           
           // 读取配置项
           String value = setting.getByGroup("group").getStr("key");
           // ... 其他配置项
       }
   }
   ```

以上是几种在Java中解析和处理HOCON配置文件的方法。

开发者可以根据项目需求和个人偏好选择合适的库来实现配置文件的读取和管理。

## hocon 为何如此设计？有何优缺点？

HOCON（Human-Optimized Config Object Notation）配置文件格式的设计初衷是为了提供一个易于人类读写的配置数据格式。

它被设计为一种面向对象风格的配置语言，旨在改善传统配置文件格式（如.properties文件）的一些限制。

以下是HOCON设计的一些原因和它的优缺点：

### 设计原因：
- **易读性**：HOCON被设计为易于阅读和编写，采用直观的语法，使得配置文件更加清晰易懂。
- **面向对象风格**：HOCON支持面向对象的配置结构，可以定义嵌套对象和数组，使得配置更加结构化。
- **兼容性**：HOCON与JSON兼容，这意味着任何有效的JSON文件也是有效的HOCON文件，这增加了它的通用性和灵活性。
- **包含和替换**：HOCON支持包含其他配置文件和替换配置值，这有助于重用配置片段，提高配置的可维护性。
- **环境适应性**：HOCON可以轻松地适应不同环境的配置需求，通过简单的语法来覆盖特定环境的配置项。
- **错误友好**：HOCON设计了更友好的错误消息，帮助开发者快速定位配置错误。

### 优点：
- **简洁性**：HOCON的语法简洁，避免了不必要的复杂性，使得配置文件更加清晰。
- **表达能力强**：支持复杂的数据结构，如列表、字典、嵌套结构等，能够满足各种类型的配置需求。
- **易于维护**：通过模块化和引用机制，HOCON支持配置的重用和组合，简化了配置管理。
- **灵活的格式**：支持注释、条件包含等，使得配置文件更加灵活和可配置。
- **与工具集成**：HOCON被设计为与特定的工具和框架（如Lightbend Config和Akka）集成，提高了这些工具的可用性。

### 缺点：
- **社区和生态系统**：相比于更通用的配置文件格式如JSON或YAML，HOCON的社区和生态系统较小。
- **学习和迁移成本**：对于已经习惯于其他配置文件格式的用户，学习和迁移到HOCON可能需要额外的时间和成本。
- **解析和处理**：在某些编程环境中，可能缺乏直接支持HOCON的库，需要额外的工作来解析和处理HOCON文件。
- **复杂性**：虽然HOCON旨在提高易读性，但其面向对象的风格和高级功能可能会增加配置文件的复杂性，特别是对于简单的用例。

# 小结

总的来说，HOCON的设计是为了提供一个更人性化、更灵活且功能丰富的配置文件格式，它特别适合需要高度可配置性和可维护性的现代应用程序。

个人比较喜欢这个配置文件，接触到的 apache seatunnel 就是使用的这个配置方式，非常的灵活。

## Q: apache seatunnel 的 conf 文件，使用什么工具包解析处理的？

Apache SeaTunnel 的配置文件使用 HOCON（Human-Optimized Config Object Notation）格式。HOCON 是一种用户友好的配置格式，支持 JSON 的所有特性，并且更加简洁和可读。HOCON 格式的解析是通过 `Typesafe Config` 库实现的。

具体来说，SeaTunnel 使用 `Typesafe Config` 库来解析和处理 HOCON 配置文件。`Typesafe Config` 是一个广泛使用的库，提供了强大的配置解析功能，支持包括 HOCON、JSON、和 Java Properties 等格式。

以下是关于 `Typesafe Config` 库的一些信息：

- **库名称**: `com.typesafe:config`
- **主要特性**:
  - 支持 HOCON、JSON、Java Properties 等多种格式
  - 支持嵌套配置和引用其他配置
  - 提供类型安全的配置访问方式

### 示例代码
以下是使用 `Typesafe Config` 库解析 HOCON 配置文件的一个简单示例：

```java
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class ConfigExample {
    public static void main(String[] args) {
        // 加载默认的 application.conf 文件
        Config config = ConfigFactory.load();

        // 读取配置项
        String baseUrl = config.getString("source.MySQL-CDC.base-url");
        String username = config.getString("source.MySQL-CDC.username");

        System.out.println("Base URL: " + baseUrl);
        System.out.println("Username: " + username);
    }
}
```

在 SeaTunnel 中，这个库用于解析配置文件并将其转化为内部的配置对象，供后续的任务执行过程使用。

### 在 SeaTunnel 中的使用
SeaTunnel 通过以下方式使用 `Typesafe Config` 库：

1. **加载配置文件**:
   SeaTunnel 会加载指定路径的 HOCON 配置文件，通常是 `application.conf` 或用户自定义的配置文件。

2. **解析配置**:
   使用 `ConfigFactory` 类解析配置文件，并生成 `Config` 对象。

3. **访问配置项**:
   通过 `Config` 对象的各种方法（如 `getString`, `getInt`, `getList` 等）访问具体的配置项。

### 依赖项
在使用 SeaTunnel 时，如果需要在自定义代码中解析配置文件，可以在项目的 `pom.xml` 文件中添加 `Typesafe Config` 的 Maven 依赖：

```xml
<dependency>
    <groupId>com.typesafe</groupId>
    <artifactId>config</artifactId>
    <version>1.4.1</version>
</dependency>
```

通过这种方式，您可以使用 `Typesafe Config` 库来解析和处理 SeaTunnel 的 HOCON 配置文件。

## 为什么选择 HOCON? 有哪些优缺点

选择 HOCON（Human-Optimized Config Object Notation）作为配置文件格式有多个原因，主要涉及其优点。

以下是 HOCON 的优缺点：

### 优点

1. **可读性和可写性**：
   - HOCON 语法设计简洁明了，非常适合人类书写和阅读。它支持 JSON 的所有特性，同时通过减少冗余和提供更简洁的语法提高了可读性。

2. **灵活性**：
   - HOCON 允许使用不带引号的键和值，可以省略逗号等标点符号，这使得配置文件更加简洁。
   - 它支持注释，便于在配置文件中添加说明和文档。

3. **兼容性**：
   - HOCON 是 JSON 的超集，意味着所有合法的 JSON 文件都是合法的 HOCON 文件。这提供了向后兼容性。

4. **支持嵌套和引用**：
   - HOCON 支持嵌套结构和跨配置项引用，使得配置文件可以更模块化和可重用。
   - 可以通过引用其他配置项来避免重复定义。

5. **类型安全**：
   - `Typesafe Config` 库提供类型安全的配置访问方式，减少了类型转换错误的风险。

6. **环境变量和系统属性替换**：
   - HOCON 支持从环境变量和系统属性中读取配置值，可以方便地在不同环境中使用相同的配置文件。

### 缺点

1. **学习曲线**：
   - 虽然 HOCON 比 JSON 更简洁，但对于不熟悉这种格式的开发人员来说，可能需要一定的学习时间。
   
2. **工具支持有限**：
   - 虽然 HOCON 被一些项目和库广泛使用，但它不像 JSON 那样有广泛的工具和编辑器支持。例如，一些 IDE 可能缺乏对 HOCON 的原生支持。

3. **性能开销**：
   - 虽然性能通常不是一个主要问题，但 HOCON 的解析器相对复杂，在某些高性能场景中可能会有一定的开销。

4. **标准化问题**：
   - HOCON 是由 Typesafe（现为 Lightbend）定义的格式，并不是一个正式的国际标准。这可能会影响一些项目的采用和长期维护。

### 选择 HOCON 的原因

Apache SeaTunnel 选择 HOCON 主要是基于以下考虑：

1. **可读性和简洁性**：
   - 配置文件通常需要由人类维护，HOCON 的简洁语法使得配置更容易编写和维护。

2. **功能丰富**：
   - HOCON 提供了丰富的功能，如注释、嵌套、引用和类型安全访问，使得配置文件更灵活和强大。

3. **兼容性和灵活性**：
   - HOCON 兼容 JSON，允许在需要时直接使用 JSON 格式，同时提供了比 JSON 更简洁的语法和更多的特性。

4. **与 Typesafe Config 的集成**：
   - `Typesafe Config` 库是一个成熟且功能强大的配置库，广泛用于许多基于 JVM 的项目中，选择 HOCON 使得 SeaTunnel 能够利用这个库的所有功能。

### 总结

HOCON 是一种功能强大且用户友好的配置格式，尽管存在一些缺点，但其优点尤其在可读性、灵活性和功能丰富性方面使其成为许多项目的理想选择。

Apache SeaTunnel 选择 HOCON，主要是为了提供更简洁、易读且功能丰富的配置方式，同时利用 `Typesafe Config` 库的强大功能。

## 给出 HOCON 的官方学习资料

以下是 HOCON（Human-Optimized Config Object Notation）的官方学习资料和一些有用的资源，可以帮助您更好地理解和使用 HOCON：

### 官方资料

1. **HOCON 规范**：
   - 官方规范详细描述了 HOCON 的语法和功能，可以作为深入了解 HOCON 的参考。
   - [HOCON 规范](https://github.com/lightbend/config/blob/main/HOCON.md)

2. **Lightbend Config GitHub 仓库**：
   - HOCON 是由 Lightbend 开发和维护的，相关文档和示例代码可以在其 GitHub 仓库中找到。
   - [Lightbend Config GitHub 仓库](https://github.com/lightbend/config)

3. **Typesafe Config 文档**：
   - Typesafe Config 是 HOCON 的实现库，官方文档提供了如何在项目中使用 HOCON 的详细说明。
   - [Typesafe Config 文档](https://lightbend.github.io/config/)

### 学习资源

1. **Typesafe Config 入门指南**：
   - 提供了一个快速入门指南，帮助新手了解如何使用 HOCON 进行配置。
   - [Typesafe Config 入门指南](https://lightbend.github.io/config/latest/api/index.html)

2. **Play Framework 文档**：
   - Play Framework 使用 HOCON 作为其默认配置格式，Play 的文档中包含了如何使用 HOCON 配置 Play 应用程序的详细说明。
   - [Play Framework 文档](https://www.playframework.com/documentation/latest/ConfigFile)

3. **Akka 文档**：
   - Akka 也是一个使用 HOCON 进行配置的框架，Akka 文档中提供了如何使用 HOCON 配置 Akka 系统的示例。
   - [Akka 文档](https://doc.akka.io/docs/akka/current/general/configuration.html)

### 教程和示例

1. **HOCON 简介和示例**：
   - DigitalOcean 提供的 HOCON 入门教程，包含基本语法和使用示例。
   - [DigitalOcean HOCON 教程](https://www.digitalocean.com/community/tutorials/how-to-use-hocon-configuration-files-for-your-application)

2. **Typesafe Config 和 HOCON 示例**：
   - Scala Exercises 提供了一个关于 Typesafe Config 和 HOCON 的交互式教程，帮助您通过示例学习。
   - [Scala Exercises HOCON 教程](https://www.scala-exercises.org/scala_play_json/config)

### 社区资源

1. **Stack Overflow**：
   - 可以在 Stack Overflow 上搜索有关 HOCON 的问题和答案，获取社区的帮助。
   - [Stack Overflow HOCON 标签](https://stackoverflow.com/questions/tagged/hocon)

2. **GitHub 代码搜索**：
   - 在 GitHub 上搜索开源项目中的 HOCON 配置文件，学习其他项目如何使用 HOCON 进行配置。
   - [GitHub HOCON 搜索](https://github.com/search?q=HOCON+config)

通过以上官方资料和学习资源，您可以更全面地了解 HOCON，并在项目中有效地使用它。

* any list
{:toc}
