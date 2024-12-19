---
layout: post
title: java 程序如何打包成为一个可执行文件？ JSmooth 是一个 Java 可执行文件包装器
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# JSmooth

JSmooth 是一个 Java 可执行文件包装器。

它为你的 Java 应用程序创建本地的 Windows 启动器（标准 .exe 文件）。

它使得 Java 部署更加顺畅和用户友好，因为它能够自动检测已安装的 Java 虚拟机（JVM）。  

当没有可用的虚拟机时，包装器可以自动下载并安装一个合适的 JVM，或者直接显示消息，或者将用户重定向到一个网站。

JSmooth 提供了多种不同的包装器供你选择，每个包装器都有其独特的行为：选择你喜欢的风格吧！ 

# 特性

## 流畅的用户体验

你的用户将看到并使用一个标准的 Windows Exe 二进制文件。无需再向用户解释 .jar 文件、javaw 关联等技术细节。  
提供多种 GUI、控制台和 Windows 服务包装器！  
JSmooth 的 EXE 启动器非常智能：它能够迅速搜索计算机上安装的 Java 环境，并确定哪一个最适合你的应用程序的需求。如果没有找到合适的虚拟机，也没关系，JSmooth 会确保你的最终用户得到良好的体验：包装器可以将用户重定向到网页，或者更好的是，提供自动下载并安装 Java 环境的选项。

## 灵活的自动 Java 虚拟机检测

检测计算机上安装的任何 Sun JVM 的位置。包装器使用多种策略来检测计算机上所有可用的 JVM，包括使用 Windows 注册表、环境变量和 Windows 路径。  
如果可用，还会检测并使用 Microsoft 的 JView（适用于 1.0 和 1.1 的 Java 应用程序）。  

JVM 搜索顺序可以通过 GUI 完全自定义。你可以选择让可执行文件先在路径中查找，然后再在注册表中查找，或者优先从 JAVA_HOME 中查找。我们支持多种配置！  
有时，将 JRE 与应用程序一起打包更加方便。JSmooth 也可以处理这种情况，你只需要定义 JRE 应该位于哪个文件夹。如果 JRE 不在预定位置，JSmooth 会回退到标准的 JVM 搜索方式。  

指定与你的软件兼容的 JVM 版本。你可以设置最低版本要求，也可以设置最大 JVM 版本要求。

## 图形用户界面

基于 Swing 的项目编辑器使得你可以轻松配置软件的可执行二进制文件。所有参数都可以通过 GUI 配置，点击并编译项目即可。  
为可执行文件关联图标，支持 .ICO、.PNG 或 .GIF 文件（如果需要，自动进行颜色减少处理）。

## 应用程序配置

简便的 Java 属性配置：指定你希望包装器传递给 Java 应用程序的 tag=value 键值对。  
你可以轻松地传递系统环境变量：只需定义要传递给应用程序的 Java 属性，并使用标准的 Windows %VARIABLE% 语法。  
传递一些 Java 程序无法访问的特殊变量，比如可执行文件的路径和名称，甚至是 Windows 计算机名。  
通过直观的 GUI 配置所有类路径，可以添加 .jar、.zip 文件或目录。  
想修改 Java 应用程序使用的当前目录吗？包装器会为你处理这一点。

## 包装器

提供多种 EXE 包装器骨架，适用于 GUI 或控制台应用程序。  

如果没有一个包装器符合你的需求，你可以自行创建！JSmooth 是开源的，且易于与 JSmooth 框架集成。




# 参考资料

https://jsmooth.sourceforge.net/

https://jsmooth.sourceforge.net/docs/jsmooth-doc.html


* any list
{:toc}