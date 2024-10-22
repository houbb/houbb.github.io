---
layout: post
title:  FastJSON-03-fastjson 如何把 value 全部序列化为字符串
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, overview, sf]
published: true
---

# 业务场景


## 目的

想把所有的 value 都序列化为字符串，而不是 map 或者 object。

# 实现方式

## xml

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.83</version>
</dependency>
```

## 代码

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.serializer.ValueFilter;

import java.util.HashMap;
import java.util.Map;

public class JsonTest {

    public static void main(String[] args) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "123");
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("age", 10);
        Map<String, Object> hobbyInfo = new HashMap<>();
        hobbyInfo.put("love", "it");
        userInfo.put("hobby", hobbyInfo);
        map.put("user", userInfo);

        // 自定义 ValueFilter 将所有非字符串类型的值转换为 JSON 字符串
        ValueFilter valueFilter = (obj, s, v) -> {
            if (v instanceof Map || v instanceof Object) {
                return JSON.toJSONString(v); // 将 Map 或对象序列化为 JSON 字符串
            }
            return v; // 保留其他类型的原始值
        };

        System.out.println(JSON.toJSONString(map));
        System.out.println(JSON.toJSONString(map, SerializerFeature.WriteNonStringValueAsString));
        System.out.println(JSON.toJSONString(map, valueFilter));
    }

}
```

## 效果

```
{"name":"123","user":{"age":10,"hobby":{"love":"it"}}}
{"name":"123","user":{"age":"10","hobby":{"love":"it"}}}
{"name":"\"123\"","user":"{\"age\":10,\"hobby\":{\"love\":\"it\"}}"}
```

# json 系列

## 字符串

[DSL-JSON 最快的 java 实现](https://houbb.github.io/2018/07/20/json-01-dsl-json)

[Ali-FastJson](https://houbb.github.io/2018/07/20/json-01-fastjson)

[Google-Gson](https://houbb.github.io/2018/07/20/json-01-gson)

[Jackson](https://houbb.github.io/2018/07/20/json-01-jackson)

## 二进制

[Google protocol buffer](https://houbb.github.io/2018/07/20/json-02-google-protocol-buffer)

[Apache Thrift](https://houbb.github.io/2018/09/20/json-02-apache-thirft)

[Hession](https://houbb.github.io/2018/07/20/json-02-hession)

[Kryo](https://houbb.github.io/2018/07/20/json-02-kryo)

[Fst](https://houbb.github.io/2018/07/20/json-01-fst)

[Messagepack](https://houbb.github.io/2018/07/20/json-02-messagepack)

[Jboss Marshaling](https://houbb.github.io/2018/07/20/json-02-jboss-marshaling)

## 其他

[JsonPath](https://houbb.github.io/2018/07/20/json-03-jsonpath)

[JsonIter](https://houbb.github.io/2018/07/20/json-01-jsoniter)


# 参考资料



* any list
{:toc}