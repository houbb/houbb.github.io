---
layout: post
title: Lucene-16-grouping 分组
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# grouping介绍

我们在做lucene搜索的时候，可能会用到对某个条件的数据进行统计，比如统计有多少个省份，在sql查询中我们可以用distinct来完成类似的功能，也可以用group by来对查询的列进行分组查询。

在lucene中我们实现类似的功能怎么做呢？

比较费时的做法时我们查询出所有的结果，然后对结果里边的省份对应的field查询出来，往set里边放，显然这种做法效率低，不可取；

lucene为了解决上述问题，提供了用于分组操作的模块group，group主要用户处理不同lucene中含有某个相同field值的不同document的分组统计。

## Grouping

Grouping 可以接收如下参数：

groupField：要分组的字段；比如我们对省份（province）进行分组，要传入对应的值为province，要注意的是如果groupField在document中不存在，会返回一null的
分组；

groupSort：分组是怎么排序的，排序字段决定了分组内容展示的先后顺序；

topNGroups：分组展示的数量，只计算0到topNGroup条记录；

groupOffset：从第几个TopGroup开始算起，举例来说groupOffset为3的话，会展示从3到topNGroup对应的记录，此数值我们可以用于分页查询；

withinGroupSort：每组内怎么排序；

maxDocsPerGroup：每组处理多少个document；

withinGroupOffset：每组显示的document初始位置；

### 实现方式

group 的实现需要两步：

第一步：利用TermFirstPassGroupingCollector来收集top groups；

第二步：用TermSecondPassGroupingCollector处理每个group对应的documents

group模块定义了group和group的采集方式；所有的grouping colletor,所有的grouping collector都是抽象类并且提供了基于term的实现；

### 实现 group 的前提

- 要group的field必须是必须是SortedDocValuesField类型的；

- solr尽管也提供了grouping by的相关方法实现，但是对group的抽象实现还是由该模块实现；

- 暂不支持sharding,我们需要自己提供groups和每个group的documents的合并


# 测试代码

## maven 引入

```xml
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-grouping</artifactId>
    <version>7.2.1</version>
</dependency>
```

## 代码

```java
import com.github.houbb.lucene.learn.chap05.SearcherPageUtil;
import com.github.houbb.lucene.learn.chap05.SearcherUtil;
import org.apache.lucene.search.*;
import org.apache.lucene.search.grouping.GroupDocs;
import org.apache.lucene.search.grouping.GroupingSearch;
import org.apache.lucene.search.grouping.TopGroups;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;
import java.util.Arrays;

public class GroupingDemo {

    public static void main(String[] args) {
        GroupingSearch groupingSearch = new GroupingSearch("province");
        SortField sortField = new SortField("city", SortField.Type.STRING_VAL);
        Sort sort = new Sort(sortField);
        groupingSearch.setGroupSort(sort);
        groupingSearch.setFillSortFields(true);
        groupingSearch.setCachingInMB(4.0, true);
        groupingSearch.setAllGroups(true);
        IndexSearcher searcher;
        try {
            searcher = SearcherPageUtil.getIndexSearcherByIndexPath("data/grouping", null);
            Query query = new MatchAllDocsQuery();
            TopGroups<BytesRef> result = groupingSearch.search(searcher,query, 0, searcher.getIndexReader().maxDoc());
            // Render groupsResult...
            GroupDocs<BytesRef>[] docs = result.groups;
            for (GroupDocs<BytesRef> groupDocs : docs) {
                BytesRef bytesRef = groupDocs.groupValue;
                if(bytesRef != null) {
                    System.out.println(Arrays.toString(bytesRef.bytes));
                }
            }
            int totalGroupCount = result.totalGroupCount;
            System.out.println(totalGroupCount);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

# 利用 BlockGroupingCollector

我们有时候想要在索引的时候就将group字段存入以方便search，我们可以在确保docs被索引的前提下，先查询出来每个要group的term对应的documents,然后在最后的document插入一个标记分组的field,我们可以如此做：

```java
/**
  * 带group的索引创建
  * @param writer
  * @param docs
  * @throws IOException 
  */
 public void indexDocsWithGroup(IndexWriter writer,String groupFieldName,String groupFieldValue,List<Document> docs) throws IOException{
   Field groupEndField = new Field(groupFieldName, groupFieldValue, Field.Store.NO, Field.Index.NOT_ANALYZED);
   docs.get(docs.size()-1).add(groupEndField);
   writer.updateDocuments(new Term(groupFieldName, groupFieldValue),docs);
   writer.commit();
   writer.close();
 }
