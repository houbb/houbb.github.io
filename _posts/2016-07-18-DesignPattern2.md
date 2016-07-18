---
layout: post
title: Design Pattern2
date:  2016-7-18 12:26:11 +0800
categories: [Design Pattern]
tags: [design pattern]
published: true
---

* any list
{:toc}

# Proxy

> Intent

Provide a surrogate or placeholder for another object to control access to it.

> Applicability

- A **remote proxy** provides a local representative for an object in a different address space.

- A **virtual proxy** creates expensive objects on demand.

- A **protection proxy** controls access to the original object.

- A **smart reference** is a replacement for a bare pointer that performs additional actions when an object is accessed.

> Consequences

- A remote proxy can hide the fact that an object resides in a different address space.

- A virtual proxy can perform optimizations such as creating an object on demand.

- Both protection proxies and smart references allow additional housekeeping tasks when an object is accessed.

## static proxy

> struct

![static proxy]({{site.url}}/static/app/img/2016-07-18-static-proxy.png)

> demo

Suppose we want to add some methods before || after the RealSubject.operation(), how to do ?

- Subject.java

```java
public interface Subject {
    void operation();
}
```

- RealSubject.java

```java
public class RealSubject implements Subject {
    @Override
    public void operation() {
        System.out.println("Real do sth.");
    }
}
```

- ProxySubject.java

```java
public class ProxySubject implements Subject {
    private Subject subject;

    public ProxySubject(Subject subject) {
        this.subject = subject;
    }

    @Override
    public void operation() {
        System.out.println("before...");
        subject.operation();
        System.out.println("after...");
    }
}
```

- test

```java
public class ProxySubjectTest extends TestCase {
    @Test
    public void testProxy() {
        Subject subject = new ProxySubject(new RealSubject());
        subject.operation();
    }
}
```

- result

```
before...
Real do sth.
after...

Process finished with exit code 0
```

## dynamic proxy

Why we use dynamic proxy ? If there are many methods, it's hard to use static proxy to solve it.

> struct

![static proxy]({{site.url}}/static/app/img/2016-07-18-dynamic-proxy.png)

- Request.java

```java
public interface Request {
    void request();

    void response();
}
```

- RealRequest.java

```java
public class RealRequest implements Request {
    @Override
    public void request() {
        System.out.println("Real request");
    }

    @Override
    public void response() {
        System.out.println("Real response");
    }
}
```

- ProxyHandler.java

We use reflect to dynamic create class file, then the target object is flexible.

```java
package com.ryo.dynamicProxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * Created by 侯彬彬 on 2016/7/18.
 */
public class ProxyHandler implements InvocationHandler {
    private Object target;

    public Object bind(Object target) {
        this.target = target;

        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                target.getClass().getInterfaces(),
                this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("dynamic before...");
        Object result = method.invoke(target, args);
        System.out.println("dynamic after...\n");

        return result;
    }
}
```

- test

```java
public class DynamicProxyTest extends TestCase {
    @Test
    public void testProxy() {
        ProxyHandler proxyHandler = new ProxyHandler();
        Request request = (Request) proxyHandler.bind(new RealRequest());
        request.request();

        request.response();
    }
}
```

- result

```
dynamic before...
Real request
dynamic after...

dynamic before...
Real response
dynamic after...


Process finished with exit code 0
```

Tips: As you can see, the dynamic proxy of java is depends on ```interface```, if there is no interface, we can use [aspectj](http://www.eclipse.org/aspectj/) to solve it.



