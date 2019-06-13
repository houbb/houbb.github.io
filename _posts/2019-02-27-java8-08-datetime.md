---
layout: post
title: Java8-08-java8 datetime 日期类  
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, time, sh]
published: true
---

# Java SE 8 Date and Time

## 为什么需要？

Java开发人员的一个长期困扰是对普通开发人员的日期和时间用例的支持不足。

例如，现有的类(例如java.util.Date 和 SimpleDateFormatter)并不是线程安全的，这给用户带来了潜在的并发问题——这不是一般开发人员在编写日期处理代码时所期望处理的问题。

一些日期和时间类也显示出相当糟糕的API设计。

例如，java.util中的年份。日期从1900年开始，月份从1月开始，天数从0开始——这不是很直观。

这些问题以及其他一些问题导致了第三方日期和时间库(如Joda-Time)的流行。

为了解决这些问题并在JDK核心中提供更好的支持，为Java SE 8设计了一个新的日期和时间API，它没有这些问题。

该项目由JSR 310下的Joda-Time (Stephen Colebourne)和Oracle共同领导，并将出现在新的Java SE 8包 java.time 中。

## 核心思想

- Immutable-value classes. 

Java中现有格式化程序的一个严重缺陷是它们不是线程安全的。

这使得开发人员不得不以线程安全的方式使用它们，并在日常的数据处理代码开发中考虑并发问题。新的API通过确保其所有核心类都是不可变的并表示定义良好的值来避免这个问题。

- Domain-driven design.

新的API非常精确地使用类对其域进行建模，类代表了日期和时间的不同用例。这与以前在这方面很差的Java库不同。

例如, `java.util.Date` 表示 timeline 上的一个瞬间——这是一个自UNIX时代以来的毫秒数的包装器——但是如果您调用toString()，结果表明它有一个时区，在开发人员中引起混乱。

这种对域驱动设计的强调提供了关于清晰性和可理解性的长期好处，但是在将以前的api移植到Java SE 8时，您可能需要考虑应用程序的日期域模型。

- Separation of chronologies

新的API允许人们使用不同的日历系统，以支持世界上某些地区(如日本或泰国)的用户需求，这些地区不一定遵循ISO-8601。

这样做并没有给大多数开发人员带来额外的负担，他们只需要使用标准的年表。

# LocalDate and LocalTime

在使用新API时，您可能会遇到的第一个类是LocalDate和LocalTime。它们是本地的，因为它们从观察者的上下文中表示日期和时间，比如桌子上的日历或墙上的时钟。还有一个名为LocalDateTime的复合类，它是LocalDate和LocalTime的配对。

时区，消除了不同观察者上下文的歧义，被放在一边;当不需要上下文时，应该使用这些本地类。桌面JavaFX应用程序可能就是这种情况之一。这些类甚至可以用来表示具有一致时区的分布式系统上的时间。

## 代码示例

## 创建实例

```java
LocalDateTime timePoint = LocalDateTime.now();     // The current date and time
LocalDate.of(2012, Month.DECEMBER, 12); // from values
LocalDate.ofEpochDay(150);  // middle of 1970
LocalTime.of(17, 18); // the train I took home today
LocalTime.parse("10:15:30"); // From a String
```

- 转 LocalDate

```java
LocalDate theDate = timePoint.toLocalDate();
Month month = timePoint.getMonth();
int day = timePoint.getDayOfMonth();
timePoint.getSecond();
```

- 更改对象值以执行计算

因为在新的API中所有的核心类都是不可变的，所以这些方法是用新的对象调用并返回的，而不是使用setter(参见清单3)。

```java
// Set the value, returning a new object
LocalDateTime thePast = timePoint.withDayOfMonth(
    10).withYear(2010);

/* You can use direct manipulation methods, 
    or pass a value and field pair */
LocalDateTime yetAnother = thePast.plusWeeks(
    3).plus(3, ChronoUnit.WEEKS);
```


- 调整器

新的API还有一个调整器的概念——一段代码，可以用来包装通用的处理逻辑。

您可以编写WithAdjuster(用于设置一个或多个字段)，或者编写PlusAdjuster(用于添加或减去某些字段)。值类还可以充当调节器，在这种情况下，它们会更新它们表示的字段的值。内置的调整器是由新的API定义的，但是如果您希望重用特定的业务逻辑，您可以编写自己的调整器。

