---
layout: post
title:  Spring Property-01-入门使用
date:  2017-8-8 13:54:50 +0800
categories: [Spring]
tags: [property, spring]
published: true
---


# 多个属性文件问题


## 情境

文件路径如下：

```
├─src
│  ├─main
│  │  ├─java
│  │  │  └─com
│  │  │      └─ryo
│  │  │          └─spring
│  │  │              └─property
│  │  │                      User.java
│  │  │
│  │  └─resources
│  │          one.properties
│  │          spring-beans-one.xml
│  │          spring-beans-two.xml
│  │          two.properties
│  │
│  └─test
│      └─java
│              UserTest.java
```

- one.properties

```
oneName=one
```

- two.properties

```
twoName=two
```

- spring-beans-one.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">


    <context:property-placeholder location="classpath*:one.properties"/>

    <bean name="one" class="com.ryo.spring.property.User">
        <property name="name" value="${oneName}"/>
    </bean>

</beans>
```
- spring-beans-two.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:property-placeholder location="classpath*:two.properties"/>

    <bean name="two" class="com.ryo.spring.property.User">
        <property name="name" value="${twoName}"/>
    </bean>

</beans>
```

- User.java

```java
public class User {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- UserTest.java

测试代码

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {
        "classpath:spring-beans-one.xml",
        "classpath:spring-beans-two.xml",
})
public class UserTest {

    @Autowired
    @Qualifier("one")
    private User one;

    @Autowired
    @Qualifier("two")
    private User two;

    @Test
    public void infoTest() {
        System.out.println(one.getName());
        System.out.println(two.getName());
    }
}
```

<label class="label label-warning">Error</label>

运行测试案例，报错如下：

```
...
Caused by: org.springframework.beans.factory.BeanDefinitionStoreException: Invalid bean definition with name 'two' defined 
in class path resource [spring-beans-two.xml]: Could not resolve placeholder 'twoName' in string value "${twoName}"; 
nested exception is java.lang.IllegalArgumentException: Could not resolve placeholder 'twoName' in string value "${twoName}"
...
```

## 原因

[关于<context:property-placeholder>的一个有趣现象](http://www.iteye.com/topic/1131688)

[Spring导入多个独立的 .properties配置文件](http://blog.csdn.net/oDeviloo/article/details/51064655)

## 解决方案

一、ignore-unresolvable

引入属性文件时，指定 `ignore-unresolvable="true"`。注意：**所有**的属性文件引入都需要显示指定。

如：

```xml
<context:property-placeholder location="classpath*:one.properties" ignore-unresolvable="true"/>
```

二、同时引入多个属性文件

属性文件不要在单个文件一个个引入。直接在最后**统一引入**。可使用如下方式：
(支持 RegEx 匹配，只需要在一个文件中引入即可，其他文件移除。)

```xml
<!-- 加载所有配置文件 -->
<context:property-placeholder location="classpath*:*.properties"/>
```

也可以采用下面的方式(二者本质是等价的)

```xml
<bean id="propertyPlaceholderConfigurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="locations">
        <list>
            <!-- 这里支持多种寻址方式：classpath和file -->
            <value>classpath:one.properties</value>
            <value>classpath:two.properties</value>
            <!-- 推荐使用file的方式引入，这样可以将配置和代码分离 -->
            <!--<value>file:/opt/demo/config/demo-remote.properties</value>-->
        </list>
    </property>
</bean>
```


# 解析 properties 文件

一、直接注入到bean中

二、使用 `@Value`

- UserTest.java

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {
        "classpath:spring-beans-one.xml",
        "classpath:spring-beans-two.xml",
})
public class UserTest {

    @Value("${oneName}")
    private String oneName;

    @Test
    public void oneNameTest() {
        System.out.println(oneName);
    }
}
```

结果:

```
one
```

> 参考文档

[Spring在代码中获取properties文件属性](http://www.cnblogs.com/Jason-Xiang/p/6396235.html)

[Spring获取properties文件中的属性](http://blog.csdn.net/wlfighter/article/details/52563605)

[Spring中属性文件properties的读取与使用](http://blog.csdn.net/bnna8356586/article/details/51406459)

[五种方式让你在java中读取properties文件内容不再是难题](http://www.cnblogs.com/hafiz/p/5876243.html)


* any list
{:toc}