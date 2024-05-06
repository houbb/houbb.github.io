---
layout: post
title: web server apache tomcat11-29-Windows Authentication 
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

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

[web server apache tomcat11-15-proxy](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-15-proxy)

[web server apache tomcat11-16-mbean](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-16-mbean)

[web server apache tomcat11-17-default-servlet](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-17-default-servlet)

[web server apache tomcat11-18-clusting 集群](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-18-clusting)

[web server apache tomcat11-19-load balance 负载均衡](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-19-load-balance)

[web server apache tomcat11-20-connectors 连接器](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-20-connectors)

[web server apache tomcat11-21-monitor and management 监控与管理](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-21-monitor)

[web server apache tomcat11-22-logging 日志](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-22-logging)

[web server apache tomcat11-23-APR](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-23-apr)

[web server apache tomcat11-24-Virtual Hosting and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-24-virtual-host)

[web server apache tomcat11-25-Advanced IO and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-25-aio)

[web server apache tomcat11-26-maven jars](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-26-maven-jars)

[web server apache tomcat11-27-Security Considerations](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-27-security)

[web server apache tomcat11-28-Windows Service](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-28-windows-service)

[web server apache tomcat11-29-Windows Authentication](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-29-windows-auth)

[web server apache tomcat11-30-The Tomcat JDBC Connection Pool](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-30-tomcat-jdbc-pool)

[web server apache tomcat11-31-websocket](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-31-websocket)

[web server apache tomcat11-32-rewrite](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-32-rewrite)

[web server apache tomcat11-33-CDI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-33-cdi)

[web server apache tomcat11-34-Ahead of Time compilation support](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-34-aot)


## 概述

集成的Windows身份验证通常在内部网络环境中使用，因为它要求执行身份验证的服务器和被验证的用户属于同一个域。为了让用户自动认证，用户使用的客户端机器也必须属于该域。

有几种选项可以在Apache Tomcat中实现集成的Windows身份验证。它们是：

- 内置的Tomcat支持。
- 使用第三方库，如Waffle。
- 使用支持Windows身份验证的反向代理执行身份验证步骤，如IIS或httpd。

以下部分讨论了每个选项的配置。

### 内置的Tomcat支持

Kerberos（集成的Windows身份验证的基础）需要仔细的配置。如果按照本指南中的步骤执行，将会得到一个可工作的配置。重要的是要严格遵循下面的步骤。在配置中几乎没有灵活性。到目前为止的测试已经知道：

- 用于访问Tomcat服务器的主机名必须与SPN中的主机名完全匹配，否则认证将失败。在这种情况下，调试日志中可能会报告校验和错误。
- 客户端必须认为服务器是本地受信任的内部网络的一部分。
- SPN必须是HTTP/<hostname>，并且在使用的所有地方必须完全相同。
- 端口号不得包含在SPN中。
- 不得将多个SPN映射到一个域用户。
- Tomcat必须以与SPN关联的域帐户或域管理员身份运行。不建议以域管理员用户身份运行Tomcat。
- 惯例是始终使用域名（dev.local）的小写。域名通常不区分大小写。
- 惯例是始终使用Kerberos领域名称（DEV.LOCAL）的大写。领域名称区分大小写。
- 使用ktpass命令时必须指定域。

配置内置Tomcat支持Windows身份验证需要四个组件：域控制器、托管Tomcat的服务器、希望使用Windows身份验证的Web应用程序和客户端机器。以下各节描述了每个组件所需的配置。

在下面的配置示例中使用的三台机器的名称分别是win-dc01.dev.local（域控制器）、win-tc01.dev.local（Tomcat实例）和win-pc01.dev.local（客户端）。它们都是dev.local域的成员。

注意：为了使用下面的步骤中的密码，必须放宽域密码策略。这在生产环境中不建议。

### 域控制器

这些步骤假定服务器已经配置为充当域控制器。将Windows服务器配置为域控制器的步骤不在本说明范围内。配置域控制器以使Tomcat支持Windows身份验证的步骤如下：

