---
layout: post
title: Lucene code-02-Lucene 的索引文件格式具体正向内容
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, code, source-code, sh]
published: true
---

# 具体格式

上面曾经交代过，Lucene 保存了从 Index 到 Segment 到 Document 到 Field 一直到 Term 的正向信息，也包括了从 Term 到 Document 映射的反向信息，还有其他一些 Lucene 特有的信息。

下面对这三种信息一一介绍。

# 4.1. 正向信息

Index –> Segments (segments.gen, segments_N) –> Field(fnm, fdx, fdt) –> Term (tvx, tvd, tvf) 上面的层次结构不是十分的准确，因为 segments.gen 和 segments_N 保存的是段(segment)的元数据信息(metadata)，其实是每个 Index 一个的，而段的真正的数据信息，是保存在域(Field)和词(Term)中的。

## 4.1.1. 段的元数据信息(segments_N) 

一个索引(Index)可以同时存在多个 segments_N(至于如何存在多个 segments_N，在描述完详细信息之后会举例说明)，然而当我们要打开一个索引的时候，我们必须要选择一个来打开，那如何选择哪个 segments_N 呢？ 

Lucene 采取以下过程：

1）其 一 ， 在 所 有 的 segments_N 中 选 择 N 最 大 的 一 个 。 

基 本 逻 辑 参 照SegmentInfos.getCurrentSegmentGeneration(File[] files) ， 其 基 本 思 路 就 是 在 所 有 以segments 开头，并且不是 segments.gen 的文件中，选择 N 最大的一个作为 genA。 

2）其二，打开 segments.gen，其中保存了当前的 N 值。

其格式如下，读出版本号(Version)，然后再读出两个 N，如果两者相等，则作为 genB。

```
Version | gen0 | gen1
```

```java
IndexInput genInput = directory.openInput(IndexFileNames.SEGMENTS_GEN);//"segments.gen" 
int version = genInput.readInt();//读出版本号 
if (version == FORMAT_LOCKLESS) {//如果版本号正确 
long gen0 = genInput.readLong();//读出第一个 N 
 long gen1 = genInput.readLong();//读出第二个 N 
 if (gen0 == gen1) {//如果两者相等则为 genB 
 genB = gen0; 
 } 
}
```

其三，在上述得到的genA和genB中选择最大的那个作为当前的N，方才打开segments_N文件。

其基本逻辑如下：

```java
if (genA > genB) 
 gen = genA; 
else 
 gen = genB; 
```

### Format： 

- 索引文件格式的版本号。 

-  由于 Lucene 是在不断开发过程中的，因而不同版本的 Lucene，其索引文件格式也不尽相同，于是规定一个版本号。 

- Lucene 2.1 此值-3，Lucene 2.9 时，此值为-9。 

- 当用某个版本号的 IndexReader 读取另一个版本号生成的索引的时候，会因为此值不同而报错。

### Version： 

- 索引的版本号，记录了 IndexWriter 将修改提交到索引文件中的次数。 

- 其初始值大多数情况下从索引文件里面读出，仅仅在索引开始创建的时候，被赋予当前的时间，已取得一个唯一值。 

- 其值改变在

```
IndexWriter.commit->IndexWriter.startCommit->SegmentInfos.prepareCommit->SegmentInfos.wr
ite->writeLong(++version)
```

- 其初始值之所最初取一个时间，是因为我们并不关心 IndexWriter 将修改提交到索引的具体次数，而更关心到底哪个是最新的。

IndexReader 中常比较自己的 version和索引文件中的 version 是否相同来判断此 IndexReader 被打开后，还有没有被IndexWriter 更新。 

```java
//在 DirectoryReader 中有一下函数。
public boolean isCurrent() throws CorruptIndexException, IOException { 
 return SegmentInfos.readCurrentVersion(directory) == segmentInfos.getVersion(); 
}
```

### NameCount 

- 是下一个新段(Segment)的段名。 

- 所有属于同一个段的索引文件都以段名作为文件名，一般为_0.xxx, _0.yyy, _1.xxx, _1.yyy …… 

