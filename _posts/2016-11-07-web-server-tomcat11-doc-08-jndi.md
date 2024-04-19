---
layout: post
title: web server apache tomcat11-08-JNDI Resources How-To
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


# 介绍

Tomcat为每个在其下运行的Web应用程序提供了一个JNDI InitialContext实现实例，以与Jakarta EE应用程序服务器提供的实例兼容。Jakarta EE标准在/WEB-INF/web.xml文件中提供了一组标准元素，用于引用/定义资源。

有关JNDI的编程API和Jakarta EE服务器支持的功能的更多信息，请参见以下规范，Tomcat模拟了它提供的服务：

- Java命名和目录接口（从JDK 1.4开始包含）
- Jakarta EE平台规范（特别是，请参见命名章节）
web.xml配置
以下元素可用于Web应用程序部署描述符（/WEB-INF/web.xml）中，以定义资源：

- `<env-entry>` - 环境条目，一个单值参数，可用于配置应用程序的操作方式。
- `<resource-ref>` - 资源引用，通常是指用于资源的对象工厂，例如JDBC DataSource、Jakarta Mail Session或配置到Tomcat中的自定义对象工厂。
- `<resource-env-ref>` - 资源环境引用，Servlet 2.4中新增的一种资源引用变体，用于简化对不需要身份验证信息的资源的配置。
只要Tomcat能够识别一个适当的资源工厂来创建资源，并且不需要进一步的配置信息，Tomcat就会使用/WEB-INF/web.xml中的信息来创建资源。

Tomcat提供了一些针对JNDI资源的特定于Tomcat的选项，这些选项无法在web.xml中指定。这些选项包括`closeMethod`，它可以在Web应用程序停止时更快地清理JNDI资源，以及`singleton`，它控制是否为每个JNDI查找创建资源的新实例。要使用这些配置选项，资源必须在Web应用程序的`<Context>`元素或`$CATALINA_BASE/conf/server.xml`中的`<GlobalNamingResources>`元素中指定。

context.xml配置
如果Tomcat无法识别适当的资源工厂和/或需要额外的配置信息，则必须在Tomcat能够创建资源之前指定额外的Tomcat特定配置。Tomcat特定的资源配置输入在`<Context>`元素中，该元素可以在`$CATALINA_BASE/conf/server.xml`或最好是每个Web应用程序的上下文XML文件（META-INF/context.xml）中指定。

使用以下元素在`<Context>`元素中执行Tomcat特定的资源配置：

- `<Environment>` - 配置标量环境条目的名称和值，这些环境条目将通过JNDI InitialContext公开给Web应用程序（相当于在Web应用程序部署描述符中包含`<env-entry>`元素）。
- `<Resource>` - 配置资源的名称和数据类型，该资源可供应用程序使用（相当于在Web应用程序部署描述符中包含`<resource-ref>`元素）。
- `<ResourceLink>` - 向全局JNDI上下文中定义的资源添加链接。使用资源链接使Web应用程序可以访问在`<Server>`元素的`<GlobalNamingResources>`子元素中定义的资源。
- `<Transaction>` - 添加用于实例化可在`java:comp/UserTransaction`处可用的UserTransaction对象实例的资源工厂。
可以将任意数量的这些元素嵌套在一个`<Context>`元素内，并且只与该特定Web应用程序相关联。

如果在`<Context>`元素中定义了资源，那么不需要在/WEB-INF/web.xml中定义该资源。但是，建议在/WEB-INF/web.xml中保留条目，以记录Web应用程序的资源需求。

如果对于在Web应用程序部署描述符（/WEB-INF/web.xml）中包含的`<env-entry>`元素和在Web应用程序的`<Context>`元素的一部分中的`<Environment>`元素都定义了相同的资源名称，则仅当相应的`<Environment>`元素允许时（通过将`override`属性设置为“true”），部署描述符中的值将优先。

全局配置
Tomcat维护服务器的全局资源的单独命名空间。这些在`$CATALINA_BASE/conf/server.xml`的`<GlobalNamingResources>`元素中配置。您可以通过使用`<ResourceLink>`将这些资源暴露给Web应用程序，以将其包含在每个Web应用程序的上下文中。

如果使用`<ResourceLink>`定义了资源，那么不需要在/WEB-INF/web.xml中定义该资源。但是，建议在/WEB-INF/web.xml中保留条目，以记录Web应用程序的资源需求。

