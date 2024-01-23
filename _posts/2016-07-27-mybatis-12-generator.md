---
layout: post
title: mybatis-12-Mybatis Generator 代码生成
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis]
published: true
---

# Mybatis Generator

> [Use zh_CN](http://arccode.net/2015/02/07/MyBatis-Generator%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/)


# Code

You need ```mybatis-generator-core.jar``` and ```mysql-connector-java.jar```.

Then, use **schema.sql** to create table in your mysql.

use ```mvn mybatis-generator:generate``` to run project.

You may find directory not exists error, solve it.

> pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.ryo</groupId>
  <artifactId>mybaits</artifactId>
  <packaging>war</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>mybaits Maven Webapp</name>
  <url>http://maven.apache.org</url>


  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
      <scope>test</scope>
    </dependency>

    <dependency>
      <groupId>org.mybatis.generator</groupId>
      <artifactId>mybatis-generator-core</artifactId>
      <version>1.3.2</version>
    </dependency>

    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>5.1.30</version>
    </dependency>

  </dependencies>

  <build>
      <finalName>mybaits</finalName>
      <plugins>
          <plugin>
              <groupId>org.mybatis.generator</groupId>
              <artifactId>mybatis-generator-maven-plugin</artifactId>
              <version>1.3.0</version>

              <dependencies>
                  <dependency>
                      <groupId>org.mybatis.generator</groupId>
                      <artifactId>mybatis-generator-core</artifactId>
                      <version>1.3.2</version>
                  </dependency>

                  <dependency>
                      <groupId>mysql</groupId>
                      <artifactId>mysql-connector-java</artifactId>
                      <version>5.1.30</version>
                  </dependency>
              </dependencies>
          </plugin>
      </plugins>
  </build>
</project>

```

> schema.sql

```sql
CREATE TABLE `test`.`teacher` (
`id` bigint NOT NULL DEFAULT 0 COMMENT '主键id',
`name` varchar(40) NOT NULL DEFAULT '' COMMENT '名称',
`age` smallint NOT NULL DEFAULT 0 COMMENT '年龄',
PRIMARY KEY (`id`)
) COMMENT='教师表';
```

> generatorConfig.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>
    <context id="MySQLTables" targetRuntime="MyBatis3">
        <!--关闭注释 -->
        <commentGenerator>
            <property name="suppressDate" value="true"/>
        </commentGenerator>

        <!--数据库连接信息 -->
        <jdbcConnection driverClass="com.mysql.jdbc.Driver" connectionURL="jdbc:mysql://localhost:3306/test"
                        userId="root"
                        password="123456">
        </jdbcConnection>

        <!--生成的model 包路径 -->
        <javaModelGenerator targetPackage="com.ryo.gen.model" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!--生成xml mapper文件 路径 -->
        <sqlMapGenerator targetPackage="com.ryo.gen.xml" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!-- 生成的Dao接口 的包路径 -->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.ryo.gen.dao" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <!--对应数据库表名 -->
        <table tableName="teacher">

        </table>
    </context>
</generatorConfiguration>
```

## 生成 example

mbg 可以生成对象的 example，这样写 Creteria 比较方便，但是缺点是生成的类变多。


```xml
<table tableName="表名称" domainObjectName="实体对象名称"
    enableCountByExample="true" enableUpdateByExample="true"
    enableDeleteByExample="true" enableSelectByExample="true"
    selectByExampleQueryId="true">
</table>
```

# Bugs

- [properties bug](http://mybatis-user.963551.n3.nabble.com/lt-properties-resource-quot-database-properties-quot-gt-is-not-working-for-me-td3230072.html)

- [properties bug](http://openwares.net/database/mybatis_generator_properties_subelement.html)

<label class="label label-danger">AbstractMethodError</label>

When use the version of  ```mybatis-generator-maven-plugin``` is **1.3.5**, meet this:

```
Failed to execute goal org.mybatis.generator:mybatis-generator-maven-plugin:1.3.5:generate (default-cli) on project app-demo-dal: Execution default-cli of goal org.mybatis.generator:mybatis-generator-maven-plugin:1.3.5:generate failed: An API incompatibility was encountered while executing org.mybatis.generator:mybatis-generator-maven-plugin:1.3.5:generate: java.lang.AbstractMethodError: tk.mybatis.mapper.generator.MapperCommentGenerator.addModelClassComment(Lorg/mybatis/generator/api/dom/java/TopLevelClass;Lorg/mybatis/generator/api/IntrospectedTable;)V
```

Change the version into **1.3.2** will be okay.

* any list
{:toc}
