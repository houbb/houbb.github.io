---
layout: post
title: web server apache tomcat11-07-Realm Configuration How-To
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


## 概述

本文档描述了如何配置 Tomcat 支持容器管理的安全性，方法是连接到现有的用户名、密码和用户角色的“数据库”。

如果您正在使用一个或多个包含 `<security-constraint>` 元素和定义用户需要如何进行身份验证的 `<login-config>` 元素的 Web 应用程序，则需要关注此文档。

如果您没有使用这些功能，可以安全地跳过本文档。

有关容器管理安全性的基本背景信息，请参阅 Servlet 规范（版本 2.4），第 12 节。

有关使用 Tomcat 的单点登录功能（允许用户一次在与虚拟主机关联的所有 Web 应用程序中进行身份验证）的信息，请参阅此处。

## 概览

### 什么是 Realm？

Realm 是一个包含用户名和密码的“数据库”，用于标识 Web 应用程序（或一组 Web 应用程序）的有效用户，以及与每个有效用户关联的角色列表的枚举。您可以将角色视为类似于 Unix-like 操作系统中的组，因为特定的 Web 应用程序资源的访问权限授予所有具有特定角色的用户（而不是列举关联用户名的列表）。特定用户可以与其用户名关联任意数量的角色。

尽管 Servlet 规范描述了应用程序声明其安全需求的可移植机制（在 web.xml 部署描述符中），但没有一个可移植的 API 定义了 Servlet 容器与关联的用户和角色信息之间的接口。然而，在许多情况下，将 Servlet 容器“连接”到已存在于生产环境中的某个现有的身份验证数据库或机制是可取的。因此，Tomcat 定义了一个 Java 接口（org.apache.catalina.Realm），可以由“插件”组件来实现以建立这种连接。提供了六个标准的插件，支持连接到各种认证信息源：

- DataSourceRealm - 访问存储在关系数据库中的身份验证信息，通过命名的 JNDI JDBC DataSource 访问。
- JNDIRealm - 访问存储在基于 LDAP 的目录服务器中的身份验证信息，通过 JNDI 提供程序访问。
- UserDatabaseRealm - 访问存储在 UserDatabase JNDI 资源中的身份验证信息，该资源通常由 XML 文档（conf/tomcat-users.xml）支持。
- MemoryRealm - 访问存储在内存对象集合中的身份验证信息，该集合是从 XML 文档（conf/tomcat-users.xml）初始化的。
- JAASRealm - 通过 Java 认证和授权服务（JAAS）框架访问身份验证信息。

您也可以编写自己的 Realm 实现，并将其与 Tomcat 集成。要这样做，您需要：

- 实现 org.apache.catalina.Realm 接口，
- 将编译后的 Realm 放置在 $CATALINA_HOME/lib 中，
- 如下所述在 "配置 Realm" 部分中声明您的 Realm，
- 将您的 Realm 声明给 MBeans 描述符。

### 配置 Realm

在深入了解标准 Realm 实现的细节之前，重要的是要了解 Realm 如何通常配置。通常情况下，您将向 conf/server.xml 配置文件添加一个 XML 元素，看起来像这样：

```xml
<Realm className="...这个实现的类名"
       ...此实现的其他属性.../>
```

`<Realm>` 元素可以嵌套在以下任何一个 Container 元素内。

Realm 元素的位置直接影响该 Realm 的“范围”（即哪些 Web 应用程序将共享相同的身份验证信息）：

- 在 `<Engine>` 元素内部 - 此 Realm 将在所有虚拟主机上的所有 Web 应用程序之间共享，除非它被位于下属 `<Host>` 或 `<Context>` 元素内部的 Realm 元素所覆盖。

- 在 `<Host>` 元素内部 - 此 Realm 将在此虚拟主机的所有 Web 应用程序之间共享，除非它被位于下属 `<Context>` 元素内部的 Realm 元素所覆盖。

- 在 `<Context>` 元素内部 - 此 Realm 将仅用于此 Web 应用程序。


## 普通特性

### 摘要密码

