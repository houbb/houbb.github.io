---
layout: post
title: 字符串值提取工具-09-java 执行 json 解析, json-path
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

[字符串值提取工具-09-java 执行 json 解析, json-path](https://houbb.github.io/2024/08/05/value-extraction-09-java-json-path)

[字符串值提取工具-10-java 执行表达式引擎](https://houbb.github.io/2024/08/05/value-extraction-10-java-expression)

# 拓展阅读

如果你对 json-path 不是很熟悉，建议学习：

[Json Path-另一种解析 json 的方式 jsonpath](https://houbb.github.io/2018/07/20/json-03-jsonpath)

# 场景

我们希望通过 java 执行 json-path 解析 json。

# 核心实现

```java
package com.github.houbb.value.extraction.core.support.extraction;

import com.github.houbb.value.extraction.api.ValueExtractionContext;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.Option;
import com.jayway.jsonpath.ReadContext;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 *
 * @since 0.6.0
 */
public class ValueExtractionJsonPath extends AbstractValueExtractionAdaptor<ReadContext> {

    @Override
    protected ReadContext prepare(ValueExtractionContext context) {
        final String json = (String) context.getDataMap().get("json");

        // 避免多次解析
        Configuration configuration = Configuration.builder().options(Option.DEFAULT_PATH_LEAF_TO_NULL).build();
        return JsonPath.parse(json, configuration);
    }

    @Override
    protected Object evaluate(ReadContext prepareObject, String script, ValueExtractionContext context) {
        return prepareObject.read(script);
    }

}
```

# 测试例子

```java
public void test() {
        String json = "{\"store\":{\"book\":[{\"category\":\"reference\",\"author\":\"Nigel Rees\",\"title\":\"Sayings of the Century\",\"price\":8.95},{\"category\":\"fiction\",\"author\":\"Evelyn Waugh\",\"title\":\"Sword of Honour\",\"price\":12.99},{\"category\":\"fiction\",\"author\":\"Herman Melville\",\"title\":\"Moby Dick\",\"isbn\":\"0-553-21311-3\",\"price\":8.99},{\"category\":\"fiction\",\"author\":\"J. R. R. Tolkien\",\"title\":\"The Lord of the Rings\",\"isbn\":\"0-395-19395-8\",\"price\":22.99}],\"bicycle\":{\"color\":\"red\",\"price\":19.95}},\"expensive\":10}";

        // 测试 getValueByXPath 方法
        String script = "$.store.book[1].author";

        // 创建绑定并设置参数
        Map<String, Object> bindings = new HashMap<>();
        bindings.put("json", json);

        String result = ValueExtractionBs.newInstance()
                .scripts(Arrays.asList(script))
                .valueExtraction(ValueExtractions.jsonPath())
                .dataMap(bindings)
                .extract().toString();

        Assert.assertEquals("{$.store.book[1].author=Evelyn Waugh}", result);
    }
```

# 参考资料

* any list
{:toc}