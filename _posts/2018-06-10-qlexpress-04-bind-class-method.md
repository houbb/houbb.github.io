---
layout: post
title:  QLExpress-04-Bind Class or Method
date:  2018-06-10 11:52:52 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# 绑定java类或者对象的method

addFunctionOfClassMethod+addFunctionOfServiceMethod

## 测试案例

```java
/**
 * <p> 绑定对象方法 </p>
 *
 * <pre> Created: 2018/6/9 下午5:27  </pre>
 * <pre> Project: tech-validation  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class BindObjectMethod {

    /**
     * 大写
     * @param abc 字符串
     * @return 转换后
     */
    public static String upper(String abc) {
        return abc.toUpperCase();
    }

    /**
     * 任何包含
     * @param str 字符串
     * @param searchStr 查询字符串
     * @return 是否包含
     */
    public boolean anyContains(String str, String searchStr) {

        char[] s = str.toCharArray();
        for (char c : s) {
            if (searchStr.contains(c + "")) {
                return true;
            }
        }
        return false;
    }

}
```

- bindObjectMethodTest()

```java
@Test
public void bindObjectMethodTest() throws Exception {
    ExpressRunner runner = new ExpressRunner();
    DefaultContext<String, Object> context = new DefaultContext<>();
    
    runner.addFunctionOfClassMethod("取绝对值", Math.class.getName(), "abs",
            new String[] { "double" }, null);
    runner.addFunctionOfClassMethod("转换为大写", BindObjectMethod.class.getName(),
            "upper", new String[] { "String" }, null);
    runner.addFunctionOfServiceMethod("打印", System.out, "println",new String[] { "String" }, null);
    runner.addFunctionOfServiceMethod("contains", new BindObjectMethod(), "anyContains",
            new Class[] { String.class, String.class }, null);
    String exp = "取绝对值(-100);转换为大写(\"hello world\");打印(\"你好吗？\");contains(\"helloworld\",\"aeiou\")";
    Object r = runner.execute(exp, context, null, false, false);
    System.out.println(r);
}
```

测试结果

```
你好吗？
true
```




* any list
{:toc}








