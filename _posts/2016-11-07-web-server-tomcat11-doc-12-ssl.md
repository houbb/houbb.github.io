---
layout: post
title: web server apache tomcat11-12-SSL/TLS Configuration How-To
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...

## 快速开始

下面的描述使用变量名 `$CATALINA_BASE` 来引用大多数相对路径解析的基本目录。如果您尚未通过设置 `CATALINA_BASE` 目录来为 Tomcat 配置多个实例，则 `$CATALINA_BASE` 将设置为 `$CATALINA_HOME` 的值，即您安装 Tomcat 的目录。

要在 Tomcat 上安装和配置 SSL/TLS 支持，您需要遵循以下简单步骤。有关更多信息，请阅读本指南的其余部分。

### 创建密钥库文件

执行以下命令创建用于存储服务器的私钥和自签名证书的密钥库文件：

Windows:

```bash
"%JAVA_HOME%\bin\keytool" -genkey -alias tomcat -keyalg RSA
```

Unix:

```bash
$JAVA_HOME/bin/keytool -genkey -alias tomcat -keyalg RSA
```

并指定密码值为 "changeit"。

### 修改配置文件

取消注释 `$CATALINA_BASE/conf/server.xml` 中的 "SSL HTTP/1.1 Connector" 条目，并按照下面的配置部分所述进行修改。

### SSL/TLS 简介

传输层安全性（TLS）及其前身安全套接字层（SSL）是使 Web 浏览器和 Web 服务器能够通过安全连接进行通信的技术。这意味着发送的数据由一方加密，然后传输，然后由另一方在处理之前解密。这是一个双向过程，这意味着服务器和浏览器都会在发送数据之前对所有流量进行加密。

SSL/TLS 协议的另一个重要方面是认证。这意味着在您首次尝试通过安全连接与 Web 服务器通信时，该服务器将向您的 Web 浏览器提供一组凭据，以证明该站点是谁以及它声称的内容。在某些情况下，服务器还可能要求您的 Web 浏览器提供证书，以证明您是您所声称的人。这称为 "客户端认证"，尽管在实践中，这更多用于业务对业务（B2B）交易而不是与个人用户。大多数启用 SSL 的 Web 服务器不会请求客户端认证。

### 证书

为了实施 SSL，Web 服务器必须为接受安全连接的每个外部接口（IP 地址）准备一个相关联的证书。这个设计背后的理论是服务器应该提供某种合理的保证，证明其所有者是您认为的那个人，特别是在接收任何敏感信息之前。虽然证书的广泛解释超出了本文档的范围，但将证书视为一个 Internet 地址的 "数字护照"。它说明了该站点与哪个组织相关联，以及关于站点所有者或管理员的一些基本联系信息。

这个证书由其所有者以密码形式签名，因此其他人很难伪造。为了使证书在访客的浏览器中无警告地工作，它需要由受信任的第三方签名。这些被称为证书颁发机构（CA）。要获得签名的证书，您需要选择一个 CA，并按照您选择的 CA 提供的说明来获取您的证书。有各种各样的 CA 可供选择，包括一些免费提供证书的 CA。

Java 提供了一个相对简单的命令行工具，称为 keytool，可以轻松创建 "自签名" 证书。自签名证书只是用户生成的未经 well-known CA 签名的证书，因此不真正保证是真实的。虽然自签名证书可能对某些测试场景有用，但对于任何形式的生产使用都不合适。

### 运行 SSL 的一般提示

在使用 SSL 保护网站时，重要的是确保网站使用的所有资源都通过 SSL 提供，以防止攻击者通过在 JavaScript 文件中注入恶意内容等方式绕过安全性。为了进一步增强网站的安全性，您应该考虑使用 HSTS 标头。它允许您向浏览器通信，指示您的站点应始终通过 https 访问。

在安全连接上使用基于名称的虚拟主机需要谨慎配置单个证书中指定的名称，或者在支持 Server Name Indication（SNI）的 Tomcat 8.5 及更高版本中，其中可用。SNI 允许将具有不同名称的多个证书关联到单个 TLS 连接器。

### 配置

