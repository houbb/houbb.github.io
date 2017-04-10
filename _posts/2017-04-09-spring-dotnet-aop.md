---
layout: post
title:  Spring.NET-05-aop
date:  2017-04-09 22:48:05 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---


# AOP

[Aspect-Oriented Programming](http://www.springframework.net/docs/1.3.2/reference/html/aop.html) (AOP) complements OOP by providing another way of thinking about program structure.

AOP is used in Spring.NET:

- To provide declarative enterprise services, especially as a replacement for COM+ declarative services. 

The most important such service is declarative transaction management, which builds on Spring.NET's transaction abstraction. This functionality is planed for an upcoming release of Spring.NET

- To allow users to implement custom aspects, complementing their use of OOP with AOP.


# Concepts

一、基础概念


- Aspect

A modularization of a concern for which the implementation might otherwise cut across multiple objects. Transaction management is a good example of a crosscutting concern in enterprise applications. 
Aspects are implemented using Spring.NET as Advisors or interceptors.

- Joinpoint

Point during the execution of a program, such as a method invocation or a particular exception being thrown.

- Advice

Action taken by the AOP framework at a particular joinpoint. Different types of advice include "around," "before" and "throws" advice. Advice types are discussed below. Many AOP frameworks, including Spring.NET, 
model an advice as an interceptor, maintaining a chain of interceptors "around" the joinpoint.

- Pointcut

A set of joinpoints specifying when an advice should fire. An AOP framework must allow developers to specify pointcuts: for example, using regular expressions.

- Introduction

Adding methods or fields to an advised class. Spring.NET allows you to introduce new interfaces to any advised object. For example, you could use an introduction to make any object implement an IAuditable interface, 
to simplify the tracking of changes to an object's state.

- Target object

Object containing the joinpoint. Also referred to as advised or proxied object.

- AOP proxy

Object created by the AOP framework, including advice. In Spring.NET, an AOP proxy is a dynamic proxy that uses IL code generated at runtime.

- Weaving

Assembling aspects to create an advised object. This can be done at compile time (using the Gripper-Loom.NET compiler, for example), or at runtime. Spring.NET performs weaving at runtime.

二、不同类型

- Around advice

Advice that surrounds a joinpoint such as a method invocation. This is the most powerful kind of advice. Around advice will perform custom behaviour before and after the method invocation. 
They are responsible for choosing whether to proceed to the joinpoint or to shortcut executing by returning their own return value or throwing an exception.

- Before advice

Advice that executes before a joinpoint, but which does not have the ability to prevent execution flow proceeding to the joinpoint (unless it throws an exception).

- Throws advice

Advice to be executed if a method throws an exception. Spring.NET provides strongly typed throws advice, so you can write code that catches the exception (and subclasses) 
you're interested in, without needing to cast from Exception.

- After returning advice

Advice to be executed after a joinpoint completes normally: for example, if a method returns without throwing an exception.


# Quick Start
 
- ICommand.cs

```c#
public interface ICommand
{
    object Execute(object context);
}
```

- ServiceCommand.cs

```c#
public class ServiceCommand : ICommand
{
    public object Execute(object context)
    {
        Console.Out.WriteLine("Service implementation : [{0}]", context);
        return null;
    }
}
```

- ConsoleLoggingAroundAdvice.cs

```c#
public class ConsoleLoggingAroundAdvice : IMethodInterceptor
{
    public object Invoke(IMethodInvocation invocation)
    {
        Console.Out.WriteLine("Advice executing; calling the advised method..."); 

        object returnValue = invocation.Proceed();

        Console.Out.WriteLine("Advice executed; advised method returned " + returnValue); 

        return returnValue;
    }
}
```

调用

```c#
ProxyFactory factory = new ProxyFactory(new ServiceCommand());
factory.AddAdvice(new ConsoleLoggingAroundAdvice());
ICommand command = (ICommand)factory.GetProxy();
command.Execute("This is the argument");
```

运行结果

```
Advice executing; calling the advised method...

Service implementation : [This is the argument]

Advice executed; advised method returned 
```

当然，也可以使用 XML 声明的方式。(XML 比较实用，且复用性比较强)

```xml
<object id="consoleLoggingAroundAdvice"
        type="springNet.Aop.ConsoleLoggingAroundAdvice"/>

<object id="myServiceObject" type="Spring.Aop.Framework.ProxyFactoryObject">
    <property name="target">
        <object id="myServiceObjectTarget"
            type="springNet.Aop.ServiceCommand"/>
    </property>
    <property name="interceptorNames">
        <list>
            <value>consoleLoggingAroundAdvice</value>
        </list>
    </property>
</object>	
```

调用方式

```c#
IApplicationContext context = new XmlApplicationContext(
     "Resources/Objects.xml");
ICommand command = (ICommand)context["myServiceObject"];
command.Execute("Execute with xml");
```

结果

```
Advice executing; calling the advised method...

Service implementation : [Execute with xml]

Advice executed; advised method returned 
```


# Pointcuts 基础

假设方法改变如下，Advice 保持不变。

- ICommand.cs

```c#
public interface ICommand
{
    object Execute(object context);

    object LazyExecute(object context);
}
```

- ServiceCommand.cs

```c#
public class ServiceCommand : ICommand
{
    public object Execute(object context)
    {
        Console.Out.WriteLine("ServiceCommand Execute...{0}", context);
        return null;
    }

    public object LazyExecute(object context)
    {
        Console.Out.WriteLine("ServiceCommand LazyExecute...{0}", context);
        return null;
    }
}
```

运行如下测试

```c#
ProxyFactory factory = new ProxyFactory(new ServiceCommand());
factory.AddAdvice(new ConsoleLoggingAroundAdvice());
ICommand command = (ICommand)factory.GetProxy();
command.Execute("This is the argument");
command.LazyExecute("This is the argument");
```


结果

```
Advice executing; calling the advised method...

ServiceCommand Execute...This is the argument

Advice executed; advised method returned 

Advice executing; calling the advised method...

ServiceCommand LazyExecute...This is the argument

Advice executed; advised method returned 
```

可见，对于2个方法AOP都生效了。这很合情合理。

如果这个时候提出一个需求，要求只有 *LazyExecute()* 执行AOP，怎么办呢？


修改调用代码如下：

```c#
ProxyFactory factory = new ProxyFactory(new ServiceCommand());
factory.AddAdvisor(new DefaultPointcutAdvisor(
    new SdkRegularExpressionMethodPointcut("Lazy"),
    new ConsoleLoggingAroundAdvice()));
ICommand command = (ICommand)factory.GetProxy();
command.Execute("This is the argument");
command.LazyExecute("This is the argument");
```

可见，只有满足 Lazy 开头的方法，才会被匹配到。

```
ServiceCommand Execute...This is the argument

Advice executing; calling the advised method...

ServiceCommand LazyExecute...This is the argument

Advice executed; advised method returned 
```


使用 XML 的方式如下

```xml
<object id="consoleLoggingAroundAdvice"
        type="Spring.Aop.Support.RegularExpressionMethodPointcutAdvisor">
    <property name="pattern" value="Lazy"/>
    <property name="advice">
        <object type="springNet.Aop.ConsoleLoggingAroundAdvice"/>
    </property>
</object>
<object id="myServiceObject"
        type="Spring.Aop.Framework.ProxyFactoryObject">
    <property name="target">
        <object id="myServiceObjectTarget"
            type="springNet.Aop.ServiceCommand"/>
    </property>
    <property name="interceptorNames">
        <list>
            <value>consoleLoggingAroundAdvice</value>
        </list>
    </property>
</object>
```


# Pointcuts 进一步

一、Before advice

Before advice is just that... it is advice that runs before the target method invocation is invoked.
 
- ConsoleLoggingBeforeAdvice.cs

```c#
public class ConsoleLoggingBeforeAdvice : IMethodBeforeAdvice
{
    public void Before(MethodInfo method, object[] args, object target)
    {
        Console.Out.WriteLine("Intercepted call to this method : " + method.Name);
        Console.Out.WriteLine("    The target is               : " + target);
        Console.Out.WriteLine("    The arguments are           : ");

        if (args != null)
        {
            foreach (object arg in args)
            {
                Console.Out.WriteLine("\t: " + arg);
            }
        }
    }
}
```

call it

```c#
ProxyFactory factory = new ProxyFactory(new ServiceCommand());
factory.AddAdvice(new ConsoleLoggingBeforeAdvice());
ICommand command = (ICommand)factory.GetProxy();
command.Execute("Execute with before advice");
```


result is 

```
Intercepted call to this method : Execute

    The target is               : springNet.Aop.ServiceCommand

    The arguments are           : 

	: Execute with before advice

ServiceCommand Execute...Execute with before advice
```

当然也可以使用 XML 配置方式。

```xml
<object id="beforeAdvice"
	    type="springNet.Aop..ConsoleLoggingBeforeAdvice"/>

<object id="myServiceObject"
    type="Spring.Aop.Framework.ProxyFactoryObject">
    <property name="target">
        <object id="myServiceObjectTarget"
            type="springNet.Aop.ServiceCommand"/>
    </property>
    <property name="interceptorNames">
        <list>
            <value>beforeAdvice</value>
        </list>
    </property>
</object>
```


二、After Advice

类似。不赘述。


三、Throws advice

Throws advice is advice that executes when an advised method invocation throws an exception.












* any list
{:toc}
















