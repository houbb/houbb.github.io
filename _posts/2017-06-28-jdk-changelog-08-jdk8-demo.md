---
layout: post
title: java 变更日志-08-JDK8 例子
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

当然可以，以下是你提供的Java 8新特性文档的中文翻译：

# Java 8新特性

## Lambda表达式

Lambda表达式是Java 8中引入的轻量级、高度简洁的匿名方法。你可以使用它们跳入Java编程的全新世界。

### Lambda表达式简介

Lambda表达式是匿名函数。

#### 传统方式

```java
public void old() {
    Runnable r = new Runnable() {
        public void run() {
            System.out.println("Hello World!");
        }
    };
    new Thread(r).start();
}
```

#### 使用Lambda

```java
new Thread(() -> System.out.println("Lambda Hello World!")).start();
```

#### Lambda表达式语法

```
(Type1 param1, Type2 param2, ..., TypeN paramN) -> {
  statment1;
  statment2;
  //.............
  return statmentM;
}
```

1、无参数。

```
() -> { //..... };
```

2、一个参数，可以省略参数类型，编译器可以从上下文中推断。

```
param1 -> {
  statment1;
  statment2;
  //.............
  return statmentM;
}
```

3、只有一个语句，可以省略`{}`。

```
param1 -> statment
```

4、省略参数类型。

```
(param1,param2, ..., paramN) -> {
  statment1;
  statment2;
  //...
  return statmentM;
}
```

### 示例

#### Person接口

```java
public interface Person {
    void say(String string);
}
```

#### 使用Lambda调用

```java
public static void main(String[] args) {
    Person h = str -> System.out.println(str);
    h.say("Hello World");
}
```

#### 结果

```
Hello World
```

## 接口默认方法

### Person接口

```java
public interface Person {
    void say();

    default void eat() {
        System.out.println("eat...");
    }
}
```

### Student类

```java
public class Student implements Person {
    @Override
    public void say() {
        System.out.println("say...");
    }
}
```

### 测试

```java
public static void main(String[] args) {
    Student student = new Student();
    student.say();
    student.eat();
}
```

### 结果

```
say...
eat...

Process finished with exit code 0
```

## 方法引用

1、静态方法：`ClassName::methodName`

```java
public static void main(String[] args) {
    List<String> strs = Arrays.asList("aa","bb","cc");
    strs.forEach(System.out::println);
}
```

2、实例方法：`instanceRefence::methodName`

```java
public class HelloWorld {
    void print(){
        System.out.println("instanceRefence::methodName");
    }

    public void printInfo(){
        System.out.println("printInfo");

        //instance method reference
        new Thread(this::print).start();
    }
}
```

3、构造方法：`Class::new`

```java
public class User {
    String username;

    User(String username){
        this.username = username;
    }

    public String getUsername(){
        return username;
    }
}
```

```java
public class HelloWorld {
    @FunctionalInterface
    interface UserFactory<T extends User> {
        T create(String username);
    }

    private void test() {
        UserFactory<User> uf = User::new;
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 5; ++i) {
            users.add(uf.create("user"+i));
        }
        users.stream().map(User::getUsername).forEach(System.out::println);
    }
}
```

## 重复注解

```java
public class RepeatingAnnotationsTest {

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface Filters {
        Filter[] value();
    }

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @Repeatable(Filters.class)
    public @interface Filter {
        String value();
    }

    @Filter("filter1")
    @Filter("filter2")
    public interface Filterable {
    }

    public static void main(String[] args) {
        for (Filter filter : Filterable.class.getAnnotationsByType(Filter.class)) {
            System.out.println(filter.value());
        }
    }
}
```

### 结果

```
filter1
filter2
```

## 更好的类型推断

```java
public class TypeInference<T> {

    public static <T> T defaultValue() {
        return null;
    }

    public T getOrDefault(T value, T defaultValue) {
        return (value != null) ? value : defaultValue;
    }

    @Test
    public void betterTest() {
        final TypeInference<String> value = new TypeInference<>();
        String result = value.getOrDefault("22", TypeInference.defaultValue());
        System.out.println(result); //22
    }

}
```

## 更多有用的注解

Java 8拓宽了注解的应用场景。现在，注解几乎可以使用在任何元素上：局部变量、接口类型、超类和接口实现类，甚至可以用在函数的异常定义上。

```java
public class MoreUsefulAnnotationTest {

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ElementType.TYPE_USE, ElementType.TYPE_PARAMETER})
    public @interface NonEmpty {
    }

    public static class Holder<@NonEmpty T> extends @NonEmpty Object {
        public void method() throws @NonEmpty Exception {
        }
    }

    @SuppressWarnings("unused")
    public static void main(String[] args) {
        final Holder<String> holder = new @NonEmpty Holder<String>();
        @NonEmpty Collection<@NonEmpty String> strings = new ArrayList<>();
    }

}
```

# 库

## Optional

