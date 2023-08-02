---
layout: post
title: 分布式链路追踪-04-全链路日志追踪 http、dubbo、mq
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 目的

目前许多系统项目之间的调用，有基于微服务的，有通过HTTP请求的，还有通过mq的。

那么在处理一次请求的时候，可能会调用多个服务或者调用多个其他系统功能，这样就会产生很多的日志，此时，如果想查看这一次调用的完整的请求链路的日志时，就会变得比较困难，虽然我们有一些集中的日志收集工具比如ELK，我们需要把这一些日志串联起来，这个问题很关键，因为如果没有串联起来，排查日志就是一件很困难的事情。

# 2、解决办法

一般来说，系统之间的调用不外乎两种：http和dubbo。当然还有通过中间件mq的形式（SpringCloud也是基于MVC容器调用），系统内部有task定时任务等。

对于http请求：我们的做法是在最开始请求系统时候生成一个全局唯一的TraceID，放在http 请求header中，系统接收到请求后，从header中取出这个TraceID，放入MDC中，这个TraceID伴随着这整个请求的调用周期，即当一个服务调用另外一个服务的时候，需要往下传递，从而形成一条链路，这样当我们查看日志时，只需要根据关键搜索这个TraceID，整条调用链路的日志都可以查出来。

对于dubbo请求：我们可以在最开始请求的时候生成一个全局唯一性TraceID，放入RpcContext中，但是有这么一个问题，RpcContext只能做到消费者和提供者共享同一个RpcContext，假设我有一种调用关系，serverA -> serverB -> serverC，A->B的时候可以获取相同内容的RpcContext，但是B->C时候，A和C就无法共享相同内容的RpcContext了，对于这种情况我们利用ThreadLocal进行解决，我们先从RpcContext取出TraceID，放入ThreadLocal中，当调用别的服务再放入RpcContext中即可。当然利用MDC可以实现。

对于系统内部的task任务：同样在每个task开始执行之前系统内部生成一个全局唯一TraceID，然后把TraceID放入MDC中。

对于mq：与上面相同，在每个MQ listener处理数据开始之前调用一个共公方法生成一个全局唯一TraceID，然后把TraceID放入MDC中。

经过这些处理之后，我们在打印日志的时候只需要从MDC取出TraceID打印出来即可。

# 3、适用范围

语言环境：Java

项目架构：SSM项目。SpringBoot项目，dubbo服务，SpringCloud 微服务

日志框架：log4j，logback

# 二、代码示例

## 1、Dubbo请求：

自定义一个Filter，实现com.alibaba.dubbo.rpc.Filter即可

Comsumer：

```java
@Slf4j
@Activate(group = Constants.CONSUMER)
public class ComsumerFilter implements Filter {
    public final static String TRACE_ID = "TraceID";
    public final static String MDC_UUID = "mdc_uuid";
 
    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
 
        String interfaceName = invoker.getInterface().getName();
        String methodName = invocation.getMethodName();
        String REQ_SERVICE = interfaceName + "." + methodName;
        String SOURCE_IP = RpcContext.getContext().getRemoteAddressString();
        String traceID = RpcContext.getContext().getAttachment(TRACE_ID);
        
        if (StringUtils.isBlank(traceID)) {
            traceID = UUID.randomUUID().toString().replace("-", "");
        }
        RpcContext.getContext().setAttachment(TRACE_ID, traceID);
        MDC.put(MDC_UUID, traceID);
        long startTime = System.currentTimeMillis();
        Result result = null;
        try {
            result = invoker.invoke(invocation);
            if (result.hasException()) {
                log.error("Consumer.调用dubbo服务发生异常：called by [{}] service [{}] method [{}] fail",
                        SOURCE_IP, interfaceName, methodName);
                log.error("Consumer.TraceFilter occurs exception", result.getException());
            }
        } catch (Exception e) {
            log.error("Consumer.dubbo异常：traceID:[{}] called by [{}] service [{}] method [{}] exception [{}] ",
                    traceID, SOURCE_IP, invoker.getInterface().getName(), invocation.getMethodName(),
                    e.getClass().getName() + e.getMessage());
        } finally {
            log.info("Consumer.dubbo返回：traceID:[{}]  消费方 [{}]  接口 [{}]  返回值 [{}]  耗时 {} 毫秒",
                    traceID, SOURCE_IP, REQ_SERVICE, JSON.toJSONString(result), System.currentTimeMillis() - startTime);
        }
        return result;
    }
}
```

