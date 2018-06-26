---
layout: post
title:  Junit5-15-Parameterized Tests
date:  2018-06-25 19:13:52 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 参数化测试

参数化测试使使用不同参数多次运行测试成为可能。它们与常规的@Test方法一样被声明，但是使用 `@ParameterizedTest`注释。
此外，您必须声明至少一个源，该源将为每个调用提供参数，然后使用测试方法中的参数。

下面的示例演示了一个参数化测试，该测试使用@ValueSource注释指定一个字符串数组作为参数的来源。

## 实例

```java
@ParameterizedTest
@ValueSource(strings = { "racecar", "radar", "able was I ere I saw elba" })
void palindromes(String candidate) {
    assertTrue(isPalindrome(candidate));
}
```

执行上述参数化测试方法时，将分别报告每个调用。例如，`ConsoleLauncher` 将输出类似如下的输出。

## 需要

需要添加 `junit-jupiter-params` 模块：

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-params</artifactId>
    <version>5.2.0</version>
    <scope>test</scope>
</dependency>
```

# 使用参数

参数化测试方法通常在参数源索引和方法参数索引之间的一对一关联之后，直接使用配置源(请参阅参数源)中的参数(请参阅@CsvSource中的示例)。

但是，参数化测试方法也可以选择将源中的参数聚合到传递给方法的单个对象中(参见参数聚合)。参数解析器还可以提供其他参数(例如，获取TestInfo、TestReporter等实例)。具体地说，参数化测试方法必须根据以下规则声明形式参数。

- 必须首先声明零个或多个索引参数。

- 接下来必须声明零或更多的聚合器。

- 参数解析器提供的零或多个参数必须最后声明。

在此上下文中，索引参数是由ArgumentsProvider提供的参数中的给定索引的参数，该参数作为参数传递给方法的参数化方法，参数化方法位于方法的正式参数列表中的相同索引。聚合器是任何参数的类型ArgumentsAccessor或任何带有 `@AggregateWith` 的参数。

# 源的参数(Sources of Arguments)

JUnit Jupiter提供了很多源代码注释。下面的每个小节都提供一个简要的概述和每个小节的示例。

请参考 `org.junit.jupiter.params.provider` 中的JavaDoc。
提供附加信息的提供程序包。

## @ValueSource

@ValueSource是最简单的可能来源之一。
它允许您指定一个文本值数组，并且只能用于为每个参数化测试调用提供一个参数。

@ValueSource 支持以下类型的文字值: 

- short

- byte

- int

- long

- float

- double

- char

- java.lang.String

- java.lang.Class


### 实例

例如，下面的@ParameterizedTest方法将被调用三次，值分别是1、2和3。

```java
@ParameterizedTest
@ValueSource(ints = { 1, 2, 3 })
void testWithValueSource(int argument) {
    assertTrue(argument > 0 && argument < 4);
}
```

## @EnumSource

@EnumSource提供了使用Enum常量的方便方法。该注释提供了一个可选的名称参数，允许您指定哪个常量应使用。
如果省略，所有的常量将被使用，如下面的示例所示。

```java
@ParameterizedTest
@EnumSource(TimeUnit.class)
void testWithEnumSource(TimeUnit timeUnit) {
    assertNotNull(timeUnit);
}
```

```java
@ParameterizedTest
@EnumSource(value = TimeUnit.class, names = { "DAYS", "HOURS" })
void testWithEnumSourceInclude(TimeUnit timeUnit) {
    assertTrue(EnumSet.of(TimeUnit.DAYS, TimeUnit.HOURS).contains(timeUnit));
}
```

@EnumSource注释还提供了一个可选的模式参数，它允许对哪些常量传递给测试方法进行细粒度控制。
例如，您可以从enum常量池中排除名称或指定正则表达式，如下面的示例所示。

```java
@ParameterizedTest
@EnumSource(value = TimeUnit.class, mode = EXCLUDE, names = { "DAYS", "HOURS" })
void testWithEnumSourceExclude(TimeUnit timeUnit) {
    assertFalse(EnumSet.of(TimeUnit.DAYS, TimeUnit.HOURS).contains(timeUnit));
    assertTrue(timeUnit.name().length() > 5);
}
```

```java
@ParameterizedTest
@EnumSource(value = TimeUnit.class, mode = MATCH_ALL, names = "^(M|N).+SECONDS$")
void testWithEnumSourceRegex(TimeUnit timeUnit) {
    String name = timeUnit.name();
    assertTrue(name.startsWith("M") || name.startsWith("N"));
    assertTrue(name.endsWith("SECONDS"));
}
```

## @MethodSource

`@MethodSource` 允许您引用测试类或外部类的一个或多个工厂方法。
此类工厂方法必须返回流、可迭代、迭代器或参数数组。此外，这种工厂方法不能接受任何参数。
测试类中的工厂方法必须是静态的，除非用@TestInstance(Lifecycle.PER_CLASS)注释测试类;
然而，外部类中的工厂方法必须始终是静态的。

如果只需要一个参数，可以返回参数类型实例的 Stream(流)，如下面的示例所示。


> 备注

这个功能就非常类似于 TestNG 中的 `@DataProvider` 功能，但是显然，Junit5 要更加好用。

```java
@ParameterizedTest
@MethodSource("stringProvider")
void testWithSimpleMethodSource(String argument) {
    assertNotNull(argument);
}

