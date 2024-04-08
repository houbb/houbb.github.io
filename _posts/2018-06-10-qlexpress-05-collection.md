---
layout: post
title:  QLExpress-05-Collection
date:  2018-06-10 11:57:04 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# 关于集合的快捷写法

```java
/**
 * set 集合测试
 * 备注：集合的快捷写法
 * @throws Exception if any
 */
@Test
public void shorthandTest() throws Exception {
    ExpressRunner runner = new ExpressRunner(false,false);
    DefaultContext<String, Object> context = new DefaultContext<>();
    String express = "abc = NewMap(1:1,2:2); return abc.get(1) + abc.get(2);";
    Object r = runner.execute(express, context, null, false, false);
    Assert.assertEquals(3, r);
    express = "abc = NewList(1,2,3); return abc.get(1)+abc.get(2)";
    r = runner.execute(express, context, null, false, false);
    Assert.assertEquals(5, r);
    express = "abc = [1,2,3]; return abc[1]+abc[2];";
    r = runner.execute(express, context, null, false, false);
    Assert.assertEquals(5, r);
}
```

# 集合的遍历

其实类似 java 的语法，只是 ql **不支持** `for(obj:list){}` 的语法，只能通过下标访问。

- foreachTest()

```java
/**
 * 遍历测试
 * 
 */
@Test
public void foreachTest() throws Exception {
    ExpressRunner runner = new ExpressRunner(false,false);
    DefaultContext<String, Object> context = new DefaultContext<>();
    String express =
            "  Map map = new HashMap();\n" +
            "  map.put(\"a\", \"a_value\");\n" +
            "  map.put(\"b\", \"b_value\");\n" +
            "  keySet = map.keySet();\n" +
            "  objArr = keySet.toArray();\n" +
            "  for (i=0;i<objArr.length;i++) {\n" +
            "  key = objArr[i];\n" +
            "   System.out.println(map.get(key));\n" +
            "  }";
    Object r = runner.execute(express, context, null, false, false);
    System.out.println(r);
}
```

- 测试结果

```
a_value
b_value
null
```



* any list
{:toc}







