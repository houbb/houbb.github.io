---
layout: post
title:  手写 Hibernate ORM 框架 06-spring mybatis 原理
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# spring 整合时做了什么

这篇主要讲一个点，就是我们在结合spring去使用mybatis的时候，spring为我们做了什么事。

还是老套路，我们只讲过程思路，具体细节还望各位小伙伴找时间去研究，如果我全讲了，你们也都看懂了，那你们最多也就是感到一种获得感，而不是成就感，获得感是会随着时间的推移而慢慢减少的，所以我这里主要提供给大家一个思路，然后大家可以顺着这条思路慢慢摸索下去，从而获得成就感！

# spring-mybatis是什么

MyBatis-Spring 会帮助你将 MyBatis 代码无缝地整合到 Spring 中。 

使用这个类库中的类, Spring 将会加载必要的 MyBatis 工厂类和 session 类。 

这个类库也提供一个简单的方式来注入 MyBatis 数据映射器和 SqlSession 到业务层的 bean 中。 

而且它也会处理事务, 翻译 MyBatis 的异常到 Spring 的 DataAccessException 异常(数据访问异常,译者注)中。

最终,它并不会依赖于MyBatis,Spring 或 MyBatis-Spring 来构建应用程序代码。（这是官网解释）

# 基于XML配置和注解形式使用

## a.基于XML配置

一般情况下，我们使用xml的形式引入mybatis，一般的配置如下：

```xml
<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
    <property name="driverClassName" value="${driver}" />
    <property name="url" value="${url}" />
    <property name="username" value="${username}" />
    <property name="password" value="${password}" />
    <!-- 初始化连接大小 --> 
    <property name="initialSize" value="${initialSize}"></property> 
    <!-- 连接池最大数量 --> 
    <property name="maxActive" value="${maxActive}"></property> 
    <!-- 连接池最大空闲 --> 
    <property name="maxIdle" value="${maxIdle}"></property> 
    <!-- 连接池最小空闲 --> 
    <property name="minIdle" value="${minIdle}"></property> 
    <!-- 获取连接最大等待时间 --> 
    <property name="maxWait" value="${maxWait}"></property> 
</bean>

<!-- spring和MyBatis的完美结合，不需要mybatis的配置映射文件 -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <!-- 自动扫描mapping.xml文件 --> 
    <property name="mapperLocations" value="classpath:com/javen/mapping/*.xml"></property> 
</bean>

<!-- DAO接口所在包名，Spring会自动查找其下的类 --> 
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer"> 
    <property name="basePackage" value="com.javen.dao" /> 
    <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property> 
</bean>
```

如上配置所示，我们一般需要声明dataSource、sqlSessionFactory以及MapperScannerConfigurer。

如何我们还有其他mybatis的配置，比如plugin、typehandler等，我们可以另外声明一个mybaits-config.xml文件，在sqlSessionFactory配置中引入即可。

下面对各部分作用总结下。

dataSource：声明一个数据源；

sqlSessionFactory：声明一个sqlSession的工厂；

MapperScannerConfigurer：让spring自动扫描我们持久层的接口从而自动构建代理类。

## 基于注解形式

注解形式的话相当于将上述的xml配置一一对应成注解的形式

```java
@Configuration  
@MapperScan(value="org.ryo.springmybatis.dao")  
public class DaoConfig {
  
    @Value("${jdbc.driverClass}")  
    private String driverClass;  
  
    @Value("${jdbc.user}")  
    private String user;  
  
    @Value("${jdbc.password}")  
    private String password;  
  
    @Value("${jdbc.jdbcUrl}")  
    private String jdbcUrl;  
  
    @Bean  
    public DataSource dataSource() {  
        DriverManagerDataSource dataSource = new DriverManagerDataSource();  
        dataSource.setDriverClassName(driverClass);  
        dataSource.setUsername(user);  
        dataSource.setPassword(password);  
        dataSource.setUrl(jdbcUrl);  
        return dataSource;  
    }  
  
    @Bean  
    public DataSourceTransactionManager transactionManager() {  
        return new DataSourceTransactionManager(dataSource());  
    }  
  
    @Bean  
    public SqlSessionFactory sqlSessionFactory() throws Exception {  
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();  
        sessionFactory.setDataSource(dataSource());  
        return sessionFactory.getObject();  
    }  
}  
```

很明显，一样需要一个dataSource,SqlSessionFactory以及一个 `@MapperScan` 的注解。

这个注解的作用跟上述的 MapperScannerConfigurer 的作用是一样的。

# spring和mybatis无缝整合的机制

