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

常见方法

java.util.EnumSet和java.util.EnumMap是两个枚举集合。EnumSet保证集合中的元素不重复;EnumMap中的 key是enum类型，而value则可以是任意类型。关于这个两个集合的使用就不在这里赘述，可以参考JDK文档

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

### switch 

可以和 switch 结合使用：

```java
RespEnum respEnum = RespEnum.SUCCESS;
switch (respEnum) {
    case SUCCESS:
        System.out.println("成功");
    case FAIL:
        System.out.println("失败");
}
```

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

## 枚举值的映射

枚举值可以用来做一些枚举值的映射，比如传入 code，返回对应的描述等等。

当然，也可以放在数据库中存储这种映射关系，不过一般比较简单的可以直接使用枚举类。

比如：

```java
/**
 * 根据 code 获取描述
 * @param code code
 * @return 描述
 */
public static String getDescByCode(final String code) {
    for(RespEnum respEnum : RespEnum.values()) {
        if(respEnum.code.equals(code)) {
            return respEnum.desc;
        }
    }
    return null;
}
```

大家看这一个方法平平无奇，可是有没有想过 `RespEnum.values()` 是哪里来的？

我们根本没有定义这个方法。

# Enum 类

## enum 类的本质

尽管 enum 看起来像是一种新的数据类型，事实上，enum是一种受限制的类，并且具有自己的方法。

创建enum时，编译器会为你生成一个相关的类，这个类继承自 `java.lang.Enum`。

## Enum 类介绍

### 类声明

```java
/**
 * This is the common base class of all Java language enumeration types.
 *
 * More information about enums, including descriptions of the
 * implicitly declared methods synthesized by the compiler, can be
 * found in section 8.9 of
 * <cite>The Java&trade; Language Specification</cite>.
 *
 * <p> Note that when using an enumeration type as the type of a set
 * or as the type of the keys in a map, specialized and efficient
 * {@linkplain java.util.EnumSet set} and {@linkplain
 * java.util.EnumMap map} implementations are available.
 *
 * @param <E> The enum type subclass
 * @author  Josh Bloch
 * @author  Neal Gafter
 * @see     Class#getEnumConstants()
 * @see     java.util.EnumSet
 * @see     java.util.EnumMap
 * @since   1.5
 */
public abstract class Enum<E extends Enum<E>>
        implements Comparable<E>, Serializable {
    //...
}
```

EnumSet/EnumMap 这两个集合类我们后面讲解。

## 基本方法

在enum中，提供了一些基本方法：

| 方法 | 说明 |
|:---|:---|
| values | 返回enum实例的数组，而且该数组中的元素严格保持在enum中声明时的顺序。 |
| name | 返回实例名。 |
| ordinal | 返回实例声明时的次序，从0开始 |
| getDeclaringClass() | 返回实例所属的enum类型 |
| equals | 判断是否为同一个对象 |
| valueOf | 根据字符串转换出枚举对象 |

可以使用 `==` 来比较enum实例，这里可以引申一下枚举与单例。

枚举实现单例是一种非常经典与安全的实现方式。

### valueOf 例子

```java
RespEnum respEnum = RespEnum.valueOf("SUCCESS");
System.out.println(respEnum == RespEnum.SUCCESS);   //返回结果为 true
```

### compareTo()

此外，java.lang.Enum实现了Comparable和 Serializable 接口，所以也提供 compareTo() 方法。

这个方法可以看一下 Enum 的实现：

```java
/**
 * Compares this enum with the specified object for order.  Returns a
 * negative integer, zero, or a positive integer as this object is less
 * than, equal to, or greater than the specified object.
 *
 * Enum constants are only comparable to other enum constants of the
 * same enum type.  The natural order implemented by this
 * method is the order in which the constants are declared.
 */
public final int compareTo(E o) {
    Enum other = (Enum)o;
    Enum self = this;
    if (self.getClass() != other.getClass() && // optimization
        self.getDeclaringClass() != other.getDeclaringClass())
        throw new ClassCastException();
    return self.ordinal - other.ordinal;
}
```

可知就是通过枚举的 ordinal 进行比较的。

### 静态方法

values() 返回enum实例的数组，而且该数组中的元素严格保持在enum中声明时的顺序。

## 限制

枚举可以认为除了无法继承，其他都是一个普通的类。

因为 enum 声明的类已经默认继承了 `Enum` 类，java 不允许多继承。

枚举类可以有自己的成员变量、成员方法、构造器 (只能使用 private 访问修饰符，所以无法从外部调用构造器，构造器只在构造枚举值时被调用)；可以继承接口等等。

# EnumSet 介绍

Java中提供了两个方便操作enum的工具类——EnumSet和EnumMap。

