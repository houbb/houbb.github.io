---
layout: post
title:  SOFABoot 入门篇详解
date:  2021-01-05 08:11:27 +0800
categories: [SOFA]
tags: [sofa, springboot, sh]
published: true
---

# SOFABoot

SOFABoot 是蚂蚁金服开源的基于 Spring Boot 的研发框架，它在 Spring Boot 的基础上，提供了诸如 Readiness Check，类隔离，日志空间隔离等能力。在增强了 Spring Boot 的同时，SOFABoot 提供了让用户可以在 Spring Boot 中非常方便地使用 SOFA 中间件的能力。

## 功能描述

SOFABoot 在 Spring Boot 基础上，提供了以下能力：

- 扩展 Spring Boot 健康检查的能力：在 Spring Boot 健康检查能力基础上，提供了 Readiness Check 的能力，保证应用实例安全上线。

- 提供模块化开发的能力：基于 Spring 上下文隔离提供模块化开发能力，每个 SOFABoot 模块使用独立的 Spring 上下文，避免不同 SOFABoot 模块间的 BeanId 冲
突。

- 增加模块并行加载和 Spring Bean 异步初始化能力，加速应用启动；

- 增加日志空间隔离的能力：中间件框架自动发现应用的日志实现依赖并独立打印日志，避免中间件和应用日志实现绑定，通过 sofa-common-tools 实现。

- 增加类隔离的能力：基于 SOFAArk 框架提供类隔离能力，方便使用者解决各种类冲突问题。

- 增加中间件集成管理的能力：统一管控、提供中间件统一易用的编程接口、每一个 SOFA 中间件都是独立可插拔的组件。

- 提供完全兼容 Spring Boot的能力：SOFABoot 基于 Spring Boot 的基础上进行构建，并且完全兼容 Spring Boot。

# 快速开始

## 基本的 springboot 项目