static Stream<String> stringProvider() {
    return Stream.of("foo", "bar");
}
```

### 自动搜索

如果您没有通过@MethodSource显式提供工厂方法名称，JUnit Jupiter将会**搜索与当前的@ParameterizedTest方法同名的工厂方法**。

下面的示例演示了这一点。

ps: 这是一个很人性化的设计，但是反过来说，这个设计意义不大。（会导致不规范，后期全部要维护两套。）

```java
@ParameterizedTest
@MethodSource
void testWithSimpleMethodSourceHavingNoValue(String argument) {
    assertNotNull(argument);
}

static Stream<String> testWithSimpleMethodSourceHavingNoValue() {
    return Stream.of("foo", "bar");
}
```

### 原始类型的流

原始类型的流(DoubleStream、IntStream和LongStream)也得到了支持，如下例所示。

```java
@ParameterizedTest
@MethodSource("range")
void testWithRangeMethodSource(int argument) {
    assertNotEquals(9, argument);
}

static IntStream range() {
    return IntStream.range(0, 20).skip(10);
}
```

### 多个参数

如果测试方法声明多个参数，您需要返回参数实例的集合或流，如下所示。
注意， `Arguments.of(Object…​)` 是在参数接口中定义的静态工厂方法。

```java
@ParameterizedTest
@MethodSource("stringIntAndListProvider")
void testWithMultiArgMethodSource(String str, int num, List<String> list) {
    assertEquals(3, str.length());
    assertTrue(num >=1 && num <=2);
    assertEquals(2, list.size());
}

static Stream<Arguments> stringIntAndListProvider() {
    return Stream.of(
        Arguments.of("foo", 1, Arrays.asList("a", "b")),
        Arguments.of("bar", 2, Arrays.asList("x", "y"))
    );
}
```

### 外部的静态工厂方法

一个外部的静态工厂方法可以通过提供其完全限定的方法名称来引用，如下面的示例所示。

```java
package example;

import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class ExternalMethodSourceDemo {

    @ParameterizedTest
    @MethodSource("example.StringsProviders#blankStrings")
    void testWithExternalMethodSource(String blankString) {
        // test with blank string
    }
}

class StringsProviders {

