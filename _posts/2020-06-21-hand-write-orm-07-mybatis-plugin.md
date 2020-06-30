---
layout: post
title:  手写 Hibernate ORM 框架 07-mybatis plugin 插件机制详解
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 插件的作用

在实际开发过程中,我们经常使用的Mybaits插件就是分页插件了，通过分页插件我们可以在不用写count语句和limit的情况下就可以获取分页后的数据,给我们开发带来很大

的便利。除了分页，插件使用场景主要还有更新数据库的通用字段，分库分表，加解密等的处理。

这篇博客主要讲Mybatis插件原理,下一篇博客会设计一个Mybatis插件实现的功能就是每当新增数据的时候不用数据库自增ID而是通过该插件生成雪花ID,作为每条数据的主键。

# JDK动态代理+责任链设计模式

Mybatis的插件其实就是个拦截器功能。它利用JDK动态代理和责任链设计模式的综合运用。采用责任链模式，通过动态代理组织多个拦截器,通过这些拦截器你可以做一些你想做的事。

所以在讲Mybatis拦截器之前我们先说说JDK动态代理+责任链设计模式。

## JDK 动态代理案例

```java
package com.github.houbb.mybatis.plugin;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class JdkDynamicProxy {

    /**
     * 一个接口
     */
    public interface HelloService{
        void sayHello();
    }

    /**
     * 目标类实现接口
     */
    static class HelloServiceImpl implements HelloService{

        @Override
        public void sayHello() {
            System.out.println("sayHello......");
        }

    }

    /**
     * 自定义代理类需要实现InvocationHandler接口
     */
    static  class HelloInvocationHandler implements InvocationHandler {

        private Object target;

        public HelloInvocationHandler(Object target){
            this.target = target;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("------插入前置通知代码-------------");
            //执行相应的目标方法
            Object rs = method.invoke(target,args);
            System.out.println("------插入后置处理代码-------------");
            return rs;
        }

        public static Object wrap(Object target) {
            return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                    target.getClass().getInterfaces(),new HelloInvocationHandler(target));
        }
    }

    public static void main(String[] args)  {
        HelloService proxyService = (HelloService) HelloInvocationHandler.wrap(new HelloServiceImpl());
        proxyService.sayHello();
    }

}
```

- 输出

```
------插入前置通知代码-------------
sayHello......
------插入后置处理代码-------------
```

# 优化1：面向对象

上面代理的功能是实现了,但是有个很明显的缺陷，就是 HelloInvocationHandler 是动态代理类，也可以理解成是个工具类，我们不可能会把业务代码写到写到到invoke方法里，

不符合面向对象的思想，可以抽象一下处理。

## 定义接口

可以设计一个Interceptor接口，需要做什么拦截处理实现接口就行了。

```java
public interface Interceptor {

    /**
     * 具体拦截处理
     */
    void intercept();

}
```

## 实现接口

```java
public class LogInterceptor implements Interceptor{

    @Override
    public void intercept() {
        System.out.println("------插入前置通知代码-------------");
    }

}
```

和

```java
public class TransactionInterceptor implements Interceptor{

    @Override
    public void intercept() {
        System.out.println("------插入后置处理代码-------------");
    }

}
```

## 实现代理

```java
public class InterfaceProxy implements InvocationHandler {

    private Object target;

    private List<Interceptor> interceptorList = new ArrayList<>();

    public InterfaceProxy(Object target, List<Interceptor> interceptorList) {
        this.target = target;
        this.interceptorList = interceptorList;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //处理多个拦截器
        for (Interceptor interceptor : interceptorList) {
            interceptor.intercept();
        }
        return method.invoke(target, args);
    }

    public static Object wrap(Object target, List<Interceptor> interceptorList) {
        InterfaceProxy targetProxy = new InterfaceProxy(target, interceptorList);
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                target.getClass().getInterfaces(), targetProxy);
    }

    

}
```

