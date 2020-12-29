---
layout: post
title: Shiro-07-Session Management  会话管理
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 会话管理

Apache Shiro在 安全性框架世界中提供了一些独特的功能：适用于任何应用程序的完整的企业级Session解决方案，从最简单的命令行和智能手机应用程序到最大的群集企业Web应用程序。

这对许多应用程序都有很大的影响-在Shiro之前，如果需要会话支持，则需要将应用程序部署在Web容器中或使用EJB状态会话Bean。 

Shiro的Session支持比这两种机制中的任何一种都更易于使用和管理，并且在任何应用程序中都可以使用，而不论其容器如何。

即使将应用程序部署在Servlet或EJB容器中，仍然有令人信服的理由使用Shiro的Session支持而不是容器的支持。 

下面列出了Shiro的会话支持提供的最理想的功能：

## 特征

- 基于POJO / J2SE（对IoC友好）

Shiro中的所有内容（包括会话和会话管理的所有方面）都是基于接口的，并使用POJO来实现。

这使您可以轻松地使用与JavaBeans兼容的任何配置格式来配置所有会话组件，例如JSON，YAML，Spring XML或类似机制。

您还可以轻松扩展Shiro的组件或根据需要编写自己的组件，以完全自定义会话管理功能。

- 轻松自定义会话存储

由于Shiro的会话对象基于POJO，因此会话数据可以轻松存储在任意数量的数据源中。

这使您可以精确地自定义应用程序的会话数据所在的位置，例如文件系统，内存，网络分布式缓存，关系数据库或专有数据存储中的文件系统。

- 独立于容器的集群！

使用任何易于使用的网络缓存产品（例如Ehcache + Terracotta，Coherence，GigaSpaces等），可以轻松地对Shiro的会话进行集群。

等这意味着您只能为Shiro配置一次会话群集，并且无论部署到哪个容器，您的会话都将以相同的方式群集。无需特定于容器的配置！

- 异构客户端访问

与EJB或Web会话不同，Shiro会话可以在各种客户端技术之间“共享”。

例如，桌面应用程序可以“查看”和“共享” Web应用程序中同一用户使用的同一物理会话。除了Shiro之外，我们没有其他可以支持此功能的框架。

- 事件监听器

通过事件监听器，您可以监听会话生命周期中的生命周期事件。您可以侦听这些事件并对它们做出反应，以实现自定义应用程序的行为-例如，在其会话期满时更新用户记录。

- 主机地址保留

Shiro会话保留从其发起会话的主机的IP地址或主机名。这使您可以确定用户所在的位置并做出相应的反应（在IP关联是确定性的Intranet环境中通常很有用）。

- 不活动/到期支持

会话由于不活动而到期，如预期的那样，但是可以通过touch（）方法延长会话的时间，以保持其“活动”状态。这在Rich Internet Application（RIA）环境中非常有用，在该环境中，用户可能正在使用桌面应用程序，但可能不会与服务器定期进行通信，但是服务器会话不应过期。

- 透明的 Web 使用

Shiro的网络支持完全实现并支持Session的Servlet 2.5规范（HttpSession接口及其所有关联的API）。这意味着您可以在现有的网络应用程序中使用Shiro会话，而无需更改任何现有的网络代码。

- 可以用于SSO

由于Shiro会话基于POJO，因此可以轻松存储在任何数据源中，并且可以根据需要在应用程序之间“共享”它们。

我们将其称为“穷人SSO”，由于共享会话可以保留身份验证状态，因此可以用于提供简单的登录体验。

# 使用会话

与Shiro中的几乎所有其他内容一样，您可以通过与当前正在执行的Subject进行交互来获取Session：

主题currentUser = SecurityUtils.getSubject（）;

```java
Subject currentUser = SecurityUtils.getSubject();

Session session = currentUser.getSession();
session.setAttribute( "someKey", someValue);
```

对于熟悉HttpServletRequest API的用户，Subject.getSession（boolean create）方法的功能与HttpServletRequest.getSession（boolean create）方法相同：

- 如果Subject已经有一个Session，则布尔参数将被忽略，并立即返回Session

- 如果主题还没有会话，并且create boolean参数为true，则将创建并返回一个新会话。

- 如果主题还没有会话，并且create boolean参数为false，则不会创建新的会话，并且返回null。

getSession调用可以在任何应用程序中使用，甚至可以在非Web应用程序中使用。

在开发框架代码时可以使用subject.getSession（false）取得良好效果，以确保不必要地创建Session。