- 新生成的段的段名一般为原有最大段名加一。 

- 如同的索引，NameCount 读出来是 2，说明新的段为_2.xxx, _2yyy

### SegCount 

- 段(Segment)的个数。 

- 如上图，此值为 2。 

SegCount 个段的元数据信息： 

- SegName 

段名，所有属于同一个段的文件都有以段名作为文件名。 

如上图，第一个段的段名为"_0"，第二个段的段名为"_1" 

- SegSize 

此段中包含的文档数 

然而此文档数是包括已经删除，又没有 optimize 的文档的，因为在 optimize 之前，Lucene的段中包含了所有被索引过的文档，而被删除的文档是保存在.del
文件中的，在搜索的过程中，是先从段中读到了被删除的文档，然后再用 .del 中的标志，将这篇文章过滤掉。

如下的代码形成了上图的索引，可以看出索引了两篇文档形成了_0 段，然后又删除了其中一篇，形成了_0_1.del，又索引了两篇文档形成_1 段，然后又删除了其中一篇，形成_1_1.del。

因而在两个段中，此值都是 2。 

```java
IndexWriter writer = new IndexWriter(FSDirectory.open(INDEX_DIR), new 
StandardAnalyzer(Version.LUCENE_CURRENT), true, IndexWriter.MaxFieldLength.LIMITED); 
writer.setUseCompoundFile(false); 
indexDocs(writer, docDir);//docDir 中只有两篇文档
//文档一为：Students should be allowed to go out with their friends, but not allowed to drink beer.
//文档二为：My friend Jerry went to school to see his students but found them drunk which is not 
allowed. 
writer.commit();//提交两篇文档，形成_0 段。
writer.deleteDocuments(new Term("contents", "school"));//删除文档二 
writer.commit();//提交删除，形成_0_1.del 
indexDocs(writer, docDir);//再次索引两篇文档，Lucene 不能判别文档与文档的不同，因而算两篇新的文档。 
writer.commit();//提交两篇文档，形成_1 段 
writer.deleteDocuments(new Term("contents", "school"));//删除第二次添加的文档二 
writer.close();//提交删除，形成_1_1.del 
```

### DelGen 

- .del 文件的版本号 

- Lucene 中，在 optimize 之前，删除的文档是保存在.del 文件中的。 

- 在 Lucene 2.9 中，文档删除有以下几种方式： 

1) IndexReader.deleteDocument(int docID)是用 IndexReader 按文档号删除。 

2) IndexReader.deleteDocuments(Term term)是用 IndexReader 删除包含此词(Term)的文档。 

3) IndexWriter.deleteDocuments(Term term)是用 IndexWriter 删除包含此词(Term)的文档。 

4) IndexWriter.deleteDocuments(Term[] terms)是用 IndexWriter 删除包含这些
词(Term)的文档。 

5) IndexWriter.deleteDocuments(Query query)是用 IndexWriter 删除能满足此查询(Query)的文档。 

6) IndexWriter.deleteDocuments(Query[] queries)是用 IndexWriter 删除能满足这些查询(Query)的文档。 

7) 原来的版本中Lucene的删除一直是由IndexReader来完成的，在Lucene 2.9中虽可以用 IndexWriter 来删除，但是其实真正的实现是在 IndexWriter 中，
保存了 readerpool，当 IndexWriter 向索引文件提交删除的时候，仍然是从readerpool 中得到相应的 IndexReader，并用 IndexReader 来进行删除的。

下面的代码可以说明：

```java
IndexWriter.applyDeletes() 
-> DocumentsWriter.applyDeletes(SegmentInfos) 
 -> reader.deleteDocument(doc);
```

DelGen 是每当 IndexWriter 向索引文件中提交删除操作的时候，加 1，并生成新的.del 文件。

