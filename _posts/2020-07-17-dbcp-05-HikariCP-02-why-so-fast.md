---
layout: post
title:  数据库连接池-05-HikariCP 性能为什么这么快？
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 拓展阅读

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

# 为什么性能如此优秀?

这就是我们公开秘密配方的地方。当我们拿出像我们这样的基准测试结果时，必须解决一定程度的怀疑。如果你考虑性能和连接池，你可能会倾向于认为连接池是性能方程式中最重要的部分。但事实并非如此明显。与其他 JDBC 操作相比，getConnection() 操作的数量很少。大部分性能提升来自于对包装 Connection、Statement 等的“委托对象”进行优化。

## 🧠 我们深入到你的字节码中

为了使 HikariCP 的速度达到目前的水平，我们进行了字节码级别的工程处理，甚至更进一步。我们采用了我们所知的所有技巧来帮助 JIT 帮助您。

我们研究了编译器的字节码输出，甚至 JIT 的汇编输出，以将关键的程序例程限制在 JIT 内联阈值以下。

我们展平了继承层次结构，隐藏了成员变量，消除了类型转换。

## 🔬 微优化

HikariCP 包含许多微优化，单独看每个优化几乎无法测量，但总体上对性能有所提升。其中一些优化是以每百万次调用摊销的毫秒为单位进行度量的。

### ArrayList

一个非常重要（就性能而言）的优化是在用于跟踪打开的 Statement 实例的 ConnectionProxy 中消除对 `ArrayList<Statement>` 实例的使用。

当关闭 Statement 时，必须从此集合中删除它，当关闭 Connection 时，必须迭代该集合并关闭任何打开的 Statement 实例，最后必须清空该集合。对于一般用途而言，Java 的 ArrayList 每次执行 get(int index) 调用时都会进行范围检查，这是明智的做法。然而，由于我们可以对我们的范围提供保证，所以这个检查只是额外开销。

此外，remove(Object) 实现执行从头到尾的扫描，然而 JDBC 编程中常见的模式是在使用后立即关闭 Statement，或者按打开顺序的相反顺序关闭。对于这些情况，从尾部开始的扫描将执行得更好。

因此，`ArrayList<Statement>` 被替换为一个自定义类 FastList，它消除了范围检查，并执行从尾部到头部的移除扫描。

### ConcurrentBag

HikariCP 包含一个名为 ConcurrentBag 的自定义无锁集合。这个想法是从 C# .NET 的 ConcurrentBag 类借来的，但内部实现是相当不同的。

ConcurrentBag 提供...

- 无锁设计

- 线程本地缓存

- 队列窃取

- 直接传递优化

...这导致了高度并发性、极低的延迟和最小化的伪共享现象的发生。

### 调用：invokevirtual vs invokestatic

为了为 Connection、Statement 和 ResultSet 实例生成代理，HikariCP 最初使用一个单例工厂，ConnectionProxy 的情况下保存在静态字段（PROXY_FACTORY）中。

以下是十多个类似以下方法的方法：

```java
public final PreparedStatement prepareStatement(String sql, String[] columnNames) throws SQLException
{
    return PROXY_FACTORY.getProxyPreparedStatement(this, delegate.prepareStatement(sql, columnNames));
}
```

使用原始的单例工厂，生成的字节码如下所示：

```
    public final java.sql.PreparedStatement prepareStatement(java.lang.String, java.lang.String[]) throws java.sql.SQLException;
    flags: ACC_PRIVATE, ACC_FINAL
    Code:
      stack=5, locals=3, args_size=3
         0: getstatic     #59                 // Field PROXY_FACTORY:Lcom/zaxxer/hikari/proxy/ProxyFactory;
         3: aload_0
         4: aload_0
         5: getfield      #3                  // Field delegate:Ljava/sql/Connection;
         8: aload_1
         9: aload_2
        10: invokeinterface #74,  3           // InterfaceMethod java/sql/Connection.prepareStatement:(Ljava/lang/String;[Ljava/lang/String;)Ljava/sql/PreparedStatement;
        15: invokevirtual #69                 // Method com/zaxxer/hikari/proxy/ProxyFactory.getProxyPreparedStatement:(Lcom/zaxxer/hikari/proxy/ConnectionProxy;Ljava/sql/PreparedStatement;)Ljava/sql/PreparedStatement;
        18: return
```

可以看到首先是对静态字段 PROXY_FACTORY 的 getstatic 调用，以及（最后）对 ProxyFactory 实例上的 getProxyPreparedStatement() 的 invokevirtual 调用。

我们消除了单例工厂（由 Javassist 生成）并用具有静态方法的最终类替换了它（其方法体由 Javassist 生成）。

Java 代码变为：

