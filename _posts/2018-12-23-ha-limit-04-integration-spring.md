---
layout: post
title: 高可用之限流-03-整合 spring 
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

## 一睹为快

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>rate-limit-spring</artifactId>
    <version>0.0.3</version>
</dependency>
```

### ## 使用案例

- UserService.java

```java
@Service
public class UserService {

    private static final Log log = LogFactory.getLog(UserService.class);

    @Limit(interval = 2)
    public void limitFrequencyThreadLocal() {
        log.info("{}", Thread.currentThread().getName());
    }

    @Limit(interval = 2, limit = GlobalLimitFrequency.class)
    public void limitFrequencyGlobal(final long id) {
        log.info("{}", Thread.currentThread().getName());
    }

    @Limit(interval = 2, count = 5, limit = ThreadLocalLimitCount.class)
    public void limitCountThreadLocal() {
        log.info("{}", Thread.currentThread().getName());
    }

    @Limit(interval = 2, count = 5, limit = GlobalLimitCount.class)
    public void limitCountGlobal() {
        log.info("{}", Thread.currentThread().getName());
    }

}
```

### 注解说明 

- `@Limit`

注解定义如下：

```java
public @interface Limit {

    /**
     * 时间单位, 默认为秒
     * @see TimeUnit 时间单位
     * @return 时间单位
     * @since 0.0.1
     */
    TimeUnit timeUnit() default TimeUnit.SECONDS;

    /**
     * 时间间隔
     * (1) 需要填入正整数。
     * @return 时间间隔
     * @since 0.0.1
     */
    long interval() default 1;

    /**
     * 调用次数。
     * (1) 需要填入正整数。
     * @return 调用次数
     * @since 0.0.1
     */
    int count() default 100;

    /**
     * 限制策略
     * @return 限制策略
     * @since 0.0.3
     */
    Class<? extends ILimit> limit() default ThreadLocalLimitFrequency.class;

}
```

效果同过程式调用。

### 完整测试案例

[SpringConfigTest](https://github.com/houbb/rate-limit/blob/master/rate-limit-test/src/test/java/com/github/houbb/rate/limit/test/spring/SpringConfigTest.java)

## 核心源码实现

### 注解

见上述 `@Limit` 注解。

### 切面

```java
@Aspect
@Component
@API(status = API.Status.MAINTAINED)
public class LimitAspect {

    @Autowired
    private ILimitAspectHandler limitHandler;

    @Pointcut("@annotation(com.github.houbb.rate.limit.spring.annotation.Limit)")
    public void myPointcut() {
    }

    @Around("myPointcut() && @annotation(limit)")
    public Object around(ProceedingJoinPoint point, Limit limit) throws Throwable {
        Method method = getCurrentMethod(point);

        // 核心处理方法
        limitHandler.handle(method, limit);

        return point.proceed();
    }

    /**
     * 获取当前扥方法
     * @param point 切面
     * @return 结果
     * @since 0.0.1
     */
    private Method getCurrentMethod(ProceedingJoinPoint point) {
        try {
            Signature sig = point.getSignature();
            MethodSignature msig = (MethodSignature) sig;
            Object target = point.getTarget();
            return target.getClass().getMethod(msig.getName(), msig.getParameterTypes());
        } catch (NoSuchMethodException e) {
            throw new RateLimitRuntimeException(e);
        }
    }

}
```

### 具体处理方法

```java
public class LimitAspectHandler implements ILimitAspectHandler {

    /**
     * 用来存放方法的限制器
     * Key=方法全名+注解名称
     * @since 0.0.3
     */
    private static final Map<String, ILimit> LIMIT_HASH_MAP = new ConcurrentHashMap<>();

    /**
     * 日志
     *
     * @since 0.0.3
     */
    private static final Log LOG = LogFactory.getLog(LimitAspectHandler.class);

    /**
     * 处理对应的信息
     *
     * @param method   方法
     * @param limit    限制对象
     * @since 0.0.3
     */
    @Override
    public void handle(final Method method,
                       final Limit limit) {
        final Class<? extends ILimit> strategy = limit.limit();

        String key = getMethodFullName(method) + ":" + strategy.getSimpleName();
        ILimit instance = LIMIT_HASH_MAP.get(key);

        if(instance == null) {
            instance = LimitBs.newInstance()
                    .limit(strategy)
                    .count(limit.count())
                    .timeUnit(limit.timeUnit())
                    .interval(limit.interval())
                    .build();

            LIMIT_HASH_MAP.put(key, instance);
        }


        instance.limit();
    }

    /**
     * 方法全名此处应该考虑不同的参数问题。
     *
     * @param method 方法
     * @return 完整的方法名称
     * @since 0.0.1
     */
    private static String getMethodFullName(Method method) {
        final String className = method.getDeclaringClass().getName();
        Class[] types = method.getParameterTypes();
        StringBuilder nameBuilder = new StringBuilder(className + "." + method.getName());
        if (ObjectUtil.isNotEmpty(types)) {
            for (Class parameter : types) {
                nameBuilder.append(PunctuationConst.COLON).append(parameter.getName());
            }
        }
        return nameBuilder.toString();
    }

}
```

如此，我们就实现了一个最基础的可以整合 spring 的 rate-limit 框架。

## 完整代码

[rate-limit](https://github.com/houbb/rate-limit/)

后续将实现更多的内置限流策略。

* any list
{:toc}