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


# Mybatis-plus 事务管理问题

## 问题描述

mybatis-plus 会默认给方法添加 `@Transactional` 注解，一般情况下是没有问题的，但是在多数据源的情况下，就有些画蛇添足了。

## 初步解决方案

```java
public class DatasourceConfig implements TransactionManagementConfigurer {
    @Autowired
    @Qualifier("masterTransactionManager")
    private PlatformTransactionManager transactionManager;

    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        return transactionManager;
    }
}
```

这种是直接告诉 spring，如果没有指定管理器，则默认使用我们给定的 masterTransactionManager

## 测试解决这个问题

其实可以重新实现一个 ServiceImpl，如下：

然后把原来指定的 `@Transactional` 全部移除掉。以前的事务管理，大部分都没有意义。

应该交给开发者自己去指定事务，而不是在父类之中默认实现。

```java
import com.baomidou.mybatisplus.entity.TableInfo;
import com.baomidou.mybatisplus.enums.SqlMethod;
import com.baomidou.mybatisplus.exceptions.MybatisPlusException;
import com.baomidou.mybatisplus.mapper.BaseMapper;
import com.baomidou.mybatisplus.mapper.Condition;
import com.baomidou.mybatisplus.mapper.SqlHelper;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.IService;
import com.baomidou.mybatisplus.toolkit.*;
import org.apache.ibatis.binding.MapperMethod;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 重写 mybatis-plus 中的服务实现类，移除无用的 @Transactional 注解。
 * 在多数据源的时候，默认不指定会比较麻烦。
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class ServiceImpl<M extends BaseMapper<T>, T> implements IService<T> {

    @Autowired
    protected M baseMapper;

    /**
     * <p>
     * 判断数据库操作是否成功
     * </p>
     * <p>
     * 注意！！ 该方法为 Integer 判断，不可传入 int 基本类型
     * </p>
     *
     * @param result 数据库操作返回影响条数
     * @return boolean
     */
    protected static boolean retBool(Integer result) {
        return SqlHelper.retBool(result);
    }

    @SuppressWarnings("unchecked")
    protected Class<T> currentModelClass() {
        return ReflectionKit.getSuperClassGenricType(getClass(), 1);
    }

    /**
     * <p>
     * 批量操作 SqlSession
     * </p>
     */
    protected SqlSession sqlSessionBatch() {
        return SqlHelper.sqlSessionBatch(currentModelClass());
    }

    /**
     * 获取SqlStatement
     *
     * @param sqlMethod
     * @return
     */
    protected String sqlStatement(SqlMethod sqlMethod) {
        return SqlHelper.table(currentModelClass()).getSqlStatement(sqlMethod.getMethod());
    }

    @Override
    public boolean insert(T entity) {
        return retBool(baseMapper.insert(entity));
    }

    @Override
    public boolean insertAllColumn(T entity) {
        return retBool(baseMapper.insertAllColumn(entity));
    }

    @Override
    public boolean insertBatch(List<T> entityList) {
        return insertBatch(entityList, 30);
    }

    /**
     * 批量插入
     *
     * @param entityList
     * @param batchSize
     * @return
     */
    @Override
    public boolean insertBatch(List<T> entityList, int batchSize) {
        if (CollectionUtils.isEmpty(entityList)) {
            throw new IllegalArgumentException("Error: entityList must not be empty");
        }
        try (SqlSession batchSqlSession = sqlSessionBatch()) {
            int size = entityList.size();
            String sqlStatement = sqlStatement(SqlMethod.INSERT_ONE);
            for (int i = 0; i < size; i++) {
                batchSqlSession.insert(sqlStatement, entityList.get(i));
                if (i >= 1 && i % batchSize == 0) {
                    batchSqlSession.flushStatements();
                }
            }
            batchSqlSession.flushStatements();
        } catch (Throwable e) {
            throw new MybatisPlusException("Error: Cannot execute insertBatch Method. Cause", e);
        }
        return true;
    }

    /**
     * <p>
     * TableId 注解存在更新记录，否插入一条记录
     * </p>
     *
     * @param entity 实体对象
     * @return boolean
     */
    @Override
    public boolean insertOrUpdate(T entity) {
        if (null != entity) {
            Class<?> cls = entity.getClass();
            TableInfo tableInfo = TableInfoHelper.getTableInfo(cls);
            if (null != tableInfo && StringUtils.isNotEmpty(tableInfo.getKeyProperty())) {
                Object idVal = ReflectionKit.getMethodValue(cls, entity, tableInfo.getKeyProperty());
                if (StringUtils.checkValNull(idVal)) {
                    return insert(entity);
                } else {
                    /*
                     * 更新成功直接返回，失败执行插入逻辑
                     */
                    return updateById(entity) || insert(entity);
                }
            } else {
                throw new MybatisPlusException("Error:  Can not execute. Could not find @TableId.");
            }
        }
        return false;
    }

    @Override
    public boolean insertOrUpdateAllColumn(T entity) {
        if (null != entity) {
            Class<?> cls = entity.getClass();
            TableInfo tableInfo = TableInfoHelper.getTableInfo(cls);
            if (null != tableInfo && StringUtils.isNotEmpty(tableInfo.getKeyProperty())) {
                Object idVal = ReflectionKit.getMethodValue(cls, entity, tableInfo.getKeyProperty());
                if (StringUtils.checkValNull(idVal)) {
                    return insertAllColumn(entity);
                } else {
                    /*
                     * 更新成功直接返回，失败执行插入逻辑
                     */
                    return updateAllColumnById(entity) || insertAllColumn(entity);
                }
            } else {
                throw new MybatisPlusException("Error:  Can not execute. Could not find @TableId.");
            }
        }
        return false;
    }

    @Override
    public boolean insertOrUpdateBatch(List<T> entityList) {
        return insertOrUpdateBatch(entityList, 30);
    }

    @Override
    public boolean insertOrUpdateBatch(List<T> entityList, int batchSize) {
        return insertOrUpdateBatch(entityList, batchSize, true);
    }

    @Override
    public boolean insertOrUpdateAllColumnBatch(List<T> entityList) {
        return insertOrUpdateBatch(entityList, 30, false);
    }

    @Override
    public boolean insertOrUpdateAllColumnBatch(List<T> entityList, int batchSize) {
        return insertOrUpdateBatch(entityList, batchSize, false);
    }

    /**
     * 批量插入修改
     *
     * @param entityList 实体对象列表
     * @param batchSize  批量刷新个数
     * @param selective  是否滤掉空字段
     * @return boolean
     */
    private boolean insertOrUpdateBatch(List<T> entityList, int batchSize, boolean selective) {
        if (CollectionUtils.isEmpty(entityList)) {
            throw new IllegalArgumentException("Error: entityList must not be empty");
        }
        try (SqlSession batchSqlSession = sqlSessionBatch()) {
            int size = entityList.size();
            for (int i = 0; i < size; i++) {
                if (selective) {
                    insertOrUpdate(entityList.get(i));
                } else {
                    insertOrUpdateAllColumn(entityList.get(i));
                }
                if (i >= 1 && i % batchSize == 0) {
                    batchSqlSession.flushStatements();
                }
            }
            batchSqlSession.flushStatements();
        } catch (Throwable e) {
            throw new MybatisPlusException("Error: Cannot execute insertOrUpdateBatch Method. Cause", e);
        }
        return true;
    }

    @Override
    public boolean deleteById(Serializable id) {
        return SqlHelper.delBool(baseMapper.deleteById(id));
    }

    @Override
    public boolean deleteByMap(Map<String, Object> columnMap) {
        if (MapUtils.isEmpty(columnMap)) {
            throw new MybatisPlusException("deleteByMap columnMap is empty.");
        }
        return SqlHelper.delBool(baseMapper.deleteByMap(columnMap));
    }

    @Override
    public boolean delete(Wrapper<T> wrapper) {
        return SqlHelper.delBool(baseMapper.delete(wrapper));
    }

    @Override
    public boolean deleteBatchIds(Collection<? extends Serializable> idList) {
        return SqlHelper.delBool(baseMapper.deleteBatchIds(idList));
    }

    @Override
    public boolean updateById(T entity) {
        return retBool(baseMapper.updateById(entity));
    }

    @Override
    public boolean updateAllColumnById(T entity) {
        return retBool(baseMapper.updateAllColumnById(entity));
    }

    @Override
    public boolean update(T entity, Wrapper<T> wrapper) {
        return retBool(baseMapper.update(entity, wrapper));
    }

    @Override
    public boolean updateForSet(String setStr, Wrapper<T> wrapper) {
        return retBool(baseMapper.updateForSet(setStr, wrapper));
    }

    @Override
    public boolean updateBatchById(List<T> entityList) {
        return updateBatchById(entityList, 30);
    }

    @Override
    public boolean updateBatchById(List<T> entityList, int batchSize) {
        return updateBatchById(entityList, batchSize, true);
    }

    @Override
    public boolean updateAllColumnBatchById(List<T> entityList) {
        return updateAllColumnBatchById(entityList, 30);
    }

    @Override
    public boolean updateAllColumnBatchById(List<T> entityList, int batchSize) {
        return updateBatchById(entityList, batchSize, false);
    }

    /**
     * 根据主键ID进行批量修改
     *
     * @param entityList 实体对象列表
     * @param batchSize  批量刷新个数
     * @param selective  是否滤掉空字段
     * @return boolean
     */
    private boolean updateBatchById(List<T> entityList, int batchSize, boolean selective) {
        if (CollectionUtils.isEmpty(entityList)) {
            throw new IllegalArgumentException("Error: entityList must not be empty");
        }
        try (SqlSession batchSqlSession = sqlSessionBatch()) {
            int size = entityList.size();
            SqlMethod sqlMethod = selective ? SqlMethod.UPDATE_BY_ID : SqlMethod.UPDATE_ALL_COLUMN_BY_ID;
            String sqlStatement = sqlStatement(sqlMethod);
            for (int i = 0; i < size; i++) {
                MapperMethod.ParamMap<T> param = new MapperMethod.ParamMap<>();
                param.put("et", entityList.get(i));
                batchSqlSession.update(sqlStatement, param);
                if (i >= 1 && i % batchSize == 0) {
                    batchSqlSession.flushStatements();
                }
            }
            batchSqlSession.flushStatements();
        } catch (Throwable e) {
            throw new MybatisPlusException("Error: Cannot execute updateBatchById Method. Cause", e);
        }
        return true;
    }

    @Override
    public T selectById(Serializable id) {
        return baseMapper.selectById(id);
    }

    @Override
    public List<T> selectBatchIds(Collection<? extends Serializable> idList) {
        return baseMapper.selectBatchIds(idList);
    }

    @Override
    public List<T> selectByMap(Map<String, Object> columnMap) {
        return baseMapper.selectByMap(columnMap);
    }

    @Override
    public T selectOne(Wrapper<T> wrapper) {
        return SqlHelper.getObject(baseMapper.selectList(wrapper));
    }

    @Override
    public Map<String, Object> selectMap(Wrapper<T> wrapper) {
        return SqlHelper.getObject(baseMapper.selectMaps(wrapper));
    }

    @Override
    public Object selectObj(Wrapper<T> wrapper) {
        return SqlHelper.getObject(baseMapper.selectObjs(wrapper));
    }

    @Override
    public int selectCount(Wrapper<T> wrapper) {
        return SqlHelper.retCount(baseMapper.selectCount(wrapper));
    }

    @Override
    public List<T> selectList(Wrapper<T> wrapper) {
        return baseMapper.selectList(wrapper);
    }

    @Override
    public Page<T> selectPage(Page<T> page) {
        return selectPage(page, Condition.EMPTY);
    }

    @Override
    public List<Map<String, Object>> selectMaps(Wrapper<T> wrapper) {
        return baseMapper.selectMaps(wrapper);
    }

    @Override
    public List<Object> selectObjs(Wrapper<T> wrapper) {
        return baseMapper.selectObjs(wrapper);
    }

    @Override
    public Page<Map<String, Object>> selectMapsPage(Page page, Wrapper<T> wrapper) {
        wrapper = (Wrapper<T>) SqlHelper.fillWrapper(page, wrapper);
        page.setRecords(baseMapper.selectMapsPage(page, wrapper));
        return page;
    }

    @Override
    public Page<T> selectPage(Page<T> page, Wrapper<T> wrapper) {
        wrapper = (Wrapper<T>) SqlHelper.fillWrapper(page, wrapper);
        page.setRecords(baseMapper.selectPage(page, wrapper));
        return page;
    }

}
```

### ServiceImpl 代码生成调整

应该可以设置对应的 ServiceImpl 类，不过我没做测试，

我是直接修改的自定义实现 DefineVelocityTemplateEngine

在生成 ServiceImpl 的时候，对包名称进行复写。

```java
// MpServiceImpl.java
if (null != tableInfo.getServiceImplName() && null != pathInfo.get(ConstVal.SERVICEIMPL_PATH)) {
    String implFile = String.format((pathInfo.get(ConstVal.SERVICEIMPL_PATH) + File.separator + tableInfo.getServiceImplName() + this.suffixJavaOrKt()), entityName);
    if (this.isCreate(implFile)) {
        // 重写包方法
        objectMap.put("superServiceImplClassPackage", "com.github.houbb.service.service.ServiceImpl");

        this.writer(objectMap, this.templateFilePath(template.getServiceImpl()), implFile);
    }
}
```

### 指定的方式

```java
StrategyConfig sc = new StrategyConfig();
sc.setSuperServiceImplClass("com.github.houbb.service.service.ServiceImpl"); //指定实现类
```

建议使用这种方式。

* any list
{:toc}