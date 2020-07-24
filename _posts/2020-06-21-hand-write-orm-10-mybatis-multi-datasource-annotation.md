---
layout: post
title:  springboot + mybatis-plus 基于注解的多数据源 
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

## 业务背景

上一节我们讲解通过分包来实现多数据源，这一节来讲解另一种实现方式——通过注解，动态切换数据源。

## 准备工作

### 建表语句

- master

模拟主库：


```sql
CREATE DATABASE IF NOT EXISTS test DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;

create table test.master (

id int(20) NOT NULL  primary key AUTO_INCREMENT comment '主键',

name varchar(32) NOT NULL comment '名称',

password varchar(32) NOT NULL comment '密码'

) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 comment '主';
```

- slave

模拟从库：

```sql
CREATE DATABASE IF NOT EXISTS test_slave DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;

create table test_slave.slave (

id int(20) NOT NULL  primary key AUTO_INCREMENT comment '主键',

name varchar(32) NOT NULL comment '名称',

password varchar(32) NOT NULL comment '密码'

) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 comment '从者';
```

### MPG

mybatis-plus 自动生产实现，从库调整下对应的连接和包即可。

```java
import com.baomidou.mybatisplus.enums.IdType;
import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.config.*;
import com.baomidou.mybatisplus.generator.config.rules.DbType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MasterMPGTest {

    /**
     * 覆盖生成下列文件，第一次建表时使用
     * 1. java mapper
     * 2. java enity
     * 3. xml mapper
     * 4. service
     *
     * 更新时使用：
     * 1. 只修改对应的实体类即可，其他科注释掉。
     *
     * genDalJavaEntity
     */
    public static void main(String[] args) {
        String[] tables = new String[]{
                "master",
        };

        genDalJavaEntity(tables);
        genDalJavaMapper(tables);
        genDalXml(tables);
        genService(tables);
    }

    private static final String BASE_DIR = System.getProperty("user.dir");

    private static AutoGenerator initConfig(String... tables) {
        final String author = System.getProperty("user.name");

        //创建代码生成器
        AutoGenerator mpg = new AutoGenerator();
        //指定模板引擎  默认velocity
        //mpg.setTemplateEngine(new FreemarkerTemplateEngine());

        //全局配置
        GlobalConfig gc = new GlobalConfig();
        gc.setOpen(false);
        gc.setOutputDir(BASE_DIR);
        gc.setFileOverride(true); //是否覆盖已有文件
        gc.setBaseResultMap(false); //XML是否需要BaseResultMap
        gc.setBaseColumnList(false); //XML是否显示字段
        gc.setControllerName("%sController");
        gc.setServiceName("%sService");
        gc.setServiceImplName("%sServiceImpl");
        gc.setMapperName("%sMapper");
        gc.setXmlName("%sMapper");
        gc.setAuthor(author);
        gc.setEnableCache(false);
        gc.setIdType(IdType.AUTO);

        mpg.setGlobalConfig(gc);

        //数据源配置
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setDbType(DbType.MYSQL);
        dsc.setDriverName("com.mysql.jdbc.Driver");
        dsc.setUrl("jdbc:mysql://localhost:3306/test");
        dsc.setUsername("root");
        dsc.setPassword("123456");
        mpg.setDataSource(dsc);

        //策略配置
        StrategyConfig sc = new StrategyConfig();
        sc.setNaming(NamingStrategy.underline_to_camel); //表名生成策略
        sc.setEntityBuilderModel(false);
        sc.setCapitalMode(true);
        sc.setEntityLombokModel(false);
        sc.setDbColumnUnderline(true);
        sc.setEntityColumnConstant(false); //生成字段常量
        // 指定表信息
        sc.setInclude(tables);
        sc.entityTableFieldAnnotationEnable(true);
        mpg.setStrategy(sc);

        //包配置
        PackageConfig pc = new PackageConfig();
        pc.setParent("com.github.houbb.mp.sb.learn.mysql");
        pc.setEntity("dal.entity.master");
        pc.setMapper("dal.mapper.master");
        pc.setXml("dal.mapper.master");
        pc.setService("service.service.master");
        pc.setServiceImpl("service.service.master.impl");
        mpg.setPackageInfo(pc);

        // 配置模板
        TemplateConfig templateConfig = new TemplateConfig();
        //控制 不生成 controller  空字符串就行
        templateConfig.setController("");
        templateConfig.setService("");
        templateConfig.setServiceImpl("");
        templateConfig.setEntity("");
        templateConfig.setMapper("");
        templateConfig.setXml("");
        mpg.setTemplate(templateConfig);

        return mpg;
    }

    /**
     * 生成 dal 的 java 代码
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalJavaEntity(String... tables) {
        String moduleName = "mp-sb-mysql";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setEntity(ConstVal.TEMPLATE_ENTITY_JAVA);

        mpg.execute();
    }

    /**
     * 生成 dal 的 java mapper 代码
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalJavaMapper(String... tables) {
        String moduleName = "mp-sb-mysql";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setMapper(ConstVal.TEMPLATE_MAPPER);

        mpg.execute();
    }

    /**
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalXml(String... tables) {
        String moduleName = "mp-sb-mysql";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\resources\\");
        mpg.getTemplate().setXml(ConstVal.TEMPLATE_XML);

        mpg.execute();
    }

    private static void genService(String... tables) {
        String moduleName = "mp-sb-mysql";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setService(ConstVal.TEMPLATE_SERVICE);
        mpg.getTemplate().setServiceImpl(ConstVal.TEMPLATE_SERVICEIMPL);

        mpg.execute();
    }

}
```

