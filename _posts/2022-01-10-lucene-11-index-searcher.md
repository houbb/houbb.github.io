---
layout: post
title: Lucene-11-lucene 搜索之 IndexSearcher 构建过程
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# IndexSearcher

搜索引擎的构建分为索引内容和查询索引两个大方面，这里要介绍的是lucene索引查询器即IndexSearcher的构建过程；

首先了解下IndexSearcher：

IndexSearcher提供了对单个IndexReader的查询实现；

我们对索引的查询，可以通过调用search(Query,n)或者search(Query,Filter,n)方法；

在索引内容变动不大的情况下，我们可以对索引的搜索采用单个IndexSearcher共享的方式来提升性能；

如果索引有变动，我们就需要使用DirectoryReader.openIfChanged(DirectoryReader)来获取新的reader，然后创建新的IndexSearcher对象；

为了使查询延迟率低，我们最好使用近实时搜索的方法（此时我们的DirectoryReader的构建就要采用DirectoryReader.open(IndexWriter, boolean)）

IndexSearcher实例是完全线程安全的,这意味着多个线程可以并发调用任何方法。如果需要外部同步,无需添加IndexSearcher的同步；

# IndexSearcher的创建过程

```java
Directory dir = FSDirectory.open(Paths.get(indexDir));
```

根据索引文件路径创建FSDirectory的实例，返回的FSDirectory实例跟系统或运行环境有关，对于Linux, MacOSX, Solaris, and Windows 64-bit JREs返回的是一个MMapDirectory实例，对于其他非windows JREs环境返回的是NIOFSDirectory，而对于其他Windows的JRE环境返回的是SimpleFSDirectory，其执行效率依次降低

```java
// 通过dir得到的路径下的所有的文件
IndexReader reader = DirectoryReader.open(dir);
```

接着DirectoryReader根据获取到的FSDirectory实例读取索引文件并得到DirectoryReader对象；DirectoryReader的open方法返回实例的原理：

读取索引目录中的Segments文件内容，倒序遍历SegmentInfos并填充到SegmentReader（IndexReader的一种实现）数组，并构建StandardDirectoryReader的实例

```java
/** called from DirectoryReader.open(...) methods */
static DirectoryReader open(final Directory directory, final IndexCommit commit) throws IOException {
  return new SegmentInfos.FindSegmentsFile<DirectoryReader>(directory) {
    @Override
    protected DirectoryReader doBody(String segmentFileName) throws IOException {
      SegmentInfos sis = SegmentInfos.readCommit(directory, segmentFileName);
      final SegmentReader[] readers = new SegmentReader[sis.size()];
      boolean success = false;
      try {
        for (int i = sis.size()-1; i >= 0; i--) {
          readers[i] = new SegmentReader(sis.info(i), sis.getIndexCreatedVersionMajor(), IOContext.READ);
        }
        // This may throw CorruptIndexException if there are too many docs, so
        // it must be inside try clause so we close readers in that case:
        DirectoryReader reader = new StandardDirectoryReader(directory, readers, null, sis, false, false);
        success = true;
        return reader;
      } finally {
        if (success == false) {
          IOUtils.closeWhileHandlingException(readers);
        }
      }
    }
  }.run(commit);
}
```

有了IndexReader，IndexSearcher对象实例化就手到拈来了，new IndexSearcher(DirectoryReader)就可以得到其实例；如果我们想提高IndexSearcher的执行效率可以new IndexSearcher(DirecotoryReader,ExcuterService)来创建IndexSearcher对象，这样做的好处为对每块segment采用了分工查询，但是要注意IndexSearcher并不维护ExcuterService的生命周期，我们还需要自行调用ExcuterService的close/awaitTermination

# 源码

以下是根据IndexSearcher相关的构建过程及其特性编写的一个搜索的工具类

ps: 因为版本的差异，实现也会有差异。下面的仅供参考，后续会进行统一的优化。

