---
layout: post
title:  Validator-02-自定义校验注解
date:  2018-08-18 14:40:08 +0800
categories: [Java]
tags: [java, sf]
published: true
---

#  说明

禁止字符串包含英文逗号。

```java
@Target({ ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotAllowCommaValidator.class)
public @interface NotAllowComma {

    /**
     * 错误提示
     * @return 提示
     */
    String message();

}
```

# 实现

```java
public class NotAllowCommaValidator implements
		ConstraintValidator<NotAllowComma, String> {

	@Override
	public void initialize(NotAllowComma constraintAnnotation) {
		//nothing
	}

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null) {
			return true;
		}

		// 包含逗号，则认为错误
		if(value.contains(",")) {
			return false;
		}

		return true;
	}

}
```





* any list
{:toc}
