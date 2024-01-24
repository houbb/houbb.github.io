---
layout: post
title: orm-04-Spring Data JPA 入门介绍
date:  2016-05-21 18:35:52 +0800
categories: [ORM]
tags: [orm, sql, spring]
published: true
---

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# Spring Data JPA

Spring Data JPA，作为更大的 [Spring Data](https://projects.spring.io/spring-data/) 家族的一部分，使得基于 JPA 的仓库实现变得更加容易。

该模块提供了对基于 JPA 的数据访问层的增强支持。

它使得构建使用数据访问技术的、由 Spring 驱动的应用程序变得更加容易。

> [Spring Data JPA 2.0.2.RELEASE](https://docs.spring.io/spring-data/jpa/docs/2.0.2.RELEASE/reference/html/)


ps: spring data 太大了，就从 jpa 一个点入手。学习运用并了解其设计思想。

# Hello World

spring-data-jpa（java-persist-api ）默认使用 [Hibernate](http://hibernate.org/) 作为实现。
 
> [完整代码地址](https://github.com/houbb/spring-data/tree/master/spring-data-jpa)
 
## 项目结构
 
```
├── spring-data-jpa
│   ├── pom.xml
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── ryo
│   │   │   │           └── spring
│   │   │   │               └── data
│   │   │   │                   └── jpa
│   │   │   │                       ├── dao
│   │   │   │                       │   ├── EmployeeDAO.java
│   │   │   │                       │   └── EmployeeDAOImpl.java
│   │   │   │                       ├── model
│   │   │   │                       │   └── Employee.java
│   │   │   └── resources
│   │   │       ├── jdbc.properties
│   │   │       ├── spring
│   │   │       │   └── applicationContext-datasource.xml
│   │   │       └── sql
│   │   │           └── init.sql
│   │   └── test
│   │       └── java
│   │           └── SpringDataJPATest.java
```

## 属性及配置文件

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>spring-data</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-data-jpa</artifactId>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>1.1.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
        </dependency>
    </dependencies>

</project>
```

- init.sql

测试时建立的数据库为 `spring_data`。

脚本用于新建表，内容如下：

```sql
CREATE TABLE `Employee` (
  `id` int(11) unsigned NOT NULL COMMENT '主键',
  `name` varchar(20) DEFAULT NULL COMMENT '名称',
  `role` varchar(20) DEFAULT NULL COMMENT '角色',
  PRIMARY KEY (`id`))
  ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '雇员表';
```

- jdbc.properties

```
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://127.0.0.1:3306/spring_data?useUnicode=true&characterEncoding=UTF-8&useOldAlias
jdbc.username=root
jdbc.password=123456
```

- applicationContext-datasource.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-3.1.xsd
      http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.1.xsd
      http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.1.xsd">

    <context:property-placeholder location="classpath:jdbc.properties"/>

    <!--数据源-->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="${jdbc.driverClassName}"/>
        <property name="url" value="${jdbc.url}?useUnicode=true&amp;characterEncoding=UTF-8"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>

    <!-- Jpa Entity Manager 配置 -->
    <bean id="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="jpaVendorAdapter" ref="hibernateJpaVendorAdapter"/>
        <property name="packagesToScan" value="com.ryo.spring.data.jpa.model"/>
        <property name="jpaProperties">
            <props>
                <prop key="hibernate.show_sql">true</prop>
            </props>
        </property>

        <property name="jpaDialect">
            <bean class="org.springframework.orm.jpa.vendor.HibernateJpaDialect"/>
        </property>
    </bean>


    <bean id="hibernateJpaVendorAdapter" class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter">
        <property name="generateDdl" value="false"/>
        <property name="database" value="MYSQL"/>
    </bean>

    <bean id="jpaDialect" class="org.springframework.orm.jpa.vendor.HibernateJpaDialect"/>

    <bean id="entityManager" factory-bean="entityManagerFactory" factory-method="createEntityManager"/>

    <!-- Jpa 事务管理器  -->
    <bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager"
    p:entityManagerFactory-ref="entityManagerFactory" />

    <!-- 开启注解事务 -->
    <tx:annotation-driven transaction-manager="transactionManager" proxy-target-class="true" />

    <!--&lt;!&ndash; 启动对@AspectJ（面向切面）注解的支持 &ndash;&gt;-->
    <aop:aspectj-autoproxy />

    <context:component-scan base-package="com.ryo.spring.data.jpa"/>

</beans>
```

## 代码

- EmployeeDAO.java

```java
import com.ryo.spring.data.jpa.model.Employee;

import java.util.List;

public interface EmployeeDAO {
    //Create
    void save(Employee employee);
    //Read
    Employee getById(int id);
    //Update
    void update(Employee employee);
    //Delete
    void deleteById(int id);
    //Get All
    List<Employee> getAll();
}
```

- EmployeeDAOImpl.java

```java
import com.ryo.spring.data.jpa.model.Employee;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.transaction.Transactional;
import java.util.List;

@Transactional
@Repository
public class EmployeeDAOImpl implements EmployeeDAO {
    @PersistenceContext
    EntityManager em;

    @Override
    public void save(Employee employee) {
        em.persist(employee);
    }

    @Override
    public Employee getById(int id) {
        return em.find(Employee.class, id);
    }

    public void update(Employee employee) {
        em.merge(employee);
    }

    @Override
    public void deleteById(int id) {
        em.remove(this.getById(id));
    }

    @Override
    public List<Employee> getAll() {
        CriteriaBuilder builder = em.getCriteriaBuilder();
        final CriteriaQuery<Employee> query = builder.createQuery(Employee.class);
        return this.em.createQuery(query).getResultList();
    }
}
```

- Employee.java

````java
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Employee {

    @Id
    private int id;
    private String name;
    private String role;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "{ID=" + id + ",Name=" + name + ",Role=" + role + "}";
    }
}
````


## 测试代码

- SpringDataJPATest.java

```java
import com.ryo.spring.data.jpa.dao.EmployeeDAO;
import com.ryo.spring.data.jpa.model.Employee;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.annotation.Resource;
import java.util.Random;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:spring/applicationContext-datasource.xml")
public class SpringDataJPATest {

    @Resource
    private EmployeeDAO employeeDAO;

    @Test
    public void saveTest(){
        Employee emp = new Employee();
        int rand = new Random().nextInt(1000);
        emp.setId(rand);
        emp.setName("Ryo");
        emp.setRole("Java Developer");
        employeeDAO.save(emp);
    }
}
```

直接运行测试，数据库数据如下：

```
+-----+------+----------------+
| id  | name | role           |
+-----+------+----------------+
| 493 | Ryo  | Java Developer |
+-----+------+----------------+
```

# jar 包依赖

上述项目的 jar 包依赖如下：

```
+- org.springframework.boot:spring-boot-starter-data-jpa:jar:1.2.3.RELEASE:compile
|  +- org.springframework.boot:spring-boot-starter:jar:1.2.3.RELEASE:compile
|  |  +- org.springframework.boot:spring-boot:jar:1.2.3.RELEASE:compile
|  |  +- org.springframework.boot:spring-boot-autoconfigure:jar:1.2.3.RELEASE:compile
|  |  +- org.springframework.boot:spring-boot-starter-logging:jar:1.2.3.RELEASE:compile
|  |  |  +- org.slf4j:jul-to-slf4j:jar:1.7.11:compile
|  |  |  +- org.slf4j:log4j-over-slf4j:jar:1.7.11:compile
|  |  |  \- ch.qos.logback:logback-classic:jar:1.1.3:compile
|  |  |     \- ch.qos.logback:logback-core:jar:1.1.3:compile
|  |  \- org.yaml:snakeyaml:jar:1.14:compile
|  +- org.springframework.boot:spring-boot-starter-aop:jar:1.2.3.RELEASE:compile
|  |  +- org.aspectj:aspectjrt:jar:1.8.5:compile
|  |  \- org.aspectj:aspectjweaver:jar:1.8.5:compile
|  +- org.springframework:spring-core:jar:4.1.6.RELEASE:compile
|  +- org.springframework.boot:spring-boot-starter-jdbc:jar:1.2.3.RELEASE:compile
|  |  +- org.springframework:spring-jdbc:jar:4.1.6.RELEASE:compile
|  |  +- org.apache.tomcat:tomcat-jdbc:jar:7.0.59:compile
|  |  |  \- org.apache.tomcat:tomcat-juli:jar:7.0.59:compile
|  |  \- org.springframework:spring-tx:jar:4.1.6.RELEASE:compile
|  +- org.hibernate:hibernate-entitymanager:jar:4.3.8.Final:compile
|  |  +- org.jboss.logging:jboss-logging:jar:3.1.3.GA:compile
|  |  +- org.jboss.logging:jboss-logging-annotations:jar:1.2.0.Beta1:compile
|  |  +- org.hibernate:hibernate-core:jar:4.3.8.Final:compile
|  |  |  +- antlr:antlr:jar:2.7.7:compile
|  |  |  \- org.jboss:jandex:jar:1.1.0.Final:compile
|  |  +- dom4j:dom4j:jar:1.6.1:compile
|  |  |  \- xml-apis:xml-apis:jar:1.0.b2:compile
|  |  +- org.hibernate.common:hibernate-commons-annotations:jar:4.0.5.Final:compile
|  |  +- org.hibernate.javax.persistence:hibernate-jpa-2.1-api:jar:1.0.0.Final:compile
|  |  \- org.javassist:javassist:jar:3.18.1-GA:compile
|  +- javax.transaction:javax.transaction-api:jar:1.2:compile
|  +- org.springframework:spring-orm:jar:4.1.6.RELEASE:compile
|  +- org.springframework.data:spring-data-jpa:jar:1.7.2.RELEASE:compile
|  |  +- org.springframework.data:spring-data-commons:jar:1.9.2.RELEASE:compile
|  |  +- org.springframework:spring-context:jar:4.1.6.RELEASE:compile
|  |  |  \- org.springframework:spring-expression:jar:4.1.6.RELEASE:compile
|  |  +- org.slf4j:slf4j-api:jar:1.7.11:compile
|  |  \- org.slf4j:jcl-over-slf4j:jar:1.7.11:compile
|  \- org.springframework:spring-aspects:jar:4.1.6.RELEASE:compile
+- com.h2database:h2:jar:1.4.185:compile
+- mysql:mysql-connector-java:jar:5.1.34:compile
+- org.springframework:spring-aop:jar:4.1.6.RELEASE:compile
|  +- aopalliance:aopalliance:jar:1.0:compile
|  \- org.springframework:spring-beans:jar:4.1.6.RELEASE:compile
+- org.springframework:spring-test:jar:4.1.6.RELEASE:compile
\- junit:junit:jar:4.11:compile
   \- org.hamcrest:hamcrest-core:jar:1.3:compile
```

# 学习感想

说实在的，觉得 spring-data 设计的很棒。但是 mybatis 的使用门槛实在太低。所有以后可能还是专注于使用 mybatis。


* any list
{:toc}

