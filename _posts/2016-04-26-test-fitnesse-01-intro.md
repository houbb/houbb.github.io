---
layout: post
title: Fitnesse 01-入门介绍 独立维基和验收测试框架
date:  2016-11-7 17:13:40 +0800
categories: [Test]
tags: [test, integration-test]
published: true
---


# 拓展阅读

[junit5 系列教程](https://houbb.github.io/2018/06/24/junit5-01-hello)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。压测+测试报告生成。)](https://github.com/houbb/junitperf)

# Fitnesse

完全集成的独立维基和验收测试框架

> [fitnesse](http://fitnesse.org/)

## 介绍

FitNesse 是一款用于指定和验证应用程序验收标准（需求）的工具。它充当了软件交付过程中不同利益相关者（专业领域）之间的桥梁。

其维基服务器使软件文档化变得简单。其测试执行功能允许您验证文档与软件之间的一致性，确保文档保持最新，并且软件不会出现回归问题。

为了使其正常工作，测试应该与业务代表一起在业务层面上定义。它们基本上是业务需求，以一种易于所有利益相关者理解的方式展示。当您的需求明确无误时，它们可以与您的应用程序自动验证。

为了使所有利益相关者都能轻松与FitNesse交互，需求可以通过Web浏览器创建和编辑。它就是一个维基！通过编写规范（也称为验收测试），您可以在团队（编程人员和非编程人员）中建立共同的理解。这在交付正确的系统方面非常有帮助。规范可以使用维基语法或富文本编辑器编写，因此不需要了解维基语法。

因为规范实际上可以执行，FitNesse提供了一种方法，即使对于非编程人员也可以演示应用程序是否按设计工作。这可以防止导致项目需求死亡的问题。FitNesse 的目标是在用户界面级别的下面运行，演示在给定应用程序的各种输入情况下，正确的结果被计算出来。在某种程度上，您可以将其视为应用程序的替代用户界面。

被说服了吗？在我们的两分钟示例中更深入了解FitNesse的工作原理。

如果您尚未这样做，请下载并安装FitNesse在您的计算机上。然后学习如何使用FitNesse维基编写验收测试。

# Hello World

> [intro-demo 简体中文](http://blog.csdn.net/funi16/article/details/8985280)

- [下载](http://fitnesse.org/FitNesseDownload) ```fitnesse-standalone.jar```

- 启动

在7979端口启动fitnesse

```
D:\Tools\fitnesse>java -jar fitnesse-standalone.jar -p 7979
十一月 10, 2016 3:36:46 下午 fitnesse.ConfigurationParameter loadProperties
信息: 未找到配置文件 (D:\Tools\fitnesse\plugins.properties)
正在引导 FitNesse，完全集成的独立维基和验收测试框架。
根页面: fitnesse.wiki.fs.WikiFilePage: FitNesseRoot
日志记录器: 无
认证器: fitnesse.authentication.PromiscuousAuthenticator
页面工厂: fitnesse.html.template.PageFactory
页面主题: bootstrap
正在解包 FitNesse 资源的新版本。请耐心等待...
**********************************************************
文件已更新为新版本。
请查看发布说明
http://localhost:7979/FitNesse.ReleaseNotes
以了解新功能和修复。
**********************************************************
在端口 7979 上启动 FitNesse
```

- 访问

```
localhost:7979
```

![index](https://raw.githubusercontent.com/houbb/resource/master/img/tools/fitnesse/2016-11-10-fitnesse-index.png)

- 编辑页面

根据提示，直接点击【编辑】，然后在末尾添加页面名称，如【MyFirstPage】，然后保存。页面名称遵循**WikiWord**的命名规则。

返回页面即可看到添加的页面。

# MAC 上测试

## 启动

```
houbinbindeMacBook-Pro:fitnesse houbinbin$ ls
fitnesse-standalone.jar
houbinbindeMacBook-Pro:fitnesse houbinbin$ pwd
/Users/houbinbin/it/tools/fitnesse
houbinbindeMacBook-Pro:fitnesse houbinbin$ java -jar fitnesse-standalone.jar -p 7979
十一月 10, 2016 10:17:24 下午 fitnesse.ConfigurationParameter loadProperties
信息: 未找到配置文件 (/Users/houbinbin/IT/tools/fitnesse/plugins.properties)
正在引导 FitNesse，完全集成的独立维基和验收测试框架。
根页面: fitnesse.wiki.fs.WikiFilePage: FitNesseRoot
日志记录器: 无
认证器: fitnesse.authentication.PromiscuousAuthenticator
页面工厂: fitnesse.html.template.PageFactory
页面主题: bootstrap
正在解包 FitNesse 资源的新版本。请耐心等待...
**********************************************************
文件已更新为新版本。
请查看发布说明
http://localhost:7979/FitNesse.ReleaseNotes
以了解新功能和修复。
**********************************************************
在端口 7979 上启动 FitNesse
```

## 添加页面 ```MyFirstPage```

1、在 **tools/properties** 中设置页面类型为 **test**

2、编辑页面，添加以下内容：

```
!define TEST_SYSTEM {slim}
!path /Users/houbinbin/IT/tools/fitnesse/fitnesse-standalone.jar
!path /Users/houbinbin/it/tools/fitnesse/
!|HelloWorld|
|sayHello?|
|Hello|
```

内容解释：

Line 1: 使用FitNesse的slim模块，也就是使用网页的形式描述测试用例

Line 2: ```fitnesse-standalone.jar``` jar文件路径。

Line 3: ```HelloWorld.class``` class文件存放路径。

- HelloWorld.java

```java
public class HelloWorld {
  public String sayHello(){
    return "Hello";
  }
}
```

通过命令编译后获得

```
$   javac HelloWorld.java
```

Line 4: 引入HelloWorld类

Line 5: 方法名称,带有```?```说明此方法为返回值,Line 6 为对应的返回值。如果只是```age```,则会调用对应```setAge()``` 方法,下一行为设置的值。

## 测试

点击页面【测试】,结果如下

```
测试页面: 1 正确，0 错误，0 忽略，0 异常     断言: 1 正确，0 错误，0 忽略，0 异常 (0.530 秒)
```

* any list
{:toc}