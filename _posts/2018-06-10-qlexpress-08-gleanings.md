---
layout: post
title:  QLExpress-08-Gleanings
date:  2018-06-10 12:32:39 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# 编译脚本，查询外部需要定义的变量和函数

注意以下脚本int和没有int的区别

## 测试案例

- compileScriptTest()

```java
/**
 * 注意以下脚本int和没有int的区别
 * 备注：定义 int，则不包含平均分
 *
 * @throws Exception if any
 */
@Test
public void compileScriptTest() throws Exception {
    String express = "int 平均分 = (语文+数学+英语+综合考试.科目2)/4.0;return 平均分";
    ExpressRunner runner = new ExpressRunner(true, false);
    String[] names = runner.getOutVarNames(express);
    for (String s : names) {
        System.out.println("var : " + s);
    }
}
```

- 测试结果

```
var : 数学
var : 综合考试
var : 英语
var : 语文
```

# 关于不定参数的使用

```java
/**
 * 动态参数测试
 * @throws Exception if any
 */
@Test
public void dynamicVarTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    IExpressContext<String,Object> expressContext = new DefaultContext<>();
    runner.addFunctionOfServiceMethod("getTemplate", this, "getTemplate", new Class[]{Object[].class}, null);
    //(1)默认的不定参数可以使用数组来代替
    Object r = runner.execute("getTemplate([11,'22',33L,true])", expressContext, null,false, false);
    Assert.assertEquals("11,22,33,true,", r);

    //(2)像java一样,支持函数动态参数调用,需要打开以下全局开关,否则以下调用会失败
    DynamicParamsUtil.supportDynamicParams = true;
    r = runner.execute("getTemplate(11,'22',33L,true)", expressContext, null,false, false);
    Assert.assertEquals("11,22,33,true,", r);
}
```

* any list
{:toc}







