---
layout: post
title: Lucene code-03-Lucene 的索引文件格式反向内容
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, code, source-code, sh]
published: true
---

# 反向信息

反向信息是索引文件的核心，也即反向索引。

反向索引包括两部分，左面是词典(Term Dictionary)，右面是倒排表(Posting List)。

在 Lucene 中，这两部分是分文件存储的，词典是存储在 tii，tis 中的，倒排表又包括两部分，一部分是文档号及词频，保存在 frq 中，一部分是词的位置信息，保存在 prx 中。

- Term Dictionary (tii, tis) 

- Frequencies (.frq) 

- Positions (.prx)

# 4.2.1. 词典(tis)及词典索引(tii)信息

在词典中，所有的词是按照字典顺序排序的。

## 词典文件(tis) 

TermCount：词典中包含的总的词数 

IndexInterval：为了加快对词的查找速度，也应用类似跳跃表的结构，
假设IndexInterval 为 4，则在词典索引(tii)文件中保存第 4 个，第 8 个，第 12个词，这样可以加快查找的速度。

SkipInterval：倒排表无论是文档号及词频，还是位置信息，都是以跳跃表的结构存在的，SkipInterval 是跳跃的步数。 

MaxSkipLevels：跳跃表是多层的，这个值指的是跳跃表的最大层数。 

TermCount 个项的数组，每一项代表一个词，对于每一个词，以前缀后缀规则存放词的文本信息(PrefixLength + Suffix)，词属于的域的域号(FieldNum)，有多少篇文档包含此词(DocFreq)，此词的倒排表在 frq，prx 中的偏移量(FreqDelta, ProxDelta)，此词的倒排表的跳跃表在 frq 中的偏移量(SkipDelta)，这里之所以用 Delta，是应用差值规则。

## 词典索引文件(tii) 

词典索引文件是为了加快对词典文件中词的查找速度，保存每隔 IndexInterval 个词。 

词典索引文件是会被全部加载到内存中去的。 

IndexTermCount = TermCount / IndexInterval：词典索引文件中包含的词数。 

IndexInterval 同词典文件中的 IndexInterval。 

SkipInterval 同词典文件中的 SkipInterval。 

MaxSkipLevels 同词典文件中的 MaxSkipLevels。 

IndexTermCount 个项的数组，每一项代表一个词，每一项包括两部分，第一部分是

词 本 身 (TermInfo) ， 第 二 部 分 是 在 词 典 文 件 中 的 偏 移 量 (IndexDelta) 。

假 设IndexInterval 为 4，此数组中保存第 4 个，第 8 个，第 12 个词。。。 

读取词典及词典索引文件的代码如下： 

```java
origEnum = new SegmentTermEnum(directory.openInput(segment + "." + 
IndexFileNames.TERMS_EXTENSION,readBufferSize), fieldInfos, false);//用于读取 tis 文件
int firstInt = input.readInt(); 
size = input.readLong(); 
indexInterval = input.readInt(); 
skipInterval = input.readInt();
maxSkipLevels = input.readInt(); 

SegmentTermEnum indexEnum = new SegmentTermEnum(directory.openInput(segment + "." + 
IndexFileNames.TERMS_INDEX_EXTENSION, readBufferSize), fieldInfos, true);//用于读取 tii 文件
indexTerms = new Term[indexSize]; 
indexInfos = new TermInfo[indexSize]; 
indexPointers = new long[indexSize]; 
for (int i = 0; indexEnum.next(); i++) 
indexTerms[i] = indexEnum.term(); 
indexInfos[i] = indexEnum.termInfo(); 
indexPointers[i] = indexEnum.indexPointer; 
```

# 文档号及词频(frq)信息

文档号及词频文件里面保存的是倒排表，是以跳跃表形式存在的。

此文件包含 TermCount 个项，每一个词都有一项，因为每一个词都有自己的倒排表。 

对于每一个词的倒排表都包括两部分，一部分是倒排表本身，也即一个数组的文档号及词频，另一部分是跳跃表，为了更快的访问和定位倒排表中文档号及词频的位置。 

对于文档号和词频的存储应用的是差值规则和或然跟随规则，Lucene 的文档本身有以下几句话，比较难以理解，在此解释一下： 

