---
layout: post
title: SpringBoot Exception
date:  2018-11-12 08:07:55 +0800
categories: [Spring]
tags: [spring, ex, sh]
published: true
excerpt: SpringBoot Exception 记录
---

# 场景

springboot 项目。原来项目中有 jdbc 事务管理，且引入了 mybatis-plus 框架。

在使用 activemq 的时候想引入事务管理，却发现报错。

```
org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'org.springframework.transaction.PlatformTransactionManager' 
available: expected single matching bean but found 2: jmsTransactionManager,transactionManager
```

# 问题分析

当时知道这个错误肯定是 spring 注入的时候没有指定具体的 bean，但是查看了代码发现 config 配置的时候全部指定了名称。

按理说不应该包这个错误。

## 思路

后来发现是 mybatis-plus 中方法的事务导致的。

# 解决

修改了数据库访问相关配置

```java
@Configuration
@EnableTransactionManagement
@MapperScan(basePackages = "com.github.houbb.dal")
public class DatasourceConfig implements TransactionManagementConfigurer {

    @Autowired
    @Qualifier("transactionManager")
    private PlatformTransactionManager transactionManager;

    /**
     * 正常在每个事务方法上面使用 @Transactional(指定事务管理器) 但是 mybatis-plus 的 service() 方法转都是没有指定的。。。
     * 所以这里优先指定了 transactionManager。
     */
    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        return transactionManager;
    }
}
```

# 反思

1. 三方工具慎用

2. mybatis-plus 为每个方法添加 @Transactional 的注解让人觉得很多此一举。

# 参考资料

https://www.jianshu.com/p/1ff821a0f070

* any list
{:toc}