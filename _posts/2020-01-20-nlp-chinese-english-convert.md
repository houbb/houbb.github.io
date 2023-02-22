---
layout: post
title: NLP 中英文转换
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 英语基础语料

中文到英文的翻译有一些比较重要的作用：

1. 作为基础的语料

2. 作为后期翻译的字典

3. 计算机相关命名等等。

# 词典获取思路

1. 使用已有的字典

2. 结合相关列表，进行扩充（爬虫）

[Free English to Chinese Dictionary Database](https://github.com/skywind3000/ECDICT) 算是比较全的一个字典。

# 实现思路

## 基本翻译

最基本的英汉互译

1. 单词的基本信息

2. 英文单词发音（结合英文的 TTS）

## 句子翻译

这个需要学习一些深度学习。

# 字典大小优化思路

## 字典太大的问题

看了下字典默认是 200+M，这么多信息直接放在内存也不是不可以，不过相对比较占内存。

（1）存数据库

当然这是一种最容易想到的方式，将对空间的占用复杂度转移到了数据库。

（2）借助索引+文本读取

数据库的原理其实我们可以借鉴一下，如果不想直接把 200M 的文件直接加载到内存，可以将单词对应的 index 信息加载到内存。

然后根据内存，去检索文件中的字典信息。

ps: 这里可以不做压缩优化，因为 java 的 jar 文件，会自动对文件进行压缩。

## 瘦身

根据自己的特定需求，可以对原来的字典进行瘦身。

比如移除例句，只保留英汉的基本解释等等。

# 应用思路

## 翻译

TODO

可以直接机器翻译整个网站，然后搬运到自己的博客上。（作为学习的一种方式，人工翻译的效率太低，而且个人的时间有限。）

### 特殊词汇

一定要注意排除 it 行业的特殊词汇。

## 命名

类似于 CODELEF 的英文命名

可以支持驼峰，下划线命名。

## 自动纠错

针对英文拼写的自动纠错。

# TTS

文本转语音。

这里因为多年前中文的语音转换不成熟，有人有过通过英文发音模拟中文，这也是一种有趣的想法。

不过随着深度学习的进行，中文的读音目前也算是比较成熟了。

# ECDICT

## 数据格式

采用 CSV 文件存储所有词条数据，用 UTF-8 进行编码，用 Excel 的话，别直接打开，否则编码是错的。

在 Excel 里选择数据，来自文本，然后设定逗号分割，UTF-8 编码即可。

| 字段        | 解释                                                       |
| ----------- | ---------------------------------------------------------- |
| word        | 单词名称                                                   |
| phonetic    | 音标，以英语英标为主                                       |
| definition  | 单词释义（英文），每行一个释义                             |
| translation | 单词释义（中文），每行一个释义                             |
| pos         | 词语位置，用 "/" 分割不同位置                              |
| collins     | 柯林斯星级                                                 |
| oxford      | 是否是牛津三千核心词汇                                     |
| tag         | 字符串标签：zk/中考，gk/高考，cet4/四级 等等标签，空格分割 |
| bnc         | 英国国家语料库词频顺序                                     |
| frq         | 当代语料库词频顺序                                         |
| exchange    | 时态复数等变换，使用 "/" 分割不同项目，见后面表格          |
| detail      | json 扩展信息，字典形式保存例句（待添加）                  |
| audio       | 读音音频 url （待添加）                                    |

## 词形变化

某个动词的各种时态是什么？某个形容词的比较级和最高级又是什么？某个名词的复数呢？这个单词是由哪个单词怎么演变而来的？它的原型单词（Lemma）是什么？

可能大家注意到上表有一个 `Exchange` 字段，它就是来做这个事情的，这是本词典一大特色之一，格式如下：

```text
类型1:变换单词1/类型2:变换单词2
```

比如 perceive 这个单词的 exchange 为：

```text
d:perceived/p:perceived/3:perceives/i:perceiving
```

意思是 perceive 的过去式（`p`） 为 perceived，过去分词（`d`）为 perceived, 现在分词（'i'）是 perceiving，第三人称单数（`3`）为 perceives。冒号前面具体项目为：

| 类型 | 说明                                                       |
| ---- | ---------------------------------------------------------- |
| p    | 过去式（did）                                              |
| d    | 过去分词（done）                                           |
| i    | 现在分词（doing）                                          |
| 3    | 第三人称单数（does）                                       |
| r    | 形容词比较级（-er）                                        |
| t    | 形容词最高级（-est）                                       |
| s    | 名词复数形式                                               |
| 0    | Lemma，如 perceived 的 Lemma 是 perceive                   |
| 1    | Lemma 的变换形式，比如 s 代表 apples 是其 lemma 的复数形式 |

这个是根据 BNC 语料库和 NodeBox / WordNet 的语言处理工具生成的，有了这个 Exchange ，你的 App 能为用户提供更多信息。

## 词干查询

这个词干不是背单词时候的词根，而是 lemma。每个单词有很多变体，你编写一个抓词软件抓到一个过去式的动词 gave，如果字典里面没有的话，就需要词干数据库来查询，把 gave 转变为 give，再查词典数据库。

我扫描了 BNC 语料库全部 1 亿个词条语料生成的 lemma.en.txt 就是用来做这个事情，stardict.py 中 LemmaDB 这个类就是用来加载该数据并进行分析的。

你或许希望统计某些文档的词频，然后针对性的学习，那么你需要先将文章中出现的词先转换成该词的原型（lemma），网上有很多算法做这个事情，但是都不靠谱，最靠谱的方式就是数据库直接查询，著名的拼写检查库 hunspell 库就是这么干的。

用 LemmaDB 类可以方便的查询 ['gave', 'taken', 'looked', 'teeth'] 的 lemma 是 ['give', 'take', 'look', 'tooth']，也可以查找 'take' 这个词的若干种变体。

这个 lemma.en.txt 涵盖了 BNC 所有语料的各种词汇变形，95%的情况下你可以查到你想要的，这个作为首选方法，查不到再去依靠各种算法（判断词尾 -ed，-ing 等），最可靠的是数据库，算法次之。

## 单词词性

数据库中有一个字段 pos，就是中文里面的词性，动词还是名词，英文叫做 [pos](https://www.nltk.org/book/ch05.html) ，句子中的位置。同样是扫描语料库生成的，比如：

fuse：pos = `n:46/v:54`

代表 fuse 这个词有两个位置（词性），n（名词）占比 46%，v（动词）占比 54%，根据后面的比例，你可以直到该词语在语料库里各个 pos 所出现的频率。

关于 pos 里各个字母的含义还可以看 [这里](http://www.natcorp.ox.ac.uk/tools/xaira_search.xml?ID=POS) 和 [这里](http://www.natcorp.ox.ac.uk/docs/c5spec.html)。

## 增强词典

[简明英汉字典增强版](https://github.com/skywind3000/ECDICT/wiki/%E7%AE%80%E6%98%8E%E8%8B%B1%E6%B1%89%E5%AD%97%E5%85%B8%E5%A2%9E%E5%BC%BA%E7%89%88)

# 字典处理

## 词干（lemma）

```
be/4109826 -> is,was,are,were,'s,been,being,'re,'m,am,m
have/1315648 -> had,has,'ve,having,'s,'d,d,ve
```

此处优化策略：

（1）词频也采用空格分隔

词频默认为3

（2）将替换词作为 key, 核心词干作为 value

### 处理后

处理之后

```
zorils zoril 3
zoris zori 3
```

## 词根 (word root)

暂时可以不引入

## 近义词 (resemble)

```
% quite, rather, pretty, fairly
这组词都有“相当，颇”的意思，其区别是：
- quite: 含义比fairly稍强，与不定冠词连用时，一般放在不定冠词之前。
- rather: 语气比quite强，褒意贬意无可使用。可与too和比较级连用。
- pretty: 用法与rather相似。常用于非正式文体。
- fairly: 语意最弱，多用于褒义，表示适度地、尚可的意思。不可与too或比较级连用。
```

### 处理后

- 近义词

```
相当，颇 quite,rather,pretty,fairly
```

- 近义词描述

```
quite 含义比fairly稍强，与不定冠词连用时，一般放在不定冠词之前。
rather 语气比quite强，褒意贬意无可使用。可与too和比较级连用。
pretty 用法与rather相似。常用于非正式文体。
fairly 语意最弱，多用于褒义，表示适度地、尚可的意思。不可与too或比较级连用。
```

## 标准版 dict

共计 70M 左右。

基于 csv 实现，可以使用个人实现的 [csv](https://github.com/houbb/csv)

## 完整版 dict

这个目前较大，暂时不引入。

# 拓展阅读

[ChaZD 查字典，简洁易用的英汉字典Chrome扩展程序，支持划词哦:)](https://github.com/ververcpp/ChaZD)

[vscode插件, 实现离线英汉词典功能](https://github.com/program-in-chinese/vscode_english_chinese_dictionary)

[English-Chinese & Chinese-English Wechat Mini Program 英汉汉英词典小程序](https://github.com/AntiSomnus/iDict-weapp)

[绝对有趣的中文发音引擎 funny chinese text to speech enginee](https://github.com/tinyfool/ChineseWithEnglish)

[程序员工作中常见的英语词汇](https://github.com/Wei-Xia/most-frequent-technology-english-words)

[提升英文水平的技巧](https://byoungd.gitbook.io/english-level-up-tips/)

[有道词典的命令行版本，支持英汉互查和在线查询。](https://github.com/ChestnutHeng/Wudao-dict)

* any list
{:toc}