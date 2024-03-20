---
layout: post
title: schedule-05-Spring Schedule 入门介绍 @Scheduled 注解和 @EnableScheduling 注解
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---


# 入门例子

基于 spring 注解实现定时调度。

## maven 依赖

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.3.15</version> <!-- 版本号根据实际情况调整 -->
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context-support</artifactId>
    <version>5.3.15</version> <!-- 版本号根据实际情况调整 -->
</dependency>
```

## 代码

创建调度任务：

```java
package com.example.schedulingtasks;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

	private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

	@Scheduled(fixedRate = 5000)
	public void reportCurrentTime() {
		log.info("The time is now {}", dateFormat.format(new Date()));
	}
}
```

启用调度：

```java
package com.example.schedulingtasks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SchedulingTasksApplication {

	public static void main(String[] args) {
		SpringApplication.run(SchedulingTasksApplication.class);
	}
}
```

测试效果：

```
...
2019-10-02 12:07:35.659  INFO 28617 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 12:07:35
2019-10-02 12:07:40.659  INFO 28617 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 12:07:40
2019-10-02 12:07:45.659  INFO 28617 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 12:07:45
2019-10-02 12:07:50.657  INFO 28617 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 12:07:50
...
```

# 核心注解说明

`@Scheduled` 注解可以控制方法定时执行，其中有三个参数可选择：

1、fixedDelay 控制方法执行的间隔时间，是以上一次方法执行完开始算起，如上一次方法执行阻塞住了，那么直到上一次执行完，并间隔给定的时间后，执行下一次。

2、fixedRate 是按照一定的速率执行，是从上一次方法执行开始的时间算起，

如果上一次方法阻塞住了，下一次也是不会执行，但是在阻塞这段时间内累计应该执行的次数，当不再阻塞时，一下子把这些全部执行掉，而后再按照固定速率继续执行。

3、cron表达式可以定制化执行任务，但是执行的方式是与fixedDelay相近的，也是会按照上一次方法结束时间开始算起。

# chat

## 详细介绍一下 spring 的 @Schedule 注解和 @EnableScheduling

Spring框架提供了一系列用于简化任务调度的功能，其中包括`@Scheduled`注解和`@EnableScheduling`注解。

### `@Scheduled`注解

`@Scheduled`注解用于将一个方法标记为定时任务。被标记的方法将在指定的时间间隔或固定的时间点执行。该注解提供了一些属性来配置任务的执行时间。主要的属性包括：

- `cron`：用于配置基于Cron表达式的定时任务。Cron表达式是一种用于指定定时任务执行时间的语法。例如，`"0 * * * * *"`表示每分钟执行一次任务。
- `fixedDelay`：表示上一次任务执行结束到下一次任务执行开始之间的间隔时间，单位为毫秒。例如，`@Scheduled(fixedDelay = 5000)`表示每次任务执行结束后等待5秒钟再执行下一次任务。
- `fixedRate`：表示两次任务执行开始之间的时间间隔，单位为毫秒。例如，`@Scheduled(fixedRate = 10000)`表示每隔10秒钟执行一次任务。
- `initialDelay`：表示在应用启动后首次执行任务前的延迟时间，单位为毫秒。例如，`@Scheduled(initialDelay = 1000)`表示应用启动后延迟1秒钟后执行任务。

示例代码：

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MyScheduledTasks {

    @Scheduled(fixedRate = 5000)
    public void task1() {
        // 执行任务1
    }

    @Scheduled(cron = "0 * * * * *")
    public void task2() {
        // 执行任务2
    }
}
```

### `@EnableScheduling`注解

`@EnableScheduling`注解用于启用Spring的任务调度功能。通常，它被用于配置类上，以确保Spring在扫描组件时能够识别并注册定时任务。

在使用`@Scheduled`注解的类中，如果没有添加`@EnableScheduling`注解，定时任务将不会被执行。

