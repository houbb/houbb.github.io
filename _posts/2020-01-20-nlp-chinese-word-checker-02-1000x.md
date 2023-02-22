---
layout: post
title:  一个提升英文单词拼写检测性能 1000 倍的算法？
date:  2018-08-11 09:44:54 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 序言

小明同学上一次在产品经理的忽悠下，写好了一个中英文拼写纠正工具：[https://github.com/houbb/word-checker](https://github.com/houbb/word-checker/blob/master/README_ZH.md)。

本来以为可以一劳永逸了，直到昨天闲来无事，发现了另一个开源项目，描述简要如下：

```
Spelling correction & Fuzzy search: 1 million times faster through Symmetric Delete spelling correction algorithm

The Symmetric Delete spelling correction algorithm reduces the complexity of edit candidate generation and dictionary lookup for a given Damerau-Levenshtein distance. 

It is six orders of magnitude faster (than the standard approach with deletes + transposes + replaces + inserts) and language independent.
```

小明以为自己眼睛花了，100W 倍，这牛吹得厉害了。

![吹牛](https://img-blog.csdnimg.cn/73d09f2fe5124f878f83c9a72f0a2a20.jpg)

秉着不信谣，不传谣的原则，小明开始了算法的学习之旅。

# 单词拼写算法思路

针对英文单词拼写，有下面几种算法：

## 实时计算编辑距离

给定两个字符串 $s_1$ 和 $s_2$，它们之间的编辑距离是将 $s_1$ 转换为 $s_2$ 所需的最小编辑操作次数。

最常见的，为此目的所允许的编辑操作是： (i) 在字符串中插入一个字符； (ii) 从字符串中删除一个字符和 (iii) 用另一个字符替换字符串中的一个字符；对于这些操作，编辑距离有时称为 Levenshtein 距离。

这种算法是最容易想到的，但是实时计算的代价非常昂贵。一般不作为工业实现。

## Peter Norvig 的拼写算法

从查询词生成具有编辑距离（删除 + 转置 + 替换 + 插入）的所有可能词，并在字典中搜索它们。 

对于长度为n的单词，字母大小为a，编辑距离d=1，会有n次删除，n-1次换位，`a*n` 次改变，`a*(n+1)` 次插入，总共2n次 搜索时 `2n+2an+a-1` 个词。

这种算法就是小明一开始选择的算法，性能比上一个算法要好很多。

但在搜索时仍然很昂贵（n=9、a=36、d=2 的 114,324 个术语）和语言相关（因为字母表用于生成术语，这在许多方面都不同）。

### 性能提升的一种思路

如果让小明来提升这个算法，那有一个思路就是用空间换时间。

把一个正确单词的删除 + 转置 + 替换 + 插入提前全部生成好，然后插入到字典中。

但是这里存在一个很大的问题，这个预处理生成的字典数太大了，有些不能接受。

那么，世间安得双全法？

![鱼和熊掌](https://img-blog.csdnimg.cn/2a37152a0dd7451aa5a4263715a3e7ee.jpg)

让我们一起来看一下本篇的主角。

# 对称删除拼写纠正（SymSpell）

## 算法描述

从每个字典术语生成具有编辑距离（仅删除）的术语，并将它们与原始术语一起添加到字典中。 

这必须在预计算步骤中仅执行一次。

生成与输入术语具有编辑距离（仅删除）的术语并在字典中搜索它们。

对于长度为 n 的单词、字母大小为 a、编辑距离为 1 的单词，将只有 n 个删除，在搜索时总共有 n 个术语。

这种方法的代价是每个原始字典条目x次删除的预计算时间和存储空间，这在大多数情况下是可以接受的。

单个字典条目的删除次数 x 取决于最大编辑距离。

> 对称删除拼写校正算法通过仅使用删除而不是删除 + 转置 + 替换 + 插入来降低编辑候选生成和字典查找的复杂性。 它快了六个数量级（编辑距离=3）并且与语言无关。

## 一些备注

为了便于大家理解，原作者还写了一点备注。

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

我们可以生成与查询词条编辑距离 < 2 的所有词条（试图扭转查询词条错误）并根据所有字典词条检查它们，

我们可以生成与每个字典术语的编辑距离 < 2 的所有术语（尝试创建查询术语错误），并根据它们检查查询术语。

通过将正确的字典术语转换为错误的字符串，并将错误的输入术语转换为正确的字符串，我们可以将两者结合起来并在中间相遇。

**因为在字典上添加一个字符相当于从输入字符串中删除一个字符，反之亦然，所以我们可以在两边都限制转换为仅删除。**

### 例子

这一段读的让小明有些云里雾里，于是这里举一个例子，便于大家理解。

比如用户输入的是：goox

正确的词库只有：good

对应的编辑距离为 1。

那么通过删除，good 预处理存储就会变成：{good = good, ood=good;  god=good; goo=good;}

判断用户输入的时候：

（1）goox 不存在

（2）对 goox 进行删除操作

oox  gox  goo

可以找到 goo 对应的是 good。

读到这里，小伙伴肯定已经发现了这个算法的巧妙之处。

![妙](https://img-blog.csdnimg.cn/2a8157e06f35459bbbb929dad31ec94b.jpg)

通过对原有字典的删除处理，实际上基本已经达到了原来算法中 删除+添加+修改 的效果。

## 编辑距离

我们正在使用变体 3，因为仅删除转换与语言无关，并且成本低三个数量级。

速度从何而来？

预计算，即生成可能的拼写错误变体（仅删除）并在索引时存储它们是第一个前提条件。

通过使用平均搜索时间复杂度为 O(1) 的哈希表在搜索时进行快速索引访问是第二个前提条件。

但是，只有在此之上的对称删除拼写纠正才能将这种 O(1) 速度带到拼写检查中，因为它可以极大地减少要预先计算（生成和索引）的拼写错误候选者的数量。

将预计算应用于 Norvig 的方法是不可行的，因为预计算所有可能的删除 + 转置 + 替换 + 插入所有术语的候选将导致巨大的时间和空间消耗。

## 计算复杂度

SymSpell 算法是常数时间（O(1) 时间），即独立于字典大小（但取决于平均术语长度和最大编辑距离），因为我们的索引基于具有平均搜索时间复杂度的哈希表 的 O(1)。

# 代码实现

光说不练假把式。

看完之后，小明就连夜把自己原来的算法实现进行了调整。

## 词库预处理

以前针对下面的词库：

```
the,23135851162
of,13151942776
and,12997637966
```

只需要构建一个单词，和对应的频率 freqMap 即可。

现在我们需要对单词进行编辑距离=1的删除操作：

```java
/**
 * 对称删除拼写纠正词库
 * <p>
 * 1. 如果单词长度小于1，则不作处理。
 * 2. 对单词的长度减去1，依次移除一个字母，把余下的部分作为 key，
 * value 是一个原始的 CandidateDto 列表。
 * 3. 如何去重比较优雅？
 * 4. 如何排序比较优雅？
 * <p>
 * 如果不考虑自定义词库，是可以直接把词库预处理好的，但是只是减少了初始化的时间，意义不大。
 *
 * @param freqMap    频率 Map
 * @param resultsMap 结果 map
 * @since 0.1.0
 */
static synchronized void initSymSpellMap(Map<String, Long> freqMap,
                                         Map<String, List<CandidateDto>> resultsMap) {
    if (MapUtil.isEmpty(freqMap)) {
        return;
    }

    for (Map.Entry<String, Long> entry : freqMap.entrySet()) {
        String key = entry.getKey();
        Long count = entry.getValue();
        // 长度判断
        int len = key.length();
        // 后续可以根据编辑距离进行调整
        if (len <= 1) {
            continue;
        }
        char[] chars = key.toCharArray();
        Set<String> tempSet = new HashSet<>(chars.length);
        for (int i = 0; i < chars.length; i++) {
            String text = buildString(chars, i);
            // 跳过重复的单词
            if (tempSet.contains(text)) {
                continue;
            }
            List<CandidateDto> candidateDtos = resultsMap.get(text);
            if (candidateDtos == null) {
                candidateDtos = new ArrayList<>();
            }
            // 把原始的 key 作为值
            candidateDtos.add(new CandidateDto(key, count));
            // 删减后的文本作为 key
            resultsMap.put(text, candidateDtos);
            tempSet.add(text);
        }
    }
    // 统一排序
    for (Map.Entry<String, List<CandidateDto>> entry : resultsMap.entrySet()) {
        String key = entry.getKey();
        List<CandidateDto> list = entry.getValue();
        if (list.size() > 1) {
            // 排序
            Collections.sort(list);
            resultsMap.put(key, list);
        }
    }
}
```

其中构建删除字符串的实现比较简单：

```java
/**
 * 构建字符串
 *
 * @param chars        字符数组
 * @param excludeIndex 排除的索引
 * @return 字符串
 * @since 0.1.0
 */
public static String buildString(char[] chars, int excludeIndex) {
    StringBuilder stringBuilder = new StringBuilder(chars.length - 1);
    for (int i = 0; i < chars.length; i++) {
        if (i == excludeIndex) {
            continue;
        }
        stringBuilder.append(chars[i]);
    }
    return stringBuilder.toString();
}
```

这里有几个点需要注意下：

（1）单词如果小于等于编辑距离，则不需要删除。因为就删除没了==

（2）要注意跳过重复的词。比如 good，删除的结果会有 2 个 god。

（3）统一排序，这个还是有必要的，可以提升实时查询时的性能。

当然，小明心想，如果词库是固定的，可以直接把预处理的词库也处理好，大大提升加载速度。

不过这个聊胜于无，影响不是很大。

## 核心算法的调整

核心算法获取备选列表，直接按照给定的 4 种情况查询即可。

freqData 正确字典的频率信息。

symSpellData 删除后字典的信息。

```java
/**
 * dictionary entry==input entry,
 * delete(dictionary entry,p1)==input entry  // 预处理
 * dictionary entry==delete(input entry,p2)
 * delete(dictionary entry,p1)==delete(input entry,p2)
 *
 * 为了性能考虑，这里做快速返回。后期可以考虑可以配置，暂时不做处理。
 *
 * @param word    单词
 * @param context 上下文
 * @return 结果
 * @since 0.1.0
 */
@Override
protected List<CandidateDto> getAllCandidateList(String word, IWordCheckerContext context) {
    IWordData wordData = context.wordData();
    Map<String, Long> freqData = wordData.freqData();
    Map<String, List<CandidateDto>> symSpellData = wordData.symSpellData();

    //0. 原始字典包含
    if (freqData.containsKey(word)) {
        // 返回原始信息
        CandidateDto dto = CandidateDto.of(word, freqData.get(word));
        return Collections.singletonList(dto);
    }
    // 如果长度为1
    if(word.length() <= 1) {
        CandidateDto dtoA = CandidateDto.of("a", 9081174698L);
        CandidateDto dtoI = CandidateDto.of("i", 3086225277L);
        return Arrays.asList(dtoA, dtoI);
    }

    List<CandidateDto> resultList = new ArrayList<>();
    //1. 对称删减包含输入的单词
    List<CandidateDto> symSpellList = symSpellData.get(word);
    if(CollectionUtil.isNotEmpty(symSpellList)) {
        resultList.addAll(symSpellList);
    }
    // 所有删减后的数组
    Set<String> subWordSet = InnerWordDataUtil.buildStringSet(word.toCharArray());
    //2. 输入单词删减后，在原始字典中存在。
    for(String subWord : subWordSet) {
        if(freqData.containsKey(subWord)) {
            CandidateDto dto = CandidateDto.of(subWord, freqData.get(subWord));
            resultList.add(dto);
        }
    }
    //3. 输入单词删减后，在对称删除字典存在。
    for(String subWord : subWordSet) {
        if(symSpellData.containsKey(subWord)) {
            resultList.addAll(symSpellData.get(subWord));
        }
    }
    if(CollectionUtil.isNotEmpty(resultList)) {
        return resultList;
    }

    //4. 执行替换和修改（递归调用一次）甚至也可以不做处理。
    // 为保证编辑距离为1，只考虑原始字典
    List<String> edits = edits(word);
    for(String edit : edits) {
        if(freqData.containsKey(edit)) {
            CandidateDto dto = CandidateDto.of(edit, freqData.get(edit));
            resultList.add(dto);
        }
    }
    return resultList;
}
```

有下面几点需要注意：

（1）如果原字典已经包含，则直接返回。说明是拼写正确。

（2）如果长度为1，则固定返回 I、a 即可。

（3）其他每一种场景，如果处于性能考虑的话，也可以快速返回。

你的服务器性能永远不可能提升 1000X 的配置，但是算法可以，但是工资不可以。

![发财](https://img-blog.csdnimg.cn/889d927870eb433986c77339a8bf3f17.jpg)

# 小结

好的算法，对程序的提升是非常显著的。

以后还是要持续学习。

文中的代码为了便于大家理解，做了大量精简，感兴趣的小伙伴可以自己去看源码：

> [https://github.com/houbb/word-checker](https://github.com/houbb/word-checker/blob/master/README_ZH.md)

我是老马，期待与你的下次重逢。

# 参考资料

[edit-distance-1.html](https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html)

[Peter Norvig: How to Write a Spelling Corrector.](http://norvig.com/spell-correct.html)

* any list
{:toc}