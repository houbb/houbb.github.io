---
layout: post
title: Java Shutdownhook-优雅的关闭服务
date:  2019-10-30 11:18:30 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 什么是ShutdownHook？

在Java程序中可以通过添加关闭钩子，实现在程序退出时关闭资源、平滑退出的功能。

使用 `Runtime.addShutdownHook(Thread hook)` 方法，可以注册一个JVM关闭的钩子，这个钩子可以在以下几种场景被调用：

1. 程序正常退出

2. 使用System.exit()

3. 终端使用Ctrl+C触发的中断

4. 系统关闭

5. 使用Kill pid命令干掉进程（kill -9 不会触发）


# 入门例子

## 代码

```java
public class ShutdownHookDemo {

    public static void main(String[] args) {
        //将hook线程添加到运行时环境中去
        Runtime.getRuntime().addShutdownHook(new Thread() {
            @Override
            public void run() {
                System.out.println("hook");
            }
        });
        System.out.println("main done.");
    }

}
```

- 日志

```
main done.
hook

Process finished with exit code 0
```

# 注意事项

ShutdownHook 代码实现起来相对简单，但是我们还是需要小心下面这些坑。

## 多次调用问题

```java
Runtime.getRuntime().addShutdownHook(Thread) 
```

可以被多次调用

我们可以多次调用 Runtime.getRuntime().addShutdownHook(Thread) 方法，从而增加多个。

但是需要注意的是，多个 ShutdownHook 之间并无任何顺序，Java 并不会按照加入顺序执行，反而将会并发执行。

所以尽量在一个 ShutdownHook 完成所有操作。

## ShutdownHook 需要尽快执行结束

不要在 ShutdownHook 执行需要被阻塞代码，如 I/0 读写，这样就会导致应用短时间不能被关闭。

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
           while (true){
               System.out.println("关闭应用，释放资源");
           }
        }));
```

上面代码中，我们使用 while(true) 模拟长时间阻塞这种极端情况，关闭该应用时，应用将会一直阻塞在 while 代码中，导致应用没办法被关闭。

除了阻塞之外，还需要小心其他会让线程阻塞的行为，比如死锁。

为了避免 ShutdownHook 线程被长时间阻塞，我们可以引入超时进制。

如果等待一定时间之后，ShutdownHook 还未完成，由脚本直接调用 kill -9 强制退出或者 ShutdownHook 代码中引入超时进制。

# java进程平滑退出的意义

## 场景

很多时候，我们会有这样的一些场景，比如说nginx反向代理若干个负载均衡的web容器，又或者微服务架构中存在的若干个服务节点，需要进行无间断的升级发布。

在重启服务的时候，除非我们去变更nginx的配置，否则重启很可能会导致正在执行的线程突然中断，本来应该要完成的事情只完成了一半，并且调用方出现错误警告。

如果能有一种简单的方式，能够让进程在退出时能执行完当前正在执行的任务，并且让服务的调用方将新的请求定向到其他负载节点，这将会很有意义。

自己注册ShutdownHook可以帮助我们实现java进程的平滑退出。

## 思路

1. 在服务启动时注册自己的ShutdownHook

2. ShutdownHook在被运行时，首先不接收新的请求，或者告诉调用方重定向到其他节点

3. 等待当前的执行线程运行完毕，如果五秒后仍在运行，则强制退出

ps: 这里可以结合 dubbo 的优雅关闭。

# 如何屏敝第三方组件的ShutdownHook

我们会发现，有一些第三方组件在代码中注册了关闭自身资源的ShutdownHook，这些ShutdownHook对于我们的平滑退出有时候起了反作用。

比如dubbo，在static方法块里面注册了自己的关闭钩子，完全不可控。

在进程退出时直接就把长连接给断开了，导致当前的执行线程无法正常完成，源码如下：

```java
static {
    Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
        public void run() {
            if (logger.isInfoEnabled()) {
                logger.info("Run shutdown hook now.");
            }
            ProtocolConfig.destroyAll();
        }
    }, "DubboShutdownHook"));
}
```

ps: 按照官网说法，这里应该是优雅停机的。

## 源码入手

从Runtime.java和ApplicationShutdownHooks.java的源码中，我们看到并没有一个可以遍历操作shutdownHook的方法。

Runtime.java仅有的一个removeShutdownHook的方法，对于未写线程名的匿名类来说，无法获取对象的引用，也无法分辨出彼此。

ApplicationShutdownHooks.java不是public的，类中的hooks也是private的。

只有通过反射的方式才能获取并控制它们。

## 反射控制

定义ExcludeIdentityHashMap类来帮助我们阻止非自己的ShutdownHook注入

```java
class ExcludeIdentityHashMap<K,V> extends IdentityHashMap<K,V> {

