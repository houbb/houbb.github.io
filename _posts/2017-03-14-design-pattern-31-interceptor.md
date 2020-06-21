---
layout: post
title: Design Pattern 31-java 拦截过滤器模式（Intercepting Filter Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 拦截过滤模式

拦截过滤器模式（Intercepting Filter Pattern）用于对应用程序的请求或响应做一些预处理/后处理。定义过滤器，并在把请求传给实际目标应用程序之前应用在请求上。过滤器可以做认证/授权/记录日志，或者跟踪请求，然后把请求传给相应的处理程序。以下是这种设计模式的实体。

- 过滤器（Filter）

过滤器在请求处理程序执行请求之前或之后，执行某些任务。

- 过滤器链（Filter Chain） 

过滤器链带有多个过滤器，并在 Target 上按照定义的顺序执行这些过滤器。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| FilterChain.java | 过滤器链 |
| ValidFilter.java | 校验过滤 |
| AuthFilter.java | 验证过滤 |
| Filter.java | 过滤接口 |

## 定义


- FilterChain.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.interceptingFilter;

import java.util.ArrayList;
import java.util.List;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:24  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class FilterChain implements Filter {

    private List<Filter> filterList = new ArrayList<>();

    public FilterChain addFilter(Filter filter) {
        filterList.add(filter);
        return this;
    }


    @Override
    public Filter filter(String info) {
        for(Filter filter : this.filterList) {
            filter.filter(info);
        }
        return this;
    }

}

```


- ValidFilter.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.interceptingFilter;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:22  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ValidFilter implements Filter {

    @Override
    public Filter filter(String info) {
        System.out.println("[Valid]: "+info);
        return this;
    }

}

```


- AuthFilter.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.interceptingFilter;

/**
 * <p> 权限过滤器 </p>
 *
 * <pre> Created: 2018/5/29 下午5:22  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class AuthFilter implements Filter {

    @Override
    public Filter filter(String info) {
        System.out.println("[Auth]: "+info);
        return this;
    }

}

```


- Filter.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.interceptingFilter;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:22  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface Filter {

    /**
     * 执行过滤信息
     * @param info 原始信息
     * @return 过滤器本身
     */
    Filter filter(final String info);

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

package com.ryo.design.pattern.note.interceptingFilter;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/29 下午5:20  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        FilterChain filterChain = new FilterChain();
        filterChain.addFilter(new AuthFilter())
                .addFilter(new ValidFilter());
        filterChain.filter("filtered info");
    }

}

```

- 测试结果

```
[Auth]: filtered info
[Valid]: filtered info
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [拦截过滤模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/interceptingFilter)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}