---
layout: post
title:  Java Get Method
date:  2017-09-05 19:56:51 +0800
categories: [Java]
tags: [java, reflect]
published: true
---


# Java Method


## 缘起

今天通过反射去获取一个 bean 的所有 `get*()` 方法。

- User.class

```java
public class User {

    private String name;

    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

}
```

- getMethodsTest()

```java
@Test
public void getMethodsTest() {
    Class clazz = User.class;

    Method[] methods = clazz.getDeclaredMethods();
    for(Method method : methods) {
        String methodName = method.getName();
        if(methodName.startsWith("get")) {
            System.out.println(methodName);
        }
    }
}
```

result

```
getName
getAge
```

## 另一种

当然本文想说的不是上一种方法。我个人认为依据字符串判断的方法不太方便，记得 Java 提供了直接获取 get*() 的对应方法。

于是就查了一下，也可以用如下方式实现：

```java
@Test
public void propertyDescriptorTest() throws IntrospectionException {
    Class clazz = User.class;
    Field[] fields = clazz.getDeclaredFields();//获得属性
    for (Field field : fields) {
        PropertyDescriptor pd = new PropertyDescriptor(field.getName(), clazz);
        Method getMethod = pd.getReadMethod();//获得get方法
        System.out.println(getMethod.getName());
    }
}
```

result

```
getName
getAge
```

<label class="label label-success">Think</label>

这种方法是有缺陷的，只适用于拥有对应属性且有对应 get 方法。
 

* any list
{:toc}