```

在分组查询的时候，我们可以

```java
/**group查询，适用于对group字段已经进行分段索引的情况
  * @param searcher
  * @param groupEndQuery
  * @param query
  * @param sort
  * @param withinGroupSort
  * @param groupOffset
  * @param topNGroups
  * @param needsScores
  * @param docOffset
  * @param docsPerGroup
  * @param fillFields
  * @return
  * @throws IOException
  */
 public static TopGroups<BytesRef> getTopGroupsByGroupTerm(IndexSearcher searcher,Query groupEndQuery,Query query,Sort sort,Sort withinGroupSort,int groupOffset,int topNGroups,boolean needsScores,int docOffset,int docsPerGroup,boolean fillFields) throws IOException{
  @SuppressWarnings("deprecation")
  Filter groupEndDocs = new CachingWrapperFilter(new QueryWrapperFilter(groupEndQuery));
  BlockGroupingCollector c = new BlockGroupingCollector(sort, groupOffset+topNGroups, needsScores, groupEndDocs);
  searcher.search(query, c);
  @SuppressWarnings("unchecked")
  TopGroups<BytesRef> groupsResult = (TopGroups<BytesRef>) c.getTopGroups(withinGroupSort, groupOffset, docOffset, docOffset+docsPerGroup, fillFields);
  return groupsResult;
 }
```

我们也可以直接进行group的查询，此为通用的实现

```java
/**
 * @param searcher
 * @param query
 * @param groupFieldName
 * @param sort
 * @param maxCacheRAMMB
 * @param page
 * @param perPage
 * @return
 * @throws IOException
 */
public static TopGroups<BytesRef> getTopGroups(IndexSearcher searcher,Query query,String groupFieldName,Sort sort,doublemaxCacheRAMMB,int page,int perPage) throws IOException{
	GroupingSearch groupingSearch = new GroupingSearch(groupFieldName);
	groupingSearch.setGroupSort(sort);
	groupingSearch.setFillSortFields(true);
	groupingSearch.setCachingInMB(maxCacheRAMMB, true);
	groupingSearch.setAllGroups(true);
	TopGroups<BytesRef> result = groupingSearch.search(searcher,query, (page-1)*perPage, page*perPage);
	return result;
}
```

## 分页工具类

```java
/**
 * 通用的进行group查询
 * @param searcher
 * @param query
 * @param groupFieldName
 * @param sort
 * @param maxCacheRAMMB
 * @param page
 * @param perPage
 * @return
 * @throws IOException
 */
