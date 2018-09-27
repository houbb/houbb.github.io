---
layout: post
title: HTTP GET POST 请求区别
date:  2018-09-27 17:03:57 +0800
categories: [Web]
tags: [web, http, sf]
published: true
excerpt: HTTP GET POST 请求区别详解
---

# 常见区别

## 长度限制

- GET

1. GET是通过URL提交数据，因此GET可提交的数据量就跟URL所能达到的最大长度有直接关系。 

2. 实际上HTTP协议对URL长度是没有限制的；限制URL长度大多数是浏览器或者服务器的配置参数。

- POST

1. 同样的，HTTP协议没有对POST进行任何限制，一般是受服务器配置限制或者内存大小。

2. PHP下可以修改php.conf的postmaxsize来设置POST的大小。

## URL 安全性

1. GET是通过URL方式请求，可以直接看到，明文传输。

2. POST是通过请求header请求，可以开发者工具或者抓包可以看到，同样也是明文的。 

3. GET请求会保存在浏览器历史纪录中，还可能会保存在Web的日志中。

# RFC 原文

```
The GET method requests transfer of a current selected representation for the target resource. GET is the primary mechanism of information retrieval and the focus of almost all performance optimizations. Hence, when people speak of retrieving some identifiable information via HTTP, they are generally referring to making a GET request.A payload within a GET request message has no defined semantics; sending a payload body on a GET request might cause some existing implementations to reject the request.

The POST method requests that the target resource process the representation enclosed in the request according to the resource’s own specific semantics.
```

GET的语义是请求获取指定的资源。

GET方法是安全、幂等、可缓存的（除非有 Cache-ControlHeader的约束）,GET方法的报文主体没有任何语义。

POST的语义是根据请求负荷（报文主体）对指定的资源做出处理，具体的处理方式视资源类型而不同。

POST不安全，不幂等，（大部分实现）不可缓存。

## 基本概念

- Safe(安全)

安全这里的「安全」和通常理解的「安全」意义不同，如果一个方法的语义在本质上是「只读」的，那么这个方法就是安全的。

客户端向服务端的资源发起的请求如果使用了是安全的方法，就不应该引起服务端任何的状态变化，因此也是无害的。 此RFC定义，GET, HEAD, OPTIONS 和 TRACE 这几个方法是安全的。但是这个定义只是规范，并不能保证方法的实现也是安全的，服务端的实现可能会不符合方法语义，正如上文说过的使用GET修改用户信息的情况。引入安全这个概念的目的是为了方便网络爬虫和缓存，以免调用或者缓存某些不安全方法时引起某些意外的后果。User Agent（浏览器）应该在执行安全和不安全方法时做出区分对待，并给用户以提示。

- Idempotent(幂等)

幂等的概念是指同一个请求方法执行多次和仅执行一次的效果完全相同。

按照RFC规范，PUT，DELETE和安全方法都是幂等的。

同样，这也仅仅是规范，服务端实现是否幂等是无法确保的。

引入幂等主要是为了处理同一个请求重复发送的情况，比如在请求响应前失去连接，如果方法是幂等的，就可以放心地重发一次请求。这也是浏览器在后退/刷新时遇到POST会给用户提示的原因：POST语义不是幂等的，重复请求可能会带来意想不到的后果。

[幂等性](https://houbb.github.io/2018/09/02/idempotency-patterns)

- Cacheable(可缓存性)

顾名思义就是一个方法是否可以被缓存，此RFC里GET，HEAD和某些情况下的POST都是可缓存的，但是绝大多数的浏览器的实现里仅仅支持GET和HEAD。

关于缓存的更多内容可以去看 [RFC7234](https://tools.ietf.org/html/rfc7234)。

# 最佳实践

## GET

一般的查询接口，使用 Get 请求。

## POST 

1. 参数较多

2. 涉及到删除/更新/增加等操作的

3. 涉及到安全性信息。比如密码等。（ps: post 请求使用工具也是可以抓取到的）

# 参考资料

[get和post区别？](https://www.zhihu.com/question/28586791)

* any list
{:toc}