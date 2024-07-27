---
layout: post
title:  Spring.NET-05-aop 切面编程
date:  2017-04-09 22:48:05 +0800
categories: [Spring]
tags: [spring, dotnet]
published: true
---


# 面向切面编程 (AOP)

[面向切面编程](http://www.springframework.net/docs/1.3.2/reference/html/aop.html) (AOP) 通过提供另一种思考程序结构的方法来补充面向对象编程 (OOP)。

AOP 在 Spring.NET 中的使用：

- 提供声明式企业服务，特别是作为 COM+ 声明式服务的替代品。

最重要的服务是声明式事务管理，它建立在 Spring.NET 的事务抽象基础上。此功能计划在 Spring.NET 的即将发布版本中推出。

- 允许用户实现自定义方面，使用 AOP 补充 OOP 的使用。

## 概念

### 基础概念

- Aspect（切面）

对可能跨多个对象的关注点的模块化。事务管理是企业应用程序中跨领域关注点的一个很好的例子。切面在 Spring.NET 中实现为 Advisors 或拦截器。

- Joinpoint（连接点）

程序执行期间的一个点，例如方法调用或特定异常的抛出。

- Advice（通知）

AOP 框架在特定连接点采取的操作。不同类型的通知包括 "around"、"before" 和 "throws" 通知。通知类型将在下文讨论。包括 Spring.NET 在内的许多 AOP 框架将通知建模为拦截器，在连接点周围维护一条拦截器链。

- Pointcut（切入点）

指定通知应该触发的一组连接点。AOP 框架必须允许开发人员指定切入点，例如使用正则表达式。

- Introduction（引入）

向被通知的类添加方法或字段。Spring.NET 允许您将新接口引入任何被通知对象。例如，您可以使用引入使任何对象实现 IAuditable 接口，以简化对对象状态变化的跟踪。

- Target object（目标对象）

包含连接点的对象。也称为被通知对象或代理对象。

- AOP proxy（AOP 代理）

由 AOP 框架创建的对象，包括通知。在 Spring.NET 中，AOP 代理是使用在运行时生成的 IL 代码的动态代理。

- Weaving（织入）

组合切面以创建一个被通知对象。这可以在编译时完成（例如，使用 Gripper-Loom.NET 编译器），也可以在运行时完成。Spring.NET 在运行时进行织入。

### 不同类型

- Around advice（环绕通知）

环绕连接点（如方法调用）的通知。这是最强大的通知类型。环绕通知将在方法调用前后执行自定义行为。它们负责选择是否继续执行连接点，或通过返回自己的返回值或抛出异常来中断执行。

- Before advice（前置通知）

在连接点之前执行的通知，但不能阻止执行流继续到连接点（除非它抛出异常）。

- Throws advice（异常通知）

在方法抛出异常时执行的通知。Spring.NET 提供强类型的异常通知，因此您可以编写捕获您感兴趣的异常（及其子类）的代码，而无需从 Exception 转型。

- After returning advice（返回后通知）

在连接点正常完成后执行的通知：例如，如果方法返回而不抛出异常。

# 快速开始
 
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

执行调用：

```c#
ProxyFactory factory = new ProxyFactory(new ServiceCommand());
factory.AddAdvice(new ConsoleLoggingBeforeAdvice());
ICommand command = (ICommand)factory.GetProxy();
command.Execute("Execute with before advice");
```


结果为：

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

### After Advice（后置通知）

后置通知与前面提到的通知类型类似，当连接点完成后执行通知。无需详细说明。

### Throws Advice（异常通知）

异常通知是当被通知的方法调用抛出异常时执行的通知。

* any list
{:toc}