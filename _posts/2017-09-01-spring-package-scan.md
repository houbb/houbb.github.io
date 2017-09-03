---
layout: post
title:  Spring PackageScan
date:  2017-09-03 19:42:19 +0800
categories: [Spring]
tags: [spring]
published: true
---


# 缘起

近期在写对于文档的扫描[项目](https://github.com/houbb/doc)。想到 spring 的包扫描，觉得可以借鉴。


> [SpringMVC 源代码深度解析(context:component-scan)（扫描和注册的注解Bean）](http://blog.csdn.net/congcong68/article/details/40829037)


下面的内容就是和上面文章是一样的，主要是理解一下过程。

将来打算在项目中使用。


# component-scan


## Usage

- usage

对于扫描包配置的常见使用。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <!--There is usually no need to include the <context:annotation-config> element when using <context:component-scan>.-->
    <context:component-scan base-package="com.ryo.spring.learn"/>

</beans>
```

- xsd

component-scan xsd 内容。(spring 4.2.6) 

```xml
<xsd:element name="component-scan">
    <xsd:annotation>
        <xsd:documentation><![CDATA[
Scans the classpath for annotated components that will be auto-registered as
Spring beans. By default, the Spring-provided @Component, @Repository, @Service,
@Controller, @RestController, @ControllerAdvice, and @Configuration stereotypes
will be detected.

Note: This tag implies the effects of the 'annotation-config' tag, activating @Required,
@Autowired, @PostConstruct, @PreDestroy, @Resource, @PersistenceContext and @PersistenceUnit
annotations in the component classes, which is usually desired for autodetected components
(without external configuration). Turn off the 'annotation-config' attribute to deactivate
this default behavior, for example in order to use custom BeanPostProcessor definitions
for handling those annotations.

Note: You may use placeholders in package paths, but only resolved against system
properties (analogous to resource paths). A component scan results in new bean definitions
being registered; Spring's PropertySourcesPlaceholderConfigurer will apply to those bean
definitions just like to regular bean definitions, but it won't apply to the component
scan settings themselves.

See javadoc for org.springframework.context.annotation.ComponentScan for information
on code-based alternatives to bootstrapping component-scanning.
        ]]></xsd:documentation>
    </xsd:annotation>
   <!--...-->
</xsd:element>
```

## Parser

- parser

下面这个类为对应的解释器。

```java
/**
 * Parser for the {@code <context:component-scan/>} element.
 *
 * @author Mark Fisher
 * @author Ramnivas Laddad
 * @author Juergen Hoeller
 * @since 2.5
 */
public class ComponentScanBeanDefinitionParser implements BeanDefinitionParser{
}
```

解释器的核心方法：

```java
@Override
public BeanDefinition parse(Element element, ParserContext parserContext) {
    //1. 获取需要扫描的包
    String basePackage = element.getAttribute(BASE_PACKAGE_ATTRIBUTE);
    basePackage = parserContext.getReaderContext().getEnvironment().resolvePlaceholders(basePackage);
    String[] basePackages = StringUtils.tokenizeToStringArray(basePackage,
            ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS);

    //2. Actually scan for bean definitions and register them.
    ClassPathBeanDefinitionScanner scanner = configureScanner(parserContext, element);
    Set<BeanDefinitionHolder> beanDefinitions = scanner.doScan(basePackages);
    registerComponents(parserContext.getReaderContext(), beanDefinitions, element);

    return null;
}
```

- doScan()

对指定包下面的 class 文件进行扫描并且注册。

```java
/**
 * Perform a scan within the specified base packages,
 * returning the registered bean definitions.
 * <p>This method does <i>not</i> register an annotation config processor
 * but rather leaves this up to the caller.
 * @param basePackages the packages to check for annotated classes
 * @return set of beans registered if any for tooling registration purposes (never {@code null})
 */
protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Assert.notEmpty(basePackages, "At least one base package must be specified");
    Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<BeanDefinitionHolder>();
    for (String basePackage : basePackages) {
        Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
        for (BeanDefinition candidate : candidates) {
            //....
        }
    }
    return beanDefinitions;
}
```

对于每个包扫描并且封装的方法为 

- findCandidateComponents(basePackage)

将一些日志打印的代码暂时去除了，感觉写的不太利于阅读。

```java
/**
* Scan the class path for candidate components.
* @param basePackage the package to check for annotated classes
* @return a corresponding Set of autodetected bean definitions
*/
public Set<BeanDefinition> findCandidateComponents(String basePackage) {
    Set<BeanDefinition> candidates = new LinkedHashSet<BeanDefinition>();
    try {
        String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
                resolveBasePackage(basePackage) + "/" + this.resourcePattern;
        Resource[] resources = this.resourcePatternResolver.getResources(packageSearchPath);
        
        for (Resource resource : resources) {
            if (resource.isReadable()) {
                try {
                    MetadataReader metadataReader = this.metadataReaderFactory.getMetadataReader(resource);
                    if (isCandidateComponent(metadataReader)) {
                        ScannedGenericBeanDefinition sbd = new ScannedGenericBeanDefinition(metadataReader);
                        sbd.setResource(resource);
                        sbd.setSource(resource);
                        if (isCandidateComponent(sbd)) {
                            candidates.add(sbd);
                        }
                    }
                }
                catch (Throwable ex) {
                    throw new BeanDefinitionStoreException(
                            "Failed to read candidate component class: " + resource, ex);
                }
            }
        }
    }
    catch (IOException ex) {
        throw new BeanDefinitionStoreException("I/O failure during classpath scanning", ex);
    }
    return candidates;
}
```

> Desc

(1) 先根据 `context:component-scan` 中属性的 `base-package="com.ryo.spring.learn"` 配置转换为 `classpath*:com/ryo/spring/learn/**/*.class`，
并扫描对应下的 class 和 jar 文件并获取类对应的路径，返回 Resource;

实现代码

- PathMatchingResourcePatternResolver.java

```java
@Override
public Resource[] getResources(String locationPattern) throws IOException {
    Assert.notNull(locationPattern, "Location pattern must not be null");
    if (locationPattern.startsWith(CLASSPATH_ALL_URL_PREFIX)) {
        // a class path resource (multiple resources for same name possible)
        if (getPathMatcher().isPattern(locationPattern.substring(CLASSPATH_ALL_URL_PREFIX.length()))) {
            // a class path resource pattern
            return findPathMatchingResources(locationPattern);
        }
        else {
            // all class path resources with the given name
            return findAllClassPathResources(locationPattern.substring(CLASSPATH_ALL_URL_PREFIX.length()));
        }
    }
    else {
        // Only look for a pattern after a prefix here
        // (to not get fooled by a pattern symbol in a strange prefix).
        int prefixEnd = locationPattern.indexOf(":") + 1;
        if (getPathMatcher().isPattern(locationPattern.substring(prefixEnd))) {
            // a file pattern
            return findPathMatchingResources(locationPattern);
        }
        else {
            // a single resource with the given name
            return new Resource[] {getResourceLoader().getResource(locationPattern)};
        }
    }
}

/**
 * Find all class location resources with the given location via the ClassLoader.
 * Delegates to {@link #doFindAllClassPathResources(String)}.
 * @param location the absolute path within the classpath
 * @return the result as Resource array
 * @throws IOException in case of I/O errors
 * @see java.lang.ClassLoader#getResources
 * @see #convertClassLoaderURL
 */
protected Resource[] findAllClassPathResources(String location) throws IOException {
    String path = location;
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    Set<Resource> result = doFindAllClassPathResources(path);
    if (logger.isDebugEnabled()) {
        logger.debug("Resolved classpath location [" + location + "] to resources " + result);
    }
    return result.toArray(new Resource[result.size()]);
}
```

(2) 根据 `<context:exclude-filter>` 指定的不扫描包

直接对需要扫描的包或者不需要扫描的包进行校验。

```java
/**
 * Determine whether the given class does not match any exclude filter
 * and does match at least one include filter.
 * @param metadataReader the ASM ClassReader for the class
 * @return whether the class qualifies as a candidate component
 */
protected boolean isCandidateComponent(MetadataReader metadataReader) throws IOException {
    for (TypeFilter tf : this.excludeFilters) {
        if (tf.match(metadataReader, this.metadataReaderFactory)) {
            return false;
        }
    }
    for (TypeFilter tf : this.includeFilters) {
        if (tf.match(metadataReader, this.metadataReaderFactory)) {
            return isConditionMatch(metadataReader);
        }
    }
    return false;
}
```
 
(3) 封装成BeanDefinition放到队列里
 
ComponentScanBeanDefinitionParser.parse(...)

中下面的代码实现，跳过。 

```java
registerComponents(parserContext.getReaderContext(), beanDefinitions, element);
```












* any list
{:toc}
