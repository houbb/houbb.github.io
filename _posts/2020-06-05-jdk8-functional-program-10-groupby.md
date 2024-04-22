---
layout: post
title: java8 函数式编程-10-groupby 分组
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---


# chat

## jdk8 list 分组

在Java 8中，你可以使用Stream API来对`List`进行分组。这通常是通过`Collectors.groupingBy`方法来实现的。

下面是一个简单的例子，展示了如何根据对象的某个属性来对`List`中的元素进行分组。

假设我们有一个`Person`类，它有两个属性：`name`和`age`。

```java
import java.util.*;
import java.util.stream.Collectors;

class Person {
    private String name;
    private int age;

    // 构造方法、getter和setter省略
}

public class GroupByExample {
    public static void main(String[] args) {
        List<Person> people = Arrays.asList(
            new Person("John", 20),
            new Person("Jane", 20),
            new Person("Mark", 30),
            new Person("Mary", 30)
        );

        // 根据年龄分组
        Map<Integer, List<Person>> peopleByAge = people
            .stream()
            .collect(Collectors.groupingBy(Person::getAge));

        peopleByAge.forEach((age, p) -> System.out.println("Age: " + age + " = " + p));
    }
}
```

在这个例子中，我们创建了一个`Person`对象的列表，并希望根据年龄来分组。我们使用`groupingBy`方法，传入一个函数`Person::getAge`，它指定了分组的依据是`Person`对象的`age`属性。结果是一个`Map`，其键是年龄，值是具有该年龄的所有`Person`对象的列表。

请注意，分组操作要求分组的键（在这个例子中是年龄）必须能够被`HashMap`正确地用作键，这意味着它们需要正确地实现`equals`和`hashCode`方法。

此外，如果你想根据多个属性进行分组，或者进行更复杂的分组逻辑，你可能需要结合使用`Collectors.groupingBy`和其他的收集器，或者使用`reduce`方法来实现更高级的分组策略。

## 如何让结果自己变成 Map Integer, Integer ， 只需要保留原来 value 的 size

如果你想要将分组的结果转换成`Map<Integer, Integer>`，其中键是原始分组键（例如，`Person`对象的`age`属性），而值是该分组中元素的数量，你可以使用`Collectors.groupingBy`结合`Collectors.counting`来实现。下面是如何做到这一点的示例代码：

```java
import java.util.*;
import java.util.stream.Collectors;

class Person {
    private String name;
    private int age;

    // 构造方法、getter和setter省略
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}

public class GroupingExample {
    public static void main(String[] args) {
        List<Person> people = Arrays.asList(
            new Person("John", 20),
            new Person("Jane", 20),
            new Person("Mark", 30),
            new Person("Mary", 30)
        );

        // 根据年龄分组并计算每个年龄分组的大小
        Map<Integer, Integer> peopleCountByAge = people
            .stream()
            .collect(Collectors.groupingBy(
                Person::getAge, 
                Collectors.counting()
            ));

        peopleCountByAge.forEach((age, count) -> System.out.println("Age: " + age + " has " + count + " people"));
    }
}
```

在这个例子中，`Collectors.groupingBy`的第一个参数是分组的依据，这里是`Person::getAge`。第二个参数是应用于每个分组的收集器，这里是`Collectors.counting()`，它统计每个分组中的元素数量。

最终，`peopleCountByAge`将是一个`Map<Integer, Integer>`，其中键是年龄，值是该年龄的人数。当你调用`forEach`方法遍历这个映射时，你会得到每个年龄分组的人数。

## jdk8 stream sum 一个数组

在Java 8中，你可以使用`IntStream`（对于`int`类型的数组）或`DoubleStream`（对于`double`类型的数组）以及`sum()`方法来计算数组的总和。`sum()`方法会返回一个累加值，它是一个原始类型（`int`或`long`，取决于流中的数值类型）。

以下是使用Java 8的Stream API来计算数组总和的示例：

### 对于`int`数组：

```java
import java.util.stream.IntStream;

public class SumIntArray {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};

        int sum = IntStream.of(numbers).sum();
        System.out.println("Sum: " + sum);
    }
}
```

### 对于`double`数组：

```java
import java.util.stream.DoubleStream;

public class SumDoubleArray {
    public static void main(String[] args) {
        double[] numbers = {1.5, 2.5, 3.5, 4.5, 5.5};

        double sum = DoubleStream.of(numbers).sum();
        System.out.println("Sum: " + sum);
    }
}
```

在这两个例子中，`IntStream.of(numbers)`和`DoubleStream.of(numbers)`分别创建了一个流，然后调用`sum()`方法来计算流中所有元素的总和。

如果你的数组是对象数组，比如`Integer[]`或`Double[]`，你可以先将数组转换为相应的原始类型流，然后再调用`sum()`方法。对于`Integer[]`，你可以使用`IntStream`的`mapToInt`方法，对于`Double[]`，可以使用`DoubleStream`的`mapToDouble`方法。

### 对于`Integer[]`数组：

```java
import java.util.stream.IntStream;

public class SumIntegerArray {
    public static void main(String[] args) {
        Integer[] numbers = {1, 2, 3, 4, 5};

        int sum = IntStream.of(numbers).mapToInt(Integer::intValue).sum();
        System.out.println("Sum: " + sum);
    }
}
```


## 如果是 Long list 如何通过 stream 计算 sum

在Java 8中，如果你有一个`List<Long>`并希望使用Stream API来计算其元素的总和，你可以先将`List`转换为`LongStream`，然后调用`sum()`方法。下面是如何做到这一点的示例代码：

```java
import java.util.List;
import java.util.stream.Collectors;

public class SumLongList {
    public static void main(String[] args) {
        List<Long> longList = List.of(1L, 2L, 3L, 4L, 5L); // 示例列表

        // 将List转换为LongStream，然后计算sum
        long sum = longList.stream()
            .mapToLong(Long::longValue) // 将Long对象转换为long类型
            .sum(); // 计算总和

        System.out.println("Sum: " + sum);
    }
}
```

在这个示例中，`mapToLong(Long::longValue)`方法将`List<Long>`中的`Long`对象转换为原始的`long`类型，以便`sum()`方法可以正确地计算总和。最终结果是一个`long`类型的数值，表示列表中所有元素的总和。

请注意，`List.of`是Java 9及以后版本中引入的便捷方法，用于创建不可变的列表。如果你使用的是Java 8或更早版本，你需要使用其他方式创建列表，例如使用`Arrays.asList`或者通过循环添加元素到新创建的`ArrayList`中。


# 参考资料

《java8 函数式编程》

* any list
{:toc}