获取主题的会话后，您可以使用它进行很多操作，例如设置或检索属性，设置其超时等等。请参阅会话JavaDoc，以查看单个会话可以执行的操作。

# 会话管理器

顾名思义，SessionManager可以管理应用程序中所有主题的会话-创建，删除，不活动和验证等。

与Shiro中的其他核心体系结构组件一样，SessionManager是SecurityManager维护的顶级组件。

默认的SecurityManager实现默认使用开箱即用的DefaultSessionManager。 

DefaultSessionManager实现提供了应用程序所需的所有企业级会话管理功能，例如会话验证，孤立清除等。可以在任何应用程序中使用。

- 网络应用

Web应用程序使用不同的SessionManager实现。请参阅Web文档以获取特定于Web的会话管理信息。

与由SecurityManager管理的所有其他组件一样，可以在Shiro的所有默认SecurityManager实现（getSessionManager（）/ setSessionManager（））上通过JavaBeans风格的gettersetter方法获取或设置SessionManager。

或者例如，如果使用shiro.ini配置：

在shiro.ini中配置新的SessionManager

```ini
[main]
...
sessionManager = com.foo.my.SessionManagerImplementation
securityManager.sessionManager = $sessionManager
```

但是从头开始创建SessionManager是一项复杂的任务，而不是大多数人希望自己做的事情。 

Shiro的现成SessionManager实施具有高度可定制性和可配置性，将满足大多数需求。

本文档的其余大部分内容都假定您在涵盖配置选项时将使用Shiro的默认SessionManager实现，但是请注意，您基本上可以创建或插入几乎任何您想要的东西。

## 会话超时

默认情况下，Shiro的SessionManager实现默认为30分钟的会话超时。

也就是说，如果创建的任何会话在30分钟或更长时间内保持空闲状态（未使用，其lastAccessedTime未被更新），则该会话被视为已过期，将不再被使用。

您可以设置默认的SessionManager实现的globalSessionTimeout属性，以定义所有会话的默认超时值。

例如，如果您希望超时是一个小时而不是30分钟：

- 在shiro.ini中设置默认会话超时

```ini
[main]
...
# 3,600,000 milliseconds = 1 hour
securityManager.sessionManager.globalSessionTimeout = 3600000
```

- Per-Session Timeout

上面的globalSessionTimeout值是所有新创建的Session的默认值。 

您可以通过设置各个会话的超时值来控制每个会话的会话超时。 

像上面的globalSessionTimeout一样，该值是以毫秒为单位的时间（而不是秒）。

## 会话监听器

Shiro支持SessionListener的概念，可让您在重要的会话事件发生时对其做出反应。 

您可以实现SessionListener接口（或扩展便捷性SessionListenerAdapter）并相应地对会话操作做出反应。

由于默认的SessionManager sessionListeners属性是一个集合，因此可以像在shiro.ini中的任何其他集合一样，使用一个或多个侦听器实现配置SessionManager：

- shiro.ini中的SessionListener配置

```ini
[main]
...
aSessionListener = com.foo.my.SessionListener
anotherSessionListener = com.foo.my.OtherSessionListener

securityManager.sessionManager.sessionListeners = $aSessionListener, $anotherSessionListener, etc.
```

- 所有会议活动

当任何会话（不仅是特定会话）发生事件时，都会通知SessionListeners。

# 会话存储

每当创建或更新会话时，其数据都需要保留到存储位置，以便应用程序稍后可以访问它。

类似地，当会话无效并被更长时间使用时，需要将其从存储中删除，以免会话数据存储空间耗尽。 

SessionManager实现将这些创建/读取/更新/删除（CRUD）操作委派给内部组件SessionDAO，该组件反映了数据访问对象（DAO）设计模式。

SessionDAO的功能是您可以实现此接口，以与所需的任何数据存储进行通信。

这意味着您的会话数据可以驻留在内存中，文件系统上，关系数据库或NoSQL数据存储区中，或您需要的任何其他位置。您可以控制持久性行为。

您可以将任何SessionDAO实现配置为默认SessionManager实例上的属性。

例如，在shiro.ini中：

- 在shiro.ini中配置SessionDAO

```ini
[main]
...
sessionDAO = com.foo.my.SessionDAO
securityManager.sessionManager.sessionDAO = $sessionDAO
```

但是，正如您可能期望的那样，Shiro已经拥有一些不错的SessionDAO实现，您可以根据需要使用它们开箱即用或子类。

