---
layout: post
title:  mybatis 与 spring 整合实现原理
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 前言

很多人都是用 spring 整合 mybatis，但是对于其实现原理很少做探究。

本文一起来学习一下 mybatis 整合 spring 的原理。

长文预警：本文内容较多，建议收藏后再看。

自己关注的公众号讲技术的越来越少，讲解底层原理的更少，但是个人还是希望可以看到一点真正有价值的东西。这篇文章就是简单粗暴的源码阅读，也不再做内容拆分。

我写的技术博客，因为能力有限，大部分觉得挺枯燥的，但是技术原理本身往往是枯燥的，乐趣应该来自于对于技术的运用。

本次以 mybatis-spring v1.3.1 版本为例，简单的看一下源码实现。主要是对于实现流程的梳理，引导如何阅读源码，方法比内容更加重要，愿你有所收获。

闲话休说，上代码！

## 带着问题学习

SqlSessionFactory，SqlSession 如何生成?

Mapper 代理如何生成？如何运行？

# 配置示例

为了便于大家理解，此处给出一个配置的例子作为参考。

## MainDataSourceConfig.java

```java
import com.alibaba.druid.pool.DruidDataSource;
import com.baomidou.mybatisplus.plugins.PaginationInterceptor;
import com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan(basePackages = "dal.mapper.main", sqlSessionFactoryRef = "mainSqlSessionFactory")
public class MainDataSourceConfig {

    @Bean("mainSqlSessionTemplate")
    public SqlSessionTemplate mainSqlSessionTemplate(
            @Qualifier("mainSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean("mainSqlSessionFactory")
    @Primary
    public SqlSessionFactory sqlSessionFactory(@Qualifier("mainDataSource") DataSource dataSource,@Qualifier("mainPaginationInterceptor") PaginationInterceptor paginationInterceptor) throws Exception {
        MybatisSqlSessionFactoryBean sqlSessionFactoryBean = new MybatisSqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:dal/mapper/main/*.xml"));
        Interceptor[] plugins = new Interceptor[]{paginationInterceptor};
        sqlSessionFactoryBean.setPlugins(plugins);
        return sqlSessionFactoryBean.getObject();
    }
    @Bean("mainPaginationInterceptor")
    public PaginationInterceptor paginationInterceptor() {
        return new PaginationInterceptor();
    }

    @Bean("mainDataSource")
    public DataSource mainDataSource() {
        DruidDataSource druidDataSource = new DruidDataSource();
        druidDataSource.setDriverClassName("oracle.jdbc.driver.OracleDriver");
        druidDataSource.setUrl("jdbc:oracle:thin:@//ip:port/db");
        druidDataSource.setUsername("name");
        druidDataSource.setPassword("password");
        return druidDataSource;
    }

}
```

## mybatis 与 mybatis-plus 的配置差异

这里是 mybatis-plus 的配置示例，mybatis 差别不大。主要是在配置中，将 `MybatisSqlSessionFactoryBean` 替换为 `SqlSessionFactoryBean`。

```java
@Bean(name = "sqlSessionFactory")
public SqlSessionFactory sqlSessionFactoryBean() {
  SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
  bean.setDataSource(dataSource());
  bean.setTypeAliasesPackage(TYPE_ALIASES_PACKAGE);
  // 添加插件
  bean.setPlugins(MybatisUtil.getInterceptor());
  // 添加XML目录
  ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
  bean.setMapperLocations(resolver.getResources("classpath:mapper/*.xml"));
  return bean.getObject();
}
```

# SqlSessionFactory 是如何生成的？

SqlSessionFactory 这个方法中，我们设置了数据源，实体别名，插件，mapper 位置等等。

最后通过 sqlSessionFactoryBean.getObject() 获取。让我们一起来探究一下源码。

## 接口实现

```java
public class SqlSessionFactoryBean implements FactoryBean<SqlSessionFactory>, InitializingBean, ApplicationListener<ApplicationEvent> 
```

其中 getObject() 就是对应的 FactoryBean.getObject() 的实现。

## 基本属性

一些基本属性，和上面看到的指定配置都是对应的。

这些类在前面 mybatis 手动实现中都提到过。