### maven 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>mp-sb-mysql</artifactId>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <mybatis.version>3.4.4</mybatis.version>
        <mybatis-spring.version>1.3.1</mybatis-spring.version>
        <mybatis-plus.version>2.3</mybatis-plus.version>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <!-- mybatis-plus-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>${mybatis.version}</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>${mybatis-spring.version}</version>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus</artifactId>
            <version>${mybatis-plus.version}</version>
            <exclusions>
                <exclusion>
                    <artifactId>mybatis</artifactId>
                    <groupId>org.mybatis</groupId>
                </exclusion>
                <exclusion>
                    <artifactId>mybatis-spring</artifactId>
                    <groupId>org.mybatis</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.47</version>
            <scope>runtime</scope>
        </dependency>
        <!-- alibaba的druid数据库连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.14</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- mybatis-plus自动化工具需要的依赖 模板-->
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity-engine-core</artifactId>
            <version>2.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.10</version>
        </dependency>
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.8.10</version>
        </dependency>
    </dependencies>

</project>
```

### 整体目录

```
├─main
│  ├─java
│  │  └─com
│  │      └─github
│  │          └─houbb
│  │              └─mp
│  │                  └─sb
│  │                      └─learn
│  │                          └─mysql
│  │                              │  Application.java
│  │                              │
│  │                              ├─config
│  │                              │      DataSourceConfig.java
│  │                              │
│  │                              ├─dal
│  │                              │  ├─entity
│  │                              │  │  ├─master
│  │                              │  │  │      Master.java
│  │                              │  │  │
│  │                              │  │  └─slave
│  │                              │  │          Slave.java
│  │                              │  │
│  │                              │  └─mapper
│  │                              │      ├─master
│  │                              │      │      MasterMapper.java
│  │                              │      │
│  │                              │      └─slave
│  │                              │              SlaveMapper.java
│  │                              │
│  │                              ├─dynamic
│  │                              │      DataBaseContextHolder.java
│  │                              │      DataSourceAspect.java
│  │                              │      DataSourceType.java
│  │                              │      DynamicDataSource.java
│  │                              │      DynamicRoute.java
│  │                              │
│  │                              └─service
│  │                                  └─service
│  │                                      ├─master
│  │                                      │  │  MasterService.java
│  │                                      │  │
│  │                                      │  └─impl
│  │                                      │          MasterServiceImpl.java
│  │                                      │
│  │                                      └─slave
│  │                                          │  SlaveService.java
│  │                                          │
│  │                                          └─impl
│  │                                                  SlaveServiceImpl.java
│  │
│  └─resources
│      │  application.yml
│      │
│      └─com
│          └─github
│              └─houbb
│                  └─mp
│                      └─sb
│                          └─learn
│                              └─mysql
│                                  └─dal
│                                      └─mapper
│                                          ├─master
│                                          │      MasterMapper.xml
│                                          │
│                                          └─slave
│                                                  SlaveMapper.xml
```


## 数据库配置

### DataSourceConfig.java

这里我们不再采用分包的方式，直接扫描在一起。

```java
package com.github.houbb.mp.sb.learn.mysql.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceBuilder;
import com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean;
import com.github.houbb.mp.sb.learn.mysql.dynamic.DataSourceType;
import com.github.houbb.mp.sb.learn.mysql.dynamic.DynamicDataSource;
import org.apache.ibatis.mapping.DatabaseIdProvider;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import java.util.HashMap;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Configuration
@MapperScan("com.github.houbb.mp.sb.learn.mysql.dal.mapper")
public class DataSourceConfig {

