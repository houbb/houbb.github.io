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

## 带着问题学习

SqlSessionFactory，SqlSession 如何生成?

Mapper 代理如何生成？如何运行？


# SqlSessionFactory，SqlSession 如何生成?

由于楼主的项目是SpringBoot ，因此基本没有配置文件，只有一个简单的配置，这也是Spring团队一直追求的目标：无配置。

但由于我们的团队开始使用SpringCloud ，于是配置又多了起来，看来，配置文件始终是消灭不掉的。

那么，废话了这么多，楼主的关于Mybatis的配置由以下几个部分组成：

jar 包 maven导入artifactId 为 mybatis-spring 的jar包，该jar包是整合Spring和mybatis的粘合剂。

使用硬编码的方式配置bean。

比如SqlSessionFactory，SqlSessionTemplate, PlatformTransactionManager.

扫描接口包。

## 配置 SqlSessionFactory

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

注意：dataSource 方法会返回一个自己配置的多数据源。

但这不是我们今天的重点。



# 参考资料

[深入剖析 mybatis 原理（三）如何整合 Spring](https://www.jianshu.com/p/c2b2d6f90ba5)


* any list
{:toc}