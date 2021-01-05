---
layout: post
title:  蚂蚁金服开源的 SOFABoot 是什么黑科技？
date:  2021-01-05 08:11:27 +0800
categories: [SOFA]
tags: [sofa, springboot, sh]
published: true
---

# 缘起

最近晚上和公司的同事闲聊，说到了阿里开源的 SOFA 系列，代码写的比较干净，值得学习研究一下。

于是白天花时间学习了一下，感觉确实收获颇丰。

这里分享给大家，希望这会是一个完整的 SOFA 技术栈学习系列。

# SOFABoot

SOFABoot 是蚂蚁金服开源的基于 Spring Boot 的研发框架，它在 Spring Boot 的基础上，提供了诸如 Readiness Check，类隔离，日志空间隔离等能力。

在增强了 Spring Boot 的同时，SOFABoot 提供了让用户可以在 Spring Boot 中非常方便地使用 SOFA 中间件的能力。

![蚂蚁金服](https://images.gitee.com/uploads/images/2021/0105/215642_9ff37068_508704.jpeg "蚂蚁金服.jpg")

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

看了这么多，没什么实际的感觉。

我们直接上手一个入门案例直观感受一下。

代码开源地址：[https://gitee.com/houbinbin/sofaboot-learn/tree/master/sofaboot-learn-quickstart](https://gitee.com/houbinbin/sofaboot-learn/tree/master/sofaboot-learn-quickstart)

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

## 个人感受

这里基本上和 springboot 使用起来没什么差异，学习成本基本为 0。

不过这个入门案例也只是展示了 SOFABoot 比较基础的几个特性：

（1）Readiness Check

（2）日志文件物理隔离

SOFABoot 有一个非常强大的能力，那就是模块化隔离。

下面让我们一起来看一下。

# 蚂蚁金服的业务系统模块化之模块化隔离方案 

无论是什么样的业务系统，多多少少都会去做一些模块化的划分，或横或纵，各种姿势，但是这些姿势真地能帮你划分出良好的模块吗？

本来将分析常见的几种模块化方案的利弊，并且介绍蚂蚁金服开源的框架 SOFA 在模块化中发挥的作用。

# 传统模块化的陷阱

在一个简单的 Spring/SpringBoot 的系统中，我们常常见到一个系统中的模块会按照如下的方式进行分层，如下图中的左边部分所示，一个系统就简单地分为 Web 层、Service 层、DAL 层。

这个也是最常见的一种模式，老马现在基本用的就是这种方式。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0105/215325_b0e618b0_508704.png "module-01-tranditional.png")

当这个系统承载的业务变多了之后，系统可能演化成上图中右边的这种方式。

在上图的右边的部分中，一个系统承载了两个业务，一个是 Cashier（收银台），另一个是 Pay（支付），这两个业务可能会有一些依赖的关系，Cashier 需要调用 Pay 提供的能力去做支付。

但是在这种模块化的方案里面，Spring 的上下文依然是同一个，类也没有任何做隔离，这就意味着，Pay Service 这个模块里面的任何的一个 Bean，都可以被 Cashier Service 这个模块所依赖。

长此以往，模块和模块之间的耦合就会越来越严重，原来的模块的划分形同虚设。

**当系统越来越大，最后需要做服务化拆分的时候，就需要花费非常大的精力去梳理模块和模块之间的关系。**

# OSGi 模块化

提到模块化，不得不提 OSGi，虽然 OSGi 没有成为 Java 官方的模块化的标准，但是由于 Java 在 Java 9 之前，一直没有官方的模块化的标准，所以 OSGi 已经是事实上的标准。

OSGi 为模块化主要做了两个事情：

- OSGi 的类隔离

- OSGi 的声明式服务

下面就给读者们简单地解释一下 OSGi 的这两个方面。

## OSGi 的类隔离

OSGi 通过扩展 Java 的 ClassLoader 机制，将模块和模块之间的类完全隔离开来，当一个模块需要引用另一个模块的类的时候，通过在模块中的 MANIFEST.MF 文件中声明类的导出和导入来解决，如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0105/215440_20c40b13_508704.png "module-02-osgi.png")

通过这种方式，可以控制一个模块特定的类才可以被另一个模块所访问，达到了一定程度地模块的隔离。