[Optional](http://docs.oracle.com/javase/8/docs/api/)是一个容器，可以存放T类型的值或者null。它提供了一些有用的接口来避免显式的null检查。

### null测试

```java
@Test
public void nullTest() {
    Optional< String > fullName = Optional.ofNullable( null );
    System.out.println( "Full Name is set? " + fullName.isPresent() );
    System.out.println( "Full Name: " + fullName.orElseGet( () -> "[none]" ) );
    System.out.println( fullName.map( s -> "Hey " + s + "!" ).orElse( "Hey Stranger!" ) );
}
```

### 结果

```
Full Name is set? false
Full Name: [none]
Hey Stranger!
```

### 非null测试

```java
@Test
public void notNullTest()

 {
    Optional< String > fullName = Optional.ofNullable( "ryo" );
    System.out.println( "Full Name is set? " + fullName.isPresent() );
    System.out.println( "Full Name: " + fullName.orElseGet( () -> "[none]" ) );
    System.out.println( fullName.map( s -> "Hey " + s + "!" ).orElse( "Hey Stranger!" ) );
}
```

### 结果

```
Full Name is set? true
Full Name: ryo
Hey ryo!
```

## Streams

Java 8新增的[Stream API（java.util.stream）](http://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html#StreamOps)引入了函数式编程的概念到Java库中。

```java
public class StreamsTest {

    private enum Status {
        OPEN, CLOSED
    }

    private static final class Task {
        private final Status status;
        private final Integer points;

        Task(final Status status, final Integer points) {
            this.status = status;
            this.points = points;
        }

        public Integer getPoints() {
            return points;
        }

        public Status getStatus() {
            return status;
        }

        @Override
        public String toString() {
            return String.format("[%s, %d]", status, points);
        }
    }
}
```

### 测试

```java
@Test
public void totalTest() {
    final Collection<Task> tasks = Arrays.asList(
            new Task(Status.OPEN, 5),
            new Task(Status.OPEN, 13),
            new Task(Status.CLOSED, 8)
    );

    final long totalPointsOfOpenTasks = tasks
            .stream()
            .filter(task -> task.getStatus() == Status.OPEN)
            .mapToInt(Task::getPoints)
            .sum();

    System.out.println(totalPointsOfOpenTasks); //18
}

@Test
public void parallelTest() {
    final Collection<Task> tasks = Arrays.asList(
            new Task(Status.OPEN, 5),
            new Task(Status.OPEN, 13),
            new Task(Status.CLOSED, 8)
    );

    final double totalPoints = tasks
            .stream()
            .parallel()
            .map(task -> task.getPoints())
            .reduce(0, Integer::sum);

    System.out.println("Total points (all tasks): " + totalPoints);   //Total points (all tasks): 26.0
}

@Test
public void groupByTest() {
    final Collection<Task> tasks = Arrays.asList(
            new Task(Status.OPEN, 5),
            new Task(Status.OPEN, 13),
            new Task(Status.CLOSED, 8)
    );

    final Map< Status, List< Task >> map = tasks
            .stream()
            .collect( Collectors.groupingBy( Task::getStatus ) );
    System.out.println( map );  //{OPEN=[[OPEN, 5], [OPEN, 13]], CLOSED=[[CLOSED, 8]]}
}

@Test
public void percentTest() {
    final Collection<Task> tasks = Arrays.asList(
            new Task(Status.OPEN, 5),
            new Task(Status.OPEN, 13),
            new Task(Status.CLOSED, 8)
    );

    final double totalPoints = tasks
            .stream()
            .parallel()
            .map( task -> task.getPoints() )
            .reduce( 0, Integer::sum );

    final Collection< String > result = tasks
            .stream()
            .mapToInt( Task::getPoints )
            .asLongStream()
            .mapToDouble( points -> points / totalPoints )
            .boxed()
            .mapToLong( weigth -> ( long )( weigth * 100 ) )
            .mapToObj( percentage -> percentage + "%" )
            .collect( Collectors.toList() );

    System.out.println(result); //[19%, 50%, 30%]
}
```

## 日期/时间API(JSR 310)

Java 8引入了新的[Date-Time API(JSR 310)](https://jcp.org/en/jsr/detail?id=310)来改进时间、日期的处理。

## Nashorn JavaScript

Java 8提供了新的[Nashorn JavaScript](https://www.javacodegeeks.com/2014/02/java-8-compiling-lambda-expressions-in-the-new-nashorn-js-engine.html)引擎，使得我们可以在JVM上开发和运行js应用。

```java
public class NashornJSTest {

    @Test
    public void jsTest() throws ScriptException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName( "JavaScript" );

        System.out.println( engine.getClass().getName() );
        System.out.println( "Result:" + engine.eval( "function f() { return 1; }; f() + 1;" ) );
    }

}
```

### 结果

```
jdk.nashorn.api.scripting.NashornScriptEngine
Result:2.0
```

## Base64

Java 8加入了对[Base64编码的支持](https://www.javacodegeeks.com/2014/04/base64-in-java-8-its-not-too-late-to-join-in-the-fun.html)。

```java
@Test
public void base64Test() {
    final String text = "Base64 finally in Java 8!";

    final String encoded = Base64
            .getEncoder()
            .encodeToString(text.getBytes(StandardCharsets.UTF_8));
    System.out.println(encoded);

    final String decoded = new String(
            Base64.getDecoder().decode(encoded),
            StandardCharsets.UTF_8);
    System.out.println(decoded);
}
```

### 结果

```
QmFzZTY0IGZpbmFsbHkgaW4gSmF2YSA4IQ==
Base64 finally in Java 8!
```

## ParallelArrays

```java
@Test
public void parallelArraysTest() {
    long[] arrayOfLong = new long[20000];

    Arrays.parallelSetAll(arrayOfLong,
            index -> ThreadLocalRandom.current().nextInt(1000000));
    Arrays.stream(arrayOfLong).limit(10).forEach(
            i -> System.out.print(i + " "));
    System.out.println();

    Arrays.parallelSort(arrayOfLong);
    Arrays.stream(arrayOfLong).limit(10).forEach(
            i -> System.out.print(i + " "));
    System.out.println();
}
```

### 结果

```
395659 19377 864569 289077 710936 742196 922967 850922 701156 551843 
7 17 49 111 116 173 194 260 344 396 
```

* any list
{:toc}