---
layout: post
title: springboot 启动报错 is expected to be of type but was actually of type com.sun.proxy.$Proxy 的问题
date:  2023-03-07 +0800
categories: [Exception]
tags: [exception, spring, sh]
published: true
---

# 说明

在代码中添加了一个 aop 拦截器，对一些方法进行拦截。

```java
@Component
@Aspect
@Slf4j
public class MyAop {
    //具体拦截逻辑
}
```

## 异常

然后发现本来注入正常的对象，报错：

```
is expected to be of type but was actually of type com.sun.proxy.$Proxy 的问题
```

## 解决办法：

启动类增加 `@EnableAspectJAutoProxy(proxyTargetClass = true)` 注解即可。

PS: 我是直接加在 aop 方法上的。

## 原因

aop 导致原始的类被代理了。

阅读以下源码很容易看出，如果目标类是接口或者代理类，使用 jdk 动态代理，否则使用 cglib 代理。

在 spring boot 启动类中添加 @EnableAspectJAutoProxy(proxyTargetClass = true)，会激活 CglibAutoProxyConfiguration，启用 cglib 代理。

```java
public class DefaultAopProxyFactory implements AopProxyFactory, Serializable {

	@Override
	public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
		if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
			Class<?> targetClass = config.getTargetClass();
			if (targetClass == null) {
				throw new AopConfigException("TargetSource cannot determine target class: " +
						"Either an interface or a target is required for proxy creation.");
			}
			if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
				return new JdkDynamicAopProxy(config);
			}
			return new ObjenesisCglibAopProxy(config);
		}
		else {
			return new JdkDynamicAopProxy(config);
		}
	}

	private boolean hasNoUserSuppliedProxyInterfaces(AdvisedSupport config) {
		Class<?>[] ifcs = config.getProxiedInterfaces();
		return (ifcs.length == 0 || (ifcs.length == 1 && SpringProxy.class.isAssignableFrom(ifcs[0])));
	}

}
```

# 参考资料

https://blog.csdn.net/kodmoqn/article/details/117383615

[已解决！but was actually of type ‘com.sun.proxy.$Proxy**‘的两种解决方法](https://blog.csdn.net/CSDN___LYY/article/details/76687588)

https://blog.csdn.net/qq_32029605/article/details/85017934

* any list
{:toc}