使用资源
在Web应用程序最初部署时，InitialContext被配置，并且被提供给Web应用程序组件（用于只读访问）。所有配置的条目和资源都放置在JNDI命名空间的java:comp/env部分中，因此对于资源的典型访问 - 在本例中是对JDBC DataSource的访问 - 看起来像这样：

```java
// 获取我们的环境命名上下文
Context initCtx = new InitialContext();
Context envCtx = (Context) initCtx.lookup("java:comp/env");

// 查找我们的数据源
DataSource ds = (DataSource)
  envCtx.lookup("jdbc/EmployeeDB");

// 从池中分配并使用连接
Connection conn = ds.getConnection();
... 使用此连接访问数据库 ...
conn.close();
```


Tomcat标准资源工厂
Tomcat包含一系列标准资源工厂，可以为您的Web应用程序提供服务，并通过<Context>元素提供配置灵活性，而无需修改Web应用程序或部署描述符。以下各小节详细介绍了标准资源工厂的配置和用法。

有关如何创建、安装、配置和使用自定义资源工厂类的信息，请参阅添加自定义资源工厂。

注意 - 在标准资源工厂中，只有“JDBC数据源”和“用户事务”工厂被要求在其他平台上可用，并且只有在平台实现了Jakarta EE规范时才需要。所有其他标准资源工厂以及您自己编写的自定义资源工厂都特定于Tomcat，并且不能假定它们在其他容器上可用。

通用JavaBean资源
0. 介绍
此资源工厂可用于创建符合标准JavaBeans命名约定的任何Java类的对象（即具有零参数构造函数，并且具有符合setFoo()命名模式的属性设置器）。如果工厂的singleton属性设置为false，则该资源工厂仅在每次查找此条目时创建适当的bean类的新实例。

使用此设施的步骤如下所述。

1. 创建您的JavaBean类
创建每次资源工厂被查找时将实例化的JavaBean类。例如，假设您创建了一个名为com.mycompany.MyBean的类，其代码如下所示：

```java
package com.mycompany;

public class MyBean {

  private String foo = "Default Foo";

  public String getFoo() {
    return (this.foo);
  }

  public void setFoo(String foo) {
    this.foo = foo;
  }

  private int bar = 0;

  public int getBar() {
    return (this.bar);
  }

  public void setBar(int bar) {
    this.bar = bar;
  }
}
```
2. 声明您的资源需求
然后，修改您的Web应用程序部署描述符（/WEB-INF/web.xml）以声明您将请求此bean的新实例的JNDI名称。最简单的方法是使用<resource-env-ref>元素，例如：

```xml
<resource-env-ref>
  <description>
    MyBean实例的对象工厂。
  </description>
  <resource-env-ref-name>
    bean/MyBeanFactory
  </resource-env-ref-name>
  <resource-env-ref-type>
    com.mycompany.MyBean
  </resource-env-ref-type>
</resource-env-ref>
```
警告 - 请确保您遵循Web应用程序部署描述符的DTD所要求的元素顺序！有关详细信息，请参阅Servlet规范。

3. 编写您的应用程序对此资源的使用
对此资源环境引用的典型用法可能如下所示：

```java
Context initCtx = new InitialContext();
Context envCtx = (Context) initCtx.lookup("java:comp/env");
MyBean bean = (MyBean) envCtx.lookup("bean/MyBeanFactory");

writer.println("foo = " + bean.getFoo() + ", bar = " +
               bean.getBar());
```
4. 配置Tomcat的资源工厂
要配置Tomcat的资源工厂，请向此Web应用程序的<Context>元素添加如下所示的元素。

```xml
<Context ...>
  ...
  <Resource name="bean/MyBeanFactory" auth="Container"
            type="com.mycompany.MyBean"
            factory="org.apache.naming.factory.BeanFactory"
            bar="23"/>
  ...
</Context>
```
请注意，资源名称（在这里是bean/MyBeanFactory）必须与Web应用程序部署描述符中指定的值匹配。我们还初始化了bar属性的值，这将导致在返回新bean之前调用setBar(23)。因为我们没有初始化foo属性（虽然我们可以），所以bean将包含由其构造函数设置的任何默认值。

