---
layout: post
title:  test data factory-04-测试造数平台 jfairy Java fake data generator
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)


# jfairy

## Usage

```java
Creating simple objects:

Fairy fairy = Fairy.create();
Person person = fairy.person();

System.out.println(person.fullName());            
// Chloe Barker
System.out.println(person.email());               
// barker@yahoo.com
System.out.println(person.telephoneNumber());     
// 690-950-802

Person adultMale = fairy.person(male(), minAge(21));
System.out.println(adultMale.isMale());           
// true
System.out.println(adultMale.dateOfBirth());      
// at least 21 years earlier
```

Creating related objects:

```java
Fairy fairy = Fairy.create();
Company company = fairy.company();
System.out.println(company.name());          
// Robuten Associates
System.out.println(company.url());           
// http://www.robuteniaassociates.com

Person salesman = fairy.person(withCompany(company));
System.out.println(salesman.fullName());     
// Juan Camacho
System.out.println(salesman.companyEmail()); 
// juan.camacho@robuteniaassociates.com
```

Locale support:

```java
Fairy enFairy = Fairy.create();                               
// Locale.ENGLISH is default
Fairy plFairy = Fairy.create(Locale.forLanguageTag("pl"));    
// Polish version
```

# chat

## 详细介绍一下 jfairy

`jfairy` 是一个用于生成随机测试数据的 Java 库。它旨在帮助开发人员创建用于测试、原型设计和其他需要随机数据的场景的虚拟数据。以下是 `jfairy` 主要功能的详细介绍：

1. **生成各种数据类型：** `jfairy` 可以生成多种类型的随机数据，包括但不限于姓名、地址、电子邮件、电话号码、日期、数字、文本等。

   ```java
   Fairy fairy = Fairy.create();
   
   // 生成随机姓名
   String fullName = fairy.person().fullName();
   
   // 生成随机地址
   String address = fairy.person().getAddress().toString();
   
   // 生成随机电子邮件
   String email = fairy.person().getEmail();
   
   // 生成随机日期
   LocalDate dateOfBirth = fairy.person().getDateOfBirth();
   ```

2. **支持本地化：** `jfairy` 支持本地化，你可以根据需要生成特定语言或地区的随机数据。

   ```java
   // 生成法国姓名
   String frenchFullName = fairy.create(Locale.FRENCH).person().fullName();
   ```

3. **自定义生成规则：** 你可以通过实现 `FairyModule` 接口，自定义生成规则，以适应你的特定需求。

   ```java
   public class CustomFairyModule implements FairyModule {
       @Override
       public void setup(FairyFactory fairyFactory) {
           fairyFactory.addBuilderProducer(MyCustomType.class, new MyCustomTypeBuilderProducer());
       }
   }
   ```

4. **生成集合：** 你可以生成包含随机数据的集合。

   ```java
   List<String> randomStrings = fairy.textProducer().paragraphs(5);
   ```

5. **方便的构建器模式：** `jfairy` 使用构建器模式，使得配置生成规则变得简单。

   ```java
   Fairy fairy = Fairy.create();
   Person person = fairy.person();
   ```

6. **生成随机的业务数据：** 除了基本的个人信息外，`jfairy` 还支持生成与业务相关的数据，例如公司名称、产品名称等。

   ```java
   // 生成随机公司名称
   String companyName = fairy.company().getName();
   
   // 生成随机产品名称
   String productName = fairy.company().getProduct();
   ```

7. **随机化 HTML 和 Lorem Ipsum 文本：** `jfairy` 提供了生成随机 HTML 和 Lorem Ipsum 文本的功能。

   ```java
   // 生成随机 HTML 文本
   String randomHtml = fairy.textProducer().randomHtml(10, 20);
   
   // 生成随机 Lorem Ipsum 文本
   String loremIpsum = fairy.textProducer().loremIpsum(5);
   ```

8. **灵活的 API：** `jfairy` 的 API 设计灵活，易于使用，并提供了多种方式来生成随机数据。

   ```java
   Fairy fairy = Fairy.create();
   
   // 使用 API 生成随机数字
   int randomNumber = fairy.baseProducer().randomBetween(1, 100);
   ```

`jfairy` 是一个功能强大且易于使用的库，适用于在测试环境中生成虚拟数据。

通过其丰富的功能和配置选项，你可以轻松地满足不同场景下的随机数据生成需求。


# 参考资料

https://github.com/Codearte/jfairy

* any list
{:toc}