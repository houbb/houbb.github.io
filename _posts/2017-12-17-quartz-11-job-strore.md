---
layout: post
title:  Quartz 11-Job Stores
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Job Stores

JobStore 负责跟踪您给调度器的所有“工作数据”:作业、触发器、日历等等。为您的Quartz scheduler实例选择合适的JobStore是一个重要步骤。幸运的是，一旦你理解了它们之间的区别，选择应该是非常简单的。您在属性文件(或对象)中声明您的调度器应该使用哪个 JobStore (以及它的配置设置)，您可以使用它来生成调度程序实例。

## 注意

不要直接在代码中使用JobStore实例。
出于某种原因，许多人试图这样做。JobStore是用于Quartz本身的幕后使用。您必须告诉Quartz(通过配置)使用哪个JobStore，但是您应该只在代码中使用调度器接口。

# RAMJobStore

**RAMJobStore** 是最简单的使用的 JobStore，它也是性能最好的(在CPU时间方面)。

RAMJobStore以一种显而易见的方式获得它的名称: 它将所有数据保存在RAM中。

这就是为什么它是闪电般的快速，以及为什么它如此简单的配置。

缺点是当您的**应用程序结束(或崩溃)时所有的调度信息丢失**——这意味着 RAMJobStore 不能对作业和触发器的“非波动”设置表示支持。

对于某些应用程序，这是可以接受的，甚至是期望的行为，但对于其他应用程序，这可能是灾难性的。

要使用 RAMJobStore(并假设您使用的是 `StdSchedulerFactory`)，只需指定类名称 org.quartz.simpl。RAMJobStore作为JobStore类属性，用于配置 quartz:


- 配置

```java
org.quartz.jobStore.class = org.quartz.simpl.RAMJobStore
```

# JDBCJobStore

JDBCJobStore 也被恰当地命名——它通过JDBC将所有数据保存在一个数据库中。

因此，配置比RAMJobStore要复杂一些，而且也不那么快。但是，性能恢复并不是非常糟糕，特别是如果您在主键上构建了带有索引的数据库表。在相当现代的具有良好LAN(在调度器和数据库之间)的机器上，检索和更新触发触发器的时间通常不超过10毫秒。

JDBCJobStore几乎与任何数据库一起使用，它已经广泛应用于Oracle、PostgreSQL、MySQL、MS SQLServer、HSQLDB和DB2。要使用JDBCJobStore，您必须首先创建一组用于Quartz的数据库表。您可以在Quartz发行版的**docs/dbTables**目录中找到表创建的SQL脚本。如果没有用于数据库类型的脚本，只需查看现有的数据库类型，并以任何必要的方式修改数据库。需要注意的一点是，在这些脚本中，所有的表都以前缀`QRTZ_`”`开头(如表“QRTZ_TRIGGERS”和“QRTZ_JOB_DETAIL”)。这个前缀实际上可以是您想要的任何东西，只要您通知JDBCJobStore前缀是什么(在您的Quartz属性中)。

使用不同的前缀可能有助于在同一个数据库中为多个调度器实例创建多个表集。

一旦创建了表，在配置和激活JDBCJobStore之前，需要做一个更重要的决策。您需要决定应用程序需要哪种类型的事务。如果您不需要将调度命令(例如添加和删除触发器)绑定到其他事务，那么您可以使用JobStoreTX作为JobStore(这是最常见的选择)，让Quartz管理事务。

如果您需要Quartz与其他事务一起工作(例如在J2EE应用服务器中)，那么您应该使用 **JobStoreCMT** ——在这种情况下，Quartz 将让应用服务器容器管理事务。

最后一个问题是设置一个数据源，JDBCJobStore可以从该数据源连接到数据库。使用几种不同的方法之一，可以在您的 Quartz 属性中定义数据源。一种方法是让Quartz创建并管理数据源本身——通过提供数据库的所有连接信息。
另一种方法是让Quartz使用一个由Quartz在其内部运行的应用服务器管理的数据源——通过提供JDBCJobStore JNDI名称的数据源。有关属性的详细信息，请参阅“docs/config”文件夹中的示例配置文件。

使用JDBCJobStore(假设你使用StdSchedulerFactory)首先需要设置JobStore类属性的配置为 `org.quartz.impl.jdbcjobstore.JobStoreTX` 或`org.quartz.impl.jdbcjobstore.JobStoreCMT` - 取决于你根据上面几段的解释所做的选择。


- 配置使用 JobStoreTx

```
org.quartz.jobStore.class = org.quartz.impl.jdbcjobstore.JobStoreTX
```

接下来选择 driver 委托

- 配置 DriverDelegate

```
org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.StdJDBCDelegate
```

- 配置表名称前缀

```
org.quartz.jobStore.tablePrefix = QRTZ_
```

- 配置数据源

```
org.quartz.jobStore.dataSource = myDS
```

## 注意

如果您的调度器很忙(即几乎总是执行与线程池大小相同的工作数，那么您应该将数据源中的**连接数设置为线程池+2**的大小)。

“org.quartz.jobStore。useProperties“配置参数可以设置为“true”(默认为false)，以便指示JDBCJobStore, JobDataMaps中的所有值都是字符串，因此可以作为 key-value 对存储，而不是在BLOB列中以序列化形式存储更复杂的对象。

从长远来看，这样做更安全，因为您避免了类版本化问题，而将非string类序列化为BLOB。

# TerracottaJobStore

TerracottaJobStore 提供了一种无需数据库就可以进行缩放和健壮性的方法。这意味着您的数据库可以避免来自Quartz的负载，并且可以将所有的资源保存到您的应用程序的其他部分。

TerracottaJobStore 可以是集群的或非集群的，在这两种情况下，都为您的工作数据提供了一个存储介质，在应用程序重新启动之间是持久的，因为数据存储在 Terracotta 服务器中。它的性能比通过 **JDBCJobStore(大约一个数量级更好)** 使用数据库要好得多，但是比RAMJobStore慢得多。

要使用TerracottaJobStore(假设您使用的是 StdSchedulerFactory)，只需指定类名称` org.quartz.jobStore.class = org.terracotta.quartz.TerracottaJobStore`。作为您用来配置quartz的JobStore类属性，并添加一个额外的配置行来指定Terracotta服务器的位置:

```
org.quartz.jobStore.class = org.terracotta.quartz.TerracottaJobStore
org.quartz.jobStore.tcConfigUrl = localhost:9510
```

更多详情，参见 [http://www.terracotta.org/quartz](http://www.terracotta.org/quartz)

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}