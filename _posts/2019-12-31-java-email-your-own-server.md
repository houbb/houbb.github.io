---
layout: post
title: java 搭建属于自己的邮件服务器
date:  2019-12-25 16:57:12 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 目的

有时候处于安全的考虑，我们需要有属于自己的邮件服务器。

使用本地服务器搭建一个邮箱，这样就可以脱离qq或者其他企业邮箱的限制，即可以做到节省成本，又可以得到收发邮件的一个保密性。

# 准备：

一个顶级域名：国内国外的都可以，当然也可以不需要顶级域名，前提是这个域名需要解析到你的服务器ip上

frp 内网穿透（包含公网ip的服务器）：这个方便本地调试（如果不是很懂也可以查看上篇微信中内网穿透文章）

邮件服务器：Linux上可以用 [iredmail](https://docs.iredmail.org/install.iredmail.on.rhel-zh_CN.html)，Windows是可以用hMailServer，由于我为了方便测试，所以我用的是Windows版本的。

Linux安装方式（这里大家如果是用的Linux服务器可以用这个）

## 1. 安装软件

下载Windows版本的hMailServer

https://www.hmailserver.com/download

## 2. 设置

（1）输入邮件登录密码

（2）输入域名

安装完成之后连接本地服务器：

然后添加一个域名

```
emailforall.com
```

（3）添加账户

在这个域名下面添加账户

（4）服务器状态

status 这一栏

确定是 running 即可

## 3. 邮箱测试

此处使用 foxmail 进行测试

[foxmail](https://www.foxmail.com/)

TODO:

# 参考资料

[使用EwoMail搭建属于自己的个人邮件服务器——超详细图文教程](https://blog.csdn.net/qq_41692307/article/details/88318365)

[为什么我们不推荐运行自己的邮件服务器](https://blog.csdn.net/zstack_org/article/details/55189501)

[企业最需要的邮件服务器5大功能模块](https://blog.csdn.net/Nasi0755/article/details/98726944)

[搭建私人邮件服务器](https://blog.csdn.net/qq_41248529/article/details/90515770)

[Windows Server2012搭建邮件服务器](https://blog.csdn.net/qwertyupoiuytr/article/details/64227398)

[搭建邮件服务器，过程非常简单](https://blog.csdn.net/gyxuehu/article/details/78500645)

[搭建个人搭建邮件服务器历程](https://blog.csdn.net/BO688/article/details/105343528)

* any list
{:toc}