如果bean属性的类型为String，则BeanFactory将使用提供的属性值调用属性设置器。如果bean属性类型为原始类型或原始包装类型，则BeanFactory将将该值转换为适当的原始类型或原始包装类型，然后在调用setter时使用该值。某些bean具有无法从String自动转换的类型的属性。如果bean提供了一个具有相同名称但接受String的备用setter，则BeanFactory将尝试使用该setter。如果BeanFactory无法使用值或执行适当的转换，则设置属性将失败，并显示命名异常。

较早的Tomcat版本中可用的forceString属性已被删除，作为加强安全措施。

# 内存UserDatabase资源

## 0. 介绍

UserDatabase资源通常配置为全局资源，供UserDatabase realm使用。Tomcat包含一个UserDatabaseFactory，它创建由XML文件支持的UserDatabase资源 - 通常是tomcat-users.xml。

设置全局UserDatabase资源所需的步骤如下所示。

## 1. 创建/编辑XML文件

XML文件通常位于$CATALINA_BASE/conf/tomcat-users.xml，但是您可以自由地将文件放置在文件系统的任何位置。建议将XML文件放置在$CATALINA_BASE/conf中。典型的XML文件如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tomcat-users>
  <role rolename="tomcat"/>
  <role rolename="role1"/>
  <

user username="tomcat" password="tomcat" roles="tomcat"/>
  <user username="both" password="tomcat" roles="tomcat,role1"/>
  <user username="role1" password="tomcat" roles="role1"/>
</tomcat-users>
```
## 2. 声明您的资源

接下来，修改$CATALINA_BASE/conf/server.xml以根据您的XML文件创建UserDatabase资源。它应该如下所示：

```xml
<Resource name="UserDatabase"
          auth="Container"
          type="org.apache.catalina.UserDatabase"
          description="User database that can be updated and saved"
          factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
          pathname="conf/tomcat-users.xml"
          readonly="false" />
```
pathname属性可以是URL、绝对路径或相对路径。如果是相对路径，则相对于$CATALINA_BASE。

readonly属性是可选的，如果没有提供，则默认为true。如果XML可写，则Tomcat启动时将写入该文件。警告：当写入文件时，它将继承Tomcat正在运行的用户的默认文件权限。请确保这些权限适合于维护安装的安全性。

如果在Realm中引用了UserDatabase，默认情况下，UserDatabase将监视pathname的更改，并在观察到上次修改时间发生更改时重新加载文件。可以通过将watchSource属性设置为false来禁用此功能。

### DataSource用户数据库资源

#### 0. 介绍
Tomcat还包括一个使用DataSource资源作为后端的UserDatabase。后端资源必须在与将使用它的用户数据库相同的JNDI上下文中声明。

设置全局UserDatabase资源所需的步骤如下所示。

#### 1. 数据库模式
用户数据库的数据库模式是灵活的。它可以与DataSourceRealm使用的模式相同，仅具有用于用户（用户名、密码）的表，以及另一个列出每个用户关联角色的表。为了支持完整的UserDatabase功能，它必须包括用于组的附加表，并且与用户、组和角色之间的引用完整性兼容。

具有组和引用完整性的完整功能模式可能是：

```sql
create table users (
  user_name         varchar(32) not null primary key,
  user_pass         varchar(64) not null,
  user_fullname     varchar(128)
  -- 根据需要添加更多属性
);

create table roles (
  role_name         varchar(32) not null primary key,
  role_description  varchar(128)
);

create table groups (
  group_name        varchar(32) not null primary key,
  group_description varchar(128)
);

create table user_roles (
  user_name         varchar(32) references users(user_name),
  role_name         varchar(32) references roles(role_name),
  primary key (user_name, role_name)
);

create table user_groups (
  user_name         varchar(32) references users(user_name),
  group_name        varchar(32) references groups(group_name),
  primary key (user_name, group_name)
);

create table group_roles (
  group_name        varchar(32) references groups(group_name),
  role_name         varchar(32) references roles(role_name),
  primary key (group_name, role_name)
);
```

没有使用组的最小模式将是（与DataSourceRealm相同）：

```sql
create table users (
  user_name         varchar(32) not null primary key,
  user_pass         varchar(64) not null,
  -- 根据需要添加更多属性
);

