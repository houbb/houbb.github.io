---
layout: post
title:  Validator-04-5 年，只为了一个更好的校验框架
date:  2018-08-18 14:40:08 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 天地初开

五年前，科技大厦 1 层 B 座。

小明的眼睛直勾勾地盯着屏幕，双手噼里啪啦的敲着键盘。

思考是不存在的，思考只会让小明的速度降下来。

优秀的程序员完全不需要思考，就像不需要写文档和注释一样。

“真是简单的需求啊”，小明觉得有些无聊，“毫无挑战。”

和无数个 web 开发者一样，小明今天做的是用户的注册功能。

首先定义一下对应的用户注册对象：

```java
public class UserRegister {

    /**
     * 名称
     */
    private String name;

    /**
     * 原始密码
     */
    private String password;

    /**
     * 确认密码
     */
    private String password2;

    /**
     * 性别
     */
    private String sex;

    // getter & setter & toString()
}
```

注册时格式要求文档也做了简单的限制：

（1）name 名称必须介于 1-32 位之间

（2）password 密码必须介于 6-32 位之间

（3）password2 确认密码必须和 password 保持一致

（4）sex 性别必须为 BOY/GIRL 两者中的一个。

“这也不难”，无情的编码机器开始疯狂的敲打着键盘，不一会儿基本的校验方法就写好了：

```java
private void paramCheck(UserRegister userRegister) {
    //1. 名称
    String name = userRegister.getName();
    if(name == null) {
        throw new IllegalArgumentException("名称不可为空");
    }
    if(name.length() < 1 || name.length() > 32) {
        throw new IllegalArgumentException("名称长度必须介于 1-32 之间");
    }

    //2. 密码
    String password = userRegister.getPassword();
    if(password == null) {
        throw new IllegalArgumentException("密码不可为空");
    }
    if(password.length() < 6 || password.length() > 32) {
        throw new IllegalArgumentException("密码长度必须介于 6-32 之间");
    }
    //2.2 确认密码
    String password2 = userRegister.getPassword2();
    if(!password.equals(password2)) {
        throw new IllegalArgumentException("确认密码必须和密码保持一致");
    }

    //3. 性别
    String sex = userRegister.getSex();
    if(!SexEnum.BOY.getCode().equals(sex) && !SexEnum.GIRL.getCode().equals(sex)) {
        throw new IllegalArgumentException("性别必须指定为 GIRL/BOY");
    }
}
```

打完收工，小明把代码提交完毕，就早早地下班跑路了。

# 初见 Hibernate-Validator

“小明啊，我今天简单地看了一下你的代码。”，项目经理看似随意地提了一句。

小明停下了手中的工作，看向项目经理，意思是让他继续说下去。

“整体还是比较严谨的，就是写了太多的校验代码。”

“太多的校验代码？不校验数据用户乱填怎么办？”，小明有些不太明白。

“校验代码的话，有时间可以了解一下 hibernate-validator 校验框架。”

“可以，我有时间看下。”

嘴上说着，小明心里一万个不愿意。

什么休眠框架，影响我搬砖的速度。

后来小明还是勉为其难的搜索了一下 hibernate-validator，看了看感觉还不错。

这个框架提供了很多内置的注解，便于日常校验的开发，大大提升了校验方法的可复用性。

于是，小明把自己的校验方法改良了一下：

```java
public class UserRegister {

    /**
     * 名称
     */
    @NotNull(message = "名称不可为空")
    @Length(min = 1, max = 32, message = "名称长度必须介于 1-32 之间")
    private String name;

    /**
     * 原始密码
     */
    @NotNull(message = "密码不可为空不可为空")
    @Length(min = 1, max = 32, message = "密码长度必须介于 6-32 之间")
    private String password;

    /**
     * 确认密码
     */
    @NotNull(message = "确认密码不可为空不可为空")
    @Length(min = 1, max = 32, message = "确认密码必须介于 6-32 之间")
    private String password2;

    /**
     * 性别
     */
    private String sex;

}
```