```java
private Resource configLocation;
private Configuration configuration; //mybatis 配置
private Resource[] mapperLocations; //mapper 文件的位置
private DataSource dataSource; // 数据源信息
private TransactionFactory transactionFactory;
private Properties configurationProperties;
private SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
private SqlSessionFactory sqlSessionFactory;
//EnvironmentAware requires spring 3.1
private String environment = SqlSessionFactoryBean.class.getSimpleName();
private boolean failFast;
private Interceptor[] plugins;  //插件信息
private TypeHandler<?>[] typeHandlers; //类型处理器
private String typeHandlersPackage;
private Class<?>[] typeAliases; //别名类
private String typeAliasesPackage;
private Class<?> typeAliasesSuperType;
//issue #19. No default provider.
private DatabaseIdProvider databaseIdProvider;
private Class<? extends VFS> vfs;
private Cache cache;
private ObjectFactory objectFactory;  //对象工厂
private ObjectWrapperFactory objectWrapperFactory;
```

我们来看一看重头戏，getObject() 是如何实现的。

## getObject() 

- getObject()

```java
@Override
public SqlSessionFactory getObject() throws Exception {
  if (this.sqlSessionFactory == null) {
    afterPropertiesSet();
  }
  return this.sqlSessionFactory;
}
```

这里调用了 afterPropertiesSet()，这个方法会在 spring 的配置初始化完成之后，实现我们自己的处理。

- afterPropertiesSet()

```java
@Override
public void afterPropertiesSet() throws Exception {
  notNull(dataSource, "Property 'dataSource' is required");
  notNull(sqlSessionFactoryBuilder, "Property 'sqlSessionFactoryBuilder' is required");
  state((configuration == null && configLocation == null) || !(configuration != null && configLocation != null),
            "Property 'configuration' and 'configLocation' can not specified with together");
  this.sqlSessionFactory = buildSqlSessionFactory();
}
```

前面几句都是一些参数和状态的校验，我们看一下 buildSqlSessionFactory() 实现。

- buildSqlSessionFactory() 源码

这部分源码比较多，但是实际上做的事情还是比较简单的。

1. 主要是构建 Configuration 中的各种配置，变量、ObjectFactory、别名、插件、类型转换处理器、databaseIdProvider、cache 等

2. transactionFactory 事务管理器默认使用 spring 的事务管理器；设置环境信息。

3. 对于 mapper 进行解析处理。