## 测试验证

```java
public static void main(String[] args) {
    List<Interceptor> interceptorList = new ArrayList<>();
    interceptorList.add(new LogInterceptor());
    interceptorList.add(new TransactionInterceptor());

    HelloService target = new HelloServiceImpl();
    HelloService targetProxy = (HelloService) InterfaceProxy.wrap(target, interceptorList);
    targetProxy.sayHello();
}
```

- 日志

```
------插入前置通知代码-------------
------插入后置处理代码-------------
sayHello......
```

这里有一个很明显的问题，所有的拦截都在方法执行前被处理了。



# 优化 2：灵活指定前后

上面的动态代理确实可以把代理类中的业务逻辑抽离出来，但是我们注意到，只有前置代理，无法做到前后代理，所以还需要在优化下。

所以需要做更一步的抽象，

**把拦截对象信息进行封装，作为拦截器拦截方法的参数，把拦截目标对象真正的执行方法放到Interceptor中完成，这样就可以实现前后拦截，并且还能对拦截对象的参数等做修改。**


## 实现思路

### 代理类上下文

设计一个 Invocation 对象。

```java
public class Invocation {

    /**
     * 目标对象
     */
    private Object target;
    /**
     * 执行的方法
     */
    private Method method;
    /**
     * 方法的参数
     */
    private Object[] args;

    public Invocation(Object target, Method method, Object[] args) {
        this.target = target;
        this.method = method;
        this.args = args;
    }

    /**
     * 执行目标对象的方法
     */
    public Object process() throws Exception{
        return method.invoke(target,args);
    }

    // 省略 Getter/Setter

}
```

### 调整接口

- Interceptor.java

```java
public interface Interceptor {

    /**
     * 具体拦截处理
     */
    Object intercept(Invocation invocation) throws Exception;

}
```

- 日志实现

```java
public class MyLogInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Exception {
        System.out.println("------插入前置通知代码-------------");
        Object result = invocation.process();
        System.out.println("------插入后置处理代码-------------");
        return result;
    }

}
```

### 重新实现代理类

```java
public class MyInvocationHandler implements InvocationHandler {

    private Object target;

    private Interceptor interceptor;

    public MyInvocationHandler(Object target, Interceptor interceptor) {
        this.target = target;
        this.interceptor = interceptor;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Invocation invocation = new Invocation(target, method, args);
        // 返回的依然是代理类的结果
        return interceptor.intercept(invocation);
    }

    public static Object wrap(Object target, Interceptor interceptor) {
        MyInvocationHandler targetProxy = new MyInvocationHandler(target, interceptor);
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                target.getClass().getInterfaces(),
                targetProxy);
    }

}
```

最核心的就在于构建了 invocation，然后执行对应的方法。

## 测试

- 代码

```java
public static void main(String[] args) {
    HelloService target = new HelloServiceImpl();
    Interceptor interceptor = new MyLogInterceptor();
    HelloService targetProxy = (HelloService) MyInvocationHandler.wrap(target, interceptor);
    targetProxy.sayHello();
}
```

- 日志

```
------插入前置通知代码-------------
sayHello......
------插入后置处理代码-------------
```

# 优化 3：划清界限

上面这样就能实现前后拦截，并且拦截器能获取拦截对象信息。

但是测试代码的这样调用看着很别扭，对应目标类来说，只需要了解对他插入了什么拦截就好。

再修改一下，在拦截器增加一个插入目标类的方法。

## 实现

### 接口调整

```java
public interface Interceptor {

    /**
     * 具体拦截处理
     *
     * @return 方法执行的结果
     * @since 0.0.2
     */
    Object intercept(Invocation invocation) throws Exception;

    /**
     * 插入目标类
     *
     * @return 代理
     * @since 0.0.2
     */
    Object plugin(Object target);

}
```

### 实现调整

可以理解为把静态方法调整为对象方法。