    public V put(K key, V value) {
        if (key instanceof Thread) {
            Thread thread = (Thread) key;
            if (!thread.getName().startsWith("My-")) {
                return value;
            }
        }
        return super.put(key, value);
    }
}
```

通过反射的方式注入自己的ShutdownHook并清除其他Thread

```java
String className = "java.lang.ApplicationShutdownHooks";
Class<?> clazz = Class.forName(className);
Field field = clazz.getDeclaredField("hooks");
field.setAccessible(true);

Thread shutdownThread = new Thread(new Runnable() {
    @Override
    public void run() {
        // TODO
    }
});
shutdownThread.setName("My-WebShutdownThread");
IdentityHashMap<Thread, Thread> excludeIdentityHashMap = new ExcludeIdentityHashMap<>();
excludeIdentityHashMap.put(shutdownThread, shutdownThread);

synchronized (clazz) {
    IdentityHashMap<Thread, Thread> map = (IdentityHashMap<Thread, Thread>) field.get(clazz);
    for (Thread thread : map.keySet()) {
        Log.info("found shutdownHook: " + thread.getName());
        excludeIdentityHashMap.put(thread, thread);
    }

    field.set(clazz, excludeIdentityHashMap);
}
```

# 实现服务的平滑退出案例

对于一般的微服务来说，有这几种任务的入口：Http请求、dubbo请求、RabbitMQ消费、Quartz任务

## Http 请求

测试发现Jetty容器在stop的时候不能实现平滑退出，springboot默认使用的tomcat容器可以，以下是部分代码示例：

```java
EmbeddedWebApplicationContext embeddedWebApplicationContext = (EmbeddedWebApplicationContext) applicationContext;
EmbeddedServletContainer embeddedServletContainer = embeddedWebApplicationContext.getEmbeddedServletContainer();
if (embeddedServletContainer instanceof TomcatEmbeddedServletContainer) {
    Connector[] connectors = tomcatEmbeddedServletContainer.getTomcat().getService().findConnectors();

    for (Connector connector : connectors) {
        connector.pause();
    }

    for (Connector connector : connectors) {
        Executor executor = connector.getProtocolHandler().getExecutor();
        if (executor instanceof ThreadPoolExecutor) {
            try {
                ThreadPoolExecutor threadPoolExecutor = (ThreadPoolExecutor) executor;
                threadPoolExecutor.shutdown();
                if (!threadPoolExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    log.warn("Tomcat thread pool did not shutdown gracefully within 5 seconds. Proceeding with forceful shutdown");
                }
            } catch (InterruptedException e) {
                log.warn("TomcatShutdownHook interrupted", e);
            }
        }
    }
}
```

## dubbo 请求

尝试了许多次，看了相关的源码，dubbo不支持平滑退出；

解决方法只有一个，那就是修改dubbo的源码，以下两个地址有详细介绍：

http://frankfan915.iteye.com/blog/2254097

https://my.oschina.net/u/1398931/blog/790709


## RabbitMQ 消费

以下是 SpringBoot 的示例，不使用Spring原理也是一样的

```java
RabbitListenerEndpointRegistry rabbitListenerEndpointRegistry = applicationContext.getBean(
        RabbitListenerConfigUtils.RABBIT_LISTENER_ENDPOINT_REGISTRY_BEAN_NAME,
        RabbitListenerEndpointRegistry.class);
