---
layout: post
title: Mongo Java Driver-01-authMechanism 认证方式
date: 2018-12-11 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, java, sh]
published: true
---

# 业务背景

需要兼容云上云下的代码。

在云下，用的时 v3.4.6 比较老的版本，为了上云方便，云上申请的也是 v3.4 版本。

阿里云没有小版本，经验证 `db.version()` 也是 v3.4.6

以为一切都没有问题之后，结果遇到一个坑：

云下的验证方式，默认是 MONGODB-CR 方式，但是云上是 SCRAM-SHA-1 方式。

## 为什么不通

因为  MONGODB-CR 是不够安全的，出于产品角度的考虑，云上将不对其进行支持。

# 如何解决

## 修改云下版本

云上的认证方式，无法修改。那就只有调整云下的认证方式为 SCRAM-SHA-1。

但是很不幸，生产的信息一直在运行，这样无疑对数据的迁移带来很大的成本。

## 升级 spring-data 版本

这个问题会带来很多包不兼容的问题。

当然我们也会进行讲解。

## 设置 authMechanism 的方式

这种方法，改动相对较小。



# 原始配置

## 基于 xml 的不可自动识别的方式

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context-3.0.xsd">

	<bean id="mongoTemplate" class="org.springframework.data.mongodb.core.MongoTemplate">
		<constructor-arg name="mongo" ref="mongo" />
		<constructor-arg name="databaseName" value="${mongo_dbname}" />
		<constructor-arg name="userCredentials" ref="userCredentials" />
		<property name="writeResultChecking">
			<value type="org.springframework.data.mongodb.core.WriteResultChecking">EXCEPTION</value>
		</property>
	</bean>

	<bean id="mongo" class="org.springframework.data.mongodb.core.MongoFactoryBean">
		<property name="replicaSetSeeds">
			<list>
				<bean class="com.mongodb.ServerAddress">
					<constructor-arg name="host" value="${mongo_host1}" />
					<constructor-arg name="port" value="${mongo_port1}" />
				</bean>
				<bean class="com.mongodb.ServerAddress">
					<constructor-arg name="host" value="${mongo_host2}" />
					<constructor-arg name="port" value="${mongo_port2}" />
				</bean>
			</list>
		</property>
		<property name="mongoOptions" ref="mongoOptions" />
	</bean>

	<bean id="mongoOptions" class="com.mongodb.MongoOptions">
		<property name="safe" value="true" />
	</bean>


	<bean id="userCredentials" class="org.springframework.data.authentication.UserCredentials">
		<constructor-arg name="username" value="${mongo_username}" />
		<constructor-arg name="password" value="${mongo_password}" />
	</bean>
</beans>
```

### maven 包配置

```xml
<dependency>
	<groupId>org.springframework.data</groupId>
	<artifactId>spring-data-mongodb</artifactId>
	<version>1.2.0.RELEASE</version>
</dependency>
<dependency>
	<groupId>org.mongodb</groupId>
	<artifactId>mongo-java-driver</artifactId>
	<version>2.11.1</version>
</dependency>
```

## 基于 spring-boot 可以自动识别的方式

采用高版本的 spring-data，可以自动根据版本去决定采用哪一种验证方式。

### maven 依赖

```xml
<dependency>
	<groupId>org.springframework.data</groupId>
	<artifactId>spring-data-mongodb</artifactId>
	<version>1.10.11.RELEASE</version>
</dependency>
<dependency>
	<groupId>org.mongodb</groupId>
	<artifactId>mongo-java-driver</artifactId>
	<version>3.4.3</version>
</dependency>
```

### 示例代码

示例代码如下：

```java
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.authentication.UserCredentials;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * @author binbin.hou
 */
@Configuration
@ComponentScan("com.github.houbb.mongo")
public class DatasourceMongoConfig {

    @Value("${mongo_username}")
    private String mongoUsername;

    @Value("${mongo_password}")
    private String mongoPassword;

    @Value("${mongo_host1}")
    private String mongoHost1;

    @Value("${mongo_port1}")
    private int mongoPort1;

    @Value("${mongo_host2}")
    private String mongoHost2;

    @Value("${mongo_port2}")
    private int mongoPort2;

    @Value("${mongo_dbname}")
    private String mongoDbName;


    @Bean
    public UserCredentials userCredentials() {
        return new UserCredentials(mongoUsername, mongoPassword);
    }

