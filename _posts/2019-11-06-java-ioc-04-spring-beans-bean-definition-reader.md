---
layout: post
title: Java IOC-03-spring beans 之 BeanDefinitionReader
date:  2019-11-06 11:18:30 +0800
categories: [Java]
tags: [java, ioc, spring, sh]
published: true
---

# BeanDefinitionReader

## 简介

spring提供了有两种方式的bean definition解析器：PropertiesBeanDefinitionReader和XmLBeanDefinitionReader即属性文件格式的bean definition解析器和xml文件格式的bean definition解析器。

## 个人理解 

BeanDefinition 定义了 Bean 的元数据信息，如何获取这些信息，那么就需要有相关的读取类。

数据来源可以是如下的部分：

（1）xml

（2）json

（3）properties

（4）yaml

（5）java 源码指定

....

无论怎么拓展，原理是不会变的。

这些信息要告诉我们如何创建 bean，以及这些 bean 之间的关系。


# PropertiesBeanDefinitionReader 

## 作用

属性文件 bean definition 解析器

一种简单的属性文件格式的bean definition解析器，提供以Map/Properties类型ResourceBundle类型定义的bean的注册方法。

ps: 这里有个点也很重要，properties 与 map 应该抽象为同一种解析方式。

例如：

```properties
employee.(class)=MyClass       // bean is of class MyClass
employee.(abstract)=true       // this bean can't be instantiated directly
employee.group=Insurance       // real property
employee.usesDialUp=false      // real property (potentially overridden)

salesrep.(parent)=employee     // derives from "employee" bean definition
salesrep.(lazy-init)=true      // lazily initialize this singleton bean
salesrep.manager(ref)=tony     // reference to another bean
salesrep.department=Sales      // real property

techie.(parent)=employee       // derives from "employee" bean definition
techie.(scope)=prototype       // bean is a prototype (not a shared instance)
techie.manager(ref)=jeff       // reference to another bean
techie.department=Engineering  // real property
techie.usesDialUp=true         // real property (overriding parent value)

ceo.$0(ref)=secretary          // inject 'secretary' bean as 0th constructor arg
ceo.$1=1000000                 // inject value '1000000' at 1st constructor arg
```

## 层次结构

```java
public class PropertiesBeanDefinitionReader extends AbstractBeanDefinitionReader {}

public abstract class AbstractBeanDefinitionReader implements EnvironmentCapable, BeanDefinitionReader {}
```

其中：

EnvironmentCapable接口是一个包含和暴露Enviroment引用的组件。

所有的spring的application context都继承了EnvironmentCapable接口，这个接口的主要用来在框架中使用instanceof方法检测，为了和enviroment进行交互，instanceof方法用来检查beanFactory实例是否是applicationContext实例。

像说明提到到，applicationContext继承了EnvironmentCapable接口，因此暴露了一个getEnviroment()方法，ConfigurableApplicationContext重写了getEnviroment方法，返回了一个ConfigurableEnviroment。

BeanDefinitionReader接口定义了bean definition 解析器的基本方法，特别是使用resource来加载bean definition的方法。

## AbstractBeanDefinitionReader 

抽象 bean definition 解析器 AbstractBeanDefinitionReader 

### EnvironmentCapable 接口

只有一个方法 getEnviroment()，其实现如下：

```java
// Inherit Environment if possible
if (this.registry instanceof EnvironmentCapable) {
    this.environment = ((EnvironmentCapable) this.registry).getEnvironment();
} else {
    this.environment = new StandardEnvironment();
}
```

当实现了BeanDefinitionRegistry接口的beanFactory同时实现了EnvironmentCapable接口，则直接使用该beanfactory的getEnviroment()方法，否则使用默认的标准Enviroment。

其中，StandardEnvironment类实现了Enviroment接口，适用于标准的应用(例如非web应用)。

该接口还通过AbstractEnvironment接口间接继承ConfigurableEnvironment接口，故具有ConfigurableEnvironment接口的功能：属性解析和profile相关操作。

同时该类还配置了两个默认属性源，按照查询顺序如下：

系统属性，系统环境变量。

这就是说，若键"xyz" 即是当前进程的jvm的系统属性也是系统环境变量，则键值则是从系统属性中获取(environment.getProperty("xyz")). 

这种顺序安排是系统默认的，因为系统属性优先于jvm，而系统环境变量则可以在给定系统的多个jvm中共享。

系统属性优先允许对不同jvm的环境变量进行定制。

### BeanDefinitionReader接口实现方法

BeanDefinitionReader接口提供了标准的解析器方法： 

```
ClassLoader getBeanClassLoader() 返回加载bean类型（classes）的class loader。
BeanNameGenerator getBeanNameGenerator() 返回匿名bean（没有指明name的bean）的BeanNameGenerator. 
BeanDefinitionRegistry getRegistry()返回注册bean definition的beanFactory. 
ResourceLoader getResourceLoader()返回指定资源位置的 resource loader. 
int loadBeanDefinitions(Resource... resources) 根据指定的多个资源加载bean definition. 
int loadBeanDefinitions(Resource resource) 根据指定的一个资源加载bean definition.
int loadBeanDefinitions(String... locations) 根据指定的多个资源位置加载. 
int loadBeanDefinitions(String location) 根据指定的一个资源位置加载bean definition.
```

- loadBeanDefinitions

核心方法。