对于标准的 Realm 实现中的每一个用户密码（默认情况下），密码是以明文形式存储的。在许多环境中，这是不希望的，因为身份验证数据的偶然观察者可以收集足够的信息成功登录，并冒充其他用户。为了避免这个问题，标准实现支持摘要用户密码的概念。这允许密码的存储版本被编码（以一种不易逆转的形式），但 Realm 实现仍然可以用于认证。

当标准的 Realm 通过检索存储的密码并将其与用户提供的值进行比较来进行身份验证时，您可以通过在您的 `<Realm>` 元素内部放置一个 CredentialHandler 元素来选择摘要密码。支持其中一种算法 SSHA、SHA 或 MD5 的简单选择是使用 MessageDigestCredentialHandler。

此元素必须配置为 java.security.MessageDigest 类支持的摘要算法之一（SSHA、SHA 或 MD5）。当您选择此选项时，存储在 Realm 中的密码内容必须是由指定算法摘要的明文版本。

当 Realm 的 authenticate() 方法被调用时，由用户指定的（明文）密码本身也会被相同的算法摘要，并将结果与 Realm 返回的值进行比较。相等的匹配意味着原始密码的明文版本与用户提供的密码相同，因此应授权该用户。

计算明文密码的摘要值有两种方便的技术支持：

- 如果您正在编写需要动态计算摘要密码的应用程序，请调用 org.apache.catalina.realm.RealmBase 类的静态 Digest() 方法，将明文密码、摘要算法名称和编码作为参数传递。此方法将返回摘要密码。
- 如果您想要执行命令行实用程序来计算摘要密码，只需执行以下命令：
  ```
  CATALINA_HOME/bin/digest.[bat|sh] -a {algorithm} {cleartext-password}
  ```
  并将此明文密码的摘要版本返回到标准输出。

如果在使用摘要密码与 DIGEST 身份验证时，生成摘要所使用的明文不同，并且摘要必须使用不带盐的 MD5 算法的一个迭代。在上述示例中，{cleartext-password} 必须替换为 {username}:{realm}:{cleartext-password}。例如，在开发环境中，这可能采用 testUser:Authentication required:testPassword 的形式。{realm} 的值来自 web 应用程序的 `<login-config>` 中的 `<realm-name>` 元素。

如果未在 web.xml 中指定，则使用默认值 Authentication required。

支持使用平台默认编码以外的编码的用户名和/或密码，使用以下命令：

```
CATALINA_HOME/bin/digest.[bat|sh] -a {algorithm} -e {encoding} {input}
```

但是，需要小心确保正确传递输入给摘要器。摘要器返回 {input}:{digest}。如果输入在返回中出现损坏，则摘要将无效。

摘要的输出格式为 {salt}${iterations}${digest}。如果盐长度为零，并且迭代次数为一，则输出简化为 {digest}。

CATALINA_HOME/bin/digest.[bat|sh] 的完整语法为：

```
CATALINA_HOME/bin/digest.[bat|sh] [-a <algorithm>] [-e <encoding>]
        [-i <iterations>] [-s <salt-length>] [-k <key-length>]
        [-h <handler-class-name>] <credentials>
```

- -a - 用于生成存储凭据的算法。如果未指定，则处理程序的默认值将被使用。如果未指定处理程序和算法，则默认使用 SHA-512。
- -e - 用于可能需要字节到/从字符的转换的编码。如果未指定，则使用系统编码（Charset#defaultCharset()）。
- -i - 在生成存储凭据时要使用的迭代次数。如果未指定，则使用 CredentialHandler 的默认值。
- -s - 生成并存储作为凭据一部分的盐的长度（以字节为单位）。如果未指定，则使用 CredentialHandler 的默认值。
- -k - 在生成凭证时创建的密钥的长度（以位为单位），如果有的话。如果未指定，则使用 CredentialHandler 的默认值。
- -h - 要使用的 CredentialHandler 的完全限定类名。如果未指定，则将依次测试内置处理程序（MessageDigestCredentialHandler 然后是 SecretKeyCredentialHandler），并使用第一个接受指定算法的处理程序。

