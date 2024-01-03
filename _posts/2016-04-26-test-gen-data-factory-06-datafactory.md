---
layout: post
title:  test data factory-06-测试造数平台 datafactory Java library for generating test data
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)


# datafactory

## 使用 DataFactory 生成测试数据

DataFactory 是我刚刚发布的一个项目，它允许您轻松生成测试数据。它主要是为了通过为名称、地址、电子邮件地址、电话号码、文本和日期提供值，从而为开发或测试环境中的数据库填充而编写的。

要将 DataFactory 添加到您的 Maven 项目中，只需将其作为依赖项添加到您的 pom.xml 文件中。

```xml
<dependency>
    <groupId>org.fluttercode.datafactory</groupId>
    <artifactId>datafactory</artifactId>
    <version>0.8</version>
    <type>jar</type>
</dependency>
```

## 生成测试数据

现在，您可以创建 DataFactory 类的实例并创建数据：

```java
public class Main {

    public static void main(String[] args) {
        DataFactory df = new DataFactory();
        for (int i = 0; i < 100; i++) {          
            String name = df.getFirstName() + " "+ df.getLastName();
            System.out.println(name);
        }
    }
}
```

生成的输出是：

```
Lindsey Craft
Erica Larsen
Ryan Levine
Erika Smith
Brooklyn Sloan
Karen Mayer
Eddie O'neill
Nancy Stevens
```

DataFactory 类可以生成不同类型的值，从地址到随机文本到随机日期，再到在固定时间段内的日期。可以使用以下代码创建地址和商业名称：

```java
DataFactory df = new DataFactory();
for (int i = 0; i < 100; i++) {          
    String address = df.getAddress() + "," + df.getCity() + "," + df.getNumberText(5);
    String business = df.getBusinessName();
    System.out.println(business + " located at " + address);
}
```

生成的结果可能类似于：

```
Uvalda Signs located at 1383 Beam Way,Lyons,19316
Alma Accounting located at 1386 Countiss St,Nashville,14967
Fort Stewart Engineering located at 1753 Bethesda Rd,Springfield,26306
Sugar Hill Textiles located at 1141 Loudon Circle,Cordele,83937
Albany Engineering located at 1185 Grieves Avenue,Sugar Hill,36753
Poulan Insurance located at 816 Cohen Blvd,Lake City,74839
Crescent Services located at 1085 Cloveridge Boulevard,Bemiss,08769
```

有许多功能可以创建日期，首先是创建通常在给定合理日期范围内的随机日期。

```java
DataFactory df = new DataFactory();
Date minDate = df.getDate(2000, 1, 1);
Date maxDate = new Date();
for (int i = 0; i < 10; i++) {
    Date start = df.getDateBetween(minDate, maxDate);
    System.out.println("Date = " + start);
}
```

这会生成在2000年1月1日和当前日期之间的随机日期列表。通常，随机日期可能受到其他日期的限制，例如，您不能在开始日期之前发生结束日期。在这种情况下，您将开始日期作为最小日期值插入：

```java
DataFactory df = new DataFactory();
Date minDate = df.getDate(2000, 1, 1);
Date maxDate = new Date();
     
for (int i = 0; i < 10; i++) {
    Date start = df.getDateBetween(minDate, maxDate);
    Date end = df.getDateBetween(start, maxDate);
    System.out.println("Date range = " + dateToString(start) + " to " + dateToString(end));
}
```

结果是一个日期列表，其中第二个日期总是晚于第一个：

```
Date range = 04/29/2005 to 07/16/2006
Date range = 08/07/2009 to 01/19/2010
Date range = 09/22/2000 to 12/15/2003
Date range = 07/31/2004 to 03/24/2009
Date range = 06/27/2003 to 01/10/2007
Date range = 07/10/2003 to 04/02/2008
Date range = 01/04/2003 to 01/12/2005
```

在许多情况下，您可能希望您的结束日期只在开始日期的前后几天。例如，技术支持工单或酒店住宿不会持续数年。为此，您可以指定您要生成结果的基本日期之后的天数。在这种情况下，我们使结束日期在开始日期的基础上不超过10天：

```java
for (int i = 0; i < 10; i++) {
    Date start = df.getDateBetween(minDate, maxDate);
    Date end = df.getDate(start, 0, 10); // 将结束日期设置为开始日期的前后10天
    System.out.println("Date range = " + dateToString(start) + " to " + dateToString(end));
}
```

结果是：

```
Date range = 04/29/2005 to 04/30/2005
Date range = 12/29/2003 to 12/30/2003
Date range = 06/25/2003 to 07/03/2003
Date range = 10/19/2009 to 10/19/2009
```

您还可以指定负的最小天数值，它可能返回一个在基准日期之前的日期，或者指定正的最小日期值以获得较晚的日期。

这里有一个使用不同日期规则生成一些复杂测试数据的更复杂的示例。

```java
for (int i = 0; i < 10; i++) {
    //generate an order date
    Date orderDate = df.getDateBetween(minDate, maxDate);
 
    //estimate delivery 4-10 days after ordering
    Date estimatedDeliveryDate = df.getDate(orderDate, 4, 10);
 
    //deliver between 2 days prior and 3 days after delivery estimate
    Date actualDeliveryDate = df.getDate(estimatedDeliveryDate, -2, 3); 
 
    String msg =  "Ordered on "+dateToString(orderDate) +
        " deliver by = "+dateToString(estimatedDeliveryDate)+
        " delivered on " + dateToString(actualDeliveryDate);                    
 
    if (estimatedDeliveryDate.before(actualDeliveryDate)) {
        msg = msg + " - LATE";
    }
    if (estimatedDeliveryDate.after(actualDeliveryDate)) {
        msg = msg + " - EARLY";
    }
    System.out.println(msg);
}
```