```java
/**
 * Build a {@code SqlSessionFactory} instance.
 *
 * The default implementation uses the standard MyBatis {@code XMLConfigBuilder} API to build a
 * {@code SqlSessionFactory} instance based on an Reader.
 * Since 1.3.0, it can be specified a {@link Configuration} instance directly(without config file).
 *
 * @return SqlSessionFactory
 * @throws IOException if loading the config file failed
 */
protected SqlSessionFactory buildSqlSessionFactory() throws IOException {
  Configuration configuration;
  XMLConfigBuilder xmlConfigBuilder = null;
  if (this.configuration != null) {
    configuration = this.configuration;
    if (configuration.getVariables() == null) {
      configuration.setVariables(this.configurationProperties);
    } else if (this.configurationProperties != null) {
      configuration.getVariables().putAll(this.configurationProperties);
    }
  } else if (this.configLocation != null) {
    xmlConfigBuilder = new XMLConfigBuilder(this.configLocation.getInputStream(), null, this.configurationProperties);
    configuration = xmlConfigBuilder.getConfiguration();
  } else {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Property 'configuration' or 'configLocation' not specified, using default MyBatis Configuration");
    }
    configuration = new Configuration();
    if (this.configurationProperties != null) {
      configuration.setVariables(this.configurationProperties);
    }
  }
  if (this.objectFactory != null) {
    configuration.setObjectFactory(this.objectFactory);
  }
  if (this.objectWrapperFactory != null) {
    configuration.setObjectWrapperFactory(this.objectWrapperFactory);
  }
  if (this.vfs != null) {
    configuration.setVfsImpl(this.vfs);
  }
  if (hasLength(this.typeAliasesPackage)) {
    String[] typeAliasPackageArray = tokenizeToStringArray(this.typeAliasesPackage,
        ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS);
    for (String packageToScan : typeAliasPackageArray) {
      configuration.getTypeAliasRegistry().registerAliases(packageToScan,
              typeAliasesSuperType == null ? Object.class : typeAliasesSuperType);
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Scanned package: '" + packageToScan + "' for aliases");
      }
    }
  }
  if (!isEmpty(this.typeAliases)) {
    for (Class<?> typeAlias : this.typeAliases) {
      configuration.getTypeAliasRegistry().registerAlias(typeAlias);
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Registered type alias: '" + typeAlias + "'");
      }
    }
  }
  if (!isEmpty(this.plugins)) {
    for (Interceptor plugin : this.plugins) {
      configuration.addInterceptor(plugin);
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Registered plugin: '" + plugin + "'");
      }
    }
  }
  if (hasLength(this.typeHandlersPackage)) {
    String[] typeHandlersPackageArray = tokenizeToStringArray(this.typeHandlersPackage,
        ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS);
    for (String packageToScan : typeHandlersPackageArray) {
      configuration.getTypeHandlerRegistry().register(packageToScan);
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Scanned package: '" + packageToScan + "' for type handlers");
      }
    }
  }
  if (!isEmpty(this.typeHandlers)) {
    for (TypeHandler<?> typeHandler : this.typeHandlers) {
      configuration.getTypeHandlerRegistry().register(typeHandler);
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Registered type handler: '" + typeHandler + "'");
      }
    }
  }
  if (this.databaseIdProvider != null) {//fix #64 set databaseId before parse mapper xmls
    try {
      configuration.setDatabaseId(this.databaseIdProvider.getDatabaseId(this.dataSource));
    } catch (SQLException e) {
      throw new NestedIOException("Failed getting a databaseId", e);
    }
  }
  if (this.cache != null) {
    configuration.addCache(this.cache);
  }
  if (xmlConfigBuilder != null) {
    try {
      xmlConfigBuilder.parse();
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Parsed configuration file: '" + this.configLocation + "'");
      }
    } catch (Exception ex) {
      throw new NestedIOException("Failed to parse config resource: " + this.configLocation, ex);
    } finally {
      ErrorContext.instance().reset();
    }
  }
  if (this.transactionFactory == null) {
    this.transactionFactory = new SpringManagedTransactionFactory();
  }
  configuration.setEnvironment(new Environment(this.environment, this.transactionFactory, this.dataSource));
  if (!isEmpty(this.mapperLocations)) {
    for (Resource mapperLocation : this.mapperLocations) {
      if (mapperLocation == null) {
        continue;
      }
      try {
        XMLMapperBuilder xmlMapperBuilder = new XMLMapperBuilder(mapperLocation.getInputStream(),
            configuration, mapperLocation.toString(), configuration.getSqlFragments());
        xmlMapperBuilder.parse();
      } catch (Exception e) {
        throw new NestedIOException("Failed to parse mapping resource: '" + mapperLocation + "'", e);
      } finally {
        ErrorContext.instance().reset();
      }
      if (LOGGER.isDebugEnabled()) {
        LOGGER.debug("Parsed mapper file: '" + mapperLocation + "'");
      }
    }
  } else {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Property 'mapperLocations' was not specified or no matching resources found");
    }
  }
  return this.sqlSessionFactoryBuilder.build(configuration);
}
```

## SqlSessionFactoryBuilder 的实现

这里默认使用的是：

```java
public SqlSessionFactory build(Configuration config) {
    return new DefaultSqlSessionFactory(config);
}
```

所以实现的原理和 mybatis 就是一样了，此处不再深入。

# SqlSession 如何获取

当我们拿到 SqlSessionFactory 之后，自然就可以创建 SqlSession 了。

SqlSessionTemplate 这个类就是 spring 与 mybatis 的一座桥梁。

## SqlSessionTemplate 配置

回想一下我们的配置如下：

```java
@Bean("mainSqlSessionTemplate")
public SqlSessionTemplate mainSqlSessionTemplate(
        @Qualifier("mainSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
    return new SqlSessionTemplate(sqlSessionFactory);
}
```

当然这个属性时机可以不做配置，文章后面会讲解。

我们先看一下这个实现。

## 接口

```java
public class SqlSessionTemplate implements SqlSession, DisposableBean
```

这里就实现了 mybatis 中的 SqlSession 接口。

至于 DisposableBean 接口，则是 spring 框架中的，用于对于 bean 的销毁生命周期维护。

```java
public interface DisposableBean {
    void destroy() throws Exception;
}
```

## 基本属性

```java
private final SqlSessionFactory sqlSessionFactory;
private final ExecutorType executorType;
private final SqlSession sqlSessionProxy;
private final PersistenceExceptionTranslator exceptionTranslator;
```

## 构造器

我们配置中，直接使用了 SqlSessionFactory 进行对象创建。

```java
/**
 * Constructs a Spring managed SqlSession with the {@code SqlSessionFactory}
 * provided as an argument.
 *
 * @param sqlSessionFactory
 */
public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
  this(sqlSessionFactory, sqlSessionFactory.getConfiguration().getDefaultExecutorType());
}
```

对应实现：

