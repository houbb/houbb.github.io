---
layout: post
title:  mybatis generator & mybatis-plus generator 代码生成
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---


# myabtis-generator

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.mybatis.generator</groupId>
        <artifactId>mybatis-generator-core</artifactId>
        <version>1.3.2</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-maven-plugin</artifactId>
            <version>1.3.0</version>
            <configuration>
                <verbose>false</verbose>
                <overwrite>true</overwrite>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>${project.groupId}</groupId>
                    <artifactId>mybatis-learn-mbg</artifactId>
                    <version>${project.version}</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

引入 mybatis-generator-core，并且制定 maven 插件的时候包含当前项目。

或者引入对应的数据库连接也行。

## 生成配置

- generatorConfig.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!--
  ~ Copyright (c)  2018. houbinbin Inc.
  ~ mybatis-learn All rights reserved.
  -->

<!DOCTYPE generatorConfiguration PUBLIC
        "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>

    <context id="MySQLTables" targetRuntime="MyBatis3">

        <property name="beginningDelimiter" value="`"/>
        <property name="endingDelimiter" value="`"/>

        <!--base mapper 必须按照给定的顺序.-->

        <!--lombok plugin-->
        <plugin type="com.github.houbb.mybatis.learn.common.plugin.LombokMyBatisPlugin"/>
        <plugin type="com.github.houbb.mybatis.learn.common.plugin.SerializablePlugin"/>

        <commentGenerator>
            <!-- 是否取消注释 -->
            <property name="suppressAllComments" value="true"/>
            <!--取消时间注释-->
            <property name="suppressDate" value="true"/>
        </commentGenerator>

        <!--jdbc driver-->
        <jdbcConnection driverClass="com.mysql.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/mybatis"
                        userId="root" password="123456"/>

        <!--Xxx.java-->
        <javaModelGenerator targetPackage="com.github.houbb.mybatis.learn.mbg.domain" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!--XxxMapper.xml-->
        <sqlMapGenerator targetPackage="mapper" targetProject="src/main/resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!--XxxMapper.java-->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.github.houbb.mybatis.learn.mbg.mapper" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <table tableName="user" enableCountByExample="false"
               enableUpdateByExample="false" enableDeleteByExample="false"
               enableSelectByExample="false" selectByExampleQueryId="false">
        </table>

    </context>
</generatorConfiguration>
```

## 插件

- LombokMyBatisPlugin.java

lombok 插件

```java
import org.mybatis.generator.api.IntrospectedColumn;
import org.mybatis.generator.api.IntrospectedTable;
import org.mybatis.generator.api.PluginAdapter;
import org.mybatis.generator.api.dom.java.FullyQualifiedJavaType;
import org.mybatis.generator.api.dom.java.Method;
import org.mybatis.generator.api.dom.java.TopLevelClass;

import java.util.List;

/**
 *
 * @author houbinbin
 * @date 16/7/28
 *
 * - 供 mybatis.generator 与 lombok 结合使用
 */
public class LombokMyBatisPlugin extends PluginAdapter {

    private FullyQualifiedJavaType dataAnnotation = new FullyQualifiedJavaType("lombok.Data");

    public LombokMyBatisPlugin() {
    }

    @Override
    public boolean validate(List<String> warnings) {
        return true;
    }

    @Override
    public boolean modelBaseRecordClassGenerated(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
        this.addDataAnnotation(topLevelClass);
        return true;
    }

    @Override
    public boolean modelPrimaryKeyClassGenerated(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
        this.addDataAnnotation(topLevelClass);
        return true;
    }

    @Override
    public boolean modelRecordWithBLOBsClassGenerated(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
        this.addDataAnnotation(topLevelClass);
        return true;
    }

    @Override
    public boolean modelGetterMethodGenerated(Method method, TopLevelClass topLevelClass, IntrospectedColumn introspectedColumn, IntrospectedTable introspectedTable, ModelClassType modelClassType) {
        return false;
    }

    @Override
    public boolean modelSetterMethodGenerated(Method method, TopLevelClass topLevelClass, IntrospectedColumn introspectedColumn, IntrospectedTable introspectedTable, ModelClassType modelClassType) {
        return false;
    }

