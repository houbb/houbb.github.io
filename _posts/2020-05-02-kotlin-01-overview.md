---
layout: post
title: Kotlin-01-Kotlin 入门学习
date:  2020-5-2 16:28:32 +0800
categories: [Kotlin]
tags: [kotlin, sh]
published: true
---

# 开篇词 

## 学习目的

知道 Kotlin 已经有很长时间了，一直没有深入学习过。

本次趁着有时间，就学习一下。

## 本系列学习笔记

主要做记录的作用，便于以后重温查阅。

本教程主要整理自网络，以及自己的学习源码+心得。

# Kotlin

Kotlin 是一种在 Java 虚拟机上运行的静态类型编程语言，被称之为 Android 世界的Swift，由 JetBrains 设计开发并开源。

Kotlin 可以编译成Java字节码，也可以编译成 JavaScript，方便在没有 JVM 的设备上运行。

在Google I/O 2017中，Google 宣布 Kotlin 成为 Android 官方开发语言。

## 为什么选择 Kotlin？

简洁: 大大减少样板代码的数量。

安全: 避免空指针异常等整个类的错误。

互操作性: 充分利用 JVM、Android 和浏览器的现有库。

工具友好: 可用任何 Java IDE 或者使用命令行构建。

### 复用已有库

这个是非常重要的一个特性，新创建一个语言，最好可以复用已有的代码库。


# Hello Kotlin

此处直接使用 Idea 编辑 Kotlin 开发。

## 入门代码

```kotlin
package com.github.houbb.kotlin.note.overview

fun main(args: Array<String>) {
    print("hello kotlin")
}
```

## 对比的 java 

```java
package com.github.houbb.kotlin.note.overview;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Hello {

    public static void main(String[] args) {
        System.out.println("hello java");    
    }
    
}
```

# 编译

使用 kotlin 编译：

```sh
$ kotlinc hello.kt -include-runtime -d hello.jar
```

-d: 用来设置编译输出的名称，可以是 class 或 .jar 文件，也可以是目录。

-include-runtime: 让 .jar 文件包含 Kotlin 运行库，从而可以直接运行。

如果你想看所有的可用选项，运行:

```sh
$ kotlinc -help
```

运行应用

```sh
$ java -jar hello.jar
Hello, World!
```

## 编译成库

若需要将生成的 jar 包供其他 Kotlin 程序使用，可无需包含 Kotlin 的运行库：

```
$ kotlinc hello.kt -d hello.jar
```

由于这样生成的 .jar 文件不包含 Kotlin 运行库，所以你应该确保当它被使用时，运行时在你的 classpath 上。

你也可以使用 kotlin 命令来运行 Kotlin 编译器生成的 .jar 文件

```
$ kotlin -classpath hello.jar HelloKt
```

HelloKt 为编译器为 hello.kt 文件生成的默认类名。

# 参考资料

## 官方

[官网](http://www.kotlinlang.org/)

## 参考入门教程

[Kotlin 教程](https://www.runoob.com/kotlin/kotlin-tutorial.html)

[Kotlin 使用命令行编译](https://www.runoob.com/kotlin/kotlin-command-line.html)

* any list
{:toc}