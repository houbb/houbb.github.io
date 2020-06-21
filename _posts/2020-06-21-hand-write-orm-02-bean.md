---
layout: post
title:  手写 Hibernate ORM 框架 02-实体 Bean 定义，建表语句自动生成
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 本节内容

实体 Bean 的定义。

根据实体 Bean 生成对应的建表语句。

# 定义实体 Bean

简单的用户实体信息定义

```java
package com.ryo.hibernate.simulator.model;


import com.ryo.hibernate.simulator.hibernate.annotations.Column;
import com.ryo.hibernate.simulator.hibernate.annotations.Entity;
import com.ryo.hibernate.simulator.hibernate.annotations.GenerateValue;
import com.ryo.hibernate.simulator.hibernate.annotations.Id;

import java.util.Date;

/**
 * 用户实体类
 * Created by houbinbin on 16/6/5.
 */
@Entity("t_user")
public class User {
    @Id
    @GenerateValue
    private Long id;
    private String name;
    private String password;
    @Column("myAge")
    private Integer age;
    private Date createOn;
    private Date modifiedOn;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Date getCreateOn() {
        return createOn;
    }

    public void setCreateOn(Date createOn) {
        this.createOn = createOn;
    }

    public Date getModifiedOn() {
        return modifiedOn;
    }

    public void setModifiedOn(Date modifiedOn) {
        this.modifiedOn = modifiedOn;
    }
}
```

# Table

## 实现

Table 核心类的实现

```java
package com.ryo.hibernate.simulator.hibernate;


import com.ryo.hibernate.simulator.hibernate.annotations.Column;
import com.ryo.hibernate.simulator.hibernate.constants.HibernateConstant;
import com.ryo.hibernate.simulator.hibernate.util.FieldUtil;
import com.ryo.hibernate.simulator.hibernate.util.TableUtil;
import com.ryo.hibernate.simulator.util.ReflectionUtil;
import com.ryo.hibernate.simulator.util.StringBuilderUtil;

import java.lang.reflect.Field;

/**
 * 表
 * @author houbinbin
 * Created by houbinbin on 16/6/5.
 */
public class Table {
    /**
     * 构建创建表的 SQL
     * @param t 泛型入参
     * @param <T> 泛型
     * @return sql
     */
    public <T> String buildCreateTableSQL(T t) {
        String tableName = TableUtil.getTableName(t);
        StringBuilder stringBuilder = new StringBuilder("create table ");
        stringBuilder.append(tableName).append(" (");

        for(Field field : ReflectionUtil.getFieldList(t)) {
            stringBuilder.append(buildFieldSQL(t, field));
        }

        String result = StringBuilderUtil.removeLastStr(stringBuilder, ", ");
        result = buildPrimaryKey(t, result);

        return String.format("%s );", result);
    }

    /**
     * 构建主键SQL
     * @param t 入参
     * @param result 结果
     * @param <T> 泛型
     * @return SQL
     */
    private <T> String buildPrimaryKey(T t, String result) {
        Field field = FieldUtil.getIdField(t);

        if(field != null) {
            String idFieldName = FieldUtil.getFieldName(field);
            result = String.format("%s , PRIMARY KEY  (`%s`)", result, idFieldName);
        }

        return result;
    }

    private <T> String buildFieldSQL(T t, Field field) {
        String result;
        String fieldName = FieldUtil.getFieldName(field);
        String sqlType = FieldUtil.getSqlType(field);

        result = String.format("%s %s", fieldName, sqlType);
        Column column = FieldUtil.getFieldColumnAnnotation(field);

        if(ReflectionUtil.isType(field, String.class)) {
            int length = column != null ? column.length() : HibernateConstant.DEFAULT_STRING_SIZE;
            result = String.format("%s(%d)", result, length);
        }

        if(column != null) {
            result = String.format("%s %s", result, getNullAbleInfo(column));
        }

        if(FieldUtil.isGenerateValueField(t, field)) {
            result = String.format("%s AUTO_INCREMENT", result);
        }

        return String.format("%s, ", result);
    }

    /**
     * 获取是否可以为空的信息
     * @param column 列信息
     * @return 是否可以为空的结果
     */
    private String getNullAbleInfo(Column column) {
        return column.nullable() ? "" : "NOT NULL";
    }

}
```

## 测试

- TableTest.java

```java
/**
 * 建表语句测试
 */
@Test
public void createTableSQLTest() {
    Table table = new Table();
    User user = new User();
    System.out.println(table.buildCreateTableSQL(user));
}
```

测试结果：

```
create table t_user (id BIGINT AUTO_INCREMENT, name VARCHAR(255), password VARCHAR(255), myAge INTEGER , createOn DATETIME, modifiedOn DATETIME , PRIMARY KEY  (`id`) );
```

# Table 中涉及到的工具类

后面如有重复，将不再赘述

