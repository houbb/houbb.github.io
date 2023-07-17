---
layout: post
title: Dubbo-02-dubbo invoke filter 链式调用原理
date:  2016-09-25 18:46:04 +0800
categories: [RPC]
tags: [dobbo, rpc, java, sh]
published: true
---


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

# 参考资料


* any list
{:toc}

