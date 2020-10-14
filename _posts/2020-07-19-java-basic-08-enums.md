---
layout: post
title:  java 基础篇-08-enums 枚举详解
date:  2020-7-19 10:37:20 +0800
categories: [Java]
tags: [java, java-base, sf]
published: false
---

# 知识点

枚举的用法

枚举的实现

枚举与单例

Java枚举如何比较

switch对枚举的支持

枚举的序列化如何实现

枚举的线程安全性问题

Enum 的实现原理？

Enum 源码阅读

## 常见方法



# 常量的定义

## 常量值定义

如果我们需要定义响应的状态信息：成功、失败两种，有一种写法可能是下面的样子：

```java
/**
 * 响应常量
 * @author binbin.hou
 * @since 1.0.0
 */
public final class RespConst {

    private RespConst(){}

    /**
     * 成功
     */
    public static final String SUCCESS = "success";

    /**
     * 失败
     */
    public static final String FAIL = "fail";

}
```

## 枚举版本

如果我们只是区分两种状态，可以使用 `enum` 定义一个枚举类，如下：

```java
/**
 * 响应枚举
 * @author binbin.hou
 * @since 1.0.0
 */
public enum RespEnum {

    SUCCESS,
    FAIL;
    
}
```

这样编写起来就要方便很多。

## 添加属性

我们最常用的场景是给枚举加一些属性，比如 code 和 desc:

```java
package com.github.houbb.java.basic.learn.enums;

/**
 * 响应枚举
 * @author binbin.hou
 * @since 1.0.0
 */
public enum RespEnum {

    SUCCESS("success", "成功"),
    FAIL("fail", "失败");

    private final String code;
    private final String desc;

    RespEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public String getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }
}
```

使用起来比较方便，也便于后期统一管理：

```java
System.out.println(RespEnum.SUCCESS.getCode());
System.out.println(RespEnum.SUCCESS.getDesc());
```


# 小结

# 参考资料

[Java枚举类学习到进阶](https://juejin.im/post/6844903737295634446)

[Java 枚举(enum) 详解7种常见的用法](https://zhuanlan.zhihu.com/p/88609380)

* any list
{:toc}