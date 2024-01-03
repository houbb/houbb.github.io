---
layout: post
title:  test data factory-02-测试造数平台 java-faker
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)


# faker

这个库是 Ruby 的 faker gem（以及 Perl 的 Data::Faker 库）的一个移植，用于生成虚假数据。

在开发新项目且需要一些漂亮的演示数据时，这是非常有用的。

使用方法
在 pom.xml 中，在 `<dependencies> ... </dependencies>` 之间添加以下 XML 代码块：

```xml
<dependency>
    <groupId>com.github.javafaker</groupId>
    <artifactId>javafaker</artifactId>
    <version>1.0.2</version>
</dependency>
```

对于 Gradle 用户，在 build.gradle 文件中添加以下内容：

```groovy
dependencies {
    implementation 'com.github.javafaker:javafaker:1.0.2'
}
```

在你的 Java 代码中：

```java
Faker faker = new Faker();

String name = faker.name().fullName(); // Miss Samanta Schmidt
String firstName = faker.name().firstName(); // Emory
String lastName = faker.name().lastName(); // Barton

String streetAddress = faker.address().streetAddress(); // 60018 Sawayn Brooks Suite 449
```

这是一个使用该库的演示 Web 应用程序。

Javadoc：

[http://dius.github.io/java-faker/apidocs/index.html](http://dius.github.io/java-faker/apidocs/index.html)

# Fakers
Address
Ancient
Animal
App
Aqua Teen Hunger Force
Artist
Avatar
Back To The Future
Aviation
Basketball
Beer
Bojack Horseman
Book
Bool
Business
ChuckNorris
Cat
Code
Coin
Color
Commerce
Company
Crypto
DateAndTime
Demographic
Disease
Dog
DragonBall
Dune
Educator
Esports
EnglandFootBall
File
Finance
Food
Friends
FunnyName
GameOfThrones
Gender
Hacker
HarryPotter
Hipster
HitchhikersGuideToTheGalaxy
Hobbit
HowIMetYourMother
IdNumber
Internet
Job
Kaamelott
LeagueOfLegends
Lebowski
LordOfTheRings
Lorem
Matz
Music
Name
Nation
Number
Options
Overwatch
PhoneNumber
Photography
Pokemon
Princess Bride
Relationship Terms
RickAndMorty
Robin
RockBand
Shakespeare
Sip
SlackEmoji
Space
StarCraft
StarTrek
Stock
Superhero
Team
TwinPeaks
University
Weather
Witcher
Yoda
Zelda

## Usage with Locales

```java
Faker faker = new Faker(new Locale("YOUR_LOCALE"));
```

### Supported Locales

bg
ca
ca-CAT
da-DK
de
de-AT
de-CH
en
en-AU
en-au-ocker
en-BORK
en-CA
en-GB
en-IND
en-MS
en-NEP
en-NG
en-NZ
en-PAK
en-SG
en-UG
en-US
en-ZA
es
es-MX
fa
fi-FI
fr
he
hu
in-ID
it
ja
ko
nb-NO
nl
pl
pt
pt-BR
ru
sk
sv
sv-SE
tr
uk
vi
zh-CN
zh-TW

# chat

## 详细介绍一下 java-faker 

`java-faker` 是一个用于生成虚假（假的）数据的 Java 库。

它提供了一种简单的方式来生成各种类型的虚构数据，例如姓名、地址、电子邮件地址、电话号码、日期等。

该库的目标是帮助开发者在开发和测试过程中使用真实的、但不包含敏感信息的数据。

以下是 `java-faker` 的一些主要特点和使用方法：

1. **生成多种类型的数据：** `java-faker` 可以生成各种类型的虚构数据，包括但不限于姓名、地址、城市、电子邮件地址、公司名、日期、颜色、Lorem Ipsum 文本等。

2. **支持多国语言：** 它支持多种语言，可以生成相应语言环境的数据，如英语、法语、德语等。

3. **易于使用：** 使用 `java-faker` 只需要几行简单的代码。它提供了一个 `Faker` 类，您可以用它来生成各种不同类型的数据。

下面是一个简单的示例，展示了如何使用 `java-faker` 生成姓名和地址：

```java
import com.github.javafaker.Faker;

public class FakerExample {

    public static void main(String[] args) {
        // 创建 Faker 实例
        Faker faker = new Faker();

        // 生成虚假姓名
        String name = faker.name().fullName();
        System.out.println("Name: " + name);

        // 生成虚假地址
        String address = faker.address().fullAddress();
        System.out.println("Address: " + address);
    }
}
```

在上述示例中，`Faker` 实例用于生成虚构数据，`faker.name().fullName()` 生成虚假姓名，`faker.address().fullAddress()` 生成虚假地址。

您可以通过 Maven 或 Gradle 将 `java-faker` 引入您的项目。如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>com.github.javafaker</groupId>
    <artifactId>javafaker</artifactId>
    <version>1.0.2</version>
</dependency>
```

这是一个简要介绍 `java-faker` 的概述。如果您想要更详细的信息，可以查阅 `java-faker` 的文档或源代码。

## 介绍一下 java-faker 的核心功能

`java-faker` 是一个用于生成虚假数据的 Java 库，它提供了丰富的功能来模拟各种类型的数据。

以下是 `java-faker` 的一些核心功能：

1. **姓名生成：** `java-faker` 可以生成各种虚构的姓名，包括全名、名字、姓氏、前缀（如"Mr."）、后缀（如"Jr."）等。

    ```java
    String fullName = faker.name().fullName();
    String firstName = faker.name().firstName();
    String lastName = faker.name().lastName();
    String prefix = faker.name().prefix();
    String suffix = faker.name().suffix();
    ```

2. **地址生成：** 可以生成虚构的地址信息，包括完整地址、街道地址、城市、州、国家、邮政编码等。

    ```java
    String fullAddress = faker.address().fullAddress();
    String streetAddress = faker.address().streetAddress();
    String city = faker.address().city();
    String state = faker.address().state();
    String country = faker.address().country();
    String zipCode = faker.address().zipCode();
    ```

3. **公司信息：** 生成虚构的公司相关信息，如公司名称、行业、职位等。

    ```java
    String companyName = faker.company().name();
    String industry = faker.company().industry();
    String jobTitle = faker.company().profession();
    ```

4. **日期和时间：** 可以生成虚构的日期和时间信息，包括当前日期、过去日期、将来日期、随机时间等。

    ```java
    Date pastDate = faker.date().past(365, TimeUnit.DAYS);
    Date futureDate = faker.date().future(365, TimeUnit.DAYS);
    Date randomDate = faker.date().birthday();
    ```

5. **电子邮件和电话号码：** 生成虚构的电子邮件地址和电话号码。

    ```java
    String email = faker.internet().emailAddress();
    String phoneNumber = faker.phoneNumber().phoneNumber();
    ```

6. **Lorem Ipsum 文本：** 生成虚构的文本，常用于填充占位符或模拟文档。

    ```java
    String loremText = faker.lorem().sentence();
    ```

7. **随机数生成：** 生成各种类型的随机数，如整数、双精度浮点数、布尔值等。

    ```java
    int randomInt = faker.number().numberBetween(1, 100);
    double randomDouble = faker.number().randomDouble(2, 1, 100);
    boolean randomBoolean = faker.bool().bool();
    ```

这些只是 `java-faker` 提供的一小部分功能。您可以根据自己的需求使用更多的方法来生成各种虚构数据。

这个库的灵活性和丰富的功能使得在开发和测试中使用真实但不包含敏感信息的数据变得更加容易。

## java-faker 随机生成的原理？

`java-faker` 的随机生成原理基于 Java 的 `Random` 类，它使用伪随机数生成器来创建随机数据。

伪随机数生成器实际上是一个确定性算法，通过一个种子（seed）初始化，然后根据这个种子生成看似随机的数列。

在 `java-faker` 中，您可以通过 `Faker` 对象获取各种随机数据。

这个对象包含了多个内部的 `Random` 实例，以确保不同的数据类型之间不会相互影响。

以下是简单的例子，演示了 `java-faker` 的随机生成原理：

```java
Faker faker = new Faker();

// 随机生成整数
int randomInt = faker.number().randomDigit();

// 随机生成布尔值
boolean randomBoolean = faker.bool().bool();

// 随机生成姓名
String fullName = faker.name().fullName();
```

在这个例子中，每次调用 `faker.number().randomDigit()` 或 `faker.bool().bool()` 都会使用 `Random` 类生成一个新的随机数。

同样，对于姓名的生成，`faker.name().fullName()` 也是通过 `Random` 实现的，以确保每次生成的姓名是随机的。

在实际应用中，如果需要更加可控的随机性，您可以通过为 `Faker` 对象指定相同的种子（seed）来确保生成相同的随机数据。例如：

```java
Faker fixedFaker = new Faker(new Random(123)); // 使用种子 123
```

这样，通过 `fixedFaker` 对象生成的随机数据将是可预测的，因为它们都基于相同的种子生成。




# 参考资料

https://dius.github.io/java-faker/

* any list
{:toc}