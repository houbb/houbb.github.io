---
layout: post
title:  Annotation-10-Aspect Order
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# 情景

自己定义了一个 AOP，发现 spring 的 `@Transactional` 变得无效了。

# 如何指定优先级

## 注解

```java
public @interface Order {

	/**
	 * The order value.
	 * <p>Default is {@link Ordered#LOWEST_PRECEDENCE}.
	 * @see Ordered#getOrder()
	 */
	int value() default Ordered.LOWEST_PRECEDENCE;

}
```

## 接口

```java
public interface Ordered {

	/**
	 * Get the order value of this object.
	 * <p>Higher values are interpreted as lower priority. As a consequence,
	 * the object with the lowest value has the highest priority (somewhat
	 * analogous to Servlet {@code load-on-startup} values).
	 * <p>Same order values will result in arbitrary sort positions for the
	 * affected objects.
	 * @return the order value
	 * @see #HIGHEST_PRECEDENCE
	 * @see #LOWEST_PRECEDENCE
	 */
	int getOrder();

}
```

# 到底优先级是怎么执行的？

## springBoot 的注解相关配置

直接根据注解 `@EnableTransactionManagement` 查看类`ProxyTransactionManagementConfiguration`

```java
@Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor() {
	BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
	advisor.setTransactionAttributeSource(transactionAttributeSource());
	advisor.setAdvice(transactionInterceptor());
	advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
	return advisor;
}
```

这里的默认值 `this.enableTx.<Integer>getNumber("order")` 是一个很大的值。

## 执行拦截的核心代码

执行拦截的类 `TransactionInterceptor`

```java
@Override
public Object invoke(final MethodInvocation invocation) throws Throwable {
	// Work out the target class: may be {@code null}.
	// The TransactionAttributeSource should be passed the target class
	// as well as the method, which may be from an interface.
	Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
	// Adapt to TransactionAspectSupport's invokeWithinTransaction...
	return invokeWithinTransaction(invocation.getMethod(), targetClass, new InvocationCallback() {
		@Override
		public Object proceedWithInvocation() throws Throwable {
			return invocation.proceed();
		}
	});
}
```

## 到底是怎么执行的？

根据测试，发现 spring 的 aop 应该不是线性执行的。

spring 的 aop 应该嵌套执行的。

比如自定义 MyAspect，指定一个较小的 order（执行优先级较高）。

会先进入 MyAspect 的入口，然后进入 `@Trasactional` 的方法。然后执行 MyAspect 的方法结束。


* any list
{:toc}