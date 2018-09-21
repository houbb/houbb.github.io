---
layout: post
title: Spring 整合 ActiveMQ-02-MessageListener
date:  2018-09-20 09:35:26 +0800
categories: [MQ]
tags: [java, spring, mq, jms, sh]
published: true
excerpt: Spring 整合 ActiveMQ-02-MessageListener
---

# Listener

首先讲述 Spring 支持的几种消息监听器。

## MessageListener

MessageListener 是最原始的消息监听器，它是 [JMS](https://houbb.github.io/2017/09/17/jms) 规范中定义的一个接口。

如同上一节中给出的例子 [spring activemq 入门整合](https://houbb.github.io/2018/09/20/spring-activemq-01-hello#%E5%AE%9E%E7%8E%B0%E4%BB%A3%E7%A0%81)

- ConsunerMessageListener.java

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

## SessionAwareMessageListener

SessionAwareMessageListener是Spring为我们提供的，它不是标准的JMS MessageListener。

- 作用

MessageListener的设计只是纯粹用来接收消息的，假如我们在使用MessageListener处理接收到的消息时我们需要发送一个消息通知对方我们已经收到这个消息了，那么这个时候我们就需要在代码里面去重新获取一个Connection或Session。

SessionAwareMessageListener的设计就是为了方便我们在接收到消息后发送一个回复的消息，它同样为我们提供了一个处理接收到的消息的onMessage方法，但是这个方法可以同时接收两个参数，一个是表示当前接收到的消息Message，另一个就是可以用来发送消息的Session对象。


### 实例代码

- ConsumerSessionAwareMessageListener.java

```java
public class ConsumerSessionAwareMessageListener implements
        SessionAwareMessageListener<TextMessage> {

    @Autowired
    @Qualifier("queueDestination")
    private Destination destination;

    @Override
    public void onMessage(TextMessage textMessage, Session session) throws JMSException {
        System.out.println("收到一条消息消息内容是：" + textMessage.getText());
        MessageProducer producer = session.createProducer(destination);
        Message newMessage = session.createTextMessage("ConsumerSessionAwareMessageListener send msg...");
        producer.send(newMessage);
    }
}
```

- application-mq-listener-session.xml

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
    <bean id="sessionAwareQueue" class="org.apache.activemq.command.ActiveMQQueue">
        <constructor-arg>
            <value>sessionAwareQueue</value>
        </constructor-arg>
    </bean>

    <!--消息监听器-->
    <bean id="consumerMessageListener"
          class="com.github.houbb.jms.learn.activemq.spring.listener.ConsumerMessageListener"/>
    <bean id="consumerSessionAwareMessageListener"
          class="com.github.houbb.jms.learn.activemq.spring.listener.ConsumerSessionAwareMessageListener"/>

    <!-- 消息监听容器 -->
    <bean id="jmsContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory"/>
        <property name="destination" ref="queueDestination"/>
        <property name="messageListener" ref="consumerMessageListener"/>
    </bean>

    <bean id="sessionAwareListenerContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory"/>
        <property name="destination" ref="sessionAwareQueue"/>
        <property name="messageListener" ref="consumerSessionAwareMessageListener"/>
    </bean>

</beans>
```

### 测试代码

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:application-mq-listener-session.xml")
public class ConsumerSessionAwareTest {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    @Qualifier("sessionAwareQueue")
    private Destination destination;

    @Test
    public void sendMsg() {
        jmsTemplate.send(destination, new MessageCreator() {
            @Override
            public Message createMessage(Session session) throws JMSException {
                return session.createTextMessage("SessionAware 发送消息测试。");
            }
        });
    }
}
```

- 测试日志

```
接收到一个纯文本消息。
消息内容是：ConsumerSessionAwareMessageListener send msg...
收到一条消息消息内容是：SessionAware 发送消息测试。
```

### 总结

通过 `SessionAwareMessageListener`，我们可以再接收到消息之后，在对消息进行进行相应的其他反馈处理。

## MessageListenerAdapter

MessageListenerAdapter类实现了MessageListener接口和SessionAwareMessageListener接口，它的主要作用是将接收到的消息进行类型转换，然后通过反射的形式把它交给一个普通的Java类进行处理。

MessageListenerAdapter会把接收到的消息做如下转换：

1. TextMessage转换为String对象；

2. BytesMessage转换为byte数组；

3. MapMessage转换为Map对象；

4. ObjectMessage 转换为对应的 Serializable 对象。


### 代码示例

我们定义一个接口及其简单的实现。

比如：

- MessageDelegate

```java
public interface MessageDelegate {

    void handleMessage(String message);

    void handleMessage(Map message);

    void handleMessage(byte[] message);

    void handleMessage(Serializable message);
}
```

```java
public class DefaultMessageDelegate implements MessageDelegate {
    @Override
    public void handleMessage(String message) {
        System.out.println("ConsumerListener通过handleMessage接收到一个纯文本消息，消息内容是：" + message);
    }

    @Override
    public void handleMessage(Map message) {
    }

    @Override
    public void handleMessage(byte[] message) {
    }

    @Override
    public void handleMessage(Serializable message) {
    }
}
```

定义好之后，我们可以将这个类和 spring 提供的 `MessageListenerAdapter` 相结合。

- application-mq-listener-adapter.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
     http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
    http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd">

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
    <bean id="adapterQueue" class="org.apache.activemq.command.ActiveMQQueue">
        <constructor-arg>
            <value>adapterQueue</value>
        </constructor-arg>
    </bean>

    <!--消息监听器-->
    <bean id="messageListenerAdapter"
          class="org.springframework.jms.listener.adapter.MessageListenerAdapter">
        <constructor-arg>
            <bean class="com.github.houbb.jms.learn.activemq.spring.adaptor.DefaultMessageDelegate"/>
        </constructor-arg>
    </bean>

    <!-- 使用MessageListenerAdapter来作为消息监听器 -->
    <bean id="messageListenerAdapterContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory"/>
        <property name="destination" ref="adapterQueue"/>
        <property name="messageListener" ref="messageListenerAdapter"/>
    </bean>

</beans>
```

### 测试代码

- ConsumerListenerAdapterTest.java

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:application-mq-listener-adapter.xml")
public class ConsumerListenerAdapterTest {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    @Qualifier("adapterQueue")
    private Destination destination;

    @Test
    public void sendMsg() {
        jmsTemplate.send(destination, new MessageCreator() {
            @Override
            public Message createMessage(Session session) throws JMSException {
                return session.createTextMessage("adapterQueue 发送测试");
            }
        });
    }
}
```

- 日志

```
ConsumerListener通过handleMessage接收到一个纯文本消息，消息内容是：adapterQueue 发送测试
```

### 看一眼源码

肯定是源代码经过反射调用了我们的方法。

看下 `MessageListenerAdapter` 的几行代码就可以知道。

```java
public class MessageListenerAdapter extends AbstractAdaptableMessageListener
		implements SubscriptionNameProvider {

	/**
	 * Out-of-the-box value for the default listener method: "handleMessage".
	 */
	public static final String ORIGINAL_DEFAULT_LISTENER_METHOD = "handleMessage";

	private Object delegate;

	private String defaultListenerMethod = ORIGINAL_DEFAULT_LISTENER_METHOD;
}
```

可见，我们还可以指定默认的监听方法。此处不再赘述。

# Message Listener Containers

上面我们一直用到一个了监听器容器，但是一直没说。

消息侦听器容器用于从JMS消息队列接收消息，并驱动注入其中的MessageListener。

侦听器容器负责所有消息接收和分派到侦听器以进行处理的线程。

消息侦听器容器是MDP和消息传递提供者之间的中介，负责注册接收消息、参与事务、资源获取和释放、异常转换等等。

这允许您作为应用程序开发人员编写与接收消息(并可能对其作出响应)关联的(可能很复杂的)业务逻辑，并将样板JMS基础结构关注点委托给框架。

有两个标准的JMS消息侦听器容器与Spring打包在一起，每个容器都有专门的特性集。

## SimpleMessageListenerContainer

这个消息侦听器容器是两种标准类型中较简单的一种。

它在启动时创建固定数量的JMS会话和使用者，使用标准JMS `MessageConsumer.setMessageListener()` 方法注册侦听器，并将其留给JMS提供者来执行侦听器回调。

此变体不允许动态地适应运行时需求或参与外部管理的事务。

在兼容性方面，它与独立JMS规范的精神非常接近，但通常与Java EE的JMS限制不兼容。

### 备注

虽然SimpleMessageListenerContainer不允许参与外部管理事务,它支持本地JMS事务:切换的sessionTransacted 标识为真。

或者在 namespace,设置 `acknowledge=transacted`: 从你的听众抛出异常会导致回滚之后,与消息发送。

或者，考虑使用 `CLIENT_ACKNOWLEDGE` 模式，该模式在发生异常时也提供了返回，但不使用事务会话，因此在事务协议中不包含任何其他会话操作(如发送响应消息)。

默认的 `AUTO_ACKNOWLEDGE` 模式不能提供适当的可靠性保证。

当侦听器执行失败时(因为提供者会在侦听器调用之后自动确认每个消息，而不会将异常传播到提供者)或当侦听器容器关闭时(这可以通过 `acceptMessagesWhileStopping` 标志进行配置)，消息可能会丢失。

确保在可靠性需要时使用事务会话，例如用于可靠的队列处理和持久的主题订阅。

## DefaultMessageListenerContainer

这个消息侦听器容器是大多数情况下使用的容器。与SimpleMessageListenerContainer不同的是，该容器变体允许动态地适应运行时需求，并且能够参与外部管理的事务。当使用JtaTransactionManager配置时，每个接收到的消息都用XA事务注册;因此，处理可以利用XA事务语义。这个侦听器容器很好地平衡了对JMS提供者的低需求、高级功能(如参与外部管理的事务)和与Java EE环境的兼容性。

可以定制容器的缓存级别。注意，当不启用缓存时，将为每个消息接收创建一个新连接和一个新会话。将其与具有高负载的非持久订阅相结合可能会导致消息丢失。在这种情况下，确保使用适当的缓存级别。

当代理宕机时，这个容器还具有可恢复的功能。默认情况下，一个简单的 `BackOff` 实现每5秒重试一次。

可以为更细粒度的恢复选项指定定制的BackOff实现，请参阅ExponentialBackOff示例。

### 备注

与它的同胞SimpleMessageListenerContainer一样，DefaultMessageListenerContainer支持本地JMS事务，并允许定制确认模式。

如果在您的场景中可行的话，强烈建议使用外部管理的事务:也就是说，在JVM死亡的情况下，您可以偶尔使用重复的消息。

业务逻辑中的自定义重复消息检测步骤可能包括这种情况，例如以业务实体存在检查或协议表检查的形式。

任何这样的安排都比另一种安排要高效得多:用XA事务包装整个处理过程(通过使用JtaTransactionManager配置DefaultMessageListenerContainer)，包括JMS消息的接收以及消息侦听器中的业务逻辑的执行(包括数据库操作等)。

默认的 `AUTO_ACKNOWLEDGE` 模式不能提供适当的可靠性保证。

当侦听器执行失败时(因为提供者将在侦听器调用之前自动确认每个消息)或当侦听器容器关闭时(这可以通过 `acceptMessagesWhileStopping` 标志进行配置)，消息可能会丢失。

确保在可靠性需要时使用事务会话，例如用于可靠的队列处理和持久的主题订阅。

# 源码地址

# 参考资料

[消息监听器 MessageListener](http://elim.iteye.com/blog/1893676)

[Message Listener Containers](https://docs.spring.io/spring/docs/4.3.19.RELEASE/spring-framework-reference/htmlsingle/#jms-mdp)

* any list
{:toc}