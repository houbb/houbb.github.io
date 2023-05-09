---
layout: post
title: test 之 jmockit
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# jmockit 说明

[jmockit](http://jmockit.github.io/) 可以提供基于 mock 的测试能力。

## 两种方式区别

JMockit有两种测试方式，一种是基于行为的，一种是基于状态的测试：

### 1. Behavior-oriented(Expectations & Verifications)

其定义mock的方式就是先录制好某些方法调用和返回结果，可以通过Expectations实现。 基于行为的Mock 测试，一共三个阶段：record、replay、verify。

1）record：在这个阶段，各种在实际执行中期望被调用的方法都会被录制。

2）repaly：在这个阶段，执行单元测试Case，原先在record 阶段被录制的调用都可能有机会被执行到。这里有“有可能”强调了并不是录制了就一定会严格执行。

3）verify：在这个阶段，断言测试的执行结果或者其他是否是原来期望的那样。

### 2. State-oriented(MockUp) 

覆盖原方法的实现，可以用MockUp实现 具体这两种方法如何使用，会穿插在后面的不同使用场景中。

## 两种方式使用说明

JMockit有两种测试方式：

1、基于状态的Mock：

是站在目标测试代码内部的，可以对传入的参数进行检查、匹配，才返回某些结果，类似白盒。

主要使用MockUp和@Mock搭配使用实现Mock

2、基于行为的Mock：

就是对Mock目标代码的行为进行模仿，更像是黑盒测试。

主要使用@Test、@Mocked、@Injectable、@Capturing和Expectations搭配使用实现Mock

其实从大的方向来讲，JMockit只有两种Mock方式：new MockUp() 和 new Expectations() 两种。

（1）注解@Mock是和new MockUp()方式搭配使用。

（2）注解@Test、@Mocked、@Injectable、@Capturing是和new Expectations()方式搭配使用。然后@Mocked、@Injectable、@Capturing又有不同的特性，就可以解决不同场景下的Mock了。

# 拓展阅读

[junit5](https://houbb.github.io/2018/06/24/junit5-01-hello)

# 使用入门

## maven 引入

与 springboot 整合

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>jmockit-learn</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.1.5.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

继续添加 jmockit 的依赖

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.jmockit</groupId>
    <artifactId>jmockit</artifactId>
    <version>1.34</version>
    <scope>test</scope>
</dependency>
```

## 基于 Mockup + @Mock 的用法

例子：

```java
package com.github.houbb.jmockit.learn.biz;

import com.github.houbb.jmockit.learn.model.UserInfo;
import com.github.houbb.jmockit.learn.service.UserService;
import mockit.*;
import mockit.integration.junit4.JMockit;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(JMockit.class)
public class UserBizMockUpCaseTest {


    // 待测试的实现，需要指定为具体的实现
    @Tested
    private UserBiz userBiz;

    // 依赖的属性，进行 mock
    @Injectable
    private UserService userService;

    @Test
    public void test() {
        //mock
        new MockUp<UserService>(userService) {
            @Mock
            public UserInfo queryById(String id) {
                UserInfo user = new UserInfo();
                user.setId(id);
                user.setName(id+"-name-mock");
                return user;
            }
        };

        UserInfo userInfo = userBiz.queryUserInfo("2");

        Assert.assertEquals("2-name-mock", userInfo.getName());
    }

}
```

## 基于状态的测试

```java
package com.github.houbb.jmockit.learn.biz;

import com.github.houbb.jmockit.learn.model.UserInfo;
import com.github.houbb.jmockit.learn.service.UserService;
import com.github.houbb.jmockit.learn.service.impl.UserServiceImpl;
import mockit.*;
import mockit.integration.junit4.JMockit;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(JMockit.class)
public class UserBizMockedTest {
    // 依赖的属性，进行 mock
    @Mocked
    private UserServiceImpl userService;

    @Test
    public void test2() {
        // 录制(Record)
        new Expectations() {{
            userService.queryById((String) any); result = new UserInfo("any-other", "any-other-name");
        }};

        //重放(Replay)
        UserInfo userInfo1 = userService.queryById("1");
        UserInfo userInfo2 = userService.queryById("2");
        UserInfo userInfo3 = userService.queryById("3");

        // 也可以断言
        Assert.assertTrue(userInfo1.getName().equals("any-other-name"));

        // 验证，验证被调用，且被调用了3次
        new Verifications() {{
            userService.queryById((String) any);
            times = 3;
        }};
    }

}
```

# 参考资料

https://blog.csdn.net/qq_29698805/article/details/105588023

[一文带你玩转JMockit](https://zhuanlan.zhihu.com/p/106117486)

* any list
{:toc}