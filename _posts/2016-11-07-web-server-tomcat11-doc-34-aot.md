---
layout: post
title: web server apache tomcat11-34-Ahead of Time compilation support 
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 使用 GraalVM/Mandrel Native Image 工具构建 Tomcat 本机二进制文件

## 设置

本机图像工具更容易与单个 JAR 一起使用，因此该过程将使用 Maven shade 插件 JAR 打包。其思想是生成一个包含来自 Tomcat、Web 应用程序和所有附加依赖项的所有必要类的单个 JAR。尽管 Tomcat 已经接收了兼容性修复以支持本机图像，但其他库可能不兼容，可能需要替换代码（GraalVM 文档有更多详细信息）。

- 下载并安装 GraalVM 或 Mandrel。
- 从 https://github.com/apache/tomcat/tree/main/modules/stuffed 下载 Tomcat Stuffed 模块。为了方便起见，可以设置一个环境变量：

```bash
export TOMCAT_STUFFED=/绝对路径到/stuffed
```

构建过程现在需要 Apache Ant 和 Maven。

## 打包和构建

在 $TOMCAT_STUFFED 文件夹内，目录结构与常规 Tomcat 相同。主要配置文件放置在 conf 文件夹中，如果使用默认的 server.xml，则 Web 应用程序放置在 webapps 文件夹中。

所有 Web 应用程序类都需要在 Maven shade 插件和编译器在 JSP 预编译步骤期间使用。任何存在于 /WEB-INF/lib 中的 JAR 都需要作为 Maven 依赖项提供。webapp-jspc.ant.xml 脚本将从 Web 应用程序的 /WEB-INF/classes 文件夹复制类到 Maven 用作编译目标的 target/classes 路径，但如果任何 JSP 源使用它们，则它们需要打包为 JAR。

首先是使用所有依赖项构建带阴影的 Tomcat JAR。假设 Web 应用程序包含一个 $WEBAPPNAME Web 应用程序，所有 Web 应用程序中的 JSP 都必须预先编译并打包：

```bash
cd $TOMCAT_STUFFED
mvn package
ant -Dwebapp.name=$WEBAPPNAME -f webapp-jspc.ant.xml
```

现在应将 Web 应用程序的依赖项添加到主要的 $TOMCAT_STUFFED/pom.xml，然后构建带阴影的 JAR：

```bash
mvn package
```

最好尽可能避免在 Ahead of Time 编译中使用反射，因此最好将主 server.xml 配置以及用于配置上下文的 context.xml 文件生成并编译为 Tomcat 嵌入式代码。

```bash
$JAVA_HOME/bin/java\
        -Dcatalina.base=. -Djava.util.logging.config.file=conf/logging.properties\
        -jar target/tomcat-stuffed-1.0.jar --catalina -generateCode src/main/java
```

然后停止 Tomcat 并使用以下命令包含生成的嵌入式代码：

```bash
mvn package
```

这里描述的进程的其余部分将假定此步骤已完成，并且在命令行中添加了 --catalina -useGeneratedCode 参数。如果不是这种情况，则应将其删除。

## 本机图像配置

本机图像不支持任何形式的动态类加载或反射，除非在描述符中显式定义。生成它们使用 GraalVM 的跟踪代理，并且在某些情况下需要进行额外的手动配置。

使用 GraalVM substrate VM 及其跟踪代理运行 Tomcat：

```bash
$JAVA_HOME/bin/java\
        -agentlib:native-image-agent=config-output-dir=$TOMCAT_STUFFED/target/\
        -Dorg.graalvm.nativeimage.imagecode=agent\
        -Dcatalina.base=. -Djava.util.logging.config.file=conf/logging.properties\
        -jar target/tomcat-stuffed-1.0.jar --catalina -useGeneratedCode
```

现在，Web 应用程序中通往动态类加载的所有路径（例如：Servlet 访问、WebSockets 等）都需要使用将练习 Web 应用程序的脚本访问。Servlet 可能在启动时加载，而无需实际访问。监听器也可以在启动时用于加载其他类。完成后，可以停止 Tomcat。

描述符现已在代理输出目录中生成。此时必须进行进一步的配置，以添加未跟踪的项目，包括：基本接口、资源包、基于 BeanInfo 的反射等。有关此过程的更多信息，请参阅 Graal 文档。

尽管必须将所有使用的类 AOT 编译到本机图像中，但是 Web 应用程序仍必须保持不变，并且继续在 WEB-INF 文件夹中包含所有所需的类和 JAR。尽管这些类实际上不会运行或加载，但需要访问它们。

## 构建本机图像

如果一切都做得正确，现在可以使用 native-image 工具构建本机图像。

```bash
$JAVA_HOME/bin/native-image --report-unsupported-elements-at-runtime\
        --enable-http --enable-https --enable-url-protocols=http,https,jar,jrt\
        --initialize-at-build-time=org.eclipse.jdt,org.apache.el.parser.SimpleNode,jakarta.servlet.jsp.JspFactory,org.apache.jasper.servlet.JasperInitializer,org.apache.jasper.runtime.JspFactoryImpl\
        -H:+UnlockExperimentalVMOptions\
        -H:+JNI -H:+ReportExceptionStackTraces\
        -H:ConfigurationFileDirectories=$TOMCAT_STUFFED/target/\
        -H:ReflectionConfigurationFiles=$TOMCAT_STUFFED/tomcat-reflection.json\
        -H:ResourceConfigurationFiles=$TOMCAT_STUFFED/tomcat-resource.json\
        -H:JNIConfigurationFiles=$TOMCAT_STUFFED/tomcat-jni.json\
        -jar $TOMCAT_STUFFED/target/tomcat-stuffed-1.0.jar
```

附加的 --static 参数启用了在生成的二进制文件中

的 glibc、zlib 和 libstd++ 的静态链接。
然后运行本机图像：

```bash
./tomcat-stuffed-1.0 -Dcatalina.base=. -Djava.util.logging.config.file=conf/logging.properties --catalina -useGeneratedCode
```

## 兼容性

Servlet、JSP、EL、WebSockets、Tomcat 容器、tomcat-native、HTTP/2 在本机图像中都支持开箱即用。

在撰写本文档时，由于 Graal 不支持日志管理器配置属性，因此不支持 JULI，除了一些静态初始化器问题外，常规的 java.util.logging 记录器和实现应该使用。

如果使用默认的 server.xml 文件，则必须从配置中删除一些 Server 监听器，因为它们与本机图像不兼容，例如 JMX 监听器（不支持 JMX）和泄漏预防监听器（使用不存在于 Graal 中的内部代码）。

更好的 Tomcat 功能缺失项目：

- java.util.logging LogManager：未实现通过系统属性进行配置，因此必须使用标准 java.util.logging 而不是 JULI
- 静态链接配置：tomcat-native 不能进行静态链接

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/cdi.html

* any list
{:toc}