- 网络应用

上面的 `securityManager.sessionManager.sessionDAO = $sessionDAO` 分配仅在使用Shiro本机会话管理器时有效。 

默认情况下，Web应用程序不使用本机会话管理器，而是保留不支持SessionDAO的Servlet容器的默认会话管理器。 

如果要在基于Web的应用程序中启用SessionDAO进行自定义会话存储或会话群集，则必须首先配置本机Web会话管理器。 

例如：

```ini
[main]
...
sessionManager = org.apache.shiro.web.session.mgt.DefaultWebSessionManager
securityManager.sessionManager = $sessionManager

# Configure a SessionDAO and then set it:
securityManager.sessionManager.sessionDAO = $sessionDAO
```

- 配置一个SessionDAO！

Shiro的默认配置本机SessionManager使用仅内存中的Session存储。 

这不适用于大多数生产应用。 

大多数生产应用程序将需要配置提供的EHCache支持（请参见下文）或提供自己的SessionDAO实现。 

请注意，默认情况下，Web应用程序使用基于Servlet容器的SessionManager，并且不会出现此问题。 

这只是使用Shiro本机SessionManager时的问题。

## EHCache SessionDAO

默认情况下，未启用EHCache，但如果您不打算实施自己的SessionDAO，则强烈建议您为Shiro的SessionManagement启用EHCache支持。 

EHCache SessionDAO将会话存储在内存中，如果内存受到限制，则支持向磁盘溢出。对于生产应用程序而言，这非常需要确保您在运行时不会随机“丢失”会话。

- 使用EHCache作为默认值

如果您不编写自定义SessionDAO，则一定要在Shiro配置中启用EHCache。

除了会话之外，EHCache还可以带来好处，还可以缓存身份验证和授权数据。

有关更多信息，请参见缓存文档。

- 与容器无关的会话群集

如果快速需要独立于容器的会话群集，EHCache也是一个不错的选择。您可以将TerraCotta透明地插入EHCache后面，并具有与容器无关的群集会话缓存。

无需再担心Tomcat，JBoss，Jetty，WebSphere或WebLogic特定的会话集群了！

为会话启用EHCache非常容易。首先，请确保您在类路径中有 `shiro-ehcache-<version>.jar` 文件（请参见下载页面或使用Maven或Ant + Ivy）。

进入类路径后，第一个shiro.ini示例将向您展示如何使用EHCache满足Shiro的所有缓存需求（而不仅仅是Session支持）：

- 在shiro.ini中为Shiro的所有缓存需求配置EHCache

```ini
[main]

sessionDAO = org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
securityManager.sessionManager.sessionDAO = $sessionDAO

cacheManager = org.apache.shiro.cache.ehcache.EhCacheManager
securityManager.cacheManager = $cacheManager
```

最后一行 `securityManager.cacheManager = $cacheManager`，为Shiro的所有需求配置了CacheManager。该CacheManager实例将自动向下传播到SessionDAO（通过实现CacheManagerAware接口的EnterpriseCacheSessionDAO的本质）。

然后，当SessionManager要求EnterpriseCacheSessionDAO保留会话时，它将使用EHCache支持的Cache实现来存储Session数据。

- 网络应用

使用Shiro本机SessionManager实现时，请不要忘记分配SessionDAO是一项功能。 

Web应用程序默认情况下使用不支持SessionDAO的基于Servlet容器的SessionManager。

如果要在Web应用程序中使用基于Ehcache的会话存储，请按照上述说明配置本机Web SessionManager。

### EHCache会话缓存配置

默认情况下，EhCacheManager使用特定于Shiro的ehcache.xml文件来设置会话高速缓存区域和必要的设置，以确保正确存储和检索会话。

但是，如果您希望更改缓存设置，或者配置自己的ehcache.xml或EHCache net.sf.ehcache.CacheManager实例，则需要配置缓存区域以确保正确处理会话。

如果查看默认的ehcache.xml文件，将看到以下shiro-activeSessionCache缓存配置：

```xml
<cache name="shiro-activeSessionCache"
       maxElementsInMemory="10000"
       overflowToDisk="true"
       eternal="true"
       timeToLiveSeconds="0"
       timeToIdleSeconds="0"
       diskPersistent="true"
       diskExpiryThreadIntervalSeconds="600"/>
```

如果您希望使用自己的ehcache.xml文件，请确保已为Shiro的需求定义了类似的缓存条目。

您很可能会更改maxElementsInMemory属性值来满足您的需求。

