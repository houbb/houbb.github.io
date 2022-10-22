---
layout: post
title: Let’s Encrypt 证书免费 HTTPS 部署工具 Certbot 介绍-01-概览
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---


# 说明

本来是不需要学习得。

但是跟着网上的教程部署，发现没有一个走的通的。

应该是每一篇文章都有对应的是时效性，很多方式被官方废弃了。

这里仅做翻译汇总，当做参考。

# Certbot 介绍

Certbot 是 EFF 加密整个互联网的努力的一部分。 

Web 上的安全通信依赖于 HTTPS，它需要使用数字证书，让浏览器验证 Web 服务器的身份（例如，这真的是 google.com 吗？）。 

Web 服务器从称为证书颁发机构 (CA) 的可信第三方获取证书。 Certbot 是一个易于使用的客户端，它从 Let's Encrypt（由 EFF、Mozilla 和其他人发起的开放式证书颁发机构）获取证书，并将其部署到 Web 服务器。

任何经历过建立安全网站的麻烦的人都知道获取和维护证书是多么的麻烦。 

Certbot 和 Let's Encrypt 可以自动消除痛苦，让您通过简单的命令打开和管理 HTTPS。使用 Certbot 和 Let's Encrypt 是免费的，因此无需安排付款。

您如何使用 Certbot 取决于您的 Web 服务器的配置。最好的入门方法是使用我们的交互式指南。它会根据您的配置设置生成说明。在大多数情况下，您需要对 Web 服务器的 root 或管理员访问权限才能运行 Certbot。

Certbot 旨在直接在您的 Web 服务器上运行，而不是在您的个人计算机上。如果您使用的是托管服务并且无法直接访问您的 Web 服务器，则您可能无法使用 Certbot。请咨询您的托管服务提供商以获取有关上传证书或使用 Let's Encrypt 颁发的证书的文档。

Certbot 是 Let’s Encrypt CA（或任何其他使用 ACME 协议的 CA）的全功能、可扩展客户端，可以自动执行获取证书和配置网络服务器以使用它们的任务。此客户端在基于 Unix 的操作系统上运行。

# 什么是证书？

公钥或数字证书（以前称为 SSL 证书）使用公钥和私钥在客户端程序（Web 浏览器、电子邮件客户端等）和服务器之间通过加密的 SSL（安全套接字层）进行安全通信) 或 TLS（传输层安全）连接。

该证书用于加密通信的初始阶段（安全密钥交换）和识别服务器。证书包括有关密钥的信息、有关服务器身份的信息以及证书颁发者的数字签名。如果发起通信的软件信任发行者，并且签名有效，则可以使用密钥与证书标识的服务器进行安全通信。

使用证书是防止“中间人”攻击的好方法，在这种攻击中，您和您认为正在与之交谈的服务器之间的某人能够插入他们自己的（有害）内容。

您可以使用 Certbot 从 EFF、Mozilla 和许多其他赞助商的联合项目 Let's Encrypt 轻松获取和配置免费证书。

# 证书和血统

Certbot 引入了沿袭的概念，它是证书的所有版本以及为该证书从续订到续订维护的 Certbot 配置信息的集合。

每当您更新证书时，Certbot 都会保留相同的配置，除非您明确更改它，例如通过添加或删除域。

如果添加域，则可以将它们添加到现有沿袭或创建新沿袭。

# Links

Documentation: https://certbot.eff.org/docs

Software project: https://github.com/certbot/certbot

Notes for developers: https://certbot.eff.org/docs/contributing.html

Main Website: https://certbot.eff.org

Let’s Encrypt Website: https://letsencrypt.org

Community: https://community.letsencrypt.org

ACME spec: RFC 8555

ACME working area in github (archived): https://github.com/ietf-wg-acme/acme











* any list
{:toc}