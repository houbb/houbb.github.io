---
layout: post
title: MySQL 07 mysql 断线重连报错 The last packet successfully received from the server was xxxxxx milliseconds ago
date:  2017-02-27 21:44:46 +0800
categories: [SQL]
tags: [mysql, database, sql]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

# 说明

最近做 mysql 处理，遇到一个异常。

```
The last packet successfully received from the server was xxxxxx milliseconds ago
```

看到一篇文章写的不错。

## mysql 断线重连报错

```
The last packetsent successfully to the server was 56,506,871 milliseconds ago.
islonger than the server configuredvalue of 'wait_timeout'. You shouldconsider
either expiring and/ortesting connection validity beforeuse in your application, 
increasingthe server configured valuesfor client timeouts, or using 
theConnector/J connection property'autoReconnect=true' to avoid thisproblem.
```

首先我说下我的开发环境，springboot2.1.4， 我这里是需要多个数据源，用的是阿里的Druid连接池，出现这个报错的都是从库，主库目前还没出现这种情况，我的mysql是5.7的，数据库默认的wait_timeout是28800，8小时，好，下面贴下我的从库的配置(单数据源的就比较简单了,此配置就可以搞定了)：

```yaml
 deputy:  #从数据源
        enabled: true
        driverClassName: com.mysql.cj.jdbc.Driver
        url: jdbc:mysql://localhost:3306/xxxxxxxx?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&allowMultiQueries=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai
        username: root
        password: root
        # 初始连接数
        initialSize: 10
        # 最大连接池数量
        maxActive: 100
        # 最小连接池数量
        minIdle: 10
        # 配置获取连接等待超时的时间
        maxWait: 60000
        poolPreparedStatements: true
        maxPoolPreparedStatementPerConnectionSize: 20

        # 配置一个连接在池中最大生存的时间，单位是毫秒 900000
        maxEvictableIdleTimeMillis: 200000
        # 配置一个连接在池中最小生存的时间，单位是毫秒 100000
        minEvictableIdleTimeMillis: 100000

        validationQuery: SELECT 1
        # 10000
        validationQueryTimeout: 10000
		#建议配置为true，不影响性能，并且保证安全性。申请连接的时候检测，如果空闲时间大于
        #timeBetweenEvictionRunsMillis，执行validationQuery检测连接是否有效。
        testWhileIdle: true
        # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒   60000
        timeBetweenEvictionRunsMillis: 60000
        #指明是否在从池中取出连接前进行检验,如果检验失败,
        #则从池中去除连接并尝试取出另一个.
        testOnBorrow: false
        testOnReturn: false
        filters: stat,log4j2

        # 是否在自动回收超时连接的时候打印连接的超时错误
        #logAbandoned: true
        # 是否自动回收超时连接
        #removeAbandoned: true
        # 超时时间(以秒数为单位) 这里1800就是30分钟，这个时间要小于数据库的wait_timeout
        #数据库的wait_timeout单位是秒，默认是8小时，超过8小时数据库就自动断开连接
        #removeAbandonedTimeout: 1800
```

数据库默认wait_timeout是8小时，超过8小时就自动断开连接，一觉醒来 来上班，就报这个鬼玩意，重启项目是没问题的，我总不能每天都重启吧

下面来分析几种方法
方法1：
url后面加 autoReconnect=true ，我试过了，我的mysql5.7 没卵用，

方法2：
加 testWhileIdle: true timeBetweenEvictionRunsMillis: 60000，等等都没用，我干

方法3：
加 removeAbandoned: true removeAbandonedTimeout: 1800 ，它不报The last packetsent successfully to the server was 56,506,871 milliseconds ago 这种错了，报database colse这种错， 还是不行，

方法4：
修改 mysql的wait_timeout，最大24天左右， 不是不行，是不敢，服务器上N多项目，到时候扎堆的空闲连接，无法回收，那还不炸了，不靠谱
写到这，我已经心灰意冷了，

方法5：
我用了个最沙雕的方法，做个定时任务去查询我的从数据源，随便写个select ,每5小时，或者6小时执行一次，反正不超过8小时就行，保证mysql一直能连接，
求解脱。。。。。。

方法6： 最终方案

yml文件中添加两个属性

```yaml
keepAlive: true
phyTimeoutMillis: 25200000
```

全局如下：