但是，在您自己的配置中至少存在以下两个属性（并且不会更改）是非常重要的：

- overflowToDisk="true"

这样可以确保如果进程内存不足，会话也不会丢失并且可以序列化到磁盘上

- eternal="true"

确保缓存条目（会话实例）永远不会被缓存自动过期或删除。

这是必需的，因为Shiro会根据计划的过程进行自己的验证（请参见下面的“会话验证和计划”）。

如果将其关闭，则缓存可能会在Shiro不了解​​的情况下逐出Sessions，这可能会导致问题。

### EHCache会话缓存名称

默认情况下，EnterpriseCacheSessionDAO向CacheManager询问名为“shiro-activeSessionCache”的缓存。

如上所述，期望在ehcache.xml中配置此缓存名称/区域。

如果要使用其他名称代替该默认名称，则可以在EnterpriseCacheSessionDAO上配置该名称，例如：

在shiro.ini 中为Shiro的活动会话缓存配置缓存名称

```ini
...
sessionDAO = org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
sessionDAO.activeSessionsCacheName = myname
...
```

只需确保ehcache.xml中的相应条目与该名称匹配，并且如上所述，您已配置了overflowToDisk =“ true”和eternal =“ true”。

## 自定义会话ID

Shiro的SessionDAO实现使用内部SessionIdGenerator组件在每次创建新会话时生成一个新的Session ID。

生成ID，将其分配给新创建的Session实例，然后通过SessionDAO保存该Session。

默认的SessionIdGenerator是JavaUuidSessionIdGenerator，它基于Java UUID生成字符串ID。此实现适用于所有生产环境。

如果这不能满足您的需要，则可以实现SessionIdGenerator接口，并在Shiro的SessionDAO实例上配置实现。

例如，在shiro.ini中：

- 在shiro.ini中配置SessionIdGenerator

```ini
[main]
...
sessionIdGenerator = com.my.session.SessionIdGenerator
securityManager.sessionManager.sessionDAO.sessionIdGenerator = $sessionIdGenerator
```

# 会话验证和调度

必须验证会话，以便可以从会话数据存储中删除任何无效（过期或停止）的会话。这样可以确保数据存储不会随着时间的流逝而填满，这些会话将永远不会再次使用。

出于性能原因，仅验证会话以查看它们在被访问时是否已停止或过期（即subject.getSession（））。

这意味着，如果没有其他定期的定期验证，则会话孤立对象将开始填充会话数据存储。

一个说明孤立的常见示例是网络浏览器场景：假设用户登录到网络应用程序，并创建了一个会话来保留数据（身份验证状态，购物车等）。

如果用户在应用程序不知道的情况下不注销并关闭浏览器，则他们的会话本质上只是在会话数据存储中“四处闲逛”（孤立）。

SessionManager无法检测到用户不再使用其浏览器，并且该会话再也不会被访问（它是孤立的）。

如果不定期清除孤立会话（Session orphans），它们将填满会话数据存储区（这很糟糕）。

因此，为防止孤立会话堆积，SessionManager实现支持SessionValidationScheduler的概念。 

SessionValidationScheduler负责定期验证会话，以确保在必要时进行清理。

## 默认SessionValidationScheduler

在所有环境中可用的默认SessionValidationScheduler是ExecutorServiceSessionValidationScheduler，它使用JDK ScheduledExecutorService控制验证应多久进行一次。

默认情况下，此实现将每小时执行一次验证。您可以通过指定ExecutorServiceSessionValidationScheduler的新实例并指定其他间隔（以毫秒为单位）来更改验证发生的速率：

- shiro.ini中的ExecutorServiceSessionValidationScheduler间隔

```ini
[main]
...
sessionValidationScheduler = org.apache.shiro.session.mgt.ExecutorServiceSessionValidationScheduler
# Default is 3,600,000 millis = 1 hour:
sessionValidationScheduler.interval = 3600000

securityManager.sessionManager.sessionValidationScheduler = $sessionValidationScheduler
```

## 自定义 SessionValidationScheduler

如果希望提供自定义SessionValidationScheduler实现，则可以将其指定为默认SessionManager实例的属性。

例如，在shiro.ini中：

在shiro.ini中配置自定义SessionValidationScheduler

```ini
[main]
...
sessionValidationScheduler = com.foo.my.SessionValidationScheduler
securityManager.sessionManager.sessionValidationScheduler = $sessionValidationScheduler
```

## 禁用会话验证

