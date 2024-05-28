---
layout: post
title:  Nginx R31 doc-14-Dynamic Denylisting of IP Addresses 动态拒绝IP地址 
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以读一下

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)


# 动态拒绝IP地址

使用NGINX Plus的键值存储和API，您可以控制特定客户端IP地址对站点或应用程序的访问权限，创建和维护IP地址的动态拒绝列表或允许列表。

## 概述

在NGINX Plus Release 13（R13）及更高版本中，您可以拒绝一些IP地址，并创建和维护一个包含拒绝IP地址的数据库。

您还可以明确地允许其他IP地址。IP地址数据库通过NGINX Plus API和keyval模块进行管理。

NGINX Plus Release 19（R19）通过将IP地址与子网或网络范围中的任何地址进行匹配，扩展了此功能。

## 先决条件

NGINX Plus Release 13及更高版本，NGINX Plus Release 19及更高版本支持网络范围。

## 设置

首先，启用用于存储拒绝和允许的IP地址列表的数据库。

在NGINX Plus配置文件中，在http上下文中包含keyval_zone指令，以创建一个用于存储键和值的内存区域。此示例指令创建了一个名为one的1兆字节区域。

```nginx
http {
    # ...
    keyval_zone zone=one:1m;
 }
```

要执行IP地址与子网（例如，192.168.13.0/24）的匹配，请指定keyval_zone指令的type=ip参数：

```nginx
http {
    # ...
    keyval_zone zone=one:1m type=ip;
 }
```

请注意，由于type=ip参数还在区域中启用了一个额外的索引，因此keyval_zone的大小也应相应增加。

您还可以使用state参数来创建一个文件，其中存储了键值数据库，因此可以在NGINX Plus重新加载和重新启动时保持。在此示例中，为one.keyval：

```nginx
keyval_zone zone=one:1m state=one.keyval;
```

使用api指令将NGINX Plus API启用为读-写模式：

```nginx
# ...
 server {
     listen 80;
     server_name www.example.com;

     location /api {
         api write=on;
     }
 }
```

我们强烈建议限制对此位置的访问，例如仅允许从本地主机（127.0.0.1）访问，并使用HTTP基本身份验证将使用PATCH、POST和DELETE方法的使用限制为指定的一组用户：

```nginx
# ...
 server {
     listen 80;
     server_name www.example.com;

     location /api {
         api   write=on;

         allow 127.0.0.1;
         deny  all;

         limit_except GET {
             auth_basic "NGINX Plus API";
             auth_basic_user_file /path/to/passwd/file;
         }
     }
 }
```

使用API的POST方法将键值对数据库填充数据，以JSON格式提供数据。您可以像以下示例中那样使用curl命令。如果区域为空，则可以一次输入多个键值对；否则，必须逐个添加对。

```sh
$ curl -X POST -d '{
   "10.0.0.1": "1",
   "10.0.0.2": "1",
   "10.0.0.3": "0",
   "10.0.0.4": "0"
 }' -s http://www.example.com/api/6/http/keyvals/one
```

如果已经指定了IP地址与网络范围的匹配（使用keyval_zone指令的type=ip参数），请以CIDR表示法发送带有网络范围的POST命令：

```sh
$ curl -X POST -d '{
   "192.168.13.0/24": "1"
 }' -s http://www.example.com/api/6/http/keyvals/one
```

通过在http上下文中包含keyval指令，定义如何根据客户端IP地址与键值数据库进行匹配。

该指令利用了标准的NGINX和NGINX Plus变量$remote_addr，该变量自动设置为每个请求的客户端IP地址。

在处理每个请求时，NGINX Plus：

在键值数据库中查找第一个参数（这里是$remote_addr，自动设置为客户端的IP地址）在zone=参数指定的键值数据库中。如果数据库中的键与$remote_addr完全匹配，则将第二个参数（这里是$target）设置为与键对应的值。在我们的示例中，拒绝列表中的地址值为1，允许列表中的地址值为0。

```nginx
http {
     # ...
     keyval_zone zone=one:1m type=ip state=one.keyval;
     keyval $remote_addr $target zone=one; # Client address

 is the key,
                                           # $target is the value;
 }
```

使用if指令创建规则，根据客户端IP地址允许或拒绝访问。通过这个规则，当$target为0时允许访问，当$target为1时拒绝访问：

```nginx
if ($target) {
    return 403;
}
```

此方法允许您动态地创建和更新拒绝IP地址列表，并根据需要阻止或允许特定的客户端IP地址访问您的站点或应用程序。

# 管理键-值数据库

## 使用 API 方法动态更新键-值数据库，无需重新加载 NGINX Plus。

以下示例均操作一个区域，在 http://www.example.com/api/6/http/keyvals/one 可访问。

### 获取区域的所有数据库条目列表：

```bash
curl -X GET 'http://www.example.com/api/6/http/keyvals/one'
```

### 更新现有条目的值（例如，将 IP 地址 10.0.0.4 的访问状态从允许更改为拒绝）：

```bash
curl -X PATCH -d '{"10.0.0.4": "1"}' -s 'http://www.example.com/api/6/http/keyvals/one'
```

### 向已填充的区域添加条目：

```bash
curl -X POST -d '{"10.0.0.5": "1"}' -s 'http://www.example.com/api/6/http/keyvals/one'
```

### 删除条目：

```bash
curl -X PATCH -d '{"10.0.0.4":null}' -s 'http://www.example.com/api/6/http/keyvals/one'
```

## 完整示例

完整的 NGINX Plus 配置：

```nginx
http {
    # ...
    keyval_zone zone=one:1m type=ip state=one.keyval;
    keyval $remote_addr $target zone=one;

    server {
        listen 80;
        server_name www.example.com;

        location /api {
            api   write=on;

            allow 127.0.0.1;
            deny  all;

            limit_except GET {
                auth_basic "NGINX Plus API";
                auth_basic_user_file /path/to/passwd/file;
            }
        }

        if ($target) {
            return 403;
        }
    }
}
```

此配置：

- 创建了一个 1 MB 的 keyval 区域 one，接受网络范围，并创建文件 one.keyval 以使键-值对数据库在 NGINX Plus 重新加载和重启时保持持久化。
- 启用了 NGINX Plus API 写入模式，以便使用 IP 地址填充区域。
- 启用了将 IP 地址 $remote_addr 在键-值数据库中查找的功能，将找到的键的值放入 $target 变量。
- 启用了一个简单的规则来检查结果值：如果 $target 的值为 1（地址在拒绝列表中），则向客户端返回 403（禁止）。

以下 curl 命令将空的 keyval 区域 one 填充了拒绝列表（值为 1）或允许列表（值为 0）的 IP 地址：

```bash
$ curl -X POST -d '{
     "10.0.0.1": "1",
     "192.168.13.0/24": "1",
     "10.0.0.3": "0",
     "10.0.0.4": "0"
}' -s 'http://www.example.com/api/6/http/keyvals/one'
```

## 参见

[使用 NGINX Plus 和 fail2ban 进行动态 IP 拒绝列表](https://www.nginx.com/blog/dynamic-ip-denylisting-with-nginx-plus-and-fail2ban/)

# 参考资料

https://docs.nginx.com/nginx/admin-guide/security-controls/denylisting-ip-addresses/

* any list
{:toc}