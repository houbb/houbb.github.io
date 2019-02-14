---
layout: post
title: poi word-02-入门例子
date:  2019-2-14 09:11:35 +0800
categories: [Java]
tags: [tool, java, poi, sh]
published: true
excerpt: poi word-02-入门例子
---

# 入门案例

最基本的 word 创建例子。

# 引入 jar

基于 maven 引入 jar 

```xml
<!-- poi  Excel、Word操作-->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>3.9</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>3.7</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml-schemas</artifactId>
    <version>3.9</version>
</dependency>
```

# 简单例子

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * idoc All rights reserved.
 */

package com.github.houbb.idoc.test.poi;

import org.apache.poi.xwpf.usermodel.Borders;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.junit.Test;

import java.io.FileOutputStream;
import java.io.IOException;

/**
 * <p> </p>
 * <pre> Created: 2019/2/14 7:16 AM  </pre>
 * <pre> Project: idoc  </pre>
 * @author houbinbin
 */
public class WordGenTest {

    @Test
    public void genTest() throws IOException {
        final String path = "/Users/houbinbin/code/_github/idoc/idoc-core/src/main/resources/idoc/word/gen-idoc-word-all.docx";

        XWPFDocument doc = new XWPFDocument();// 创建Word文件

        // 1. 创建段落
        XWPFParagraph p = doc.createParagraph();// 新建一个段落
        p.setAlignment(ParagraphAlignment.CENTER);// 设置段落的对齐方式
        p.setBorderBottom(Borders.DOUBLE);//设置下边框
        p.setBorderTop(Borders.DOUBLE);//设置上边框
        p.setBorderRight(Borders.DOUBLE);//设置右边框
        p.setBorderLeft(Borders.DOUBLE);//设置左边框

        //1.1 标题
        XWPFRun r = p.createRun();//创建段落文本
        r.setText("POI创建的Word段落文本");
        r.setBold(true);//设置为粗体

        // 1.2 正文段落
        p = doc.createParagraph();// 新建一个段落
        r = p.createRun();
        r.setText("POI读写Excel功能强大、操作简单。");

        //2. 创建一个表格
        XWPFTable table= doc.createTable(3, 3);
        table.getRow(0).getCell(0).setText("表格1");
        table.getRow(1).getCell(1).setText("表格2");
        table.getRow(2).getCell(2).setText("表格3");
        FileOutputStream out = new FileOutputStream(path);
        doc.write(out);
        out.close();
    }
}
```

这里演示了 word 文档中最基础的段落纯文本的创建，以及表格的创建。

# 参考资料 

[Java中用Apache POI生成excel和word文档](http://www.cnblogs.com/zsychanpin/p/6734703.html)

[Apache POI自动生成Word文档（带目录）](https://www.jianshu.com/p/0a32d8bd6878)

[poi-tl](http://deepoove.com/poi-tl/)

[Java 对Word文件的生成（基于Apache POI）](https://www.jianshu.com/p/7af902234eb9)

[使用poi生成word文档（最全例子）](https://blog.csdn.net/owen_william/article/details/81290024)

[生成 word 详解](http://www.cnblogs.com/qingruihappy/p/8443403.html)

* any list
{:toc}