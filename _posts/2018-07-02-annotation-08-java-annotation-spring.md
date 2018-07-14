---
layout: post
title:  Annotation-08-java annotation spring
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# Java Annotation with spring

## Action.java

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Action {

    /**
     * 当前方法描述
     * @return 描述
     */
    String desc() default "";

}
```

##  使用

- 接口定义:

```java
public interface Demo {
    void method();
}
```

- 实现：

```java
@Component
@Action
public class DemoOne implements Demo{

    @Override
    public void method(){
    }   

}
```

```java
@Component
@Action
public class DemoTwo implements Demo{

    @Transactional
    @Override
    public void method(){
    }   
}
```

## container 获取

```java
@Component
public class DemoContainer {

    // 将所有 Demo 的子类注入到列表中
    @Autowired
    private List<Demo> demoList;

    public void match() {
        for(Demo demo : demoList) {
            Action action = demo.getClass().getAnnotation(Action.class);
        }
    }

}
```


## 问题

会发现，当使用 `@Transactional` 注解的时候，是无法获取到对应的 `@Action` 注解的。

注解发现，这个类已经变成了 spring 的 CGLib 的代理类。

## 解决方案

想到的解决方法：

判断 Demo 实例的时候，如果为代理则进行强转，获取对应的 `target`。然后再次获取注解。

后来查了相关资料，注解如下调整即可。

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface Action {

    /**
     * 当前方法描述
     * @return 描述
     */
    String desc() default "";

}
```



* any list
{:toc}