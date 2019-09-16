---
layout: post
title:  Json 之 FastJson
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, sf]
published: true
---

# FastJson

[Fastjson](https://github.com/alibaba/fastjson) 是一个Java库，可用于将Java对象转换为其JSON表示。它还可以用于将JSON字符串转换为等效的Java对象。Fastjson可以使用任意Java对象，包括您没有源代码的预先存在的对象。

## 多余的属性 json 转为对象

- User.java

```java
public class User {
    private String name;
    // getter and setter
}
```

- User.json

```json
{"name":"ryo", "age": 12}
```

直接可以转换成功 

```java
User user = JSON.parseObject(json, User.class);
```

## json 转换为 List<Map>

有时候需要将 json 转换为 list:

```java
List<Map<String, String>> listMapList = JSON.parseObject(json, new TypeReference<List<Map<String,String>>>(){});
```

* any list
{:toc}