校验方法调整如下：

```java
private void paramCheck2(UserRegister userRegister) {
    //1. 名称
    ValidateUtil.validate(userRegister);

    //2.2 确认密码
    String password2 = userRegister.getPassword2();
    if(!userRegister.getPassword().equals(password2)) {
        throw new IllegalArgumentException("确认密码必须和密码保持一致");
    }

    //3. 性别
    String sex = userRegister.getSex();
    if(!SexEnum.BOY.getCode().equals(sex) && !SexEnum.GIRL.getCode().equals(sex)) {
        throw new IllegalArgumentException("性别必须指定为 GIRL/BOY");
    }
}
```

确实清爽了很多，ValidateUtil 是基于一个简单的工具类：

```java
public class ValidateUtil {

    /**
     * 使用hibernate的注解来进行验证
     */
    private  static Validator validator = Validation
            .byProvider(HibernateValidator.class)
            .configure().failFast(true)
            .buildValidatorFactory()
            .getValidator();

    public static <T> void validate(T t) {
        Set<ConstraintViolation<T>> constraintViolations = validator.validate(t);
        // 抛出检验异常
        if (constraintViolations.size() > 0) {
            final String msg = constraintViolations.iterator().next().getMessage();
            throw new IllegalArgumentException(msg);
        }
    }

}
```

但是小明依然觉得不满意，sex 的校验可以进一步优化吗？

答案是肯定的，小明发现 hibernate-validator 支持自定义注解。

这是一个很强大的功能，**优秀的框架就应该为使用者提供更多的可能性**。

于是小明实现了一个自定义注解：

```java
@Target({ ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MyEnumRangesValidator.class)
public @interface MyEnumRanges {

    Class<? extends Enum> value();

    String message() default "";

}
```

MyEnumRangesValidator 的实现如下：

```java
public class MyEnumRangesValidator implements
        ConstraintValidator<MyEnumRanges, String> {

    private MyEnumRanges myEnumRanges;

    @Override
    public void initialize(MyEnumRanges constraintAnnotation) {
        this.myEnumRanges = constraintAnnotation;
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return getEnumValues(myEnumRanges.value()).contains(value);
    }

    /**
     * 获取枚举值对应的信息
     *
     * @param enumClass 枚举类
     * @return 枚举说明
     * @since 0.0.9
     */
    private List<String> getEnumValues(Class<? extends Enum> enumClass) {
        Enum[] enums = enumClass.getEnumConstants();

        return ArrayUtil.toList(enums, new IHandler<Enum, String>() {
            @Override
            public String handle(Enum anEnum) {
                return anEnum.toString();
            }
        });
    }

}
```

限制当前的字段值必须在指定的枚举范围内，以后所有涉及到枚举范围的，使用这个注解即可搞定。

然后把 `@MyEnumRanges` 加在 sex 字段上：

```java
@NotNull(message = "性别不可为空")
@MyEnumRanges(message = "性别必须在 BOY/GIRL 范围内", value = SexEnum.class)
private String sex;
```

这样校验方法可以简化如下：

```java
private void paramCheck3(UserRegister userRegister) {
    //1. 名称
    ValidateUtil.validate(userRegister);
    //2.2 确认密码
    String password2 = userRegister.getPassword2();
    if(!userRegister.getPassword().equals(password2)) {
        throw new IllegalArgumentException("确认密码必须和密码保持一致");
    }
}
```

小明满意的笑了笑。

但是他的笑容只是持续了一会儿，因为他发现了一个不令人满意的地方。

确认密码这一段代码可以去掉吗？

好像直接使用 hibernate-validator 框架是做不到的。

# 框架不足之处

这一切令小明很痛苦，他发现框架本身确实有很多不足之处。

## hibernate-validator 无法满足的场景

如今 java 最流行的 hibernate-validator 框架，但是有些场景是无法满足的。

