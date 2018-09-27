---
layout: post
title: Spring Statemachine
date:  2018-09-26 14:24:33 +0800
categories: [Spring]
tags: [web, spring, session, distributed, sh]
published: true
excerpt: Spring 状态机入门教程
---

# Spring Statemachine

它的主要功能是帮助开发者简化状态机的开发过程，让状态机结构更加层次化。

## 特性

Spring Statemachine旨在提供以下功能:

- 对于简单的用例，易于使用平坦的一级状态机。

- 分层状态机结构，简化复杂的状态配置。

- 状态机区域提供更复杂的状态配置。

- 触发器、转换、保护和操作的使用。

- 类型安全配置适配器。

- 构建器模式，用于在Spring应用程序上下文之外方便地实例化

- 常用用例的配方

- 分布式状态机基于一个动物园管理员

- 状态机事件监听器。

- UML Eclipse Papyrus建模。

- 将机器配置存储在持久存储中。

- Spring IOC集成以将bean与状态机关联。

状态机很强大，因为行为总是被保证是一致的，这使得调试相对容易。

这是因为操作规则是在机器启动时写死的。

其思想是，应用程序可能以有限的状态存在，某些预定义的触发器可以将应用程序从一种状态带到另一种状态。这样的触发器可以基于事件或计时器。

在应用程序之外定义高级逻辑，然后依赖状态机来管理状态，这要容易得多。

您可以通过发送事件、侦听更改或简单地请求当前状态与状态机交互。

# 快速开始

## 项目结构

```
.
└── com
    └── github
        └── houbb
            └── spring
                └── boot
                    └── statemachine
                        ├── Application.java
                        ├── config
                        │   └── StateMachineConfig.java
                        └── constant
                            ├── Events.java
                            └── States.java
```

## 文件配置

- pom.xml

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.statemachine</groupId>
        <artifactId>spring-statemachine-core</artifactId>
        <version>2.0.0.RELEASE</version>
    </dependency>
</dependencies>
```

## 代码编写

- 状态定义

```java
public enum  States {

    // 待支付
    UNPAID,

    // 待收货
    WAITING_FOR_RECEIVE,

    // 结束
    DONE
}
```

- 事件定义

```java
public enum Events {
    /**
     * 支付   会触发状态从待支付 UNPAID 状态到待收货 WAITING_FOR_RECEIVE 状态的迁移，
     */
    PAY,
    /**
     * 收货   会触发状态从待收货 WAITING_FOR_RECEIVE 状态到结束 DONE 状态的迁移。
     */
    RECEIVE
}
```

- StateMachineConfig.java

```java
import com.github.houbb.spring.boot.statemachine.constant.Events;
import com.github.houbb.spring.boot.statemachine.constant.States;

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

@Configuration
@EnableStateMachine
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<States, Events> {

    private Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * 初始化当前状态机拥有哪些状态
     * @param states
     * @throws Exception
     */
    @Override
    public void configure(StateMachineStateConfigurer<States, Events> states)
            throws Exception {
        states.withStates()
                .initial(States.UNPAID)
                .states(EnumSet.allOf(States.class));
    }

    /**
     * 方法用来初始化当前状态机有哪些状态迁移动作，其中命名中我们很容易理解每一个迁移动作，都有来源状态source，
     * 目标状态target以及触发事件event。
     * @param transitions
     * @throws Exception
     */
    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions.withExternal()
                .source(States.UNPAID).target(States.WAITING_FOR_RECEIVE)
                .event(Events.PAY)
                .and()
                .withExternal()
                .source(States.WAITING_FOR_RECEIVE).target(States.DONE)
                .event(Events.RECEIVE);
    }

    /**
     * 方法为当前的状态机指定了状态监听器
     * @param config
     * @throws Exception
     */
    @Override
    public void configure(StateMachineConfigurationConfigurer<States, Events> config)
            throws Exception {
        config.withConfiguration()
                .listener(listener());
    }

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
import com.github.houbb.spring.boot.statemachine.constant.Events;
import com.github.houbb.spring.boot.statemachine.constant.States;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.statemachine.StateMachine;

@SpringBootApplication
public class Application implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Autowired
    private StateMachine<States, Events> stateMachine;

    @Override
    public void run(String... args) throws Exception {
        stateMachine.start();
        stateMachine.sendEvent(Events.PAY);
        stateMachine.sendEvent(Events.RECEIVE);
    }
}
```

## 测试日志

```
...
2018-09-26 16:47:52.273  INFO 29446 --- [           main] o.s.c.support.DefaultLifecycleProcessor  : Starting beans in phase 0
2018-09-26 16:47:52.284  INFO 29446 --- [           main] eConfig$$EnhancerBySpringCGLIB$$1dfef0ee : 订单创建，待支付
2018-09-26 16:47:52.287  INFO 29446 --- [           main] o.s.s.support.LifecycleObjectSupport     : started org.springframework.statemachine.support.DefaultStateMachineExecutor@528c868
2018-09-26 16:47:52.288  INFO 29446 --- [           main] o.s.s.support.LifecycleObjectSupport     : started UNPAID WAITING_FOR_RECEIVE DONE  / UNPAID / uuid=064443bf-d8e4-44b0-9ae9-b06c57cc5620 / id=null
2018-09-26 16:47:52.293  INFO 29446 --- [           main] eConfig$$EnhancerBySpringCGLIB$$1dfef0ee : 用户完成支付，待收货
2018-09-26 16:47:52.294  INFO 29446 --- [           main] eConfig$$EnhancerBySpringCGLIB$$1dfef0ee : 用户已收货，订单完成
2018-09-26 16:47:52.296  INFO 29446 --- [           main] c.g.h.s.boot.statemachine.Application    : Started Application in 11.139 seconds (JVM running for 11.67)
2018-09-26 16:47:52.297  INFO 29446 --- [       Thread-2] s.c.a.AnnotationConfigApplicationContext : Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@4516af24: startup date [Wed Sep 26 16:47:51 CST 2018]; root of context hierarchy
2018-09-26 16:47:52.298  INFO 29446 --- [       Thread-2] o.s.c.support.DefaultLifecycleProcessor  : Stopping beans in phase 0
2018-09-26 16:47:52.299  INFO 29446 --- [       Thread-2] o.s.s.support.LifecycleObjectSupport     : stopped org.springframework.statemachine.support.DefaultStateMachineExecutor@528c868
2018-09-26 16:47:52.299  INFO 29446 --- [       Thread-2] o.s.s.support.LifecycleObjectSupport     : stopped UNPAID WAITING_FOR_RECEIVE DONE  /  / uuid=064443bf-d8e4-44b0-9ae9-b06c57cc5620 / id=null
...
```

# 个人感受

这个在状态流转中比较适合使用。

可以使得代码逻辑变得清晰优雅。

# 参考资料

https://projects.spring.io/spring-statemachine/

http://blog.didispace.com/spring-statemachine/

* any list
{:toc}