Collection<MessageListenerContainer> containers = rabbitListenerEndpointRegistry.getListenerContainers();
for (MessageListenerContainer messageListenerContainer : containers) {
    messageListenerContainer.stop();
}
```

## Quartz 任务

quartz 也比较简单

```java
Scheduler scheduler = applicationContext.getBean(Scheduler.class);
scheduler.shutdown(true);
```

# 为何重启时有时会有 ClassNotFoundException

springboot 通过 `java -jar example.jar` 的方式启动项目，在使用脚本restart的时候，首先覆盖旧的jar包，然后stop旧线程，启动新线程，这样就可能会出现此问题。

因为在stop的时候，ShutdownHook线程被唤醒，在其执行过程中，某些类（尤其是匿名类）还未加载，这时候就会通知ClassLoader去加载；

ClassLoader持有的是旧jar包的文件句柄，虽然新旧jar包的名字路径完全一样，但是ClassLoader仍然是使用open着的旧jar包文件，文件已经找不到了，所以类加载不了就ClassNotFound了。

## 如何解决呢？

也许有更优雅的方式，但是我没有找到；但是我们可以简单地把顺序调整一下，先stop、再copy覆盖、最后start，这样就OK了。




# 相关源码

Runtime.java 中相关方法源码

```java
public void addShutdownHook(Thread hook) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        sm.checkPermission(new RuntimePermission("shutdownHooks"));
    }
    ApplicationShutdownHooks.add(hook);
}

public boolean removeShutdownHook(Thread hook) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        sm.checkPermission(new RuntimePermission("shutdownHooks"));
    }
    return ApplicationShutdownHooks.remove(hook);
}
```

- ApplicationShutdownHooks.java

```java
class ApplicationShutdownHooks {
    /* The set of registered hooks */
    private static IdentityHashMap<Thread, Thread> hooks;
    static {
        try {
            Shutdown.add(1 /* shutdown hook invocation order */,
                false /* not registered if shutdown in progress */,
                new Runnable() {
                    public void run() {
                        runHooks();
                    }
                }
            );
            hooks = new IdentityHashMap<>();
        } catch (IllegalStateException e) {
            // application shutdown hooks cannot be added if
            // shutdown is in progress.
            hooks = null;
        }
    }


    private ApplicationShutdownHooks() {}

    /* Add a new shutdown hook.  Checks the shutdown state and the hook itself,
     * but does not do any security checks.
     */
    static synchronized void add(Thread hook) {
        if(hooks == null)
            throw new IllegalStateException("Shutdown in progress");

        if (hook.isAlive())
            throw new IllegalArgumentException("Hook already running");

        if (hooks.containsKey(hook))
            throw new IllegalArgumentException("Hook previously registered");

        hooks.put(hook, hook);
    }

    /* Remove a previously-registered hook.  Like the add method, this method
     * does not do any security checks.
     */
    static synchronized boolean remove(Thread hook) {
        if(hooks == null)
            throw new IllegalStateException("Shutdown in progress");

        if (hook == null)
            throw new NullPointerException();

        return hooks.remove(hook) != null;
    }

    /* Iterates over all application hooks creating a new thread for each
     * to run in. Hooks are run concurrently and this method waits for
     * them to finish.
     */
    static void runHooks() {
        Collection<Thread> threads;
        synchronized(ApplicationShutdownHooks.class) {
            threads = hooks.keySet();
            hooks = null;
        }

        for (Thread hook : threads) {
            hook.start();
        }
        for (Thread hook : threads) {
            try {
                hook.join();
            } catch (InterruptedException x) { }
        }
    }
}
```

# 个人收获

优雅停机的方式有很多，类似 dubbo 的优雅摘除服务。

这个通畅需要发布平台配合框架层结合配置中心一起去做。

# 参考资料

[ShutdownHook - 优雅地停止服务](https://blog.csdn.net/wins22237/article/details/72758644)

[Linux kill & Java shutdownhook](https://www.jianshu.com/p/8001a66d37c9)

[ShutdownHook - Java 优雅停机解决方案](https://www.cnblogs.com/goodAndyxublog/p/11658187.html)

https://www.javatpoint.com/ShutdownHook-thread

[JVM Shutdown Hook in Java](https://www.geeksforgeeks.org/jvm-shutdown-hook-java/)

* any list
{:toc}
