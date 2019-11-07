---
layout: post
title: Java IOC-06-spring beans 之 Annotation
date:  2019-11-06 11:18:30 +0800
categories: [Java]
tags: [java, ioc, spring, annotation, sh]
published: true
---

# spring 注解

随着spring注解的引入，越来越多的开发者开始使用注解，这篇文章将对注解的机制进行串联式的讲解，不求深入透彻，但求串起spring beans注解的珍珠，展示给大家。

## spring beans常用的注解：

- 自动装配

`@Autowired`：可以对成员变量、方法和构造函数进行标注，来完成自动装配的工作。

- 配置属性

`@Configurable` 注解中的autowire属性就可以让Spring来自动装配了： 
  
`@Configurable(autowire=Autowire.BY_TYPE)` 或者 `@Configurable(autowire=Autowire.BY_NAME)`，这样就可以按类型或者按名字自动装配了。

- 属性

`@Value`：用于注入SpEL表达式，可以放置在字段方法或参数上。

- 限定描述符

`@Qualifier`：指定限定描述符，对应于基于XML配置中的 `<qualifier>` 标签，@Qualifier限定描述符除了能根据名字进行注入，但能进行更细粒度的控制如何选择候选者

`@Qualifier(value = "限定标识符")`

用来标识可能存在冲突的属性信息。

- 依赖检查

`@Required` 依赖检查；

Marks a method (typically a JavaBean setter method) as being 'required': that is, the setter method must be configured to be dependency-injected with a value.

Please do consult the javadoc for the RequiredAnnotationBeanPostProcessor class (which, by default, checks for the presence of this annotation).

# 注解 bean 的定义 AnnotatedBeanDefinition

## 接口

```java
public interface AnnotatedBeanDefinition extends BeanDefinition {

    /**
     * Obtain the annotation metadata (as well as basic class metadata)
     * for this bean definition's bean class.
     * @return the annotation metadata object (never {@code null})
     */
    AnnotationMetadata getMetadata();

}
```

该接口继承了BeanDefinition，提供了一个getMetadata()方法来获取该bean definition的注解元数据。

## AnnotationMetadata

其中，AnnotationMetadata定义了访问特定类的注解的抽象接口，它不需要加载该类即可访问。

- 接口

```java
public interface AnnotationMetadata extends ClassMetadata, AnnotatedTypeMetadata {
}
```

## ClassMetadata

定义了一个特定类的抽象元数据，不需要加载此类。

主要方法如下

```
String getClassName()返回该类的名称。boolean isInterface()返回该类是否是接口。boolean isAbstract()返回该类是否为抽象类。boolean isConcrete()返回该类是否为具体类。boolean isFinal()返回该类是否为final类boolean hasSuperClass()返回该类是否有父类
String getSuperClassName()返回父类的名称，没有的话返回null.
String[] getInterfaceNames()返回继承的接口数组，如果没有，返回空.
String[] getMemberClassNames()返回引用的类的名称。
```

## AnnotatedTypeMetadata

AnnotatedTypeMetadata 定义访问特定类型的注解，不需要加载类。

主要方法有：

```
boolean isAnnotated(String annotationType)是否有匹配的注解类型
Map<String,Object> getAnnotationAttributes(String annotationType,boolean classValuesAsString)获取特定类型注解的属性
```

## AnnotationMetadata 的子类实现

## StandardAnnotationMetadata 

AnnotationMetadata的标准实现类StandardAnnotationMetadata,它使用标准的反射来获取制定类的内部注解信息。

主要方法有：

```java
getAllAnnotationAttributes(String annotationType) 
getAnnotatedMethods(String annotationType) 
hasMetaAnnotation(String annotationType) 
isAnnotated(String annotationType) 
hasAnnotatedMethods(String annotationType) 
```

### AnnotationMetadataReadingVisitor

AnnotationMetadata 还有一个子类：AnnotationMetadataReadingVisitor，它是字节码访问实现。