```java
IndexWriter.commit() 
-> IndexWriter.applyDeletes() 
 -> IndexWriter$ReaderPool.release(SegmentReader) 
 -> SegmentReader(IndexReader).commit() 
 -> SegmentReader.doCommit(Map) 
 -> SegmentInfo.advanceDelGen() 
 -> if (delGen == NO) { 
 delGen = YES; 
 } else { 
 delGen++; 
 }
 IndexWriter writer = new IndexWriter(FSDirectory.open(INDEX_DIR), new 
StandardAnalyzer(Version.LUCENE_CURRENT), true, IndexWriter.MaxFieldLength.LIMITED); 
writer.setUseCompoundFile(false); 
indexDocs(writer, docDir);//索引两篇文档，一篇包含"school"，另一篇包含"beer" 
writer.commit();//提交两篇文档到索引文件，形成段(Segment) "_0" 
writer.deleteDocuments(new Term("contents", "school"));//删除包含"school"的文档，其实是删除了两篇文档中的一篇。 
writer.commit();//提交删除到索引文件，形成"_0_1.del" 
writer.deleteDocuments(new Term("contents", "beer"));//删除包含"beer"的文档，其实是删除了两篇文档中的另一篇。 
writer.commit();//提交删除到索引文件，形成"_0_2.del" 
indexDocs(writer, docDir);//索引两篇文档，和上次的文档相同，但是 Lucene 无法区分，认为是另外两篇文档。
writer.commit();//提交两篇文档到索引文件，形成段"_1" 
writer.deleteDocuments(new Term("contents", "beer"));//删除包含"beer"的文档，其中段"_0"已经无可删除，段"_1"被删除一篇。 
writer.close();//提交删除到索引文件，形成"_1_1.del" 
```

DocStoreOffset 

DocStoreSegment 

DocStoreIsCompoundFile 

对于域(Stored Field)和词向量(Term Vector)的存储可以有不同的方式，即可以每个段(Segment)单独存储自己的域和词向量信息，也可以多个段共享域和词向量，把它们存储到一个段中去。 

如果 DocStoreOffset 为-1，则此段单独存储自己的域和词向量，从存储文件上来看，如果此段段名为 XXX，则此段有自己的 XXX.fdt，XXX.fdx，XXX.tvf，XXX.tvd，XXX.tvx 文件。DocStoreSegment 和 DocStoreIsCompoundFile 在此处不被保存。 

如果 DocStoreOffset 不为-1，则 DocStoreSegment 保存了共享的段的名字，比如为 YYY，DocStoreOffset 则为此段的域及词向量信息在共享段中的偏移量。

则此段没有自己的 XXX.fdt，XXX.fdx，XXX.tvf，XXX.tvd，XXX.tvx 文件，而是将信息存放在共享段的 YYY.fdt，YYY.fdx，YYY.tvf，YYY.tvd，YYY.tvx 文件中。

DocumentsWriter 中有两个成员变量：String segment 是当前索引信息存放的段，String docStoreSegment 是域和词向量信息存储的段。两者可以相同也可以不同，决定了域和词向量信息是存储在本段中，还是和其他的段共享。 

IndexWriter.flush(boolean triggerMerge, boolean flushDocStores, boolean flushDeletes)中第二个参数 flushDocStores 会影响到是否单独或是共享存储。其实最终影响的是 DocumentsWriter.closeDocStore()。每当 flushDocStores 为 false时，closeDocStore 不被调用，说明下次添加到索引文件中的域和词向量信息是同此次共享一个段的。直到 flushDocStores 为 true 的时候，closeDocStore 被调用，从而下次添加到索引文件中的域和词向量信息将被保存在一个新的段中，不同此次共享一个段(在这里需要指出的是 Lucene 的一个很奇怪的实现，虽然下次域和词向量信息是被保存到新的段中，然而段名却是这次被确定了的，在
initSegmentName 中当 docStoreSegment == null 时，被置为当前的 segment，而非下一个新的 segment，docStoreSegment = segment，于是会出现如下面的例
子的现象)。 

好在共享域和词向量存储并不是经常被使用到，实现也或有缺陷，暂且解释到此。