## a.BeanDefinitionRegistryPostProcessor和ImportBeanDefinitionRegistrar的认识

在讲mybatis如何无缝整合进spring之前，我们先认识下BeanDefinitionRegistryPostProcessor和ImportBeanDefinitionRegistrar这两个接口的作用。

我们先看下这两个接口是什么样的。

```java
//BeanDefinitionRegistryPostProcessor接口
public interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {
    void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry var1) throws BeansException;
}

//ImportBeanDefinitionRegistrar接口
public interface ImportBeanDefinitionRegistrar {
    void registerBeanDefinitions(AnnotationMetadata var1, BeanDefinitionRegistry var2);
}
```

对于这两个接口我们先看官方文档给我们的解释。

以下是BeanDefinitionRegistryPostProcessor的解释：

```
public interface ImportBeanDefinitionRegistrar Interface to be implemented by types that register additional bean definitions when processing @Configuration classes. Useful when operating at the bean definition level (as opposed to @Bean method/instance level) is desired or necessary.

Along with @Configuration and ImportSelector, classes of this type may be provided to the @Import annotation (or may also be returned from an ImportSelector).
```

通俗解释来讲就是在@Configuration上使用@Import时可以自定义beanDefinition，或者作为ImportSelector接口的返回值（有兴趣的小伙伴可以自行研究）。

所以总结下就是如果我想扩展beanDefinition那么我可以继承这两个接口实现。

下面我们就从mybatis配置方式入手讲讲spring和mybatis是如何无缝整合的。

## b.基于XML配置mybatis是如何整合进spring的

首先，容器启动的时候，我们在xml配置中的SqlSessionFactoryBean会被初始化，所以我们先看下SqlSessionFactoryBean是在初始化的时候作了哪些工作。

```java
public class SqlSessionFactoryBean implements FactoryBean<SqlSessionFactory>, InitializingBean, ApplicationListener<ApplicationEvent> {
    private static final Log LOGGER = LogFactory.getLog(SqlSessionFactoryBean.class);
    private Resource configLocation;
    private Configuration configuration;
    private Resource[] mapperLocations;
    private DataSource dataSource;
    private TransactionFactory transactionFactory;
    private Properties configurationProperties;
    private SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
    private SqlSessionFactory sqlSessionFactory;
    private String environment = SqlSessionFactoryBean.class.getSimpleName();
    private boolean failFast;
    private Interceptor[] plugins;
    private TypeHandler<?>[] typeHandlers;
    private String typeHandlersPackage;
    private Class<?>[] typeAliases;
    private String typeAliasesPackage;
    private Class<?> typeAliasesSuperType;
    private DatabaseIdProvider databaseIdProvider;
    private Class<? extends VFS> vfs;
    private Cache cache;
    private ObjectFactory objectFactory;
    private ObjectWrapperFactory objectWrapperFactory;

    public SqlSessionFactoryBean() {
    }
    ...
}
```

我们可以看到这个类实现了FactoryBean、InitializingBean和ApplicationListener接口，对应的接口在bean初始化的时候为执行些特定的方法（如果不清楚的小伙伴请自行百度，这里不作过多叙述）。

现在我们来看看都有哪些方法会被执行，这些方法又作了哪些工作。

```java
//FactoryBean
public SqlSessionFactory getObject() throws Exception {
    if (this.sqlSessionFactory == null) {
        this.afterPropertiesSet();
    }

    return this.sqlSessionFactory;
}

//InitializingBean
public void afterPropertiesSet() throws Exception {
    Assert.notNull(this.dataSource, "Property 'dataSource' is required");
    Assert.notNull(this.sqlSessionFactoryBuilder, "Property 'sqlSessionFactoryBuilder' is required");
    Assert.state(this.configuration == null && this.configLocation == null || this.configuration == null || this.configLocation == null, "Property 'configuration' and 'configLocation' can not specified with together");
    this.sqlSessionFactory = this.buildSqlSessionFactory();
}

//ApplicationListener
public void onApplicationEvent(ApplicationEvent event) {
    if (this.failFast && event instanceof ContextRefreshedEvent) {
        this.sqlSessionFactory.getConfiguration().getMappedStatementNames();
    }

}
```

通过观察代码我们可以知道前面两个都是在做同一件事情，那就是在构建sqlSessionFactory，在构建sqlSessionFactory时mybatis会去解析配置文件，构建configuation。

后面的onApplicationEvent主要是监听应用事件时做的一些事情（不详讲，有兴趣的同学可以自己去了解下）。