```java
/**
 * Constructs a Spring managed SqlSession with the {@code SqlSessionFactory}
 * provided as an argument and the given {@code ExecutorType}
 * {@code ExecutorType} cannot be changed once the {@code SqlSessionTemplate}
 * is constructed.
 *
 * @param sqlSessionFactory
 * @param executorType
 */
public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory, ExecutorType executorType) {
  this(sqlSessionFactory, executorType,
      new MyBatisExceptionTranslator(
          sqlSessionFactory.getConfiguration().getEnvironment().getDataSource(), true));
}
```

实际做的就是对几个基本属性做一下初始化，最后实际的构造器如下：

```java
public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory, ExecutorType executorType,
    PersistenceExceptionTranslator exceptionTranslator) {
  notNull(sqlSessionFactory, "Property 'sqlSessionFactory' is required");
  notNull(executorType, "Property 'executorType' is required");
  this.sqlSessionFactory = sqlSessionFactory;
  this.executorType = executorType;
  this.exceptionTranslator = exceptionTranslator;
  this.sqlSessionProxy = (SqlSession) newProxyInstance(
      SqlSessionFactory.class.getClassLoader(),
      new Class[] { SqlSession.class },
      new SqlSessionInterceptor());
}
```

## SqlSession 方法实现

SqlSessionTemplate 实现了 SqlSession 接口，那么具体实现是怎么样的呢？

实际上所有的实现基本都是下面这个样子：

```java
@Override
public <T> T selectOne(String statement) {
  return this.sqlSessionProxy.<T> selectOne(statement);
}
```

不难发现，主要是基于 sqlSessionProxy 实现的。

而 sqlSessionProxy 在上面的构造器中我们可以看到，是一个 jdk 动态代理。重点在于 SqlSessionInterceptor 这个类。

### SqlSessionInterceptor

作为一个合格的动态代理方法，自然也就实现了 InvocationHandler 接口。

```java
/**
 * Proxy needed to route MyBatis method calls to the proper SqlSession got
 * from Spring's Transaction Manager
 * It also unwraps exceptions thrown by {@code Method#invoke(Object, Object...)} to
 * pass a {@code PersistenceException} to the {@code PersistenceExceptionTranslator}.
 */
private class SqlSessionInterceptor implements InvocationHandler {
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    SqlSession sqlSession = getSqlSession(
        SqlSessionTemplate.this.sqlSessionFactory,
        SqlSessionTemplate.this.executorType,
        SqlSessionTemplate.this.exceptionTranslator);
    try {
      Object result = method.invoke(sqlSession, args);
      if (!isSqlSessionTransactional(sqlSession, SqlSessionTemplate.this.sqlSessionFactory)) {
        // force commit even on non-dirty sessions because some databases require
        // a commit/rollback before calling close()
        sqlSession.commit(true);
      }
      return result;
    } catch (Throwable t) {
      Throwable unwrapped = unwrapThrowable(t);
      if (SqlSessionTemplate.this.exceptionTranslator != null && unwrapped instanceof PersistenceException) {
        // release the connection to avoid a deadlock if the translator is no loaded. See issue #22
        closeSqlSession(sqlSession, SqlSessionTemplate.this.sqlSessionFactory);
        sqlSession = null;
        Throwable translated = SqlSessionTemplate.this.exceptionTranslator.translateExceptionIfPossible((PersistenceException) unwrapped);
        if (translated != null) {
          unwrapped = translated;
        }
      }
      throw unwrapped;
    } finally {
      if (sqlSession != null) {
        closeSqlSession(sqlSession, SqlSessionTemplate.this.sqlSessionFactory);
      }
    }
  }
}
```

（1）getSqlSession 获取 session

这里一开始，通过 SqlSessionUtils 工具类，获取一个 session。

整体而言还是不难的，直接通过 sessionFactory.openSession(executorType) 获取，此处不再展开。

```java
public static SqlSession getSqlSession(SqlSessionFactory sessionFactory, ExecutorType executorType, PersistenceExceptionTranslator exceptionTranslator) {
  notNull(sessionFactory, NO_SQL_SESSION_FACTORY_SPECIFIED);
  notNull(executorType, NO_EXECUTOR_TYPE_SPECIFIED);
  SqlSessionHolder holder = (SqlSessionHolder) TransactionSynchronizationManager.getResource(sessionFactory);
  SqlSession session = sessionHolder(executorType, holder);
  if (session != null) {
    return session;
  }
  if (LOGGER.isDebugEnabled()) {
    LOGGER.debug("Creating a new SqlSession");
  }
  session = sessionFactory.openSession(executorType);
  registerSessionHolder(sessionFactory, executorType, exceptionTranslator, session);
  return session;
}
```

