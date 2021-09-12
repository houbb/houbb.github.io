---
layout: post
title: Java Servlet3.1 规范-12-请求映射到 servlet
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 映射请求到 Servlet

Web 容器需要本章描述的映射技术去映射客户端请求到 Servlet（该规范2.5以前的版本，使用这些映射技术是作为一个建议而不是要求，允许servlet 容器各有其不同的策略用于映射客户端请求到 servlet）。

# 使用 URL 路径

在收到客户端请求时，web 容器确定转发到哪一个 Web 应用。选择的 Web 应用必须具有最长的上下文路径匹配请求 URL 的开始。当映射到Servlet 时，URL 匹配的一部分是上下文。

Web 容器接下来必须用下面描述的路径匹配步骤找出 servlet 来处理请求。

用于映射到 Servlet 的路径是请求对象的请求 URL 减去上下文和路径参数部分。下面的 URL 路径映射规则按顺序使用。使用第一个匹配成功的且不会进一步尝试匹配：

1. 容器将尝试找到一个请求路径到servlet路径的精确匹配。成功匹配则选择该servlet。

2. 容器将递归地尝试匹配最长路径前缀。这是通过一次一个目录的遍历路径树完成的，使用‘/’字符作为路径分隔符。最长匹配确定选择的servlet。

3. 如果URL最后一部分包含一个扩展名（如 .jsp），servlet容器将视图匹配为扩展名处理请求的Servlet。扩展名定义在最后一部分的最后一个‘.’字符之后。

4. 如果前三个规则都没有产生一个servlet匹配，容器将试图为请求资源提供相关的内容。如果应用中定义了一个“default”servlet，它将被使用。许多容器提供了一种隐式的default servlet用于提供内容。

   容器必须使用区分大小写字符串比较匹配。

# 映射规范

在web应用部署描述符中，以下语法用于定义映射：

* 以‘/’字符开始、以‘/*’后缀结尾的字符串用于路径匹配。
* 以‘*.’开始的字符串用于扩展名映射。
* 空字符串“”是一个特殊的URL模式，其精确映射到应用的上下文根，即，http://host:port/<context-root>/请求形式。在这种情况下，路径信息是‘/’且servlet路径和上下文路径是空字符串（“”）。
* 只包含“/”字符的字符串表示应用的“default”servlet。在这种情况下，servlet路径是请求URL减去上下文路径且路径信息是null。
* 所有其他字符串仅用于精确匹配。

如果一个有效的 web.xml（在从 fragment 和注解合并了信息后）中有任意一个url-pattern，其映射到多个 servlet，那么部署将失败。

### 隐式映射

如果容器有一个内部的JSP容器，`*.jsp` 扩展名映射到它，允许执行JSP页面的要求。该映射被称为隐式映射。如果Web应用定义了一个 `*.jsp` 映射，它的优先级高于隐式映射。

Servlet 容器允许进行其他的隐式映射，只要显示映射的优先。例如，一个 `*.shtml` 隐式映射可以映射到包含在服务器上的功能。

### 示例映射集合

请看下面的一组映射：

TABLE 12-1 Example Set of Maps

| 路径模式   | Servlet  |
| ---------- | -------- |
| /foo/bar/* | servlet1 |
| /baz/*     | servlet2 |
| /catalog   | servlet3 |
| *.bop      | servlet4 |

将产生以下行为：

TABLE 12-2 Incoming Paths Applied to Example Maps

| 访问的路径           | Servlet 处理请求  |
| -------------------- | ----------------- |
| /foo/bar/index.html  | servlet1          |
| /foo/bar/index.bop   | servlet1          |
| /baz                 | servlet2          |
| /baz/index.html      | servlet2          |
| /catalog             | servlet3          |
| /catalog/index.html  | “default” servlet |
| /catalog/racecar.bop | servlet4          |
| /index.bop           | servlet4          |

请注意，在 /catalog/index.html 和 /catalog/racecar.bop 的情况下，不使用映射到“/catalog”的 servlet，因为不是精确匹配的。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}