## FieldUtil

```java
package com.ryo.hibernate.simulator.hibernate.util;


import com.ryo.hibernate.simulator.hibernate.annotations.Column;
import com.ryo.hibernate.simulator.hibernate.annotations.GenerateValue;
import com.ryo.hibernate.simulator.hibernate.annotations.Id;
import com.ryo.hibernate.simulator.hibernate.constants.TypeMap;
import com.ryo.hibernate.simulator.util.CollectionUtil;
import com.ryo.hibernate.simulator.util.StringUtil;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static com.ryo.hibernate.simulator.util.ReflectionUtil.getAnnotation;
import static com.ryo.hibernate.simulator.util.ReflectionUtil.getFieldList;
import static com.ryo.hibernate.simulator.util.ReflectionUtil.getFieldValueForce;
import static com.ryo.hibernate.simulator.util.ReflectionUtil.isType;

/**
 *
 * 字段工具类
 * @author houbinbin
 * @date 16/6/5
 */
public class FieldUtil {
    /**
     * 获取对应SQL字段类型
     * @param field
     * @return
     */
    public static String getSqlType(Field field) {
        return TypeMap.getTypeMap().get(field.getType().getTypeName());
    }

    /**
     * 获取字段名称
     * @param field
     * @return
     */
    public static String getFieldName(Field field) {
        String fieldName = field.getName();
        Annotation annotation = getAnnotation(field, Column.class);

        Column column = getFieldColumnAnnotation(field);
        if(column != null) {
            String columnValue = column.value();
            fieldName = StringUtil.isEmpty(columnValue) ? fieldName : columnValue;
        }

        return fieldName;
    }

    /**
     * 获取子弹注解信息
     * @param field
     * @return
     */
    public static Column getFieldColumnAnnotation(Field field) {
        Annotation annotation = getAnnotation(field, Column.class);

        if(annotation != null) {
            return (Column) annotation;
        }

        return null;
    }

    /**
     * 获取ID字段
     * - 不存在则返回null
     * @param t
     * @param <T>
     * @return
     */
    public static <T> Field getIdField(T t) {
        for (Field field : getFieldList(t)) {
            Annotation annotation = getAnnotation(field, Id.class);
            if(annotation != null) {
                return field;
            }
        }

        return null;
    }

    /**
     * 获取自增长字段。
     * @param <T>
     * @return
     */
    public static <T> Field getGenerateValueField(T t) {
        for(Field field : getFieldList(t)) {
            Annotation annotation = getAnnotation(field, GenerateValue.class);
            if(annotation != null) {
                return field;
            }
        }

        return null;
    }

    /**
     * 是否为 GenerateValue 字段
     * @param t
     * @param field
     * @param <T>
     * @return
     */
    public static <T> boolean isGenerateValueField(T t, Field field) {
        Field generateValueField = getGenerateValueField(t);
        return generateValueField != null && field.equals(generateValueField);
    }

    /**
     * 获取字段名称列表
     * @param t
     * @param <T>
     * @return
     */
    public static <T> List<String> getFieldNameList(T t) {
        List<String> fieldNameList = new LinkedList<>();

        for(Field field : getFieldList(t)) {
            fieldNameList.add(getFieldName(field));
        }

        return fieldNameList;
    }

    /**
     * 获取字段名称字符串形式
     * @param t
     * @param <T>
     * @return
     */
    public static <T> String getFieldNameString(T t) {
        return CollectionUtil.concatCollection2Str(FieldUtil.getFieldNameList(t));
    }

    /**
     * 获取字段值字符串形式
     * @param t
     * @param <T>
     * @return
     */
    public static <T> String getFieldValueString(T t) {
        List<String> valueStrList = new LinkedList<>();
        for(Field field : getFieldList(t)) {
            valueStrList.add(String.format("'%s'", getValueString(t, field)));
        }

        return CollectionUtil.concatCollection2Str(valueStrList);
    }

    /**
     * 获取指定字段值字符串
     * @param t
     * @param field
     * @param <T>
     * @return
     */
    private static <T> String getValueString(T t, Field field) {
        Object value = getFieldValueForce(t, field.getName());

        String result = value.toString();

        if(isType(field, Date.class)) {
            result = dateToString((Date) value);
        }

        return result;
    }

    /**
     * 日期转字符串
     * @param dateTime 日期
     * @return 字符串
     */
    private static String dateToString(Date dateTime) {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(dateTime);
    }

}
```

## TableUtil

