---
layout: post
title: config cfg 配置文件介绍
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [config, overview]
published: true
---


# 拓展阅读

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yam-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# 组件

XML

json

yaml

properties

ini

csv

TOML

hcl

CFG

INI

converter

# chat

## Q: 详细介绍一下 cfg 配置文件方式

CFG（Configuration File）文件是一种常见的配置文件格式，通常用于存储程序或系统的配置信息。

CFG 文件的结构相对简单，通常由键值对组成，用于表示各种配置项及其对应的值。

下面是对 CFG 配置文件方式的详细介绍：

### 结构和语法：

1. **键值对**：
   CFG 文件由一系列键值对组成，每个键值对表示一个配置项及其对应的值。通常，键和值之间用等号 `=` 或者冒号 `:` 进行分隔。

   ```plaintext
   key1 = value1
   key2: value2
   ```

2. **注释**：
   CFG 文件支持单行注释，以分号 `;` 或者井号 `#` 开头。

   ```plaintext
   ; This is a comment
   # Another comment
   ```

3. **分组**：
   有些 CFG 文件支持分组，可以将相关的配置项放在同一个组内，以便更好地组织和管理配置信息。分组通常用方括号 `[]` 表示。

   ```plaintext
   [group1]
   key1 = value1
   key2 = value2

   [group2]
   key3 = value3
   ```

4. **空行**：
   CFG 文件可以包含空行，用于增加文件的可读性，但空行不会影响配置项的解析。

### 示例：

下面是一个简单的 CFG 配置文件的示例：

```plaintext
; This is a CFG configuration file

# Database configuration
db_host = localhost
db_port = 3306
db_username: admin
db_password = secret

# Server configuration
[server]
hostname = example.com
port = 8080
```

在这个示例中，配置文件包含了数据库配置和服务器配置两部分。数据库配置使用了简单的键值对形式，而服务器配置使用了分组的方式进行组织。

### 使用场景：

CFG 配置文件适用于各种不同类型的应用和系统，常见的使用场景包括：

- Web 服务器配置

- 数据库连接信息

- 应用程序的基本设置

- 系统环境变量配置

- 日志级别和格式配置等

## cfg 配置文件格式的官方标准文档有哪些？给出网址

CFG（Configuration File）配置文件格式并没有像 YAML 或 JSON 那样的官方标准文档。

它通常是特定应用程序或系统自行定义的配置文件格式，因此没有一个官方的标准文档。

不过，有一些常见的约定和示例可以作为参考，但它们并不是官方标准。

一些应用程序或系统的官方文档可能会提供有关其特定配置文件格式的说明和示例。

因此，如果你正在使用特定的应用程序或系统，并希望了解其配置文件格式的详细信息，建议查阅该应用程序或系统的官方文档。

通常可以在该文档的配置部分或用户指南中找到相关信息。

## cfg 作为配置文件有哪些优缺点？

### 优点和缺点：

- **优点**：

  - 结构简单，易于理解和编写。
  - 支持注释和分组，有利于组织和管理配置信息。
  - 通用性强，可以在各种不同的应用和系统中使用。

- **缺点**：

  - 不支持复杂的数据结构，只能表示简单的键值对配置项。
  - 不够灵活，无法满足一些复杂的配置需求。
  - 缺乏标准化，不同的系统可能有不同的 CFG 文件格式，导致兼容性问题。

## java 如何读写 cfg 配置文件?

在 Java 中读写 CFG（Configuration File）配置文件，你可以使用 Java 的标准类库中的 `Properties` 类来处理。

虽然 `Properties` 类通常用于处理 `.properties` 格式的配置文件，但它同样适用于 CFG 格式的文件，因为 CFG 文件的结构与 `.properties` 文件类似，都是键值对的形式。

以下是读写 CFG 配置文件的基本步骤：

### 读取 CFG 配置文件：

1. **创建 `Properties` 对象并加载配置文件**：

   使用 `Properties` 类创建一个对象，并使用其 `load()` 方法加载 CFG 文件。

   ```java
   import java.io.FileInputStream;
   import java.io.IOException;
   import java.util.Properties;

   public class ReadCfgFile {
       public static void main(String[] args) {
           Properties properties = new Properties();
           try {
               properties.load(new FileInputStream("config.cfg"));
           } catch (IOException e) {
               e.printStackTrace();
           }
       }
   }
   ```

2. **获取配置项的值**：

   使用 `Properties` 对象的 `getProperty()` 方法获取配置项的值。

   ```java
   String value = properties.getProperty("key");
   ```

### 写入 CFG 配置文件：

1. **创建 `Properties` 对象并设置配置项的值**：

   使用 `Properties` 类创建一个对象，并使用其 `setProperty()` 方法设置配置项的值。

   ```java
   Properties properties = new Properties();
   properties.setProperty("key1", "value1");
   properties.setProperty("key2", "value2");
   ```

2. **将配置写入文件**：
   使用 `Properties` 对象的 `store()` 方法将配置写入文件。

   ```java
   try {
       properties.store(new FileOutputStream("config.cfg"), "Comments");
   } catch (IOException e) {
       e.printStackTrace();
   }
   ```

以上就是使用 Java 标准类库中的 `Properties` 类来读写 CFG 配置文件的基本步骤。

你可以根据自己的需求和项目的具体情况进行适当的修改和扩展。


## java 有哪些可以解析 cfg 配置文件的开源工具？介绍一下如何使用

在 Java 中解析 CFG（Configuration File）配置文件，除了使用 Java 标准类库中的 `Properties` 类之外，还有一些第三方开源工具可供选择。以下是一些常用的可以解析 CFG 配置文件的开源工具，并简要介绍了如何使用它们：

