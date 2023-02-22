---
layout: post
title: NLP 英文拼写算法，如果提升 100W 倍的性能？
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# SymSpell 算法

拼写更正和模糊搜索：通过对称删除拼写更正算法快 100 万倍

对称删除拼写校正算法降低了给定 Damerau-Levenshtein 距离的编辑候选生成和字典查找的复杂性。

它比删除 + 转置 + 替换 + 插入的标准方法快六个数量级，并且与语言无关。

与其他算法相反，只需要删除，不需要转置 + 替换 + 插入。输入术语的转置 + 替换 + 插入被转换为字典术语的删除。替换和插入很昂贵并且依赖于语言：例如中文有7万个Unicode汉字！

速度来自廉价的仅删除编辑候选生成和预计算。

一个平均 5 个字母的单词在最大编辑距离 3 内有大约 300 万个可能的拼写错误，但是 SymSpell 只需要生成 25 个删除来覆盖它们，无论是在预计算还是在查找时。 Magic!

# 单字拼写更正

Lookup 提供了非常快速的单个单词拼写纠正。

Verbosity 参数允许控制返回结果的数量：

顶部：找到的最小编辑距离建议中词频最高的顶部建议。

最近：找到所有编辑距离最小的建议，建议按词频排序。

全部：maxEditDistance 内的所有建议，建议按编辑距离排序，然后按词频排序。

最大编辑距离参数控制应将词典中的哪些编辑距离词视为建议。

所需词频词典既可以直接从文本文件中加载（LoadDictionary），也可以从大型文本语料库中生成（CreateDictionary）。

## 应用

拼写更正，

查询更正（10-15% 的查询包含拼写错误的术语），

聊天机器人，

OCR后处理，

自动校对。

模糊搜索和近似字符串匹配

# 复合感知多词拼写纠正

LookupCompound 支持多词输入字符串的复合感知自动拼写校正。

1. 化合物分裂和分解

Lookup() 将每个输入字符串假定为单个术语。 LookupCompound 还支持复合拆分/分解三种情况：

在正确的单词中错误地插入空格导致两个不正确的术语

错误地省略了两个正确单词之间的空格导致一个错误的组合词

有/没有拼写错误的多个输入词

拆分错误、连接错误、替换错误、换位错误、删除错误和插入错误可以混合在同一个词中。

2. 自动拼写更正

大型文档集合使手动更正变得不可行，并且需要无人监督的全自动拼写更正。

在单个标记的常规拼写纠正中，向用户呈现多个拼写纠正建议。

对于长多字文本的自动拼写校正，算法本身必须做出有根据的选择。


```
- whereis th elove hehad dated forImuch of thepast who couqdn'tread in sixthgrade and ins pired him
+ where is the love he had dated for much of the past who couldn't read in sixth grade and inspired him  (9 edits)

- in te dhird qarter oflast jear he hadlearned ofca sekretplan
+ in the third quarter of last year he had learned of a secret plan  (9 edits)

- the bigjest playrs in te strogsommer film slatew ith plety of funn
+ the biggest players in the strong summer film slate with plenty of fun  (9 edits)

- Can yu readthis messa ge despite thehorible sppelingmsitakes
+ can you read this message despite the horrible spelling mistakes  (9 edits)
```

# 嘈杂文本的分词

WordSegmentation 通过在适当的位置插入缺失的空格将字符串分成单词。

拼写错误的单词会得到纠正，并且不会阻止分割。

允许并考虑现有空间以进行最佳分割。

SymSpell.WordSegmentation 使用三角矩阵方法而不是传统的动态编程：它使用数组而不是字典进行记忆，循环而不是递归，并逐步优化前缀字符串而不是剩余字符串。

三角矩阵方法比动态规划方法快。 它具有更低的内存消耗、更好的扩展性（恒定 O(1) 内存消耗与线性 O(n)）并且是 GC 友好的。

虽然每个长度为 n 的字符串可以分割成 2^n−1 种可能的组合，

SymSpell.WordSegmentation 有一个线性运行时间 O(n) 来找到最佳组合。

例子：

```
- thequickbrownfoxjumpsoverthelazydog
+ the quick brown fox jumps over the lazy dog

- itwasabrightcolddayinaprilandtheclockswerestrikingthirteen
+ it was a bright cold day in april and the clocks were striking thirteen

- itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishness
+ it was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness 
```

应用：

- 用于索引拼写校正、机器翻译、语言理解、情感分析的 CJK 语言的分词

- 标准化英语复合名词以进行搜索和索引（例如，ice box = ice-box = icebox；pig sty = pig-sty = pigsty）

