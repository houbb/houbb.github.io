---
layout: post
title: 字符串值提取工具-10-java 执行表达式引擎 
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 值提取系列

[字符串值提取工具-01-概览](https://houbb.github.io/2024/08/05/value-extraction-01-overview)

[字符串值提取工具-02-java 调用 js](https://houbb.github.io/2024/08/05/value-extraction-02-java-call-js)

[字符串值提取工具-03-java 调用 groovy](https://houbb.github.io/2024/08/05/value-extraction-03-java-call-groovy)

[字符串值提取工具-04-java 调用 java? Janino 编译工具](https://houbb.github.io/2024/08/05/value-extraction-04-java-call-java)

[字符串值提取工具-05-java 调用 shell](https://houbb.github.io/2024/08/05/value-extraction-05-java-call-shell)

[字符串值提取工具-06-java 调用 python](https://houbb.github.io/2024/08/05/value-extraction-06-java-call-python)

[字符串值提取工具-07-java 调用 go](https://houbb.github.io/2024/08/05/value-extraction-07-java-call-go)

[字符串值提取工具-08-java 通过 xml-path 解析 xml](https://houbb.github.io/2024/08/05/value-extraction-08-java-xpath)

# 拓展阅读

如果你对表达式引擎不是很熟悉，建议学习：

[java 表达式引擎概览-00-chat](https://houbb.github.io/2020/05/26/expression-engine-00-chat)

[java 表达式引擎概览-01-overview](https://houbb.github.io/2020/05/26/expression-engine-01-overivew)

[java 表达式引擎概览-02-google 表达式引擎 Aviator 入门介绍](https://houbb.github.io/2020/05/26/expression-engine-02-aviator-intro)

# 场景

我们希望通过 java 执行 json-path 解析 json。

# 核心实现

```java
public class ValueExtractionAviator extends AbstractValueExtractionAdaptor<Map<String, Object>> {


    @Override
    protected Map<String, Object> prepare(ValueExtractionContext context) {
        return context.getDataMap();
    }

    @Override
    protected Object evaluate(Map<String, Object> prepareObject, String script, ValueExtractionContext context) {
        return AviatorEvaluator.execute(script, prepareObject);
    }

}
```

# 测试例子

```java
int[] a = {1, 2, 3, 4, 5};
    Map<String, Object> env = new HashMap<>(1);
    env.put("a", a);
    //求数组长度
    AviatorEvaluator.execute("count(a)", env);
    Map<String, Object> result = ValueExtractionBs.newInstance()
            .scripts(Arrays.asList("count(a)"))
            .valueExtraction(ValueExtractions.aviator())
            .dataMap(env)
            .extract();
    Assert.assertEquals(5L, result.get("count(a)"));.assertEquals("{$.store.book[1].author=Evelyn Waugh}", result);
}
```

# 参考资料

* any list
{:toc}