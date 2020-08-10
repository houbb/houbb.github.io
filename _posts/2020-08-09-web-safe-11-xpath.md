---
layout: post
title:  web 安全系列-11-XPath 注入攻击
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# XPath 注入攻击是什么？

Xpath注入攻击本质上和SQL注入攻击是类似的，都是输入一些恶意的查询等代码字符串，从而对网站进行攻击。

XPath注入攻击，是指利用XPath 解析器的松散输入和容错特性，能够在 URL、表单或其它信息上附带恶意的XPath 查询代码，以获得权限信息的访问权并更改这些信息。

XPath注入攻击是针对Web服务应用新的攻击方法，它允许攻击者在事先不知道XPath查询相关知识的情况下，通过XPath查询得到一个XML文档的完整内容。

# Xpath注入攻击的实例

XPath注入攻击主要是通过构建特殊的输入，这些输入往往是XPath语法中的一些组合，这些输入将作为参数传入Web 应用程序，通过执行XPath查询而执行入侵者想要的操作，下面以登录验证中的模块为例，说明 XPath注入攻击的实现原理。

在 Web 应用程序的登录验证程序中，一般有用户名（username）和密码（password） 两个参数，程序会通过用户所提交输入的用户名和密码来执行授权操作。

若验证数据存放在XML文件中，其原理是通过查找user表中的用户名 （username）和密码（password）的结果来进行授权访问，

例存在user.xml文件如下：

```xml
<user>
    <firstname>Ben</firstname>
    <lastname>Elmore</lastname>
    <loginID>abc</loginID>
    <password>test123</password>
</user>
<user>
    <firstname>Shlomy</firstname>
    <lastname>Gantz</lastname>
    <loginID>xyz</loginID>
    <password>123test</password>
</user>
```

则在XPath中其典型的查询语句如下：

```
//users/user[loginID/text()='xyz'and password/text()='123test']
```

## 存在的问题

但是，可以采用如下的方法实施注入攻击，绕过身份验证。

如果用户传入一个 login 和 password，例如 loginID = ‘xyz’ 和 password = ‘123test’，则该查询语句将返回 true。

但如果用户传入类似 ’ or 1=1 or ”=’ 的值，那么该查询语句也会得到 true 返回值，因为 XPath 查询语句最终会变成如下代码：

```
//users/user[loginID/text()=''or 1=1 or ''='' and password/text()='' or 1=1 or ''='']
```

# Xpath注入攻击的防范方法

（1）数据提交到服务器上端，在服务端正式处理这批数据之前，对提交数据的合法性进行验证。

（2）检查提交的数据是否包含特殊字符，对特殊字符进行编码转换或替换、删除敏感字符或字符串。

（3）对于系统出现的错误信息，以IE错误编码信息替换，屏蔽系统本身的出错信息。

（4）参数化XPath查询，将需要构建的XPath查询表达式，以变量的形式表示，变量不是可以执行的脚本。

如下代码可以通过创建保存查询的外部文件使查询参数化：

```
declare variable $loginID as xs：string external；
declare variable $password as xs：string external；
//users/user[@loginID=$loginID and@password= $password]
```

（5）通过MD5、SSL等加密算法，对于数据敏感信息和在数据传输过程中加密，即使某些非法用户通过非法手法获取数据包，看到的也是加密后的信息。

# 其他建议

## 入口把关

在数据处理之前，对用户提交的数据进行验证。

一是要验证是否包含特殊字符，像单双引号这类，可以对这类特殊字符进行编码转换或替换；

二是验证是否包含特定的 XPath 函数，可以过滤掉一些 XPath 函数，以提高安全性，当然了不能以牺牲用户体验或影响用户正常使用为前提。

## 控制出口

在返回数据出口处屏蔽系统本身的错误提示信息。

**尽可能全的用自定义的错误信息替换系统本身的具体的错误信息。**

让攻击者对返回结果无规律可循，能有效防止被盲注。

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[安全测试之XPath注入攻击](https://blog.csdn.net/quiet_girl/article/details/50588130)

[xpath注入详解](https://www.cnblogs.com/bmjoker/p/8861927.html)

[XPath注入：攻击与防御技术](https://cloud.tencent.com/developer/article/1180361)

* any list
{:toc}