---
layout: post
title: toml-01-toml 配置文件介绍
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [toml, config]
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



# toml 配置文件是什么？

TOML（Tom's Obvious, Minimal Language）是一种用于配置文件的格式，由Tom Preston-Werner创建，目的是设计一种既简洁又明确的数据序列化格式。

TOML旨在成为INI文件的替代品，同时提供比JSON或YAML更清晰的语法和更强的类型支持。

### TOML配置文件的特点：

1. **明确的类型**：TOML支持多种数据类型，包括字符串、整数、浮点数、布尔值、日期时间和数组等，并且类型明确，易于识别。

2. **简洁性**：TOML的语法简洁，易于阅读和编写，没有不必要的复杂性。

3. **易于理解**：TOML的设计目标是让配置文件易于人类理解和编辑。

4. **支持嵌套结构**：TOML支持嵌套的表（类似于其他语言中的字典或对象），可以创建复杂的层次结构。

5. **无继承**：与INI文件不同，TOML中的表不支持继承，每个表都是独立的。

6. **数组支持**：TOML支持数组类型，可以轻松定义列表。

7. **注释**：TOML支持以`#`开始的单行注释。

8. **键值对**：TOML使用键值对来存储数据，键和值之间用等号`=`分隔。

9. **文件扩展名**：TOML文件通常以`.toml`为扩展名。

### TOML配置文件的语法元素：

- **表**：TOML中的表类似于其他语言中的字典或对象，用于组织相关的键值对集合。
- **键值对**：键和值之间用等号分隔，键名不包含空格。
- **数组**：数组用于存储有序的数据集合，数组中的元素可以是同一类型。
- **字符串**：TOML支持基本字符串和多行字符串。
- **整数和浮点数**：TOML明确区分整数和浮点数。
- **布尔值**：TOML支持`true`和`false`布尔值。
- **日期时间**：TOML支持ISO8601格式的日期和时间。

### TOML配置文件示例：

```toml
# 这是 TOML 配置文件的示例

# 表的定义
[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true

# 字符串值
name = "John Doe"

# 多行字符串
description = """
    This is a TOML file.
    It is used to configure something.
    """

# 整数和浮点数值
refresh_interval = 3600 # 1 hour

# 布尔值
use_cache = false

# 日期时间
dob = 1991-05-28T14:34:42Z

# 数组
fruits = ["apple", "banana", "cherry"]
```

### 使用场景：

TOML通常用于配置应用程序和系统，特别是在以下场景中：

- **应用程序配置**：用于定义应用程序的配置选项。
- **依赖管理**：例如，Cargo（Rust语言的包管理器）使用TOML文件来定义项目的依赖关系。
- **版本控制系统**：TOML被用作某些版本控制系统的配置文件格式。

### 工具和库支持：

TOML被多种编程语言的库支持，包括但不限于：

- **Rust**：toml-rs
- **Python**：toml
- **JavaScript**：@iarna/toml
- **Java**：toml4j
- **Go**：toml

这些库提供了解析和操作TOML配置文件的功能，使得在不同编程环境中使用TOML变得容易。

总的来说，TOML是一种简洁、明确且易于使用的配置文件格式，特别适合需要明确类型和结构化数据的配置场景。

它的设计哲学是简单性和明确性，使其成为配置文件管理的理想选择。

## toml 为什么被设计？

TOML（Tom's Obvious, Minimal Language）被设计的初衷是为了提供一个既简洁又明确的配置文件格式。

它由GitHub的联合创始人Tom Preston-Werner创建，目的是为了解决当时流行的配置文件格式（如INI、XML、YAML和JSON）存在的一些问题。

以下是TOML被设计的原因以及它的一些优缺点：

### 设计初衷：

1. **明确的类型**：TOML设计了明确的数据类型，如字符串、整数、浮点数、布尔值和日期，使得配置文件中的值类型清晰，易于解析。

2. **避免不必要的复杂性**：与YAML和XML等格式相比，TOML避免了不必要的复杂性，使得配置文件更易于编写和理解。

3. **易于解析**：TOML的设计使得它容易被计算机解析，同时保持了对人类的友好性。

4. **支持嵌套结构**：TOML支持表（table）的嵌套，允许创建层次化的数据结构，这有助于组织复杂的配置数据。

