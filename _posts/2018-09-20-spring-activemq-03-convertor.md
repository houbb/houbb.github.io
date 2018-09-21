---
layout: post
title: Spring 整合 ActiveMQ-03-消息类型转换
date:  2018-09-20 09:35:26 +0800
categories: [MQ]
tags: [java, spring, mq, jms, sh]
published: true
excerpt: Spring 整合 ActiveMQ-03-消息类型转换
---

# 消息类型转换

为了方便域模型对象的发送，JmsTemplate有各种发送方法，这些方法将Java对象作为消息数据内容的参数。

JmsTemplate中的convertAndSend()和receiveAndConvert()重载方法将转换过程委托给MessageConverter接口的实例。

这个接口定义了一个简单的契约，用于在Java对象和JMS消息之间进行转换。

默认实现SimpleMessageConverter支持字符串和TextMessage、byte[]和BytesMesssage以及java.utiljava.util.Map 之间的转换和MapMessage。

通过使用转换器，您和应用程序代码可以关注通过JMS发送或接收的业务对象，而不关心如何将其表示为JMS消息的细节。

沙箱目前包括一个MapMessageConverter，它使用反射在JavaBean和MapMessage之间进行转换。您可能自己实现的其他流行的实现选择是使用现有XML编组包(如JAXB、Castor、XMLBeans或XStream)的转换器来创建表示对象的TextMessage。

为了适应不能在转换器类中通用封装的消息属性、报头和正文的设置，MessagePostProcessor接口允许您在消息被转换之后(但在发送之前)访问消息。下面的示例演示如何在java.util之后修改消息头和属性。映射被转换为消息。

# 示例代码

## 代码

- Email.java

定义一个对象实体。

```java
public class Email implements Serializable {

    private static final long serialVersionUID = -209247729960531557L;

    private String receiver;
    private String title;
    private String content;

    public Email(String receiver, String title, String content) {
        this.receiver = receiver;
        this.title = title;
        this.content = content;
    }

    //Getter & Setter
    //toString()
}
```

- EmailMessageConverter.java

定义 Email 对应的转换器

```java
public class EmailMessageConverter implements MessageConverter {
    @Override
    public Message toMessage(Object object, Session session) throws JMSException, MessageConversionException {
        return session.createObjectMessage((Serializable) object);
    }

    @Override
    public Object fromMessage(Message message) throws JMSException, MessageConversionException {
        ObjectMessage objMessage = (ObjectMessage) message;
        return objMessage.getObject();
    }
}
```

这样，我们在发送消息和接受消息的时候，就可以变得简洁。

- 发送消息

```java
@Service
public class ConvertorProducerImpl {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    private Destination destination;

    public void send(final Serializable object) {
        // convertAndSend() 会调用具体的 convertor 转换方法
        jmsTemplate.convertAndSend(destination, object);
    }

}
```

- 接受消息

```java
public class ConvertorConsumerListener implements MessageListener {

    @Autowired
    private MessageConverter messageConverter;

    @Override
    public void onMessage(Message message) {
        if (message instanceof ObjectMessage) {
            ObjectMessage objMessage = (ObjectMessage) message;
            try {
                Email email = (Email) messageConverter.fromMessage(objMessage);
                System.out.println("接收到一个ObjectMessage，包含Email对象。");
                System.out.println(email);
            } catch (JMSException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## 配置文件

- application-mq-convertor.xml

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
    <context:component-scan base-package="com.github.houbb.jms.learn.activemq.spring.convertor"/>

    <!-- 类型转换器 -->
    <bean id="emailMessageConverter" class="com.github.houbb.jms.learn.activemq.spring.convertor.EmailMessageConverter"/>

    <!-- Spring提供的JMS工具类，它可以进行消息发送、接收等 -->
    <bean id="jmsTemplate" class="org.springframework.jms.core.JmsTemplate">
        <!-- 这个connectionFactory对应的是我们定义的Spring提供的那个ConnectionFactory对象 -->
        <property name="connectionFactory" ref="connectionFactory"/>

        <!-- 消息转换器 -->
        <property name="messageConverter" ref="emailMessageConverter"/>
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

    <!--消息监听器-->
    <bean id="consumerMessageListener"
          class="com.github.houbb.jms.learn.activemq.spring.convertor.ConvertorConsumerListener"/>

    <!-- 消息监听容器 -->
    <bean id="jmsContainer"
          class="org.springframework.jms.listener.DefaultMessageListenerContainer">
        <property name="connectionFactory" ref="connectionFactory"/>
        <property name="destination" ref="queueDestination"/>
        <property name="messageListener" ref="consumerMessageListener"/>
    </bean>

</beans>
```

## 测试代码

- MessageConvertorTest.java

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
@ContextConfiguration("classpath:application-mq-convertor.xml")
public class MessageConvertorTest {

    @Autowired
    private ConvertorProducerImpl convertorProducer;

    @Test
    public void sendMsg() {
        Email email = new Email("Dear MQ", "MQ 转换测试", "一些内容");
        convertorProducer.send(email);
    }
}
```

- 测试日志

```
接收到一个ObjectMessage，包含Email对象。
Email{receiver='Dear MQ', title='MQ 转换测试', content='一些内容'}
```

# 源码地址

[spring 转换器](https://github.com/houbb/jms-learn/tree/master/jms-activemq/jms-activemq-spring/src/main/java/com/github/houbb/jms/learn/activemq/spring/convertor)

# 参考资料

[jms-msg-conversion](https://docs.spring.io/spring/docs/4.3.19.RELEASE/spring-framework-reference/htmlsingle/#jms-msg-conversion)

[消息转换器 MessageConverter](http://elim.iteye.com/blog/1900937)

* any list
{:toc}