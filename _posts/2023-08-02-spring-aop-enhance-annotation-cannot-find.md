---
layout: post
title: spring 增强之后无法获取自定义注解属性及解决方案
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, aop, cglib, sh]
published: true
---

# 场景

为了便于后期代码拓展，在代码中定义了一些注解，统一处理逻辑。

后来有开发同事反应，使用了一下 `@Transactional` 注解之后，注解直接无效了。

# 问题演示

为了演示整个过程，我们从最简单的简化版本开始。

## 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {
 
    String value() default "";
 
}
```

## 定义接口和实现

```java
public interface IRoute {
}
```

和 

```java
@Service
@Route("one")
public class RouteOne implements IRoute {
 
    public void tx() {
 
    }
 
}
```

## Container

我们根据接口注入。

```java
@Component
public class RouteContainer {
 
    @Autowired
    private List<IRoute> routes;
 
    public void showRoutes() {
        for(IRoute route : routes) {
            System.out.println("【注解】" + route.getClass());
            if(route.getClass().isAnnotationPresent(Route.class)) {
                Route at = route.getClass().getAnnotation(Route.class);
                System.out.println("【注解】直接判断符合, value: " + at.value());
            }
        }
    }
}
```

如果采用 spring 增强以后，上述方法是无法获取到注解的。

# 解决方案

## 方案 1

将 `spring.aop.proxy-target-class=true` 去掉， 自动使用JDK代理。

这个当然也简单，但是不符合个人的应用场景。

因为我们有时候写代码就是没有定义接口，所以只能选择其他方案。

## 方案 2

使用 spring 自带的工具类：

```java
Route at = AnnotationUtils.findAnnotation(route.getClass(), Route.class);
if(at != null) {
    System.out.println("【注解】spring 工具判断符合, value: " + at.value());
}
```

使用 spring 的工具，AnnotationUtils.findAnnotation 发现是可以获取到对应的注解的。

## 方案 3

这个也是我记忆中的解决方案。

调整一下注解的定义，添加一下 `@Inherited` 注解属性。

CGLIB 字节码增强，原理还是继承了原来的类，生成一个新的子类。这个属性让子类也可以拥有父类的注解。

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface Route {
 
    String value() default "";
 
}
```

以上 3 种方案都可以解决我们的这个问题，实际还是需要结合自己的项目，去实现。

比如我让同事选择的方案是，@Transactional 注解直接放在 service 层，路由相关的方法不要声明事务注解，也算是一种曲线救国。

# 小结

对于通用的组件，最好添加对应的开关，便于用户灵活配置。

# 参考资料

[spring 增强之后无法获取自定义注解属性及解决方案](https://blog.csdn.net/zhousenshan/article/details/113359991)

* any list
{:toc}