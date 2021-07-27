---
layout: post
title: PHP 入门案例 windows10
date: 2021-07-27 21:01:55 +0800
categories: [PHP]
tags: [php, hello-world, sh]
published: true
---

# php

PHP（全称：PHP：Hypertext Preprocessor，即"PHP：超文本预处理器"）是一种通用开源脚本语言。

# 安装

## 在您自己的 PC 机上建立 PHP

然而，如果您的服务器不支持 PHP，您必须：

- 安装 Web 服务器

- 安装 PHP

- 安装数据库，比如 MySQL

官方 PHP 网站（PHP.net）有 PHP 的安装说明： https://www.php.net/manual/en/install.php

## PHP 服务器组件

对于初学者建议使用集成的服务器组件，它已经包含了 PHP、Apache、Mysql 等服务,免去了开发人员将时间花费在繁琐的配置环境过程。

WampServer

Windows 系统可以使用 WampServer，下载地址：http://www.wampserver.com/，支持32位和64位系统，根据自己的系统选择版本。

WampServer 安装也简单，你只需要一直点击 "Next" 就可以完成安装了。

XAMPP

XAMPP 支持 Mac OS 和 Windows 系统，下载地址：https://www.apachefriends.org/zh_cn/index.html。

# windows10 安装笔记

## 下载

[https://windows.php.net/downloads/releases/php-7.4.21-Win32-vc15-x64.zip](https://windows.php.net/downloads/releases/php-7.4.21-Win32-vc15-x64.zip)

直接下载对应的压缩包，解压到指定位置即可。

比如：`C:\php`

## hello.php

在 `C:\php` 下新建文件 `hello.php` 。

```php
<?php
echo "Hello World!";
?> 
```

## 运行

执行命令

```
php -f hello.php
```

输出：

```
C:\php>php -f hello.php
Hello World!
```

# 参考资料

https://www.runoob.com/php/php-intro.html

* any list
{:toc}