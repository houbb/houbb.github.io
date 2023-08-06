---
layout: post
title: autoLog-01-java 注解结合 spring aop 实现自动输出日志
date:  2023-08-06 +0800
categories: [Trace]
tags: [spring, aop, cglib, log, sh]
published: true
---


# java 注解结合 spring aop 实现自动输出日志

# auto-log

[auto-log](https://github.com/houbb/auto-log) 是一款为 java 设计的自动日志监控框架。

## 创作目的

经常会写一些工具，有时候手动加一些日志很麻烦，引入 spring 又过于大材小用。

所以希望从从简到繁实现一个工具，便于平时使用。

## 特性

- 基于注解+字节码，配置灵活

- 自动适配常见的日志框架

- 支持编程式的调用

- 支持注解式，完美整合 spring

- 支持整合 spring-boot

- 支持慢日志阈值指定，耗时，入参，出参，异常信息等常见属性指定

> [变更日志](https://github.com/houbb/auto-log/blob/master/CHANGELOG.md)

# 核心原理

## 注解定义

```java
import java.lang.annotation.*;

/**
 * 自动注解
 * @author binbin.hou
 * @since 0.0.1
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface AutoLog {

    /**
     * 输出参数
     * @return 参数
     * @since 0.0.1
     */
    boolean param() default true;

    /**
     * 是否输出结果
     * @return 结果
     * @since 0.0.1
     */
    boolean result() default true;

    /**
     * 是否输出时间
     * @return 耗时
     * @since 0.0.1
     */
    boolean costTime() default false;

    /**
     * 是否输出异常信息
     * @return 是否
     * @since 0.0.6
     */
    boolean exception() default true;

    /**
     * 慢日志阈值
     *
     * 当值小于 0 时，不进行慢日志统计。
     * 当值大于等于0时，当前值只要大于等于这个值，就进行统计。
     * @return 阈值
     * @since 0.0.4
     */
    long slowThresholdMills() default -1;

}
```

## 核心 AOP 实现

这里的 LogFactory 类是关键，可以兼容目前大部分的日志框架。

```java
import com.github.houbb.auto.log.annotation.AutoLog;
import com.github.houbb.heaven.response.exception.CommonRuntimeException;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * 这是一种写法
 * 自动日志输出 aop
 * @author binbin.hou
 * @since 0.0.3
 */
@Aspect
@Component
@EnableAspectJAutoProxy
public class AutoLogAop {

    private static final Log LOG = LogFactory.getLog(AutoLogAop.class);

    /**
     * 执行核心方法
     *
     * 相当于 MethodInterceptor
     * @param point 切点
     * @param autoLog 日志参数
     * @return 结果
     * @throws Throwable 异常信息
     * @since 0.0.3
     */
    @Around("@annotation(autoLog)")
    public Object around(ProceedingJoinPoint point, AutoLog autoLog) throws Throwable {
        Method method = getCurrentMethod(point);
        String methodName = method.getName();
        try {
            final long startMills = System.currentTimeMillis();
            //1. 是否输入入参
            if (autoLog.param()) {
                LOG.info("{} param is {}.", methodName, Arrays.toString(point.getArgs()));
            }

            //2. 执行方法
            Object result = point.proceed();

            //3. 结果
            if (autoLog.result()) {
                LOG.info("{} result is {}.", methodName, result);
            }
            //3.1 耗时
            final long slowThreshold = autoLog.slowThresholdMills();
            if (autoLog.costTime() || slowThreshold >= 0) {
                final long endMills = System.currentTimeMillis();
                long costTime = endMills - startMills;
                if (autoLog.costTime()) {
                    LOG.info("{} cost time is {}ms.", methodName, costTime);
                }

                //3.2 慢日志
                if (slowThreshold >= 0 && costTime >= slowThreshold) {
                    LOG.warn("{} is slow log, {}ms >= {}ms.", methodName, costTime, slowThreshold);
                }
            }

            return result;
        } catch (Throwable e) {
            if(autoLog.exception()) {
                LOG.error("{} meet ex.", methodName, e);
            }

            throw e;
        }
    }

    /**
     * 获取当前方法信息
     *
     * @param point 切点
     * @return 方法
     */
    private Method getCurrentMethod(ProceedingJoinPoint point) {
        try {
            Signature sig = point.getSignature();
            MethodSignature msig = (MethodSignature) sig;
            Object target = point.getTarget();
            return target.getClass().getMethod(msig.getName(), msig.getParameterTypes());
        } catch (NoSuchMethodException e) {
            throw new CommonRuntimeException(e);
        }
    }

}
```

# 快速开始

## maven 引入

```xml
<dependency>
    <group>com.github.houbb</group>
    <artifact>auto-log-core</artifact>
    <version>${最新版本}</version>
</dependency>
```

## 入门案例

```java
UserService userService = AutoLogHelper.proxy(new UserServiceImpl());
userService.queryLog("1");
```

- 日志如下

```
[INFO] [2020-05-29 16:24:06.227] [main] [c.g.h.a.l.c.s.i.AutoLogMethodInterceptor.invoke] - public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) param is [1]
[INFO] [2020-05-29 16:24:06.228] [main] [c.g.h.a.l.c.s.i.AutoLogMethodInterceptor.invoke] - public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) result is result-1
```

### 代码

其中方法实现如下：

- UserService.java

```java
public interface UserService {

    String queryLog(final String id);

}
```

- UserServiceImpl.java

直接使用注解 `@AutoLog` 指定需要打日志的方法即可。

```java
public class UserServiceImpl implements UserService {

    @Override
    @AutoLog
    public String queryLog(String id) {
        return "result-"+id;
    }

}
```

# 注解说明

核心注解 `@AutoLog` 的属性说明如下：

| 属性 | 类型 | 默认值 | 说明 |
|:--|:--|:--|:--|
| param | boolean | true | 是否打印入参 |
| result | boolean | true | 是否打印出参 |
| costTime | boolean | false | 是否打印耗时 |
| exception | boolean | true | 是否打印异常 |
| slowThresholdMills | long | -1 | 当这个值大于等于 0 时，且耗时超过配置值，会输出慢日志 |

# spring 整合使用

完整示例参考 [SpringServiceTest](https://github.com/houbb/auto-log/tree/master/auto-log-test/src/test/java/com/github/houbb/auto/log/spring/SpringServiceTest.java)

## 注解声明

使用 `@EnableAutoLog` 启用自动日志输出

```java
@Configurable
@ComponentScan(basePackages = "com.github.houbb.auto.log.test.service")
@EnableAutoLog
public class SpringConfig {
}
```

## 测试代码

```java
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void queryLogTest() {
        userService.queryLog("1");
    }

}
```

- 输出结果

```
信息: public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) param is [1]
五月 30, 2020 12:17:51 下午 com.github.houbb.auto.log.core.support.interceptor.AutoLogMethodInterceptor info
信息: public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) result is result-1
五月 30, 2020 12:17:51 下午 org.springframework.context.support.GenericApplicationContext doClose
```

# 开源地址

> Github: [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

> Gitee: [https://gitee.com/houbinbin/auto-log](https://gitee.com/houbinbin/auto-log)

欢迎 fork/star~

![在这里插入图片描述](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/032fa168c76846a6b6522e359c95a65d~tplv-k3u1fbpfcp-zoom-1.image)

# 参考资料

> Github: [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

* any list
{:toc}