```java
IndexWriter writer = new IndexWriter(FSDirectory.open(INDEX_DIR), new 
StandardAnalyzer(Version.LUCENE_CURRENT), true, IndexWriter.MaxFieldLength.LIMITED); 
writer.setUseCompoundFile(false); 
indexDocs(writer, docDir); 
writer.flush(); 
//flush 生成 segment "_0"，并且 flush 函数中，flushDocStores 设为 false，也即下个段将同本段共享域和词向量信息，这时 DocumentsWriter 中的 docStoreSegment= "_0"。
indexDocs(writer, docDir); 
writer.commit(); 
//commit 生成 segment "_1"，由于上次 flushDocStores 设为 false，于是段"_1"的域以及词向量信息是保存在"_0"中的，在这个时刻，段"_1"并不生成自己的"_1.fdx"和"_1.fdt"。然而在 commit函数中，flushDocStores 设为 true，也即下个段将单独使用新的段来存储域和词向量信息。然而这时，DocumentsWriter 中的 docStoreSegment= "_1"，也即当段"_2"存储其域和词向量信息的时候，是存在"_1.fdx"和"_1.fdt"中的，而段"_1"的域和词向量信息却是存在"_0.fdt"和"_0.fdx"中的，这一点非常令人困惑。 如图 writer.commit 的时候，_1.fdt 和_1.fdx 并没有形成。
indexDocs(writer, docDir); 
writer.flush(); 
//段"_2"形成，由于上次 flushDocStores 设为 true，其域和词向量信息是新创建一个段保存的，却是保存在_1.fdt 和_1.fdx 中的，这时候才产生了此二文件

indexDocs(writer, docDir); 
writer.flush(); 
//段"_3"形成，由于上次 flushDocStores 设为 false，其域和词向量信息是共享一个段保存的，也是是保存在_1.fdt 和_1.fdx 中的

indexDocs(writer, docDir);
writer.commit(); 
//段"_4"形成，由于上次 flushDocStores 设为 false，其域和词向量信息是共享一个段保存的，也是是保存在_1.fdt 和_1.fdx 中的。然而函数 commit 中 flushDocStores 设为 true，也意味着下一个段将新创建一个段保存域和词向量信息，此时 DocumentsWriter 中 docStoreSegment= "_4"，也表明了虽然段"_4"的域和词向量信息保存在了段"_1"中，将来的域和词向量信息却要保存在段"_4"中。此时"_4.fdx"和"_4.fdt"尚未产生。

indexDocs(writer, docDir); 
writer.flush();
//段"_5"形成，由于上次 flushDocStores 设为 true，其域和词向量信息是新创建一个段保存的，却是保存在_4.fdt 和_4.fdx 中的，这时候才产生了此二文件。
indexDocs(writer, docDir); 
writer.commit(); 
writer.close(); 
//段"_6"形成，由于上次 flushDocStores 设为 false，其域和词向量信息是共享一个段保存的，也是是保存在_4.fdt 和_4.fdx 中的
```

### HasSingleNormFile 

- 在搜索的过程中，标准化因子(Normalization Factor)会影响文档最后的评分。 

- 不同的文档重要性不同，不同的域重要性也不同。因而每个文档的每个域都可以有自己的标准化因子。 

- 如果 HasSingleNormFile 为 1，则所有的标准化因子都是存在.nrm 文件中的。 

- 如果 HasSingleNormFile 不是 1，则每个域都有自己的标准化因子文件.fN

### NumField 

域的数量。

### NormGen 

如果每个域有自己的标准化因子文件，则此数组描述了每个标准化因子文件的版本号，也即.fN 的 N。 

### IsCompoundFile 

是否保存为复合文件，也即把同一个段中的文件按照一定格式，保存在一个文件中。这样可以减少每次打开文件的个数。 

是否为复合文件，由接口 IndexWriter.setUseCompoundFile(boolean)设定。 

非符合文件同符合文件的对比如下图： 

### DeletionCount

- 记录了此段中删除的文档的数目。 

### HasProx 