```java
public class MyLogInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Exception {
        System.out.println("------插入前置通知代码-------------");
        Object result = invocation.process();
        System.out.println("------插入后置处理代码-------------");
        return result;
    }

    @Override
    public Object plugin(Object target) {
        return MyInvocationHandler.wrap(target, this);
    }

}
```

## 测试

- 代码

```java
public static void main(String[] args) {
    HelloService target = new HelloServiceImpl();
    Interceptor interceptor = new MyLogInterceptor();
    HelloService targetProxy = (HelloService) interceptor.plugin(target);
    targetProxy.sayHello();
}
```

- 日志

```
------插入前置通知代码-------------
sayHello......
------插入后置处理代码-------------
```

# 责任链模式

## 多个拦截器如何处理?

### 测试代码

```java
public static void main(String[] args) {
    HelloService target = new HelloServiceImpl();
    //1. 拦截器1
    Interceptor interceptor = new MyLogInterceptor();
    target = (HelloService) interceptor.plugin(target);
    //2. 拦截器 2
    Interceptor interceptor2 = new MyTransactionInterceptor();
    target = (HelloService) interceptor2.plugin(target);
    // 调用
    target.sayHello();
}
```


其中 MyTransactionInterceptor 实现如下：

```java
public class MyTransactionInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Exception {
        System.out.println("------tx start-------------");
        Object result = invocation.process();
        System.out.println("------tx end-------------");
        return result;
    }

    @Override
    public Object plugin(Object target) {
        return MyInvocationHandler.wrap(target, this);
    }

}
```

日志如下：

```
------tx start-------------
------插入前置通知代码-------------
sayHello......
------插入后置处理代码-------------
------tx end-------------
```

当然很多小伙伴看到这里其实已经想到使用责任链模式，下面我们一起来看一下责任链模式。

# 责任链模式

## 责任链模式

```java
public class InterceptorChain {

    private List<Interceptor> interceptorList = new ArrayList<>();

    /**
     * 插入所有拦截器
     */
    public Object pluginAll(Object target) {
        for (Interceptor interceptor : interceptorList) {
            target = interceptor.plugin(target);
        }
        return target;
    }

    public void addInterceptor(Interceptor interceptor) {
        interceptorList.add(interceptor);
    }
    /**
     * 返回一个不可修改集合，只能通过addInterceptor方法添加
     * 这样控制权就在自己手里
     */
    public List<Interceptor> getInterceptorList() {
        return Collections.unmodifiableList(interceptorList);
    }
}
```

## 测试

```java
public static void main(String[] args) {
    HelloService target = new HelloServiceImpl();

    Interceptor interceptor = new MyLogInterceptor();
    Interceptor interceptor2 = new MyTransactionInterceptor();
    InterceptorChain chain = new InterceptorChain();
    chain.addInterceptor(interceptor);
    chain.addInterceptor(interceptor2);

    target = (HelloService) chain.pluginAll(target);
    // 调用
    target.sayHello();
}
```

- 日志

```
------tx start-------------
------插入前置通知代码-------------
sayHello......
------插入后置处理代码-------------
------tx end-------------
```

# 个人的思考

## 拦截器是否可以改进？

实际上个人感觉这里可以换一种角度，比如定义拦截器接口时，改为：

这样可以代码中可以不用写执行的部分，实现起来更加简单，也不会忘记。

```java
public interface Interceptor {

    /**
     * 具体拦截处理
     */
    void before(Invocation invacation);

    /**
     * 具体拦截处理
     */
    void after(Invocation invacation);

}
```

## 抽象实现

对于 plugin() 这个方法，实际上实现非常固定。

应该对于接口不可见，直接放在 chain 中统一处理即可。



# 参考资料

[Mybatis框架(8)---Mybatis插件原理(代理+责任链)](https://www.cnblogs.com/qdhxhz/p/11390778.html)

* any list
{:toc}