create table user_roles (
  user_name         varchar(32),
  role_name         varchar(32),
  primary key (user_name, role_name)
);
```

#### 2. 声明您的资源
接下来，修改$CATALINA_BASE/conf/server.xml以根据您的DataSource和其模式创建UserDatabase资源。应该如下所示：

```xml
<Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.DataSourceUserDatabaseFactory"
              dataSourceName="jdbc/authority" readonly="false"
              userTable="users" userNameCol="user_name" userCredCol="user_pass"
              userRoleTable="user_roles" roleNameCol="role_name"
              roleTable="roles" groupTable="groups" userGroupTable="user_groups"
              groupRoleTable="group_roles" groupNameCol="group_name" />
```

dataSourceName属性是将作为UserDatabase后端的DataSource的JNDI名称。它必须在与UserDatabase相同的JNDI上下文中声明。请参考DataSource资源文档以获取更多说明。

readonly属性是可选的，默认为true。如果数据库可写，则可以通过使用save方法将通过Tomcat管理对UserDatabase的更改保存到数据库中。

此外，也可以直接对后端数据库进行更改。

#### 3. 资源配置
| 属性                 | 描述                                                                                                |
|----------------------|-----------------------------------------------------------------------------------------------------|
| dataSourceName       | 此UserDatabase的JNDI JDBC DataSource的名称。                                                             |
| groupNameCol         | 包含组名的“groups”、“group roles”和“user groups”表中的列的名称。                                         |
| groupRoleTable       | “group roles”表的名称，必须包含由groupNameCol和roleNameCol属性命名的列。                                  |
| groupTable           | “groups”表的名称，必须包含由groupNameCol属性命名的列。                                                     |
| readonly             | 如果设置为true，则可以通过使用save方法将对UserDatabase的更改保存到DataSource中。如果未提供，默认值为true。   |
| roleAndGroupDescriptionCol | 在“roles”和“groups”表中包含角色和组描述的列的名称。                                                       |
| roleNameCol          | “roles”、“user roles”和“group roles”表中的列的名称，其中包含分配给相应用户的角色名称。                      |
| roleTable            | “roles”表的名称，必须包含由roleNameCol属性命名的列。                                                      |
| userCredCol          | “users”表中包含用户凭据（即密码）的列的名称。如果指定了CredentialHandler，则此组件将假定密码已使用指定的算法进行编码。否则，它们将假定为明文。 |
| userGroupTable       | “user groups”表的名称，必须包含由userNameCol和groupNameCol属性命名的列。                                    |
| userNameCol          | 包含用户的用户名的“users”、“user groups”和“user roles”表中的列的名称。                                    |
| userFullNameCol      | 包含用户全名的“users”表中的列的名称。                                                                     |
| userRoleTable        | “user roles”表的名称，必须包含由userNameCol和roleNameCol属性命名的列。                                    |

#### 4. 配置Realm

根据Realm配置文档配置UserDatabase Realm以使用此资源。



### JDBC数据源

#### 0. 介绍
许多 Web 应用程序需要通过 JDBC 驱动程序访问数据库，以支持该应用程序所需的功能。Jakarta EE 平台规范要求 Jakarta EE 应用服务器提供 DataSource 实现（即用于 JDBC 连接的连接池）以用于此目的。Tomcat提供完全相同的支持，因此您在Tomcat上使用此服务开发的基于数据库的应用程序将在任何 Jakarta EE 服务器上都能够无缝运行。

有关 JDBC 的信息，您应该查阅以下链接：

- [Java数据库连接（JDBC）](http://www.oracle.com/technetwork/java/javase/jdbc/index.html) - 有关 Java 数据库连接的信息主页。
- [JDBC 2.1 API 规范](http://java.sun.com/j2se/1.3/docs/guide/jdbc/spec2/jdbc2.1.frame.html) - JDBC 2.1 API 规范。
- [JDBC 2.0 标准扩展 API](http://java.sun.com/products/jdbc/jdbc20.stdext.pdf) - JDBC 2.0 标准扩展 API（包括 javax.sql.DataSource API）。此软件包现在称为“JDBC 可选包”。
- [Jakarta EE 平台规范](https://jakarta.ee/specifications/platform/9/) - Jakarta EE 平台规范（涵盖了所有 Jakarta EE 平台必须为应用程序提供的 JDBC 设施）。

**注意** - Tomcat 中默认的数据源支持基于 Commons 项目的 DBCP 2 连接池。但是，您可以通过编写自己的自定义资源工厂来使用任何实现了 javax.sql.DataSource 的其他连接池，如下所述。

#### 1. 安装您的 JDBC 驱动程序
使用 JDBC 数据源 JNDI 资源工厂需要您将适当的 JDBC 驱动程序提供给 Tomcat 内部类和您的 Web 应用程序。最简单的方法是将驱动程序的 JAR 文件安装到 `$CATALINA_HOME/lib` 目录中，这样既可以将驱动程序提供给资源工厂，也可以提供给您的应用程序。

#### 2. 声明您的资源需求
接下来，修改 Web 应用程序部署描述符（`/WEB-INF/web.xml`）以声明 JNDI 名称，在该名称下您将查找预配置的数据源。按照惯例，所有这些名称都应该解析为 jdbc 子上下文（相对于标准的 `java:comp/env` 命名上下文，它是所有提供的资源工厂的根）。一个典型的 `web.xml` 条目可能如下所示：

```xml
<resource-ref>
  <description>
    Resource reference to a factory for java.sql.Connection
    instances that may be used for talking to a particular
    database that is configured in the <Context>
    configuration for the web application.
  </description>
  <res-ref-name>
    jdbc/EmployeeDB
  </res-ref-name>
  <res-type>
    javax.sql.DataSource
  </res-type>
  <res-auth>
    Container
  </res-auth>