但是，光光通过类的导出导入来解决类的引用问题还不够，还需要去解决实例的引用的问题，我们往往希望能够直接使用对方模块提供的某一个类的实例，而不是自己去 new 一个实例出来，所以 OSGi 还提供了声明式服务的方式，让一个模块可以引用到另一个模块提供的服务。

ps：这里可以发现技术的核心底层还是 JVM 的 ClassLoader 机制，所以面试阿里一般对于 jvm 都会问的比较深一些。

## OSGi 的声明式服务

OSGi 的声明式服务正是为了解决这个实例引用的问题，我们可以在一个 OSGi 的模块（Bundle）中去添加一个 XML 配置文件去声明一个服务，如下面的代码所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<scr:component xmlns:scr="http://www.osgi.org/xmlns/scr/v1.1.0" name="ITodoService">
   <implementation class="com.example.e4.rcp.todo.service.internal.MyTodoServiceImpl"/>
   <service>
      <provide interface="com.example.e4.rcp.todo.model.ITodoService"/>
   </service>
</scr:component>
```

也可以同样的通过 XML 配置文件去引用一个其他的模块声明的服务：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<scr:component xmlns:scr="http://www.osgi.org/xmlns/scr/v1.1.0" name="XXXService">
    <reference name="ITodoService"
            interface="com.example.e4.rcp.todo.model.ITodoService"
            bind="setITodoService" cardinality="0..1" unbind="unsetITodoService"
            policy="dynamic" />
   <implementation class="com.example.e4.rcp.todo.service.internal.XXXServiceImpl"/>
</scr:component>
```

通过声明式服务的方式，我们就可以直接在一个 OSGi 的 Bundle 中使用另一个 Bundle 中提供的服务实例了。

## OSGi 的模块化的问题

OSGi 通过类隔离的机制解决了模块之间的类隔离的问题，然后通过声明式服务的方式解决了模块之间的服务调用的问题，看起来已经完美的解决了我们在传统的模块化中遇到的问题，通过这两个机制，模块和模块之间的边界变得清晰了起来。

但是在实践的过程中，OSGi 对开发者的技术要求比较高，并不是非常适合于业务研发。

# SOFA 模块化

为了解决传统的模块化方案模块化不彻底的问题，以及 OSGi 的彻底的模块化带来的复杂性的问题，SOFA 在早期就开始引入了一种折衷的模块化的方案。

SOFA 模块化的整体的示意图如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0105/215528_ea01ccea_508704.png "module-03-sofa.png")

SOFA 模块化的方案，给每一个模块都提供了一个单独的 Spring 的上下文，通过 Spring 上下文的隔离，让模块和模块之间的 Bean 的引用无法直接进行，达到模块在运行时隔离的能力。

当一个模块需要调用另一个模块里面的一个 Bean 的时候，SOFA 采用了类似于 OSGi 的声明式的服务的方式，提供服务的模块可以在其配置文件（也可以通过 Annotation 的方式来声明）中声明一个 SOFA Service：

```xml
<sofa:service ref="sampleBean" interface="com.alipay.sofaboot.SampleBean"/>
```

使用服务的模块可以在其配置文件（也可以通过 Annotation 来使用）声明一个 SOFA Reference：

```xml
<sofa:reference id="sampleBean" interface="com.alipay.sofaboot.SampleBean"/>
```

通过这种方式，一个模块就可以清晰地知道它提供了哪些服务，引用了哪些服务，和其他的模块之间的关系也就非常清楚了。

但是 SOFA 的模块化方案中并没有引入类隔离的方案，这也是为了避免研发的同学去处理太复杂的类加载的问题，简化研发的成本。

ps: 任何一项技术框架都是为了解决特定的问题而产生的，但是往往技术框架的复杂度会成为开发者最大的负担。所以学会取舍，是技术开发者一生的追求和宿命。

# 模块化开发实战

上面看蚂蚁说的头头是道，我们还是直接实践感受一下。

下面的例子是老马从官方的 demo 中简化而来的，原始的 demo 展示了 xml/annotation/api 等方式显得比较复杂，这里重点演示一下 annotation 的方式。

代码开源地址：

