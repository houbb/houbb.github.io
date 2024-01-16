---
layout: post
title: 数据库变化监听 database Change Data Capture cdc-03-Apache NIFI
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, sh]
published: true
---

# 拓展阅读

[Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台。](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

[logstash 日志处理-06-Apache NiFi](https://houbb.github.io/2023/10/30/logstash-06-apache-nifi)

[canal 阿里巴巴 MySQL binlog 增量订阅&消费组件](https://houbb.github.io/2019/02/13/database-sharding-deploy-canal)

[ETL-01-DataX 是阿里云DataWorks数据集成的开源版本。](https://houbb.github.io/2024/01/05/etl-datasource-datax-02-crud)

# Apache NiFi

Apache NiFi is an easy to use, powerful, and reliable system to process and distribute dat

# 特性
Apache NiFi专为数据流设计。它支持高度可配置的数据路由、转换和系统中介逻辑的有向图。

一些其关键特性包括：

- 基于Web的用户界面

设计、控制和监控的无缝体验
多租户用户体验

- 高度可配置

容忍丢失与保证交付
低延迟与高吞吐量
动态优先级设置
流程可在运行时修改
反压支持
可扩展以充分利用整个机器性能
采用零领导者集群模型进行横向扩展

- 数据溯源

从开始到结束跟踪数据流

- 专为扩展设计

构建自己的处理器等
支持快速开发和有效测试

- 安全

SSL、SSH、HTTPS、加密内容等...
可插拔的细粒度基于角色的身份验证/授权
多个团队可以管理和共享流的特定部分


## 最低建议要求

- JDK 21
- Apache Maven 3.9.2

## 最低要求

- JDK 21
- Apache Maven 3.9.2


# 入门指南

阅读开发的快速入门指南。它将包含有关获取源代码的本地副本、问题跟踪的指针以及关于开发环境常见问题的一些建议。

要获取更全面的开发指南和有关贡献到项目的信息，请阅读NiFi开发人员指南。

## 构建

运行以下Maven命令以使用并行执行构建标准项目模块：

```bash
./mvnw clean install -T2C
```

运行以下Maven命令以使用静态分析构建项目模块，以确认其符合代码和许可要求：

```bash
./mvnw clean install -T2C -P contrib-check
```

在Microsoft Windows上构建需要使用`mvnw.cmd`而不是`mvnw`来运行Maven Wrapper。

## 部署

切换到`nifi-assembly`目录。`target`目录包含二进制归档文件。

```bash
cd nifi-assembly
ls -lhd target/nifi*
```

复制`nifi-VERSION-bin.tar.gz`或`nifi-VERSION-bin.zip`到一个单独的部署目录。解压分发包将创建一个以版本命名的新目录。

```bash
mkdir ~/example-nifi-deploy
tar xzf target/nifi-*-bin.tar.gz -C ~/example-nifi-deploy
ls -lh ~/example-nifi-deploy/
```

## 启动

切换到部署位置并运行以下命令以启动NiFi。

```bash
cd ~/example-nifi-deploy/nifi-*
./bin/nifi.sh start
```

运行`bin/nifi.sh start`会在后台启动NiFi并退出。使用`--wait-for-init`选项和可选的超时（以秒为单位）等待完全启动后再退出。

```bash
./bin/nifi.sh start --wait-for-init 120
```

## 身份验证

默认配置在启动时生成随机的用户名和密码。NiFi将生成的凭据写入位于NiFi安装目录下的`logs/nifi-app.log`中的应用程序日志。

可以使用以下命令在安装有grep的操作系统上查找生成的凭据：

```bash
grep Generated logs/nifi-app*log
```

NiFi将生成的凭据记录如下：

```
Generated Username [USERNAME]
Generated Password [PASSWORD]
```

`USERNAME`将是一个由36个字符组成的随机UUID。`PASSWORD`将是一个由32个字符组成的随机字符串。生成的凭据将存储在`conf/login-identity-providers.xml`中，密码将使用bcrypt哈希存储。请将这些凭据记录在安全位置，以便访问NiFi。

可以使用以下命令将随机生成的用户名和密码替换为自定义凭据：

```bash
./bin/nifi.sh set-single-user-credentials <username> <password>
```

## 运行

在Web浏览器中打开以下链接以访问NiFi: [https://localhost:8443/nifi](https://localhost:8443/nifi)

Web浏览器将显示一个警告消息，指示由NiFi在初始化期间生成的自签名证书可能存在潜在的安全风险。

在初始开发安装中，可以选择接受潜在的安全风险并继续加载界面。生产部署应从受信任的证书颁发机构获取证书，并更新NiFi的密钥库和信任库配置。

在接受了自签名证书后访问NiFi将显示登录界面。

## Stopping

Run the following command to stop NiFi:

```
laptop:~ myuser$ cd ~/example-nifi-deploy/nifi-*
laptop:nifi-1.0.0-SNAPSHOT myuser$ ./bin/nifi.sh stop
```

# MiNiFi子项目

MiNiFi是Apache NiFi的子项目努力。

它是一种补充的数据收集方法，用于在数据流管理的核心原则中补充NiFi，重点是在数据创建的源头收集数据。

MiNiFi的具体目标包括：

- 小巧轻便的足迹
- 代理的中央管理
- 数据溯源的生成
- 与NiFi的集成，用于后续数据流管理和信息完整性的完整责任链
- MiNiFi的角色应该从代理在源传感器、系统或服务器的位置上立即行动的角度来考虑。

运行方式：

切换到'minifi-assembly'目录。在目标目录中，应该有MiNiFi的构建。

```bash
cd minifi-assembly
ls -lhd target/minifi*
```

用于测试正在进行的开发的已解压缩构建可以使用目录中名为"minifi-version-bin"的构建，其中版本是当前项目版本。要在另一个位置部署，请使用tarball或zipfile，并在任何您喜欢的位置解压缩它们。分发将位于一个名为版本的通用父目录中。

```bash
mkdir ~/example-minifi-deploy
tar xzf target/minifi-*-bin.tar.gz -C ~/example-minifi-deploy
ls -lh ~/example-minifi-deploy/
```

要运行MiNiFi：

切换到安装MiNiFi的位置并运行它。

```bash
cd ~/example-minifi-deploy/minifi-*
./bin/minifi.sh start
```

查看位于logs文件夹中的日志 $ tail -F ~/example-minifi-deploy/logs/minifi-app.log

要获取关于构建第一个数据流并将数据发送到NiFi实例的帮助，请参阅位于docs文件夹中的System Admin Guide或使用minifi-toolkit。

如果您正在测试进行中的开发，可能希望停止实例。

```bash
cd ~/example-minifi-deploy/minifi-*
./bin/minifi.sh stop
```

## Docker构建

要进行构建：

运行完整的NiFi构建（请参阅上述说明）。然后从minifi/子目录中，执行`mvn -P docker clean install`。

这将运行完整的构建，基于它创建一个docker镜像，并运行docker-compose集成测试。

成功完成后，您应该有一个`apacheminifi:${minifi.version}`的镜像，可以使用以下命令启动（将`${minifi.version}`替换为您分支当前的maven版本）：

```bash
docker run -d -v YOUR_CONFIG.YML:/opt/minifi/minifi-${minifi.version}/conf/config.yml apacheminifi:${minifi.version}
```

其中，`YOUR_CONFIG.YML`应该替换为您的配置文件的路径。

# Registry子项目

Registry是Apache NiFi的一个子项目，是一个补充应用程序，提供了一个中央位置，用于存储和管理跨一个或多个NiFi和/或MiNiFi实例的共享资源。

## 开始使用Registry

构建NiFi（请参阅NiFi的入门指南）
或

仅构建Registry子项目：

```bash
cd nifi/nifi-registry
mvn clean install
```

如果您希望启用样式和许可证检查，请指定`contrib-check`配置文件：

```bash
mvn clean install -Pcontrib-check
```

## 启动Registry

```bash
cd nifi-registry/nifi-registry-assembly/target/nifi-registry-*-bin/nifi-registry-*/
./bin/nifi-registry.sh start
```

请注意，应用程序Web服务器在可访问之前可能需要一些时间加载。

## 访问应用程序Web界面

使用默认设置，应用程序UI将在http://localhost:18080/nifi-registry 上可用。

## 访问应用程序REST API

如果您希望针对应用程序REST API进行测试，可以直接访问REST API。

使用默认设置，REST API的基本URL将位于http://localhost:18080/nifi-registry-api。用于测试REST API的UI将在http://localhost:18080/nifi-registry-api/swagger/ui.html 上可用。

## 访问应用程序日志

日志将在logs/nifi-registry-app.log中可用。


# 数据库测试

为了确保NiFi Registry对不同的关系数据库正常工作，可以利用Testcontainers框架运行现有的集成测试以针对不同的数据库进行测试。

使用Spring配置文件来控制将提供给Spring应用程序上下文的DataSource工厂。

提供了使用Testcontainers框架启动给定数据库的Docker容器并创建相应DataSource的DataSource工厂。如果没有指定配置文件，则默认使用H2 DataSource，并且不需要Docker容器。

假设Docker正在运行构建的系统上，可以运行以下命令：

以下是命令的表格形式：

| 目标数据库          | 构建命令                                       |
|---------------------|-----------------------------------------------|
| 所有支持的数据库    | `mvn verify -Ptest-all-dbs`                     |
| H2（默认）           | `mvn verify`                                    |
| MariaDB 10.3        | `mvn verify -Pcontrib-check -Dspring.profiles.active=mariadb-10-3`  |
| MySQL 8             | `mvn verify -Pcontrib-check -Dspring.profiles.active=mysql-8`      |
| PostgreSQL 10       | `mvn verify -Dspring.profiles.active=postgres-10`  |

有关可用的DataSource工厂的完整列表，请参阅`nifi-registry-test`模块。

# 参考资料 

https://github.com/apache/nifi

* any list
{:toc}