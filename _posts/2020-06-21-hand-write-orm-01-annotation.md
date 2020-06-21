---
layout: post
title:  手写 Hibernate ORM 框架 01-注解常量定义
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 本节内容

进行 Hibernate 的注解定义，常量定义

# 注解定义

直接模拟 Hibernate 定义几个最常见的注解。

## @Entity

```java
package com.ryo.hibernate.simulator.hibernate.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 实体-注解
 * Created by houbinbin on 16/6/5.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
public @interface Entity {
    /**
     * 表名称
     * @return 表名称
     */
    String value() default "";
}
```

## @Column

```java
package com.ryo.hibernate.simulator.hibernate.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 列-注解
 * Created by houbinbin on 16/6/5.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Documented
public @interface Column {

    /**
     * 列名
     * @return 列名
     */
    String value() default "";

    /**
     * 是否可以为空
     * @return {@code true} 可以
     */
    boolean nullable() default true;

    /**
     * 字段的长度
     * @return 字段的长度
     */
    int length() default 255;

}
```

## @Id

```java
package com.ryo.hibernate.simulator.hibernate.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 主键标识
 * Created by houbinbin on 16/6/5.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
@Documented
public @interface Id {
}
```

## @GenerateValue

```java
package com.ryo.hibernate.simulator.hibernate.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自增长的值-注解
 * Created by houbinbin on 16/6/5.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Documented
public @interface GenerateValue {
}
```

# 常量定义

用于后面编程开发提供便利，全局定义，便于统一修改维护。

## HibernateConstant.java

用于实体列生成

```java
package com.ryo.hibernate.simulator.hibernate.constants;

/**
 *
 * hibernate 常量
 * @author houbinbin
 * @date 16/6/5
 */
public class HibernateConstant {

    /**
     * 默认的字符串大小 {@value}
     */
    public static final int DEFAULT_STRING_SIZE = 255;

}
```

## TypeMap.java

用于 bean 和数据库列字段类型映射

```java
package com.ryo.hibernate.simulator.hibernate.constants;

import java.util.HashMap;
import java.util.Map;

/**
 * 存放类型 map
 * Created by houbinbin on 16/6/5.
 * @author houbinbin
 */
public class TypeMap {

    private static final Map<String, String> TYPE_MAP = new HashMap<>();

    static {
        TYPE_MAP.put("java.lang.String", "VARCHAR");
        TYPE_MAP.put("char", "CHAR");
        TYPE_MAP.put("java.lang.Character", "CHAR");
        TYPE_MAP.put("boolean", "BIT");
        TYPE_MAP.put("java.lang.Boolean", "BIT");
        TYPE_MAP.put("byte", "TINYINT");
        TYPE_MAP.put("short", "SMALLINT");
        TYPE_MAP.put("java.lang.Byte", "SMALLINT");
        TYPE_MAP.put("int", "INTEGER");
        TYPE_MAP.put("java.lang.Integer", "INTEGER");
        TYPE_MAP.put("long", "BIGINT");
        TYPE_MAP.put("java.lang.Long", "BIGINT");
        TYPE_MAP.put("float", "FLOAT");
        TYPE_MAP.put("java.lang.Float", "FLOAT");
        TYPE_MAP.put("double", "DOUBLE");
        TYPE_MAP.put("java.lang.Double", "DOUBLE");
        TYPE_MAP.put("java.util.Date", "DATETIME");
    }

    /**
     * 获取 map 列表
     * @return map
     */
    public static Map<String, String> getTypeMap() {
        return TYPE_MAP;
    }
}
```

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80172300)

* any list
{:toc}