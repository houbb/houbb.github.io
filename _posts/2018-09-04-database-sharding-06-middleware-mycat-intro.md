---
layout: post
title: sharding database-06-mysql 分库分表 Mycat 分布式主从复制中间件 
date: 2021-09-05 21:01:55 +0800
categories: [Databae]
tags: [database, sql, database-sharding, open-source, sh]
published: true
---

# MyCat

[MyCAT](https://github.com/MyCATApache/Mycat-Server) 是一款开源软件，面向企业的“大型数据库集群”。

MyCAT是一个强制数据库，它是MySQL的替代品，支持事务和ACID。

MyCAT作为企业数据库MySQL集群，可以替代昂贵的Oracle集群。

MyCAT也是一种新型的数据库，它看起来就像一个融合了内存缓存技术、NoSQL技术和HDFS大数据的SQL服务器。

MyCAT作为一种新型的现代企业数据库产品，与传统的数据库和新的分布式数据仓库相结合。

总之，MyCAT是一种全新的数据库中间件。

Mycat 的目标是将目前独立的数据库和应用程序以低成本平稳迁移到云端，解决数据存储和业务规模快速增长带来的瓶颈问题。

## 特性

- 支持SQL 92标准

- 支持MySQL集群，用作代理

- 支持JDBC连接ORACLE, DB2, SQL Server，模拟为正常的MySQL服务器连接

- 支持MySQL集群、percona集群或mariadb集群，提供高可用的数据碎片集群

- 支持自动故障转移和高可用性

- 支持读写分离，双主多从，单主多主MySQL模型

- 支持全局表，自动将数据分割成多个节点，以实现高效的关系查询

- 支持独特的基于er关系的碎片化策略，以实现高效的关系查询

- 支持多种平台，易于部署和实现

# 优势

基于阿里巴巴开源项目Cobar，其稳定性、可靠性、优秀的架构和性能，以及众多成熟的用例，让MyCAT有了一个良好的开端。 

站在巨人的肩膀上，MyCAT 有足够的信心走得更远。

广泛借鉴最好的开源项目和创新理念，融入Mycat的基因，使MyCAT领先于目前其他同类开源项目，甚至超越了一些商业产品。

MyCAT 背后有一支强大的技术团队，其参与者包括一些资深软件工程师、架构师、DBA 等五年以上从业经验。优秀的技术团队保证了 Mycat 的产品质量。

MyCAT 不依赖任何商业公司。 它不像一些开源项目，其重要的功能被封装在其商业产品中，把开源项目变成一个装饰品。

# 路线图

MyCAT在支持MySQL的基础上，增加了对商业开源数据库的更多支持，包括对PostgreSQL、FireBird等开源数据库的原生支持，以及Oracle等其他非开源数据库通过JDBC的间接支持 、DB2、SQL Server 等。

更智能的自调节属性，如SQL自动统计分析，自动创建和调整索引。 MyCAT根据读写频率自动优化缓存和备份策略

实现更全面的监控和管理

与 HDFS 集成，提供 SQL 命令，将数据库加载到 HDFS 中进行快速分析

集成优秀的开源报表工具，让MyCAT具备数据分析能力

# 下载

Mycat-download 在github上的Mycat-download项目中有一些编译好的二进制安装包。

# 文档

Mycat-doc 的 github 上的 Mycat-doc 项目中有一些文档。

Mycat简单demo，具体参考Mycat权威指南

官网：cat.io 

Mycat权威指南官方下载：https://github.com/MyCATApache/Mycat-Server/blob/4135f25df8239d52d220529cbf7cb697ede40e12/mycat-definitive-guide.pdf

wiki： https://github.com/MyCATApache/Mycat-Server/wiki

# Mycat前世今生

2013年阿里的Cobar在社区使用过程中发现存在一些比较严重的问题，及其使用限制，经过Mycat发起人第一次改良，第一代改良版——Mycat诞生。 

Mycat开源以后，一些Cobar的用户参与了Mycat的开发，最终Mycat发展成为一个由众多软件公司的实力派架构师和资深开发人员维护的社区型开源软件。

2014年Mycat首次在上海的《中华架构师》大会上对外宣讲，更多的人参与进来，随后越来越多的项目采用了Mycat。

2015年5月，由核心参与者们一起编写的第一本官方权威指南《Mycat权威指南》电子版发布，累计超过500本，成为开源项目中的首创。

2015年10月为止，Mycat项目总共有16个Committer。

截至2015年11月，超过300个项目采用Mycat，涵盖银行、电信、电子商务、物流、移动应用、O2O的众多领域和公司。

截至2015年12月，超过4000名用户加群或研究讨论或测试或使用Mycat。

Mycat是基于开源cobar演变而来，我们对cobar的代码进行了彻底的重构，使用NIO重构了网络模块，并且优化了Buffer内核，增强了聚合，Join等基本特性，同时兼容绝大多数数据库成为通用的数据库中间件。1.4 版本以后 完全的脱离基本cobar内核，结合Mycat集群管理、自动扩容、智能优化，成为高性能的中间件。我们致力于开发高性能数据库中间而努力。永不收费，永不闭源，持续推动开源社区的发展。

Mycat吸引和聚集了一大批业内大数据和云计算方面的资深工程师，Mycat的发展壮大基于开源社区志愿者的持续努力，感谢社区志愿者的努力让Mycat更加强大，同时我们也欢迎社区更多的志愿者，特别是公司能够参与进来，参与Mycat的开发，一起推动社区的发展，为社区提供更好的开源中间件。

Mycat还不够强大，Mycat还有很多不足，欢迎社区志愿者的持续优化改进。

# 关键特性

支持SQL92标准

遵守Mysql原生协议，跨语言，跨平台，跨数据库的通用中间件代理。

基于心跳的自动故障切换，支持读写分离，支持MySQL主从，以及galera cluster集群。

支持Galera for MySQL集群，Percona Cluster或者MariaDB cluster

基于Nio实现，有效管理线程，高并发问题。

支持数据的多片自动路由与聚合，支持sum,count,max等常用的聚合函数。

支持单库内部任意join，支持跨库2表join，甚至基于caltlet的多表join。

支持通过全局表，ER关系的分片策略，实现了高效的多表join查询。

支持多租户方案。

支持分布式事务（弱xa）。

支持全局序列号，解决分布式下的主键生成问题。

分片规则丰富，插件化开发，易于扩展。

强大的web，命令行监控。

支持前端作为mysq通用代理，后端JDBC方式支持Oracle、DB2、SQL Server 、 mongodb 、巨杉。

支持密码加密

支持服务降级

支持IP白名单

支持SQL黑名单、sql注入攻击拦截

支持分表（1.6）

集群基于ZooKeeper管理，在线升级，扩容，智能优化，大数据处理（2.0开发版）。


-----------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 mycat

### Mycat 介绍

**Mycat** 是一款开源的分布式数据库中间件，它支持**数据库分片（Sharding）**、**读写分离（Read/Write Splitting）**、**负载均衡**、**数据路由**等功能。Mycat 主要用于解决传统数据库在面对高并发、大数据量时的性能瓶颈问题，通过中间件的方式将数据库请求自动路由到不同的数据库实例、不同的表，从而实现**数据库的横向扩展（Horizontal Scaling）**。

Mycat 最初是基于 **MySQL** 协议开发的，因此它主要支持 MySQL 和 MariaDB 数据库，但也逐渐扩展支持其他数据库系统，如 **Oracle**、**PostgreSQL**、**SQL Server** 等。

### Mycat 的主要特性

1. **分库分表（Sharding）**
   - Mycat 可以根据自定义的规则，将数据分布到多个数据库和表中，实现数据的横向扩展。
   - 支持 **按范围分片**（Range Sharding）、**按哈希分片**（Hash Sharding）和 **按列表分片**（List Sharding）等多种分片策略。
   - 支持**动态分片**，可以灵活调整分片规则，无需大规模改动原有架构。

2. **读写分离（Read/Write Splitting）**
   - Mycat 支持读写分离，所有的写操作会被路由到主库，而读取操作可以分发到多个从库。这能有效减轻主库的压力，提高系统的吞吐量。
   - 支持 **主从复制**，通过配置从库的读请求，优化数据库的读负载。

3. **负载均衡**
   - Mycat 可以为数据库的查询请求提供负载均衡，确保数据库服务器的负载均衡分配，避免某一台数据库过载。

4. **SQL 路由和聚合**
   - Mycat 提供强大的 SQL 路由能力，可以根据 SQL 查询条件将查询请求路由到指定的分库或分表上。
   - 对于跨库查询，Mycat 支持查询聚合功能，能将分布在多个数据库的数据合并，并返回给应用层。

5. **事务支持**
   - Mycat 支持分布式事务（Distributed Transactions），尤其是在多个分库分表的场景下，它可以确保数据一致性。
   - 支持 **2PC（Two-Phase Commit）** 和 **XA 事务**，适用于跨多个数据库和表的事务操作。

6. **SQL 解析与改写**
   - Mycat 支持对 SQL 语句的解析和重写。通过解析和重写，Mycat 可以在执行查询前做出相应的优化，使得查询更加高效。

7. **多种数据库支持**
   - 除了 MySQL，Mycat 还支持其他常见的数据库，如 Oracle、SQL Server、PostgreSQL 等。它通过自定义的数据源配置，实现跨数据库的统一访问。

8. **高可用性和容灾**
   - Mycat 支持 **主从备份**，提供故障切换（Failover）机制，确保在某个数据库节点故障时，自动切换到其他健康的节点，保证系统的高可用性。

9. **集群管理和监控**
   - Mycat 提供集群管理功能，可以轻松管理多个节点、多个实例的部署。
   - 提供监控功能，能够实时查看系统的性能指标（如数据库的连接数、负载、查询延迟等），帮助运维人员进行性能调优和故障排查。

### Mycat 的工作原理

Mycat 充当应用和数据库之间的中间层，所有应用程序的数据库请求都通过 Mycat 进行路由。具体工作原理如下：

1. **SQL 解析与路由**：
   - 当应用程序发起 SQL 请求时，Mycat 会首先解析 SQL 语句，分析其操作对象（表、字段等）。
   - 然后，根据配置的分片规则（如按 ID 分片、按时间分片等），Mycat 确定查询数据所在的物理表和数据库。对于跨表或跨库查询，Mycat 会对多个分片的数据进行聚合，并返回最终结果。

2. **数据路由**：
   - Mycat 根据 SQL 中的条件字段（如 `user_id`、`order_id` 等）计算路由规则，确定数据存储的分片。
   - 对于简单的查询，Mycat 只会查询指定的分片；对于复杂的查询，Mycat 会跨多个分片执行查询，并将结果合并返回。

3. **执行 SQL**：
   - 路由后，Mycat 会将 SQL 请求发送到对应的数据库实例上执行。Mycat 作为中间层，负责将应用的查询请求和数据库的执行过程解耦，屏蔽数据库的复杂性。
   
4. **数据聚合与合并**：
   - 如果查询跨多个数据库或表，Mycat 会将从不同分片返回的数据合并成一个结果集，并返回给应用程序。Mycat 可以处理聚合操作，如 `COUNT`、`SUM` 等，进行合并。

5. **主从复制和读写分离**：
   - 写请求会路由到主库，读请求会路由到从库，从而实现读写分离，减轻主库的压力。

6. **事务管理**：
   - Mycat 支持跨库和跨表事务。它通过分布式事务管理，确保多个数据库中的数据一致性。Mycat 使用 2PC（两阶段提交）协议或 XA 事务协议来管理分布式事务。

### Mycat 的优缺点

**优点**：
- **高扩展性**：Mycat 支持横向扩展，可以通过分库分表将数据分散到多个数据库实例上，处理大规模数据。
- **读写分离**：通过读写分离的方式，可以有效提高系统的读性能，减轻主库的压力。
- **灵活配置**：Mycat 提供了多种分片策略和 SQL 路由方式，支持多种数据库类型。
- **高可用性**：通过主从复制和故障转移机制，Mycat 能够确保系统的高可用性。

**缺点**：
- **学习曲线较陡**：Mycat 配置和调优比较复杂，需要对分布式数据库和 SQL 路由有较深入的理解。
- **跨库查询性能**：在进行跨库查询时，Mycat 需要从多个数据库中获取数据，可能会带来一定的性能开销。
- **维护复杂**：中间件会增加系统的维护复杂性，尤其是当系统规模扩大时，运维和故障排查可能会变得更加困难。

### 适用场景

- **大数据量应用**：如电商平台、大型社交网络、在线金融等，数据量大且增长迅速，Mycat 能有效处理分布式数据库的扩展问题。
- **高并发场景**：如需要高读写吞吐量的应用，Mycat 通过读写分离和负载均衡可以有效提升性能。
- **多种数据库混合使用**：Mycat 支持多种数据库类型，如 MySQL、Oracle 等，可以处理不同类型数据库的请求。

总的来说，Mycat 是一款强大且灵活的数据库中间件，适用于需要分库分表、大规模数据处理、高并发访问的应用场景。

## mycat 实际使用访问 mysql 分库分表的使用例子

在实际使用 **Mycat** 进行 MySQL 分库分表时，通常会根据业务需求定义 **分片规则**，然后通过 Mycat 来实现数据库请求的路由、读写分离和分片管理。

以下是一个典型的 Mycat 配置示例，演示如何实现对 MySQL 数据库的分库分表访问。

### 1. **环境准备**
假设你有两个 MySQL 数据库实例，分别是：
- `db1`：存储用户 ID 范围 1-10000 的数据
- `db2`：存储用户 ID 范围 10001-20000 的数据

同时，你的应用程序需要根据 `user_id` 来分库分表，以便实现负载均衡和横向扩展。

### 2. **Mycat 配置步骤**

#### 2.1 **安装 Mycat**

1. 下载并解压 Mycat（可以从 [Mycat 官网](http://www.mycat.org.cn/) 获取）。
2. 配置 Mycat 环境，修改 `conf` 目录下的配置文件。

#### 2.2 **配置 `mycat.conf`**

`mycat.conf` 是 Mycat 的主配置文件，主要配置 Mycat 的核心参数、日志设置等。

```xml
# mycat.conf

<server>
    <listen host="0.0.0.0" port="8066"/>
    <logger level="info" logDir="logs"/>
    <address>localhost:8066</address>
    <workerThreads>4</workerThreads>
</server>
```

- 配置监听端口为 `8066`，表示 Mycat 将会监听来自应用的请求。

#### 2.3 **配置 `datasource.xml`**

`datasource.xml` 配置文件用于定义 Mycat 连接的多个数据源。在这个例子中，我们将配置两个 MySQL 数据库实例，分别连接 `db1` 和 `db2`。

```xml
# datasource.xml

<datasources>
    <datasource name="mysql1">
        <url>jdbc:mysql://localhost:3306/db1</url>
        <username>root</username>
        <password>password</password>
        <driver>com.mysql.cj.jdbc.Driver</driver>
    </datasource>
    <datasource name="mysql2">
        <url>jdbc:mysql://localhost:3306/db2</url>
        <username>root</username>
        <password>password</password>
        <driver>com.mysql.cj.jdbc.Driver</driver>
    </datasource>
</datasources>
```

- 这里配置了两个 MySQL 数据源，分别连接 `db1` 和 `db2`。

#### 2.4 **配置 `schema.xml`**

`schema.xml` 是 Mycat 中用于定义数据表和数据库的配置文件，包含了数据库的基本连接信息、分库分表规则以及 SQL 重写等。

```xml
# schema.xml

<schema name="mydb" checkSQLvalid="false">
    <table name="user">
        <!-- Sharding rule: Split based on user_id -->
        <shardingkey>user_id</shardingkey>
        <algorithm>hash</algorithm>
        <tableSuffix>_${user_id}</tableSuffix>
        <datasource>mysql1</datasource>
    </table>

    <!-- Second data source for users with user_id > 10000 -->
    <table name="user">
        <shardingkey>user_id</shardingkey>
        <algorithm>hash</algorithm>
        <tableSuffix>_${user_id}</tableSuffix>
        <datasource>mysql2</datasource>
    </table>
</schema>
```

- 这里定义了一个表 `user`，并且使用了 `user_id` 作为分片键（sharding key）。
- `shardingkey` 表示用哪个字段来作为分片依据，`user_id` 是分片键。
- `tableSuffix` 定义了根据 `user_id` 计算出的分表后缀，比如 `user_0`、`user_1`。
- 数据库根据计算出的哈希值将请求路由到不同的数据源（`mysql1` 或 `mysql2`）。

#### 2.5 **配置 `rules.xml`**

在 `rules.xml` 中，我们定义了表的分片规则，包括分片算法、分片策略等。

```xml
# rules.xml

<rules>
    <shardingRule>
        <table name="user">
            <!-- Using user_id as the sharding key -->
            <shardingkey>user_id</shardingkey>
            <algorithm>hash</algorithm>
            <tableSuffix>_${user_id}</tableSuffix>
        </table>
    </shardingRule>
</rules>
```

- `shardingkey` 表示 `user_id` 作为分片的关键字，`algorithm` 表示使用哈希算法来进行分片。

#### 2.6 **配置 `sql.xml`**

`sql.xml` 文件用于定义 SQL 语句的重写规则，可以在这里定义 SQL 改写或优化规则，但对于简单的分库分表应用，不一定需要复杂的 SQL 重写。

### 3. **应用端的 SQL 示例**

假设应用程序有一个查询操作，需要根据 `user_id` 来获取用户信息。通过 Mycat 中的配置，Mycat 会自动决定查询哪个库和哪个表。

```sql
SELECT * FROM user WHERE user_id = 1234;
```

- 如果 `user_id` 在 `db1` 的范围内，Mycat 会将请求路由到 `mysql1` 数据库，并查询 `user_1234` 表。
- 如果 `user_id` 在 `db2` 的范围内，Mycat 会将请求路由到 `mysql2` 数据库，并查询 `user_1234` 表。

对于更复杂的查询，Mycat 会根据配置的分片规则决定如何分片并路由请求。

#### 跨库查询示例：
```sql
SELECT * FROM user WHERE user_id BETWEEN 1 AND 2000;
```

- 这个查询会跨库访问，从 `mysql1` 查询 `user_1` 至 `user_1000` 表的数据，从 `mysql2` 查询 `user_1001` 至 `user_2000` 表的数据。Mycat 会将查询结果合并并返回。

### 4. **读写分离配置**

Mycat 支持读写分离，写操作会路由到主库（如 `mysql1`），而读操作会路由到从库。

在 `datasource.xml` 中，配置主从库。

```xml
<datasources>
    <datasource name="mysql_master">
        <url>jdbc:mysql://localhost:3306/db1</url>
        <username>root</username>
        <password>password</password>
        <driver>com.mysql.cj.jdbc.Driver</driver>
        <write>
            <replica>mysql_slave1</replica>
        </write>
    </datasource>
    <datasource name="mysql_slave1">
        <url>jdbc:mysql://localhost:3307/db1</url>
        <username>root</username>
        <password>password</password>
        <driver>com.mysql.cj.jdbc.Driver</driver>
    </datasource>
</datasources>
```

- 配置了 `mysql_master` 为主库，`mysql_slave1` 为从库。
- 写操作会路由到主库，而读操作会路由到从库，从而实现读写分离。

### 5. **执行 Mycat 启动**

1. 启动 Mycat：

```bash
bin/startup.sh
```

2. 通过 Mycat 启动后，你可以通过 Mycat 的访问端口（如 `8066`）来访问数据库。应用程序通过 JDBC 连接 Mycat，而 Mycat 会自动路由到相应的数据库实例。

### 6. **总结**

- **分库分表**：通过 Mycat 配置分片规则（如按 `user_id` 分片），能够将数据拆分到多个数据库中，提升性能和扩展性。
- **读写分离**：Mycat 支持通过配置主从库实现读写分离，减轻主库的负担。
- **跨库查询**：Mycat 会自动处理跨库查询和数据聚合，为应用提供一个透明的分布式数据库访问层。

Mycat 的配置和使用过程中，需要根据实际业务需求选择合适的分片策略、分片键以及数据库连接策略。

通过 Mycat，能够轻松实现 MySQL 数据库的分库分表、读写分离、负载均衡等功能，提高数据库系统的扩展性和高可用性。

# 参考资料

https://github.com/apache/shardingsphere

https://shardingsphere.apache.org/document/current/cn/overview/

* any list
{:toc}