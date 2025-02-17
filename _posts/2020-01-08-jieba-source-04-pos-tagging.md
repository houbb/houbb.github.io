---
layout: post
title: jieba-fenci 04 结巴分词之词性标注实现思路 speechTagging segment
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, speech-tagging, sh]
published: true
---

# 拓展阅读

[DFA 算法详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [敏感词 sensitive-word](https://github.com/houbb/sensitive-word)

> [分词 segment](https://github.com/houbb/segment)

## 分词系列专题

[jieba-fenci 01 结巴分词原理讲解 segment](https://houbb.github.io/2020/01/08/jieba-source-01-overview)

[jieba-fenci 02 结巴分词原理讲解之数据归一化 segment](https://houbb.github.io/2020/01/08/jieba-source-02-normalize)

[jieba-fenci 03 结巴分词与繁简体转换 segment](https://houbb.github.io/2020/01/08/jieba-source-03-chinese-format)

[jieba-fenci 04 结巴分词之词性标注实现思路 speechTagging segment](https://houbb.github.io/2020/01/08/jieba-source-04-pos-tagging)

[jieba-fenci 05 结巴分词之简单聊一聊](https://houbb.github.io/2020/01/08/jieba-source-05-chat)


# 词性标注

词性标注的在分词之后进行标注，整体思路也不难：

（1）如果一个词只有一种词性，那么直接固定即可。

（2）如果一个词有多种词性，那么需要推断出最大概率的一种。

这个其实有些类似分词的时候做的事情，分词的过程中也是存在多种选择，然后选择概率最大的一种（当然那个是采用的动态规划）。

HMM 在分词的过程中主要针对的是未登录词。

动态规划用于计算最大概率的分词形式。

## 自己理解的核心流程

所以我在想词性标注是否也可以和分词采用类似的方式。

（1）进行分词

（2）对分词结果中只有单个词性的词直接标注，有多个选项的登录词设置为 multi，未登录的词设置为 unknown。

（3）multi 直接采用 n-gram 结合动态规划计算出最可能的词性。

2-gram 向前向后

（4）未登录的词采用 hmm 进行计算。

# 参考资料

```
# 词性说明
# 直接用了ansj_seg 的词性说明，感谢ansj
# 汉语文本词性标注标记集

# 1. 名词  (1个一类，7个二类，5个三类)
名词分为以下子类：
n 名词
nr 人名
nr1 汉语姓氏
nr2 汉语名字
nrj 日语人名
nrf 音译人名
ns 地名
nsf 音译地名
nt 机构团体名
nz 其它专名
nl 名词性惯用语
ng 名词性语素
nw 新词
# 2. 时间词(1个一类，1个二类)
t 时间词
tg 时间词性语素
# 3. 处所词(1个一类)
s 处所词
# 4. 方位词(1个一类)
f 方位词
# 5. 动词(1个一类，9个二类)
v 动词
vd 副动词
vn 名动词
vshi 动词“是”
vyou 动词“有”
vf 趋向动词
vx 形式动词
vi 不及物动词（内动词）
vl 动词性惯用语
vg 动词性语素
# 6. 形容词(1个一类，4个二类)
a 形容词
ad 副形词
an 名形词
ag 形容词性语素
al 形容词性惯用语
# 7. 区别词(1个一类，2个二类)
b 区别词
bl 区别词性惯用语
# 8. 状态词(1个一类)
z 状态词
# 9. 代词(1个一类，4个二类，6个三类)
r 代词
rr 人称代词
rz 指示代词
rzt 时间指示代词
rzs 处所指示代词
rzv 谓词性指示代词
ry 疑问代词
ryt 时间疑问代词
rys 处所疑问代词
ryv 谓词性疑问代词
rg 代词性语素
# 10. 数词(1个一类，1个二类)
m 数词
mq 数量词
# 11. 量词(1个一类，2个二类)
q 量词
qv 动量词
qt 时量词
# 12. 副词(1个一类)
d 副词
# 13. 介词(1个一类，2个二类)
p 介词
pba 介词“把”
pbei 介词“被”
# 14. 连词(1个一类，1个二类)
c 连词
 cc 并列连词
# 15. 助词(1个一类，15个二类)
u 助词
uzhe 着
ule 了 喽
uguo 过
ude1 的 底
ude2 地
ude3 得
usuo 所
udeng 等 等等 云云
uyy 一样 一般 似的 般
udh 的话
uls 来讲 来说 而言 说来
uzhi 之
ulian 连 （“连小学生都会”）
# 16. 叹词(1个一类)
e 叹词
# 17. 语气词(1个一类)
y 语气词(delete yg)
# 18. 拟声词(1个一类)
o 拟声词
# 19. 前缀(1个一类)
h 前缀
# 20. 后缀(1个一类)
k 后缀
# 21. 字符串(1个一类，2个二类)
x 字符串
 xx 非语素字
 xu 网址URL
# 22. 标点符号(1个一类，16个二类)
w 标点符号
wkz 左括号，全角：（ 〔  ［  ｛  《 【  〖〈   半角：( [ <
wky 右括号，全角：） 〕  ］ ｝ 》  】 〗 〉 半角： ) ] >
wyz 左引号，全角：“ ‘ 『
wyy 右引号，全角：” ’ 』
wj 句号，全角：。
ww 问号，全角：？ 半角：?
wt 叹号，全角：！ 半角：!
wd 逗号，全角：， 半角：,
wf 分号，全角：； 半角： ;
wn 顿号，全角：、
wm 冒号，全角：： 半角： :
ws 省略号，全角：……  …
wp 破折号，全角：——   －－   ——－   半角：---  ----
wb 百分号千分号，全角：％ ‰   半角：%
wh 单位符号，全角：￥ ＄ ￡  °  ℃  半角：$
```




# 拓展阅读

数字识别

- 实体识别

人名识别（中文，日文，翻译）

地名

组织名称

# 参考资料

[ansj分词.ict的真正java实现.分词效果速度都超过开源版的ict. 中文分词,人名识别,词性标注,用户自定义词典](https://github.com/NLPchina/ansj_seg)

[中文自然语言处理工具集【断句/分词/词性标注/组块/句法分析/语义分析/NER/N元语法/HMM/代词消解/情感分析/拼写检查】](https://github.com/kidden/nlp4han)

[xmnlp中文分词工具，java编写，统计概率分词+规则分词实现，功能包括人名识别，词性标注，用户自定义词典扩展，分词效果速度都超过开源版的jieba分词。](https://github.com/JoeWoo/xmnlp)

[中文自然语言分词及词性标注。实现了FMM，BMM，HMM分词算法，以及基于HMM的词性标注。](https://github.com/jimth001/NLP-participle-and-speech-tagging)

[带词性标注的jieba分词java版](https://github.com/zoyanhui/jieba4j-tag)

* any list
{:toc}