</resource-ref>
```

### JDBC 数据源

#### 3. 代码中使用该资源
典型的资源引用使用可能如下所示：

```java
Context initCtx = new InitialContext();
Context envCtx = (Context) initCtx.lookup("java:comp/env");
DataSource ds = (DataSource)
  envCtx.lookup("jdbc/EmployeeDB");

Connection conn = ds.getConnection();
// 使用此连接访问数据库
conn.close();
```

请注意，应用程序使用与在 Web 应用程序部署描述符中声明的资源引用名称相同的名称。这与为 Web 应用程序配置的资源工厂相匹配，如下所述配置在 web 应用程序的 `<Context>` 元素中。

#### 4. 配置 Tomcat 的资源工厂
要配置 Tomcat 的资源工厂，请在 web 应用程序的 `<Context>` 元素中添加以下元素：

```xml
<Context ...>
  ...
  <Resource name="jdbc/EmployeeDB"
            auth="Container"
            type="javax.sql.DataSource"
            username="dbusername"
            password="dbpassword"
            driverClassName="org.hsql.jdbcDriver"
            url="jdbc:HypersonicSQL:database"
            maxTotal="8"
            maxIdle="4"/>
  ...
</Context>
```

请注意，资源名称（这里是 jdbc/EmployeeDB）必须与 web 应用程序部署描述符中指定的值匹配。

此示例假设您正在使用 HypersonicSQL 数据库 JDBC 驱动程序。自定义 driverClassName 和 driverName 参数以匹配实际数据库的 JDBC 驱动程序和连接 URL。

Tomcat 标准数据源资源工厂（`org.apache.tomcat.dbcp.dbcp2.BasicDataSourceFactory`）的配置属性如下：

- `driverClassName` - 要使用的 JDBC 驱动程序的完全限定的 Java 类名。
- `username` - 要传递给我们的 JDBC 驱动程序的数据库用户名。
- `password` - 要传递给我们的 JDBC 驱动程序的数据库密码。
- `url` - 要传递给我们的 JDBC 驱动程序的连接 URL。（为了向后兼容，也识别属性 `driverName`。）
- `initialSize` - 在池初始化期间创建的连接的初始数量。默认值：0
- `maxTotal` - 可以同时从此池分配的最大连接数。默认值：8
- `minIdle` - 此池中将同时保留的最小连接数。默认值：0
- `maxIdle` - 此池中可以同时保留的最大连接数。默认值：8
- `maxWaitMillis` - 当没有可用连接时，池等待的最大毫秒数，直到在抛出异常之前返回连接。默认值：-1（无限）
- 其他一些属性处理连接验证：
  - `validationQuery` - 池在将连接返回给应用程序之前可以使用的 SQL 查询，以验证连接。如果指定，此查询**必须**是一个至少返回一行的 SQL SELECT 语句。
  - `validationQueryTimeout` - 验证查询返回的超时时间（秒）。默认值：-1（无限）
  - `testOnBorrow` - true 或 false：每次从池中借用连接时，是否使用验证查询验证连接。默认值：true
  - `testOnReturn` - true 或 false：每次将连接返回到池时，是否使用验证查询验证连接。默认值：false
- 可选的清除者线程负责收缩池，删除长时间处于空闲状态的任何连接。清除者不会遵守 `minIdle`。如果您只想要池根据配置的 `maxIdle` 属性来收缩，则不需要激活清除者线程。
  
清除者默认处于禁用状态，并且可以使用以下属性进行配置：

- `timeBetweenEvictionRunsMillis` - 清除者连续运行之间的毫秒数。默认值：-1（禁用）
- `numTestsPerEvictionRun` - 每次清除者运行时将由清除者检查空闲状态的连接数。默认值：3
- `minEvictableIdleTimeMillis` - 连接在空闲多长时间后可以由清除者从池中移除的空闲时间（毫秒）。默认值：30*60*1000（30分钟）
- `testWhileIdle` - true 或 false：在池中处于空闲状态时，是否使用验证查询由清除者线程验证连接。默认值：false

另一个可选功能是删除已弃用的连接。如果应用程序长时间不将连接返回到池中，则称为已弃用的连接。池可以自动关闭这些连接并将其从池中删除。这是一个应用程序泄漏连接的解决方法。

默认情况下，放弃功能处于禁用状态，并且可以使用以下属性进行配置：

- `removeAbandonedOnBorrow` - true 或 false：当借用连接时，是否从池中删除已弃用的连接。默认值：false
- `removeAbandonedOnMaintenance` - true 或 false：在池维护期间是否从池中删除已弃用的连接。默认值：false
- `removeAbandonedTimeout` - 借用的连接被假定为

已弃用的秒数。默认值：300
- `logAbandoned` - true 或 false：是否记录已弃用语句或连接的应用程序代码的堆栈跟踪。这会增加严重的开销。默认值：false

最后，还有各种属性，允许进一步微调池的行为：

- `defaultAutoCommit` - true 或 false：此池创建的连接的默认自动提交状态。默认值：true
- `defaultReadOnly` - true 或 false：此池创建的连接的默认只读状态。默认值：false
- `defaultTransactionIsolation` - 这设置了默认的事务隔离级别。可以是 NONE、READ_COMMITTED、READ_UNCOMMITTED、REPEATABLE_READ、SERIALIZABLE 中的一个。默认值：未设置默认值
- `poolPreparedStatements` - true 或 false：是否对 PreparedStatements 和 CallableStatements 进行池化。默认值：false
- `maxOpenPreparedStatements` - 可以同时从语句池中分配的最大打开语句数。默认值：-1（无限制）
- `defaultCatalog` - 默认目录的名称。默认值：未设置
- `connectionInitSqls` - 在创建连接后运行的 SQL 语句列表。通过分号（;）分隔多个语句。默认值：无语句
- `connectionProperties` - 传递给驱动程序以创建连接的特定于驱动程序的属性列表。每个属性都以 name=value 形式给出，多个属性用分号（;）分隔。默认值：无属性
- `accessToUnderlyingConnectionAllowed` - true 或 false：是否允许访问底层连接。默认值：false

有关更多详细信息，请参阅 Commons DBCP 2 文档。

### 添加自定义资源工厂

#### 1. 编写资源工厂类

您必须编写一个实现 JNDI 服务提供程序 `javax.naming.spi.ObjectFactory` 接口的类。每当您的 Web 应用程序对绑定到此工厂的上下文条目调用 `lookup()`（假设工厂配置为 `singleton="false"`）时，将调用 `getObjectInstance()` 方法，方法具有以下参数：

- `Object obj` - 包含位置或引用信息的（可能为 null）对象，可用于创建对象。对于 Tomcat，这将始终是类型为 `javax.naming.Reference` 的对象，其中包含此工厂类的类名，以及用于创建要返回的对象的配置属性（来自 web 应用程序的 `<Context>`）。
- `Name name` - 相对于 `nameCtx` 绑定此工厂的名称，如果未指定名称，则为 null。
- `Context nameCtx` - 指定名称参数的上下文，或者如果名称是相对于默认初始上下文，则为 null。
- `Hashtable environment` - 在创建此对象时使用的（可能为 null）环境。在 Tomcat 对象工厂中通常会被忽略。

要创建一个知道如何生成 `MyBean` 实例的资源工厂，您可以创建如下所示的类：

```java
package com.mycompany;