#### 准备证书密钥库

Tomcat 目前仅支持 JKS、

PKCS11 或 PKCS12 格式的密钥库。JKS 格式是 Java 的标准 "Java KeyStore" 格式，是 keytool 命令行实用程序创建的格式。此工具包含在 JDK 中。PKCS12 格式是一种互联网标准，可以通过 OpenSSL 和 Microsoft 的 Key-Manager 等方式进行操作。

密钥库中的每个条目都由别名字符串标识。虽然许多密钥库实现以不区分大小写的方式处理别名，但也可用区分大小写的实现。例如，PKCS11 规范要求别名区分大小写。为了避免与别名的大小写敏感性相关的问题，不建议使用仅在大小写方面有所不同的别名。要导入现有证书到 JKS 密钥库，请阅读（在您的 JDK 文档包中）有关 keytool 的文档。请注意，OpenSSL 通常会在密钥之前添加可读的注释，但 keytool 不支持。因此，如果您的证书在密钥数据之前有注释，请在使用 keytool 导入证书之前将其删除。

要使用 OpenSSL 将现有 CA 签名的证书导入 PKCS12 密钥库，您可以执行类似于以下命令：

```bash
openssl pkcs12 -export -in mycert.crt -inkey mykey.key
                       -out mycert.p12 -name tomcat -CAfile myCA.crt
                       -caname root -chain
```

对于更高级的情况，请参阅 OpenSSL 文档。

要从头开始创建一个新的 JKS 密钥库，其中包含一个单独的自签名证书，请从终端命令行执行以下操作：

Windows:

```bash
"%JAVA_HOME%\bin\keytool" -genkey -alias tomcat -keyalg RSA
```

Unix:

```bash
$JAVA_HOME/bin/keytool -genkey -alias tomcat -keyalg RSA
```

（RSA 算法应优先选择作为安全算法，这还确保与其他服务器和组件的一般兼容性。）

此命令将在您运行它的用户的主目录中创建一个名为 `.keystore` 的新文件。要指定不同的位置或文件名，请将 `-keystore` 参数添加到上面显示的 keytool 命令，后面跟上到您密钥库文件的完整路径名。您还需要在后面描述的 `server.xml` 配置文件中反映这个新位置。例如：

Windows:

```bash
"%JAVA_HOME%\bin\keytool" -genkey -alias tomcat -keyalg RSA
  -keystore \path\to\my\keystore
```

Unix:

```bash
$JAVA_HOME/bin/keytool -genkey -alias tomcat -keyalg RSA
  -keystore /path/to/my/keystore
```

执行此命令后，您首先会提示输入密钥库密码。Tomcat 使用的默认密码是 "changeit"（全部小写），尽管您可以指定自定义密码。您还需要在后面描述的 `server.xml` 配置文件中指定自定义密码。

接下来，您将提示提供有关此证书的一般信息，例如公司、联系人姓名等。将显示此信息以便尝试访问您应用程序中的安全页面的用户，请确保此处提供的信息与他们预期的相匹配。

最后，您将被提示输入密钥密码，这是专门为此证书（而不是存储在同一密钥库文件中的任何其他证书）的密码。keytool 提示将告诉您，按 ENTER 键会自动使用与密钥库相同的密码来使用密钥。您可以自由选择相同的密码或选择自定义密码。如果您选择与密钥库密码不同的密码，则还需要在后面描述的 `server.xml` 配置文件中指定自定义密码。

如果一切顺利，现在您有一个带有证书的密钥库文件，该证书可供您的服务器使用。

#### 编辑 Tomcat 配置文件

Tomcat 可以使用两种不同的 SSL 实现：

- 作为 Java 运行时的一部分提供的 JSSE 实现
- 使用 OpenSSL 的 JSSE 实现

确切的配置细节取决于使用的是哪种实现。如果通过指定通用 `protocol="HTTP/1.1"` 配置连接器，则 Tomcat 使用的实现将自动选择。

如果需要，可以通过在连接器的 `protocol` 属性中指定类名来避免自动选择实现。

要定义 Java（JSSE）连接器，无论 APR 库是否已加载，请使用以下之一：

