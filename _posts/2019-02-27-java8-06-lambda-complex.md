---
layout: post
title: java8-06-lambda 复合使用
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# 复合Lambda 表达式的有用方法

Java8的好几个函数式接口都有为方便而设计的方法。具体而言，许多函数式接口，比如用于传递Lambda表达式的Comparator、Function和Predicate都提供了允许你进行复合的方法。

这是什么意思呢？

在实践中，这意味着你可以把多个简单的Lambda复合成为复杂的表达式。比如，你可以让两个谓词之间做一个or操作，组合成为了一个更大的谓词。而且，你还可以让一个函数的结果成为另一个函数的输入。

你可能会在想，函数式接口中怎么可能会有更多的方法呢？（毕竟，这违背了函数式接口的定义啊!）。关键在于，我们即将介绍的方法都是默认方法，也就是说它们不是抽象方法。

# 比较器复合

我们前面看到了，你可以使用Comparator.comparing，根据提取用于比较的键值的Function来返回一个Comparator对象，如下所示：

```java
inventory.sort(Comparator.comparing(Apple::getWeight));
```

## A.逆序

如果你想要对苹果按质量递减排序怎么办？

用不着去建立另一个Comparator的实例。接口有一个默认方法reversed可以使给定的比较器排序。

因此仍然用开始的那个比较器，只要修改一下前一个例子就可以对苹果按重量递减排序：

```java
inventory.sort(Comparator.comparing(Apple::getWeight).reversed());
```

## B.比较器链

上面说的都好，但是如果发现有两个苹果一样重的怎么办？

哪个苹果应该排在前面呢？

你可能需要在提供一个Comparator进来进一步定义这一个比较。

比如，在按重量比较两个苹果之后，你可能想要按颜色排序。thenComparing方法就是用来做来这个的。它接收一个函数作为参数(就像comparing方法一样)。如果两个对象用第一个Comparator比较之后是一样的，就提供第二个Comparator。

你又可以优雅的解决这个问题：

```java
inventory.sort(Comparator.comparing(Apple::getWeight)
               .reversed() //按照重量递减排序
              .thenComparing(Apple::getColor)); //两个苹果一样重时，进一步按颜色排序
```

# 谓词复合

谓词接口包括三个方法：negate、and和or，让你可以重用已有的Predicate来创建更加复杂的谓词。

## negate

比如你已使用negate方法来返回一个Predicate的非，比如苹果不是红的：

```java
Predicate<Apple> redApple = a->a.getWeight().equals("red");
Predicate<Apple> notRedApple = redApple.negate();
```

## and

你可能想要把两个Lambda用and方法组合起来，比如一个苹果既是红色又比较重：

```java
Predicate<Apple> redAndHeavyApple = redApple.and(a -> a.getWeight() > 150);
```

## or

你可以进一步组合谓词，表达要么是重(150g以上)的红苹果，要么是绿苹果：

```java
Predicate<Apple> redAndHeavyApple = 
            redApple.and(a -> a.getWeight() > 150) 
           .or(a -> "green".equals(a.getColor()));//链接Predicate的方法来构造更加复杂Predicate对象
```

这一点为什么很好呢？

从简单Lambda表达式出发，你可以构建更加复杂的表达式，但是读起来仍然和问题的陈述差不多！

请注意，and和or是按照在表达式链中的位置，从左往右确定优先级的。

因此，a.or(b).and(c)可以看做(a || b) && c。



# 函数复合

最后，你可以把Function接口代表的Lambda表达式复合起来。

Function接口为此配了andThen和compose两个默认方法，它们都会返回Function的一个实例。

## andThen

andThen方法会返回一个函数，它对输入应用到一个给定函数，再对输出应用到另一个函数。

比如，假设有一个函数f数字加1(x -> x + 1)，另一个函数给g给数字乘以2，你可以将它们组合成一个函数h，先给数字加1，再给结果乘以2。

```java
Function<Integer, Integer> f = x -> x + 1;
Function<Integer, Integer> g = x -> x * 2;
Function<Integer, Integer> h = f.andThen(g); //数学上写作g(f(x))
int result = h.apply(1); //返回的是4
```

## compose

你可以类似的使用compose方法，先把给定的函数用作compose的参数里面给的那个函数，然后再把函数本身用于结果。

比如上一个例子用compose的话，它将意味着f(g(x))，而andThen则意味着g(f(x))：

```java
Function<Integer, Integer> f = x -> x + 1;
Function<Integer, Integer> g = x -> x * 2;
Function<Integer, Integer> h = f.compose(g); //数学上写作f(g(x))
int result = h.apply(1); //返回的是3
```

## 实际使用

这一切听起来有点太抽象了。那么在实际中这有什么用呢？

比方说，你有一系列工具方法，对用String表示的一封信做文本转换：

```java
public class Letter {
    public static String addHeader(String text){
        return "From pby" + text;
    }
    public static String addFooter(String text){
        return text + "Kind regards";
    }
    public static String checkSpelling(String text){
        return text.replaceAll("labda", "lambda");
    }
}
```

现在你可以通过复合这些工具方法来创建各种转型流水线了，比如创建一个流水线：先加上头部，然后进行拼写检查，最后加上一个落款。

```java
Function<String ,String> addHeader = Letter::addHeader;
Function<String, String> transformationPipeline = addHeader.andThen(Letter::checkSpelling)
                 .andThen(Letter::addFooter);
```

第二个流水线可能只加头部和落款，而不做拼写检查：

```java
Function<String ,String> addHeader = Letter::addHeader;
Function<String ,String> transformationPipeline = addHeader.andThen(Letter::addFooter);
```



# 参考资料

《Java 8 实战》

* any list
{:toc}