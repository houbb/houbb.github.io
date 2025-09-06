---
layout: post
title: v0.29.3 敏感词性能优化之繁简体转换 opencc4j 优化
date: 2025-9-05 20:40:12 +0800
categories: [Java]
tags: [java, nlp, sensitive-word, sh]
published: true
---

# 敏感词性能调优系列

[v0.29.0 敏感词性能优化提升 14 倍全过程](https://houbb.github.io/2025/08/29/sensitive-word-why-so-slow)

[v0.29.1 敏感词性能优化之内部类+迭代器内部类](https://houbb.github.io/2025/09/05/sensitive-word-v0.29.1-opt-init-iter)

[v0.29.2 敏感词性能优化之基本类型拆箱、装箱的进一步优化的尝试](https://houbb.github.io/2025/09/05/sensitive-word-v0.29.2-basic-type-opt)

[v0.29.3 敏感词性能优化之繁简体转换 opencc4j 优化](https://houbb.github.io/2025/08/29/sensitive-word-v0.29.3-opencc4j-opt)

# 背景

## opencc4j

[opencc4j](https://github.com/houbb/opencc4j) 中，因为考虑到汉字的复杂性，可能存在繁简体的多个对应和一个汉字，多个 char 的场景。

所以以前的实现比较复杂

```java
    private static char getChar(char c) {
        List<String> mappingList = ZhConverterUtil.toSimple(c);
        if(CollectionUtil.isEmpty(mappingList)) {
            return c;
        }

        return mappingList.get(0).charAt(0);
    }
```

这里涉及到多余的对象转换。

## 优化思路

在 opencc4j 中提供简化版本的繁简体实现。

```java
package com.github.houbb.opencc4j.util;

import com.github.houbb.opencc4j.model.data.DataInfo;
import com.github.houbb.opencc4j.support.collection.Char2CharMap;
import com.github.houbb.opencc4j.support.data.impl.TSCharData;

import java.util.List;
import java.util.Map;

/**
 * 中文转换简化版
 *
 * @since 1.14.0
 * @author 老马啸西风
 */
public final class ZhSlimUtil {

    private ZhSlimUtil(){}

    private static final Char2CharMap char2CharMap;

    static {
        int size = 100;
        TSCharData tsCharData = new TSCharData();
        DataInfo dataInfo = tsCharData.data();
        Map<String, List<String>> dataList = dataInfo.getDataMap();

        // 这里如果有多个，只看第一个
        // 如果超过2个 char，直接跳过
        char2CharMap = new Char2CharMap(dataList.size());
        for(Map.Entry<String, List<String>> entry : dataList.entrySet()) {
            String key = entry.getKey();
            List<String> valueList = entry.getValue();
            char[] keys = key.toCharArray();
            char[] values = valueList.get(0).toCharArray();
            if(keys.length > 1 || values.length > 1) {
                continue;
            }

            char2CharMap.put(keys[0], values[0]);
        }
    }

    /**
     * 简化版本
     * @param c 字符
     * @return 对应字符
     */
    public static char toSimple(final char c) {
        return char2CharMap.get(c, c);
    }

}
```

## 压测对比

10w 次，这个方法性能平均大概提高了 6 倍左右。

# 小结

底层依赖的库，果然还是可以自己修改最方便。

也最方便性能的拓展和优化。

# 开源地址

> [https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

* any list
{:toc}