1. 创建一个域用户，该用户将映射到Tomcat服务器使用的服务名称。在本说明中，此用户称为tc01，密码为tc01pass。
2. 将服务主体名称（SPN）映射到用户帐户。SPN的形式为<service class>/<host>:<port>/<service name>。本说明中使用的SPN是HTTP/win-tc01.dev.local。要将用户映射到SPN，请运行以下命令：
   ```
   setspn -A HTTP/win-tc01.dev.local tc01
   ```
3. 生成密钥表文件，Tomcat服务器将使用该文件向域控制器进行身份验证。该文件包含了服务提供程序帐户的Tomcat私钥，应当受到保护。要生成文件，请运行以下命令（所有命令放在一行上）：
   ```
   ktpass /out c:\tomcat.keytab /mapuser tc01@DEV.LOCAL
             /princ HTTP/win-tc01.dev.local@DEV.LOCAL
             /pass tc01pass /kvno 0
   ```
4. 创建一个用于客户端的域用户。在本说明中，域用户为test，密码为testpass。

上述步骤已在运行Windows Server 2019 Standard的域控制器上进行了测试，该服务器使用了Windows Server 2016的功能级别，用于森林和域。

### Tomcat实例（Windows服务器）

这些步骤假定Tomcat和Java 11 JDK/JRE已经安装和配置，并且Tomcat正在以tc01@dev.local用户身份运行。配置Tomcat实例以进行Windows身份验证的步骤如下：

1. 将在域控制器上创建的tomcat.keytab文件复制到$CATALINA_BASE/conf/tomcat.keytab。

2. 创建Kerberos配置文件$CATALINA_BASE/conf/krb5.ini。本说明中使用的文件包含以下内容：

```ini
[libdefaults]
default_realm = DEV.LOCAL
default_keytab_name = FILE:c:\apache-tomcat-11.0.x\conf\tomcat.keytab
default_tkt_enctypes = rc4-hmac,aes256-cts-hmac-sha1-96,aes128-cts-hmac-sha1-96
default_tgs_enctypes = rc4-hmac,aes256-cts-hmac-sha1-96,aes128-cts-hmac-sha1-96
forwardable=true

[realms]
DEV.LOCAL = {
        kdc = win-dc01.dev.local:88
}

[domain_realm]
dev.local= DEV.LOCAL
.dev.local= DEV.LOCAL
```

这个文件的位置可以通过设置java.security.krb5.conf系统属性来改变。

创建JAAS登录配置文件$CATALINA_BASE/conf/jaas.conf。本说明中使用的文件内容如下：

```conf
com.sun.security.jgss.krb5.initiate {
    com.sun.security.auth.module.Krb5LoginModule required
    doNotPrompt=true
    principal="HTTP/win-tc01.dev.local@DEV.LOCAL"
    useKeyTab=true
    keyTab="c:/apache-tomcat-11.0.x/conf/tomcat.keytab"
    storeKey=true;
};

com.sun.security.jgss.krb5.accept {
    com.sun.security.auth.module.Krb5LoginModule required
    doNotPrompt=true
    principal="HTTP/win-tc01.dev.local@DEV.LOCAL"
    useKeyTab=true
    keyTab="c:/apache-tomcat-11.0.x/conf/tomcat.keytab"
    storeKey=true;
};
```

这个文件的位置可以通过设置java.security.auth.login.config系统属性来改变。使用的LoginModule是特定于JVM的，因此确保指定的LoginModule与使用的JVM匹配。登录配置的名称必须与身份验证阀值使用的值相匹配。

SPNEGO验证器将与任何Realm一起工作，但如果与JNDI Realm一起使用，默认情况下，JNDI Realm将使用用户的委派凭据连接到Active Directory。如果只需要认证的用户名，则可以使用AuthenticatedUserRealm，它将简单地返回基于认证用户名的Principal，而不具有任何角色。

以上步骤已在运行Windows Server 2019 Standard和AdoptOpenJDK 8u232-b09（64位）的Tomcat服务器上进行了测试。