    protected void addDataAnnotation(TopLevelClass topLevelClass) {
        topLevelClass.addImportedType(this.dataAnnotation);
        topLevelClass.addAnnotation("@Data");
    }
}
```

- SerializablePlugin.java

序列化插件

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * mybatis-learn All rights reserved.
 */

package com.github.houbb.mybatis.learn.common.plugin;

import org.mybatis.generator.api.IntrospectedTable;
import org.mybatis.generator.api.PluginAdapter;
import org.mybatis.generator.api.dom.java.FullyQualifiedJavaType;
import org.mybatis.generator.api.dom.java.TopLevelClass;

import java.util.List;
import java.util.Properties;

/**
 * @author houbinbin
 * @version 2016年6月24日 下午6:42:28
 * model 添加 Serializable 接口
 */
public class SerializablePlugin extends PluginAdapter {

	private FullyQualifiedJavaType serializable;

	public SerializablePlugin() {
		super();
		serializable = new FullyQualifiedJavaType("java.io.Serializable");
	}

	@Override
	public boolean validate(List<String> warnings) {
		return true;
	}

	@Override
	public void setProperties(Properties properties) {
		super.setProperties(properties);
	}

	@Override
	public boolean modelBaseRecordClassGenerated(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
		makeSerializable(topLevelClass, introspectedTable);
		return true;
	}

	@Override
	public boolean modelPrimaryKeyClassGenerated(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
		makeSerializable(topLevelClass, introspectedTable);
		return true;
	}

	@Override
	public boolean modelRecordWithBLOBsClassGenerated(TopLevelClass topLevelClass,
			IntrospectedTable introspectedTable) {
		makeSerializable(topLevelClass, introspectedTable);
		return true;
	}

	protected void makeSerializable(TopLevelClass topLevelClass, IntrospectedTable introspectedTable) {
		if (topLevelClass.getSuperClass() != null) {
			String superName = topLevelClass.getSuperClass().getFullyQualifiedName();
			if ("".equals(superName.trim())) {
				topLevelClass.addImportedType(serializable);
				topLevelClass.addSuperInterface(serializable);
			}
		} else {
			topLevelClass.addImportedType(serializable);
			topLevelClass.addSuperInterface(serializable);
		}
		topLevelClass.addAnnotation("@SuppressWarnings(\"serial\")");
	}
}
```

# mybatis-plus generator

## maven 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>mp-sb-gen</artifactId>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <mybatis.version>3.4.4</mybatis.version>
        <mybatis-spring.version>1.3.1</mybatis-spring.version>
        <mybatis-plus.version>2.3</mybatis-plus.version>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <!-- mybatis-plus-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>${mybatis.version}</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>${mybatis-spring.version}</version>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus</artifactId>
            <version>${mybatis-plus.version}</version>
            <exclusions>
                <exclusion>
                    <artifactId>mybatis</artifactId>
                    <groupId>org.mybatis</groupId>
                </exclusion>
                <exclusion>
                    <artifactId>mybatis-spring</artifactId>
                    <groupId>org.mybatis</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.47</version>
            <scope>runtime</scope>
        </dependency>
        <!-- alibaba的druid数据库连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.14</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- mybatis-plus自动化工具需要的依赖 模板-->
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity-engine-core</artifactId>
            <version>2.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.10</version>
        </dependency>
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.8.10</version>
        </dependency>
    </dependencies>

</project>
```

## 生成代码

```java
import com.baomidou.mybatisplus.enums.IdType;
import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.InjectionConfig;
import com.baomidou.mybatisplus.generator.config.*;
import com.baomidou.mybatisplus.generator.config.rules.DbType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;

