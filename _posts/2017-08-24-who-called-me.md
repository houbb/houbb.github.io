---
layout: post
title: java 方法调用链
date:  2017-8-24 15:33:49 +0800
categories: [Java]
tags: [java, thread]
published: true
---

# 缘起

对所有的调用做入参拦截，为了更便于查阅，希望可以得到方法的签名( MethodSignature ).

一、AOP

此时，想获取拦截的方法名称较为简单。

> [spring aop获取目标对象的方法对象（包括方法上的注解）](http://www.cnblogs.com/qiumingcheng/p/5923928.html)

```java
@Around("pointcut()")    
public Object introcepter(ProceedingJoinPoint pjp) throws Throwable{    
    System.out.println("拦截到了" + pjp.getSignature().getName() +"方法...");    
}   
```

二、普通方式

如果我们单独写了一个方法( `methodInterceptor()` )，然后在各个方法中调用。我们想得到是那些方法调用了 `methodInterceptor()`。

我们应该怎么做呢？

此处将答案先放在前面。

```java
public class MethodCallUtilTest {

    private void methodInterceptor() {
        String className = Thread.currentThread().getStackTrace()[2].getClassName();    //调用的类
        String methodName = Thread.currentThread().getStackTrace()[2].getMethodName();  //调用的方法
        int lineNumber = Thread.currentThread().getStackTrace()[2].getLineNumber(); //调用的行号

        System.out.println(className);
        System.out.println(methodName);
        System.out.println(lineNumber);
    }

    private void call() {
        methodInterceptor();
    }

    @Test
    public void callTest() {
        new MethodCallUtilTest().call();
    }
}
```

run callTest(), 结果为:

```
com.ryo.jdk.test.jdk7.old.util.MethodCallUtilTest
call
21
```

# 解释

一、Thread.currentThread().getStackTrace() 是什么？
  
我们对方法 methodInterceptor() 进行如下修改：

```java
private void methodInterceptor() {
    StackTraceElement[] stackTraceElements = Thread.currentThread().getStackTrace();
    for(StackTraceElement stackTraceElement : stackTraceElements) {
        System.out.println(stackTraceElement);
    }
}
```

再次运行测试，结果如下：

```
java.lang.Thread.getStackTrace(Thread.java:1559)
com.ryo.jdk.test.jdk7.old.util.MethodCallUtilTest.methodInterceptor(MethodCallUtilTest.java:13)
com.ryo.jdk.test.jdk7.old.util.MethodCallUtilTest.call(MethodCallUtilTest.java:20)
com.ryo.jdk.test.jdk7.old.util.MethodCallUtilTest.callSayTest(MethodCallUtilTest.java:25)
sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
java.lang.reflect.Method.invoke(Method.java:498)
org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:50)
org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:47)
org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
org.junit.runners.ParentRunner.runLeaf(ParentRunner.java:325)
org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:78)
org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:57)
org.junit.runners.ParentRunner$3.run(ParentRunner.java:290)
org.junit.runners.ParentRunner$1.schedule(ParentRunner.java:71)
org.junit.runners.ParentRunner.runChildren(ParentRunner.java:288)
org.junit.runners.ParentRunner.access$000(ParentRunner.java:58)
org.junit.runners.ParentRunner$2.evaluate(ParentRunner.java:268)
org.junit.runners.ParentRunner.run(ParentRunner.java:363)
org.junit.runner.JUnitCore.run(JUnitCore.java:137)
com.intellij.junit4.JUnit4IdeaTestRunner.startRunnerWithArgs(JUnit4IdeaTestRunner.java:68)
com.intellij.rt.execution.junit.IdeaTestRunner$Repeater.startRunnerWithArgs(IdeaTestRunner.java:51)
com.intellij.rt.execution.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:242)
com.intellij.rt.execution.junit.JUnitStarter.main(JUnitStarter.java:70)

Process finished with exit code 0
```

你对于这个应该很熟悉，虽然大部分是在异常的时候才会见到。这就是 java 方法的一个调用链。

这句 `Thread.currentThread().getStackTrace()[2]` 就可以拿到调用当前方法的元素信息。

二、调整

如果我们想获取方法的签名单独写一个方法，应该怎么做呢？

- methodInterceptor()

```java
private void methodInterceptor() {
    String methodSignature = buildCallMethodSignature();
    System.out.println(methodSignature);
}
```

- buildCallMethodSignature()

```java
/**
 * 构建调用当前方法的方法签名
 * @return
 */
private String buildCallMethodSignature() {
    StackTraceElement[] stackTraceElements = Thread.currentThread().getStackTrace();
    String className = stackTraceElements[3].getClassName();
    String methodName = stackTraceElements[3].getMethodName();
    return String.format("%s.%s", className, methodName);
}
```

测试结果:

```
com.ryo.jdk.test.jdk7.old.util.MethodCallUtilTest.call

Process finished with exit code 0
```

# 获取当前执行的方法和类

## 代码

可以直接获得对应的类和方法信息：

```java
Thread.currentThread().getStackTrace()[1].getMethodName();
Thread.currentThread().getStackTrace()[1].getCLass();
```



# 简单思考

- 可以用作日志打印


* any list
{:toc}












