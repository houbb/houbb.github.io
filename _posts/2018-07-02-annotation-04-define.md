---
layout: post
title:  Annotation-04-Define
date:  2018-07-02 21:10:19 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# 注解的定义

通过注解，有时候可以使我们的代码编写变得十分强大。

本文仅通过最简单的例子，展示如何定义使用以及解析注解。

# 实例

## 定义

- Tag.java

定义一个标签注解。可以在类、方法、字段上使用。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.LOCAL_VARIABLE})
public @interface Tag {

    /**
     * tag 标签
     *
     * @return tag
     */
    String value();

}
```

## 使用

```java
public class DefineMethod {

    @Tag("calc")
    public void calcMethod() {
    }

    @Tag("print")
    public void printMethod() {
    }

}
```

## 解析

```java
public class DefineMethod {

    //...

    /**
     * 解析我们定义的标签
     * 1. 可以根据属性的不同，进行我们希望的事情处理
     */
    public static void showTags() {
        Method[] methods = DefineMethod.class.getDeclaredMethods();
        for(Method method : methods) {
            Tag tag = method.getAnnotation(Tag.class);
            if(tag != null) {
                System.out.println(tag.value());
            }
        }
    }

    public static void main(String[] args) {
        DefineMethod.showTags();
    }

}
```

- 运行结果

```
print
calc
```

## 备注

我们可以根据注解，做更多其他的事情。

在实际开发中，可以和 spring 结合，发挥出更大的威力。

下一篇，将进一步学习 spring 与注解的结合。

# 代码地址

> [annotation 定义与解析](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/define)


* any list
{:toc}