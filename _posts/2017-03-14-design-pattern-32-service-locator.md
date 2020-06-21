---
layout: post
title: Design Pattern 32-java 服务定位器模式（Service Locator Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 服务定位器模式

服务定位器模式（Service Locator Pattern）用在我们想使用 JNDI 查询定位各种服务的时候。考虑到为某个服务查找 JNDI 的代价很高，服务定位器模式充分利用了缓存技术。在首次请求某个服务时，服务定位器在 JNDI 中查找服务，并缓存该服务对象。当再次请求相同的服务时，服务定位器会在它的缓存中查找，这样可以在很大程度上提高应用程序的性能。以下是这种设计模式的实体。

- 服务（Service） 

实际处理请求的服务。对这种服务的引用可以在 JNDI 服务器中查找到。

- Context

JNDI Context 带有对要查找的服务的引用。

- 服务定位器（Service Locator）

务定位器是通过 JNDI 查找和缓存服务来获取服务的单点接触。

- 缓存（Cache）

缓存存储服务的引用，以便复用它们。

- 客户端（Client）
 
Client 是通过 ServiceLocator 调用服务的对象。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| ServiceCache.java | 服务缓存 |
| IService.java | 服务接口 |
| ServiceContext.java | 服务上下文 |
| ServiceOneImpl.java | 服务实现1 |
| ServiceTwoImpl.java | 服务实现2 |

## 定义


- ServiceOneImpl.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.serviceLocator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:36  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ServiceOneImpl implements IService {
    @Override
    public String getName() {
        return "one";
    }

    @Override
    public void execute() {
        System.out.println("Service one execute...");
    }
}

```


- ServiceCache.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.serviceLocator;

import java.util.HashMap;
import java.util.Map;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:39  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ServiceCache {

    public static Map<String, IService> map = new HashMap<>();

    /**
     * 获取服务
     * @param serivceName 服务名称
     * @return 服务
     */
    public static IService getService(String serivceName) {
        IService service = map.get(serivceName);
        if(service == null) {
            ServiceContext context = new ServiceContext();
            System.out.println(serivceName+" 查询并且放在缓存中...");
            service = context.lookUp(serivceName);
            map.put(serivceName, service);
        }
        return service;
    }

}

```


- IService.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.serviceLocator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:35  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface IService {

    /**
     * 获取服务名称
     * @return 服务名称
     */
    String getName();

    /**
     * 执行
     */
    void execute();

}

```


- ServiceContext.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.serviceLocator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:36  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ServiceContext {

    /**
     * 查找服务
     * @param name 服务名称
     * @return 对应服务
     */
    public IService lookUp(final String name) {
        if("one".equalsIgnoreCase(name)) {
            return new ServiceOneImpl();
        } else if("two".equalsIgnoreCase(name)) {
            return new ServiceTwoImpl();
        }
        return null;
    }

}

```


- ServiceTwoImpl.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.serviceLocator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:36  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ServiceTwoImpl implements IService {
    @Override
    public String getName() {
        return "two";
    }

    @Override
    public void execute() {
        System.out.println("Service two execute...");
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

package com.ryo.design.pattern.note.serviceLocator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:35  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        IService serviceOne = ServiceCache.getService("one");
        IService serviceTwo = ServiceCache.getService("two");
        IService serviceThree = ServiceCache.getService("one");

        serviceOne.execute();
        serviceTwo.execute();
        serviceThree.execute();
    }

}

```

- 测试结果

```
one 查询并且放在缓存中...
two 查询并且放在缓存中...
Service one execute...
Service two execute...
Service one execute...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [服务定位器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/serviceLocator)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}