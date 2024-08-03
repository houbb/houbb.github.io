---
layout: post
title:  web privilege security 安全框架-02-Keycloak 介绍
date: 2024-08-04 21:01:55 +0800
categories: [Web]
tags: [web, privilege, safe, web, sf]
published: true
---

# 开源身份和访问管理

以最小的努力为应用程序添加认证并保护服务。无需处理存储用户或认证用户的问题。

Keycloak提供用户联合、强大认证、用户管理、细粒度授权等。

## 帮助和文档

* [文档](https://www.keycloak.org/documentation.html)
* [用户邮件列表](https://groups.google.com/d/forum/keycloak-user) - 用于Keycloak的帮助和一般问题的邮件列表

## 报告安全漏洞

如果您发现了安全漏洞，请查看[如何正确报告的说明](https://github.com/keycloak/keycloak/security/policy)。

## 报告问题

如果您认为在Keycloak中发现了一个缺陷，请打开[一个问题](https://github.com/keycloak/keycloak/issues)。
请记得提供一个好的摘要、描述以及重现问题的步骤。

## 入门

要运行Keycloak，请从我们的[网站](https://www.keycloak.org/downloads.html)下载发行版。解压并运行：

    bin/kc.[sh|bat] start-dev

或者，您可以使用Docker镜像，运行：

    docker run quay.io/keycloak/keycloak start-dev

更多细节请参考[Keycloak文档](https://www.keycloak.org/documentation.html)。

## 从源代码构建

要从源代码构建，请参考[构建和使用代码库](docs/building.md)指南。

### 测试

要运行测试，请参考[运行测试](docs/tests.md)指南。

### 编写测试

要编写测试，请参考[编写测试](docs/tests-development.md)指南。

## 贡献

在贡献Keycloak之前，请阅读我们的[贡献指南](CONTRIBUTING.md)。Keycloak项目的参与受[CNCF行为准则](https://github.com/cncf/foundation/blob/main/code-of-conduct.md)管理。

## 其他Keycloak项目

* [Keycloak](https://github.com/keycloak/keycloak) - Keycloak服务器和Java适配器
* [Keycloak QuickStarts](https://github.com/keycloak/keycloak-quickstarts) - 快速开始使用Keycloak
* [Keycloak Node.js Connect](https://github.com/keycloak/keycloak-nodejs-connect) - Keycloak的Node.js适配器

## 许可

* [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

请注意，由于网络原因，上述网页的解析并没有成功。如果需要该网页的解析内容，请检查网页链接的合法性，并在可能的情况下重试。如果不需要链接解析，上述翻译应该已经回答了您的问题。


## 特性

单点登录
一次登录，即可访问多个应用程序

标准协议
OpenID Connect、OAuth 2.0 和 SAML 2.0

集中管理
适用于管理员和用户

适配器
轻松保护应用程序和服务

LDAP 和活动目录
连接到现有的用户目录

社交登录
轻松启用社交登录

身份代理
OpenID Connect 或 SAML 2.0 身份提供者

高性能
轻量级、快速且可扩展

集群
用于可扩展性和可用性

主题
自定义外观和感觉

可扩展性
通过代码自定义

密码策略
自定义密码策略


# chat

## 详细介绍一下 Keycloak


* any list
{:toc}