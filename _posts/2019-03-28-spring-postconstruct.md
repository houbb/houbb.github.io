---
layout: post
title: Spring @PostConstruct @PreDestroy
date:  2019-3-28 09:47:51 +0800
categories: [Java]
tags: [java, spring, sh]
published: true
---

# @PostConstruct & @PreDestroy

PostConstruct 注释用于在依赖关系注入完成之后需要执行的方法上，以执行任何初始化。此方法必须在将类放入服务之前调用。

支持依赖关系注入的所有类都必须支此注释。

即使类没有请求注入任何资源，用 PostConstruct 注释的方法也必须被调用。

只有一个方法可以用此注释进行注释。应用 PostConstruct 注释的方法必须守以下所有标准：该方法不得有任何参数，除非是在 EJB 拦截器 (interceptor) 的情况下，根据 EJB 规范的定义，在这种情况下它将带有一个 InvocationContext对象 ；该方法的返回类型必须为 void；该方法不得抛出已检查异常；应用 PostConstruct 的方法可以是 public、protected、package private 或 private；了应用程序客户端之外，该方法不能是 static；该方法可以是 final；如果该方法抛出未检查异常，那么不得将类放入服务中，除非是能够处理异常并可从中恢复的EJB。

# 使用场景

一般用于一些系统配置或者缓存数据的加载。

或者构建依赖于 `@Autowired` 的 Spring 管理对象。

# 执行的时机

## 不同方式

spring 容器初始化和销毁的方式

关于在spring  容器初始化 bean 和销毁前所做的操作定义方式有三种：

第一种：通过 @PostConstruct 和 @PreDestroy 方法 实现初始化和销毁bean之前进行的操作

第二种是：通过 在xml中定义init-method 和  destory-method方法

第三种是： 通过bean实现InitializingBean和 DisposableBean接口

`@PostConstruct` 和 `@PreDestroy` 标注不属于 Spring，它是在J2EE库- common-annotations.jar。

## 执行时机

- 构建顺序如下

```
构造器-->自动注入-->@PostConstrut-->InitializingBean-->xml中配置init方法　　
```

- 销毁顺序如下

```
@PreDestroy--DisposableBean-->xml中destroy-method方法
```

# 参考资料

- 使用

- 可能存在的问题

[spring懒加载以及@PostConstruct结合的坑](https://blog.csdn.net/qq_15824553/article/details/78114476)

[解决遗留问题：@PostConstruct注入不成功](https://blog.csdn.net/zhanglf02/article/details/77568647/)

[Spring定时任务中@PostConstruct被多次执行异常的分析与解决](https://www.jb51.net/article/126925.htm)

[解决@PostConstruct注解的方法不执行的问题](https://samwalt.iteye.com/blog/1883138)

[springboot @PostConstruct无效](https://blog.csdn.net/heruil/article/details/85332611)

[SpringBoot：请教@PostConstruct为什么会被执行两次](https://segmentfault.com/q/1010000013507470)

* any list
{:toc}