比如：

1. 验证新密码和确认密码是否相同。(同一对象下的不同属性之间关系)

2. 当一个属性值满足某个条件时，才进行其他值的参数校验。

3. 多个属性值，至少有一个不能为 null

其实，在对于多个字段的关联关系处理时，hibernate-validator 就会比较弱。

本项目结合原有的优点，进行这一点的功能强化。

## validation-api 过于复杂

validation-api 提供了丰富的特性定义，也同时带来了一个问题。

实现起来，特别复杂。

然而我们实际使用中，常常不需要这么复杂的实现。

valid-api 提供了一套简化很多的 api，便于用户自行实现。

## 自定义缺乏灵活性

hibernate-validator 在使用中，自定义约束实现是基于注解的，针对单个属性校验不够灵活。

本项目中，将属性校验约束和注解约束区分开，便于复用和拓展。

## 过程式编程 vs 注解式编程

hibernate-validator 核心支持的是注解式编程，基于 bean 的校验。

一个问题是针对属性校验不灵活，有时候针对 bean 的校验，还是要自己写判断。

本项目支持 fluent-api 进行过程式编程，同时支持注解式编程。

尽可能兼顾灵活性与便利性。

# valid 工具的诞生

于是小明花了很长时间，写了一个校验工具，希望可以弥补上述工具的不足。

> 开源地址：[https://github.com/houbb/valid](https://github.com/houbb/valid)

## 特性

- 支持 fluent-validation

- 支持 jsr-303 注解，支持所有 hibenrate-validator 常用注解

- 支持 i18n

- 支持用户自定义策略

- 支持用户自定义注解

- 支持针对属性的校验

- 支持过程式编程与注解式编程

- 支持指定校验生效的条件

## 快速开始

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>valid-jsr</artifactId>
    <version>0.2.2</version>
</dependency>
```

### 编码

工具类使用：

```java
User user = new User();
user.sex("what").password("old").password2("new");

ValidHelper.failOverThrow(user);
```

报错如下：

会抛出 ValidRuntimeException 异常，异常的信息如下：

```
name: 值 <null> 不是预期值,password: 值 <old> 不是预期值,sex: 值 <what> 不是预期值
```

其中 User 的定义如下：

```java
public class User {

    /**
     * 名称
     */
    @HasNotNull({"nickName"})
    private String name;

    /**
     * 昵称
     */
    private String nickName;

    /**
     * 原始密码
     */
    @AllEquals("password2")
    private String password;

    /**
     * 新密码
     */
    private String password2;

    /**
     * 性别
     */
    @Ranges({"boy", "girl"})
    private String sex;

    /**
     * 失败类型枚举
     */
    @EnumRanges(FailTypeEnum.class)
    private String failType;

    //Getter and Setter
}
```

内置注解简介如下：

| 注解  | 说明 |
|:----|:-----|
| @AllEquals | 当前字段及指定字段值必须全部相等 |
| @HasNotNull | 当前字段及指定字段值至少有一个不为 null |
| @EnumRanges | 当前字段值必须在枚举属性范围内 |
| @Ranges | 当前字段值必须在指定属性范围内 |

小明在设计验证工具的时候，针对 hibernater 的不足都做了一点小小的改进。

可以让字段之间产生联系，以提供更加强大的功能。

每一个注解都有对应的过程式方法，让你可以在注解式和过程式中切换自如。

内置了 `@Condition` 的注解生效条件，让注解生效更加灵活。

小明抬头看了看墙上的钟，夜已经太深了，百闻不如一见，感兴趣的小伙伴可以自己去感受一下：

> 开源地址：[https://github.com/houbb/valid](https://github.com/houbb/valid)

# 小结

这个开源工具是日常工作中不想写太多校验方法的产物，还处于初期阶段，还有很多需要改进的地方。

不过，希望你能喜欢。

我是老马，期待与你的下次重逢。

* any list
{:toc}