```java
    public final PreparedStatement prepareStatement(String sql, String[] columnNames) throws SQLException
    {
        return ProxyFactory.getProxyPreparedStatement(this, delegate.prepareStatement(sql, columnNames));
    }
```

其中 getProxyPreparedStatement() 是在 ProxyFactory 类中定义的静态方法。生成的字节码如下所示：

```
private final java.sql.PreparedStatement prepareStatement(java.lang.String, java.lang.String[]) throws java.sql.SQLException;
flags: ACC_PRIVATE, ACC_FINAL
Code:
  stack=4, locals=3, args_size=3
     0: aload_0
     1: aload_0
     2: getfield      #3                  // Field delegate:Ljava/sql/Connection;
     5: aload_1
     6: aload_2
     7: invokeinterface #72,  3           // InterfaceMethod java/sql/Connection.prepareStatement:(Ljava/lang/String;[Ljava/lang/String;)Ljava/sql/PreparedStatement;
    12: invokestatic  #67                 // Method com/zaxxer/hikari/proxy/ProxyFactory.getProxyPreparedStatement:(Lcom/zaxxer/hikari/proxy/ConnectionProxy;Ljava/sql/PreparedStatement;)Ljava/sql/PreparedStatement;
    15: areturn
```

这里有三件事值得注意：

getstatic 调用消失了。

invokevirtual 调用被替换为更容易由 JVM 优化的 invokestatic 调用。

最后，可能乍一看没有注意到的是，栈的大小从 5 个元素减少到 4 个元素。这是因为在 invokevirtual 的情况下，隐式传递了 ProxyFactory 实例（即 this）到栈上，并且在调用 getProxyPreparedStatement() 时栈上的值还有一个额外的（看不见的）弹出操作。

总的来说，这个变化消除了一个静态字段访问，一个推送和从栈中弹出的操作，并且由于调用点保证不会更改，使得调用更容易由 JIT 进行优化。

## ¯\_(ツ)_/¯ 是的，但还是...

在我们的基准测试中，显然我们正在运行针对一个存根 JDBC 驱动程序实现，因此 JIT 进行了大量内联。

然而，在基准测试中，其他连接池也在存根级别进行相同的内联。所以，对我们来说没有固有的优势。

但是，在使用真实驱动程序时，内联肯定是方程式的重要部分，这引出了另一个话题...

### ⏱ 调度器量子

一些轻松的阅读材料。

总结起来，显然，当你“同时”运行 400 个线程时，除非你有 400 个核心，否则你实际上并没有“同时”运行它们。操作系统，利用 N 个 CPU 核心，在你的线程之间切换，给每个线程一个小的“切片”时间来运行，称为量子。

在许多应用程序中运行大量线程时，当你的时间片用完时（作为一个线程），可能要“很长时间”才能再次得到调度程序的运行机会。因此，在其时间片内，线程尽可能多地完成工作，避免强制放弃时间片的锁，否则将会产生性能损失。而且不是一点点。

这就引出了...

### 🐌 CPU 缓存行失效

当你无法在量子内完成工作时，另一个很大的影响就是 CPU 缓存行失效。

如果你的线程被调度程序抢占，当它再次有机会运行时，它经常访问的所有数据很可能不再位于核心的 L1 或核心对的 L2 缓存中。更有可能是因为你无法控制下次将被调度到哪个核心。

# TODO:... 



# chat

## 详细介绍一下 HikariCP

HikariCP（Hikari Connection Pool）是一个高性能的Java连接池，专为快速、高效地管理数据库连接而设计。

它提供了很多特性，使得它成为Java应用程序中常用的连接池之一。

以下是HikariCP的一些主要特性和优点：

1. **快速启动时间**：HikariCP具有非常快速的启动时间，这意味着当应用程序启动时，它可以迅速准备好数据库连接池，而不会造成长时间的延迟。

2. **高性能**：HikariCP以高效的方式管理连接池，减少了与数据库交互时的延迟。它的设计目标是最小化对数据库的负载，同时最大化性能。

3. **轻量级**：HikariCP是一个轻量级的连接池，jar文件大小很小，且没有依赖其他库，这使得它在应用程序中的集成变得非常简单。

4. **自动化管理**：HikariCP可以自动地管理连接的生命周期，包括创建、释放、回收等操作，开发者无需手动干预连接的管理。

5. **高度可配置**：HikariCP提供了丰富的配置选项，允许开发者根据应用程序的需求进行调整和优化。这些配置选项包括连接池大小、最大连接数、最小空闲连接数、连接超时等。

6. **监控和诊断**：HikariCP内置了监控和诊断功能，可以实时地监视连接池的状态，包括活动连接数、空闲连接数、连接等待时间等指标。

7. **兼容性**：HikariCP与各种数据库和JDBC驱动程序兼容性良好，可以与MySQL、PostgreSQL、Oracle等主流数据库无缝集成。

