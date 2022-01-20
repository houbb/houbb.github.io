---
layout: post
title: Lucene-15-highlighter 语法高亮
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# highlighter介绍

我们在做查询的时候，希望对我们自己的搜索结果与搜索内容相近的地方进行着重显示。

搜索引擎展示的结果中对用户的输入信息进行了配色方面的处理，这种区分正常文本和输入内容的效果即是高亮显示；

这样做的好处：

- 视觉上让人便于查找有搜索对应的文本块；

- 界面展示更友好；

lucene提供了highlighter插件来体现类似的效果；

highlighter对查询关键字高亮处理；

highlighter包包含了用于处理结果页查询内容高亮显示的功能，其中Highlighter类highlighter包的核心组件，借助Fragmenter, fragment Scorer, 和Formatter等类来支持用户自定义高亮展示的功能；

# 代码

## maven 引入

```xml
<!-- Lucene附加的分析库 -->
<!--检索关键字高亮显示-->
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-highlighter</artifactId>
    <version>7.2.1</version>
</dependency>
<!--与查询比较的高性能单文档索引  高亮显示需要此jar-->
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-memory</artifactId>
    <version>7.2.1</version>
</dependency>
```

## 代码

实例代码如下：

```java
import com.github.houbb.lucene.learn.chap05.SearcherPageUtil;
import com.github.houbb.lucene.learn.chap05.SearcherUtil;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.highlight.Highlighter;
import org.apache.lucene.search.highlight.QueryScorer;
import org.apache.lucene.search.highlight.SimpleFragmenter;
import org.apache.lucene.search.highlight.SimpleHTMLFormatter;
import org.apache.lucene.util.BytesRef;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class HighlighterTest {

    public static void main(String[] args) {
        IndexSearcher searcher;
        TopDocs docs;
        ExecutorService service = Executors.newCachedThreadPool();
        try {
            searcher = SearcherUtil.getMultiSearcher("index", service, true);
            Term term = new Term("content",new BytesRef("lucene"));
            TermQuery termQuery = new TermQuery(term);
            docs = SearcherPageUtil.getScoreDocsByPerPage(1, 30, searcher, termQuery);
            ScoreDoc[] hits = docs.scoreDocs;
            QueryScorer scorer = new QueryScorer(termQuery);
            //设定高亮显示的格式<B>keyword</B>,此为默认的格式
            SimpleHTMLFormatter simpleHtmlFormatter = new SimpleHTMLFormatter("<B>","</B>");
            Highlighter highlighter = new Highlighter(simpleHtmlFormatter,scorer);
            //设置每次返回的字符数
            highlighter.setTextFragmenter(new SimpleFragmenter(20));
            Analyzer analyzer = new StandardAnalyzer();
            for(int i=0;i<hits.length;i++){
                Document doc = searcher.doc(hits[i].doc);
                String str = highlighter.getBestFragment(analyzer, "content", doc.get("content")) ;
                System.out.println(str);
            }
        } catch (Exception e1) {
            e1.printStackTrace();
        } finally{
            service.shutdown();
        }
    }
}
```

## 工具方法

查询的时候，结果高亮的工具方法：

```java
/**
 * 高亮显示字段
 */
public static String[] highlighter(IndexSearcher searcher,String field,String keyword,String preTag, String postTag,int fragmentSize)throws IOException, InvalidTokenOffsetsException {
    Term term = new Term("content",new BytesRef("lucene"));
    TermQuery termQuery = new TermQuery(term);
    TopDocs docs = getScoreDocs(searcher, termQuery);
    ScoreDoc[] hits = docs.scoreDocs;
    QueryScorer scorer = new QueryScorer(termQuery);
    SimpleHTMLFormatter simpleHtmlFormatter = new SimpleHTMLFormatter(preTag,postTag);//设定高亮显示的格式<B>keyword</B>,此为默认的格式
    Highlighter highlighter = new Highlighter(simpleHtmlFormatter,scorer);
    highlighter.setTextFragmenter(new SimpleFragmenter(fragmentSize));//设置每次返回的字符数
    Analyzer analyzer = new StandardAnalyzer();
    String[] result = new String[hits.length];
    for (int i = 0; i < result.length ; i++) {
        Document doc = searcher.doc(hits[i].doc);
        result[i] = highlighter.getBestFragment(analyzer, field, doc.get(field));
    }
    return result;
}
```

# 原理

## 评分原理

lucene的highlighter高亮展示的原理：

根据Formatter和Scorer创建highlighter对象，formatter定义了高亮的显示方式，而scorer定义了高亮的评分；

评分的算法是先根据term的评分值获取对应的document的权重，在此基础上对文本的内容进行轮询,获取对应的文本出现的次数，和它在term对应的文本中出现的位置（便于高亮处理），评分并分词的算法为：

```java
public float getTokenScore() {
  position += posIncAtt.getPositionIncrement();//记录出现的位置
  String termText = termAtt.toString();

  WeightedSpanTerm weightedSpanTerm;

  if ((weightedSpanTerm = fieldWeightedSpanTerms.get(
            termText)) == null) {
    return 0;
  }

  if (weightedSpanTerm.positionSensitive &&
        !weightedSpanTerm.checkPosition(position)) {
    return 0;
  }

  float score = weightedSpanTerm.getWeight();//获取权重

  // found a query term - is it unique in this doc?
  if (!foundTerms.contains(termText)) {//结果排重处理
    totalScore += score;
    foundTerms.add(termText);
  }

  return score;
}
```

## formatter的原理为

对搜索的文本进行判断，如果scorer获取的totalScore不小于0，即查询内容在对应的term中存在，则按照格式拼接成preTag+查询内容+postTag的格式

以 HTML 为例：

```java
@Override
public String highlightTerm(String originalText, TokenGroup tokenGroup) {
  if (tokenGroup.getTotalScore() <= 0) {
    return originalText;
  }

  // Allocate StringBuilder with the right number of characters from the
  // beginning, to avoid char[] allocations in the middle of appends.
  StringBuilder returnBuffer = new StringBuilder(preTag.length() + originalText.length() + postTag.length());
  returnBuffer.append(preTag);
  returnBuffer.append(originalText);
  returnBuffer.append(postTag);
  return returnBuffer.toString();
}
```

其默认格式为 `<B></B>` 的形式；

Highlighter根据scorer和formatter，对document进行分析，查询结果调用getBestTextFragments,TokenStream tokenStream,String text,boolean mergeContiguousFragments,int maxNumFragments)，其过程为

1) scorer首先初始化查询内容对应的出现位置的下标，然后对tokenstream添加PositionIncrementAttribute，此类记录单词出现的位置；

2) 对文本内容进行轮询，判断查询的文本长度是否超出限制，如果超出文本长度提示过长内容；

3) 如果获取到指定的文本，先对单次查询的内容进行内容的截取（截取值根据setTextFragmenter指定的值决定），再调用formatter的highlightTerm方法对文本进行重新构建

4) 在本次轮询和下次单词出现之前对文本内容进行处理



# 参考资料

[一步一步跟我学习lucene（10）---lucene搜索之联想词提示之suggest原理和应用](https://blog.csdn.net/wuyinggui10000/article/details/45788251)

* any list
{:toc}