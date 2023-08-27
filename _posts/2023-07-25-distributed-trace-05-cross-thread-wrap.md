---
layout: post
title: 分布式链路追踪-05-mdc 等信息如何跨线程? 通过封装的方式
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 背景

我们希望实现全链路信息，但是代码中一般都会异步的线程处理。

# MDC介绍

## 简介：

MDC（Mapped Diagnostic Context，映射调试上下文）是 log4j 、logback及log4j2 提供的一种方便在多线程条件下记录日志的功能。

MDC 可以看成是一个与当前线程绑定的哈希表，可以往其中添加键值对。MDC 中包含的内容可以被同一线程中执行的代码所访问。

当前线程的子线程会继承其父线程中的 MDC 的内容。当需要记录日志时，只需要从 MDC 中获取所需的信息即可。

MDC 的内容则由程序在适当的时候保存进去。对于一个 Web 应用来说，通常是在请求被处理的最开始保存这些数据

## API说明：

clear() => 移除所有MDC
get (String key) => 获取当前线程MDC中指定key的值
getContext() => 获取当前线程MDC的MDC
put(String key, Object o) => 往当前线程的MDC中存入指定的键值对
remove(String key) => 删除当前线程MDC中指定的键值对

## 优点：

代码简洁，日志风格统一，不需要在log打印中手动拼写traceId，即LOGGER.info("traceId:{} ", traceId)

## MDC使用

添加拦截器

```java
public class LogInterceptor implements HandlerInterceptor {
      @Override
      public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
          //如果有上层调用就用上层的ID
          String traceId = request.getHeader(Constants.TRACE_ID);
          if (traceId == null) {
              traceId = TraceIdUtil.getTraceId();
          }
  
          MDC.put(Constants.TRACE_ID, traceId);
          return true;
      }
  
      @Override
      public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)
              throws Exception {
      }
  
      @Override
      public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
              throws Exception {
          //调用结束后删除
          MDC.remove(Constants.TRACE_ID);
      }
}
```

修改日志格式

```xml
<property name="pattern">[TRACEID:%X{traceId}] %d{HH:mm:ss.SSS} %-5level %class{-1}.%M()/%L - %msg%xEx%n</property>
```

重点是%X{traceId}，traceId和MDC中的键名称一致

简单使用就这么容易，但是在有些情况下traceId将获取不到

# MDC 存在的问题

子线程中打印日志丢失traceId

HTTP调用丢失traceId

丢失traceId的情况，来一个再解决一个，绝不提前优化

# 解决MDC存在的问题

## 子线程日志打印丢失traceId

子线程在打印日志的过程中traceId将丢失，解决方式为重写线程池，对于直接new创建线程的情况不考略【实际应用中应该避免这种用法】，重写线程池无非是对任务进行一次封装

线程池封装类：ThreadPoolExecutorMdcWrapper.java

```java
public class ThreadPoolExecutorMdcWrapper extends ThreadPoolExecutor {
      public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                          BlockingQueue<Runnable> workQueue) {
          super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
      }
  
      public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                          BlockingQueue<Runnable> workQueue, ThreadFactory threadFactory) {
          super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory);
      }
  
      public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                          BlockingQueue<Runnable> workQueue, RejectedExecutionHandler handler) {
          super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, handler);
      }
  
      public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                          BlockingQueue<Runnable> workQueue, ThreadFactory threadFactory,
                                          RejectedExecutionHandler handler) {
          super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, handler);
      }
  
      @Override
      public void execute(Runnable task) {
          super.execute(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
      }
  
      @Override
      public <T> Future<T> submit(Runnable task, T result) {
          return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()), result);
      }
  
      @Override
      public <T> Future<T> submit(Callable<T> task) {
          return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
      }
  
      @Override
      public Future<?> submit(Runnable task) {
          return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
      }
}
```


说明：

- 继承ThreadPoolExecutor类，重新执行任务的方法

- 通过ThreadMdcUtil对任务进行一次包装

- 线程traceId封装工具类：ThreadMdcUtil.java

```java
public class ThreadMdcUtil {
      public static void setTraceIdIfAbsent() {
          if (MDC.get(Constants.TRACE_ID) == null) {
              MDC.put(Constants.TRACE_ID, TraceIdUtil.getTraceId());
          }
      }
  
      public static <T> Callable<T> wrap(final Callable<T> callable, final Map<String, String> context) {
          return () -> {
              if (context == null) {
                  MDC.clear();
              } else {
                  MDC.setContextMap(context);
              }
              setTraceIdIfAbsent();
              try {
                  return callable.call();
              } finally {
                  MDC.clear();
              }
          };
      }
  
      public static Runnable wrap(final Runnable runnable, final Map<String, String> context) {
          return () -> {
              if (context == null) {
                  MDC.clear();
              } else {
                  MDC.setContextMap(context);
              }
              setTraceIdIfAbsent();
              try {
                  runnable.run();
              } finally {
                  MDC.clear();
              }
          };
      }
}
```

说明【以封装Runnable为例】：

- 判断当前线程对应MDC的Map是否存在，存在则设置

- 设置MDC中的traceId值，不存在则新生成，针对不是子线程的情况，如果是子线程，MDC中traceId不为null