在某些情况下，您可能希望完全禁用会话验证，因​​为您在Shiro的控制范围之外设置了一个流程来为您执行验证。

例如，也许您正在使用企业缓存，并依靠缓存的生存时间设置来自动清除旧会话。

或者，也许您已经设置了cron作业来自动清除自定义数据存储。

在这些情况下，您可以关闭会话验证计划：

- 在shiro.ini中禁用会话验证计划

```ini
[main]
...
securityManager.sessionManager.sessionValidationSchedulerEnabled = false
```

从会话数据存储中检索会话后，会话仍将被验证，但这将禁用Shiro的定期验证。

- 在某处启用会话验证

如果关闭Shiro的会话验证计划程序，则必须通过其他某种机制（定时作业等）执行定期的会话验证。这是确保会话孤儿不填满数据存储的唯一方法。

## 无效的会话删除

如上所述，定期进行会话验证的目的主要是删除所有无效（过期或已停止）会话，以确保它们不会填满会话数据存储区。

默认情况下，无论何时Shiro检测到无效的会话，它都会尝试通过SessionDAO.delete（session）方法将其从基础会话数据存储区中删除。对于大多数应用程序来说，这是一个很好的做法，可确保不会耗尽会话数据存储空间。

但是，某些应用程序可能不希望Shiro自动删除会话。

例如，如果应用程序提供了支持可查询数据存储的SessionDAO，则应用程序团队可能希望在一定时间内可以使用旧的或无效的会话。这将使团队可以对数据存储区运行查询，以查看例如用户在上周创建了多少会话，或者用户会话的平均持续时间，或类似的报告类型查询。

在这些情况下，您可以完全关闭无效的会话删除。

例如，在shiro.ini中：

- 在shiro.ini中禁用无效的会话删除

```ini
[main]
...
securityManager.sessionManager.deleteInvalidSessions = false
```

不过要小心！如果关闭此功能，则有责任确保会话数据存储区不会耗尽其空间。您必须自己从数据存储中删除无效的会话！

另请注意，即使您阻止Shiro删除无效的会话，您仍应以某种方式启用会话验证-通过Shiro的现有验证机制或通过您自己提供的自定义机制（有关更多信息，请参见上面的“禁用会话验证”部分）。

验证机制将更新您的会话记录以反映无效状态（例如，无效状态，上次访问时间等），即使您自己在其他时间手动将其删除。

- 警告

如果您配置Shiro使其不删除无效的会话，则您有责任确保会话数据存储区不会耗尽其空间。您必须自己从数据存储中删除无效的会话！

另请注意，禁用会话删除与禁用会话验证计划不同。您几乎应该始终使用会话验证调度机制-Shiro直接支持的一种或您自己的机制。

# 会话集群（Session Clustering）

关于Apache Shiro的会话功能，非常令人兴奋的事情之一是，您可以在本地群集主题会话，而无需再担心如何根据容器环境对会话进行群集。

也就是说，如果您使用Shiro的本机会话并配置会话集群，则可以部署到开发中的Jetty或Tomcat，生产中的JBoss或Geronimo或任何其他环境-始终不用担心特定于容器/环境的问题群集设置或配置。

在Shiro中只需配置一次会话群集，无论您的部署环境如何，它都可以正常工作。

那么它是怎样工作的？

由于Shiro基于POJO的N层架构，因此启用会话群集就像在会话持久性级别启用群集机制一样简单。也就是说，如果您配置了具有群集功能的SessionDAO，则DAO可以与群集机制进行交互，而Shiro的SessionManager则无需了解群集问题。

## 分布式缓存

分布式缓存，例如 Ehcache + TerraCotta，GigaSpaces Oracle Coherence 和 Memcached（以及许多其他缓存）已经解决了持久化级别的分布式数据问题。

因此，在Shiro中启用会话群集就像将Shiro配置为使用分布式缓存一样简单。

这使您可以灵活地选择适合您的环境的确切群集机制。

- 高速缓存存储器

请注意，当启用分布式/企业缓存作为您的会话群集数据存储时，以下两种情况之一必须为真：

1. 分布式缓存具有足够的群集范围内存来保留所有活动/当前会话

2. 如果分布式缓存没有足够的群集范围内存来保留所有活动会话，则它必须支持磁盘溢出，因此会话不会丢失。

缓存不支持这两种情况中的任何一种都会导致会话随机丢失，这可能使最终用户感到沮丧。

## EnterpriseCacheSessionDAO

