---
layout: post
title: spring IOC 源码分析之 bean 如何封装为 BeanDefinition
date:  2023-02-13 +0800
categories: [source-code]
tags: [java, spring, source-code, sh]
published: true
---

# 前言

接着上一篇的 BeanDefinition 资源定位开始讲。

Spring IoC 容器 BeanDefinition 解析过程就是把用户在配置文件中配置的 bean，解析并封装成 IoC 容器可以装载的 BeanDefinition 对象，BeanDefinition 是 Spring 定义的基本数据结构，其中的属性与配置文件中 bean 的属性相对应。

# 正文

首先看一下 AbstractRefreshableApplicationContext 的 refreshBeanFactory() 方法，这是一个模板方法，其中调用的 loadBeanDefinitions() 方法是一个抽象方法，交由子类实现。

```java
/**
 * 在这里完成了容器的初始化，并赋值给自己私有的 beanFactory 属性，为下一步调用做准备
 * 从父类 AbstractApplicationContext 继承的抽象方法，自己做了实现
 */
@Override
protected final void refreshBeanFactory() throws BeansException {
    // 如果已经建立了 IoC 容器，则销毁并关闭容器
    if (hasBeanFactory()) {
        destroyBeans();
        closeBeanFactory();
    }
    try {
        // 创建 IoC 容器，DefaultListableBeanFactory 实现了 ConfigurableListableBeanFactory 接口
        DefaultListableBeanFactory beanFactory = createBeanFactory();
        beanFactory.setSerializationId(getId());
        // 对 IoC 容器进行定制化，如设置启动参数，开启注解的自动装配等
        customizeBeanFactory(beanFactory);
        // 载入 BeanDefinition，当前类中只定义了抽象的 loadBeanDefinitions() 方法，具体的实现调用子类容器
        loadBeanDefinitions(beanFactory);
        synchronized (this.beanFactoryMonitor) {
            // 给自己的属性赋值
            this.beanFactory = beanFactory;
        }
    }
    catch (IOException ex) {
        throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
    }
}
```

下面看一下 AbstractRefreshableApplicationContext 的子类 AbstractXmlApplicationContext 对 loadBeanDefinitions() 方法的实现。

```java
@Override
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
    // DefaultListableBeanFactory 实现了 BeanDefinitionRegistry 接口，所以在初始化 XmlBeanDefinitionReader 时
    // 将该 beanFactory 传入 XmlBeanDefinitionReader 的构造方法中。
    // 从名字也能看出来它的功能，这是一个用于从 .xml文件 中读取 BeanDefinition 的读取器
    XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);

    beanDefinitionReader.setEnvironment(this.getEnvironment());
    // 为 beanDefinition 读取器设置 资源加载器，由于本类的基类 AbstractApplicationContext
    // 继承了 DefaultResourceLoader，因此，本容器自身也是一个资源加载器
    beanDefinitionReader.setResourceLoader(this);
    // 为 beanDefinitionReader 设置用于解析的 SAX 实例解析器，SAX（simple API for XML）是另一种XML解析方法。
    // 相比于DOM，SAX速度更快，占用内存更小。它逐行扫描文档，一边扫描一边解析。相比于先将整个XML文件扫描进内存，
    // 再进行解析的DOM，SAX可以在解析文档的任意时刻停止解析，但操作也比DOM复杂。
    beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));

    // 初始化 beanDefinition 读取器，该方法同时启用了 XML 的校验机制
    initBeanDefinitionReader(beanDefinitionReader);
    // 用传进来的 XmlBeanDefinitionReader 读取器读取 .xml 文件中配置的 bean
    loadBeanDefinitions(beanDefinitionReader);
}
```

接着看一下上面最后一个调用的方法 loadBeanDefinitions(XmlBeanDefinitionReader reader)。

```java
/**
 * 读取并解析 .xml 文件中配置的 bean，然后封装成 BeanDefinition 对象
 */
protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
    /**
     * ClassPathXmlApplicationContext 与 FileSystemXmlApplicationContext
     * 在这里的调用出现分歧，各自按不同的方式加载解析 Resource 资源
     * 最后在具体的解析和 BeanDefinition 定位上又会殊途同归
     */

    // 获取存放了 BeanDefinition 的所有 Resource，FileSystemXmlApplicationContext 中未对
    // getConfigResources() 进行重写，所以调用父类的，return null。
    // 而 ClassPathXmlApplicationContext 对该方法进行了重写，返回设置的值
    Resource[] configResources = getConfigResources();
    if (configResources != null) {
        // 这里调用的是其父类 AbstractBeanDefinitionReader 中的方法，解析加载 BeanDefinition对象
        reader.loadBeanDefinitions(configResources);
    }
    // 调用其父类 AbstractRefreshableConfigApplicationContext 中的实现，优先返回
    // FileSystemXmlApplicationContext 构造方法中调用 setConfigLocations() 方法设置的资源路径
    String[] configLocations = getConfigLocations();
    if (configLocations != null) {
        // 这里调用其父类 AbstractBeanDefinitionReader 的方法从配置位置加载 BeanDefinition
        reader.loadBeanDefinitions(configLocations);
    }
}
```

