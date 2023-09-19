---
layout: post
title: Mybatis-09-多数据源配置下，解决 org.apache.ibatis.binding.BindingException Invalid bound statement (not found)问题
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# 异常

本来 springboot 配置 mysql 配置正常，后来新加入了其他数据源，发现报错：

```
org.apache.ibatis.binding.BindingException: Invalid bound statement (not found)
```

# 解决方案

> [多数据源配置下，解决 org.apache.ibatis.binding.BindingException Invalid bound statement (not found)问题](https://blog.csdn.net/chaishen10000/article/details/125953413)

## 主要检查文件

1、检查mybatis.xml文件namespace名称是否和Mapper接口的全限定名是否一致

2、检查Mapper接口的方法在mybatis.xml中的每个语句的id是否一致

3、检查Mapper接口方法返回值是否匹配select元素配置的ResultMap,或者只配置ResultType

4、检查yml文件中的mapper的XML配置路径是否正确

5、Mybatis中接口与映射文件一定要同名或者必须在同一个包下，这个我没试过，好像是可以不同名的。

6、配置数据源的SqlSessionFactoryBean要使用MyBatisSqlSessionFactoryBean，这个也是鬼扯，MybatisPlus和Mybatis分清楚再说

![config](https://img-blog.csdnimg.cn/590910c626be475f9390126ab350b96f.png)

7、编译没有把XML拷贝过来，可以用这招：

```xml
<build>      
    <resources>          
        <resource>               
            <directory>src/main/java</directory>               
            <includes>                   
                <include>**/*.xml</include>            
            </includes>
        </resource>
    </resources>
</build>
```

8、 启动会默认通过org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration * 类，我们是自定义的，所以需要排除MybatisAutoConfiguration

```java
@SpringBootApplication(exclude = MybatisAutoConfiguration.class)
```

9、Mapper接口文件，不同数据源需要放置在不同包下面。

可能的原因都在这里了，各位慢用！！！ 

附上SqlSessionFactoryBean代码

ds1.java:

```java
package com.****.****.Configurer;
 
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
 
import javax.sql.DataSource;
 
@Configuration
@MapperScan(basePackages = {"com.***.***.Mapper.ds1"}, sqlSessionFactoryRef = "ds1SqlSessionFactory")
public class MybatisDS1Config {
 
    @Bean(name = "ds1DataSource")
    @ConfigurationProperties(prefix = "spring.datasource.ds1")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
    /**
     * 配置事务管理器，不然事务不起作用
     *
     * @return
     */
    @Bean
    public PlatformTransactionManager transactionManagerDS1() {
        return new DataSourceTransactionManager(this.dataSource());
    }
    @Primary
    @Bean(name = "ds1SqlSessionFactory")
    public SqlSessionFactoryBean ds1sqlSessionFactory(@Qualifier("ds1DataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver()
                .getResources("classpath*:mapping/ds1/*.xml"));
        sqlSessionFactoryBean.setTypeAliasesPackage("com.***.***.Entity");
        sqlSessionFactoryBean.getObject().getConfiguration().setMapUnderscoreToCamelCase(true);
        return sqlSessionFactoryBean;
 
        /**
         * 这里在applications.properties里面配置了
         * mybatis.type-aliases-package=com.jwt.springboot.dao
         * mybatis.mapper-locations=classpath:mapper/*Mapper.xml
         * 但多数据源情况下执行sql总会报：org.apache.ibatis.binding.BindingException:
         * Invalid bound statement (not found)........
         * 原因是 this.mapperLocations 为null
         *
         * 注！！！！这里有大坑， 因为这里是自定义的sqlSessionFactoryBean，所以导致
         * 没有启动时没有通过org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration
         * 类的sqlSessionFactory(DataSource dataSource)方法自动装配sqlSessionFactoryBean
         * 自定义的sqlSessionFactoryBean所以也没设置mapperLocations
         * 故自定义实例化sqlSessionFactoryBean这里需要手动设置mapperLocations
         * 可参考：https://developer.aliyun.com/article/754124
         */
    }
}
```

ds2,java

```java
package com.***.***.Configurer;
 
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
 
import javax.sql.DataSource;
 
@Configuration
@MapperScan(basePackages = "com.***.***.Mapper.ds2", sqlSessionFactoryRef = "ds2SqlSessionFactory")
public class MybatisDS2Config {
 
    @Bean(name = "ds2DataSource")
    @ConfigurationProperties(prefix = "spring.datasource.ds2")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
    /**
     * 配置事务管理器，不然事务不起作用
     *
     * @return
     */
    @Bean
    public PlatformTransactionManager transactionManagerDS2() {
        return new DataSourceTransactionManager(this.dataSource());
    }
 
    @Bean("ds2SqlSessionFactory")
    public SqlSessionFactory ds2sqlSessionFactory(@Qualifier("ds2DataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver()
                .getResources("classpath*:mapping/ds2/*.xml"));
        sqlSessionFactoryBean.setTypeAliasesPackage("com.***.***.Entity");
        sqlSessionFactoryBean.getObject().getConfiguration().setMapUnderscoreToCamelCase(true);
        return sqlSessionFactoryBean.getObject();
 
    }
}
```

yml配置： 

```yml
spring:
  datasource:
    ds1: #主数据库，生产数据库
      username: ***
      password: ***
      #url中database为对应的数据库名称   //数据库名字
      jdbc-url: jdbc:mysql://***:3306/crmdb?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC
      driver-class-name: com.mysql.cj.jdbc.Driver
 
    ds2: #从数据库，分析数据库
      username: ***
      password: ***
      #url中database为对应的数据库名称   //数据库名字
      jdbc-url: jdbc:mysql://***:3306/jmsns?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC
      driver-class-name: com.mysql.cj.jdbc.Driver
```

文件目录结构： 

![文件目录结构](https://img-blog.csdnimg.cn/46a05102b66d4d07997a979d7cb61d78.png)

另外，在Linux环境下：

```java
new PathMatchingResourcePatternResolver().getResources("classpath*:mapping/ds2/*.xml"));
```

可能出现找不到配置文件的问题，我用的替代方法是：

```java
new ClassPathResource[]{new ClassPathResource("/mapping/ds1/UserMapper.xml")}
```

# 总结

添加数据源的时候，只测试新的数据源确实可以，但是影响了旧的功能。

所以一定要注意影响范围。

# 参考资料

[多数据源配置下，解决 org.apache.ibatis.binding.BindingException Invalid bound statement (not found)问题](https://blog.csdn.net/chaishen10000/article/details/125953413)

* any list
{:toc}
