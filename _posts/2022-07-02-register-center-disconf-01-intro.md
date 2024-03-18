---
layout: post
title: 分布式配置管理平台 Disconf 01 入门介绍
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# Disconf

Distributed Configuration Management Platform(分布式配置管理平台)

专注于各种「分布式系统配置管理」的「通用组件」和「通用平台」, 提供统一的「配置管理服务」。

> [disconf_zh_CN](http://disconf.readthedocs.io/zh_CN/latest/)

> [disconf_github](https://github.com/knightliao/disconf)

## 主要目标：

部署极其简单：同一个上线包，无须改动配置，即可在 多个环境中(RD/QA/PRODUCTION) 上线

部署动态化：更改配置，无需重新打包或重启，即可 实时生效

统一管理：提供web平台，统一管理 多个环境(RD/QA/PRODUCTION)、多个产品 的所有配置

核心目标：一个jar包，到处运行

## demos && 文档 && 协作

demos: https://github.com/knightliao/disconf-demos-java

wiki: https://github.com/knightliao/disconf/wiki

文档: http://disconf.readthedocs.io

## 功能特点

- 支持配置（配置项+配置文件）的分布式化管理

- 配置发布统一化

- 配置发布、更新统一化:

- 同一个上线包 无须改动配置 即可在 多个环境中(RD/QA/PRODUCTION) 上线

- 配置存储在云端系统，用户统一管理 多个环境(RD/QA/PRODUCTION)、多个平台 的所有配置

- 配置更新自动化：用户在平台更新配置，使用该配置的系统会自动发现该情况，并应用新配置。特殊地，如果用户为此配置定义了回调函数类，则此函数类会被自动调用。

- 极简的使用方式（注解式编程 或 XML无代码侵入模式）：我们追求的是极简的、用户编程体验良好的编程方式。目前支持两种开发模式：基于XML配置或者基于注解，即可完成复杂的配置分
布式化。

注：配置项是指某个类里的某个Field字段。

## 其它功能特点

- 低侵入性或无侵入性、强兼容性：

- 低侵入性：通过极少的注解式代码撰写，即可实现分布式配置。

- 无侵入性：通过XML简单配置，即可实现分布式配置。

- 强兼容性：为程序添加了分布式配置注解后，开启Disconf则使用分布式配置；若关闭Disconf则使用本地配置；若开启Disconf后disconf-web不能正常Work，则Disconf使用本地配置。

- 支持配置项多个项目共享，支持批量处理项目配置。

- 配置监控：平台提供自校验功能（进一步提高稳定性），可以定时校验应用系统的配置是否正确。

# 1. TutorialSummary 分布式配置系统功能概述

## 1.1. 托管配置

通过简单的注解类方式 托管配置。托管后，本地不需要此配置文件，统一从配置中心服务获取。

当配置被更新后，注解类的数据自动同步。

```java
@Service
@DisconfFile(filename = "redis.properties")
public class JedisConfig {

    // 代表连接地址
    private String host;

    // 代表连接port
    private int port;

    /**
     * 地址, 分布式文件配置
     *
     * @return
     */
    @DisconfFileItem(name = "redis.host", associateField = "host")
    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    /**
     * 端口, 分布式文件配置
     *
     * @return
     */
    @DisconfFileItem(name = "redis.port", associateField = "port")
    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }
}
```

## 1.2. 配置更新回调

如果配置更新时，您需要的是 不仅注解类自动同步，并且其它类也需要做些变化，那么您需要一个回调来帮忙。

```java
@Service
@Scope("singleton")
@DisconfUpdateService(classes = { JedisConfig.class }) // 这里或者写成 @DisconfUpdateService(confFileKeys = { "redis.properties" })
public class SimpleRedisServiceUpdateCallback implements IDisconfUpdate
```

## 1.3. 支持基于XML的配置文件托管

除了支持基于注解式的配置文件，我们还支持 基于XML无代码侵入式的：

（properties文件更新时数据自动同步reload，非properties文件需要写回调来支持数据自动同步）

```xml
<bean id="configproperties_disconf"
      class="com.baidu.disconf.client.addons.properties.ReloadablePropertiesFactoryBean">
    <property name="locations">
        <list>
            <value>classpath:/autoconfig.properties</value>
            <value>classpath:/autoconfig2.properties</value>
            <value>classpath:/myserver_slave.properties</value>
            <value>classpath:/testJson.json</value>
            <value>classpath:/testXml2.xml</value>
            <value>myserver.properties</value>
        </list>
    </property>
</bean>

<bean id="propertyConfigurer"
      class="com.baidu.disconf.client.addons.properties.ReloadingPropertyPlaceholderConfigurer">
    <property name="propertiesArray">
        <list>
            <ref bean="configproperties_disconf"/>
        </list>
    </property>
</bean>

<bean id="autoService" class="com.example.disconf.demo.service.AutoService">
    <property name="auto" value="${auto=100}"/>
</bean>
```

## 1.4. 支持配置项

变量亦支持分布式配置哦

```java
@DisconfItem(key = key)
public Double getMoneyInvest() {
    return moneyInvest;
}
```

## 1.5. 支持静态配置

除了支持@Service类以外，我们还支持 静态配置

```java
@DisconfFile(filename = "static.properties")
public class StaticConfig {

    private static int staticVar;

    @DisconfFileItem(name = "staticVar", associateField = "staticVar")
    public static int getStaticVar() {
        return staticVar;
    }
}
```

## 1.6. 支持基于XML的配置文件托管: 不会自动reload

与 支持基于XML的配置文件托管 相对应，只是在配置文件更改时，不会自动reload到java bean里。

值得说的是，此种方式支持 任意类型 格式配置文件。

```xml
<!-- 使用托管方式的disconf配置(无代码侵入, 配置更改不会自动reload)-->
<bean id="configproperties_no_reloadable_disconf"
      class="com.baidu.disconf.client.addons.properties.ReloadablePropertiesFactoryBean">
    <property name="locations">
        <list>
            <value>myserver.properties</value>
        </list>
    </property>
</bean>

<bean id="propertyConfigurerForProject1"
      class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="ignoreResourceNotFound" value="true"/>
    <property name="ignoreUnresolvablePlaceholders" value="true"/>
    <property name="propertiesArray">
        <list>
            <ref bean="configproperties_no_reloadable_disconf"/>
        </list>
    </property>
</bean>
```

## 1.7. 过滤要进行托管的配置

有时候你不想托管所有的配置文件，有1~2个配置文件你只想和本地的，可以：

```
# 忽略哪些分布式配置，用逗号分隔
ignore=jdbc-mysql.properties
```

## 1.8. 强大的WEB配置平台控制

在WEB配置平台上，您可以

上传、更新 您的配置文件、配置项（有邮件通知），并且实现动态推送。

批量下载配置文件，查看ZK上部署情况

查看 此配置的影响范围： 哪些机器在使用，各机器上的配置内容各是什么，并且自动校验 一致性。

支持 自动化校验配置一致性。

简单权限控制

# MORE

https://disconf.readthedocs.io/zh-cn/latest/tutorial-client/index.html

https://disconf.readthedocs.io/zh-cn/latest/tutorial-web/index.html

https://disconf.readthedocs.io/zh-cn/latest/config/index.html

# 参考资料

https://github.com/knightliao/disconf

* any list
{:toc}