示例代码：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class AppConfig {
    // 其他配置
}
```

通过使用`@Scheduled`和`@EnableScheduling`注解，可以方便地实现任务调度功能，而无需依赖外部的调度器。

## spring @Schedule 的注解实现原理？spring 如何实现扫描这个注解信息的？

Spring框架实现了基于注解的任务调度功能，其中`@Scheduled`注解就是用于标记定时任务的关键。

下面简要介绍一下`@Scheduled`注解的实现原理以及Spring如何扫描这个注解信息。

### `@Scheduled`注解的实现原理

1. **解析注解信息：** 当Spring容器启动时，会扫描所有被`@Scheduled`注解标记的方法，并解析这些注解信息。
  
2. **创建定时任务代理对象：** Spring会为每个被`@Scheduled`注解标记的方法创建一个定时任务代理对象，该对象封装了任务执行的相关信息。

3. **根据注解配置创建定时任务：** Spring根据注解中配置的定时任务执行策略（如`cron`、`fixedDelay`、`fixedRate`等），创建相应的定时任务，并将任务代理对象注册到任务调度器中。

4. **定时任务执行：** 当定时任务触发时间到达时，任务调度器会调用相应的定时任务代理对象，执行对应的任务方法。

### Spring如何扫描`@Scheduled`注解信息

Spring扫描`@Scheduled`注解信息的过程通常是由`@EnableScheduling`注解触发的。具体步骤如下：

1. **启用任务调度功能：** 在Spring配置类上使用`@EnableScheduling`注解来启用任务调度功能。这告诉Spring容器要扫描并处理定时任务相关的注解信息。

2. **组件扫描：** Spring容器启动时会扫描项目中所有的组件，包括带有`@Scheduled`注解的定时任务类。

3. **解析注解信息：** 扫描到带有`@Scheduled`注解的方法时，Spring会解析这些注解，生成相应的定时任务代理对象。

4. **注册定时任务：** Spring将生成的定时任务代理对象注册到任务调度器中，以便于后续按照配置执行定时任务。

总的来说，Spring通过组件扫描和注解解析，实现了对`@Scheduled`注解信息的扫描和处理。

同时，使用`@EnableScheduling`注解可以显式地告诉Spring容器要启用任务调度功能，从而触发相应的扫描和处理过程。

## 组件扫描： Spring容器启动时会扫描项目中所有的组件，包括带有@Scheduled注解的定时任务类。比如我想扫描一个自己定义的注解，要如何实现？

要实现扫描自定义的注解，你可以借助Spring提供的注解扫描机制和自定义注解。下面是一种实现方式：

1. **定义自定义注解：** 首先，你需要定义自己的注解。假设你想要定义一个名为`@CustomScheduled`的定时任务注解。

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CustomScheduled {
    String cron() default "";
}
```

2. **创建自定义注解的处理器：** 接下来，你需要编写一个处理器来处理被`@CustomScheduled`注解标记的方法。处理器将解析注解信息并注册定时任务。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Component;
import java.lang.reflect.Method;

@Component
public class CustomScheduledAnnotationProcessor implements SchedulingConfigurer {

    @Autowired
    private ApplicationContext applicationContext;

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        // 获取所有被 @CustomScheduled 注解标记的 bean 的 Class 对象
        String[] beanNames = applicationContext.getBeanNamesForAnnotation(CustomScheduled.class);
        for (String beanName : beanNames) {
            Class<?> targetClass = applicationContext.getType(beanName);
            Method[] methods = targetClass.getMethods();
            for (Method method : methods) {
                if (method.isAnnotationPresent(CustomScheduled.class)) {
                    CustomScheduled customScheduled = method.getAnnotation(CustomScheduled.class);
                    String cronExpression = customScheduled.cron();
                    // 注册定时任务
                    taskRegistrar.addCronTask(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                // 执行定时任务
                                method.invoke(applicationContext.getBean(targetClass));
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }, cronExpression);
                }
            }
        }
    }
}
```

3. **使用自定义注解：** 现在，你可以在你的定时任务类中使用`@CustomScheduled`注解来标记定时任务方法，并指定相应的Cron表达式。

```java
import org.springframework.stereotype.Component;

@Component
public class MyScheduledTasks {

    @CustomScheduled(cron = "0 * * * * *")
    public void task1() {
        // 执行任务1
    }

    @CustomScheduled(cron = "0/5 * * * * *")
    public void task2() {
        // 执行任务2
    }
}
```

4. **启用自定义注解扫描：** 最后，在你的Spring配置类上启用自定义注解的扫描，确保Spring容器能够找到并处理这些注解。

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class AppConfig {
    // 其他配置
}
```

