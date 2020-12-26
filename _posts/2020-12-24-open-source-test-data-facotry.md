---
layout: post
title:  开源利器：自动生成随机 mock 数据测试对象
date:  2020-12-16 22:11:27 +0800
categories: [RPC]
tags: [rpc, micro service, sh]
published: true
---

# 测试的痛点

大家好，我是老马。

每一位开发者大部分工作都是写代码、测试代码、修BUG。

![测试BUG.jpg](https://upload-images.jianshu.io/upload_images/5874675-b6bddf7eed3678b3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们有很多测试代码，总是花费大量的实践去构建一个对象。

于是就在想，能不能自动填充一个对象呢？

于是去 github 查了一下，找到了一个测试神器 data-factory。

> [https://github.com/houbb/data-factory/](https://github.com/houbb/data-factory/)

# data-factory

## 作用

[data-factory](https://github.com/houbb/data-factory) 项目用于根据对象，随机自动生成初始化信息。便于测试。

## 特性

- 8 大基本类型的支持

- 数组、对象、枚举、Map、链表、Set 等支持

- String、BigDecimal、BigInteger、Currency 等常见类型的支持

- Date、LocalDate、LocalDateTime、LocalTime、Year 等常见日期类型支持

- 支持 Regex 正则表达式

- `@DataFactory` 注解支持灵活配置 

## 快速入门

引入依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>data-factory-core</artifactId>
    <version>0.0.8</version>
</dependency>
```

我们通过 `DataUtil.build(class)` 就可以生成对应类的随机值。

比如 `DataUtil.build(String.class);`，就可以生成随机的字符串：

```
0s5Z8foS1
```

老马发现，基本支持所有常见的类型，我们指定对应的 class 即可，这点还是挺方便的。

不过我一般都是使用对象，那可以自动填充一个对象吗？

![自动化.jpg](https://upload-images.jianshu.io/upload_images/5874675-3ec9b70a82681ec1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 对象 bean 填充

当然，最常用的还是初始化一个 java 对象。

```java
public class User {

    private String name;

    private int age;

    private Date birthday;

    private List<String> stringList;

    //S/F 的枚举
    private StatusEnum statusEnum;

    private Map<String, String> map;
    
    //Getter & Setter
}
```

构建方法 `User user = DataUtil.build(User.class);`

构建对象如下：

```
User{name='wZ8CJZtK', age=-564106861, birthday=Wed Feb 27 22:14:34 CST 2019, stringList=[Du4iJkQj], statusEnum=S, map={yA5yDqM=Kdzi}}
```

内容每次都随机，便于基本的测试数据填充。

# `@DataFactory` 注解

当然，有时候我们希望生成的数据符合一定的规则，这个时候可以通过 `@DataFactory` 注解去进行限制。

## 注解属性

```java
/**
 * 数据生成注解
 * @author binbin.hou
 * @date 2019/3/9
 * @since 0.0.2
 */
@Inherited
@Documented
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DataFactory {

    /**
     * 是否忽略此字段
     *
     * @return 默认不忽略
     */
    boolean ignore() default false;

    /**
     * 数字整数部分最大值。
     * 只作用于数字类型的字段
     *
     * @return 返回最大值
     */
    int max() default 100;

    /**
     * 数字整数部分最小值。
     * 只作用于数字类型的字段
     *
     * @return 返回最小值
     */
    int min() default 0;

    /**
     * 精度。
     * 作用于Float、Double、BigDecimal 小数部分长度
     *
     * @return 返回精度
     */
    int precision() default 2;

    /**
     * 最大长度。只作用于String类型的字段
     *
     * @return 返回最大长度
     */
    int maxLen() default 30;

    /**
     * 最小长度。只作用于String类型的字段
     *
     * @return 返回最小长度
     */
    int minLen() default 1;

    /**
     * 指定当前字段的类实现策略
     * @return 实现类
     * @since 0.0.6
     */
    Class<? extends IData> data() default IData.class;

    /**
     * 正则表达式
     * 1. 当前版本为了简单方便，如果 regex 存在，则直接忽略长度，精度等其他注解配置。
     * 2. 建议直接使用在 String 类型
     * 3. 如果使用其他类型，则必须保证提供了对应的 String 构造器。如{@link Long#Long(String)}
     * 4. 基本类型会直接使用对应的包装类型。
     * @since 0.0.3
     * @return 表达式信息
     */
    String regex() default "";

}
```

## String 类

- 定义对象

```java
/**
 * 字符串类注解测试
 * @author binbin.hou
 * @date 2019/3/9
 * @since 0.0.2
 */
public class UserAnnotationString {

    /**
     * 指定最小长度，最大长度
     */
    @DataFactory(minLen = 2, maxLen = 10)
    private String name;

    /**
     * 忽略生成当前字段
     */
    @DataFactory(ignore = true)
    private String hobby;

    //Getter & Setter

}
```

- 测试代码

```java
/**
*
* Method: build(clazz)
*/
@Test
public void stringAnnotationTest() throws Exception {
    for(int i = 0; i < 100; i++) {
        UserAnnotationString userAnnotationString = DataUtil.build(UserAnnotationString.class);

        Assertions.assertNull(userAnnotationString.getHobby());
        Assertions.assertTrue(userAnnotationString.getName().length() >= 2);
        Assertions.assertTrue(userAnnotationString.getName().length() <= 10);
    }
}
```

## Number 类

- 对象定义

```java
/**
 * 数字类注解测试
 * @author binbin.hou
 * @date 2019/3/9
 * @since 0.0.2
 */
public class UserAnnotationNumber {

    @DataFactory(min = 10, max = 20)
    private Byte aByte;

    @DataFactory(min = 10, max = 20)
    private Short aShort;

    @DataFactory(min = 10, max = 20)
    private Integer integer;

    @DataFactory(min = 10, max = 20)
    private Long aLong;

    @DataFactory(min = 10, max = 20, precision = 3)
    private Double aDouble;

    @DataFactory(min = 10, max = 20, precision = 3)
    private Float aFloat;

    @DataFactory(min = 10, max = 20, precision = 3)
    private BigDecimal bigDecimal;

    @DataFactory(min = 10, max = 20)
    private BigInteger bigInteger;

    //Getter & Setter

}
```

- 测试代码

通过 `DataUtil.build(UserAnnotationNumber.class)` 生成的对象如下：

```
UserAnnotationNumber{aByte=10, aShort=17, integer=19, aLong=11, aDouble=19.888, aFloat=10.067, bigDecimal=18.035, bigInteger=13}
```

## 正则表达式

正则表达式作为一大神器，自然是不能落下。

### 定义

对象的定义如下：

```java
/**
 * 正则表达式测试对象
 * @author binbin.hou
 * @date 2019/3/12
 * @since 0.0.3
 */
public class RegexBean {

    @DataFactory(regex = "[0-3]([a-c]|[e-g]{1,2})")
    private String name;

    @DataFactory(regex = "[0-9]{1,2}")
    private int age;

    @DataFactory(regex = "[0-9]{1,2}")
    private BigDecimal amount;

    //Getter & Setter
    
}
```

### 效果

生成效果如下：

```
RegexBean{name='2c', age=61, amount=39}
```

# 自定义 Data 生成策略

当然，所有的内置策略只能满足最常见的需求。

但是无法满足各种特殊的定制化策略，幸运的是我们可以自定义自己的数据填充策略。

## 自定义生成策略

这里我们实现一个最简单的生成策略，如果是字符串，固定为 123。

```java
public class MyStringData implements IData<String>  {

    @Override
    public String build(IContext context, Class<String> stringClass) {
        return "123";
    }

}
```

## 使用

我们在 `@DataFactory` 注解中指定自己的策略。

```java
public class UserAnnotationData {

    @DataFactory(data = MyStringData.class)
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
```

这样生成的就是我们自己的数据生成策略。

# 不足之处

当然，老马觉得这些特性还是不太方便。

希望作者可以实现支持全局配置之类的特性，这样会更加方便的。

各位小伙伴也可以体验一下，让自己早点下班，享受属于自己的时光。

![下班.jpg](https://upload-images.jianshu.io/upload_images/5874675-776923683467d940.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 小结

今天我们和大家一起感受了数据填充工具的便利性，大家工作中有需要就可以用起来。

为了便于大家学习，所有源码均已开源：

对象填充：[https://github.com/houbb/data-factory](https://github.com/houbb/data-factory)

性能压测：[https://github.com/houbb/junitperf](https://github.com/houbb/junitperf)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}