```java
package com.ryo.hibernate.simulator.hibernate.util;


import com.ryo.hibernate.simulator.hibernate.annotations.Entity;
import com.ryo.hibernate.simulator.util.ReflectionUtil;
import com.ryo.hibernate.simulator.util.StringUtil;

import java.lang.annotation.Annotation;

/**
 * 列表工具类
 *
 * @author houbinbin
 * @date 16/6/5
 */
public class TableUtil {
    private TableUtil() {
    }

    /**
     * 获取表名称
     *
     * @param t
     * @param <T>
     * @return 表名称
     */
    public static <T> String getTableName(T t) {
        Annotation annotation = ReflectionUtil.getAnnotation(t, Entity.class);

        String tableName = ReflectionUtil.getClassName(t);

        if (annotation != null) {
            Entity entity = (Entity) annotation;
            String tableValue = entity.value();
            tableName = StringUtil.isEmpty(tableValue) ? tableName : tableValue;
        }

        return tableName;
    }
}
```

## ReflectionUtil

```java
package com.ryo.hibernate.simulator.util;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.LinkedList;
import java.util.List;


/**
 *
 * 反射工具类
 * @author houbinbin
 * @date 16/6/5
 */
public class ReflectionUtil {

    /**
     * 是否为某一类型
     * @param field
     * @param clazz
     * @return
     */
    public static Boolean isType(Field field, Class clazz) {
        return field.getType().equals(clazz);
    }

    /**
     * 获取类名
     * @param t
     * @param <T>
     * @return
     */
    public static <T> String getClassName(T t) {
        Class clazz = t.getClass();
        return clazz.getSimpleName();
    }

    /**
     * 获取子弹列表
     * @param t
     * @param <T>
     * @return
     */
    public static <T> Field[] getFieldList(T t) {
        Class clazz = t.getClass();

        return clazz.getDeclaredFields();
    }


    /**
     * 强制获取字段值
     * @param t
     * @param fieldName
     * @param <T>
     * @return
     */
    public static <T> Object getFieldValueForce(T t, String fieldName) {
        Class clazz = t.getClass();
        Object value = null;
        try {
            Field field = clazz.getDeclaredField(fieldName);
            value = getFieldValue(t, field);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }

        return value;
    }

    /**
     * 获取字段值
     * @param t
     * @param field
     * @param <T>
     * @return
     */
    private static <T> Object getFieldValue(T t, Field field) {
        Object value = null;
        field.setAccessible(true);
        try {
            value = field.get(t);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return value;
    }

    /**
     * 获取注解信息
     * @param t
     * @param annotationClass
     * @param <T>
     * @return
     */
    public static <T> Annotation getAnnotation(T t, Class annotationClass) {
        Class clazz = t.getClass();

        return clazz.getAnnotation(annotationClass);
    }

    /**
     * 获取注解信息
     * @param field
     * @param annotationClass
     * @return
     */
    public static Annotation getAnnotation(Field field, Class annotationClass) {
        return field.getAnnotation(annotationClass);
    }
}
```

## StringBuilderUtil

```java
package com.ryo.hibernate.simulator.util;

/**
 * 字符串Builder-工具类
 *
 * @author houbinbin
 * @date 16/6/5
 */
public class StringBuilderUtil {

    /**
     * 移除最后一饿字符
     *
     * @param stringBuilder stringBuilder
     * @param subStr        需要字符串
     * @return 新的结果
     */
    public static String removeLastStr(StringBuilder stringBuilder, String subStr) {
        int lastIndex = stringBuilder.lastIndexOf(subStr);
        return stringBuilder.substring(0, lastIndex);
    }
    
}
```

## StringUtil

```java
package com.ryo.hibernate.simulator.util;

/**
 * 字符串-工具类
 * @author houbinbin
 * @date 16/6/5
 */
public class StringUtil {

    /**
     * 空字符串
     */
    public static final String EMPTY_STRING = "";

    /**
     * 是否为空
     * @param string
     * @return
     */
    public static Boolean isEmpty(String string) {
        return string == null || EMPTY_STRING.equals(string.trim());
    }

}
```

## CollectionUtil

```java
package com.ryo.hibernate.simulator.util;

import java.util.Collection;

/**
 * 集合工具类
 * @author houbinbin
 * @date 16/6/5
 */
public class CollectionUtil {
    /**
     * 默认连接符
     */
    public static final String CONNECTER = ",";

    /**
     * 是否为空
     *
     * @param array
     * @return
     */
    public static boolean isEmpty(Object[] array) {
        return (array == null) || (array.length <= 0);
    }


    /**
     * Collection<String>,根据连接符转成字符串.
     * 注意：如set 是无序的。。。
     *
     * @param collection
     * @param connector  //连接符默认为","
     * @return
     */
    public static String concatCollection2Str(Collection<String> collection, String... connector) {
        String conn = isEmpty(connector) ? CollectionUtil.CONNECTER : connector[0];
        StringBuilder stringBuilder = new StringBuilder();

        for (String str : collection) {
            if (stringBuilder.length() > 0) {
                stringBuilder.append(conn);
            }
            stringBuilder.append(str);
        }

        return stringBuilder.toString();
    }
}
```

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80172300)

* any list
{:toc}