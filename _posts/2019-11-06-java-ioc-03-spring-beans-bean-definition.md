---
layout: post
title: Java IOC-03-spring beans 之 BeanDefinition
date:  2019-11-06 11:18:30 +0800
categories: [Java]
tags: [java, ioc, spring, sh]
published: true
---

# Bean 的属性定义

## 作用

bean的定义，包装是java bean的基础。

再怎么强调它的重要性都不为过，因此深入了解这块的代码对以后的代码研究可以起到事半功倍的功效。

## 个人理解

可以理解为对象的元信息。

# BeanDefinition

## BeanDefinition 作用

一个BeanDefinition描述了一个bean的实例，包括属性值，构造方法参数值和继承自它的类的更多信息。

BeanDefinition仅仅是一个最简单的接口，主要功能是允许 BeanFactoryPostProcessor 例如 PropertyPlaceHolderConfigure 能够检索并修改属性值和别的bean的元数据。

## BeanDefinition 的继承关系

父接口：

AttributeAccessor, BeanMetadataElement 

子接口： 

AnnotatedBeanDefinition 

子类: 

AbstractBeanDefinition, AnnotatedGenericBeanDefinition, ChildBeanDefinition, GenericBeanDefinition, RootBeanDefinition,ScannedGenericBeanDefinition 

其中，AttributeAccessor 接口定义了最基本的对任意对象的元数据的修改或者获取

## BeanDefinition 的抽象类 AbstractBeanDefinition

- AbstractBeanDefinition.java

```java
public abstract class AbstractBeanDefinition extends BeanMetadataAttributeAccessor
		implements BeanDefinition, Cloneable {}
```

- BeanMetadataAttributeAccessor.java

```java
public class BeanMetadataAttributeAccessor extends AttributeAccessorSupport implements BeanMetadataElement {}
```



## 实现子类

bean definition 实现类 ChildBeanDefinition, GenericBeanDefinition, RootBeanDefinition

### ChildBeanDefinition

是一种bean definition，它可以继承它父类的设置，即ChildBeanDefinition对RootBeanDefinition有一定的依赖关系。

ChildBeanDefinition从父类继承构造参数值，属性值并可以重写父类的方法，同时也可以增加新的属性或者方法。

(类同于java类的继承关系)。

若指定初始化方法，销毁方法或者静态工厂方法，ChildBeanDefinition将重写相应父类的设置。

depends on，autowire mode，dependency check，sigleton，lazy init 一般由子类自行设定。

注意：从spring 2.5 开始，提供了一个更好的注册bean definition类GenericBeanDefinition，它支持动态定义父依赖，方法是`GenericBeanDefinition.setParentName(java.lang.String)`，GenericBeanDefinition可以有效的替代ChildBeanDefinition的绝大分部使用场合。

### GenericBeanDefinition

是一站式的标准bean definition，除了具有指定类、可选的构造参数值和属性参数这些其它bean definition一样的特性外，它还具有通过parenetName属性来灵活设置parent bean definition。

通常， GenericBeanDefinition用来注册用户可见的bean definition(可见的bean definition意味着可以在该类bean definition上定义post-processor来对bean进行操作，甚至为配置parent name做扩展准备)。

RootBeanDefinition/ChildBeanDefinition 用来预定义具有parent/child关系的bean definition。

### RootBeanDefinition

一个RootBeanDefinition定义表明它是一个可合并的bean definition：

即在spring beanFactory运行期间，可以返回一个特定的bean。

RootBeanDefinition可以作为一个重要的通用的bean definition 视图。

RootBeanDefinition用来在配置阶段进行注册bean definition。

然后，从spring 2.5后，编写注册bean definition有了更好的的方法：GenericBeanDefinition。

GenericBeanDefinition支持动态定义父类依赖，而非硬编码作为root bean definition。

涉及到的类：BeanDefinitionHolder，根据名称或者别名持有beanDefinition。

可以为一个内部bean 注册为placeholder。

BeanDefinitionHolder也可以编写一个内部bean definition的注册，如果你不关注BeanNameAware等，完全可以使用RootBeanDefinition或者ChildBeanDefinition来替代。


# Bean 的包装 BeanWrapper

## 作用

作用：提供对标准javabean的分析和操作方法：单个或者批量获取和设置属性值，获取属性描述符，查询属性的可读性和可写性等。

支持属性的嵌套设置，深度没有限制。

## 继承关系：

```java
public interface BeanWrapper extends ConfigurablePropertyAccessor
```

```java
public interface ConfigurablePropertyAccessor extends PropertyAccessor, PropertyEditorRegistry, TypeConverter {}
```

## BeanWrapper的实现类：BeanWrapperImpl

BeanWrapperImpl作用：可以根据需求，将集合与数组的值转换到对应目标对象的集合和数组。

自定义的属性编辑器通过属性编辑器的setValue，setAsText方法实现上述的转换功能。

BeanWrapperImpl 默认的PropertyEditor的实现如下：(PropertyEditorRegistrySupport.java)

