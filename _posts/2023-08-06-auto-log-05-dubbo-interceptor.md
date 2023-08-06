---
layout: post
title: autoLog-05-如何将 dubbo filter 拦截器原理运用到日志拦截器中？
date:  2023-08-06 +0800
categories: [Trace]
tags: [spring, aop, cglib, log, sh]
published: true
---


# 业务背景

我们希望可以在使用日志拦截器时，定义属于自己的拦截器方法。

实现的方式有很多种，我们分别来看一下。

## 拓展阅读

[java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[java 注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

![chain](https://img-blog.csdnimg.cn/03cca9b818374ee587465b7aff2a1e1d.jpeg#pic_center)

# v1-基本版本

## 接口

最常见的定义方式，在方法执行前后，异常，finally 提供钩子函数。

```java
package com.github.houbb.auto.log.api;

/**
 * autoLog 拦截器
 * @author binbin.hou
 * @since 0.0.10
 */
public interface IAutoLogInterceptor {

    /**
     * 执行之前
     * @param interceptorContext 拦截器上下文
     * @since 0.0.10
     */
    void beforeHandle(IAutoLogInterceptorContext interceptorContext);

    /**
     * 执行之后
     * @param interceptorContext 拦截器上下文
     * @param result 方法执行结果
     * @since 0.0.10
     */
    void afterHandle(IAutoLogInterceptorContext interceptorContext,
                     final Object result);

    /**
     * 异常处理
     * @param interceptorContext 拦截器上下文
     * @param exception 异常
     * @since 0.0.10
     */
    void exceptionHandle(IAutoLogInterceptorContext interceptorContext, Exception exception);

    /**
     * finally 中执行的代码
     * @param interceptorContext 拦截器上下文
     * @since 0.0.10
     */
    void finallyHandle(IAutoLogInterceptorContext interceptorContext);

}
```

## 工具中统一使用拦截器

```java
package com.github.houbb.auto.log.core.core.impl;
/**
 * @author binbin.hou
 * @since 0.0.7
 */
public class SimpleAutoLog implements IAutoLog {

    /**
     * 自动日志输出
     *
     * @param context 上下文
     * @return 结果
     * @since 0.0.7
     */
    @Override
    public Object autoLog(IAutoLogContext context) throws Throwable {
        //1. 日志唯一标识
        // ... 省略
        List<IAutoLogInterceptor> autoLogInterceptors = null;

        try {
            // ... 省略其他逻辑
            // 获取拦截器
            autoLogInterceptors = autoLogInterceptors(autoLog);

            //1.2 autoLog
            if(CollectionUtil.isNotEmpty(autoLogInterceptors)) {
                for(IAutoLogInterceptor interceptor : autoLogInterceptors) {
                    interceptor.beforeHandle(autoLogContext);
                }
            }

            //2. 执行结果
            Object result = context.process();

            //2.1 方法执行后
            if(CollectionUtil.isNotEmpty(autoLogInterceptors)) {
                for(IAutoLogInterceptor interceptor : autoLogInterceptors) {
                    interceptor.afterHandle(autoLogContext, result);
                }
            }

            //2.2 返回方法
            return result;
        } catch (Exception exception) {
            if(CollectionUtil.isNotEmpty(autoLogInterceptors)) {
                for(IAutoLogInterceptor interceptor : autoLogInterceptors) {
                    interceptor.exceptionHandle(autoLogContext, exception);
                }
            }

            throw new AutoLogRuntimeException(exception);
        } finally {
            // 先执行日志
            if(CollectionUtil.isNotEmpty(autoLogInterceptors)) {
                for(IAutoLogInterceptor interceptor : autoLogInterceptors) {
                    interceptor.finallyHandle(autoLogContext);
                }
            }
        }
    }

    /**
     * 创建拦截器列表
     * @param autoLog 注解
     * @return 结果
     * @since 0.0.10
     */
    private List<IAutoLogInterceptor> autoLogInterceptors(final AutoLog autoLog) {
        List<IAutoLogInterceptor> resultList = new ArrayList<>();
        if(ObjectUtil.isNull(autoLog)) {
            return resultList;
        }

        Class<? extends IAutoLogInterceptor>[] interceptorClasses = autoLog.interceptor();
        if(ArrayUtil.isEmpty(interceptorClasses)) {
            return resultList;
        }

        // 循环创建
        for(Class<? extends IAutoLogInterceptor> clazz : interceptorClasses) {
            IAutoLogInterceptor traceIdInterceptor = createAutoLogInterceptor(clazz);
            resultList.add(traceIdInterceptor);
        }

        return resultList;
    }


    /**
     * 创建拦截器
     * @param clazz 类
     * @return 实体
     * @since 0.0.10
     */
    private IAutoLogInterceptor createAutoLogInterceptor(final Class<? extends IAutoLogInterceptor> clazz) {
        if(IAutoLogInterceptor.class.equals(clazz)) {
            return new AutoLogInterceptor();
        }

        return ClassUtil.newInstance(clazz);
    }

}
```

## 自定义实现拦截器

我们想自定义拦截器方法时，只需要实现对应的接口即可。

```java
/**
 * 自定义日志拦截器
 * @author binbin.hou
 * @since 0.0.12
 */
public class MyAutoLogInterceptor extends AbstractAutoLogInterceptor {

    @Override
    protected void doBefore(AutoLog autoLog, IAutoLogInterceptorContext context) {
        System.out.println("自定义入参：" + Arrays.toString(context.filterParams()));
    }

    @Override
    protected void doAfter(AutoLog autoLog, Object result, IAutoLogInterceptorContext context) {
        System.out.println("自定义出参：" + result);
    }

    @Override
    protected void doException(AutoLog autoLog, Exception exception, IAutoLogInterceptorContext context) {
        System.out.println("自定义异常：");
        exception.printStackTrace();
    }

}
```

## 方法的不足

这种方式可以实现常见的功能，但是依然不够优雅。

我们还是无法非常灵活的定义自己的拦截器实现，就像我们使用 aop 增强，或者 dubbo filter 一样。

感兴趣的小伙伴可以移步学习一下，此处不做展开。

> [Dubbo-02-dubbo invoke filter 链式调用原理](https://houbb.github.io/2016/09/25/dubbo-02-invoke)

# 模拟 dubbo filter

## 实现 Invoker

类似 dubbo invoke，直接在以前的类中初始化即可。

```java
AutoLogInvoker autoLogInvoker = new AutoLogInvoker(context);
Invocation invocation = new CommonInvocation();
invocation.setAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_CONTEXT, context);
invocation.setAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_START_TIME, startTimeMills);
invocation.setAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_FILTER_PARAMS, filterParams);

Invoker chainInvoker = InvokerChainBuilder.buildInvokerChain(autoLogInvoker);
Result autoLogResult = chainInvoker.invoke(invocation);
```

其中 AutoLogInvoker 只是对方法的执行。

### 实现拦截器

这是的方法增强就是类似 dubbo filter 链式调用实现的，自定义的时候也会方便很多。

不需要拘泥于方法的执行位置，直接编写我们的增强逻辑即可。

```java
package com.github.houbb.auto.log.core.support.interceptor.chain;

import com.alibaba.fastjson.JSON;
import com.github.houbb.auto.log.annotation.AutoLog;
import com.github.houbb.auto.log.api.IAutoLogContext;
import com.github.houbb.auto.log.core.constant.AutoLogAttachmentKeyConst;
import com.github.houbb.common.filter.annotation.FilterActive;
import com.github.houbb.common.filter.api.CommonFilter;
import com.github.houbb.common.filter.api.Invocation;
import com.github.houbb.common.filter.api.Invoker;
import com.github.houbb.common.filter.api.Result;
import com.github.houbb.common.filter.exception.CommonFilterException;
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.heaven.util.lang.reflect.ClassUtil;
import com.github.houbb.heaven.util.lang.reflect.ReflectMethodUtil;
import com.github.houbb.id.api.Id;
import com.github.houbb.id.core.core.Ids;
import com.github.houbb.id.core.util.IdThreadLocalHelper;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.lang.reflect.Method;

/**
 * 默认的日志拦截器
 */
@FilterActive(order = Integer.MIN_VALUE)
public class AutoLogCommonFilter implements CommonFilter {

    private static final Log LOG = LogFactory.getLog(AutoLogCommonFilter.class);

    /**
     * 是否需要处理日志自动输出
     * @param autoLog 上下文
     * @return 结果
     * @since 0.0.10
     */
    protected boolean enableAutoLog(final AutoLog autoLog) {
        if(autoLog == null) {
            return false;
        }

        return autoLog.enable();
    }

    /**
     * 获取方法描述
     * @param method 方法
     * @param autoLog 注解
     * @return 结果
     * @since 0.0.10
     */
    protected String getMethodDescription(Method method, AutoLog autoLog) {
        String methodName = ReflectMethodUtil.getMethodFullName(method);

        if(autoLog != null
            && StringUtil.isNotEmpty(autoLog.description())) {
            methodName += "#" + autoLog.description();
        }

        return methodName;
    }

    /**
     * 获取 traceId
     * @param autoLog 日志注解
     * @return 结果
     * @since 0.0.10
     */
    protected String getTraceId(AutoLog autoLog) {
        //1. 优先看当前线程中是否存在
        String oldId = IdThreadLocalHelper.get();
        if(StringUtil.isNotEmpty(oldId)) {
            return formatTraceId(oldId);
        }

        //2. 返回对应的标识
        Id id = getActualTraceId(autoLog);
        return formatTraceId(id.id());
    }

    /**
     * 获取日志跟踪号策略
     * @param autoLog 注解
     * @return 没结果
     */
    protected Id getActualTraceId(AutoLog autoLog) {
        Class<? extends Id> idClass = autoLog.traceId();
        if(Id.class.equals(idClass)) {
            return Ids.uuid32();
        }
        return ClassUtil.newInstance(autoLog.traceId());
    }

    /**
     * 格式化日志跟踪号
     * @param id 跟踪号
     * @return 结果
     * @since 0.0.16
     */
    protected String formatTraceId(String id) {
        return String.format("[%s] ", id);
    }

    @Override
    public Result invoke(Invoker invoker, Invocation invocation) throws CommonFilterException {
        final IAutoLogContext autoLogContext = (IAutoLogContext) invocation.getAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_CONTEXT);
        final AutoLog autoLog = autoLogContext.autoLog();
        final boolean enableAutoLog = enableAutoLog(autoLog);
        if(!enableAutoLog) {
            return invoker.invoke(invocation);
        }

        final String description = getMethodDescription(autoLogContext.method(), autoLog);
        // 默认从上下文中取一次
        String traceId = IdThreadLocalHelper.get();
        try {
            // 设置 traceId 策略
            if(autoLog.enableTraceId()) {
                Id id = getActualTraceId(autoLog);
                traceId = id.id();

                invocation.setAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_TRACE_ID, traceId);
                IdThreadLocalHelper.put(traceId);
            }

            Result result = invoker.invoke(invocation);

            // 日志增强
            logForEnhance(autoLogContext, traceId, description, result.getValue(), invocation);

            return result;
        } catch (Exception e) {
            if (autoLog.exception()) {
                String message = String.format("[TID=%s][EXCEPTION=%s]", traceId, e.getMessage());
                LOG.error(message, e);
            }

            throw new RuntimeException(e);
        }
    }

    /**
     * 增强日志输出
     * @param autoLogContext 上下文
     * @param traceId 日志跟踪号
     * @param description 方法描述
     * @param resultValue 返回值
     * @param invocation 调用上下文
     */
    private void logForEnhance(final IAutoLogContext autoLogContext,
                               final String traceId,
                               final String description,
                               final Object resultValue,
                               Invocation invocation) {
        final AutoLog autoLog = autoLogContext.autoLog();

        StringBuilder logBuilder = new StringBuilder();
        logBuilder.append(String.format("[TID=%s]", traceId));
        logBuilder.append(String.format("[METHOD=%s]", description));

        // 入参
        if(autoLog.param()) {
            Object[] params = (Object[]) invocation.getAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_FILTER_PARAMS);
            logBuilder.append(String.format("[PARAM=%s]", JSON.toJSONString(params)));
        }
        // 出参
        if (autoLog.result()) {
            logBuilder.append(String.format("[RESULT=%s]", JSON.toJSONString(resultValue)));
        }
        // 耗时
        //3.1 耗时 & 慢日志
        if(autoLog.costTime()) {
            long startTime = (long) invocation.getAttachment(AutoLogAttachmentKeyConst.AUTO_LOG_START_TIME);
            long costTime = System.currentTimeMillis() - startTime;
            logBuilder.append(String.format("[COST=%d ms]", costTime));

            // 慢日志
            final long slowThreshold = autoLog.slowThresholdMills();
            if(slowThreshold > 0 && costTime > slowThreshold) {
                logBuilder.append(String.format("[SLOW-THRESHOLD=%s]", slowThreshold));
            }
        }

        // 输出日志
        LOG.info(logBuilder.toString());
    }

}
```


# 开源地址

为了便于大家学习，项目已开源。

> Github: <https://github.com/houbb/auto-log>

> Gitee: <https://gitee.com/houbinbin/auto-log>

# 小结

dubbo filter 模式非常的优雅，以前一直只是学习，没有将其应用到自己的项目中。

提供的便利性是非常强大的，值得学习运用。

# 参考资料

> [auto-log](https://github.com/houbb/auto-log) 

* any list
{:toc}