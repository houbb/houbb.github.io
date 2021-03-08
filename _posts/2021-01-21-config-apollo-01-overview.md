---
layout: post
title:  apollo-01-配置中心
date:  2021-01-21 16:52:15 +0800
categories: [Java]
tags: [java, skill, sh]
published: true
---

# 准备工作

## mysql

```
mysql> SHOW VARIABLES WHERE Variable_name = 'version';
+---------------+--------+
| Variable_name | Value  |
+---------------+--------+
| version       | 5.7.24 |
+---------------+--------+
```

## java

```
java -version
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

# 下载

直接 github 下载

```
$   git clone https://github.com/nobodyiam/apollo-build-scripts.git
```


# 数据库初始化

## 创建 ApolloPortalDB

通过各种MySQL客户端导入 `sql/apolloportaldb.sql` 即可。

我这里直接执行内容。

### 验证

```
mysql> show tables;
+--------------------------+
| Tables_in_apolloportaldb |
+--------------------------+
| app                      |
| appnamespace             |
| authorities              |
| consumer                 |
| consumeraudit            |
| consumerrole             |
| consumertoken            |
| favorite                 |
| permission               |
| role                     |
| rolepermission           |
| serverconfig             |
| userrole                 |
| users                    |
+--------------------------+

mysql> select `Id`, `AppId`, `Name` from ApolloPortalDB.App;
+----+-----------+------------+
| Id | AppId     | Name       |
+----+-----------+------------+
|  1 | SampleApp | Sample App |
+----+-----------+------------+
```

## 创建ApolloConfigDB

通过各种MySQL客户端导入 `sql/apolloconfigdb.sql` 即可。

我这里直接执行内容。

## 验证

```
mysql> select `NamespaceId`, `Key`, `Value`, `Comment` from ApolloConfigDB.Item;
+-------------+---------+-------+----------------------+
| NamespaceId | Key     | Value | Comment              |
+-------------+---------+-------+----------------------+
|           1 | timeout | 100   | sample timeout配置   |
+-------------+---------+-------+----------------------+
```

## 配置数据库连接信息

Apollo服务端需要知道如何连接到你前面创建的数据库，所以需要编辑demo.sh，修改ApolloPortalDB和ApolloConfigDB相关的数据库连接串信息。

```sh
# apollo config db info
apollo_config_db_url="jdbc:mysql://localhost:3306/ApolloConfigDB?characterEncoding=utf8&serverTimezone=Asia/Shanghai"
apollo_config_db_username=root
apollo_config_db_password=123456

# apollo portal db info
apollo_portal_db_url="jdbc:mysql://localhost:3306/ApolloPortalDB?characterEncoding=utf8&serverTimezone=Asia/Shanghai"
apollo_portal_db_username=root
apollo_portal_db_password=123456
```

添加对应的账户信息，其他的保持不变。


## 启动

### 端口

Quick Start脚本会在本地启动3个服务，分别使用8070, 8080, 8090端口，请确保这3个端口当前没有被使用。

### 执行启动脚本

这里使用的 sh 脚本，如果本地没有可以下载 git bash

```
./demo.sh start
```


看到如下日志，说明启动成功：

```
==== starting service ====
Service logging file is ./service/apollo-service.log
Started [10768]
Waiting for config service startup.......
Config service started. You may visit http://localhost:8080 for service status now!
Waiting for admin service startup....
Admin service started
==== starting portal ====
Portal logging file is ./portal/apollo-portal.log
Started [10846]
Waiting for portal startup......
Portal started. You can visit http://localhost:8070 now!
```

这里只是测试，真实生产参见 [分布式部署指南](https://ctripcorp.github.io/apollo/#/zh/deployment/distributed-deployment-guide)

### 异常排查

如果启动遇到了异常，可以分别查看service和portal目录下的log文件排查问题。

注：在启动apollo-configservice的过程中会在日志中输出eureka注册失败的信息，如com.sun.jersey.api.client.ClientHandlerException: java.net.ConnectException: Connection refused。需要注意的是，这个是预期的情况，因为apollo-configservice需要向Meta Server（它自己）注册服务，但是因为在启动过程中，自己还没起来，所以会报这个错。后面会进行重试的动作，所以等自己服务起来后就会注册正常了。

- 自己遇到的问题

服务启动失败：

异常如下：

```
Caused by: org.hibernate.HibernateException: Access to DialectResolutionInfo cannot be null when 'hibernate.dialect' not set
```

- 解决方案

把 demo.sh 中的 localhost 修改为 127.0.0.1


# 使用

## 访问

浏览器 [http://127.0.0.1:8070](http://127.0.0.1:8070)

可以进入到登陆页

## 登陆

输入账户

用户名: apollo

密码: admin

进行登陆

## 配置

点击SampleApp进入配置界面，可以看到当前有一个配置timeout=100 配置界面

# 参考资料

[Apollo 配置中心的使用](http://www.bubuko.com/infodetail-3085698.html)

[springboot启动出现Access to DialectResolutionInfo cannot be null when 'hibernate.dialect' not set](https://blog.csdn.net/u010372981/article/details/89857112)

https://ctripcorp.github.io/apollo/#/zh/deployment/quick-start

* any list
{:toc}