public static TopGroups<BytesRef> getTopGroups(IndexSearcher searcher, Query query, String groupFieldName, Sort sort, doublemaxCacheRAMMB, int page, int perPage) throws IOException {
    GroupingSearch groupingSearch = new GroupingSearch(groupFieldName);
    groupingSearch.setGroupSort(sort);
    groupingSearch.setFillSortFields(true);
    groupingSearch.setCachingInMB(maxCacheRAMMB, true);
    groupingSearch.setAllGroups(true);
    TopGroups<BytesRef> result = groupingSearch.search(searcher,query, (page-1)*perPage, page*perPage);
    return result;
}
```

# 抛出问题

在 RDBMS 中，我们可以使用 GROUP BY 来对检索的数据进行分组，同样地，想要在 Lucene 中实现分组要如何做呢？首先思考如下几个问题

- Lucene 是如何实现分组的？

- 用来分组的字段（域）或者说 Field 如何添加？

- 组的大小如何设置？

- 组内大小如何设置？

- 如何实现组的分页？

- 如果结果集超过了组内大小，可以通过分页解决，那么如果结果集超过了组大小的上限，如何解决？

- 如何实现单类别分组，即类似SQL中的 GROUP BY A

- 如何实现多类别分组，即类似SQL中的 GROUP BY A, B

## 从 SQL 的 GROUP BY 说起

如果分组后面只有一个字段，如 GROUP BY A 意思是将所有具有相同A字段值的记录放到一个分组里。

那么如果是GROUP BY A, B呢？

其意思是将所有具有相同A字段值和B字段值的记录放到一个分组里，在这里A和B之间是逻辑与的关系。

通常的，如果在SQL中，我们仅用 GROUP BY 语句而不加 WHERE 条件的话，那么相当于在全部数据中进行分组，对应于 Lucene 中相当于使用 GROUP 加 new MatchAllDocsQuery() 的功能。

而如果在SQL中，我们不仅用 GROUP BY 还有 WHERE 条件语句，那么相当于在满足 WHERE 条件的记录中进行分组，这种 WHERE 条件在 Lucene 中可以通过构造各种不同的 Query 进行过滤，然后在符合条件的结果中分组。

## Lucene 分组

有关Lucene分组问题，需要有一系列输入参数，[官方Doc](https://lucene.apache.org/core/7_1_0/grouping/index.html)在此，核心点如下

- groupField：用来分组的域，在 Lucene 中，这个域只能设置一个，不像 SQL 中可以根据多个列分组。没有该域的文档将被分到一个单独的组里面

- groupSort：组间排序方式，用来指定如何对不同的分组进行排序，而不是组内的文档排序，默认值是Sort.RELEVANCE

- topNGroups：保留多少组，例如10只取前十个分组

- groupOffset：指定组偏移量，比如当topNGroups的值是10的时候，groupOffset为3，则意思是返回7个分组，跳过前面3个，在分页时候很有用

- withinGroupSort：组内排序方式，默认值是Sort.RELEVANCE，注意和groupSort的区别，不要求和groupSort使用一样的排序方式

- maxDocsPerGroup：表示一个组内最多保留多少个文档

- withinGroupOffset：每组显示的文档的偏移量

分组通常有两个阶段，第一阶段用FirstPassGroupingCollector收集不同的分组，第二阶段用SecondPassGroupingCollector收集这些分组内的文档，如果分组很耗时，建议用CachingCollector类，可以缓存 hits 并在第二阶段快速返回。这种方式让你相当于只运行了一次 query，但是付出的代价是用 RAM 持有所有的 hits。返回的结果集是TopGroups的实例。

Groups是由GroupSelector（抽象类）的实现来定义的，目前支持两种实现方式

- TermGroupSelector 基于 SortedDocValues 域进行分组

- ValueSourceGroupSelector 基于 ValueSource 值进行分组

通常不建议直接使用 FirstPassGroupingCollector 和 SecondPassGroupingCollector 来进行分组操作，因为Lucene提供了一个非常简便的封装类 GroupingSearch，目前分组操作还不支持 Sharding。

网上有许多讲解 Lucene 分组的文章，但是讲的都非常浅显，一般都是取 Top N 个分组，这个 N 是一个确定的值，试问如果我要对全部的结果集进行分组统计，而分组数量超过 Top N 的话，那么这种方式统计的结果显然是不准确的，因为它并没有统计全部的数据。还有的是直接把 maxDoc() 函数的值作为 groupLimit 的值，然后对某个分组内的全部文档进行迭代，无法实现组内分页的问题。

所以本文就针对这个问题，不仅解决了组内分页的问题，还解决了组间分页的问题，可以迭代完全的结果集。

另外一个需要注意的问题就是 maxDoc() 可能返回的是 Integer 型的上限，而将其直接作为 groupLimit 传入的话，是会报错的，错误如下

组内大小和组间大小如果设置为Integer.MAX_VALUE报

```
Exception in thread “main” java.lang.NegativeArraySizeException
```

组内大小和组间大小如果设置为Integer.MAX_VALUE-1报

```
Exception in thread “main” java.lang.IllegalArgumentException: maxSize must be <= 2147483630; got: 2147483646
```

## 代码实现

- IndexHelper.java

index 工具类。

```java
import org.apache.lucene.analysis.core.WhitespaceAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class IndexHelper {

    private Document document;
    private Directory directory;
    private IndexWriter indexWriter;
    public Directory getDirectory() {
        directory = (directory == null) ? new RAMDirectory() : directory;
        return directory;
    }
    private IndexWriterConfig getConfig() {
        return new IndexWriterConfig(new WhitespaceAnalyzer());
    }
    private IndexWriter getIndexWriter() {
        try {
            return new IndexWriter(getDirectory(), getConfig());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
    public IndexSearcher getIndexSearcher() throws IOException {
        return new IndexSearcher(DirectoryReader.open(getDirectory()));
    }
    public void createIndexForGroup(int ID, String author, String content) {
        indexWriter = getIndexWriter();
        document = new Document();
        //IntPoint默认是不存储的
        document.add(new IntPoint("ID", ID));
        //如果想要在搜索结果中获取ID的值，需要加上下面语句
        document.add(new StoredField("ID", ID));
        document.add(new StringField("author", author, Field.Store.YES));
        //需要使用特定的field存储分组，需要排序及分组的话，要加上下面语句，注意默认SortedDocValuesField也是不存储的
        document.add(new SortedDocValuesField("author", new BytesRef(author)));
        document.add(new StringField("content", content, Field.Store.YES));
        try {
            indexWriter.addDocument(document);
            indexWriter.commit();
            indexWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

- 测试代码

```java
import com.github.houbb.lucene.learn.utils.IndexHelper;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.*;
import org.apache.lucene.search.grouping.GroupDocs;
import org.apache.lucene.search.grouping.GroupingSearch;
import org.apache.lucene.search.grouping.TopGroups;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class GroupingDemo2 {

    public static void main(String[] args) throws Exception {
        IndexHelper indexHelper = new IndexHelper();
        indexHelper.createIndexForGroup(1, "Java", "一周精通Java");
        indexHelper.createIndexForGroup(2, "Java", "一周精通MyBatis");
        indexHelper.createIndexForGroup(3, "Java", "一周精通Struts");
        indexHelper.createIndexForGroup(4, "Java", "一周精通Spring");
        indexHelper.createIndexForGroup(5, "Java", "一周精通Spring Cloud");
        indexHelper.createIndexForGroup(6, "Java", "一周精通Hibernate");
        indexHelper.createIndexForGroup(7, "Java", "一周精通JVM");
        indexHelper.createIndexForGroup(8, "C", "一周精通C");
        indexHelper.createIndexForGroup(9, "C", "C语言详解");
        indexHelper.createIndexForGroup(10, "C", "C语言调优");
        indexHelper.createIndexForGroup(11, "C++", "一周精通C++");
        indexHelper.createIndexForGroup(12, "C++", "C++语言详解");
        indexHelper.createIndexForGroup(13, "C++", "C++语言调优");

        IndexSearcher indexSearcher = indexHelper.getIndexSearcher();
        GroupingDemo2 groupingDemo = new GroupingDemo2();
        //把所有的文档都查出来，由添加的数据可以知道，一共有三组，Java组有7个文档，C和C++组分别都有3个文档
        //当然了如果做全匹配的话，还可以用new MatchAllDocsQuery()
        BooleanQuery query = new BooleanQuery.Builder()
                .add(new TermQuery(new Term("author", "Java")), BooleanClause.Occur.SHOULD)
                .add(new TermQuery(new Term
                                ("author", "C")),
                        BooleanClause.Occur.SHOULD)
                .add(new TermQuery(new Term("author", "C++")), BooleanClause.Occur.SHOULD).build();
        //控制每次返回几组
        int groupLimit = 2;
        //控制每一页的组内文档数
        int groupDocsLimit = 2;
        //控制组的偏移
        int groupOffset = 0;
        //为了排除干扰因素，全部使用默认的排序方式，当然你还可以使用自己喜欢的排序方式
        //初始值为命中的所有文档数，即最坏情况下，一个文档分成一组，那么文档数就是分组的总数
        int totalGroupCount = indexSearcher.count(query);
        TopGroups<BytesRef> topGroups;
        System.out.println("#### 组的分页大小为：" + groupLimit);
        System.out.println("#### 组内分页大小为：" + groupDocsLimit);
        while (groupOffset < totalGroupCount) {//说明还有不同的分组
            //控制组内偏移，每次开始遍历一个新的分组时候，需要将其归零
            int groupDocsOffset = 0;
            System.out.println("#### 开始组的分页");
            topGroups = groupingDemo.group(indexSearcher, query, "author", groupDocsOffset, groupDocsLimit, groupOffset, groupLimit);
            //具体搜了一次之后，就知道到底有多少组了，更新totalGroupCount为正确的值
            totalGroupCount = topGroups.totalGroupCount;
            GroupDocs<BytesRef>[] groups = topGroups.groups;
            //开始对组进行遍历
            for (int i = 0; i < groups.length; i++) {
                long totalHits = iterGroupDocs(indexSearcher, groups[i]);//获得这个组内一共多少doc
                //处理完一次分页，groupDocsOffset要更新
                groupDocsOffset += groupDocsLimit;
                //如果组内还有数据，即模拟组内分页的情况，那么应该继续遍历组内剩下的doc
                while (groupDocsOffset < totalHits) {
                    topGroups = groupingDemo.group(indexSearcher, query, "author", groupDocsOffset, groupDocsLimit, groupOffset, groupLimit);
                    //这里面的组一定要和外层for循环正在处理的组保持一致，其实这里面浪费了搜索数据，为什么？
                    //因为Lucene是对多个组同时进行组内向后翻页，而我只是一个组一个组的处理，其它不处理的组相当于是浪费的
                    //所以从这种角度来说，设置groupLimit为1比较合理，即每次处理一个组，而每次只将一个组的组内文档向后翻页
                    GroupDocs<BytesRef> group = topGroups.groups[i];
                    totalHits = iterGroupDocs(indexSearcher, group);
                    //此时需要更新组内偏移量
                    groupDocsOffset += groupDocsLimit;
                }
                //至此，一个组内的doc全部遍历完毕，开始下一组
                groupDocsOffset = 0;
            }
            groupOffset += groupLimit;
            System.out.println("#### 结束组的分页");
        }
    }

    private static long iterGroupDocs(IndexSearcher indexSearcher, GroupDocs<BytesRef> groupDocs) throws IOException {
        long totalHits = groupDocs.totalHits;
        System.out.println("\t#### 开始组内分页");
        System.out.println("\t分组名称：" + groupDocs.groupValue.utf8ToString());
        ScoreDoc[] scoreDocs = groupDocs.scoreDocs;
        for (ScoreDoc scoreDoc : scoreDocs) {
            System.out.println("\t\t组内记录：" + indexSearcher.doc(scoreDoc.doc));
        }
        System.out.println("\t#### 结束组内分页");
        return totalHits;
    }

    public TopGroups<BytesRef> group(IndexSearcher indexSearcher, Query query, String groupField,
                                     int groupDocsOffset, int groupDocsLimit, int groupOffset, int groupLimit) throws Exception {
        return group(indexSearcher, query, Sort.RELEVANCE, Sort.RELEVANCE, groupField, groupDocsOffset, groupDocsLimit, groupOffset, groupLimit);
    }
    public TopGroups<BytesRef> group(IndexSearcher indexSearcher, Query query, Sort groupSort, Sort withinGroupSort, String groupField,
                                     int groupDocsOffset, int groupDocsLimit, int groupOffset, int groupLimit) throws Exception {
        //实例化GroupingSearch实例，传入分组域
        GroupingSearch groupingSearch = new GroupingSearch(groupField);
        //设置组间排序方式
        groupingSearch.setGroupSort(groupSort);
        //设置组内排序方式
        groupingSearch.setSortWithinGroup(withinGroupSort);
        //是否要填充每个返回的group和groups docs的排序field
        groupingSearch.setFillSortFields(true);
        //设置用来缓存第二阶段搜索的最大内存，单位MB，第二个参数表示是否缓存评分
        groupingSearch.setCachingInMB(64.0, true);
        //是否计算符合查询条件的所有组
        groupingSearch.setAllGroups(true);
        groupingSearch.setAllGroupHeads(true);
        //设置一个分组内的上限
        groupingSearch.setGroupDocsLimit(groupDocsLimit);
        //设置一个分组内的偏移
        groupingSearch.setGroupDocsOffset(groupDocsOffset);
        TopGroups<BytesRef> result = groupingSearch.search(indexSearcher, query, groupOffset, groupLimit);
        return result;
    }

}
```

对应的日志如下：

```
#### 组的分页大小为：2
#### 组内分页大小为：2
#### 开始组的分页
	#### 开始组内分页
	分组名称：C
		组内记录：Document<stored<ID:8> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通C>>
		组内记录：Document<stored<ID:9> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:C语言详解>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：C
		组内记录：Document<stored<ID:10> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:C语言调优>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：C++
		组内记录：Document<stored<ID:11> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C++> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通C++>>
		组内记录：Document<stored<ID:12> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C++> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:C++语言详解>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：C++
		组内记录：Document<stored<ID:13> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:C++> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:C++语言调优>>
	#### 结束组内分页
#### 结束组的分页
#### 开始组的分页
	#### 开始组内分页
	分组名称：Java
		组内记录：Document<stored<ID:5> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通Spring Cloud>>
		组内记录：Document<stored<ID:6> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通Hibernate>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：Java
		组内记录：Document<stored<ID:2> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通MyBatis>>
		组内记录：Document<stored<ID:3> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通Struts>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：Java
		组内记录：Document<stored<ID:4> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通Spring>>
		组内记录：Document<stored<ID:1> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通Java>>
	#### 结束组内分页
	#### 开始组内分页
	分组名称：Java
		组内记录：Document<stored<ID:7> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<author:Java> stored,indexed,tokenized,omitNorms,indexOptions=DOCS<content:一周精通JVM>>
	#### 结束组内分页
#### 结束组的分页
```

# 参考资料

[一步一步跟我学习lucene（12）---lucene搜索之分组处理group查询](https://blog.csdn.net/wuyinggui10000/article/details/45922825)

[lucene的分组（group by） ](https://www.iteye.com/blog/xtuhcy-1143440)

[Lucene聚类分组统计功能（grouping）](https://www.cnblogs.com/lexus/archive/2011/12/18/2291860.html)

[Lucene 分组统计详解](http://codepub.cn/2017/11/15/lucene-group-statistics-detailed/)

* any list
{:toc}