### 示例应用程序

Tomcat 附带的示例应用程序包含一个受安全约束保护的区域，使用基于表单的登录。要访问它，请将您的浏览器指向 http://localhost:8080/examples/jsp/security/protected/，并使用默认的 UserDatabaseRealm 中描述的用户名和密码之一登录。

### 管理器应用程序

如果您希望使用管理器应用程序在运行中的 Tomcat 安装中部署和取消部署应用程序，则必须将 "manager-gui" 角色添加到所选 Realm 实现中的至少一个用户名中。这是因为管理器 Web 应用程序本身使用的安全约束要求角色 "manager-gui" 来访问该应用程序的 HTML 接口中的任何请求 URI。

出于安全原因，默认 Realm 中没有任何用户名（即使用 conf/tomcat-users.xml）被分配 "manager-gui" 角色。因此，在 Tomcat 管理员专门为一个或多个用户分配此角色之前，没有人将能够使用此应用程序的功能。

### Realm 日志记录

Realm 记录的调试和异常消息将由与该 Realm 的容器

相关联的日志记录配置记录：其周围的 Context、Host 或 Engine。

## 标准 Realm 实现

### DataSourceRealm

#### 简介

DataSourceRealm 是 Tomcat Realm 接口的实现，它通过 JNDI 命名的 JDBC DataSource 查找存储在关系型数据库中的用户。有很大的配置灵活性，可以使您适应现有的表和列名称，只要您的数据库结构符合以下要求：

- 必须有一个表，下文称为用户表，该表包含每个此 Realm 应该识别的有效用户的一行。
- 用户表必须至少包含两列（如果您的现有应用程序需要，则可能包含更多列）：
  - 用户名：Tomcat 在用户登录时识别的用户名。
  - 密码：Tomcat 在用户登录时识别的密码。此值可以是明文或摘要形式 - 有关更多信息，请参阅下文。

- 必须有一个表，下文称为用户角色表，该表包含分配给特定用户的每个有效角色的一行。用户可以具有零个、一个或多个有效角色。
- 用户角色表必须至少包含两列（如果您的现有应用程序需要，则可能包含更多列）：
  - 用户名：Tomcat 中识别的用户名（与用户表中指定的值相同）。
  - 角色名：与此用户关联的有效角色的角色名称。

#### 快速开始

要设置 Tomcat 使用 DataSourceRealm，您需要按照以下步骤进行操作：

1. 如果尚未这样做，请在数据库中创建符合上述要求的表和列。
2. 为 Tomcat 配置一个数据库用户名和密码，该用户名和密码具有对上述表的至少只读访问权限。（Tomcat 永远不会尝试向这些表中写入。）
3. 为您的数据库配置一个 JNDI 命名的 JDBC DataSource。有关如何配置 JNDI 命名的 JDBC DataSource 的信息，请参阅 JNDI DataSource 示例 How-To。请务必根据定义 JNDI DataSource 的位置设置 Realm 的 localDataSource 属性。
4. 在 $CATALINA_BASE/conf/server.xml 文件中设置一个 <Realm> 元素，如下所述。
5. 如果 Tomcat 已经运行，请重新启动它。

#### Realm 元素属性

要配置 DataSourceRealm，您将创建一个 <Realm> 元素，并将其嵌套在您的 $CATALINA_BASE/conf/server.xml 文件中，如上所述。DataSourceRealm 的属性在 Realm 配置文档中定义。

#### 示例

创建所需表的示例 SQL 脚本可能如下所示（根据您的特定数据库调整语法）：

```sql
create table users (
  user_name         varchar(15) not null primary key,
  user_pass         varchar(15) not null
);

create table user_roles (
  user_name         varchar(15) not null,
  role_name         varchar(15) not null,
  primary key (user_name, role_name)
);
```

以下是一个示例，使用名为 "authority" 的 MySQL 数据库，配置了上述表，并使用名称为 "java:/comp/env/jdbc/authority" 的 JNDI JDBC DataSource 访问。

