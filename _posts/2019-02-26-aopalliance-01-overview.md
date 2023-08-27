---
layout: post
title: Aopalliance-01-AOP 核心包之 Aopalliance
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# Aopalliance

[Aopalliance](http://aopalliance.sourceforge.net/) is a joint open-source project between several software engineering people who are interested in AOP and Java.

# 入门例子

## maven 引入

```xml
<dependency>
    <groupId>aopalliance</groupId>
    <artifactId>aopalliance</artifactId>
    <version>1.0</version>
</dependency>
```

## 编写 AOP 实现

为了突出重点，省略掉相关的具体实现。

详情参考 [CacheInterceptor.java](https://sourcegraph.com/github.com/houbb/framework@release_1.0.4/-/blob/framework-cache/src/main/java/com/framework/framework/cache/interceptor/CacheInterceptor.java)

```java
package com.framework.framework.cache.interceptor;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;


/**
 * @author houbinbin
 * @on 17/1/7
 * 模仿spring的CacheInterceptor
 * 不过spring又进行了更多的封装。此处实现比较简单。
 */
public class CacheInterceptor implements MethodInterceptor {

    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * @Cacheable & @CachePut 都应该是单独使用的。
     * AnnotationUtils.findAnnotation
     * @param methodInvocation
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(MethodInvocation methodInvocation) throws Throwable {
        // 其他注解相关实现
       return methodInvocation.proceed()
    } 

}
```

## 优点

这种优点是不用写一个 AOP 都要依赖于 spring-aop。

但是怎么和 spring 结合呢？

# 结合 Spring

```xml
<bean id="cacheInterceptor" class="com.framework.framework.cache.interceptor.CacheInterceptor">
		<property name="cacheManager" ref="cacheManager" />
	</bean>

<aop:config>
    <aop:pointcut id="cachePointcut"
        expression="@annotation(com.framework.framework.cache.annotation.CacheGetSet) or
        @annotation(com.framework.framework.cache.annotation.CacheRemove)" />
    <aop:advisor advice-ref="cacheInterceptor" pointcut-ref="cachePointcut" />
</aop:config>
```

# 拓展阅读

[Aopalliance 白皮书](http://aopalliance.sourceforge.net/white_paper/white_paper.pdf)

[Spring AOP](https://houbb.github.io/2018/07/02/annotation-05-spring-aop)

[Retry 详解](https://houbb.github.io/2018/08/08/retry)

# 参考资料 

[自行编写AOP](https://blog.csdn.net/yc______/article/details/83096955)

[AOP 基础知识](http://wayfarer.cnblogs.com/articles/241024.html)

* any list
{:toc}