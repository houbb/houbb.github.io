---
layout: post
title:  Springboot Transaction @EnableTransactionManagement, spring 事务不生效; MySQL AutoCommit
date:  2018-07-26 11:07:50 +0800
categories: [Spring]
tags: [spring, java, database, transaction, sf]
published: true
---

# @EnableTransactionManagement 不生效

要使 @EnableTransactionManagement 生效，需要确保以下几个方面都已经配置正确：

1) 确保在Spring配置文件中声明了 `<tx:annotation-driven>` 标签。

这个标签会启用Spring的事务管理功能，并且会使得@Transactional注解生效。

示例代码如下：

```xml
<tx:annotation-driven transaction-manager="transactionManager"/>
```

2) 确认数据源已经正确配置。如果数据源配置有误，就无法开启事务，因为Spring事务管理器无法使用错误的数据源。

3) 确认在需要开启事务的方法中加上了@Transactional注解。这个注解告诉Spring开启了一个事务，并且会根据注解中的参数对事务进行配置。示例代码如下：

```java
@Transactional(propagation = Propagation.REQUIRED)
public void doSomething(){
  // 在这里进行需要回滚的操作
}
```

如果上述三个方面均已正确配置，但是 @EnableTransactionManagement 仍不生效，可以考虑检查Spring版本是否支持该配置，或者检查是否有其它的配置文件覆盖了该配置。


# Spring事务不生效的原因大解读

## 1、概述

事务在后端开发中无处不在，是数据一致性的最基本保证。在Spring中可以通过对方法进行事务的配置，而不是像原来通过手动写代码的方式实现事务的操作，这在很大程度上减少了开发的难度。

因此我们在使用spring事务的时候，门槛变得异常的低，小学生水平就能很好的管理好事务，但是同学们或多或少都遇见过一些事务不生效的难题，为啥呢？

本文就针对于此来做一些具体举例分析，尽量做到全覆盖

## 2、栗子

Spring团队建议在具体的类（或类的方法）上使用 @Transactional 注解，而不要使用在类所要实现的任何接口上。

在接口上使用 @Transactional 注解，只能当你设置了基于接口的代理时它才生效。

因为注解是 不能继承 的，这就意味着如果正在使用基于类的代理时，那么事务的设置将不能被基于类的代理所识别，而且对象也将不会被事务代理所包装。

## 3、常见原因

**原因一：**

是否是数据库引擎设置不对造成的。比如我们最常用的mysql，引擎MyISAM，是不支持事务操作的。需要改成InnoDB才能支持

**原因二：**

入口的方法必须是public，否则事务不起作用（这一点由Spring的AOP特性决定的，理论上而言，不public也能切入，但spring可能是觉得private自己用的方法，应该自己控制，不应该用事务切进去吧）。

另外private 方法, final 方法 和 static 方法不能添加事务，加了也不生效

**原因三：** 

Spring的事务管理默认只对出现运行期异常(java.lang.RuntimeException及其子类)进行回滚（至于为什么spring要这么设计：因为spring认为Checked的异常属于业务的，coder需要给出解决方案而不应该直接扔该框架）


正常情况下是直接在方法上使用throw抛出异常，@Transactional直接生效，

但是如果想在代码里使用try catch捕获异常，则@Transactional会失效，解决办法如下：两处必要配置

```java
@Transactional(rollbackFor = Exception.class)//必要
@Override
public Boolean testTransaction(String param) {
    try {
        deleteXX();
        insertXX();
        return true;
    } catch (Exception e) {
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();//必要
        log.error("异常",e);
        return false;
    }
}
```


**原因四：**

@EnableTransactionManagement  // 启注解事务管理，等同于xml配置方式的 `<tx:annotation-driven />`

 备注：本系列所有博文的讨论都针对于springboot而不再对spring做说明。

@EnableTransactionManagement 在springboot1.4以后可以不写。

框架在初始化的时候已经默认给我们注入了两个事务管理器的Bean（JDBC的DataSourceTransactionManager和JPA的JpaTransactionManager ），其实这就包含了我们最常用的Mybatis和Hibeanate了。

当然如果不是AutoConfig的而是自己自定义的，请使用该注解开启事务

**原因五：**

请确认你的类是否被代理了（因为spring的事务实现原理为AOP，只有通过代理对象调用方法才能被拦截，事务才能生效）

**原因六：**

请确保你的业务和事务入口在同一个线程里，否则事务也是不生效的，比如下面代码事务不生效：

```java
@Transactional
@Override
public void save(User user1, User user2) {
    new Thread(() -> {
          saveError(user1, user2);
          System.out.println(1 / 0);
    }).start();
}
```