如果至少有一个段 omitTf 为 false，也即词频(term freqency)需要被保存，则HasProx 为 1，否则为 0。 

### Diagnostics 

调试信息。

### User map data 

保存了用户从字符串到字符串的映射 `Map<String,String>` 

### CheckSum 

此文件 segment_N 的校验和。 

读取此文件格式参考 
```java
SegmentInfos.read(Directory directory, String segmentFileName)
int format = input.readInt(); 
version = input.readLong(); // read version 
counter = input.readInt(); // read counter 
for (int i = input.readInt(); i > 0; i--) // read segmentInfos 
add(new SegmentInfo(directory, format, input)); 
name = input.readString(); 
docCount = input.readInt(); 
delGen = input.readLong(); 
docStoreOffset = input.readInt(); 
docStoreSegment = input.readString(); 
docStoreIsCompoundFile = (1 == input.readByte()); 
hasSingleNormFile = (1 == input.readByte()); 
int numNormGen = input.readInt(); 
normGen = new long[numNormGen]; 
for(int j=0;j<numNormGen;j++) 
normGen[j] = input.readLong(); 
isCompoundFile = input.readByte(); 
delCount = input.readInt(); 
hasProx = input.readByte() == 1; 
diagnostics = input.readStringStringMap(); 
userData = input.readStringStringMap(); 
final long checksumNow = input.getChecksum(); 
final long checksumThen = input.readLong();
```

# 4.1.2. 域(Field)的元数据信息(.fnm) 

一个段(Segment)包含多个域，每个域都有一些元数据信息，保存在.fnm 文件中。

- FNMVersion 

是 fnm 文件的版本号，对于 Lucene 2.9 为-2 

- FieldsCount 

域的数目 

- 一个数组的域(Fields) 

FieldName：域名，如"title"，"modified"，"content"等。 

FieldBits:一系列标志位，表明对此域的索引方式 

（1）最低位：1 表示此域被索引，0 则不被索引。所谓被索引，也即放到倒排表中去。 

a. 仅仅被索引的域才能够被搜到。 

b. Field.Index.NO 则表示不被索引。 

c. Field.Index.ANALYZED 则表示不但被索引，而且被分词，比如索引"hello world"后，无论是搜"hello"，还是搜"world"都能够被搜到。 

d. Field.Index.NOT_ANALYZED 表示虽然被索引，但是不分词，比如索引"hello world"后，仅当搜"hello world"时，能够搜到，搜"hello"和搜"world"都搜不到。

e. 一个域出了能够被索引，还能够被存储，仅仅被存储的域是搜索不到的，但是能通过文档号查到，多用于不想被搜索到，但是在通过其它域能够搜索到的情况下，能够随着文档号返回给用户的域。 

f. Field.Store.Yes 则表示存储此域，Field.Store.NO 则表示不存储此域。 

（2）倒数第二位：1 表示保存词向量，0 为不保存词向量。 

Field.TermVector.YES 表示保存词向量。 

Field.TermVector.NO 表示不保存词向量。 

（3）倒数第三位：1 表示在词向量中保存位置信息。 

Field.TermVector.WITH_POSITIONS 

（4）倒数第四位：1 表示在词向量中保存偏移量信息。 

Field.TermVector.WITH_OFFSETS 

（5）倒数第五位：1 表示不保存标准化因子 

Field.Index.ANALYZED_NO_NORMS 

Field.Index.NOT_ANALYZED_NO_NORMS 

（6）倒数第六位：是否保存 payload

要了解域的元数据信息，还要了解以下几点：

- 位置(Position)和偏移量(Offset)的区别 

位置是基于词 Term 的，偏移量是基于字母或汉字的。 

- 索引域(Indexed)和存储域(Stored)的区别 

一个域为什么会被存储(store)而不被索引(Index)呢？

在一个文档中的所有信息中，有这样一部分信息，可能不想被索引从而可以搜索到，但是当这个文档由于其他的信息被搜索到时，可以同其他信息一同返回。 

举个例子，读研究生时，您好不容易写了一篇论文交给您的导师，您的到时却让他做第一作者，你做第二作者。

