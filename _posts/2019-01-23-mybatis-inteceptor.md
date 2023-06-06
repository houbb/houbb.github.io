---
layout: post
title: Mybatis 拦截器 mybatis interceptor
date:  2019-1-23 08:49:44 +0800
categories: [Mybatis]
tags: [mybatis, TODO, sh]
published: true
---

# 分页插件

比如分页插件：[pagehelper](https://pagehelper.github.io/)

可以大幅度提升我们的开发效率。

# 需求

数据库中敏感字段的对称加密，或者诸如密码之类的非对称加密。

其实都可以不是在一次次的代码查询和更新中手动实现，可以通过自定义注解来实现。

## 设计思路

1. 利用注解标明需要加密解密的entity类对象以及其中的数据

2. mybatis拦截Executor.class对象中的query,update方法

3. 在方法执行前对parameter进行加密解密，在拦截器执行后，解密返回的结果

# mybatis plugin 流程

MyBatis插件（Plugin）机制允许开发人员在MyBatis的执行过程中拦截和修改核心功能，以扩展框架的功能或添加自定义行为。

插件可以用于在SQL语句执行前后进行拦截、参数处理、结果处理等操作。

下面是MyBatis插件的原理和工作流程：

1. 创建插件类：开发人员需要实现`Interceptor`接口，这是插件的核心接口。插件类必须实现`intercept()`方法，用于定义自定义逻辑的执行，以及`plugin()`方法，用于创建目标对象的代理。

2. 创建拦截器链：在插件类中，可以通过`Plugin`类的`wrap()`静态方法创建一个拦截器链。这个方法接受三个参数：目标对象（即被拦截的对象），拦截器对象和配置参数。它会将目标对象和拦截器对象一起包装成一个代理对象。

3. 配置插件：在MyBatis的配置文件中，需要配置插件。可以使用`<plugins>`标签将插件类配置为MyBatis的插件。在配置插件时，可以指定插件的执行顺序。

4. 拦截过程：当MyBatis执行SQL语句时，插件会拦截相关的方法调用。在拦截过程中，插件可以根据自己的逻辑在目标方法执行前后进行处理，甚至可以替换原始的SQL语句、参数或结果。

5. 代理对象的创建：通过代理对象，插件可以修改或增强目标方法的行为。代理对象会拦截目标方法的调用，并将控制权交给拦截器链。

6. 插件执行顺序：如果配置了多个插件，它们会按照在配置文件中定义的顺序执行。每个插件可以选择在目标方法的前后执行自己的逻辑。

通过插件机制，开发人员可以在MyBatis的执行过程中进行灵活的拦截和修改，实现一些自定义的功能，例如性能监控、日志记录、缓存扩展等。

这种可插拔的机制使得MyBatis具有很高的扩展性和灵活性，能够满足各种特定的需求。

# 加解密拦截器源码

## 自定义注解

可以分为两类，加密+解密。

为了快速定位对象，可以允许注解在类和字段上使用。只有当类上有这个注解的时候，才会去处理每一个字段。

加密：对称，非对称。用户可以指定加密算法。`@Encode`，

解密：对称解密。如果是密码这种，可以直接返回密文。(仅限于登录验证等) `@Decode`

## 代码实现

```java
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Properties;

/**
 * 统一加解密
 * 查询，入参需要加密的进行加密，取出的列表字段，需要解密的字段进行解密；
 * 新增，更新的数据，对需要加密的数据进行加密
 */
@Intercepts({
        @Signature(type = Executor.class, method = "update", args = {MappedStatement.class,
                Object.class}),
        @Signature(type = Executor.class, method = "query", args = {MappedStatement.class,
                Object.class,
                RowBounds.class,
                ResultHandler.class})})
@Component
public class EncodeInterceptor implements Interceptor {

    private static final String QUERY = "query";

    private static final String UPDATE = "update";

    /**
     * 拦截处理
     *
     * @see Interceptor#intercept(Invocation)
     */
    @Override
    @SuppressWarnings("unchecked")
    public Object intercept(Invocation invocation) throws Throwable {
        Object result = null;
        String methodName = invocation.getMethod().getName();

        // 最外层统一添加异常处理，防止未考虑到的问题
        try {
            if (QUERY.equals(methodName)) {
                Invocation newInvocation = decodeParameter(invocation);
                // 对查询后的结果集进行解密，返回单条记录也属于ArrayList,循环一次
                // 执行请求方法，并将所得结果保存到result中
                result = newInvocation.proceed();
                if (result instanceof ArrayList) {
                    ArrayList<Object> resultNew = (ArrayList<Object>) result;
                    for (int i = 0; i < resultNew.size(); i++) {
                        resultNew.set(i, decodeClass(resultNew.get(i)));
                    }
                    return resultNew;
                }
            } else if (UPDATE.equals(methodName)) {
                Invocation newInvocation = encryptParameter(invocation);
                result = newInvocation.proceed();
            } else {
                result = invocation.proceed();
            }
        } catch (Exception e) {
            // 输出异常信息，直接不做处理，返回原值。
            result = invocation.proceed();
        }

        return result;
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties arg0) {
    }

    /**
     * 参数加密
     *
     * @param invocation
     * @return
     */
    private Invocation encodeParameter(Invocation invocation) throws Exception {
        Object[] parameters = invocation.getArgs();

        // 第二个参数为业务参数
        Object businessParameter = null;
        if (invocation.getArgs().length > 1) {
            businessParameter = parameters[1];
        } else {
            return invocation;
        }

        if (null == businessParameter) {
            return invocation;
        }

        parameters[1] = encodeClass(businessParameter);

        Invocation newInvocation = new Invocation(invocation.getTarget(), invocation.getMethod(),
                parameters);

        return newInvocation;

    }

    /**
     * 加密实体类参数
     *
     * @param parameter
     * @return
     */
    private Object encodeClass(Object parameter) throws Exception {
        if (!parameter.getClass().isAnnotationPresent(Encode.class)) {
            return parameter;
        }

        Field[] fields = parameter.getClass().getDeclaredFields();
        // 循环匹配待加密的字段
        for (Field field : fields) {
            if (!field.isAnnotationPresent(Encode.class)) {
                continue;
            }
            //将filed的值存入obj上
            field.setAccessible(true);
            Object value = field.get(parameter);
            if (null != value) {
                field.set(parameter, "加密算法"));
            }
        }
        return parameter;
    }

    /**
     * 对对象进行解密.
     *
     * @param result
     * @return
     */
    public Object decodeClass(Object result) throws Exception {
        if (!result.getClass().isAnnotationPresent(Decode.class)) {
            return result;
        }

        Field[] fields = result.getClass().getDeclaredFields();
        // 循环匹配待加密的字段
        for (Field field : fields) {
            if (!field.isAnnotationPresent(Decode.class)) {
                continue;
            }
            //将filed的值存入obj上
            field.setAccessible(true);
            Object value = field.get(result);
            if (null != value) {
                field.set(result, "解密算法"));
            }
        }
        return result;
    }

}
```

# Mybatis Interceptor 拦截器原理

Mybatis采用责任链模式，通过动态代理组织多个拦截器（插件），通过这些拦截器可以改变Mybatis的默认行为（诸如SQL重写之类的），由于插件会深入到Mybatis的核心，因此在编写自己的插件前最好了解下它的原理，以便写出安全高效的插件。


## 代理链的生成

Mybatis支持对Executor、StatementHandler、PameterHandler和ResultSetHandler进行拦截，也就是说会对这4种对象进行代理。

通过查看Configuration类的源代码我们可以看到，每次都对目标对象进行代理链的生成。

### ParameterHandler

参数拦截器

```java
public ParameterHandler newParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    ParameterHandler parameterHandler = mappedStatement.getLang().createParameterHandler(mappedStatement, parameterObject, boundSql);
    parameterHandler = (ParameterHandler) interceptorChain.pluginAll(parameterHandler);
    return parameterHandler;
}
```

### ResultSetHandler

结果集拦截器

```java
public ResultSetHandler newResultSetHandler(Executor executor, MappedStatement mappedStatement, RowBounds rowBounds, ParameterHandler parameterHandler,
      ResultHandler resultHandler, BoundSql boundSql) {
    ResultSetHandler resultSetHandler = new DefaultResultSetHandler(executor, mappedStatement, parameterHandler, resultHandler, boundSql, rowBounds);
    resultSetHandler = (ResultSetHandler) interceptorChain.pluginAll(resultSetHandler);
    return resultSetHandler;
}
```

### StatementHandler

语句拦截器

```java
public StatementHandler newStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
    StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);
    statementHandler = (StatementHandler) interceptorChain.pluginAll(statementHandler);
    return statementHandler;
}
```

### Executor

执行器拦截器

```java
public Executor newExecutor(Transaction transaction, ExecutorType executorType, boolean autoCommit) {
    executorType = executorType == null ? defaultExecutorType : executorType;
    executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
    Executor executor;
    if (ExecutorType.BATCH == executorType) {
      executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
      executor = new ReuseExecutor(this, transaction);
    } else {
      executor = new SimpleExecutor(this, transaction);
    }
    if (cacheEnabled) {
      executor = new CachingExecutor(executor, autoCommit);
    }
    executor = (Executor) interceptorChain.pluginAll(executor);
    return executor;
}
```

## Mybatis的拦截器实现原理

接下来让我们通过分析源代码的方式来解读Mybatis的拦截器实现原理

对于拦截器Mybatis为我们提供了一个Interceptor接口，通过实现该接口就可以定义我们自己的拦截器。我们先来看一下这个接口的定义：

### Interceptor

```java
package org.apache.ibatis.plugin;

import java.util.Properties;

public interface Interceptor {

  Object intercept(Invocation invocation) throws Throwable;

  Object plugin(Object target);

  void setProperties(Properties properties);

}
```

我们可以看到在该接口中一共定义有三个方法，intercept、plugin和setProperties。

plugin方法是拦截器用于封装目标对象的，通过该方法我们可以返回目标对象本身，也可以返回一个它的代理。当返回的是代理的时候我们可以对其中的方法进行拦截来调用intercept方法，当然也可以调用其他方法，这点将在后文讲解。

setProperties方法是用于在Mybatis配置文件中指定一些属性的。

定义自己的Interceptor最重要的是要实现plugin方法和intercept方法，在plugin方法中我们可以决定是否要进行拦截进而决定要返回一个什么样的目标对象。而intercept方法就是要进行拦截的时候要执行的方法。


## plugin 的源码

对于plugin方法而言，其实Mybatis已经为我们提供了一个实现。

Mybatis中有一个叫做Plugin的类，里面有一个静态方法wrap(Object target,Interceptor interceptor)，通过该方法可以决定要返回的对象是目标对象还是对应的代理。

这里我们先来看一下Plugin的源码：

```java
package org.apache.ibatis.plugin;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.ibatis.reflection.ExceptionUtil;

//这个类是Mybatis拦截器的核心,大家可以看到该类继承了InvocationHandler
//又是JDK动态代理机制
public class Plugin implements InvocationHandler {

  //目标对象
  private Object target;
  //拦截器
  private Interceptor interceptor;
  //记录需要被拦截的类与方法
  private Map<Class<?>, Set<Method>> signatureMap;

  private Plugin(Object target, Interceptor interceptor, Map<Class<?>, Set<Method>> signatureMap) {
    this.target = target;
    this.interceptor = interceptor;
    this.signatureMap = signatureMap;
  }

  //一个静态方法,对一个目标对象进行包装，生成代理类。
  public static Object wrap(Object target, Interceptor interceptor) {
    //首先根据interceptor上面定义的注解 获取需要拦截的信息
    Map<Class<?>, Set<Method>> signatureMap = getSignatureMap(interceptor);
    //目标对象的Class
    Class<?> type = target.getClass();
    //返回需要拦截的接口信息
    Class<?>[] interfaces = getAllInterfaces(type, signatureMap);
    //如果长度为>0 则返回代理类 否则不做处理
    if (interfaces.length > 0) {
      return Proxy.newProxyInstance(
          type.getClassLoader(),
          interfaces,
          new Plugin(target, interceptor, signatureMap));
    }
    return target;
  }

  //代理对象每次调用的方法
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      //通过method参数定义的类 去signatureMap当中查询需要拦截的方法集合
      Set<Method> methods = signatureMap.get(method.getDeclaringClass());
      //判断是否需要拦截
      if (methods != null && methods.contains(method)) {
        return interceptor.intercept(new Invocation(target, method, args));
      }
      //不拦截 直接通过目标对象调用方法
      return method.invoke(target, args);
    } catch (Exception e) {
      throw ExceptionUtil.unwrapThrowable(e);
    }
  }

  //根据拦截器接口（Interceptor）实现类上面的注解获取相关信息
  private static Map<Class<?>, Set<Method>> getSignatureMap(Interceptor interceptor) {
    //获取注解信息
    Intercepts interceptsAnnotation = interceptor.getClass().getAnnotation(Intercepts.class);
    //为空则抛出异常
    if (interceptsAnnotation == null) { // issue #251
      throw new PluginException("No @Intercepts annotation was found in interceptor " + interceptor.getClass().getName());      
    }
    //获得Signature注解信息
    Signature[] sigs = interceptsAnnotation.value();
    Map<Class<?>, Set<Method>> signatureMap = new HashMap<Class<?>, Set<Method>>();
    //循环注解信息
    for (Signature sig : sigs) {
      //根据Signature注解定义的type信息去signatureMap当中查询需要拦截方法的集合
      Set<Method> methods = signatureMap.get(sig.type());
      //第一次肯定为null 就创建一个并放入signatureMap
      if (methods == null) {
        methods = new HashSet<Method>();
        signatureMap.put(sig.type(), methods);
      }
      try {
        //找到sig.type当中定义的方法 并加入到集合
        Method method = sig.type().getMethod(sig.method(), sig.args());
        methods.add(method);
      } catch (NoSuchMethodException e) {
        throw new PluginException("Could not find method on " + sig.type() + " named " + sig.method() + ". Cause: " + e, e);
      }
    }
    return signatureMap;
  }

  //根据对象类型与signatureMap获取接口信息
  private static Class<?>[] getAllInterfaces(Class<?> type, Map<Class<?>, Set<Method>> signatureMap) {
    Set<Class<?>> interfaces = new HashSet<Class<?>>();
    //循环type类型的接口信息 如果该类型存在与signatureMap当中则加入到set当中去
    while (type != null) {
      for (Class<?> c : type.getInterfaces()) {
        if (signatureMap.containsKey(c)) {
          interfaces.add(c);
        }
      }
      type = type.getSuperclass();
    }
    //转换为数组返回
    return interfaces.toArray(new Class<?>[interfaces.size()]);
  }

}
```

# 执行脚本拦截器

```java
import java.lang.reflect.Field;
import java.sql.Statement;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.defaults.DefaultSqlSession.StrictMap;

@Intercepts(value = {
        @Signature(args = { Statement.class, ResultHandler.class }, method = "query", type = StatementHandler.class),
        @Signature(args = { Statement.class }, method = "update", type = StatementHandler.class),
        @Signature(args = { Statement.class }, method = "batch", type = StatementHandler.class) })
public class SqlCostInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();

        long startTime = System.currentTimeMillis();
        StatementHandler statementHandler = (StatementHandler) target;
        try {
            return invocation.proceed();
        } finally {
            long endTime = System.currentTimeMillis();
            long sqlCost = endTime - startTime;
            BoundSql boundSql = statementHandler.getBoundSql();
            String sql = boundSql.getSql();
            Object parameterObject = boundSql.getParameterObject();
            List<ParameterMapping> parameterMappingList = boundSql.getParameterMappings();

            // 格式化Sql语句，去除换行符，替换参数
            sql = formatSql(sql, parameterObject, parameterMappingList);

            System.out.println("SQL：[" + sql + "]执行耗时[" + sqlCost + "ms]");

        }
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {

    }

    private String formatSql(String sql, Object parameterObject, List<ParameterMapping> parameterMappingList) {
        // 输入判断是否为空
        if (sql == "" || sql.length() == 0) {
            return "";
        }
        // 美化sql
        sql = beautifySql(sql);

        // 不传参数的场景，直接把Sql美化一下返回出去
        if (parameterObject == null || parameterMappingList == null || parameterMappingList.size() == 0) {
            return sql;
        }

        // 定义一个没有替换过占位符的sql，用于出异常时返回
        String sqlWithoutReplacePlaceholder = sql;
        try {
            if (parameterMappingList != null) {
                Class<?> parameterObjectClass = parameterObject.getClass();

                // 如果参数是StrictMap且Value类型为Collection，获取key="list"的属性，这里主要是为了处理<foreach>循环时传入List这种参数的占位符替换
                // 例如select * from xxx where id in <foreach
                // collection="list">...</foreach>
                if (isStrictMap(parameterObjectClass)) {
                    StrictMap<Collection<?>> strictMap = (StrictMap<Collection<?>>) parameterObject;

                    if (isList(strictMap.get("list").getClass())) {
                        sql = handleListParameter(sql, strictMap.get("list"));
                    }
                } else if (isMap(parameterObjectClass)) {
                    // 如果参数是Map则直接强转，通过map.get(key)方法获取真正的属性值
                    // 这里主要是为了处理<insert>、<delete>、<update>、<select>时传入parameterType为map的场景
                    Map<?, ?> paramMap = (Map<?, ?>) parameterObject;
                    sql = handleMapParameter(sql, paramMap, parameterMappingList);
                } else {
                    // 通用场景，比如传的是一个自定义的对象或者八种基本数据类型之一或者String
                    sql = handleCommonParameter(sql, parameterMappingList, parameterObjectClass, parameterObject);
                }
            }
        } catch (Exception e) {
            // 占位符替换过程中出现异常，则返回没有替换过占位符但是格式美化过的sql，这样至少保证sql语句比BoundSql中的sql更好看
            return sqlWithoutReplacePlaceholder;
        }

        return sql;
    }

    /**
     * 处理通用场景
     * 
     * @throws SecurityException
     * @throws NoSuchFieldException
     * @throws IllegalAccessException
     * @throws IllegalArgumentException
     */
    private String handleCommonParameter(String sql, List<ParameterMapping> parameterMappingList,
            Class<?> parameterObjectClass, Object parameterObject) throws Exception {
        for (ParameterMapping parameterMapping : parameterMappingList) {
            String propertyValue = null;
            // 基本数据类型或者基本数据类型的包装类，直接toString即可获取其真正的参数值，其余直接取paramterMapping中的property属性即可
            if (isPrimitiveOrPrimitiveWrapper(parameterObjectClass)) {
                propertyValue = parameterObject.toString();
            } else {
                String propertyName = parameterMapping.getProperty();

                Field field = parameterObjectClass.getDeclaredField(propertyName);
                // 要获取Field中的属性值，这里必须将私有属性的accessible设置为true
                field.setAccessible(true);
                propertyValue = String.valueOf(field.get(parameterObject));
                if (parameterMapping.getJavaType().isAssignableFrom(String.class)) {
                    propertyValue = "\"" + propertyValue + "\"";
                }
            }

            sql = sql.replaceFirst("\\?", propertyValue);
        }

        return sql;
    }

    /**
     * 处理Map场景
     */
    private String handleMapParameter(String sql, Map<?, ?> paramMap, List<ParameterMapping> parameterMappingList) {
        for (ParameterMapping parameterMapping : parameterMappingList) {
            Object propertyName = parameterMapping.getProperty();
            Object propertyValue = paramMap.get(propertyName);
            if (propertyValue != null) {
                if (propertyValue.getClass().isAssignableFrom(String.class)) {
                    propertyValue = "\"" + propertyValue + "\"";
                }

                sql = sql.replaceFirst("\\?", propertyValue.toString());
            }
        }
        return sql;
    }

    /**
     * @Description: 处理List场景
     * @param sql
     * @param collection
     */
    private String handleListParameter(String sql, Collection<?> col) {
        if (col != null && col.size() != 0) {
            for (Object obj : col) {
                String value = null;
                Class<?> objClass = obj.getClass();

                // 只处理基本数据类型、基本数据类型的包装类、String这三种
                // 如果是复合类型也是可以的，不过复杂点且这种场景较少，写代码的时候要判断一下要拿到的是复合类型中的哪个属性
                if (isPrimitiveOrPrimitiveWrapper(objClass)) {
                    value = obj.toString();
                } else if (objClass.isAssignableFrom(String.class)) {
                    value = "\"" + obj.toString() + "\"";
                }

                sql = sql.replaceFirst("\\?", value);
            }
        }

        return sql;
    }

    private String beautifySql(String sql) {
        // sql = sql.replace("\n", "").replace("\t", "").replace(" ", "
        // ").replace("( ", "(").replace(" )", ")").replace(" ,", ",");
        sql = sql.replaceAll("[\\s\n ]+", " ");
        return sql;
    }

    /**
     * 是否基本数据类型或者基本数据类型的包装类
     */
    private boolean isPrimitiveOrPrimitiveWrapper(Class<?> parameterObjectClass) {
        return parameterObjectClass.isPrimitive() || (parameterObjectClass.isAssignableFrom(Byte.class)
                || parameterObjectClass.isAssignableFrom(Short.class)
                || parameterObjectClass.isAssignableFrom(Integer.class)
                || parameterObjectClass.isAssignableFrom(Long.class)
                || parameterObjectClass.isAssignableFrom(Double.class)
                || parameterObjectClass.isAssignableFrom(Float.class)
                || parameterObjectClass.isAssignableFrom(Character.class)
                || parameterObjectClass.isAssignableFrom(Boolean.class));
    }

    /**
     * 是否DefaultSqlSession的内部类StrictMap
     */
    private boolean isStrictMap(Class<?> parameterObjectClass) {
        return parameterObjectClass.isAssignableFrom(StrictMap.class);
    }

    /**
     * 是否List的实现类
     */
    private boolean isList(Class<?> clazz) {
        Class<?>[] interfaceClasses = clazz.getInterfaces();
        for (Class<?> interfaceClass : interfaceClasses) {
            if (interfaceClass.isAssignableFrom(List.class)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 是否Map的实现类
     */
    private boolean isMap(Class<?> parameterObjectClass) {
        Class<?>[] interfaceClasses = parameterObjectClass.getInterfaces();
        for (Class<?> interfaceClass : interfaceClasses) {
            if (interfaceClass.isAssignableFrom(Map.class)) {
                return true;
            }
        }

        return false;
    }
}
```

# 注册插件并且使用

下面是 springboot + mybatis 的整合例子：

## 核心配置

```java
@Bean(value = "mySqlSessionFactory")
public SqlSessionFactory mySqlSessionFactory(@Qualifier("myDataSource") DataSource dataSource) throws Exception {
    MybatisSqlSessionFactoryBean sqlSessionFactoryBean = new MybatisSqlSessionFactoryBean();
    sqlSessionFactoryBean.setDataSource(dataSource);
    sqlSessionFactoryBean.setTypeAliasesPackage("com.github.houbb.opensource.server.dal.entity");
    String[] mapperLocations = new String[1];
    mapperLocations[0] = "classpath*:com/github/houbb/opensource/server/dal/mapper/*Mapper.xml";
    sqlSessionFactoryBean.setMapperLocations(resolveMapperLocations(mapperLocations));
    sqlSessionFactoryBean.setPlugins(new Interceptor[]{pageInterceptor});
    sqlSessionFactoryBean.setConfiguration(mybatisConfiguration);
    sqlSessionFactoryBean.setGlobalConfig(globalConfiguration);
    return sqlSessionFactoryBean.getObject();
}
```

## 完整配置

完整配置如下：

```java
package com.github.houbb.opensource.server.dal.config;


import com.baomidou.mybatisplus.MybatisConfiguration;
import com.baomidou.mybatisplus.entity.GlobalConfiguration;
import com.baomidou.mybatisplus.plugins.PaginationInterceptor;
import com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 数据源相关配置
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@Configuration
@Import({Datasource.class})
@EnableTransactionManagement
@MapperScan(basePackages = {"com.github.houbb.opensource.server.dal.mapper"},
        sqlSessionTemplateRef = "mySqlSessionTemplate")
public class DatasourceConfig {

    @Autowired
    @Qualifier("myPageInterceptor")
    private PaginationInterceptor pageInterceptor;

    @Autowired
    @Qualifier("myGlobalConfiguration")
    private GlobalConfiguration globalConfiguration;

    @Autowired
    @Qualifier("myMybatisConfiguration")
    private MybatisConfiguration mybatisConfiguration;

    @Bean(value = "mySqlSessionTemplate")
    public SqlSessionTemplate sqlSessionTemplate(@Qualifier("mySqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean(value = "mySqlSessionFactory")
    public SqlSessionFactory mySqlSessionFactory(@Qualifier("myDataSource") DataSource dataSource) throws Exception {
        MybatisSqlSessionFactoryBean sqlSessionFactoryBean = new MybatisSqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setTypeAliasesPackage("com.github.houbb.opensource.server.dal.entity");
        String[] mapperLocations = new String[1];
        mapperLocations[0] = "classpath*:com/github/houbb/opensource/server/dal/mapper/*Mapper.xml";
        sqlSessionFactoryBean.setMapperLocations(resolveMapperLocations(mapperLocations));
        sqlSessionFactoryBean.setPlugins(new Interceptor[]{pageInterceptor});
        sqlSessionFactoryBean.setConfiguration(mybatisConfiguration);
        sqlSessionFactoryBean.setGlobalConfig(globalConfiguration);
        return sqlSessionFactoryBean.getObject();
    }

    @Bean(value = "myTransactionTemplate")
    public TransactionTemplate transactionTemplate(@Qualifier("myTransactionManager") PlatformTransactionManager transactionManager) {
        TransactionTemplate transactionTemplate = new TransactionTemplate();
        transactionTemplate.setTransactionManager(transactionManager);
        return transactionTemplate;
    }

    @Bean(value = "myTransactionManager")
    @Primary
    public DataSourceTransactionManager myTransactionManager(@Qualifier("myDataSource") DataSource dataSource) {
        DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
        dataSourceTransactionManager.setDataSource(dataSource);
        return dataSourceTransactionManager;
    }

    /**
     * 解析 mapper 位置
     * @param mapperLocations 位置
     * @return 结果
     * @since 1.0.0
     */
    private Resource[] resolveMapperLocations(String[] mapperLocations) {
        ResourcePatternResolver resourceResolver = new PathMatchingResourcePatternResolver();
        List<Resource> resources = new ArrayList<>();
        if (mapperLocations != null) {
            for (String mapperLocation : mapperLocations) {
                try {
                    Resource[] mappers = resourceResolver.getResources(mapperLocation);
                    resources.addAll(Arrays.asList(mappers));
                } catch (IOException e) {
                    // ignore
                }
            }
        }
        return resources.toArray(new Resource[resources.size()]);
    }

}
```

# 总结

mybatis 这种责任链和允许用户自定义注解的设计非常不错。

实现自己的插件，比如分页插件，要开源分享。因为你写的代码全是 BUG，不分享你以为自己的代码是无懈可击的。

要学会偷懒，不要这么勤快的去写代码。能使用插件的事情，坚决不用代码。

一次搞定，以后全部省时省力。

# TODO

自己开源实现一个 myabtis 的加密解密插件。

# 参考资料

https://pagehelper.github.io

[mybatis拦截器处理敏感字段](https://blog.csdn.net/alleged/article/details/83313875)

[Mybatis Interceptor 拦截器原理 源码分析](http://www.cnblogs.com/daxin/p/3541922.html)

- 打印每一条执行语句及其执行时间

https://www.cnblogs.com/xrq730/p/6972268.html

https://www.jianshu.com/p/48b8530a4c0a

* any list
{:toc}