    static Stream<String> blankStrings() {
        return Stream.of("", " ", " \n ");
    }
}
```

## @CsvSource

@CsvSource允许您将参数列表表示为逗号分隔的值(例如。字符串)。

```java
@ParameterizedTest
@CsvSource({ "foo, 1", "bar, 2", "'baz, qux', 3" })
void testWithCsvSource(String first, int second) {
    assertNotNull(first);
    assertNotEquals(0, second);
}
```

@CsvSource使用一个单引号作为它的引号字符。
请参见上面的示例和下面的表中的“baz, qux”值。一个空的，引用的值“导致一个空字符串;
然而，一个完全空值被解释为空引用。如果空引用的目标类型是原语类型，则会引发ArgumentConversionException。

| 示例输入	| 结果参数 |
|:---|:---|
| @CsvSource({ "foo, bar" }) | "foo", "bar" |
| @CsvSource({ "foo, 'baz, qux'" }) | "foo", "baz, qux" |
| @CsvSource({ "foo, ''" }) | "foo", "" |
| @CsvSource({ "foo, " }) | "foo", null |

## @CsvFileSource

@CsvFileSource允许您使用类路径中的CSV文件。CSV文件中的每一行都会调用一次参数化测试。

```java
@ParameterizedTest
@CsvFileSource(resources = "/two-column.csv", numLinesToSkip = 1)
void testWithCsvFileSource(String first, int second) {
    assertNotNull(first);
    assertNotEquals(0, second);
}
```

- two-column.csv

```
Country, reference
Sweden, 1
Poland, 2
"United States of America", 3
```

与@CsvSource中使用的语法相反，@CsvFileSource使用了双引号“作为引用字符。
参见上面的例子中的"美利坚合众国"的价值。一个空的、引用的值`""`将导致一个空字符串;然而，一个完全空值被解释为空引用。
如果空引用的目标类型是原语类型，则会引发ArgumentConversionException。

## @ArgumentsSource

@ArgumentsSource 可用于指定自定义的、可重用的ArgumentsProvider。

```java
@ParameterizedTest
@ArgumentsSource(MyArgumentsProvider.class)
void testWithArgumentsSource(String argument) {
    assertNotNull(argument);
}

public class MyArgumentsProvider implements ArgumentsProvider {

    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) {
        return Stream.of("foo", "bar").map(Arguments::of);
    }
}
```

# 参数转换

## 扩大转换(Widening Conversion)

JUnit Jupiter支持对提供给 `@ParameterizedTest` 的参数进行扩展的原始转换。
例如，使用 `@ValueSource(ints ={1,2,3})` 注释的参数化测试可以声明为不仅接受int类型的参数，而且接受long、float或double类型的参数。

## 隐式转换(Implicit Conversion)

为了支持像@CsvSource这样的用例，JUnit Jupiter提供了许多内置的隐式类型转换器。
转换过程取决于每个方法参数的声明类型。

例如，如果 `@ParameterizedTest` 声明类型TimeUnit的参数，而声明的源提供的实际类型是字符串，
则该字符串将自动转换为相应的 `TimeUnit` enum常量。

```java
@ParameterizedTest
@ValueSource(strings = "SECONDS")
void testWithImplicitArgumentConversion(TimeUnit argument) {
    assertNotNull(argument.name());
}
```

字符串实例目前隐式地转换为以下目标类型。

| 目标类型 |	数据 |
|:---|:---|
| boolean/Boolean | "true" → true |
| byte/Byte | "1" → (byte) 1 |
| char/Character | "o" → 'o' |
| short/Short | "1" → (short) 1 |
| int/Integer | "1" → 1 |
| long/Long | "1" → 1L |
| float/Float | "1.0" → 1.0f |
| double/Double | "1.0" → 1.0d |
| Enum subclass | "SECONDS" → TimeUnit.SECONDS |
| java.io.File | "/path/to/file" → new File("/path/to/file") |
| java.nio.file.Path | "/path/to/file" → Paths.get("/path/to/file") |
| java.math.BigDecimal | "123.456e789" → new BigDecimal("123.456e789") |
| java.math.BigInteger | "1234567890123456789" → new BigInteger("1234567890123456789") |
| java.net.URI | "http://junit.org/" → URI.create("http://junit.org/") |
| java.net.URL | "http://junit.org/" → new URL("http://junit.org/") |
| java.nio.charset.Charset | "UTF-8" → Charset.forName("UTF-8") |
| java.time.Instant | "1970-01-01T00:00:00Z" → Instant.ofEpochMilli(0) |
| java.time.LocalDateTime | "2017-03-14T12:34:56.789" → LocalDateTime.of(2017, 3, 14, 12, 34, 56, 789_000_000) |
| java.time.LocalDate | "2017-03-14" → LocalDate.of(2017, 3, 14) |
| java.time.LocalTime | "12:34:56.789" → LocalTime.of(12, 34, 56, 789_000_000) |
| java.time.OffsetDateTime | "2017-03-14T12:34:56.789Z" → OffsetDateTime.of(2017, 3, 14, 12, 34, 56, 789_000_000, ZoneOffset.UTC) |
| java.time.OffsetTime | "12:34:56.789Z" → OffsetTime.of(12, 34, 56, 789_000_000, ZoneOffset.UTC) |
| java.time.YearMonth | "2017-03" → YearMonth.of(2017, 3) |
| java.time.Year | "2017" → Year.of(2017) |
| java.time.ZonedDateTime | "2017-03-14T12:34:56.789Z" → ZonedDateTime.of(2017, 3, 14, 12, 34, 56, 789_000_000, ZoneOffset.UTC) |
| java.time.Currency | "JPY" → Currency.getInstance("JPY") |
| java.util.Locale | "en" → new Locale("en") |
| java.util.UUID | "d043e930-7b3b-48e3-bdbe-5a3ccfb833db" → UUID.fromString("d043e930-7b3b-48e3-bdbe-5a3ccfb833db") |

### Fallback String-to-Object Conversion

除了列出的目标类型隐式转换从字符串到在上面的表中, JUnit Jupiter 
还提供了一种回调机制自动转换从一个字符串给定目标类型如果目标类型声明一个合适的工厂方法或工厂构造函数如下定义。

工厂方法: 在目标类型中声明的非私有的静态方法，它接受单个字符串参数并返回目标类型的实例。方法的名称可以是任意的，不需要遵循任何特定的约定。

工厂构造函数: 目标类型中的非私有构造函数，接受单个字符串参数。

如果发现了多个工厂方法，它们将被忽略。如果发现工厂方法和工厂构造函数，将使用工厂方法而不是构造函数。

例如，在下面的@ParameterizedTest方法中，将通过调用Book.fromTitle(String) factory方法创建Book参数，并将“42 Cats”作为书名。

```java
@ParameterizedTest
@ValueSource(strings = "42 Cats")
void testWithImplicitFallbackArgumentConversion(Book book) {
    assertEquals("42 Cats", book.getTitle());
}