```java
package com.github.houbb.lucene.learn.chap05;

import com.github.houbb.lucene.learn.chap04.IndexUtil;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.MultiReader;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.*;
import org.apache.lucene.search.SortField.Type;
import org.apache.lucene.store.FSDirectory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.concurrent.ExecutorService;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class SearcherUtil {

    public static final Analyzer analyzer = new StandardAnalyzer();
    /**获取IndexSearcher对象（适合单索引目录查询使用）
     * @param indexPath 索引目录
     * @return
     * @throws IOException
     * @throws InterruptedException
     */
    public static IndexSearcher getIndexSearcher(String indexPath, ExecutorService service, boolean realtime) throws IOException, InterruptedException{
        DirectoryReader reader = DirectoryReader.open(IndexUtil.getIndexWriter(indexPath, true), realtime, realtime);
        IndexSearcher searcher = new IndexSearcher(reader,service);
        if(service != null){
            service.shutdown();
        }
        return searcher;
    }

    /**多目录多线程查询
     * @param parentPath 父级索引目录
     * @param service 多线程查询
     * @return
     * @throws IOException
     * @throws InterruptedException
     */
    public static IndexSearcher getMultiSearcher(String parentPath,ExecutorService service,boolean realtime) throws IOException, InterruptedException{
        MultiReader multiReader;
        File file = new File(parentPath);
        File[] files = file.listFiles();
        IndexReader[] readers = new IndexReader[files.length];
        if(!realtime){
            for (int i = 0 ; i < files.length ; i ++) {
                readers[i] = DirectoryReader.open(FSDirectory.open(Paths.get(files[i].getPath(), new String[0])));
            }
        }else{
            for (int i = 0 ; i < files.length ; i ++) {
                readers[i] = DirectoryReader.open(IndexUtil.getIndexWriter(files[i].getPath(), true), true, true);
            }
        }

        multiReader = new MultiReader(readers);
        IndexSearcher searcher = new IndexSearcher(multiReader,service);
        if(service != null){
            service.shutdown();
        }
        return searcher;
    }

    /**从指定配置项中查询
     * @return
     * @param field 字段
     * @param fieldType	字段类型
     * @param queryStr 查询条件
     * @param range 是否区间查询
     * @return
     */
    public static Query getQuery(String field,String fieldType,String queryStr,boolean range){
        Query q = null;
        if(queryStr != null && !"".equals(queryStr)){
            if(range){
                String[] strs = queryStr.split("\\|");
                if("int".equals(fieldType)){
                    int min = new Integer(strs[0]);
                    int max = new Integer(strs[1]);
                    q = IntPoint.newRangeQuery(field, min, max);
                }else if("double".equals(fieldType)){
                    Double min = new Double(strs[0]);
                    Double max = new Double(strs[1]);
                    q = DoublePoint.newRangeQuery(field, min, max);
                }else if("float".equals(fieldType)){
                    Float min = new Float(strs[0]);
                    Float max = new Float(strs[1]);
                    q = FloatPoint.newRangeQuery(field, min, max);
                }else if("long".equals(fieldType)){
                    Long min = new Long(strs[0]);
                    Long max = new Long(strs[1]);
                    q = LongPoint.newRangeQuery(field, min, max);
                }
            }else{
                if("int".equals(fieldType)){
                    q = IntPoint.newRangeQuery(field, new Integer(queryStr), new Integer(queryStr));
                }else if("double".equals(fieldType)){
                    q = DoublePoint.newRangeQuery(field, new Double(queryStr), new Double(queryStr));
                }else if("float".equals(fieldType)){
                    q = FloatPoint.newRangeQuery(field, new Float(queryStr), new Float(queryStr));
                }else{
                    Term term = new Term(field, queryStr);
                    q = new TermQuery(term);
                }
            }
        }else{
            q= new MatchAllDocsQuery();
        }

        System.out.println(q);
        return q;
    }

    /**对多个条件进行排序构建排序条件
     * @param fields
     * @param types
     * @param reverses
     * @return
     */
    public static Sort getSortInfo(String[] fields,Type[] types,boolean[] reverses){
        SortField[] sortFields = null;
        int fieldLength = fields.length;
        int typeLength = types.length;
        int reverLength = reverses.length;
        if(!(fieldLength == typeLength) || !(fieldLength == reverLength)){
            return null;
        }else{
            sortFields = new SortField[fields.length];
            for (int i = 0; i < fields.length; i++) {
                sortFields[i] = new SortField(fields[i], types[i], reverses[i]);
            }
        }
        return new Sort(sortFields);
    }
    /**根据查询器、查询条件、每页数、排序条件进行查询
     * @param query 查询条件
     * @param first 起始值
     * @param max 最大值
     * @param sort 排序条件
     * @return
     */
    public static TopDocs getScoreDocsByPerPageAndSortField(IndexSearcher searcher,Query query, int first,int max, Sort sort){
        try {
            if(query == null){
                System.out.println(" Query is null return null ");
                return null;
            }
            TopFieldCollector collector = null;
            if(sort != null){
                collector = TopFieldCollector.create(sort, first+max, false, false, false);
            }else{
                sort = new Sort(new SortField[]{new SortField("modified", SortField.Type.LONG)});
                collector = TopFieldCollector.create(sort, first+max, false, false, false);
            }
            searcher.search(query, collector);
            return collector.topDocs(first, max);
        } catch (IOException e) {
            // TODO Auto-generated catch block
        }
        return null;
    }

    /**获取上次索引的id,增量更新使用
     * @return
     */
    public static Integer getLastIndexBeanID(IndexReader multiReader){
        Query query = new MatchAllDocsQuery();
        IndexSearcher searcher = null;
        searcher = new IndexSearcher(multiReader);
        SortField sortField = new SortField("id", SortField.Type.INT,true);
        Sort sort = new Sort(new SortField[]{sortField});
        TopDocs docs = getScoreDocsByPerPageAndSortField(searcher,query, 0, 1, sort);
        ScoreDoc[] scoreDocs = docs.scoreDocs;
        int total = scoreDocs.length;
        if(total > 0){
            ScoreDoc scoreDoc = scoreDocs[0];
            Document doc = null;
            try {
                doc = searcher.doc(scoreDoc.doc);
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            return new Integer(doc.get("id"));
        }
        return 0;
    }

}
```

# 参考资料

[一步一步跟我学习lucene（7）---lucene搜索之IndexSearcher构建过程](https://blog.csdn.net/wuyinggui10000/article/details/45698667)

* any list
{:toc}