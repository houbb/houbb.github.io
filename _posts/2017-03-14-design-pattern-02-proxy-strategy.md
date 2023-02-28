---
layout: post
title: Design Pattern 02-代理模式 策略模式 proxy strategy
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern]
published: true
---


# Proxy

> 意图

为另一个对象提供代理或占位符以控制对它的访问。

> 适用性

- **远程代理**为不同地址空间中的对象提供本地代表。

- **虚拟代理**按需创建昂贵的对象。

- **保护代理**控制对原始对象的访问。

- **智能引用**是裸指针的替代品，它在访问对象时执行额外的操作。

> 后果

- 远程代理可以隐藏对象位于不同地址空间的事实。

- 虚拟代理可以执行优化，例如按需创建对象。

- 保护代理和智能引用都允许在访问对象时执行额外的内务处理任务。

## static proxy

> struct

![static proxy](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-18-static-proxy.png)

> demo

假设我们想在 `||` 之前添加一些方法 RealSubject.operation()之后，怎么办？

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

为什么我们使用动态代理？ 

如果方法很多，很难用静态代理来解决。

> struct

![static proxy](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-18-dynamic-proxy.png)

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

我们使用reflect来动态创建class文件，目标对象是灵活的。

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

Tips：可以看到，java的动态代理是依赖于 interface，如果没有接口，我们可以使用[aspectj](http://www.eclipse.org/aspectj/)来 解决这个问题。


# Strategy

> 意图

定义一系列算法，封装每个算法，并使它们可以互换。 策略让算法独立于使用它的客户而变化。

> 适用性

- 许多相关类仅在行为上有所不同。 策略提供了一种配置具有多种行为之一的类的方法。

- 你需要一个算法的不同变体。 例如，您可以定义反映不同空间/时间权衡的算法。

当这些变体被实现为算法的类层次结构时，可以使用策略 [HO87]。

- 一种算法使用了客户不应该知道的数据。 使用策略模式可以避免暴露复杂的、特定于算法的数据结构。

- 一个类定义了许多行为，这些行为在其操作中表现为多个条件语句。

将相关的条件分支移动到它们自己的 Strategy 类中，而不是许多条件。

> Struct

![Strategy](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-19-strategy.png)

> 后果

- 继承可以帮助**分解出算法的通用功能**。

- 将算法封装在单独的 Strategy 类中，使您可以独立于其上下文改变算法，从而更容易切换、理解和扩展。

- 策略消除了条件语句。

- 策略可以提供相同行为的不同实现。 客户可以在具有不同时间和空间权衡的策略中进行选择。

*缺点*

- 客户必须了解不同的策略。

- Strategy 和 Context 之间的通信开销。

- 增加的对象数量。


> 实施

假设我们对不同级别的客户有不同的计数。

- 普通会员：不计

- 高级会员：0.9

- 贵宾：0.7


这是代码：

- PriceStrategy.java

```java
public interface PriceStrategy {
    double calcPrice(double price);
}
```

- CommonMemberStrategy.java

```java
public class CommonMemberStrategy implements PriceStrategy {
    @Override
    public double calcPrice(double price) {
        System.out.println("Common member has no count...");

        return price;
    }
}
```

- AdvancedMemberStrategy.java

```java
public class AdvancedMemberStrategy implements PriceStrategy {
    private static final double COUNT = 0.9;

    @Override
    public double calcPrice(double price) {
        System.out.println("Advanced member has the count of " + COUNT);

        return price * COUNT;
    }
}
```

- VIPStrategy.java

```java
public class VIPStrategy implements PriceStrategy {
    private static final double COUNT = 0.7;

    @Override
    public double calcPrice(double price) {
        System.out.println("VIP has the count of " + COUNT);

        return price * COUNT;
    }
}
```

- Price.java

```java
public class Price {
    private PriceStrategy priceStrategy;

    public Price(PriceStrategy priceStrategy) {
        this.priceStrategy = priceStrategy;
    }

    public double getPrice(double price) {
        return priceStrategy.calcPrice(price);
    }
}
```

- test

```java
public class PriceTest extends TestCase {
    public void testGetPrice() {
        final double PRICE  = 10.0;

        Price price = new Price(new CommonMemberStrategy());
        price.getPrice(PRICE);

        Price price1 = new Price(new AdvancedMemberStrategy());
        price1.getPrice(PRICE);

        Price price2 = new Price(new VIPStrategy());
        price2.getPrice(PRICE);
    }
}
```

- result

```
Common member has no count...
Advanced member has the count of 0.9
VIP has the count of 0.7

Process finished with exit code 0
```

* any list
{:toc}