import java.util.Map;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MasterMPGTest {

    /**
     * 覆盖生成下列文件，第一次建表时使用
     * 1. java mapper
     * 2. java enity
     * 3. xml mapper
     * 4. service
     *
     * 更新时使用：
     * 1. 只修改对应的实体类即可，其他科注释掉。
     *
     * genDalJavaEntity
     */
    public static void main(String[] args) {
        String[] tables = new String[]{
                "master",
        };

        genDalJavaEntity(tables);
        genDalJavaMapper(tables);
        genDalXml(tables);
        genService(tables);
    }

    private static final String BASE_DIR = System.getProperty("user.dir");

    private static AutoGenerator initConfig(String... tables) {
        final String author = System.getProperty("user.name");

        //创建代码生成器
        AutoGenerator mpg = new AutoGenerator();

        //全局配置
        GlobalConfig gc = new GlobalConfig();
        gc.setOpen(false);
        gc.setOutputDir(BASE_DIR);
        gc.setFileOverride(true); //是否覆盖已有文件
        gc.setBaseResultMap(false); //XML是否需要BaseResultMap
        gc.setBaseColumnList(false); //XML是否显示字段
        gc.setActiveRecord(false);  //关闭 activeRecord 模式
        gc.setControllerName("Write%sController");
        gc.setServiceName("Write%sService");
        gc.setServiceImplName("Write%sServiceImpl");
        gc.setMapperName("Write%sMapper");
        gc.setXmlName("Write%sMapper");
        gc.setAuthor(author);
        gc.setEnableCache(false);
        gc.setIdType(IdType.NONE);

        mpg.setGlobalConfig(gc);

        //指定模板引擎  默认velocity
        //2.3 的 mybatis-plus 没有这个格式化的特性。
        String entityFormat = "Write%s";
        DefineVelocityTemplateEngine templateEngine = new DefineVelocityTemplateEngine(entityFormat);
        mpg.setTemplateEngine(templateEngine);

        //数据源配置
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setDbType(DbType.MYSQL);
        dsc.setDriverName("com.mysql.jdbc.Driver");
        dsc.setUrl("jdbc:mysql://localhost:3306/test");
        dsc.setUsername("root");
        dsc.setPassword("123456");
        mpg.setDataSource(dsc);

        //策略配置
        StrategyConfig sc = new StrategyConfig();
        sc.setNaming(NamingStrategy.underline_to_camel); //表名生成策略
        sc.setEntityBuilderModel(false);
        sc.setCapitalMode(true);
        sc.setEntityLombokModel(false);
        sc.setDbColumnUnderline(true);
        sc.setEntityColumnConstant(false); //生成字段常量

        // 指定表信息
        sc.setInclude(tables);
        sc.entityTableFieldAnnotationEnable(true);
        mpg.setStrategy(sc);


        //包配置
        PackageConfig pc = new PackageConfig();
        pc.setParent("com.github.houbb.mp.sb.learn.gen");
        pc.setEntity("dal.entity.master");
        pc.setMapper("dal.mapper.master");
        pc.setXml("dal.mapper.master");
        pc.setService("service.service.master");
        pc.setServiceImpl("service.service.master.impl");
        mpg.setPackageInfo(pc);

        // 配置模板
        TemplateConfig templateConfig = new TemplateConfig();
        //控制 不生成 controller  空字符串就行
        templateConfig.setController("");
        templateConfig.setService("");
        templateConfig.setServiceImpl("");
        templateConfig.setEntity("");
        templateConfig.setMapper("");
        templateConfig.setXml("");
        mpg.setTemplate(templateConfig);

        return mpg;
    }

    /**
     * 生成 dal 的 java 代码
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalJavaEntity(String... tables) {
        String moduleName = "mp-sb-gen";
        AutoGenerator mpg = initConfig(tables);

        mpg.setCfg(new InjectionConfig() {
            @Override
            public void initMap() {
                Map<String, Object> oldMap = this.getMap();
                System.out.println("原始的 MAP ------------------");
                System.out.println(oldMap);
                System.out.println("原始的 MAP ------------------");
            }
        });
        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setEntity(ConstVal.TEMPLATE_ENTITY_JAVA);

        mpg.execute();
    }

    /**
     * 生成 dal 的 java mapper 代码
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalJavaMapper(String... tables) {
        String moduleName = "mp-sb-gen";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setMapper(ConstVal.TEMPLATE_MAPPER);

        mpg.execute();
    }

    /**
     * @param tables 表名称
     * @since 1.0.0
     */
    private static void genDalXml(String... tables) {
        String moduleName = "mp-sb-gen";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\resources\\");
        mpg.getTemplate().setXml(ConstVal.TEMPLATE_XML);

        mpg.execute();
    }

    private static void genService(String... tables) {
        String moduleName = "mp-sb-gen";
        AutoGenerator mpg = initConfig(tables);

        mpg.getGlobalConfig().setOutputDir(BASE_DIR+"/"+moduleName+"\\src\\main\\java\\");
        mpg.getTemplate().setService(ConstVal.TEMPLATE_SERVICE);
        mpg.getTemplate().setServiceImpl(ConstVal.TEMPLATE_SERVICEIMPL);

        mpg.execute();
    }

}
```

* any list
{:toc}