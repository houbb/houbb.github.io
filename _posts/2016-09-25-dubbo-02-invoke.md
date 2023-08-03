---
layout: post
title: Dubbo-02-dubbo invoke filter 链式调用原理
date:  2016-09-25 18:46:04 +0800
categories: [RPC]
tags: [dobbo, rpc, java, sh]
published: true
---


# 1. dubbo filter 的用法

使用示例

## 创建一个XxxFilter，并实现com.alibaba.dubbo.rpc.Filter 这个类

```java
public class MyDubboFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

## 添加META-INF/dubbo/com.alibaba.dubbo.rpc.Filter 文件，并添加如下内容

用来 spi 自动发现实现类。

```
myFilter=com.test.MyDubboFilter
```

## 配置xml

```xml
<dubbo:reference id="demoService" check="false" interface="com.alibaba.dubbo.demo.DemoService" filter="myFilter">
    <dubbo:method name="sayHello" retries="0"></dubbo:method>
</dubbo:reference>
```

## 配置方式

### xml 配置方式

```xml
<!-- 消费方调用过程拦截 -->
<dubbo:reference filter="xxx" />
<!-- 消费方调用过程缺省拦截器，将拦截所有reference -->
<dubbo:consumer filter="xxx"/>
<!-- 提供方调用过程拦截 -->
<dubbo:service filter="xxx" />
<!-- 提供方调用过程缺省拦截器，将拦截所有service -->
<dubbo:provider filter="xxx"/>
```

### 注解配置方式

```java
@Activate(group = Constants.CONSUMER, order = -10000)
public class MyDubboFilter implements Filter {
}
```

# dubbo 中的 invoker 实现原理

在Dubbo中，`Invoker`是一个接口，它代表了一个可执行的远程服务。`Invoker`的实现类负责封装远程服务的调用过程，并提供服务的执行和结果的返回。

下面是`Invoker`的基本实现原理：

1. `Invoker`接口定义了两个方法：`invoke`和`getInterface`。`invoke`方法用于执行远程服务调用，`getInterface`方法用于获取远程服务接口的类名。

2. Dubbo的核心实现类`AbstractInvoker`实现了`Invoker`接口，并提供了一些通用的功能。它封装了远程服务调用的逻辑，包括负载均衡、集群容错、协议选择等。

3. `AbstractInvoker`中的`invoke`方法首先会选择一个适合的负载均衡策略，根据负载均衡策略选择一个可用的远程服务提供者。

4. 接下来，`invoke`方法会使用选定的协议（如Dubbo协议或HTTP协议）向远程服务提供者发起请求。

5. 请求发送到远程服务提供者后，提供者会执行相应的服务逻辑，并将结果返回。

6. 结果返回后，`invoke`方法会将结果进行处理，并返回给调用方。

总的来说，Dubbo的`Invoker`实现原理主要包括负载均衡、协议选择、远程服务调用和结果处理等步骤。通过这些步骤，Dubbo能够提供可靠、高效的远程服务调用功能。

# dubbo 中 invoke 拦截器链式调用的原理

在Dubbo中，`Invoker`的调用过程是通过拦截器链实现的。拦截器链可以在服务调用前后进行一系列的拦截和处理操作，如参数校验、日志记录、性能监控等。

下面是Dubbo中`Invoker`拦截器链式调用的原理：

1. `Invoker`接口中定义了`invoke`方法，这是服务调用的入口。

2. 在`Invoker`接口的实现类中，会维护一个拦截器链，通常是一个`List<Filter>`，其中`Filter`是Dubbo提供的拦截器接口。

3. 在服务调用前，`invoke`方法会依次遍历拦截器链中的每个拦截器，并调用其`invoke`方法。

4. 拦截器的`invoke`方法中，可以进行一些预处理操作，例如参数校验、权限验证等。

5. 在预处理完成后，拦截器会调用下一个拦截器的`invoke`方法，以此类推。

6. 当拦截器链中的所有拦截器都执行完毕后，最后一个拦截器会调用实际的服务提供者的方法。

7. 服务提供者执行完服务逻辑后，结果会通过拦截器链返回给调用方。在返回之前，拦截器链中的每个拦截器都可以进行一些后处理操作，例如日志记录、性能统计等。

通过拦截器链的方式，Dubbo实现了在服务调用前后插入一系列的拦截器进行处理。这种方式使得我们可以通过自定义拦截器来实现各种扩展功能，如服务治理、流量控制等。

同时，拦截器链的方式也提供了灵活性和可扩展性，方便开发人员根据业务需求进行定制和扩展。

# 给出源码相关的解析

由于限制我无法提供完整的源代码解析，但我可以提供一个简单的示例来说明Dubbo中拦截器链的基本实现方式。

首先，让我们看一个示例拦截器的代码：

```java
public class MyInterceptor implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // 在服务调用前执行的逻辑
        System.out.println("Before invoke");

        Result result = invoker.invoke(invocation); // 调用下一个拦截器或服务提供者

        // 在服务调用后执行的逻辑
        System.out.println("After invoke");

        return result;
    }
}
```

在上面的示例中，`MyInterceptor`实现了Dubbo提供的`Filter`接口，并重写了`invoke`方法。在`invoke`方法中，我们可以在服务调用前后执行自定义的逻辑。

接下来，我们来看一个`Invoker`的实现类示例，它用于构建拦截器链：

```java
public class MyInvoker<T> implements Invoker<T> {
    private List<Filter> filters; // 拦截器链