import java.util.Enumeration;
import java.util.Hashtable;
import javax.naming.Context;
import javax.naming.Name;
import javax.naming.NamingException;
import javax.naming.RefAddr;
import javax.naming.Reference;
import javax.naming.spi.ObjectFactory;

public class MyBeanFactory implements ObjectFactory {

  public Object getObjectInstance(Object obj,
      Name name2, Context nameCtx, Hashtable environment)
      throws NamingException {

      // 获取我们指定的 bean 类的实例
      MyBean bean = new MyBean();

      // 从我们的属性自定义 bean 属性
      Reference ref = (Reference) obj;
      Enumeration addrs = ref.getAll();
      while (addrs.hasMoreElements()) {
          RefAddr addr = (RefAddr) addrs.nextElement();
          String name = addr.getType();
          String value = (String) addr.getContent();
          if (name.equals("foo")) {
              bean.setFoo(value);
          } else if (name.equals("bar")) {
              try {
                  bean.setBar(Integer.parseInt(value));
              } catch (NumberFormatException e) {
                  throw new NamingException("Invalid 'bar' value " + value);
              }
          }
      }

      // 返回定制的实例
      return (bean);
  }
}
```

在此示例中，我们无条件地创建了 `com.mycompany.MyBean` 类的新实例，并根据配置此工厂的 `<ResourceParams>` 元素中包含的参数来设置其属性（请参见下文）。您应该注意到，任何名为 `factory` 的参数都应该被跳过 - 该参数用于指定工厂类本身的名称（在本例中为 `com.mycompany.MyBeanFactory`），而不是被配置的 bean 的属性。

有关 `ObjectFactory` 的更多信息，请参阅 JNDI 服务提供程序接口（SPI）规范。

您需要针对包含 $CATALINA_HOME/lib 目录中所有 JAR 文件的类路径编译此类。完成后，将工厂类（以及相应的 bean 类）解压缩到 $CATALINA_HOME/lib 下，或者放置在 $CATALINA_HOME/lib 中的 JAR 文件中。这样，所需的类文件对 Catalina 内部资源和您的 Web 应用程序都是可见的。

#### 2. 声明您的资源需求

接下来，修改您的 Web 应用程序部署描述符（/WEB-INF/web.xml），声明您将请求此 bean 的新实例的 JNDI 名称。最简单的方法是使用 `<resource-env-ref>` 元素，如下所示：

```xml
<resource-env-ref>
  <description>
    MyBean 实例的对象工厂。
  </description>
  <resource-env-ref-name>
    bean/MyBeanFactory
  </resource-env-ref-name>
  <resource-env-ref-type>
    com.mycompany.MyBean
  </resource-env-ref-type>
