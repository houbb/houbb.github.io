---
layout: post
title: Lucene-08-analysis 分析器
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# analysis说明

lucene ananlysis应用场景

lucene提供了analysis用来将文本转换到索引文件或提供给IndexSearcher查询索引；

对于lucene而言，不管是索引还是检索，都是针对于纯文本输入来讲的；

通过lucene的强大类库我们可以访问各种格式的文档，如HTML、XML、PDF、Word、TXT等，

我们需要传递给lucene的只是文件中的纯文本内容；

# lucene的词语切分

lucene的索引和检索前提是其对文本内容的分析和词组的切分；比如，文档中有一句话叫“Hello World,Welcome to Lucene”

我们想找到包含这段话的文档，而用户输入的查询条件又不尽详细（可能只是hello）

这里我们就需要用到lucene索引该文档的时候预先对文档内容进行切分，将词源和文本对应起来。

有时候对词语进行简单切分还远远不够，我们还需要对字符串进行深度切分，lucene不仅能够对索引内容预处理还可以对请求参数进行切分；

## 使用analyzer

lucene的索引使用如下：

```java
package com.github.houbb.lucene.learn.chap03;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;

import java.io.IOException;
import java.io.StringReader;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class AnalysisDemo {

    public static void main(String[] args) {
        // or any other analyzer
        try (Analyzer analyzer = new StandardAnalyzer();
             TokenStream ts = analyzer.tokenStream("myfield", new StringReader(
                     "some text goes here"));) {
            OffsetAttribute offsetAtt = ts.addAttribute(OffsetAttribute.class);
            ts.reset(); // Resets this stream to the beginning. (Required)
            while (ts.incrementToken()) {
                // Use AttributeSource.reflectAsString(boolean)
                // for token stream debugging.
                System.out.println("token: " + ts.reflectAsString(true));

                System.out.println("token start offset: "
                        + offsetAtt.startOffset());
                System.out.println("token end offset: "
                        + offsetAtt.endOffset());
                System.out.println();
            }
            ts.end();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

这里是标准的分词，输出如下：

```
token: org.apache.lucene.analysis.tokenattributes.CharTermAttribute#term=some,org.apache.lucene.analysis.tokenattributes.TermToBytesRefAttribute#bytes=[73 6f 6d 65],org.apache.lucene.analysis.tokenattributes.OffsetAttribute#startOffset=0,org.apache.lucene.analysis.tokenattributes.OffsetAttribute#endOffset=4,org.apache.lucene.analysis.tokenattributes.PositionIncrementAttribute#positionIncrement=1,org.apache.lucene.analysis.tokenattributes.PositionLengthAttribute#positionLength=1,org.apache.lucene.analysis.tokenattributes.TypeAttribute#type=<ALPHANUM>,org.apache.lucene.analysis.tokenattributes.TermFrequencyAttribute#termFrequency=1
token start offset: 0
token end offset: 4

...
```

就是将我们的 `some text goes here` 进行分词，变成最基本的 Term: some text goes here。

当然，我们可以自定义属于自己的分词实现。

# 自定义Analyzer和实现自己的analysis模块

1.要实现自己的analyzer，我们需要继承Analyzer并重写其中的分词模块。

2.维护停止词词典

3.重写TokenStreamComponents方法，选择合适的分词方法，对词语进行过滤

## 例子

示例代码如下

```java
package com.github.houbb.lucene.learn.chap03;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.CharArraySet;
import org.apache.lucene.analysis.StopFilter;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.core.LowerCaseTokenizer;
import org.apache.lucene.analysis.core.StopAnalyzer;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MyAnalyzer extends Analyzer {

    private CharArraySet stopWordSet;//停止词词典

    public CharArraySet getStopWordSet() {
        return stopWordSet;
    }

    public void setStopWordSet(CharArraySet stopWordSet) {
        this.stopWordSet = stopWordSet;
    }


    public MyAnalyzer() {
        super();
        this.stopWordSet = StopAnalyzer.ENGLISH_STOP_WORDS_SET;//可在此基础上拓展停止词
    }

    /**
     * 扩展停止词
     *
     * @param stops
     */
    public MyAnalyzer(String[] stops) {
        this();
        stopWordSet.addAll(StopFilter.makeStopSet(stops));
    }

    @Override
    protected TokenStreamComponents createComponents(String fieldName) {
        //正则匹配分词
        Tokenizer source = new LowerCaseTokenizer();
        return new TokenStreamComponents(source, new StopFilter(source, stopWordSet));
    }
    
}
```

我们自定义一个可以指定 stopword 的分析器。

### 测试代码

```java
String words = "A AN yuyu";

try (Analyzer analyzer = new MyAnalyzer();
     TokenStream stream = analyzer.tokenStream("myField", words)) {
    stream.reset();
    CharTermAttribute offsetAtt = stream.addAttribute(CharTermAttribute.class);
    while (stream.incrementToken()) {
        System.out.println(offsetAtt.toString());
    }
    stream.end();
} catch (IOException e) {
    e.printStackTrace();
}
```

输出结果为：

```
yuyu
```

因为其中的 A AN 都是停顿词，被过滤掉了。

# 总结

当然，除了常规的停顿词，，我们也可以添加其他各种丰富的过滤策略。

比如长度低于 2 个字符进行过滤等等。

# 参考资料

[一步一步跟我学习lucene（3）---lucene的analysis相关和自定义分词器](https://blog.csdn.net/wuyinggui10000/article/details/45567815)

* any list
{:toc}