> [https://gitee.com/houbinbin/sofaboot-learn/tree/master/sofaboot-learn-isle](https://gitee.com/houbinbin/sofaboot-learn/tree/master/sofaboot-learn-isle)

## 整体模块

```
sofaboot-learn-isle-facade
sofaboot-learn-isle-provider
sofaboot-learn-isle-run
sofaboot-learn-isle-consumer
```

- pom.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>sofaboot-learn</artifactId>
        <groupId>com.github.houbb</groupId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>


    <modelVersion>4.0.0</modelVersion>

    <artifactId>sofaboot-learn-isle</artifactId>
    <packaging>pom</packaging>
    <modules>
        <module>sofaboot-learn-isle-facade</module>
        <module>sofaboot-learn-isle-provider</module>
        <module>sofaboot-learn-isle-run</module>
        <module>sofaboot-learn-isle-consumer</module>
    </modules>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.github.houbb</groupId>
                <artifactId>sofaboot-learn-isle-facade</artifactId>
                <version>${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.github.houbb</groupId>
                <artifactId>sofaboot-learn-isle-provider</artifactId>
                <version>${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.github.houbb</groupId>
                <artifactId>sofaboot-learn-isle-consumer</artifactId>
                <version>${project.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alipay.sofa</groupId>
            <artifactId>runtime-sofa-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alipay.sofa</groupId>
            <artifactId>isle-sofa-boot-starter</artifactId>
        </dependency>
    </dependencies>

</project>
```

## sofaboot-learn-isle-facade

最基础的 facade 接口定义：

```java
package com.github.houbb.sofaboot.learn.isle.facade;

public interface SampleJvmService {
    String message();
}
```

理论上无其他任何依赖。

## sofaboot-learn-isle-provider

服务的提供者：

- pom.xml

引入 facade 依赖。

```xml
<dependencies>
    <dependency>
        <groupId>com.github.houbb</groupId>
        <artifactId>sofaboot-learn-isle-facade</artifactId>
    </dependency>
</dependencies>
```

- SampleJvmServiceAnnotationImpl.java

实现类：

```java
package com.github.houbb.sofaboot.learn.isle.provider;


import com.alipay.sofa.runtime.api.annotation.SofaService;
import com.github.houbb.sofaboot.learn.isle.facade.SampleJvmService;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

/**
 * @author xuanbei 18/5/5
 */
@SofaService
@Service
public class SampleJvmServiceAnnotationImpl implements SampleJvmService {

    @Override
    public String message() {
        String message = "Hello, jvm service annotation implementation.";
        System.out.println(message);
        return message;
    }

}
```

## sofaboot-learn-isle-consumer

对于服务提供的使用。

- pom.xml

引入依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.github.houbb</groupId>
        <artifactId>sofaboot-learn-isle-provider</artifactId>
    </dependency>
</dependencies>
```

- JvmServiceConsumer.java

这里演示里基于注解 `@SofaReference` 的服务调用。

```java
package com.github.houbb.sofaboot.learn.isle.consumer;

import com.alipay.sofa.runtime.api.annotation.SofaReference;
import com.github.houbb.sofaboot.learn.isle.facade.SampleJvmService;
import org.springframework.stereotype.Service;

/**
 * @author xuanbei 18/5/5
 */
@Service
public class JvmServiceConsumer {

    @SofaReference
    private SampleJvmService sampleJvmServiceByFieldAnnotation;

    public void say() {
        sampleJvmServiceByFieldAnnotation.message();
    }

}
```

## 个人感受

SOFABoot 通过拓展的 spring context 实现了模块的隔离，实际上是对服务治理和技术学习成本的一个折中。

任何技术只有推广开来，才能说得上是一个好技术。

下面是对于模块化的详细介绍，感兴趣的小伙伴可以学习下，便于理解上面的代码。

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

# 小结

本节我们主要介绍了 SOFABoot 的入门使用，以及如何解决模块化开发的实战。

说起模块化我们也可以想到 OSGi 以及 jdk9 的 module 支持，不过每一种解决方案都有对应的优势和限制。

SOFABoot 解决了模块的隔离，SOFAArk 则专注于解决类的隔离，我们下一节一起来学习下 SOFA 的另一个神器 SOFAArk。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}