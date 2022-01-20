---
layout: post
title: Lucene-18-facet lucene搜索之facet查询原理和facet查询实例
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# Facet说明

我们在浏览网站的时候，经常会遇到按某一类条件查询的情况，这种情况尤以电商网站最多，以天猫商城为例，我们选择某一个品牌，系统会将该品牌对应的商品展示出来，效果图如下：

![Facet](https://img-blog.csdn.net/20150525203002878?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd3V5aW5nZ3VpMTAwMDA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

如上图，我们关注的是品牌，选购热点等方面，对于类似的功能我们用lucene的term查询当然可以，但是在数据量特别大的情况下还用普通查询来实现显然会因为FSDirectory.open等耗时的操作造成查询效率的低下，同时普通查询是全部document都扫描一遍，这样显然造成了查询效率低；

**lucene 提供了facet 查询用于对同一类的document进行聚类化，这样在查询的时候先关注某一个方面，这种显然缩小了查询范围，进而提升了查询效率；**

## facet 是什么？

facet,英文翻译为方面。Lucene中的facet查询其实就是对事物的方面查询。

我们以手机举例。一个手机可以有品牌，型号，运营商等多个facet，不同的facet类型可以组合成不同的手机或者手机的集合。如品牌为小米，运营商为移动构成的就是移动发行的所有小米的手机型号（小米1，小米2，小米3）等。而品牌为小米，型号为小米4构成的手机集合就是小米四的所有运营商发行版（小米4移动版，小米4联通版，小米4电信版等）。我们在对一样事物的搜索时也时常使用这种方式，先确定手机品牌，再逐步对型号，运营商等方面进行限制最终得到想要的结果。

下面介绍怎么在Lucene中如何使用facet

## 使用方式

facet 模块提供了多个用于处理facet的统计和值处理的方法；

要实现facet的功能，我们需要了解facetField,FacetField定义了dim和此field对应的path,需要特别注意的是我们在做facetField索引的时候，需要事先调用`FacetsConfig.build(Document);`

FacetField的indexOptions设置为了DOCS_AND_FREQS_AND_POSITIONS的,即既索引又统计出现的频次和出现的位置，这样做主要是为了方便查询和统计；

相应的在存储的时候我们需要利用 FacetsConfig 和 DirectoryTaxonomyWriter；

DirectoryTaxonomyWriter 用来利用 Directory 来存储 Taxono 信息到硬盘；

# DirectoryTaxonomyWriter 源码浅析

DirectoryTaxonomyWriter 的构造器如下:

```java
  public DirectoryTaxonomyWriter(Directory directory, OpenMode openMode,
      TaxonomyWriterCache cache) throws IOException {

    dir = directory;
    IndexWriterConfig config = createIndexWriterConfig(openMode);
    indexWriter = openIndexWriter(dir, config);

    // verify (to some extent) that merge policy in effect would preserve category docids 
    assert !(indexWriter.getConfig().getMergePolicy() instanceof TieredMergePolicy) : 
      "for preserving category docids, merging none-adjacent segments is not allowed";
    
    // after we opened the writer, and the index is locked, it's safe to check
    // the commit data and read the index epoch
    openMode = config.getOpenMode();
    if (!DirectoryReader.indexExists(directory)) {
      indexEpoch = 1;
    } else {
      String epochStr = null;
      Map<String, String> commitData = readCommitData(directory);
      if (commitData != null) {
        epochStr = commitData.get(INDEX_EPOCH);
      }
      // no commit data, or no epoch in it means an old taxonomy, so set its epoch to 1, for lack
      // of a better value.
      indexEpoch = epochStr == null ? 1 : Long.parseLong(epochStr, 16);
    }
    
    if (openMode == OpenMode.CREATE) {
      ++indexEpoch;
    }
    
    FieldType ft = new FieldType(TextField.TYPE_NOT_STORED);
    ft.setOmitNorms(true);
    parentStreamField = new Field(Consts.FIELD_PAYLOADS, parentStream, ft);
    fullPathField = new StringField(Consts.FULL, "", Field.Store.YES);

    nextID = indexWriter.maxDoc();

    if (cache == null) {
      cache = defaultTaxonomyWriterCache();
    }
    this.cache = cache;

    if (nextID == 0) {
      cacheIsComplete = true;
      // Make sure that the taxonomy always contain the root category
      // with category id 0.
      addCategory(new FacetLabel());
    } else {
      // There are some categories on the disk, which we have not yet
      // read into the cache, and therefore the cache is incomplete.
      // We choose not to read all the categories into the cache now,
      // to avoid terrible performance when a taxonomy index is opened
      // to add just a single category. We will do it later, after we
      // notice a few cache misses.
      cacheIsComplete = false;
    }
  }
```

由上述代码可知，DirectoryTaxonomyWriter先打开一个IndexWriter,在确保indexWriter打开和locked的前提下，读取directory对应的segments中需要提交的内容，如果读取到的内容为空，说明是上次的内容，设置indexEpoch为1，接着对cache进行设置；判断directory中是否还包含有document，如果有设置cacheIsComplete为false,反之为true;

# 编程实战

## maven 

引入依赖：

```xml
<!--引入方面查询（facet search）的依赖-->
<!-- https://mvnrepository.com/artifact/org.apache.lucene/lucene-facet -->
<dependency>
  <groupId>org.apache.lucene</groupId>
  <artifactId>lucene-facet</artifactId>
  <version>7.2.1</version>
</dependency>
```

## 创建索引

建立普通索引的同时建立 TaxonomyIndex(分类索引)

```java
public static void buildIndex(String indexDir, String taxoDir) throws Exception{
    Directory directory = FSDirectory.open(Paths.get(indexDir));
    IndexWriter writer = new IndexWriter(directory, new IndexWriterConfig(new WhitespaceAnalyzer()));
    //使用DirectoryTaxonomyWriter写入进行切面查询所需要的Taxonomy索引
    Directory taxioDirectory = FSDirectory.open(Paths.get(taxoDir));
    DirectoryTaxonomyWriter taxoWriter = new DirectoryTaxonomyWriter(taxioDirectory);
    FacetsConfig config = new FacetsConfig();
    Document doc = new Document();
    doc.add(new TextField("device", "手机", Field.Store.YES));
    doc.add(new TextField("name", "米1", Field.Store.YES));
    doc.add(new FacetField("brand", "小米"));
    doc.add(new FacetField("network", "移动4G"));
    //写入索引的同时写入taxo索引
    writer.addDocument(config.build(taxoWriter, doc));
    doc = new Document();
    doc.add(new TextField("device", "手机", Field.Store.YES));
    doc.add(new TextField("name", "米4", Field.Store.YES));
    doc.add(new FacetField("brand", "小米"));
    doc.add(new FacetField("network", "联通4G"));
    writer.addDocument(config.build(taxoWriter, doc));
    doc = new Document();
    doc.add(new TextField("device", "手机", Field.Store.YES));
    doc.add(new TextField("name", "荣耀6", Field.Store.YES));
    doc.add(new FacetField("brand", "华为"));
    doc.add(new FacetField("network", "移动4G"));
    writer.addDocument(config.build(taxoWriter, doc));
    doc = new Document();
    doc.add(new TextField("device", "电视", Field.Store.YES));
    doc.add(new TextField("name", "小米电视2", Field.Store.YES));
    doc.add(new FacetField("brand", "小米"));
    writer.addDocument(config.build(taxoWriter, doc));
    writer.close();
    taxoWriter.close();
}
```

## 索引查询

对facet查询进行测试，实现如下：

```java
public static void testFacetSearch(String indexDir, String taxoDir) throws Exception{
    Directory directory = FSDirectory
            .open(Paths.get(indexDir));
    DirectoryReader indexReader = DirectoryReader.open(directory);
    IndexSearcher searcher = new IndexSearcher(indexReader);
    //同时还需要taxonomy reader
    Directory taxoDirectory = FSDirectory
            .open(Paths.get(taxoDir));
    TaxonomyReader taxoReader = new DirectoryTaxonomyReader(taxoDirectory);
    FacetsConfig config = new FacetsConfig();
    //相应的Collector是必不可少的
    FacetsCollector facetsCollector = new FacetsCollector();
    //按照手机这个维度查询
    System.out.println("---------手机----------");
    TermQuery query = new TermQuery(new Term("device", "手机"));
    TopDocs docs = FacetsCollector.search(searcher, query, 10, facetsCollector);
    printDocs(docs, searcher);
    System.out.println("----------facet-----------");
    Facets facets = new FastTaxonomyFacetCounts(taxoReader, config, facetsCollector);
    List<FacetResult> results = facets.getAllDims(10);
    //打印其他维度信息
    for (FacetResult tmp : results){
        System.out.println(tmp);
    }
    System.out.println("=======================");
    //2.drill down，品牌选小米
    System.out.println("-----小米手机-----");
    DrillDownQuery drillDownQuery = new DrillDownQuery(config, query);
    drillDownQuery.add("brand", "小米");
    //要new新collector，否则会累加
    FacetsCollector fc1 = new FacetsCollector();
    docs = FacetsCollector.search(searcher, drillDownQuery, 10, fc1);
    printDocs(docs, searcher);
    System.out.println("----------facet-----------");
    facets = new FastTaxonomyFacetCounts(taxoReader, config, fc1);
    results = facets.getAllDims(10);
    //获得小米手机的分布，总数2个，网络：移动4G 1个，联通4G 1个
    for (FacetResult tmp : results) {
        System.out.println(tmp);
    }
    System.out.println("=======================");
    //3.drill down，在brand这个facet选择了小米之后继续选择另一个方面network为移动4G
    System.out.println("-----移动4G小米手机-----");
    //可以看到使用的是同一个DrillDownQuery
    drillDownQuery.add("network", "移动4G");
    FacetsCollector fc2 = new FacetsCollector();
    docs = FacetsCollector.search(searcher, drillDownQuery, 10, fc2);
    printDocs(docs, searcher);
    System.out.println("----------facet-----------");
    facets = new FastTaxonomyFacetCounts(taxoReader, config, fc2);
    results = facets.getAllDims(10);
    for (FacetResult tmp : results) {
        System.out.println(tmp);
    }
    System.out.println("=======================");
    //使用sideWay查看其它平行维度的信息
    System.out.println("-----小米手机drill sideways-----");
    DrillSideways ds = new DrillSideways(searcher, config, taxoReader);
    DrillDownQuery drillDownQuery1 = new DrillDownQuery(config, query);
    drillDownQuery1.add("brand", "小米");
    DrillSideways.DrillSidewaysResult result = ds.search(drillDownQuery1, 10);
    docs = result.hits;
    printDocs(docs, searcher);
    System.out.println("----------facet-----------");
    results = result.facets.getAllDims(10);
    for (FacetResult tmp : results) {
        System.out.println(tmp);
    }
    System.out.println("=======================");
    indexReader.close();
    taxoReader.close();
}
```

其中输出方法实现如下：

```java
private static void printDocs(TopDocs topDocs, IndexSearcher searcher) throws IOException {
    ScoreDoc[] docs = topDocs.scoreDocs;
    for (ScoreDoc doc : docs) {
        Document document = searcher.doc(doc.doc);
        System.out.println(document.get("name"));
    }
}
```

## 测试代码

测试代码如下：

```java
final String indexDir = "data/facet/index";
final String taxoDir = "data/facet/taxo";

buildIndex(indexDir, taxoDir);
testFacetSearch(indexDir, taxoDir);
```

输出内容如下：

```
---------手机----------
米1
米4
荣耀6
----------facet-----------
dim=brand path=[] value=3 childCount=2
  小米 (2)
  华为 (1)

dim=network path=[] value=3 childCount=2
  移动4G (2)
  联通4G (1)

=======================
-----小米手机-----
米1
米4
----------facet-----------
dim=brand path=[] value=2 childCount=1
  小米 (2)

dim=network path=[] value=2 childCount=2
  移动4G (1)
  联通4G (1)

=======================
-----移动4G小米手机-----
米1
----------facet-----------
dim=brand path=[] value=1 childCount=1
  小米 (1)

dim=network path=[] value=1 childCount=1
  移动4G (1)

=======================
-----小米手机drill sideways-----
米1
米4
----------facet-----------
dim=brand path=[] value=3 childCount=2
  小米 (2)
  华为 (1)

dim=network path=[] value=2 childCount=2
  移动4G (1)
  联通4G (1)

=======================
```

# 参考资料

[一步一步跟我学习lucene（14）---lucene搜索之facet查询原理和facet查询实例](https://blog.csdn.net/wuyinggui10000/article/details/45973769)

[lucene使用facet搜索](https://blog.csdn.net/m0_37556444/article/details/82749114)

* any list
{:toc}