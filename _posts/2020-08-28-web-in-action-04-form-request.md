---
layout: post
title:  web 实战-04-基于 form 实现前后端交互
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# HTML form 表单

## 简单例子

```html
<form action="demo_form.php" method="get">
  First name: <input type="text" name="fname"><br>
  Last name: <input type="text" name="lname"><br>
  <input type="submit" value="提交">
</form>
```

## 标签

标签定义及使用说明

form 标签用于创建供用户输入的 HTML 表单。

form 元素包含一个或多个如下的表单元素：

```
<input>
<textarea>
<button>
<select>
<option>
<optgroup>
<fieldset>
<label>
```

## 属性

| 属性	| 值	| 描述 |
|:----|:----|:----|
| accept	| MIME_type	| HTML5 不支持。规定服务器接收到的文件的类型。（文件是通过文件上传提交的）|
| accept-charset	 | character_set	| 规定服务器可处理的表单数据字符集。|
| action	         | URL         	| 规定当提交表单时向何处发送表单数据。|
| autocompleteNew | 	on/off	      | 规定是否启用表单的自动完成功能。|
| enctype	| application/x-www-form-urlencoded 或 multipart/form-data 或  text/plain	| 规定在向服务器发送表单数据之前如何对其进行编码。（适用于 method="post" 的情况）|
| method	| get/post	| 规定用于发送表单数据的 HTTP 方法。|
| name	| text |	规定表单的名称。|
| novalidate	| novalidate	| 如果使用该属性，则提交表单时不进行验证。|
| target	| _blank/_self/_parent/_top	| 规定在何处打开 action URL。|

# GET 请求

## HttpServletRequest 获取参数

### 后端

```java
@GetMapping("/get/request")
public void getRequest(HttpServletRequest request,
                       HttpServletResponse response) {
    System.out.println("getRequest called");
    System.out.println("name: " + request.getParameter("name"));
    System.out.println("password: " + request.getParameter("password"));
}
```

`@GetMapping` 指定为 get 方法，及对应的请求地址，此处演示最基础的参数接受。

通过 `request.getParameter("参数名称")` 获取对应的值。

### 前端

```html
<form id="get-request" action="/form/noResult/get/request" method="get">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <input type="submit" value="提交">
</form>
```

通过 action 指定后端的请求地址，method 指定为 get。

submit 提供提交功能，后续 form 都是类似的。

### 测试

页面输入下对应的信息，日志如下：

```
getRequest called
name: adminstrator
password: 123456
```

## 直接获取参数

### 后端

上面的方法是最基础的，当然 spring-mvc 为我们封装了更加简单的方式。

```java
@GetMapping("/get/param")
@ResponseBody
public void getParam(String name, String password) {
    System.out.println("getParam called");
    System.out.println("name: " + name);
    System.out.println("password: " + password);
}
```

备注：`@ResponseBody` 如果不加是为报错的，mvc 默认会给我们映射为 param.jsp，虽然我们这里不关心结果。

### 前端

```html
<form id="get-param" action="/form/noResult/get/param" method="get">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <input type="submit" value="提交">
</form>
```

### 测试

点击提交，url 变成了 http://localhost:8080/form/noResult/get/param?name=adminstrator&password=123456

日志如下：

```
getParam called
name: adminstrator
password: 123456
```

## 基本参数的别名

上面的方法是比较常用的方式，不过平时我们前后端的参数可能会有一些差异。

spring-mvc 为我们提供了 `@RequestParam` 参数，可以指定参数的别名。

实际上就是 mvc 在映射为 servlet 处理时，实现了基于注解的属性名映射。

### 后端

```java
@GetMapping("/get/alias")
@ResponseBody
public void getAlias(@RequestParam("name") String username,
                     @RequestParam("password") String password) {
    System.out.println("getAlias called");
    System.out.println("name: " + username);
    System.out.println("password: " + password);
}
```

### 前端

```html
<form id="get-alias" action="/form/noResult/get/alias" method="get">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <input type="submit" value="提交">
</form>
```

### 测试


点击之后，请求 url 变为：http://localhost:8080/form/noResult/get/alias?name=adminstrator&password=11233

```
getAlias called
name: adminstrator
password: 11233
```

这里的 name 就被映射为了 username。

## 基于对象传递

如果参数较多，我们一个个写显然不够优雅，也不方便后期拓展，我们可以尝试通过对象的方式定义。

### 后端

```java
@GetMapping("/get/object")
@ResponseBody
public void getObject(User user) {
    System.out.println("getObject called");
    System.out.println("user: " + user);
}
```

- User.java

简单的 POJO 定义。

```java
public class User {

    private String name;

    private String password;

    //getter and setter

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

}
```

