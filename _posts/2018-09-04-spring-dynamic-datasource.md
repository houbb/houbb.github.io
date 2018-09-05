---
layout: post
title:  Dynamic Spring Datasource
date:  2018-09-04 13:32:36 +0800
categories: [Spring]
tags: [database, sql, spring, sh]
published: true
excerpt: Spring 动态数据源
---

# Spring Datasource

开启本篇话题之前，先说下 spring 数据源的配置。

## JDBC 直接配置

```xml
<!-- 配置数据源dataSource  jdbc方式连接数据源 -->
<beanid="dataSource"class="org.springframework.jdbc.datasource.DriverManagerDataSource">
     <propertyname="driverClassName"value="com.mysql.jdbc.Driver"/>
     <property name="url"value="jdbc:mysql://localhost:3306/mydatabase"  />
     <propertyname="username" value="root"/>
     <propertyname="password" value="root"/>
</bean>
```

当然，处于性能考虑，我们一般会使用连接池。

# 连接池

## DBCP

```xml
<!--  配置数据源dataSource  dbcp连接池方式连接数据源   -->
<bean id="dataSource"class="org.apache.commons.dbcp.BasicDataSource">
   <propertyname="url"
      value="jdbc:mysql://localhost:3306/mydatabase"/>
   <propertyname="driverClassName"value="com.mysql.jdbc.Dirver" />
   <propertyname="username" value="root" />
   <propertyname="password" value="root" />
   
   <!--配置初始化大小、最小、最大-->
   <property name="initialSize"value="1"/>
   <propertyname="minIdle" value="1"/>  
   <propertyname="maxActive" value="30"/> 
</bean>
```

## Driud

druid 作为一名后起之秀，凭借其出色的性能，也逐渐印入了大家的眼帘。

```xml
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    <!-- 基本属性 url、user、password -->
    <property name="url" value="${jdbc.url}"/>
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>
```

