---
layout: post
title: 如何编写 java 插件-02-基本概念
date: 2023-05-14 21:01:55 +0800
categories: [Tool]
tags: [idea, java, tool, sh]
published: false
---

# 进入插件世界

## 类别

插件主要分为如下几类：

UI Themes（UI主题）

Custom language support （自定义编程语言支持，如Kotlin)

Framework integration （框架集成，例如Spring，T插件正属于此类）

Tool integration （工具集成，如Maven、Gradle、Git）

User interface add-ons （用户界面组件，例如Random Background）

## 技术栈

开发一个插件需要的用到的技术栈：

Java & Kotlin
IntelliJ SDK
Gradle：依赖管理、sandbox、打包发版
Swing：是的，整个IDEA界面组件用的都是Swing

# IntelliJ SDK

## PSI

PSI (Program Structure Interface)，程序结构接口，主要负责解析文件、创建语法、语义代码。

IDEA （有很多内置的插件），它们把整个工程的所有元素解析成了它们设计实现的PsiElement，你可以用它们提供的API很方便的去CURD所有元素。

IDEA也支持自定义语言，比较复杂了，需要实现Parser、PsiElement、FileType、Visitor等，有兴趣的话可以看看这个插件

https://github.com/JetBrains/intellij-sdk-code-samples/tree/main/simple_language_plugin

## PsiFile

com.intellij.psi.PsiFile是文件结构的根，表示文件的内容为特定语言中元素的层次结构。它是所有PSI文件的公共基类，而在特定的语言文件通常是由它的子类来表示。

例如，PsiJavaFile该类表示Java文件，而，XmlFile该类表示XML文件。

https://plugins.jetbrains.com/docs/intellij/implementing-parser-and-psi.html

## View PSI

一开始我也很懵，上哪去知道code对应的是什么PSI，特别是复杂的PSI，像嵌套的注解、xml、json等。直到有一天发现了神奇宝贝 。它直接打开了我和PSI之间的大门。

Tools | View PSI Structure of Current File... ，使用Gradle:runIde沙箱里才能看到这个工具。

So easy～ 哪里不会点

![video](https://vdn6.vzuu.com/SD/764c5eee-fb4c-11ec-8880-ba49563a26ba.mp4?pkey=AAUSt4y7yKo1h23j_b8F9DK7Olf_DjOoRdttzyrDFbjdf7VPHu3lhUa5YTfsrw3FMsiaTzaVKLwrN0x2khQvAZSJ&c=avc.1.1&f=mp4&pu=078babd7&bu=078babd7&expiration=1684037204&v=ks6)

常用 API

com.intellij.psi.PsiFileFactory：
文件相关操作，e.g.创建文件等。
com.intellij.psi.PsiElementFactory:
元素相关操作，e.g.创建java方法、注解、字段、构造方法等。
com.intellij.psi.PsiManager:
项目访问PSI服务的主要入口点，e.g.查找文件、查找文件夹等。
com.intellij.psi.PsiClass:
在java类查找元素，e.g.查找方法、字段、注解。
com.intellij.psi.JavaPsiFacade:
java元素查找等操作，e.g.查找类等。

...太多了，有些方法得自己猜下方法名全局去搜，或者猜类名利用IDEA的自动提示去查找。



...

TODO...


# 参考资料

https://zhuanlan.zhihu.com/p/400059601

* any list
{:toc}