- 如果原始词和拆分词部分都应该被索引，则复合词的分词。

- 更正因打字错误导致的空格缺失。

- 更正转换错误：单词之间的空格可能会丢失，例如删除换行符时。

- 更正 OCR 错误：原始文档或手写文本质量较差可能会导致无法识别所有空格。

- 传输错误的更正：在通过嘈杂的信道传输期间，空间可能会丢失或引入拼写错误。

- 从 URL 地址、域名、#hashtags、表列描述或没有空格的编程变量中提取关键字。

- 对于密码分析，可能需要从密码中提取术语。

- 对于语音识别，如果在口语中无法正确识别单词之间的空格。

- 编程变量的自动 CamelCasing。

- 自然语言处理以外的应用，例如将 DNA 序列分割成单词

# Usage SymSpell Library

```java
//create object
int initialCapacity = 82765;
int maxEditDistanceDictionary = 2; //maximum edit distance per dictionary precalculation
var symSpell = new SymSpell(initialCapacity, maxEditDistanceDictionary);
      
//load dictionary
string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
string dictionaryPath= baseDirectory + "../../../../SymSpell/frequency_dictionary_en_82_765.txt";
int termIndex = 0; //column of the term in the dictionary text file
int countIndex = 1; //column of the term frequency in the dictionary text file
if (!symSpell.LoadDictionary(dictionaryPath, termIndex, countIndex))
{
  Console.WriteLine("File not found!");
  //press any key to exit program
  Console.ReadKey();
  return;
}

//lookup suggestions for single-word input strings
string inputTerm="house";
int maxEditDistanceLookup = 1; //max edit distance per lookup (maxEditDistanceLookup<=maxEditDistanceDictionary)
var suggestionVerbosity = SymSpell.Verbosity.Closest; //Top, Closest, All
var suggestions = symSpell.Lookup(inputTerm, suggestionVerbosity, maxEditDistanceLookup);

//display suggestions, edit distance and term frequency
foreach (var suggestion in suggestions)
{ 
  Console.WriteLine(suggestion.term +" "+ suggestion.distance.ToString() +" "+ suggestion.count.ToString("N0"));
}


//load bigram dictionary
string dictionaryPath= baseDirectory + "../../../../SymSpell/frequency_bigramdictionary_en_243_342.txt";
int termIndex = 0; //column of the term in the dictionary text file
int countIndex = 2; //column of the term frequency in the dictionary text file
if (!symSpell.LoadBigramDictionary(dictionaryPath, termIndex, countIndex))
{
  Console.WriteLine("File not found!");
  //press any key to exit program
  Console.ReadKey();
  return;
}

//lookup suggestions for multi-word input strings (supports compound splitting & merging)
inputTerm="whereis th elove hehad dated forImuch of thepast who couqdn'tread in sixtgrade and ins pired him";
maxEditDistanceLookup = 2; //max edit distance per lookup (per single word, not per whole input string)
suggestions = symSpell.LookupCompound(inputTerm, maxEditDistanceLookup);

//display suggestions, edit distance and term frequency
foreach (var suggestion in suggestions)
{ 
  Console.WriteLine(suggestion.term +" "+ suggestion.distance.ToString() +" "+ suggestion.count.ToString("N0"));
}


//word segmentation and correction for multi-word input strings with/without spaces
inputTerm="thequickbrownfoxjumpsoverthelazydog";
maxEditDistance = 0;
suggestion = symSpell.WordSegmentation(input);

//display term and edit distance
Console.WriteLine(suggestion.correctedString + " " + suggestion.distanceSum.ToString("N0"));


//press any key to exit program
Console.ReadKey();
```

# 频率词典

词典质量对于校正质量至关重要。 

为了实现这两个数据源通过交集组合：Google Books Ngram 数据提供代表性词频（但包含许多拼写错误的条目）和 SCOWL - Spell Checker Oriented Word Lists，确保真正的英语词汇（但不包含词频） 在相同编辑距离内对建议进行排名所需）。