（2）执行原本的方法

此处就是直接反射调用

```java
Object result = method.invoke(sqlSession, args);
```

（3）事务验证

看一下是否有 spring 的事务管理，如果没有，直接 commit。

具体的事务管理，可以参考以前的文章。

> mybatis 事务管理机制详 [https://www.jianshu.com/p/f6ed628b37e6](https://www.jianshu.com/p/f6ed628b37e6)

（4）session 的关闭

作为一个用完就归还资源的好同志，最后需要将打开的 session 进行关闭。

通过 SqlSessionUtils 工具类，关闭一个 session。

```java
public static void closeSqlSession(SqlSession session, SqlSessionFactory sessionFactory) {
  notNull(session, NO_SQL_SESSION_SPECIFIED);
  notNull(sessionFactory, NO_SQL_SESSION_FACTORY_SPECIFIED);
  SqlSessionHolder holder = (SqlSessionHolder) TransactionSynchronizationManager.getResource(sessionFactory);
  if ((holder != null) && (holder.getSqlSession() == session)) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Releasing transactional SqlSession [" + session + "]");
    }
    holder.released();
  } else {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Closing non transactional SqlSession [" + session + "]");
    }
    session.close();
  }
}
```

到这里，我们就解决了开始的 2 个疑问：

1. 如何构建 SqlSessionFactory?

2. 如何获取 sqlSession

下面让我们看一下 mybatis-spring 整合的另一个精华部分，mapper 代理的处理。

# Mapper 代理如何生成？如何运行？

## mybatis 中的 mapper

在以前实现 mybatis 中，我们都知道 mapper 是基于动态代理，让接口和 xml 文件中的 sql 相互对应。

整合 spring 之后，我们只需要下面这样：

```java
@Autowired
private UserMapper userMapper;
```

就可以像其他 ioc 中的 bean 一样，使用 mapper 方法了。

那么，是如何实现的呢？

## 扫描 mapper

配置中有一个扫描的注解：

```java
@MapperScan(basePackages = "dal.mapper.main", sqlSessionFactoryRef = "mainSqlSessionFactory")
```

这个注解告诉 spring 去指定包中扫描 mapper 方法。

我们首先来看一下这个注解的构成。

### 注解定义

朴实无华的注解定义，可以放在类上。

其中的各个参数，便于我们灵活的配置。

这里有一个 `@Import(MapperScannerRegistrar.class)` 属性成功的引起了我的注意，我们一起来看一下里面有什么玄机。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(MapperScannerRegistrar.class)
public @interface MapperScan {

  /**
   * Alias for the {@link #basePackages()} attribute. Allows for more concise
   * annotation declarations e.g.:
   * {@code @EnableMyBatisMapperScanner("org.my.pkg")} instead of {@code
   * @EnableMyBatisMapperScanner(basePackages= "org.my.pkg"})}.
   */
  String[] value() default {};

  /**
   * Base packages to scan for MyBatis interfaces. Note that only interfaces
   * with at least one method will be registered; concrete classes will be
   * ignored.
   */
  String[] basePackages() default {};

  /**
   * Type-safe alternative to {@link #basePackages()} for specifying the packages
   * to scan for annotated components. The package of each class specified will be scanned.
   * <p>Consider creating a special no-op marker class or interface in each package
   * that serves no purpose other than being referenced by this attribute.
   */
  Class<?>[] basePackageClasses() default {};

  /**
   * The {@link BeanNameGenerator} class to be used for naming detected components
   * within the Spring container.
   */
  Class<? extends BeanNameGenerator> nameGenerator() default BeanNameGenerator.class;

  /**
   * This property specifies the annotation that the scanner will search for.
   * <p>
   * The scanner will register all interfaces in the base package that also have
   * the specified annotation.
   * <p>
   * Note this can be combined with markerInterface.
   */
  Class<? extends Annotation> annotationClass() default Annotation.class;

  /**
   * This property specifies the parent that the scanner will search for.
   * <p>
   * The scanner will register all interfaces in the base package that also have
   * the specified interface class as a parent.
   * <p>
   * Note this can be combined with annotationClass.
   */
  Class<?> markerInterface() default Class.class;

  /**
   * Specifies which {@code SqlSessionTemplate} to use in the case that there is
   * more than one in the spring context. Usually this is only needed when you
   * have more than one datasource.
   */
  String sqlSessionTemplateRef() default "";

  /**
   * Specifies which {@code SqlSessionFactory} to use in the case that there is
   * more than one in the spring context. Usually this is only needed when you
   * have more than one datasource.
   */
  String sqlSessionFactoryRef() default "";

  /**
   * Specifies a custom MapperFactoryBean to return a mybatis proxy as spring bean.
   *
   */
  Class<? extends MapperFactoryBean> factoryBean() default MapperFactoryBean.class;

}
```

## MapperScannerRegistrar.java

这个看名字也比较好理解，mapper 扫描的注册类。

### 接口

```java
public class MapperScannerRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware {

    private ResourceLoader resourceLoader;

    // other...

}
```

这两个接口都是 spring 中的，有一个属性  ResourceLoader。

ImportBeanDefinitionRegistrar 接口中的 registerBeanDefinitions 方法比较重要，spring 容器在启动的时候，会调用该防范。

### registerBeanDefinitions 方法

这个内容还是比较多的，不过都看到这里了，无所畏惧。

其实看起来一大堆，但是做的事情还是比较清晰的。

主要是以下几步：

1. 注解元信息的获取

2. 基本属性的设置

3. 构建扫描包信息

4. 注册过滤器

5. 进行包扫描

```java
@Override
public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
  //1. 注解元信息的获取
  AnnotationAttributes annoAttrs = AnnotationAttributes.fromMap(importingClassMetadata.getAnnotationAttributes(MapperScan.class.getName()));

  //2. 基本属性的设置
  ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
  // this check is needed in Spring 3.1
  if (resourceLoader != null) {
    scanner.setResourceLoader(resourceLoader);
  }
  Class<? extends Annotation> annotationClass = annoAttrs.getClass("annotationClass");
  if (!Annotation.class.equals(annotationClass)) {
    scanner.setAnnotationClass(annotationClass);
  }
  Class<?> markerInterface = annoAttrs.getClass("markerInterface");
  if (!Class.class.equals(markerInterface)) {
    scanner.setMarkerInterface(markerInterface);
  }
  Class<? extends BeanNameGenerator> generatorClass = annoAttrs.getClass("nameGenerator");
  if (!BeanNameGenerator.class.equals(generatorClass)) {
    scanner.setBeanNameGenerator(BeanUtils.instantiateClass(generatorClass));
  }
  Class<? extends MapperFactoryBean> mapperFactoryBeanClass = annoAttrs.getClass("factoryBean");
  if (!MapperFactoryBean.class.equals(mapperFactoryBeanClass)) {
    scanner.setMapperFactoryBean(BeanUtils.instantiateClass(mapperFactoryBeanClass));
  }
  scanner.setSqlSessionTemplateBeanName(annoAttrs.getString("sqlSessionTemplateRef"));
  scanner.setSqlSessionFactoryBeanName(annoAttrs.getString("sqlSessionFactoryRef"));

  //3. 构建扫描包信息
  List<String> basePackages = new ArrayList<String>();
  for (String pkg : annoAttrs.getStringArray("value")) {
    if (StringUtils.hasText(pkg)) {
      basePackages.add(pkg);
    }
  }
  for (String pkg : annoAttrs.getStringArray("basePackages")) {
    if (StringUtils.hasText(pkg)) {
      basePackages.add(pkg);
    }
  }
  for (Class<?> clazz : annoAttrs.getClassArray("basePackageClasses")) {
    basePackages.add(ClassUtils.getPackageName(clazz));
  }
  //4. 注册过滤器
  scanner.registerFilters();
  //5. 实现扫描
  scanner.doScan(StringUtils.toStringArray(basePackages));
}
```

最核心的就是最后一个方法，我们来看一下到底是如何实现扫描的。

### doScan 包扫描实现

```java
@Override
public Set<BeanDefinitionHolder> doScan(String... basePackages) {
  // spring 中的扫描方法
  Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);

  if (beanDefinitions.isEmpty()) {
    logger.warn("No MyBatis mapper was found in '" + Arrays.toString(basePackages) + "' package. Please check your configuration.");
  } else {
    processBeanDefinitions(beanDefinitions);
  }
  return beanDefinitions;
}
```

- processBeanDefinitions 实现

我们来看一下这里的 `processBeanDefinitions(beanDefinitions)`，内容也有点多。

该方法会将制定包下的 Mapper 接口改成 mapperFactoryBean 的类型，Spring getBean() 返回的就是 mapperFactoryBean 类型。

循环了扫描到的所有 mapper，主要做了三件事情：

没错，我来鹅城只做三件事！

第一：改写 mapper 类型为 mapperFactoryBean;

第二：添加属性，addToConfig、sqlSessionFactory、sqlSessionTemplate;

第三：设置按照类型进行自动装配。

```java
private void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
  GenericBeanDefinition definition;

  // 1. 循环扫描到的每一个 mapper 
  for (BeanDefinitionHolder holder : beanDefinitions) {
    definition = (GenericBeanDefinition) holder.getBeanDefinition();
    if (logger.isDebugEnabled()) {
      logger.debug("Creating MapperFactoryBean with name '" + holder.getBeanName() 
        + "' and '" + definition.getBeanClassName() + "' mapperInterface");
    }
    // the mapper interface is the original class of the bean
    // but, the actual class of the bean is MapperFactoryBean
    // 2. 这里备注已经写了，原始的类型是 Mapper 接口，但是这里改写成了 mapperFactoryBean
    definition.getConstructorArgumentValues().addGenericArgumentValue(definition.getBeanClassName()); // issue #59
    definition.setBeanClass(this.mapperFactoryBean.getClass());

    //3. 属性添加：addToConfig  sqlSessionFactory sqlSessionTemplate
    definition.getPropertyValues().add("addToConfig", this.addToConfig);
    boolean explicitFactoryUsed = false;
    if (StringUtils.hasText(this.sqlSessionFactoryBeanName)) {
      definition.getPropertyValues().add("sqlSessionFactory", new RuntimeBeanReference(this.sqlSessionFactoryBeanName));
      explicitFactoryUsed = true;
    } else if (this.sqlSessionFactory != null) {
      definition.getPropertyValues().add("sqlSessionFactory", this.sqlSessionFactory);
      explicitFactoryUsed = true;
    }
    if (StringUtils.hasText(this.sqlSessionTemplateBeanName)) {
      if (explicitFactoryUsed) {
        logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
      }
      definition.getPropertyValues().add("sqlSessionTemplate", new RuntimeBeanReference(this.sqlSessionTemplateBeanName));
      explicitFactoryUsed = true;
    } else if (this.sqlSessionTemplate != null) {
      if (explicitFactoryUsed) {
        logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
      }
      definition.getPropertyValues().add("sqlSessionTemplate", this.sqlSessionTemplate);
      explicitFactoryUsed = true;
    }

    //4. 设置自动装配，此处是按照类型。
    if (!explicitFactoryUsed) {
      if (logger.isDebugEnabled()) {
        logger.debug("Enabling autowire by type for MapperFactoryBean with name '" + holder.getBeanName() + "'.");
      }
      definition.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
    }
  }
}
```

## mapperFactoryBean 是什么？

我们做了这么多，构建了一个 mapperFactoryBean，那这个 bean 到底是什么？

这里类是在 mybatis-spring 包中定义的。

### 接口

这里继承了 SqlSessionDaoSupport 类，并且实现了 spring 的 FactoryBean 接口。

```java
public class MapperFactoryBean<T> extends SqlSessionDaoSupport implements FactoryBean<T> {
  private Class<T> mapperInterface;