```java
import static java.time.temporal.TemporalAdjusters.*;

LocalDateTime timePoint = ...
foo = timePoint.with(lastDayOfMonth());
bar = timePoint.with(previousOrSame(ChronoUnit.WEDNESDAY));

// Using value classes as adjusters
timePoint.with(LocalTime.now()); 
```

## 合并日期和时间-LocalDateTime

这个复合类名叫LocalDateTime，是LocalDate和LocalTime的合体。

它同时表示了日期和时间，但不带有时区信息，你可以直接创建，也可以通过合并日期和时间对象构造，如下所示。

```java
// 2018-11-17T21:31:50
LocalTime time = LocalTime.of(21, 31, 50);
LocalDate date = LocalDate.of(2018, 11, 17);

LocalDateTime dt1 = LocalDateTime.of(2018, Month.NOVEMBER, 17, 21, 31, 50);
LocalDateTime dt2 = LocalDateTime.of(date, time);
LocalDateTime dt3 = date.atTime(21, 11, 17);
LocalDateTime dt4 = date.atTime(time);
LocalDateTime dt5 = time.atDate(date);
```

注意，通过它们各自的atTime或者atDate方法，向LocalDate传递一个时间对象，或者向LocalTime传递一个日期对象的方式，你可以创建一个LocalDateTime对象。

你也可以使用toLocalDate或者toLocalTime方法，从LocalDateTime中提取LocalDate或者LocalTime组件：

```java
LocalDate date1 = dt1.toLocalDate();
LocalTime time1 = dt1.toLocalTime();
```

## 机器的日期和时间格式

作为人，我们习惯于以星期几、几号、几点、几分这样的方式理解日期和时间。毫无疑问，这种方式对于计算机而言并不容易理解。从计算机的角度来看，建模时间最自然的格式是表示一个持续时间段上某个点的单一大整型数。这也是新的java.time.Instant类对时间建模的方式，基本上它是以Unix元年时间（传统的设定为UTC时区1970年1月1日午夜时分）开始所经历的秒数进行计算。

你可以通过向静态工厂方法ofEpochSecond传递一个代表秒数的值创建一个该类的实例。静态工厂方法ofEpochSecond还有一个增强的重载版本，它接收第二个以纳秒为单位的参数值，对传入作为秒数的参数进行调整。重载的版本会调整纳秒参数，确保保存的纳秒分片在0到999 999999之间。

这意味着下面这些对ofEpochSecond工厂方法的调用会返回几乎同样的Instant对象：

```java
Instant.ofEpochSecond(3);
Instant.ofEpochSecond(3, 0);
// 2 秒之后再加上100万纳秒（1秒）
Instant.ofEpochSecond(2, 1_000_000_000);
// 4秒之前的100万纳秒（1秒）
Instant.ofEpochSecond(4, -1_000_000_000);
```

正如你已经在LocalDate及其他为便于阅读而设计的日期-时间类中所看到的那样，Instant类也支持静态工厂方法now，它能够帮你获取当前时刻的时间戳。

我们想要特别强调一点，Instant的设计初衷是为了便于机器使用。它包含的是由秒及纳秒所构成的数字。

所以，它无法处理那些我们非常容易理解的时间单位。比如下面这段语句：

```java
int day = Instant.now().get(ChronoField.DAY_OF_MONTH);
```

它会抛出下面这样的异常：

```
Exception in thread "main" java.time.temporal.UnsupportedTemporalTypeException: Unsupported field: DayOfMonth
```

但是你可以通过Duration和Period类使用Instant，接下来我们会对这部分内容进行介绍。

## Truncation

新的API通过提供表示日期、时间和带时间的日期的类型来支持不同的精确时间点，但是显然有比这更细粒度的精确概念。

truncatedTo方法支持这样的用例，它允许将值截断为字段。

```java
LocalTime truncatedTime = time.truncatedTo(ChronoUnit.SECONDS);
```

## 定义 Duration 或 Period

目前为止，你看到的所有类都实现了Temporal接口，Temporal接口定义了如何读取和操纵为时间建模的对象的值。

之前的介绍中，我们已经了解了创建Temporal实例的几种方法。很自然地你会想到，我们需要创建两个Temporal对象之间的duration。

Duration类的静态工厂方法between就是为这个目的而设计的。