- 执行run方法


代码等同于以下写法，会更直观

```java
public static Runnable wrap(final Runnable runnable, final Map<String, String> context) {
    return new Runnable() {
        @Override
        public void run() {
            if (context == null) {
                MDC.clear();
            } else {
                MDC.setContextMap(context);
            }
            setTraceIdIfAbsent();
            try {
                runnable.run();
            } finally {
                MDC.clear();
            }
        }
    };
}
```

重新返回的是包装后的Runnable，在该任务执行之前【runnable.run()】先将主线程的Map设置到当前线程中【 即MDC.setContextMap(context)】，这样子线程和主线程MDC对应的Map就是一样的了

## HTTP调用丢失traceId

在使用HTTP调用第三方服务接口时traceId将丢失，需要对HTTP调用工具进行改造，在发送时在request header中添加traceId，在下层被调用方添加拦截器获取header中的traceId添加到MDC中

HTTP调用有多种方式，比较常见的有HttpClient、OKHttp、RestTemplate，所以只给出这几种HTTP调用的解决方式

### HttpClient：

实现HttpClient拦截器

```java
public class HttpClientTraceIdInterceptor implements HttpRequestInterceptor {
    @Override
    public void process(HttpRequest httpRequest, HttpContext httpContext) throws HttpException, IOException {
        String traceId = MDC.get(Constants.TRACE_ID);
        //当前线程调用中有traceId，则将该traceId进行透传
        if (traceId != null) {
            //添加请求体
            httpRequest.addHeader(Constants.TRACE_ID, traceId);
        }
    }
}
```

- 实现HttpRequestInterceptor接口并重写process方法

- 如果调用线程中含有traceId，则需要将获取到的traceId通过request中的header向下透传下去

- 为HttpClient添加拦截器

```java
private static CloseableHttpClient httpClient = HttpClientBuilder.create()
              .addInterceptorFirst(new HttpClientTraceIdInterceptor())
```

通过addInterceptorFirst方法为HttpClient添加拦截器

### OKHttp：

实现OKHttp拦截器

```java
public class OkHttpTraceIdInterceptor implements Interceptor {
      @Override
      public Response intercept(Chain chain) throws IOException {
          String traceId = MDC.get(Constants.TRACE_ID);
          Request request = null;
          if (traceId != null) {
              //添加请求体
              request = chain.request().newBuilder().addHeader(Constants.TRACE_ID, traceId).build();
          }
          Response originResponse = chain.proceed(request);
  
          return originResponse;
      }
}
```

实现Interceptor拦截器，重写interceptor方法，实现逻辑和HttpClient差不多，如果能够获取到当前线程的traceId则向下透传

为OkHttp添加拦截器

```java
private static OkHttpClient client = new OkHttpClient.Builder()
              .addNetworkInterceptor(new OkHttpTraceIdInterceptor())
              .build();
```

调用addNetworkInterceptor方法添加拦截器

### RestTemplate：

实现RestTemplate拦截器

```java
public class RestTemplateTraceIdInterceptor implements ClientHttpRequestInterceptor {
      @Override
      public ClientHttpResponse intercept(HttpRequest httpRequest, byte[] bytes, ClientHttpRequestExecution clientHttpRequestExecution) throws IOException {
          String traceId = MDC.get(Constants.TRACE_ID);
          if (traceId != null) {
              httpRequest.getHeaders().add(Constants.TRACE_ID, traceId);
          }
  
          return clientHttpRequestExecution.execute(httpRequest, bytes);
      }
}
```

实现ClientHttpRequestInterceptor接口，并重写intercept方法，其余逻辑都是一样的不重复说明

为RestTemplate添加拦截器

```java
restTemplate.setInterceptors(Arrays.asList(new RestTemplateTraceIdInterceptor()));
```

调用setInterceptors方法添加拦截器

## 第三方服务拦截器：

HTTP调用第三方服务接口全流程traceId需要第三方服务配合，第三方服务需要添加拦截器拿到request header中的traceId并添加到MDC中

```java
public class LogInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //如果有上层调用就用上层的ID
        String traceId = request.getHeader(Constants.TRACE_ID);
        if (traceId == null) {
            traceId = TraceIdUtils.getTraceId();
        }
        
        MDC.put("traceId", traceId);
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)
            throws Exception {
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {
        MDC.remove(Constants.TRACE_ID);
    }
}
```

说明：

- 先从request header中获取traceId

- 从request header中获取不到traceId则说明不是第三方调用，直接生成一个新的traceId

- 将生成的traceId存入MDC中





# 拓展阅读

[TransmittableThreadLocal (TTL) 解决异步执行时上下文传递的问题](https://houbb.github.io/2023/07/19/ttl)

# 参考资料

[全链路日志追踪traceId(http、dubbo、mq)](https://blog.csdn.net/promisessh/article/details/110532387)

[Spring Boot + MDC 实现全链路调用日志跟踪](https://cloud.tencent.com/developer/article/1951233)

[链路ID通过MDC实现线程间传递](https://blog.csdn.net/xuechangchun007/article/details/126502110)

* any list
{:toc}