    public MyInvoker(List<Filter> filters) {
        this.filters = filters;
    }

    public Result invoke(Invocation invocation) throws RpcException {
        Invoker<?> lastInvoker = new MyLastInvoker(); // 最后一个拦截器

        // 逆序遍历拦截器链，构建拦截器链调用关系
        for (int i = filters.size() - 1; i >= 0; i--) {
            Filter filter = filters.get(i);
            final Invoker<?> next = lastInvoker;
            lastInvoker = new Invoker<T>() {
                public Class<T> getInterface() {
                    return null;
                }

                public Result invoke(Invocation invocation) throws RpcException {
                    return filter.invoke(next, invocation); // 调用拦截器
                }
            };
        }

        return lastInvoker.invoke(invocation); // 调用拦截器链或服务提供者
    }
}
```

在上述示例中，`MyInvoker`实现了Dubbo的`Invoker`接口，并在`invoke`方法中构建了拦截器链。通过逆序遍历拦截器列表，每个拦截器都将前一个拦截器作为下一个拦截器的参数，并返回一个新的`Invoker`实例。最后一个拦截器将实际的服务提供者作为最终的`Invoker`。

通过上述示例，我们可以看到拦截器链的构建过程，每个拦截器在`invoke`方法中都可以执行自定义的逻辑，并将控制权传递给下一个拦截器或服务提供者。

请注意，以上示例是简化的代码片段，实际的Dubbo源代码中还包含更多的细节和功能。如果您需要更深入地了解Dubbo源代码，建议您参阅Dubbo的官方文档和源代码仓库，以获取更全面的解析。

## 这种 invoke 的好处

对比常规的 interceptor 中的 before/after 方法，这种拦截器更加灵活。

你可以任意添加自己的实现。

## 巧妙之处

通过设置 MyLastInvoker，然后逆序遍历。

不断地调用传递。

## filter 的获取

可以结合 spi，或者整个调用列表。


# dubbo 的源码解析

## Filter的加载顺序问题

通过 `@Activate` 注解中的order属性，Activate表示激活

```java
@Activate(group = Constants.CONSUMER, order = -10000)
public class ConsumerContextFilter implements Filter {   
}

@Activate(group = Constants.CONSUMER)
public class FutureFilter implements Filter {
}

