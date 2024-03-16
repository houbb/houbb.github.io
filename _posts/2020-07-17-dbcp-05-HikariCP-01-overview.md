---
layout: post
title:  零额外开销最快的数据库连接池？-05-HikariCP 入门介绍
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 拓展阅读

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://mp.weixin.qq.com/s/YMgj1lsa0hV2TDvfii6grA)

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)

# HikariCP

快速、简单、可靠。HikariCP 是一个“零额外开销”的生产就绪的 JDBC 连接池。

该库大小约为130Kb，非常轻量级。

在这里阅读关于我们是如何做到的。

## 构件 Artifacts

**Java 11+** Maven 构件

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP</artifactId>
   <version>5.1.0</version>
</dependency>
```

Java 8 Maven 构件 (*维护模式*)

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP</artifactId>
   <version>4.0.3</version>
</dependency>
```

Java 7 Maven 构件 (*维护模式*):

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP-java7</artifactId>
   <version>2.4.13</version>
</dependency>
```

Java 6 Maven 构件 (*维护模式*):

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP-java6</artifactId>
   <version>2.3.13</version>
</dependency>
```

或者[从这里下载](http://search.maven.org/#search%7Cga%7C1%7Ccom.zaxxer.hikaricp)。

## :checkered_flag: JMH 基准测试

微基准测试是使用[JMH微基准测试框架](http://openjdk.java.net/projects/code-tools/jmh/)来分离和测量池的开销而创建的。您可以查看[HikariCP基准测试项目的详细信息](https://github.com/brettwooldridge/HikariCP-benchmark)，并自行审查/运行基准测试。

![HikariCP-bench-2.6.0](https://github.com/brettwooldridge/HikariCP/wiki/HikariCP-bench-2.6.0.png)

* 一个*连接周期*被定义为单个`DataSource.getConnection()`/`Connection.close()`。

* 一个*语句周期*被定义为单个`Connection.prepareStatement()`, `Statement.execute()`, `Statement.close()`。

<sup>
<sup>1</sup> 版本：HikariCP 2.6.0、commons-dbcp2 2.1.1、Tomcat 8.0.24、Vibur 16.1、c3p0 0.9.5.2、Java 8u111 <br/>
<sup>2</sup> 英特尔 Core i7-3770 CPU @ 3.40GHz <br/>
<sup>3</sup> 未竞争的基准测试：32个线程/32个连接，竞争的基准测试：32个线程，16个连接 <br/>
<sup>4</sup> Apache Tomcat 在使用Tomcat<i>StatementFinalizer</i>时无法完成语句基准测试，因为存在过多的垃圾回收时间 <a href="https://raw.githubusercontent.com/wiki/brettwooldridge/HikariCP/markdown/Tomcat-Statement-Failure.md">due to excessive garbage collection times</a><br/>
<sup>5</sup> Apache DBCP 在执行语句基准测试时无法完成 <a href="https://raw.githubusercontent.com/wiki/brettwooldridge/HikariCP/markdown/Dbcp2-Statement-Failure.md">due to excessive garbage collection times</a>
</sup>


### microscope: 分析

#### 峰值需求池比较

<a href="https://github.com/brettwooldridge/HikariCP/blob/dev/documents/Welcome-To-The-Jungle.md"><img width="400" align="right" src="https://github.com/brettwooldridge/HikariCP/wiki/Spike-Hikari.png"></a>

对 HikariCP v2.6 进行分析，与其他连接池进行比较，以唯一的“峰值需求”负载为基础。

客户的环境对获取新连接的成本很高，并且需要一个动态大小的池，但同时需要对请求峰值做出响应。阅读关于处理峰值需求的更多信息[这里](https://github.com/brettwooldridge/HikariCP/blob/dev/documents/Welcome-To-The-Jungle.md)。

#### 你可能[做错了]

<a href="https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing"><img width="200" align="right" src="https://github.com/brettwooldridge/HikariCP/wiki/Postgres_Chart.png"></a>
又名“关于连接池大小你可能不知道的事情”。观看来自 Oracle 实际性能团队的视频，了解为什么连接池不需要调整得那么大。事实上，超大型连接池对性能有明显且可证明的*负面*影响；在 Oracle 演示中有 50 倍的差异。[继续阅读以了解更多](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)。

#### WIX 工程分析

<a href="https://www.wix.engineering/blog/how-does-hikaricp-compare-to-other-connection-pools"><img width="180" align="left" src="https://github.com/brettwooldridge/HikariCP/wiki/Wix-Engineering.png"></a>

我们要感谢 WIX 团队在他们的[工程博客](https://www.wix.engineering/post/how-does-hikaricp-compare-to-other-connection-pools)上深入撰写有关 HikariCP 的文章。

如果您有时间，请查看。

#### 失败：连接池的不良行为
阅读我们有趣的[“数据库宕机”连接池挑战](https://github.com/brettwooldridge/HikariCP/wiki/Bad-Behavior:-Handling-Database-Down)。

----------------------------------------------------

#### “模仿是最真诚的剽窃” - 匿名

像 HikariCP 这样的开源软件，像任何产品一样，在自由市场中竞争。

我们理解。我们明白一旦公开，产品的进步经常会被冒用。

我们也明白，想法可能来自时代精神；同时且独立地出现。但是创新的时间轴，特别是在开源项目中，也是清晰的，我们希望我们的用户了解我们领域创新的方向。

看到数百小时的思考和研究成果如此轻易地被冒用可能会令人泄气，也许这是自由市场的固有特性，但我们并不泄气。

*我们感到积极；要拉开差距。*

### :gear: 配置 (调节参数，宝贝！)

HikariCP带有*合理*的默认值，在大多数部署中表现良好，无需额外调整。**除了下面标记为“必需”的属性，其他每个属性都是可选的。**

<sup>&#128206;</sup>&nbsp;*HikariCP将所有时间值都以毫秒为单位。*

&#128680;&nbsp;HikariCP依赖于准确的计时器，既用于性能又用于可靠性。您的服务器必须与时间源（如NTP服务器）同步。**特别是**如果您的服务器运行在虚拟机中。

为什么？[在这里阅读更多](https://dba.stackexchange.com/a/171020)。

**不要依赖于虚拟机监视器的设置来“同步”虚拟机的时钟。请在虚拟机内部配置时间源同步。**

如果您寻求支持，并且问题最终是由于缺乏时间同步引起的，您将在Twitter上受到公开的嘲笑。

#### 必需项

&#128292;``dataSourceClassName``<br/>
这是JDBC驱动程序提供的``DataSource``类的名称。查阅您特定JDBC驱动程序的文档以获取此类名称，或参阅下面的[表格](https://github.com/brettwooldridge/HikariCP#popular-datasource-class-names)。不支持XA数据源。XA需要像[bitronix](https://github.com/bitronix/btm)这样的真实事务管理器。请注意，如果您正在使用``jdbcUrl``进行“旧式”基于DriverManager的JDBC驱动程序配置，则不需要此属性。
*默认值：无*

*- 或者 -*

&#128292;``jdbcUrl``<br/>
此属性指示HikariCP使用“基于DriverManager”的配置。我们认为DataSource-based配置（上面）在各种情况下都优于此配置，但对于许多部署而言，几乎没有明显的区别。**当与“旧”驱动程序一起使用此属性时，您可能还需要设置``driverClassName``属性，但首先尝试不设置。**请注意，如果使用此属性，您仍然可以使用*DataSource*属性来配置驱动程序，并且实际上建议优于在URL本身中指定驱动程序参数。
*默认值：无*

***

&#128292;``username``<br/>
此属性设置从底层驱动程序获取*Connections*时使用的默认身份验证用户名。请注意，对于DataSources，通过在底层DataSource上调用``DataSource.getConnection(*username*, password)``，此工作方式非常确定性。然而，对于基于Driver的配置，每个驱动程序都是不同的。对于基于Driver的情况，HikariCP将使用此``username``属性将一个``user``属性设置到传递给驱动程序的``Properties``中的``DriverManager.getConnection(jdbcUrl, props)``调用中。如果这不是您需要的，请完全跳过此方法，并调用``addDataSourceProperty("username", ...)``, 例如。
*默认值：无*

&#128292;``password``<br/>
此属性设置从底层驱动程序获取*Connections*时使用的默认身份验证密码。请注意，对于DataSources，通过在底层DataSource上调用``DataSource.getConnection(username, *password*)``，此工作方式非常确定性。然而，对于基于Driver的配置，每个驱动程序都是不同的。对于基于Driver的情况，HikariCP将使用此``password``属性将一个``password``属性设置到传递给驱动程序的``Properties``中的``DriverManager.getConnection(jdbcUrl, props)``调用中。如果这不是您需要的，请完全跳过此方法，并调用``addDataSourceProperty("pass", ...)``, 例如。
*默认值：无*


#### 常用设置

&#9989;``autoCommit``<br/>
此属性控制池返回的连接的默认自动提交行为。它是一个布尔值。
*默认值：true*

&#9203;``connectionTimeout``<br/>
此属性控制客户端（也就是您）从池中获取连接时将等待的最长时间（以毫秒为单位）。如果超过此时间而没有可用连接，将抛出SQLException。最低可接受的连接超时时间为250毫秒。
*默认值：30000（30秒）*

&#9203;``idleTimeout``<br/>
此属性控制连接在池中允许空闲的最长时间。**此设置仅在``minimumIdle``定义为小于``maximumPoolSize``时适用。**一旦池达到``minimumIdle``连接，空闲连接将不会被删除。连接是否被视为空闲或不为空闲取决于+30秒的最大变化和+15秒的平均变化。在此超时之前，连接永远不会被视为空闲。值为0意味着空闲连接永远不会从池中移除。允许的最小值为10000ms（10秒）。
*默认值：600000（10分钟）*

&#9203;``keepaliveTime``<br/>
此属性控制HikariCP多久尝试保持连接活动，以防止被数据库或网络基础设施超时。此值必须小于`maxLifetime`值。“保持活动”仅在空闲连接上发生。当给定连接进行“保持活动”时，该连接将从池中移除，“ping”一下，然后返回池中。'ping'是以下之一：调用JDBC4 `isValid()`方法，或执行`connectionTestQuery`。通常，超出池外的持续时间应该以单个数字毫秒甚至亚毫秒为单位，因此几乎没有或没有可察觉的性能影响。允许的最小值为30000ms（30秒），但范围内的值最理想。
*默认值：0（禁用）*

&#9203;``maxLifetime``<br/>
此属性控制池中连接的最长生命周期。正在使用的连接永远不会被删除，只有在关闭时才会被移除。基于每个连接的微小负衰减应用以避免池中的大量灭绝。**我们强烈建议设置此值，应比数据库或基础架构强加的连接时间限制短几秒钟。**值为0表示没有最大生命周期（无限生命周期），当然也受到``idleTimeout``设置的限制。允许的最小值为30000ms（30秒）。
*默认值：1800000（30分钟）*

&#128292;``connectionTestQuery``<br/>
**如果您的驱动程序支持JDBC4，则强烈建议不设置此属性。**这适用于不支持JDBC4 ``Connection.isValid() API``的“传统”驱动程序。这是在从池中获得连接之前将执行的查询，以验证与数据库的连接是否仍然活动。*再次尝试在没有此属性的情况下运行池，如果您的驱动程序不符合JDBC4，则HikariCP将记录错误以让您知道。*
*默认值：无*

&#128290;``minimumIdle``<br/>
此属性控制HikariCP尝试在池中保持的最小数量的*空闲连接*。如果空闲连接低于此值，并且池中的总连接少于``maximumPoolSize``，HikariCP将尽最大努力快速有效地添加额外的连接。然而，为了最大性能和对突发需求的响应，我们建议*不*设置此值，而是允许HikariCP充当*固定大小*

连接池。
*默认值：与maximumPoolSize相同*

&#128290;``maximumPoolSize``<br/>
此属性控制池允许达到的最大大小，包括空闲和正在使用的连接。基本上，此值将确定实际连接到数据库后端的最大数量。对于此值的合理值最好由您的执行环境确定。当池达到此大小时，并且没有可用的空闲连接时，对getConnection()的调用将在``connectionTimeout``毫秒内阻塞，然后超时。请阅读[关于池大小](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)。
*默认值：10*

&#128200;``metricRegistry``<br/>
此属性仅通过编程配置或IoC容器提供。此属性允许您指定一个*Codahale/Dropwizard* ``MetricRegistry``实例，用于记录各种指标。有关详细信息，请参阅[Metrics](https://github.com/brettwooldridge/HikariCP/wiki/Dropwizard-Metrics)页面。
*默认值：无*

&#128200;``healthCheckRegistry``<br/>
此属性仅通过编程配置或IoC容器提供。此属性允许您指定一个*Codahale/Dropwizard* ``HealthCheckRegistry``实例，用于报告当前健康信息。有关详细信息，请参阅[Health Checks](https://github.com/brettwooldridge/HikariCP/wiki/Dropwizard-HealthChecks)页面。
*默认值：无*

&#128292;``poolName``<br/>
此属性表示连接池的用户定义名称，主要在日志记录和JMX管理控制台中出现，以标识池和池配置。
*默认值：自动生成*


#### 不经常使用的设置

&#9203;``initializationFailTimeout``<br/>
此属性控制池是否在无法成功启动时“快速失败”。任何正数都表示尝试获取初始连接的毫秒数；在此期间，应用程序线程将被阻塞。如果在超时之前无法获取连接，则会抛出异常。此超时在``connectionTimeout``期间应用。如果值为零（0），HikariCP将尝试获取并验证连接。如果获取了连接，但验证失败，将抛出异常并且池不会启动。但是，如果无法获取连接，则池将启动，但稍后尝试获取连接可能会失败。小于零的值将绕过任何初始连接尝试，并且池将立即启动，同时尝试在后台获取连接。*默认值：1*

&#10062;``isolateInternalQueries``<br/>
此属性确定HikariCP是否将内部池查询（例如连接活动测试）隔离在其自己的事务中。由于这些通常是只读查询，因此很少需要将它们封装在自己的事务中。仅当``autoCommit``已禁用时，此属性才适用。
*默认值：false*

&#10062;``allowPoolSuspension``<br/>
此属性控制池是否可以通过JMX挂起和恢复。对于某些故障转移自动化方案很有用。当池被挂起时，对``getConnection()``的调用将*不*超时，并将保持到池恢复为止。
*默认值：false*

&#10062;``readOnly``<br/>
此属性控制从池中获取的*Connections*是否默认处于只读模式。请注意，一些数据库不支持只读模式的概念，而其他数据库在将*Connection*设置为只读时提供查询优化。您是否需要此属性取决于您的应用程序和数据库。
*默认值：false*

&#10062;``registerMbeans``<br/>
此属性控制是否注册JMX管理Bean（“MBeans”）。
*默认值：false*

&#128292;``catalog``<br/>
此属性设置支持目录概念的数据库的默认*目录*。如果未指定此属性，则使用JDBC驱动程序定义的默认目录。
*默认值：驱动程序默认*

&#128292;``connectionInitSql``<br/>
此属性设置将在每个新连接创建之后执行的SQL语句，然后将其添加到池中。如果此SQL无效或引发异常，则将其视为连接失败，并将遵循标准的重试逻辑。
*默认值：无*

&#128292;``driverClassName``<br/>
HikariCP将仅根据``jdbcUrl``通过DriverManager尝试解析驱动程序，但对于一些旧的驱动程序，还必须指定``driverClassName``。除非收到明显的错误消息指示找不到驱动程序，否则请省略此属性。
*默认值：无*

&#128292;``transactionIsolation``<br/>
此属性控制从池返回的连接的默认事务隔离级别。如果未指定此属性，则使用JDBC驱动程序定义的默认事务隔离级别。仅在具有通用查询的特定隔离要求时使用此属性。此属性的值是``Connection``类中的常量名称，例如``TRANSACTION_READ_COMMITTED``、``TRANSACTION_REPEATABLE_READ``等。
*默认值：驱动程序默认*

&#9203;``validationTimeout``<br/>
此属性控制连接将被测试活动性的最长时间。此值必须小于``connectionTimeout``。可接受的最低验证超时为250毫秒。
*默认值：5000*

&#9203;``leakDetectionThreshold``<br/>
此属性控制连接在池外的时间超过多久后将记录可能的连接泄漏消息。值为0表示泄漏检测已禁用。启用泄漏检测的最低值为2000（2秒）。
*默认值：0*

&#10145;``dataSource``<br/>
此属性仅通过编程配置或IoC容器提供。此属性允许您直接设置要池包装的``DataSource``实例，而不是通过反射由HikariCP构建它。这在某些依赖注入框架中可能很有用。当指定此属性时，将忽略``dataSourceClassName``属性和所有DataSource特定属性。
*默认值：无*

&#128292;``schema``<br/>
此属性设置支持架构概念的数据库的默认*模式*。如果未指定此属性，则使用JDBC驱动程序定义的默认模式。
*默认值：驱动程序默认*

&#10145;``threadFactory``<br/>
此属性仅通过编程配置或IoC容器提供。此属性允许您设置将由池使用的所有线程的``java.util.concurrent.ThreadFactory``实例。在某些受限制的执行环境中，只能通过应用程序容器提供的``ThreadFactory``来创建线程，因此需要此属性。
*默认值：无*

&#10145;``scheduledExecutor``<br/>
此属性仅通过编程配置或IoC容器提供。此属性允许您设置将由池使用的各种内部定时任务的``java.util.concurrent.ScheduledExecutorService``实例。如果向HikariCP提供``ScheduledThreadPoolExecutor``实例，则建议使用``setRemoveOnCancelPolicy(true)``。
*默认值：无*



#### 缺失的调节钮

正如您在上面所看到的，HikariCP有很多可以调节的“钮”，但相比其他一些连接池来说，数量较少。

这是一种设计哲学。HikariCP的设计美学是极简主义。遵循“简单即是更好”或“少即是多”的设计理念，一些配置轴被有意地省略了。

#### Statement 缓存

许多连接池，包括Apache DBCP、Vibur、c3p0等，都提供了``PreparedStatement``缓存。但是，HikariCP没有。为什么呢？

在连接池层面，``PreparedStatement``只能*每个连接*进行缓存。如果您的应用程序有250个常用查询，并且有20个连接的池，那么您要求数据库保留5000个查询执行计划--同样，池必须缓存这么多的``PreparedStatements``及其相关的对象图。

大多数主要的数据库JDBC驱动程序已经具有可以配置的语句缓存，包括PostgreSQL、Oracle、Derby、MySQL、DB2等。JDBC驱动程序处于一个独特的位置，可以利用数据库特定的功能，几乎所有的缓存实现都能够跨连接共享执行计划。这意味着，与内存中的5000个语句和相关的执行计划相比，您的250个常用查询在数据库中只有250个执行计划。聪明的实现甚至不会在驱动程序级别的内存中保留``PreparedStatement``对象，而是仅仅将新实例附加到现有的计划ID上。

在池层使用语句缓存是一个[反模式](https://en.wikipedia.org/wiki/Anti-pattern)，会对您的应用程序性能产生负面影响，与驱动程序提供的缓存相比。

#### 记录语句文本 / 慢查询日志

与语句缓存类似，大多数主要数据库供应商支持通过其自己的驱动程序属性进行语句日志记录。

这包括Oracle、MySQL、Derby、MSSQL等。有些甚至支持慢查询日志记录。对于那些不支持的少数数据库，有几种选择。

我们收到了一个报告，称[p6spy效果很好](https://github.com/brettwooldridge/HikariCP/issues/57#issuecomment-354647631)，还注意到了[log4jdbc](https://github.com/arthurblake/log4jdbc)和[jdbcdslog-exp](https://code.google.com/p/jdbcdslog-exp/)的可用性。

#### 快速恢复

请阅读[Rapid Recovery Guide](https://github.com/brettwooldridge/HikariCP/wiki/Rapid-Recovery)了解如何为正确从数据库重启和网络分区事件中恢复配置您的驱动程序和系统的详细信息。


### :rocket: 初始化

您可以像这样使用``HikariConfig``类<sup>1</sup>：

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/simpsons");
config.setUsername("bart");
config.setPassword("51mp50n");
config.addDataSourceProperty("cachePrepStmts", "true");
config.addDataSourceProperty("prepStmtCacheSize", "250");
config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

HikariDataSource ds = new HikariDataSource(config);
```

&nbsp;<sup><sup>1</sup> MySQL特定示例，请勿逐字复制。</sup>

或者直接实例化``HikariDataSource``如下所示：
```java
HikariDataSource ds = new HikariDataSource();
ds.setJdbcUrl("jdbc:mysql://localhost:3306/simpsons");
ds.setUsername("bart");
ds.setPassword("51mp50n");
...
```
或者基于属性文件：
```java
// 在文件系统和类路径中检查.properties文件
HikariConfig config = new HikariConfig("/some/path/hikari.properties");
HikariDataSource ds = new HikariDataSource(config);
```
示例属性文件：
```ini
dataSourceClassName=org.postgresql.ds.PGSimpleDataSource
dataSource.user=test
dataSource.password=test
dataSource.databaseName=mydb
dataSource.portNumber=5432
dataSource.serverName=localhost
```
或者基于``java.util.Properties``：
```java
Properties props = new Properties();
props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
props.setProperty("dataSource.user", "test");
props.setProperty("dataSource.password", "test");
props.setProperty("dataSource.databaseName", "mydb");
props.put("dataSource.logWriter", new PrintWriter(System.out));

HikariConfig config = new HikariConfig(props);
HikariDataSource ds = new HikariDataSource(config);
```

还有一个可用的系统属性，``hikaricp.configurationFile``，可以用来指定属性文件的位置。

如果您打算使用此选项，请使用默认构造函数构造``HikariConfig``或``HikariDataSource``实例，属性文件将会被加载。



### 性能提示

[MySQL性能提示](https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration)

### 流行的DataSource类名

我们建议使用``dataSourceClassName``而不是``jdbcUrl``，但两者都可以接受。我们再次强调，*两者都可以接受*。

&#9888;&nbsp;*注意：Spring Boot自动配置用户，您需要使用``jdbcUrl``为基础的配置。*

&#9888;&nbsp;MySQL DataSource 在网络超时支持方面已知存在问题。请使用``jdbcUrl``配置。

以下是一些流行数据库的JDBC *DataSource*类：

| 数据库         | 驱动器       | *DataSource* 类 |
|:---------------- |:------------ |:-------------------|
| Apache Derby     | Derby        | org.apache.derby.jdbc.ClientDataSource |
| Firebird         | Jaybird      | org.firebirdsql.ds.FBSimpleDataSource |
| Google Spanner   | Spanner      | com.google.cloud.spanner.jdbc.JdbcDriver |
| H2               | H2           | org.h2.jdbcx.JdbcDataSource |
| HSQLDB           | HSQLDB       | org.hsqldb.jdbc.JDBCDataSource |
| IBM DB2          | IBM JCC      | com.ibm.db2.jcc.DB2SimpleDataSource |
| IBM Informix     | IBM Informix | com.informix.jdbcx.IfxDataSource |
| MS SQL Server    | Microsoft    | com.microsoft.sqlserver.jdbc.SQLServerDataSource |
| ~~MySQL~~        | Connector/J  | ~~com.mysql.jdbc.jdbc2.optional.MysqlDataSource~~ |
| MariaDB          | MariaDB      | org.mariadb.jdbc.MariaDbDataSource |
| Oracle           | Oracle       | oracle.jdbc.pool.OracleDataSource |
| OrientDB         | OrientDB     | com.orientechnologies.orient.jdbc.OrientDataSource |
| PostgreSQL       | pgjdbc-ng    | com.impossibl.postgres.jdbc.PGDataSource |
| PostgreSQL       | PostgreSQL   | org.postgresql.ds.PGSimpleDataSource |
| SAP MaxDB        | SAP          | com.sap.dbtech.jdbc.DriverSapDB |
| SQLite           | xerial       | org.sqlite.SQLiteDataSource |
| SyBase           | jConnect     | com.sybase.jdbc4.jdbc.SybDataSource |

### Play框架插件

注意，Play 2.4现在默认使用HikariCP。Play框架有一个新插件; [play-hikaricp](http://edulify.github.io/play-hikaricp.edulify.com/)。如果您正在使用优秀的Play框架，您的应用程序应该使用HikariCP。感谢Edulify团队！

### Clojure封装

[tomekw](https://github.com/tomekw)创建了一个新的Clojure封装，可以[在这里找到](https://github.com/tomekw/hikari-cp)。

### JRuby封装

[tomekw](https://github.com/tomekw)创建了一个新的JRuby封装，可以[在这里找到](https://github.com/tomekw/hucpa)。

----------------------------------------------------

### Wiki

不要忘记[Wiki](https://github.com/brettwooldridge/HikariCP/wiki)以获取更多信息，例如：

 * [常见问题解答](https://github.com/brettwooldridge/HikariCP/wiki/FAQ)
 * [Hibernate 4.x配置](https://github.com/brettwooldridge/HikariCP/wiki/Hibernate4)
 * [MySQL配置技巧](https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration)
 * 等等。

----------------------------------------------------

### 要求

 &#8658; Java 8+ (Java 6/7构件处于维护模式)<br/>
 &#8658; slf4j库<br/>




# 参考资料

https://github.com/brettwooldridge/HikariCP

https://github.com/brettwooldridge/HikariCP/wiki

* any list
{:toc}