    public @Bean
    MongoClient mongoClient() {
        ServerAddress serverAddress = new ServerAddress(mongoHost1, mongoPort1);
        ServerAddress serverAddress2 = new ServerAddress(mongoHost2, mongoPort2);
        return new MongoClient(Arrays.asList(serverAddress, serverAddress2), new ArrayList<MongoCredential>() {
            {
                add(MongoCredential.createCredential(mongoUsername, mongoDbName, mongoPassword.toCharArray()));
            }
        });
    }

    @Bean
    public MongoDbFactory mongoDbFactory() throws Exception {
        return new SimpleMongoDbFactory(mongoClient(), mongoDbName);
    }

    public @Bean MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoDbFactory());
    }

}
```

`MongoCredential.createCredential(mongoUsername, mongoDbName, mongoPassword.toCharArray()) ` 就是最核心的代码。


那么问题来了，如果我们想在 xml 中配置上述的代码，应该怎么做呢？


## xml 配置实现自动识别认证方式

### maven 依赖

```xml
<dependency>
	<groupId>org.springframework.data</groupId>
	<artifactId>spring-data-mongodb</artifactId>
	<version>1.10.11.RELEASE</version>
</dependency>
<dependency>
	<groupId>org.mongodb</groupId>
	<artifactId>mongo-java-driver</artifactId>
	<version>3.4.3</version>
</dependency>
```

### 配置信息

参考资料：

> [https://docs.spring.io/spring-data/mongodb/docs/2.0.8.RELEASE/reference/html/#mongo.mongo-xml-config](https://docs.spring.io/spring-data/mongodb/docs/2.0.8.RELEASE/reference/html/#mongo.mongo-xml-config)

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mongo="http://www.springframework.org/schema/data/mongo"
       xsi:schemaLocation=
               "http://www.springframework.org/schema/context
          http://www.springframework.org/schema/context/spring-context.xsd
          http://www.springframework.org/schema/data/mongo http://www.springframework.org/schema/data/mongo/spring-mongo.xsd
          http://www.springframework.org/schema/beans
          http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="mongoTemplate" class="org.springframework.data.mongodb.core.MongoTemplate">
        <constructor-arg name="mongoDbFactory" ref="mongoDbFactory"/>
    </bean>

    <mongo:db-factory id="mongoDbFactory" dbname="${mongo_dbname}" mongo-ref="replicaSetMongo"/>

    
    <mongo:mongo-client id="replicaSetMongo" replica-set="${mongo_host1}:${mongo_port1},${mongo_host2}:${mongo_port2}"
                        credentials="${mongo_username}:${mongo_password}@${mongo_dbname}">
        <mongo:client-options
                connections-per-host="50"
                max-connection-life-time="300000"
                min-connections-per-host="20"
                max-connection-idle-time="60000"
                read-preference="secondaryPreferred"/>
    </mongo:mongo-client>
</beans>
```


# 使用 URI 的方式

## 上述方式的缺点

需要升级 spring-data 的版本，从而带来一些列版本不兼容的问题。

如何可以尽可能少的改动代码？？？

## URI

无意间发现可以通过 uri 的方式来制定

实现方式如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mongo="http://www.springframework.org/schema/data/mongo"
       xsi:schemaLocation="http://www.springframework.org/schema/data/mongo http://www.springframework.org/schema/data/mongo/spring-mongo.xsd
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <mongo:db-factory id="mongoDbFactory"
                      uri="mongodb://${mongo_username}:${mongo_password}@${mongo_host1}:${mongo_port1},${mongo_host2}:${mongo_port2}/${mongo_dbname}?authMechanism=${mongo_authMechanism:MONGODB-CR}"/>

    <bean id="mongoTemplate" class="org.springframework.data.mongodb.core.MongoTemplate">
        <constructor-arg name="mongoDbFactory" ref="mongoDbFactory" />
        <property name="writeResultChecking">
            <value type="org.springframework.data.mongodb.core.WriteResultChecking">EXCEPTION</value>
        </property>
    </bean>

</beans>
```

`authMechanism=${mongo_authMechanism:MONGODB-CR}` 就是配置的地方，默认我们使用 MONGODB-CR 的方式。

## mongo-java-driver 驱动版本

当然，原来的 2.11 版本太低，会报错说不支持 **SCRAM-SHA-1** 的方式。

后来直接升级较高版本，通过源码发现， 2.13 版本开始支持。

于是 maven 依赖调整如下：

```xml
<dependency>
	<groupId>org.mongodb</groupId>
	<artifactId>mongo-java-driver</artifactId>
	<version>2.13.0</version>
</dependency>
```

# 参考资料

[Mongo 性能监控](https://www.yuanmas.com/info/4py2xNnjzb.html)

* any list
{:toc}