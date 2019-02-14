---
layout: post
title: poi word-04-POI TL 
date:  2019-2-14 09:11:35 +0800
categories: [Java]
tags: [tool, java, poi, sh]
published: true
excerpt: poi word-04-POI TL 
---

# poi-tl

[poi-tl](http://deepoove.com/poi-tl/) 是一款基于 poi+FTL 思想的框架。

对原来的 apache poi 进行封装，简化了我们的操作。

# 入门案例

## maven 引入

```xml
<dependency>
    <groupId>com.deepoove</groupId>
    <artifactId>poi-tl</artifactId>
    <version>1.4.2</version>
</dependency>
```

## 入门案例

`{{var}}` 用来标识纯文本。

templatePath 对应的 word 模板中，我指定了 `{{today}}`，生成的信息中就会被指定的信息替换掉。

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * idoc All rights reserved.
 */

package com.github.houbb.idoc.test.poi;

import com.deepoove.poi.XWPFTemplate;

import org.junit.Test;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;

/**
 * <p> </p>
 *
 * <pre> Created: 2019/2/14 6:30 AM  </pre>
 * <pre> Project: idoc  </pre>
 *
 * @author houbinbin
 */
public class WordFtlTest {

    @Test
    public void textTest() throws IOException {
        final String templatePath = "/Users/houbinbin/code/_github/idoc/idoc-core/src/main/resources/idoc/word/idoc-word-all.docx";
        final String templateOutPath = "/Users/houbinbin/code/_github/idoc/idoc-core/src/main/resources/idoc/word/test-idoc-word-all.docx";

        XWPFTemplate template = XWPFTemplate.compile(templatePath).render(new HashMap<String, Object>(){{
            put("today", "2019-02-14");
        }});
        FileOutputStream out = new FileOutputStream(templateOutPath);
        template.write(out);
        out.flush();
        out.close();
        template.close();
    }

}
```

# 个人感觉

## 优点

封装的相对比较合理。

思想也非常正确。

## 缺点

在处理循环的时候，需要一个模板嵌套另一个模板。

这非常的麻烦，能否简化掉？

我看了指定的插件等，暂时无法满足。

所以想自己设计一个类似 FTL 语法的模板解析，可以在 poi-tl 的基础上进行类似的封装。

# 参考资料 

[poi-tl](http://deepoove.com/poi-tl/)

* any list
{:toc}