如您所料，Shiro已经提供了SessionDAO实现，它将数据持久保存到企业/分布式缓存中。 

EnterpriseCacheSessionDAO希望在其上配置Shiro Cache或CacheManager，以便可以利用缓存机制。

例如，在shiro.ini中：

```ini
#This implementation would use your preferred distributed caching product's APIs:
activeSessionsCache = my.org.apache.shiro.cache.CacheImplementation

sessionDAO = org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
sessionDAO.activeSessionsCache = $activeSessionsCache

securityManager.sessionManager.sessionDAO = $sessionDAO
```

尽管您可以如上所述将Cache实例直接注入到SessionDAO中，但是通常配置通用的CacheManager来满足Shiro的所有缓存需求（会话以及身份验证和授权数据）通常更为常见。

在这种情况下，您无需直接配置Cache实例，而应告诉EnterpriseCacheSessionDAO CacheManager中用于存储活动会话的缓存名称。

例如：

```ini
# This implementation would use your caching product's APIs:
cacheManager = my.org.apache.shiro.cache.CacheManagerImplementation

# Now configure the EnterpriseCacheSessionDAO and tell it what
# cache in the CacheManager should be used to store active sessions:
sessionDAO = org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
# This is the default value.  Change it if your CacheManager configured a different name:
sessionDAO.activeSessionsCacheName = shiro-activeSessionsCache
# Now have the native SessionManager use that DAO:
securityManager.sessionManager.sessionDAO = $sessionDAO

# Configure the above CacheManager on Shiro's SecurityManager
# to use it for all of Shiro's caching needs:
securityManager.cacheManager = $cacheManager
```

但是上述配置有些奇怪。你注意到了吗？

关于此配置的有趣之处在于，我们在配置中没有任何地方实际告诉sessionDAO实例使用Cache或CacheManager！

那么sessionDAO如何使用分布式缓存？

当Shiro初始化SecurityManager时，它将检查SessionDAO是否实现CacheManagerAware接口。如果是这样，它将自动提供任何可用的全局配置的CacheManager。

因此，当Shiro评估securityManager.cacheManager = $ cacheManager行时，它将发现EnterpriseCacheSessionDAO实现CacheManagerAware接口，并使用配置的CacheManager作为方法参数调用setCacheManager方法。

然后在运行时，当EnterpriseCacheSessionDAO需要activeSessionsCache时，它将使用activeSessionsCacheName作为查找键来获取Cache实例，从而要求CacheManager实例将其返回。该Cache实例（由您的分布式/企业缓存产品的API支持）将用于存储和检索所有SessionDAO CRUD操作的会话。

## Ehcache + Terracotta

人们在使用Shiro时获得成功的一种分布式缓存解决方案是Ehcache + Terracotta配对。

有关如何使用Ehcache启用分布式缓存的完整详细信息，请参阅Ehcache托管的Terracotta分布式缓存文档。

一旦您将Terracotta群集与Ehcache配合使用，特定于Shiro的部分就非常简单。阅读并遵循Ehcache SessionDAO文档，但我们需要进行一些更改

先前引用的Ehcache会话缓存配置将不起作用-需要特定于Terracotta的配置。这是经过测试可以正常工作的示例配置。

将其内容保存在文件中，并将其保存在ehcache.xml文件中：

- TerraCotta 会话群集

```xml
<ehcache>
    <terracottaConfig url="localhost:9510"/>
    <diskStore path="java.io.tmpdir/shiro-ehcache"/>
    <defaultCache
            maxElementsInMemory="10000"
            eternal="false"
            timeToIdleSeconds="120"
            timeToLiveSeconds="120"
            overflowToDisk="false"
            diskPersistent="false"
            diskExpiryThreadIntervalSeconds="120">
        <terracotta/>
    </defaultCache>
    <cache name="shiro-activeSessionCache"
           maxElementsInMemory="10000"
           eternal="true"
           timeToLiveSeconds="0"
           timeToIdleSeconds="0"
           diskPersistent="false"
           overflowToDisk="false"
           diskExpiryThreadIntervalSeconds="600">
        <terracotta/>
    </cache>
    <!-- Add more cache entries as desired, for example,
         Realm authc/authz caching: -->
</ehcache>
```

当然，您将需要更改 `<terracottaConfig url="localhost:9510"/>` 条目以引用Terracotta服务器阵列的相应主机/端口。 

还要注意，与之前的配置不同，ehcache-activeSessionCache元素不将diskPersistent或overflowToDisk属性设置为true。 

