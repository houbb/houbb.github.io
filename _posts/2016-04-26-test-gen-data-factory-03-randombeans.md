---
layout: post
title:  test data factory-03-测试造数平台 RandomBeans
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)


# RandomBeans

## 项目状态

截至2020年11月15日，Easy Random 处于维护模式。这意味着从现在开始只会处理 bug 修复（除了在 Java 16 发布时将发布的 records 支持）。目前支持的版本为基于 Java 11 的版本 5.0.x 和基于 Java 8 的版本 4.3.x。请尽早考虑升级到其中一个版本。

## 最新消息

2020年11月15日：Easy Random v5.0.0 发布，现在基于 Java 11。在功能上，此版本与 v4.3.0 相同。请查看发布说明以获取更多详细信息。
2020年11月7日：Easy Random v4.3.0 现已发布，支持泛型和流畅的 setter！您可以在更改日志中找到所有详细信息。

## 什么是 Easy Random？

Easy Random 是一个生成随机 Java 对象的库。你可以将它视为 JVM 的 ObjectMother。假设你有一个类 Person，你想生成它的一个随机实例，如下所示：

```java
EasyRandom easyRandom = new EasyRandom();
Person person = easyRandom.nextObject(Person.class);
```

EasyRandom#nextObject 方法能够生成任何给定类型的随机实例。

## 这个 EasyRandom API 是什么？

java.util.Random API 提供了 7 个方法来生成随机数据：nextInt()、nextLong()、nextDouble()、nextFloat()、nextBytes()、nextBoolean() 和 nextGaussian()。如果你需要生成一个随机的字符串？或者说你的领域对象的一个随机实例呢？Easy Random 提供了 EasyRandom API，它通过一个名为 nextObject(Class type) 的方法扩展了 java.util.Random。这个方法能够生成任何任意 Java Bean 类型的随机实例。

EasyRandomParameters 类是配置 EasyRandom 实例的主要入口点。它允许你设置所有参数以控制如何生成随机数据：

```java
EasyRandomParameters parameters = new EasyRandomParameters()
   .seed(123L)
   .objectPoolSize(100)
   .randomizationDepth(3)
   .charset(forName("UTF-8"))
   .timeRange(nine, five)
   .dateRange(today, tomorrow)
   .stringLengthRange(5, 50)
   .collectionSizeRange(1, 10)
   .scanClasspathForConcreteTypes(true)
   .overrideDefaultInitialization(false)
   .ignoreRandomizationErrors(true);

EasyRandom easyRandom = new EasyRandom(parameters);
```

有关这些参数的更多详细信息，请参阅配置参数部分。

在大多数情况下，使用默认选项就足够了，你可以使用 EasyRandom 的默认构造函数。

Easy Random 允许你通过 org.jeasy.random.api.Randomizer 接口来控制如何生成随机数据，并通过 java.util.function.Predicate 轻松地从对象图中排除一些字段：

```java
EasyRandomParameters parameters = new EasyRandomParameters()
   .randomize(String.class, () -> "foo")
   .excludeField(named("age").and(ofType(Integer.class)).and(inClass(Person.class)));

EasyRandom easyRandom = new EasyRandom(parameters);
Person person = easyRandom.nextObject(Person.class);
```

在上面的例子中，Easy Random 将：

- 将所有 String 类型的字段设置为 "foo"（使用作为 lambda 表达式定义的 Randomizer）。
- 在类 Person 中排除名为 age、类型为 Integer 的字段。
  
名为 named、ofType 和 inClass 的静态方法定义在 org.jeasy.random.FieldPredicates 中，它提供了你可以与其组合使用以定义要排除的字段的常见断言。类似的名为 TypePredicates 的类可用于定义要从对象图中排除的类型。当然，你也可以使用自己的 java.util.function.Predicate 与这些预定义的断言组合使用。

## 为什么选择 Easy Random？

用随机数据填充 Java 对象乍一看似乎很容易，除非你的领域模型涉及许多相关的类。

