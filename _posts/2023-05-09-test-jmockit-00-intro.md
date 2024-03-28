---
layout: post
title: jmockit-01-test 之 jmockit 入门使用案例
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# 拓展阅读

[jmockit-01-jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[jmockit-02-概览](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-03-Mocking 模拟](https://houbb.github.io/2023/05/09/test-jmockit-03-mocking)

[jmockit-04-Faking 伪造](https://houbb.github.io/2023/05/09/test-jmockit-04-faking)

[jmockit-05-代码覆盖率](https://houbb.github.io/2023/05/09/test-jmockit-05-code-converate)

[mockito-01-入门介绍](https://houbb.github.io/2023/05/09/test-mockito-01-overivew)

[mockito-02-springaop 整合遇到的问题，失效](https://houbb.github.io/2023/05/09/test-mockito-02-springaop)

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
{% raw %}
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
{% endraw %}
```

# Q: 详细解释一下 jmockit

JMockit是一个用于Java的开源测试框架，用于编写单元测试和集成测试。它提供了一组功能强大的工具和API，可以帮助开发人员进行测试驱动开发（Test-Driven Development，TDD）和行为驱动开发（Behavior-Driven Development，BDD）。

JMockit的主要特点是它的能力可以在测试中模拟和修改代码的行为。它允许开发人员在测试中创建假对象（mock objects）来替代真实的依赖项，并且可以在测试运行时定义和验证这些对象的行为。这使得开发人员能够专注于测试目标代码的逻辑，而不需要实际调用和管理真实的依赖项。

下面是JMockit的一些主要功能：

1. Mock对象创建和管理：JMockit允许开发人员创建假对象，称为mock对象，来替代真实的依赖项。这些mock对象可以在测试中模拟外部依赖项的行为，如方法的返回值、异常抛出等。

2. 期望与验证：开发人员可以使用JMockit来定义对mock对象的期望行为，比如指定方法的参数和返回值。在测试运行期间，可以验证这些期望是否得到满足。

3. 录制与重放：JMockit可以自动记录对mock对象的调用，并在后续的测试中重放这些调用。这样，开发人员可以更轻松地设置和验证测试的预期行为。

4. Mock构造函数：JMockit还提供了能力来mock构造函数，这使得可以创建没有无参构造函数的对象实例，或者在测试中避免实际调用构造函数。

5. 非侵入性：使用JMockit进行测试不需要修改被测试的代码。开发人员只需在测试代码中添加JMockit的注解和API调用，就可以模拟和控制依赖项的行为。

总的来说，JMockit提供了一种方便、灵活且功能丰富的方法来编写Java测试。它使得测试代码的编写更加简单，并且能够有效地隔离和控制测试环境中的依赖项。

# Q: jmockit 如何测试 static 和 private 方法

JMockit提供了一些特殊的功能和技术，可以用于测试静态（static）方法和私有（private）方法。

下面是使用JMockit进行静态方法和私有方法测试的一般步骤：

## 1. 针对静态方法的测试：

   - 使用JMockit的`Mocked`注解来模拟静态方法所在的类。在测试类中，使用`@Mocked`注解标记该类即可。
   - 在测试方法中，可以直接调用该静态方法并验证其行为。

   示例代码：
   ```java
   import mockit.Mocked;
   import mockit.Tested;

   public class StaticMethodTest {
       @Tested
       private YourClass yourClass; // 要测试的类

       @Test
       public void testStaticMethod() {
           // 使用@Mocked注解模拟静态方法所在的类
           try (MockedStatic<YourClass> mockedStatic = MockedStatic.mockStatic(YourClass.class)) {
               // 设置模拟方法的行为
               mockedStatic.when(() -> YourClass.staticMethod()).thenReturn("mockedResult");

               // 调用静态方法并验证结果
               String result = yourClass.callStaticMethod();
               assertEquals("mockedResult", result);
           }
       }
   }
   ```

## 2. 针对私有方法的测试：

   - 使用JMockit的`Deencapsulation`类，它提供了对私有方法的访问和调用。
   - 使用`Deencapsulation.invoke()`方法来调用私有方法，并验证其行为。

   示例代码：
   ```java
   import mockit.Deencapsulation;

   public class PrivateMethodTest {
       @Test
       public void testPrivateMethod() {
           YourClass yourClass = new YourClass(); // 要测试的类的实例

           // 调用私有方法并验证结果
           String result = Deencapsulation.invoke(yourClass, "privateMethod");
           assertEquals("expectedResult", result);
       }
   }
   ```

需要注意的是，在使用JMockit进行静态方法和私有方法的测试时，要确保正确设置模拟方法的行为并验证预期结果。


# 参考资料

https://blog.csdn.net/qq_29698805/article/details/105588023

[一文带你玩转JMockit](https://zhuanlan.zhihu.com/p/106117486)

* any list
{:toc}