---
layout: post
title: Guava Functional
date:  2019-3-22 13:38:09 +0800
categories: [Java]
tags: [java, google, sh]
published: true
---

# Guava Functional

java 在 jdk8 引入了函数式编程，但是很多项目依然是 jdk7.

借助 guava 可以帮助我们完成函数式编程。

## 注意事项

Java 8包含java.util.function和java.util.stream包，它们取代了Guava用于该语言级别项目的函数式编程类。

虽然Guava的功能实用程序可用于Java 8之前的Java版本，但没有Java 8的函数式编程需要使用匿名类的笨拙和冗长。

过度使用Guava的函数式编程习语会导致冗长，混乱，难以理解和低效的代码。 

这些是迄今为止最容易（也是最常见）被滥用的番石榴部分，当你为了使你的代码“单线”而荒谬的长度时，番石榴团队就会哭泣。

# 比较以下代码

```java
Function<String, Integer> lengthFunction = new Function<String, Integer>() {
  public Integer apply(String string) {
    return string.length();
  }
};
Predicate<String> allCaps = new Predicate<String>() {
  public boolean apply(String string) {
    return CharMatcher.javaUpperCase().matchesAllOf(string);
  }
};
Multiset<Integer> lengths = HashMultiset.create(
  Iterables.transform(Iterables.filter(strings, allCaps), lengthFunction));
```

or the FluentIterable version

```java
Multiset<Integer> lengths = HashMultiset.create(
  FluentIterable.from(strings)
    .filter(new Predicate<String>() {
       public boolean apply(String string) {
         return CharMatcher.javaUpperCase().matchesAllOf(string);
       }
     })
    .transform(new Function<String, Integer>() {
       public Integer apply(String string) {
         return string.length();
       }
     }));
```

with:

```java
Multiset<Integer> lengths = HashMultiset.create();
for (String string : strings) {
  if (CharMatcher.javaUpperCase().matchesAllOf(string)) {
    lengths.add(string.length());
  }
}
```

即使使用静态导入，即使将Function和Predicate声明移动到不同的文件，第一个实现也不那么简洁，可读性较差，效率较低。

命令式代码应该是您的默认设置，是Java 7的首选。

除非您完全确定以下其中一项，否则不应使用功能惯用语：

使用功能惯用法将为整个项目节省大量代码。在上面的示例中，“功能”版本使用了11行，命令式版本6.将函数的定义移动到另一个文件或常量，没有用。
为了提高效率，您需要对转换后的集合进行延迟计算的视图，并且无法满足显式计算的集合。此外，您已阅读并重读了Effective Java，第55项，除了遵循这些说明之外，您还实际进行了基准测试，以证明此版本更快，并且可以引用数字来证明它。

在使用Guava的功能实用程序时，请确保传统的命令式处理方式不易读取。试着把它写出来。

真是太糟糕了吗？

那比你想要尝试的荒谬笨拙的功能方法更具可读性吗？

# 功能和谓词

本文仅讨论那些直接处理Function和Predicate的Guava特性。 

一些其他实用程序与“功能样式”相关联，例如连接和其他在恒定时间内返回视图的方法。 尝试查看集合实用程序文章。

Guava提供两个基本的“功能”接口：

- 函数

Function<A，B>，其中单个方法B适用（A输入）。 

通常期望函数实例是引用透明的 - 没有副作用 - 并且与equals一致，即a.equals（b）意味着function.apply（a）.equals（function.apply（b））。

- 谓词

Predicate <T>，它有单个方法boolean apply（T输入）。 

谓词的实例通常预期是无副作用的并且与equals一致。

## 特殊谓词

角色获得他们自己的Predicate，CharMatcher专用版本，它通常更有效，更有用于这些需求。 

CharMatcher已经实现了Predicate <Character>，并且可以相应地使用，而从Predicate到CharMatcher的转换可以使用CharMatcher.forPredicate完成。 

此外，对于可比较类型和基于比较的谓词，可以使用Range类型来实现大多数需求，该类型实现不可变间隔。 

Range类型实现Predicate，测试范围内的包含。 例如，Range.atMost（2）是一个完全有效的Predicate <Integer>。 

