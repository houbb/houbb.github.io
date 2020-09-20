---
layout: post
title:  Spring Boot-16-springboot 整合 myabtis-plus druid PageHelper 汇总
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# springboot 整合 mybatis-plus

## maven 依赖

- 版本

```xml
<mybatis.version>3.4.4</mybatis.version>
<mybatis-spring.version>1.3.1</mybatis-spring.version>
<mybatis-plus.version>2.3</mybatis-plus.version>
<java.version>1.8</java.version>
<mysql.version>5.1.47</mysql.version>
<druid.version>1.1.14</druid.version>
<aspectj.version>1.8.10</aspectj.version>
<velocity.version>2.0</velocity.version>
<spring-boot.version>1.5.11.RELEASE</spring-boot.version>
```

- 依赖

```xml
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
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>${mybatis-plus.version}</version>
</dependency>
<!-- mybatis-plus自动化工具需要的依赖 模板-->
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>${velocity.version}</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>${mysql.version}</version>
    <scope>runtime</scope>
</dependency>
<!-- alibaba的druid数据库连接池 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>${druid.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
    <version>${spring-boot.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <version>${spring-boot.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>${spring-boot.version}</version>
</dependency>
```

## 配置文件

```yml
server:
  port: 8080

spring:
  datasource:
    druid:
      username: root
      password: 123456
      url: jdbc:mysql://localhost:3306/padmin?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC
      driver-class-name: com.mysql.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath*:com/github/houbb/privilege/admin/dal/mapper/*Mapper.xml
  type-aliases-package: com.github.houbb.privilege.admin.dal.entity
```

到这里，最基本的配置就完成了。

实现原理，就是通过 springboot-starter 实现的。

## 分页

如果我们希望使用分页插件，那么配置一下：

```java
import com.baomidou.mybatisplus.plugins.PaginationInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan(basePackages = "com.github.houbb.privilege.admin.dal.mapper")
public class DataSourceConfig {

    @Bean
    public PaginationInterceptor paginationInterceptor(){
        PaginationInterceptor page = new PaginationInterceptor();
        //设置方言类型
        page.setDialectType("mysql");
        return page;
    }

}
```

# 分页测试

## 正常情况

```java
public BasePageInfo<User> pageQueryList(CommonPageReq pageReq) {
    Wrapper<User> userWrapper = new EntityWrapper<>();
    
    // 分页查询
    Page<User> userPage = new Page<>(pageReq.getPageNum(), pageReq.getPageSize());
    userPage = this.selectPage(userPage, userWrapper);
    BasePageInfo<User> pageInfo = new BasePageInfo<>();
    pageInfo.setList(userPage.getRecords());
    pageInfo.setTotal(userPage.getTotal());
    return pageInfo;
}
```

发现这种分页信息是正常的。

## 不生效的情况



# 参考资料

[SpringBoot集成Mybatis分页插件PageHelper不生效问题](https://blog.csdn.net/whynote314/article/details/91041652)

[SpringBoot + PageHelper, MyBatis分页不生效解决方案](https://www.cnblogs.com/appin/p/11925579.html)

[springboot 集成mybatis-plus 使用pagehelper分页失效 解决](https://blog.csdn.net/tao441033618/article/details/108582092)

[MyBatis-Plus 分页插件失效分析](https://www.cnblogs.com/jice/p/12339921.html)

[Mybatis-Plus分页插件功能无效问题](https://www.cnblogs.com/54hsh/p/13072961.html)

* any list
{:toc}
