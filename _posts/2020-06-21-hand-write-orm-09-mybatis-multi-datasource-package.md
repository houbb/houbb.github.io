---
layout: post
title:  springboot + mybatis-plus 分包实现多数据源配置
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

## 业务背景

同一个应用需要访问多个数据源，比如读写分离，或者需要对不同的库做 ETL 之类的。

那么如何配置多数据源呢？

文本就 mybatis 和 mybatis-plus 提供配置的基础案例。

### 实现方式

多数据源可以采用分包，或者通过 aop+注解的方式实现。

## 整体的配置

使用 springboot 做个案例。

### maven 配置

对应的 maven 配置如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>mp-sb-mluti</artifactId>

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
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.oracle</groupId>
            <artifactId>ojdbc6</artifactId>
            <version>11.2.0.3</version>
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
    </dependencies>

</project>
```

### 目录结构

```xml
├─java
│  └─dal
│      │  Application.java
│      │
│      ├─config
│      │      MainDataSourceConfig.java
│      │      SecondDataSourceConfig.java
│      │
│      ├─entity
│      │  ├─main
│      │  │      MainModel.java
│      │  │
│      │  └─second
│      │          SecondModel.java
│      │
│      ├─mapper
│      │  ├─main
│      │  │      MainMapper.java
│      │  │
│      │  └─second
│      │          SecondMapper.java
│      │
│      └─service
│          ├─main
│          │  │  MainService.java
│          │  │
│          │  └─impl
│          │          MainServiceImpl.java
│          │
│          └─second
│              │  SecondService.java
│              │
│              └─impl
│                      SecondServiceImpl.java
│
└─resources
    │  application.properties
    │
    └─dal.mapper
        │  README
        │
        ├─main
        │      MainMapper.xml
        │
        └─second
                SecondMapper.xml
```


### main 方法

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class, DataSourceTransactionManagerAutoConfiguration.class})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## mybatis 配置单数据源

### 代码生成

- generatorConfig.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE generatorConfiguration PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://www.mybatis.org/dtd/mybatis-generator-config_1_0.dtd" >
<generatorConfiguration>
 
	<context id="context1" targetRuntime="MyBatis3"
		defaultModelType="flat">

		<commentGenerator>
			<property name="suppressAllComments" value="true" />
		</commentGenerator>

		<jdbcConnection driverClass="驱动"
			connectionURL="url"
			userId="user"
			password="pwd" />

		<javaTypeResolver>
			<property name="forceBigDecimals" value="true" />
		</javaTypeResolver>

		<javaModelGenerator targetPackage="dal.entity.main" targetProject="src/main/java" />

		<sqlMapGenerator targetPackage="dal.mapper.main"
			targetProject="src/main/resources" />

		<!-- 生成xml文件 -->
		<javaClientGenerator targetPackage="dal.mapper.main"
			targetProject="src/main/java" type="XMLMAPPER"/>

    <table tableName="MAIN" />

	</context>
</generatorConfiguration>
```

## 对应的 mybatis-plus 数据源配置

- MainDataSourceConfig.java

```java
package dal.config;

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

### mybatis 的配置 

二者最核心的区别就在于 sqlSessionFactory 方法，mybatis 直接使用 SqlSessionFactoryBean 替换掉 MybatisSqlSessionFactoryBean。

```java
@Bean("mainSqlSessionFactory")
@Primary
public SqlSessionFactory sqlSessionFactory(@Qualifier("mainDataSource") DataSource dataSource,@Qualifier("mainPaginationInterceptor")PaginationInterceptor paginationInterceptor) throws Exception {
    SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
    sqlSessionFactoryBean.setDataSource(dataSource);
    sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:dal/mapper/main/*.xml"));
    Interceptor[] plugins = new Interceptor[]{paginationInterceptor};
    sqlSessionFactoryBean.setPlugins(plugins);
    return sqlSessionFactoryBean.getObject();
}
```

## mybatis 配置多数据源-分包

其实如果使用分包的话，实现起来非常简单。

就是 entity/mapper/xml 都放在独立的包中，然后扫包的时候独立即可。

### mybatis-plus 例子

```java
package dal.config;

/**
 *
 * https://blog.csdn.net/qq_36134369/article/details/95036273
 *
 * @author binbin.hou
 * @since 1.0.0
 */

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
@MapperScan(basePackages = "dal.mapper.second", sqlSessionFactoryRef = "secondSqlSessionFactory")
public class SecondDataSourceConfig {

    @Bean("secondSqlSessionTemplate")
    public SqlSessionTemplate secondSqlSessionTemplate(
            @Qualifier("secondSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean("secondSqlSessionFactory")
    @Primary
    public SqlSessionFactory sqlSessionFactory(@Qualifier("secondDataSource") DataSource dataSource,@Qualifier("secondPaginationInterceptor") PaginationInterceptor paginationInterceptor) throws Exception {
        MybatisSqlSessionFactoryBean sqlSessionFactoryBean = new MybatisSqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:dal/mapper/second/*.xml"));
        Interceptor[] plugins = new Interceptor[]{paginationInterceptor};
        sqlSessionFactoryBean.setPlugins(plugins);
        return sqlSessionFactoryBean.getObject();
    }
    @Bean("secondPaginationInterceptor")
    public PaginationInterceptor paginationInterceptor() {
        return new PaginationInterceptor();
    }

    @Bean("secondDataSource")
    public DataSource secondDataSource() {
        DruidDataSource druidDataSource = new DruidDataSource();
        druidDataSource.setDriverClassName("oracle.jdbc.driver.OracleDriver");
        druidDataSource.setUrl("jdbc:oracle:thin:@ip2:port2/db2");
        druidDataSource.setUsername("name");
        druidDataSource.setPassword("password");
        return druidDataSource;
    }

}
```

注意：所有的插件，mybatis 配置都做要彻底隔离。

我在测试过程中为了复用，一开始将分页插件，全局配置等设置为公用，后来发现会导致数据源的混乱。


## 参考资料

[项目模板丨多数据源搭建 maven+spring-boot+druid+mybatis-plus+分页插件+分包](https://blog.csdn.net/qq_36134369/article/details/95036273)

[springboot mybatis plus多数据源轻松搞定 （上）](https://www.cnblogs.com/bbird/p/13164536.html)

[Mybatis plus 配置多数据源](https://www.cnblogs.com/CryOnMyShoulder/p/12218876.html)

* any list
{:toc}