[frequency_dictionary_en_82_765.txt](https://github.com/wolfgarbe/SymSpell/blob/master/SymSpell/frequency_dictionary_en_82_765.txt) 是通过将下面提到的两个列表相交而创建的。 

通过相互过滤，只使用出现在两个列表中的那些词。 

应用了额外的过滤器，结果列表被截断为 ≈ 80,000 个最常用的词。

[Google Books Ngram data](http://storage.googleapis.com/books/ngrams/books/datasetsv2.html) (License) ：提供代表性词频

[SCOWL - 面向拼写检查器的单词列表](http://wordlist.aspell.net/)（许可证）：确保真正的英语词汇

## 字典文件格式

UTF-8 编码的纯文本文件。

词和词频用空格或制表符分隔。默认情况下，单词应在第一列中，频率在第二列中。但是使用 LoadDictionary() 中的 termIndex 和 countIndex 参数，可以更改值的位置和顺序并从具有两个以上值的行中选择。这允许使用附加信息扩充字典或适应现有字典而无需重新格式化。

每个词频对在一个单独的行中。一行被定义为一个字符序列，后跟换行符（“\n”）、回车符（“\r”）或回车符紧跟换行符（“\r\n”）。

字典术语和输入术语都应为小写。

您可以为您的语言或您的专业技术领域构建自己的频率词典。 

SymSpell 拼写校正算法支持具有非拉丁字符的语言，例如西里尔文、中文或格鲁吉亚文。

# 1000x 倍速度的算法

最近我在 Quora 上回答了一个关于搜索引擎拼写更正的问题。 

当我描述我们的 SymSpell 算法时，我指向了 Peter Norvig 的页面，他概述了他的方法。

两种算法都基于编辑距离（Damerau-Levenshtein 距离）。 两者都试图找到与查询词的编辑距离最小的字典条目。

如果编辑距离为 0，则该术语拼写正确，如果编辑距离 <=2，则将词典术语用作拼写建议。 但是 SymSpell 使用不同的方式来搜索字典，从而获得了显着的性能提升和语言独立性。 在字典中搜索最小编辑距离的三种方法：

## 1. 天真的方法

这样做的明显方法是在选择最小编辑距离的字符串作为拼写建议之前，计算从查询词到每个词典词的编辑距离。 

这种详尽的搜索非常昂贵。

资料来源：[Christopher D. Manning、Prabhakar Raghavan 和 Hinrich Schütze：信息检索简介](http://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html)。

一旦达到阈值 2 或 3，就可以通过终止编辑距离计算来显着提高性能。

## 2. 彼得·诺维格

从查询词生成具有编辑距离（删除 + 转置 + 替换 + 插入）的所有可能词，并在字典中搜索它们。 

对于长度为n的单词，字母大小为a，编辑距离d=1，会有n次删除，n-1次换位，`a*n` 次改变，`a*(n+1)` 次插入，总共2n次 搜索时 `2n+2an+a-1` 个词。

算法：[Peter Norvig: How to Write a Spelling Corrector.](http://norvig.com/spell-correct.html)

这比简单的方法要好得多，但在搜索时仍然很昂贵（n=9、a=36、d=2 的 114,324 个术语）和语言相关（因为字母表用于生成术语，这在许多方面都不同） 

语言和巨大的中文：a=70,000 Unicode 汉字）

## 3. 对称删除拼写纠正（SymSpell）

从每个字典术语生成具有编辑距离（仅删除）的术语，并将它们与原始术语一起添加到字典中。 

这必须在预计算步骤中仅执行一次。

生成与输入术语具有编辑距离（仅删除）的术语并在字典中搜索它们。

对于长度为 n 的单词、字母大小为 a、编辑距离为 1 的单词，将只有 n 个删除，在搜索时总共有 n 个术语。

这便宜了三个数量级（n=9 和 d=2 的 36 个术语）并且与语言无关（不需要字母表来生成删除）。

这种方法的代价是每个原始字典条目x次删除的预计算时间和存储空间，这在大多数情况下是可以接受的。

单个字典条目的删除次数 x 取决于最大编辑距离：x=n 编辑距离=1，x=n*(n-1)/2 编辑距离=2，x=n!/d! /（nd）！ 对于编辑距离=d（组合：n 个组合中的 k 个没有重复，并且 k=n-d），

例如。 对于最大编辑距离为 2、平均字长为 5 和 100,000 个字典条目，我们需要额外存储 1,500,000 个删除。

> 对称删除拼写校正算法通过仅使用删除而不是删除 + 转置 + 替换 + 插入来降低编辑候选生成和字典查找的复杂性。 它快了六个数量级（编辑距离=3）并且与语言无关。

备注1：在预计算过程中，字典中不同的词可能会导致相同的删除词：delete(sun,1)==delete(sin,1)==sn。

虽然我们只生成一个新的字典条目 (sn)，但在内部我们需要将两个原始术语存储为拼写更正建议 (sun,sin)

备注 2：有四种不同的比较对类型：

```
dictionary entry==input entry,
delete(dictionary entry,p1)==input entry  // 预处理
dictionary entry==delete(input entry,p2)
delete(dictionary entry,p1)==delete(input entry,p2)
```

仅替换和转置需要最后一个比较类型。 

但是我们需要检查建议的字典术语是否真的是输入术语的替换或相邻转置，以防止更高编辑距离的误报（bank==bnak 和bank==bink，但是bank!=kanb 和bank!= xban 和银行！=baxn）。

备注 3：我们使用的是搜索引擎索引本身，而不是专用的拼写字典。 

这有几个好处：

它是动态更新的。 每个新索引的词，其频率超过某个阈值，也会自动用于拼写校正。

由于我们无论如何都需要搜索索引，因此拼写更正几乎不需要额外的成本。

当索引拼写错误的术语时（即未在索引中标记为正确），我们会即时进行拼写更正，并为正确的术语索引页面。

备注 4：我们以类似的方式实现了查询建议/完成。 

这是首先防止拼写错误的好方法。 

每个新索引的单词，其频率超过某个阈值，都被存储为对其所有前缀的建议（如果它们尚不存在，则会在索引中创建）。 

由于我们提供了即时搜索功能，因此查找建议也几乎不需要额外费用。 多个术语按存储在索引中的结果数排序。

## 推理

SymSpell 算法利用了两个术语之间的编辑距离对称的事实：

我们可以生成与查询词条编辑距离 <2 的所有词条（试图扭转查询词条错误）并根据所有字典词条检查它们，

我们可以生成与每个字典术语的编辑距离 <2 的所有术语（尝试创建查询术语错误），并根据它们检查查询术语。

通过将正确的字典术语转换为错误的字符串，并将错误的输入术语转换为正确的字符串，我们可以将两者结合起来并在中间相遇。

**因为在字典上添加一个字符相当于从输入字符串中删除一个字符，反之亦然，所以我们可以在两边都限制转换为仅删除。**

## 编辑距离

我们正在使用变体 3，因为仅删除转换与语言无关，并且成本低三个数量级。

速度从何而来？

预计算，即生成可能的拼写错误变体（仅删除）并在索引时存储它们是第一个前提条件。

通过使用平均搜索时间复杂度为 O(1) 的哈希表在搜索时进行快速索引访问是第二个前提条件。

但是，只有在此之上的对称删除拼写纠正才能将这种 O(1) 速度带到拼写检查中，因为它可以极大地减少要预先计算（生成和索引）的拼写错误候选者的数量。

将预计算应用于 Norvig 的方法是不可行的，因为预计算所有可能的删除 + 转置 + 替换 + 插入所有术语的候选将导致巨大的时间和空间消耗。

## 计算复杂度

SymSpell 算法是常数时间（O(1) 时间），即独立于字典大小（但取决于平均术语长度和最大编辑距离），因为我们的索引基于具有平均搜索时间复杂度的哈希表 的 O(1)。

## 与其他方法的比较

BK-Trees 的搜索时间为 O(log dictionary_size)，而 SymSpell 算法是常数时间 (O(1) time)，即独立于字典大小。

尝试具有与我们的方法相当的搜索性能。 

但是 Trie 是一个前缀树，它需要一个公共前缀。 

这使其适用于自动完成或搜索建议，但不适用于拼写检查。

如果您的打字错误是例如 在第一个字母中，您没有通用前缀，因此 Trie 将无法用于拼写更正。

如果您需要非常快速的自动完成，请尝试我的 [Pruning Radix Trie](https://medium.com/@wolfgarbe/the-pruning-radix-trie-a-radix-trie-on-steroids-412807f77abc)

## 应用

SymSpell 算法的可能应用领域是快速近似字典字符串匹配：文字处理器和搜索引擎的拼写检查器、光学字符识别的校正系统、基于翻译记忆的自然语言翻译、记录链接、重复数据删除、匹配 DNA 序列 ，模糊字符串搜索和欺诈检测。

对于单个用户或较小的编辑距离，其他算法可能会很好。 

但是对于搜索引擎和搜索即服务搜索 API，您必须为数千个并发用户提供服务，同时仍然保持几毫秒的延迟，并且拼写校正甚至不是主要的处理任务，而只是其中的许多组件之一 查询预处理，您需要获得最快的拼写更正。

## 源代码

对称删除拼写纠正算法的 C# 实现在 GitHub 上以 MIT 许可证的开源形式发布：

https://github.com/wolfgarbe/symspell


# 编辑距离 3 的拼写校正速度提高 100 万倍

在我的博文将拼写纠正速度提高 1000 倍后获得了超过 50.000 次浏览，我重新审视了算法和实现，看看是否可以进一步改进。

虽然对称删除拼写校正算法的基本思想保持不变，但实现已得到显着改进，以释放算法的全部潜力。

与 v1.6 相比，v3.0 的拼写纠正速度提高了 10 倍，字典生成速度提高了 5 倍，内存消耗减少了 2…7 倍。

与 Peter Norvig 的算法相比，现在编辑距离=3 时快 1,000,000 倍，编辑距离=2 时快 10,000 倍。

在 Norvig 的测试中，76% 的拼写错误的编辑距离为 1。98.9% 的拼写错误被编辑距离 2 覆盖。对于编辑距离为 2 的自然语言的简单拼写更正，准确度足够好，Norvig 的算法性能也足够。

我们算法的速度使拼写检查的编辑距离为 3，从而将准确度提高了 1%。除了提高准确性之外，我们算法的速度优势对于大型语料库和搜索引擎中的自动拼写校正很有用，在这些引擎中需要处理许多并行请求。

编辑距离 > 4 时近似字符串匹配速度快十亿倍

但该算法的真正潜力在于编辑距离 > 3 和拼写检查之外。

许多数量级的更快算法为近似字符串匹配开辟了新的应用领域，并为大数据和实时提供了足够的扩展。

我们的算法可以在非常大的数据库中与长字符串或特征向量、巨大字母表、大编辑距离、具有许多并发处理和实时要求的快速近似字符串和模式匹配。

## 应用领域

- 搜索引擎中的拼写更正，具有许多并行请求

- 大型语料库中的自动拼写校正

- 基因组数据分析，

- 匹配的 DNA 序列

- 浏览器指纹分析

- 实时图像识别（按图像搜索、自动驾驶汽车、医学）

- 人脸识别

- 虹膜识别

- 语音识别

- 语音识别

- 特征识别

- 指纹识别

- 签名识别

- 抄袭检测（在音乐中/在文本中）

- 光学字符识别

- 音频指纹

- 欺诈识别

- 地址重复数据删除

- 拼写错误的名字识别

- 基于光谱的化学和生物材料鉴定

- 文件修改

- 垃圾邮件检测

- 相似性搜索，

- 相似度匹配

- 近似字符串匹配，

- 模糊字符串匹配，

- 模糊字符串比较，

- 模糊字符串搜索，

- 模式匹配，

- 数据清洗

- 还有很多

## 编辑距离度量

虽然我们将 Damerau-Levenshtein 距离用于其他应用程序的拼写校正，但只需修改相应的函数，就可以轻松地将其与 Levenshtein 距离或类似的其他编辑距离进行交换。

在我们的算法中，编辑距离计算的速度对整体查找速度的影响很小。 

这就是为什么我们只使用基本实现而不是更复杂的变体。

## 基准

由于除拼写检查之外的近似字符串匹配的所有应用程序，我们将基准扩展到具有更高编辑距离的查找。 

这就是对称删除算法真正闪耀并超越其他解决方案的地方。 

使用以前的拼写检查算法，所需的时间随着编辑距离的增加而激增。

## 速度增益

速度优势随着编辑距离呈指数增长：

对于编辑距离=1，速度快了 1 个数量级，

对于编辑距离=2，速度快了 4 个数量级，

对于编辑距离=3，它的速度提高了 6 个数量级。

对于编辑距离=4，速度快了 8 个数量级。

## 计算复杂度

我们的算法是恒定时间（O(1) 时间），即独立于字典大小（但取决于平均术语长度和最大编辑距离），因为我们的索引基于哈希表，其平均搜索时间复杂度为 O(1)。

# 拓展阅读

https://github.com/MighTguY/customized-symspell (Version 6.6)
https://github.com/rxp90/jsymspell (Version 6.6)
https://github.com/Lundez/JavaSymSpell (Version 6.4)
https://github.com/rxp90/jsymspell
https://github.com/gpranav88/symspell
https://github.com/searchhub/preDict
https://github.com/jpsingarayar/SpellBlaze


# 中文拼写检测

https://github.com/wolfgarbe/SymSpell

http://norvig.com/spell-correct.html

https://github.com/jpsingarayar/SpellBlaze

# 参考资料

https://wolfgarbe.medium.com/1000x-faster-spelling-correction-algorithm-2012-8701fcd87a5f

[Fast approximate string matching with large edit distances in Big Data (2015)](https://wolfgarbe.medium.com/fast-approximate-string-matching-with-large-edit-distances-in-big-data-2015-9174a0968c0b)

* any list
{:toc}