然而您导师不想别人在论文系统中搜索您的名字时找到这篇论文，于是在论文系统中，把第二作者这个 Field 的 Indexed 设为 false，这样别人搜索您的名字，永远不知道您写过这篇论文，只有在别人搜索您导师的名字从而找到您的文章时，在一个角落表述着第二作者是您。 

- payload 的使用 

我们知道，索引是以倒排表形式存储的，对于每一个词，都保存了包含这个词的一个链表，当然为了加快查询速度，此链表多用跳跃表进行存储。 

Payload 信息就是存储在倒排表中的，同文档号一起存放，多用于存储与每篇文档相关的一些信息。当然这部分信息也可以存储域里(stored Field)，两者从功能上基
本是一样的，然而当要存储的信息很多的时候，存放在倒排表里，利用跳跃表，有利于大大提高搜索速度。 

- Payload 主要有以下几种用法： 

存储每个文档都有的信息：比如有的时候，我们想给每个文档赋一个我们自己的文档号，而不是用 Lucene 自己的文档号。

于是我们可以声明一个特殊的域 (Field)"_ID"和特殊的词(Term)"_ID"，使得每篇文档都包含词"_ID"，于是在词的 _id "的倒排表里面对于每篇文档又有一项，每一项都有一个 payload，于是我们可以在 payload 里面保存我们自己的文档号。

每当我们得到一个 Lucene 的文档号的时候，就能从跳跃表中查找到我们自己的文档号。

```java
//声明一个特殊的域和特殊的词 
public static final String ID_PAYLOAD_FIELD = "_ID"; 
public static final String ID_PAYLOAD_TERM = "_ID";
public static final Term ID_TERM = new Term(ID_PAYLOAD_TERM, ID_PAYLOAD_FIELD); 
//声明一个特殊的 TokenStream，它只生成一个词(Term)，就是那个特殊的词，在特殊的域里面。
static class SinglePayloadTokenStream extends TokenStream { 
 private Token token; 
 private boolean returnToken = false; 
 SinglePayloadTokenStream(String idPayloadTerm) { 
 char[] term = idPayloadTerm.toCharArray(); 
 token = new Token(term, 0, term.length, 0, term.length); 
 } 
 void setPayloadValue(byte[] value) { 
 token.setPayload(new Payload(value)); 
 returnToken = true; 
 } 
 public Token next() throws IOException { 
 if (returnToken) { 
 returnToken = false; 
 return token; 
 } else { 
 return null; 
 } 
 }
  
//对于每一篇文档，都让它包含这个特殊的词，在特殊的域里面
SinglePayloadTokenStream singlePayloadTokenStream = new 
SinglePayloadTokenStream(ID_PAYLOAD_TERM); 
singlePayloadTokenStream.setPayloadValue(long2bytes(id)); 
doc.add(new Field(ID_PAYLOAD_FIELD, singlePayloadTokenStream)); 
//每当得到一个 Lucene 的文档号时，通过以下的方式得到 payload 里面的文档号 
long id = 0; 
TermPositions tp = reader.termPositions(ID_PAYLOAD_TERM); 
boolean ret = tp.skipTo(docID); 
tp.nextPosition(); 
int payloadlength = tp.getPayloadLength(); 
byte[] payloadBuffer = new byte[payloadlength]; 
tp.getPayload(payloadBuffer, 0); 
id = bytes2long(payloadBuffer); 
tp.close(); 
```

## 影响词的评分 

在 Similarity 抽象类中有函数 `public float scorePayload(byte [] payload, int offset, int length)` 可以根据 payload 的值影响评分。 

读取域元数据信息的代码如下：