  private boolean addToConfig = true;

  public MapperFactoryBean() {
    //intentionally empty 
  }
  
  public MapperFactoryBean(Class<T> mapperInterface) {
    this.mapperInterface = mapperInterface;
  }  
}
```

### 获取 mapper 真正的实现

FactoryBean 是 spring 的接口，bean 工厂接口。

主要就是如何获取一个 getObject() 方法。

那么，mybatis-spring 是如何实现的呢？

```java
@Override
public T getObject() throws Exception {
  return getSqlSession().getMapper(this.mapperInterface);
}
```

其实看到这里，就可以和 mybatis 完全连上了。

那么 mapperInterface 是怎么来的？

这个实际上是构造器传入的：

```java
public MapperFactoryBean(Class<T> mapperInterface) {
  this.mapperInterface = mapperInterface;
}  
```

至于这个构造器什么时候被调用的，实际上就是在扫描包的时候设置的。

processBeanDefinitions() 中的这句话：

```java
definition.getConstructorArgumentValues().addGenericArgumentValue(definition.getBeanClassName()); // issue #59
```

读到这里，还是要赞叹一句的，设计的确实比较巧妙。

### SqlSessionDaoSupport 做了什么？

这个类继承了 spring 的 DaoSupport，主要就是处理一下 SqlSession 的构建，以及 getSqlSession() 方法。

接口继承关系如下：

```java
public abstract class SqlSessionDaoSupport extends DaoSupport {
}
```

#### DaoSupport 的实现

这个是 spring 的实现，所以会自动调用 afterPropertiesSet() 方法。

```java
public abstract class DaoSupport implements InitializingBean {

