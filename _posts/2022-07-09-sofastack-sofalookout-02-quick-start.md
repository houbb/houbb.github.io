---
layout: post
title: SOFALookout 介绍-02-Qucik Start 快速开始
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, rpc, sh]
published: true
---


# SOFALookout 服务端快速开始

## 使用本机 ES 服务

1) 本地启动 ES

```
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:5.6
```

版本：V5，V6

2) 检查 ES 是否健康

```
http://localhost:9200/_cat/health?v
```

3) 启动 Lookout 服务

执行 all-in-one-bootstrap 编译后的 fat-jar 包，如何获得，见文末备注部分：

```
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -jar lookout-all-in-one-bootstrap-1.6.0-executable-ark.jar
```

注意 -Dcom.alipay.sofa.ark.master.biz=lookoutall 是必须的, 用于设置 sofa-ark 的 master biz。

4) 最后进行功能验证

查询 （Gateway）的 metrics 作为功能验证，访问“localhost:9090”，在查询框输入：

```
jvm.memory.heap.used{app="gateway"}
```

![最后进行功能验证](https://gw.alipayobjects.com/mdn/rms_e6b00c/afts/img/A*KMStRaUXIkIAAAAAAAAAAABkARQnAQ)

## 使用远程 ES 服务

总体步骤和“使用本机 ES 服务”类似，唯一不同的是，需要指定配置文件。

```
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -Dlookoutall.config-file=abc.properties \
-jar lookout-all-in-one-bootstrap-1.6.0-executable-ark.jar
```

`-Dlookoutall.config-file`（如果你本地启动 ES 测试的话则该配置项可以忽略！），该配置项制定的文件暂时只能引用文件系统上的 properties 文件(没有像 spring-boot 支持那么丰富），配置项必须以应用名开头，从而提供隔离能力。

例如：在fat-jar同目录下创建一个abc.properties配置文件, 用于存放存放配置文件(下面列出了必须的配置项,用于指向使用的 ES 服务地址）：

```
gateway.metrics.exporter.es.host=localhost
gateway.metrics.exporter.es.port=9200
metrics-server.spring.data.jest.uri=http://localhost:9200
```

## 备注

如何获得 all-in-one-bootstrap 编译后的 fat-jar。

### 方式1：本地编译

```
./boot/all-in-one-bootstrap/build.sh
```

打包结果在 `boot/all-in-one-bootstrap/target/allinone-executable.jar`

### 方式2：发布报告中附件获取

临时方式（针对 1.6.0）暂时提供一个 v1.6.0的snapshot包，下载后（保证ES服务已经单独启动）运行：

```
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -jar lookout-all-1.6.0.snapshot.jar
```

### 方式3：使用docker镜像

服务端默认会连接到 localhost:9200 的ES实例, 而我所用的开发机器是MacOS，无法使用 --net=host 模式启动容器，因此在容器内无法通过 localhost:9200 连接ES，需要使用如下方式绕过去：

编辑一个配置文件，比如 foo.properties：

```
gateway.metrics.exporter.es.host=es
metrics-server.spring.data.jest.uri=http://es:9200
```

在 foo.properties 所在的目录下运行 all-in-one 镜像：

```
docker run -it \
--name allinone \
--link es:es \
-p 7200:7200 \
-p 9090:9090 \
-v $PWD/foo.properties:/home/admin/deploy/foo.properties \
-e JAVA_OPTS="-Dlookoutall.config-file=/home/admin/deploy/foo.properties" \
-e JAVA_OPTS="...定制JVM系统属性..." \
xzchaoo/lookout-allinone:1.6.0-SNAPSHOT
```

这里利用了 docker 的 `–link` 参数使得应用可以访问到ES实例 这里做测试用，所以不用 `-d` 参数在后台运行

# 客户端快速开始 - SOFABoot 项目

该项目演示了如何在 SOFABoot 中使用 SOFALookout 并且对接到 Spring Boot 的 Actuator 中。如果想要对接到 Prometheus 上或者其他的 Registry 中，请参考 Registry 一节。

## 新建 SpringBoot（或 SofaBoot ）项目

新建一个 Spring Boot 的应用（如果是 SOFABoot 工程按照 SOFABoot 文档 - 依赖管理中的方式引入 SOFABoot 即可）。

## 引入 Lookout 的 Starter 依赖

在 pom.xml 中引入以下依赖即可：

```xml
<dependency>
    <groupId>com.alipay.sofa.lookout</groupId>
    <artifactId>lookout-sofa-boot-starter</artifactId>
</dependency>
```

如果 Spring Boot 项目需指定版本。

## 新建一个 Metrics 指标

在完成依赖的引入之后，然后可以在 Spring Boot 中的启动类中，加入如下的方法：

```java
@Autowired
private Registry registry;

@PostConstruct
public void init() {
    Counter counter = registry.counter(registry.createId("http_requests_total").withTag("instant", NetworkUtil.getLocalAddress().getHostName()));
    counter.inc();
}
```

上面的代码中直接通过 `@Autowired` 注入了一个 Registry 的字段，通过这个 Registry 的字段，我们就可以创建对应的 Counter，然后通过修改这个 Counter 的数据来生成 SOFALookout 的 Metrics 的指标。

## 添加配置项

在 SOFABoot 项目中，需要增加一个应用名的配置项：spring.application.name=xxx。

## 与 Spring Boot Actuator 对接

新增了一个指标之后，我们可以选择对接到 Spring Boot Actuator 上，要对接到 Spring Boot Actuator 上面，需要添加如下的依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

添加如上的依赖之后，我们在本地启动应用，访问 http://localhost:8080/metrics，就可以看到前面添加的指标，如下：

```
"http_requests_total.instant-MacBook-Pro-4.local": 1,
```

以上的 QuickStart 的代码在: lookout-client-samples-boot，大家可以下载作为参考。


# 客户端快速开始 - 普通 Java 项目

## 普通 Java 项目

在应用中加入 client 的 Maven 依赖

```xml
<dependency>    
    <groupId>com.alipay.sofa.lookout</groupId>
    <artifactId>lookout-client</artifactId>
    <version>${lookout.client.version}</version>
</dependency>
```

ookout-client 默认依赖了 lookout-reg-server 模块（支持向 lookout server 上报 metrics 数据），如果希望使用其他类型注册表(比如 lookout-reg-prometheus)，那么再加上对应依赖即可。

开始使用 SOFALookout 的 Client 之前，首先需要构建一个全局的客户端实例（ com.alipay.lookout.client.DefaultLookoutClient ）

```java
LookoutConfig lookoutConfig = new LookoutConfig();

DefaultLookoutClient client = new DefaultLookoutClient("appName");
//选择构建需要使用的 Registry(如果多个注册表类型，建议使用同一 lookoutConfig 实例，便于集中管理)
LookoutRegistry lookoutRegistry = new LookoutRegistry(lookoutConfig);
//客户端可以后置添加 registry 实例(至少要加一个)
client.addRegistry(lookoutRegistry);
//(可选)对已加入或后续加入的客户端的 registry 实例，统一注册扩展模块的 metrics
client.registerExtendedMetrics();
```

然后通过客户端拿取 Registry 实例，进行使用：

```java
//该注册表是个“组合”型的注册表
Registry registry = client.getRegistry();
//demo
Id id = registry.createId("http_requests_total");
Counter counter = registry.counter(id);
counter.inc();
```

# 参考资料

https://www.sofastack.tech/projects/sofa-lookout/overview/

https://www.sofastack.tech/projects/sofa-lookout/quick-start-client-boot/

https://www.sofastack.tech/projects/sofa-lookout/quick-start-client-java

* any list
{:toc}