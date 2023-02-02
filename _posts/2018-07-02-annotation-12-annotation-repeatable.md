---
layout: post
title:  Annotation-12-annotation repeatable java的多重注解（重复注解）
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# jdk7

## 注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Scope("request")
public @interface AuthValidation
{
         String actionOfMenu();
         String actionType();
}
```

但是我需要一个多重注解，于是就想到了用容器来盛放，那不就是多重注解了嘛，所以就用了个数组存放。

代码如下：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Scope("request")
public @interface AuthValidations
{
         AuthValidation[] value();
}
```

在实际的使用过程中也很简单，就是把原来的注解变成注解容器就好了，原来的注解是

```java
@AuthValidation(actionOfMenu=Constant.Constant.MENU_ACTION_CASE,actionType="Constant.ACTION_TYPE_SEARCH")
```

修改为注解容器后，就变成

```java
@AuthValidations({
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_INFO,actionType=Constant.ACTION_TYPE_SEARCH),
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_CFD,actionType=Constant.ACTION_TYPE_SEARCH),
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_CASE,actionType=Constant.ACTION_TYPE_SEARCH),
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_FILE,actionType=Constant.ACTION_TYPE_SEARCH)
})
public String refreshGridModel() { return super.refreshGridModel(); }
```

在拦截器上就把之前的权限注解的验证，变成权限注解容器的验证，之前是通过反射获取的注解，现在是通过反射获取注解容器也就是注解数组，然后再遍历验证就可以了。

# JDK8

在java 8里面，多重注解是一个新特性，也使多重注解简单很多。

java 8允许我们把同一个类型的注解使用多次，只需要给该注解标注一下 `@Repeatable` 即可。

代码如下：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Scope("request")
@Repeatable(AuthValidations.class)
public @interface AuthValidation
{
         String actionOfMenu();
         String actionType();
}
```

注解容器代码如下：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@Scope("request")
public @interface AuthValidations
{
         AuthValidation[]value();
}
```


只需要在自定义注解上添加 `@Repeatable(AuthValidations.class)` 即可。

在使用时，也只需要重复使用就可以了，即：

```java
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_INFO,actionType=Constant.ACTION_TYPE_SEARCH)
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_CFD,actionType=Constant.ACTION_TYPE_SEARCH)
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_CASE,actionType=Constant.ACTION_TYPE_SEARCH)
@AuthValidation(actionOfMenu=Constant.MENU_ACTION_FILE,actionType=Constant.ACTION_TYPE_SEARCH)
public String refreshGridModel() { returnsuper.refreshGridModel();}
```

# 参考资料

[java的多重注解（重复注解）](https://blog.csdn.net/wal1314520/article/details/80269389)

* any list
{:toc}