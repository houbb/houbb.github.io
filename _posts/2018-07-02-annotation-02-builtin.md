---
layout: post
title:  Annotation-02-built in
date:  2018-07-02 17:36:14 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# Java 内置注解

## 注解

Annotation(注解)是JDK5.0及以后版本引入的。它的作用是修饰程序元素。

注解相当于一种标记，在程序中加了注解就等于为程序打上了某种标记。
程序可以利用java的反射机制来了解你的类及各种元素上有无何种标记，针对不同的标记，就去做相应的事件。

后续会对这些进行讲解，本文主要讲解 Java 内置注解。

# `@Override`

指示一个方法声明要覆盖一个超类型中的方法声明。

## 实例

- ISay.java

```java
public interface ISay {
    void say();
}
```

- SayImpl.java

```java
public class SayImpl implements ISay {
    @Override
    public void say() {
        System.out.println("say...");
    }
}
```

## 说明

1. 在实际编程中坚持使用 `@Override` 是一种良好的编程习惯

2. 如果安装了 alibaba 的编程规范插件，继承时不适用此注解，是报错的。

# `@Deprecated`

注释掉的程序元素是程序员使用的不鼓励使用，通常是因为危险，或者因为存在更好的选择。
时编译器警告已弃用的程序元素在未弃用的代码中使用或重写。

## 实例

- Deprecated.java

表示当前类已经被废弃。

```java
@java.lang.Deprecated
public class Deprecated {
}
```

## 说明

1. 一个良好的开源软件，应该尽量保持不删除已经发布的接口。使用这种废弃的方式。使用者，也应该尽量避免使用废弃的方法。

2. 缺点：会导致代码的冗余。一般开发中建议直接及时清零废弃的方式。

3. Java 的该注解设计存在一定的缺陷。比如 C# 中 `[Obsolete]` 注解

可以指定废弃的原因，替代的新方法等。

# `@SuppressWarnings`

指示应在带注释的元素(以及包含在注释中的所有程序元素)。
注意，在给定元素中**被抑制的警告集是在所有包含元素中被抑制的警告的超集**。
例如，如果您注释一个类以抑制一个警告并注释一个方法来抑制另一个，两个警告将在方法中被抑制。

作为一种风格，程序员应该始终使用这个注释在**最深度嵌套的元素上，它是有效的**。
如果你想在特定的方法中抑制一个警告，您应该对此进行注释方法而不是类。

ps: 即保证抑制影响的范围最小。

## 实例

- SuppressWarnings.java

```java
public class SuppressWarnings {

    /**
     * 变量单个类型的警告
     */
    @java.lang.SuppressWarnings("unused")
    public void unused() {
        String s = "";
    }

    /**
     * 抑制多个类型的警告
     * @param item 元素
     */
    @java.lang.SuppressWarnings({"unchecked", "rawtypes"})
    public void addItems(String item){
        List items = new ArrayList();
        items.add(item);
    }

    /**
     * 抑制所有类型的警告
     * @param item
     */
    @java.lang.SuppressWarnings("all")
    public void all(String item) {
        List items = new ArrayList();
        items.add(item);
    }
}
```

## 说明

`@SuppressWarnings` 可以使用属性列表如下：

| 属性 | 备注 |
|:---|:---|
| all | 禁止所有警告 |
| boxing | 禁止与装箱/拆箱操作相关的警告 |
| cast | 强制转换以抑制与强制转换操作相关的警告 |
| dep-ann | 用于抑制相对于已弃用注释的警告 |
| deprecation | 弃用以抑制相对于弃用的警告 |
| fallthrough | 在switch语句中，通过fallthrough来抑制与丢失中断相关的警告 |
| finally | 最后抑制与最终块相关的不返回的警告 |
| hiding | 隐藏以抑制相对于隐藏变量的本地警告 |
| incomplete-switch | 在switch语句(enum案例)中，incomplete-switch用来抑制相对于丢失条目的警告 |
| javadoc | 禁止与javadoc警告相关的警告 |
| nls | 使用nls来抑制相对于非nls字符串的警告。 |
| null | 空值来抑制相对于空值分析的警告 |
| rawtypes | 拒绝与使用原始类型相关的警告 |
| resource | 用于抑制与使用类型为Closeable的资源相关的警告的资源 |
| restriction | 限制禁止与使用不鼓励或禁止引用相关的警告 |
| serial | 串行用于抑制相对于可串行化类缺少serialVersionUID字段的警告 |
| static-access | 静态访问，抑制相对于不正确的静态访问的警告 |
| static-method | 静态方法，用于抑制相对于可以声明为静态的方法的警告 |
| super | 超级-来抑制相对于在没有超级调用的情况下重写方法的警告 |
| synthetic-access | 用于抑制相对于内部类的未优化访问的警告的合成访问 |
| sync-override | 在覆盖同步方法时，由于缺少同步而取消警告 |
| unchecked | 未选中以抑制与未选中操作相关的警告 |
| unqualified-field-access | 不限定字段访问来抑制与字段访问不限定相关的警告 |
| unused | 不常用来抑制与未使用代码和死代码相关的警告 |

# `@SafeVarargs`

该注释应用于方法或构造函数时，断言代码不会对其varargs参数执行潜在的不安全操作。
当使用此注释类型时，将抑制与varargs使用相关的未检查的警告。

## 实例

```java
public class VarargsWaring {

    @SafeVarargs
    public static<T> T useVarargs(T... args){
        return args.length > 0?args[0]:null;
    }

    public static void main(String[] args) {
        //[array]
        System.out.println(VarargsWaring.useVarargs(Arrays.asList("array")));
    }

}
```

## 说明

可变长度的方法参数的实际值是通过数组来传递的，数组中存储的是不可具体化的泛型类对象，自身存在类型安全问题。
因此编译器会给出相应的警告消息。

# `@FunctionalInterface`

在Java SE 8中引入的 `@FunctionalInterface` 注释表明，类型声明是按照Java语言规范定义的功能接口。

从概念上讲，函数接口只有一个抽象方法。
因为默认方法有一个实现，所以它们不是抽象的。
如果接口声明一个抽象方法，覆盖java.lang的一个公共方法。对象，它也不计入接口的抽象方法计数，因为接口的任何实现都有来自java.lang的实现对象或其他地方。

注意，函数接口的实例可以使用lambda表达式、方法引用或构造函数引用创建。

如果一个类型被注释为这种注释类型，编译器需要生成一条错误消息，除非:

- 类型是接口类型，而不是注释类型、枚举或类。

- 注释类型满足函数接口的要求。

但是，无论接口声明中是否存在 `@FunctionalInterface` 注释，编译器都将满足函数接口定义的任何接口视为函数接口。

## 实例

- FunctionalInterfaceDemo.java

```java
@FunctionalInterface
public interface FunctionalInterfaceDemo {

    /**
     * 抽象方法
     */
    void method();

    /**
     * java.lang.Object中的方法不是抽象方法
     * @param var1 入参
     * @return {@code true} 是否
     */
    @Override boolean equals(Object var1);

    /**
     * default不是抽象方法
     */
    default void defaultMethod(){
    }

    /**
     * static不是抽象方法
     */
    static void staticMethod(){
    }
}
```

# 代码地址

> [annotation built-in](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/builtin)

# 文档引用

- [suppress_warnings](http://help.eclipse.org/neon/index.jsp?topic=%2Forg.eclipse.jdt.doc.user%2Ftasks%2Ftask-suppress_warnings.htm)

- JDK8

* any list
{:toc}