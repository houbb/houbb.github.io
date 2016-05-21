---
layout: post
title: Reflecting
date:  2016-5-21 10:31:09 +0800
categories: [Java]
tags: [reflecting]
published: true
---

* any list
{:toc}

## Mock

If you use The **Third-party** API, may need mock.

> Before use mock, you must sure have the problem of **dependency**.


## Reflection


> getClass()

Here is the jdk1.7 doc.

```java
public Class<?>[] getClasses()
```
The actual result type is Class<? extends |X|> where |X| is the erasure of the static type of the expression on which getClass is called.


> JUnit

JUnit also use reflection to get the methods list.

- method must start with 'test';
- method must return void;
- method not accept any arguments.


## toString()

- Here is a ReflectionUtil.java helps you say goodbye to toString();

```java
package com.ryo.util;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Created by houbinbin on 16/5/21.
 */
public class ReflectionUtil {
    /**
     * base toString() method;
     * @param thisObj
     * @return
     */
    public static String toString(Object thisObj) {
        Class clazz = thisObj.getClass();

        String entityName = clazz.getSimpleName();
        Field fields[] = clazz.getDeclaredFields();

        StringBuilder stringBuilder = new StringBuilder(String.format("%s{", entityName));

        for(int i = 0; i < fields.length-1; i++) {
            Field field = fields[i];
            stringBuilder.append(buildFieldValue(thisObj, field)+",");
        }

        stringBuilder.append(buildFieldValue(thisObj, fields[fields.length-1]));
        stringBuilder.append("}");

        return stringBuilder.toString();
    }

    /**
     * build "field=fieldValue"
     * @param object
     * @param field
     * @return
     */
    private static String buildFieldValue(Object object, Field field) {
        final String format = isType(field, String.class) ? "%s='%s'" : "%s=%s";
        StringBuilder stringBuilder = new StringBuilder();
        Method getMethod = getGetMethod(object.getClass(), field);
        try {
            Object fieldValue = getMethod.invoke(object);
            stringBuilder = new StringBuilder(String.format(format, field.getName(), fieldValue));
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }

        return stringBuilder.toString();
    }

    /**
     * get the Get() of current field;
     * @param clazz
     * @param field
     * @return
     */
    private static Method getGetMethod(Class clazz, Field field) {
        PropertyDescriptor propertyDescriptor = null;
        try {
            propertyDescriptor = new PropertyDescriptor(field.getName(), clazz);
        } catch (IntrospectionException e) {
            e.printStackTrace();
        }

        return propertyDescriptor.getReadMethod();
    }

    /**
     * adjust just field is the type of
     * @param field
     * @param classType
     * @return
     */
    private static Boolean isType(Field field, Class classType) {
        return field.getType().equals(classType);
    }
}
```

- Student.java

```java
/**
 * Created by houbinbin on 16/5/20.
 */
public class Student extends Base {
    private Long id;
    private String name;
    private int score;

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

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public Student() {
    }

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    @Override
    public String toString() {
        return ReflectionUtil.toString(this);
    }
}
```

or you can toString() in the base model in your project.

- StudentTest.java

```java
public class StudentTest {
    @Test
    public void testToString() {
        Student student = new Student("hello", 30);

        System.out.println(student);
    }
}

```

- result is

```
Student{id=null,name='hello',score=30}

Process finished with exit code 0
```


# lombok

> [lombok](https://projectlombok.org/)

> [lombok doc](https://projectlombok.org/features/index.html)

- add jar

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.16.8</version>
</dependency>
```

- install plugin in idea.

```
IntelliJ IDEA->Prefercence->plugins
```

search for <label class="label label-success">lombok</label>, install and restart.





