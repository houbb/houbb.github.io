---
layout: post
title: Rocketmq-ONS spring 整合
date: 2022-03-18 21:01:55 +0800
categories: [Apache]
tags: [mq, rocketmq, jms]
published: true
---

# spring 版本整合


## 显示文件信息

```
tree /f
```

## 文件目录如下

```
└─src
    ├─main
    │  ├─java
    │  │  └─com
    │  │      └─github
    │  │          └─houbb
    │  │              └─spring
    │  │                      ConsumerListener.java
    │  │                      ConsumeWithSpring.java
    │  │                      ProduceWithSpring.java
    │  │
    │  └─resources
    │          consumer.xml
    │          producer.xml
```


# 代码

## 生产者

- producer.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="producer" class="com.aliyun.openservices.ons.api.bean.ProducerBean"
          init-method="start" destroy-method="shutdown">
        <!-- Spring 接入方式支持 Java SDK 支持的所有配置项 -->
        <property name="properties" > <!--生产者配置信息-->
            <props>
                <prop key="GROUP_ID">xxx</prop>
                <prop key="AccessKey">xx</prop>
                <prop key="SecretKey">xxx</prop>
                <prop key="NAMESRV_ADDR">xxx</prop>
            </props>
        </property>
    </bean>
</beans>
```

- ProduceWithSpring.java

```java
package com.github.houbb.spring;
import com.aliyun.openservices.ons.api.Message;
import com.aliyun.openservices.ons.api.Producer;
import com.aliyun.openservices.ons.api.SendResult;
import com.aliyun.openservices.ons.api.exception.ONSClientException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class ProduceWithSpring {

    public static void main(String[] args) {
        /**
         * 生产者 Bean 配置在 producer.xml 中，可通过 ApplicationContext 获取或者直接注入到其他类（比如具体的 Controller）中
         */
        ApplicationContext context = new ClassPathXmlApplicationContext("producer.xml");
        Producer producer = (Producer) context.getBean("producer");
        //循环发送消息
        for (int i = 0; i < 1; i++) {
            Message msg = new Message( //
                    // Message 所属的 Topic
                    "xxx",
                    // Message Tag 可理解为 Gmail 中的标签，对消息进行再归类，方便 Consumer 指定过滤条件在消息队列 RocketMQ 的服务器过滤
                    "TagA",
                    // Message Body 可以是任何二进制形式的数据， 消息队列 RocketMQ 不做任何干预
                    // 需要 Producer 与 Consumer 协商好一致的序列化和反序列化方式
                    "Hello MQ".getBytes());
            // 设置代表消息的业务关键属性，请尽可能全局唯一
            // 以方便您在无法正常收到消息情况下，可通过控制台查询消息并补发
            // 注意：不设置也不会影响消息正常收发
            msg.setKey("ORDERID_100");
            // 发送消息，只要不抛异常就是成功
            try {
                SendResult sendResult = producer.send(msg);
                assert sendResult != null;
                System.out.println("send success: " + sendResult.getMessageId());
            }catch (ONSClientException e) {
                System.out.println("发送失败");
            }
        }
    }
}
```

TOPIC 可以根据 GROUP_ID 的名字做一次映射。

## 消费者

- ConsumerListener.java

```java
package com.github.houbb.spring;

import com.aliyun.openservices.ons.api.Action;
import com.aliyun.openservices.ons.api.ConsumeContext;
import com.aliyun.openservices.ons.api.Message;
import com.aliyun.openservices.ons.api.MessageListener;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ConsumerListener implements MessageListener {

    @Override
    public Action consume(Message message, ConsumeContext consumeContext) {
        try {
            System.out.println("Receive: " + message.getMsgID());
            //do something..
            return Action.CommitMessage;
        }catch (Exception e) {
            //消费失败
            return Action.ReconsumeLater;
        }
    }

}
```

- consumer.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="msgListener" class="com.github.houbb.spring.ConsumerListener"></bean> <!--Listener 配置-->

    <!-- Group ID 订阅同一个 Topic，可以创建多个 ConsumerBean-->
    <bean id="consumer" class="com.aliyun.openservices.ons.api.bean.ConsumerBean" init-method="start" destroy-method="shutdown">
        <property name="properties" > <!--消费者配置信息-->
            <props>
                <prop key="GROUP_ID">xxx</prop>
                <prop key="AccessKey">xxx</prop>
                <prop key="SecretKey">xxx</prop>
                <prop key="NAMESRV_ADDR">xxx</prop>
            </props>
        </property>
        <property name="subscriptionTable">
            <map>
                <entry value-ref="msgListener">
                    <key>
                        <bean class="com.aliyun.openservices.ons.api.bean.Subscription">
                            <property name="topic" value="xxx"/>
                            <property name="expression" value="*"/><!--expression 即 Tag，可以设置成具体的 Tag，如 taga||tagb||tagc，也可设置成 *。 * 仅代表订阅所有 Tag，不支持通配-->
                        </bean>
                    </key>
                </entry>
            </map>
        </property>
    </bean>
</beans>
```

- ConsumeWithSpring.java

```java
package com.github.houbb.spring;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ConsumeWithSpring {

    public static void main(String[] args) {
            /**
             * 消费者 Bean 配置在 consumer.xml 中，可通过 ApplicationContext 获取或者直接注入到其他类（比如具体的 Controller）中
             */
            ApplicationContext context = new ClassPathXmlApplicationContext("consumer.xml");
            System.out.println("Consumer Started");
    }

}
```

# 参考资料

[官方文档-spring 集成](https://help.aliyun.com/document_detail/29553.html?spm=a2c4g.11186623.6.570.5b31661dBpkdN9)

* any list
{:toc}