它们都应该为false，因为在群集配置中不支持true值。

保存此ehcache.xml文件后，我们需要在Shiro的配置中引用该文件。 

假设您已经在类路径的根目录下访问了特定于Terracotta的ehcache.xml文件，以下是最终的Shiro配置，该配置可启用Terracotta + Ehcache集群以满足Shiro的所有需求（包括Sessions）：

shiro.ini，用于使用Ehcache和Terracotta进行会话群集

```ini
sessionDAO = org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
# This name matches a cache name in ehcache.xml:
sessionDAO.activeSessionsCacheName = shiro-activeSessionsCache
securityManager.sessionManager.sessionDAO = $sessionDAO

# Configure The EhCacheManager:
cacheManager = org.apache.shiro.cache.ehcache.EhCacheManager
cacheManager.cacheManagerConfigFile = classpath:ehcache.xml

# Configure the above CacheManager on Shiro's SecurityManager
# to use it for all of Shiro's caching needs:
securityManager.cacheManager = $cacheManager
```

请记住，ORDER MATTERS。 

通过最后在securityManager上配置cacheManager，我们确保CacheManager可以传播到所有先前配置的CacheManagerAware组件（例如EnterpriseCachingSessionDAO）。

## Zookeeper

用户已经报告使用Apache Zookeeper来管理/协调分布式会话。 

如果您有任何有关此操作方式的文档/评论，请将其发布到Shiro邮件列表中

# 会议和主题状态

## 有状态的应用程序（允许会话）

默认情况下，Shiro的SecurityManager实施将使用主题的会话作为一种策略来存储主题的身份（PrincipalCollection）和身份验证状态（subject.isAuthenticated（）），以供继续参考。

这通常在主题登录后或通过RememberMe服务发现主题的身份时发生。

这种默认方法有一些好处：

（1）服务请求，调用或消息的任何应用程序都可以将会话ID与请求/调用/消息有效负载相关联，而这正是Shiro要将用户与入站请求相关联所必需的。

例如，如果使用Subject.Builder，这就是获取关联的Subject所需的全部：

```java
Serializable sessionId = //get from the inbound request or remote method invocation payload Subject requestSubject = new Subject.Builder().sessionId(sessionId).buildSubject();
```

这对于大多数Web应用程序以及编写远程处理或消息传递框架的任何人都非常方便。 

（实际上，这是Shiro的网络支持以其自己的框架代码将Subject与ServletRequest关联的方式）。

（2）首次访问时，在初始请求中找到的任何“RememberMe”身份都可以保留到会话中。

这样可以确保可以在请求中保存主题记忆的身份，而无需在每个请求上反序列化和解密身份。

例如，在Web应用程序中，如果会话中已知身份，则无需在每个请求上都读取加密的RememberMe cookie。这可以是很好的性能增强。

尽管上述默认策略对大多数应用程序来说都是很好的（并且通常是理想的），但是在尝试尽可能无状态的应用程序中这不是理想的。许多无状态架构要求在请求之间不能存在持久状态，在这种情况下，将不允许会话（会话本质上代表持久状态）。

但是，此要求的代价是方便-不能在请求中保留主题状态。这意味着具有此要求的应用程序必须确保可以针对每个请求以其他方式表示“主题”状态。

这几乎总是通过验证应用程序处理的每个请求/调用/消息来实现的。

例如，大多数无状态Web应用程序通常通过实施HTTP Basic身份验证来支持此功能，从而允许浏览器代表最终用户对每个请求进行身份验证。远程处理或消息传递框架必须确保将主题主体和凭据附加到通常由框架代码执行的每个调用或消息有效负载上。

## 禁用主题状态会话存储

从Shiro 1.2及以后的版本开始，如果应用程序希望禁用Shiro的内部实现策略——将Subject状态持久化到会话，可以通过以下方式禁用所有Subject:

在 shiro.ini 文件中 securityManager中配置如下属性:

```ini
[main]
...
securityManager.subjectDAO.sessionStorageEvaluator.sessionStorageEnabled = false
...
```

这将防止Shiro使用Subject的会话来存储所有Subject的请求/调用/消息之间的Subject状态。

只需确保对每个请求进行身份验证，这样Shiro就会知道任何给定请求/调用/消息的主题是谁。

- Shiro的需求 VS 你的需求

这将使Shiro自己的实现无法使用Sessions作为存储策略。 它不会完全禁用会话。 如果您自己的任何代码显式调用subject.getSession（）或subject.getSession（true），则仍将创建会话。