```java
	/**
	 * Load bean definitions from the specified properties file.
	 * @param encodedResource the resource descriptor for the properties file,
	 * allowing to specify an encoding to use for parsing the file
	 * @param prefix a filter within the keys in the map: e.g. 'beans.'
	 * (can be empty or {@code null})
	 * @return the number of bean definitions found
	 * @throws BeanDefinitionStoreException in case of loading or parsing errors
	 */
	public int loadBeanDefinitions(EncodedResource encodedResource, String prefix)
			throws BeanDefinitionStoreException {

		Properties props = new Properties();
		try {
			InputStream is = encodedResource.getResource().getInputStream();
			try {
				if (encodedResource.getEncoding() != null) {
					getPropertiesPersister().load(props, new InputStreamReader(is, encodedResource.getEncoding()));
				}
				else {
					getPropertiesPersister().load(props, is);
				}
			}
			finally {
				is.close();
			}
			return registerBeanDefinitions(props, prefix, encodedResource.getResource().getDescription());
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException("Could not parse properties from " + encodedResource.getResource(), ex);
		}
	}
```

- registerBeanDefinitions

加载完响应的配置之后，需要对应响应的 Bean 属性注册。

```java
	/**
	 * Register bean definitions contained in a Map.
	 * Ignore ineligible properties.
	 * @param map Map name -> property (String or Object). Property values
	 * will be strings if coming from a Properties file etc. Property names
	 * (keys) <b>must</b> be strings. Class keys must be Strings.
	 * @param prefix a filter within the keys in the map: e.g. 'beans.'
	 * (can be empty or {@code null})
	 * @param resourceDescription description of the resource that the
	 * Map came from (for logging purposes)
	 * @return the number of bean definitions found
	 * @throws BeansException in case of loading or parsing errors
	 * @see #registerBeanDefinitions(Map, String)
	 */
	public int registerBeanDefinitions(Map<?, ?> map, String prefix, String resourceDescription)
			throws BeansException {

		if (prefix == null) {
			prefix = "";
		}
		int beanCount = 0;

		for (Object key : map.keySet()) {
			if (!(key instanceof String)) {
				throw new IllegalArgumentException("Illegal key [" + key + "]: only Strings allowed");
			}
			String keyString = (String) key;
			if (keyString.startsWith(prefix)) {
				// Key is of form: prefix<name>.property
				String nameAndProperty = keyString.substring(prefix.length());
				// Find dot before property name, ignoring dots in property keys.
				int sepIdx = -1;
				int propKeyIdx = nameAndProperty.indexOf(PropertyAccessor.PROPERTY_KEY_PREFIX);
				if (propKeyIdx != -1) {
					sepIdx = nameAndProperty.lastIndexOf(SEPARATOR, propKeyIdx);
				}
				else {
					sepIdx = nameAndProperty.lastIndexOf(SEPARATOR);
				}
				if (sepIdx != -1) {
					String beanName = nameAndProperty.substring(0, sepIdx);
					if (logger.isDebugEnabled()) {
						logger.debug("Found bean name '" + beanName + "'");
					}
					if (!getRegistry().containsBeanDefinition(beanName)) {
						// If we haven't already registered it...
						registerBeanDefinition(beanName, map, prefix + beanName, resourceDescription);
						++beanCount;
					}
				}
				else {
					// Ignore it: It wasn't a valid bean name and property,
					// although it did start with the required prefix.
					if (logger.isDebugEnabled()) {
						logger.debug("Invalid bean name and property [" + nameAndProperty + "]");
					}
				}
			}
		}

		return beanCount;
	}
```


# XmlBeanDefinitionReader

XmlBeanDefinitionReader 解析器和 PropertiesBeanDefinitionReader 解析器基本相同，但在获取bean definition(上面已经论述过)和bean 的注册时不同的。

其真正实现如下代码所示：

```java
	/**
	 * Actually load bean definitions from the specified XML file.
	 * @param inputSource the SAX InputSource to read from
	 * @param resource the resource descriptor for the XML file
	 * @return the number of bean definitions found
	 * @throws BeanDefinitionStoreException in case of loading or parsing errors
	 * @see #doLoadDocument
	 * @see #registerBeanDefinitions
	 */
	protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
			throws BeanDefinitionStoreException {
		try {
			Document doc = doLoadDocument(inputSource, resource);
			return registerBeanDefinitions(doc, resource);
		}
		catch (BeanDefinitionStoreException ex) {
			throw ex;
		}
		catch (SAXParseException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"Line " + ex.getLineNumber() + " in XML document from " + resource + " is invalid", ex);
		}
		catch (SAXException ex) {
			throw new XmlBeanDefinitionStoreException(resource.getDescription(),
					"XML document from " + resource + " is invalid", ex);
		}
		catch (ParserConfigurationException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Parser configuration exception parsing XML from " + resource, ex);
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"IOException parsing XML document from " + resource, ex);
		}
		catch (Throwable ex) {
			throw new BeanDefinitionStoreException(resource.getDescription(),
					"Unexpected exception parsing XML document from " + resource, ex);
		}
	}
```

- doLoadDocument

最终的解析还是会变成 document 解析，实际上还是各种 xml 的解析处理。

```java
/**
 * Actually load the specified document using the configured DocumentLoader.
 * @param inputSource the SAX InputSource to read from
 * @param resource the resource descriptor for the XML file
 * @return the DOM Document
 * @throws Exception when thrown from the DocumentLoader
 * @see #setDocumentLoader
 * @see DocumentLoader#loadDocument
 */
protected Document doLoadDocument(InputSource inputSource, Resource resource) throws Exception {
	return this.documentLoader.loadDocument(inputSource, getEntityResolver(), this.errorHandler,
			getValidationModeForResource(resource), isNamespaceAware());
}
```

# 参考资料

[spring beans源码解读之--bean definiton解析器](https://www.cnblogs.com/davidwang456/p/4190428.html)

* any list
{:toc}