在这里，我们计算一个订单日期，并创建一个至少4天但不超过10天的交付日期，然后我们创建了一个实际交付日期，它在预期交付日期之前2天和之后3天之间。请注意我们如何选择日期，预计的交付日期至少在订单日期之后的4天，实际的交付日期最多只能在预计日期之前的2天。这意味着实际的交付日期总是在订单日期之后至少2天，我们不会得到在物品订购之前的交付日期值。此代码生成以下值：

```
Ordered on 04/29/2005 deliver by = 05/06/2005 delivered on 05/06/2005
Ordered on 08/07/2009 deliver by = 08/13/2009 delivered on 08/13/2009
Ordered on 09/22/2000 deliver by = 09/27/2000 delivered on 09/25/2000 - EARLY
Ordered on 07/31/2004 deliver by = 08/07/2004 delivered on 08/09/2004 - LATE
Ordered on 06/27/2003 deliver by = 07/04/2003 delivered on 07/04/2003
Ordered on 07/10/2003 deliver by = 07/19/2003 delivered on 07/18/2003 - EARLY
Ordered on 01/04/2003 deliver by = 01/08/2003 delivered on 01/08/2003
```

## 自定义随机值

如果有一组对你的应用程序非常特定的值，你可能希望从中生成数据，你可以使用 DataFactory 类的方法返回具有随机默认值选项的值。

```java
public static void main(String[] args) {
    DataFactory df = new DataFactory();

    //favorite animal
    String[] values = {"Cat","Dog","Goat","Horse","Sheep"};
    for (int i = 0; i < 100; i++) {          
        System.out.println(df.getItem(values, 80, "None"));
    }   
}
```

该示例使用动物数组，并返回一个值，有 20% 的几率是默认值 "None"，生成如下输出：

```
Sheep
None
Dog
Horse
```

##文本数据

随机文本数据有两种形式，绝对随机数据和由单词组成的文本数据。你可以使用以下方法生成其中之一：

```java
DataFactory df = new DataFactory();
System.out.println(df.getRandomText(20, 25));
System.out.println(df.getRandomChars(20));
System.out.println(df.getRandomWord(4, 10))
```

以上代码产生如下输出：

```
badly numbers good hot I
ywyypgqorighfawpftjq
demanded
```

这三种方法都可以传递单个长度，返回一个固定长度的字符串，或者传递最小/最大长度，生成一个长度在最小/最大之间的随机字符串。对于单词的单一方法，如果字典中没有合适长度的单词，则使用随机字符生成一个单词。

改变生成的测试数据值所用的数据 来自可以替换为其他版本的类。例如，通过为 DataFactory 实例提供实现 NameDataValues 接口的对象，可以更改名称值。下面是一个简单的类，实现了该接口以返回斯堪的纳维亚语的名字，并委托给默认实现以返回所有其他值。

```java
public class ScandinavianNames implements NameDataValues {

    //first name values to use
    String[] firstNames = {"Anders","Freydís","Gerlach","Sigdis"};
 
    //delegate to the default implementation for the other values
    NameDataValues defaults = new DefaultNameDataValues();
     
    public String[] getFirstNames() {
        //return our custom list of names
        return firstNames;
    }
 
    //for the other values, just use the defaults
    public String[] getLastNames() {
        return defaults.getLastNames();
    }
 
    public String[] getPrefixes() {
        return defaults.getPrefixes();
    }
 
    public String[] getSuffixes() {
        return defaults.getSuffixes();
    }
 
}
```

显然，要使用所有自己的名字，您将添加并返回姓氏和后缀/前缀值。要使用此新实现，只需创建数据提供程序的实例并将其传递给数据工厂的实例。

```java
public static void main(String[] args) {
    DataFactory df = new DataFactory();
    df.setNameDataValues(new ScandinavianNames());
    for (int i = 0; i < 10; i++) {
        System.out.println(df.getName());
    }
}
```

我们的结果是：

```
Sigdis Craft
Gerlach Larsen
Sigdis Levine
Sigdis Smith
Freydís Sloan
Gerlach Mayer
```

如果以后需要，您始终可以从默认实现开始使用更具地方特色的实现。

可以替换的不同部分如下：

- `NameDataValues` – 生成名称和后缀/前缀
- `ContentDataValues.java` – 生成单词、业务类型、电子邮件域名和顶级域值
- `AddressDataValues` – 生成城市名、街道名和地址后缀

请注意，如果您打算替换生成单词的组件，您应该有各种长度的单词集，从 2 到 8 个或更多字符。

希望这能帮助你在为新项目的开发和测试环境生成数据时有所启发。

现在 DataFactory 在中央 Maven 存储库中，我计划在 Knappsack 构建原型中使用它，而不是硬编码数据，事实上，该数据是由先前的 DataFactory 实现生成的。

# 参考资料

https://github.com/andygibson/datafactory

* any list
{:toc}