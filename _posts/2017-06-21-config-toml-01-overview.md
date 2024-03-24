---
layout: post
title: toml-01-toml 配置文件介绍
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [toml, config]
published: true
---


# 拓展阅读

[toml-01-toml 配置文件介绍](https://houbb.github.io/2016/10/26/config-toml-01-overview)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2016/10/26/config-yam-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2016/10/26/config-yaml-02-java-integration)

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