```xml
<!-- 在端口 8443 上定义 HTTP/1.1 连接器，JSSE NIO 实现 -->
<Connector protocol="org.apache.coyote.http11.Http11NioProtocol"
           sslImplementationName="org.apache.tomcat.util.net.jsse.JSSEImplementation"
           port="8443" .../>

<!-- 在端口 8443 上定义 HTTP/1.1 连接器，JSSE NIO2 实现 -->
<Connector protocol="org.apache.coyote.http11.Http11Nio2Protocol"
           sslImplementationName="org.apache.tomcat.util.net.jsse.JSSEImplementation"
           port="8443" .../>
```

如果需要，也可以显式配置 OpenSSL JSSE 实现。如果安装了 Tomcat Native 库或 Java 22，则使用 `sslImplementationName` 属性可以启用它。当使用 OpenSSL JSSE 实现时，配置可以使用 JSSE 属性或 OpenSSL 属性，但不得在相同的 `SSLHostConfig` 或 `Connector` 元素中混合使用来自两种类型的属性。

使用 Tomcat Native：

```xml
<!-- 在端口 8443 上定义 HTTP/1.1 连接器，JSSE NIO 实现和 OpenSSL -->
<Connector protocol="org.apache.coyote.http11.Http11NioProtocol" port="8443"
           sslImplementationName="org.apache.tomcat.util.net.openssl.OpenSSLImplementation"
           .../>
```

使用 Java 22 FFM API：

```xml
<!-- 在

端口 8443 上定义 HTTP/1.1 连接器，JSSE NIO 实现和 OpenSSL -->
<Connector protocol="org.apache.coyote.http11.Http11NioProtocol" port="8443"
           sslImplementationName="org.apache.tomcat.util.net.openssl.panama.OpenSSLImplementation"
           .../>
```

或者，可以向服务器添加侦听器以在不必在每个 SSLHostConfig 或 Connector 元素上添加 `sslImplementationName` 属性的情况下在所有连接器上启用 OpenSSL。

使用 Tomcat Native：

```xml
<Listener className="org.apache.catalina.core.AprLifecycleListener"/>
```

使用 Java 22 FFM API：

```xml
<Listener className="org.apache.catalina.core.OpenSSLLifecycleListener"/>
```

侦听器的 `SSLRandomSeed` 属性允许指定一个熵源。生产系统需要可靠的熵源，但熵可能需要大量时间才能收集，因此测试系统可以使用无阻塞熵源，如 "/dev/urandom"，这将允许 Tomcat 更快地启动。

最后一步是在 `$CATALINA_BASE/conf/server.xml` 文件中配置连接器，其中 `$CATALINA_BASE` 表示 Tomcat 实例的基目录。默认的 `server.xml` 文件中包含了一个 SSL 连接器的示例 `<Connector>` 元素。要配置使用 JSSE 并且使用 JSSE 配置样式的 SSL 连接器，您需要删除注释并编辑它，使其看起来像这样：

```xml
<!-- 在端口 8443 上定义一个 SSL Coyote HTTP/1.1 连接器 -->
<Connector
    protocol="org.apache.coyote.http11.Http11NioProtocol"
    port="8443"
    maxThreads="150"
    SSLEnabled="true">
  <SSLHostConfig>
    <Certificate
      certificateKeystoreFile="${user.home}/.keystore"
      certificateKeystorePassword="changeit"
      type="RSA"
      />
    </SSLHostConfig>
</Connector>
```

OpenSSL 配置样式使用许多 SSL 设置的不同属性，特别是密钥和证书。APR 配置样式的示例是：

```xml
<!-- 在端口 8443 上定义一个 SSL Coyote HTTP/1.1 连接器 -->
<Connector
    protocol="org.apache.coyote.http11.Http11NioProtocol"
    port="8443"
    maxThreads="150"
    SSLEnabled="true" >
  <SSLHostConfig>
    <Certificate
        certificateKeyFile="conf/localhost-rsa-key.pem"
        certificateFile="conf/localhost-rsa-cert.pem"
        certificateChainFile="conf/localhost-rsa-chain.pem"
        type="RSA"
        />
  </SSLHostConfig>
</Connector>
```

