---
layout: post
title: Sentry 是跨平台应用程序监控，专注于错误报告。
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, time-series, sf]
published: true
---

# 什么是 Sentry

Sentry 是一项可帮助您实时监控和修复崩溃的服务。 

服务器使用 Python，但它包含一个完整的 API，用于在任何应用程序中从任何语言发送事件。

![Sentry](https://raw.githubusercontent.com/getsentry/sentry/master/docs/screenshots/thumb-2.png)

工作守则，快乐的客户

从错误跟踪到性能监控，开发人员可以看到真正重要的事情，更快地解决问题，并不断了解他们的应用程序 - 从前端到后端。

# SDK

优秀的服务端，可以配置各种 SDK 包。

# java 入门例子

## 说明

Sentry 的 Java SDK 能够为 Release Health 捕获会话以及报告消息和错误。

Sentry for Java 是 Sentry 提供的模块集合； 它支持 Java 1.8 及更高版本。 

从本质上讲，Sentry for Java 提供了一个用于向 Sentry 发送事件的原始客户端。 

首先，我们强烈建议您使用日志库或框架集成之一。

Sentry Java SDK 可与 Kotlin、Scala 和其他 JVM 语言一起使用。 

Java 和 Kotlin 中通常都提供了代码示例。

在此页面上，我们让您启动并运行 Sentry 的 SDK，以便它会自动报告您的应用程序中的错误和异常。

## install

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry</artifactId>
    <version>5.1.2</version>
</dependency>
```

## 配置

配置应该在应用程序的生命周期中尽早进行。

```java
import io.sentry.Sentry;

Sentry.init(options -> {
  options.setDsn("

https://examplePublicKey@o0.ingest.sentry.io/0");
});
```

## 核实

此代码段包含一个故意错误，因此您可以在设置后立即测试一切是否正常：

```java
import io.sentry.Sentry;

try {
  throw new Exception("This is a test.");
} catch (Exception e) {
  Sentry.captureException(e);
}
```

要查看并解决记录的错误，请登录 sentry.io 并打开您的项目。 

单击错误标题将打开一个页面，您可以在其中查看详细信息并将其标记为已解决。

# 个人感受

## 服务端

支持开箱即用 + 本地化部署

## 客户端

支持多种语言的 sdk 包

## 优点

可以非常直观的看到代码中的所有异常信息，而不是基于目前的异常日志，人工去观察。

# 参考资料

https://github.com/getsentry/sentry

* any list
{:toc}