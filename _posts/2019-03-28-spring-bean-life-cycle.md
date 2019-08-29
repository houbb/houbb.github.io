---
layout: post
title: Spring Bean lifecycle 生命周期
date:  2019-3-28 09:47:51 +0800
categories: [Java]
tags: [java, spring, sh]
published: true
---

# 业务背景

需要不同的环境，有不同的实现。不单单是配置的变化。

## 一个环境

使用新的 rocket mq

## 原来环境

使用旧的 active mq

## 限制

使用同一份代码

# 解决问题的思路

## spring 懒加载

因为消息的监听是基于 Container 监听者模式实现的，希望通过指定为特定环境指定为是否惰性加载。

后来发现行不通。

因为一般的 property 配置框架，都是监听的 spring 的属性设置事件。

lazy-init 是一个无法被替换的属性。

这个基本不可实现。

## 最简单粗暴的方式

同时也是最麻烦的方式。

为了让代码正常启动且不监听，就直接让两份 container 都正常初始化即可。

可以在不同环境配置不同的属性，让其兼容不存在的队列（Topic/Tag）等即可。

**为了避免复杂性，建议使用这种方式。**

## 修改 bean

直接在对象构建结束后，构建一个空的 container。

# 例子

## 对象

```java
package com.github.houbb.spring.learn.life.model;

import lombok.Data;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Data
public class User {

    private String name;

}
```

## 定义对象处理

```java
package com.github.houbb.spring.learn.life.awre;

import com.github.houbb.spring.learn.life.model.User;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.BeanPostProcessor;

/**
 * @author binbin.hou
 * @since 1.0.0
 * @see BeanFactoryPostProcessor
 * @see BeanPostProcessor
 */
public class MyBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return null;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        // 直接返回 null 是无效的
        if("user".equals(beanName)) {
            User user = new User();
            user.setName("Process");
            return user;
        }
        return null;
    }

}
```

## bean.xml

配置信息如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="user" class="com.github.houbb.spring.learn.life.model.User">
        <property name="name" value="哈哈哈"/>
    </bean>

    <bean id="myBeanPostProcessor" class="com.github.houbb.spring.learn.life.awre.MyBeanPostProcessor">
    </bean>

</beans>
```

## 测试代码

```java
@Test
public void userTest() {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean.xml");
    User user = applicationContext.getBean(User.class);
    System.out.println(user);
}
```

- 测试结果

```
User(name=Process)
```

# 参考资料

- 官方

[beans-factory-aware](https://docs.spring.io/spring/docs/4.3.25.RELEASE/spring-framework-reference/htmlsingle/#beans-factory-aware)

- 其他

[spring的lazy-init属性](https://blog.csdn.net/thomassamul/article/details/81275285)

* any list
{:toc}