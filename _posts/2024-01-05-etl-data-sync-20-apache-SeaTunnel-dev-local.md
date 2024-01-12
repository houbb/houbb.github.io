---
layout: post
title: ETL-20-apache SeaTunnel Dev local 本地开发
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 建立开发环境

在本部分，我们将向您展示如何为SeaTunnel设置开发环境，然后在您的JetBrains IntelliJ IDEA中运行一个简单的示例。

您可以在任何您喜欢的开发环境中开发或测试SeaTunnel代码，但在这里，我们以JetBrains IDEA作为示例，逐步教您设置环境。

# 准备工作

在我们开始讨论如何设置环境之前，我们需要进行一些准备工作。确保您已经安装了以下软件：

1. 安装了Git。
2. 安装了Java（目前支持JDK8/JDK11）并设置了JAVA_HOME。
3. 安装了Scala（目前仅支持Scala 2.11.12）。
4. 安装了JetBrains IDEA。

# 设置

## 克隆源代码

首先，您需要从GitHub克隆SeaTunnel的源代码。

```bash
git clone git@github.com:apache/seatunnel.git
```

## 本地安装子项目

在克隆源代码之后，您应该运行`./mvnw`命令将子项目安装到Maven本地仓库。

否则，在JetBrains IntelliJ IDEA中，您的代码可能无法正确启动。

```bash
./mvnw install -Dmaven.test.skip
```

或者使用 maven 命令：

```bash
mvn clean install -DskipTests -U
```

### 编译报错 1

```
[ERROR] Failed to execute goal on project seatunnel-flink-15-starter: Could not resolve dependencies for project org.apache.seatunnel:seatunnel-flink-15-starter:jar:2.3.4-SNAPSHOT: Could not find artifact org.apache.seatunnel:seatunnel-flink-starter-common:jar:2.3.3-SNAPSHOT in apache.snapshots (https://repository.apache.org/snapshots) -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <goals> -rf :seatunnel-flink-15-starter
```