你可以创建两个LocalTimes对象、两个LocalDateTimes对象，或者两个Instant对象之间的duration，

如下所示：

```java
LocalTime time1 = LocalTime.of(21, 50, 10);
LocalTime time2 = LocalTime.of(22, 50, 10);
LocalDateTime dateTime1 = LocalDateTime.of(2018, 11, 17, 21, 50, 10);
LocalDateTime dateTime2 = LocalDateTime.of(2018, 11, 17, 23, 50, 10);
Instant instant1 = Instant.ofEpochSecond(1000 * 60 * 2);
Instant instant2 = Instant.ofEpochSecond(1000 * 60 * 3);

Duration d1 = Duration.between(time1, time2);
Duration d2 = Duration.between(dateTime1, dateTime2);
Duration d3 = Duration.between(instant1, instant2);
// PT1H 相差1小时
System.out.println("d1:" + d1);
// PT2H 相差2小时
System.out.println("d2:" + d2);
// PT16H40M 相差16小时40分钟
System.out.println("d3:" + d3);
```

由于LocalDateTime和Instant是为不同的目的而设计的，一个是为了便于人阅读使用，另一个是为了便于机器处理，所以你不能将二者混用。

如果你试图在这两类对象之间创建duration，会触发一个DateTimeException异常。

此外，由于Duration类主要用于以秒和纳秒衡量时间的长短，你不能仅向between方法传递一个LocalDate对象做参数。

如果你需要以年、月或者日的方式对多个时间单位建模，可以使用Period类。

使用该类的工厂方法between，你可以使用得到两个LocalDate之间的时长，如下所示：

### Periods

Periods 表示“3个月1天”，这是时间轴上的距离。这与我们到目前为止看到的其他类不同，它们是时间轴上的点。

参见清单10所示。

- 清单10

```java
// 3 years, 2 months, 1 day
Period period = Period.of(3, 2, 1);

// You can modify the values of dates using periods
LocalDate newDate = oldDate.plus(period);
ZonedDateTime newDateTime = oldDateTime.minus(period);
// Components of a Period are represented by ChronoUnit values
assertEquals(1, period.get(ChronoUnit.DAYS)); 
```

### Durations

持续时间是用时间度量的时间轴上的距离，它实现了与周期类似的目的，但是精度不同，如清单11所示。

- 清单11

```java
// A duration of 3 seconds and 5 nanoseconds
Duration duration = Duration.ofSeconds(3, 5);
Duration oneDay = Duration.between(today, yesterday);
```

可以对Duration实例执行普通的加减和“with”操作，也可以使用Duration修改日期或时间的值。

截至目前，我们介绍的这些日期时间对象都是不可修改的，这是为了更好地支持函数式编程，确保线程安全，保持领域模式一致性而做出的重大设计决定。

当然，新的日期和时间API也提供了一些便利的方法来创建这些对象的可变版本。比如，你可能希望在已有的LocalDate实例上增加3天。

除此之外，我们还会介绍如何依据指定的模式，比如dd/MM/yyyy，创建日期-时间格式器，以及如何使用这种格式器解析和输出日期。

# 操纵、解析和格式化日期

如果你已经有一个LocalDate对象，想要创建它的一个修改版，最直接也最简单的方法是使用withAttribute方法。

withAttribute方法会创建对象的一个副本，并按照需要修改它的属性。

注意，下面的这段代码中所有的方法都返回一个修改了属性的对象。

它们都不会修改原来的对象！

```java
// 2018-11-17
LocalDate date1 = LocalDate.of(2018, 11, 17);
// 2019-11-17
LocalDate date2 = date1.withYear(2019);
// 2019-11-25
LocalDate date3 = date2.withDayOfMonth(25);
// 2019-09-25
LocalDate date4 = date3.with(ChronoField.MONTH_OF_YEAR, 9);
```

它们都声明于Temporal接口，所有的日期和时间API类都实现这两个方法，它们定义了单点的时间，比如LocalDate、LocalTime、LocalDateTime以及Instant。

更确切地说，使用get和with方法，我们可以将Temporal对象值的读取和修改区分开。

如果Temporal对象不支持请求访问的字段，它会抛出一个UnsupportedTemporalTypeException异常，比如试图访问Instant对象的ChronoField.MONTH_OF_YEAR字段，或者LocalDate对象的ChronoField.NANO_OF_SECOND字段时都会抛出这样的异常。