@Activate(group = {Constants.PROVIDER, Constants.CONSUMER})    // 指定消费者和生产者
public class MonitorFilter implements Filter {
}
```

## 原生的Filter

Dubbo原生的Filter很多，RpcContext，accesslog等功能都可以通过Dubbo来实现，下面我们来介绍一下Consumer端用于上下文传递的ConsumerContextFilter

```java
@Activate(group = Constants.CONSUMER, order = -10000)
public class ConsumerContextFilter implements Filter {

    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        RpcContext.getContext()
                .setInvoker(invoker)
                .setInvocation(invocation)
                .setLocalAddress(NetUtils.getLocalHost(), 0)
                .setRemoteAddress(invoker.getUrl().getHost(),
                        invoker.getUrl().getPort());
        if (invocation instanceof RpcInvocation) {
            ((RpcInvocation) invocation).setInvoker(invoker);
        }
        try {
            return invoker.invoke(invocation);
        } finally {
            RpcContext.getContext().clearAttachments();
        }
    }

}
```

此Filter记录了调用过程中的状态信息，并且通过invocation对象将客户端设置的attachments参数传递到服务端。

并且在调用完成后清除这些参数，这就是为什么请求状态信息可以按次记录并且进行传递。
 
Dubbo中已经实现的Filter大概有二十几个，它们的入口都是ProtocolFilterWrapper，ProtocolFilterWrapper对Protocol做了Wrapper，会在加载扩展的时候被加载进来，下面我们来看下这个Filter链是如何构造的。

## 加载机制

```java
private static <T> Invoker<T> buildInvokerChain(final Invoker<T> invoker, String key, String group) {
    Invoker<T> last = invoker;
    // 获取已经激活的Filter（调用链，这里的调用链是已经排好序的）
    List<Filter> filters = ExtensionLoader.getExtensionLoader(Filter.class).getActivateExtension(invoker.getUrl(), key, group);
    if (filters.size() > 0) {
        // 遍历
        for (int i = filters.size() - 1; i >= 0; i--) {
            final Filter filter = filters.get(i);
            final Invoker<T> next = last;
            // 典型的装饰器模式，将invoker用filter逐层进行包装
            last = new Invoker<T>() {

                public Class<T> getInterface() {
                    return invoker.getInterface();
                }

                public URL getUrl() {
                    return invoker.getUrl();
                }

                public boolean isAvailable() {
                    return invoker.isAvailable();
                }
                // 重点，每个filter在执行invoke方法时，会触发其下级节点的invoke方法，最后一级节点即为最原始的服务
                public Result invoke(Invocation invocation) throws RpcException {
                    return filter.invoke(next, invocation);
                }

                public void destroy() {
                    invoker.destroy();
                }

                @Override
                public String toString() {
                    return invoker.toString();
                }
            };
        }
    }
    return last;
}

// 服务端暴露服务
public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
    if (Constants.REGISTRY_PROTOCOL.equals(invoker.getUrl().getProtocol())) {
        return protocol.export(invoker);
    }
    return protocol.export(buildInvokerChain(invoker, Constants.SERVICE_FILTER_KEY, Constants.PROVIDER));
}

// 客户端引用服务
public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
    if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {
        return protocol.refer(type, url);
    }
    return buildInvokerChain(protocol.refer(type, url), Constants.REFERENCE_FILTER_KEY, Constants.CONSUMER);
}
```


通过上述代码我们可以看到，在buildInvokerChain中,先获取所有已经激活的调用链，这里的调用链是已经排好序的。

再通过Invoker来构造出一个Filter的调用链，最后构建出的调用链大致可以表示为：Filter1->Filter2->Filter3->......->Invoker,下面我们来看一下，第一步中获取已经激活的调用链的详细流程

## 调用链流程

```java
public List<T> getActivateExtension(URL url, String key, String group) {
    String value = url.getParameter(key);
    return getActivateExtension(url, value == null || value.length() == 0 ? null : Constants.COMMA_SPLIT_PATTERN.split(value), group);
}

