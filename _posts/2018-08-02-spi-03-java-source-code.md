---
layout: post
title:  java SPI 03-java 源码解析
date:  2018-08-02 09:47:43 +0800
categories: [JVM]
tags: [java, jvm, source-code, sf]
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


## java SPI 加载流程

### 1 应用程序调用ServiceLoader.load方法

ServiceLoader.load方法内先创建一个新的ServiceLoader，并实例化该类中的成员变量，包括：

```
loader(ClassLoader类型，类加载器)
acc(AccessControlContext类型，访问控制器)
providers(LinkedHashMap<String,S>类型，用于缓存加载成功的类)
lookupIterator(实现迭代器功能)
```

### 2 应用程序通过迭代器接口获取对象实例

ServiceLoader 先判断成员变量 providers 对象中( `LinkedHashMap<String,S>` 类型)是否有缓存实例对象，如果有缓存，直接返回。

如果没有缓存，执行类的装载，实现如下：

(1) 读取META-INF/services/下的配置文件，获得所有能被实例化的类的名称，值得注意的是，ServiceLoader可以跨越jar包获取META-INF下的配置文件，具体加载配置的实现代码如下：

```java
try {
    String fullName = PREFIX + service.getName();
    if (loader == null)
        configs = ClassLoader.getSystemResources(fullName);
    else
        configs = loader.getResources(fullName);
} catch (IOException x) {
    fail(service, "Error locating configuration files", x);
}
```

(2) 通过反射方法 Class.forName() 加载类对象，并用 instance() 方法将类实例化。

