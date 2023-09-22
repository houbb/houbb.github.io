---
layout: post
title: spring tool-01-如何通过 spring 实现扫包？
date: 2023-09-19 21:01:55 +0800
categories: [Monitor]
tags: [monitor, sh]
published: true
---

# 说明

spring 的功能非常强大，如何通过 spring 扫描指定包呢？

比如我们想获取指定包下的所有枚举。

# 实现

```java
package com.github.houbb.spring.tool.utils;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.spring.tool.exception.SpringToolException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.core.type.classreading.CachingMetadataReaderFactory;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.util.ClassUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * spring 包工具类
 *
 * @since 1.0.0
 */
public class SpringPackageUtil {

    /**
     * 扫描
     * @param basePackages 基础包信息
     * @param resourcePattern 资源正则
     */
    public static List<String> scanClassName(String basePackages, String resourcePattern) {
        try {
            List<String> classNameList = new ArrayList<>();

            if(StringUtil.isEmpty(basePackages)
                || StringUtil.isEmpty(resourcePattern)) {
                return classNameList;
            }

            final ResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();

            // 根据classname生成class对应的资源路径,需要扫描的包路径
            //ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
            String pattern = ClassUtils.convertClassNameToResourcePath(basePackages) + resourcePattern;
            // 获取classname的IO流资源
            Resource[] resources = resourcePatternResolver.getResources(pattern);
            // MetadataReaderFactory接口 ，MetadataReader的工厂接口。允许缓存每个MetadataReader的元数据集
            MetadataReaderFactory readerFactory = new CachingMetadataReaderFactory(resourcePatternResolver);

            for (Resource resource : resources) {
                if (resource.isReadable()) {
                    // 通过class资源（resource）生成MetadataReader
                    MetadataReader metadataReader = readerFactory.getMetadataReader(resource);
                    // 获取class名
                    String className = metadataReader.getClassMetadata().getClassName();
                    classNameList.add(className);
                }
            }

            return classNameList;
        } catch (Exception e) {
            throw new SpringToolException(e);
        }
    }

    /**
     * 扫描
     * @param basePackages 基础包信息
     * @param resourcePattern 资源正则
     */
    public static List<Class> scanClass(String basePackages, String resourcePattern) {
        List<String> nameList = scanClassName(basePackages, resourcePattern);

        return nameList.stream().map((Function<String, Class>) s -> {
            try {
                return Class.forName(s);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
            }
        }).collect(Collectors.toList());
    }

}
```

# 测试

## 测试路径

```
PS D:\code\learn\spring-tool\src\test>
    └─com
        └─github
            └─houbb
                └─spring
                    └─tool
                        │  package-info.java
                        │
                        ├─enums
                        │      MyBoolEnum.java
                        │      package-info.java
                        │
                        └─utils
                                SpringPackageUtilTest.java
```


## 使用

```java
List<String> nameList = SpringPackageUtil.scanClassName("com.github.houbb.spring.tool.enums", "/**/*Enum.class");

System.out.println(nameList);
```

直接扫描包下面对应的 Enum 类信息。

```
[com.github.houbb.spring.tool.enums.MyBoolEnum]
```

# 参考资料

https://github.com/dianping/cat/blob/master/lib/java/README.zh-CN.md

https://github.com/dianping/cat/blob/master/integration/log4j2/README.md

* any list
{:toc}