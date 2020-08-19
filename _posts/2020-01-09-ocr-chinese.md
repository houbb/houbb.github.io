---
layout: post
title: java 实现 OCR 图片文字识别中文
date:  2020-1-9 10:09:32 +0800
categories: [OCR]
tags: [java, ocr, sh]
published: true
---

# 背景

我们上一节讲过了针对英文的 ocr 实现，现在我们来尝试一下中文识别。

我们准备一张简单的中文图片：

![image](https://user-images.githubusercontent.com/18375710/72068959-1788cc80-3321-11ea-8cff-3d68add997f0.png)

# 准备工作

## 下载中文训练集

下载地址 [所有语言的训练集](https://github.com/tesseract-ocr/tessdata)

此处直接下载 [简体中文训练集](https://github.com/tesseract-ocr/tessdata/blob/master/chi_sim.traineddata)，然后将其拷贝到我们的

tessdata 文件夹中：

```
C:\Program Files (x86)\Tesseract-OCR\tessdata
```

## maven 引入

```xml
<dependency>
    <groupId>net.sourceforge.tess4j</groupId>
    <artifactId>tess4j</artifactId>
    <version>4.5.1</version>
</dependency>
```

## 编码

```java
package com.github.houbb.ocr;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

import java.io.File;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Main {

    public static void main(String[] args) throws TesseractException {
        ITesseract instance = new Tesseract();
        // 指定训练数据集合的路径
        instance.setDatapath("C:\\Program Files (x86)\\Tesseract-OCR\\tessdata");
        // 指定为中文识别
        instance.setLanguage("chi_sim");

        // 指定识别图片
        File imgDir = new File("D:\\code\\ocr\\src\\main\\resources\\nihao.png");
        long startTime = System.currentTimeMillis();
        String ocrResult = instance.doOCR(imgDir);

        // 输出识别结果
        System.out.println("OCR Result: \n" + ocrResult + "\n 耗时：" + (System.currentTimeMillis() - startTime) + "ms");
    }

}
```

## 测试结果

```
OCR Result: 
你 好 啊 , 文 字 识 别 。

 耗时：1499ms
```

# 总结

目前看来还是比较简单的，但是实际应用常见会更加的复杂。

比如中英文混杂的文字，如何降低色彩等噪音信息。

关于图片相关的信息也需要进一步学习。

# 参考资料

[Java OCR 图像智能字符识别技术，可识别中文](https://www.cnblogs.com/pejsidney/p/9487888.html)

[Java 实现OCR 识别图像文字(手写中文)----tess4j](https://blog.csdn.net/weixin_37794901/article/details/83343092)

[Java使用OCR技术识别图形图像文本信息](https://www.jianshu.com/p/c2ddd2e411af)

* any list
{:toc}