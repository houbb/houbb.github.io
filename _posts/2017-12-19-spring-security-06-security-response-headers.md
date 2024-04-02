---
layout: post
title:  Spring Security 安全响应头配置详解
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

[spring secutity整合springboot入门](https://www.toutiao.com/item/6916894767628468747/)

[spring security 使用 maven 导入汇总](https://www.toutiao.com/item/6917240713151398403/)

[spring security 业界标准加密策略源码详解](https://www.toutiao.com/item/6917261378050982403/)

[Spring Security 如何预防CSRF跨域攻击？](https://www.toutiao.com/item/6917618373924995591/)

这一节我们来学习一下 spring security 的安全响应头信息。

#  默认的安全头

Spring Security提供了一组默认的与安全性相关的HTTP响应标头，以提供安全的默认值。

Spring Security的默认值为包含以下标头：

- 例子41. 默认的安全HTTP响应头

```
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000 ; includeSubDomains     # 只在 HTTPS 请求才会添加
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

这些配置你都可以根据自己的需要修改。

## Cache Control

Spring Security的默认设置是禁用缓存以保护用户的内容。

如果用户进行了身份验证以查看敏感信息然后注销，则我们不希望恶意用户能够单击“后退”按钮查看敏感信息。 

默认情况下发送的缓存控制标头是：

```
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
```

为了默认安全，Spring Security默认添加这些头。 

但是，如果您的应用程序提供了自己的缓存控制标头，Spring Security将会退出。 

这允许应用程序确保可以缓存CSS和JavaScript之类的静态资源。

## Content Type Options

历史上，包括Internet Explorer在内的浏览器都会尝试使用内容嗅探来猜测请求的内容类型。 

这使浏览器可以通过猜测未指定内容类型的资源上的内容类型来改善用户体验。 

例如，如果浏览器遇到一个未指定内容类型的JavaScript文件，它将能够猜测该内容类型然后运行它。

允许上传内容时，还有许多其他事情（即，仅在不同的域中显示文档，确保设置了Content-Type标头，清理文档等）。

**内容嗅探的问题在于，这允许恶意用户使用多义标记（即，可以作为多种内容类型有效的文件）执行XSS攻击**。 

Spring Security通过在HTTP响应中添加以下标头来默认禁用内容嗅探：

```
X-Content-Type-Options: nosniff
```

## HTTP Strict Transport Security (HSTS)

如果省略https协议，则可能会受到中间人攻击。 

根据RFC6797，HSTS标头仅注入到HTTPS响应中。 

为了使浏览器能够确认标头，浏览器必须首先信任对用于建立连接的SSL证书（不仅仅是SSL证书）进行签名的CA。

将站点标记为HSTS主机的一种方法是将主机预加载到浏览器中。 

另一个是将Strict-Transport-Security标头添加到响应中。 

例如，Spring Security的默认行为是添加以下标头，该标头指示浏览器将域视为一年的HSTS主机（一年大约31536000秒）：

```
Strict-Transport-Security: max-age=31536000 ; includeSubDomains ; preload
```

可选的includeSubDomains指令可指示浏览器子域（例如secure.mybank.example.com）也应被视为HSTS域。

可选的preload指令指示浏览器将域作为HSTS域预加载到浏览器中。 

## HTTP公钥固定（HPKP）

但是，**由于HPKP的复杂性，许多专家不再建议使用它，Chrome甚至取消了对它的支持**。

此处不再赘述。

## X-Frame-Options

允许将您的网站添加到框架可能是一个安全问题。 

例如，使用聪明的CSS样式用户可能会被诱骗点击他们不想要的东西。 

例如，登录到其银行的用户可以单击将按钮授予其他用户访问权限。 

这种攻击称为Clickjacking。

有许多方法可以缓解点击劫持攻击。 

例如，要保护旧版浏览器免遭点击劫持攻击，可以使用分帧代码。 

虽然不完美，但是对于传统浏览器而言，破帧代码是最好的选择。

解决点击劫持的更现代方法是使用X-Frame-Options标头。 

默认情况下，Spring Security使用以下标头禁用iframe中的呈现页面：

```
X-Frame-Options: DENY
```

## X-XSS-Protection

一些浏览器内置了对过滤掉反射的XSS攻击的支持。 

这绝非万无一失，但确实有助于XSS保护。

通常默认情况下会启用过滤，因此添加标头通常只会确保标头已启用，并指示浏览器在检测到XSS攻击时应采取的措施。 

例如，过滤器可能会尝试以最小侵入性的方式更改内容以仍然呈现所有内容。 

**有时，这种替换本身可能会成为XSS漏洞。相反，最好是阻止内容，而不要尝试对其进行修复。**

默认情况下，Spring Security使用以下标头阻止内容：

```
X-XSS-Protection: 1; mode=block
```

## Content Security Policy (CSP)

内容安全策略（CSP）是Web应用程序可以用来缓解诸如跨站点脚本（XSS）之类的内容注入漏洞的机制。 

CSP是一种声明性策略，为Web应用程序作者提供了一种工具，可以声明该Web应用程序希望从中加载资源的来源，并最终将这些信息通知客户端（用户代理）。

内容安全策略并非旨在解决所有内容注入漏洞。 

取而代之的是，可以利用CSP帮助减少内容注入攻击所造成的危害。 

作为第一道防线，Web应用程序作者应验证其输入并对输出进行编码。

### 配置

Web应用程序可以通过在响应中包括以下HTTP标头之一来使用CSP：

- 内容安全政策

- 仅内容安全政策报告

这些标头中的每一个都用作将安全策略传递给客户端的机制。

安全策略包含一组安全策略指令，每个指令负责声明对特定资源表示形式的限制。

例如，Web应用程序可以通过在响应中包括以下标头来声明它希望从特定的受信任源中加载脚本：

```
Content-Security-Policy: script-src https://trustedscripts.example.com
```

用户代理会阻止尝试从另一个源（而不是script-src指令中声明的内容）加载脚本。 

另外，如果在安全策略中声明了report-uri指令，则用户代理会将违规行为报告给声明的URL。

例如，如果Web应用程序违反了声明的安全策略，则以下响应标头将指示用户代理将违规报告发送到策略的report-uri指令中指定的URL。

```
Content-Security-Policy: script-src https://trustedscripts.example.com; report-uri /csp-report-endpoint/
```

违规报告是标准JSON结构，可以由Web应用程序自己的API或公共托管的CSP违规报告服务（例如https://report-uri.io/）捕获。

Content-Security-Policy-Report-Only标头为Web应用程序作者和管理员提供了监视安全策略而不是强制执行这些策略的功能。 

该标题通常在试验和/或开发站点的安全策略时使用。 

当某个策略被认为有效时，可以通过使用Content-Security-Policy标头字段来强制实施。

给定以下响应头，该策略声明可以从两个可能的来源之一加载脚本。

```
Content-Security-Policy-Report-Only: script-src 'self' https://trustedscripts.example.com; report-uri /csp-report-endpoint/
```

如果该网站违反了此政策，则通过尝试从evil.com加载脚本，用户代理会将违规报告发送到report-uri指令指定的声明URL，但是仍然允许违规资源加载。

将内容安全策略应用于Web应用程序通常是一项艰巨的任务。

## Referrer Policy

引荐来源网址政策是一种机制，Web应用程序可以利用该机制来管理引荐来源网址字段，该字段包含用户所在的最后一页。

Spring Security的方法是使用Referrer Policy标头，该标头提供了不同的策略：

```
Referrer-Policy: same-origin
```

Referrer-Policy响应标头指示浏览器让目的地知道用户先前所在的源。

## Feature Policy

功能策略是一种机制，它允许Web开发人员有选择地启用，禁用和修改浏览器中某些API和Web功能的行为。

```
Feature-Policy: geolocation 'self'
```

借助功能策略，开发人员可以为浏览器选择一套“策略”，以实施整个站点中使用的特定功能。 

这些政策限制了网站可以访问或修改某些功能的浏览器默认行为的API。

## Clear Site Data

清除站点数据是一种机制，通过该机制，当HTTP响应包含以下标头时，可以删除所有浏览器端数据（cookie，本地存储等）：

```
Clear-Site-Data: "cache", "cookies", "storage", "executionContexts"
```

这是注销时执行的不错的清理操作。

## 自定义头

Spring Security具有使您可以方便地将更常见的安全标头添加到您的应用程序的机制。 

但是，它也提供了挂钩来启用添加自定义标头。

# HTTP

所有基于HTTP的通信，包括静态资源，都应使用TLS保护。

作为一个框架，Spring Security不处理HTTP连接，因此不直接提供对HTTPS的支持。

但是，它确实提供了许多有助于HTTPS使用的功能。

## 重定向到HTTPS

当客户端使用HTTP时，Spring Security可以配置为重定向到Servlet和WebFlux环境到HTTPS。

## 严格的运输安全

Spring Security提供对严格传输安全性的支持，并默认启用它。

## 代理服务器配置

使用代理服务器时，确保已正确配置应用程序很重要。

例如，许多应用程序将具有负载平衡器，该负载平衡器通过将请求转发到位于https：//192.168.1：8080的应用服务器来响应对https://example.com/的请求。

知道负载均衡器存在，并将请求视为客户端请求https：//192.168.1：8080。

要解决此问题，您可以使用RFC 7239指定正在使用负载平衡器。为了使应用程序意识到这一点，您需要配置应用程序服务器以了解 `X-Forwarded` 标头。

例如，Tomcat使用RemoteIpValve，而Jetty使用ForwardedRequestCustomizer。另外，Spring用户可以利用ForwardedHeaderFilter。

Spring Boot用户可以使用server.use-forward-headers属性配置应用程序。有关更多详细信息，请参见Spring Boot文档。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}