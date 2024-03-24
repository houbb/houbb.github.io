---
layout: post
title: Web server Apache2 使用入门
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# Apache2

这个故事还是从删除开始。

# 安装常用命令

## 1、移除 Apache

```
$   sudo apt-get remove apache2
$   sudo apt-get --purge remove apache2
$   sudo apt-get autoremove apache2
```

## 2、移除配置文件

```
$   sudo find /etc -name "*apache*" |xargs  rm -rf
$   sudo rm -rf /var/www
$   sudo rm -rf /etc/libapache2-mod-jk
$   sudo rm -rf /etc/init.d/apache2
$   sudo rm -rf /etc/apache2
```

## 3、移除相关依赖

```
dpkg -l |grep apache2|awk '{print $2}'|xargs dpkg -P
```

要彻底移除所有配置文件，需要使用 `purge` - 如果删除了配置文件但只移除了软件包，则会记住这些文件，并且默认情况下不会重新安装丢失的配置文件。

## 4、重新安装 Apache

```
$   sudo apt-get install apache2
```

## 5、使用方法

建议使用 **root** 来重启，否则可能会导致重启失败。

```
产生的启动和停止文件是：/etc/init.d/apache2

启动：sudo apache2ctl -k start

停止：sudo apache2ctl -k stop

重新启动：sudo apache2ctl -k restart

配置文件保存在：/etc/apache2
```





# 提示

## 错误

```
$   sudo service apache2 restart
```

出现错误：

```
Job for apache2.service failed. See "systemctl status apache2.service" and "journalctl -xe" for details.
```

使用

```
$   apache2ctl configtest
```

它会突出显示错误。然后进行更正。


## 重写模式


```
$ sudo a2enmod rewrite
```

- 错误日志

```
/var/log/apache2/error.log
```

# 参考资料

[重写中文版](http://www.111cn.net/phper/apache/54086.htm)

> [删除博客 中文版](http://www.linuxidc.com/Linux/2013-06/85825.htm)

> [重启](http://askubuntu.com/questions/629995/apache-not-able-to-restart)

> [安装中文版](http://www.blogjava.net/duanzhimin528/archive/2010/03/05/314564.html)

* any list
{:toc}