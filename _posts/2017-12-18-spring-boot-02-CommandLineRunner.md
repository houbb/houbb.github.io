---
layout: post
title:  Spring Boot-02-启动时执行任务 CommandLineRunner
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, spring, springboot]
published: true
---

# 定时执行

我们经常需要在服务启动之后去执行一些任务。

定时执行任务，我们可以使用 [ScheduledThreadPoolExecutor](https://houbb.github.io/2019/01/18/jcip-25-executor-scheduledThreadPoolExecutor)。

那任务的触发入口怎么办呢？

# CommandLineRunner

SpringBoot 提供的一种简单的实现方案就是添加一个model并实现CommandLineRunner接口，实现功能的代码放在实现的run方法中

## 接口

```java
public interface CommandLineRunner {

	/**
	 * Callback used to run the bean.
	 * @param args incoming main method arguments
	 * @throws Exception on error
	 */
	void run(String... args) throws Exception;

}
```

## 示例代码

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MyStartupRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>>>>>>>>>>>>>>服务启动执行，执行加载数据等操作<<<<<<<<<<<<<");
    }

}
```

# 多个实现的顺序指定

如果有多个类实现CommandLineRunner接口，如何保证顺序?

SpringBoot在项目启动后会遍历所有实现CommandLineRunner的实体类并执行run方法，如果需要按照一定的顺序去执行，
那么就需要在实体类上使用一个 `@Order` 注解（或者实现 Ordered 接口）来表明顺序

## @Order 注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD})
@Documented
public @interface Order {

	/**
	 * The order value.
	 * <p>Default is {@link Ordered#LOWEST_PRECEDENCE}.
	 * @see Ordered#getOrder()
	 */
	int value() default Ordered.LOWEST_PRECEDENCE;

}
```

## Order 接口

```java
public interface Ordered {

	/**
	 * Useful constant for the highest precedence value.
	 * @see java.lang.Integer#MIN_VALUE
	 */
	int HIGHEST_PRECEDENCE = Integer.MIN_VALUE;

	/**
	 * Useful constant for the lowest precedence value.
	 * @see java.lang.Integer#MAX_VALUE
	 */
	int LOWEST_PRECEDENCE = Integer.MAX_VALUE;


	/**
	 * Get the order value of this object.
	 * <p>Higher values are interpreted as lower priority. As a consequence,
	 * the object with the lowest value has the highest priority (somewhat
	 * analogous to Servlet {@code load-on-startup} values).
	 * <p>Same order values will result in arbitrary sort positions for the
	 * affected objects.
	 * @return the order value
	 * @see #HIGHEST_PRECEDENCE
	 * @see #LOWEST_PRECEDENCE
	 */
	int getOrder();

}
```

## 使用案例

直接将 `@Order` 注解加在方法之上。
 
```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(value=2)
public class MyStartupRunner1 implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>>>>>>>>>>>>>>服务启动执行 2222 <<<<<<<<<<<<<");
    }

}
```

# 小结

CommandLineRunner 这个特性非常的好用，老马也经常在工作中使用。

用于在 springboot 启动时，初始化一些配置等操作，用起来非常方便。

本实战系列用于记录 springboot 的实际使用和学习笔记。

拓展阅读：

面试官：知道 springboot 的启动原理吗？

希望本文对比有所帮助，如果喜欢，欢迎点赞转发收藏一波。

我是老马，期待与你的下次相遇。

# 参考资料

[springboot启动时执行任务CommandLineRunner](https://www.cnblogs.com/myblogs-miller/p/9046425.html)

* any list
{:toc}