public List<T> getActivateExtension(URL url, String[] values, String group) {
    List<T> exts = new ArrayList<T>();

    List<String> names = values == null ? new ArrayList<String>(0) : Arrays.asList(values);
    // 如果用户配置的filter列表名称中不包含-default，则加载标注了Activate注解的filter列表
    if (! names.contains(Constants.REMOVE_VALUE_PREFIX + Constants.DEFAULT_KEY)) {
        // 加载配置文件，获取所有标注有Activate注解的类，存入cachedActivates中
        getExtensionClasses();
        for (Map.Entry<String, Activate> entry : cachedActivates.entrySet()) {
            String name = entry.getKey();
            Activate activate = entry.getValue();
            // Activate注解可以指定group，这里是看注解指定的group与我们要求的group是否匹配
            if (isMatchGroup(group, activate.group())) {
                T ext = getExtension(name);
                // 对于每一个dubbo中原生的filter，需要满足以下3个条件才会被加载：
                // 1.用户配置的filter列表中不包含该名称的filter
                // 2.用户配置的filter列表中不包含该名称前加了"-"的filter
                // 3.该Activate注解被激活，具体激活条件随后详解                
                if (! names.contains(name) && ! names.contains(Constants.REMOVE_VALUE_PREFIX + name) 
                    && isActive(activate, url)) {
                    exts.add(ext);
                }
            }
        }
        // 排序
        Collections.sort(exts, ActivateComparator.COMPARATOR);
    }
    // 加载用户在spring配置文件中配置的filter列表
    List<T> usrs = new ArrayList<T>();
    for (int i = 0; i < names.size(); i ++) {
        String name = names.get(i);
        if (! name.startsWith(Constants.REMOVE_VALUE_PREFIX)
            && ! names.contains(Constants.REMOVE_VALUE_PREFIX + name)) {
            if (Constants.DEFAULT_KEY.equals(name)) {
                if (usrs.size() > 0) {
                    exts.addAll(0, usrs);
                    usrs.clear();
                }
            } else {
                T ext = getExtension(name);
                usrs.add(ext);
            }
        }
    }
    if (usrs.size() > 0) {
        exts.addAll(usrs);
    }
    return exts;
}
```

通过以上代码可以看到，用户自己配置的Filter中，有些是默认激活，有些是需要通过配置文件来激活。

而所有Filter的加载顺序，也是先处理Dubbo的默认Filter，再来处理用户自己定义并且配置的Filter。

通过"-"配置，可以替换掉Dubbo的原生Filter，通过这样的设计，可以灵活地替换或者修改Filter的加载顺序。

## 总结：

filter被分为两类，一类是标注了Activate注解的filter，包括dubbo原生的和用户自定义的；一类是用户在spring配置文件中手动注入的filter

对标注了Activate注解的filter，可以通过before、after和order属性来控制它们之间的相对顺序，还可以通过group来区分服务端和消费端

手动注入filter时，可以用default来代表所有标注了Activate注解的filter，以此来控制两类filter之间的顺序

手动注入filter时，可以在filter名称前加一个"-"表示排除某一个filter，比如说如果配置了一个-default的filter，将不再加载所有标注了Activate注解的filter

# 想法

对 invoke 类似的拦截器进行统一的抽象。

便于所有的拦截器增强实现。

# 参考资料

[Dubbo之Filter 原理](https://www.cnblogs.com/caoxb/p/13140436.html)

[聊聊Dubbo（六）：核心源码-Filter链原理](https://juejin.cn/post/6844903591568752653)

https://blog.csdn.net/LeoHan163/article/details/121439686

https://blog.csdn.net/qq_31960623/article/details/119959757

[dubbo中的Filter链原理及应用](https://www.jianshu.com/p/f390bb88574d)

https://segmentfault.com/a/1190000040755445

https://developer.aliyun.com/article/721665

https://www.code260.com/2020/04/24/dubbo-rpc-filter-1/

https://blog.51cto.com/u_15288542/3030272

* any list
{:toc}