它甚至能以声明的方式操纵LocalDate对象。比如，你可以像下面这段代码那样加上或者减去一段时间。

```java
// 2018-11-17
LocalDate date1 = LocalDate.of(2018, 11, 17);
// 2018-11-24
LocalDate date2 = date1.plusWeeks(1);
// 2015-11-24
LocalDate date3 = date2.minusYears(3);
// 2016-05-24
LocalDate date4 = date3.plus(6, ChronoUnit.MONTHS);
```

与我们刚才介绍的get和with方法类似最后一行使用的plus方法也是通用方法，它和minus方法都声明于Temporal接口中。

通过这些方法，对TemporalUnit对象加上或者减去一个数字，我们能非常方便地将Temporal对象前溯或者回滚至某个时间段，通过ChronoUnit枚举我们可以非常方便地实现TemporalUnit接口。

大概你已经猜到，像LocalDate、LocalTime、LocalDateTime以及Instant这样表示时

间点的日期时间类提供了大量通用的方法，我们目前所使用的只有一小部分，有兴趣的可以去看官网文档。

## 使用 TemporalAdjuster

截至目前，你所看到的所有日期操作都是相对比较直接的。

有的时候，你需要进行一些更加复杂的操作，比如，将日期调整到下个周日、下个工作日，或者是本月的最后一天。

这时，你可以使用重载版本的with方法，向其传递一个提供了更多定制化选择的TemporalAdjuster对象，更加灵活地处理日期。

对于最常见的用例， 日期和时间API已经提供了大量预定义的TemporalAdjuster。你可以通过TemporalAdjuster类的静态工厂方法访问它们，如下所示。

```java
// 2018-11-17
LocalDate date1 = LocalDate.of(2018, 11, 17);
// 2018-11-19
LocalDate date2 = date1.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
// 2018-11-30
LocalDate date3 = date2.with(TemporalAdjusters.lastDayOfMonth());
```

正如我们看到的，使用TemporalAdjuster我们可以进行更加复杂的日期操作，而且这些方法的名称也非常直观，方法名基本就是问题陈述。

此外，即使你没有找到符合你要求的预定义的TemporalAdjuster，创建你自己的TemporalAdjuster也并非难事。

实际上，TemporalAdjuster接口只声明了单一的一个方法（这使得它成为了一个函数式接口），定义如下。

```java
@FunctionalInterface
public interface TemporalAdjuster {
    Temporal adjustInto(Temporal temporal);
}
```

这意味着TemporalAdjuster接口的实现需要定义如何将一个Temporal对象转换为另一个Temporal对象。

你可以把它看成一个UnaryOperator。

你可能希望对你的日期时间对象进行的另外一个通用操作是，依据你的业务领域以不同的格式打印输出这些日期和时间对象。

类似地，你可能也需要将那些格式的字符串转换为实际的日期对象。接下来的一节，我们会演示新的日期和时间API提供那些机制是如何完成这些任务的。

## 打印输出及解析日期-时间对象

处理日期和时间对象时，格式化以及解析日期时间对象是另一个非常重要的功能。

新的java.time.format包就是特别为这个目的而设计的。

这个包中，最重要的类是 `DateTimeFormatter`。

创建格式器最简单的方法是通过它的静态工厂方法以及常量。

像BASIC_ISO_DATE和ISO_LOCAL_DATE 这样的常量是DateTimeFormatter 类的预定义实例。

所有的DateTimeFormatter实例都能用于以一定的格式创建代表特定日期或时间的字符串。

比如，下面的这个例子中，我们使用了两个不同的格式器生成了字符串：

```java
LocalDate date1 = LocalDate.of(2018, 11, 17);
// 20181117
String s1 = date1.format(DateTimeFormatter.BASIC_ISO_DATE);
// 2018-11-17
String s2 = date1.format(DateTimeFormatter.ISO_LOCAL_DATE);
```

你也可以通过解析代表日期或时间的字符串重新创建该日期对象。

所有的日期和时间API都提供了表示时间点或者时间段的工厂方法，你可以使用工厂方法parse达到重创该日期对象的目的：

```java
LocalDate date2 = LocalDate.parse("20181117", DateTimeFormatter.BASIC_ISO_DATE);
LocalDate date3 = LocalDate.parse("2018-11-17", DateTimeFormatter.ISO_LOCAL_DATE);
```