    @Bean(name = "datasourceMaster")
    @Primary
    public DruidDataSource datasourceMaster() {
        DruidDataSource source = new DruidDataSource();
        source.setUrl("jdbc:mysql://localhost:3306/test");
        source.setUsername("root");
        source.setPassword("123456");
        return source;
    }

    @Bean(name = "datasourceSlave")
    public DruidDataSource datasourceSlave() {
        DruidDataSource source = new DruidDataSource();
        source.setUrl("jdbc:mysql://localhost:3306/test_slave");
        source.setUsername("root");
        source.setPassword("123456");
        return source;
    }

    @Bean
    public DynamicDataSource dynamicDataSource(@Qualifier("datasourceMaster") DruidDataSource ds1, @Qualifier("datasourceSlave") DruidDataSource ds2) {
        Map<Object, Object> targetDataSource = new HashMap<>();
        targetDataSource.put(DataSourceType.MASTER, ds1);
        targetDataSource.put(DataSourceType.SLAVE, ds2);
        DynamicDataSource dataSource = new DynamicDataSource();
        dataSource.setTargetDataSources(targetDataSource);
        dataSource.setDefaultTargetDataSource(ds1);
        return dataSource;
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory(DynamicDataSource dynamicDataSource) throws Exception {
        MybatisSqlSessionFactoryBean bean = new MybatisSqlSessionFactoryBean();
        // 指定数据源
        bean.setDataSource(dynamicDataSource);
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        // 直接扫描所有
        bean.setMapperLocations(resolver.getResources("classpath*:com/github/houbb/mp/sb/learn/mysql/dal/mapper/**Mapper.xml"));
        return bean.getObject();
    }

    @Bean
    public DataSourceTransactionManager transactionManager(DynamicDataSource dynamicDataSource) {
        return new DataSourceTransactionManager(dynamicDataSource);
    }

}
```

### 动态数据源

- DynamicDataSource.java

用于数据源的切换实现

```java
package com.github.houbb.mp.sb.learn.mysql.dynamic;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DataBaseContextHolder.getDataSourceType();
    }
}
```


- DataBaseContextHolder.java

使用 ThreadLocal 的方式保存数据源信息。

```java
package com.github.houbb.mp.sb.learn.mysql.dynamic;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class DataBaseContextHolder {

    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();

    public static void setDataSourceType(String type) {
        if (type == null) {
            throw new NullPointerException();
        }

        contextHolder.set(type);
    }

    public static String getDataSourceType() {
        String type = contextHolder.get();
        if (type == null) {
            //确定一个默认数据源
            return DataSourceType.MASTER;
        }
        return type;
    }

    public static void clearDataSourceType() {
        contextHolder.remove();
    }

}
```

- DataSourceType.java

数据源类型常量

```java
public class DataSourceType {

    public static final String MASTER = "master";

    public static final String SLAVE = "slave";

}
```

## 动态切换数据源

直接使用注解标识，结合 AOP 达到动态切换的效果。

### 注解定义

```java
package com.github.houbb.mp.sb.learn.mysql.dynamic;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface DynamicRoute {

    /**
     * 主数据源
     * @return 数据源名称
     * @since 1.0.0
     */
    String value() default "";

}
```

### 切面实现

```java
package com.github.houbb.mp.sb.learn.mysql.dynamic;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Aspect
@Component
@EnableAspectJAutoProxy
public class DataSourceAspect {

