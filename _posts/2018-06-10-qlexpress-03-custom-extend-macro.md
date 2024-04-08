---
layout: post
title:  QLExpress-03-Custom、Extend、Macro
date:  2018-06-10 11:35:00 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# 自定义函数

脚本中定义function

```java
/**
 * 自定义函数测试
 * @throws Exception if any
 */
@Test
public void defineFunctionTest() throws Exception {
    final String express = "function add(int a,int b){\n" +
            "  return a+b;\n" +
            "};\n" +
            "\n" +
            "function sub(int a,int b){\n" +
            "  return a - b;\n" +
            "};\n" +
            "\n" +
            "a=10;\n" +
            "return add(a,4) + sub(a,9);";
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    Object r = runner.execute(express, context, null, true, false);
    Assert.assertEquals(15, r);
}
```

# 拓展操作符

## 替换关键字

```java
@Test
public void replaceKeywordTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    runner.addOperatorWithAlias("如果", "if", null);
    runner.addOperatorWithAlias("则", "then", null);
    runner.addOperatorWithAlias("否则", "else", null);
    DefaultContext<String, Object> context = new DefaultContext<>();
    final String express = "如果(1>2){ return 10;} 否则 {return 5;}";
    Object r = runner.execute(express, context, null, true, false);
    Assert.assertEquals(5, r);
}
```

## Operator

- JoinOperator.java

```java
import com.ql.util.express.Operator;

/**
 * @author houbinbin
 */
public class JoinOperator extends Operator {

    private static final long serialVersionUID = 5653601029469696306L;

    @Override
    public Object executeInner(Object[] objects) {
        java.util.List result = new java.util.ArrayList();

        for (Object object : objects) {
            if (object instanceof java.util.List) {
                result.addAll(((java.util.List) object));
            } else {
                result.add(object);
            }
        }

        return result;
    }
}
```

- OperatorTest.java

```java
@Test
public void addOperatorTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    runner.addOperator("join", new JoinOperator());
    Object r = runner.execute("1 join 2 join 3", context, null, false, false);
    Assert.assertEquals(Arrays.asList(1,2,3), r);
}
@Test
public void replaceOperatorTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    runner.replaceOperator("+", new JoinOperator());
    Object r = runner.execute("1 + 2 + 3", context, null, false, false);
    Assert.assertEquals(Arrays.asList(1,2,3), r);
}
@Test
public void addFunctionTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    runner.addFunction("join",new JoinOperator());
    Object r = runner.execute("join(1, 2, 3)", context, null, false, false);
    Assert.assertEquals(Arrays.asList(1,2,3), r);
}
```


# 宏定义

```java
@Test
public void macroTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    runner.addMacro("计算平均成绩", "(语文+数学+英语)/3.0");
    runner.addMacro("是否优秀", "计算平均成绩>90");
    IExpressContext<String, Object> context = new DefaultContext<>();
    context.put("语文", 88);
    context.put("数学", 99);
    context.put("英语", 95);
    Boolean result = (Boolean) runner.execute("是否优秀", context, null, false, false);
    Assert.assertTrue(result);
}
```

* any list
{:toc}







