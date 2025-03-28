---
layout: post
title:  SOFABoot-05-依赖管理
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, sofastack, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# 依赖管理

SOFABoot 是在 Spring Boot 的基础上提供的功能扩展。

基于 Spring Boot 的机制，SOFABoot 管理了 SOFA 中间件的依赖，并且提供了 Spring Boot 的 Starter，方便用户在 Spring Boot 中使用 SOFA 中间件。

# SOFABoot 依赖管理 – Maven

在使用 SOFA 中间件之前，需要引入 SOFABoot 依赖管理。

类似 Spring Boot 引入方式，在工程中增加如下 `<parent/>` 标签配置的方式:

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>${sofa.boot.version}</version>
</parent>
```

其中 ${sofa.boot.version} 为具体的 SOFABoot 版本，参考发布历史。

# SOFABoot 依赖管理 – Gradle

从 SOFABoot 3.1.1 版本开始，SOFABoot 开始支持使用 Gradle 来进行依赖管理，如果要使用 Gradle 来进行依赖管理，需要按照如下的形式来配置 build.gradle：

```ts
buildscript {
    ext {
        sofaBootVersion = '3.1.1'
    }
    repositories {
        mavenLocal()
        mavenCentral()
    }
    dependencies {
        classpath("com.alipay.sofa:sofa-boot-gradle-plugin:${sofaBootVersion}")
    }
}

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'com.alipay.sofa.boot'
apply plugin: 'io.spring.dependency-management'

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = 1.8

repositories {
    mavenLocal()
    mavenCentral()
}


dependencies {
    implementation('com.alipay.sofa:rpc-sofa-boot-starter')
    implementation('org.springframework.boot:spring-boot-starter')
    testImplementation('org.springframework.boot:spring-boot-starter-test')
}
```


主要有几个步骤：

- 添加 buildScript，增加 sofa-boot-gradle-plugin 的依赖，其中版本号为你使用的 SOFABoot 的版本。

- 添加两个 plugin，分别是 com.alipay.sofa.boot 和 io.spring.dependency-management。

这样，在 dependencies 里面，就可以直接添加 SOFABoot 管理的各种中间件和依赖了，而不用声明版本号。


# 引入 SOFA 中间件

SOFABoot 使用一系列后缀为 -sofa-boot-starter 来标示一个中间件组件，如果想要使用某个中间件，直接添加对应的依赖即可。

例如，如果期望使用 SOFARPC，只需增加下面的 Maven 依赖即可：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>rpc-sofa-boot-starter</artifactId>
</dependency>
```

注意上面的 Maven 依赖中并没有声明版本，这个是因为版本已经在 sofaboot-dependencies 里面声明好。

这样做的好处是对于 SOFA 中间件，用户统一进行升级即可，不需要单独升级一个中间件的版本，防止出现依赖冲突以及兼容性的问题。

目前管控的 SOFABoot 中间件列表如下:

```
中间件 	        starter
SOFARPC 	    rpc-sofa-boot-starter
SOFATracer 	    tracer-sofa-boot-starter
SOFALookout 	lookout-sofa-boot-starter
```

# 引入 SOFABoot 扩展组件

SOFABoot 基于 Spring Boot 提供了健康检查，模块隔离，类隔离等扩展能力。

遵循 Spring Boot 依赖即服务的理念，添加相关组件依赖之后，扩展能力即可生效。

目前提供的扩展组件如下：

| 扩展组件 	| starter |
|:---|:---|
| 健康检查 	| healthcheck-sofa-boot-starter |
| 模块化隔离 	| isle-sofa-boot-starter |
| 类隔离 	    | sofa-ark-springboot-starter |
| 测试扩展 	| test-sofa-boot-starter |


# 引入 SOFA 中间件 ark 插件

SOFABoot 提供了类隔离组件 SOFAArk，借助 SOFAArk 容器，用户可以将依赖冲突的三方包打包成 ark 插件。

运行时，ark 插件使用单独的类加载器加载，可以和其他 ark 插件以及业务依赖隔离，解决类冲突问题。

SOFABoot 官方提供了 SOFARPC 和 SOFATracer 的 ark 插件，例如在应用中引入 SOFARPC ark 插件依赖替代 SOFARPC starter，从而隔离应用和 SOFARPC 及其间接依赖。

目前管控的 ark 插件列表如下:

| Ark插件 	| plugin |
|:---|:---|
| SOFARPC 	| rpc-sofa-boot-plugin |
| SOFATracer 	| tracer-sofa-boot-plugin |

# 引入 SOFABoot 命名空间

使用 SOFA 中间件时，需要在 XML 中根据中间件的具体使用方式添加相应的配置，这个时候需要引入 SOFABoot 的命名空间 xmlns:sofa="http://sofastack.io/schema/sofaboot" 以能够正确解析相应的配置标签，示例：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
            http://sofastack.io/schema/sofaboot   http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">
</beans>
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://www.sofastack.tech/projects/sofa-boot/dependency-management/

* any list
{:toc}