```yaml
 deputy:  #从数据源
        enabled: true
        driverClassName: com.mysql.cj.jdbc.Driver
        url: jdbc:mysql://localhost:3306/xxxxxxxx?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&allowMultiQueries=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai
        username: root
        password: root
        # 初始连接数
        initialSize: 10
        # 最大连接池数量
        maxActive: 100
        # 最小连接池数量
        minIdle: 10
        # 配置获取连接等待超时的时间
        maxWait: 60000
        poolPreparedStatements: true
        maxPoolPreparedStatementPerConnectionSize: 20

        # 配置一个连接在池中最大生存的时间，单位是毫秒 900000
        maxEvictableIdleTimeMillis: 200000
        # 配置一个连接在池中最小生存的时间，单位是毫秒 100000
        minEvictableIdleTimeMillis: 100000

        validationQuery: SELECT 1
        # 10000
        validationQueryTimeout: 10000
		#建议配置为true，不影响性能，并且保证安全性。申请连接的时候检测，如果空闲时间大于
        #timeBetweenEvictionRunsMillis，执行validationQuery检测连接是否有效。
        testWhileIdle: true
        # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒   60000
        timeBetweenEvictionRunsMillis: 60000
        #指明是否在从池中取出连接前进行检验,如果检验失败,
        #则从池中去除连接并尝试取出另一个.
        testOnBorrow: false
        testOnReturn: false
        filters: stat,log4j2
        # 连接池中的minIdle数量以内的连接，空闲时间超过minEvictableIdleTimeMillis，则会执行keepAlive操作
        keepAlive: true
        # 允许物理连接最大存活时间，单位是毫秒
        phyTimeoutMillis: 25200000
```


在添加数据源的代码中配置它的一些属性：

```java
 public DataSource deputyDataSource(Environment env)
    {
        Properties prop = build(env, "spring.datasource.druid.deputy.");
        AtomikosDataSourceBean xaDataSource = new AtomikosDataSourceBean();
        xaDataSource.setXaDataSourceClassName(xaDataSourceClassName);
        xaDataSource.setUniqueResourceName(DataSourceType.DEPUTY.name());
        xaDataSource.setXaProperties(prop);
        xaDataSource.setMaxIdleTime(25200);
        xaDataSource.setMaxLifetime(25200);
        xaDataSource.setTestQuery("SELECT 1 ");
        xaDataSource.setMaxPoolSize(100);
        xaDataSource.setMinPoolSize(5);
        return xaDataSource;
    }
```

我这里是通过这个build方法，获取yml的配置属性的，这里put的属性，在yml文件中一定要有，不然报空指针，主从库都要添加，具体看所使用的框架

```java
    private Properties build(Environment env, String prefix) {
        Properties prop = new Properties();
        prop.put("url", env.getProperty(prefix + "url"));
        prop.put("username", env.getProperty(prefix + "username"));
        prop.put("password", env.getProperty(prefix + "password"));
        prop.put("driverClassName", env.getProperty(prefix + "driverClassName", ""));
        prop.put("initialSize", env.getProperty(prefix + "initialSize", Integer.class));
        prop.put("maxActive", env.getProperty(prefix + "maxActive", Integer.class));
        prop.put("minIdle", env.getProperty(prefix + "minIdle", Integer.class));
        prop.put("maxWait", env.getProperty(prefix + "maxWait", Integer.class));
        //prop.put("maxEvictableIdleTimeMillis", env.getProperty(prefix + "maxEvictableIdleTimeMillis", Integer.class));
        prop.put("poolPreparedStatements", env.getProperty(prefix + "poolPreparedStatements", Boolean.class));
        prop.put("maxPoolPreparedStatementPerConnectionSize",
                env.getProperty(prefix + "maxPoolPreparedStatementPerConnectionSize", Integer.class));
        prop.put("maxPoolPreparedStatementPerConnectionSize",
                env.getProperty(prefix + "maxPoolPreparedStatementPerConnectionSize", Integer.class));
        prop.put("validationQuery", env.getProperty(prefix + "validationQuery"));
        prop.put("validationQueryTimeout", env.getProperty(prefix + "validationQueryTimeout", Integer.class));
        prop.put("testOnBorrow", env.getProperty(prefix + "testOnBorrow", Boolean.class));
        prop.put("testOnReturn", env.getProperty(prefix + "testOnReturn", Boolean.class));
        prop.put("testWhileIdle", env.getProperty(prefix + "testWhileIdle", Boolean.class));
        prop.put("timeBetweenEvictionRunsMillis",
                env.getProperty(prefix + "timeBetweenEvictionRunsMillis", Integer.class));
        prop.put("minEvictableIdleTimeMillis", env.getProperty(prefix + "minEvictableIdleTimeMillis", Integer.class));
        prop.put("filters", env.getProperty(prefix + "filters"));
        prop.put("keepAlive", env.getProperty(prefix + "keepAlive", Boolean.class));
        prop.put("phyTimeoutMillis", env.getProperty(prefix + "phyTimeoutMillis", Integer.class));
        return prop;
    }
```

# 参考资料

https://blog.csdn.net/weixin_45204847/article/details/112282739

* any list
{:toc}