5. **避免继承和合并**：TOML不支持INI文件中的继承或合并概念，每个表是独立的，这简化了配置文件的结构。

6. **设计简洁**：TOML的设计哲学是“最小化”，避免不必要的特性，专注于提供核心的配置功能。

### 优点：

1. **类型安全**：TOML强制类型定义，有助于在解析阶段捕捉错误。

2. **简洁性**：TOML的语法简洁，没有冗余，易于学习和使用。

3. **结构清晰**：支持嵌套的表结构，有助于组织和维护复杂的配置。

4. **易于阅读和编写**：TOML的设计易于人类阅读和编写，同时结构化的特性也便于编辑。

5. **广泛的库支持**：TOML得到了多种编程语言的库支持，易于集成到不同的项目中。

6. **明确的规范**：TOML有一个清晰的规范，易于实现和维护。

### 缺点：

1. **社区和普及度**：相比于JSON或YAML，TOML的社区和普及度较小。

2. **学习曲线**：尽管TOML设计简洁，但对于习惯于其他配置文件格式的用户来说，可能存在一定的学习曲线。

3. **功能限制**：TOML不支持一些高级功能，如YAML的锚点和别名，或者JSON的模式验证。

4. **解析器性能**：由于TOML是一种较新的格式，某些语言的TOML解析器可能不如成熟的JSON或YAML解析器性能好。

5. **缺乏高级数据结构**：TOML不支持列表推导或复杂的数据结构操作，这可能限制了其在某些高级用例中的应用。

## toml 如何使用？

TOML（Tom's Obvious, Minimal Language）是一种流行的配置文件格式，常用于配置应用程序和系统。

以下是一些TOML配置文件的常见使用例子：

### 1. 应用程序配置

```toml
# 应用配置文件 example.toml

[application]
name = "MyApp"
version = "1.0.0"
debug = true

[application.server]
host = "127.0.0.1"
port = 8080

[application.database]
user = "admin"
password = "secret"
```

### 2. 依赖管理

在某些编程语言中，TOML用于定义项目的依赖关系，如Rust的Cargo。

```toml
# 依赖配置文件 Cargo.toml

[package]
name = "myproject"
version = "0.1.0"
authors = ["Author Name <author@example.com>"]

[dependencies]
rand = "0.8.0"
serde = { version = "1.0", features = ["derive"] }
```

### 3. 包管理器配置

```toml
# 包管理器配置文件 package.toml

[package]
name = "examplepkg"
version = "1.2.3"
description = "An example package"
license = "MIT"
maintainer = "Your Name <your.email@example.com>"

[dependencies]
libfoo = ">=1.0.0"
```

### 4. 系统配置

```toml
# 系统配置文件 system.toml

[system]
timezone = "UTC"
language = "en_US.UTF-8"

[system.network]
hostname = "examplehost"
ip_address = "192.168.1.100"
```

### 5. 用户偏好设置

```toml
# 用户偏好设置文件 preferences.toml

[user]
name = "John Doe"
theme = "dark"

[user.interface]
font_size = 14
resolution = "1920x1080"
```

### 6. API配置

```toml
# API配置文件 api.toml

[api]
endpoint = "https://api.example.com"
timeout = 30

[api.auth]
token = "abc123"
```

### 7. 数据库连接配置

```toml
# 数据库连接配置文件 db.toml

[database]
type = "postgresql"
host = "localhost"
port = 5432
user = "dbuser"
password = "dbpassword"
dbname = "mydatabase"
```

### 8. 环境变量配置

```toml
# 环境变量配置文件 env.toml

[environment]
production = true
log_level = "info"
```

### 9. 多语言支持

```toml
# 多语言支持配置文件 i18n.toml

[[languages]]
code = "en"
name = "English"

[[languages]]
code = "fr"
name = "Français"
```

### 10. 项目构建配置

```toml
# 项目构建配置文件 build.toml

[build]
target = "x86_64-unknown-linux-gnu"
release = true

[build.options]
optimize = true
strip = true
```

## java 如何解析 toml 文件？

以下是几种常用的Java库以及如何使用它们来解析TOML配置文件的示例：

### 1. toml4j

toml4j是一个用于解析TOML文件的Java库。以下是使用toml4j库的基本步骤：

