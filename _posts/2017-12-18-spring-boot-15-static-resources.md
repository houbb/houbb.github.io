---
layout: post
title:  Spring Boot-15-springboot 静态资源访问 404
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 问题描述

html 页面直接浏览器打开正常，通过 mvc 启动发现资源加载不到。

# 解决方案

springboot查找静态资源的相关配置项:

```yml
# 应用上下文配置
server.servlet.context-path=/myprojectname

# 默认配置会自动在 /public /static /resources 目录寻找静态资源, 故不需要 /static 等前缀
spring.mvc.static-path-pattern=/**

# SpringMvc(ModelAndView) 视图前缀 prefix/xxx/xxx.html, 可不设，如果static目录下有以工程名命名的文件夹，则可以设置(如: /static/project/css)
spring.mvc.view.prefix=${server.servlet.context-path}
```

## 使用方式

html 引用静态文件

```html
<link href="/myprojectname/css/bootstrap.css" rel="stylesheet">
<script src="/myprojectname/js/jquery.js">
```

## 静态资源404问题总结

若设置 `server.servlet.context-path=/myprojectname` 则每个静态资源都需要加上该值, 否则会出现404的问题

## ./ 和 / 的区别

`./` 相对路径, 会动态匹配当前请求的路径作为前缀(如: 若Controller 的 RequestMapping("/login")):

则实际请求路径为 http://ip:port/login/css/bootstrap.css, 很明显不可能每个页面都有bootstrap.css, 所以就会出现404

(换句话说: 请求地址"http://ip:port/login/login.html", 则login.html引入的 `<link href="./css/bootstrap.css">` 的实际请求路径为 `http://ip:port/login/css/bootstrap.css`)

`/url` 绝对路径: 实际请求路径 http://ip:port/css/bootstrap.css, 若设置 server.servlet.context-path, 依然报404

# 参考资料

[SpringBoot处理全局统一异常](https://www.cnblogs.com/lgjlife/p/10988439.html)

[SpringBoot ErrorController 实践](https://www.jianshu.com/p/23edca918ce8)

[SpringBoot 处理异常方式](https://www.cnblogs.com/sunfie/p/11436159.html)

* any list
{:toc}
