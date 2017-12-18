---
layout: post
title:  Spring State Machine
date:  2017-12-18 21:29:39 +0800
categories: [Spring]
tags: [spring]
published: true
---


# Spring State Machine

[Spring Statemachine](https://projects.spring.io/spring-statemachine/) is a framework for application developers to 
use state machine concepts with Spring applications.

[状态机](http://blog.csdn.net/eager7/article/details/8517827/)是强大的，因为行为总是保证是一致的，使得调试相对容易。

其思想是，您的应用程序可能存在于有限数量的状态中，并且某些预定义的触发器可以将您的应用程序从一个状态转移到下一个状态。这样的触发器可以基于事件或计时器。

在应用程序之外定义高级逻辑更容易，然后依赖于状态机来管理状态。您可以通过发送事件、侦听更改或简单地请求当前状态与状态机交互。


> [状态机模式](https://www.cnblogs.com/hellocsl/p/4000122.html)

> [1.2.7.RELEASE doc](https://docs.spring.io/spring-statemachine/docs/1.2.7.RELEASE/reference/htmlsingle/)


# Quick Start

> [使用 Spring StateMachine 框架实现状态机](http://www.jianshu.com/p/326bd3ac2bf2?winzoom=1)

> [完整代码示例](https://github.com/houbb/spring-data/tree/master/spring-statemachine)


下面演示一个入门例子，后续可能会深入学习。

## 项目结构

```
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── spring
    │   │               └── statemachine
    │   │                   ├── Application.java
    │   │                   ├── config
    │   │                   │   └── StateMachineConfig.java
    │   │                   └── enums
    │   │                       ├── Events.java
    │   │                       └── States.java
```

## 文件内容

- pom.xml

指定引入的 jar

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>
    <artifactId>spring-statemachine</artifactId>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.3.7.RELEASE</version>
        <relativePath/>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.statemachine</groupId>
            <artifactId>spring-statemachine-core</artifactId>
            <version>1.2.0.RELEASE</version>
        </dependency>
    </dependencies>

</project>
```


- Events.java & States.java

定义枚举常量

```java
public enum  Events {
    PAY,        // 支付
    RECEIVE     // 收货
}
```

```java
public enum  States {
    UNPAID,                 // 待支付
    WAITING_FOR_RECEIVE,    // 待收货
    DONE                    // 结束
}
```

- StateMachineConfig.java

核心功能的定义

```java
import com.ryo.spring.statemachine.enums.Events;
import com.ryo.spring.statemachine.enums.States;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.listener.StateMachineListener;
import org.springframework.statemachine.listener.StateMachineListenerAdapter;
import org.springframework.statemachine.transition.Transition;

import java.util.EnumSet;

/**
 * 创建状态机配置类
 *
 * 注解 @EnableStateMachine 注解用来启用 Spring StateMachine状态机功能
 */
@Configuration
@EnableStateMachine
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<States, Events> {

    private Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * configure(StateMachineStateConfigurer<States, Events> states)方法用来初始化当前状态机拥有哪些状态，
     * 其中initial(States.UNPAID)定义了初始状态为待支付UNPAID，
     * states(EnumSet.allOf(States.class))则指定了使用上一步中定义的所有状态作为该状态机的状态定义。
     *
     * @param states
     * @throws Exception
     */
    @Override
    public void configure(StateMachineStateConfigurer<States, Events> states)
            throws Exception {
        states.withStates()
                .initial(States.UNPAID)                //初始状态 定义了初始状态为待支付UNPAID，
                .states(EnumSet.allOf(States.class));  //则指定了使用上一步中定义的所有状态作为该状态机的状态定义。
    }

    /**
     * configure(StateMachineTransitionConfigurer<States, Events> transitions)方法用来初始化当前状态机有哪些状态迁移动作，
     * 其中命名中我们很容易理解每一个迁移动作，都有来源状态source，目标状态target以及触发事件event。
     *
     * @param transitions StateMachineTransitionConfigurer<States, Events>
     * @throws Exception
     */
    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions.withExternal()
                .source(States.UNPAID).target(States.WAITING_FOR_RECEIVE)// 指定状态来源和目标
                .event(Events.PAY)    // 指定触发事件
                .and()
                .withExternal()
                .source(States.WAITING_FOR_RECEIVE).target(States.DONE)
                .event(Events.RECEIVE);
    }


    //     * configure(StateMachineConfigurationConfigurer<States, Events> config)方法为当前的状态机指定了状态监听器，
    //     * 其中listener()则是调用了下一个内容创建的监听器实例，
    //     * 用来处理各个各个发生的状态迁移事件。
    //     * @param config
    //     * @throws Exception
    @Override
    public void configure(StateMachineConfigurationConfigurer<States, Events> config)
            throws Exception {
        config.withConfiguration()
                .listener(listener());  // 指定状态机的处理监听器
    }

    //     * StateMachineListener<States, Events> listener()方法用来创建StateMachineListener状态监听器的实例，
    //     * 在该实例中会定义具体的状态迁移处理逻辑，上面的实现中只是做了一些输出，
    //     * 实际业务场景会有更复杂的逻辑，所以通常情况下，
    //     * 我们可以将该实例的定义放到独立的类定义中，并用注入的方式加载进来。
    //     * @return
    @Bean
    public StateMachineListener<States, Events> listener() {
        return new StateMachineListenerAdapter<States, Events>() {

            @Override
            public void transition(Transition<States, Events> transition) {
                if (transition.getTarget().getId() == States.UNPAID) {
                    logger.info("订单创建，待支付");
                    return;
                }
                if (transition.getSource().getId() == States.UNPAID
                        && transition.getTarget().getId() == States.WAITING_FOR_RECEIVE) {
                    logger.info("用户完成支付，待收货");
                    return;
                }

                if (transition.getSource().getId() == States.WAITING_FOR_RECEIVE
                        && transition.getTarget().getId() == States.DONE) {
                    logger.info("用户已收货，订单完成");
                    return;
                }
            }

        };
    }
}
```

- Application.java

```java
import com.ryo.spring.statemachine.enums.Events;
import com.ryo.spring.statemachine.enums.States;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.statemachine.StateMachine;

/**
* 
* 主运行程序
*/
@SpringBootApplication
public class Application implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Autowired
    private StateMachine<States, Events> stateMachine;

    /**
     * 在run函数中，我们定义了整个流程的处理过程，其中start()就是创建这个订单流程，根据之前的定义，
     * 该订单会处于待支付状态，然后通过调用sendEvent(Events.PAY)执行支付操作，
     * 最后通过掉用sendEvent(Events.RECEIVE)来完成收货操作。
     * @param args
     * @throws Exception
     */
    @Override
    public void run(String... args) throws Exception {
        stateMachine.start();
        stateMachine.sendEvent(Events.PAY);
        stateMachine.sendEvent(Events.RECEIVE);
    }
}
```

## 运行

直接运行 main() 方法，日志如下：

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.3.7.RELEASE)

2017-12-18 21:43:13.689  INFO 48716 --- [           main] com.ryo.spring.statemachine.Application  : Starting Application on houbinbindeMacBook-Pro.local with PID 48716 (/Users/houbinbin/IT/spring-data/spring-statemachine/target/classes started by houbinbin in /Users/houbinbin/IT/spring-data)
2017-12-18 21:43:13.693  INFO 48716 --- [           main] com.ryo.spring.statemachine.Application  : No active profile set, falling back to default profiles: default
2017-12-18 21:43:13.756  INFO 48716 --- [           main] s.c.a.AnnotationConfigApplicationContext : Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@47db50c5: startup date [Mon Dec 18 21:43:13 CST 2017]; root of context hierarchy
2017-12-18 21:43:14.379  INFO 48716 --- [           main] trationDelegate$BeanPostProcessorChecker : Bean 'org.springframework.statemachine.config.configuration.StateMachineAnnotationPostProcessorConfiguration' of type [class org.springframework.statemachine.config.configuration.StateMachineAnnotationPostProcessorConfiguration$$EnhancerBySpringCGLIB$$96e86ac4] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
2017-12-18 21:43:14.596  INFO 48716 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2017-12-18 21:43:14.600  INFO 48716 --- [           main] o.s.c.support.DefaultLifecycleProcessor  : Starting beans in phase 0
2017-12-18 21:43:14.611  INFO 48716 --- [           main] neConfig$$EnhancerBySpringCGLIB$$687c322 : 订单创建，待支付
2017-12-18 21:43:14.614  INFO 48716 --- [           main] o.s.s.support.LifecycleObjectSupport     : started org.springframework.statemachine.support.DefaultStateMachineExecutor@177bea38
2017-12-18 21:43:14.614  INFO 48716 --- [           main] o.s.s.support.LifecycleObjectSupport     : started DONE WAITING_FOR_RECEIVE UNPAID  / UNPAID / uuid=4890718d-b72e-4bcb-82bc-61b82950af93 / id=null
2017-12-18 21:43:14.619  INFO 48716 --- [           main] neConfig$$EnhancerBySpringCGLIB$$687c322 : 用户完成支付，待收货
2017-12-18 21:43:14.619  INFO 48716 --- [           main] neConfig$$EnhancerBySpringCGLIB$$687c322 : 用户已收货，订单完成
2017-12-18 21:43:14.621  INFO 48716 --- [           main] com.ryo.spring.statemachine.Application  : Started Application in 1.45 seconds (JVM running for 1.904)
2017-12-18 21:43:14.622  INFO 48716 --- [       Thread-1] s.c.a.AnnotationConfigApplicationContext : Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@47db50c5: startup date [Mon Dec 18 21:43:13 CST 2017]; root of context hierarchy
2017-12-18 21:43:14.623  INFO 48716 --- [       Thread-1] o.s.c.support.DefaultLifecycleProcessor  : Stopping beans in phase 0
2017-12-18 21:43:14.623  INFO 48716 --- [       Thread-1] o.s.s.support.LifecycleObjectSupport     : stopped org.springframework.statemachine.support.DefaultStateMachineExecutor@177bea38
2017-12-18 21:43:14.624  INFO 48716 --- [       Thread-1] o.s.s.support.LifecycleObjectSupport     : stopped DONE WAITING_FOR_RECEIVE UNPAID  /  / uuid=4890718d-b72e-4bcb-82bc-61b82950af93 / id=null
2017-12-18 21:43:14.624  INFO 48716 --- [       Thread-1] o.s.j.e.a.AnnotationMBeanExporter        : Unregistering JMX-exposed beans on shutdown
2017-12-18 21:43:14.625  INFO 48716 --- [       Thread-1] o.s.s.support.LifecycleObjectSupport     : destroy called
```


* any list
{:toc}