Provider：

```java
@Slf4j
@Activate(group = Constants.PROVIDER)
public class ProviderFilter implements Filter {
    public final static String TRACE_ID = "TraceID";
    public final static String MDC_UUID = "mdc_uuid";
 
    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
 
        String traceID = MDC.get(MDC_UUID);
        String interfaceName = invoker.getInterface().getSimpleName();
        String methodName = invocation.getMethodName();
        String REQ_SERVICE = interfaceName + "." + methodName;
        String SOURCE_IP = RpcContext.getContext().getRemoteAddressString();
        if (StringUtils.isBlank(traceID)) {
            traceID = RpcContext.getContext().getAttachment(TRACE_ID);
        }
        if (StringUtils.isBlank(traceID)) {
            traceID = UUID.randomUUID().toString().replace("-", "");
        }
        RpcContext.getContext().setAttachment(TRACE_ID, traceID);
        Object[] args = invocation.getArguments();
        long startTime = System.currentTimeMillis();
        String logReqParam = JSON.toJSONString(args);
        MDC.put(MDC_UUID, TRACE_ID);
        log.info("Provider.dubbo请求：traceID:[{}]  消费方 [{}]  接口 [{}]  报文 [{}] ",
                traceID, SOURCE_IP, REQ_SERVICE, logReqParam);
        Result result = null;
        try {
            result = invoker.invoke(invocation);
            if (result.hasException()) {
                log.error("Provider.调用dubbo服务发生异常：called by [{}] service [{}] method [{}] fail",
                        SOURCE_IP, interfaceName, methodName);
                log.error("TraceFilter occurs exception", result.getException());
            }
        } catch (Exception e) {
            log.error("Provider.dubbo异常：traceID:[{}] called by [{}] service [{}] method [{}] exception [{}] ",
                    traceID, SOURCE_IP, invoker.getInterface().getName(), invocation.getMethodName(),
                    e.getClass().getName() + e.getMessage(), e);
            throw e;
        } finally {
            log.info("Provider.dubbo返回：traceID:[{}]  消费方 [{}]  接口 [{}]  返回值 [{}]  耗时 {} 毫秒", traceID,
                    SOURCE_IP, REQ_SERVICE, JSON.toJSONString(result), System.currentTimeMillis() - startTime);
            MDC.clear();
        }
        return result;
    }
}
```

dubbo还需要配置com.alibaba.dubbo.rpc.Filter

在META-INF/dubbo目录下, 添加com.alibaba.dubbo.rpc.Filter文件, 其内容为 `dubboConsumerFilter=com.xxx.ConsumerFilter`

名称自定义，=号后面为自定义的dubbofiliter全路径名称

同时需要配置yml文件spring.dubbo.consumer.filter 为dubboConsumerFilter

provider的配置为spring.dubbo.provider.filter 为dubboProviderFilter

## 2、HTTP请求：

写一个WebContextConfiguration类继承org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport，写一个TraceInterceptor类实现org.springframework.web.servlet.HandlerInterceptor

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
 
 
@Configuration
public class WebContextConfiguration extends WebMvcConfigurationSupport {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(buildTraceInter()).addPathPatterns("/**").order(0);
    }
 
    @Bean
    public TraceInterceptor buildTraceInter() {
        return new TraceInterceptor();
    }
}
```

```java
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
 
 
@Slf4j
public class TraceInterceptor implements HandlerInterceptor {
    public final static String TRACE_ID = "TraceID";
    public static final String START_TIMESTAMP = "START_TIMESTAMP";
    public static final String TRACE_URI = "trace_uri";
    public static final String UNKNOWN = "UNKNOWN";
    public final static String MDC_UUID = "mdc_uuid";
 
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        ThreadCache.setVal(START_TIMESTAMP, System.currentTimeMillis());
        MDC.put(TRACE_URI, StringUtils.defaultIfBlank(request.getRequestURI(), UNKNOWN));
        MDC.put(MDC_UUID, StringUtils.defaultIfBlank(request.getHeader(TRACE_ID), UUIDUtil.generateWithoutSeparator()));
        return true;
    }
 
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
 
    }
 
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        log.info("processing completed cost time [{}ms]", System.currentTimeMillis() - (long) ThreadCache.getVal(START_TIMESTAMP));
        MDC.clear();
    }
}
```

工具类：

```java
import java.util.HashMap;
import java.util.Map;
 
