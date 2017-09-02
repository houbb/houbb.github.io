---
layout: post
title:  Spring Property 02
date:  2017-09-01 22:17:36 +0800
categories: [Spring]
tags: [spring, property]
published: true
---


# Spring Property

> [Spring PropertySourcesPlaceholderConfigurer 工作原理](http://blog.csdn.net/qyp199312/article/details/54313784)

> [加密Spring加载的Properties文件](http://lavasoft.blog.51cto.com/62575/807502/)

这个版本太老，但是思想是正确的。

> [Spring的PropertySourcesPlaceholderConfigurer的一点点小东东](http://blog.csdn.net/u013632755/article/details/52081033)


# PropertyPlaceholderConfigurer

> [扩展 PropertyPlaceholderConfigurer 对prop文件中的属性加密](http://exceptioneye.iteye.com/blog/1946510)

对于 `PropertySourcesPlaceholderConfigurer` 的继承在 3.1 之后已经被废弃了。所以采用 `PropertyPlaceholderConfigurer` 的方式。
 
- spring-property-config.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">


    <bean id="encryptPropertyPlaceholderConfigurer"
          class="com.ryo.spring.learn.old.property.extern.MyPropertyPlaceholderConfigurer">
    </bean>

</beans>
```

- MyPropertyPlaceholderConfigurer.class

这里为了测试方便，直接使用构造器初始化的形式。

```java
package com.ryo.spring.learn.old.property.extern;

import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;

import java.util.Properties;

public class MyPropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer  {


    public MyPropertyPlaceholderConfigurer() {
        Properties properties = System.getProperties();
        properties.setProperty("name", "ryo");
        this.setProperties(properties);
    }

}
```

- MyPropertyPlaceholderConfigurerTest.class
 
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {
        "classpath:spring-property-config.xml",
})
public class MyPropertyPlaceholderConfigurerTest {

    @Value("${name}")
    private String name;

    @Test
    public void nameTest() {
        System.out.println(name);
    }

}
```

测试输出结果：

```
ryo
```


可见，可以直接将设置的属性在 spring 中直接使用。原来此处就不赘述了。

讲下简单的用途：

1、对敏感信息进行加密

2、配置可以统一获取。根据不同的情况获取不同的配置属性。直接设置到 Properties 中。


# Default Value

> [Spring placeholder默认值设置](http://www.jianshu.com/p/6f5a9a02b2d2)


# More

> [Spring技术内幕：深入解析Spring架构](http://blog.51cto.com/zt/153)

> [spring-framework 分类](http://www.zhenchao.org/categories/spring-framework/)

> [Spring加载resource时classpath*:与classpath:的区别](http://blog.csdn.net/kkdelta/article/details/5507799)


* any list
{:toc}
