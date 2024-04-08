---
layout: post
title:  QLExpress-02-Common Java Grammar
date:  2018-06-10 11:03:08 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---


# 普通 java 语法

## 语法支持

| 序号 | 符号 | 备注 |
|:---|:---|:---|
| 1 | +,-,*,/,<,>,<=,>=,==,!=,<>,%,++,-- | <>等同于!=, mod等同于% |
| 2 | in,like,&&,`||`,! | in, like 类似于 sql 语法 |
| 3 | for，break,continue,if then else | |

## 例子

- 循环

```java
/**
 * 循环操作符测试
 * @throws Exception if any
 */
@Test
public void operateLoopTest() throws Exception {
    final String express = "int n=10;" +
            "int sum=0;int i = 0;" +
            "for(i=0;i<n;i++){" +
            "sum=sum+i;" +
            "}" +
            "return sum;";
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    Object r = runner.execute(express, context, null, true, false);
    Assert.assertEquals(45, r);
}
```

- 逻辑三元操作

注意：这个**没有测试成功**

```java
/**
 * 三目运算符测试
 * 备注：测试不通过
 * @throws Exception if any
 */
@Test
public void logicalTernaryOperationsTest() throws Exception {
    final String express =
            "a=1;b=2;max = a>b?a:b;";
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    Object r = runner.execute(express, context, null, true, false);
    Assert.assertEquals(2, r);
}
```

# Java 对象操作

> Tips

QLExpress 自动会 

```java
import java.lang.*;
import java.util.*;
```

## 测试案例

- User.java

```java
package com.github.houbb.tech.validation.qlexpress;

import org.apache.commons.lang.StringUtils;

/**
 * 备注：例子来自官方例子
 * @author houbinbin
 */
public class User {

	/**
	 * 标识
	 */
	private long id;

	/**
	 * 名称
	 */
	private String name;

	/**
	 * 年龄
	 */
	private int age;
	
	public User(long id){
		this.id = id;
	}
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
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

	/**
	 * 首字母大写
	 * @param value 字符串
	 * @return 转换后的信息
	 */
	public static String firstToUpper(String value){
		if(StringUtils.isBlank(value))
			return "";
		value = StringUtils.trim(value);
		String f = StringUtils.substring(value,0,1);
		String s = "";
		if(value.length() > 1){
			s = StringUtils.substring(value,1);
		}
		return f.toUpperCase() + s;
	}
}
```

- ObjectTest.java

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * tech-validation All rights reserved.
 */

package com.github.houbb.tech.validation.qlexpress;

import com.ql.util.express.DefaultContext;
import com.ql.util.express.ExpressRunner;
import com.ql.util.express.IExpressContext;

import org.junit.Assert;
import org.junit.Test;

/**
 * <p> 对象测试 </p>
 *
 * 备注：例子来自官方例子
 *
 * <pre> Created: 2018/6/6 下午6:09  </pre>
 * <pre> Project: tech-validation  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ObjectTest {

    @Test
    public void test1() throws Exception {
        String exp = "import com.github.houbb.tech.validation.qlexpress.User;" +
                "User cust = new User(1);" +
                "cust.setName(\"小强\");" +
                "return cust.getName();";
        ExpressRunner runner = new ExpressRunner();
        String r = (String) runner.execute(exp, null, null, false, false);
        Assert.assertEquals("操作符执行错误", "小强", r);
    }

    @Test
    public void test2() throws Exception {
        String exp = "cust.setName(\"小强\");" +
                "return cust.getName();";
        IExpressContext<String, Object> expressContext = new DefaultContext<>();
        expressContext.put("cust", new User(1));
        ExpressRunner runner = new ExpressRunner();
        String r = (String) runner.execute(exp, expressContext, null, false, false);
        Assert.assertEquals("操作符执行错误", "小强", r);
    }

    @Test
    public void test3() throws Exception {
        String exp = "首字母大写(\"abcd\")";
        ExpressRunner runner = new ExpressRunner();
        runner.addFunctionOfClassMethod("首字母大写", User.class.getName(), "firstToUpper", new String[]{"String"}, null);
        String r = (String) runner.execute(exp, null, null, false, false);
        Assert.assertEquals("操作符执行错误", "Abcd", r);
    }

    /**
     * 使用别名
     *
     * @throws Exception if any
     */
    @Test
    public void testAlias() throws Exception {
        String exp = "cust.setName(\"小强\");" +
                "定义别名 custName cust.name;" +
                "return custName;";
        IExpressContext<String, Object> expressContext = new DefaultContext<>();
        expressContext.put("cust", new User(1));
        ExpressRunner runner = new ExpressRunner();
        //
        runner.addOperatorWithAlias("定义别名", "alias", null);
        //执行表达式，并将结果赋给r
        String r = (String) runner.execute(exp, expressContext, null, false, false);
        Assert.assertEquals("操作符执行错误", "小强", r);
    }

    /**
     * 使用宏
     *
     * @throws Exception if any
     */
    @Test
    public void testMacro() throws Exception {
        String exp = "cust.setName(\"小强\");" +
                "定义宏 custName {cust.name};" +
                "return custName;";
        IExpressContext<String, Object> expressContext = new DefaultContext<>();
        expressContext.put("cust", new User(1));
        ExpressRunner runner = new ExpressRunner();
        runner.addOperatorWithAlias("定义宏", "macro", null);
        String r = (String) runner.execute(exp, expressContext, null, false, false);
        Assert.assertEquals("操作符执行错误", "小强", r);
    }

}
```

* any list
{:toc}