**原因六：**

也是我最想要去讲的一个原因：service方法中调用本类中的另一个方法，事务没有生效。这里我把当初保存的几张对比图贡献给大家参考，一目了然：

@Transactional的事务开启 ，或者是基于接口的 或者是基于类的代理被创建。所以在同一个类中一个无事务的方法调用另一个有事务的方法，事务是不会起作用的

（这就是业界老问题：类内部方法调用事务不生效的问题原因）。






# @EnableTransactionManagement分析

## 说明

@EnableTransactionManagement是 spring-tx 的注解，不是 spring-boot 的

spring-boot 会自动配置事务，相关的配置在 org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration，在自动配置类里已经写好了 

@EnableTransactionManagement

## 流程

本文主要说明怎么从 `@EnableTransactionManagement` 到 AutoProxyRegistrar#registerBeanDefinitions 的调用过程,从而注册我们的BeanDefinition [即添加到beanDefinitionMap]

断点打到 org.springframework.transaction.annotation.TransactionManagementConfigurationSelector#selectImports，观察其堆栈

```java
org.springframework.context.annotation.ConfigurationClassParser#processImports
…………省略
    if (candidate.isAssignable(ImportSelector.class)) {
       // Candidate class is an ImportSelector -> delegate to it to determine imports
       Class<?> candidateClass = candidate.loadClass();
       ImportSelector selector = ParserStrategyUtils.instantiateClass(candidateClass, ImportSelector.class,
             this.environment, this.resourceLoader, this.registry);
       Predicate<String> selectorFilter = selector.getExclusionFilter();
       if (selectorFilter != null) {
          exclusionFilter = exclusionFilter.or(selectorFilter);
       }
       if (selector instanceof DeferredImportSelector) {
          this.deferredImportSelectorHandler.handle(configClass, (DeferredImportSelector) selector);
       }
       else {
          String[] importClassNames = selector.selectImports(currentSourceClass.getMetadata());
          Collection<SourceClass> importSourceClasses = asSourceClasses(importClassNames, exclusionFilter);
          processImports(configClass, currentSourceClass, importSourceClasses, exclusionFilter, false);
       }
    }
…………
​

```

配置类，递归调用

断点打到 org.springframework.context.annotation.ConfigurationClass#addImportBeanDefinitionRegistrar

往importBeanDefinitionRegistrars 这个Map存了一个实体；key为AutoProxyRegistrar的实例，value为StandardAnnotationMetadata实例；

断点打到org.springframework.context.annotation.AutoProxyRegistrar#registerBeanDefinitions

发现其调用堆栈从 org.springframework.context.annotation.ConfigurationClassPostProcessor#processConfigBeanDefinitions 开始；
调到this.reader.loadBeanDefinitions(configClasses); 后面执行遍历把我们的执行到AutoProxyRegistrar#registerBeanDefinitions这个方法的；

总结一下其调用堆栈

1.ConfigurationClassPostProcessor#processConfigBeanDefinitions

2.递归调用ConfigurationClassParser#processImports ,往importBeanDefinitionRegistrars 这个Map存了一个实体；key为AutoProxyRegistrar的实例

3.this.reader.loadBeanDefinitions(configClasses)

4.AutoProxyRegistrar#registerBeanDefinitions ,添加BeanDefinition

# 添加了什么 beanDefinition?

