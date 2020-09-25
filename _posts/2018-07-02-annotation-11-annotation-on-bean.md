---
layout: post
title:  Annotation-11-如何获取 spring bean 上的注解信息
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# 背景

设计了一套日志框架，希望通过注解指定时可以获取全局配置的信息，然后做一些对应的处理。

# 代码实现

## 获取类注解

`@EnableAutoLog` 注解是放在类上的，可以通过 `applicationContext.getBeansWithAnnotation(EnableAutoLog.class)` 获取，然后处理。

这里使用 `@PostConstruct` 做了一点优化，让这种查找只做一次，避免性能消耗。

```java
@Aspect
@Component
@EnableAspectJAutoProxy
public class AutoLogAop {

    @Autowired
    private ApplicationContext applicationContext;

    /**
     * 日志输出的实现类
     * @since 0.0.9
     */
    private Class<? extends IAutoLog>[] autoLogs;

    /**
     * 初始化实现类
     * @since 0.0.9
     */
    @PostConstruct
    public void initAutoLogs() {
        //获取自定义注解的配置的所有bean
        final Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(EnableAutoLog.class);
        for (Object bean : beansWithAnnotation.values()) {
            final EnableAutoLog annotation = AnnotationUtils.findAnnotation(bean.getClass(), EnableAutoLog.class);
            this.autoLogs = annotation.value();
        }
    }

}
```

## 获取方法上的信息

```java
public static void handleRegisterBeanWithSpringToInitConfigurerationBean(ApplicationContext applicationContext) {
  //获取自定义注解的配置
  final Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(InitRetryRabbitMq.class);
  for (String key : beansWithAnnotation.keySet()) {
    //Spring 代理类导致Method无法获取,这里使用AopUtils.getTargetClass()方法
    Method[] methods = ReflectionUtils.getAllDeclaredMethods(AopUtils.getTargetClass(beansWithAnnotation.get(key).getClass()));
    for (Method method : methods) {
      //获取指定方法上的注解的属性
      final InitRetryRabbitMq initRetryRabbitMq = AnnotationUtils.findAnnotation(method, InitRetryRabbitMq.class);
      if (null != initRetryRabbitMq) {
        //验证必要的注解的属性
        String queueName = Optional.ofNullable(initRetryRabbitMq.queueName()).orElseThrow(() -> new IllegalArgumentException("Please specify the queue name of the queue!"));
        //多个bean的时候相当于起个别名
        String registerBean = queueName + "InitConfigurerationBean";
        //将bean注册到Spring容器中,通过构造函数的方式进行注入
        SpringRegisterBean.registerBean((ConfigurableApplicationContext) applicationContext, registerBean, InitConfigurerationBean.class, initRetryRabbitMq, applicationContext);
        log.info("The registration bean is " + registerBean + ",Configuration information is " + JSONObject.toJSONString(initRetryRabbitMq));
      }
    }
  }
}
```

这个例子还是先指定了 beans，我们可以先获取所有的 beans，然后处理。

# 参考资料

[SpringBoot获取自定义注解属性-类-方法](https://blog.csdn.net/a656678879/article/details/100578017)

* any list
{:toc}