---
layout: post
title:  Apache Hadoop v3.3.6-18-Authentication for Hadoop HTTP web-consoles
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

### 引言

本文档描述了如何配置 Hadoop HTTP web 控制台以要求用户身份验证。

默认情况下，Hadoop HTTP web 控制台（ResourceManager、NameNode、NodeManagers 和 DataNodes）允许无需任何形式的身份验证即可访问。

Hadoop HTTP web 控制台可以配置为要求使用 HTTP SPNEGO 协议（由 Firefox 和 Internet Explorer 等浏览器支持）进行 Kerberos 身份验证。

此外，Hadoop HTTP web 控制台支持类似于 Hadoop 伪装/简单身份验证的等效方法。

如果启用了此选项，用户必须在第一次与浏览器的交互中使用 `user.name` 查询字符串参数指定用户名，例如：http://localhost:8088/cluster?user.name=babu。

如果需要为 HTTP web 控制台实现自定义身份验证机制，可以实现一个插件来支持替代的身份验证机制（请参阅 Hadoop hadoop-auth 了解有关编写 AuthenticationHandler 的详细信息）。

接下来的部分将描述如何配置 Hadoop HTTP web 控制台以要求用户身份验证。

### 配置

以下属性应该在集群中所有节点的 `core-site.xml` 文件中。

| 属性名 | 默认值 | 描述 |
| ------ | ------ | ---- |
| hadoop.http.filter.initializers |  | 将 `org.apache.hadoop.security.AuthenticationFilterInitializer` 初始化类添加到此属性。 |
| hadoop.http.authentication.type | simple | 定义用于 HTTP web 控制台的身份验证。支持的值为：simple | kerberos | #AUTHENTICATION_HANDLER_CLASSNAME#。 |
| hadoop.http.authentication.token.validity | 36000 | 表示身份验证令牌在必须续订之前有效的时间（以秒为单位）。 |
| hadoop.http.authentication.token.max-inactive-interval | -1（禁用） | 指定客户端请求之间服务器将使令牌失效的时间（以秒为单位）。 |
| hadoop.http.authentication.signature.secret.file | $user.home/hadoop-http-auth-signature-secret | 用于签署身份验证令牌的签名密钥文件。集群中的每个服务，ResourceManager、NameNode、DataNode 和 NodeManager，应使用不同的密钥。此文件应仅由运行守护程序的 Unix 用户可读。 |
| hadoop.http.authentication.cookie.domain |  | 用于存储身份验证令牌的 HTTP cookie 的域。为了使身份验证在集群中的所有节点上正常工作，必须正确设置域。没有默认值，HTTP cookie 不会具有仅与发出 HTTP cookie 的主机名一起工作的域。 |
| hadoop.http.authentication.cookie.persistent | false（会话 cookie） | 指定 HTTP cookie 的持久性。如果值为 true，则 cookie 是一个持久性 cookie。否则，它是一个会话 cookie。重要提示：当使用 IP 地址时，浏览器会忽略带有域设置的 cookie。为了使此设置正常工作，集群中的所有节点都必须配置为生成带有主机名.域名的 URL。 |
| hadoop.http.authentication.simple.anonymous.allowed | true | 指示在使用 ‘simple’ 身份验证时是否允许匿名请求。 |
| hadoop.http.authentication.kerberos.principal | HTTP/_HOST@$LOCALHOST | 指示在使用 ‘kerberos’ 身份验证时用于 HTTP 终端点的 Kerberos 主体。根据 Kerberos HTTP SPNEGO 规范，主体简称必须是 HTTP。如果存在 _HOST，则将其替换为 HTTP 服务器的绑定地址。 |
| hadoop.http.authentication.kerberos.keytab | $user.home/hadoop.keytab | 包含用于 HTTP 终端点的 Kerberos 主体的凭据的 keytab 文件的位置。 |

### CORS

为了启用跨域支持（CORS），请设置以下配置参数：

在 `core-site.xml` 中的 `hadoop.http.filter.initializers` 中添加 `org.apache.hadoop.security.HttpCrossOriginFilterInitializer`。

您还需要在 `core-site.xml` 中设置以下属性：

| 属性名 | 默认值 | 描述 |
| ------ | ------ | ---- |
| hadoop.http.cross-origin.enabled | false | 启用所有 Web 服务的跨源支持 |
| hadoop.http.cross-origin.allowed-origins | * | 允许的起源列表，以逗号分隔。以 regex: 开头的值被解释为正则表达式。也可以包含通配符 (*)，在这里生成正则表达式，不建议使用，并且仅为向后兼容性提供支持。 |
| hadoop.http.cross-origin.allowed-methods | GET,POST,HEAD | 允许的方法列表，以逗号分隔 |
| hadoop.http.cross-origin.allowed-headers | X-Requested-With,Content-Type,Accept,Origin | 允许的标头列表，以逗号分隔 |
| hadoop.http.cross-origin.max-age | 1800 | 预检请求可以缓存的秒数 |

### Trusted Proxy

Trusted Proxy 添加了支持以最终用户而不是代理用户执行操作的功能。

它从 `doAs` 查询参数中获取最终用户。

为了启用 Trusted Proxy，请在 `core-site.xml` 中的 `hadoop.http.filter.initializers` 中添加 `org.apache.hadoop.security.authentication.server.ProxyUserAuthenticationFilterInitializer`，而不是 `org.apache.hadoop.security.AuthenticationFilterInitializer`。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/HttpAuthentication.html

* any list
{:toc}