---
layout: post
title:  Annotation-13-annotation spring aop expression 基于表达式进行拦截
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# 场景

有时候 aop 的参数获取可能比较复杂，比如 id 标识的获取，每一个方法都不一样。

那么可以考虑通过 spring expression 的方式，让我们的参数获取更加灵活强大。

# 一、依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- aop -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

# 二、注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Limiter {
    /**
     * 使用spel表达式获取限流的key
     * @return
     */
    String value();
}
```

# 三、AOP切面的应用

```java
@Aspect
@Component
public class LimiterAspect {
    private ExpressionParser parser = new SpelExpressionParser();
    private LocalVariableTableParameterNameDiscoverer discoverer = new LocalVariableTableParameterNameDiscoverer();

    @Pointcut("@annotation(limiter)")
    public void pointcut(Limiter limiter) {
    }

    @Around("pointcut(limiter)")
    public Object around(ProceedingJoinPoint pjp, Limiter limiter) throws Throwable {
        Method method = this.getMethod(pjp);
        String methodName = method.toString();

        //获取方法的参数值
        Object[] args = pjp.getArgs();
        EvaluationContext context = this.bindParam(method, args);

        //根据spel表达式获取值
        Expression expression = parser.parseExpression(limiter.value());
        Object key = expression.getValue(context);
        //打印
        System.out.println(key);

        return pjp.proceed();
    }

    /**
     * 获取当前执行的方法
     *
     * @param pjp
     * @return
     * @throws NoSuchMethodException
     */
    private Method getMethod(ProceedingJoinPoint pjp) throws NoSuchMethodException {
        MethodSignature methodSignature = (MethodSignature) pjp.getSignature();
        Method method = methodSignature.getMethod();
        Method targetMethod = pjp.getTarget().getClass().getMethod(method.getName(), method.getParameterTypes());
        return targetMethod;
    }

    /**
     * 将方法的参数名和参数值绑定
     *
     * @param method 方法，根据方法获取参数名
     * @param args   方法的参数值
     * @return
     */
    private EvaluationContext bindParam(Method method, Object[] args) {
        //获取方法的参数名
        String[] params = discoverer.getParameterNames(method);

        //将参数名与参数值对应起来
        EvaluationContext context = new StandardEvaluationContext();
        for (int len = 0; len < params.length; len++) {
            context.setVariable(params[len], args[len]);
        }
        return context;
    }
```

# 四、Controller

```java
@RestController
public class TestController {

    //获取名为id的参数
    @Limiter("#id")
    @GetMapping("test")
    public String test(Long id){
        return "hello";
    }
}
```

# 五、获取对象（补充）

## 1、注解

```java
@Limter(value = "#testObj")
public JSONObject test01(TestObj  testObj){
       // ......      
}
```

多个切点同时获取

```java
/**
 * 设置操作日志切入点 记录操作日志 在注解的位置切入代码
 */
//@Pointcut("@annotation(com.test.Limter)")
@Pointcut("@annotation(limter)")
public void operLogPointCut(Limter limter) {
}

@Pointcut("execution(public * com.test.aaa..*.*(..))")
public void operLogPointMethod() {
}
```

线程变量的使用，当前切面类中使用线程变量存储变量

```java
@Aspect
@Component
public class LogAspect {

    @Autowired
    private LogsService logsService;
    // 线程变量
    private ThreadLocal<String> threadLocal = new ThreadLocal<>();

    /**
     * 设置操作日志切入点 记录操作日志 在注解的位置切入代码
     */
```

方法体中存入数据

```java
public void savaData(){
    threadLocal.set("asdf");
}
```

在另一个方法体中获取当前线程数据

```java
public void savaData(){
    String value = threadLocal.get();
}
```

切点多条件限制 &&

```java
@AfterReturning(value = "operLogPointCut(limter) && operLogPointMethod()", returning = "returnValue")
public void saveOperLog(JoinPoint joinPoint, Limter limter, Object returnValue) {
    Object[] args = joinPoint.getArgs();
    // 从切面织入点处通过反射机制获取织入点处的方法
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    // 获取切入点所在的方法
    Method method = signature.getMethod();
    EvaluationContext context = this.bindParam(method, args);
    Expression expression = parser.parseExpression(limter.value());
    TestObj testObj= expression.getValue(context, TestObj.class);
    // ......
    new Thread(() -> logsService.saveLogs(Obj...)).start();
    // 存入数据库后移除当前线程变量
    threadLocal.remove();
}
```



# 参考资料

[Spring使用Spel表达式获取参数值](https://www.cnblogs.com/116970u/p/14341940.html)

* any list
{:toc}