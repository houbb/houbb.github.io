---
layout: post
title:  Reflection-08-dynamic proxy 动态代理
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——动态代理

使用Java Reflection可以在运行时创建接口的动态实现。 

您可以使用java.lang.reflect.Proxy类来实现。 

这个类的名称就是我将这些动态接口实现称为动态代理的原因。 

动态代理可以用于许多不同的目的，例如 数据库连接和事务管理，用于单元测试的动态模拟对象，以及其他类似AOP的方法拦截目的。

# 创建动态代理

您可以使用Proxy.newProxyInstance() 方法创建动态代理。 

## 方法入参

newProxyInstance()方法有3个参数：

1. 要加载动态代理类的ClassLoader。

2. 要实现的接口数组。

3. 一个InvocationHandler，用于转发代理上的所有方法调用。

这是一个例子：

```java
InvocationHandler handler = new MyInvocationHandler();
MyInterface proxy = (MyInterface) Proxy.newProxyInstance(
                            MyInterface.class.getClassLoader(),
                            new Class[] { MyInterface.class },
                            handler);
```

运行此代码后，代理变量包含MyInterface接口的动态实现。 

对代理的所有调用都将转发到通用InvocationHandler接口的处理程序实现。 

我将在下一节介绍InvocationHandler。

# InvocationHandler。

如前所述，您必须将InvocationHandler实现传递给Proxy.newProxyInstance()方法。 

对动态代理的所有方法调用都将转发到此InvocationHandler实现。 

以下是InvocationHandler接口的外观：

```java
public interface InvocationHandler{
  Object invoke(Object proxy, Method method, Object[] args)
         throws Throwable;
}
```

## 实现的例子

```java
public class MyInvocationHandler implements InvocationHandler{

  public Object invoke(Object proxy, Method method, Object[] args)
  throws Throwable {
    //do something "dynamic"
  }
}
```

传递给invoke() 方法的代理参数是实现接口的动态代理对象。 

通常，您不需要此对象。

传递给invoke() 方法的Method对象表示动态代理实现的接口上调用的方法。 

从Method对象中，您可以获取方法名称，参数类型，返回类型等。有关详细信息，请参阅方法文本。

Object[] args数组包含在调用实现的接口中的方法时传递给代理的参数值。 

注意：实现的接口中的基本类型（int，long等）包装在它们的对象（Integer，Long等）中。

# 使用场景

已知动态代理至少用于以下目的：

数据库连接和事务管理

用于单元测试的动态模拟对象

DI容器适应自定义工厂接口

类似AOP的方法拦截

## 数据库连接和事务管理

Spring框架有一个事务代理，可以为您启动和提交/回滚事务。 

在高级连接和事务划分和传播的文本中更详细地描述了它的工作原理，因此我将仅简要描述它。 

序列成为这样的事情：

```
web controller --> proxy.execute(...);
  proxy --> connection.setAutoCommit(false);
  proxy --> realAction.execute();
    realAction does database work
  proxy --> connection.commit();
```

## 用于单元测试的动态模拟对象

Butterfly测试工具利用动态代理来实现单元测试的动态存根，模拟和代理。

当测试使用另一个类B（真正的接口）的类A时，可以将B的模拟实现传递给A而不是真实B.现在记录B上的所有方法调用，并且可以设置模拟B的返回值是要回来了。
   
此外，Butterfly 测试工具允许您将真实B包装在模拟B中，以便记录模拟上的所有方法调用，然后转发到真实B.

这使得可以检查在实际功能B上调用的方法例如，

如果测试DAO，您可以在模拟中包装数据库连接。 

DAO不会看到差异，DAO可以照常读/写数据到数据库，因为模拟转发所有对数据库的调用。

但是现在你可以通过模拟检查DAO是否正确使用了连接，

例如，如果你调用了connection.close()（或者没有调用），那么你是否可以。通常无法根据DAO的返回值来确定。

## DI容器适应自定义工厂接口

依赖注入容器Butterfly Container具有强大的功能，允许您将整个容器注入由它生成的bean中。 

但是，由于您不希望依赖容器接口，因此容器能够适应您设计的自定义工厂接口。 

你只需要  interface，没有实现。 

因此工厂界面和您的类看起来像这样：

```java
public interface IMyFactory {
  Bean   bean1();
  Person person();
  ...
}

public class MyAction{

  protected IMyFactory myFactory= null;

  public MyAction(IMyFactory factory){
    this.myFactory = factory;
  }

  public void execute(){
    Bean bean = this.myFactory.bean();
    Person person = this.myFactory.person();
  }

}
```

当MyAction类调用由容器注入其构造函数的IMyFactory实例上的方法时，

方法调用将转换为对IContainer.instance() 方法的调用，该方法是用于从容器中获取实例的方法。 

这样，对象可以在运行时使用Butterfly Container作为工厂，而不是仅在创建时将依赖项注入其自身。 

而且这与任何Butterfly Container特定接口没有任何依赖关系。

## 类似AOP的方法拦截

Spring框架可以拦截对给定bean的方法调用，前提是bean实现了一些接口。 

Spring框架将bean包装在动态代理中。 

然后，代理拦截对bean的所有调用。 

代理可以决定在将方法调用委托给包装的bean之前，代替或之后调用其他对象上的其他方法。

# 参考资料

http://tutorials.jenkov.com/java-reflection/dynamic-proxies.html