其次，我们回忆下我们在xml配置中还配置了MapperScannerConfigurer，或者也可以配置多个的MapperFactoryBean,道理都是一样的，只是MapperScannerConfigurer帮我们封装了这一个过程，可以实现自动扫描指定包下的mapper接口构建MapperFactoryBean。

## Q1: 为什么可以直接通过 spring 获取 mapper 实现类呢？

而不用使用sqlSession去getMapper呢？

答案其实在上面就已经为大家解答了，就是MapperFactoryBean。

我们先看看这个类。

```java
public class MapperFactoryBean<T> extends SqlSessionDaoSupport implements FactoryBean<T> {
    private Class<T> mapperInterface;
    private boolean addToConfig = true;

    public MapperFactoryBean() {
    }

    public MapperFactoryBean(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    ...
}
```

这个类继承了SqlSessionDaoSupport，实现了FactoryBean。

我们先讲讲SqlSessionDaoSupport这个类

```java
public abstract class SqlSessionDaoSupport extends DaoSupport {
    private SqlSession sqlSession;
    private boolean externalSqlSession;

    public SqlSessionDaoSupport() {
    }

    public void setSqlSessionFactory(SqlSessionFactory sqlSessionFactory) {
        if (!this.externalSqlSession) {
            this.sqlSession = new SqlSessionTemplate(sqlSessionFactory);
        }

    }

    public void setSqlSessionTemplate(SqlSessionTemplate sqlSessionTemplate) {
        this.sqlSession = sqlSessionTemplate;
        this.externalSqlSession = true;
    }

    public SqlSession getSqlSession() {
        return this.sqlSession;
    }

    protected void checkDaoConfig() {
        Assert.notNull(this.sqlSession, "Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required");
    }
}
```

可以看到这个类继承了DaoSupport，我们再来看下这个类。

```java
public abstract class DaoSupport implements InitializingBean {
    protected final Log logger = LogFactory.getLog(this.getClass());

    public DaoSupport() {
    }

    public final void afterPropertiesSet() throws IllegalArgumentException, BeanInitializationException {
        this.checkDaoConfig();

        try {
            this.initDao();
        } catch (Exception var2) {
            throw new BeanInitializationException("Initialization of DAO failed", var2);
        }
    }

    protected abstract void checkDaoConfig() throws IllegalArgumentException;

    protected void initDao() throws Exception {
    }
}
```

可以看到实现了InitializingBean接口，所以在类初始化时为执行afterPropertiesSet方法，我们看到afterPropertiesSet方法里面有checkDaoConfig方法和initDao方法，其中initDao是模板方法，提供子类自行实现相关dao初始化的操作，我们看下checkDaoConfig方法作了什么事。

```java
//MapperFactoryBean
protected void checkDaoConfig() {
    super.checkDaoConfig();
    Assert.notNull(this.mapperInterface, "Property 'mapperInterface' is required");
    Configuration configuration = this.getSqlSession().getConfiguration();
    if (this.addToConfig && !configuration.hasMapper(this.mapperInterface)) {
        try {
            configuration.addMapper(this.mapperInterface);
        } catch (Exception var6) {
            this.logger.error("Error while adding the mapper '" + this.mapperInterface + "' to configuration.", var6);
            throw new IllegalArgumentException(var6);
        } finally {
            ErrorContext.instance().reset();
        }
    }

}
```

这个方法具体的实现是在MapperFactoryBean类里面的，主要作用就是对验证mapperInterface是否存在configuration对象里面。

然后我们再来看下MapperFactoryBean实现了FactoryBean的目的是什么。

我们都知道FactoryBean有一个方法是getObject，这个方法的作用就是在spring容器初始化bean时，如果判断这个类是否继承自FactoryBean，那么在获取真正的bean实例时会调用getObject，将getObject方法返回的值注册到spring容器中。

在明白了这些知识点之后，我们看下MapperFactoryBean的getObject方法是如何实现的。

```java
//MapperFactoryBean
public T getObject() throws Exception {
    return this.getSqlSession().getMapper(this.mapperInterface);
}
```

看到这里是否就已经明白为什么在结合spring时我们不需要使用sqlSession对象去获取我们的mapper实现类了吧。

因为spring帮我们作了封装！

之后的操作可以结合上面博文去看mybatis如何获取到对应的Mapper对象的了。

接下来我们看下mybatis是如何结合spring构建MapperFactoryBean的beanDefinition的。

这里我们需要看看MapperScannerConfigurer这个类，这个类的目的就是扫描我们指定的dao层（持久层）对应的包（package），构建相应的beanDefinition提供给spring容器去实例化我们的mapper接口对象。