1. **添加依赖**：在你的项目中添加toml4j的依赖项。如果你使用Maven，可以在`pom.xml`文件中添加如下依赖项：

   ```xml
   <dependency>
     <groupId>com.moandjiezana.toml</groupId>
     <artifactId>toml4j</artifactId>
     <version>0.7.2</version> <!-- 使用最新版本 -->
   </dependency>
   ```

2. **解析TOML文件**：使用toml4j提供的API来加载和解析TOML文件。

   ```java
   import com.moandjiezana.toml.Toml;
   import com.moandjiezana.toml.TomlParseResult;

   public class TomlParserExample {
       public static void main(String[] args) {
           try {
               // 创建TOML解析器对象
               Toml toml = new Toml();
               // 加载TOML文件
               TomlParseResult tomlParseResult = toml.read(new File("config.toml"));
               // 获取解析结果
               TomlTable tomlTable = tomlParseResult.getTable();
               
               // 访问配置项
               String value = tomlTable.getString("key");
               System.out.println("Value: " + value);
           } catch (Exception e) {
               e.printStackTrace();
           }
       }
   }
   ```

### 2. Jackson-dataformat-toml

Jackson提供了一个用于处理TOML文件的数据格式模块`jackson-dataformat-toml`。以下是使用该模块的步骤：

1. **添加依赖**：在项目中添加Jackson的TOML模块依赖。

   ```xml
   <dependency>
     <groupId>com.fasterxml.jackson.dataformat</groupId>
     <artifactId>jackson-dataformat-toml</artifactId>
     <version>2.13.0</version> <!-- 使用最新版本 -->
   </dependency>
   ```

2. **解析TOML文件**：使用`ObjectMapper`结合TOML工厂来读取和解析TOML文件。

   ```java
   import com.fasterxml.jackson.databind.ObjectMapper;
   import com.fasterxml.jackson.dataformat.toml.TomlMapper;

   public class JacksonTomlParserExample {
       public static void main(String[] args) {
           try {
               ObjectMapper mapper = TomlMapper.builder().build();
               // 读取TOML文件
               Object config = mapper.readValue(new File("config.toml"), Object.class);
               
               // 访问配置项
               String value = (String) ((Map) config).get("key");
               System.out.println("Value: " + value);
           } catch (IOException e) {
               e.printStackTrace();
           }
       }
   }
   ```

### 3. 使用其他库

除了上述两种库外，还有其他一些库如`tomlj`等，可以根据项目需求和个人偏好选择合适的库来处理TOML文件。

# 小结

TOML（Tom's Obvious, Minimal Language）是一种用于配置文件的轻量级、易读的格式，它具有以下特点：

1. **简洁明了**：TOML的设计直观，易于人类阅读和编写，语法简单。

2. **明确的数据类型**：TOML支持多种基础数据类型，包括字符串、整数、浮点数、布尔值和日期时间，类型明确且易于区分。

3. **结构化支持**：TOML支持嵌套的表（类似于其他语言中的对象或字典），可以清晰地表达层次化的数据结构。

4. **数组表示**：TOML允许数组的表示，可以轻松定义列表类型的数据。

5. **注释功能**：支持以`#`开始的单行注释，方便添加配置说明。

6. **键值对**：TOML通过键值对存储数据，键和值之间使用等号`=`连接。

7. **无继承**：与INI文件不同，TOML不支持继承机制，每个表都是独立的。

8. **文件扩展名**：TOML文件通常使用`.toml`作为文件扩展名。

9. **多文档支持**：一个TOML文件可以包含多个独立的文档块，由`---`分隔。

TOML的设计哲学是简单性和明确性，使其成为配置文件管理的理想选择。



------------------------------------------------------------------------

# Toml 是什么？

TOML旨在成为一种极简的配置文件格式，其明显的语义使其易于阅读。

TOML的设计目标是能够明确地映射到哈希表。TOML应该易于解析成各种编程语言中的数据结构。

## Q:  toml 的官方学习资料及网址

TOML（Tom's Obvious Minimal Language）的官方网站为：[https://toml.io/](https://toml.io/)