通过这种方式，你可以定义和使用自己的定时任务注解，并通过Spring容器自动扫描和处理这些注解。

## spring 如何在启动时扫描自定义的注解

要在 Spring 启动时获取自定义注解并获取注解的具体信息，你可以使用 Spring 的 BeanPostProcessor 或 ApplicationContextInitializer 接口。这两种方法都允许你在 Spring 容器初始化阶段进行操作，可以用来获取类上的注解信息并进行后续处理。

下面分别介绍这两种方法的实现：

### 使用 BeanPostProcessor

1. 创建一个 BeanPostProcessor 实现类，实现 postProcessBeforeInitialization 或 postProcessAfterInitialization 方法。

```java
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

@Component
public class CustomAnnotationProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        // 在初始化之前处理
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        // 在初始化之后处理
        if (bean.getClass().isAnnotationPresent(MyCustomAnnotation.class)) {
            MyCustomAnnotation annotation = bean.getClass().getAnnotation(MyCustomAnnotation.class);
            // 获取注解信息并进行后续处理
            String value = annotation.value();
            // 进行后续处理
            // ...
        }
        return bean;
    }
}
```

2. 在获取注解信息后，你可以根据具体的业务逻辑进行后续处理。

### 使用 ApplicationContextInitializer

1. 创建一个 ApplicationContextInitializer 实现类，实现 initialize 方法。

```java
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class CustomAnnotationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        // 获取所有 Bean 的定义
        String[] beanNames = applicationContext.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            Class<?> beanClass = applicationContext.getType(beanName);
            if (beanClass != null && beanClass.isAnnotationPresent(MyCustomAnnotation.class)) {
                MyCustomAnnotation annotation = beanClass.getAnnotation(MyCustomAnnotation.class);
                // 获取注解信息并进行后续处理
                String value = annotation.value();
                // 进行后续处理
                // ...
            }
        }
    }
}
```

2. 在获取注解信息后，你可以根据具体的业务逻辑进行后续处理。

3. 在 Spring Boot 应用程序的配置类中注册这个 ApplicationContextInitializer。

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(MyApplication.class);
        application.addInitializers(new CustomAnnotationInitializer());
        application.run(args);
    }
}
```

通过上述方法，你可以在 Spring 启动时获取自定义注解并获取注解的具体信息，并根据业务需求进行后续处理。


## spring 调度底层是依赖 quartz 吗？核心实现原理是什么？

Spring的调度功能并不直接依赖于Quartz，而是通过TaskScheduler和TaskExecutor接口来实现任务调度。

Spring提供了多种实现这两个接口的类，可以根据需要选择适合的实现。

### 核心实现原理

1. **TaskScheduler接口：** TaskScheduler是Spring提供的任务调度器接口，定义了任务调度的标准操作。它的实现通常基于线程池，能够在指定的时间触发任务执行。

2. **TaskExecutor接口：** TaskExecutor是Spring提供的任务执行器接口，定义了任务执行的标准操作。它的实现通常也基于线程池，负责执行被调度的任务。

3. **调度器配置：** 在Spring中，可以通过配置来指定TaskScheduler和TaskExecutor的实现。常用的实现包括ThreadPoolTaskScheduler和ThreadPoolTaskExecutor。ThreadPoolTaskScheduler用于调度任务，ThreadPoolTaskExecutor用于执行任务。

4. **注解扫描：** 当启用了任务调度功能（通过@EnableScheduling注解），Spring容器会扫描项目中标记了@Scheduled注解的方法，并根据注解配置创建相应的定时任务。

5. **定时任务注册：** Spring将解析得到的定时任务信息注册到TaskScheduler中，即将需要执行的任务和执行策略（如cron表达式、fixedDelay、fixedRate等）关联起来。

6. **任务执行：** 当定时任务触发时间到达时，TaskScheduler根据注册的执行策略选择合适的任务，然后通过TaskExecutor执行任务。

通过这种方式，Spring实现了简单而灵活的任务调度功能，不依赖于Quartz等外部调度器。

这样做的好处是可以降低项目的复杂度，同时更好地集成到Spring应用中。然而，对于复杂的调度需求，也可以选择集成Quartz等外部调度框架来实现。


# 参考资料

https://blog.csdn.net/fly910905/article/details/79530709

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html

https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/scheduling.html

* any list
{:toc}