---
layout: post
title: spring-01-spring 如何直接对一个类进行增强？让其实现新的接口 @DeclareParents
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, aop, cglib, sh]
published: true
---

# 背景

想对 runnable 这些类进行增强。

# @DeclareParents的作用

@DeclareParents注解是spring AOP（切面）功能提供一种组件，它可以在代理目标类上增加新的行为(新增新的方法)。

可能你看到这里会有点蒙，没关系我们看下面的栗子，应该就清楚明白了。

## @DeclareParents的应用demo

首先我们先通过一张图简单的理解一下，@DeclareParents注解实现的思路(注: 该图来源于《Spring in action中文版》一书，想要资料可以联系我)。

![png](https://img-blog.csdnimg.cn/20210506152121135.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1N3aDEyMzQ1Njc=,size_16,color_FFFFFF,t_70)


## 被代理的类(现有的行为-方法)

```java
package com.swh.test.delareParents;

/**
 *  现有行为方法
 */
public interface IPay {
	void pay();
}
```

```java
package com.swh.test.delareParents;

import org.springframework.stereotype.Component;

@Component("wechatPay")
public class WechatPay implements IPay{
	@Override
	public void pay() {
		System.out.println("wechat pay");
	}
}
```

## 代理增强类

```java
package com.swh.test.delareParents;

/**
 *  增强的行为方法
 */
public interface IPayEnhance {
	void payType();
}
```

```java
package com.swh.test.delareParents;

import org.springframework.stereotype.Component;

/**
 *  增强类的实现
 */
@Component
public class WechatPayEnhance implements IPayEnhance{
	@Override
	public void payType() {
		System.out.println("this pay type is wechat!");
	}
}
```

## 组装类

```java
package com.swh.test.delareParents;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.DeclareParents;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PayAspectJ {

	@DeclareParents(value = "com.swh.test.delareParents.IPay+",defaultImpl = WechatPayEnhance.class)
	public IPayEnhance wechatPayEnhance;
}
```

## bean的配置类

```java
package com.swh.test.delareParents;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@ComponentScan
@EnableAspectJAutoProxy
public class AnnotationConfig {
}
```

@EnableAspectJAutoProxy 注解的作用启用AspectJ自动代理，会为使用@Aspect注解的bean创建一个代理，如果没有这个注解，则从spring获取bean时获取的原始类，本栗子中代理的是 IPay 接口。spring在创建WechatPay 类时，会创建一个代理类。

## 调用者

```java
package com.swh.test;

import com.swh.test.delareParents.IPay;
import com.swh.test.delareParents.IPayEnhance;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class TestAA {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext annotationConfigApplicationContext = new AnnotationConfigApplicationContext("com.swh.test");
		IPay wechatPay = (IPay) annotationConfigApplicationContext.getBean("wechatPay");
		wechatPay.pay();
		IPayEnhance wechatPayEnhance = (IPayEnhance) wechatPay;
		wechatPayEnhance .payType();
	}
}
```

### 执行结果分析

![执行结果分析](https://img-blog.csdnimg.cn/20210506160257486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1N3aDEyMzQ1Njc=,size_16,color_FFFFFF,t_70)


根据执行过程中的debug可见，从spring容器中获取的wechatPay bean是一个代理对象，并且实现了两个接口，分别是IPay 和 IPayEnhance ,因此这个代理类则拥有了IPay和IPayEnhance两种接口的行为。

## @DeclareParents 的结构

@DeclareParents注解由三部分组成：

value 属性指定了哪种类型的bean要引入新的接口行为。(注:本栗子中value是IPay 并在IPay后面多了一个+,该+标识IPay下面的所有子类型，而不是IPay本身)

defaultImpl 属性指定了新提供的行为接口的实现类。本栗子我们引入的是WechatPayEnhance类

@DeclareParents 标注的类标识需要引入的新提供的行为接口

## @DeclareParents 小结

@DecalereParents 可以为已经存在的Bean扩展新的行为方法，有的人会问为什么不直接在原始的接口中新加方法。

当然这种也是可以的，但是这样做有个问题，加入原始接口下面有好多实现类，则需要对所有的实现类进行修改。

这样做功能能够完成，但是从设计角度来看并不是最好的做法。

**况且有的时候根本没有机会修改所有的实现类，比如假如引用的原始类是第三方提供的并且没有源码。这种情况就没有办法通过直接扩展原始类来解决问题**。

当然还有其他的的应用场景，大家有什么不同的见解或者有不明白的地方，可以在评论区留言评论，我们一起交流。

# chat

## Q1-还有其他方法吗？通过 spring aop 能实现吗

Spring AOP 默认情况下只能代理基于接口的类，而无法直接拦截类中的方法。然而，你可以通过一些技巧来尝试在 Spring AOP 中拦截类的方法，尽管这可能会有限制和局限性。

一种方法是创建一个包装类来实现 `java.util.concurrent.Executor` 接口，然后将实际的 `Executor` 对象委托给这个包装类。你可以在包装类中实现接口的方法，并在方法内部调用实际的 `Executor` 方法。这样，你可以使用 Spring AOP 拦截这个包装类的方法。

以下是一个示例，演示如何通过包装类和 Spring AOP 来拦截 `java.util.concurrent.Executor` 的方法：

1. **创建包装类：** 创建一个实现了 `java.util.concurrent.Executor` 接口的包装类。

```java
import java.util.concurrent.Executor;

public class ExecutorWrapper implements Executor {
    private Executor actualExecutor;

    public ExecutorWrapper(Executor actualExecutor) {
        this.actualExecutor = actualExecutor;
    }

    @Override
    public void execute(Runnable command) {
        // 在方法调用前添加逻辑
        System.out.println("Before executing Executor method.");

        // 调用实际的 Executor 方法
        actualExecutor.execute(command);

        // 在方法调用后添加逻辑
        System.out.println("After executing Executor method.");
    }
}
```

2. **创建切面类：** 创建一个 Spring AOP 切面类，拦截包装类的方法。

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.DeclareParents;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ExecutorAspect {

    @DeclareParents(value = "java.util.concurrent.Executor+", defaultImpl = ExecutorWrapper.class)
    private static Executor mixin;
}
```

在这个示例中，我们使用了 `@DeclareParents` 注解将 `ExecutorWrapper` 类添加到所有实现了 `java.util.concurrent.Executor` 接口的类中。

虽然这个方法能够让你在 Spring AOP 中拦截 `java.util.concurrent.Executor` 接口的方法，但也需要你进行包装和代理，可能会引入一些额外的复杂性。

如果需要更广泛和深入的方法拦截功能，你可能需要考虑使用 AspectJ 等更强大的 AOP 框架。


## Q2-详细解释一下 @DeclareParents

`@DeclareParents` 是 AspectJ 提供的一个注解，也在 Spring AOP 中得到了支持。它用于向现有类引入新的接口和/或增加新的字段。

当你希望给一个现有的类引入新的接口，但又不想修改这个类的源代码时，就可以使用 `@DeclareParents` 注解。这在一些情况下非常有用，特别是当你希望在 AOP 切面中拦截这个新接口的方法。

下面是 `@DeclareParents` 注解的详细解释：

```java
@DeclareParents(value = "目标类型", defaultImpl = 默认实现类)
```

- `value`：这个属性指定了目标类型，即你希望引入新接口的类或一组类。你可以使用 AspectJ 切点表达式来匹配目标类型。
- `defaultImpl`：这个属性指定了默认的实现类，它是一个实现了新引入接口的默认行为的类。当目标类型在运行时被代理时，将会使用这个实现类。

`@DeclareParents` 注解的作用是在编译时为目标类型生成一个新的子类，这个子类包含了新引入的接口的实现。然后，通过 Spring AOP 或 AspectJ，可以将这个新的子类用作目标对象，从而实现对新接口方法的拦截。

以下是一个更完整的示例，演示如何使用 `@DeclareParents` 注解在 Spring AOP 中引入新接口：

```java
public interface MyInterface {
    void myMethod();
}

public class MyClass {
    // 原始类，不实现 MyInterface
}

@Aspect
@Component
public class InterfaceIntroductionAspect {

    @DeclareParents(value = "com.example.MyClass", defaultImpl = MyInterfaceImpl.class)
    private MyInterface mixin;
}

public class MyInterfaceImpl implements MyInterface {
    @Override
    public void myMethod() {
        System.out.println("Intercepted method call through introduced interface.");
    }
}

// 在其他类中
@Component
public class MainService {
    @Autowired
    private MyClass myClass;

    public void invokeMyMethod() {
        myClass.myMethod(); // 这里实际上调用的是 MyInterfaceImpl 的方法
    }
}
```

在上述示例中，通过 `@DeclareParents` 注解，我们为 `MyClass` 引入了 `MyInterface` 接口，实现了新接口的方法。

这样，在 `MainService` 中，调用 `myClass.myMethod()` 实际上调用的是 `MyInterfaceImpl` 的方法。

## Q3-如何使用 @DeclareParents 的方式，对 Runnable 进行增强？

使用 `@DeclareParents` 来为 `java.lang.Runnable` 接口引入新接口并增强它的功能，可以通过以下步骤完成：

1. **定义新接口：** 首先，你需要定义一个新的接口，该接口将包含你希望在 `Runnable` 上引入的新方法。

```java
public interface EnhancedRunnable {
    void beforeRun();

    void afterRun();
}
```

2. **实现新接口：** 创建一个实现了 `EnhancedRunnable` 接口的类，实现新接口的方法。

```java
public class EnhancedRunnableImpl implements EnhancedRunnable {
    @Override
    public void beforeRun() {
        System.out.println("Before run");
    }

    @Override
    public void afterRun() {
        System.out.println("After run");
    }
}
```

3. **创建切面：** 使用 `@DeclareParents` 注解来为 `java.lang.Runnable` 接口引入新接口。

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.DeclareParents;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RunnableIntroductionAspect {

    @DeclareParents(value = "java.lang.Runnable+", defaultImpl = EnhancedRunnableImpl.class)
    private EnhancedRunnable mixin;
}
```

在这个示例中，我们使用 `@DeclareParents` 注解来为 `java.lang.Runnable` 接口引入 `EnhancedRunnable` 接口，同时指定了默认的实现类 `EnhancedRunnableImpl`。

4. **使用增强后的接口：** 现在你可以使用增强后的 `EnhancedRunnable` 接口，并调用新增的方法。

```java
public class Main {
    public static void main(String[] args) {
        EnhancedRunnable enhancedRunnable = new EnhancedRunnableImpl();
        
        enhancedRunnable.beforeRun();
        
        Runnable runnable = (Runnable) enhancedRunnable;
        runnable.run();
        
        enhancedRunnable.afterRun();
    }
}
```

在上述示例中，我们创建了一个对象，既实现了 `EnhancedRunnable` 接口，也是 `Runnable` 接口的实现类。

我们可以调用 `EnhancedRunnable` 的新增方法，同时在 `run` 方法执行前后，会触发 `EnhancedRunnable` 接口中的方法。





# 小结

# 参考资料

chat

[@DeclareParents注解详解](https://blog.csdn.net/Swh1234567/article/details/116454743)

* any list
{:toc}