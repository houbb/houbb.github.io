---
layout: post
title:  java 基础之 event 事件机制
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 事件

相信做 Java 开发的朋友，大多都是学习过或至少了解过 Java GUI 编程的，其中有大量的事件和控件的绑定，当我们需要在点击某个按钮实现某些操作的时候，其实就是为这个按钮控件注册了一个合理处理点击事件的监听器。

此外，Spring Framework 中也有许多用到事件处理机制的地方，如 ApplicationContextEvent 及其子类，代表着容器的启动、停止、关闭、刷新等事件。

本文会为大家介绍 Java 的事件处理机制，也会用示例来说明，如何优雅地触发并处理一个自定义事件。

# 委托事件模型

Java 自 1.1 之后基于委托事件模型，定义了标准一致的获取和处理事件的方式。

它的思路非常简单，由事件源发起特定事件，并将事件发送给一个或多个事件监听器，而监听器在此过程中一直处于等待状态，直到接收到该事件，然后处理事件并返回。

实现起来也很简单：

- 定义事件

- 实现特定的监听器接口，接收特定类型的事件

- 实现代码，注册（或解除）监听器作为特定事件类型的接收者

- 在恰当的时机触发事件

# 核心组件

在 Java 的这个事件处理机制中，包含三个核心组件：

## 事件 

事件对象，描述相位的变化。比如在 GUI 中一个动作的点击，在 Spring Framework 中容器的启停，更多的诸如电脑的开机、关机、休眠，缓存的过期，公众号的关注、取关等等。

## 事件源 

可以是任意对象，它具备触发事件的能力。一般在这个对象中注册（或解除）监听器，此外事件的触发通常也在这里。

一个源可能产生多个不同类的事件，要为不同的事件类型分别注册事件监听器，而每个事件类型可以注册一个或多个监听器。

## 事件监听器 

一个实现了特定接口的类，它需要实现对针对特定事件的具体处理方法，且必须被注册到该特定事件上。

那么问题来了，我们如何优雅地触发并处理一个自定义事件呢？

# 自定义事件

在 Java 中自定义事件非常简单。考虑到现在各个应用中都有绑定社交账号的需求，我们就以此为例，在社交账号绑定或者解绑时简单的打印一条记录。

## 1、事件

一般继承自java.util.EventObject类，封装了事件源对象及跟事件相关的信息。

首先定义一个事件对象，代码如下：

```java
import java.util.EventObject;  
  
/** 
 * 事件类,用于封装事件源及一些与事件相关的参数. 
 */  
public class CusEvent extends EventObject {  
    private static final long serialVersionUID = 1L;  
    private Object source;//事件源  
      
    public CusEvent(Object source){  
        super(source);  
        this.source = source;  
    }  
  
    public Object getSource() {  
        return source;  
    }  
  
    public void setSource(Object source) {  
        this.source = source;  
    }  
}  
```

事件类必须是 ​​EventObject​​ 的子类。值得一提的是，事件对象通常代表一类而非一个事件，即合理的做法是将一类事件而非一个事件概念融合起来。

## 2、事件监听器。

实现java.util.EventListener接口,注册在事件源上,当事件源的属性或状态改变时,取得相应的监听器调用其内部的回调方法。

com.javaedu.event.CusEventListener类

接下来，我们实现一套事件处理逻辑，即事件监听器：

```java
/** 
 * 事件监听器，实现java.util.EventListener接口。定义回调方法，将你想要做的事 
 * 放到这个方法下,因为事件源发生相应的事件时会调用这个方法。 
 * @author Eric 
 */  
public class CusEventListener implements EventListener {  
      
    //事件发生后的回调方法  
    public void fireCusEvent(CusEvent e){  
        EventSourceObjecteObject = (EventSourceObject)e.getSource();  
        System.out.println("My name has been changed!");  
        System.out.println("I got a new name,named \""+eObject.getName()+"\"");    }  
}  
```

## 事件源。

事件发生的地方，由于事件源的某项属性或状态发生了改变(比如BUTTON被单击、TEXTBOX的值发生改变等等)导致某项事件发生。

换句话说就是生成了相应的事件对象。

因为事件监听器要注册在事件源上,所以事件源类中应该要有盛装监听器的容器(List,Set等等)。

```java
import java.util.HashSet;  
import java.util.Iterator;  
import java.util.Set;  
  
/** 
 * 事件源. 
 * @author Eric 
 */  
public class EventSourceObject {  
    private String name;  
    //监听器容器  
    private Set<CusEventListener> listener;  
    public EventSourceObject(){  
        this.listener = new HashSet<CusEventListener>();  
        this.name = "defaultname";  
    }  
    //给事件源注册监听器  
    public void addCusListener(CusEventListener cel){  
        this.listener.add(cel);  
    }  
    //当事件发生时,通知注册在该事件源上的所有监听器做出相应的反应（调用回调方法）  
    protected void notifies(){  
        CusEventListener cel = null;  
        Iterator<CusEventListener> iterator = this.listener.iterator();  
        while(iterator.hasNext()){  
            cel = iterator.next();  
            cel.fireCusEvent(new CusEvent(this));  
        }  
    }  
    public String getName() {  
        return name;  
    }  
    //模拟事件触发器，当成员变量name的值发生变化时，触发事件。  
    public void setName(String name) {  
        if(!this.name.equals(name)){  
            this.name = name;  
            notifies();  
        }        
    }  
}  
```

## 测试类

```java
public class MainTest {  
  
    /** 
     * @param args 
     */  
    public static void main(String[] args) {  
        EventSourceObject object = new EventSourceObject();  
        //注册监听器  
        object.addCusListener(new CusEventListener(){  
            @Override  
            public void fireCusEvent(CusEvent e) {  
                super.fireCusEvent(e);  
            }  
        });  
        //触发事件  
        object.setName("eric");  
    }  
}  
```

# 参考资料

htthttps://blog.csdn.net/crazysusu/article/details/50731991

http://www.4k8k.xyz/article/yiziweiyang/52413422

https://juejin.cn/post/6844904078145765383

https://www.365seal.com/y/xJvBz1aevb.html

https://cxybb.com/article/johnson_moon/53574470

* any list
{:toc}