```
For example, the TermFreqs for a term which occurs once in document seven and three times in 
document eleven, with omitTf false, would be the following sequence of VInts: 
15, 8, 3 
If omitTf were true it would be this sequence of VInts instead: 
7,4 

首先我们看 omitTf=false 的情况，也即我们在索引中会存储一个文档中 term 出现的次数。
例子中说了，表示在文档 7 中出现 1 次，并且又在文档 11 中出现 3 次的文档用以下序列表示：
15，8，3. 

那这三个数字是怎么计算出来的呢？

首先，根据定义 TermFreq --> DocDelta[, Freq?]，一个 TermFreq 结构是由一个 DocDelta 后面或许跟着 Freq 组成，也即上面我们说的 A+B？结构。

DocDelta 自然是想存储包含此 Term 的文档的 ID 号了，Freq 是在此文档中出现的次数。

所以根据例子，应该存储的完整信息为[DocID = 7, Freq = 1] [DocID = 11, Freq = 3](见全文检索的基本原理章节)。 

然而为了节省空间，Lucene 对编号此类的数据都是用差值来表示的，也即上面说的规则 2，

Delta 规则，于是文档 ID 就不能按完整信息存了，就应该存放如下：
[DocIDDelta = 7, Freq = 1][DocIDDelta = 4 (11-7), Freq = 3] 

然而 Lucene 对于 A+B?这种或然跟随的结果，有其特殊的存储方式，见规则 3，即 A+B?规则，
如果 DocDelta 后面跟随的 Freq 为 1，则用 DocDelta 最后一位置 1 表示。
如果 DocDelta 后面跟随的 Freq 大于 1，则 DocDelta 得最后一位置 0，然后后面跟随真正的值，
从而对于第一个 Term，由于 Freq 为 1，于是放在 DocDelta 的最后一位表示，DocIDDelta = 7
的二进制是 000 0111，必须要左移一位，且最后一位置一，000 1111 = 15，对于第二个 Term，
由于 Freq 大于一，于是放在 DocDelta 的最后一位置零，DocIDDelta = 4 的二进制是 0000 0100，

必须要左移一位，且最后一位置零，0000 1000 = 8，然后后面跟随真正的 Freq = 3。
于是得到序列：[DocDleta = 15][DocDelta = 8, Freq = 3]，也即序列，15，8，3。
如果 omitTf=true，也即我们不在索引中存储一个文档中 Term 出现的次数，则只存 DocID 就可
以了，因而不存在 A+B?规则的应用。
[DocID = 7][DocID = 11]，然后应用规则 2，Delta 规则，于是得到序列[DocDelta = 7][DocDelta = 
4 (11 - 7)]，也即序列，7，4.
```

## 跳跃表存储

对于跳跃表的存储有以下几点需要解释一下： 

跳跃表可根据倒排表本身的长度(DocFreq)和跳跃的幅度(SkipInterval)而分不同的层次 ， 层 次 数 为 NumSkipLevels = Min(MaxSkipLevels, floor(log(DocFreq/log(SkipInterval)))). 

第 Level 层的节点数为 DocFreq/(SkipInterval^(Level + 1))，level 从零计数。 

除了最高层之外，其他层都有 SkipLevelLength 来表示此层的二进制长度(而非节点的个数)，方便读取某一层的跳跃表到缓存里面。 

低层在前，高层在后，当读完所有的低层后，剩下的就是最后一层，因而最后一层不需要SkipLevelLength。

这也是为什么Lucene文档中的格式描述为`<SkipLevelLength, SkipLevel> NumSkipLevels-1`, SkipLevel，也即低 NumSKipLevels-1 层有 SkipLevelLength，最
后一层只有 SkipLevel，没有 SkipLevelLength。 

除最低层以外，其他层都有 SkipChildLevelPointer 来指向下一层相应的节点。 

每一个跳跃节点包含以下信息：文档号，payload 的长度，文档号对应的倒排表中的节点在 frq 中的偏移量，文档号对应的倒排表中的节点在 prx 中的偏移量。 

虽然 Lucene 的文档中有以下的描述，然而实验的结果却不是完全准确的： 

```
Example: SkipInterval = 4, MaxSkipLevels = 2, DocFreq = 35. Then skip level 0 has 8 SkipData 
entries, containing the 3rd, 7th, 11th, 15th, 19th, 23rd, 27th, and 31st document numbers in TermFreqs. 
Skip level 1 has 2 SkipData entries, containing the 15th and 31st document numbers in TermFreqs. 
按照描述，当 SkipInterval 为 4，且有 35 篇文档的时候，Skip level = 0 应该包括第 3，第 7，第
11，第 15，第 19，第 23，第 27，第 31 篇文档，Skip level = 1 应该包括第 15，第 31 篇文档。
然而真正的实现中，跳跃表节点的时候，却向前偏移了，偏移的原因在于下面的代码：

FormatPostingsDocsWriter.addDoc(int docID, int termDocFreq)
final int delta = docID - lastDocID; 
if ((++df % skipInterval) == 0) 
skipListWriter.setSkipData(lastDocID, storePayloads, posWriter.lastPayloadLength); 
skipListWriter.bufferSkip(df); 

从代码中，我们可以看出，当 SkipInterval 为 4 的时候，当 docID = 0 时，++df 为 1，1%4 不为
0，不是跳跃节点，当 docID = 3 时，++df=4，4%4 为 0，为跳跃节点，然而 skipData 里面保存
的却是 lastDocID 为 2。
```

# 4.2.3. 词位置(prx)信息

词位置信息也是倒排表，也是以跳跃表形式存在的。

此文件包含 TermCount 个项，每一个词都有一项，因为每一个词都有自己的词位置倒排表。 

对于每一个词的都有一个 DocFreq 大小的数组，每项代表一篇文档，记录此文档中此词出现的位置。这个文档数组也是和 frq 文件中的跳跃表有关系的，从上面我们知道，在frq 的跳跃表节点中有 ProxSkip，当 SkipInterval 为 3 的时候，frq 的跳跃表节点指向 prx文件中的此数组中的第 1，第 4，第 7，第 10，第 13，第 16 篇文档。 

对于每一篇文档，可能包含一个词多次，因而有一个 Freq 大小的数组，每一项代表此词在此文档中出现一次，则有一个位置信息。 

每一个位置信息包含：PositionDelta(采用差值规则)，还可以保存 payload，应用或然跟随规则。 

ps: 反向信息，可以记录 

单词 对应标识 出现次数 TI-TDF 计算值   单词的起始位置（如果后期需要做语法高亮的话？[1,2]; [4,5] 这样记录。）

# 参考资料

《Lucene 原理与代码分析》

* any list
{:toc}