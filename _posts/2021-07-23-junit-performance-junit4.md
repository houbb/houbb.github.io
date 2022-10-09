---
layout: post
title: junit4 90% 的人都不知道的特性，详解 junitperf 的实现原理
date: 2021-07-23 21:01:55 +0800
categories: [Test]
tags: [test, junit, sh]
published: true
---

# 前言

上一节介绍了 [https://github.com/houbb/junitperf](https://github.com/houbb/junitperf) 的入门使用。

这一节我们从源码的角度，剖析一下其实现方式。

> [性能测试该怎么做？](https://houbb.github.io/2021/07/23/junit-performance-overview)

# Junit Rules

junit4 小伙伴们肯定不陌生，那么 junit rules 你听过说过吗？

![junit4-struct](https://img-blog.csdnimg.cn/ea8ed166546e43d5904433c7d00e9c59.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=,size_16,color_FFFFFF,t_70#pic_center)

要想基于 junit4 实现一个性能测试框架，最核心的一点在于理解 Junit Rules。

官方文档：[https://github.com/junit-team/junit4/wiki/Rules](https://github.com/junit-team/junit4/wiki/Rules)

## Rules 作用

规则允许非常灵活地添加或重新定义测试类中每个测试方法的行为。 

测试人员可以重用或扩展下面提供的规则之一，或者编写自己的规则。

## 自定义规则

ps: 下面的内容来自官方的例子。

大多数自定义规则可以作为 ExternalResource 规则的扩展来实现。 

但是，如果您需要有关所讨论的测试类或方法的更多信息，则需要实现 TestRule 接口。

```java
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

public class IdentityRule implements TestRule {
  @Override
  public Statement apply(final Statement base, final Description description) {
    return base;
  }
}
```

当然，实现 TestRule 的强大功能来自使用自定义构造函数的组合、向类添加方法以用于测试，以及将提供的 Statement 包装在新的 Statement 中。 

例如，考虑以下为每个测试提供命名记录器的测试规则：

```java
package org.example.junit;

import java.util.logging.Logger;

import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

public class TestLogger implements TestRule {
  private Logger logger;

  public Logger getLogger() {
    return this.logger;
  }

  @Override
  public Statement apply(final Statement base, final Description description) {
    return new Statement() {
      @Override
      public void evaluate() throws Throwable {
        logger = Logger.getLogger(description.getTestClass().getName() + '.' + description.getDisplayName());
        base.evaluate();
      }
    };
  }
}
```

然后这个规则就可以按照下面的方式使用：

```java
import java.util.logging.Logger;

import org.example.junit.TestLogger;
import org.junit.Rule;
import org.junit.Test;

public class MyLoggerTest {

  @Rule
  public final TestLogger logger = new TestLogger();

  @Test
  public void checkOutMyLogger() {
    final Logger log = logger.getLogger();
    log.warn("Your test is showing!");
  }

}
```

## 定义和使用

看了上面的例子，我们发现 junit4 中的自定义规则还是比较简单的。

定义方式：实现 TestRule 接口

使用方式；使用 `@Rule` 放在创建的内部属性上。

是不是很简单呢？

好了你已经学会 1+1=2 了，下面让我们来学习一下泰勒展开吧。

![算数入门](https://img-blog.csdnimg.cn/1c96353a2c6a41d4a912cd9af8d27a27.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=,size_16,color_FFFFFF,t_70#pic_center)

# 性能测试算法流程

如何统计一个方法的执行耗时呢？

相信你一定不会陌生，只需要在方法执行开始前和结束后各统计一个时间，然后差值就是耗时。

如何模拟多个线程调用呢？

使用 java 多线程执行进行模拟即可。

如何生成报告文件呢？

把上述统计的各个维度数据，结合生成对应的 html 等文件即可。

我们将要做的事情，就是把上面的点综合起来，然后结合 Junit4 Rules 实现即可。

听起来也不难不是吗？

下面，让我们来一起看一看实现源码吧。

# Rule 的入门

## 入门例子

我们首先看一个 junit4 的入门例子：

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

JunitPerfRule 就是我们前面提及的自定义规则。

## JunitPerfRule

实现如下：

```java
public class JunitPerfRule implements TestRule {

    //region private fields
    // 省略内部变量
    //endregion

    @Override
    public Statement apply(Statement statement, Description description) {
        Statement activeStatement = statement;
        JunitPerfConfig junitPerfConfig = description.getAnnotation(JunitPerfConfig.class);
        JunitPerfRequire junitPerfRequire = description.getAnnotation(JunitPerfRequire.class);

        if (ObjectUtil.isNotNull(junitPerfConfig)) {
            // Group test contexts by test class
            ACTIVE_CONTEXTS.putIfAbsent(description.getTestClass(), new HashSet<EvaluationContext>());

            EvaluationContext evaluationContext = new EvaluationContext(description.getMethodName(), DateUtil.getSimpleDateStr());
            evaluationContext.loadConfig(junitPerfConfig);
            evaluationContext.loadRequire(junitPerfRequire);
            ACTIVE_CONTEXTS.get(description.getTestClass()).add(evaluationContext);

            activeStatement = new PerformanceEvaluationStatement(evaluationContext,
                    statement,
                    statisticsCalculator,
                    reporterSet,
                    ACTIVE_CONTEXTS.get(description.getTestClass()),
                    description.getTestClass()
            );
        }

        return activeStatement;
    }

}
```

主要流程就是执行方法的时候，首先获取方法上的 `@JunitPerfConfig` 和 `@JunitPerfRequire` 注解信息，然后进行对应的执行统计。

## Statement

Statement 是 junit4 中执行最核心的一个对象。

可以发现，这里根据注解信息，对这个实现重写为 PerformanceEvaluationStatement。

PerformanceEvaluationStatement 的核心实现如下：

```java
/**
 * 性能测试 statement
 * @author 老马啸西风
 * @see com.github.houbb.junitperf.core.rule.JunitPerfRule 用于此规则
 */
public class PerformanceEvaluationStatement extends Statement {

    // 省略内部变量

    @Override
    public void evaluate() throws Throwable {
        List<PerformanceEvaluationTask> taskList = new LinkedList<>();

        try {
            EvaluationConfig evaluationConfig = evaluationContext.getEvaluationConfig();
            
            // 根据注解配置，创建对应的执行线程数
            for(int i = 0; i < evaluationConfig.getConfigThreads(); i++) {
                // 初始化执行任务
                PerformanceEvaluationTask task = new PerformanceEvaluationTask(evaluationConfig.getConfigWarmUp(),
                        statement, statisticsCalculator);
                Thread t = FACTORY.newThread(task);
                taskList.add(task);
                // 子线程执行任务
                t.start();
            }

            //主线程沉睡等待
            Thread.sleep(evaluationConfig.getConfigDuration());
        } finally {
            //具体详情，当执行打断时，被打断的任务可能已经开始执行(尚未执行完)，会出现主线程往下走，被打断的线程也在继续走的情况
            for(PerformanceEvaluationTask task : taskList) {
                task.setContinue(false);    //终止执行的任务
            }
        }

        // 更新统计信息
        evaluationContext.setStatisticsCalculator(statisticsCalculator);
        evaluationContext.runValidation();

        generateReportor();
    }

    /**
     * 报告生成
     */
    private synchronized void generateReportor() {
        for(Reporter reporter : reporterSet) {
            reporter.report(testClass, evaluationContextSet);
        }
    }

}
```

这里是最核心的实现部分，主流程如下：

（1）根据配置，创建对应的任务子线程

（2）根据配置，初始化子任务，并且执行

（3）主线程进行沉睡等待

（4）主线程沉睡结束，打断子线程自行，更新统计信息

（5）根据统计信息，生成对应的测试报告文件

## PerformanceEvaluationTask

子任务的实现也值得注意，核心实现如下：

```java
public class PerformanceEvaluationTask implements Runnable {

    /**
     * 热身时间
     */
    private long warmUpNs;

    /**
     * junit statement
     */
    private final Statement statement;

    /**
     * 统计计算者
     */
    private StatisticsCalculator statisticsCalculator;

    /**
     * 是否继续标志位
     */
    private volatile boolean isContinue;

    public PerformanceEvaluationTask(long warmUpNs, Statement statement, StatisticsCalculator statisticsCalculator) {
        this.warmUpNs = warmUpNs;
        this.statement = statement;
        this.statisticsCalculator = statisticsCalculator;
        this.isContinue = true; //默认创建时继续执行
    }

    @Override
    public void run() {
        long startTimeNs = System.nanoTime();
        long startMeasurements = startTimeNs + warmUpNs;
        while (isContinue) {
            evaluateStatement(startMeasurements);
        }
    }

    /**
     * 执行校验
     * @param startMeasurements 开始时间
     */
    private void evaluateStatement(long startMeasurements) {
        //0. 如果继续执行为 false，退出执行。
        if(!isContinue) {
            return;
        }

        //1. 准备阶段
        if (nanoTime() < startMeasurements) {
            try {
                statement.evaluate();
            } catch (Throwable throwable) {
                // IGNORE
            }
        } else {
            long startTimeNs = nanoTime();
            try {
                statement.evaluate();
                statisticsCalculator.addLatencyMeasurement(getCostTimeNs(startTimeNs));
                statisticsCalculator.incrementEvaluationCount();
            } catch (InterruptedException e) { // NOSONAR
                // IGNORE - no metrics
            } catch (Throwable throwable) {
                statisticsCalculator.incrementEvaluationCount();
                statisticsCalculator.incrementErrorCount();
                statisticsCalculator.addLatencyMeasurement(getCostTimeNs(startTimeNs));
            }
        }
    }

    /**
     * 获取消耗的时间(单位：毫秒)
     * @param startTimeNs 开始时间
     * @return 消耗的时间
     */
    private long getCostTimeNs(long startTimeNs) {
        long currentTimeNs = System.nanoTime();
        return currentTimeNs - startTimeNs;
    }

    //region getter & setter
    public boolean isContinue() {
        return isContinue;
    }

    public void setContinue(boolean aContinue) {
        isContinue = aContinue;
    }
    //endregion
}
```

这个任务，主要负责统计任务的耗时。

统计对应的成功数量、异常数量等。

通过 volatile 定义的 isContinue 变量，便于在主线程沉睡结束后，终止循环。

ps: 这里还是可以发现一个问题，如果 `statement.evaluate();` 已经开始执行了，那么无法被中断。这是一个可以改进的地方。

# 小结

本篇从 junit rules 讲起，分析了整个性能测试工具的实现原理。

总的来说，实现思路并不是很难，**所有复杂的应用，都是有简单的部分组成**。

文中为了便于大家理解，对源码部分做了大量简化。

如果想获取完整的源码，请前往开源地址：[https://github.com/houbb/junitperf](https://github.com/houbb/junitperf)。

我是老马，期待与你的下次重逢。

当然，也许你可以发现这种方式还是不够优雅，junit5 为我们提供了更加强大的功能，我们下一节将讲解 junit5 的实现方式。

# 参考资料

https://github.com/houbb/junitperf

https://github.com/junit-team/junit4/wiki/Rules

* any list
{:toc}