public class ThreadCache {
 
    private static final ThreadLocal<Map<String, Object>> LOCAL_CACHE = new ThreadLocal<Map<String, Object>>() {
        @Override
        protected Map<String, Object> initialValue() {
            return new HashMap<>(DEFAULT_SIZE);
        }
    };
    private static final int DEFAULT_SIZE = 8;
    public static <T> T getVal(String key) {
        return (T) LOCAL_CACHE.get().get(key);
    }
    public static <T> void setVal(String key, T val) {
        LOCAL_CACHE.get().put(key, val);
    }
    public static void clear(String key) {
        LOCAL_CACHE.get().remove(key);
    }
}
```

```java
import java.util.UUID;
 
 
public class UUIDUtil {
 
    public static String generateWithoutSeparator() {
        char[] array = new char[32]; int idx = 0;
        for (char c: generate().toCharArray()) {
            if (c != 45) {
                array[idx++] = c;
                continue;
            }
        }
        return new String(array);
    }
 
    public static String generate() {
        return UUID.randomUUID().toString();
    }
}
```

对于http调用其他系统接口，需要在http工具类里面统一设置

```java
request.setHeader(Trace.TRACE_ID, MDC.get(Trace.TRACE_ID));
```

在logback.xml中 只需在pattern中加上往MDC设置的traceID的key即可。

## 3、mq调用

以rocketMQ为例：

### 消费者

```java
import com.aliyun.openservices.ons.api.Action;
import com.aliyun.openservices.ons.api.ConsumeContext;
import com.aliyun.openservices.ons.api.Message;
import com.aliyun.openservices.ons.api.MessageListener;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
 
 
public abstract class AbstractListener implements MessageListener {
    public abstract Action doConsume(Message message, ConsumeContext consumeContext);
 
    @Override
    public Action consume(Message message, ConsumeContext consumeContext) {
        try {
            String traceId = message.getUserProperties(Trace.TRACE_ID);
            MDC.put(Trace.TRACE_ID, StringUtils.isNotBlank(traceId) ? traceId :
                    StringUtils.defaultIfBlank(MDC.get(Trace.TRACE_ID), UUIDUtil.generateWithoutSeparator()));
        
            return this.doConsume(message, consumeContext);
        } finally {
            MDC.clear();
        }
    }
}
```

消费者如何使用

```java
public class RefundMessageListener extends AbstractListener {
 
    @Override
    public Action doConsume(Message message, ConsumeContext consumeContext) {
        return null;
    }
}
```

### 生产者

```java
import com.aliyun.openservices.ons.api.Message;
import com.aliyun.openservices.ons.api.SendCallback;
import com.aliyun.openservices.ons.api.SendResult;
import com.aliyun.openservices.ons.api.bean.ProducerBean;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
 
 
 
public class ProducerTrace extends ProducerBean {
 
    @Override
    public SendResult send(Message message) {
        try {
            String traceId = message.getUserProperties(Trace.TRACE_ID);
            MDC.put(Trace.TRACE_ID, StringUtils.isNotBlank(traceId) ? traceId :
                    StringUtils.defaultIfBlank(MDC.get(Trace.TRACE_ID), UUIDUtil.generateWithoutSeparator()));
           
            return super.send(message);
        } finally {
            MDC.clear();
        }
    }
}
```

生产者如何使用：

1、将ProducerTrace注入

```java
@Configuration
public class ProducerClient {
 
    @Autowired
    private RocketMQConfig mqConfig;
    @Autowired
    private LocalTransactionChecker localTransactionChecker;
 
    @Bean(initMethod = "start", destroyMethod = "shutdown")
    public ProducerTrace buildProducer() {
        ProducerTrace producer = new ProducerTrace();
        producer.setProperties(mqConfig.getMqProperties());
        return producer;
    }

}
```

2、使用

```java
@Resource
private ProducerTrace producerTrace;

public void send(String topic, String tag, String body, Supplier<Boolean> supplier) {
   Message message = new Message(topic, tag, body.getBytes(StandardCharsets.UTF_8));
   SendResult sendResult = producerTrace.send(message)
}
```

# 参考资料

[全链路日志追踪traceId(http、dubbo、mq)](https://blog.csdn.net/promisessh/article/details/110532387)

* any list
{:toc}