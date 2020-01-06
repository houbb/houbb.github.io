---
layout: post
title: java 发送邮件
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: false
---

# 开启 SMTP

## QQ邮箱

【设置】-【账户】-【POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务】

最下边开启

- POP3/SMTP 服务

- IMAP/SMTP 服务

# 如何使用IMAP服务？

## IMAP是什么？

IMAP，即Internet Message Access Protocol（互联网邮件访问协议），您可以通过这种协议从邮件服务器上获取邮件的信息、下载邮件等。

IMAP与POP类似，都是一种邮件获取协议。
 
## IMAP和POP有什么区别？

POP允许电子邮件客户端下载服务器上的邮件，但是您在电子邮件客户端的操作（如：移动邮件、标记已读等），这是不会反馈到服务器上的，比如：您通过电子邮件客户端收取了QQ邮箱中的3封邮件并移动到了其他文件夹，这些移动动作是不会反馈到服务器上的，也就是说，QQ邮箱服务器上的这些邮件是没有同时被移动的。

但是IMAP就不同了，电子邮件客户端的操作都会反馈到服务器上，您对邮件进行的操作（如：移动邮件、标记已读等），服务器上的邮件也会做相应的动作。

也就是说，IMAP是“双向”的。

同时，IMAP可以只下载邮件的主题，只有当您真正需要的时候，才会下载邮件的所有内容。
 
## 如何使用IMAP服务？

使用IMAP很简单，首先，您需要先在QQ邮箱中启用IMAP功能，然后，配置好客户端，就可以使用了。

# 网易代码实现

网易相对比较简单，直接开启【授权码】

## maven

```xml
<dependencies>
    <dependency>
        <groupId>com.sun.mail</groupId>
        <artifactId>javax.mail</artifactId>
        <version>1.6.2</version>
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```


# 后期特性

## 模板支持

## 读取

对于登录信箱的支持。

可以获取邮箱中的各种信息。

## 避免进入垃圾箱

# 参考资料

[java实现邮箱发送邮件功能](https://www.cnblogs.com/zhangdiIT/p/8184293.html)

[java基础实现邮件发送（以qq和网易为例）](https://www.jianshu.com/p/f487507bc5c6)

[javamail实现解析邮箱收件箱](https://blog.csdn.net/lzy295481710/article/details/51207651)

* any list
{:toc}