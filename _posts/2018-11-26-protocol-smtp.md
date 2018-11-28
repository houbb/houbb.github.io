---
layout: post
title:  SMTP
date:  2018-11-26 21:17:01 +0800
categories: [Protocol]
tags: [tpc, ip, protocol, sh]
published: false
excerpt: SMTP 邮件传输协议
---

# SMTP

简单邮件传输协议 (Simple Mail Transfer Protocol, SMTP) 是在Internet传输email的事实标准。

SMTP是一个相对简单的基于文本的协议。在其之上指定了一条消息的一个或多个接收者（在大多数情况下被确认是存在的），然后消息文本会被传输。可以很简单地通过telnet程序来测试一个SMTP服务器。SMTP使用TCP端口25。要为一个给定的域名决定一个SMTP服务器，需要使用MX (Mail eXchange) DNS。

在八十年代早期SMTP开始被广泛地使用。当时，它只是作为UUCP的补充，UUCP更适合于处理在间歇连接的机器间传送邮件。相反，SMTP在发送和接收的机器在持续连线的网络情况下工作得最好。

Sendmail是最早使用SMTP的邮件传输代理之一。到2001年至少有50个程序将SMTP实现为一个客户端（消息的发送者）或一个服务器（消息的接收者）。

一些其他的流行的SMTP服务器程序包括了Philip Hazel的exim，IBM的Postfix， D. J. Bernstein的Qmail，以及Microsoft Exchange Server。

由于这个协议开始是基于纯ASCII文本的，它在二进制文件上处理得并不好。诸如MIME的标准被开发来编码二进制文件以使其通过SMTP来传输。

今天，大多数SMTP服务器都支持8位MIME扩展，它使二进制文件的传输变得几乎和纯文本一样简单。

SMTP是一个“推”的协议，它不允许根据需要从远程服务器上“拉”来消息。要做到这点，邮件客户端必须使用POP3或IMAP。另一个SMTP服务器可以使用ETRN在SMTP上触发一个发送。

# 通信举例

在发送方（客户端）和接收方（服务器）间创建连接之后，接下来是一个合法的SMTP会话。

在下面的对话中，所有客户端发送的都以“C:”作为前缀，所有服务器发送的都以“S:”作为前缀。

在多数计算机系统上，可以在发送的机器上使用telnet命令来创建连接，比如：

```
telnet www.example.com 25
```

它打开一个从发送的机器到主机www.example.com的SMTP连接。

```
S: 220 www.example.com ESMTP Postfix
C: HELO mydomain.com
S: 250 Hello mydomain.com
C: MAIL FROM: <sender@mydomain.com>
S: 250 Ok
C: RCPT TO: <friend@example.com>
S: 250 Ok
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: Subject: test message
C: From:""< sender@mydomain.com>
C: To:""< friend@example.com>
C:
C: Hello,
C: This is a test.
C: Goodbye.
C: .
S: 250 Ok: queued as 12345
C: quit
S: 221 Bye
```

虽然是可选的，但几乎所有的客户端都会使用HELO问候消息（而不是上面所示的HELO）来询问服务器支持何种SMTP扩展，邮件的文本体（接着DATA）一般是典型的MIME格式。

# SMTP安全和垃圾邮件

最初的SMTP的局限之一在于它没有对发送方进行身份验证的机制。因此，后来定义了SMTP-AUTH扩展。

尽管有了身份认证机制，垃圾邮件仍然是一个主要的问题。但由于庞大的SMTP安装数量带来的网络效应，大刀阔斧地修改或完全替代SMTP被认为是不现实的。Internet Mail 2000就是一个替代SMTP的建议方案。

因此，出现了一些同SMTP工作的辅助协议。IRTF的反垃圾邮件研究小组正在研究一些建议方案，以提供简单、灵活、轻量级的、可升级的源端认证。最有可能被接受的建议方案是发件人策略框架协议。


# 拓展阅读

[贝叶斯过滤算法](https://houbb.github.io/2018/11/14/bayesian)

# 参考资料

[简单邮件传输协议](https://zh.wikipedia.org/zh-hans/%E7%AE%80%E5%8D%95%E9%82%AE%E4%BB%B6%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)

* any list
{:toc}