```java
class ClassMetadataReadingVisitor extends ClassVisitor implements ClassMetadata {
}
```

# Visitor 模式

让我们了解一下visitor模式：

## 定义：

The Gang of Four defines the Visitor as: "Represent an operation to be performed on elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements on which it operates."—″≤

The nature of the Visitor makes it an ideal pattern to plug into public APIs thus allowing its clients to perform operations on a class using a “visiting” class without having to modify the source.

## UML

uml 结构图如下：

![UML 结构图](http://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VisitorDiagram.svg/300px-VisitorDiagram.svg.png)

vistor 设置模式把状态抽象出来成为一个接口(访问者)，不同的状态就作为状态的不同实现类(不同的访问者)。

# 注解bean的实现类

## AnnotatedGenericBeanDefinition

继承了GenericBeanDefinition，增加了对注解元素的支持，这种支持是通过AnnotationBeanDefinition暴露的的注解元素接口。

GenericBeanDefinition主要用来测试AnnotatedBeanDefinition上的操作的，

例如：在spring的component扫描支持的实现中（默认实现类是ScannedGenericBeanDefinition，它同样实现了AnnotatedBeanDefinition接口）

## ConfigurationClassBeanDefinition

ConfigurationClassBeanDefinition是ConfigurationClassBeanDefinitionReader的内部类，ConfigurationClassBeanDefinitionReader读取一组完全填充了属性的配置实例，通过context内给定的BeanDefinitionRegistry进行注册bean definition。

这个类在BeanDefinitionReader这层后就改造，但没有继承或者扩展配置类。

## ScannedGenericBeanDefinition

基于asm的类解析器，是GenericBeanDefinition类的扩展，支持注解元数据，这种支持通过AnnotatedBeanDefinition接口实现基于asm的类解析器，是GenericBeanDefinition类的扩展，支持注解元数据，这种支持通过AnnotatedBeanDefinition接口实现。

# @Autowired 注解实现 AutowiredAnnotationBeanPostProcessor

ps: 每一个注解有一个专门的处理实现类。这就是架构优秀的地方。

## 接口

```java
public class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter
        implements MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {
}
```

AutowiredAnnotationBeanPostProcessor 间接继承了BeanPostProcessor，它自动绑定注解的field，setter方法和任意的配置方法。

当检测到5个java注解时这些成员被注入其中。

spring默认的注解为@Autowired和@Value。

另外：也支持JSR-330的@inject注解，作为@Autowired的替代方案。

当制定bean 类的唯一构造方法带有required 注解参数，且required值设置为true时，表明当作为spring一个bean时，构造方法默认自动绑定。

若多个构造方法带有non-required 注解参数，它们将作为自动绑定的候选项。带有大量依赖的构造方法可以通过spring容器中的匹配的bean来构造，如果没有候选者满足条件，则会使用默认的构造器。

注解构造器不一定是public的。

Field 注入是在构造方法之后，配置方法之前，这种配置field不要求一定为public

配置方法可以有任意的名称和不定的参数列表，这些参数则被自动注入到spring容器中的匹配的bean。

bean 的属性 setter 方法仅仅是通用的配置方法的一个特例而已。配置方法不要求方法一定为public

注意：默认注册AutowiredAnnotationBeanPostProcessor的方式有`<context:annotation-config>` 和`<context:component-scan>` xml标签，如果你指定了一个自定义的AutowiredAnnotationBeanPostProcessor bean definition，移除或者关闭默认的注解配置。

## MergedBeanDefinitionPostProcessor

其中，MergedBeanDefinitionPostProcessor 的定义如下：

```java
public interface MergedBeanDefinitionPostProcessor extends BeanPostProcessor {

    /**
     * Post-process the given merged bean definition for the specified bean.
     * @param beanDefinition the merged bean definition for the bean
     * @param beanType the actual type of the managed bean instance
     * @param beanName the name of the bean
     */
    void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName);

}
```

BeanPostProcessor 是一个可以定制修改一个新的bean实例的工厂钩子，

例如：检查marker接口或者使用代理包装他们。

applicationContext 可以在他们的 bean 容器中自动识别 BeanPostProcessor bean，并将它们应用到接下来所创建的bean。

一般的 bean factory 通过编程来注册 Post-processor，并将它们应用到整个bean factory创建bean的过程中。

通常意义上，post-processor 设置bean属性通过marker 接口或者类似于实现

`postProcessBeforeInitialization(java.lang.Object, java.lang.String)`

使用代理包装bean通常实现 `postProcessAfterInitialization(java.lang.Object, java.lang.String)`.

## 钩子函数

BeanPostProcessor 是一个非常强大的钩子函数，可以在基础的属性定义完成之后，进一步对对象进行处理。

# @configurable注解实现AnnotationBeanWiringInfoResolver 

设置 @Configurable 注解中的autowire属性就可以让Spring来自动装配了：

`@Configurable(autowire=Autowire.BY_TYPE)` 或者 `@Configurable(autowire=Autowire.BY_NAME)`，这样就可以按类型或者按名字自动装配了。

## 接口

AnnotationBeanWiringInfoResolver 继承自BeanWiringInfoResolver，BeanWiringInfoResolver使用configurable注解来查找哪些类需要自动绑定。

```java
public class AnnotationBeanWiringInfoResolver implements BeanWiringInfoResolver {}
```

## 核心方法

实现了 BeanWiringInfoResolver 的resolveWiringInfo方法

```java
@Override
public BeanWiringInfo resolveWiringInfo(Object beanInstance) {
	Assert.notNull(beanInstance, "Bean instance must not be null");
	Configurable annotation = beanInstance.getClass().getAnnotation(Configurable.class);
	return (annotation != null ? buildWiringInfo(beanInstance, annotation) : null);
}

/**
 * Build the BeanWiringInfo for the given Configurable annotation.
 * @param beanInstance the bean instance
 * @param annotation the Configurable annotation found on the bean class
 * @return the resolved BeanWiringInfo
 */
protected BeanWiringInfo buildWiringInfo(Object beanInstance, Configurable annotation) {
	if (!Autowire.NO.equals(annotation.autowire())) {
		return new BeanWiringInfo(annotation.autowire().value(), annotation.dependencyCheck());
	}
	else {
		if (!"".equals(annotation.value())) {
			// explicitly specified bean name
			return new BeanWiringInfo(annotation.value(), false);
		}
		else {
			// default bean name
			return new BeanWiringInfo(getDefaultBeanName(beanInstance), true);
		}
	}
}
```

# @Qualifier 的注解实现类 QualifierAnnotationAutowireCandidateResolver

## 接口

```java
public class QualifierAnnotationAutowireCandidateResolver extends GenericTypeAwareAutowireCandidateResolver {}

public class GenericTypeAwareAutowireCandidateResolver extends SimpleAutowireCandidateResolver
		implements BeanFactoryAware {}
```

## 简介

其中，AutowireCandidateResolver是一个策略接口，由它来决定特定的bean definition对特定的依赖是否可以作为一个自动绑定的候选项，它的主要方法有：

```java
boolean isAutowireCandidate(BeanDefinitionHolder bdHolder, DependencyDescriptor descriptor)

Object getLazyResolutionProxyIfNecessary(DependencyDescriptor descriptor,String beanName)

Object getSuggestedValue(DependencyDescriptor descriptor)
```

QualifierAnnotationAutowireCandidateResolver间接实现了AutowireCandidateResolver，对要自动绑定的field或者参数和bean definition根据 `@Qualifier` 注解进行匹配。

同时也支持通过 `@Value` 注解来绑定表达式的值。

另外，还只是JSR-330的javax.inject.Qualifier注解。

# @Required 注解实现类 RequiredAnnotationBeanPostProcessor

## 接口

```java
public class RequiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter
		implements MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {}
```

## 简介

和AutowiredAnnotationBeanPostProcessor一样，间接继承自BeanPostProcessor，它增加了对javaBean属性配置的约束，java 5 注解可以检测bean的required属性，spring默认是@Required注解。

注意：默认注册AutowiredAnnotationBeanPostProcessor的方式有 `<context:annotation-config>` 和 `<context:component-scan>` xml标签，如果你指定了一个自定义的默认注册AutowiredAnnotationBeanPostProcessor的方式有`<context:annotation-config>` 和`<context:component-scan>` xml标签，如果你指定了一个自定义的AutowiredAnnotationBeanPostProcessor bean definition，移除或者关闭默认的注解配置。

其余和AutowiredAnnotationBeanPostProcessor类似，不一一赘述了。

# 初始化和销毁方法的注解实现类 InitDestroyAnnotationBeanPostProcessor

## 接口

```java
public class InitDestroyAnnotationBeanPostProcessor
        implements DestructionAwareBeanPostProcessor, MergedBeanDefinitionPostProcessor, PriorityOrdered, Serializable {
}
```

## 说明

InitDestroyAnnotationBeanPostProcessor间接继承了BeanPostProcess，实现了通过注解来初始化和销毁方法，是spring的InitializingBean和DisposableBean回调接口的注解实现。

它通过"initAnnotationType"和"destroyAnnotationType"属性来检查指定的注解类型，任何自定义的注解都可以使用。

初始化和销毁注解可以用在任意可见的方法：public,package-protected,protected,private等。

尽管可以对多个方法进行注解，但我们推荐只在一个初始化和销毁方法上各自进行注解。


# 小结：

Spring3 的基于注解实现Bean依赖注入支持如下三种注解：

1. Spring自带依赖注入注解： Spring自带的一套依赖注入注解；

2. JSR-250注解：Java平台的公共注解，是Java EE 5规范之一，在JDK6中默认包含这些注解，从Spring2.5开始支持。

3. JSR-330注解：Java 依赖注入标准，Java EE 6规范之一，可能在加入到未来JDK版本，从Spring3开始支持；

其中，

## Spring自带依赖注入注解

- @Required：依赖检查；

- @Autowired：自动装配

自动装配，用于替代基于XML配置的自动装配基于@Autowired的自动装配，默认是根据类型注入，可以用于构造器、字段、方法注入

- @Value：注入SpEL表达式

用于注入SpEL表达式，可以放置在字段方法或参数上

```java
@Value(value = "SpEL表达式")  
@Value(value = "#{message}")  
```

- @Qualifier：限定描述符，用于细粒度选择候选者

@Qualifier限定描述符除了能根据名字进行注入，但能进行更细粒度的控制如何选择候选者

```java
@Qualifier(value = "限定标识符") 
```

## JSR-250注解

- @Resource：自动装配

默认根据类型装配，如果指定name属性将根据名字装配，可以使用如下方式来指定字段或setter方法 

```java
@Resource(name = "标识符")  
```

- @PostConstruct和PreDestroy：

通过注解指定初始化和销毁方法定义
 
## JSR-330注解

@Inject：等价于默认的@Autowired，只是没有required属性

@Named：指定Bean名字，对应于Spring自带@Qualifier中的缺省的根据Bean名字注入情况

@Qualifier：只对应于Spring自带@Qualifier中的扩展@Qualifier限定描述符注解，即只能扩展使用，没有value属性

# 个人收获

## 架构的设计

spring 将注解相关作为 spring 的核心，但是 spring-beans 是反射的基石。

这种分工设计是非常棒的，设计基础本身就应该不依赖于任何注解。

## JSR 标准

实现的时候，可以多参考标准。

不然还要做兼容。

# 参考资料

[spring beans源码解读之--Bean的注解(annotation)](https://www.cnblogs.com/davidwang456/p/4199459.html)

* any list
{:toc}
