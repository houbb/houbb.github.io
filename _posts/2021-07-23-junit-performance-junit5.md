---
layout: post
title: 基于 junit5 实现 junitperf 源码分析
date: 2021-07-23 21:01:55 +0800
categories: [Test]
tags: [test, junit, sh]
published: true
---

# 前言

上一节介绍了基于 junit4 实现 [junitperf](https://github.com/houbb/junitperf)，但是可以发现定义变量的方式依然不够优雅。

那可以让用户使用起来更加自然一些吗？

有的，junit5 为我们带来了更加强大的功能。

拓展阅读：

[浅谈性能测试](https://houbb.github.io/2021/07/23/junit-performance-overview)

[基于 junit4 分析 junitperf 源码，junit4 99% 的人都不知道的秘密！](https://houbb.github.io/2021/07/23/junit-performance-junit4)

![junit5](https://img-blog.csdnimg.cn/cc90ab578e154833b6e9970d1ce3d9d4.jpg)

## 没有对比，就没有伤害

我们首先回顾一下 junit4 的写法：

```java
public class HelloWorldTest {

    @Rule
    public JunitPerfRule junitPerfRule = new JunitPerfRule();

    /**
     * 单一线程，执行 1000ms，默认以 html 输出测试结果
     * @throws InterruptedException if any
     */
    @Test
    @JunitPerfConfig(duration = 1000)
    public void helloWorldTest() throws InterruptedException {
        System.out.println("hello world");
        Thread.sleep(20);
    }

}
```

再看一下 junit5 的写法：

```java
public class HelloWorldTest {

    @JunitPerfConfig(duration = 1000)
    public void helloTest() throws InterruptedException {
        Thread.sleep(100);
        System.out.println("Hello Junit5");
    }

}
```

JunitPerfRule 竟然神奇的消失了？这一切是怎么做到的呢？

让我们一起揭开 junit5 神秘的面纱。

# Junit5 更加强大的特性

## @JunitPerfConfig

我们只是指定了一个简单的 `@JunitPerfConfig` 注解，那么问题一定就出在这个注解里。

定义如下：

```java
import java.lang.annotation.*;

/**
 * 执行接口
 * 对于每一个测试方法的条件配置
 * @author bbhou
 * @version 1.0.0
 * @since 1.0.0
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.ANNOTATION_TYPE, ElementType.METHOD})

@ExtendWith(PerfConfigProvider.class)
@TestTemplate
public @interface JunitPerfConfig {

    // 属性省略

}
```

`@Retention` 和 `@Target` 属于 java 中的常规注解，此处不做赘述。

我们重点看一下剩余的两个注解。

### @TestTemplate

我们以前在写单元测试的时候，都会写一个 `@Test` 注解，你会发现 junit5 中连这个注解都省略了。

那么，他去哪里了呢？

答案就是 `@TestTemplate` 声明的注解，就是用来标识这个方法是单元测试的方法，idea 也会认的，这一点非常的灵活强大。

### @ExtendWith

这个注解，给我们的注解进行了赋能。

看名字，就是一个拓展，拓展的实现，就是我们指定的类 PerfConfigProvider

## PerfConfigProvider

我们来看一下 PerfConfigProvider 的实现。

```java
public class PerfConfigProvider implements TestTemplateInvocationContextProvider {

    @Override
    public boolean supportsTestTemplate(ExtensionContext context) {
        return context.getTestMethod()
                .filter(m -> AnnotationSupport.isAnnotated(m, JunitPerfConfig.class))
                .isPresent();
    }

    @Override
    public Stream<TestTemplateInvocationContext> provideTestTemplateInvocationContexts(ExtensionContext context) {
        return Stream.of(new PerfConfigContext(context));
    }

}
```

实现非常简单，首先是一个过滤。

只有定义了 `@JunitPerfConfig` 注解的方法，才会生效。

下面就是我们自定义实现的上下文 PerfConfigContext。

## PerfConfigContext

PerfConfigContext 实现了 TestTemplateInvocationContext，并且对原生的 ExtensionContext 进行了简单的封装。
 
```java
public class PerfConfigContext implements TestTemplateInvocationContext {

    // 省略内部属性

    @Override
    public List<Extension> getAdditionalExtensions() {
        return Collections.singletonList(
                (TestInstancePostProcessor) (testInstance, context) -> {
                    final Class clazz = testInstance.getClass();
                    // Group test contexts by test class
                    ACTIVE_CONTEXTS.putIfAbsent(clazz, new ArrayList<>());

                    EvaluationContext evaluationContext = new EvaluationContext(testInstance,
                            method,
                            DateUtil.getCurrentDateTimeStr());
                    evaluationContext.loadConfig(perfConfig);
                    evaluationContext.loadRequire(perfRequire);
                    StatisticsCalculator statisticsCalculator = perfConfig.statistics().newInstance();
                    Set<Reporter> reporterSet = getReporterSet();
                    ACTIVE_CONTEXTS.get(clazz).add(evaluationContext);
                    try {
                        new PerformanceEvaluationStatement(evaluationContext,
                                statisticsCalculator,
                                reporterSet,
                                ACTIVE_CONTEXTS.get(clazz),
                                clazz).evaluate();
                    } catch (Throwable throwable) {
                        throw new JunitPerfRuntimeException(throwable);
                    }
                }
        );
    }
}
```

写到这里，我们就会发现又回到了和 junit4 相似的地方。

不明白的小伙伴可以去看一下原来的实现，这里不做赘述。

剩下的部分，和原来  junit4 的实现都是一致的。


# 小结

可以发现 junit5 为我们提供的拓展能力更加强大灵活，他可以让我们定义属于自己的注解。

这个注解用起来让用户和使用原有的 junit5 注解没有什么区别。

不得不感慨一句，长江后浪推前浪，前浪死在沙滩上。

# 参考资料

https://github.com/houbb/junitperf

https://github.com/junit-team/junit4/wiki/Rules

* any list
{:toc}