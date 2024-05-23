---
layout: post
title:  Gson/fastjson/Jackson json 反序列化/序列化 如何指定字段的名称
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# 场景

java 一般命名是驼峰。比如 userName

发现和其他语言对接时，可能对方风格可能不同，有的是 user_name。

那么，怎么可以让不同的 json 和 java 对象的字段映射序列化+反序列化呢？


# 不同 json 库的操作方式

在 Java 中使用 JSON 库（如 Gson 或 Jackson）来指定注解的名字，那么通常的做法是在类或字段上使用注解来指定 JSON 中的键名。

以下是使用 Gson 和 Jackson 库的一些示例：

## Gson

在 Gson 中，你可以使用 `@SerializedName` 注解来指定 JSON 中的键名：

```java
import com.google.gson.annotations.SerializedName;

public class Example {
    @SerializedName("name")
    private String name;

    // 构造函数、getter 和 setter
}
```

## Jackson

在 Jackson 中，你可以使用 `@JsonProperty` 注解来指定 JSON 中的键名：

```java
import com.fasterxml.jackson.annotation.JsonProperty;

public class Example {
    @JsonProperty("name")
    private String name;

    // 构造函数、getter 和 setter
}
```

## fastjson

Fastjson 是阿里巴巴开源的一个 Java 库，用于处理 JSON 数据。

在 Fastjson 中，如果你想指定 JSON 字段的名称，可以使用 `@JSONField` 注解。

以下是如何在 Fastjson 中使用 `@JSONField` 注解来指定 JSON 字段名称的示例：

```java
import com.alibaba.fastjson.annotation.JSONField;

public class User {
    @JSONField(name = "id")
    private int userId;

    @JSONField(name = "name")
    private String userName;

    // 构造函数、getter 和 setter
}
```

在这个例子中，`userId` 字段在 JSON 中将被表示为 `"id"`，而 `userName` 字段将被表示为 `"name"`。

Fastjson 还提供了其他与 JSON 字段相关的注解，例如：

- `@JSONField(serialize = false)`：在序列化时忽略该字段。
- `@JSONField(deserialize = false)`：在反序列化时忽略该字段。
- `@JSONField(format = "yyyy-MM-dd")`：指定日期格式。

# 参考资料

* any list
{:toc}