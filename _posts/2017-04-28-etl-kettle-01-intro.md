---
layout: post
title:  Pentaho Data Integration ( ETL ) a.k.a Kettle-01-入门教程
date:  2017-4-28 09:04:21 +0800
categories: [ETL]
tags: [kettle, etl]
published: true
---

# Pentaho 数据集成

Pentaho 数据集成（ETL），又称 Kettle

### 项目结构

* **assemblies:** 
项目分发归档文件位于此模块下
* **core:** 
核心实现
* **dbdialog:** 
数据库对话框
* **ui:** 
用户界面
* **engine:** 
PDI 引擎
* **engine-ext:** 
PDI 引擎扩展
* **[plugins:](plugins/README.md)** 
PDI 核心插件
* **integration:** 
集成测试

构建方法
--------------

Pentaho 数据集成使用 Maven 框架。

#### 构建项目的先决条件:

* Maven，版本 3+
* Java JDK 11
* 在您的 <user-home>/.m2 目录中的 [settings.xml](https://raw.githubusercontent.com/pentaho/maven-parent-poms/master/maven-support-files/settings.xml)

#### 构建

这是一个 Maven 项目，要构建它，请使用以下命令:

```
$ mvn clean install
```
您还可以选择使用 -Drelease 触发混淆和/或丑化（根据需要）

您还可以选择使用 -Dmaven.test.skip=true 跳过测试（尽管
您应该知道不应该这样做）

构建结果将是一个位于 ```target``` 中的 Pentaho 包。

#### 打包 / 分发

可以使用以下命令构建包:
```
$ mvn clean package
```

打包结果将位于 `assemblies/*` 的 `target/` 子文件夹中。

例如，Desktop Client (CE) 的分发可以在以下位置找到: `assemblies/client/target/pdi-ce-*-SNAPSHOT.zip`.

#### 运行测试

__单元测试__

这将运行项目中（以及子模块中）的所有单元测试。要同时运行集成测试，请参阅下面的集成测试。

```
$ mvn test
```

如果要远程调试单个 Java 单元测试（默认端口为 5005）:

```
$ cd core
$ mvn test -Dtest=<<YourTest>> -Dmaven.surefire.debug
```

__集成测试__

除了单元测试外，还有测试跨模块操作的集成测试。这将运行集成测试。

```
$ mvn verify -DrunITs
```

要运行单个集成测试:

```
$ mvn verify -DrunITs -Dit.test=<<YourIT>>
```

要以调试模式运行单个集成测试（用于在 IDE 中进行远程调试）使用默认端口 5005:

```
$ mvn verify -DrunITs -Dit.test=<<YourIT>> -Dmaven.failsafe.debug
```

要跳过测试

```
$ mvn clean install -DskipTests
```

要获取日志作为文本文件

```
$ mvn clean install test >log.txt
```

* 不要使用 IntelliJ 的内置 Maven。使其使用您从命令行使用的相同的 Maven。

  * 项目首选项 -> 构建、执行、部署 -> 构建工具 -> Maven ==> Maven 主目录

### 贡献

1. 提交拉取请求，引用相关的 [Jira 案例](https://jira.pentaho.com/secure/Dashboard.jspa)
2. 将 Git 补丁文件附加到相关的 [Jira 案例](https://jira.pentaho.com/secure/Dashboard.jspa)

使用 Pentaho checkstyle 格式（通过 `mvn checkstyle:check` 和审查报告）并开发可工作的单元测试有助于确保针对错误和改进的拉取请求得到快速处理。

在编写单元测试时，您可以使用一些 ClassRules 来维护一个健康的
测试环境。使用 [RestorePDIEnvironment](core/src/test/java/org/pentaho/di/junit/rules/RestorePDIEnvironment.java)
和 [RestorePDIEngineEnvironment](engine/src/test/java/org/pentaho/di/junit/rules/RestorePDIEngineEnvironment.java)
分别用于核心和引擎测试。

例如:
```java
public class MyTest {
  @ClassRule public static RestorePDIEnvironment env = new RestorePDIEnvironment();
  #setUp()...
  @Test public void testSomething() { 
    assertTrue( myMethod() ); 
  }
}
```  

### 请求帮助

请访问 https://community.hitachivantara.com/community/products-and-solutions/pentaho/ 提出问题并获取帮助。




# Hello World

> [使用简介](http://www.cnblogs.com/limengqiang/archive/2013/01/16/KettleApply1.html)

一、Download

[Download](http://community.pentaho.com/projects/data-integration/) from here.

二、Install

因kettle为免安装软件，解压缩到任意本地路径即可.

三、Env Prepare

此文件为Java编写。需要配置对应的JDK环境。

```
Microsoft Windows [版本 6.1.7601]
版权所有 (c) 2009 Microsoft Corporation。保留所有权利。

$   java -version
java version "1.7.0_79"
Java(TM) SE Runtime Environment (build 1.7.0_79-b15)
Java HotSpot(TM) Client VM (build 24.79-b02, mixed mode, sharing)
```

四、运行

- Windows

双击运行 `Spoon.bat` 即可。可能遇到虚拟机无法启动的错误，修改一下 `Spoon.bat` 内容

```bat
if "%PENTAHO_DI_JAVA_OPTIONS%"=="" set PENTAHO_DI_JAVA_OPTIONS="-Xms1024m" "-Xmx2048m" "-XX:MaxPermSize=256m"
```

修改 **"-Xmx2048m"** 为 **"-Xmx1024m"** 即可。


- Mac

双击运行 `Spoon.command`。

# Quick Start

- 数据库连接

<label class="label label-danger">数据库连接异常</label>

```
org.pentaho.di.core.exception.KettleDatabaseException: 
Error occurred while trying to connect to the database

Driver class 'org.gjt.mm.mysql.Driver' could not be found, make sure the 'MySQL' driver (jar file) is installed.
org.gjt.mm.mysql.Driver


	at org.pentaho.di.core.database.Database.normalConnect(Database.java:472)
	...
Caused by: org.pentaho.di.core.exception.KettleDatabaseException: 
Driver class 'org.gjt.mm.mysql.Driver' could not be found, make sure the 'MySQL' driver (jar file) is installed.
org.gjt.mm.mysql.Driver

	at org.pentaho.di.core.database.Database.connectUsingClass(Database.java:515)
	at org.pentaho.di.core.database.Database.normalConnect(Database.java:456)
	... 74 more
Caused by: java.lang.ClassNotFoundException: org.gjt.mm.mysql.Driver
	at java.net.URLClassLoader.findClass(URLClassLoader.java:381)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
	at org.pentaho.di.core.database.Database.connectUsingClass(Database.java:490)
	... 75 more
```


解决方案。
 
把本地驱动文件(如`mysql-connector-java-5.1.20.jar`)放到了 `data-integration\libswt\win64` 下面，当然也可以放到 `data-integration\lib` 等程序可以找到的位置，也可以修改一下系统的环境变量，使该驱动可以被找到

切记，要**重启spoon**。


- 数据准备。

1、首先创建2个数据库，**kettle、kettle2**。

2、在两个数据库都是用以下脚本创建表。

```sql
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键, 自增',
  `name` varchar(64) NOT NULL COMMENT '用户名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';
```

3、我们在 kettle.user 中执行以下脚本，插入数据。
 
```sql
INSERT INTO user (name) VALUES
  ('I'),
  ('Like'),
  ('Kettle');
```

数据如下

```
1	I
2	Like
3	Kettle
```

我们下面演示，如何使用 Kettle 让一个数据库表的数据，直接迁移到另外一张表中。


- kettle 实现

1、使用 Kettle，新建一个**表输入**，指定我们的数据源。如下：

![table input](https://raw.githubusercontent.com/houbb/resource/master/img/tools/kettle/2017-05-14-kettle-table-input.png)

SQL 就简单的查询即可：

```sql
SELECT name FROM user WHERE name IS NOT NULL
```

2、插入/更新

![table input](https://raw.githubusercontent.com/houbb/resource/master/img/tools/kettle/2017-05-14-kettle-insert-update.png)

3、运行测试

直接运行即可。Console 会输出对应 LOG。有些类似于 SQL SERVER 的导入导出。但是 KETTLE 更加强大灵活。


# 任务调度

> [任务调度](http://www.ukettle.org/thread-943-1-1.html)


# chat

## Q: kettle 是如何实现数据增量同步的？

"Kettle"是Pentaho Data Integration的旧称，是一种开源的数据整合工具，用于从不同的数据源提取、转换和加载数据。

Kettle通过以下方式实现数据增量同步：

1. **增量抽取（Incremental Extraction）**：Kettle可以通过设置增量抽取条件，仅仅抽取源数据中发生变化的部分，而不是每次都抽取整个数据集。这可以通过日期范围、时间戳、版本号或者其他标识来实现。例如，可以只抽取最近一天的数据更新。

2. **增量加载（Incremental Loading）**：在目标数据库中，Kettle可以根据抽取的增量数据更新目标表，而不是每次都将整个数据集重新加载到目标表中。这可以通过识别新记录、更新现有记录和删除过期记录来完成。

3. **标记字段（Flag Fields）**：在源数据中添加标记字段，用于指示数据的状态，例如数据是否已被处理或者最近更新的时间戳。Kettle可以根据这些标记字段来确定需要进行同步的数据。

4. **日志和错误处理（Logging and Error Handling）**：Kettle可以记录同步过程中的日志信息，以便跟踪数据同步的进度和问题。此外，它还可以配置错误处理机制，以处理同步过程中可能发生的错误情况，例如跳过错误记录或者将其写入错误日志。

5. **调度和监控（Scheduling and Monitoring）**：Kettle可以配置定时调度任务来执行数据同步作业，并提供监控功能，以便实时监视同步过程的状态和性能。

通过这些方法，Kettle能够有效地实现数据增量同步，从而提高数据同步的效率和性能，减少数据同步过程中的资源消耗和时间成本。

## kettle 可以实现 cdc 吗

是的，Kettle可以实现变更数据捕获（CDC，Change Data Capture）功能，用于捕获源系统中发生的数据变化，并将这些变化应用到目标系统中。

CDC通常用于实现实时数据同步、数据复制和数据仓库更新等场景。

在Kettle中，实现CDC通常涉及以下步骤：

1. **数据抽取阶段**：使用Kettle的抽取组件（如Table Input）从源系统中读取数据。这可以是从数据库表、文件、API端点或其他数据源获取数据的过程。

2. **变更数据捕获**：在数据抽取阶段，Kettle会检测到源系统中的变更。这可能涉及监视表中的更新、插入和删除操作，或者通过数据库日志（如MySQL的binlog）来捕获变更。

3. **CDC处理**：Kettle会识别和提取源系统中发生的变更。这可能包括识别新插入的记录、更新已有记录以及删除过期记录等操作。

4. **目标数据加载**：在捕获到变更后，Kettle将这些变更应用到目标系统中。这可能涉及将新记录插入目标表、更新现有记录或者标记删除过期记录等操作。

5. **定期轮询或者持续监控**：CDC功能通常需要定期轮询源系统或者持续监控源系统中的变更，以确保及时捕获和处理数据变更。

通过这些步骤，Kettle可以有效地实现CDC功能，从而实现源系统和目标系统之间的实时数据同步和更新。

## kettle 的 cdc 底层原理是什么？

Kettle实现CDC（Change Data Capture）的底层原理涉及以下关键方面：

1. **日志解析**：对于支持事务日志的数据库系统（如MySQL的binlog、Oracle的Redo log等），Kettle可以解析这些日志以捕获数据库中发生的变更操作，如插入、更新、删除等。

2. **轮询方式**：对于不支持事务日志的数据库系统，Kettle可能采用轮询方式，定期查询源系统中的数据表，比对上一次查询的结果，以发现数据的变化。

3. **标记字段比较**：在一些情况下，源系统可能没有事务日志，但会为数据表添加标记字段，如时间戳或版本号。Kettle可以通过比较这些标记字段的值，识别出数据的变更。

4. **增量抽取**：无论是基于日志解析还是轮询方式，Kettle都会进行增量抽取，仅提取发生变更的数据，而不是全量抽取整个数据表。

5. **变更记录缓存**：Kettle通常会维护一个变更记录的缓存，用于存储从源系统中捕获到的变更操作。这个缓存可以是内存中的数据结构，也可以是临时存储在数据库中的表。

6. **目标数据加载**：一旦捕获到源系统中的变更，Kettle会将这些变更应用到目标系统中，通常采用插入、更新、删除等方式同步数据到目标系统。

综上所述，Kettle的CDC实现依赖于对源系统的数据变更进行实时监控或定期轮询，并利用抽取、比较、解析等技术捕获数据变更，并将其同步到目标系统中。


* any list
{:toc}
