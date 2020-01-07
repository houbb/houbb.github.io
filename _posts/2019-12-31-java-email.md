---
layout: post
title: java 发送邮件
date:  2019-12-25 16:57:12 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 如何使用IMAP服务？

首先介绍一些邮件发送的基础知识，如果你已经知道可以跳过。

直接到 [Email](#email) 邮件发送实现的部分。

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

# 开启 SMTP 服务
 
## QQ 邮箱

【设置】-【账户】-【POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务】

最下边开启

- POP3/SMTP 服务

- IMAP/SMTP 服务

## 网易 163 邮箱

![image](https://user-images.githubusercontent.com/18375710/71801983-7804d900-3097-11ea-871d-8a26501e15b0.png)

网易相对比较简单，直接开启【授权码】

# Email

[Email](https://github.com/houbb/email) 是基于 java 实现的发送邮件的工具包，力求简单优雅。

## 创作缘由

看了各种 email 工具感觉没有想象中方便。

就自己实现一个，后续会陆续加入新的特性。

## 特性

- Fluent 流式语法

- 网易 163 邮箱的发送支持

- 支持发送给多个收件人，多个（秘密）抄送者

# 快速开始

## 环境要求

jdk7+

maven 3.x+

## 引入

```xml
<plugin>
    <groupId>com.github.houbb</groupId>
    <artifactId>email</artifactId>
    <version>0.0.2</version>
</plugin>
```

## 发送邮件

此处密码为网易邮箱对应的授权码。

```java
EmailBs.auth("xxx@163.com", "xxx")
        .content("自定义内容")
        .sendTo("xxx@yy.com");
```

这里会通过 `xxx@163.com` 发送给 `xxx@yy.com` 一封邮件。

邮件标题默认为无标题，内容为你的自定义内容。

你可以通过指定，配置更多丰富的特性。

## 方法列表

| 方法 | 说明 |
|:---|:---|
| auth(username, password) | username 为邮箱名称，password 为对应密码 |
| content(subject, content) | subject 为邮件标题，content 为邮件内容 |
| content(content) | subject 默认为 "无标题"，content 为邮件内容 |
| sendTo(toArray) | toArray 为收件人列表 |
| cc(ccArray) | ccArray 为抄送人列表 |
| bcc(bccArray) | bccArray 为秘密抄送人列表 |

### 使用的例子

你可以指定多个收件人以及抄送人。

示例代码如下：

```java
EmailBs.auth("xxx@163.com", "xxx")
       .content("自定义主题", "自定义内容")
       .cc("抄送者1@xx.com", "抄送者2@xx.com")
       .bcc("秘密抄送者1@xx.com", "秘密抄送者2@xx.com")
       .sendTo("收件人1@xx.com", "收件人2@xx.com");
```

# 后续特性

- 支持常见邮箱

- 支持邮件模板

# 参考资料

[java实现邮箱发送邮件功能](https://www.cnblogs.com/zhangdiIT/p/8184293.html)

[java基础实现邮件发送（以qq和网易为例）](https://www.jianshu.com/p/f487507bc5c6)

[javamail实现解析邮箱收件箱](https://blog.csdn.net/lzy295481710/article/details/51207651)

* any list
{:toc}