```java
FieldInfos.read(IndexInput, String) 
int firstInt = input.readVInt(); 
size = input.readVInt(); 
for (int i = 0; i < size; i++) 
String name = input.readString(); 
byte bits = input.readByte(); 
boolean isIndexed = (bits & IS_INDEXED) != 0; 
boolean storeTermVector = (bits & STORE_TERMVECTOR) != 0

boolean storePositionsWithTermVector = (bits & STORE_POSITIONS_WITH_TERMVECTOR) != 0; 
boolean storeOffsetWithTermVector = (bits & STORE_OFFSET_WITH_TERMVECTOR) != 0; 
boolean omitNorms = (bits & OMIT_NORMS) != 0; 
boolean storePayloads = (bits & STORE_PAYLOADS) != 0; 
boolean omitTermFreqAndPositions = (bits & OMIT_TERM_FREQ_AND_POSITIONS) != 0;
```

# 域(Field)的数据信息(.fdt，.fdx) 

## 域数据文件(fdt): 

真正保存存储域(stored field)信息的是 fdt 文件 

在一个段(segment)中总共有 segment size 篇文档，所以 fdt 文件中共有 segment size 个项，每一项保存一篇文档的域的信息 

对于每一篇文档，一开始是一个 fieldcount，也即此文档包含的域的数量。接下来是是 fieldcount 个项，每一项保存一个域的信息。 

对于每一个域，fieldnum 是域号，接着是一个 8 位的 byte，最低一位表示此域是否分词(tokenized)，倒数第二位表示此域是保存字符串数据还是二进制数据，倒数第
三位表示此域是否被压缩，再接下来就是存储域的值，比如 new Field("title", "lucene in action", Field.Store.Yes, …)，则此处存放的就是"lucene in action"这个字符串。 

## 域索引文件(fdx) 

由域数据文件格式我们知道，每篇文档包含的域的个数，每个存储域的值都是不一样的，因而域数据文件中 segment size 篇文档，每篇文档占用的大小也是不一样的，
那么如何在 fdt 中辨别每一篇文档的起始地址和终止地址呢，如何能够更快的找到第 n 篇文档的存储域的信息呢？

就是要借助域索引文件。 

域索引文件也总共有 segment size 个项，每篇文档都有一个项，每一项都是一个 long，大小固定，每一项都是对应的文档在 fdt 文件中的起始地址的偏移量，这样
如果我们想找到第 n 篇文档的存储域的信息，只要在 fdx 中找到第 n 项，然后按照取出的 long 作为偏移量，就可以在 fdt 文件中找到对应的存储域的信息。

读取域数据信息的代码如下： 

```java
Document FieldsReader.doc(int n, FieldSelector fieldSelector) 
long position = indexStream.readLong();//indexStream points to ".fdx" 
fieldsStream.seek(position);//fieldsStream points to "fdt" 
int numFields = fieldsStream.readVInt(); 
for (int i = 0; i < numFields; i++) 
int fieldNumber = fieldsStream.readVInt(); 
byte bits = fieldsStream.readByte(); 
boolean compressed = (bits & FieldsWriter.FIELD_IS_COMPRESSED) != 0; 
boolean tokenize = (bits & FieldsWriter.FIELD_IS_TOKENIZED) != 0; 
boolean binary = (bits & FieldsWriter.FIELD_IS_BINARY) != 0; 
if (binary) 
int toRead = fieldsStream.readInt();

Document FieldsReader.doc(int n, FieldSelector fieldSelector) 
long position = indexStream.readLong();//indexStream points to ".fdx" 
fieldsStream.seek(position);//fieldsStream points to "fdt" 
int numFields = fieldsStream.readVInt(); 
for (int i = 0; i < numFields; i++) 
int fieldNumber = fieldsStream.readVInt(); 
byte bits = fieldsStream.readByte(); 
boolean compressed = (bits & FieldsWriter.FIELD_IS_COMPRESSED) != 0; 
boolean tokenize = (bits & FieldsWriter.FIELD_IS_TOKENIZED) != 0; 
boolean binary = (bits & FieldsWriter.FIELD_IS_BINARY) != 0; 
if (binary) 
int toRead = fieldsStream.readString()
```

# 4.1.3. 词向量(Term Vector)的数据信息(.tvx，.tvd，.tvf)

