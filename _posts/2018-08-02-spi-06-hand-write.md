---
layout: post
title:  java SPI 06-自己从零开始实现 SPI 框架
date:  2018-08-02 09:47:43 +0800
categories: [JVM]
tags: [java, jvm, source-code, dubbo, sf]
published: true
---


## 系列目录

[spi 01-spi 是什么？入门使用](https://houbb.github.io/2018/08/02/spi-01-intro)

[spi 02-spi 的实战解决 slf4j 包冲突问题](https://houbb.github.io/2018/08/02/spi-02-log-adaptor)

[spi 03-spi jdk 实现源码解析](https://houbb.github.io/2018/08/02/spi-03-java-source-code)

[spi 04-spi dubbo 实现源码解析](https://houbb.github.io/2018/08/02/spi-04-dubbo-spi)

[spi 05-dubbo adaptive extension 自适应拓展](https://houbb.github.io/2018/08/02/spi-05-dubbo-adaptive-extension)

[spi 06-自己从零手写实现 SPI 框架](https://houbb.github.io/2018/08/02/spi-06-hand-write)

[spi 07-自动生成 SPI 配置文件实现方式](https://houbb.github.io/2018/08/02/spi-07-auto-generate)

## 回顾

学习了 java 的 SPI 和 dubbo 的 SPI 实现之后，希望实现一个属于自己的 SPI 框架。

希望具有如下特性：

（1）类似 dubbo 的真正的惰性加载，而不是遍历一堆一需要的实例

（2）并发安全考虑

（3）支持基于名称获取实现类，后期可以添加更多的特性支持。类似 spring 的 IOC

（4）尽可能的简化实现

## 使用演示

### 类实现

- Say.java

```java
@SPI
public interface Say {

    void say();

}
```

- SayBad.java

```java
public class SayBad implements Say {

    @Override
    public void say() {
        System.out.println("bad");
    }

}
```

- SayGood.java

```java
public class SayGood implements Say {

    @Override
    public void say() {
        System.out.println("good");
    }
    
}
```

### 文件配置

在 `META-INF/services/` 文件夹下定义文件 `com.github.houbb.spi.bs.spi.Say`

内容如下：

```
good=com.github.houbb.spi.bs.spi.impl.SayGood
bad=com.github.houbb.spi.bs.spi.impl.SayBad
```

### 测试案例

```java
ExtensionLoader<Say> loader = SpiBs.load(Say.class);

Say good = loader.getExtension("good");
Say bad = loader.getExtension("bad");

good.say();
bad.say();
```

日志输出：

```
good
bad
```

## 整体目录

```
├─annotation
│      SPI.java
│
├─api
│  │  IExtensionLoader.java
│  │
│  └─impl
│          ExtensionLoader.java
│
├─bs
│      SpiBs.java
│
├─constant
│      SpiConst.java
│
└─exception
        SpiException.java
```

## 源码分析

### annotation 注解

`@SPI` 类似于 dubbo 的注解，标识一个接口为 SPI 接口。

这样严格控制，便于后期拓展和管理，降低代码复杂度。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
public @interface SPI {
}
```

### bs 引导类

- SpiBs.java

核心引导类

```java
public final class SpiBs {

    private SpiBs(){}

    /**
     * 拓展加载类 map
     * @since 0.0.1
     */
    private static final Map<Class, ExtensionLoader> EX_LOADER_MAP = new ConcurrentHashMap<>();

    /**
     * 加载实例
     * @param clazz 类
     * @param <T> 泛型
     * @return 结果
     * @since 0.0.1
     */
    @SuppressWarnings("unchecked")
    public static <T> ExtensionLoader<T> load(Class<T> clazz) {
        ArgUtil.notNull(clazz, "clazz");

        ExtensionLoader extensionLoader = EX_LOADER_MAP.get(clazz);
        if(EX_LOADER_MAP.get(clazz) != null) {
            return extensionLoader;
        }

        // DLC
        synchronized (EX_LOADER_MAP) {
            extensionLoader = EX_LOADER_MAP.get(clazz);
            if(extensionLoader == null) {
                extensionLoader = new ExtensionLoader(clazz);
            }
        }

        return extensionLoader;
    }

}
```

### api 核心实现

- ExtensionLoader.java

```java
import com.github.houbb.heaven.annotation.CommonEager;
import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.heaven.response.exception.CommonRuntimeException;
import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.spi.annotation.SPI;
import com.github.houbb.spi.api.IExtensionLoader;
import com.github.houbb.spi.constant.SpiConst;
import com.github.houbb.spi.exception.SpiException;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 默认实现
 * @author binbin.hou
 * @since 0.0.1
 */
@ThreadSafe
public class ExtensionLoader<T> implements IExtensionLoader<T> {

    /**
     * 接口定义
     * @since 0.0.1
     */
    private final Class<T> spiClass;

    /**
     * 类加载器
     * @since 0.0.1
     */
    private final ClassLoader classLoader;

    /**
     * 缓存的对象实例
     * @since 0.0.1
     */
    private final Map<String, T> cachedInstances = new ConcurrentHashMap<>();

    /**
     * 实例别名 map
     * @since 0.0.1
     */
    private final Map<String, String> classAliasMap = new ConcurrentHashMap<>();

    public ExtensionLoader(Class<T> spiClass, ClassLoader classLoader) {
        spiClassCheck(spiClass);
        ArgUtil.notNull(classLoader, "classLoader");

        this.spiClass = spiClass;
        this.classLoader = classLoader;

        // 初始化配置
        this.initSpiConfig();
    }

    public ExtensionLoader(Class<T> spiClass) {
        this(spiClass, Thread.currentThread().getContextClassLoader());
    }

    /**
     * 获取对应的拓展信息
     *
     * @param alias 别名
     * @return 结果
     * @since 0.0.1
     */
    @Override
    public T getExtension(String alias) {
        ArgUtil.notEmpty(alias, "alias");

        //1. 获取
        T instance = cachedInstances.get(alias);
        if(instance != null) {
            return instance;
        }

        // DLC
        synchronized (cachedInstances) {
            instance = cachedInstances.get(alias);
            if(instance == null) {
                instance = createInstance(alias);
                cachedInstances.put(alias, instance);
            }
        }

        return instance;
    }

    /**
     * 实例
     * @param name 名称
     * @return 实例
     * @since 0.0.1
     */
    @SuppressWarnings("unchecked")
    private T createInstance(String name) {
        String className = classAliasMap.get(name);
        if(StringUtil.isEmpty(className)) {
            throw new SpiException("SPI config not found for spi: " + spiClass.getName()
                    +" with alias: " + name);
        }

        try {
            Class clazz = Class.forName(className);
            return (T) clazz.newInstance();
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            throw new SpiException(e);
        }
    }

    /**
     * 参数校验
     *
     * 1. 不能为 null
     * 2. 必须是接口
     * 3. 必须指定 {@link com.github.houbb.spi.annotation.SPI} 注解
     * @param spiClass spi 类
     * @since 0.0.1
     */
    private void spiClassCheck(final Class<T> spiClass) {
        ArgUtil.notNull(spiClass, "spiClass");

        if(!spiClass.isInterface()) {
            throw new SpiException("Spi class is not interface, " + spiClass);
        }
        if(!spiClass.isAnnotationPresent(SPI.class)) {
            throw new SpiException("Spi class is must be annotated with @SPI, " + spiClass);
        }
    }

    /**
     * 初始化配置文件名称信息
     *
     * 只加载当前类的文件信息
     * @since 0.0.1
     */
    private void initSpiConfig() {
        // 文件的读取
        String fullName = SpiConst.JDK_DIR+this.spiClass.getName();

        try {
            Enumeration<URL> urlEnumeration = this.classLoader
                    .getResources(fullName);

            // 没有更多元素
            if(!urlEnumeration.hasMoreElements()) {
                throw new SpiException("SPI config file for class not found: "
                        + spiClass.getName());
            }

            // 获取第一个元素
            URL url = urlEnumeration.nextElement();
            List<String> allLines = readAllLines(url);

            // 构建 map
            if(CollectionUtil.isEmpty(allLines)) {
                throw new SpiException("SPI config file for class is empty: " + spiClass.getName());
            }

            for(String line : allLines) {
                String[] lines = line.split(SpiConst.SPLITTER);
                classAliasMap.put(lines[0], lines[1]);
            }
        } catch (IOException e) {
            throw new SpiException(e);
        }
    }

    /**
     * 读取每一行的内容
     * @param url url 信息
     * @return 结果
     * @since 0.0.1
     */
    @CommonEager
    private List<String> readAllLines(final URL url) {
        ArgUtil.notNull(url, "url");

        List<String> resultList = new ArrayList<>();

        try(InputStream is = url.openStream();
            BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            // 按行读取信息
            String line;
            while ((line = br.readLine()) != null) {
                resultList.add(line);
            }
        } catch (IOException e) {
            throw new CommonRuntimeException(e);
        }
        return resultList;
    }

}
```

## 其他

其他的只是一些常量定义等。

完整代码见：

[spi](https://github.com/houbb/spi)

## 进步一思考

这里只实现了最基本的功能，可以后续添加更多丰富的特性。

还有一个问题就是，我们能不能像使用 jdk spi 那样，去使用 google auto，直接一个注解，帮我们省略掉文件创建的过程呢？

当然是可以的，下一节，我们就来实现一个这样的功能。

* any list
{:toc}