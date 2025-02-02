---
layout: post
title: IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# IM 开源系列

[IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力](https://houbb.github.io/2024/11/02/im-41-opensouce-yehuo-overview)

[IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统](https://houbb.github.io/2024/11/02/im-42-opensouce-yuanrw-im-intro)

[IM 即时通讯系统-43-简单的仿QQ聊天安卓APP](https://houbb.github.io/2024/11/02/im-43-opensouce-xiuweikang-im)

[IM 即时通讯系统-44-仿QQ即时通讯系统服务端](https://houbb.github.io/2024/11/02/im-44-opensouce-kingston-csj-im)

[IM 即时通讯系统-45-merua0oo0 IM 分布式聊天系统](https://houbb.github.io/2024/11/02/im-45-opensouce-merua0oo0-im)

[IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案](https://houbb.github.io/2024/11/02/im-46-opensouce-open-im-intro)

[IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案](https://houbb.github.io/2024/11/02/im-47-opensouce-beardlessCat-im-intro)

[IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK](https://houbb.github.io/2024/11/02/im-48-opensouce-aurora-imui-intro)

[IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件](https://houbb.github.io/2024/11/02/im-49-opensouce-nim-uikit-android-intro)

[IM 即时通讯系统-50-📲cim(cross IM) 适用于开发者的分布式即时通讯系统](https://houbb.github.io/2024/11/02/im-50-opensouce-cim-intro)

[IM 即时通讯系统-51-MPush开源实时消息推送系统](https://houbb.github.io/2024/11/02/im-51-opensouce-mpush-intro)

[IM 即时通讯系统-52-leo-im 服务端](https://houbb.github.io/2024/11/02/im-52-opensouce-leo-im-intro)

[IM 即时通讯系统-53-im system server](https://houbb.github.io/2024/11/02/im-53-opensouce-linyu-intro)


# IM

[IM](https://github.com/yuanrw/IM?tab=readme-ov-file) 是一个轻量级的即时通信服务端。提供客户端jar包，方便集成二次开发。

## 功能

* 单聊：文字/文件
* 已发送/已送达/已读回执
* 支持集成ldap
* 支持集成第三方登录系统
* 方便水平扩展
* 提供客户端jar包

## 快速上手

### 准备工作
使用docker快速启动 IM 服务。

```
# detect if the docker environment is avaliable.
docker -v
```
```
# clone the repository
git clone git@github.com:yuanrw/IM.git
```

### 启动服务

```
cd IM/docker
docker-compose up
```

容器内有demo程序，自动启动多个客户端并且随机发送消息，启动成功后输出如下日志:

```
......
2019-08-11 17:29:13.451 client-samples - [Olive] get a msg: 357980857883037697 has been read
2019-08-11 17:29:13.452 client-samples - [yuanrw] get a msg: 357980857887232002 has been read
2019-08-11 17:29:13.452 client-samples - [xianyy] get a msg: 357980857887232001 has been read
2019-08-11 17:29:13.452 client-samples - [Adela] get a msg: 357980857874649089 has been read
2019-08-11 17:29:13.452 client-samples - [Bella] get a msg: 357980857874649090 has been read
2019-08-11 17:29:13.452 client-samples - [Tom] get a msg: 357980857887232000 has been read



sentMsg: 51, readMsg: 51, hasSentAck: 51, hasDeliveredAck: 51, hasReadAck: 51, hasException: 0



2019-08-11 17:29:15.114 client-samples - [Bella]get a msg: 357980866275840002 has been sent
2019-08-11 17:29:15.114 client-samples - [Adela]get a msg: 357980866275840000 has been sent
2019-08-11 17:29:15.114 client-samples - [Cynthia]get a msg: 357980866275840003 has been sent
......
```

## 分布式部署
```
mvn clean package -DskipTests
```
在/target目录下生成 $SERVICE_NAME-$VERSION-bin.zip

### 环境
* java 8+
* mysql 5.7+
* rabbitmq
* redis

### 启动
按照**如下顺序**启动服务:
rest-web --> transfer -->connector

启动`rest-web`的步骤如下,`transfer`和`connector`类似.

#### rest-web
1. 解压

```
unzip rest-web-$VERSION-bin.zip
cd rest-web-$VERSION
```

2. 修改配置文件

```
server.port=8082

# 日志目录
log.path=

# jdbc配置
spring.datasource.url=
......

# redis配置
spring.redis.host=
......

# rabbitmq配置
spring.rabbitmq.host=
......
```

3. 执行`rest.sql`初始化库表

4. 启动服务

```
java -jar rest-web-$VERSION.jar --spring.config.location=application.properties
```

#### transfer
```
java -jar -Dconfig=transfer.properties transfer-$VERSION.jar
```

#### connector
```
java -jar -Dconfig=connector.properties connector-$VERSION.jar
```

## Nginx配置
所有的服务都能够水平扩展，客户端和connector服务端需要保持长连接。
nginx可以如下配置:

```conf
stream {
	upstream backend {
        # connector services port
        server 127.0.0.1:9081         max_fails=3 fail_timeout=30s;
        server 127.0.0.1:19081			max_fails=3 fail_timeout=30s;
	}

    server {
        # to keep a persistent connection
        listen 9999 so_keepalive=on;
        proxy_timeout 1d;
        proxy_pass backend;
    }
}
```

## Login
IM含有一个非常简单的登录系统，可以直接使用。  
也支持以下两种登录方式。

### ldap
这里使用open ldap来登录。  
修改配置文件application.properties

```properties
spi.user.impl.class=com.yrw.im.rest.web.spi.impl.LdapUserSpiImpl

# the following config should be replace with your own config
spring.ldap.base=dc=example,dc=org
# admin
spring.ldap.username=cn=admin,dc=example,dc=org
spring.ldap.password=admin
spring.ldap.urls=ldap://127.0.0.1:389
# user filter，use the filter to search user when login in
spring.ldap.searchFilter=
# search base eg. ou=dev
ldap.searchBase=
# user objectClass
ldap.mapping.objectClass=inetOrgPerson
ldap.mapping.loginId=uid
ldap.mapping.userDisplayName=gecos
ldap.mapping.email=mail
```
```
java -jar rest-web-$VERSION.jar --spring.config.location=application.properties
```
### 自己的登录系统

1. 需要实现`com.yrw.im.rest.spi.UserSpi`中的接口

```java
public interface UserSpi<T extends UserBase> {

    /**
     * get user by username and password, return user(id can not be null)
     * if username and password are right, else return null.
     * <p>
     * be sure that your password has been properly encrypted
     *
     * @param username
     * @param pwd
     * @return
     */
    T getUser(String username, String pwd);

    /**
     * get user by id, if id not exist then return null.
     *
     * @param id
     * @return
     */
    T getById(String id);
}
```

2. 修改配置文件application.properties

```
# 你的实现类的全限定类名
spi.user.impl.class=
```

3. 打包

```
mvn clean package -DskipTests
```

## 使用客户端jar包
一个使用样例:

[MyClient.java](https://github.com/yuanrw/IM/blob/master/client-samples/src/main/java/com/github/yuanrw/im/client/sample/MyClient.java)

# 参考资料

* any list
{:toc}