词向量信息是从索引(index)到文档(document)到域(field)到词(term)的正向信息，有了词向量信息，我们就可以得到一篇文档包含那些词的信息。

## 词向量索引文件(tvx) 

一个段(segment)包含 N 篇文档，此文件就有 N 项，每一项代表一篇文档。 

每一项包含两部分信息：第一部分是词向量文档文件(tvd)中此文档的偏移量，第二部分是词向量域文件(tvf)中此文档的第一个域的偏移量。

## 词向量文档文件(tvd) 

一个段(segment)包含 N 篇文档，此文件就有 N 项，每一项包含了此文档的所有的域的信息。 

每一项首先是此文档包含的域的个数 NumFields，然后是一个 NumFields 大小的数组，数组的每一项是域号。然后是一个(NumFields - 1)大小的数组，由前面我们知
道，每篇文档的第一个域在 tvf 中的偏移量在 tvx 文件中保存，而其他(NumFields - 1)个域在 tvf 中的偏移量就是第一个域的偏移量加上这(NumFields - 1)个数组的每一项的值。

## 词向量域文件(tvf) 

此文件包含了此段中的所有的域，并不对文档做区分，到底第几个域到第几个域是属于那篇文档，是由 tvx 中的第一个域的偏移量以及 tvd 中的(NumFields - 1)个域的偏移量来决定的。 

对于每一个域，首先是此域包含的词的个数 NumTerms，然后是一个 8 位的 byte，最后一位是指定是否保存位置信息，倒数第二位是指定是否保存偏移量信息。

然后是 NumTerms 个项的数组，每一项代表一个词(Term)，对于每一个词，由词的文本TermText，词频 TermFreq(也即此词在此文档中出现的次数)，词的位置信息，词的偏移量信息。 

读取词向量数据信息的代码如下： 

```java
TermVectorsReader.get(int docNum, String field, TermVectorMapper) 
int fieldNumber = fieldInfos.fieldNumber(field);//通过 field 名字得到 field 号 
seekTvx(docNum);//在 tvx 文件中按 docNum 文档号找到相应文档的项 
long tvdPosition = tvx.readLong();//找到 tvd 文件中相应文档的偏移量 
tvd.seek(tvdPosition);//在 tvd 文件中按偏移量找到相应文档的项 
int fieldCount = tvd.readVInt();//此文档包含的域的个数。 
for (int i = 0; i < fieldCount; i++) //按域号查找域 
number = tvd.readVInt(); 
if (number == fieldNumber) found=i

position = tvx.readLong();//在 tvx 中读出此文档的第一个域在 tvf 中的偏移量 
for (int i = 1; i <= found; i++) 
position += tvd.readVLong();//加上所要找的域在 tvf 中的偏移量 
tvf.seek(position); 
int numTerms = tvf.readVInt(); 
byte bits = tvf.readByte(); 
storePositions = (bits & STORE_POSITIONS_WITH_TERMVECTOR) != 0; 
storeOffsets = (bits & STORE_OFFSET_WITH_TERMVECTOR) != 0; 
for (int i = 0; i < numTerms; i++) 
start = tvf.readVInt(); 
deltaLength = tvf.readVInt(); 
totalLength = start + deltaLength; 
tvf.readBytes(byteBuffer, start, deltaLength); 
term = new String(byteBuffer, 0, totalLength, "UTF-8"); 
if (storePositions) 
positions = new int[freq]; 
int prevPosition = 0; 
for (int j = 0; j < freq; j++) 
positions[j] = prevPosition + tvf.readVInt(); 
prevPosition = positions[j]; 
if (storeOffsets) 
offsets = new TermVectorOffsetInfo[freq]; 
int prevOffset = 0; 
for (int j = 0; j < freq; j++) 
int startOffset = prevOffset + tvf.readVInt(); 
int endOffset = startOffset + tvf.readVInt(); 
offsets[j] = new TermVectorOffsetInfo(startOffset, endOffset); 
prevOffset = endOffset
```

# 参考资料

《Lucene 原理与代码分析》

* any list
{:toc}