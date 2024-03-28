---
layout: post
title: mockito-02-spring aop 与 mockito 冲突
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


# 现象

发现引入一个日志组件后，导致 mockito 测试失效了。

## 原因

日志组件中通过 aop 切面增强输出日志，mockito 也是这个原理。

所以二者存在冲突。

# 解决思路

1）将 mock 的数据设置到对应的 bean 中，解决 mock 失效问题。

2）将被 spring 代理的对象还原为原始对象，让 mockito 可以正常代理。

3) 通过 spring 官方的 @MockBean 注解

# 方式1-设置 mock 对象

测试类：

```java
public class HomeControllerTest extends TestCase {
    private MockMvc mockMvc;
    @InjectMocks
    private HomeController homeController;
    @Mock
    private UserService userService;
    @Before
    public void setUp(){
    MockitoAnnotations.initMocks(this);
    this.homeController = new HomeController();
    this.mockMvc = MockMvcBuilders.standaloneSetup(this.homeController).build();
.....
}
```

Controller 类

```java
public class HomeController {
    @Autowired
    private UserService userService;
    .....
}
```

在这种情况下就会造成@Mock和@Autowired注入冲突，导致注入失败。

可以将测试类中加入反射注入即可：

```java
@Before
public void setUp(){
    MockitoAnnotations.initMocks(this);
    this.homeController = new HomeController();
    ReflectionTestUtils.setField(homeController,"userService",userService);
    this.mockMvc = MockMvcBuilders.standaloneSetup(this.homeController).build();
}
```

即可解决注入失败问题。

# 方式 2

## 思路

我们通过把 spring 增强的代理恢复为普通对象，然后让 mockito 初始化处理。

## 测试例子

```java
package com.github.houbb.dwz.server.service;

import com.github.houbb.dwz.server.BootApplication;
import com.github.houbb.dwz.server.service.biz.MyTestBiz;
import com.github.houbb.dwz.server.service.service.MyTestService;
import com.github.houbb.dwz.server.utils.MockitoProxyUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.Assert;

import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = BootApplication.class)
public class MyTestBizTest {

    @Mock
    private MyTestService myTestService;

    @Autowired
    @InjectMocks
    private MyTestBiz myTestBiz;

    @Before
    public void init() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void queryByIdTest() {
        when(myTestService.queryById("1")).thenReturn("mockit-id");
        String result = myTestBiz.queryById("1");
        assert  result.equals("mockit-id");
    }

}
```

这种，如果 service 被代理的话，会导致 mock 无效，断言无效。 

## 解决方式

### 工具

```java
    @SuppressWarnings("all")
    public static <T> T unWrapProxy(final T proxyObject) {
        try {
            if(AopUtils.isAopProxy(proxyObject)
                && proxyObject instanceof Advised) {
                Advised advised = (Advised) proxyObject;
                // 原始对象
                return (T) advised.getTargetSource().getTarget();
            }

            return proxyObject;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
```

可以通过这个方法，把所有的 mock 对象恢复。

### 测试

```java
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = BootApplication.class)
public class MyTestBizTest {

    @Mock
    private MyTestService myTestService;

    @Autowired
    @InjectMocks
    private MyTestBiz myTestBiz;

    @Before
    public void init() {
        myTestBiz = MockitoProxyUtils.unWrapProxy(myTestBiz);
        myTestService = MockitoProxyUtils.unWrapProxy(myTestService);

        MockitoAnnotations.initMocks(this);
    }

}
```

init() 方法调整一下，测试就可以通过。

## 解决方式优化

不足：需要手动设置每一个字段，显然不够优雅。

改进思路：我们通过反射，将每一个属性还原。

### 方法

```java
    public static void unWrapAllFieldsProxy(final Object testInstance) {
        try {
            Field[] fields = testInstance.getClass().getDeclaredFields();
            if(fields.length <= 0) {
                return;
            }

            for(Field field : fields) {
                // 跳过 final 字段
                if(Modifier.isFinal(field.getModifiers())) {
                    continue;
                }

                field.setAccessible(true);

                Object fieldVal = field.get(testInstance);
                Object newFieldVal = unWrapProxy(fieldVal);
                field.set(testInstance, newFieldVal);
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
```

### 测试

```java
@Before
public void init() {
    MockitoProxyUtils.unWrapAllFieldsProxy(this);
    MockitoAnnotations.initMocks(this);
}
```

# 小结

这里可以发现需要修改 init 方法，最好是统一继承自抽象测试类。

# 参考资料

https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing.spring-boot-applications.tracing

https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing

[Mockito fails to verify the second time on the proxied bean](https://github.com/spring-projects/spring-boot/issues/6871) 

[Spring Test support for @MockBean or similar [SPR-14083]](https://github.com/spring-projects/spring-framework/issues/18655)

[Spring Test support for @MockBean or similar [SPR-14083]](https://github.com/spring-projects/spring-framework/issues/18655)

[Mocks are not injected in Spring AOP proxies](https://github.com/mockito/mockito/issues/209)

[当Mock注解和Spring注解冲突时](https://blog.csdn.net/jikun1234/article/details/64128446)

* any list
{:toc}