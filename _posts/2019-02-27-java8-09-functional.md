---
layout: post
title: Java8-09-functional 函数式编程
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, sh]
published: true
---

# Functional Programming in Java

Lambda expressions are lightweight, highly concise anonymous methods backed by functional interfaces in Java 8. 
You can use them to leap forward into a whole new world of programming in Java.

优点：

- 声明式
 
- 提倡不可变性
 
- 避免副作用
 
- 优先使用表达式而不是语句
 
- 使用高阶函数进行设计

> [Functional Programming in Java](https://pragprog.com/book/vsjava8/functional-programming-in-java)

> [blog zh_CN](http://www.iteye.com/blogs/subjects/Java8-FP)

> [deep mind](http://it.deepinmind.com/)

 
# Usage of collection

对于列表

```java
static final List<String> stringList = Arrays.asList("hello", "world", "hello", "lambda");
```

传统的打印方法如下：

```java
@Test
public void commonTest() {
    for(String string : stringList) {
        System.out.println(string);
    }
}
```

引入新的方法如下：

```java
@Test
public void oneTest() {
    stringList.forEach(new Consumer<String>() {
        @Override
        public void accept(String s) {
            System.out.println(s);
        }
    });
}

@Test
public void twoTest() {
    stringList.forEach((final String s) -> System.out.println(s));
}

@Test
public void threeTest() {
    stringList.forEach((s) -> System.out.println(s));
}

@Test
public void fourTest() {
    stringList.forEach(System.out::println);
}
```


# List translate

想将上述列表全部转化为大写。

- common way

```java
@Test
public void commonTest() {
    List<String> strings = new LinkedList<>();
    for (String string : stringList) {
        strings.add(string.toUpperCase());
    }
    System.out.println(strings);
}
```

- new way

```java
@Test
public void innerIterTest() {
    List<String> strings = new LinkedList<>();
    stringList.forEach(s -> strings.add(s.toUpperCase()));
    System.out.println(strings);
}

@Test
public void streamTest() {
    stringList
            .stream()
            .map(s -> s.toUpperCase())
            .forEach(s -> System.out.println(s));
}

@Test
public void methodReferenceTest() {
    stringList
            .stream()
            .map(String::toUpperCase)
            .forEach(System.out::println);
}
```

# Collection filter

```java
@Test
public void filterTest() {
    stringList
            .stream()
            .filter(s->s.startsWith("g"))
            .forEach(System.out::println);
}
```

一、复用 lambda

```java
static final List<String> colorList = Arrays.asList("red", "green", "hack", "yellow");

@Test
public void reuseLambdaTest() {
    final Predicate<String> startsWithG = name -> name.startsWith("g");
    stringList.stream().filter(startsWithG).forEach(System.out::println);
    colorList.stream().filter(startsWithG).forEach(System.out::println);
}
```

这里复用的依然不够彻底。

二、场景2

查找以 g/w 开头的字符串

```java
/**
 * 查找以  g/w 开头的字符串
 */
@Test
public void filterTest() {
    final Predicate<String> startsWithG = name -> name.startsWith("g");
    final Predicate<String> startsWithW = name -> name.startsWith("w");

    stringList
            .stream()
            .filter(startsWithG)
            .forEach(System.out::println);
    stringList
            .stream()
            .filter(startsWithW)
            .forEach(System.out::println);
}
```

1、存在冗余。可以使用静态方法消除。

```java
/**
 * 判断是否以某字符开始
 *
 * @param letter
 * @return
 */
private static Predicate<String> checkIfStartsWith(final String letter) {
    return name -> name.startsWith(letter);
}

@Test
public void staticMethodTest() {
    stringList
            .stream()
            .filter(checkIfStartsWith("g"))
            .forEach(System.out::println);
    stringList
            .stream()
            .filter(checkIfStartsWith("w"))
            .forEach(System.out::println);
}
```

2、使用函数，替换静态方法

```java
@Test
public void functionTest() {
    final Function<String, Predicate<String>> startsWithLetter = (String letter) -> {
        Predicate<String> checkStarts = (String name) -> name.startsWith(letter);
        return checkStarts;
    };

    stringList
            .stream()
            .filter(startsWithLetter.apply("g"))
            .forEach(System.out::println);
    stringList
            .stream()
            .filter(startsWithLetter.apply("w"))
            .forEach(System.out::println);
}
```

上述方法可以使用 lambda 简化如下:

```java
@Test
public void lambdaFuncTest() {
    final Function<String, Predicate<String>> startsWithLetter =
            (String letter) -> (String name) -> name.startsWith(letter);

    //...
}
```

# Optional

```java
/**
 * 查询符合条件的字符串内容
 * @param names
 * @param startingLetter
 */
private static void pickName(
        final List<String> names, final String startingLetter) {
    final Optional<String> foundName =
            names.stream()
                    .filter(name ->name.startsWith(startingLetter))
                    .findFirst();
    System.out.println(String.format("A name starting with %s: %s",
            startingLetter, foundName.orElse("No name found")));
}
```

测试如下:

```java
@Test
public void optionalTest() {
    pickName(stringList, "h");
    pickName(stringList, "Z");
}
```

result:

```
A name starting with h: hello
A name starting with Z: No name found
```

# MapReduce

```java
/**
 * 计算全部字符串的长度之和
 */
@Test
public void sumTest() {
    int total = stringList.stream().mapToInt(s->s.length()).sum();
    System.out.println(total);
}

/**
 * 找到最长的一个字符串
 */
@Test
public void longestTest() {
    final Optional<String> aLongName = stringList.stream()
            .reduce((name1, name2) ->
                    name1.length() >= name2.length() ? name1 : name2);
    aLongName.ifPresent(name ->
            System.out.println(String.format("A longest name: %s", name)));
}

/**
 * 列表内容进行拼接
 */
@Test
public void joinTest() {
    String string = stringList.stream()
            .map(String::toUpperCase)
            .collect(Collectors.joining(","));
    System.out.println(string);
}
```

# String Iterator

```java
//            104
//            101
//            108
//            108
//            111
@Test
public void commonTest() {
    final String string = "hello";
    string.chars().forEach(System.out::println);
}

//    h
//    e
//    l
//    l
//    o
@Test
public void toCharTest() {
    final String string = "hello";
    string.chars()
            .mapToObj(ch-> ((char) ch))
            .forEach(System.out::println);
}
```

# Collect

- Person.java

```java
public class Person {

    private String name;

    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

- CollectTest.java

```java
/**
 * 构建列表
 * @return
 */
private static List<Person> buildPersonList() {
    List<Person> personList = new LinkedList<>();
    personList.add(new Person("Apple", 12));
    personList.add(new Person("Box", 12));
    personList.add(new Person("Cat", 20));
    personList.add(new Person("Dog", 26));
    personList.add(new Person("Eye", 62));
    return personList;
}

//[Person{name='D', age=26}, Person{name='E', age=62}]
@Test
public void older20Test() {
    List<Person> older20List = new LinkedList<>();
    buildPersonList().stream().filter(person -> person.getAge() > 20)
            .forEach(person -> older20List.add(person));
    System.out.println(older20List);
}

//[Person{name='D', age=26}, Person{name='E', age=62}]
@Test
public void older20CollectTest() {
    List<Person> older20List = buildPersonList().stream()
            .filter(person -> person.getAge() > 20)
            .collect(Collectors.toList());
    System.out.println(older20List);
}

//    Grouped by age: {20=[Person{name='C', age=20}], 26=[Person{name='D', age=26}], 12=[Person{name='A', age=12}, Person{name='B', age=12}], 62=[Person{name='E', age=62}]}
@Test
public void groupByAgeTest() {
    Map<Integer, List<Person>> peopleByAge =
            buildPersonList().stream()
                    .collect(Collectors.groupingBy(Person::getAge));
    System.out.println("Grouped by age: " + peopleByAge);
}

//    People grouped by age: {20=[C], 26=[D], 12=[A, B], 62=[E]}
@Test
public void getNameGroupByAgeTest() {
    Map<Integer, List<String>> nameOfPeopleByAge =
            buildPersonList().stream()
                    .collect(Collectors.groupingBy(Person::getAge, Collectors.mapping(Person::getName, Collectors.toList())));
    System.out.println("People grouped by age: " + nameOfPeopleByAge);
}


//    Oldest person of each letter:
//    {A=Optional[Person{name='Apple', age=12}], B=Optional[Person{name='Box', age=12}], C=Optional[Person{name='Cat', age=20}], D=Optional[Person{name='Dog', age=26}], E=Optional[Person{name='Eye', age=62}]}
@Test
public void groupByFirstLetterTest() {
    Comparator<Person> byAge = Comparator.comparing(Person::getAge);
    Map<Character, Optional<Person>> oldestPersonOfEachLetter =
            buildPersonList().stream()
                    .collect(Collectors.groupingBy(person -> person.getName().charAt(0),
                            Collectors.reducing(BinaryOperator.maxBy(byAge))));
    System.out.println("Oldest person of each letter:");
    System.out.println(oldestPersonOfEachLetter);
}
```

# 拓展阅读

[java 函数式编程-系列教程](https://www.iteye.com/blogs/subjects/Java8-FP)

* any list
{:toc}