    /**
     * 日志实例
     * @since 1.0.0
     */
    private static final Logger LOG = LoggerFactory.getLogger(DataSourceAspect.class);

    /**
     * 拦截注解指定的方法
     */
    @Pointcut("@annotation(com.github.houbb.mp.sb.learn.mysql.dynamic.DynamicRoute)")
    public void pointCut() {
        //
    }

    /**
     * 拦截处理
     *
     * @param point point 信息
     * @return result
     * @throws Throwable if any
     */
    @Around("pointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        try {
            // 获取当前拦截的方法签名
            String signatureShortStr = point.getSignature().toShortString();

            Method method = getCurrentMethod(point);
            DynamicRoute route = method.getAnnotation(DynamicRoute.class);
            String value = route.value();

            // 设置
            DataBaseContextHolder.setDataSourceType(value);

            return point.proceed();
        } finally {
            LOG.info("清空类型");
            DataBaseContextHolder.clearDataSourceType();
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
            throw new RuntimeException(e);
        }
    }

}
```

## 效果验证

### 方法定义

- 主库

`@DynamicRoute` 标注数据源为 master;

```java
import com.github.houbb.mp.sb.learn.mysql.dal.entity.master.Master;
import com.github.houbb.mp.sb.learn.mysql.dal.mapper.master.MasterMapper;
import com.github.houbb.mp.sb.learn.mysql.dynamic.DynamicRoute;
import com.github.houbb.mp.sb.learn.mysql.service.service.master.MasterService;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class MasterServiceImpl extends ServiceImpl<MasterMapper, Master> implements MasterService {

    @Override
    @DynamicRoute("master")
    public void create() {
        Master master = new Master();
        master.setName("master");
        master.setPassword("123465");
        this.insert(master);
    }

}
```

- 从库

`@DynamicRoute` 标注数据源为 slave;

```java
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.github.houbb.mp.sb.learn.mysql.dal.entity.slave.Slave;
import com.github.houbb.mp.sb.learn.mysql.dal.mapper.slave.SlaveMapper;
import com.github.houbb.mp.sb.learn.mysql.dynamic.DynamicRoute;
import com.github.houbb.mp.sb.learn.mysql.service.service.slave.SlaveService;
import org.springframework.stereotype.Service;

@Service
public class SlaveServiceImpl extends ServiceImpl<SlaveMapper, Slave> implements SlaveService {

    @Override
    @DynamicRoute("slave")
    public void create() {
        Slave slave = new Slave();
        slave.setName("slave");
        slave.setPassword("123465");
        this.insert(slave);
    }

}
```

### 主库测试

```java
import com.github.houbb.mp.sb.learn.mysql.Application;
import com.github.houbb.mp.sb.learn.mysql.service.service.master.MasterService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes= Application.class)
public class MasterServiceTest {

    @Autowired
    private MasterService masterService;

    @Test
    public void insertTest() {
        masterService.create();
    }

}
```

- 效果

```
mysql> select * from master;
+----+--------+----------+
| id | name   | password |
+----+--------+----------+
|  1 | master | 123465   |
+----+--------+----------+
1 row in set (0.00 sec)
```

### 从库测试

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes= Application.class)
public class SlaveServiceTest {

    @Autowired
    private SlaveService slaveService;

    @Test
    public void insertTest() {
        slaveService.create();
    }

}
```

- 效果

```
mysql> select * from slave;
+----+-------+----------+
| id | name  | password |
+----+-------+----------+
|  1 | slave | 123465   |
+----+-------+----------+
1 row in set (0.00 sec)
```

## 小结

到这里，基于注解的动态数据源切换就实现了。

原理还是比较简单的，感觉这里可以封装为一个公共的方法，而不是每一次都花费时间去自己实现。

## 参考资料

[springboot mybatis plus多数据源轻松搞定(下)](https://www.cnblogs.com/bbird/p/13164553.html)

* any list
{:toc}