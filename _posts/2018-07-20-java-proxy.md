---
layout: post
title:  Java Proxy
date:  2018-07-20 09:30:27 +0800
categories: [Java]
tags: [java, proxy, sf, bytecode]
published: true
---

# Java Proxy

## 代码实现

- UserService.java

```java
public interface UserService {

  /**
   * 查询所有
   */
  void queryAll();

}
```

- UserServiceImpl.java

```java
public class UserServiceImpl implements UserService {
    @Override
    public void queryAll() {
        System.out.println("query all...");
    }
}
```

- UserServiceProxy.java

```java
public class UserServiceProxy implements UserService {

    /**
     * 被代理的服务
     */
    private UserService userService;

    @Override
    public void queryAll() {
        if(userService == null) {
            userService = new UserServiceImpl();
        }

        before();
        userService.queryAll();
        after();
    }

    private void before() {
        System.out.println("before...");
    }

    private void after() {
        System.out.println("after...");
    }
}
```

## 测试

```java
public class UserServiceProxyTest {

    @Test
    public void queryAllTest() {
        UserService userService = new UserServiceProxy();
        userService.queryAll();
    }

}
```

- 结果

```
before...
query all...
after...
```

# Java dynamic proxy

- DefaultInvocationHandler.java

## 代码实现

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class DefaultInvocationHandler implements InvocationHandler {

    /**
     * 目标文件
     */
    private final Object target;

    public DefaultInvocationHandler(final Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("DefaultInvocationHandler Start...");
        Object result = method.invoke(target, args);
        System.out.println("DefaultInvocationHandler End...");
        return result;
    }

}
```

## 测试

- CASE ONE

```java
package com.ryo.spring.aop.service.impl;

import com.ryo.spring.aop.handler.DefaultInvocationHandler;
import com.ryo.spring.aop.service.UserService;
import org.junit.Test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class UserServiceImplTest {

  /**
   * Method: queryAll()
   */
  @Test
  public void queryAllTest() throws Exception {
    final UserService target = new UserServiceImpl();
    UserService proxy = (UserService) Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(),
        new InvocationHandler() {
          @Override
          public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("start...");
            Object result = method.invoke(target, args);
            System.out.println("end...");
            return result;
          }
        });
    proxy.queryAll();
  }

}
```

测试结果

```
start...
query all...
end...
```

- CASE TWO

```java
@Test
public void queryAllTwoTest() {
  final UserService target = new UserServiceImpl();
  UserService proxy = (UserService) Proxy.newProxyInstance(target.getClass().getClassLoader(),
      target.getClass().getInterfaces(),
      new DefaultInvocationHandler(target));
  proxy.queryAll();
}
```

测试结果

```
DefaultInvocationHandler Start...
query all...
DefaultInvocationHandler End...
```


# Java CgLib

如果类没有接口，则 Java 动态代理就行不通了。

此时，cglib 就可以上场了。

## 简介

[]()

## jar 引入

```xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.1</version>
</dependency>
```

## 代码实现

- UserServiceImpl.java

```java
public class UserServiceImpl {

  public void queryAll() {
    System.out.println("query all...");
  }

}
```

- CglibProxy.java

```java
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 *
 * @author houbinbin
 * @date 2017/1/5
 */
public class CglibProxy implements MethodInterceptor {

  @Override
  public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
    System.out.println("cglib intercept start...");
    //通过代理子类调用父类的方法
    Object object = methodProxy.invokeSuper(o, objects);
    System.out.println("cglib intercept end...");
    return object;
  }

  /**
   * 获取代理类
   * @param clazz 类信息
   * @return 代理类结果
   */
  public Object getProxy(Class clazz){
    Enhancer enhancer = new Enhancer();
    //目标对象类
    enhancer.setSuperclass(clazz);
    enhancer.setCallback(this);
    //通过字节码技术创建目标对象类的子类实例作为代理
    return enhancer.create();
  }

}
```

## 测试

```java
/**
 * Method: queryAll()
 * 依赖于CGLIB，不需要interface
 */
@Test
public void queryAllTest() throws Exception {
    UserServiceImpl proxy = (UserServiceImpl) new CglibProxy().getProxy(UserServiceImpl.class);
    proxy.queryAll();
}
```

结果：

```
cglib intercept start...
query all...
cglib intercept end...
```


* any list
{:toc}