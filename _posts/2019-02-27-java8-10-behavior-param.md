---
layout: post
title: Java8-10-行为参数化
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 行为参数化

在软件开发中，一个众所周知的问题就是无论你做什么,用户的需求总会改变。

举个栗子，假设要做一个帮助农场主理解库存的应用。

一开始，农场主可能想有一个在所有库存中找出所有绿色苹果的功能。

但是第二天他可能会告诉你他还想要找到所有重量大于150g的苹果。

两天后，他可能又提出找到所有绿色的并且重量大于150g的苹果。

在面对这些相似的新功能时，我们都想尽可能的减少开发量。

behavior parameterization是用来处理频繁更改的需求的一种软件开发模式，可以将一段代码块当做参数传给另一个方法，之后执行。

这样做的好处是，方法的行为可以由传入的代码块控制。

# 版本1：要求筛选出颜色为绿色的苹果

- Apple.java

```java
public class Apple {
    private String color;
    private double weight;

    public Apple(String color, double weight) {
        this.color = color;
        this.weight = weight;
    }

    // 省略getter/settter...

    @Override
    public String toString() {
        return "Apple{" +
                "color='" + color + '\'' +
                ", weight=" + weight +
                '}';
    }
}
```

- 常见实现

```java
private static List<Apple> filterByColor(List<Apple> apples) {
    List<Apple> result = new ArrayList<>();

    if(null != apples && !apples.isEmpty()) {
        for(Apple apple : apples) {
            if ("green".equals(apple.getColor())) {
                result.add(apple);
            }
        }
    }
    return result;
}
```

# 版本2：查找指定颜色的苹果

将颜色当做参数即可。

```java
private static List<Apple> filterByColor(List<Apple> apples,String color) {
    List<Apple> result = new ArrayList<>();

    if(null != apples && !apples.isEmpty()) {
        for(Apple apple:apples) {
            if (color.equals(apple.getColor())) {
                result.add(apple);
            }
        }
    }
    return result;
}
```

# 版本3：查找重苹果

```java
private static List<Apple> filterByColor(List<Apple> apples) {
    List<Apple> result = new ArrayList<>();

    if(null != apples && !apples.isEmpty()) {
        for(Apple apple:apples) {
            if (apple.getWeight() > 150) {
                result.add(apple);
            }
        }
    }
    return result;
}
```

后面可能会有其他需求，比如查找重量超过300G的红苹果等等需求。 

此时，你会发现根据颜色查找和根据重量来查找仅仅1行代码不同，其余部分均相同。

也就是说好多代码都重复了。 

那么有没有一种方法来应对这种不断变动的需求，减少重复代码呢？

# 版本4：使用策略模式

那么，如果熟悉设计模式，可以想到使用策略模式。每次变动的不过是筛选苹果的策略不同。

我们将选择逻辑抽象出一个接口：

```java
public interface ApplePredicate<Apple> {
    boolean test(Apple t);
}
```

- 绿苹果的策略：

```java
public class GreenApplePredicate implements ApplePredicate<Apple> {
    @Override
    public boolean test(Apple t) {
        return "green".equals(t.getColor());
    }
}
```

- 重苹果的策略：

```java
public class WeightApplePredicate implements ApplePredicate<Apple> {
    @Override
    public boolean test(Apple t) {
        return t.getWeight() > 150;
    }
}
```

- 筛选苹果的方法：

```java
private static List<Apple> filterByCondition(List<Apple> apples,ApplePredicate<Apple> p) {
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
```

- 使用

```java
// 筛选绿色苹果
List<Apple> greenApples = filterByCondition(apples,new GreenApplePredicate();
// 筛选重的苹果
List<Apple> heavyApples = filterByCondition(apples,new WeightApplePredicate();
```

如果要筛选出其他条件的苹果，我们就新建一个ApplePredicate的实现类即可。

比如要筛选出红色且重量在150克以上的苹果。

```java
public class WeightAndRedApplePredicate implements ApplePredicate<Apple> {
    @Override
    public boolean test(Apple t) {
        return "red".equals(t.getColor()) && t.getWeight() > 150;
    }
}

// 使用：
List<Apple> redAndHeavyApples = filterByCondition(apples,new WeightAndRedApplePredicate());
```

参数行为化的好处是：你可以把要迭代筛选的逻辑和集合中每个元素的应用的行为分开。

这样你可以重复使用一个方法，给它不同的行为来达到不同的目的。

# 版本5：使用匿名类

虽然通过模板策略，我们将苹果筛选的逻辑和迭代的逻辑分开了，但是每次都需要新建一个筛选策略也是很麻烦的。

熟悉GUI事件处理的可能知道，我们可以使用匿名类来创建不同的策略对象。 

- 绿色的苹果

```java
List<Apple> greenApples = filterByCondition(apples, new ApplePredicate<Apple>() {
    @Override
    public boolean test(Apple t) {
        return "green".equals(t.getColor());
    }
});
```

- 重苹果

```java
List<Apple> greenApples = filterByCondition(apples, new ApplePredicate<Apple>() {
    @Override
    public boolean test(Apple t) {
        return t.getWeight() > 150;
    }
});
```

很快，你就发现，使用匿名类还是不够好。我们对比绿苹果和重苹果的代码，发现就一行代码不同。

那么有没有版本传递给filterByCondition方法的只有真正的逻辑代码？

## 版本6：lambda 表达式

java8提供行为参数化的支持，它允许你定义一个代码块来表示一个行为，然后作为参数去传递它。 

我们使用java8的lambda来实现上面的逻辑。 

- 绿苹果

```java
List<Apple> greenApples = filterByCondition(apples,(Apple apple) -> "green".equals(apple.getColor()));
```

- 重苹果

```java
List<Apple> heavyApples = filterByCondition(apples,(Apple apple) -> apple.getWeight() > 150);
```

还可以将lambda表达式的参数去掉。

```java
List<Apple> heavyApples = filterByCondition(apples,apple -> apple.getWeight() > 150);
```

# 参考资料

《java8 实战》

[JDK8行为参数化传递代码](https://blog.csdn.net/qincidong/article/details/82526508)

[Java 8 –行为参数化](http://www.importnew.com/21421.html)

* any list
{:toc}