## 说明 

EnumSet 是枚举类型的高性能Set实现。它要求放入它的枚举常量必须属于同一枚举类型。

## 例子

```java
public static void enumSetShow() {
    EnumSet<RespEnum> respEnums = EnumSet.allOf(RespEnum.class);
    for (RespEnum e : respEnums) {
        System.out.println(e.name() + " : " + e.ordinal());
    }
}
```

可以非常简单的遍历枚举集合。

## 源码

### 类声明

```java
public abstract class EnumSet<E extends Enum<E>> extends AbstractSet<E>
    implements Cloneable, java.io.Serializable{}
```

### 方法

这个类提供了很多静态方法，我们选取一个讲解。

```java
/**
 * Creates an enum set containing all of the elements in the specified
 * element type.
 *
 * @param elementType the class object of the element type for this enum
 *     set
 * @throws NullPointerException if <tt>elementType</tt> is null
 */
public static <E extends Enum<E>> EnumSet<E> allOf(Class<E> elementType) {
    EnumSet<E> result = noneOf(elementType);
    result.addAll();
    return result;
}
```

这个使我们刚才使用的 allOf 方法，其中 noneOf 如下：

```java
/**
 * Creates an empty enum set with the specified element type.
 *
 * @param elementType the class object of the element type for this enum
 *     set
 * @throws NullPointerException if <tt>elementType</tt> is null
 */
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
    Enum[] universe = getUniverse(elementType);
    if (universe == null)
        throw new ClassCastException(elementType + " not an enum");
    if (universe.length <= 64)
        return new RegularEnumSet<>(elementType, universe);
    else
        return new JumboEnumSet<>(elementType, universe);
}
```

实际上，我们返回的枚举实例另有其人。

那就是: RegularEnumSet 和 JumboEnumSet。

- getUniverse()

这个方法注释写的比较清楚，返回枚举信息。

结果没有 clone，没有缓存，被所有调用者共享。

实际上这也是我们为什么可以使用 `==` 比较的原因。

```java
/**
 * Returns all of the values comprising E.
 * The result is uncloned, cached, and shared by all callers.
 */
private static <E extends Enum<E>> E[] getUniverse(Class<E> elementType) {
    return SharedSecrets.getJavaLangAccess()
                                    .getEnumConstantsShared(elementType);
}
```

# EnumMap 介绍

## 说明 

EnumMap 是专门为枚举类型量身定做的Map实现。

虽然使用其它的Map实现（如HashMap）也能完成枚举类型实例到值得映射，但是使用EnumMap会更加高效：

它只能接收同一枚举类型的实例作为键值，**并且由于枚举类型实例的数量相对固定并且有限**，所以EnumMap使用数组来存放与枚举类型对应的值。这使得EnumMap的效率非常高。

问：为什么数量固定会高效？

实际上就是以前提过的，数量固定，可以避免 rehash 等操作。数量有限，性能自然会好。

## 例子

```java
EnumMap<RespEnum, String> enumMap = new EnumMap(RespEnum.class);
enumMap.put(RespEnum.SUCCESS, "成功");
enumMap.put(RespEnum.FAIL, "失败");
for(Map.Entry<RespEnum, String> entry : enumMap.entrySet()) {
    System.out.println("KEY: " + entry.getKey() +", VALUE: " + entry.getValue());
}
```

## 源码

### 类

```java
public class EnumMap<K extends Enum<K>, V> extends AbstractMap<K, V>
    implements java.io.Serializable, Cloneable{}
```

### 方法

这里我们主要看下构造器方法：

```java
/**
 * Creates an empty enum map with the specified key type.
 *
 * @param keyType the class object of the key type for this enum map
 * @throws NullPointerException if <tt>keyType</tt> is null
 */
public EnumMap(Class<K> keyType) {
    this.keyType = keyType;
    keyUniverse = getKeyUniverse(keyType);
    vals = new Object[keyUniverse.length];
}
```

如何获取 Key 信息：

```java
/**
 * Returns all of the values comprising K.
 * The result is uncloned, cached, and shared by all callers.
 */
private static <K extends Enum<K>> K[] getKeyUniverse(Class<K> keyType) {
    return SharedSecrets.getJavaLangAccess()
                                    .getEnumConstantsShared(keyType);
}
```

看到这里大家应该就懂了，最后的实现原理和 EnumSet 还是原理上一样的。


# 小结

# 参考资料

[Java枚举类学习到进阶](https://juejin.im/post/6844903737295634446)

[Java 枚举(enum) 详解7种常见的用法](https://zhuanlan.zhihu.com/p/88609380)

[Java 枚举用法详解](https://cloud.tencent.com/developer/article/1014593)

* any list
{:toc}