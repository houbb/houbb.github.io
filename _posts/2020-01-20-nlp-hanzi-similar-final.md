---
layout: post
title:  NLP 开源形近字算法补完计划（完结篇）
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, ml, ai, sh]
published: true
---

# 前言

所有的故事都有开始，也终将结束。

本文将作为 NLP 汉字相似度的完结篇，为该系列画上一个句号。

[起-NLP 中文形近字相似度计算思路](https://mp.weixin.qq.com/s/i3h_15kYRb89MsApZ5nwPQ)

[承-中文形近字相似度算法实现，为汉字 NLP 尽一点绵薄之力](https://mp.weixin.qq.com/s/pDt3R04-XWKSvo1hJpTSDg)

[转-当代中国最贵的汉字是什么？](https://mp.weixin.qq.com/s/SETYeJchvWuqicrHLgG2mQ)

# 不足之处

之所以有本篇，是因为上一次的算法实现存在一些不足。

## 巴别塔

《圣经》中有关于巴别塔建造，最终人们因为语言问题而停工的故事​。

![巴别塔](https://img-blog.csdnimg.cn/ea4965b89e594ab1b8f354e1f7a8b455.jpg)

```
创11:6　“看哪！他们成为一样的人民，都是一样的言语，如今既作起这事来，以后他们所要作的事，就没有不成就的了。

创11:7　我们下去，在那里变乱他们的口音，使他们的言语彼此不通。”

创11:8　于是，耶和华使他们从那里分散在全地上；他们就停工不造那城了。
```

为了避免语言问题，我一开始就实现了一个 exe4j 打包的对比程序，自己跑的很顺畅。

小伙伴一跑，运行失败。各种环境配置一顿操作，最后还是报错。

于是，我写了一个 python 简易版本，便于做 NLP 研究的小伙伴们学习。

> [https://github.com/houbb/nlp-hanzi-similar/releases/tag/pythn](https://github.com/houbb/nlp-hanzi-similar/releases/tag/pythn)

java 是一种语言，python 是一种语言。

**编程语言，让人和机器之间可以沟通，却让人与人之间产生了隔阂。**

## 拆字

在 [当代中国最贵的汉字是什么？](https://mp.weixin.qq.com/s/SETYeJchvWuqicrHLgG2mQ) 一文中，我们首次说明了汉字的拆合。

汉字的拆分实现，核心目的之一就是为了完善汉字的相似度比较。

通过对比汉字的拆分部分，然后获取拆字的相似度，提高对比的准确性。

# 拆字相似度

## 简单的需求

为了便于小伙伴们理解，我们用产品经理的思维和大家介绍一下实现方式。

```
我的需求比较简单。

你看，【明】可以拆分【日】【月】，【冐】也可以拆分为【日】【月】。对比一下，结果是显然的。

怎么实现我不管，明天上线吧。
```

小伙伴们，应该已经知道怎么实现了吧？

![简单](https://img-blog.csdnimg.cn/1a7d5a85bab1472aaef68fb3bac14008.jpg)

## 使用体验

诚如产品所言，这个需求已经实现。

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>nlp-hanzi-similar</artifactId>
    <version>1.2.0</version>
</dependency>
```

### 使用

```java
double rate1 = HanziSimilarHelper.similar('末', '未');
```

对应的结果为：0.9696969696969697

更多使用细节，参考开源地址：

> [https://github.com/houbb/nlp-hanzi-similar](https://github.com/houbb/nlp-hanzi-similar)

# 写在完结前

## 涉及的项目

汉字的相似度计算到这里算是告一段落。

主要涉及的资料及项目有：

[拼音](https://github.com/houbb/pinyin)

[拆字](https://mp.weixin.qq.com/s/SETYeJchvWuqicrHLgG2mQ)

[四角编码词库](https://github.com/houbb/nlp-hanzi-similar/blob/master/src/main/resources/nlp/sijiaobianma_2w.txt)

[汉字结构词库](https://github.com/houbb/nlp-hanzi-similar/blob/master/src/main/resources/nlp/hanzijiegou_2w.txt)

[汉字偏旁词库](https://github.com/houbb/nlp-hanzi-similar/blob/master/src/main/resources/nlp/pianpangbushou_2w.txt)

[笔画数词库](https://github.com/houbb/nlp-hanzi-similar/blob/master/src/main/resources/nlp/bihuashu_2w.txt)

当然，还可以结果 [opencc4j](https://github.com/houbb/opencc4j) 进行繁简体的处理，此处不再延伸。

## 之后的计划

NLP 的领域还有很多东西需要大家攻克，毕竟中文 NLP 才刚刚开始。

**技术尚未成功，同志仍需努力。**

据说最近鹅城的某位黄老爷惹得大家怨声载道。

很多小伙伴说，如果有一款软件可以实现【月丷夫马言卂彳山兀攴人言】的沟通功能，那么我肯定会用。

所谓说者无心，听者有意。

写一个通讯软件，主要是为了巩固下 netty 的学习，其他的都不重要。

![没有你，对我很重要](https://img-blog.csdnimg.cn/5e3b96d8a881491cbed7d4271bee52bb.png)

虽然知道就算有，大家肯定也不太会改变，但是老马还是准备试试。

# java 实现思路

警告，如果你头发已经所剩无几，或者对实现并不感兴趣。

那么就可以收藏+点赞+评论【不明觉厉】，然后离开了。

下面是枯燥的代码实现环节。

![轻松](https://img-blog.csdnimg.cn/bc7c49ddbea74024a1026dd319d0ac7e.jpg)

## 程序员的思维

下面是程序员的思维。

首先要解决几个问题：

（1）汉字的拆分实现

这个直接复用已经实现的汉字拆分实现。

```java
List<String> stringList = ChaiziHelper.chai(charWord.charAt(0));
```

相同的一个汉字可以有多种拆分方式，简单起见，我们默认取第一个。

（2）相似的比较

假设我们对比 A B 两个汉字，可以拆分为如下的子集。

A = {A1, A2, ..., Am}

B = {B1, B2, ..., Bm}

```java
/**
 * 获取拆分后对应的拆分字符
 * @param charWord 字符
 * @return 结果
 */
private char[] getSplitChars(String charWord) {
    List<String> stringList = ChaiziHelper.chai(charWord.charAt(0));

    // 这里应该选择哪一个是有讲究的。此处为了简单，默认选择第一个。
    String string = stringList.get(0);
    return string.toCharArray();
}
```

拆分后的子集对比有多种实现方式，简单起见，我们直接遍历元素，判断另一个子集是否存在。

当然，遍历的时候要以拆分数量较少的的为基准。

```java
int minLen = Math.min(charsOne.length, charsTwo.length);

// 比较
double totalScore = 0.0;
for(int i = 0; i <  minLen; i++) {
    char iChar = charsOne[i];
    String textChar = iChar+"";
    if(ArrayPrimitiveUtil.contains(charsTwo, iChar)) {
        //累加分数
    }
}
```

（3）拆分子集的权重

比如 `一` `月` 两个汉字都是子集，但是因为笔画数不同，权重也不同。

我们用一个子集的笔画数占整体汉字的笔画数计算权重。

```java
 int textNumber = getNumber(textChar, similarContext);

double scoreOne = textNumber*1.0 / numberOne * 1.0;
double scoreTwo = textNumber*1.0 / numberTwo * 1.0;

totalScore += (scoreOne + scoreTwo) / 2.0;
```

ps: 这里的除以 2,是为了归一化。保证最后的结果在 0-1 之间。

（4）笔画数

获取笔画数的方式，我们可以直接复用以前的方法。

如果没有匹配的，默认笔画数为 1。

```java
private int getNumber(String text, IHanziSimilarContext similarContext) {
    Map<String, Integer> map = similarContext.bihuashuData().dataMap();
    Integer number = map.get(text);
    if(number == null) {
        return 1;
    }
    return number;
}
```

## java 完整实现

我们把所有的碎片拼接起来，就得到一个完整的实现。

```java
/**
 * 拆字
 *
 * @author 老马啸西风
 * @since 1.0.0
 */
public class ChaiziSimilar implements IHanziSimilar {

    @Override
    public double similar(IHanziSimilarContext similarContext) {
        String hanziOne = similarContext.charOne();
        String hanziTwo = similarContext.charTwo();

        int numberOne = getNumber(hanziOne, similarContext);
        int numberTwo = getNumber(hanziTwo, similarContext);

        // 拆分
        char[] charsOne = getSplitChars(hanziOne);
        char[] charsTwo = getSplitChars(hanziTwo);

        int minLen = Math.min(charsOne.length, charsTwo.length);

        // 比较
        double totalScore = 0.0;
        for(int i = 0; i <  minLen; i++) {
            char iChar = charsOne[i];
            String textChar = iChar+"";
            if(ArrayPrimitiveUtil.contains(charsTwo, iChar)) {
                int textNumber = getNumber(textChar, similarContext);

                double scoreOne = textNumber*1.0 / numberOne * 1.0;
                double scoreTwo = textNumber*1.0 / numberTwo * 1.0;

                totalScore += (scoreOne + scoreTwo) / 2.0;
            }
        }

        return totalScore * similarContext.chaiziRate();
    }

    /**
     * 获取拆分后对应的拆分字符
     * @param charWord 字符
     * @return 结果
     */
    private char[] getSplitChars(String charWord) {
        List<String> stringList = ChaiziHelper.chai(charWord.charAt(0));

        // 这里应该选择哪一个是有讲究的。此处为了简单，默认选择第一个。
        String string = stringList.get(0);

        return string.toCharArray();
    }

    /**
     * 获取笔画数
     * @param text 文本
     * @param similarContext 上下文
     * @return 结果
     */
    private int getNumber(String text, IHanziSimilarContext similarContext) {
        Map<String, Integer> map = similarContext.bihuashuData().dataMap();

        Integer number = map.get(text);
        if(number == null) {
            return 1;
        }

        return number;
    }

}
```

# 小结

本文引入了汉字拆字，进一步丰富了相似度的实现。

当然，实现本身依然有很多值得提升的地方，比如拆分后的选择，是否可以递归拆分等，这个还是留给后人研究吧。

我是老马，期待与你的下次重逢。

* any list
{:toc}