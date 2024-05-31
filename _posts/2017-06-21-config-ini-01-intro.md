---
layout: post
title: config ini 配置文件介绍
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

## Q: 详细介绍一下 ini 配置文件方式

INI（Initialisation）文件格式是一种简单的配置文件格式，通常用于存储配置信息。

下面是 INI 配置文件的详细介绍：

### 格式

INI 文件通常使用 `.ini` 后缀，并采用以下格式存储配置信息：

```plaintext
[section1]
key1=value1
key2=value2

[section2]
key3=value3
key4=value4
...
```

INI 文件由多个节（section）组成，每个节包含一个或多个键值对。

节用方括号 `[]` 括起来，键值对使用等号 `=` 分隔。键和值之间可以有空格，但通常不建议使用。

### 示例

```plaintext
[database]
url=jdbc:mysql://localhost:3306/mydb
username=admin
password=secret

[server]
port=8080
host=localhost
```

在这个示例中，有两个节，分别是 `database` 和 `server`。`database` 节包含了数据库连接的 URL、用户名和密码信息，而 `server` 节包含了服务器的端口号和主机名信息。

### 注释

INI 文件支持使用分号 `;` 添加注释。注释可以位于行首或者在键值对的末尾。

### 分组

INI 文件可以使用节来组织配置信息，使配置文件更具有结构化和可读性。

### 读取和写入

在各种编程语言中，都提供了读取和写入 INI 文件的库或模块。通过这些库或模块，可以方便地读取和修改 INI 文件中的配置信息。

## java 如何读写 ini 配置文件?

在 Java 中，可以使用第三方库来读写 INI 配置文件。其中，常用的库包括 Apache Commons Configuration 和 JINI。下面分别介绍如何使用这两个库来读写 INI 配置文件：

### 使用 Apache Commons Configuration

1. **添加依赖**：首先需要将 Apache Commons Configuration 添加为项目的依赖项。如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-configuration2</artifactId>
    <version>2.7</version>
</dependency>
```

2. **读取 INI 文件**：

```java
import org.apache.commons.configuration2.INIConfiguration;
import org.apache.commons.configuration2.builder.fluent.Configurations;

