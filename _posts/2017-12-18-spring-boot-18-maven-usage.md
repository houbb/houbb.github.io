---
layout: post
title:  Spring Boot-18-springboot maven 使用技巧
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 引入 springboot maven 插件

使用 springboot maven 插件的方式比较简单。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<!-- ... -->
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

如果使用里程碑或快照版本，则还需要添加适当的pluginRepository元素，如以下清单所示：

```xml
<pluginRepositories>
	<pluginRepository>
		<id>spring-snapshots</id>
		<url>https://repo.spring.io/snapshot</url>
	</pluginRepository>
	<pluginRepository>
		<id>spring-milestones</id>
		<url>https://repo.spring.io/milestone</url>
	</pluginRepository>
</pluginRepositories>
```

# 依赖包管理的 2 种方式

springboot里会引入很多springboot starter依赖，这些依赖的版本号统一管理，springboot有几种方案可以选择。

## 继承 parent

在pom.xml里添加

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies</artifactId>
    <version>1.5.4.RELEASE</version>
</parent>
```

导入时，不用指定版本号:

```xml
<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
</dependency>
```

使用该设置，您还可以通过覆盖自己项目中的属性来覆盖各个依赖项。 

例如，要使用不同版本的SLF4J库和Spring Data发布系列，可以将以下内容添加到pom.xml中：

```xml
<properties>
	<slf4j.version>1.7.30</slf4j.version>
	<spring-data-releasetrain.version>Moore-SR6</spring-data-releasetrain.version>
</properties>
```

## import 导入方式

有时候 parent 继承的方式不是很方便使用，因为 maven 只允许继承一个父类。

```xml
<dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>1.5.4.RELEASE</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
</dependencyManagement>
```


导入时，不用指定版本号:

```xml
<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
</dependency>
```

如上所述，前面的示例设置不允许您使用属性覆盖各个依赖项。 

为了获得相同的结果，您需要在spring-boot-dependencies条目之前的项目的dependencyManagement部分中添加条目。 

例如，要使用不同版本的SLF4J库和Spring Data发布系列，可以将以下元素添加到pom.xml中：

```xml
<dependencyManagement>
	<dependencies>
		<!-- Override SLF4J provided by Spring Boot -->
		<dependency>
			<groupId>org.slf4j</groupId>
			<artifactId>slf4j-api</artifactId>
			<version>1.7.30</version>
		</dependency>
		<!-- Override Spring Data release train provided by Spring Boot -->
		<dependency>
			<groupId>org.springframework.data</groupId>
			<artifactId>spring-data-releasetrain</artifactId>
			<version>2020.0.0-SR1</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-dependencies</artifactId>
			<version>2.4.1</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
```

# 在命令行上覆盖设置

从spring-boot开始，该插件提供了许多用户属性，可让您从命令行自定义配置。

例如，您可以调整配置文件以在运行应用程序时启用，如下所示：

```
$ mvn spring-boot:run -Dspring-boot.run.profiles=dev,local
```

如果在允许它们在命令行上被覆盖时都希望有一个默认值，则应结合使用用户提供的项目属性和MOJO配置。

```xml
<project>
    <properties>
        <app.profiles>local,dev</app.profiles>
    </properties>
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<profiles>${app.profiles}</profiles>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```

以上内容确保默认情况下启用了 local 和 dev。

现在公开了一个专用属性，也可以在命令行中覆盖它：

```
$ mvn spring-boot:run -Dapp.profiles=test
```


# 打包可执行档案

该插件可以创建包含应用程序所有依赖项的可执行归档文件（jar文件和war文件），然后可以使用java -jar运行。

打包可执行归档文件是由重新打包目标执行的，如以下示例所示：

```xml
<build>
	<plugins>
		<plugin>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-maven-plugin</artifactId>
			<executions>
				<execution>
					<goals>
						<goal>repackage</goal>
					</goals>
				</execution>
			</executions>
		</plugin>
	</plugins>
</build>
```

如果您使用的是spring-boot-starter-parent，则已经使用重新打包执行ID预配置了此类执行，因此仅应添加插件定义。

# 使用 maven 运行 springboot 项目

该插件包括一个运行目标，可用于从命令行启动您的应用程序，如以下示例所示：

```
$ mvn spring-boot:run
```

## 热部署

Spring Boot devtools是一个模块，用于改善在使用Spring Boot应用程序时的开发时间体验。 

要启用它，只需将以下依赖项添加到您的项目中：

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-devtools</artifactId>
		<optional>true</optional>
	</dependency>
</dependencies>
```

当devtools运行时，它会在重新编译应用程序时检测到更改并自动刷新它。 

这不仅适用于资源，而且适用于代码。 

它还提供了LiveReload服务器，以便它可以在发生任何变化时自动触发浏览器刷新。

还可以将Devtools配置为仅在静态资源发生更改时刷新浏览器（并忽略代码中的任何更改）。 

只需在项目中包括以下属性：

```
spring.devtools.remote.restart.enabled=false
```

在devtools之前，该插件默认情况下支持资源的热刷新，现在已禁用它，以支持上述解决方案。 

您可以随时通过配置项目来还原它：

```xml
<build>
	<plugins>
		<plugin>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-maven-plugin</artifactId>
			<configuration>
				<addResources>true</addResources>
			</configuration>
		</plugin>
	</plugins>
</build>
```

启用addResources时，在运行应用程序时，任何 `src/main/resources` 目录都将添加到应用程序类路径中，并且将删除在 `target/classes` 中发现的所有重复项。 

这样可以热刷新资源，这在开发Web应用程序时非常有用。 

例如，您可以处理HTML，CSS或JavaScript文件，并且无需重新编译应用程序即可立即查看更改。 

这也是允许您的前端开发人员进行工作而无需下载和安装Java IDE的一种有用方法。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