![beanDefinition](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04c5dc7bf4554b7a9645213b4b1ff1a2~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

AnnotationAwareAspectJAutoProxyCreator

## 解析切面

把实现了Advisor接口的类实例化

org.springframework.aop.framework.autoproxy.BeanFactoryAdvisorRetrievalHelper#findAdvisorBeans

## 创建动态代理

org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#postProcessAfterInitialization

每个类getBean的时候都会被调用,判断当前Bean是否切中表达式,这里是带有@Transactional的;



# MySQL AutoCommit 带来的问题

## 现象描述

测试中发现，服务A在得到了服务B的注册用户成功response以后，开始调用查询用户信息接口，却发现无法查询出任何结果。

检查binlog发现，在查询请求之前，数据库确实已经完成了commit操作，并且可以在sqlyog等客户端工具中查询出正确的结果。

下面是这个流程的时序图：

![seq](https://ask.qcloudimg.com/http-save/yehe-8492898/a4e8fd8ca24149badae3ca1a0d16c95d.png)

问题出现在Server A向数据库发起查询的时候，返回的结果总是空。

## 问题分析

这个问题显然是一个事务隔离的问题，最开始的思路是，服务A所在的机器，其事务开启时间应该是在服务B的机器commit操作之前开启的，但是通过DEBUG日志分析connection的获取和提交时间，发现两个服务器之间不存在这样的关系，服务B永远是在服务A返回了正确的response之后才会调用数据库接口，进行getConnection操作，进而进行查询操作。

显然这并不能支持刚才的设想，但是结论一定是正确的，就是因为事务隔离级别导致了Server A读到的永远是快照，发生了可重复读。

后来调整了一下思路，发现MySQL还有一个特性就是AutoCommit，即默认情况下，MySQL是开启事务的，下面表格能说明问题，表1：

![table1](https://ask.qcloudimg.com/http-save/yehe-8492898/faed6190d3b04727a595c837dc457ea2.png)

但是，如果AutoCommit不是默认开启呢？

结果就会变成下面的表格，表2：

![t2](https://ask.qcloudimg.com/http-save/yehe-8492898/47eacd7765f2fc20772037f3a7984f92.png)

在关闭AutoCommit的条件下，SessionA在T1和T2两个时间点执行的SQL语句其实在一个事务里，因此每次读到的其实只是一个快照。

那么在连接池条件下，情况如何？

设置一个极端条件，连接池只给一个连接，编写两个类，一个负责插入数据，一个负责循环读取数据，但是读取数据的类在执行读取方法之前，会执行一个空方法，这个方法只会做一件事情，就是获取连接，将其AutoCommit设置为FALSE，关闭连接。

两段代码如下：

写入线程：

```java
public static void main( String[] args ) throws Exception
    {
        DBconfigEntity entity = new DBconfigEntity();
        entity.setDbName("test");
        entity.setDbPasswd("123456");
        entity.setDbUser("root");
        entity.setIp("127.0.0.1");
        entity.setPort(3306);
        MysqlClient.init(entity);
        MysqlClient instance = MysqlClient.getInstance();
 
        Connection conn = instance.getConnection();
        conn.setAutoCommit(false);
        String sql = "insert into test1(uname) values (?)";
        PreparedStatement statement = conn.prepareStatement(sql);
        statement.setString(1, "PPP");
        statement.executeUpdate();
        conn.commit();
 
        statement.close();
        conn.close();
 
        //永远休眠，但是永远持有连接池
        Thread.sleep(Long.MAX_VALUE);
    }
```

读取类：

```java
public class GetClient {
 
    private void query() throws SQLException
    {
        System.out.println("start");
        MysqlClient instance = MysqlClient.getInstance();
        Connection conn = instance.getConnection();
        String sql = "select uname from test1";
        PreparedStatement statement = conn.prepareStatement(sql);
        ResultSet rs = statement.executeQuery();
        while (rs.next()) {
            System.out.println(rs.getString("uname"));
        }
 
        statement.close();
        rs.close();
        conn.close();
    }
 
    private void nothing() throws SQLException
    {
        MysqlClient instance = MysqlClient.getInstance();
        Connection conn = instance.getConnection();
        conn.setAutoCommit(false);
        conn.close();
 
    }
    public static void main(String[] args) throws SQLException, InterruptedException, ClassNotFoundException {
        DBconfigEntity entity = new DBconfigEntity();
        entity.setDbName("test");
        entity.setDbPasswd("123456");
        entity.setDbUser("root");
        entity.setIp("127.0.0.1");
        entity.setPort(3306);
        MysqlClient.init(entity);
 
        GetClient client = new GetClient();
        client.nothing();
        while (true) {
            client.query();
            Thread.sleep(5000);
        }
    }
}
```

表初始没有任何数据，首先运行读取类，此时读取类只会不停的打印“start”，此时启动写入类，观察发现，console并不会打印数据库test1表查询的结果，但是在数据库工具中查看，test1表确实已经有了数据。

**这是因为在连接池条件下，如果这个连接之前被借出过，并且曾经被设置成了AutoCommit为FALSE，那么这个连接在其生存时间内，永远会默认开启事务，这是MySQL自身决定的，因为连接池只是持有连接，代码中的close操作只是将该连接还给连接池，但是并没有真的将连接销毁，因此连接的属性仍然保持上次设置的样子。**

当另一个方法开始，重新执行getConnection获取链接时，是有可能获取到之前被设置为AutoCommit为FALSE的连接的，这个时候就相当于上面的表2中Session A在T3时间点的情况，无论如何查询，都会查不出任何数据来。

如下图：

```
select @@autocommit;    # 查看自动提交属性
```

无论如何commit，都无法改变这个连接的autocommit属性。

因为测试时采用的是一个连接这种极端条件，因此该现象非常容易复现，且是100%的复现，但是在测试条件下，并非100%复现，而是在重启之后会好一段时间，一段时间以后就会重新出现这个情况。

如果将读取类的代码稍加修改：

```java
public class GetClient {
 
    private void query() throws SQLException
    {
        System.out.println("start");
        MysqlClient instance = MysqlClient.getInstance();
        Connection conn = instance.getConnection();
        conn.setAutoCommit(true);
        String sql = "select uname from test1";
        PreparedStatement statement = conn.prepareStatement(sql);
        ResultSet rs = statement.executeQuery();
        while (rs.next()) {
            System.out.println(rs.getString("uname"));
        }
 
        statement.close();
        rs.close();
        conn.close();
    }
 
    private void nothing() throws SQLException
    {
        MysqlClient instance = MysqlClient.getInstance();
        Connection conn = instance.getConnection();
        conn.setAutoCommit(false);
        conn.close();
 
    }
    public static void main(String[] args) throws SQLException, InterruptedException, ClassNotFoundException {
        DBconfigEntity entity = new DBconfigEntity();
        entity.setDbName("test");
        entity.setDbPasswd("123456");
        entity.setDbUser("root");
        entity.setIp("127.0.0.1");
        entity.setPort(3306);
        MysqlClient.init(entity);
 
        GetClient client = new GetClient();
        client.nothing();
        while (true) {
            client.query();
            Thread.sleep(5000);
        }
    }
}
```

注意我在query方法中加入这一句：conn.setAutoCommit(true);

此时这个问题不再出现。

## 源码分析

### jdbc驱动源码分析

Connection是Java提供的一个标准接口：java.sql.Connection，其具体实现是：com.mysql.jdbc.ConnectionImpl。

分析jdbc驱动代码可知，jdbc默认的AutoCommit状态是TRUE：

这实际上和MySQL的默认值是一样的。

### tomcat-jdbc源码分析

tomcat-jdbc的close方法由拦截器实现，具体的逻辑代码：

```java
if (compare(CLOSE_VAL,method)) {
            if (connection==null) return null; //noop for already closed.
            PooledConnection poolc = this.connection;
            this.connection = null;
            pool.returnConnection(poolc);
            return null;
}
```

实际上此处只是将连接还给了连接池，没有对连接进行任何处理。

tomcat-jdbc维护了两个Queue：busy和idle，用于存放空闲和已借出连接，连接还给连接池的过程简单的说就是将该连接从busy队列中移除，并放在idle队列中的过程。

### boneCP源码分析

根据实际使用的经验看，boneCP连接池在使用的过程中并没有出现这个问题，分析boneCP的Connection具体实现，发现在close方法的具体实现中，有这样的一段代码逻辑：

```java
if (!getAutoCommit()) {
    setAutoCommit(true);
}
```

这段逻辑会判断该连接的AutoCommit属性是否为FALSE，如果是，就自动将其置为TRUE。

因此，在这个连接被交还回连接池时，AutoCommit属性总是TRUE。

## 结论

任何查询接口都应该在获取连接以后进行AutoCommit的设置，将其设置为true。


# 参考资料

https://juejin.cn/post/7103786671673769997

[enabletransactionmanagement不生效](https://juejin.cn/s/enabletransactionmanagement%E4%B8%8D%E7%94%9F%E6%95%88)

[Spring事务不生效的原因大解读](https://cloud.tencent.com/developer/article/1497449)

https://blog.csdn.net/qq_21508727/article/details/82705028

[mysql 事务之基本用法与手动提交](https://www.jianshu.com/p/5b08285b4d99)

[jdbc操作AutoCommit](https://blog.csdn.net/tengdazhang770960436/article/details/7061704)

[JDBC的autoCommit为true时，其事务管理测试](https://blog.csdn.net/LeonWang_Fly/article/details/50116961)

[google pdf](https://books.google.com/books?id=KjpgEAAAQBAJ&pg=PT76&lpg=PT76&dq=mysql+url+%E6%8C%87%E5%AE%9A+autoCommit+%E5%B1%9E%E6%80%A7&source=bl&ots=VOT529Dgp3&sig=ACfU3U1doNX6L5ki4aKZUaeQjjNpGluUjA&hl=zh-CN&sa=X&ved=2ahUKEwjqg7n768KAAxVeSzABHeWgBtcQ6AF6BAgdEAM#v=onepage&q=mysql%20url%20%E6%8C%87%E5%AE%9A%20autoCommit%20%E5%B1%9E%E6%80%A7&f=false)

[MySQL AutoCommit带来的问题](https://cloud.tencent.com/developer/article/2075183)

* any list
{:toc}