# Predicate 使用入门

## 代码

- 对象定义

```java
public class Apple {

    private String color;

    private int weight;

    public Apple(String color, int weight) {
        this.color = color;
        this.weight = weight;
    }

    //getter & setter & toString();
}
```

- 使用案例

```java
import com.google.common.base.Predicate;
import com.ryo.jdk.jdk7.model.Apple;
import org.checkerframework.checker.nullness.qual.Nullable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GuavaPredicate {

    private static List<Apple> filterByCondition(List<Apple> apples, Predicate<Apple> p) {
        List<Apple> result = new ArrayList<>();

        if(null != apples && !apples.isEmpty()) {
            for(Apple apple:apples) {
                if (p.test(apple)) {
                    result.add(apple);
                }
            }
        }
        return result;
    }

    
}
```

- 测试类

```java
public static void main(String[] args) {
    List<Apple> appleList = Arrays.asList(new Apple("red", 100),
            new Apple("yellow", 98));
    List<Apple> result = filterByCondition(appleList, new Predicate<Apple>() {
        @Override
        public boolean apply(@Nullable Apple apple) {
            return "yellow".equals(apple.getColor());
        }
    });
    System.out.println(result);
}
```

- 测试结果

```
[Apple{color='yellow', weight=98}]
```

# Functional 的使用

## 场景

我们希望根据配置去限定交易，不同的限制类型处理方式也不同。

## 实现

- 交易+配置信息对象

```java
public class BizObject {

    /**
     * 业务大小
     */
    private int bizSize;

    /**
     * 限制大小
     */
    private int limitSize;

    /**
     * 操作符
     */
    private String operate;

    public BizObject(int bizSize, int limitSize, String operate) {
        this.bizSize = bizSize;
        this.limitSize = limitSize;
        this.operate = operate;
    }

    // getter & setter & toString()
}
```

- 操作符枚举定义

这样可以让一种操作符，直接映射有对象的实现函数。

后期添加，则调整枚举即可，不需要调整核心逻辑。

```java
import com.google.common.base.Function;
import org.checkerframework.checker.nullness.qual.Nullable;

public enum  OperateEnum {
    GREAT_THAN("GT", new Function<BizObject, Boolean>() {
        @Nullable
        @Override
        public Boolean apply(@Nullable BizObject bizObject) {
            return bizObject.getBizSize() > bizObject.getLimitSize();
        }
    }),
    LESS_THAN("LT", new Function<BizObject, Boolean>() {
        @Nullable
        @Override
        public Boolean apply(@Nullable BizObject bizObject) {
            return bizObject.getBizSize() < bizObject.getLimitSize();
        }
    }),
    ;

    private final String code;

    private final Function<BizObject, Boolean> function;

    OperateEnum(String code, Function<BizObject, Boolean> function) {
        this.code = code;
        this.function = function;
    }

    public String getCode() {
        return code;
    }

    public Function<BizObject, Boolean> getFunction() {
        return function;
    }

    public static OperateEnum getOperateEnum(final String code) {
        for(OperateEnum operateEnum : OperateEnum.values()) {
            if(operateEnum.code.equals(code)) {
                return operateEnum;
            }
        }
        return null;
    }
}
```

## 测试

- 测试代码

```java
import com.ryo.jdk.jdk7.model.BizObject;
import com.ryo.jdk.jdk7.model.OperateEnum;

public class GuavaFunctional {

    public static void main(String[] args) {
        BizObject lt = new BizObject(10, 20, "LT");
        BizObject gt = new BizObject(10, 20, "GT");

        System.out.println(OperateEnum.getOperateEnum(lt.getOperate()).getFunction().apply(lt));
        System.out.println(OperateEnum.getOperateEnum(gt.getOperate()).getFunction().apply(gt));
    }

}
```

- 结果

```
true
false
```

# 拓展阅读

[java8 行为参数化](https://houbb.github.io/2019/02/27/java8-10-behavior-param)

# 参考资料

[guava-FunctionalExplained](https://github.com/google/guava/wiki/FunctionalExplained)

* any list
{:toc}