> [[Bug] [seatunnel-translation-flink-15] failed compile](https://github.com/apache/seatunnel/issues/4896)

in 2.3.3 release source code, just update ${revision} to ${project.version} like the picture below.

![release](https://private-user-images.githubusercontent.com/4452553/285139570-945e345a-37bc-4608-ba57-85f351ec8cd7.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MDUwMjg0NjMsIm5iZiI6MTcwNTAyODE2MywicGF0aCI6Ii80NDUyNTUzLzI4NTEzOTU3MC05NDVlMzQ1YS0zN2JjLTQ2MDgtYmE1Ny04NWYzNTFlYzhjZDcucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI0MDExMiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNDAxMTJUMDI1NjAzWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MTc5NzJjNTZhNTFmM2M1YmE1ODQxNmI0MTAxYzkyZDdjNzA0MDJiOTI1ZDIxMGNlMjk4ZjY3M2ZlYmI5M2IzYSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.F5lXegM6nFqZizY_qPSBJmAH9lDL3MmaLzuTzDnv0Y0)

PS: 还是把这个构建一个自己的源码分支。

### 编译报错 2

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-remote-resources-plugin:1.7.0:process (process-resource-bundles) on project connector-iceberg: Execution process-resource-bundles of goal org.apache.maven.plugins:maven-remote-resources-plugin:1.7.0:process failed: Failed to resolve dependencies for one or more projects in the reactor. Reason: Unable to get dependency information for org.pentaho:pentaho-aggdesigner-algorithm:jar:5.1.5-jhyde: Failed to retrieve POM for org.pentaho:pentaho-aggdesigner-algorithm:jar:5.1.5-jhyde: Could not transfer artifact org.pentaho:pentaho-aggdesigner-algorithm:pom:5.1.5-jhyde from/to conjars (http://conjars.org/repo): Connect to conjars.org:80 [conjars.org/54.235.127.59] failed: Connection timed out: connect
[ERROR]   org.pentaho:pentaho-aggdesigner-algorithm:jar:5.1.5-jhyde
[ERROR]
[ERROR] from the specified remote repositories:
[ERROR]   apache.snapshots (https://repository.apache.org/snapshots, releases=false, snapshots=true),
[ERROR]   repo1 (https://repo1.maven.org/maven2, releases=true, snapshots=false),
[ERROR]   conjars (http://conjars.org/repo, releases=true, snapshots=true)
[ERROR] Path to dependency:
[ERROR]         1) org.apache.seatunnel:connector-iceberg:jar:2.3.4-SNAPSHOT
[ERROR]         2) org.apache.hive:hive-exec:jar:core:2.3.9
[ERROR]
[ERROR]
[ERROR] -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/PluginExecutionException
[ERROR]
```

> [Maven try to download a <packaing>pom</package> pom as a jar file and cannot find it](https://stackoverflow.com/questions/42536845/maven-try-to-download-a-packaingpom-package-pom-as-a-jar-file-and-cannot-fin)

> [包下载失败](https://stackoverflow.com/questions/42536845/maven-try-to-download-a-packaingpom-package-pom-as-a-jar-file-and-cannot-fin)

[下载失败](https://www.programmersought.com/article/76106349302/)

1）手动下载 

https://mvnrepository.com/artifact/org.pentaho/pentaho-aggdesigner-algorithm/5.1.4-jhyde

网址：https://developer.aliyun.com/mvn/search

将jar和pom放到maven对应路径下即可。

pentaho-aggdesigner-algorithm-5.1.5-jhyde.jar
pentaho-aggdesigner-algorithm-5.1.5-jhyde.pom

也可以手动 jar，放入到对应的目录：

```
~/.m2/repository/org/pentaho/pentaho-aggdesigner-algorithm/5.1.5-jhyde/pentaho-aggdesigner-algorithm-5.1.5-jhyde.jar
```

我本地是：

```
C:\Users\dh\.m2\repository\org/pentaho/pentaho-aggdesigner-algorithm/5.1.5-jhyde/
```

2）添加 aliyun 的仓库

用这种方式更方便些。

> [Could not find artifact org.pentaho:pentaho-aggdesigner-algorithm:pom:5.1.5-jhyde](https://www.cnblogs.com/convict/p/16654841.html)


是因为这个包不在阿里云公共maven镜像仓库上，需要添加一个新的镜像仓库，修改maven的settings.xml

```xml
<!-- 添加这个镜像仓库在阿里云公共仓库前面 -->
<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>*</mirrorOf>
  <name>spring-plugin</name>
  <url>https://maven.aliyun.com/repository/spring-plugin</url>
</mirror>
<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>*</mirrorOf>
  <name>阿里云公共仓库</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

在这个包下载完后，可以把新增的阿里云spring-plugin镜像仓库注释掉，依旧优先使用阿里云公共仓库。

### 编译报错3

```
[ERROR] Failed to execute goal on project connector-file-jindo-oss: Could not resolve dependencies for project org.apache.seatunnel:connector-file-jindo-oss:jar:2.3.4-SNAPSHOT: The following artifacts could not be resolved: com.aliyun.jindodata:jindo-core:jar:4.6.1, com.aliyun.jindodata:jindosdk:jar:4.6.1: Could not find artifact com.aliyun.jindodata:jindo-core:jar:4.6.1 in aliyunmaven (https://maven.aliyun.com/repository/public) -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <goals> -rf :connector-file-jindo-oss
```

这是因为上面的 aliyun mirror 了所有的 maven，但是阿里云却没有这个包。。。

我们在 https://help.aliyun.com/zh/emr/emr-on-ecs/user-guide/download-jindodata

下载 v4.6.1

[https://emr-public-sh.oss-cn-shanghai.aliyuncs.com/emrjindodata%2Fv4.6.1%2Fjindosdk-4.6.1.tar.gz](https://emr-public-sh.oss-cn-shanghai.aliyuncs.com/emrjindodata%2Fv4.6.1%2Fjindosdk-4.6.1.tar.gz) 

下载完成后，通过 maven 的方式安装：

```
mvn install:install-file -DgroupId=com.aliyun.jindodata -DartifactId=jindo-core -Dversion=4.6.1 -Dpackaging=jar -Dfile=/home/app/Package/jindosdk-4.6.1/lib/jindo-core-4.6.1.jar

mvn install:install-file -DgroupId=com.aliyun.jindodata -DartifactId=jindosdk -Dversion=4.6.1 -Dpackaging=jar -Dfile=/home/app/Package/jindosdk-4.6.1/lib/jindo-sdk-4.6.1.jar
```

### 编译报错4

```
[ERROR] Failed to execute goal on project checkpoint-storage-hdfs: Could not resolve dependencies for project org.apache.seatunnel:checkpoint-storage-hdfs:jar:2.3.4-SNAPSHOT: Failed to collect dependencies at org.apache.hadoop:hadoop-aliyun:jar:3.0.0 -> org.apache.hadoop:hadoop-common:jar:3.0.0 -> org.apache.hadoop:hadoop-auth:jar:3.0.0 -> com.nimbusds:nimbus-jose-jwt:jar:4.41.1 -> net.minidev:json-smart:jar:[1.3.1,2.3]: No versions available for net.minidev:json-smart:jar:[1.3.1,2.3] within specified range -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <goals> -rf :checkpoint-storage-hdfs
```

参考：

> [https://stackoverflow.com/questions/64128952/maven-cannot-use-correct-version-in-verson-range](https://stackoverflow.com/questions/64128952/maven-cannot-use-correct-version-in-verson-range)

```xml
<dependency>
    <groupId>org.apache.hadoop</groupId>
    <artifactId>hadoop-aliyun</artifactId>
    <version>${hadoop-aliyun.version}</version>
    <scope>provided</scope>
</dependency>
```

改为：

```xml
<dependency>
    <groupId>org.apache.hadoop</groupId>
    <artifactId>hadoop-aliyun</artifactId>
    <version>${hadoop-aliyun.version}</version>
    <scope>provided</scope>
    <exclusions>
        <exclusion>
            <groupId>net.minidev</groupId>
            <artifactId>json-smart</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>com.nimbusds</groupId>
    <artifactId>nimbus-jose-jwt</artifactId>
    <version>4.41.1</version>
    <exclusions>
        <exclusion>
            <groupId>net.minidev</groupId>
            <artifactId>json-smart</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>net.minidev</groupId>
    <artifactId>json-smart</artifactId>
    <version>2.3</version>
</dependency>
```


### 编译报错 5

```
[ERROR] Failed to execute goal on project connector-pulsar: Could not resolve dependencies for project org.apache.seatunnel:connector-pulsar:jar:2.3.4-SNAPSHOT: Failed to collect dependencies at org.apache.pulsar:pulsar-broker:jar:2.11.0 -> org.apache.pulsar:pulsar-websocket:jar:2.11.0 -> org.apache.pulsar:pulsar-broker-common:jar:2.11.0 -> org.apache.pulsar:pulsar-metadata:jar:2.11.0 -> io.etcd:jetcd-core:jar:0.5.11 -> io.etcd:jetcd-common:jar:0.5.11 -> io.grpc:grpc-core:jar:1.41.0 -> io.grpc:grpc-api:jar:[1.41.0]: No versions available for io.grpc:grpc-api:jar:[1.41.0] within specified range -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <goals> -rf :connector-pulsar
```

## 从源代码构建SeaTunnel

在安装Maven之后，您可以使用以下命令进行编译和打包。

```bash
mvn clean package -pl seatunnel-dist -am -Dmaven.test.skip=true
```

### 解释

这个 Maven 命令具有以下选项和参数：

- `mvn`: Maven 的执行命令。
- `clean`: 清理命令，用于清除先前构建生成的文件和目录。
- `package`: 打包命令，用于将项目代码编译、测试，并将其打包成可部署的格式（通常是 JAR 文件）。
- `-pl seatunnel-dist`: 使用 `-pl`（或 `--projects`）指定要构建的项目或模块。在这里，只构建名为 `seatunnel-dist` 的项目。
- `-am`: 使用 `-am`（或 `--also-make`）选项，将指定项目及其依赖一起构建。在这里，它将构建 `seatunnel-dist` 项目及其依赖。
- `-Dmaven.test.skip=true`: 使用系统属性 `maven.test.skip` 设置为 `true`，跳过测试阶段，不执行测试。

综合起来，这个命令的作用是清理先前的构建、构建指定项目 `seatunnel-dist` 及其依赖，将其打包，并跳过测试阶段。

这在一些情况下很有用，比如在构建过程中不需要执行测试，或者为了加速构建过程。

## 构建子模块

如果您想单独构建子模块，可以使用以下命令进行编译和打包。

```bash
# 这是构建Redis连接器的示例
mvn clean package -pl seatunnel-connectors-v2/connector-redis -am -DskipTests -T 1C
```

## 安装JetBrains IntelliJ IDEA Scala插件

现在，您可以打开您的JetBrains IntelliJ IDEA并浏览源代码，但是要在IDEA中构建Scala代码，您还应该安装JetBrains IntelliJ IDEA的Scala插件。

> [scala plugin](https://plugins.jetbrains.com/plugin/1347-scala)

如果需要，请参阅IDEA安装插件。

安装JetBrains IntelliJ IDEA Lombok插件

在运行以下示例之前，您还应该安装JetBrains IntelliJ IDEA的Lombok插件。如果需要，请参阅IDEA安装插件。

![lombok plugin](https://plugins.jetbrains.com/plugin/6317-lombok)

## 代码风格

Apache SeaTunnel使用Spotless进行代码风格和格式检查。您可以运行以下命令，Spotless将自动为您修复代码风格和格式错误。

```bash
./mvnw spotless:apply
```

您可以将预提交挂钩文件`/tools/spotless_check/pre-commit.sh`复制到您的`.git/hooks/`目录，这样每次使用`git commit`提交代码时，Spotless将自动为您修复问题。

# 运行简单示例

完成上述所有步骤后，您已经完成了环境设置，并可以运行我们提供给您的示例。

所有示例都在`seatunnel-examples`模块中，您可以选择您感兴趣的一个，在IDEA中运行或调试它。

在这里，我们以`seatunnel-examples/seatunnel-flink-connector-v2-example/src/main/java/org/apache/seatunnel/example/flink/v2/SeaTunnelApiExample.java`作为示例。当您成功运行时，您可以看到以下输出：

```plaintext
+I[Ricky Huo, 71]
+I[Gary, 12]
+I[Ricky Huo, 93]
...
...
+I[Ricky Huo, 83]
```

# 更多信息

所有我们的示例都使用简单的源和汇聚，以减少依赖并使其易于运行。

您可以在`resources/examples`中更改示例配置。

如果您想要使用PostgreSQL作为源并将其作为汇聚输出到控制台，可以按照以下配置更改您的配置。

```plaintext
env {
  execution.parallelism = 1
}

source {
  JdbcSource {
    driver = org.postgresql.Driver
    url = "jdbc:postgresql://host:port/database"
    username = postgres
    query = "select * from test"
  }
}

sink {
  ConsoleSink {}
}
```






# 参考资料

[安装说明](https://github.com/aliyun/alibabacloud-jindodata/blob/master/docs/user/4.x/install_dependeny_jindosdk.md)

[Seatunnel实践及相关报错总结](https://blog.51cto.com/u_16098183/7331698)

https://seatunnel.apache.org/docs/2.3.3/contribution/setup

[alibabacloud-jindodata](https://www.cnblogs.com/exmyth/p/17713394.html)

* any list
{:toc}