![why](https://raw.githubusercontent.com/wiki/j-easy/easy-random/images/person.png)

在上面的例子中，假设 Person 类型定义如下：

```java
public class Person {
    private String firstName;
    private String lastName;
    private String email;
    private Gender gender;
    private Address address;
    // getters and setters
}

public class Address {
    private Street street;
    private String zipCode;
    private String city;
    private String country;
    // getters and setters
}

public class Street {
    private int number;
    private byte type;
    private String name;
    // getters and setters
}

public enum Gender {
    MALE, FEMALE
}
```

如果没有 Easy Random，为了创建 Person 类的实例，你将编写以下代码：

```java
Street street = new Street(12, (byte) 1, "Oxford street");
Address address = new Address(street, "123456", "London", "United Kingdom");
Person person = new Person("Foo", "Bar", "foo.bar@gmail.com", Gender.MALE, address);
```

如果这些类没有提供带有参数的构造函数（可能是一些你无法更改的遗留类型），你将编写：

```java
Street street = new Street();
street.setNumber(12);
street.setType((byte) 1);
street.setName("Oxford street");

Address address = new Address();
address.setStreet(street);
address.setZipCode("123456");
address.setCity("London");
address.setCountry("United Kingdom");

Person person = new Person();
person.setFirstName("Foo");
person.setLastName("Bar");
person.setEmail("foo.bar@gmail.com");
person.setGender(Gender.MALE);
person.setAddress(address);
```

使用 Easy Random，生成一个随机的 Person 对象只需使用 `new EasyRandom().nextObject(Person.class)`。

该库将递归地填充整个对象图。这是一个很大的区别！

## 这如何有用呢？

有时，测试装置对测试逻辑并不重要。

例如，如果我们想测试一个新的排序算法的结果，我们可以生成随机的输入数据，并断言输出是排序的，而不考虑数据本身：

```java
@org.junit.Test
public void testSortAlgorithm() {

   // Given
   int[] ints = easyRandom.nextObject(int[].class);

   // When
   int[] sortedInts = myAwesomeSortAlgo.sort(ints);

   // Then
   assertThat(sortedInts).isSorted(); // 假的断言

}
```

另一个例子是测试领域对象的持久性，我们可以生成一个随机的领域对象，将其持久化，然后断言数据库包含相同的值：

```java
@org.junit.Test
public void testPersistPerson() throws Exception {
   // Given
   Person person = easyRandom.nextObject(Person.class);

   // When
   personDao.persist(person);

   // Then
   assertThat("person_table").column("name").value().isEqualTo(person.getName()); // 断言数据库
}
```

还有许多其他情况下 Easy Random 可以派上用场，你可以在 wiki 中找到一个非详尽的列表。

扩展
- JUnit 扩展：在 JUnit 测试中使用 Easy Random 生成随机数据（由 glytching 提供）
- Vavr 扩展：该扩展添加了对随机化 Vavr 类型的支持（由 xShadov 提供）
- Protocol Buffers 扩展：该扩展添加了对随机化 Protocol Buffers 生成的类型的支持（由 murdos 提供）

# chat

## 详细介绍一下 randombeans

`RandomBeans` 是一个 Java 库，用于生成具有随机值的 Java 对象。

该库允许你轻松地创建具有随机数据的对象，适用于测试、原型设计和其他需要使用随机数据的场景。

以下是 `RandomBeans` 的一些主要功能和用法：

1. **简单的随机对象生成：** 通过调用 `RandomBeans` 的静态方法，你可以轻松生成具有随机值的对象。例如：

   ```java
   Person person = RandomBeans.of(Person.class).get();
   ```

2. **配置生成选项：** `RandomBeans` 允许你配置生成随机对象的选项，例如是否包括 null 值、是否忽略特定字段等。可以通过使用 `RandomBeansBuilder` 进行配置：

   ```java
   Person person = RandomBeans.builder(Person.class)
       .nulls(false)
       .exclude("socialSecurityNumber")
       .get();
   ```

3. **支持嵌套对象：** `RandomBeans` 可以递归生成嵌套对象，确保整个对象图都包含随机数据：

   ```java
   Company company = RandomBeans.of(Company.class).get();
   ```

4. **支持集合和数组：** 你可以生成具有随机元素的集合或数组：

   ```java
   List<Person> people = RandomBeans.listOf(Person.class, 10);
   ```

5. **自定义生成器：** 通过实现 `Randomizer` 接口，你可以提供自定义的生成器，以控制特定类型的随机值生成逻辑：

   ```java
   RandomBeans.registerRandomizer(MyType.class, new MyTypeRandomizer());
   ```

6. **支持各种数据类型：** `RandomBeans` 支持生成各种基本数据类型、日期、枚举等类型的随机值。

下面是一个简单的示例，演示如何使用 `RandomBeans` 生成具有随机值的 `Person` 对象：

```java
import io.github.benas.randombeans.api.EnhancedRandom;
import io.github.benas.randombeans.api.EnhancedRandomBuilder;

public class RandomBeansExample {

    public static void main(String[] args) {
        // 创建 EnhancedRandom 实例
        EnhancedRandom enhancedRandom = EnhancedRandomBuilder.aNewEnhancedRandomBuilder().build();

        // 生成随机的 Person 对象
        Person person = enhancedRandom.nextObject(Person.class);

        // 打印生成的 Person 对象
        System.out.println(person);
    }
}
```

在这个例子中，`Person` 类是一个简单的 Java Bean，`EnhancedRandom` 接口提供了用于生成随机对象的方法。

你可以通过构建器配置生成选项。这使得在测试中创建具有随机数据的对象变得非常容易。



# 参考资料

https://github.com/j-easy/easy-random

* any list
{:toc}