public class ReadIniFile {
    public static void main(String[] args) {
        try {
            Configurations configs = new Configurations();
            INIConfiguration config = configs.ini("config.ini");

            String value = config.getString("section1.key1");
            System.out.println(value);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

3. **写入 INI 文件**：

```java
import org.apache.commons.configuration2.INIConfiguration;
import org.apache.commons.configuration2.builder.fluent.Configurations;

public class WriteIniFile {
    public static void main(String[] args) {
        try {
            Configurations configs = new Configurations();
            INIConfiguration config = configs.ini();

            config.addProperty("section1.key1", "value1");
            config.addProperty("section1.key2", "value2");

            config.save("config.ini");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 使用 JINI

1. **添加依赖**：JINI 是 Java 平台的一个库，通常作为 Java 核心库的一部分提供。不需要额外添加依赖项。

2. **读取 INI 文件**：

```java
import java.io.FileInputStream;
import java.util.Properties;

public class ReadIniFile {
    public static void main(String[] args) {
        try {
            Properties properties = new Properties();
            FileInputStream fileInputStream = new FileInputStream("config.ini");
            properties.load(fileInputStream);

            String value = properties.getProperty("section1.key1");
            System.out.println(value);

            fileInputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

3. **写入 INI 文件**：

```java
import java.io.FileOutputStream;
import java.util.Properties;

public class WriteIniFile {
    public static void main(String[] args) {
        try {
            Properties properties = new Properties();
            properties.setProperty("section1.key1", "value1");
            properties.setProperty("section1.key2", "value2");

            FileOutputStream fileOutputStream = new FileOutputStream("config.ini");
            properties.store(fileOutputStream, null);

            fileOutputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

以上是使用 Apache Commons Configuration 和 JINI 两种方式来读写 INI 配置文件的方法。

具体选择哪种方式取决于项目的需求和个人偏好。

## ini 配置文件格式的官方标准文档有哪些？给出网址

INI 文件格式并没有一个官方的标准文档，因为它是一种常见但非正式的配置文件格式。

然而，微软 Windows 平台下的 INI 文件格式被广泛使用，并且有一些约定俗成的规范。

虽然没有官方标准文档，但是可以参考微软的文档来了解 INI 文件的格式和用法。

微软的 MSDN 文档提供了关于 INI 文件格式的一些说明，你可以在以下网址找到相关信息：

## ini 作为配置文件有哪些优缺点？

### 优点

1. **简单直观**：INI 文件采用了简单的键值对和分组的格式，易于理解和编辑，适合用于保存简单的配置信息。

2. **轻量级**：INI 文件是纯文本格式，文件大小较小，占用空间少，加载和保存速度快。

3. **跨平台性**：INI 文件是纯文本格式，与操作系统无关，可在不同的平台上进行编辑和使用。

### 缺点

1. **功能有限**：INI 文件适用于简单的配置需求，但对于复杂的配置信息，其功能有限，无法满足高级需求。

2. **不支持嵌套结构**：INI 文件不支持嵌套结构或复杂数据类型的存储，只能存储简单的键值对信息。

3. **不支持类型检查**：INI 文件中的值都是以字符串形式存储的，没有类型信息，需要在应用程序中进行手动转换和验证。

综上所述，INI 文件适用于简单的配置需求，对于小型项目或者简单的配置信息，是一种方便快捷的选择。但对于复杂的配置需求或大规模数据的存储，建议选择其他更为灵活和强大的配置方案。

## java 有哪些可以解析 ini 配置文件的开源工具？介绍一下

在 Java 中，有几个开源工具可以用来解析 INI 配置文件。

以下是其中一些常用的工具：

1. **Apache Commons Configuration**：
   Apache Commons Configuration 是 Apache 组织的一个项目，提供了对各种配置文件格式的支持，包括 INI、XML、Properties 等。
   
   它的 INI 解析器可以轻松地读取和写入 INI 格式的配置文件，提供了丰富的 API 和易于使用的接口。可以通过 Maven 或手动下载方式添加依赖使用。

   ```xml
   <dependency>
       <groupId>org.apache.commons</groupId>
       <artifactId>commons-configuration2</artifactId>
       <version>2.7</version>
   </dependency>
   ```

   使用 Apache Commons Configuration，可以方便地读取和写入 INI 配置文件，处理简单和复杂的配置需求。

2. **JINI**：
   JINI 是 Java 平台的一个库，通常作为 Java 核心库的一部分提供。它提供了一个 `java.util.Properties` 类，可以用来读取和写入 INI 格式的配置文件。虽然功能相对简单，但对于基本的 INI 文件解析和处理已经足够。

   ```java
   Properties properties = new Properties();
   properties.load(new FileInputStream("config.ini"));

   String value = properties.getProperty("section1.key1");
   ```

   使用 JINI，可以快速地读取和写入 INI 配置文件，适用于简单的配置需求。

3. **Hutool**：
   Hutool 是一个 Java 工具类库，提供了丰富的工具类和方法，其中也包含了对 INI 文件的支持。它的 INI 解析器可以轻松地读取和写入 INI 格式的配置文件，提供了简洁而强大的 API。

   ```java
   // 读取 INI 文件
   Ini ini = new Ini(new File("config.ini"));

   // 获取值
   String value = ini.get("section1").get("key1");
   ```

   Hutool 提供了简洁而灵活的 API，方便地处理 INI 配置文件。

这些工具都可以用来解析和处理 INI 格式的配置文件，具体选择取决于项目需求、个人偏好以及对功能和性能的要求。

# 小结

配置的方式多样，可以汇总为一个系列。

然后每一种配置方式，java 整合的组件实现。

* any list
{:toc}
