---
layout: post
title:  Hibernate Validator 参数校验
date:  2018-08-18 14:40:08 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# Hibernate-Validator

[hibernate-validator](https://github.com/hibernate/hibernate-validator)

# Fluent-Validator

[fluent-validator](https://github.com/neoremind/fluent-validator)

# Valid 

自己定义

# 思考

以前不同 Hibernate-Validator 的魅力，觉得设计了太多的注解。

后来发现使用注解组合的方式，其实拓展性很强。

而且支持自定义注解。

个人的 i18n 和 自定义注解就是模仿这个项目的。

# Hibernate-Validator 入门

## maven 引入

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>5.3.6.Final</version>
</dependency>
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>1.1.0.Final</version>
</dependency>
```

## 工具类

```java
public class ValidateUtil {

    /**
     * 使用hibernate的注解来进行验证
     */
    private  static Validator validator = Validation
            .byProvider(HibernateValidator.class).configure().failFast(true).buildValidatorFactory().getValidator();

    public static <T> void validate(T t) {
        Set<ConstraintViolation<T>> constraintViolations = validator.validate(t);
        // 抛出检验异常
        if (constraintViolations.size() > 0) {
            final String msg = constraintViolations.iterator().next().getMessage();
            throw new ParameterCheckException(msg);
        }
    }
}
```

## 常见注解

```
Bean Validation 中内置的 constraint
@Null   被注释的元素必须为 null
@NotNull    被注释的元素必须不为 null
@AssertTrue     被注释的元素必须为 true
@AssertFalse    被注释的元素必须为 false
@Min(value)     被注释的元素必须是一个数字，其值必须大于等于指定的最小值
@Max(value)     被注释的元素必须是一个数字，其值必须小于等于指定的最大值
@DecimalMin(value)  被注释的元素必须是一个数字，其值必须大于等于指定的最小值
@DecimalMax(value)  被注释的元素必须是一个数字，其值必须小于等于指定的最大值
@Size(max=, min=)   被注释的元素的大小必须在指定的范围内
@Digits (integer, fraction)     被注释的元素必须是一个数字，其值必须在可接受的范围内
@Past   被注释的元素必须是一个过去的日期
@Future     被注释的元素必须是一个将来的日期
@Pattern(regex=,flag=)  被注释的元素必须符合指定的正则表达式
Hibernate Validator 附加的 constraint
@NotBlank(message =)   验证字符串非null，且长度必须大于0
@Email  被注释的元素必须是电子邮箱地址
@Length(min=,max=)  被注释的字符串的大小必须在指定的范围内
@NotEmpty   被注释的字符串的必须非空
@Range(min=,max=,message=)  被注释的元素必须在合适的范围内
```

# springboot 整合

## maven 引入

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
	<version>1.5.9.RELEASE</version>
</dependency>
```

springboot 包中是默认包含 hibernate-validator 的，不需要重复引入。

## controller 定义

```java
@Controller
@RequestMapping("/valid")
public class ValidController {

    @RequestMapping("/user")
    @ResponseBody
    public String user(@Valid User user) {
        return "ok";
    }

}
```

## POSTMAN 测试

使用 postman 模拟测试 

### 通过的例子

![输入图片说明](https://images.gitee.com/uploads/images/2020/0921/094447_ac2a4d15_508704.png)

### 不通过的例子

我们不传输 username

```json
{
    "timestamp": 1600652797208,
    "status": 400,
    "error": "Bad Request",
    "exception": "org.springframework.validation.BindException",
    "errors": [
        {
            "codes": [
                "NotEmpty.user.username",
                "NotEmpty.username",
                "NotEmpty.java.lang.String",
                "NotEmpty"
            ],
            "arguments": [
                {
                    "codes": [
                        "user.username",
                        "username"
                    ],
                    "arguments": null,
                    "defaultMessage": "username",
                    "code": "username"
                }
            ],
            "defaultMessage": "用户名称不可为空",
            "objectName": "user",
            "field": "username",
            "rejectedValue": null,
            "bindingFailure": false,
            "code": "NotEmpty"
        }
    ],
    "message": "Validation failed for object='user'. Error count: 1",
    "path": "/valid/user"
}
```

这里有一个小问题，错误信息提示过于详细，我们不可能直接传递给用户。

## 获取错误信息参数

BindingResult 参数。

BindingResult：主要是存储校验结果的数据，我们可以通过 BindingResult 来判断校验是否通过和获取校验错误提示信息。

```java
@RequestMapping("/result")
@ResponseBody
public String result(@Valid User user, BindingResult bindingResult) {
    if(bindingResult.hasErrors()) {
        String message = bindingResult.getFieldError().getDefaultMessage();
        // 可以封装对象，此处偷懒，直接返回。
        return message;
    }
    return "ok";
}
```

### POSTMAN 测试

调整 POST: http://localhost:8080/valid/result

返回结果：

```
用户名称不可为空
```

## 继续改进

这里还有一个问题，每一次都需要加一个参数，还是很麻烦，完全没有体现出优势。

解决思路：通过 springboot 统一异常拦截进行处理。

```java
package com.github.houbb.springboot.learn.validator.controller;

import com.github.houbb.springboot.learn.validator.dto.ValidVo;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@ControllerAdvice
public class ValidInterceptor {


    /**
     * Validator 参数校验异常处理
     *
     * @param ex 异常
     * @return 结果
     */
    @ExceptionHandler(value = BindException.class)
    public ResponseEntity<Object> handleMethodVoArgumentNotValidException(BindException ex) {
        FieldError err = ex.getFieldError();
        String message = "参数{".concat(err.getField()).concat("}").concat(err.getDefaultMessage());
        ValidVo validVo = new ValidVo();
        validVo.setCode("400");
        validVo.setMsg(message);

        return ResponseEntity.ok(validVo);
    }

    /**
     * Validator 参数校验异常处理
     *
     * @param ex 异常
     * @return 结果
     */
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<Object> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        FieldError err = ex.getBindingResult().getFieldError();
        String message = "参数{".concat(err.getField()).concat("}").concat(err.getDefaultMessage());
        return ResponseEntity.ok(RespUtil.fail(message));
    }

}
```

- 报错提示

```json
{
    "code": "400",
    "msg": "参数{username}用户名称不可为空"
}
```

# 参考资料

[Spring Boot集成Hibernate Validator](https://www.cnblogs.com/sun-fan/p/10599038.html)

[SpringBoot 2 快速整合 Hibernate Validator 数据校验](https://www.cnblogs.com/jerry126/p/11531317.html)

[SpringBoot validator 完美实现+统一封装错误提示](https://blog.csdn.net/catoop/article/details/95366348)

* any list
{:toc}
