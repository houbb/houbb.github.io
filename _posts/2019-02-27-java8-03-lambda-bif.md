---
layout: post
title: java8-03-lambda 内置函数
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# Predicate

Predicate 定义了一个 `test()` 方法，接受泛型 T 的对象，并且返回一个 boolean 值。 

- 定义

```java
/**
     * 过滤器: 返回满足条件的列表
     * @param list
     * @param predicate
     * @param <T>
     * @return
     */
    private static <T> List<T> filter(List<T> list, Predicate<T> predicate) {
        List<T> result = new LinkedList<>();
        for(T t : list) {
            if(predicate.test(t)) {
                result.add(t);
            }
        }
        return result;
    }
```

- 测试

```java
public static void main(String[] args) {
    List<String> stringList = Arrays.asList("A", "", "C", "Dog", "Delete");

    List<String> result = filter(stringList, (String s)->s.startsWith("D"));
    System.out.println(result);
}
```

- 结果

```
[Dog, Delete]
```

# Consumer

Consumer 定义了一个名为 `accept()` 的方法。接受泛型 T 的对象，没有返回值(void)。

- 定义

```java
/**
 * 循环执行
 * @param list 列表
 * @param consumer
 * @param <T>
 */
private static <T> void foreach(List<T> list, Consumer<T> consumer) {
    for(T t : list) {
        consumer.accept(t);
    }
}
```

- 测试

```java
public static void main(String[] args) {
    List<String> stringList = Arrays.asList("A", "", "C", "Dog", "Delete");

    foreach(stringList, (String s)-> System.out.println(s));
}
```

- 结果

```
A

C
Dog
Delete
```


# Function

Function 定义了一个 `apply()` 方法，接受一个泛型 T 的参数，返回一个类型 R 的对象。

```java
/**
 * 将一种元素按照规则映射成为另外一种元素
 * @param list
 * @param function
 * @param <T>
 * @param <R>
 * @return
 */
private static <T, R> List<R> map(List<T> list, Function<T, R> function) {
    List<R> result = new LinkedList<>();

    for(T t : list) {
        result.add(function.apply(t));
    }
    return result;
}
```

- 测试

```java
public static void main(String[] args) {
    List<String> stringList = Arrays.asList("A", "", "C", "Dog", "Delete");

    List<String> result = map(stringList, (String s)->s.toLowerCase());
    System.out.println(result);
}
```

- 结果

```
[a, , c, dog, delete]
```

* any list
{:toc}