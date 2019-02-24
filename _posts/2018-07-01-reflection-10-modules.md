---
layout: post
title:  Reflection-10-modules 模块
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——模块

这个Java模块反射教程将解释如何通过Java反射访问Java类所属的Java模块。

Java模块的概念通过Java平台模块系统添加到Java 9中。 

Java模块是一组Java包。 

因此，每个Java类属于一个包，并且该包属于一个模块。

Java模块由Java模块java.base中的Java反射类java.lang.Module表示。 

通过此类，您可以与Java平台模块系统交互以获取有关给定模块的信息，或修改模块。 

本教程将介绍通过Java反射对Module实例可以执行的一些操作。

# 获取一个模块实例

```java
Module myClassModule = MyClass.class.getModule();
```

## isNamed 模块？

您可以通过调用Module isNamed（）方法来检查Module实例是否代表命名模块。 

这是一个例子：

```java
boolean isNamed = myClassModule.isNamed();
```

## isOpen 模块

您可以通过Module isOpen（）方法检查Module是否是命名模块。 

这是一个例子：

```java
boolean isOpen = myClassModule.isOpen();
```

# 获取模块描述类

一旦您有权访问Module实例，就可以通过getDescriptor（）方法访问其ModuleDescriptor。 

以下是通过getDescriptor（）访问Java模块的ModuleDescriptor的示例：

```java
ModuleDescriptor descriptor = myClassModule.getDescriptor();
```

从ModuleDescriptor中，您可以读取模块的模块描述符中的信息。 

此Java模块反射教程将介绍您可以从以下部分中的模块描述符获取的一些信息。

## 模块名称

您可以通过ModuleDescriptor name（）方法从其模块描述符中获取命名模块的名称。 

以下是通过反射读取Java模块名称的示例：

```java
String moduleName = descriptor.name();
```

## Exported Packages

您可以通过ModuleDescriptor exports（）方法读取Java模块通过Java反射导出的包列表。 

以下是从Java模块获取导出包集的示例：

```java
Set<ModuleDescriptor.Exports> exports = descriptor.exports();
```

## Is Automatic Module?

您可以通过ModuleDescriptor isAutomatic（）方法检查Java模块是否是自动模块。 

以下是检查Java模块是否自动的示例：

```java
boolean isAutomatic = descriptor.isAutomatic();
```

## Is Open Module?

您可以通过ModuleDescriptor isOpen（）方法检查Java模块是否是开放模块。 

以下是检查Java模块是否打开的示例：

```java
boolean isOpen = descriptor.isOpen();
```

## Packages in Module

您可以通过Java反射获取给定Java模块中包的名称列表。 您可以通过ModuleDescriptor packages（）方法执行此操作。 

以下是通过反射获取模块的包名列表的示例：

```java
Set packages = descriptor.packages();
```

## Services Used
 
您也可以通过Java反射阅读给定Java模块使用的服务。 

模块使用的服务也称为模块的服务依赖性。 

您可以通过ModuleDescriptor uses（）方法读取模块服务依赖项。 

以下是如何通过反射读取Java模块的服务依赖性的示例：

```java
Set<String> uses = descriptor.uses();
```


  
# 参考资料

http://tutorials.jenkov.com/java-reflection/modules.html

