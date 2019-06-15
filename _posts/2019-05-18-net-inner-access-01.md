---
layout: post
title: 怎样从外网访问内网服务器
date:  2019-5-10 11:08:59 +0800
categories: [Net]
tags: [net, sh]
published: true
---


# IP 信息

访问网站 [http://www.ip138.com/](http://www.ip138.com/) 可以直接查看。

## 局域网 IP

```
$   ipconfig
```

列表信息如下：

- 连接网线时

```

以太网适配器 VirtualBox Host-Only Network #2:

   连接特定的 DNS 后缀 . . . . . . . :
   本地链接 IPv6 地址. . . . . . . . : fe80::805d:17bd:c70e:c534%3
   IPv4 地址 . . . . . . . . . . . . : 192.168.99.1
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . :
```

- 连接 wifi 时

```
无线局域网适配器 WLAN:

   连接特定的 DNS 后缀 . . . . . . . :
   本地链接 IPv6 地址. . . . . . . . : fe80::48dc:74db:a465:d6e8%19
   IPv4 地址 . . . . . . . . . . . . : 192.168.1.103
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . : 192.168.1.1
```

## 外网 IP

直接百度查询【ip 地址】

可以看到本机的 ip 地址信息（对于外部，不过一般都是临时的。）

## 路由器 IP 

直接登录到 [http://192.168.1.1/](http://192.168.1.1/) 或者是 tp-link 其他。

直接可以看到。

# 路由器转发

## 登录

访问 [http://192.168.1.1/](http://192.168.1.1/)

输入账户信息

## 配置路由表

其实就是端口转发。

但是 windows 中，你可以通过页面操作。

在路由器管理页面，在右侧的菜单中，导航到“转发规则”——“虚拟服务器”一节。

界面右侧则显示“虚拟服务器”的相关设置。

```
使用接口：(默认)

服务端口号：8080   (XX-XX or XX)

IP 地址：   192.168.1.103

协议：TCP

状态：可用

常用服务端口号：HTTP
```

配置好了之后，我们用一个本地的服务测试

# 编写 http 应用

## 容器

你可以使用 tomcat/jetty/jboss 等容器运行 web 项目

或者暂时 main 方法运行 servlet 项目。

为了简单，我选择写一个最简单的 servlet 项目

## simple-servlet

[https://github.com/houbb/simple-servlet](https://github.com/houbb/simple-servlet)

可以参考文章 [Java Servlet 教程-02-hello world](https://houbb.github.io/2018/09/27/java-servlet-tutorial-02-hello)

## 运行并且访问

可以使用下面的地址访问

localhost:8080      直接本地

192.168.1.103:8080 本地的机器 ip

路由器ip:8080

搞定

# 总结

其实就是通过一次 NAT 内网的转换。比较简单。

但是有下面的一些问题需要处理：

（1）wifi 内可以访问，但是 wifi 对于外部没有公网 IP。无法被外部直接访问

（2）IP 地址是否随 wifi 重启，电脑重启发生变化？如何固定？

针对这些问题。我们后续进一步分享。

# 参考资料

[如何把内网机器变成外网可以访问的服务器](https://kangyonggan.com/article/Cf53MAJt714ZKDuuY47Fxw%3D%3D%E5%A6%82%E4%BD%95%E6%8A%8A%E5%86%85%E7%BD%91%E6%9C%BA%E5%99%A8%E5%8F%98%E6%88%90%E5%A4%96%E7%BD%91%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E7%9A%84%E6%9C%8D%E5%8A%A1%E5%99%A8)

[SSH端口转发](https://kangyonggan.com/article/BvCKsIu0NGlYjE5thx0pEg%3D%3DSSH%E7%AB%AF%E5%8F%A3%E8%BD%AC%E5%8F%91)

[SSH免密登录](https://kangyonggan.com/article/mqD2nynfTOJwWbDOtQR6ig%3D%3DSSH%E5%85%8D%E5%AF%86%E7%99%BB%E5%BD%95)

## 其他

[怎样从外网访问内网服务器](https://www.cnblogs.com/devymex/p/4156378.html)

NGROK

teamview

GoToMyCloud

ssh实现内网穿透很好用的，不过需要一个公网的虚拟机的

网上找到了一个开源的Holer不需要公网虚拟机，简单配置一个Holer Access Key也可以实现公网访问内网服务

https://github.com/Wisdom-Projects/holer

## tomcat

[linux下启动tomcat服务的命令是什么](https://www.cnblogs.com/xinxin1994/p/6840357.html)

## 路由器

[[家用路由器] 如何在外网远程管理（控制）路由器？](https://service.tp-link.com.cn/detail_article_2032.html)

[通过路由器实现外网访问局域网的电脑（远程桌面功能）](https://www.cnblogs.com/pertor/p/8979188.html)

[通过路由器设置，让外网可以访问内网电脑应用服务，非常适合在公司访问家里的电脑应用](https://blog.csdn.net/llf046/article/details/79312854)

[路由器端口转发](https://jingyan.baidu.com/article/0aa223754f83c288cc0d64e5.html)

[外网远程控制局域网内主机，路由器端口转发设置](https://blog.csdn.net/liu_shi_jun/article/details/78090345)

* any list
{:toc}