配置选项和关于哪些属性是强制的信息，都记录在 HTTP 连接器配置参考的 SSL 支持部分中。Tomcat 使用所有 TLS 连接器支持任一配置样式（JSSE 或 OpenSSL）。

`port` 属性是 Tomcat 将侦听安全连接的 TCP/IP 端口号。您可以将其更改为任何您希望的端口号（例如，默认的 https 通信端口 443）。但是，在许多操作系统上运行 Tomcat 的端口号低于 1024 需要特殊设置（超出了本文档的范围）。

如果在这里更改了端口号，则还应更改非 SSL 连接器上指定的 `redirectPort` 属性的值。这允许 Tomcat 自动重定向试图访问具有指定了 SSL 为必需的安全约束的页面的用户，如 Servlet 规范所要求的那样。

完成这些配置更改后，您必须像平常一样重新启动 Tomcat，然后您应该可以运行了。您应该能够通过 SSL 访问 Tomcat 支持的任何 Web 应用程序。例如，请尝试：

```
https://localhost:8443/
```

您应该看到通常的 Tomcat 启动页面（除非您已修改了 ROOT Web 应用程序）。如果这不起作用，请参阅以下部分中的一些故障排除提示。

#### 安装来自证书颁发机构的证书

要获取并安装来自证书颁发机构（如 verisign.com、thawte.com 或 trustcenter.de）的证书，请阅读上一节，然后按照以下说明操作：

#### 创建本地证书签名请求（CSR）

为了从您选择的证书颁发机构那里获得证书，您必须创建一个名为证书签名请求（CSR）的请求。该 CSR 将由证书颁发机构用于创建将您的网站标识为 "安全" 的证书。要创建 CSR，请执行以下步骤：

- 创建本地自签名证书（如上一节中所述）：

```bash
keytool -genkey -alias tomcat -keyalg RSA
    -keystore <your_keystore_filename>
```

（在某些情况下，您必须在 "姓" 字段中输入您网站的域名（即 www.myside.org），以便创建可用的证书。）
然后使用以下命令创建 CSR：

```bash
keytool -certreq -keyalg RSA -alias tomcat -file certreq.csr
    -keystore <your_keystore_filename>
```

现在您有一个名为 certreq.csr 的文件，您可以将其提交给证书颁发机构（查看证书颁发机构网站上关于如何执行此操作的文档）。

机构将使用此 CSR 创建您的证书。

#### 从证书颁发机构获得证书

在收到您的 CSR 后，证书颁发机构将向您发送一个文件（通常以 PEM 格式），其中包含您的新证书。

#### 安装证书

一旦您从证书颁发机构那里收到了新的证书文件，您可以将其添加到您的密钥库文件中。首先，请将文件转换为与密钥库兼容的格式，然后再将其添加到密钥库中。这是一个示例命令序列，假设您收到的文件是以 PEM 格式编写的。

要将 PEM 文件转换为 PKCS12 文件，请执行以下操作：

```bash
openssl pkcs12 -export -in cert.pem -out cert.p12 -name tomcat
```

然后将 PKCS12 文件导入到您的密钥库中：

```bash
keytool -importkeystore -deststorepass <your_keystore_password>
    -destkeypass <your_keystore_password>
    -destkeystore <your_keystore_filename> -srckeystore cert.p12
    -srcstoretype PKCS12 -srcstorepass <password_used_when_creating_pkcs12> -alias tomcat
```

现在，您的密钥库中应该包含来自证书颁发机构的证书。现在可以在 Tomcat 配置文件中使用该密钥库（如上所示）。

### 最后的步骤

安装证书后，请确保您的用户将 `$CATALINA_BASE/conf/server.xml` 文件和您的密钥库文件保持安全。私钥库文件中的私钥和密钥库密码都是敏感信息，不应与他人共享。

完成所有配置更改后，必须重新启动 Tomcat 服务器才能使更改生效。您应该能够通过安全的 HTTPS 连接访问您的 Tomcat 服务器了。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/ssl-howto.html

* any list
{:toc}