  @Override
	public final void afterPropertiesSet() throws IllegalArgumentException, BeanInitializationException {
		// Let abstract subclasses check their configuration.
		checkDaoConfig();

		// Let concrete implementations initialize themselves.
		try {
			initDao();
		}
		catch (Exception ex) {
			throw new BeanInitializationException("Initialization of DAO failed", ex);
		}
	}

}
```

我们的 MapperFactoryBean 中实际上实现了 checkDaoConfig()，做一下配置的处理：

其实做的事情就是，如果配置了 addToConfig 而且 getConfiguration 没有 mapper 接口信息的配置，就将 mapperInterface  属性设置到 configuration 中。

```java
@Override
protected void checkDaoConfig() {
  super.checkDaoConfig();
  notNull(this.mapperInterface, "Property 'mapperInterface' is required");
  Configuration configuration = getSqlSession().getConfiguration();
  if (this.addToConfig && !configuration.hasMapper(this.mapperInterface)) {
    try {
      configuration.addMapper(this.mapperInterface);
    } catch (Exception e) {
      logger.error("Error while adding the mapper '" + this.mapperInterface + "' to configuration.", e);
      throw new IllegalArgumentException(e);
    } finally {
      ErrorContext.instance().reset();
    }
  }
}
```

#### SqlSessionDaoSupport 的核心代码

其实比较简单，但是非常的重要。

这里有 SqlSessionFactory 和 SqlSessionTemplate 的属性设置，回想起我们扫包的属性设置，其实调用的就是这里。

会从 spring bean 工厂中获取对应的实现，如果没有指定 sqlSessionFactory 其实也可以，实际上会默认帮我们设置一个。

```java
public abstract class SqlSessionDaoSupport extends DaoSupport {

