---
layout: post
title: Design Pattern 27-java 业务代表模式（Business Delegate Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 业务代表模式

业务代表模式（Business Delegate Pattern）用于对表示层和业务层解耦。它基本上是用来减少通信或对表示层代码中的业务层代码的远程查询功能。在业务层中我们有以下实体。

- 客户端（Client） 

表示层代码可以是 JSP、servlet 或 UI java 代码。

- 业务代表（Business Delegate） 

一个为客户端实体提供的入口类，它提供了对业务服务方法的访问。

- 查询服务（LookUp Service）

查找服务对象负责获取相关的业务实现，并提供业务对象对业务代表对象的访问。

- 业务服务（Business Service） 

业务服务接口。实现了该业务服务的实体类，提供了实际的业务实现逻辑。


# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Client.java | 客户端 |
| JMSService.java | JMS 服务类 |
| EJBService.java | EJB 服务类 |
| BusinessLookUp.java | 服务查找类 |
| BusinessDelegate.java | 业务代表类 |
| BusinessService.java | 业务服务接口 |

## 定义


- Client.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午6:51  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Client {

    private BusinessDelegate businessService;

    public Client(BusinessDelegate businessService){
        this.businessService  = businessService;
    }

    public void doTask(){
        businessService.doTask();
    }

}

```


- JMSService.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午6:46  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class JMSService implements BusinessService {

    @Override
    public void doProcessing() {
        System.out.println("Processing task by invoking JMS Service");
    }

}

```


- EJBService.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午6:46  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class EJBService implements BusinessService {

    @Override
    public void doProcessing() {
        System.out.println("Processing task by invoking EJB Service");
    }

}

```


- BusinessLookUp.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> 创建业务查询服务 </p>
 *
 * <pre> Created: 2018/5/27 下午6:50  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class BusinessLookUp {

    /**
     * 获取业务服务
     * @param serviceType
     * @return
     */
    public BusinessService getBusinessService(String serviceType){
        if(serviceType.equalsIgnoreCase("EJB")){
            return new EJBService();
        }else {
            return new JMSService();
        }
    }

}

```


- BusinessDelegate.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> 创建业务代表 </p>
 *
 * <pre> Created: 2018/5/27 下午6:50  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class BusinessDelegate {

    private BusinessLookUp lookupService = new BusinessLookUp();
    private String serviceType;

    public void setServiceType(String serviceType){
        this.serviceType = serviceType;
    }

    public void doTask(){
        BusinessService businessService = lookupService.getBusinessService(serviceType);
        businessService.doProcessing();
    }

}

```


- BusinessService.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午6:44  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface BusinessService {

    /**
     * 执行操作
     */
    void doProcessing();

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

package com.ryo.design.pattern.note.bussinessDelegate;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/27 下午6:54  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        BusinessDelegate businessDelegate = new BusinessDelegate();
        businessDelegate.setServiceType("EJB");

        Client client = new Client(businessDelegate);
        client.doTask();

        businessDelegate.setServiceType("JMS");
        client.doTask();
    }

}

```

- 测试结果

```
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [业务代表模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/bussinessDelegate)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}