```java
//MapperScannerConfigurer
public class MapperScannerConfigurer implements BeanDefinitionRegistryPostProcessor, InitializingBean, ApplicationContextAware, BeanNameAware {
    private String basePackage;
    private boolean addToConfig = true;
    private SqlSessionFactory sqlSessionFactory;
    private SqlSessionTemplate sqlSessionTemplate;
    private String sqlSessionFactoryBeanName;
    private String sqlSessionTemplateBeanName;
    private Class<? extends Annotation> annotationClass;
    private Class<?> markerInterface;
    private ApplicationContext applicationContext;
    private String beanName;
    private boolean processPropertyPlaceHolders;
    private BeanNameGenerator nameGenerator;

    public MapperScannerConfigurer() {
    }
    ...
}
```

通过代码，我们可以看到这个类实现了BeanDefinitionRegistryPostProcessor这个接口，通过前面对BeanDefinitionRegistryPostProcessor的讲解，我们去看看MapperScannerConfigurer中的postProcessBeanDefinitionRegistry方法的实现。

```java
public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
    if (this.processPropertyPlaceHolders) {
        this.processPropertyPlaceHolders();
    }

    ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    scanner.setAddToConfig(this.addToConfig);
    scanner.setAnnotationClass(this.annotationClass);
    scanner.setMarkerInterface(this.markerInterface);
    scanner.setSqlSessionFactory(this.sqlSessionFactory);
    scanner.setSqlSessionTemplate(this.sqlSessionTemplate);
    scanner.setSqlSessionFactoryBeanName(this.sqlSessionFactoryBeanName);
    scanner.setSqlSessionTemplateBeanName(this.sqlSessionTemplateBeanName);
    scanner.setResourceLoader(this.applicationContext);
    scanner.setBeanNameGenerator(this.nameGenerator);
    scanner.registerFilters();
    scanner.scan(StringUtils.tokenizeToStringArray(this.basePackage, ",; \t\n"));
}
```

可以看这里就是在构建ClassPathMapperScanner对象，然后调用scan方法扫描。

接下来我们继续看这个扫描的操作,因为这个类继承了ClassPathBeanDefinitionScanner，调用的scan方法是在ClassPathBeanDefinitionScanner里申明的。

```java
//ClassPathBeanDefinitionScanner
public int scan(String... basePackages) {
    int beanCountAtScanStart = this.registry.getBeanDefinitionCount();
    this.doScan(basePackages);
    if (this.includeAnnotationConfig) {
        AnnotationConfigUtils.registerAnnotationConfigProcessors(this.registry);
    }

    return this.registry.getBeanDefinitionCount() - beanCountAtScanStart;
}
```

这里我们需要注意doScan这个方法，这个方法在ClassPathMapperScanner中重写了。

```java
//ClassPathMapperScanner
public Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);
    if (beanDefinitions.isEmpty()) {
        this.logger.warn("No MyBatis mapper was found in '" + Arrays.toString(basePackages) + "' package. Please check your configuration.");
    } else {
        this.processBeanDefinitions(beanDefinitions);
    }

    return beanDefinitions;
}
```

这里调用了父类的doScan得到beanDefinitions的集合。

这里的父类的doScan方法是spring提供的包扫描操作，这里不过多叙述，感兴趣的小伙伴可以自行研究。

我们还注意到在得到beanDefinitions集合后，这里还调用了processBeanDefinitions方法，这里是对beanDefinition做了一些特殊的处理以满足mybaits的需求。

我们先来看下这个方法。

```java
//ClassPathMapperScanner#doScan
private void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
    Iterator var3 = beanDefinitions.iterator();

    while(var3.hasNext()) {
        BeanDefinitionHolder holder = (BeanDefinitionHolder)var3.next();
        GenericBeanDefinition definition = (GenericBeanDefinition)holder.getBeanDefinition();
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Creating MapperFactoryBean with name '" + holder.getBeanName() + "' and '" + definition.getBeanClassName() + "' mapperInterface");
        }

        definition.getConstructorArgumentValues().addGenericArgumentValue(definition.getBeanClassName());
        definition.setBeanClass(this.mapperFactoryBean.getClass());
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
                this.logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
            }

            definition.getPropertyValues().add("sqlSessionTemplate", new RuntimeBeanReference(this.sqlSessionTemplateBeanName));
            explicitFactoryUsed = true;
        } else if (this.sqlSessionTemplate != null) {
            if (explicitFactoryUsed) {
                this.logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
            }

            definition.getPropertyValues().add("sqlSessionTemplate", this.sqlSessionTemplate);
            explicitFactoryUsed = true;
        }

        if (!explicitFactoryUsed) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Enabling autowire by type for MapperFactoryBean with name '" + holder.getBeanName() + "'.");
            }

            definition.setAutowireMode(2);
        }
    }

}
```

