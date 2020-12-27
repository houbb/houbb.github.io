---
layout: post
title: Shiro-02-shiro 是什么?
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

大家好，我是老马。

前面我们学习了 [5 分钟入门 shiro 安全框架实战笔记](https://www.toutiao.com/i6910927630845919756/)，让大家对 shiro 有了一个最基本的认识。

shiro 还有其他优秀的特性，今天我们就一起来学习一下，为后续深入学习奠定基础。

# Apache Shiro 是什么？

Apache Shiro 是一种功能强大且易于使用的Java安全框架，它执行身份验证，授权，加密和会话管理，可用于保护任何应用程序的安全-从命令行应用程序，移动应用程序到最大的Web和企业应用程序。

shiro 的组件结构如下图：

![components](https://shiro.apache.org/assets/images/ShiroFeatures.png)

Shiro提供了应用程序安全性API来执行以下方面（我喜欢将它们称为应用程序安全性的4个基石）：

- 身份验证-证明用户身份，通常称为用户“登录”。

- 授权-访问控制

- 密码学-保护或隐藏数据以防窥视

- 会话管理-每个用户的时间敏感状态

Shiro还支持一些辅助功能，例如Web应用程序安全性，单元测试和多线程支持，但是这些功能可以增强上述四个主要方面。

## 特性

您可以使用Apache Shiro进行以下操作：

- 验证用户身份以验证其身份

- 对用户执行访问控制，例如：

- 确定是否为用户分配了特定的安全角色

- 确定是否允许用户做某事

- 即使在没有Web或EJB容器的情况下，也可以在任何环境中使用Session API。

- 在身份验证，访问控制或会话的生存期内对事件做出反应。

- 汇总1个或更多用户安全数据的数据源，并将其全部显示为单个复合用户“视图”。

- 启用单点登录（SSO）功能

- 启用“记住我”服务以进行用户关联，而无需登录

# 为什么要使用 Apache Shiro？

自2003年以来，框架环境发生了很大变化，因此今天仍然有充分的理由使用Shiro。

Apache Shiro 优势如下：

- 易于使用-易于使用是该项目的最终目标。应用程序安全性可能非常令人困惑和沮丧，并被视为“必不可少的恶魔”。如果您使它易于使用，以使新手程序员可以开始使用它，那么就不必再痛苦了。

- 全面-没有任何其他安全框架具有Apache Shiro所声称的范围广度，因此它很可能是满足您的安全需求的“一站式服务”。

- 灵活-Apache Shiro可以在任何应用程序环境中工作。虽然它可以在Web，EJB和IoC环境中运行，但不需要它们。 Shiro也不要求任何规范，甚至没有很多依赖性。

- 具有Web功能-Apache Shiro具有出色的Web应用程序支持，可让您基于应用程序URL和Web协议（例如REST）创建灵活的安全策略，同时还提供了一组JSP库来控制页面输出。

- 可插拔-Shiro简洁的API和设计模式可轻松与许多其他框架和应用程序集成。您会看到Shiro与Spring，Grails，Wicket，Tapestry，Mule，Apache Camel，Vaadin等框架无缝集成。

- 受支持-Apache Shiro是Apache Software Foundation的一部分，该组织被证明以其社区的最大利益行事。项目开发和用户群体友好的公民随时可以提供帮助。如果需要，像Katasoft这样的商业公司也可以提供专业的支持和服务。

# 核心概念：Subject，SecurityManager 和 Realms

Shiro的体系结构具有三个主要概念-主题（Subject），安全管理器(SecurityManager)和领域（Realms）。

![概念](https://shiro.apache.org/assets/images/ShiroBasicArchitecture.png)

## Subject

在保护应用程序安全时，可能要问自己最相关的问题是：“当前用户是谁？”或“是否允许当前用户执行X”？

在编写代码或设计用户界面时，我们通常会问自己以下问题：应用程序通常是基于用户案例构建的，并且您希望基于每个用户来表示（和保护）功能。

因此，我们考虑应用程序安全性的最自然方法是基于当前用户。 

Shiro的API从根本上代表了这种思维方式。

“主题”一词是一个安全术语，基本上表示“当前正在执行的用户”。它只是不被称为“用户”，因为“用户”一词通常与人类相关联。

**在安全领域中，“主题”一词可以表示一个人，但也可以指第三方进程，守护程序帐户或任何类似内容。它仅表示“当前正在与软件交互的事物”。**

不过，对于大多数意图和目的，您都可以将其视为Shiro的“用户”概念。

您可以在代码中的任何位置轻松获取Shiro主题，如下面的清单1所示。

- List1

```java
import org.apache.shiro.subject.Subject;
import org.apache.shiro.SecurityUtils;
...
Subject currentUser = SecurityUtils.getSubject();
```

获取主题后，您可以立即访问当前用户想要使用Shiro进行的所有操作的90％，例如登录，注销，访问其会话，执行授权检查等等-但稍后会介绍更多 。 

这里的关键是Shiro的API在很大程度上是直观的，因为它反映了开发人员在“每用户”安全控制中进行思考的自然趋势。 

在代码中的任何地方访问主题也很容易，从而可以在需要的地方进行安全操作。

## 安全管理器

主题的“幕后”对应对象是SecurityManager。

主题代表当前用户的安全操作，而SecurityManager管理所有用户的安全操作。它是Shiro体系结构的核心，是一种“伞”对象，它引用了许多内部嵌套的安全组件，这些安全组件构成了一个对象图。但是，一旦配置了SecurityManager及其内部对象图，通常就不理会它，应用程序开发人员几乎将所有时间都花在Subject API上。

那么如何设置SecurityManager？

好吧，这取决于您的应用程序环境。

例如，Web应用程序通常将在web.xml中指定Shiro Servlet过滤器，这将设置SecurityManager实例。如果您运行的是独立应用程序，则需要以其他方式进行配置。但是有许多配置选项。

每个应用程序几乎总是只有一个SecurityManager实例。

它本质上是一个应用程序单例（尽管不必是静态单例）。像Shiro中的几乎所有内容一样，默认的SecurityManager实现是POJO，并且可以使用任何与POJO兼容的配置机制-常规Java代码，Spring XML，YAML，.properties和.ini文件等进行配置。基本上，任何能够实例化类的东西并且可以使用与JavaBeans兼容的调用方法。

为此，Shiro通过基于文本的INI配置提供了默认的“共母”解决方案。 

INI易于阅读，易于使用，并且几乎不需要依赖项。您还将看到，通过简单地了解对象图导航，可以有效地使用INI来配置简单的对象图，例如SecurityManager。

请注意，Shiro还支持Spring XML配置和其他替代方案，但我们将在此处介绍INI。

下面的清单2中的示例显示了基于INI配置Shiro的最简单示例。

- List2 使用 INI 配置

```ini
[main]
cm = org.apache.shiro.authc.credential.HashedCredentialsMatcher
cm.hashAlgorithm = SHA-512
cm.hashIterations = 1024
# Base64 encoding (less text):
cm.storedCredentialsHexEncoded = false
iniRealm.credentialsMatcher = $cm

[users]
jdoe = TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJpcyByZWFzb2
asmith = IHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbXNoZWQsIG5vdCB
```

在清单2中，我们看到了用于配置SecurityManager实例的INI配置示例。 

INI分为两个部分：[main]和[users]。

[main]部分是配置SecurityManager对象和/或SecurityManager使用的任何对象（如领域）的地方。在此示例中，我们看到两个对象被配置：

cm对象，它是Shiro的HashedCredentialsMatcher类的实例。如您所见，cm实例的各种属性是通过“嵌套点”语法配置的，该语法由清单3所示的IniSecurityManagerFactory用来表示对象图导航和属性设置。

iniRealm对象，是SecurityManager用来表示以INI格式定义的用户帐户的组件。

在[用户]部分中，您可以指定用户帐户的静态列表-适用于简单的应用程序或测试时。

出于本简介的目的，理解每一部分的复杂性并不重要，而是要了解INI配置是配置Shiro的一种简单方法。

有关INI配置的更多详细信息，请参阅Shiro的文档。

- List3 加载配置文件

```java
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.config.IniSecurityManagerFactory;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.util.Factory;

//1. Load the INI configuration
Factory<SecurityManager> factory =
new IniSecurityManagerFactory("classpath:shiro.ini");

//2. Create the SecurityManager
SecurityManager securityManager = factory.getInstance();

//3. Make it accessible
SecurityUtils.setSecurityManager(securityManager);
```

在清单3中，在这个简单的示例中，我们看到了一个三步过程：

1. 加载将配置SecurityManager及其组成组件的INI配置。

2. 根据配置（使用代表工厂方法设计模式的Shiro的工厂概念）创建SecurityManager实例。

3. 使SecurityManager单例可被应用程序访问。 

在这个简单的示例中，我们将其设置为VM静态单例，但这通常不是必需的-您的应用程序配置机制可以确定是否需要使用静态内存。

## Realms（领域）

Shiro中的第三个也是最后一个核心概念是领域。

领域充当Shiro与应用程序的安全数据之间的“桥梁”或“连接器”。

也就是说，当需要真正与安全性相关的数据（例如用户帐户）进行交互以执行身份验证（登录）和授权（访问控制）时，Shiro会从为一个应用程序配置的一个或多个Realms中查找其中的许多内容。

从这个意义上说，领域本质上是特定于安全性的DAO：它封装了数据源的连接详细信息，并根据需要使关联数据可用于Shiro。在配置Shiro时，您必须至少指定一个领域用于身份验证和/或授权。可以配置多个Realm，但至少需要一个。

Shiro提供了开箱即用的领域，可以连接到许多安全数据源（又名目录），例如LDAP，关系数据库（JDBC），文本配置源（例如INI和属性文件）等等。

如果默认的Realms不能满足您的需求，那么您可以插入自己的Realm实现以表示自定义数据源。

下面的清单4是配置Shiro（通过INI）以将LDAP目录用作应用程序的领域之一的示例。

- 清单4.示例领域配置

```ini
[main]
ldapRealm = org.apache.shiro.realm.ldap.JndiLdapRealm
ldapRealm.userDnTemplate = uid={0},ou=users,dc=mycompany,dc=com
ldapRealm.contextFactory.url = ldap://ldapHost:389
ldapRealm.contextFactory.authenticationMechanism = DIGEST-MD5 
```

现在，我们已经了解了如何设置基本的Shiro环境，让我们讨论您作为开发人员如何使用该框架。

# 详细架构

下图显示了Shiro的核心架构概念，并简要概述了每个架构：

![详细架构](https://shiro.apache.org/assets/images/ShiroArchitecture.png)

下面我们对除了核心组件的部分做一下简单的介绍：

## Authentication（身份验证）

身份验证是验证用户身份的过程。

也就是说，当用户通过应用程序进行身份验证时，他们在证明自己实际上就是他们所说的身份。有时也称为“登录”。

这通常是一个三步过程。

1. 收集用户的识别信息（称为主体）和支持身份证明的凭据（称为凭据）。

2. 将主体和凭据提交到系统。

3. 如果提交的凭据与系统对该用户身份（本金）的期望匹配，则认为该用户已通过身份验证。如果不匹配，则认为该用户未通过身份验证。

每个人都熟悉的此过程的一个常见示例是用户名/密码组合。当大多数用户登录软件应用程序时，通常会提供其用户名（主体）和支持密码（凭据）。如果存储在系统中的密码（或密码表示形式）与用户指定的密码匹配，则认为它们已通过身份验证。

Shiro以简单直观的方式支持相同的工作流程。

正如我们所说，Shiro具有以主题为中心的API-在运行时，您与Shiro所做的几乎所有事情都是通过与当前正在执行的Subject进行交互来实现的。

因此，要登录主题，您只需调用其登录方法，并传递一个AuthenticationToken实例，该实例代表所提交的主体和凭据（在本例中为用户名和密码）。

此示例在下面的清单5中显示。

- 列表5 主题登录

```java
//1. Acquire submitted principals and credentials:
AuthenticationToken token =
new UsernamePasswordToken(username, password);

//2. Get the current Subject:
Subject currentUser = SecurityUtils.getSubject();

//3. Login:
currentUser.login(token);
```

如您所见，Shiro的API可以轻松反映常见的工作流程。 

您会继续将这种简单性视为主题操作的所有操作的主题。 

当调用登录方法时，SecurityManager将接收AuthenticationToken并将其分发给一个或多个配置的领域，以允许每个领域根据需要执行身份验证检查。 

每个领域都可以根据需要对提交的AuthenticationToken做出反应。 

但是，如果登录尝试失败会怎样？ 

如果用户指定了错误的密码怎么办？ 

您可以通过对Shiro的运行时AuthenticationException做出反应来处理故障，如清单6所示。

- 列表6-处理失败的场景

```java
//3. Login:
try {
    currentUser.login(token);
} catch (IncorrectCredentialsException ice) { …
} catch (LockedAccountException lae) { …
}
…
catch (AuthenticationException ae) {…
} 
```

您可以选择捕获AuthenticationException子类之一并作出具体反应，或者一般性地处理任何AuthenticationException（例如，向用户显示通用的“用户名或密码错误”消息）。 

选择取决于您，具体取决于您的应用程序需求。

主题成功登录后，它们被认为已通过身份验证，通常您允许他们使用您的应用程序。 

但是，仅仅因为用户证明了自己的身份并不意味着他们可以在应用程序中做任何想做的事情。 

这就引出了下一个问题：“如何控制允许用户执行或不执行的操作？” 确定允许用户执行的操作称为授权。 

接下来，我们将介绍Shiro如何启用授权。

## Authorization（授权）

授权本质上是访问控制-控制用户可以在应用程序中访问的内容（例如资源，网页等）。

大多数用户通过使用角色和权限等概念来执行访问控制。 

也就是说，通常根据分配给他们的角色和/或权限，允许用户执行某项操作或不执行某项操作。 

然后，您的应用程序可以根据对这些角色和权限的检查来控制公开哪些功能。 

如您所料，主题API使您可以非常轻松地执行角色和权限检查。 

例如，清单7中的代码片段显示了如何检查Subject是否被分配了特定角色。

- 清单7-角色检查

```java
if ( subject.hasRole("administrator") ) {
    //show the ‘Create User’ button
} else {
    //grey-out the button?
} 
```

如您所见，您的应用程序可以基于访问控制检查来启用或禁用功能。

权限检查是执行授权的另一种方法。

如上例所示，检查角色存在一个重大缺陷：您无法在运行时添加或删除角色。您的代码使用角色名称进行了硬编码，因此，如果更改了角色名称和/或配置，则代码将被破坏！如果您需要能够在运行时更改角色的含义，或者根据需要添加或删除角色，则必须依靠其他方式。

为此，Shiro支持其权限概念。

权限是对功能的原始说明，例如“开门”，“创建博客条目”，“删除'jsmith'用户”等。

**通过使权限反映您的应用程序的原始功能，您只需更改权限检查何时更改应用程序的功能。反过来，您可以在运行时根据需要向角色或用户分配权限。**

作为一个示例，如下面的清单8所示，我们可以重写之前的角色检查，而使用权限检查。

- 清单8-权限检测

```java
if (subject.isPermitted("user:create") ) {
    //show the ‘Create User’ button
} else {
    //grey-out the button?
} 
```

这样，分配了 `user:create` 权限的任何角色或用户都可以单击“Create User”按钮，并且这些角色和分配甚至可以在运行时更改，从而为您提供了非常灵活的安全模型。

“usercreate”字符串是遵循某些解析约定的权限字符串的示例。 

Shiro的WildcardPermission支持此约定。 

尽管不在本介绍文章的讨论范围之内，但您会发现WildcardPermission在创建安全策略时可以非常灵活，甚至还支持实例级访问控制之类的功能。

- 清单9-实例级别权限校验

```java
if ( subject.isPermitted(“user:delete:jsmith”) ) {
    //delete the ‘jsmith’ user
} else {
    //don’t delete ‘jsmith’
}
```

此示例表明，如果需要，您可以控制甚至访问非常细致的实例级别。 

如果愿意，您甚至可以发明自己的权限语法。 

有关更多信息，请参见 [Shiro权限文档](http://shiro.apache.org/permissions.html)。 

最后，与身份验证一样，上述调用最终也进入了SecurityManager，后者将咨询一个或多个Realms来做出访问控制决策。 这使领域可以根据需要响应身份验证和授权操作。

这就是Shiro授权功能的简要概述。 

尽管大多数安全框架都停止了身份验证和授权，但Shiro提供了更多功能。

接下来，我们将讨论Shiro的高级会话管理功能。

## 会话管理

Apache Shiro在安全框架领域提供了一些独特的功能：可在任何应用程序和任何体系结构层中使用的一致的Session API。

也就是说，Shiro为任何应用程序启用了会话编程范例-从小型守护程序独立应用程序到最大的群集Web应用程序。

这意味着希望使用会话的应用程序开发人员不再需要，则不再需要使用Servlet或EJB容器。或者，如果使用这些容器，则开发人员现在可以选择在任何层中使用统一且一致的会话API，而不是使用servlet或EJB特定的机制。

但是**Shiro会话的最重要好处之一就是它们与容器无关。**

这具有微妙但极其强大的含义。

例如，让我们考虑会话集群。有多少种特定于容器的方式可以将会话群集在一起以实现容错和故障转移？ 

Tomcat与Jetty的功能不同，而Jetty与Websphere的功能不同。但是，通过Shiro会话，您可以获得独立于容器的集群解决方案。 

Shiro的体系结构允许可插入的Session数据存储，例如企业缓存，关系数据库，NoSQL系统等等。

这意味着您只需配置一次会话集群，无论部署环境如何（Tomcat，Jetty，JEE Server或独立应用程序），它都将以相同的方式工作。

无需根据部署应用程序的方式重新配置应用程序。

Shiro会话的另一个好处是，如果需要，**会话数据可以跨客户端技术共享**。

例如，如果需要，Swing桌面客户端可以参加相同的Web应用程序会话-如果最终用户同时使用这两个客户端，则很有用。 

那么，您如何在任何环境中访问主题的会话？ 

如下面的示例所示，有两种Subject方法。

- Listing 10. Subject’s Session

```java
Session session = subject.getSession();
Session session = subject.getSession(boolean create);
```

如您所见，这些方法在概念上与HttpServletRequest API相同。 

第一种方法将返回主题的现有会话，或者如果没有，则创建一个新的会话并返回。 

第二种方法接受一个布尔参数，该参数确定是否将创建一个新的会话（如果尚不存在）。 

获取主题的会话后，就可以将其几乎与HttpSession一样使用。 

Shiro团队认为HttpSession API最适合Java开发人员，因此我们保留了大部分感觉。 

当然，最大的区别是您可以在任何应用程序中使用Shiro Sessions，而不仅仅是Web应用程序。 

清单11显示了这种熟悉程度。

- Listing 11. Session methods

```java
Session session = subject.getSession();
session.getAttribute("key", someValue);
Date start = session.getStartTimestamp();
Date timestamp = session.getLastAccessTime();
session.setTimeout(millis);
```

## 密码学

密码术是隐藏或混淆数据的过程，因此窥探眼睛无法理解它。 

Shiro的加密目标是简化JDK的加密支持并使之可用。

需要特别注意的是，密码通常不是特定于主题的，因此Shiro API的其中一个领域不是特定于主题的。 

即使未使用“主题”，您也可以在任何地方使用Shiro的加密支持。 

Shiro真正侧重于其加密支持的两个领域是加密哈希（又名消息摘要）和加密密码领域。 

让我们更详细地看看这两个。

### 散列

如果您使用了JDK的MessageDigest类，您很快就会意识到使用它有点麻烦。它具有笨拙的基于静态方法的基于工厂的API，而不是面向对象的API，因此您不得不捕获可能永远不需要捕获的已检查异常。如果您需要十六进制编码或Base64编码的消息摘要输出，则由您自己决定-两者均不提供标准的JDK支持。

Shiro通过干净直观的哈希API解决了这些问题。

例如，让我们考虑MD5散列文件并确定该散列的十六进制值的相对常见的情况。称为“校验和”，通常在提供文件下载时使用-用户可以对下载的文件执行自己的MD5哈希，并断言其校验和与下载站点上的校验和匹配。如果它们匹配，则用户可以充分假设文件在传输过程中未被篡改。

在没有Shiro的情况下，您可以尝试以下操作：

1. 将文件转换为字节数组。 JDK中没有任何东西可以帮助您解决此问题，因此您需要创建一个辅助方法，该方法可以打开FileInputStream，使用字节缓冲区并抛出适当的IOException等。

2. 使用MessageDigest类对字节数组进行哈希处理，以处理适当的异常，如下面的清单12所示。

3. 将散列字节数组编码为十六进制字符。 JDK中也没有任何东西可以提供帮助，因此您需要创建另一个帮助器方法，并可能在实现中使用按位运算和移位。

- Listing 12. JDK’s MessageDigest

```java
try {
    MessageDigest md = MessageDigest.getInstance("MD5");
    md.digest(bytes);
    byte[] hashed = md.digest();
} catch (NoSuchAlgorithmException e) {
    e.printStackTrace();
} 
```

对于如此简单且相对常见的事物而言，这是一项巨大的工作。 

现在，说明如何使用Shiro进行完全相同的操作。

```java
String hex = new Md5Hash(myFile).toHex(); 
```

使用Shiro简化所有工作时，了解正在发生的事情非常简单和容易。 

SHA-512哈希和密码的Base64编码也很容易。

```java
String encodedPassword =
    new Sha512Hash(password, salt, count).toBase64();
```

您会看到Shiro在很大程度上简化了哈希和编码，从而在此过程中节省了一些理智。

### 密码

密码是可以使用密钥可逆地转换数据的密码算法。我们使用它们来保护数据安全，尤其是在传输或存储数据时，尤其是在数据容易被撬开的时候。

如果您曾经使用过JDK密码API，尤其是javax.crypto.Cipher类，那么您就会知道，驯服它可能是一件极其复杂的事情。对于初学者来说，每种可能的Cipher配置始终由javax.crypto.Cipher的实例表示。

需要做公钥/私钥加密吗？

您使用密码。是否需要使用分组密码进行流操作？您使用密码。是否需要创建AES 256位密码来保护数据？您使用密码。你明白了。

以及如何创建所需的Cipher实例？

您创建了一个复杂的，不直观的，用令牌分隔的密码选项字符串，称为“转换字符串”，并将该字符串传递给Cipher.getInstance静态工厂方法。使用这种密码选项字符串方法，没有类型安全性来确保您使用有效的选项。这也隐含地意味着没有JavaDoc可以帮助您了解相关选项。而且，即使您知道配置正确，也需要处理经过检查的异常，以防您的字符串格式错误。如您所见，使用JDK Ciphers是一项繁琐的任务。这些技术很久以前曾经是Java API的标准，但是时代已经改变，我们希望有一种更简单的方法。

Shiro试图通过引入其CipherService API简化整个密码算法的概念。

大多数开发人员在保护数据时都希望使用CipherService：一种简单，无状态，线程安全的API，可以在一个方法调用中完整地加密或解密数据。您所需要做的就是提供密钥，然后可以根据需要加密或解密。

例如，可以使用256位AES加密，如下面的清单13所示。

- Listing 13. Apache Shiro’s Encryption API

```java
AesCipherService cipherService = new AesCipherService();
cipherService.setKeySize(256);
//create a test key:
byte[] testKey = cipherService.generateNewKey();

//encrypt a file’s bytes:
byte[] encrypted =
    cipherService.encrypt(fileBytes, testKey);
```

与JDK的Cipher API相比，Shiro示例更简单：

- 您可以直接实例化CipherService-没有奇怪或令人困惑的工厂方法。

- 密码配置选项表示为与JavaBeans兼容的getter和setter-没有奇怪且难以理解的“转换字符串”。

- 加密和解密在单个方法调用中执行。

- 没有强制检查的异常。 如果需要，请捕获Shiro的CryptoException。

Shiro的CipherService API还有其他好处，例如既支持基于字节数组的加密/解密（称为“块”操作），又支持基于流的加密/解密（例如，加密音频或视频）。

Java密码术不必太痛苦。 

Shiro的密码学支持旨在简化您保护数据安全的工作。

## web 支持

最后但并非最不重要的一点，我们将简要介绍Shiro的 web 支持。 

Shiro随附了强大的Web支持模块，以帮助保护Web应用程序。 

为Web应用程序设置Shiro很简单。 唯一需要做的就是在web.xml中定义一个Shiro Servlet过滤器。 

清单14显示了此代码。

- Listing 14. ShiroFilter in web.xml

```xml
<filter>
    <filter-name>ShiroFilter</filter-name>
    <filter-class>
        org.apache.shiro.web.servlet.IniShiroFilter
    </filter-class>
    <!-- no init-param means load the INI config
        from classpath:shiro.ini --> 
</filter>

<filter-mapping>
     <filter-name>ShiroFilter</filter-name>
     <url-pattern>/*</url-pattern>
</filter-mapping>
```

该过滤器可以读取上述的shiro.ini配置，因此无论部署环境如何，您都可以获得一致的配置体验。 

配置完成后，Shiro筛选器将筛选每个请求，并确保在请求期间可访问特定于请求的主题。 

并且因为它过滤了每个请求，所以您可以执行特定于安全性的逻辑，以确保仅允许满足特定条件的请求通过。

### URL特定的过滤器链

Shiro通过其创新的URL过滤器链接功能支持特定于安全性的过滤器规则。 

它允许您为任何匹配的URL模式指定临时过滤器链。 

这意味着您在使用Shiro的过滤机制执行安全规则（或规则组合）方面具有很大的灵活性-比仅在web.xml中定义过滤器要强得多。 

清单15显示了Shiro INI中的配置代码段。

- Listing 15. Path-specific Filter Chains

```ini
[urls]
/assets/** = anon
/user/signup = anon
/user/** = user
/rpc/rest/** = perms[rpc:invoke], authc
/** = authc
```

如您所见，Web应用程序有一个[urls] INI部分。对于每一行，等号左侧的值代表上下文相关的Web应用程序路径。右侧的值定义了一个Filter链-要对给定路径执行的Servlet过滤器的列表，以逗号分隔。

每个过滤器都是一个普通的Servlet过滤器，但是您在上面看到的过滤器名称（匿名，用户，权限，身份验证）是Shiro提供的与安全相关的特殊过滤器。

您可以混合使用这些安全过滤器，以创建非常自定义的安全体验。您还可以指定可能具有的任何其他现有Servlet过滤器。

与使用web.xml（定义一个过滤器块，然后定义一个分离的过滤器模式块）相比，这要好多少？

使用Shiro的方法，可以更轻松地准确查看针对给定匹配路径执行的过滤器链。

如果需要，可以在web.xml中仅定义Shiro过滤器，并在shiro.ini中定义所有其他过滤器和过滤器链，以使过滤器链定义机制比web.xml更加简洁明了。

即使您没有使用Shiro的任何安全功能，仅此一项小小的便利都可以使Shiro值得使用。

### JSP标签库

Shiro还提供了一个JSP标记库，通过该库，您可以根据当前Subject的状态来控制JSP页面的输出。 

一个有用的常见示例是在用户登录后显示 `Hello <username>` 文本。 

但是，如果它们是匿名的，则可能需要显示其他内容，例如 `Hello! Register Today!` 代替。 

清单16显示了如何使用Shiro的JSP标签支持这一点。

- Listing 16. JSP Taglib

```jsp
<%@ taglib prefix="shiro"
    uri="http://shiro.apache.org/tags" %>
...
<p>Hello
<shiro:user>
    <!-- shiro:principal prints out the Subject’s main
        principal - in this case, a username: -->
    <shiro:principal/>!
</shiro:user>
<shiro:guest>
    <!-- not logged in - considered a guest. Show
        the register link: -->
    ! <a href=”register.jsp”>Register today!</a>
</shiro:guest>
</p> 
```

还有其他标签可让您根据其拥有（或没有）的角色，分配（或未分配）哪些权限以及是否对它们进行身份验证，从“记住我”服务中记住这些权限或 匿名访客。

Shiro还支持许多其他特定于Web的功能，例如简单的“ Remember Me”服务，REST和BASIC身份验证，当然，如果要使用Shiro的本机企业会话，则当然还支持透明的HttpSession支持。 

### web 会话管理

最后，指出Shiro对网络环境中的会话的支持很有趣。

#### 默认Http会话

对于Web应用程序，Shiro将其会话基础结构默认为使用我们都习惯的现有Servlet容器会话。

也就是说，当您调用方法subject.getSession()和subject.getSession（boolean）时，Shiro将返回由Servlet容器的HttpSession实例支持的Session实例。

这种方法的优点在于，调用subject.getSession()的业务层代码与Shiro Session实例进行交互-它不具备与基于Web的HttpSession对象一起工作的“知识”。

在跨架构层保持清晰隔离时，这是一件非常好的事情。

#### Web层中Shiro的本机会话

如果您由于需要Shiro的企业会话功能（例如与容器无关的集群）而在Web应用程序中启用了Shiro的本机会话管理，那么您当然希望HttpServletRequest.getSession()和HttpSession API与“本机”会话一起使用，并且而不是Servlet容器会话。

如果您必须重构任何使用HttpServletRequest和HttpSession API的代码来替代使用Shiro的Session API，那将非常令人沮丧。

 Shiro当然不会期望您这样做。
 
 相反，Shiro完全实现了Servlet规范的Session部分，以支持Web应用程序中的本机会话。
 
 这意味着无论何时调用相应的HttpServletRequest或HttpSession方法调用，Shiro都会将这些调用委派给其内部的本地Session API。
 
 最终结果是，即使您使用的是Shiro的“本地”企业会话管理，也不必更改Web代码-确实是非常方便（且必不可少）的功能。

# 附加功能

Apache Shiro框架中还有其他对保护Java应用程序有用的功能，例如：

1, 线程和并发支持，用于跨线程维护主题（Executor和ExecutorService支持）

2. 可调用和可运行支持将逻辑作为特定主题执行

3. “运行方式”支持，用于假设另一个主题的身份（例如在管理应用程序中很有用）

4. 测试工具支持，使在单元测试和集成测试中对Shiro安全代码进行全面测试变得非常容易

# 框架局限性

就像我们希望的那样，Apache Shiro并不是“银弹”-它不会轻松解决所有安全问题。 

Shiro无法解决的某些事情可能值得了解：

## 虚拟机级别的问题

Apache Shiro当前不处理虚拟机级别的安全性，例如基于访问控制策略阻止某些类加载到类加载器中的能力。

但是，Shiro可以与现有的JVM安全操作集成是不可想象的-只是没有人为该项目做出过这样的贡献。

## 多阶段身份验证

Shiro当前不本地支持“多阶段”身份验证，在这种情况下，用户可能通过一种机制登录，只是被要求然后使用另一种机制再次登录。

这已在基于Shiro的应用程序中完成，但是该应用程序会预先收集所有必需的信息，然后与Shiro进行交互。很有可
能在将来的Shiro版本中支持此功能。

## 领域写入操作

目前，所有Realm实施都支持“读取”操作，以获取身份验证和授权数据以执行登录和访问控制。

不支持“写入”操作，例如创建用户帐户，组和角色，或将用户与角色组和权限相关联。这是因为支持这些操作的数据模型在不同的应用程序中差异很大，并且很难在所有Shiro用户上强制执行“写入” API。

# 小结

Apache Shiro 是功能齐全，健壮且通用的Java安全框架，可用于保护应用程序安全。 

通过简化应用程序安全性的四个领域，即身份验证，授权，会话管理和密码学，可以更轻松地在实际应用程序中理解和实现应用程序安全性。 

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Application Security With Apache Shiro](https://www.infoq.com/articles/apache-shiro/)

* any list
{:toc}