```xml
<Realm className="org.apache.catalina.realm.DataSourceRealm"
   dataSourceName="jdbc/authority"
   userTable="users" userNameCol="user_name" userCredCol="user_pass"
   userRoleTable="user_roles" roleNameCol="role_name"/>
```

#### 其他注意事项

DataSourceRealm 操作遵循以下规则：

- 当用户首次尝试访问受保护资源时，Tomcat 将调用此 Realm 的 authenticate() 方法。因此，您直接对数据库进行的任何更改（新用户、更改密码或角色等）都将立即反映出来。

- 一旦用户已经经过身份验证，用户（及其关联的角色）将在 Tomcat 中缓存，直到用户登录结束为止（对于基于表单的身份验证，即直到会话超时或失效；对于基本身份验证，即直到用户关闭其浏览器）。缓存的用户不会在会话序列化中保存和恢复。已经经过身份验证的用户的数据库信息的任何更改都不会在该用户下次登录之前反映出来。
- 管理用户和角色表中的信息是您自己应用程序的责任。Tomcat 不提供任何内置功能来维护用户和角色。

## 快速开始

要设置 Tomcat 使用 JNDIRealm，您需要按照以下步骤进行操作：

1. 确保您的目录服务器配置了与上述要求相匹配的模式。
2. 如有必要，为 Tomcat 配置一个用户名和密码，该用户名和密码具有对上述信息的只读访问权限。（Tomcat 永远不会尝试修改此信息。）
3. 在您的 `$CATALINA_BASE/conf/server.xml` 文件中设置一个 `<Realm>` 元素，如下所述。
4. 如果 Tomcat 已经运行，请重新启动它。

## Realm 元素属性

要配置 JNDIRealm，您将在 `$CATALINA_BASE/conf/server.xml` 文件中创建一个 `<Realm>` 元素并将其嵌套在其中，如上所述。JNDIRealm 的属性在 Realm 配置文档中定义。

## 示例