8. **开源**：HikariCP 是一个开源项目，代码托管在GitHub上，可以自由获取、使用和修改。

总的来说，HikariCP是一个优秀的Java连接池实现，它通过其高性能、轻量级、易用性等特点，成为了Java应用程序中首选的连接池之一。

## HikariCP 的性能为什么更好？和 dbcp 相比较有哪些优势？

HikariCP相对于其他连接池（比如Apache DBCP）有一些性能优势的原因在于其设计和实现：

1. **快速启动时间和连接获取时间**：HikariCP的快速启动时间和连接获取时间是其性能优势之一。它通过采用一些优化技术，如预先分配连接、异步初始化等方式，使得连接池能够快速启动并且快速地获取连接，这有助于降低应用程序的响应时间。

2. **高效的连接池管理**：HikariCP采用了一些高效的数据结构和算法来管理连接池，如使用ConcurrentLinkedQueue作为连接队列、使用CAS操作实现线程安全的连接获取等，这些都有助于减少竞争和锁的开销，从而提高了连接池的吞吐量和性能。

3. **自适应性调整**：HikariCP具有自适应性调整的特性，它可以根据应用程序的负载情况动态地调整连接池的大小和配置参数，从而更好地适应不同的应用场景，保持性能的稳定性和高效性。

4. **低资源消耗**：HikariCP的设计目标之一就是尽量减少资源消耗，它采用了一些优化策略，如使用轻量级的线程池、复用连接等，从而减少了内存占用和CPU消耗，提高了系统的整体性能。

相比之下，与Apache DBCP相比，HikariCP具有以下一些优势：

1. **性能更好**：HikariCP的设计和实现更加注重性能优化，因此通常比Apache DBCP具有更高的吞吐量和更低的延迟。

2. **更高的并发性**：由于HikariCP采用了一些并发优化技术，如非阻塞IO、无锁化设计等，因此能够更好地支持高并发场景，表现更加稳定。

3. **更快的连接获取时间**：HikariCP采用了一些预先分配连接、异步初始化等技术，使得连接获取时间更短，应用程序的响应速度更快。

4. **更低的资源消耗**：HikariCP的设计目标之一是尽量减少资源消耗，因此通常比Apache DBCP具有更低的内存占用和CPU消耗。

综上所述，HikariCP相对于Apache DBCP来说，在性能、并发性、连接获取时间和资源消耗等方面都具有一定的优势，因此在大多数情况下，HikariCP更适合用于高性能和高并发的Java应用程序中。

## 给出 HikariCP 的入门例子

以下是一个简单的Java应用程序示例，演示如何在Java项目中使用HikariCP连接到数据库：

首先，确保将HikariCP的jar文件（例如hikaricp-xxx.jar）添加到你的项目中的classpath中。

接下来，创建一个HikariCP连接池并使用它来获取数据库连接。

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class HikariCPExample {

    public static void main(String[] args) {
        // 创建Hikari配置对象
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydatabase");
        config.setUsername("username");
        config.setPassword("password");

        // 设置连接池属性
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000); // 30秒超时

        // 创建Hikari数据源
        HikariDataSource dataSource = new HikariDataSource(config);

        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            // 从连接池获取连接
            connection = dataSource.getConnection();

            // 执行SQL查询
            String sql = "SELECT * FROM my_table";
            preparedStatement = connection.prepareStatement(sql);
            resultSet = preparedStatement.executeQuery();

            // 处理查询结果
            while (resultSet.next()) {
                // 处理结果集
                String column1 = resultSet.getString("column1");
                int column2 = resultSet.getInt("column2");
                // 输出结果
                System.out.println("Column1: " + column1 + ", Column2: " + column2);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (resultSet != null) resultSet.close();
                if (preparedStatement != null) preparedStatement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        // 关闭数据源
        dataSource.close();
    }
}
```

在这个示例中，我们首先创建了一个HikariConfig对象，设置了数据库的连接URL、用户名和密码等信息，然后配置了连接池的一些属性，比如最大连接数、最小空闲连接数、连接超时等。

然后，我们通过创建HikariDataSource来实例化数据源，该数据源可以用于从连接池中获取数据库连接。

接着，我们通过调用getConnection()方法从连接池中获取一个连接，然后执行SQL查询，并处理查询结果。

最后，我们在finally块中关闭了所有资源，包括连接、预处理语句和结果集，并调用数据源的close()方法关闭数据源。

这是一个简单的HikariCP入门示例，演示了如何在Java应用程序中使用HikariCP连接到数据库并执行SQL查询。

# 参考资料

https://github.com/alibaba/druid/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98

https://github.com/alibaba/druid/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98

* any list
{:toc}