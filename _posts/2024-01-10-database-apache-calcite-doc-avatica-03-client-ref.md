---
layout: post
title: Apache Calcite doc avatica-03-Client Reference 客户端引用 
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 客户端参考

Avatica 提供了一个参考实现的客户端，以 Java JDBC 客户端的形式与 Avatica 服务器通过 HTTP 进行交互。

这个客户端可以像任何其他 JDBC 驱动程序一样使用。客户端可以通过 JDBC 连接 URL 来指定许多选项。

作为提醒，Avatica 的 JDBC 连接 URL 是：

```
jdbc:avatica:remote:[option=value[;option=value]]
```

## 选项支持

以下是支持的选项列表：

url
描述：此属性是一个 URL，指向 Avatica 服务器的位置，驱动程序将与之通信。

默认：此属性的默认值为 null。用户必须为此属性提供一个值。

必需：是。

serialization
描述：Avatica 支持多种序列化机制来格式化客户端和服务器之间的数据。此属性用于确保客户端和服务器都使用相同的序列化机制。目前有效的值包括 json 和 protobuf。

默认：默认值为 json。

必需：否。

authentication
描述：Avatica 客户端可以指定它与 Avatica 服务器进行身份验证的方式。希望使用特定身份验证形式的客户端应在此属性中指定适当的值。目前此属性的有效值为：NONE、BASIC、DIGEST 和 SPNEGO。

默认：null（表示“无身份验证”，相当于 NONE）。

必需：否。

timeZone
描述：将用于日期和时间的时区。此属性的有效值由 RFC 822 定义，例如：GMT、GMT-3、EST 或 PDT。

默认：此属性的默认值为 null，将导致 Avatica 驱动程序使用由 JVM 指定的默认时区，通常由用户.timezone 系统属性覆盖。

必需：否。

httpclient_factory
描述：Avatica 客户端是一个“高级”HTTP客户端。因此，有许多库和 API 可用于进行 HTTP 调用。为了确定应使用哪个实现，提供了一个接口 AvaticaHttpClientFactory，用于控制如何选择 AvaticaHttpClient 实现。

默认：AvaticaHttpClientFactoryImpl。

必需：否。

httpclient_impl
描述：使用默认的 AvaticaHttpClientFactoryImpl HTTP 客户端工厂实现时，此工厂应选择适当的客户端实现，以根据给定的客户端配置。此属性可用于覆盖特定的 HTTP 客户端实现。如果未提供，则 AvaticaHttpClientFactoryImpl 将自动选择 HTTP 客户端实现。

默认：null。

必需：否。

avatica_user
描述：这是一个 Avatica 客户端用于向 Avatica 服务器标识自身的用户名。它是传统“用户”JDBC 属性的唯一标识。只有当 Avatica 配置为 HTTP 基本或摘要身份验证时才需要它。

默认：null。

必需：否。

avatica_password
描述：这是 Avatica 客户端用于向 Avatica 服务器标识自身的密码。它是传统“密码”JDBC 属性的唯一标识。只有当 Avatica 配置为 HTTP 基本或摘要身份验证时才需要它。

默认：null。

必需：否。

principal
描述：Kerberos 主体，可由 Avatica JDBC 驱动程序在尝试联系 Avatica 服务器之前自动执行 Kerberos 登录。如果提供了此属性，则还期望提供 keytab，并且 Avatica 服务器配置为 SPNEGO 身份验证。用户可以执行自己的 Kerberos 登录；此选项仅作为方便而提供。

默认：null。

必需：否。

keytab
描述：Kerberos keytab，其中包含执行与主体的 Kerberos 登录所需的秘密材料。该值应该是本地文件系统上普通文件的路径。

默认：null。

必需：否。

truststore
描述：本地文件系统上 Java 密钥库（JKS）文件的路径，其中包含在 TLS 握手中信任的证书颁发机构。仅在使用 HTTPS 时才需要。

默认：null。

必需：否。

truststore_password
描述：truststore 指定的 Java 密钥库文件的密码。

默认：null。

必需：仅在提供了 truststore 时。

keystore_type
描述：truststore 指定的密钥库文件的格式。如果使用非 JKS 格式的密钥库（例如 BCFKS），则需要指定此设置。此设置适用于 keystore 和 truststore 文件。对于未包含在默认 JVM 中的格式，必须安装并将相应的安全提供程序配置到 JVM 中，或将其添加到应用程序类路径并进行配置。

默认：null。

必需：否。

fetch_size
描述：要获取的行数。如果设置了 Statement:setFetchSize，则该值将覆盖 fetch_size。

默认：100。

必需：否。

transparent_reconnection
描述：Java 客户端版本在 1.5.0 到 1.20.0 之间，如果连接从服务器缓存中过期，客户端将透明地重新创建连接对象。此行为破坏了 JDBC 的兼容性，可能导致事务写工作负载的数据丢失，并在 1.21.0 中已删除。将此属性设置为 true 将恢复 1.20.0 的行为。

默认：false。

必需：否。

use_client_side_lb
描述：启用客户端端负载平衡。

默认：false。

必需：否。

lb_urls
描述：以逗号分隔的格式的 URL 列表，“URL1，URL2…URLn”，将由客户端端负载平衡器使用。根据负载平衡策略，负载平衡器从列表中选择一个 URL。

默认：null。

必需：否。

lb_strategy
描述：客户端端负载平衡器要使用的负载平衡策略。它必须是一个完全限定的 Java 类名，实现了 org.apache.calcite

# 参考资料

https://calcite.apache.org/avatica/docs/client_reference.html

* any list
{:toc}