public class Book {

    private final String title;

    private Book(String title) {
        this.title = title;
    }

    public static Book fromTitle(String title) {
        return new Book(title);
    }

    public String getTitle() {
        return this.title;
    }
}
```

## 显式转换

与使用隐式参数转换不同，您可以使用@ConvertWith注释显式地指定一个ArgumentConverter来使用，如下面的示例所示。

```java
@ParameterizedTest
@EnumSource(TimeUnit.class)
void testWithExplicitArgumentConversion(
        @ConvertWith(ToStringArgumentConverter.class) String argument) {

    assertNotNull(TimeUnit.valueOf(argument));
}

public class ToStringArgumentConverter extends SimpleArgumentConverter {

    @Override
    protected Object convert(Object source, Class<?> targetType) {
        assertEquals(String.class, targetType, "Can only convert to String");
        return String.valueOf(source);
    }
}
```

显式的参数转换器是由测试和扩展的作者实现的。
因此，`junit-jupiter-params` 只提供一个明确的参数转换器，它也可以作为参考实现:JavaTimeArgumentConverter。
它通过组合注释JavaTimeConversionPattern使用。

```java
@ParameterizedTest
@ValueSource(strings = { "01.01.2017", "31.12.2017" })
void testWithExplicitJavaTimeConverter(
        @JavaTimeConversionPattern("dd.MM.yyyy") LocalDate argument) {

    assertEquals(2017, argument.getYear());
}
```

# 参数聚合(Argument Aggregation)

默认情况下，提供给@ParameterizedTest方法的每个参数都对应于单个方法参数。
因此，期望提供大量参数的参数源可能导致大方法签名。

在这种情况下，可以使用ArgumentsAccessor而不是使用多个参数。
使用这个API，您可以通过传递给测试方法的单个参数访问提供的参数。此外，隐式转换支持类型转换。

```java
@ParameterizedTest
@CsvSource({
    "Jane, Doe, F, 1990-05-20",
    "John, Doe, M, 1990-10-22"
})
void testWithArgumentsAccessor(ArgumentsAccessor arguments) {
    Person person = new Person(arguments.getString(0),
                               arguments.getString(1),
                               arguments.get(2, Gender.class),
                               arguments.get(3, LocalDate.class));

    if (person.getFirstName().equals("Jane")) {
        assertEquals(Gender.F, person.getGender());
    }
    else {
        assertEquals(Gender.M, person.getGender());
    }
    assertEquals("Doe", person.getLastName());
    assertEquals(1990, person.getDateOfBirth().getYear());
}
```

ArgumentsAccessor的实例被自动注入到ArgumentsAccessor类型的任何参数中。

## 自定义聚合函数

除了使用ArgumentsAccessor直接访问@ParameterizedTest方法的参数之外，JUnit Jupiter还支持使用自定义的、可重用的聚合器。

要使用自定义聚合器，只需实现ArgumentsAggregator接口，并通过@AggregateWith注释在 `@ParameterizedTest` 方法中的兼容参数上注册它。
然后，当调用参数化测试时，聚合的结果将作为相应参数的参数提供。

```java
@ParameterizedTest
@CsvSource({
    "Jane, Doe, F, 1990-05-20",
    "John, Doe, M, 1990-10-22"
})
void testWithArgumentsAggregator(@AggregateWith(PersonAggregator.class) Person person) {
    // perform assertions against person
}