AbstractBeanDefinitionReader 对 loadBeanDefinitions() 方法的三重重载。

```java
/**
 * loadBeanDefinitions() 方法的重载方法之一，调用了另一个重载方法 loadBeanDefinitions(String location)
 */
public int loadBeanDefinitions(String... locations) throws BeanDefinitionStoreException {
    Assert.notNull(locations, "Location array must not be null");
    // 计数器，统计加载了多少个配置文件
    int counter = 0;
    for (String location : locations) {
        counter += loadBeanDefinitions(location);
    }
    return counter;
}

/**
 * 重载方法之一，调用了下面的 loadBeanDefinitions(String location, Set<Resource> actualResources) 方法
 */
public int loadBeanDefinitions(String location) throws BeanDefinitionStoreException {
    return loadBeanDefinitions(location, null);
}

/**
 * 获取在 IoC 容器初始化过程中设置的资源加载器
 */
public int loadBeanDefinitions(String location, Set<Resource> actualResources) throws BeanDefinitionStoreException {
    // 在实例化 XmlBeanDefinitionReader 时 曾将 IoC 容器注入该对象，作为 resourceLoader 属性
    ResourceLoader resourceLoader = getResourceLoader();
    if (resourceLoader == null) {
        throw new BeanDefinitionStoreException(
                "Cannot import bean definitions from location [" + location + "]: no ResourceLoader available");
    }

    if (resourceLoader instanceof ResourcePatternResolver) {
        try {
            // 将指定位置的 bean 配置文件解析为 BeanDefinition 对象
            // 加载多个指定位置的 BeanDefinition 资源
            Resource[] resources = ((ResourcePatternResolver) resourceLoader).getResources(location);
            // 调用其子类 XmlBeanDefinitionReader 的方法，实现加载功能
            int loadCount = loadBeanDefinitions(resources);
            if (actualResources != null) {
                for (Resource resource : resources) {
                    actualResources.add(resource);
                }
            }
            if (logger.isDebugEnabled()) {
                logger.debug("Loaded " + loadCount + " bean definitions from location pattern [" + location + "]");
            }
            return loadCount;
        }
        catch (IOException ex) {
            throw new BeanDefinitionStoreException(
                    "Could not resolve bean definition resource pattern [" + location + "]", ex);
        }
    }
    else {
        /**
         * ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
         * AbstractApplicationContext 继承了 DefaultResourceLoader，所以 AbstractApplicationContext
         * 及其子类都可以调用 DefaultResourceLoader 中的方法，将指定位置的资源文件解析为 Resource，
         * 至此完成了对 BeanDefinition 的资源定位
         * ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
         */
        Resource resource = resourceLoader.getResource(location);
        // 从 resource 中加载 BeanDefinition，loadCount 为加载的 BeanDefinition 个数
        // 该 loadBeanDefinitions() 方法来自其 implements 的 BeanDefinitionReader 接口，
        // 且本类是一个抽象类，并未对该方法进行实现。而是交由子类进行实现，如果是用 xml 文件进行
        // IoC 容器初始化的，则调用 XmlBeanDefinitionReader 中的实现
        int loadCount = loadBeanDefinitions(resource);
        if (actualResources != null) {
            actualResources.add(resource);
        }
        if (logger.isDebugEnabled()) {
            logger.debug("Loaded " + loadCount + " bean definitions from location [" + location + "]");
        }
        return loadCount;
    }
}
```

# 小结

这种源码的直接 crtl+CV，什么都体会不到。

还是自己从头到尾看比较有效果。

# 参考资料

https://github.com/doocs/source-code-hunter/blob/main/docs/Spring/IoC/2%E3%80%81%E5%B0%86bean%E8%A7%A3%E6%9E%90%E5%B0%81%E8%A3%85%E6%88%90BeanDefinition.md

* any list
{:toc}