你可以基于 [springboot init](https://start.spring.io/) 自己生成，主要内容如下：

### xml 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.4.1</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.github.houbb</groupId>
	<artifactId>sofaboot-learn</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>sofaboot-learn</name>
	<description>Demo project for SOFA Boot</description>

	<properties>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

### 启动类

```java
package com.github.houbb.sofaboot.learn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SofabootLearnApplication {

	public static void main(String[] args) {
		SpringApplication.run(SofabootLearnApplication.class, args);
	}

}
```

## 引入 SOFABoot 依赖

修改 maven 项目的配置文件 pom.xml，将

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>${spring.boot.version}</version>
    <relativePath/> 
</parent>
```

替换为：

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>${sofa.boot.version}</version>
</parent>
```

这里我们使用最新版本 3.4.6。

然后，添加 SOFABoot 健康检查扩展能力的依赖及 Web 依赖(方便查看健康检查结果)：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>healthcheck-sofa-boot-starter</artifactId>
</dependency>

<dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 配置文件

最后，在工程的 application.properties 文件下添加 SOFABoot 工程常用的参数配置，其中 spring.application.name 是必需的参数，用于标示当前应用的名称；logging path 用于指定日志的输出目录。

```properties
# Application Name
spring.application.name=SOFABoot Demo
# logging path
logging.path=./logs
```

## 运行

直接运行我们的启动类 main 方法，日志如下：

```
 ,---.    ,-----.  ,------.   ,---.     ,-----.                     ,--.
'   .-'  '  .-.  ' |  .---'  /  O  \    |  |) /_   ,---.   ,---.  ,-'  '-.
`.  `-.  |  | |  | |  `--,  |  .-.  |   |  .-.  \ | .-. | | .-. | '-.  .-'
.-'    | '  '-'  ' |  |`    |  | |  |   |  '--' / ' '-' ' ' '-' '   |  |
`-----'   `-----'  `--'     `--' `--'   `------'   `---'   `---'    `--'


Spring Boot Version: 2.1.13.RELEASE (v2.1.13.RELEASE)
SOFABoot Version: 3.4.6 (v3.4.6)
Powered By Ant Group
...
2021-01-05 09:57:50.623  INFO 12720 --- [2)-172.17.160.1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 7 ms
```

可以发现整体启动时间只用了 7ms，还是很快的。

## 检查

### maven

直接浏览器访问 [http://localhost:8080/actuator/versions](http://localhost:8080/actuator/versions) 来查看当前 SOFABoot 中使用 Maven 插件生成的版本信息汇总。

我们选取一个，如下：

```json
{
  "GroupId": "com.alipay.sofa",
  "Doc-Url": "http://www.sofastack.tech/sofa-boot/docs/Home",
  "ArtifactId": "healthcheck-sofa-boot-starter",
  "Commit-Time": "2020-11-18T13:07:33+0800",
  "Commit-Id": "0e6f10b9f5f1c4c8070814691b8ef9cbff8a550d",
  "Version": "3.4.6",
  "Build-Time": "2020-11-23T13:49:02+0800"
}
```

### Readiness Check

可以通过在浏览器中输入 [http://localhost:8080/actuator/readiness](http://localhost:8080/actuator/readiness) 查看应用 Readiness Check 的状况

```json
{"status":"UP","details":{"SOFABootReadinessHealthCheckInfo":{"status":"UP","details":{"HealthChecker":{"sofaComponentHealthChecker":{"status":"UP"}}}},"diskSpace":{"status":"UP","details":{"total":127083565056,"free":69193203712,"threshold":10485760}}}}
```

## 日志

SOFABoot 提供了日志的物理隔离：

```
./logs
├── health-check
│   ├── sofaboot-common-default.log
│   └── sofaboot-common-error.log
├── infra
│   ├── common-default.log
│   └── common-error.log
└── spring.log
```


# 模块化开发实战




# 模块化开发介绍

## 是什么

为了更好的理解 SOFABoot 模块化开发的概念，我们来区分几个常见的模块化形式：

- 基于代码组织上的模块化：这是最常见的形式，在开发期，将不同功能的代码放在不同 Java 工程下，在编译期被打进不同 jar 包，在运行期，所有 Java 类都在一个 classpath 下，没做任何隔离；

- 基于 Spring 上下文隔离的模块化：借用 Spring 上下文来做不同功能模块的隔离，在开发期和编译期，代码和配置也会分在不同 Java 工程中，但在运行期，不同模块间的 Spring Bean 相互不可见，DI 只在同一个上下文内部发生，但是所有的 Java 类还是在同一个 ClassLoader 下；

- 基于 ClassLoader 隔离的模块化：借用 ClassLoader 来做隔离，每个模块都有独立的 ClassLoader，模块与模块之间的 classpath 不同，SOFAArk 就是这种模块化的实践方式。

SOFABoot 模块化开发属于第二种模块化形式 —— 基于 Spring 上下文隔离的模块化。

每个 SOFABoot 模块使用独立的 Spring 上下文，避免不同 SOFABoot 模块间的 BeanId 冲突，有效降低企业级多模块开发时团队间的沟通成本。

- 整体通讯图

![modular-development](https://www.sofastack.tech/projects/sofa-boot/modular-development/modular-development.png)

# SOFABoot 模块

SOFABoot 框架定义了 SOFABoot 模块的概念，一个 SOFABoot 模块是一个包括 Java 代码、Spring 配置文件、SOFABoot 模块标识等信息的普通 Jar 包。

一个 SOFABoot 应用可以包含多个 SOFABoot 模块，每个 SOFABoot 模块都含有独立的 Spring 上下文。

以 SOFABoot 模块为单元的模块化方式为开发者提供了以下功能：

- 运行时，每个 SOFABoot 模块的 Spring 上下文是隔离的，模块间定义的 Bean 不会相互影响；

- 每个 SOFABoot 模块是功能完备且自包含的，可以很容易在不同的 SOFABoot 应用中进行模块迁移和复用，只需将 SOFABoot 模块整个拷贝过去，调整 Maven 依赖，即可运行。

## 模块配置

SOFABoot 模块是一个普通的 Jar 包加上一些 SOFABoot 特有的配置，这些 SOFABoot 特有的配置，让一个 Jar 包能够被 SOFABoot 识别，使之具备模块化的能力。

一个完整的 SOFABoot 模块和一个普通的 Jar 包有两点区别:

1. SOFABoot 模块包含一份 sofa-module.properties 文件，这份文件里面定义了 SOFABoot 模块的名称以及模块之间的依赖关系。

2. SOFABoot 模块的 META-INF/spring 目录下，可以放置任意多的 Spring 配置文件，SOFABoot 会自动把它们作为本模块的 Spring 配置加载起来。

## sofa-module.properties 文件详解

先来看一份完整的 sofa-module.properties 文件（src/main/resources 目录下）：

```properties
Module-Name=com.alipay.test.biz.service.impl
Spring-Parent=com.alipay.test.common.dal
Require-Module=com.alipay.test.biz.shared
Module-Profile=dev
```

### Module-Name

Module-Name 是 SOFABoot 模块的名称，也是 SOFABoot 模块的唯一标示符。

在一个 SOFABoot 应用中，一个 SOFABoot 模块的 Module-Name 必须和其他的 SOFABoot 模块的 Module-Name 不一样。

需要注意的一点是，一个 SOFABoot 应用运行时的 SOFABoot 模块，不仅仅只包含本应用的模块，还包括依赖了其他应用的 SOFABoot 模块，确定是否唯一的时候需要把这些 SOFABoot 模块也考虑进去。

### Require-Module

Require-Module 用于定义模块之间的依赖顺序，值是以逗号分隔的 SOFABoot 模块名列表，比如上面的配置中，就表示本模块依赖于 com.alipay.test.biz.shared 模块。

对于这种依赖关系的处理，SOFABoot 会将 com.alipay.test.biz.shared 模块在本模块之前启动，即com.alipay.test.biz.shared 模块将先启动 Spring 上下文。

一般情况下，是不需要为模块定义 Require-Module 的，只有当模块的 Spring 上下文的启动依赖于另一个模块的 Spring 上下文的启动时，才需要定义 Require-Module。

举一个例子，如果你在 A 模块中发布了一个 SOFA JVM Service。在 B 模块的某一个 Bean 的 init 方法里面，需要使用 SOFA Reference 调用这个 JVM Service。假设 B 模块在 A 模块之前启动了，那么 B 模块的 Bean 就会因为 A 模块的 JVM Service 没有发布而 init 失败，导致 Spring 上下文启动失败。这个时候，我们就可以使用 Require-Module 来强制 A 模块在 B 模块之前启动。

### Spring-Parent

在 SOFABoot 应用中，每一个 SOFABoot 模块都是一个独立的 Spring 上下文，并且这些 Spring 上下文之间是相互隔离的。

虽然这样的模块化方式可以带来诸多好处，但是，在某些场景下还是会有一些不便，这个时候，你可以通过 Spring-Parent 来打通两个 SOFABoot 模块的 Spring 上下文。

Spring-Parent 属性可以配置一个模块的名称，比如上面的配置中，就将 com.alipay.test.common.dal 的 Spring 上下文设置为当前模块的 Spring 上下文的父 Spring 上下文。

**由于 Spring 的限制，一个模块的 Spring-Parent 只能有一个模块。**

### Module-Profile

SOFABoot 支持模块级 profile 能力，即在各个模块启动的时候决定模块是否能够启动。

使用 SOFABoot 的 profile 功能，需要在 application.properties 文件增加 com.alipay.sofa.boot.active-profiles 字段，该字段的值为逗号分隔的字符串，表示允许激活的 profile 列表，指定该字段后，SOFABoot 会为每个可以激活的模块指定此字段表示的 profile 列表。

SOFABoot 模块的 sofa-module.properties 文件支持 Module-Profile 字段，该字段的值为逗号分隔的字符串，表示当前模块允许在哪些 profile 激活。

Module-Profile 支持取反操作，`!dev` 表示 com.alipay.sofa.boot.active-profiles 不包含 dev 时被激活。

当应用未指定 com.alipay.sofa.boot.active-profiles 参数时，表示应用所有模块均可启动。

SOFABoot 模块未指定 Module-Profile 时，表示当前 SOFABoot 模块可以在任何 profile 启动。

## Spring 配置文件

SOFABoot 模块可以包含 Spring 配置文件，配置文件需要放置在 META-INF/spring 目录下，SOFABoot 启动时会自动扫描该目录，并把目录下所有 XML 文件作为本模块的 Spring 配置加载起来。

在 Spring 配置文件中，我们可以定义 Bean、发布服务等等。

SOFABoot 模块一般用于封装对外发布服务接口的具体实现，属于业务层，Controller 属于展现层内容，我们不建议也不支持在 SOFABoot 模块中定义 Controller 组件，Controller 组件相关定义请直接放在 Root Application Context。


## Root Application Context

SOFABoot 应用运行时，本身会产生一个 Spring Context，我们把它叫做 Root Application Context，它是每个 SOFABoot 模块创建的 Spring Context 的 Parent。

这样设计的目的是为了保证每个 SOFABoot 模块的 Spring Context 都能发现 Root Application Context 中创建的 Bean，这样当应用新增 Starter 时，不仅 Root Application Context 能够使用 Starter 中新增的 Bean，每个 SOFABoot 模块的 Spring Context 也能使用这些 Bean。

# 模块并行化启动

每个 SOFABoot 模块都是独立的 Spring 上下文，多个 SOFABoot 模块支持并行化启动，与 Spring Boot 的单 Spring 上下文模式相比，模块并行化启动能够加快应用的启动速度。

SOFABoot 会根据 Require-Module 计算模块依赖树，例如以下依赖树表示模块B 和模块C 依赖模块A，模块E 依赖模块D，模块F 依赖模块E：

![依赖](https://www.sofastack.tech/projects/sofa-boot/parallel-start/module-parallel.png)

该依赖树会保证模块A 必定在模块B 和模块C 之前启动，模块D 在模块E 之前启动，模块E 在模块F 之前启动，但是依赖树没有定义模块B 与模块C，模块B、C与模块D、E、F之间的启动顺序，这几个模块之间可以串行启动，也可以并行启动。

SOFABoot 默认会并行启动模块，在使用过程中，如果希望关闭并行启动，可以在 application.properties 中增加以下参数:

```
com.alipay.sofa.boot.module-start-up-parallel=false
```

# Spring Bean 异步初始化 

SOFABoot 提供了模块并行启动以及 Spring Bean 异步初始化能力，用于加快应用启动速度。

本文介绍如何使用 SOFABoot 异步初始化 Spring Bean 能力以提高应用启动速度。

## 使用场景

在实际使用 Spring/Spring Boot 开发中，一些 Bean 在初始化过程中执行准备操作，如拉取远程配置、初始化数据源等等。

在应用启动期间，这些 Bean 会增加 Spring 上下文刷新时间，导致应用启动耗时变长。

为了加速应用启动，SOFABoot 通过配置可选项，将 Bean 的初始化方法（init-method）使用单独线程异步执行，加快 Spring 上下文加载过程，提高应用启动速度。

## 引入依赖

在工程的 pom.xml 文件中，引入如下 starter：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>runtime-sofa-boot-starter</artifactId>
</dependency>
```

## 使用方法

异步初始化 Bean 的原理是开启单独线程负责执行 Bean 的初始化方法（init-method）。

因此，除了引入上述依赖，还需要在 Bean 的 XML 定义中配置 async-init=“true” 属性，用于指定是否异步执行该 Bean 的初始化方法，例如：

```xml
<?xml version="1.0" encoding="UTF-8"?>
 
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                   http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
                   http://sofastack.io/schema/sofaboot   http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">
       
    <!-- async init  test -->
    <bean id="testBean" class="com.alipay.sofa.runtime.beans.TimeWasteBean" init-method="init" async-init="true"/>
</beans>
```

## 属性配置

SOFABoot 异步初始化能力提供两个属性配置，用于指定负责异步执行 Bean 初始化方法（init-method）的线程池大小：

```
com.alipay.sofa.boot.asyncInitBeanCoreSize：线程池基本大小，默认值为 CPU 核数加一。
com.alipay.sofa.boot.asyncInitBeanMaxSize：线程池中允许的最大线程数大小，默认值为 CPU 核数加一。
```

此配置可以通过 VM -D 参数或者 Spring Boot 配置文件 application.yml 设置。

# SOFABoot 模块间通信

上下文隔离后，模块与模块间的 Bean 无法直接注入，模块间需要通过 SOFA 服务进行通信，目前SOFABoot 提供了两种形式的服务发布和引用，用于解决不同级别的模块间调用的问题：

JVM 服务发布和引用：解决一个 SOFABoot 应用内部各个 SOFABoot 模块之间的调用问题。

RPC 服务发布和引用：解决多个 SOFABoot 应用之间的远程调用问题。

# JVM 服务发布与引用 

SOFABoot 提供三种方式给开发人员发布和引用 JVM 服务

- XML 方式

- Annotation 方式

- 编程 API 方式

## XML 方式

### 服务发布

首先需要定义一个 Bean：

```xml
<bean id="sampleService" class="com.alipay.sofa.runtime.test.service.SampleServiceImpl">
```

然后通过 SOFA 提供的 Spring 扩展标签来将上面的 Bean 发布成一个 SOFA JVM 服务。

```xml
<sofa:service interface="com.alipay.sofa.runtime.test.service.SampleService" ref="sampleService">
    <sofa:binding.jvm/>
</sofa:service>
```

上面的配置中的 interface 指的是需要发布成服务的接口，ref 指向的是需要发布成 JVM 服务的 Bean，至此，我们就已经完成了一个 JVM 服务的发布。

### 服务引用

使用 SOFA 提供的 Spring 扩展标签引用服务:

```xml
<sofa:reference interface="com.alipay.sofa.runtime.test.service.SampleService" id="sampleServiceRef">
    <sofa:binding.jvm/>
</sofa:reference>
```

上面的配置中的 interface 是服务的接口，需要和发布服务时配置的 interface 一致。

id 属性的含义同 Spring BeanId。

上面的配置会生成一个 id 为 sampleServiceRef 的 Spring Bean，你可以将 sampleServiceRef 这个 Bean 注入到当前 SOFABoot 模块 Spring 上下文的任意地方。

## Annotation 方式

### 发布

- 警告

如果一个服务已经被加上了 `@SofaService` 的注解，它就不能再用 XML 的方式去发布服务了，选择一种方式发布服务，而不是两种混用。

除了通过 XML 方式发布 JVM 服务和引用之外，SOFABoot 还提供了 Annotation 的方式来发布和引用 JVM 服务。

通过 Annotation 方式发布 JVM 服务，只需要在实现类上加一个 @SofaService 注解即可，如下：

```java
@SofaService
public class SampleImpl implements SampleInterface {
   public void test() {

   }
}
```

@SofaService 的作用是将一个 Bean 发布成一个 JVM 服务，这意味着虽然你可以不用再写 `<sofa:service/>` 的配置，但是还是需要事先将 @SofaService 所注解的类配置成一个 Spring Bean。

在使用 XML 配置 `<sofa:service/>` 的时候，我们配置了一个 interface 属性，但是在使用 @SofaService 注解的时候，却没有看到有配置服务接口的地方。

这是因为当被 @SofaService 注解的类只有一个接口的时候，框架会直接采用这个接口作为服务的接口。当被 @SofaService 注解的类实现了多个接口时，可以设置 @SofaService 的 interfaceType 字段来指定服务接口，比如下面这样：

```java
@SofaService(interfaceType=SampleInterface.class)
public class SampleImpl implements SampleInterface, Serializable {
   public void test() {

   }
}
```

### 引用

和 @SofaService 对应，Sofa 提供了 `@SofaReference` 来引用一个 JVM 服务。

假设我们需要在一个 Spring Bean 中使用 SampleJvmService 这个 JVM 服务，那么只需要在字段上加上一个 @SofaReference 的注解即可：

```java
public class SampleServiceRef {
    @SofaReference
    private SampleService sampleService;
}
```

和 @SofaService 类似，我们也没有在 @SofaReference 上指定服务接口，这是因为 @SofaReference 在不指定服务接口的时候，会采用被注解字段的类型作为服务接口，你也可以通过设定 @SofaReference 的 interfaceType 属性来指定：

```java
public class SampleServiceRef {
    @SofaReference(interfaceType=SampleService.class)
    private SampleService sampleService;
}
```

使用 @SofaService 注解发布服务时，需要在实现类上打上 @SofaService 注解；在 Spring Boot 使用 Bean Method 创建 Bean 时，会导致 @Bean 和 @SofaService 分散在两处，而且无法对同一个实现类使用不同的 unique id。

因此自 SOFABoot v2.6.0 及 v3.1.0 版本起，支持 @SofaService 作用在 Bean Method 之上，例如：

```java
@Configuration
public class SampleSofaServiceConfiguration {
    @Bean("sampleSofaService")
    @SofaService(uniqueId = "service1")
    SampleService service() {
        return new SampleServiceImpl("");
    }
}
```

同样为了方便在 Spring Boot Bean Method 使用注解 @SofaReference 引用服务，自 SOFABoot v2.6.0 及 v3.1.0 版本起，支持在 Bean Method 参数上使用 @SofaReference 注解引用 JVM 服务，例如：

```java
@Configuration
public class MultiSofaReferenceConfiguration {
    @Bean("sampleReference")
    TestService service(@Value("$spring.application.name") String appName,
                        @SofaReference(uniqueId = "service") SampleService service) {
        return new TestService(service);
    }
}
```

# 小结

今天我们和大家一起感受了数据填充工具的便利性，大家工作中有需要就可以用起来。

为了便于大家学习，所有源码均已开源：

对象填充：[https://github.com/houbb/data-factory](https://github.com/houbb/data-factory)

性能压测：[https://github.com/houbb/junitperf](https://github.com/houbb/junitperf)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}