### Tomcat实例（Linux服务器）

这是使用以下进行测试的：

- Java 1.7.0，更新45，64位
- Ubuntu Server 12.04.3 LTS 64位
- Tomcat 8.0.x（r1546570）

它应该适用于任何Tomcat版本，尽管建议使用最新的稳定版本。

配置与Windows相同，但有以下更改：

- Linux服务器不必成为Windows域的一部分。
- 在krb5.ini和jaas.conf中，密钥表文件的路径应更新为反映Linux服务器上密钥表文件的路径，使用Linux风格的文件路径（例如，/usr/local/tomcat/...）。

### Web应用程序

Web应用程序需要在web.xml中配置使用Tomcat特定的SPNEGO身份验证方法（而不是BASIC等）。与其他身份验证器一样，可以通过明确配置身份验证阀和在阀上设置属性来自定义行为。

### 客户端

客户端必须配置为使用Kerberos身份验证。对于Internet Explorer，这意味着确保Tomcat实例位于“本地内部网络”安全域中，并且已配置（工具 > Internet选项 > 高级）启用集成的Windows身份验证。请注意，如果您将客户端和Tomcat实例使用相同的计算机，那么这将无法正常工作，因为Internet Explorer将使用不受支持的NTLM协议。

### 参考资料

正确配置Kerberos身份验证可能会有些棘手。以下参考资料可能会有所帮助。

Tomcat用户邮件列表上也始终提供建议。

- IIS和Kerberos
- SourceForge上的SPNEGO项目
- Oracle Java GSS-API教程（Java 7）
- Oracle Java GSS-API教程 - 故障排除（Java 7）
- Geronimo用于Windows身份验证的配置
- 在Kerberos交换中选择加密
- 支持的Kerberos密码套件


### 第三方库

#### Waffle

您可以通过Waffle网站找到此解决方案的完整详细信息。其主要特点包括：

- 简单易用的解决方案
- 简单的配置（无需JAAS或Kerberos密钥表配置）
- 使用本机库

#### Spring Security - Kerberos扩展

您可以通过Kerberos扩展网站找到此解决方案的完整详细信息。其主要特点包括：

- 对Spring Security的扩展
- 需要生成Kerberos密钥表文件
- 纯Java解决方案

#### Jespa

您可以通过项目网站找到此解决方案的完整详细信息。其主要特点包括：

- 纯Java解决方案
- 高级Active Directory集成

#### SPNEGO AD项目（SourceForge）

您可以通过项目网站找到此解决方案的完整详细信息。其主要特点包括：

- 纯Java解决方案
- SPNEGO/Kerberos认证器
- Active Directory领域

#### 反向代理

##### Microsoft IIS

将IIS配置为提供Windows身份验证需要三个步骤：

1. 将IIS配置为Tomcat的反向代理（参见IIS Web服务器操作指南）。
2. 配置IIS以使用Windows身份验证。
3. 配置Tomcat以使用IIS提供的身份验证用户信息，方法是将AJP连接器上的tomcatAuthentication属性设置为false。或者，将tomcatAuthorization属性设置为true，以允许IIS进行身份验证，而Tomcat执行授权。

##### Apache httpd

Apache httpd默认不支持Windows身份验证，但可以使用一些第三方模块。其中包括：

- 用于Windows平台的mod_auth_sspi。
- 用于非Windows平台的mod_auth_ntlm_winbind。已知可与32位平台上的httpd 2.0.x一起使用。一些用户报告了与httpd 2.2.x版本和64位Linux版本的稳定性问题。

要配置httpd提供Windows身份验证，需要三个步骤：

1. 将httpd配置为Tomcat的反向代理（参见Apache httpd Web服务器操作指南）。
2. 配置httpd以使用Windows身份验证。
3. 配置Tomcat以使用来自httpd的身份验证用户信息，方法是将AJP连接器上的tomcatAuthentication属性设置为false。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/windows-auth-howto.html

* any list
{:toc}