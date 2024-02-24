---
layout: post
title: Apache Calcite doc avatica-06-Security
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 安全性与 Avatica 服务器
## 概述
在客户端和Avatica服务器之间，安全性是一个重要的话题。大多数JDBC驱动程序和数据库都实现了某种级别的身份验证和授权，以限制客户端允许执行的操作。

同样地，Avatica必须限制允许连接和与服务器交互的用户。Avatica主要处理身份验证，而授权则延迟到底层数据库。默认情况下，Avatica不提供任何身份验证。但Avatica确实可以使用Kerberos、HTTP基本身份验证和HTTP摘要执行客户端身份验证。

Avatica提供的身份验证和授权设计用于替代底层数据库提供的身份验证和授权。典型的用户名和密码JDBC属性总是传递到Avatica服务器，这将导致服务器强制执行这些凭据。因此，这里提到的Avatica身份验证类型仅在未使用底层数据库的身份验证和授权功能时才相关。（Kerberos/SPNEGO集成是一个例外，因为模拟功能专门设计用于允许将Kerberos标识传递到数据库 - 如果需要，新的高级实现也可以遵循这种方法）。

## 目录
- [HTTP基本身份验证](#HTTP基本身份验证)
- [HTTP摘要身份验证](#HTTP摘要身份验证)
- [Kerberos与SPNEGO身份验证](#Kerberos与SPNEGO身份验证)
- [自定义身份验证](#自定义身份验证)
- [客户端实现](#客户端实现)
- [TLS](#TLS)

## HTTP基本身份验证
Avatica支持通过HTTP基本身份验证进行身份验证。这是一种基于用户名和密码的简单身份验证方式，在不受信任的网络上操作时最终是不安全的。只有在传输是加密的情况下（例如TLS），基本身份验证才是安全的，因为凭据是以明文形式传递的。这种身份验证是提供的JDBC身份验证的补充。如果凭据已经传递到数据库，则此身份验证是不必要的。

### 启用基本身份验证
```java
String propertiesFile = "/path/to/jetty-users.properties";
// 允许所有角色
String[] allowedRoles = new String[]  {"*"};
// 仅允许特定角色
allowedRoles = new String[] { "users", "admins" };
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withBasicAuthentication(propertiesFile, allowedRoles)
    .build();
```
## HTTP摘要身份验证
Avatica还支持HTTP摘要身份验证。对于Avatica来说，这是一个理想的选择，因为它不需要使用TLS来保护Avatica客户端和服务器之间的通信。它的配置与HTTP基本身份验证非常相似。这种身份验证是提供的JDBC身份验证的补充。如果凭据已经传递到数据库，则此身份验证是不必要的。

### 启用摘要身份验证
```java
String propertiesFile = "/path/to/jetty-users.properties";
// 允许所有角色
String[] allowedRoles = new String[]  {"*"};
// 仅允许特定角色
allowedRoles = new String[] { "users", "admins" };
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withDigestAuthentication(propertiesFile, allowedRoles)
    .build();
```

## Kerberos与SPNEGO身份验证
由于Avatica通过HTTP接口操作，简单和受保护的GSSAPI协商机制（SPNEGO）是一个合乎逻辑的选择。此机制利用“HTTP Negotiate”身份验证扩展与Kerberos密钥分发中心（KDC）通信，以对客户端进行身份验证。

### 在服务器上启用SPNEGO/Kerberos身份验证
Avatica服务器可以通过执行JAAS配置文件或编程方式进行登录来运行。默认情况下，经过身份验证的客户端将以Avatica服务器的kerberos用户执行查询。模拟是一种功能，它使得可以以实际最终用户的身份在服务器上运行操作。

## 编程登录
此方法不需要外部文件配置，只需要一个主体的keytab文件。

```java
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withSpnego("HTTP/host.domain.com@DOMAIN.COM")
    .withAutomaticLogin(
        new File("/etc/security/keytabs/avatica.spnego.keytab"))
    .build();
```

## JAAS配置文件登录
自Avatica 1.20.0起，Jetty已删除了此功能，这意味着Avatica也不支持通过JAAS配置文件登录Avatica服务器。Avatica编程登录是执行此操作的唯一方式。

```java
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withSpnego("HTTP/host.domain.com@DOMAIN.COM")
    .build();
```
## 添加的允许的域
在Avatica 1.20.0之前的版本中，提供了API来指定一组additionalAllowedRealms。尽管其他Avatica集成器可以利用此API，但此API提供的唯一用法是指定应允许对Avatica服务器进行身份验证的其他Kerberos域（不是服务器主体所属的kerberos域）。

## 模拟
模拟是Avatica服务器的一项功能，允许Avatica客户端执行服务器端调用（例如底层JDBC调用）。由于执行此操作的详细信息取决于实际系统的

情况，因此暴露了一个用于下游集成器实现的回调。

## 远程用户提取
在某些情况下，可能希望代表另一个用户执行某些查询。例如，Apache Knox具有一个网关服务，可以作为对后端Avatica服务器的所有请求的代理。在这种情况下，我们不希望将查询作为Knox用户运行，而是作为与Knox通信的真实用户。

目前有两种选项从HTTP请求中提取“真实”用户：

- 来自HTTP请求的经过身份验证的用户，org.apache.calcite.avatica.server.HttpRequestRemoteUserExtractor（默认）
- HTTP查询字符串中参数的值，org.apache.calcite.avatica.server.HttpQueryStringParameterRemoteUserExtractor（例如“doAs”）
Avatica的实现可以使用AvaticaServerConfiguration进行配置，并提供RemoteUserExtractor的实现。上述已列出了两种提供的实现。

## 自定义身份验证
Avatica服务器允许用户通过HTTPServer Builder插入其自定义身份验证机制。如果用户希望结合各种身份验证类型的特性，这将非常有用。示例包括将基本身份验证与模拟结合使用或添加模拟的双向身份验证。在CustomAuthHttpServerTest类中提供了更多示例。

## 客户端实现
许多HTTP客户端库，如Apache Commons HttpComponents，已经支持执行基本、摘要和SPNEGO身份验证。如有疑问，请参考其中一个实现，因为它很可能是正确的。

## SPNEGO
有关手动构建SPNEGO支持的信息，请参阅RFC-4559，其中描述了如何使用“WWW-Authenticate=Negotiate”HTTP头进行身份验证握手，以对客户端进行身份验证。在Avatica 1.20.0之前，对Avatica服务器的每个HTTP调用都会执行此握手。

从Avatica 1.20.0开始，Avatica已更新为使用较新版本的Jetty，该版本包括执行基于SPNEGO的身份验证握手，然后设置一个cookie，该cookie可用于重新识别客户端而无需执行后续的SPNEGO握手。

这是一个值得注意的变化，因为它有效地减少了Avatica客户端必须向服务器发出的HTTP调用数量，通常会导致近2倍的性能提升（因为每个HTTP调用的最低下限是几毫秒）。但是，如果cookie被破坏，另一个客户端可能会以为cookie所设置的用户的身份访问Avatica。因此，重要的是配置Avatica服务器以使用TLS来验证其客户端。

## 基于密码的
对于HTTP基本和摘要身份验证，使用avatica_user和avatica_password属性来标识服务器上的客户端。如果底层数据库（Avatica服务器内部的JDBC驱动程序）需要自己的用户和密码组合，则通过Avatica JDBC驱动程序中的传统“user”和“password”属性进行设置。这也意味着在Avatica中添加HTTP级别的身份验证可能是多余的。

## TLS
部署Avatica服务器时使用TLS是常见做法，就像对任何HTTP服务器一样。为此，请使用方法withTls(File, String, File, String)提供服务器的TLS私钥（即keystore）和证书颁发机构的公钥（即truststore）作为Java密钥存储（JKS）文件，以及密码以验证JKS文件是否未被篡改。

```java
HttpServer server = new HttpServer.Builder()
    .withTLS(new File("/avatica/server.jks"), "MyKeystorePassword",
        new File("/avatica/truststore.jks"), "MyTruststorePassword")
    .build();
```
如果希望将默认的JKS keystore格式更改为例如BCFKS，请使用方法withTls(File, String, File, String, String)提供keystore格式作为第五个参数。

# 参考资料

https://calcite.apache.org/avatica/docs/security.html

* any list
{:toc}