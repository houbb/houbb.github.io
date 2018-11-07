---
layout: post
title: package-info.java
date:  2018-11-7 18:51:40 +0800
categories: [Java]
tags: [maven, java, sf]
published: true
excerpt: Java doc 之 package-info.java
---

# package-info.java

## 介绍

pacakge-info.java是一个Java文件，可以添加到任何的Java源码包中。

pacakge-info.java的目标是提供一个包级的文档说明或者是包级的注释。

pacakge-info.java文件中，唯一要求包含的内容是包的声明语句，比如：

```java
package com.ch.service;
```

## 常见作用

它有三个作用：

1. 为标注在包上Annotation提供便利；

2. 声明友好类和包常量；

3. 提供包的整体注释说明。

# 包文档

在Java 5之前，包级的文档是package.html，是通过JavaDoc生成的。

而在Java 5以上版本，包的描述以及相关的文档都可以写入pacakge-info.java文件，它也用于JavaDoc的生成。比如：

```java
/**
 * 基于Apache DbUtils库封装的工具库，简化开发
 * @author houbinbin

 * date: 2018.11.07
 * @since 1.7
 * @version 1.0
 */
package com.github.houbb;
```

则相应的 java doc 会有此类的对应注释。

# 注解

## 自定义包注解

- 定义包注解

```java
/** 
* 定义只能标注在package上的注解 
*/  
@Target(ElementType.PACKAGE)  
@Retention(RetentionPolicy.RUNTIME)  
public @interface PkgAnnotation {  
}
```

- 定义 package-info.java

再定义一个package-info类，这个是一个特殊的类，先看代码：

```java
@PkgAnnotation  
package com.github.houbb; 
```

- 解析

```java
public static void main(String[] args) {  
    //可以通过I/O操作或配置项获得包名  
    String pkgName = "com.github.houbb";       
    Package pkg = Package.getPackage(pkgName);  
    //获得包上的注解  
    Annotation[] annotations = pkg.getAnnotations();  
    //遍历注解数组  
    for(Annotation an:annotations){  
        if(an instanceof PkgAnnotation){  
            System.out.println("Hi, I'm the PkgAnnotation");  
            /* 
             * 注解操作 
             * MyAnnotation myAnn = (PkgAnnotation)an; 
             * 还可以操作该注解包下的所有类，比如初始化，检查等等 
             * 类似Struts的@Namespace，可以放到包名上，标明一个包的namespace路径 
             */           
        }  
    }  
}  
```

## 想让包下文件过时

比如，想让包中的所有类型过时（Deprecate），你可以注释每一个单独的类型（类、接口、枚举等），如下所示：

点击(此处)折叠或打开

```java
@Deprecated
public class Constant {
}
```

或者是可以在 package-info.java 包声明文件中使用 `@Deprecated` 注释，它可以让包中的一切均过时。

```java
@Deprecated
package com.github.houbb;
```

# 声明友好类和包常量

这个比较简单，而且很实用，比如一个包中有很多的内部访问的类或常量，就可以统一的放到package-info类中，这样就方便，而且集中管理，减少friendly类到处游走的情况，看例子：

```java
@PkgAnnotation  
package com.company;  
 //这里是包类，声明一个包使用的公共类，强调的是包访问权限  
class PkgClass{  
    public void test(){  
    }  
}  
//包常量，只运行包内访问，适用于分“包”开发  
class PkgConst{  
    static final String PACAKGE_CONST="ABC";  
}
```


# 一些想法

gen-package-info  自动生成所有的 package-info.java 文件信息。


# 参考资料

[PACKAGE-INFO.JAVA 作用及用法详解](https://www.cnblogs.com/pepcod/archive/2013/02/20/2918856.html)

[package-info.java文件详解](http://blog.chinaunix.net/uid-301743-id-5029316.html)


* any list
{:toc}