更多配置，参考 [Driud](https://blog.csdn.net/yunnysunny/article/details/8657095)

# SpringBoot 多数据源

某些情况下，如果我们需要配置多个数据源，应该如何在Spring Boot中配置呢？

我们以JDBC为例，演示如何在Spring Boot中配置两个DataSource。

对应的，我们会创建两个JdbcTemplate的Bean，分别使用这两个数据源。

## 配置

- application.yml

首先，我们必须在application.yml中声明两个数据源的配置，一个使用spring.datasource，另一个使用spring.second-datasource：

```yml
spring:
  application:
    name: data-multidatasource
  datasource:
    driver-class-name: org.hsqldb.jdbc.JDBCDriver
    url: jdbc:hsqldb:mem:db1
    username: sa
    password:
  second-datasource:
    driver-class-name: org.hsqldb.jdbc.JDBCDriver
    url: jdbc:hsqldb:mem:db2
    username: sa
    password:
```

在使用多数据源的时候，所有必要配置都不能省略。

## dao 层

其次，我们需要自己创建两个 DataSource 的 Bean，其中一个标记为 `@Primary`，另一个命名为secondDatasource：

```java
@Configuration
public class SomeConfiguration {
    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "secondDatasource")
    @ConfigurationProperties(prefix = "spring.second-datasource")
    public DataSource secondDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

紧接着，我们创建两个JdbcTemplate的Bean，其中一个标记为 `@Primary`，另一个命名为secondJdbcTemplate，分别使用对应的DataSource：

```java
@Bean
@Primary
public JdbcTemplate primaryJdbcTemplate(DataSource dataSource) {
    return new JdbcTemplate(dataSource);
}

@Bean(name = "secondJdbcTemplate")
public JdbcTemplate secondJdbcTemplate(@Qualifier("secondDatasource") DataSource dataSource) {
    return new JdbcTemplate(dataSource);
}
```

## 使用

在需要使用第一个 JdbcTemplate 的地方，我们直接注入：

```java
@Component
public class SomeService {
    @Autowired
    JdbcTemplate jdbcTemplate;
}
```

在需要使用第二个 JdbcTemplate 的地方，我们注入时需要用 `@Qualifier("secondJdbcTemplate")` 标识：

```java
@Component
public class AnotherService {
    @Autowired
    @Qualifier("secondJdbcTemplate")
    JdbcTemplate secondJdbcTemplate;
}
```

# 手动实现

看了 spring-boot 的实现，其实我们也可以自己实现一个简化版。

## 思路

spring 提供了 `org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource` 类，可以动态切换数据源。

我们自定义注解，通过 aop 的方式，切换数据源。

## 注解

- DataSource.java

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
@Inherited
public @interface DataSource {

    /**
     * 指定一个数据源的值
     * @return 数据源名称
     */
    String value() default "";

}
```

## 辅助类

- 动态数据源

```java
public class DynamicDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        return DynamicDataSourceHolder.getDataSource();
    }

}
```

- 动态数据源 Holder

使用 ThreadLocal 保证各线程互不干扰。

```java
public final class DynamicDataSourceHolder  {

    private DynamicDataSourceHolder(){}

    /**
     * 保证线程间互不干涉
     */
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();

    /**
     * 设置数据源类型
     * @param datasource  数据库类型
     */
    public static void setDataSource(String datasource) {
        CONTEXT.set(datasource);
    }

    /**
     * 获取数据源类型
     * @return 数据源类型
     */
    public static String getDataSource() {
        return CONTEXT.get();
    }

    /**
     * 清空数据源
     */
    public static void clearDataSource() {
        CONTEXT.remove();
    }

}
```

## AOP

- DynamicDataSourceAspect.java

```java
@Component
@Aspect
public class DynamicDataSourceAspect {

    private Log log = LogFactory.getLog(DynamicDataSourceAspect.class);

    @Pointcut("@annotation(com.github.houbb.paradise.spring.datasource.dynamic.annotation.DataSource)")
    public void myPointcut() {
    }

    @Around("myPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        Method method = getCurrentMethod(point);

        //1. 当前方法是否有注解
        boolean methodFlag = method.isAnnotationPresent(DataSource.class);
        if(methodFlag) {
            DataSource datasource = method.getAnnotation(DataSource.class);
            setDataSource(datasource);
        } else {
            //2. 当前类是否有注解
            Class clazz = getClass(point);
            if(clazz.isAnnotationPresent(DataSource.class)) {
                //IDEA BUG
                DataSource datasource = (DataSource) clazz.getAnnotation(DataSource.class);
                setDataSource(datasource);
            }
        }

        Object result = point.proceed();
        DynamicDataSourceHolder.clearDataSource();
        return result;
    }

    private Class getClass(ProceedingJoinPoint point) {
        return point.getTarget().getClass();
    }

    /**
     * 设置数据源的值
     * @param dataSource 数据源注解
     */
    private void setDataSource(DataSource dataSource) {
        if(ObjectUtil.isNull(dataSource)) {
            return;
        }
        String value = dataSource.value();
        if(StringUtil.isNotEmpty(value)) {
            DynamicDataSourceHolder.setDataSource(value);
            log.debug("Set datasource with value: {}", value);
        }
    }

    /**
     * 获取当前代理的方法
     * @param point 切面
     * @return 方法
     */
    private Method getCurrentMethod(ProceedingJoinPoint point) {
        try {
            Signature sig = point.getSignature();
            MethodSignature msig = (MethodSignature) sig;
            Object target = point.getTarget();
            return target.getClass().getMethod(msig.getName(), msig.getParameterTypes());
        } catch (NoSuchMethodException e) {
            throw new DynamicDataSourceException(e);
        }
    }

}
```

# 参考资料

- spring 数据源

https://my.oschina.net/u/1020238/blog/509152

http://zyc1006.iteye.com/blog/1339719

https://www.baeldung.com/spring-data-jpa-multiple-databases

- springboot 数据源

https://blog.csdn.net/qq_35760213/article/details/73863252

https://www.liaoxuefeng.com/article/001484212576147b1f07dc0ab9147a1a97662a0bd270c20000

* any list
{:toc}