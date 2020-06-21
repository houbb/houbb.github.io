---
layout: post
title: Design Pattern 30-java 前端控制器模式（Front Controller Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 前端控制器模式

前端控制器模式（Front Controller Pattern）是用来提供一个集中的请求处理机制，所有的请求都将由一个单一的处理程序处理。该处理程序可以做认证/授权/记录日志，或者跟踪请求，然后把请求传给相应的处理程序。以下是这种设计模式的实体。

- 前端控制器（Front Controller） 

处理应用程序所有类型请求的单个处理程序，应用程序可以是基于 web 的应用程序，也可以是基于桌面的应用程序。

- 调度器（Dispatcher） 

前端控制器可能使用一个调度器对象来调度请求到相应的具体处理程序。

- 视图（View） 

视图是为请求而创建的对象。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| IndexView.java | 主页视图 |
| PageController.java | 页面控制器 |
| IView.java | 视图接口 |
| Dispatcher.java | 分发器 |
| WorkbenchView.java | 工作台视图 |

## 定义


- IndexView.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:59  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class IndexView implements IView{

    @Override
    public void view() {
        System.out.println("Index view...");
    }

}

```


- PageController.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午7:00  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class PageController {

    private Dispatcher dispatcher;

    public PageController() {
        this.dispatcher = new Dispatcher();
    }

    public void dispatchRequest(final String request) {
        this.dispatcher.dispatch(request);
    }

}

```


- IView.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:58  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface IView {

    /**
     * 视图相关
     */
    void view();

}

```


- Dispatcher.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午7:00  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Dispatcher {

    private IView index;

    private IView workbench;

    public Dispatcher() {
        this.index = new IndexView();
        this.workbench = new WorkbenchView();
    }


    public void dispatch(final String request) {
        if("INDEX".equalsIgnoreCase(request)) {
            index.view();
        } else {
            workbench.view();
        }
    }

}

```


- WorkbenchView.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:59  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class WorkbenchView implements IView{

    @Override
    public void view() {
        System.out.println("Workbench view...");
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

package com.ryo.design.pattern.note.frontController;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午7:04  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        PageController pageController = new PageController();
        pageController.dispatchRequest("index");
        pageController.dispatchRequest("toher");
        pageController.dispatchRequest("other");
    }

}

```

- 测试结果

```
Index view...
Workbench view...
Workbench view...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [前端控制器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/frontController)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}