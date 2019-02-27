---
layout: post
title: Java8-07-ChronoUnit 日期枚举类
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, sh]
published: true
---

# ChronoUnit

一组标准的日期时间单位。

这组单元提供基于单元的访问来操纵日期，时间或日期时间。 可以通过实现TemporalUnit来扩展标准单元集。

这些单元适用于多个日历系统。 

例如，大多数非ISO日历系统定义年，月和日的单位，只是略有不同的规则。 每个单元的文档说明了它的运作方式。

这是一个最终的、不可变的和线程安全的枚举。

# 入门例子

## plus() 测试

```java
@Test
public void testChromoUnitsPlus() {
    //Get the current date
    LocalDate today = LocalDate.now();
    System.out.println("Current date: " + today);
    //add 1 week to the current date
    LocalDate nextWeek = today.plus(1, ChronoUnit.WEEKS);
    System.out.println("Next week: " + nextWeek);
    //add 1 month to the current date
    LocalDate nextMonth = today.plus(1, ChronoUnit.MONTHS);
    System.out.println("Next month: " + nextMonth);
    //add 1 year to the current date
    LocalDate nextYear = today.plus(1, ChronoUnit.YEARS);
    System.out.println("Next year: " + nextYear);
    //add 10 years to the current date
    LocalDate nextDecade = today.plus(1, ChronoUnit.DECADES);
    System.out.println("Date after ten year: " + nextDecade);
}
```

- 日志信息

```
Current date: 2019-02-27
Next week: 2019-03-06
Next month: 2019-03-27
Next year: 2020-02-27
Date after ten year: 2029-02-27
```

## between

```java
@Test
public void testChromoUnitsBetween() {
    //Get the current date
    LocalDate today = LocalDate.now();
    LocalDate nextWeek = today.plus(1, ChronoUnit.WEEKS);
    long diff = ChronoUnit.WEEKS.between(today, nextWeek);
    Assert.assertEquals(1, diff);
}
```

# 参考资料

[ChronoUnit](https://docs.oracle.com/javase/8/docs/api/java/time/temporal/ChronoUnit.html)

http://www.sxt.cn/Java8-tutorial/java8_chronounits.html

https://www.cnblogs.com/shihaiming/p/6371214.html

* any list
{:toc}