# A Hybrid Approach

上面的shiro.ini配置行（`securityManager.subjectDAO.sessionStorageEvaluator.sessionStorageEnabled = false`）将使Shiro不能将Session用作所有主题的实现策略。

但是，如果您想要一种混合方法呢？

如果某些主题应该举行会议而其他主题不应该举行会议怎么办？

这种混合方法可能对许多应用程序有益。

例如：

- 也许人类受试者（例如，网络浏览器用户）应该能够使用Sessions来获得上述好处。

- 也许非人类主题（例如API客户端或第三方应用程序）不应创建会话，因为它们与软件的交互可能是间歇性的和/或不稳定的。

- 也许某个类型的所有主题或从某个位置访问系统的那些主题都应在会话中保持状态，而其他所有主题则不应。

如果您需要这种混合方法，则可以实现SessionStorageEvaluator。

## SessionStorageEvaluator

如果要精确控制哪些主题的状态可能在其Session中持久存在，则可以实现org.apache.shiro.mgt.SessionStorageEvaluator接口，并告诉Shiro哪些主题应该支持会话存储。

该接口只有一个方法：

- SessionStorageEvaluator

```java
public interface SessionStorageEvaluator {

    public boolean isSessionStorageEnabled(Subject subject);

}
```

要获得更详细的API解释，请参阅SessionStorageEvaluator JavaDoc。

您可以实现这个接口，并检查这个主题，以获得做出这个决定可能需要的任何信息。

### 主题检查

在实现isSessionStorageEnabled(subject)接口方法时，您总是可以查看subject并访问您做出决策所需的任何内容。

当然，所有预期的主题方法都可以使用(getPrincipals()等)，但是特定于环境的主题实例也很有价值。

例如，在web应用程序中，如果必须基于当前ServletRequest中的数据做出决策，则可以获得请求或响应，因为运行时Subject实例实际上是一个WebSubject实例:

```java
public boolean isSessionStorageEnabled(Subject subject) {
    boolean enabled = false;
    if (WebUtils.isWeb(Subject)) {
        HttpServletRequest request = WebUtils.getHttpRequest(subject);
        //set 'enabled' based on the current request.
    } else {
        //not a web request - maybe a RMI or daemon invocation?
        //set 'enabled' another way...
    }
    return enabled;
}
```

注:框架开发人员应该记住这种访问类型，并确保任何请求/调用/消息上下文对象都可以通过特定于环境的主题实现获得。

如果您需要一些帮助来为您的框架/环境设置这些，请联系Shiro用户邮件列表。

## 配置

实现了SessionStorageEvaluator接口后，可以在shiro.ini中配置它:

shiro.ini SessionStorageEvaluator配置

```ini
[main]
...
sessionStorageEvaluator = com.mycompany.shiro.subject.mgt.MySessionStorageEvaluator
securityManager.subjectDAO.sessionStorageEvaluator = $sessionStorageEvaluator
```

# Web应用程序
通常，web应用程序希望简单地根据每个请求启用或禁用会话创建，而不管哪个主题正在执行请求。这在支持REST和消息传递/RMI体系结构方面经常起到很好的效果。例如，可能允许普通终端用户(使用浏览器的人)创建和使用会话，但远程API客户机使用REST或SOAP，根本不应该有会话(因为它们对每个请求进行身份验证，这在REST/SOAP体系结构中很常见)。

为了支持这种混合/每个请求的功能，Shiro的默认过滤器池中添加了一个noSessionCreation过滤器。该过滤器将防止在请求期间创建新会话，以保证无状态体验。在shiro.ini [url]部分中，您通常在所有其他过滤器之前定义这个过滤器，以确保会话永远不会被使用。

例如:

- shiro.ini -禁用每个请求创建会话

```ini
[urls]
...
/rest/** = noSessionCreation, authcBasic, ...
```

此过滤器允许对任何现有会话使用会话，但不允许在过滤请求期间创建新会话。也就是说，以下四种方法中的任何一种对没有现有会话的请求或主题调用都将自动触发DisabledSessionException:

```
httpServletRequest.getSession ()
httpServletRequest.getSession(true)
subject.getSession ()
subject.getSession(true)
```

如果一个主题在访问noSessionCreation-protected-URL之前已经有了一个会话，那么上述4个调用仍将按预期工作。

最后，下面的调用在所有情况下都是允许的:

```
httpServletRequest.getSession(false)
subject.getSession(false)
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}