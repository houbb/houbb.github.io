---
layout: post
title:  java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！
date:  2018-08-11 09:44:54 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 简单的需求

临近下班，小明忙完了今天的任务，正准备下班回家。

一条消息闪烁了起来。

“最近发现公众号的拼写检查功能不错，帮助用户发现错别字，体验不错。给我们系统也做一个。”

看着这条消息，小明在内心默默问候了一句。

“我 TND 的会做这个，就直接去人家总部上班了，在这受你的气。”

“好的”，小明回复到，“我先看看”

今天，天王老子来了我也得下班，耶稣也留不住。

![耶稣也留不住](https://img-blog.csdnimg.cn/img_convert/0b086f21b5c6c6050d36ea5352fc1731.png#pic_center)

小明想着，就回家了。

# 冷静分析

说到这个拼写检查，小明其实是知道的。

自己没吃过猪肉，还是见过猪跑的。

平时看过一些公众号大佬分享，说是公众号推出了拼写检查功能，以后再也不会有错别字了。

后来，小明还是在他们的文章中看到了不少错别字。后来，就没有后来了。

为什么不去问一问万能的 github 呢？

小明打开了 github 发现好像没有成熟的 java 相关的开源项目，有的几颗星，用起来不太放心。

估计 NLP 是搞 python 的比较多吧，java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！

小明默默地点起了一根华子……

窗外的夜色如水，不禁陷入了沉思，我来自何方？去往何处？人生的意义又是什么？

![哲学三问](https://img-blog.csdnimg.cn/img_convert/5b95d65ea97cc01452cbd988150ce484.png#pic_center)

尚有余热的烟灰落在了小明某东买的拖鞋上，把他脑海中脱缰的野马烫的一机灵。

没有任何思路，没有任何头绪，还是先洗洗睡吧。

那一夜，小明做了一个长长的美梦。梦里没有任何的错别字，所有的字句都坐落在正确的位置上……

# 转机

第二天，小明打开了搜索框，输入 spelling correct。

可喜的是，找到了一篇英文拼写纠正算法讲解。

吾尝终日而思矣，不如须臾之所学也。小明叹了一句，就看了起来。

## 算法思路

英文单词主要有 26 个英文字母组成，所以拼写的时候可能出现错误。

首先可以获取正确的英文单词，节选如下：

```
apple,16192
applecart,41
applecarts,1
appledrain,1
appledrains,1
applejack,571
applejacks,4
appleringie,1
appleringies,1
apples,5914
applesauce,378
applesauces,1
applet,2
```

每一行用逗号分隔，后面是这个单词出现的频率。

以用户输入 `appl` 的为例，如果这个单词不存在，则可以对其进行 insert/delete/replace 等操作，找到最接近的单词。（本质上就是找到编辑距离最小的单词）

如果输入的单词存在，则说明正确，不用处理。

![英文单词](https://img-blog.csdnimg.cn/img_convert/b41ef10791ebec553d626fae05a3f114.png#pic_center)

## 词库的获取

那么英文词库去哪里获得呢？

小明想了想，于是去各个地方查了一圈，最后找到了一个比较完善的英文单词频率词库，共计 27W+ 的单词。

节选如下：

```
aa,1831
aah,45774
aahed,1
aahing,30
aahs,23
...
zythums,1
zyzzyva,2
zyzzyvas,1
zzz,76
zzzs,2
```

## 核心代码

获取用户当前输入的所有可能情况，核心代码如下：

```java
/**
 * 构建出当前单词的所有可能错误情况
 *
 * @param word 输入单词
 * @return 返回结果
 * @since 0.0.1
 * @author 老马啸西风
 */
private List<String> edits(String word) {
    List<String> result = new LinkedList<>();
    for (int i = 0; i < word.length(); ++i) {
        result.add(word.substring(0, i) + word.substring(i + 1));
    }
    for (int i = 0; i < word.length() - 1; ++i) {
        result.add(word.substring(0, i) + word.substring(i + 1, i + 2) + word.substring(i, i + 1) + word.substring(i + 2));
    }
    for (int i = 0; i < word.length(); ++i) {
        for (char c = 'a'; c <= 'z'; ++c) {
            result.add(word.substring(0, i) + c + word.substring(i + 1));
        }
    }
    for (int i = 0; i <= word.length(); ++i) {
        for (char c = 'a'; c <= 'z'; ++c) {
            result.add(word.substring(0, i) + c + word.substring(i));
        }
    }
    return result;
}
```

然后和词库中正确的单词进行对比：

```java
List<String> options = edits(formatWord);
List<CandidateDto> candidateDtos = new LinkedList<>();
for (String option : options) {
    if (wordDataMap.containsKey(option)) {
        CandidateDto dto = CandidateDto.builder()
                .word(option).count(wordDataMap.get(option)).build();
        candidateDtos.add(dto);
    }
}
```

最后返回的结果，需要根据单词出现的频率进行对比，整体来说还是比较简单的。

# 中文拼写

## 失之毫厘

中文的拼写初看起来和英文差不多，但是中文有个很特殊的地方。

因为所有的汉字拼写本身都是固定的，用户在输入的时候不存在错字，只存在别字。

单独说一个字是别字是毫无意义的，必须要有词，或者上下文。

这一点就让纠正的难度上升了很多。

小明无奈的摇了摇头，中华文化，博大精深。

## 算法思路

针对中文别字的纠正，方式比较多：

（1）困惑集。

比如常用的别字，`万变不离其宗` 错写为 `万变不离其中`。

（2）N-Gram

也就是一次字对应的上下文，使用比较广泛的是 2-gram。对应的语料，sougou 实验室是有的。

也就是当第一个词固定，第二次出现的会有对应的概率，概率越高的，肯定越可能是用户本意想要输入的。

比如 `跑的飞快`，实际上 `跑地飞快` 可能才是正确的。

## 纠错

当然，中文还有一个难点就是，无法直接通过 insert/delete/replace 把一个字变成另一个字。

不过类似的，还是有许多方法：

（1）同音字/谐音字

（2）形近字

（3）同义词

（4）字词乱序、字词增删

![中文](https://img-blog.csdnimg.cn/img_convert/2821c394822f530184f9534d290342a1.png#pic_center)

## 算法实现

迫于实现的难度，小明选择了最简单的困惑集。

首先找到常见别字的字典，节选如下：

```
一丘之鹤 一丘之貉
一仍旧惯 一仍旧贯
一付中药 一服中药
...
黯然消魂 黯然销魂
鼎立相助 鼎力相助
鼓躁而进 鼓噪而进
龙盘虎据 龙盘虎踞
```

前面的是别字，后面的是正确用法。

以别字作为字典，然后对中文文本进行 fast-forward 分词，获取对应的正确形式。

当然一开始我们可以简单点，让用户固定输入一个词组，实现就是直接解析对应的 map 即可

```java
public List<String> correctList(String word, int limit, IWordCheckerContext context) {
    final Map<String, List<String>> wordData = context.wordData().correctData();
    // 判断是否错误
    if(isCorrect(word, context)) {
        return Collections.singletonList(word);
    }
    List<String> allList = wordData.get(word);
    final int minLimit = Math.min(allList.size(), limit);
    List<String> resultList = Guavas.newArrayList(minLimit);
    for(int i = 0; i < minLimit; i++) {
        resultList.add(allList.get(i));
    }
    return resultList;
}
```

# 中英文混合长文本

## 算法思路

实际的文章，一般是中英文混合的。

要想让用户使用起来更加方便，肯定不能每次只输入一个词组。

那要怎么办呢？

答案是分词，把输入的句子，分词为一个个词。然后区分中英文，进行对应的处理。

关于分词，推荐开源项目：

> [https://github.com/houbb/segment](https://github.com/houbb/segment)

## 算法实现

修正的核心算法，可以复用中英文的实现。

```java
@Override
public String correct(String text) {
    if(StringUtil.isEnglish(text)) {
        return text;
    }

    StringBuilder stringBuilder = new StringBuilder();
    final IWordCheckerContext zhContext = buildChineseContext();
    final IWordCheckerContext enContext = buildEnglishContext();

    // 第一步执行分词
    List<String> segments = commonSegment.segment(text);
    // 全部为真，才认为是正确。
    for(String segment : segments) {
        // 如果是英文
        if(StringUtil.isEnglish(segment)) {
            String correct = enWordChecker.correct(segment, enContext);
            stringBuilder.append(correct);
        } else if(StringUtil.isChinese(segment)) {
            String correct = zhWordChecker.correct(segment, zhContext);
            stringBuilder.append(correct);
        } else {
            // 其他忽略
            stringBuilder.append(segment);
        }
    }

    return stringBuilder.toString();
}
```

其中分词的默认实现如下：

```java
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.nlp.common.segment.ICommonSegment;
import com.github.houbb.nlp.common.segment.impl.CommonSegments;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 默认的混合分词，支持中文和英文。
 *
 * @author binbin.hou
 * @since 0.0.8
 */
public class DefaultSegment implements ICommonSegment {

    @Override
    public List<String> segment(String s) {
        //根据空格分隔
        List<String> strings = CommonSegments.defaults().segment(s);
        if(CollectionUtil.isEmpty(strings)) {
            return Collections.emptyList();
        }

        List<String> results = new ArrayList<>();
        ICommonSegment chineseSegment = InnerCommonSegments.defaultChinese();
        for(String text : strings) {
            // 进行中文分词
            List<String> segments = chineseSegment.segment(text);

            results.addAll(segments);
        }


        return results;
    }

}
```

首先是针对空格进行分词，然后对中文以困惑集的别字做 fast-forward 分词。

当然，这些说起来也不难。

真的实现起来还是比较麻烦的，小明把完整的实现已经开源：

> [https://github.com/houbb/word-checker](https://github.com/houbb/word-checker)

觉得有帮助的小伙伴可以 fork/star 一波~

# 快速开始

word-checker 用于单词拼写检查。支持英文单词拼写检测，和中文拼写检测。

话不多说，我们来直接体验一下这个工具类的使用体验。

## 特性说明

- 可以迅速判断当前单词是否拼写错误

- 可以返回最佳匹配结果

- 可以返回纠正匹配列表，支持指定返回列表的大小

- 错误提示支持 i18n

- 支持大小写、全角半角格式化处理

- 支持自定义词库

- 内置 27W+ 的英文词库

- 支持基本的中文拼写检测

# 快速开始

## maven 引入

```xml
<dependency>
     <groupId>com.github.houbb</groupId>
     <artifactId>word-checker</artifactId>
    <version>0.0.8</version>
</dependency>
```

## 测试案例

会根据输入，自动返回最佳纠正结果。

```java
final String speling = "speling";
Assert.assertEquals("spelling", EnWordCheckers.correct(speling));
```

# 核心 api 介绍

核心 api 在 `EnWordCheckers` 工具类下。

| 功能 | 方法 | 参数 | 返回值 | 备注 |
|:----|:----|:----|:---|:----|
| 判断单词拼写是否正确 | isCorrect(string) | 待检测的单词 | boolean | |
| 返回最佳纠正结果 | correct(string) | 待检测的单词 | String | 如果没有找到可以纠正的单词，则返回其本身 |
| 判断单词拼写是否正确 | correctList(string) | 待检测的单词 | List<String> | 返回所有匹配的纠正列表 |
| 判断单词拼写是否正确 | correctList(string, int limit) | 待检测的单词, 返回列表的大小 | 返回指定大小的的纠正列表 | 列表大小 <= limit |

## 测试例子

> 参见 [EnWordCheckerTest.java](https://github.com/houbb/word-checker/tree/master/src/test/java/com/github/houbb/word/checker/util/EnWordCheckersTest.java)

## 是否拼写正确

```java
final String hello = "hello";
final String speling = "speling";
Assert.assertTrue(EnWordCheckers.isCorrect(hello));
Assert.assertFalse(EnWordCheckers.isCorrect(speling));
```

## 返回最佳匹配结果

```java
final String hello = "hello";
final String speling = "speling";
Assert.assertEquals("hello", EnWordCheckers.correct(hello));
Assert.assertEquals("spelling", EnWordCheckers.correct(speling));
```

## 默认纠正匹配列表

```java
final String word = "goox";
List<String> stringList = EnWordCheckers.correctList(word);
Assert.assertEquals("[good, goo, goon, goof, gook, goop, goos, gox, goog, gool, goor]", stringList.toString());
```

## 指定纠正匹配列表大小

```java
final String word = "goox";
final int limit = 2;
List<String> stringList = EnWordCheckers.correctList(word, limit);
Assert.assertEquals("[good, goo]", stringList.toString());
```

# 中文拼写纠正

## 核心 api

为降低学习成本，核心 api 和 `ZhWordCheckers` 中，和英文拼写检测保持一致。

## 是否拼写正确

```java
final String right = "正确";
final String error = "万变不离其中";

Assert.assertTrue(ZhWordCheckers.isCorrect(right));
Assert.assertFalse(ZhWordCheckers.isCorrect(error));
```

## 返回最佳匹配结果

```java
final String right = "正确";
final String error = "万变不离其中";

Assert.assertEquals("正确", ZhWordCheckers.correct(right));
Assert.assertEquals("万变不离其宗", ZhWordCheckers.correct(error));
```

## 默认纠正匹配列表

```java
final String word = "万变不离其中";

List<String> stringList = ZhWordCheckers.correctList(word);
Assert.assertEquals("[万变不离其宗]", stringList.toString());
```

## 指定纠正匹配列表大小

```java
final String word = "万变不离其中";
final int limit = 1;

List<String> stringList = ZhWordCheckers.correctList(word, limit);
Assert.assertEquals("[万变不离其宗]", stringList.toString());
```

# 长文本中英文混合

## 情景

实际拼写纠正的话，最佳的使用体验是用户输入一个长文本，并且可能是中英文混合的。

然后实现上述对应的功能。

## 核心方法

`WordCheckers` 工具类提供了长文本中英文混合的自动纠正功能。

| 功能 | 方法 | 参数 | 返回值 | 备注 |
|:----|:----|:----|:---|:----|
| 文本拼写是否正确 | isCorrect(string) | 待检测的文本 | boolean | 全部正确，才会返回 true |
| 返回最佳纠正结果 | correct(string) | 待检测的单词 | String | 如果没有找到可以纠正的文本，则返回其本身 |
| 判断文本拼写是否正确 | correctMap(string) | 待检测的单词 | `Map<String, List<String>>` | 返回所有匹配的纠正列表 |
| 判断文本拼写是否正确 | correctMap(string, int limit) | 待检测的文本, 返回列表的大小 | 返回指定大小的的纠正列表 | 列表大小 <= limit |

### 拼写是否正确

```java
final String hello = "hello 你好";
final String speling = "speling 你好 以毒功毒";
Assert.assertTrue(WordCheckers.isCorrect(hello));
Assert.assertFalse(WordCheckers.isCorrect(speling));
```

### 返回最佳纠正结果

```java
final String hello = "hello 你好";
final String speling = "speling 你好以毒功毒";
Assert.assertEquals("hello 你好", WordCheckers.correct(hello));
Assert.assertEquals("spelling 你好以毒攻毒", WordCheckers.correct(speling));
```

### 判断文本拼写是否正确

每一个词，对应的纠正结果。

```java
final String hello = "hello 你好";
final String speling = "speling 你好以毒功毒";
Assert.assertEquals("{hello=[hello],  =[ ], 你=[你], 好=[好]}", WordCheckers.correctMap(hello).toString());
Assert.assertEquals("{ =[ ], speling=[spelling, spewing, sperling, seeling, spieling, spiling, speeling, speiling, spelding], 你=[你], 好=[好], 以毒功毒=[以毒攻毒]}", WordCheckers.correctMap(speling).toString());
```

### 判断文本拼写是否正确

同上，指定最多返回的个数。

```java
final String hello = "hello 你好";
final String speling = "speling 你好以毒功毒";

Assert.assertEquals("{hello=[hello],  =[ ], 你=[你], 好=[好]}", WordCheckers.correctMap(hello, 2).toString());
Assert.assertEquals("{ =[ ], speling=[spelling, spewing], 你=[你], 好=[好], 以毒功毒=[以毒攻毒]}", WordCheckers.correctMap(speling, 2).toString());
```

# 格式化处理

有时候用户的输入是各式各样的，本工具支持对于格式化的处理。

## 大小写

大写会被统一格式化为小写。

```java
final String word = "stRing";

Assert.assertTrue(EnWordCheckers.isCorrect(word));
```

## 全角半角

全角会被统一格式化为半角。

```java
final String word = "stｒing";

Assert.assertTrue(EnWordCheckers.isCorrect(word));
```

# 自定义英文词库

## 文件配置

你可以在项目资源目录创建文件 `resources/data/define_word_checker_en.txt`

内容如下：

```
my-long-long-define-word,2
my-long-long-define-word-two
```

不同的词独立一行。

每一行第一列代表单词，第二列代表出现的次数，二者用逗号 `,` 隔开。

次数越大，在纠正的时候返回优先级就越高，默认值为 1。

用户自定义的词库优先级高于系统内置词库。

## 测试代码

我们在指定了对应的单词之后，拼写检测的时候就会生效。

```java
final String word = "my-long-long-define-word";
final String word2 = "my-long-long-define-word-two";

Assert.assertTrue(EnWordCheckers.isCorrect(word));
Assert.assertTrue(EnWordCheckers.isCorrect(word2));
```

# 自定义中文词库

## 文件配置

你可以在项目资源目录创建文件 `resources/data/define_word_checker_zh.txt`

内容如下：

```
默守成规 墨守成规
```

使用英文空格分隔，前面是错误，后面是正确。

# 小结

中英文拼写的纠正一直是比较热门，也比较难的话题。

近些年，因为 NLP 和人工智能的进步，在商业上的应用也逐渐成功。

本次主要实现是基于传统的算法，核心在词库。

# 后续

在经历了几天的努力之后，小明终于完成了一个最简单的拼写检查工具。

“上次和我说的公众号的拼写检查功能还要吗？”

“不要了，你不说我都忘记了。”，产品显得有些惊讶。"那个需求做不做也无所谓，我们最近挤压了一堆业务需求，你优先看看。"

“……”

"我最近又看到 xxx 上有一个功能也非常不错，你给我们系统也做一个。"

“……”

* any list
{:toc}