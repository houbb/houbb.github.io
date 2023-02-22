---
layout: post
title: NLP 中文人名生成器，性别识别实现思路
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 随机生成人名的原理

## 基本信息

所有的姓氏

男性名称

女性名称

单字

双字

诗词+各种古代文学+单字+词的解释。

## 随机

性 + 对应性别的候选词==》自动生成。

# 性别推测思路

## 数学

贝叶斯公式: `P(Y|X) = P(X|Y) * P(Y) / P(X)`

当X条件独立时, `P(X|Y) = P(X1|Y) * P(X2|Y) * ...`

应用到猜名字上

```
P(gender=男|name=本山) 
= P(name=本山|gender=男) * P(gender=男) / P(name=本山)
= P(name has 本|gender=男) * P(name has 山|gender=男) * P(gender=男) / P(name=本山)
```

## 计算方式

文件 charfreq.csv 是怎么来的?

预料库中里面有名字和性别, 2000w条, 统计一下得出

- 怎么算 `P(name has 本|gender=男)` ?

“本”在男性名字中出现的次数 / 男性字出现的总次数

- 怎么算 P(gender=男)?

男性名出现的次数 / 总次数

- 怎么算 P(name=本山)?

不用算, 在算概率的时候会互相约去

原因是对于男女而言，这个概率是一样的。所以直接忽略即可。

## 坑

```
>>> ngender.guess('李胜男')
('male', 0.851334658742)
```

虽然两个字都很偏男性，但是结合起来就是女性名

### 解决方案

对于特殊的信息，可以添加一个 N-gram，也就是贝叶斯。

如果是胜男之类的，直接优先级设置为女性。

# 姓名与五行八字

按八字和五格做名字测试，不一定真的就是准，不过它也是中国几千年的文化传承，宁可信其有不可信其无，只要测试出来分数不太低就行了。 

本代码的博客文章地址：http://www.crazyant.net/2076.html

## 主要流程

这是一个简单的爬虫。

大家可以打开http://life.httpcn.com/xingming.asp网站查看，这是一个POST表单，填写需要的参数，点提交，就会打开一个结果页面，结果页面的最下方包含了八字分数和五格分数。

如果想得到分数，就需要做两件事情，一是爬虫自动提交表单，获取结果页面；二是从结果页面提取分数；

对于第一件事情，很简单，urllib2即可实现（代码在/chinese-name-score/main/get_name_score.py）：

ps: 这可以不用爬虫，自己实现一套根据【出生年月】推断出【五行命格】。

然后结合缺什么，去指定名称。

## 评分

一个名字的生成的评分是多少？

这个要如何打分呢？

打分的原理是什么？

根据贝叶斯吗？

# 产品的设计

## 准备工作

1、GitHub下载 中文人名语料库 的数据。

2、将120万数据导入数据库，并将数据拆分成“姓名、姓、名字、单字人名用字、双字人名用字前、双字人名用字后”，然后分别统计字频。

3、由于badcase已经被我删除，这里出现的人名用字都是吉字、和中性字，可以放心使用。

4、通过字频，可以计算一个新词组的人名成词概率，给这个概率设置一个区间（拍脑袋就行），作为判断一个词组是不是人名的标准。

5、Unicode.org有一个汉字的库，里面有汉字的拼音、笔画、康熙部首；如果找不到就退而求其次，去爬汉典网的数据。

6、字意五行标记，金刀戈等属于金属、或兵器的部首，属金，其他类推。

7、释义，可以先用汉典或萌典的数据。

8、性别标记，库里有，或自己重新计算。

9、成语5万个，库里有；诗词，自己去找，GitHub上有很多。自己匹配。

## 可能的问题

1、人名成词概率高，但是他可能也是一个地名，如杨萌路、杨庄。

2、人名成词概率高，但是他可能也是一个机构名/机构简写/品牌名，如范思哲、谭木匠。

3、人名成词概率高，但是他可能也是一个常用词，如高原、金星。

4、你以为他是个繁体字，其实他只是按规定不做类推简化，也就是得把他当做简体字处理。

5、他是繁体也有简化字，但是你的字符集只支持cjk基础汉字20902字，而这个简化字刚好在基础集之外: ) ，最后还得当他简体字处理。

# Github 参考资料

[Chinese-Names-Corpus-人名基本语料库](https://github.com/wainshine/Chinese-Names-Corpus)

[ngender-性别推测](https://github.com/observerss/ngender)

[chinese-name-gender-analyse-性别相关性分析](https://github.com/cyy0523xc/chinese-name-gender-analyse)

[java-testdata-generator-姓名自动生成](https://github.com/binarywang/java-testdata-generator)

[随机名称实现](https://github.com/Donghaopeng/robotframework-RandomName/blob/master/random_name.py)

[如何做一个取名产品](https://github.com/wainshine/Chinese-Names-Corpus/issues/23)

[怎样借助Python爬虫给宝宝起个好名字](http://www.crazyant.net/2076.html)

## 风水

[易经-风水八卦](https://github.com/vandh/yijing)

* any list
{:toc}