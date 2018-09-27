---
layout: post
title: SQL Injection
date:  2018-09-26 08:56:29 +0800
categories: [Web]
tags: [web, web-safe, sh]
published: true
excerpt: SQL 注入
---

# SQL Injection

所谓 SQL 注入，就是通过客户端的输入把 SQL 命令注入到一个应用的数据库中，从而得以执行恶意 SQL 语句。

# 例子

```
uname = request.POST['username']
password = request.POST['password']
sql = "SELECT all FROM users WHERE username='" + uname + "' AND password='" + password + "'"
database.execute(sql)
```

上面这段程序直接将客户端传过来的数据写入到数据库。试想一下，如果用户传入的 password 值是： "password’ OR 1=1"，那么 sql 语句便会变成：

```
sql = "SELECT all FROM users WHERE username='username' AND password='password' OR 1=1"
```

那么，这句 sql 无论 username 和 password 是什么都会执行，从而将所有用户的信息取出来。

# 预防

## 执行的因素

想要提出解决方案，先看看 sql 注入得以施行的因素：

1. 网页应用使用 SQL 来控制数据库

2. 用户传入的数据直接被写入数据库

## 预防手段

可以参考 [OWASP](https://en.wikipedia.org/wiki/OWASP)

1. Prepared Statements (with Parameterized Queries)： 参数化的查询语句可以强制应用开发者首先定义所有的 sql 代码，之后再将每个参数传递给查询语句

2. Stored Procedures： 使用语言自带的存储程序，而不是自己直接操纵数据库

3. White List Input Validation： 验证用户的输入

4. Escaping All User Supplied Input： 对用户提供的所有的输入都进行编码

# 参考资料

https://zhuanlan.zhihu.com/p/23309154

* any list
{:toc}