TOML的官方GitHub仓库地址为：[https://github.com/toml-lang/toml](https://github.com/toml-lang/toml)

在这些官方资源上，你可以找到TOML语法的详细规范，学习资料，以及其他有关TOML的文档。

## Q: 详细介绍一下 toml 配置文件格式


TOML（Tom's Obvious Minimal Language）是一种易于阅读和编写的配置文件格式。

它的设计目标是提供一个简单的、直观的配置文件语法，以替代类似INI、JSON和YAML等格式。

TOML 支持各种数据类型（字符串、整数、浮点数、布尔值、日期时间等）和嵌套结构，使得它适用于配置文件、元数据、设置文件等场景。

以下是 TOML 配置文件的一些基本特性和语法规则：

### 基本语法：

- TOML 配置文件由键值对（key-value pairs）组成，每个键值对以等号（`=`）或者冒号（`:`）分隔。
- 键值对之间可以使用换行符或者行尾的逗号（`,`）分隔。
- 注释以井号（`#`）开头，后面的内容将被视为注释，直到行尾。

### 数据类型：

TOML 支持以下基本数据类型：

- **字符串（String）：** 字符串可以用单引号或双引号括起来，例如 `'hello'` 或 `"world"`。
- **整数（Integer）：** 例如 `42`。
- **浮点数（Float）：** 例如 `3.14`。
- **布尔值（Boolean）：** 可以是 `true` 或 `false`。
- **日期时间（Datetime）：** 例如 `2023-11-01T10:30:00Z`，表示UTC时间。

### 数据结构：

TOML 支持嵌套的数据结构：

- **表（Table）：** 使用方括号（`[]`）定义表，表可以包含键值对，也可以包含嵌套的表。
  ```toml
  [user]
  name = "Alice"
  age = 30
  [user.address]
  city = "New York"
  ```
- **数组（Array）：** 使用方括号（`[]`）定义数组，数组元素可以是任意数据类型，也可以是嵌套的表或数组。
  ```toml
  hobbies = ["reading", "traveling", "swimming"]
  ```

### 多行字符串：

TOML 允许使用三个连续的单引号或双引号表示多行字符串，保留换行符和缩进。

```toml
description = '''
This is a multi-line
string in TOML.
It preserves newlines
and indentation.
'''
```

以上是 TOML 配置文件的基本语法和特性。

TOML 的设计目标是提供一种简单而直观的配置文件格式，使得用户可以轻松地阅读和编写配置信息。

# java 入门整合

## maven 引入

```xml
<dependency>
    <groupId>com.moandjiezana.toml</groupId>
    <artifactId>toml4j</artifactId>
    <version>0.7.2</version>
</dependency>
```

## 文件的写

```java
package com.github.houbb.toml.learn.demo;

import com.github.houbb.toml.learn.model.User;
import com.moandjiezana.toml.TomlWriter;

import java.io.FileWriter;
import java.io.IOException;

public class TOMLWriterExample {

    public static void main(String[] args) {
        // 创建一个User对象
        User user = new User();
        user.setName("Alice");
        user.setAge(30);
        user.setEmployed(true);

        // 将User对象写入TOML文件
        try (FileWriter writer = new FileWriter("toml4j_output.toml")) {
            TomlWriter tomlWriter = new TomlWriter();
            tomlWriter.write(user, writer);
            System.out.println("TOML文件已生成。");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

生成的效果

```toml
name = "Alice"
age = 30
isEmployed = true
```

## 文件的读

```java
package com.github.houbb.toml.learn.demo;

import com.moandjiezana.toml.Toml;

import java.io.File;

public class TOML4JReadExample {

    public static void main(String[] args) {
        // 从TOML文件中读取数据
        Toml toml = new Toml().read(new File("example.toml"));

        // 读取单个值
        String name = toml.getString("user.name");
        int age = toml.getLong("user.age").intValue();
        boolean isEmployed = toml.getBoolean("user.isEmployed");

        // 读取嵌套表的值
        String city = toml.getString("user.address.city");
        String zip = toml.getString("user.address.zip");

        // 打印读取的数据
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Employed: " + isEmployed);
        System.out.println("City: " + city);
        System.out.println("ZIP: " + zip);
    }

}
```

对应的 example.toml

```
[user]
name = "Alice"
age = 30
isEmployed = true

[user.address]
city = "New York"
zip = "10001"
```

对应的结果：

```
Name: Alice
Age: 30
Employed: true
City: New York
ZIP: 10001
```

# 小结

toml 是一个对人类特别友好的语言，但是个人感觉可能还是没有 yaml 这么广泛。

* any list
{:toc}
