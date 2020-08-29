---
layout: post
title: Spring Web MVC-08-springmvc 接收请求参数（普通参数，对象，JSON, URL）
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc, http, spring, sf]
published: true
---

# spring mvc 后台

在交互的过程中，其中一个关键的节点就是获取到客户端发送过来的请求参数，本篇文章，我们来罗列下SpringMVC对于各种数据的获取方式：

说明：以下重点在讲解如何获取参数上，所以返回的数据不是重点

# 普通方式

1，普通方式，请求参数名跟Controller的方法参数一致

## 1.1 创建Controller

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/request")
public class RequestController {

    @ResponseBody
    @RequestMapping(value = "/common", method = RequestMethod.GET)
    public String common(String username, String password) {
        return username+password;
    }

}
```

`@RequestMapping` 注解可以指定具体的方式类型。

`@ResponseBody` 可以指定请求返回字符串，不指定默认返回的是页面资源信息。

## 请求

这种对于访问方式没有特别高的要求，get/post 都可以

```
http://localhost:9001/request/common?username=ryo&password=123456
```

# 别名

## 场景

有时候前后端的字段可能有所不同。

可以通过 `@RequestParam` 指定参数的别名，其他还是是否必填等多种属性指定。

## 定义方式

```java
@ResponseBody
@RequestMapping("/alias")
public String alias(@RequestParam("name") String username,
                     @RequestParam("pwd") String password) {
    return username+password;
}
```

## 请求

```
http://localhost:9001/request/alias?name=ryo&pwd=12345699
```

这里的参数和注解中的别称保持一致。

# Post form 表单

## 对象定义

- User.java

```java
public class User {

    private String username;

    private String password;

    //Getter+Setter+toString()
}
```

- 请求信息

```java
@ResponseBody
@PostMapping("/object")
public String object(User user) {
    return user.toString();
}
```

## Postman 请求模拟

POST 请求，

URL:

```
http://localhost:9001/request/object
```

指定 `Content-Type=application/x-www-form-urlencoded` 作为 MIME type，就像普通的HTML表单一样。

Body 指定类型为 `x-www-form-urlencoded`, 内容为：

```
username: ryo
password: 123456
```

直接请求，返回内容如下：

```
User{username='ryo', password='123456'}
```

# post json 信息

## 场景

有时候接收到的是 json 前端请求

## 后台

需要通过 `@RequestBody` 注解声明参数：

```java
@ResponseBody
@PostMapping("/json")
public String json(@RequestBody User user) {
    return user.toString();
}
```

## postman 模拟

POST 请求，

URL:

```
http://localhost:9001/request/json
```

指定 `Content-Type=application/json` 传递 json 请求。

Body 指定类型为 `raw`, JSON 形式。内容为：

```json
{
    "username": "ryo",
    "password": "123456"
}
```

直接请求，返回内容如下：

```
User{username='ryo', password='123456'}
```

# 参考资料

[SpringMVC-如何接收各种参数（普通参数，对象，JSON, URL）](https://www.cnblogs.com/jpfss/p/9336768.html)

* any list
{:toc}