这里我们注意到有这么一行代码：definition.setBeanClass(this.mapperFactoryBean.getClass())，看到这里我们就可以知道为什么spring在加载初始化我们的mapper接口对象会初始化成MapperFactoryBean对象了。

好了，到这里我们也就明白了spring是如何帮我们加载注册我们的mapper接口对应的实现类了。

对于代码里涉及到的其他细节，这里暂时不作过多讲解，还是老套路，只讲解总体思路。

## c. 基于注解配置mybatis是如何整合进spring的

基于注解形式的配置其实就是将xml配置对应到注解中来，本质上的流程还是一样的。所以这里我就简单讲讲。

我们先看看MapperScannerRegistrar这个类，因为这个类是spring构建MapperFactoryBean的核心类。

```java
//MapperScannerRegistrar
public class MapperScannerRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware {
    private ResourceLoader resourceLoader;

    public MapperScannerRegistrar() {
    }
    ...
}
```

这里我们注意到MapperScannerRegistrar实现了ImportBeanDefinitionRegistrar接口，在前面的叙述中我们已经知道了实现ImportBeanDefinitionRegistrar接口的作用是什么了，所以我们直接看看这里具体做了什么操作。

```java
public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
    AnnotationAttributes annoAttrs = AnnotationAttributes.fromMap(importingClassMetadata.getAnnotationAttributes(MapperScan.class.getName()));
    ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    if (this.resourceLoader != null) {
        scanner.setResourceLoader(this.resourceLoader);
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
        scanner.setBeanNameGenerator((BeanNameGenerator)BeanUtils.instantiateClass(generatorClass));
    }

    Class<? extends MapperFactoryBean> mapperFactoryBeanClass = annoAttrs.getClass("factoryBean");
    if (!MapperFactoryBean.class.equals(mapperFactoryBeanClass)) {
        scanner.setMapperFactoryBean((MapperFactoryBean)BeanUtils.instantiateClass(mapperFactoryBeanClass));
    }

    scanner.setSqlSessionTemplateBeanName(annoAttrs.getString("sqlSessionTemplateRef"));
    scanner.setSqlSessionFactoryBeanName(annoAttrs.getString("sqlSessionFactoryRef"));
    List<String> basePackages = new ArrayList();
    String[] var10 = annoAttrs.getStringArray("value");
    int var11 = var10.length;

    int var12;
    String pkg;
    for(var12 = 0; var12 < var11; ++var12) {
        pkg = var10[var12];
        if (StringUtils.hasText(pkg)) {
            basePackages.add(pkg);
        }
    }

    var10 = annoAttrs.getStringArray("basePackages");
    var11 = var10.length;

    for(var12 = 0; var12 < var11; ++var12) {
        pkg = var10[var12];
        if (StringUtils.hasText(pkg)) {
            basePackages.add(pkg);
        }
    }

    Class[] var14 = annoAttrs.getClassArray("basePackageClasses");
    var11 = var14.length;

    for(var12 = 0; var12 < var11; ++var12) {
        Class<?> clazz = var14[var12];
        basePackages.add(ClassUtils.getPackageName(clazz));
    }

    scanner.registerFilters();
    scanner.doScan(StringUtils.toStringArray(basePackages));
}
```

通过观察我们看到最后还是调用了ClassPathMapperScanner的doScan去扫描指定包下的mapper接口（持久层），然后构建对应的beanDefinition类。

前面我们知道是通过MapperScan这个注解去指定包的，然后我们也可以看到，在这个方法一开始就取出这个注解的值，然后进行接下来的操作的。

```java
AnnotationAttributes annoAttrs = AnnotationAttributes.fromMap(importingClassMetadata.getAnnotationAttributes(MapperScan.class.getName()));
```

之后的过程其实跟xml形式配置的一样了。

## 小结

好啦，这篇没想啰理八嗦说了那么多，可能有好多小伙伴看到最后也是懵逼状态，这里有个建议，打开IDE，边看边对着代码跟踪，如果哪里觉得不对，可以直接debug。

这里给大家提个看源码的建议，就是猜想+验证。

先猜想自己的想法，然后通过查找相关问题或者debug代码去验证自己的思路。

# 参考资料

[Spring-Mybatis运行机制概括](https://segmentfault.com/a/1190000015165470)

* any list
{:toc}