### 1. Apache Commons Configuration

Apache Commons Configuration 是 Apache 软件基金会的一个项目，提供了对不同类型配置文件的读取、写入和管理的功能，包括 XML、Properties、INI 和 JSON 等格式的配置文件。虽然它不直接支持 CFG 格式，但可以通过扩展实现。

#### 使用步骤：

1. **添加依赖**：
   首先需要在项目中添加 Apache Commons Configuration 的依赖项。

   ```xml
   <dependency>
       <groupId>org.apache.commons</groupId>
       <artifactId>commons-configuration2</artifactId>
       <version>2.7</version>
   </dependency>
   ```

2. **解析 CFG 文件**：
   下面是一个简单的示例代码，演示了如何使用 Apache Commons Configuration 解析 CFG 格式的配置文件：

   ```java
   import org.apache.commons.configuration2.Configuration;
   import org.apache.commons.configuration2.PropertiesConfiguration;
   import org.apache.commons.configuration2.ex.ConfigurationException;

   public class ApacheCommonsCfgParser {
       public static void main(String[] args) {
           try {
               Configuration config = new PropertiesConfiguration("config.cfg");

               // 读取配置项
               String value = config.getString("key");
               System.out.println("Value: " + value);
           } catch (ConfigurationException e) {
               e.printStackTrace();
           }
       }
   }
   ```

### 2. HOCON（Human-Optimized Config Object Notation）

HOCON 是一种扩展了 JSON 格式的配置文件语言，通常用于读取和写入配置信息。虽然它不是专门用于 CFG 格式的解析工具，但可以处理类似的结构化数据。

#### 使用步骤：

1. **添加依赖**：
   首先需要在项目中添加 HOCON 的依赖项。

   ```xml
   <dependency>
       <groupId>com.typesafe</groupId>
       <artifactId>config</artifactId>
       <version>1.4.2</version>
   </dependency>
   ```

2. **解析 CFG 文件**：
   下面是一个简单的示例代码，演示了如何使用 HOCON 解析 CFG 格式的配置文件：

   ```java
   import com.typesafe.config.Config;
   import com.typesafe.config.ConfigFactory;

   public class HoconCfgParser {
       public static void main(String[] args) {
           Config config = ConfigFactory.parseFile(new File("config.cfg"));

           // 读取配置项
           String value = config.getString("key");
           System.out.println("Value: " + value);
       }
   }
   ```

这些是使用 Apache Commons Configuration 和 HOCON 解析 CFG 配置文件的基本步骤。你可以根据项目的需要选择合适的工具库，并按照相应的步骤进行配置和使用。


## 感觉 cfg ini properties 有些类似？那为什么还要这么多类别？给出他们的差异点，附加一个详细的对比表格

确实，CFG、INI 和 Properties 格式在某些方面确实有些类似，它们都是用于存储配置信息的文本文件格式，都采用了键值对的形式表示配置项。

但是，它们在某些方面还是有一些差异的，下面是它们之间的主要差异点的对比：

| 特点           | CFG                    | INI                     | Properties              |
|----------------|------------------------|-------------------------|-------------------------|
| 文件后缀       | .cfg                   | .ini                    | .properties             |
| 注释符号       | ; 或 #                 | ; 或 #                  | # 或 !                  |
| 键值对分隔符   | = 或 :                 | =                       | =                       |
| 分组           | 支持                   | 不支持                  | 不支持                  |
| 数据类型       | 支持多种数据类型        | 字符串                   | 字符串                   |
| 复杂数据结构   | 支持（如列表、嵌套结构）| 不支持                  | 不支持                  |
| 标准化         | 无标准                  | 无标准                  | Java 标准                |
| 使用场景       | 通用                   | Windows 环境常见        | Java 程序常见            |
| 主要应用       | 通用                   | Windows INI 文件        | Java 属性配置文件        |

这个表格总结了 CFG、INI 和 Properties 格式之间的主要差异点。

根据你的具体需求和项目情况，选择合适的配置文件格式是很重要的。

例如，在 Windows 平台下，INI 格式可能更为常见，而在 Java 程序中，使用 Properties 格式可能更为方便。

而 CFG 格式则相对更加通用，支持更多复杂的数据结构和功能。

# 小结

## 给 cfg 格式配置文件做一个简单的总结

CFG（Configuration File）格式配置文件是一种常见的用于存储程序或系统配置信息的文本文件格式。它具有以下特点：

1. **键值对结构**：
   CFG 文件由一系列键值对组成，每个键值对表示一个配置项及其对应的值。通常，键和值之间用等号 `=` 或者冒号 `:` 进行分隔。

   ```plaintext
   key1 = value1
   key2: value2
   ```

2. **注释**：
   CFG 文件支持单行注释，以分号 `;` 或者井号 `#` 开头。

   ```plaintext
   ; This is a comment
   # Another comment
   ```

3. **分组**：
   有些 CFG 文件支持分组，可以将相关的配置项放在同一个组内，以便更好地组织和管理配置信息。分组通常用方括号 `[]` 表示。

   ```plaintext
   [group1]
   key1 = value1
   key2 = value2
   ```

4. **空行**：
   CFG 文件可以包含空行，用于增加文件的可读性，但空行不会影响配置项的解析。

CFG 格式配置文件具有简单、直观的结构，易于阅读和编写。它适用于各种不同类型的应用和系统，常见的使用场景包括 Web 服务器配置、数据库连接信息、应用程序设置、系统环境变量配置等。CFG 文件通常不包含复杂的数据结构，主要用于表示简单的键值对配置项，因此适用于一些不需要复杂数据结构的配置需求。


* any list
{:toc}