</resource-env-ref>
```

#### 3. 编写您应用程序中对此资源的使用代码

典型的资源环境引用使用可能如下所示：

```java
Context initCtx = new InitialContext();
Context envCtx = (Context) initCtx.lookup("java:comp/env");
MyBean bean = (MyBean) envCtx.lookup("bean/MyBeanFactory");

writer.println("foo = " + bean.getFoo() + ", bar = " +
               bean.getBar());
```

#### 4. 配置 Tomcat 的资源工厂

要配置 Tomcat 的资源工厂，请在此 web 应用程序的 `<Context>` 元素中添加类似如下的元素：

```xml
<Context ...>
  ...
  <Resource name="bean/MyBeanFactory" auth="Container"
            type="com.mycompany.MyBean"
            factory="com.mycompany.MyBeanFactory"
            singleton="false"
            bar="23"/>
  ...
</Context>
```

请注意，资源名称（这里是 bean/MyBeanFactory）必须与 web 应用程序部署描述符中指定的值匹配。

我们还初始化了 bar 属性的值，这将导致在返回新 bean 之前调用 `setBar(23)`。因为我们没有初始化 foo 属性（尽管我们可以），所以 bean 将包含由其构造函数设置的任何默认值。

您还会注意到，从应用程序开发者的角度来看，资源环境引用的声明以及用于请求新实例的编程与通用 JavaBean 资源示例所使用的方法完全相同。

这说明了使用 JNDI 资源封装功能的优势之一 - 您可以更改底层实现，而无需修改使用资源的应用程序，只要您保持兼容的 API。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/jndi-resources-howto.html


* any list
{:toc}