在您的目录服务器中创建适当的模式是本文档范围之外的，因为它对每个目录服务器实现都是独特的。在下面的示例中，我们将假设您正在使用 OpenLDAP 目录服务器的发行版（版本 2.0.11 或更高版本），可以从 [https://www.openldap.org](https://www.openldap.org) 下载。假设您的 `slapd.conf` 文件包含以下设置（以及其他设置）：

```conf
database ldbm
suffix dc="mycompany",dc="com"
rootdn "cn=Manager,dc=mycompany,dc=com"
rootpw secret
```

假设连接 URL 为 `connectionURL` 的目录服务器在与 Tomcat 相同的计算机上运行。有关配置和使用 JNDI LDAP 提供程序的更多信息，请参阅 [Oracle 官方文档](http://docs.oracle.com/javase/7/docs/technotes/guides/jndi/index.html)。

接下来，假设此目录服务器已经填充了如下所示的条目（以 LDIF 格式）：

```ldif
# Define top-level entry
dn: dc=mycompany,dc=com
objectClass: dcObject
dc:mycompany

# Define an entry to contain people
# searches for users are based on this entry
dn: ou=people,dc=mycompany,dc=com
objectClass: organizationalUnit
ou: people

# Define a user entry for Janet Jones
dn: uid=jjones,ou=people,dc=mycompany,dc=com
objectClass: inetOrgPerson
uid: jjones
sn: jones
cn: janet jones
mail: j.jones@mycompany.com
userPassword: janet

# Define a user entry for Fred Bloggs
dn: uid=fbloggs,ou=people,dc=mycompany,dc=com
objectClass: inetOrgPerson
uid: fbloggs
sn: bloggs
cn: fred bloggs
mail: f.bloggs@mycompany.com
userPassword: fred

# Define an entry to contain LDAP groups
# searches for roles are based on this entry
dn: ou=groups,dc=mycompany,dc=com
objectClass: organizationalUnit
ou: groups

# Define an entry for the "tomcat" role
dn: cn=tomcat,ou=groups,dc=mycompany,dc=com
objectClass: groupOfUniqueNames
cn: tomcat
uniqueMember: uid=jjones,ou=people,dc=mycompany,dc=com
uniqueMember: uid=fbloggs,ou=people,dc=mycompany,dc=com

# Define an entry for the "role1" role
dn: cn=role1,ou=groups,dc=mycompany,dc=com
objectClass: groupOfUniqueNames
cn: role1
uniqueMember: uid=fbloggs,ou=people,dc=mycompany,dc=com
```

以下是对提供的示例 Realm 元素的解释：

1. **原始配置**：

```xml
<Realm   className="org.apache.catalina.realm.JNDIRealm"
     connectionURL="ldap://localhost:389"
       userPattern="uid={0},ou=people,dc=mycompany,dc=com"
          roleBase="ou=groups,dc=mycompany,dc=com"
          roleName="cn"
        roleSearch="(uniqueMember={0})"
/>
```

- 此配置假设用户使用他们的 `uid`（例如 `jjones`）登录应用程序。
- 它使用匿名连接（`connectionURL`）到 LDAP 服务器。
- `userPattern` 用于形成用户的可分辨名称（DN）。
- 角色基于 `roleSearch` 进行搜索，并使用 `roleBase` 和 `roleName` 进行限制。

2. **更新后的配置**：

```xml
<Realm   className="org.apache.catalina.realm.JNDIRealm"
     connectionURL="ldap://localhost:389"
          userBase="ou=people,dc=mycompany,dc=com"
        userSearch="(mail={0})"
      userRoleName="memberOf"
          roleBase="ou=groups,dc=mycompany,dc=com"
          roleName="cn"
        roleSearch="(uniqueMember={0})"
/>
```

- 现在，假设用户在登录时需要输入他们的电子邮件地址而不是他们的用户ID。在这种情况下，域必须搜索用户的条目。

- 此外，假设除了组条目外，您还希望使用用户条目的属性来保存角色。现在 Janet Jones 的条目可能如下所示。

- 当 Janet Jones 以 "j.jones@mycompany.com" 登录时，域将在目录中搜索具有该值作为其邮件属性的唯一条目，并尝试绑定到具有给定密码的目录，作为 `uid=jjones,ou=people,dc=mycompany,dc=com`。如果身份验证成功，他们将被分配三个角色："role2" 和 "role3"，这些是其目录条目中 "memberOf" 属性的值，以及 "tomcat"，这是他们是成员的唯一组条目中 "cn" 属性的值。

- 最后，要通过从目录检索密码并在域中进行本地比较来验证用户，您可以使用以下域配置。


以下是关于 `UserDatabaseRealm` 的附加说明：

**UserDatabaseRealm 的操作规则**：

1. 当用户首次尝试访问受保护的资源时，Tomcat 将调用此 Realm 的 `authenticate()` 方法。因此，您对目录所做的任何更改（新用户、更改密码或角色等）将立即反映出来。
2. 一旦用户已经通过身份验证，用户（及其相关角色）将在 Tomcat 中缓存，直到用户的登录结束。（对于基于 FORM 的身份验证，这意味着直到会话超时或失效；对于基本身份验证，这意味着直到用户关闭其浏览器）。缓存的用户不会跨会话序列化进行保存和恢复。对于已经通过身份验证的用户的目录信息的任何更改将不会反映出来，直到用户下次登录为止。

**UserDatabaseRealm 的其他注意事项**：

**UserDatabaseRealm** 是使用 JNDI 资源来存储用户信息的 Tomcat Realm 接口的实现。默认情况下，JNDI 资源由 XML 文件支持。它不适用于大规模生产使用。在启动时，UserDatabaseRealm 从 XML 文档（默认情况下，此文档从 `$CATALINA_BASE/conf/tomcat-users.xml` 加载）加载所有用户及其对应的角色的信息。用户、密码和角色都可以动态编辑，通常通过 JMX。更改可能会被保存，并将反映在 XML 文件中。

**Realm 元素属性**：

要配置 `UserDatabaseRealm`，您将在 `$CATALINA_BASE/conf/server.xml` 文件中创建一个 `<Realm>` 元素，并将其嵌套在其中。有关 `UserDatabaseRealm` 的属性，请参阅 Realm 配置文档。

**用户文件格式**：

对于基于 XML 文件的 UserDatabase，用户文件使用与 MemoryRealm 相同的格式。

**示例**：

Tomcat 的默认安装配置了一个 UserDatabaseRealm，嵌套在 `<Engine>` 元素内，因此适用于所有虚拟主机和 Web 应用程序。

`conf/tomcat-users.xml` 文件的默认内容如下所示：

```xml
<tomcat-users>
  <user username="tomcat" password="tomcat" roles="tomcat" />
  <user username="role1"  password="tomcat" roles="role1"  />
  <user username="both"   password="tomcat" roles="tomcat,role1" />
</tomcat-users>
```

**其他说明**：

- 当 Tomcat 首次启动时，它会从用户文件中加载所有已定义用户及其相关信息。对该文件中数据的更改将在 Tomcat 重新启动之前不会被识别。更改可以通过 UserDatabase 资源进行。Tomcat 提供了可通过 JMX 访问的 MBean 用于此目的。

- 当用户首次尝试访问受保护的资源时，Tomcat 将调用此 Realm 的 `authenticate()` 方法。

- 一旦用户已通过身份验证，用户将在 Tomcat 中关联到用户的登录期间。（对于基于 FORM 的身份验证，这意味着直到会话超时或失效；对于基本身份验证，这意味着直到用户关闭其浏览器）。然而，用户角色仍将反映 UserDatabase 的内容，与其他领域不同。如果用户从数据库中删除，将被视为没有角色。可以使用 UserDatabaseRealm 的 `useStaticPrincipal` 属性来缓存用户以及其所有角色。缓存的用户不会跨会话序列化进行保存和恢复。当用户的主体对象因任何原因进行序列化时，它将被替换为具有不再反映数据库内容的角色的静态等效对象。

以下是关于 `MemoryRealm` 的说明：

**MemoryRealm 简介**：

MemoryRealm 是 Tomcat Realm 接口的简单演示实现。它不适用于生产环境使用。在启动时，MemoryRealm 从 XML 文档（默认情况下，该文档从 `$CATALINA_BASE/conf/tomcat-users.xml` 加载）加载所有用户及其相关角色的信息。对该文件中数据的更改将在 Tomcat 重新启动之前不会被识别。

**Realm 元素属性**：

要配置 MemoryRealm，您将在 `$CATALINA_BASE/conf/server.xml` 文件中创建一个 `<Realm>` 元素，并将其嵌套在其中。有关 MemoryRealm 的属性，请参阅 Realm 配置文档。

**用户文件格式**：

用户文件（默认情况下为 `conf/tomcat-users.xml`）必须是一个 XML 文档，具有根元素 `<tomcat-users>`。根元素内部嵌套着每个有效用户的 `<user>` 元素，由以下属性组成：

- name：用户登录时必须使用的用户名。
- password：用户登录时必须使用的密码（如果在 `<Realm>` 元素上未设置 digest 属性，则以明文形式，否则根据相关方法进行适当的摘要）。
- roles：与该用户关联的角色名称的逗号分隔列表。

**其他说明**：

**MemoryRealm 的操作规则**：

1. 当 Tomcat 首次启动时，它会从用户文件中加载所有已定义用户及其相关信息。对该文件中数据的更改将在 Tomcat 重新启动之前不会被识别。
2. 当用户首次尝试访问受保护的资源时，Tomcat 将调用此 Realm 的 `authenticate()` 方法。
3. 一旦用户已通过身份验证，用户将在 Tomcat 中关联到用户的登录期间。（对于基于 FORM 的身份验证，这意味着直到会话超时或失效；对于基本身份验证，这意味着直到用户关闭其浏览器）。然而，用户角色仍将缓存在 Tomcat 中，直到用户的登录结束。缓存的用户不会跨会话序列化进行保存和恢复。

**管理用户文件中的信息是您应用程序的责任。Tomcat 不提供任何内置功能来维护用户和角色。**

以下是关于 `JAASRealm` 的说明：

**JAASRealm 简介**：

JAASRealm 是 Tomcat Realm 接口的一种实现，通过 Java 认证和授权服务 (Java Authentication & Authorization Service, JAAS) 框架对用户进行身份验证。JAAS 现在作为标准 Java SE API 的一部分提供。

使用 JAASRealm 可以让开发人员将几乎任何可能的安全域与 Tomcat 的 CMA（Container Managed Authentication）结合起来。

JAASRealm 是基于 JAAS 的 J2EE 认证框架的 Tomcat 原型，用于 J2EE v1.4，基于 JCP 规范请求 196 来增强容器管理的安全性并推广“可插入”的身份验证机制，其实现将是独立于容器的。

基于 JAAS 登录模块和主体（请参阅 javax.security.auth.spi.LoginModule 和 javax.security.Principal），您可以开发自己的安全机制或包装另一个第三方机制，以与 Tomcat 实现的 CMA 集成。

**快速开始**：

要设置 Tomcat 使用带有自定义 JAAS 登录模块的 JAASRealm，请按照以下步骤进行操作：

1. 根据 JAAS 编写自己的 LoginModule、User 和 Role 类（请参阅 JAAS 认证教程和 JAAS 登录模块开发者指南），以便由 JAAS 登录上下文（javax.security.auth.login.LoginContext）管理。在开发您的 LoginModule 时，请注意，目前 JAASRealm 的内置 CallbackHandler 仅识别 NameCallback 和 PasswordCallback。
2. 虽然在 JAAS 中没有指定，但您应该创建单独的类来区分用户和角色，扩展 javax.security.Principal，以便 Tomcat 可以区分从您的登录模块返回的 Principals 哪些是用户，哪些是角色（请参阅 org.apache.catalina.realm.JAASRealm）。不过，始终将第一个返回的 Principal 视为用户 Principal。
3. 将编译后的类放在 Tomcat 的类路径上。
4. 为 Java 设置一个 login.config 文件（请参阅 JAAS LoginConfig 文件），并告诉 Tomcat 在哪里找到它，例如通过设置环境变量：JAVA_OPTS=$JAVA_OPTS -Djava.security.auth.login.config==$CATALINA_BASE/conf/jaas.config。
5. 在 web.xml 中为要保护的资源配置安全约束。
6. 在 server.xml 中配置 JAASRealm 模块。
7. 如果 Tomcat 已在运行，请重新启动它。

**Realm 元素属性**：

要配置 JAASRealm，请像步骤 6 中那样创建一个 `<Realm>` 元素，并将其嵌套在 `<Engine>` 节点内的 `$CATALINA_BASE/conf/server.xml` 文件中。JAASRealm 的属性在 Realm 配置文档中定义。

**示例**：

以下是一个示例，展示了您的 server.xml 片段应该如何配置：

```xml
<Realm className="org.apache.catalina.realm.JAASRealm"
        appName="MyFooRealm"
        userClassNames="org.foobar.realm.FooUser"
        roleClassNames="org.foobar.realm.FooRole"/>
```

由您的登录模块负责创建和保存表示用户的 User 和 Role 对象（javax.security.auth.Subject 的 Principals）。如果您的登录模块既不创建用户对象，也不抛出登录异常，那么 Tomcat 的 CMA 将中断，并且您将留在 `http://localhost:8080/myapp/j_security_check` URI 或其他未指定的位置。

**附加说明**：

- 当用户首次尝试访问受保护的资源时，Tomcat 将调用此 Realm 的 `authenticate()` 方法。

因此，您直接在安全机制中进行的任何更改（例如新用户、更改密码或角色等）将立即反映出来。

- 一旦用户已通过身份验证，用户（及其关联的角色）将在 Tomcat 中缓存，直到用户的登录结束。

对于基于 FORM 的身份验证，这意味着直到会话超时或失效；对于基本身份验证，这意味着直到用户关闭其浏览器。对于已通过身份验证的用户的安全信息的任何更改，将不会反映在用户下次登录之前。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/realm-howto.html


* any list
{:toc}