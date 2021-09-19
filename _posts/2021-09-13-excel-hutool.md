---
layout: post
title: 基于 hutool 的 EXCEL 导入导出优化框架实现
date: 2021-09-13 21:01:55 +0800
categories: [Java]
tags: [java, poi, tool, sh]
published: true
---

# hutool poi

hutool 的 poi 封装的很好，不过还是不够便捷。

## maven 引入

```xml
<dependency>
     <groupId>cn.hutool</groupId>
     <artifactId>hutool-core</artifactId>
     <version>${hutool.version}</version>
 </dependency>
 <dependency>
     <groupId>cn.hutool</groupId>
     <artifactId>hutool-poi</artifactId>
     <version>${hutool.version}</version>
     <exclusions>
         <exclusion>
             <groupId>cn.hutool</groupId>
             <artifactId>hutool-core</artifactId>
         </exclusion>
     </exclusions>
 </dependency>
 <dependency>
     <groupId>org.apache.poi</groupId>
     <artifactId>poi</artifactId>
     <version>${poi.version}</version>
 </dependency>
 <dependency>
     <groupId>org.apache.poi</groupId>
     <artifactId>poi-ooxml</artifactId>
     <version>${poi.version}</version>
 </dependency>
 <dependency>
     <groupId>org.apache.poi</groupId>
     <artifactId>poi-ooxml-schemas</artifactId>
     <version>${poi.version}</version>
 </dependency>
```

其中：

```
<hutool.version>4.1.19</hutool.version>
<poi.version>3.16</poi.version>
```

# 改进实现

poi 只实现了读取到 map，以及 bean 的读取，但是字段名称是表头，一般实际工作中不会这样。

所以需要封装一层。

## @ExcelField 注解

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ExcelField {

    /**
     * excel 表头名称
     * @return 表头名称
     */
    String headerName();

    /**
     * 从小到大排序
     *
     * 备注：产品要求导出文本必须按照指定顺序时指定
     * @return 顺序
     */
    int order() default 0;

    /**
     * 读取时是否需要
     * @return 是否
     */
    boolean readRequire() default true;

    /**
     * 写入时是否需要
     * @return 是否
     */
    boolean writeRequire() default true;

}
```

## 工具类

```java
import cn.hutool.core.util.ClassUtil;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import org.springframework.util.CollectionUtils;

import java.io.File;
import java.lang.reflect.Field;
import java.util.*;

/**
 * EXCEL 工具类
 * @author binbin.hou
 * @since 1.0.0
 */
public final class ExcelHelper {

    private ExcelHelper(){}

    /**
     * 读取对象列表
     * @param file 文件
     * @param tClass 类
     * @param <T> 泛型
     * @return 结果
     */
    @SuppressWarnings("all")
    public static <T> List<T> readList(File file,
                                        Class<T> tClass) {
        ExcelReader reader = ExcelUtil.getReader(file);
        List<Map<String,Object>> readAll = reader.readAll();
        if(CollectionUtils.isEmpty(readAll)) {
            return Collections.emptyList();
        }

        List<T> list = new ArrayList<>(readAll.size());
        Field[] fields = ClassUtil.getDeclaredFields(tClass);
        for(Map<String,Object> map : readAll) {
            try {
                T instance = tClass.newInstance();

                for(Field field : fields) {
                    Object object = getFieldReadValue(field, map);
                    if(object == null) {
                        continue;
                    }

                    field.setAccessible(true);
                    String text = object.toString();
                    field.set(instance, text);
                }

                list.add(instance);
            } catch (InstantiationException | IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
        return list;
    }

    /**
     * 获取对应的读取自
     * @param field 字段
     * @param map map
     * @return 结果
     */
    private static Object getFieldReadValue(Field field, Map<String,Object> map) {
        ExcelField excelField = field.getAnnotation(ExcelField.class);
        if(excelField == null) {
            return null;
        }
        if(!excelField.readRequire()) {
            return null;
        }

        String headerName = excelField.headerName();
        return map.get(headerName);
    }

    /**
     * 写出文件
     * @param list 列表
     * @param destFile 目标文件
     */
    @SuppressWarnings("all")
    public static void writeList(List<?> list, String destFile) {
        if(CollectionUtils.isEmpty(list)) {
            return;
        }

        try(ExcelWriter writer = ExcelUtil.getWriter(destFile);) {
            List<Map<String,Object>> rows = new ArrayList<>(list.size());

            Class<?> tClass = list.get(0).getClass();
            Field[] fields = ClassUtil.getDeclaredFields(tClass);
            for(Object object : list) {
                if(object == null) {
                    continue;
                }

                Map<String,Object> map = new LinkedHashMap<>();
                for(Field field : fields) {
                    ExcelField excelField = field.getAnnotation(ExcelField.class);
                    if(excelField == null) {
                        continue;
                    }
                    if(!excelField.writeRequire()) {
                        continue;
                    }

                    String headerName = excelField.headerName();
                    field.setAccessible(true);
                    Object value = field.get(object);
                    map.put(headerName, value);
                }

                rows.add(map);
            }

            // 一次性写出内容，使用默认样式，强制输出标题
            writer.write(rows);
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

}
```

## 测试

读写也变得比较简单：

```java
@Test
public void test() {
    final String path = "导入模板.xlsx";
    File file = new File(path);
    List<User> list = ExcelHelper.readList(file, User.class);
    System.out.println(JSON.toJSON(list));

    final String path2 = "EXPORT.xlsx";
    ExcelHelper.writeList(list, path2);
}
```

# 开箱即用

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>iexcel-hutool</artifactId>
    <version>1.0.0</version>
</dependency>
```

# 参考资料

https://www.hutool.cn/docs/#/poi/Excel%E7%94%9F%E6%88%90-ExcelWriter

* any list
{:toc}