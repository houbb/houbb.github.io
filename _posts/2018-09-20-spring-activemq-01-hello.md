---
layout: post
title: Spring 整合 ActiveMQ-01-入门
date:  2018-09-20 09:35:26 +0800
categories: [MQ]
tags: [java, spring, mq, jms, sh]
published: true
excerpt: Spring 整合 ActiveMQ 入门教程
---

# Spring ActiveMQ 整合实战

## 基础知识

[JMS](https://houbb.github.io/2017/09/17/jms)

[ActiveMQ](https://houbb.github.io/2017/06/07/activemq)

# 实战代码

## 环境准备

启动 activeMQ，本次测试使用 [docker](https://houbb.github.io/2018/09/17/docker-activemq)。

## 项目结构

```
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── github
    │   │           └── houbb
    │   │               └── jms
    │   │                   └── learn
    │   │                       └── activemq
    │   │                           └── spring
    │   │                               ├── listener
    │   │                               │   └── ConsunerMessageListener.java
    │   │                               └── service
    │   │                                   ├── ProducerService.java
    │   │                                   └── impl
    │   │                                       └── ProducerServiceImpl.java
    │   └── resources
    │       └── application-mq.xml
    └── test
        └── java
            └── com
                └── github
                    └── houbb
                        └── jms
                            └── learn
                                └── activemq
                                    └── spring
                                        └── ActiveMQTest.java
```

## maven jar 引入

- pom.xml

```xml
<properties>
    <spring.version>4.2.5.RELEASE</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jms</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>javax.annotation</groupId>
        <artifactId>jsr250-api</artifactId>
        <version>1.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.activemq</groupId>
        <artifactId>activemq-core</artifactId>
        <version>5.7.0</version>
    </dependency>
</dependencies>
```

## 文件配置

- application-mq.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
     http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
     http://www.springframework.org/schema/context
     http://www.springframework.org/schema/context/spring-context-3.0.xsd
    http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd">

    <!--扫描路径-->
    <context:component-scan base-package="com.github.houbb.jms.learn.activemq.spring"/>

    <!-- Spring提供的JMS工具类，它可以进行消息发送、接收等 -->
    <bean id="jmsTemplate" class="org.springframework.jms.core.JmsTemplate">
        <!-- 这个connectionFactory对应的是我们定义的Spring提供的那个ConnectionFactory对象 -->
        <property name="connectionFactory" ref="connectionFactory"/>
    </bean>

    <!-- 真正可以产生Connection的ConnectionFactory，由对应的 JMS服务厂商提供-->
    <bean id="targetConnectionFactory" class="org.apache.activemq.ActiveMQConnectionFactory">
        <property name="brokerURL" value="tcp://127.0.0.1:61616"/>
    </bean>

    <!-- Spring用于管理真正的ConnectionFactory的ConnectionFactory -->
    <bean id="connectionFactory" class="org.springframework.jms.connection.SingleConnectionFactory">
        <!-- 目标ConnectionFactory对应真实的可以产生JMS Connection的ConnectionFactory -->
        <property name="targetConnectionFactory" ref="targetConnectionFactory"/>
    </bean>

    <!--这个是队列目的地-->
    <bean id="queueDestination" class="org.apache.activemq.command.ActiveMQQueue">
        <constructor-arg>
            <value>queue</value>
        </constructor-arg>
    </bean>

    <!-- 消息监听器 -->
    <bean id="consumerMessageListener" class="com.github.houbb.jms.learn.activemq.spring.listener.ConsunerMessageListener"/>

    <!-- 消息监听容器 -->
    <bean id="jmsContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory" />
        <property name="destination" ref="queueDestination" />
        <property name="messageListener" ref="consumerMessageListener" />
    </bean>

</beans>
```

## 实现代码

- ProducerService 接口及其实现

```java
public interface ProducerService {

    /**
     * 发送消息
     * @param msg 消息
     */
    void sendMsg(final String msg);

}
```

```java
import com.github.houbb.jms.learn.activemq.spring.service.ProducerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Service;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

@Service
public class ProducerServiceImpl implements ProducerService {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    private Destination destination;

    @Override
    public void sendMsg(String msg) {
        System.out.println("生产者发了一个消息：" + msg);
        jmsTemplate.send(destination, new MessageCreator() {
            @Override
            public Message createMessage(Session session) throws JMSException {
                return session.createTextMessage(msg);
            }
        });
    }
}
```

- ConsunerMessageListener  消息监听器

```java
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.TextMessage;

public class ConsunerMessageListener implements MessageListener {

    @Override
    public void onMessage(Message message) {
        //这里我们知道生产者发送的就是一个纯文本消息，所以这里可以直接进行强制转换
        TextMessage textMsg = (TextMessage) message;
        System.out.println("接收到一个纯文本消息。");
        try {
            System.out.println("消息内容是：" + textMsg.getText());
        } catch (JMSException e) {
            e.printStackTrace();
        }
    }
}
```

## 测试

- ActiveMQTest.java

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:application-mq.xml"})
public class ActiveMQTest {

    @Autowired
    private ProducerService producerService;

    @Test
    public void sendTest() {
        producerService.sendMsg("hello spring activeMQ!");
    }
}
```

- 测试日志

```
生产者发了一个消息：hello spring activeMQ!
接收到一个纯文本消息。
消息内容是：hello spring activeMQ!
```

# 源码地址

[spring-activemq-hello](https://github.com/houbb/jms-learn/tree/master/jms-activemq/jms-activemq-spring)

# 参考资料

[Spring 整合 JMS](http://elim.iteye.com/blog/1893038)

[消息监听器 MessageListener](http://elim.iteye.com/blog/1893676)

[消息转换器 MessageConverter](http://elim.iteye.com/blog/1900937)

[事务管理](http://elim.iteye.com/blog/1983532)

[ActiveMQ第二弹:使用Spring JMS与ActiveMQ通讯](https://www.cnblogs.com/huang0925/p/3558690.html)

* any list
{:toc}