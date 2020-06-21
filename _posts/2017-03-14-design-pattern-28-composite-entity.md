---
layout: post
title: Design Pattern 28-java 组合实体模式（Composite Entity Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 组合实体模式

组合实体模式（Composite Entity Pattern）用在 EJB 持久化机制中。一个组合实体是一个 EJB 实体 bean，代表了对象的图解。

当更新一个组合实体时，内部依赖对象 beans 会自动更新，因为它们是由 EJB 实体 bean 管理的。以下是组合实体 bean 的参与者。

- 组合实体（Composite Entity） 

它是主要的实体 bean。它可以是粗粒的，或者可以包含一个粗粒度对象，用于持续生命周期。

- 粗粒度对象（Coarse-Grained Object） 

该对象包含依赖对象。它有自己的生命周期，也能管理依赖对象的生命周期。


- 依赖对象（Dependent Object） 

依赖对象是一个持续生命周期依赖于粗粒度对象的对象。


- 策略（Strategies） 

策略表示如何实现组合实体。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Client.java | 客户端 |
| DependentObjectOne.java | 依赖实体 one |
| DependentObjectTwo.java | 依赖实体 two |
| CompositeEntity.java | 组合实体 |
| CoarseGrainedObject.java | 粗粒度的实体 |

## 定义


- Client.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> 创建使用组合实体的客户端类 </p>
 *
 * <pre> Created: 2018/5/27 下午7:19  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Client {

    private CompositeEntity compositeEntity = new CompositeEntity();

    public void printData(){
        for (int i = 0; i < compositeEntity.getData().length; i++) {
            System.out.println("Data: " + compositeEntity.getData()[i]);
        }
    }

    public void setData(String data1, String data2){
        compositeEntity.setData(data1, data2);
    }

}

```


- DependentObjectTwo.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> 依赖对象 </p>
 *
 * <pre> Created: 2018/5/27 下午7:15  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class DependentObjectTwo {

    private String data;

    public void setData(String data){
        this.data = data;
    }

    public String getData(){
        return data;
    }

}

```


- CompositeEntity.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> 创建组合实体 </p>
 *
 * <pre> Created: 2018/5/27 下午7:18  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class CompositeEntity {

    private CoarseGrainedObject cgo = new CoarseGrainedObject();

    public void setData(String data1, String data2){
        cgo.setData(data1, data2);
    }

    public String[] getData(){
        return cgo.getData();
    }

}

```


- CoarseGrainedObject.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> 创建粗粒度对象 </p>
 *
 * <pre> Created: 2018/5/27 下午7:16  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class CoarseGrainedObject {

    DependentObjectOne do1 = new DependentObjectOne();
    DependentObjectTwo do2 = new DependentObjectTwo();

    public void setData(String data1, String data2){
        do1.setData(data1);
        do2.setData(data2);
    }

    public String[] getData(){
        return new String[] {do1.getData(),do2.getData()};
    }

}

```


- DependentObjectOne.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> 依赖对象 </p>
 *
 * <pre> Created: 2018/5/27 下午7:15  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class DependentObjectOne {

    private String data;

    public void setData(String data){
        this.data = data;
    }

    public String getData(){
        return data;
    }

}

```


## 测试

- Main.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.compositeEntity;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午7:24  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Client client = new Client();
        client.setData("Test", "Data");
        client.printData();
        client.setData("Second Test", "Data1");
        client.printData();
    }

}

```

- 测试结果

```
Data: Test
Data: Data
Data: Second Test
Data: Data1
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [组合实体模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/compositeEntity)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}