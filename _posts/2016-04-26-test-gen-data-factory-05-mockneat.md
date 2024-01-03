---
layout: post
title:  test data factory-05-测试造数平台 MockNeat - the modern faker lib.
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)


# Mockneat

Mockneat 是一个用 Java 编写的任意数据生成器开源库。

它提供了一个简单但功能强大（流畅）的 API，使开发人员能够以编程方式创建 JSON、XML、CSV 和 SQL 数据。

它还可以作为一个强大的随机替代工具或模拟库。

官方文档：www.mockneat.com

官方教程：www.mockneat.com

如果你想要使用 mockneat 来模拟 REST API，请查看我的另一个项目：serverneat。

## Installing
>= 0.4.4
Maven:

```xml
<dependency>
  <groupId>net.andreinc</groupId>
  <artifactId>mockneat</artifactId>
  <version>0.4.8</version>
</dependency>
```

Gradle:

```
implementation 'net.andreinc:mockneat:0.4.8'
```

<= 0.4.2
Maven:

```xml
<repositories>
    <repository>
        <id>jcenter</id>
        <url>https://jcenter.bintray.com/</url>
    </repository>
</repositories>
<dependencies>
    <dependency>
        <groupId>net.andreinc.mockneat</groupId>
        <artifactId>mockneat</artifactId>
        <version>0.4.2</version>
    </dependency>
</dependencies>
```

Gradle:

```
repositories {
  jcenter()
}
dependencies {
  compile 'net.andreinc.mockneat:mockneat:0.4.2'
}
```

# 例子

## Example - A random dice roll

```java
List<String> somePeople = names().full().list(10).get();

fmt("#{person} rolled: #{roll1} #{roll2}")
            .param("person", seq(somePeople))
            .param("roll1", ints().rangeClosed(1, 6))
            .param("roll2", ints().rangeClosed(1, 6))
            .accumulate(10, "\n")
            .consume(System.out::println);

System.out.println("\nWho wins ?\n");
```

(possible) Output:

```
Sal Clouden rolled: 3 3
Cinthia Myrum rolled: 1 5
Wyatt Imber rolled: 5 1
Fidel Quist rolled: 2 2
Brandon Scrape rolled: 6 4
Arlene Cesare rolled: 6 4
Brandie Sumsion rolled: 3 4
Norris Tunby rolled: 3 5
Kareem Willoughby rolled: 1 5
Zoraida Finnerty rolled: 1 6

Who wins ?
```

## Example - A simple CSV

```java
csvs()
  .column(names().first())
  .column(names().last())
  .column(emails().domain("mockneat.com"))
  .column(urls().domains(POPULAR))
  .column(ipv4s().types(CLASS_B, CLASS_C_NONPRIVATE))
  .column(creditCards().types(AMERICAN_EXPRESS, VISA_16))
  .column(localDates().thisYear())
  .separator(" ; ")
  .accumulate(25, "\n")
  .consume(System.out::println);
```
System.out.println("First Name, Last Name, Email, Site, IP, Credit Card, Date");


(possible) Output:

```
Lorrie ; Urquilla ; slycriselda@mockneat.com ; http://www.sugaredherlinda.com ; 172.150.99.65 ; 4991053014393849 ; 2019-05-25
Tabitha ; Copsey ; headsoutdanced@mockneat.com ; http://www.arightcarnify.io ; 166.192.196.15 ; 4143903215740668 ; 2019-07-13
Laurine ; Patrylak ; doggonetews@mockneat.com ; http://www.ninthbanc.gov ; 187.28.250.76 ; 4450754596171263 ; 2019-09-10
Starla ; Peiper ; typicsteres@mockneat.com ; http://www.eathlessen.edu ; 202.189.115.252 ; 4470988734574428 ; 2019-02-18
Lakiesha ; Zevenbergen ; stalegaye@mockneat.com ; http://www.unbendingeyes.edu ; 204.112.195.47 ; 4040555724781858 ; 2019-11-12

... and so on
```

# 参考资料

https://github.com/nomemory/mockneat

* any list
{:toc}