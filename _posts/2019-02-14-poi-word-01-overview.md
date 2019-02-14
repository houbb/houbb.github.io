---
layout: post
title: poi word-01-概览
date:  2019-2-14 09:11:35 +0800
categories: [Java]
tags: [tool, java, poi, sh]
published: true
excerpt: poi word-01-概览
---

# 学习的目标

可以用 word 模板+元数据=指定的 word 文档信息。

# word 的本质是什么？

原来学习 poi 生成 excel 的时候，其实 excel 的本质就是 xml。

那么 word 呢？

其实也是一样的。

## word 与 xml 的故事

我新建了一个 word 文件，内容如下：

```
其实word文档的本质还是xml文件。
如果你知道这个技巧，那么就可以直接将word视为xml文件，然后结合Freemarker等模板处理即可。
```

保存为 xml 文件之后，内容如下：

（隐藏掉了大部分样式之类的信息）

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage"><pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="512"><pkg:xmlData><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" 
....
....
w:hint="eastAsia"/></w:rPr><w:t>。</w:t></w:r></w:p><w:p w:rsidR="00920BBB" w:rsidRDefault="00920BBB"><w:pPr><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr></w:pPr><w:r><w:t>如果你知道这个技巧</w:t></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>，</w:t></w:r><w:r><w:t>那么就可以直接将</w:t></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>w</w:t></w:r><w:r><w:t>ord</w:t></w:r><w:r><w:t>视为</w:t></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>x</w:t></w:r><w:r><w:t>ml</w:t></w:r><w:r><w:t>文件</w:t></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>，</w:t></w:r><w:r><w:t>然后结合</w:t></w:r><w:r><w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr><w:t>F</w:t></w:r><w:r><w:t>reemarker</w:t></w:r><w:r><w:t>等模板处理即可</w:t></w:r><w:r><w:rPr>
....
....
</pkg:package>
```

## word 与 Freemarker 等模板

1. 写一份 word 模板

2. 将需要替换的地方，写成  `${XXX}` 便于 FTL 替换的形式。

3. 将 `XXX.docx` 文件另存为 `XXX.xml` 文件。

4. 直接将 xml 文件利用 FTL 生成替换即可。

5. 然后将生成后的文件重新保存为 `XXX.docx` 

当然，这个过程可以利用代码直接隐藏细节。


## word 视为 xml 的优缺点

优点实现起来非常简单

缺点就是不够优雅，也不够灵活。如果想调整样式等信息，则需要对 xml 进行理解和处理。

# 拓展阅读

[poi-tl](http://deepoove.com/poi-tl/) 是一款基于 poi+FTL 思想的框架。

设计的比较不错，值得借鉴。

# 参考资料 

[Java中用Apache POI生成excel和word文档](http://www.cnblogs.com/zsychanpin/p/6734703.html)

[Apache POI自动生成Word文档（带目录）](https://www.jianshu.com/p/0a32d8bd6878)

[poi-tl](http://deepoove.com/poi-tl/)

[Java 对Word文件的生成（基于Apache POI）](https://www.jianshu.com/p/7af902234eb9)

[使用poi生成word文档（最全例子）](https://blog.csdn.net/owen_william/article/details/81290024)

[生成 word 详解](http://www.cnblogs.com/qingruihappy/p/8443403.html)

* any list
{:toc}