---
layout: post
title:  Spring Property 03- PropertyPlaceholderConfigurer 源码分析
date:  2017-09-01 22:17:36 +0800
categories: [Spring]
tags: [spring, property]
published: true
---


# 拓展

后续 PropertySourcesPlaceholderConfigurer

# PropertyPlaceholderConfigurer 类

## 类定义

```java
public class PropertyPlaceholderConfigurer extends PlaceholderConfigurerSupport {
```

继承自  PlaceholderConfigurerSupport

## 变量

```java
// 不检测系统变量
public static final int SYSTEM_PROPERTIES_MODE_NEVER = 0;

// 如果指定配置不存在，则以系统变量为准
public static final int SYSTEM_PROPERTIES_MODE_FALLBACK = 1;

 // 系统变量优先级高于指定变量
public static final int SYSTEM_PROPERTIES_MODE_OVERRIDE = 2;

private int systemPropertiesMode = SYSTEM_PROPERTIES_MODE_FALLBACK;
```

## 处理占位符

```java
protected String resolvePlaceholder(String placeholder, Properties props, int systemPropertiesMode) {
	String propVal = null;
    //系统变量优先级高于指定变量
	if (systemPropertiesMode == SYSTEM_PROPERTIES_MODE_OVERRIDE) {
        // 直接以系统变量为准
		propVal = resolveSystemProperty(placeholder);
	}

    // 如果配置值不存在，以指定配置为准
	if (propVal == null) {
		propVal = resolvePlaceholder(placeholder, props);
	}

    // 如果指定配置值不存在，处理系统配置值
	if (propVal == null && systemPropertiesMode == SYSTEM_PROPERTIES_MODE_FALLBACK) {
		propVal = resolveSystemProperty(placeholder);
	}

	return propVal;
}
```

### 获取指定配置

非常简单，直接从 props 中获取即可。

```java
protected String resolvePlaceholder(String placeholder, Properties props) {
	return props.getProperty(placeholder);
}
```

### 获取系统配置

```java
protected String resolveSystemProperty(String key) {
	try {
        // 获取系统配置值
		String value = System.getProperty(key);

        // 如果值不存在，则获取系统环境变量。
		if (value == null && this.searchSystemEnvironment) {
			value = System.getenv(key);
		}
		return value;
	} catch (Throwable ex) {
		// 异常处理
	}
}
```

## 执行配置替换处理

上面的方法是获取到对应的配置，然后就是执行对应占位符 `${}` 的属性替换。

```java
@Override
protected void processProperties(ConfigurableListableBeanFactory beanFactoryToProcess, Properties props)
		throws BeansException {
	StringValueResolver valueResolver = new PlaceholderResolvingStringValueResolver(props);
	doProcessProperties(beanFactoryToProcess, valueResolver);
}
```

其中 `PlaceholderResolvingStringValueResolver` 实现如下：

```java
private class PlaceholderResolvingStringValueResolver implements StringValueResolver {

	private final PropertyPlaceholderHelper helper;

	private final PlaceholderResolver resolver;

	public PlaceholderResolvingStringValueResolver(Properties props) {
		this.helper = new PropertyPlaceholderHelper(
				placeholderPrefix, placeholderSuffix, valueSeparator, ignoreUnresolvablePlaceholders);
		this.resolver = new PropertyPlaceholderConfigurerResolver(props);
	}

	@Override
	public String resolveStringValue(String strVal) throws BeansException {
		String resolved = this.helper.replacePlaceholders(strVal, this.resolver);
		if (trimValues) {
			resolved = resolved.trim();
		}
		return (resolved.equals(nullValue) ? null : resolved);
	}
}
```

核心作用：通过配置，获取占位符对应的字符串值。

`PropertyPlaceholderConfigurerResolver` 实现如下：

```java
private class PropertyPlaceholderConfigurerResolver implements PlaceholderResolver {
	private final Properties props;
	private PropertyPlaceholderConfigurerResolver(Properties props) {
		this.props = props;
	}

	@Override
	public String resolvePlaceholder(String placeholderName) {
		return PropertyPlaceholderConfigurer.this.resolvePlaceholder(placeholderName, props, systemPropertiesMode);
	}
}
```

### 执行 bean 属性替换

这个实现实在父类中。

```java
protected void doProcessProperties(ConfigurableListableBeanFactory beanFactoryToProcess,
		StringValueResolver valueResolver) {

    // 获取对象值定义 visitor 类        
	BeanDefinitionVisitor visitor = new BeanDefinitionVisitor(valueResolver);
    // 获取相关的所有 bean 名称
	String[] beanNames = beanFactoryToProcess.getBeanDefinitionNames();
	for (String curName : beanNames) {
        // 避免解析自己的配置，导致配置找不到的场景
		if (!(curName.equals(this.beanName) && beanFactoryToProcess.equals(this.beanFactory))) {
			BeanDefinition bd = beanFactoryToProcess.getBeanDefinition(curName);
			try {
                //TODO: 后续可以在这里，获取对应的 bean 属性信息，
                
                // 执行属性替换
				visitor.visitBeanDefinition(bd);
			}
			catch (Exception ex) {
				throw new BeanDefinitionStoreException(bd.getResourceDescription(), curName, ex.getMessage(), ex);
			}
		}
	}

    // 解决别名问题
	beanFactoryToProcess.resolveAliases(valueResolver);
    // 解决内嵌值问题，比如注解属性
	beanFactoryToProcess.addEmbeddedValueResolver(valueResolver);
}
```




* any list
{:toc}
