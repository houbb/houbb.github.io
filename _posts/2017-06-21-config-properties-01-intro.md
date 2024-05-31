---
layout: post
title: config properties 配置文件介绍
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

## Q: 详细介绍一下 properties 配置文件方式

Properties 配置文件是一种常见的配置文件格式，通常用于存储简单的键值对配置信息。

下面是 Properties 配置文件的详细介绍：

### 格式

Properties 文件通常采用 `.properties` 后缀，并使用以下格式存储配置信息：

```plaintext
key1=value1
key2=value2
key3=value3
...
```

每行代表一个键值对，键和值之间使用等号 `=` 分隔。键值对中的空格会被忽略。

### 示例

```plaintext
# This is a sample properties file
database.url=jdbc:mysql://localhost:3306/mydb
database.username=admin
database.password=secret
max.connections=10
```

在这个示例中，有四个键值对，分别是 `database.url`、`database.username`、`database.password` 和 `max.connections`。它们分别表示数据库连接 URL、用户名、密码和最大连接数。

### 注释

Properties 文件支持使用 `#` 符号添加注释。

注释可以位于行首或者在键值对的末尾。

### 转义字符

在 Properties 文件中，可以使用反斜杠 `\` 进行转义，特别是对于特殊字符或者需要包含等号 `=` 或冒号 `:` 的情况。

### 读取和写入

在 Java 中，可以使用 `java.util.Properties` 类来读取和写入 Properties 文件。以下是一个简单的示例：

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class PropertiesExample {

    public static void main(String[] args) {
        Properties properties = new Properties();

        // 读取配置文件
        try (FileInputStream fileInputStream = new FileInputStream("config.properties")) {
            properties.load(fileInputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 获取属性值
        String url = properties.getProperty("database.url");
        String username = properties.getProperty("database.username");
        String password = properties.getProperty("database.password");

        System.out.println("URL: " + url);
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);

        // 修改属性值
        properties.setProperty("max.connections", "20");

        // 写入配置文件
        try (FileOutputStream fileOutputStream = new FileOutputStream("config.properties")) {
            properties.store(fileOutputStream, "Updated properties");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这个示例演示了如何读取和写入 Properties 文件，以及如何获取和修改属性值。

## properties 格式的官方标准文档有哪些？给出网址

Properties 文件格式并没有一个官方的标准文档，但是 Java 官方文档提供了关于 `java.util.Properties` 类的详细说明，包括了 Properties 文件的使用方法和规范。

你可以在以下网址找到相关信息：

[https://docs.oracle.com/javase/8/docs/api/java/util/Properties.html](https://docs.oracle.com/javase/8/docs/api/java/util/Properties.html)

该文档提供了关于 `java.util.Properties` 类的 API 文档，以及对 Properties 文件的使用和规范的一些说明。

### api 文档翻译

Properties 类表示一组持久属性。可以将 Properties 保存到流中或从流中加载。属性列表中的每个键及其对应的值都是一个字符串。

属性列表可以包含另一个属性列表作为其“默认值”；如果在原始属性列表中找不到属性键，则会搜索第二个属性列表。

由于 Properties 继承自 Hashtable，因此 put 和 putAll 方法可以应用于 Properties 对象。强烈不建议使用它们，因为它们允许调用者插入其键或值不是字符串的条目。应改用 setProperty 方法。如果在包含非字符串键或值的“受损”Properties 对象上调用 store 或 save 方法，则调用将失败。类似地，如果在包含非字符串键的“受损”Properties 对象上调用 propertyNames 或 list 方法，则调用将失败。

load(Reader) / store(Writer, String) 方法从字符流中加载和保存属性，格式为下面指定的简单的基于行的格式。load(InputStream) / store(OutputStream, String) 方法与 load(Reader)/store(Writer, String) 一对的工作方式相同，只是输入/输出流以 ISO 8859-1 字符编码进行编码。无法直接用此编码表示的字符可以使用 Java™ 语言规范第 3.3 节中定义的 Unicode 转义进行编写；在转义序列中只允许一个'u'字符。native2ascii 工具可用于将属性文件转换为其他字符编码及从其他字符编码转换为属性文件。

loadFromXML(InputStream) 和 storeToXML(OutputStream, String, String) 方法以简单的 XML 格式加载和保存属性。默认情况下使用 UTF-8 字符编码，但如果需要，可以指定特定的编码。实现必须支持 UTF-8 和 UTF-16，并且可能支持其他编码。

XML 属性文档具有以下 DOCTYPE 声明：

`<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">`
 
请注意，在导出或导入属性时，不会访问系统 URI（http://java.sun.com/dtd/properties.dtd）；它仅用作唯一标识 DTD 的字符串，该字符串是：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- 属性的 DTD -->
<!ELEMENT properties ( comment?, entry* ) >
<!ATTLIST properties version CDATA #FIXED "1.0">
<!ELEMENT comment (#PCDATA) >
<!ELEMENT entry (#PCDATA) >
<!ATTLIST entry key CDATA #REQUIRED>
```
 
该类是线程安全的：多个线程可以共享单个 Properties 对象，无需外部同步。

## properties 作为配置文件有哪些优缺点？

Properties 文件作为配置文件有以下优点和缺点：

优点：

1. **简单直观**：Properties 文件采用了简单的键值对格式，易于理解和编辑，适合用于保存简单的配置信息。

2. **轻量级**：Properties 文件是纯文本格式，文件大小较小，占用空间少，加载和保存速度快。

3. **易于处理**：Java 提供了内置的 Properties 类库，方便读取和写入 Properties 文件，无需依赖额外的库或工具。

4. **跨平台性**：Properties 文件是纯文本格式，与操作系统无关，可在不同的平台上进行编辑和使用。

5. **支持注释**：Properties 文件支持添加注释，方便开发人员记录配置信息的含义和用途。

缺点：

1. **功能有限**：Properties 文件适用于简单的配置需求，但对于复杂的配置信息，其功能有限，无法满足高级需求。

2. **不支持复杂数据结构**：Properties 文件只支持键值对的形式，不支持嵌套结构或复杂数据类型的存储。

3. **不支持类型检查**：Properties 文件中的值都是以字符串形式存储的，没有类型信息，需要在应用程序中进行手动转换和验证。

4. **不支持扩展性**：Properties 文件的格式比较固定，不支持自定义格式或扩展功能，难以满足特定需求。

5. **不适合大规模数据**：虽然 Properties 文件可以存储大量的配置信息，但当配置项过多时，文件会变得冗长和难以维护。

综上所述，Properties 文件适用于简单的配置需求，对于小型项目或者简单的配置信息，是一种方便快捷的选择。

但对于复杂的配置需求或大规模数据的存储，建议选择其他更为灵活和强大的配置方案。

# 小结

配置的方式多样，可以汇总为一个系列。

然后每一种配置方式，java 整合的组件实现。

* any list
{:toc}