```java
    /**
	 * Actually register the default editors for this registry instance.
	 */
	private void createDefaultEditors() {
		this.defaultEditors = new HashMap<Class<?>, PropertyEditor>(64);

		// Simple editors, without parameterization capabilities.
		// The JDK does not contain a default editor for any of these target types.
		this.defaultEditors.put(Charset.class, new CharsetEditor());
		this.defaultEditors.put(Class.class, new ClassEditor());
		this.defaultEditors.put(Class[].class, new ClassArrayEditor());
		this.defaultEditors.put(Currency.class, new CurrencyEditor());
		this.defaultEditors.put(File.class, new FileEditor());
		this.defaultEditors.put(InputStream.class, new InputStreamEditor());
		this.defaultEditors.put(InputSource.class, new InputSourceEditor());
		this.defaultEditors.put(Locale.class, new LocaleEditor());
		if (pathClass != null) {
			this.defaultEditors.put(pathClass, new PathEditor());
		}
		this.defaultEditors.put(Pattern.class, new PatternEditor());
		this.defaultEditors.put(Properties.class, new PropertiesEditor());
		this.defaultEditors.put(Reader.class, new ReaderEditor());
		this.defaultEditors.put(Resource[].class, new ResourceArrayPropertyEditor());
		this.defaultEditors.put(TimeZone.class, new TimeZoneEditor());
		this.defaultEditors.put(URI.class, new URIEditor());
		this.defaultEditors.put(URL.class, new URLEditor());
		this.defaultEditors.put(UUID.class, new UUIDEditor());
		if (zoneIdClass != null) {
			this.defaultEditors.put(zoneIdClass, new ZoneIdEditor());
		}

		// Default instances of collection editors.
		// Can be overridden by registering custom instances of those as custom editors.
		this.defaultEditors.put(Collection.class, new CustomCollectionEditor(Collection.class));
		this.defaultEditors.put(Set.class, new CustomCollectionEditor(Set.class));
		this.defaultEditors.put(SortedSet.class, new CustomCollectionEditor(SortedSet.class));
		this.defaultEditors.put(List.class, new CustomCollectionEditor(List.class));
		this.defaultEditors.put(SortedMap.class, new CustomMapEditor(SortedMap.class));

		// Default editors for primitive arrays.
		this.defaultEditors.put(byte[].class, new ByteArrayPropertyEditor());
		this.defaultEditors.put(char[].class, new CharArrayPropertyEditor());

		// The JDK does not contain a default editor for char!
		this.defaultEditors.put(char.class, new CharacterEditor(false));
		this.defaultEditors.put(Character.class, new CharacterEditor(true));

		// Spring's CustomBooleanEditor accepts more flag values than the JDK's default editor.
		this.defaultEditors.put(boolean.class, new CustomBooleanEditor(false));
		this.defaultEditors.put(Boolean.class, new CustomBooleanEditor(true));

		// The JDK does not contain default editors for number wrapper types!
		// Override JDK primitive number editors with our own CustomNumberEditor.
		this.defaultEditors.put(byte.class, new CustomNumberEditor(Byte.class, false));
		this.defaultEditors.put(Byte.class, new CustomNumberEditor(Byte.class, true));
		this.defaultEditors.put(short.class, new CustomNumberEditor(Short.class, false));
		this.defaultEditors.put(Short.class, new CustomNumberEditor(Short.class, true));
		this.defaultEditors.put(int.class, new CustomNumberEditor(Integer.class, false));
		this.defaultEditors.put(Integer.class, new CustomNumberEditor(Integer.class, true));
		this.defaultEditors.put(long.class, new CustomNumberEditor(Long.class, false));
		this.defaultEditors.put(Long.class, new CustomNumberEditor(Long.class, true));
		this.defaultEditors.put(float.class, new CustomNumberEditor(Float.class, false));
		this.defaultEditors.put(Float.class, new CustomNumberEditor(Float.class, true));
		this.defaultEditors.put(double.class, new CustomNumberEditor(Double.class, false));
		this.defaultEditors.put(Double.class, new CustomNumberEditor(Double.class, true));
		this.defaultEditors.put(BigDecimal.class, new CustomNumberEditor(BigDecimal.class, true));
		this.defaultEditors.put(BigInteger.class, new CustomNumberEditor(BigInteger.class, true));

		// Only register config value editors if explicitly requested.
		if (this.configValueEditorsActive) {
			StringArrayPropertyEditor sae = new StringArrayPropertyEditor();
			this.defaultEditors.put(String[].class, sae);
			this.defaultEditors.put(short[].class, sae);
			this.defaultEditors.put(int[].class, sae);
			this.defaultEditors.put(long[].class, sae);
		}
	}
```

其中涉及到很多编辑器，在此就不赘叙了，如有兴趣，可以自行查找。

# 小结

bean的定义，包装是 java bean 的基础。

可以这么说，这一块是 spring 的基石。

# 个人收获

spring 对于接口和继承的理解是非常高明的。

高度抽象带来高度的复杂性，给阅读源码带来很大的障碍。

但是这种抽象，也为以后的拓展性，带来了很大的帮助。


# 参考资料

## 资源访问

[spring resources 设计](https://www.cnblogs.com/davidwang456/archive/2013/03/21/2972916.html)

[classLoader 与 class 加载文件信息区别](https://blog.csdn.net/feeltouch/article/details/83796764)

TODO: 这两个后续整理为单独的一篇博客。

作为属性加载。

## spring beans

[BeanFactory 进化史](https://www.cnblogs.com/davidwang456/p/4152241.html)

* any list
{:toc}