和老的java.util.DateFormat相比较，所有的DateTimeFormatter实例都是线程安全的。

所以，你能够以单例模式创建格式器实例，就像DateTimeFormatter所定义的那些常量，并能在多个线程间共享这些实例。

DateTimeFormatter类还支持一个静态工厂方法，它可以按照某个特定的模式创建格式器，代码清单如下。

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
// 17/11/2018
String formattedDate = date1.format(formatter);
LocalDate date4 = LocalDate.parse(formattedDate, formatter);
```

这段代码中，LocalDate的formate方法使用指定的模式生成了一个代表该日期的字符串。

紧接着，静态的parse方法使用同样的格式器解析了刚才生成的字符串，并重建了该日期对象。

ofPattern方法也提供了一个重载的版本，使用它你可以创建某个Locale的格式器，代码清单如下所示。

```java
DateTimeFormatter italianFormatter = DateTimeFormatter.ofPattern("dd. MMMM yyyy", Locale.ITALIAN);
LocalDate date5 = LocalDate.of(2018, 11, 16);
// 16. novembre 2018
String formattedDate2 = date5.format(italianFormatter);
// 2018-11-16
LocalDate date6 = LocalDate.parse(formattedDate2, italianFormatter);
```

最后，如果你还需要更加细粒度的控制，DateTimeFormatterBuilder类还提供了更复杂的格式器，你可以选择恰当的方法，一步一步地构造自己的格式器。

另外，它还提供了非常强大的解析功能，比如区分大小写的解析、柔性解析（允许解析器使用启发式的机制去解析输入，不精确地匹配指定的模式）、填充， 以及在格式器中指定可选节。

比如， 你可以通过DateTimeFormatterBuilder自己编程实现我们在上面代码中使用的italianFormatter，代码清单如下。

```java
DateTimeFormatter italianFormatter = new DateTimeFormatterBuilder()
                .appendText(ChronoField.DAY_OF_MONTH)
                .appendLiteral(". ")
                .appendText(ChronoField.MONTH_OF_YEAR)
                .appendLiteral(" ")
                .appendText(ChronoField.YEAR)
                .parseCaseInsensitive()
                .toFormatter(Locale.ITALIAN);

LocalDate now = LocalDate.now();
// 17. novembre 2018
String s1 = now.format(italianFormatter);
```

目前为止，你已经学习了如何创建、操纵、格式化以及解析时间点和时间段，但是你还不了解如何处理日期和时间之间的微妙关系。

比如，你可能需要处理不同的时区，或者由于不同的历法系统带来的差异。

接下来的一节，我们会探究如何使用新的日期和时间API解决这些问题。

# Time Zones

我们以前看到的本地类抽象了时区引入的复杂性。

时区是一组规则，对应于标准时间相同的区域。大约有40个。时区是由协调世界时(UTC)的偏移量定义的。它们大致同步移动，但有一个特定的差异。

时区可以用两个标识符来表示:缩写为“PLT”，较长为“Asia/Karachi”。在设计应用程序时，应该考虑哪些场景适合使用时区，以及什么时候偏移量合适。

ZoneId是一个区域的标识符(参见清单6)，每个ZoneId对应于一些规则，这些规则定义了该位置的时区。

在设计软件时，如果您考虑使用“PLT”或“Asia/Karachi”等字符串，那么您应该使用这个域类。一个示例用例将存储用户对其时区的首选项。

- Listing 6

```java
// You can specify the zone id when creating a zoned date time
ZoneId id = ZoneId.of("Europe/Paris");
ZonedDateTime zoned = ZonedDateTime.of(dateTime, id);
assertEquals(id, ZoneId.from(zoned));
```

## 区域偏移

区域偏移是表示格林尼治/UTC和时区之间的差异的时间周期。这可以在特定的时间点为特定的ZoneId解决，如清单7所示。

- 清单7

```java
ZoneOffset offset = ZoneOffset.of("+2:00");
```

# Time Zone Classes 

## ZonedDateTime

ZonedDateTime是一个具有完全限定时区的日期和时间(参见清单8)，它可以在任何时间点解决偏移问题。

经验法则是，如果您想在不依赖于特定服务器上下文的情况下表示日期和时间，那么应该使用ZonedDateTime。

- 清单8

```java
ZonedDateTime.parse("2007-12-03T10:15:30+01:00[Europe/Paris]");
```

## OffsetDateTime

OffsetDateTime是一个日期和时间，有一个已解决的偏移量。

这对于将数据序列化到数据库中非常有用，如果您的服务器位于不同的时区，那么还应该将其用作记录时间戳的序列化格式。

## OffsetTime

OffsetTime是一个具有解析偏移量的时间，如清单9所示。

```java
OffsetTime time = OffsetTime.now();
// changes offset, while keeping the same point on the timeline
OffsetTime sameTimeDifferentOffset = time.withOffsetSameInstant(
    offset);