(3) 把实例化后的类缓存到 providers 对象中，( `LinkedHashMap<String,S>` 类型，然后返回实例对象。

看到这里，实际上对我们理解 SPI 的标准很有帮助，比如为什么需要无参构造器。

## java SPI 源码 

下面我们简单的整体过一遍源码。

### 类

在 `java.util` 包下。

```java
public final class ServiceLoader<S>
    implements Iterable<S>
```

从注释中可知该类是 jdk1.6 开始支持，继承自 Iterable。

### 私有变量

PREFIX 对应的就是我们指定 SPI 文件配置的地方。

```java
private static final String PREFIX = "META-INF/services/";

// The class or interface representing the service being loaded
private final Class<S> service;

// The class loader used to locate, load, and instantiate providers
private final ClassLoader loader;

// The access control context taken when the ServiceLoader is created
private final AccessControlContext acc;

// Cached providers, in instantiation order
private LinkedHashMap<String,S> providers = new LinkedHashMap<>();

// The current lazy-lookup iterator
private LazyIterator lookupIterator;
```

### 方法入口

我们回忆一下使用时的方式：

```java
ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
ServiceLoader<Say> loader = ServiceLoader.load(Say.class, classLoader);

for (Say say : loader) {
    say.say();
}
```

这里也就展示了方法的入口，获取当前的 ClassLoader，我们来看一下 load 方法。

## load

```java
public static <S> ServiceLoader<S> load(Class<S> service,
                                            ClassLoader loader)
{
    return new ServiceLoader<>(service, loader);
}
```


直接创建了一个实例，这个构造器方法是 private 的：

```java
private ServiceLoader(Class<S> svc, ClassLoader cl) {
    service = Objects.requireNonNull(svc, "Service interface cannot be null");
    loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
    acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
    reload();
}
```

- load() 重载

为了提供遍历，提供了默认的 ClassLoader 实现

```java
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}
```

- reload()

这里做了重新加载，清空了 providers，并且新建了一个 LazyIterator。

`private LinkedHashMap<String,S> providers = new LinkedHashMap<>();` 其实就是一个 cache，每次初始化会做清空。

```java
public void reload() {
    providers.clear();
    lookupIterator = new LazyIterator(service, loader);
}
```

## LazyIterator

我们来看一下这个迭代器的实现

### 源码

```java
private class LazyIterator
    implements Iterator<S>
{
    Class<S> service;
    ClassLoader loader;
    Enumeration<URL> configs = null;
    Iterator<String> pending = null;
    String nextName = null;

    private LazyIterator(Class<S> service, ClassLoader loader) {
        this.service = service;
        this.loader = loader;
    }

    private boolean hasNextService() {
        if (nextName != null) {
            return true;
        }
        if (configs == null) {
            try {
                String fullName = PREFIX + service.getName();
                if (loader == null)
                    configs = ClassLoader.getSystemResources(fullName);
                else
                    configs = loader.getResources(fullName);
            } catch (IOException x) {
                fail(service, "Error locating configuration files", x);
            }
        }
        while ((pending == null) || !pending.hasNext()) {
            if (!configs.hasMoreElements()) {
                return false;
            }
            pending = parse(service, configs.nextElement());
        }
        nextName = pending.next();
        return true;
    }

    private S nextService() {
        if (!hasNextService())
            throw new NoSuchElementException();
        String cn = nextName;
        nextName = null;
        Class<?> c = null;
        try {
            c = Class.forName(cn, false, loader);
        } catch (ClassNotFoundException x) {
            fail(service,
                 "Provider " + cn + " not found");
        }
        if (!service.isAssignableFrom(c)) {
            fail(service,
                 "Provider " + cn  + " not a subtype");
        }
        try {
            S p = service.cast(c.newInstance());
            providers.put(cn, p);
            return p;
        } catch (Throwable x) {
            fail(service,
                 "Provider " + cn + " could not be instantiated",
                 x);
        }
        throw new Error();          // This cannot happen
    }

    public boolean hasNext() {
        if (acc == null) {
            return hasNextService();
        } else {
            PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
                public Boolean run() { return hasNextService(); }
            };
            return AccessController.doPrivileged(action, acc);
        }
    }

    public S next() {
        if (acc == null) {
            return nextService();
        } else {
            PrivilegedAction<S> action = new PrivilegedAction<S>() {
                public S run() { return nextService(); }
            };
            return AccessController.doPrivileged(action, acc);
        }
    }

    public void remove() {
        throw new UnsupportedOperationException();
    }
}
```

其中最核心的两个方法 `hasNextService()` 会去指定的目录下处理配置信息，`hasNextService()` 有如下核心实现。

```java
c = Class.forName(cn, false, loader);

// 创建并且缓存
S p = service.cast(c.newInstance());
providers.put(cn, p);
```

### parse

hasNextService() 方法中的 parse 也值得看一下。

实际就是去解析文件夹下的配置文件，按照行读取。

可以看出来，默认使用的是 `utf-8` 文件编码。

```java
private Iterator<String> parse(Class<?> service, URL u)
    throws ServiceConfigurationError
{
    InputStream in = null;
    BufferedReader r = null;
    ArrayList<String> names = new ArrayList<>();
    try {
        in = u.openStream();
        r = new BufferedReader(new InputStreamReader(in, "utf-8"));
        int lc = 1;
        while ((lc = parseLine(service, u, r, lc, names)) >= 0);
    } catch (IOException x) {
        fail(service, "Error reading configuration file", x);
    } finally {
        try {
            if (r != null) r.close();
            if (in != null) in.close();
        } catch (IOException y) {
            fail(service, "Error closing configuration file", y);
        }
    }
    return names.iterator();
}
```

### fail()

这个方法出现了多次，实际上只是一个报错信息，知道即可：

```java
private static void fail(Class<?> service, String msg)
    throws ServiceConfigurationError
{
    throw new ServiceConfigurationError(service.getName() + ": " + msg);
}
```

## 获取值

这里是遍历了 loader，实际上就是 java 的一个语法糖。

对应的是 Iterator, 对应的 hasNext() 和 next() 方法。

```java
for (Say say : loader) {
    say.say();
}
```

这里就是遍历了 cache 中的实现，至于 cache 中的信息怎么来的，就是 LazyIterator 遍历过程中的创建实例+cache。

```java
public Iterator<S> iterator() {
    return new Iterator<S>() {
        Iterator<Map.Entry<String,S>> knownProviders
            = providers.entrySet().iterator();
        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext();
        }
        public S next() {
            if (knownProviders.hasNext())
                return knownProviders.next().getValue();
            return lookupIterator.next();
        }
        public void remove() {
            throw new UnsupportedOperationException();
        }
    };
}
```

## 小结

但就源码而言，实现机制并不复杂。

但是思想比较不错，也带了很大的方便。

当我们看了源码之后，对于优缺点实际会有更加清晰的认识。

## 优缺点

### 优点

使用Java SPI机制的优势是实现解耦，使得第三方服务模块的装配控制的逻辑与调用者的业务代码分离，而不是耦合在一起。

应用程序可以根据实际业务情况启用框架扩展或替换框架组件。

相比使用提供接口jar包，供第三方服务模块实现接口的方式，SPI的方式使得源框架，不必关心接口的实现类的路径，可以不用通过下面的方式获取接口实现类：

1. 代码硬编码import 导入实现类

2. 指定类全路径反射获取：例如在JDBC4.0之前，JDBC中获取数据库驱动类需要通过 `Class.forName("com.mysql.jdbc.Driver")`，类似语句先动态加载数据库相关的驱动，然后再进行获取连接等的操作

3. 第三方服务模块把接口实现类实例注册到指定地方，源框架从该处访问实例

通过SPI的方式，第三方服务模块实现接口后，在第三方的项目代码的 META-INF/services 目录下的配置文件指定实现类的全路径名，源码框架即可找到实现类

### 缺点

1. 虽然ServiceLoader也算是使用的延迟加载，但是基本只能通过遍历全部获取，也就是接口的实现类全部加载并实例化一遍。如果你并不想用某些实现类，它也被加载并实例化了，这就造成了浪费。

2. 获取某个实现类的方式不够灵活，只能通过Iterator形式获取，不能根据某个参数来获取对应的实现类。

3. 多个并发多线程使用ServiceLoader类的实例是不安全的。

### 后续

实际上 hibernate-validator/dubbo 等常见框架，都有用到 SPI。

后续我们将一起来看一下 dubbo 中的实现，看看 dubbo 是如何解决这些不足之处的。

# 参考资料

[深入理解 SPI 机制](https://www.cnblogs.com/zhangww/p/12024759.html)

[高级开发必须理解的 Java 中 SPI 机制](https://www.jianshu.com/p/46b42f7f593c)

* any list
{:toc}