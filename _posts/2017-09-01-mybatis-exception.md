---
layout: post
title:  Mybatis Exception
date:  2017-9-1 14:32:46 +0800
categories: [Exception]
tags: [mybatis, exception]
published: true
---


# MyBatis Exception

简单记录 mybatis 使用时遇到的异常，便于日后查阅。


# IllegalArgumentException

<label class="label label-danger">Error</label>

报错信息如下:

```
Caused by: org.springframework.core.NestedIOException: Failed to parse mapping resource: 'file [~/XXXMapper.xml]'; nested exception is java.lang.IllegalArgumentException: Mapped Statements collection already contains value for ~.XXXMapper.insert
	at org.mybatis.spring.SqlSessionFactoryBean.buildSqlSessionFactory(SqlSessionFactoryBean.java:522)
	at org.mybatis.spring.SqlSessionFactoryBean.afterPropertiesSet(SqlSessionFactoryBean.java:381)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1637)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1574)
	... 39 more
Caused by: java.lang.IllegalArgumentException: Mapped Statements collection already contains value for ~.XXXMapper.insert
	at org.apache.ibatis.session.Configuration$StrictMap.put(Configuration.java:844)
	at org.apache.ibatis.session.Configuration$StrictMap.put(Configuration.java:816)
	at org.apache.ibatis.session.Configuration.addMappedStatement(Configuration.java:640)
	at org.apache.ibatis.builder.MapperBuilderAssistant.addMappedStatement(MapperBuilderAssistant.java:302)
	at org.apache.ibatis.builder.annotation.MapperAnnotationBuilder.parseStatement(MapperAnnotationBuilder.java:326)
	at org.apache.ibatis.builder.annotation.MapperAnnotationBuilder.parse(MapperAnnotationBuilder.java:131)
	at org.apache.ibatis.binding.MapperRegistry.addMapper(MapperRegistry.java:72)
	at org.apache.ibatis.session.Configuration.addMapper(Configuration.java:713)
	at org.apache.ibatis.builder.xml.XMLMapperBuilder.bindMapperForNamespace(XMLMapperBuilder.java:408)
	at org.apache.ibatis.builder.xml.XMLMapperBuilder.parse(XMLMapperBuilder.java:94)
	at org.mybatis.spring.SqlSessionFactoryBean.buildSqlSessionFactory(SqlSessionFactoryBean.java:520)
	... 42 more
```

<label class="label label-info">Reason</label>

网上原因说如下：

- mapper 中存在 id 重复的值

- mapper 中的 parameterType 或 resultType 为空


我仔细的对照了自己的文件，没有直接出现上面的两种情况，但是原因肯定是这个。

罪魁祸首是这个：

```java
import tk.mybatis.mapper.common.Mapper;
import tk.mybatis.mapper.common.SqlServerMapper;

public interface MyMapper<T> extends Mapper<T>, SqlServerMapper<T> {
}
```

在 Mapper、SqlServerMapper 都有 insert() 方法。所以引发了上述问题。

我特意验证了下，Mapper 中的 insert() 是可用的。不知为何此处要有2个相同的方法？


<label class="label label-success">Solve</label>

直接删除了对于 `SqlServerMapper<T>` 的继承。

* any list
{:toc}












