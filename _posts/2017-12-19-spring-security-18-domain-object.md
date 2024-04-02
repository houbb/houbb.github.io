---
layout: post
title:  Spring Security  Authorization  Domain Object Security (ACLs)
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

[Spring Security 安全响应头配置详解](https://www.toutiao.com/item/6918186604846842376/)

这一节我们来学习一下 spring security 的整体架构设计。

# 域对象安全性（ACL）

复杂的应用程序经常会发现需要定义访问权限，而不仅仅是在Web请求或方法调用级别。取而代之的是，安全决策需要同时包括谁（身份验证），哪里（方法调用）和什么（SomeDomainObject）。

换句话说，授权决策还需要考虑方法调用的实际域对象实例主题。

假设您正在设计宠物诊所​​的应用程序。基于Spring的应用程序将有两个主要的用户组：宠物诊所的工作人员以及宠物诊所的客户。

工作人员将有权访问所有数据，而您的客户只能看到他们自己的客户记录。为了使其更加有趣，您的客户可以允许其他用户查看其客户记录，例如其“幼稚园幼教”导师或本地“小马俱乐部”总裁。

## 实现方式

以Spring Security为基础，您可以使用几种方法：

- 编写您的业务方法以增强安全性。

您可以在“客户”域对象实例中查询集合，以确定哪些用户有权访问。通过使用SecurityContextHolder.getContext（）。getAuthentication（），您将能够访问Authentication对象。

- 编写一个AccessDecisionVoter以从存储在Authentication对象中的GrantedAuthority[] 实施安全性。

这意味着您的AuthenticationManager将需要使用自定义GrantedAuthority []填充Authentication，这些GrantedAuthority []代表主体可以访问的每个Customer域对象实例。

- 编写一个AccessDecisionVoter来增强安全性并直接打开目标客户域对象。

这意味着您的投票者需要访问DAO，以使其能够检索Customer对象。然后，它将访问“客户”对象的已批准用户的集合，并做出适当的决定。

这些方法中的每一种都是完全合法的。但是，第一个将您的授权检查与您的业务代码结合在一起。

这样做的主要问题包括单元测试的难度增加以及在其他地方重用客户授权逻辑会更加困难。

从Authentication对象获取GrantedAuthority []也可以，但是不能扩展到大量的Customer。

如果用户可能能够访问5,000个Customer（在这种情况下不太可能，但是可以想象如果它是大型Pony Club的受欢迎的兽医！），那么构造Authentication对象所需的内存消耗和所需时间将是不希望的。

最终的方法（直接从外部代码打开客户）可能是这三种方法中的最好方法。

它可以实现关注点分离，并且不会滥用内存或CPU周期，但是仍然效率低下，因为AccessDecisionVoter和最终的业务方法本身都会调用负责检索Customer对象的DAO。

每个方法调用两次访问显然是不可取的。

此外，列出每种方法后，您都需要从头开始编写自己的访问控制列表（ACL）持久性和业务逻辑。

幸运的是，还有另一种选择，我们将在下面讨论。

# 关键概念

Spring Security的ACL服务位于 `spring-security-acl-xxx.jar` 中。 

您需要将此JAR添加到类路径中，才能使用Spring Security的域对象实例安全功能。

Spring Security的域对象实例安全性功能以访问控制列表（ACL）的概念为中心。 

系统中的每个域对象实例都有其自己的ACL，并且该ACL记录了谁可以使用该域对象以及不能使用该域对象的详细信息。 考虑到这一点，Spring Security为您的应用程序提供了三个与ACL相关的主要功能：

- 一种有效地检索所有域对象的ACL条目的方法（并修改这些ACL）

- 确保在调用方法之前允许给定的主体处理对象的一种方法

- 在调用方法之后，一种确保给定的委托人可以使用您的对象（或它们返回的对象）的方法

如第一个项目要点所示，Spring Security ACL模块的主要功能之一是提供一种高性能的ACL检索方法。

这个ACL储存库功能非常重要，因为系统中的每个域对象实例可能都有多个访问控制项，并且每个ACL都可以从其他ACL继承为树状结构（Spring对此提供了开箱即用的支持）安全性，并且非常常用）。 

Spring Security的ACL功能经过精心设计，可提供高性能的ACL检索，以及可插入的缓存，最小化死锁的数据库更新，与ORM框架的独立性（我们直接使用JDBC），适当的封装以及透明的数据库更新。

## 默认主表

给定数据库对于ACL模块的操作至关重要，让我们研究一下实现中默认使用的四个主表。

下面是典型的Spring Security ACL部署中按大小顺序显示的表，最后列出的行数最多：

ACL_SID允许我们唯一地标识系统中的任何主体或权限（“ SID”代表“安全身份”）。唯一的列是ID，SID的文本表示形式以及用于指示文本表示形式是引用主体名称还是GrantedAuthority的标志。因此，每个唯一的主体或GrantedAuthority只有一行。当在接收许可的上下文中使用SID时，通常将其称为“收件人”。

ACL_CLASS允许我们唯一地标识系统中的任何域对象类。唯一的列是ID和Java类名称。因此，对于每个我们希望存储其ACL权限的唯一类，都有一行。

ACL_OBJECT_IDENTITY存储系统中每个唯一域对象实例的信息。列包括ID，ACL_CLASS表的外键，唯一标识符，因此我们知道我们要为其提供信息的ACL_CLASS实例，父级，ACL_SID表的外键以表示域对象实例的所有者，以及是否允许ACL条目从任何父ACL继承。对于要为其存储ACL权限的每个域对象实例，我们只有一行。

最后，ACL_ENTRY存储分配给每个收件人的个人权限。列包括ACL_OBJECT_IDENTITY的外键，接收者（即ACL_SID的外键），是否进行审核以及表示授予或拒绝的实际权限的整数位掩码。对于接收到使用域对象的权限的每个收件人，我们只有一行。


## 整数位掩码

如上一段所述，ACL系统使用整数位掩码。

不用担心，您不需要了解使用ACL系统的位转换的优点，但是只要说我们有32位可以打开或关闭就可以了。

这些位中的每一个代表一个权限，默认情况下，权限为读取（位0），写入（位1），创建（位2），删除（位3）和管理（位4）。如果您希望使用其他权限，则可以轻松实现自己的Permission实例，并且ACL框架的其余部分将在不了解扩展的情况下运行。

请务必了解，系统中域对象的数量与我们选择使用整数位掩码这一事实完全无关。虽然您有32位可用的权限，但是您可能有数十亿个域对象实例（这意味着ACL_OBJECT_IDENTITY中的数十亿行，很可能是ACL_ENTRY）。

之所以说出这一点，是因为我们发现有时人们会误以为每个潜在的域对象都需要一点东西，事实并非如此。

## 核心接口

现在，我们已经基本概述了ACL系统的功能以及它在表结构中的外观，下面我们来探讨关键界面。

关键接口是：

Acl：每个域对象只有一个Acl对象，该Acl对象在内部保存AccessControlEntry，并且知道Acl的所有者。 Acl不直接引用域对象，而是引用ObjectIdentity。 Acl存储在ACL_OBJECT_IDENTITY表中。

AccessControlEntry：一个Acl包含多个AccessControlEntry，在框架中通常将其缩写为ACE。每个ACE都引用Permission，Sid和Acl的特定元组。 ACE也可以是授予或不授予的，并且包含审核设置。 ACE存储在ACL_ENTRY表中。

权限：权限表示特定的不可变位掩码，并提供用于位掩码和输出信息的便捷功能。上面显示的基本权限（第0位至第4位）包含在BasePermission类中。

Sid：ACL模块需要引用主体和GrantedAuthority []。 Sid接口提供了一个间接级别，它是“安全身份”的缩写。常见的类包括PrincipalSid（代表Authentication对象中的主体）和GrantedAuthoritySid。安全标识信息存储在ACL_SID表中​​。

ObjectIdentity：每个域对象在ACL模块内部由一个ObjectIdentity表示。默认实现称为ObjectIdentityImpl。

AclService：检索适用于给定ObjectIdentity的Acl。在包含的实现（JdbcAclService）中，将检索操作委托给LookupStrategy。 LookupStrategy提供了一种高度优化的策略，用于使用批量检索（BasicLookupStrategy）来检索ACL信息，并支持利用实例化视图，分层查询和类似的以性能为中心的非ANSI SQL功能的自定义实现。

MutableAclService：允许显示修改的Acl以保持持久性。如果您不愿意，则不必使用此界面。

请注意，我们现成的AclService和相关数据库类均使用ANSI SQL。因此，这应该适用于所有主要数据库。在撰写本文时，已使用Hypersonic SQL，PostgreSQL，Microsoft SQL Server和Oracle对系统进行了成功的测试。

Spring Security附带了两个示例，它们演示了ACL模块。第一个是联系人样本，另一个是文档管理系统（DMS）样本。

# 入门

要开始使用Spring Security的ACL功能，您需要将ACL信息存储在某处。

这需要使用Spring实例化数据源。

然后将数据源注入到JdbcMutableAclService和BasicLookupStrategy实例中。

后者提供高性能的ACL检索功能，而前者提供了mutator功能。

有关示例配置，请参阅Spring Security附带的示例之一。您还需要使用上一节中列出的四个特定于ACL的表格填充数据库（有关适当的SQL语句，请参阅ACL示例）。

创建所需的架构并实例化JdbcMutableAclService之后，接下来需要确保您的域模型支持与Spring Security ACL软件包的互操作性。

希望ObjectIdentityImpl可以证明是足够的，因为它提供了多种使用方式。

大多数人将拥有包含公共Serializable getId（）方法的域对象。如果返回类型很长，或者与long兼容（例如int），您将发现不需要进一步考虑ObjectIdentity问题。

ACL模块的许多部分都依赖长标识符。如果您使用的不是long类型（或int，byte等），则很有可能需要重新实现许多类。

我们不打算在Spring Security的ACL模块中支持非长标识符，因为长已经与所有数据库序列（最常见的标识符数据类型）兼容，并且长度足以容纳所有常见的使用情况。

以下代码片段显示了如何创建Acl或修改现有的Acl：

```java
// Prepare the information we'd like in our access control entry (ACE)
ObjectIdentity oi = new ObjectIdentityImpl(Foo.class, new Long(44));
Sid sid = new PrincipalSid("Samantha");
Permission p = BasePermission.ADMINISTRATION;

// Create or update the relevant ACL
MutableAcl acl = null;
try {
acl = (MutableAcl) aclService.readAclById(oi);
} catch (NotFoundException nfe) {
acl = aclService.createAcl(oi);
}

// Now grant some permissions via an access control entry (ACE)
acl.insertAce(acl.getEntries().length, p, sid, true);
aclService.updateAcl(acl);
```

在上面的示例中，我们检索了与标识符为44的“ Foo”域对象相关联的ACL。然

后，我们添加了一个ACE，以便名为“ Samantha”的主体可以“管理”该对象。除了insertAce方法外，代码片段是相对不言自明的。 

insertAce方法的第一个参数是确定新条目将在Acl中的哪个位置插入。在上面的示例中，我们只是将新ACE放在现有ACE的末尾。最后一个参数是布尔值，指示ACE是授予还是拒绝。在大多数情况下，它将被授予（true），但如果拒绝（false），则实际上将阻止该权限。

Spring Security不提供任何特殊的集成来自动创建，更新或删除ACL，这是DAO或存储库操作的一部分。

相反，您将需要为单个域对象编写如上所示的代码。值得考虑的是在服务层上使用AOP来自动将ACL信息与服务层操作集成在一起。过去，我们发现这是一种非常有效的方法。

使用上述技术在数据库中存储一些ACL信息后，下一步就是实际将ACL信息用作授权决策逻辑的一部分。

您在这里有很多选择。您可以编写自己的AccessDecisionVoter或AfterInvocationProvider，它们分别在方法调用之前或之后触发。

这样的类将使用AclService检索相关的ACL，然后调用Acl.isGranted（Permission []权限，Sid [] sids，布尔型管理模式）来确定是授予还是拒绝权限。或者，您可以使用我们的AclEntryVoter，AclEntryAfterInvocationProvider或AclEntryAfterInvocationCollectionFilteringProvider类。

所有这些类都提供了一种基于声明的方法，用于在运行时评估ACL信息，使您无需编写任何代码。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}