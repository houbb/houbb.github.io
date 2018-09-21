---
layout: post
title: Spring 整合 ActiveMQ-04-事务管理
date:  2018-09-20 09:35:26 +0800
categories: [MQ]
tags: [java, spring, mq, jms, sh]
published: true
excerpt: Spring 整合 ActiveMQ 入门教程
---

# 事务管理

对于使用过 spring 管理数据库相关操作的，肯定都知道数据库事务。

对于 JMS，Spring 同样也提供了事务支持。

## 事务的管理

Spring提供了一个JmsTransactionManager，用于管理单个JMS ConnectionFactory的事务。这允许JMS应用程序利用Spring的托管事务特性，如第17章事务管理所述。JmsTransactionManager执行本地资源事务，将指定的ConnectionFactory的JMS连接/会话对绑定到线程。JmsTemplate自动检测这种事务性资源，并相应地对其进行操作。

在Java EE环境中，ConnectionFactory将共享连接和会话，以便在事务之间高效地重用这些资源。在独立环境中，使用Spring的SingleConnectionFactory将导致共享JMS连接，每个事务都有自己的独立会话。或者，考虑使用特定于提供者的池适配器，比如ActiveMQ的PooledConnectionFactory类。

JmsTemplate还可以与JtaTransactionManager和支持xa的JMS ConnectionFactory一起用于执行分布式事务。注意，这需要使用JTA事务管理器以及正确配置了xa的ConnectionFactory!(检查Java EE服务器/ JMS提供程序的文档。)

在使用JMS API从连接创建会话时，跨托管和非托管事务环境重用代码可能会令人困惑。这是因为JMS API只有一个工厂方法来创建会话，并且它需要事务和确认模式的值。在托管环境中，设置这些值是环境的事务性基础结构的责任，因此这些值被供应商的包装器忽略到JMS连接。在非托管环境中使用JmsTemplate时，可以通过使用sessionTransacted和session确认emode属性来指定这些值。当使用带有JmsTemplate的PlatformTransactionManager时，总是会给模板一个事务性JMS会话。

## 本地事务管理

每个消息侦听器调用将在活动JMS事务中操作，并在侦听器执行失败时回滚消息接收。

发送响应消息(通过SessionAwareMessageListener)将是同一本地事务的一部分，但是任何其他资源操作(如数据库访问)将独立操作。

这通常需要在侦听器实现中进行重复的消息检测，包括数据库处理已经提交但消息处理没有提交的情况。

### 实现

实现起来非常简单，添加 `<property name="sessionTransacted" value="true"/>` 即可。

```xml
<bean id="jmsContainer" class="org.springframework.jms.listener.DefaultMessageListenerContainer">
    <property name="connectionFactory" ref="connectionFactory"/>
    <property name="destination" ref="destination"/>
    <property name="messageListener" ref="messageListener"/>
    <property name="sessionTransacted" value="true"/>
</bean>
```

## 分布式事务

如果需要外部事务，则需要通过 `JtaTransactionManager`。

但是实战中见过的较少，此处跳过。

# 代码示例

## 代码

- TxProducerServiceImpl.java

```java
@Service
public class TxProducerServiceImpl implements ProducerService {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    @Qualifier("queueDestination")
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

- TxConsumerMessageListener.java

```java
public class TxConsumerMessageListener implements MessageListener {

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

        // 模拟异常
        throw new RuntimeException();
    }
}
```

## 配置

- application-mq-tx.xml

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
    <context:component-scan base-package="com.github.houbb.jms.learn.activemq.spring.tx"/>

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
    <bean id="txConsumerMessageListener"
          class="com.github.houbb.jms.learn.activemq.spring.tx.TxConsumerMessageListener"/>

    <!-- 消息监听容器 -->
    <bean id="jmsContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory"/>
        <property name="destination" ref="queueDestination"/>
        <property name="messageListener" ref="txConsumerMessageListener"/>
        <property name="sessionTransacted" value="true"/>
    </bean>

</beans>
```

## 测试

### 测试代码

- ActiveMQTxTest.java

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:application-mq-tx.xml"})
public class ActiveMQTxTest {

    @Autowired
    private ProducerService producerService;

    @Test
    public void sendTest() {
        producerService.sendMsg("hello spring jms local tx!");
    }

}
```

### 测试日志

- 第一次异常测试

```
生产者发了一个消息：hello spring jms local tx!
接收到一个纯文本消息。
消息内容是：hello spring jms local tx!
Sep 21, 2018 12:49:57 PM org.springframework.jms.listener.DefaultMessageListenerContainer invokeErrorHandler
警告: Execution of JMS message listener failed, and no ErrorHandler has been set.
java.lang.RuntimeException
...
```

- 第二次正常测试

我们注释掉监听器中的异常代码，再跑一次。

这次收到两条消息，说明第一次异常之后，消息被回滚到队列中去了。

```
生产者发了一个消息：hello spring jms local tx!
接收到一个纯文本消息。
消息内容是：hello spring jms local tx!
Sep 21, 2018 12:56:58 PM org.springframework.context.support.GenericApplicationContext doClose
信息: Closing org.springframework.context.support.GenericApplicationContext@100fc185: startup date [Fri Sep 21 12:56:58 CST 2018]; root of context hierarchy
接收到一个纯文本消息。
消息内容是：hello spring jms local tx!
```

# 源码地址

[spring JMS 事务](https://github.com/houbb/jms-learn/tree/master/jms-activemq/jms-activemq-spring/src/main/java/com/github/houbb/jms/learn/activemq/spring/tx)

# 参考资料

[jms-tx](https://docs.spring.io/spring/docs/4.3.19.RELEASE/spring-framework-reference/htmlsingle/#jms-tx)

[jms-tx-participation](https://docs.spring.io/spring/docs/4.3.19.RELEASE/spring-framework-reference/htmlsingle/#jms-tx-participation)

[事务管理](http://elim.iteye.com/blog/1983532)


* any list
{:toc}