// changes the offset, and updates the point on the timeline
OffsetTime changeTimeWithNewOffset = time.withOffsetSameLocal(
    offset);
// Can also create new object with altered fields as before
changeTimeWithNewOffset
 .withHour(3)
 .plusSeconds(2);
```

# Chronologies

为了支持使用非iso日历系统的开发人员的需求，Java SE 8引入了年表的概念，它表示日历系统，并充当日历系统中时间点的工厂。
还有一些接口对应于核心时间点类，但是由参数化

```
Chronology
ChronoLocalDate
ChronoLocalDateTime
ChronoZonedDateTime
```

这些类纯粹是为那些需要考虑本地日历系统的高度国际化应用程序的开发人员提供的，如果没有这些要求，开发人员就不应该使用它们。

有些日历系统甚至没有一个月或一周的概念，需要通过非常通用的字段API进行计算。

## 利用和UTC/格林尼治时间的固定偏差计算时区

另一种比较通用的表达时区的方式是利用当前时区和UTC/格林尼治的固定偏差。

比如，基于这个理论，你可以说“纽约落后于伦敦5小时”。这种情况下，你可以使用ZoneOffset类，它是ZoneId的一个子类，表示的是当前时间和伦敦格林尼治子午线时间的差异：

```java
ZoneOffset newYorkOffset = ZoneOffset.of("-05:00");
```

“-05:00”的偏差实际上对应的是美国东部标准时间。

注意，使用这种方式定义的ZoneOffset并未考虑任何日光时的影响，所以在大多数情况下，不推荐使用。

由于ZoneOffset也是ZoneId，所以你可以像上面的代码那样使用它。

你甚至还可以创建这样的OffsetDateTime，它使用ISO-8601的历法系统，以相对于UTC/格林尼治时间的偏差方式表示日期时间。

```java
LocalDateTime dateTime = LocalDateTime.of(2018, 11, 17, 18, 45);
OffsetDateTime offsetDateTime = OffsetDateTime.of(dateTime, newYorkOffset);
```

# 常用代码片段

## 判断连个日期相差几天在指定范围内

```java
/**
 * 断言时间在指定的区间内.
 * 1. 参数符合规范
 * 2. 0 <= endDate-startDate <= diffDays
 * @param startDateStr 开始日期 yyyyMMdd
 * @param endDateStr 结束日期 yyyyMMdd
 * @param maxDiffDays 最大相差几天，大于等于0
 */
public static void assertDateInRange(final String startDateStr, final String endDateStr, final int maxDiffDays) {
    final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyyMMdd");
    LocalDate localDateStart = LocalDate.parse(startDateStr, dateFormat);
    LocalDate localDateEnd = LocalDate.parse(endDateStr, dateFormat);
    Period period = Period.between(localDateStart, localDateEnd);
    int days = period.getDays();
    if(days < 0) {
        final String error = String.format("开始日期：%s 必须小于结束日期：%s", startDateStr, endDateStr);
        throw new RuntimeException(error);
    }
    if(days > maxDiffDays) {
        final String error = String.format("开始日期：%s 与结束日期：%s 超过范围：%d 天", startDateStr, endDateStr, maxDiffDays);
        throw new RuntimeException(error);
    }
}
```

## Period.between 的坑

近期使用才发现，Period.between() 计算的实际上当月的差。

如果隔月，就返回0 ，真是大坑

想获取真正的日、月间隔：

```java
long days = ChronoUnit.DAYS.between(localDateStart, localDateEnd);
long monthDiff = ChronoUnit.MONTHS.between(localDateStart, localDateEnd);
```

# 参考资料

- oracle

https://www.oracle.com/technetwork/articles/java/jf14-date-time-2125367.html

《java8 实战》

* any list
{:toc}