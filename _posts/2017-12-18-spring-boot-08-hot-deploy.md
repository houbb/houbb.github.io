---
layout: post
title:  Spring Boot-08-hot deploy 热部署
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 前言

在实际开发过程中，每次修改代码就得将项目重启，重新部署，对于一些大型应用来说，重启时间需要花费大量的时间成本。

对于一个后端开发者来说，重启过程确实很难受啊。

在 Java 开发领域，热部署一直是一个难以解决的问题，目前的 Java 虚拟机只能实现方法体的修改热部署，对于整个类的结构修改，仍然需要重启虚拟机，对类重新加载才能完成更新操作。

下面就看看对于简单的类修改的热部署怎么实现。

# 原理

深层原理是使用了两个ClassLoader，一个Classloader加载那些不会改变的类（第三方Jar包），另一个ClassLoader加载会更改的类，称为restart ClassLoader,这样在有代码更改的时候，原来的restart ClassLoader 被丢弃，重新创建一个restart ClassLoader，由于需要加载的类相比较少，所以实现了较快的重启时间。

# springboot + idea 热部署实战

## pom 引入 devtools

引入 devtools 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

## 添加插件配置

在 pom.xml 中添加插件：

```xml
<build>
     <plugins>
     <plugin>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-maven-plugin</artifactId>
         <configuration>
          <fork>true</fork>
                  <addResources>true</addResources>
         </configuration>
    </plugin>
     </plugins>
</build>
```

## 设置 application.properties

```
#配置项目热部署
spring.devtools.restart.enabled=true
```

## 在 idea 中设置自动编译：

首先 `ctrl+alt+s` 打开设置（Other Settings 的设置是对整个工作空间项目都启作用，而Settings…的设置是对整个项目启作用），搜索Compliler，勾选 `Build project automatically`, 如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0124/205840_b34926c7_508704.png "idea-hot-deploy-1.png")


##  设置 idea 

按住 `ctrl + shift + alt + /`，出现如下图所示界面，点击 `Registry`。

点击进入后，勾选 `compiler.automake.allow.when.app.running` 后关闭即可

如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0124/210150_ddd16096_508704.png "idea-hot-deploy-02.png")

# 方式

springboot有3中热部署方式：

## Spring Loaded

Spring Loaded是一个用于在JVM运行时重新加载类文件更改的JVM代理，Spring Loaded允许你动态的新增、修改、删除某个方法、字段、构造方法，同样可以修改作用在类、方法、字段、构造方法上的注解，也可以新增、删除、改变枚举中的值。

Spring Loaded有两种实现方式，分别是Maven引入依赖方式和添加启动参数方式。

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <dependencies>
        <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>springloaded</artifactId>
        <version>1.2.6.RELEASE</version>
        </dependency>
    </dependencies>
</plugin>
```

### 修改启动方式

使用下面的命令启动

```
mvn spring-boot:run
```

### 修改 jvm 参数

使用 springloaded 本地加载启动，配置jvm参数

`-javaagent:<jar包地址> -noverify`


# 使用 devtools 工具包

spring-boot-devtools 为应用提供一些开发时特性，包括默认值设置，自动重启，livereload等。

## maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

将依赖关系标记为可选 `<optional>true</optional>` 是一种最佳做法，可以防止使用项目将devtools传递性地应用于其他模块。

## 默认属性

在spring boot继承thymeleaf时，spring.thymefeaf.cache属性设置为false可以禁用模板引擎编译的缓存结果。

现在，devtools会自动帮你做到这些，禁用所有模板的缓存，包括 Thymeleaf, Freemarker, Groovy Templates, Velocity, Mustache等。

## 自动重启

自动重启的原理在于spring boot使用两个classloader：不改变的类（如第三方jar）由base类加载器加载，正在开发的类由restart类加载器加载。

应用重启时，restart类加载器被扔掉重建， 而base类加载器不变，这种方法意味着应用程序重新启动通常比“冷启动”快得多，因为base类加载器已经可用并已填充。

所以，当我们开启devtools后，classpath中的文件变化会导致应用自动重启。

当然不同的IDE效果不一样，eclipse中保存文件即可引起classpath更新，从而出发重启。而idea则需要自己手动Ctrl+F9重新编译一下。

（1）排除静态资源文件

静态资源文件在改变之后有时候没必要触发应用程序重启，例如thymeleaf模板文件就可以实时编辑，默认情况下，更改 /META-INF/maven, /META-INF/resources ,/resources ,/static ,/public 或/templates下 的资源不会触发重启，而是触发live reload（devtools内嵌了一个liveReload server，当资源发生改变时，浏览器刷新，下面会介绍）。

可以使用spring.devtools.restart.exclude属性配置，例如

```
spring.devtools.restart.exclude=static/**,public/**
```

如果想保留默认配置，同时增加新的配置，则可使用

```
spring.devtools.restart.additional-exclude属性
```

（2）观察额外的路径

如果你想观察不在classpath中的路径的文件变化并触发重启，则可以配置 spring.devtools.restart.additional-paths 属性。

不在classpath内的path可以配置spring.devtools.restart.additionalpaths属性来增加到监视中，同时配置spring.devtools.restart.exclude可以选择这些path的变化是导致restart还是live reload。

（3）关闭自动重启

设置 spring.devtools.restart.enabled 属性为false，可以关闭该特性。

可以在application.properties中设置，也可以通过设置环境变量的方式。

```java
public static void main(String[] args) {
    System.setProperty("spring.devtools.restart.enabled", "false");
    SpringApplication.run(MyApp.class, args);
}
```

（4）使用一个触发条件

若不想每次修改都触发自动重启，可以设置spring.devtools.restart.trigger-file指向某个文件，只有更改这个文件时才触发自动重启。

（5）自定义自动重启类加载器

默认情况下，IDE中打开的项目都会由restart加载器加载，jar文件由base加载器加载，但是若你使用multi-module的项目，并且不是所有模块都被导入IDE中，此时会导致加载器不一致。

这时你可以创建 META-INF/spring-devtools.properties文件， 并增加 restart.exclude.XXX，restart.include.XXX来配置哪些jar被restart加载，哪些被base加载。

如：

```
restart.include.companycommonlibs=/mycorp-common-[\\w-]+\.jar
restart.include.projectcommon=/mycorp-myproj-[\\w-]+\.jar
```

# JRebel 插件方式

在IDEA中打开插件管理界面，按照下面的提示先安装上

## 安装

直接 idea 插件搜索 JRebel

## 使用

启动的时候，使用 JRebel 插件的方式。

即可享受带来的非凡体验。

# 参考资料

[springboot 实现热部署](https://blog.csdn.net/chachapaofan/article/details/88697452)

[Spring Boot 13 实现热部署](https://blog.csdn.net/guorui_java/article/details/104496412)

[springboot热部署（一）——Java热部署与热加载原理](https://www.cnblogs.com/jiangbei/p/8438733.html)

* any list
{:toc}
