---
layout: post
title:  Annotation-06-set value
date:  2018-07-02 22:18:21 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# 设置注解的属性

这种使用场景比较少，但是不失为一种对于注解的深入理解。

# 实例

## 定义

- Tag.java

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.LOCAL_VARIABLE})
public @interface Tag {

    /**
     * tag 标签
     *
     * @return tag
     */
    String value() default "";

}
```

## 使用

- SetValue.java

设置注解的属性

```java
import com.ryo.jdk.annotation.define.Tag;

import org.junit.Assert;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Map;

public class SetValue {

    /**
     * 在每一个类执行之前，设置注解的属性
     * @throws NoSuchFieldException if any
     * @throws IllegalAccessException if any
     */
    @SuppressWarnings("unchecked")
    public static void beforeClass() throws NoSuchFieldException, IllegalAccessException {
        Method[] methods = SetValue.class.getDeclaredMethods();
        for(Method method : methods) {
            Tag tag = method.getAnnotation(Tag.class);
            if(tag != null) {
                InvocationHandler h = Proxy.getInvocationHandler(tag);
                Field hField = h.getClass().getDeclaredField("memberValues");
                hField.setAccessible(true);
                Map memberMethods = (Map) hField.get(h);
                memberMethods.put("value", "setAnnotation");
                String value = tag.value();
                Assert.assertEquals("setAnnotation", value);
            }
        }
    }

    @Tag
    public void tag() {
    }

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        beforeClass();
    }
}
```

# 个人遇到的使用场景

## 场景导入

TestNG 中的 `@DataProvider` 注解，拥有 dataProvider() 属性用来指定数据源。

编写的框架中 dataProvider() 值可以指向固定的值，但是 TestNG 会通过这个属性来进行值的注入和执行。

- @DataProvider 的属性

编写的框架通过注解去解析对应的配置文件，导致所有的 @DataProvider 的 dataProvider() 可以使固定的。

但是 TestNG 通过判断 dataProvider() 是否有值，来进行参数化测试。

所以，这是一个**固定的属性值**,使用同一的属性设置，可以使得用户代码变得更加优雅。


## 实例

- TestNgDataProviderTest.java

```java
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Map;

public class TestNgDataProviderTest {

    /**
     * 是否为空数据准备
     * @return 数据
     */
    @DataProvider(name = "TestDataProvider")
    public Object[][] isEmptyDataProvider(Method method, ITestContext testContext) {
        return new Object[][]{
                {"", true},
                {null, true},
                {"    ", true},
                {"1", false},
                {"   1", false}
        };
    }

    /**
     * 在每一个类执行之前，设置注解的属性
     * @throws NoSuchFieldException if any
     * @throws IllegalAccessException if any
     */
    @BeforeClass
    public void beforeClass() throws NoSuchFieldException, IllegalAccessException {
        Method[] methods = this.getClass().getDeclaredMethods();
        for(Method method : methods) {
            Test test = method.getAnnotation(Test.class);
            if(test != null) {
                InvocationHandler h = Proxy.getInvocationHandler(test);
                Field hField = h.getClass().getDeclaredField("memberValues");
                hField.setAccessible(true);
                Map memberMethods = (Map) hField.get(h);
                memberMethods.put("dataProvider", "TestDataProvider");
                String value = test.dataProvider();
                Assert.assertEquals("TestDataProvider", value);
            }
        }
    }

    @Test
    public void isEmptyTest(final String string, boolean result) {
        System.out.println(string+","+result);
        Assert.assertEquals(result, StringUtil.isEmpty(string));
    }
}
```

# 代码地址

> [annotation 定义与解析](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/setvalue)

# 引用

> [通过反射，动态修改注解的某个属性值](https://segmentfault.com/a/1190000011213222)




* any list
{:toc}