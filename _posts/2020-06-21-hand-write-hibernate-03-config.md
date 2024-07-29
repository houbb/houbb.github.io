---
layout: post
title:  手写 Hibernate ORM 框架 03-配置文件读取, 数据库连接构建
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 手写 Hibernate 系列

[手写 Hibernate ORM 框架 00-hibernate 简介](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-intro)

[手写 Hibernate ORM 框架 00-环境准备](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-overview)

[手写 Hibernate ORM 框架 01-注解常量定义](https://houbb.github.io/2020/06/21/hand-write-hibernate-01-annotation)

[手写 Hibernate ORM 框架 02-实体 Bean 定义，建表语句自动生成](https://houbb.github.io/2020/06/21/hand-write-hibernate-02-bean)

[手写 Hibernate ORM 框架 03-配置文件读取, 数据库连接构建](https://houbb.github.io/2020/06/21/hand-write-hibernate-03-config)

[手写 Hibernate ORM 框架 04-持久化实现](https://houbb.github.io/2020/06/21/hand-write-hibernate-04-persist)

[手写 Hibernate ORM 框架 05-整体效果测试验证](https://houbb.github.io/2020/06/21/hand-write-hibernate-05-test)

## 从零手写组件系列

[java 从零手写 spring ioc 控制反转](https://github.com/houbb/ioc)

[java 从零手写 spring mvc](https://github.com/houbb/mvc)

[java 从零手写 jdbc-pool 数据库连接池](https://github.com/houbb/jdbc-pool)

[java 从零手写 mybatis](https://github.com/houbb/mybatis)

[java 从零手写 hibernate](https://github.com/houbb/hibernate)

[java 从零手写 rpc 远程调用](https://github.com/houbb/rpc)

[java 从零手写 mq 消息组件](https://github.com/houbb/rpc)

[java 从零手写 cache 缓存](https://github.com/houbb/cache)

[java 从零手写 nginx4j](https://github.com/houbb/nginx4j)

[java 从零手写 tomcat](https://github.com/houbb/minicat)

# 本节内容

hibernate.cfg.xml 配置文件的读取

数据库访问 Connection 的构建

# hibernate.cfg.xml 读取

当然，代码中为了快速模拟，我们也可以将属性 hard code。

但此处为了模拟，就进行简单的实现

## 文件内容

- hibernate.cfg.xml

```xml
<?xml version='1.0' encoding='utf-8'?>
<hibernate-configuration>
        <!-- Database connection settings -->
        <property name="connection.driver_class">com.mysql.jdbc.Driver</property>
        <property name="connection.url">jdbc:mysql://localhost:3306/hibernate</property>
        <property name="connection.username">root</property>
        <property name="connection.password">123456</property>
</hibernate-configuration>
```

## 读取测试

- 测试

```java
package com.ryo.hibernate.simulator.dom4j;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.junit.Test;

import java.util.Iterator;

/**
 * Created by houbinbin on 16/6/5.
 */
public class HibernateConfigRead {
    @Test
    public void testRead() throws Exception {
        System.out.println(getClass().getClassLoader().getResource("hibernate.cfg.xml"));
        SAXReader reader = new SAXReader();
        Document document = reader.read(getClass().getClassLoader().getResource("hibernate.cfg.xml"));
        Element root = document.getRootElement();

        // iterate through child elements of root
        for (Iterator i = root.elementIterator(); i.hasNext(); ) {
            Element element = (Element) i.next();
            System.out.println(element.attributeValue("name"));
            System.out.println(element.getData()+" == "+element.getText());  //获取值
        }
    }
}
```

- 结果

```
file:/Users/houbinbin/code/_orm/hibernate-simulator/target/classes/hibernate.cfg.xml
connection.driver_class
com.mysql.jdbc.Driver == com.mysql.jdbc.Driver
connection.url
jdbc:mysql://localhost:3306/hibernate == jdbc:mysql://localhost:3306/hibernate
connection.username
root == root
connection.password
123456 == 123456
```

# 构建 Connetion

数据库链接构建

```java
package com.ryo.hibernate.simulator.hibernate.util;

import com.mysql.jdbc.Connection;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * 数据库链接信息
 *
 * @author houbinbin
 * @date 16/6/5
 */
public class ConnectionUtil {
    
    private ConnectionUtil() {
    }

    /**
     * 根据配置信息 获取数据库链接
     *
     * @return Connection
     */
    public static Connection getConnection() {
        Connection connection = null;

        Map<String, String> config = getJDBCConfig();
        try {
            Class.forName(config.get("connection.driver_class"));
            connection = (Connection) DriverManager.getConnection(config.get("connection.url"), config.get("connection.username"),
                    config.get("connection.password"));
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }

        return connection;
    }


    /**
     * 获取 JDBC 配置信息
     *
     * @return map
     */
    private static Map<String, String> getJDBCConfig() {
        Map<String, String> config = new HashMap<>();

        SAXReader reader = new SAXReader();
        Document document = null;
        try {
            document = reader.read(ConnectionUtil.class.getClassLoader().getResource("hibernate.cfg.xml"));
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        assert document != null;
        Element root = document.getRootElement();
        for (Iterator i = root.elementIterator(); i.hasNext(); ) {
            Element element = (Element) i.next();
            config.put(element.attributeValue("name"), element.getText());
        }

        return config;
    }
}
```


# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80172300)

* any list
{:toc}