public class PersonAggregator implements ArgumentsAggregator {
    @Override
    public Person aggregateArguments(ArgumentsAccessor arguments, ParameterContext context) {
        return new Person(arguments.getString(0),
                          arguments.getString(1),
                          arguments.get(2, Gender.class),
                          arguments.get(3, LocalDate.class));
    }
}
```

如果您发现自己在代码库中为多个参数化测试方法反复声明@AggregateWith(MyTypeAggregator.class)，
那么您可能希望创建一个自定义的组合注释，比如@CsvToMyType，它使用@AggregateWith(MyTypeAggregator.class)进行元注释。
下面的示例使用自定义的@CsvToPerson注释演示了这一点。

```java
@ParameterizedTest
@CsvSource({
    "Jane, Doe, F, 1990-05-20",
    "John, Doe, M, 1990-10-22"
})
void testWithCustomAggregatorAnnotation(@CsvToPerson Person person) {
    // perform assertions against person
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
@AggregateWith(PersonAggregator.class)
public @interface CsvToPerson {
}
```

# 自定义显示名称

默认情况下，参数化测试调用的显示名称包含调用索引和特定调用的所有参数的字符串表示。
但是，您可以通过@ParameterizedTest注释的name属性自定义调用显示名称，

如下面的示例所示。

```java
@DisplayName("Display name of container")
@ParameterizedTest(name = "{index} ==> first=''{0}'', second={1}")
@CsvSource({ "foo, 1", "bar, 2", "'baz, qux', 3" })
void testWithCustomDisplayNames(String first, int second) {
}
```

当您使用 `ConsoleLauncher` 执行上述方法时，您将看到与下面类似的输出。

```
Display name of container ✔
├─ 1 ==> first='foo', second=1 ✔
├─ 2 ==> first='bar', second=2 ✔
└─ 3 ==> first='baz, qux', second=3 ✔
```

## 参数说明

| 占位符 | 描述 |
|:---|:---|
| {index} | 当前调用索引(基于1) |
| {arguments} | 完整的、逗号分隔的参数列表 |
| {0}, {1}, …​| 单个参数 |

# 生命周期和互操作性

参数化测试的每次调用与常规的@Test方法具有相同的生命周期。例如，@BeforeEach方法将在每次调用之前执行。
与动态测试类似，调用将在IDE的测试树中逐一出现。您可以随意在同一个测试类中混合常规的@Test方法和@ParameterizedTest方法。

您可以使用@ ParameterResolver扩展和@ParameterizedTest方法。
但是，由参数源解析的方法参数需要放在参数列表的前面。
由于一个测试类可能包含常规测试和具有不同参数列表的参数化测试，因此对于生命周期方法(例如@BeforeEach)和测试类构造函数，不会解析来自参数源的值。

```java
@BeforeEach
void beforeEach(TestInfo testInfo) {
    // ...
}

@ParameterizedTest
@ValueSource(strings = "foo")
void testWithRegularParameterResolver(String argument, TestReporter testReporter) {
    testReporter.publishEntry("argument", argument);
}

@AfterEach
void afterEach(TestInfo testInfo) {
    // ...
}
```

* any list
{:toc}