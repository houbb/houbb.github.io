---
layout: post
title:  Spring Shell 基于 Spring 的编程模型插入自定义命令
date:  2017-12-17 19:46:41 +0800
categories: [Spring]
tags: [spring, shell]
published: true
---


# Spring Shell

Spring Shell项目提供了一个交互式的Shell，允许您使用基于Spring的编程模型插入自定义命令。


## 介绍

Spring Shell项目的用户可以根据Spring Shell jar和添加自己的命令轻松构建一个完整的Shell(aka命令行)应用程序(作为Spring bean的方法)。

创建一个命令行应用程序可以是有用的，例如与您的项目的REST API交互，或者与本地文件内容一起工作。

# Quick Start

当前 [1.2.0.RELEASE](https://docs.spring.io/spring-shell/docs/1.2.0.RELEASE/reference/html/) 为稳定版本，以此进行测试。

官方的文档不多，国内的博客也大同小异，自己简单整理下。

## 内置命令

常见的内置命令罗列如下：

- ConsoleCommands - clr 和 clear - 用于清空控制台。

- DateCommands - date - 显示当前日期和时间。

- ExitCommands - exit 和 quit - 用于退出Shell。

- HelpCommands - help - 列出所有命令及其用法。

- InlineCommentCommands - // 和 ; 显示用于行内注释的有效字符。

- OsCommands - 此命令的关键字是感叹号, !。在感叹号后面，您可以传递一个Unix/Windows命令字符串以执行。

- SystemPropertyCommands - system properties - 显示Shell的系统属性。

- VersionCommands - version - 显示Shell的版本。

AbstractShell类提供了两个与块注释使用相关的命令:

- `/*` 和 `*/` - 块注释的开始和结束字符。

## 简单演示

- pom.xml

引入需要的 jar

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springmvc</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>springmvc-shell</artifactId>


    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>1.1.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.shell</groupId>
            <artifactId>spring-shell</artifactId>
            <version>1.2.0.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
        </dependency>

        <!--test-->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </dependency>

    </dependencies>

</project>
```

- Main.java

```java
import org.springframework.shell.Bootstrap;
import org.springframework.shell.core.JLineShellComponent;

public class Main {

    public static void main(String[] args) {
        Bootstrap bootstrap = new Bootstrap();
        JLineShellComponent shell = bootstrap.getJLineShellComponent();
        shell.start();  //开启命令行
    }
}
```

- 运行 

直接运行 main() 方法，日志如下：

```
Dec 17, 2017 7:56:09 PM org.springframework.context.support.GenericApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.support.GenericApplicationContext@69663380: startup date [Sun Dec 17 19:56:09 CST 2017]; root of context hierarchy
 _____            _               _____ _          _ _ 
/  ___|          (_)             /  ___| |        | | |
\ `--. _ __  _ __ _ _ __   __ _  \ `--.| |__   ___| | |
 `--. \ '_ \| '__| | '_ \ / _` |  `--. \ '_ \ / _ \ | |
/\__/ / |_) | |  | | | | | (_| | /\__/ / | | |  __/ | |
\____/| .__/|_|  |_|_| |_|\__, | \____/|_| |_|\___|_|_|
      | |                  __/ |                       
      |_|                 |___/                        
1.2.0.RELEASE


Welcome to Spring Shell. For assistance press or type "hint" then hit ENTER.
spring-shell>
```

- 测试内置命令

和我们使用普通命令一样

```
spring-shell>version
version
1.2.0.RELEASE
spring-shell>date
date
2017年12月17日 星期日 下午07时56分50秒 CST
spring-shell>help
help
* ! - Allows execution of operating system (OS) commands
* // - Inline comment markers (start of line only)
* ; - Inline comment markers (start of line only)
* clear - Clears the console
* cls - Clears the console
* date - Displays the local date and time
* exit - Exits the shell
* help - List all commands usage
* quit - Exits the shell
* script - Parses the specified resource file and executes its commands
* system properties - Shows the shell's properties
* version - Displays shell version
```

# 自定义命令

上面演示了内置的命令，如果我们希望自定义怎么办呢？

## 项目结构

```
.
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── springmvc
    │   │               └── shell
    │   │                   ├── HelloWorldCommands.java
    │   │                   └── Main.java
    │   └── resources
    │       └── META-INF
    │           └── spring
    │               └── spring-shell-plugin.xml
    └── test
        └── java
            └── com
                └── ryo
                    └── springmvc
                        └── shell
                            └── HelloWorldCommandsTest.java
```

## 文件内容

- pom.xml & Main.java

和上面一样

- spring-shell-plugin.xml

指定 spring 的配置，放置的位置固定。Main.main() 方法中 Bootstrap 启动会自动寻找这个文件。内容如下：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context-3.1.xsd">

    <context:component-scan base-package="com.ryo.springmvc.shell"/>

</beans>
```

- HelloWorldCommands.java

> [开发Spring Shell应用程序](http://www.cnblogs.com/acm-bingzi/p/springshell2.html)



```java
import org.springframework.shell.core.CommandMarker;
import org.springframework.shell.core.annotation.CliAvailabilityIndicator;
import org.springframework.shell.core.annotation.CliCommand;
import org.springframework.shell.core.annotation.CliOption;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class HelloWorldCommands implements CommandMarker {

    protected final Logger LOG = Logger.getLogger(getClass().getName());

    @CliAvailabilityIndicator({"hw simple"})
    public boolean isCommandAvailable() {
        return true;
    }

    @CliCommand(value = "hw simple", help = "Print a simple hello world message")
    public String simple(
            @CliOption(key = { "message" }, mandatory = true, help = "The hello world message")
            final String message,

            @CliOption(key = { "location" }, mandatory = false,
                    help = "Where you are saying hello", specifiedDefaultValue="At work")
            final String location) {

        return "Message = [" + message + "] Location = [" + location + "]";

    }
}
```

一、注解说明

在方法和方法参数上使用了三个注解，这些注释定义了与shell交互的主要契约，分别是:

- CliAvailabilityIndicator  

放在一个方法前返回一个布尔值，表示在shell中是否可以执行一个特定的命令。这个决定通常基于之前执行的命令的历史。它可以防止在满足某些先决条件时出现外部命令，例如执行'configuration'命令。

- CliCommand 

放置在向shell提供命令的方法上。它的值提供了一个或多个字符串，这些字符串作为特定命令名的开始。在整个应用程序中，包括所有的插件中这些必须是唯一的。

- CliOption 

放置在命令方法的参数中，允许它默认值声明参数值为必填的或可选的。

二、代码解释

本例子中，注解 `@CliAvailabilityIndicator` 方法返回 true，这是这个类中暴露给 shell 调用的唯一的命令。如果类中有更多的命令，则将它们作为逗号分隔值列出。

`@CliCommand` 注解是创建 shell 命令 **hw simple**。帮助消息是如果您使用帮助命令'help'将会打印什么内容。这里定义方法名是“simple”，但它可以是任何自定义的名称。

`@CliOption` 注解在每个命令的参数。
您需要决定哪些参数是必需的，哪些是可选的，如果它们是可选的，则有一个默认值。
在本例中，该命令有两个参数：消息'message'和位置'location'。需要使用消息选项，并提供一个帮助消息，以便在为该命令完成任务时为用户提供指导。


## 运行测试

- HelloWorldCommandsTest.java

```java
import org.junit.Test;
import org.springframework.shell.Bootstrap;
import org.springframework.shell.core.CommandResult;
import org.springframework.shell.core.JLineShellComponent;

public class HelloWorldCommandsTest {

    @Test
    public void simpleTest() {
        Bootstrap bootstrap = new Bootstrap();
        JLineShellComponent shell = bootstrap.getJLineShellComponent();

        CommandResult cr = shell.executeCommand("hw simple --message hello");
        System.out.println(cr.getResult());
    }
}
```

打印内容如下:

```
Message = [hello] Location = [null]
```

上面的方法，就是在命令行中执行命令 `hw simple --message hello`，如果按照 Main.main() 启动之后，输入结果和上述一致。






* any list
{:toc}