  private SqlSession sqlSession;

  private boolean externalSqlSession;

  public void setSqlSessionFactory(SqlSessionFactory sqlSessionFactory) {
    if (!this.externalSqlSession) {
      this.sqlSession = new SqlSessionTemplate(sqlSessionFactory);
    }
  }

  public void setSqlSessionTemplate(SqlSessionTemplate sqlSessionTemplate) {
    this.sqlSession = sqlSessionTemplate;
    this.externalSqlSession = true;
  }

  /**
   * Users should use this method to get a SqlSession to call its statement methods
   * This is SqlSession is managed by spring. Users should not commit/rollback/close it
   * because it will be automatically done.
   *
   * @return Spring managed thread safe SqlSession
   */
  public SqlSession getSqlSession() {
    return this.sqlSession;
  }

  /**
   * {@inheritDoc}
   */
  @Override
  protected void checkDaoConfig() {
    notNull(this.sqlSession, "Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required");
  }

}
```

看了这里，spring 与 mybatis 整合的核心代码基本已经梳理完了。

我们来做一个整体流程的回顾。

## Mapper 的创建流程

（1）根据 `@MapperScan` 注解，进行指定包的 Mapper 接口扫描。

将所有的 Mapper 接口的 Bean 定义都改成 FactoryBean 的子类 MapperFactoryBean，并将该 SqlSessionFactory 和 SqlSessionTemplate 属性添加到该类中。

（2）IOC 在实例化该 Bean 的时候，需要传入接口类型，并将 SqlSessionFactory 和 SqlSessionTemplate 注入到该 Bean 中。并调用 configuration 的 addMapper 方法，解析配置文件。

（3）当调用 MapperFactoryBean 的 getObject() 方法的时候，事实上是调用 SqSession.getMapper() 方法，而这个方法会返回一个动态代理对象。所有对这个对象的方法调用都是底层的 SqlSession 的方法。

# 小结

其实写到这里，mybatis 系列应该是告一段落了。

springboot 整合的实现并不难，但是可以提供很大的便利性，如果有机会的话，可以开一篇讲解下如何实现 springboot 的自动配置。

这篇文章的篇幅较长，与大师的对话总是这样，漫长无垠，收获颇丰。

如果对你有帮助，也欢迎点个赞，鼓励一下作者。

> 从零实现 mybatis 开源地址：[https://github.com/houbb/mybatis](https://github.com/houbb/mybatis)

# 参考资料

[深入剖析 mybatis 原理（三）如何整合 Spring](https://www.jianshu.com/p/c2b2d6f90ba5)

* any list
{:toc}