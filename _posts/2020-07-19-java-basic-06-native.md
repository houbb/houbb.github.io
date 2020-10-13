---
layout: post
title:  java 基础篇-06-native 关键字详解
date:  2020-7-19 10:37:20 +0800
categories: [Java]
tags: [java, java-base, sf]
published: true
---

# java native 关键字

使用native关键字说明这个方法是原生函数，也就是这个方法是用C/C++语言实现的，并且被编译成了DLL，由java去调用。 

这些函数的实现体在DLL中，JDK的源代码中并不包含，你应该是看不到的。对于不同的平台它们也是不同的。

这也是java的底层机制，实际上java就是在不同的平台上调用不同的native方法实现对操作系统的访问的。

## 作用

native是与C++联合开发的时候用的！使用native关键字说明这个方法是原生函数，也就是这个方法是用C/C++语言实现的，并且被编译成了DLL，由java去调用。

native 是用做java 和其他语言（如c++）进行协作时使用的，也就是native 后的函数的实现不是用java写的。

既然都不是java，那就别管它的源代码了，我们只需要知道这个方法已经被实现即可。

native的意思就是通知操作系统， 这个函数你必须给我实现，因为我要使用。 所以native关键字的函数都是操作系统实现的， java只能调用。

java是跨平台的语言，既然是跨了平台，所付出的代价就是牺牲一些对底层的控制，而java要实现对底层的控制，就需要一些其他语言的帮助，这个就是native的作用了

# JNI 

JNI （Java Native Interface，Java本地接口）是一种编程框架，使得Java虚拟机中的Java程序可以调用本地应用/或库，也可以被其他程序调用。 

本地程序一般是用其它语言（C、C++或汇编语言等）编写的，并且被编译为基于本机硬件和操作系统的程序。

## 目的和作用

有些事情Java无法处理时，JNI允许程序员用其他编程语言来解决，例如，Java标准库不支持的平台相关功能或者程序库。也用于改造已存在的用其它语言写的程序，供Java程序调用。许多基于JNI的标准库提供了很多功能给程序员使用，例如文件I/O、音频相关的功能。当然，也有各种高性能的程序，以及平台相关的API实现，允许所有Java应用程序安全并且平台独立地使用这些功能。

JNI框架允许Native方法调用Java对象，就像Java程序访问Native对象一样方便。Native方法可以创建Java对象，读取这些对象，并调用Java对象执行某些方法。当然Native方法也可以读取由Java程序自身创建的对象，并调用这些对象的方法。

## dll 交互技术

目前java与dll交互的技术主要有3种：jni，jawin和jacob。

目前功能性而言：jni >> jawin > jacob，其大致的结构如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1013/151312_8e3786cb_508704.png)

windows，基于native的PE结构，windows的jvm基于native结构，Java的应用体系构建于jvm之上。

jvm通过加载此jni程序间接调用目标原生函数。

![windows](https://images.gitee.com/uploads/images/2020/1013/151855_119ba085_508704.png)


# 自己实现一个 native 方法

（1）Java程序中声明native修饰的方法，类似于abstract修饰的方法，只有方法签名，没有方法实现。编译该java文件，会产生一个.class文件。

（2）使用javah编译上一步产生的class文件，会产生一个.h文件。

（3）写一个.cpp文件实现上一步中.h文件中的方法。

（4）将上一步的.cpp文件编译成动态链接库文件.dll。

（5）最后就可以使用System或是Runtime中的loadLibrary()方法加载上一步的产生的动态连接库文件了。

## 编写 Java 类

```java
package com.github.houbb.java.basic.learn.keyword;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class HelloWorld {

    //该方法和abstract修饰的方法一样，只有签名。
    public native void h();

    static{
        //不写文件的后缀，程序会自动加上.dll的。
        System.loadLibrary("hello");
    }

    public static void main(String[] args){
        new HelloWorld().h();//调用
    }

}
```

- 执行编译

可以使用命令：`javac HelloWorld.java` 编译为 HelloWord.class 文件，当然一般编辑器也有这个功能。

## javah 编译

我们使用下面的命令编译 class 文件

```
javah HelloWord.class
```


# 小结

# 参考资料

[Java 本地接口](https://zh.wikipedia.org/wiki/Java%E6%9C%AC%E5%9C%B0%E6%8E%A5%E5%8F%A3)

[java native 关键字](https://blog.csdn.net/youjianbo_han_87/article/details/2586375)

[详解native方法的使用](https://www.cnblogs.com/HDK2016/p/7226840.html)

* any list
{:toc}