### 前端

```html
<form id="get-object" action="/form/noResult/get/object" method="get">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <input type="submit" value="提交">
</form>
```
### 测试

点击之后，页面 url 变为：http://localhost:8080/form/noResult/get/object?name=adminstrator&password=123456

日志：

```
getObject called
user: User{name='adminstrator', password='123456'}
```

## 基于 js 的请求传递

我们上面都是直接基于 form 表单的 submit 实现的，其实也可以依赖 js 实现。

js 提交相对更加灵活，可以添加更多的参数校验和对应的处理。

此处暂时演示原生 js，其他 jQuery 等前端 js 框架是类似的。

### 后端

```java
@GetMapping("/get/js")
@ResponseBody
public void getJs( User user) {
    System.out.println("getJs called");
    System.out.println("user: " + user);
}
```

### 前端

```html
<form id="get-js" action="/form/noResult/get/js" method="get">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <button onclick="submit()">提交</button>
</form>
```

- js

```js
<script>
    function submit() {
        var form = document.getElementById("get-js");
        // 做一些参数校验等

        // 表单提交
        form.submit();
    }
</script>
```

其实 js 可以动态改变 form 表单的 method, action 等属性，是一样的效果。

### 测试

点击提交按钮，url 变为：http://localhost:8080/form/noResult/get/js?name=adminstrator&password=999

```
getJs called
user: User{name='adminstrator', password='999'}
```

# POST 请求

上面演示了 get 方法的几种实现方式，其实和 post 请求都是一一对应的。

我们此处只演示一种，其他几种不再赘述。

## 简单例子

### 后端

此处使用 `@PostMapping` 注解替代 `@GetMapping` 注解，表示这是一个 post 请求。

```java
@PostMapping("/post/request")
public void postRequest(HttpServletRequest request,
                  HttpServletResponse response) {
    System.out.println("postRequest called");
    System.out.println("name: " + request.getParameter("name"));
    System.out.println("password: " + request.getParameter("password"));
}
```

### 前端

```html
<form id="post-request" action="/form/noResult/post/request" method="post">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
    <input type="submit" value="提交">
</form>
```

此处将 method 改为 post。

### 测试

点击提交，url 变为：http://localhost:8080/form/noResult/post/request

```
postRequest called
name: adminstrator
password: 666
```

## enctype 属性

下面我们重点研究一下 `enctype` 这个属性，这个属性在 [文件上传中](https://houbb.github.io/2020/08/09/jsp-learn-02-upload-download) 提到过。

> 文件上传：[https://houbb.github.io/2020/08/09/jsp-learn-02-upload-download](https://houbb.github.io/2020/08/09/jsp-learn-02-upload-download)

此处再次回顾一下；

### enctype 属性介绍

enctype 属性是规定在发送到服务器之前应该如何对表单数据进行编码。

enctype常用的属性值有3个：

第一个是 `application/x-www-form-urlencoded`, 这是默认的编码方式，它只处理表单域里的value属性值，采用这种编码方式的表单会将表单域的值处理成URL编码方式。就是说，在发送到服务器之前，所有字符都会进行编码（空格转换为 "+" 加号，特殊符号转换为 ASCII HEX 值）。

第二种是 `multipart/form-data`，这种编码方式的表单会以二进制流的方式来处理表单数据，同时，这种编码方式也会把文件域指定文件的内容封装到请求参数里，

第三种就是 `text/plain`，这种方式主要适合用于直接通过表单发送邮件的方式。空格转换为 "+" 加号，但不对特殊字符编码。

看了下网上还有一种 `application/json`，不过这种方式目前已经废弃了，我们此处不再深入。

# 基于 ajax 的请求

写到这里，我们发现 form 表单的实现方式有多种，但还是有些不够灵活。

比如：

（1）无法获取请求参数

（2）无法指定 json 传递方式

但是平时开发中，我们还是需要这两种特性的，我们后续将学习一下基于 jQuery 的 ajax 请求方式。

# 拓展阅读

[axios 入门学习](https://houbb.github.io/2018/04/04/axios)

# 参考资料

[html form 属性](https://www.runoob.com/tags/tag-form.html)

[一个页面提交多个表单](https://www.cnblogs.com/yangguoe/p/8527588.html)

[jquery form 序列化成json对象](https://www.jianshu.com/p/83df5a2d93f7)

[form设置enctype属性为'application/json'不起作用](https://segmentfault.com/q/1010000011901619)

[原生js实现form表单序列化的方法](https://www.jb51.net/article/144962.htm)

[form表单中的enctype 属性以及post请求里Content-Type方式](https://www.cnblogs.com/shj-com/p/8890781.html)

* any list
{:toc}