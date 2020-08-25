---
layout: post
title:  spring 增强之后无法获取自定义注解属性及解决方案
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 场景

为了便于后期代码拓展，在代码中定义了一些注解，统一处理逻辑。

后来有开发同事反应，使用了一下 `@Transactional` 注解之后，注解直接无效了。

还有这种怪事？

# 注解定义

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

- IRoute.java

```java
public interface IRoute {
}
```

- RouteOne.java

```java
@Service
@Route("one")
public class RouteOne implements IRoute {

    public void tx() {

    }

}
```

这里只是演示定义了一个接口，和一个对应的实现。

实际开发可以定义多个不同的实现。

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

## 基本测试

此时，直接测试，日志如下：

```
【注解】class com.github.houbb.mp.sb.learn.mysql.container.RouteOne
【注解】直接判断符合, value: one
```

一切都比较顺利。

# 字节增强之后

## 代码变动

我们只做一处修改。

- RouteOne.java

```java
@Service
@Route("one")
public class RouteOne implements IRoute {

    @Transactional
    public void tx() {

    }

}
```

我们给实际需要使用事务的方法，加上对应的事务注解。

## 测试

```
【注解】class com.github.houbb.mp.sb.learn.mysql.container.RouteOne$$EnhancerBySpringCGLIB$$8c5b09e1
```

我们的类已经变成了一个 sprign 的代理类，而且直接判断也没有生效。

那，这个问题应该怎么解决呢？

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

使用 spring 的工具，`AnnotationUtils.findAnnotation` 发现是可以获取到对应的注解的。

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

直接测试：

```
【注解】class com.github.houbb.mp.sb.learn.mysql.container.RouteOne$$EnhancerBySpringCGLIB$$8c5b09e1
【注解】直接判断符合, value: one
【注解】spring 工具判断符合, value: one
```

以上 3 种方案都可以解决我们的这个问题，实际还是需要结合自己的项目，去实现。

比如我让同事选择的方案是，`@Transactional` 注解直接放在 service 层，路由相关的方法不要声明事务注解，也算是一种曲线救国。

# 参考资料

[项目被CGLIB动态代理后注解无法获取解决方案](https://blog.csdn.net/anenan/article/details/89634953)

* any list
{:toc}