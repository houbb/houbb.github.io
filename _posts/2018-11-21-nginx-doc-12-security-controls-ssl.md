---
layout: post
title:  Nginx R31 doc-12-NGINX SSL Termination 安全加密
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

# nginx 系列

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[Nginx 实战-01-nginx ubuntu 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-ubuntu-install)

[Nginx 实战-01-nginx windows 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-windows-install)

[Nginx 实战-02-nginx proxy_pass 服务代理访问 使用笔记 ubuntu nodejs](https://houbb.github.io/2018/11/22/nginx-inaction-02-usage-proxy-pass)

[Nginx 实战-03-nginx 负载均衡](https://houbb.github.io/2018/11/22/nginx-inaction-03-usage-load-balance)

[Nginx 实战-04-nginx 不同的地址访问不同的服务](https://houbb.github.io/2018/11/22/nginx-inaction-04-useage-different-proxy-pass)

[Nginx 实战-05-nginx 反向代理实现域名到指定的 ip](https://houbb.github.io/2018/11/22/nginx-inaction-05-reverse-proxy)

[Nginx-01-聊一聊 nginx](https://houbb.github.io/2018/11/22/nginx-00-chat)

[Nginx-01-Nginx 是什么](https://houbb.github.io/2018/11/22/nginx-01-overview-01)

[Nginx-02-为什么使用 Nginx](https://houbb.github.io/2018/11/22/nginx-01-why-02)

[Nginx-02-Nginx Ubuntu 安装 + windows10 + WSL ubuntu 安装 nginx 实战笔记](https://houbb.github.io/2018/11/22/nginx-02-install-ubuntu-02)

[Nginx-02-基本使用](https://houbb.github.io/2018/11/22/nginx-02-usage-02)

[Nginx-03-Nginx 项目架构](https://houbb.github.io/2018/11/22/nginx-03-struct-03)

[Nginx-04-Docker Nginx](https://houbb.github.io/2018/11/22/nginx-04-docker-04)

[Nginx-05-nginx 反向代理是什么？windows 下如何配置使用 nginx](https://houbb.github.io/2018/11/22/nginx-05-reverse-proxy)

[Nginx-06-nginx 汇总入门介绍](https://houbb.github.io/2018/11/22/nginx-06-all-in-one)



# NGINX SSL 终止

终止来自客户端的 HTTPS 流量，减轻上游的网络和应用服务器的 SSL/TLS 加密的计算负载。

本节描述了如何在 NGINX 和 NGINX Plus 上配置 HTTPS 服务器。

## 设置 HTTPS 服务器

要设置 HTTPS 服务器，在您的 nginx.conf 文件中，将 ssl 参数包含在 server 块中的 listen 指令中，然后指定服务器证书和私钥文件的位置：

```nginx
server {
    listen              443 ssl;
    server_name         www.example.com;
    ssl_certificate     www.example.com.crt;
    ssl_certificate_key www.example.com.key;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    #...
}
```

服务器证书是一个公共实体。它会发送给连接到 NGINX 或 NGINX Plus 服务器的每个客户端。私钥是一个安全实体，应存储在受限制的访问文件中。但是，NGINX 主进程必须能够读取此文件。或者，私钥可以存储在与证书相同的文件中：

```nginx
ssl_certificate     www.example.com.cert;
ssl_certificate_key www.example.com.cert;
```

在这种情况下，重要的是要限制对文件的访问。请注意，虽然在这种情况下证书和密钥存储在一个文件中，但只有证书会发送给客户端。

当建立连接时，ssl_protocols 和 ssl_ciphers 指令可以用来要求客户端仅使用 SSL/TLS 的强版本和密码。

自版本 1.9.1 起，NGINX 使用以下默认值：

```nginx
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers HIGH:!aNULL:!MD5;
```

有时在旧密码的设计中会发现漏洞，我们建议在现代 NGINX 配置中禁用它们（不幸的是，默认配置由于对现有 NGINX 部署的向后兼容性而无法轻易更改）。请注意，CBC 模式密码可能对多种攻击（特别是 BEAST 攻击，如 CVE-2011-3389 中所描述的）容易受到攻击，并且我们建议不要使用 SSLv3，除非您需要支持旧版客户端。

## 客户端证书的 OCSP 验证

NGINX 可以配置为使用在线证书状态协议（OCSP）在客户端提供的 X.509 证书提交时检查其有效性。将客户端证书状态的 OCSP 请求发送到 OCSP 响应器，响应器检查证书的有效性并返回带有证书状态的响应：

- Good - 证书未被吊销
- Revoked - 证书已被吊销
- Unknown - 关于客户端证书的信息不可用

要启用 SSL 客户端证书的 OCSP 验证，请在 ssl_verify_client 指令后面指定 ssl_ocsp 指令，后者启用证书验证：

```nginx
server {
    listen 443 ssl;

    ssl_certificate     /etc/ssl/foo.example.com.crt;
    ssl_certificate_key /etc/ssl/foo.example.com.key;

    ssl_verify_client       on;
    ssl_trusted_certificate /etc/ssl/cachain.pem;
    ssl_ocsp                on; # 启用 OCSP 验证

    #...
}
```

NGINX 将 OCSP 请求发送到嵌入在客户端证书中的 OCSP URI，除非使用 ssl_ocsp_responder 指令定义了不同的 URI。仅支持 http:// OCSP 响应器：

```nginx
#...
ssl_ocsp_responder http://ocsp.example.com/;
#...
```

要在所有工作进程共享的单个内存区域中缓存 OCSP 响应，请使用 ssl_ocsp_cache 指令定义区域的名称和大小。

除非 OCSP 响应中的 nextUpdate 值指定了不同的值，否则响应将被缓存 1 小时：

```nginx
#...
ssl_ocsp_cache shared:one:10m;
#...
```

客户端证书验证的结果可在 $ssl_client_verify 变量中获取，包括 OCSP 失败的原因。


# HTTPS 服务器优化

SSL 操作消耗额外的 CPU 资源。最消耗 CPU 资源的操作是 SSL 握手。有两种方法可以减少每个客户端的这些操作次数：

- 启用 keepalive 连接，通过一个连接发送多个请求
- 重用 SSL 会话参数，避免并行和后续连接的 SSL 握手

会话存储在 SSL 会话缓存中，在工作进程之间共享，并由 ssl_session_cache 指令进行配置。1 兆字节的缓存包含约 4000 个会话。默认缓存超时时间为 5 分钟。可以使用 ssl_session_timeout 指令增加此超时时间。以下是一个针对具有 10 兆字节共享会话缓存的多核系统进行优化的示例配置：

```nginx
worker_processes auto;

http {
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    server {
        listen              443 ssl;
        server_name         www.example.com;
        keepalive_timeout   70;

        ssl_certificate     www.example.com.crt;
        ssl_certificate_key www.example.com.key;
        ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers         HIGH:!aNULL:!MD5;
        #...
    }
}
```

## SSL 证书链

一些浏览器可能会抱怨由知名证书颁发机构签署的证书，而其他浏览器可能会接受该证书而无需任何问题。这是因为颁发机构使用一个中间证书签署了服务器证书，该中间证书不在特定浏览器分发的知名可信证书颁发机构的基础上。在这种情况下，颁发机构提供了一组链接证书，应将其与签名的服务器证书串联起来。服务器证书必须在组合文件中的链接证书之前出现：

```bash
cat www.example.com.crt bundle.crt > www.example.com.chained.crt
```

将得到的文件用于 ssl_certificate 指令：

```nginx
server {
    listen              443 ssl;
    server_name         www.example.com;
    ssl_certificate     www.example.com.chained.crt;
    ssl_certificate_key www.example.com.key;
    #...
}
```

如果服务器证书和 bundle 的顺序被串联错误，NGINX 将无法启动，并显示以下错误消息：

```
SSL_CTX_use_PrivateKey_file(" ... /www.example.com.key") failed
   (SSL: error:0B080074:x509 certificate routines:
    X509_check_private_key:key values mismatch)
```

发生错误是因为 NGINX 尝试使用 bundle 的第一个证书而不是服务器证书的私钥。

通常，浏览器会存储它们收到的中间证书，并由受信任的机构签署。因此，经常使用的浏览器可能已经拥有所需的中间证书，并且可能不会抱怨发送了未链接包的证书。为确保服务器发送完整的证书链，可以使用 openssl 命令行实用程序：

```bash
$ openssl s_client -connect www.godaddy.com:443
...
Certificate chain
 0 s:/C=US/ST=Arizona/L=Scottsdale/1.3.6.1.4.1.311.60.2.1.3=US
     /1.3.6.1.4.1.311.60.2.1.2=AZ/O=GoDaddy.com, Inc
     /OU=MIS Department/CN=www.GoDaddy.com
     /serialNumber=0796928-7/2.5.4.15=V1.0, Clause 5.(b)
   i:/C=US/ST=Arizona/L=Scottsdale/O=GoDaddy.com, Inc.
     /OU=http://certificates.godaddy.com/repository
     /CN=Go Daddy Secure Certification Authority
     /serialNumber=07969287
 1 s:/C=US/ST=Arizona/L=Scottsdale/O=GoDaddy.com, Inc.
     /OU=http://certificates.godaddy.com/repository
     /CN=Go Daddy Secure Certification Authority
     /serialNumber=07969287
   i:/C=US/O=The Go Daddy Group, Inc.
     /OU=Go Daddy Class 2 Certification Authority
 2 s:/C=US/O=The Go Daddy Group, Inc.
     /OU=Go Daddy Class 2 Certification Authority
   i:/L=ValiCert Validation Network/O=ValiCert, Inc.
     /OU=ValiCert Class 2 Policy Validation Authority
     /CN=http://www.valicert.com//emailAddress=info@valicert.com
...
```

在此示例中，www.GoDaddy.com 服务器证书 #0 的主题（“s”）由签发者（“i”）签署，后者本身是证书 #1 的主题。

证书 #1 由其签发者签署，后者本身是证书 #2 的主题。但是，此证书由知名的签发者 ValiCert, Inc. 签署，其证书存储在浏览器中。

如果未添加证书包，只显示服务器证书 (#0)。



# 单一 HTTP/HTTPS 服务器

可以通过在同一个虚拟服务器中放置一个带有 ssl 参数和一个不带有的 listen 指令来配置同时处理 HTTP 和 HTTPS 请求的单个服务器：

```nginx
server {
    listen              80;
    listen              443 ssl;
    server_name         www.example.com;
    ssl_certificate     www.example.com.crt;
    ssl_certificate_key www.example.com.key;
    #...
}
```

在 NGINX 版本 0.7.13 及之前，无法针对单个监听套接字有选择地启用 SSL，如上所示。SSL 只能通过使用 ssl 指令来为整个服务器启用，因此无法设置单个 HTTP/HTTPS 服务器。为了解决这个问题，版本 0.7.14 及更高版本中添加了 listen 指令的 ssl 参数。因此，ssl 指令在版本 0.7.14 及之后被弃用。

## 基于名称的 HTTPS 服务器

当两个或更多个 HTTPS 服务器配置为在单个 IP 地址上监听时，通常会出现一个常见问题：

```nginx
server {
    listen          443 ssl;
    server_name     www.example.com;
    ssl_certificate www.example.com.crt;
    #...
}

server {
    listen          443 ssl;
    server_name     www.example.org;
    ssl_certificate www.example.org.crt;
    #...
}
```

使用这种配置，浏览器接收默认服务器的证书。在这种情况下，无论请求的服务器名称是什么，都是 www.example.com。这是由 SSL 协议本身的行为引起的。SSL 连接在浏览器发送 HTTP 请求之前建立，NGINX 不知道请求的服务器名称。因此，它只能提供默认服务器的证书。

解决此问题的最佳方法是为每个 HTTPS 服务器分配一个单独的 IP 地址：

```nginx
server {
    listen          192.168.1.1:443 ssl;
    server_name     www.example.com;
    ssl_certificate www.example.com.crt;
    #...
}

server {
    listen          192.168.1.2:443 ssl;
    server_name     www.example.org;
    ssl_certificate www.example.org.crt;
    #...
}
```

请注意，还有一些特定的代理设置用于 HTTPS 上游（proxy_ssl_ciphers、proxy_ssl_protocols 和 proxy_ssl_session_reuse），可用于在 NGINX 和上游服务器之间进行 SSL 的精细调整。您可以在 HTTP 代理模块文档中了解更多信息。

## 具有多个名称的 SSL 证书

有其他方法可以在多个 HTTPS 服务器之间共享单个 IP 地址。但是，所有这些方法都有缺点。

一种方法是在 SubjectAltName 证书字段中使用具有多个名称的证书，例如，www.example.com 和 www.example.org。但是，SubjectAltName 字段的长度是有限的。

另一种方法是使用带有通配符名称的证书，例如，*.example.org。通配符证书可保护指定域的所有子域，但仅限于一个级别。

该证书匹配 www.example.org，但不匹配 example.org 或 www.sub.example.org。这两种方法也可以结合使用。

证书可以在 SubjectAltName 字段中包含精确和通配符名称。

例如，example.org 和 *.example.org。

最好将具有多个名称的证书文件及其私钥文件放置在配置的 http 级别，以便它们在所有服务器中继承单个内存副本：

```nginx
ssl_certificate     common.crt;
ssl_certificate_key common.key;

server {
    listen          443 ssl;
    server_name     www.example.com;
    #...
}

server {
    listen          443 ssl;
    server_name     www.example.org;
    #...
}
```

# 服务器名称指示 (SNI)

在单个 IP 地址上运行多个 HTTPS 服务器的更通用的解决方案是 TLS 服务器名称指示 (SNI) 扩展 (RFC 6066)，它允许浏览器在 SSL 握手期间传递请求的服务器名称。通过此解决方案，服务器将知道应该使用哪个证书进行连接。然而，SNI 的浏览器支持有限。目前，它受到以下浏览器版本的支持：

- Opera 8.0
- MSIE 7.0 (但仅限于 Windows Vista 或更高版本)
- Firefox 2.0 和其他使用 Mozilla Platform rv:1.8.1 的浏览器
- Safari 3.2.1 (Windows 版本支持 Vista 或更高版本上的 SNI)
- Chrome (Windows 版本也支持 Vista 或更高版本上的 SNI)
只有域名可以在 SNI 中传递。但是，如果请求包含文字 IP 地址，一些浏览器将传递服务器的 IP 地址作为其名称。最好不要依赖此功能。

为了在 NGINX 中使用 SNI，必须在构建 NGINX 二进制文件的 OpenSSL 库中支持它，以及在运行时与之动态链接的库中支持它。如果 OpenSSL 在构建时使用配置选项 --enable-tlsext，则支持 SNI 自版本 0.9.8f 起。从 OpenSSL 版本 0.9.8j 起，默认启用此选项。如果 NGINX 是使用 SNI 支持构建的，则在使用 -V 开关运行 NGINX 时，NGINX 将显示以下内容：

```bash
$ nginx -V
...
TLS SNI support enabled
...
```

但是，如果启用 SNI 的 NGINX 在运行时动态链接到不支持 SNI 的 OpenSSL 库，则 NGINX 将显示警告：

```bash
NGINX was built with SNI support, however, now it is linked
dynamically to an OpenSSL library which has no tlsext support,
therefore SNI is not available
```

兼容性注意事项：

- 自版本 0.8.21 和 0.7.62 起，可以使用 -V 开关显示 SNI 支持状态。
- 自版本 0.7.14 起支持 listen 指令的 ssl 参数。在版本 0.8.21 之前，它只能与 default 参数一起指定。
- 自版本 0.5.23 起支持 SNI。
- 自版本 0.5.6 起支持共享 SSL 会话缓存。
- 版本 1.9.1 及更高版本：默认的 SSL 协议是 TLSv1、TLSv1.1 和 TLSv1.2（如果 OpenSSL 库支持）。
- 自版本 0.7.65 和 0.8.19 及更高版本起，默认的 SSL 协议是 SSLv3、TLSv1、TLSv1.1 和 TLSv1.2（如果 OpenSSL 库支持）。
- 在版本 0.7.64 和 0.8.18 及更早版本中，默认的 SSL 协议是 SSLv2、SSLv3 和 TLSv1。
- 自版本 1.0.5 起，默认的 SSL 密码是 HIGH:!aNULL:!MD5。
- 自版本 0.7.65 和 0.8.20 及更高版本起，默认的 SSL 密码是 HIGH:!ADH:!MD5。
- 自版本 0.8.19 起，默认的 SSL 密码是 ALL:!ADH:RC4+RSA:+HIGH:+MEDIUM。
- 自版本 0.7.64、0.8.18 和更早版本起，默认的 SSL 密码是 ALL:!ADH:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP。





# 参考资料

https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-http/

* any list
{:toc}