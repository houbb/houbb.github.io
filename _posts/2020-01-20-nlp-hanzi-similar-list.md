---
layout: post
title:  NLP 开源形近字算法之相似字列表（番外篇）
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, ml, ai, sh]
published: true
---

# 创作目的

国内对于文本的相似度计算，开源的工具是比较丰富的。

但是对于两个汉字之间的相似度计算，国内基本一片空白。国内的参考的资料少的可怜，国外相关文档也是如此。

本项目旨在抛砖引玉，实现一个基本的相似度计算工具，为汉字 NLP 贡献一点绵薄之力。

推荐阅读：

[NLP 中文形近字相似度计算思路](https://mp.weixin.qq.com/s/i3h_15kYRb89MsApZ5nwPQ)

[中文形近字相似度算法实现，为汉字 NLP 尽一点绵薄之力](https://mp.weixin.qq.com/s/pDt3R04-XWKSvo1hJpTSDg)

[当代中国最贵的汉字是什么？](https://mp.weixin.qq.com/s/SETYeJchvWuqicrHLgG2mQ)

[NLP 开源形近字算法补完计划（完结篇）](https://mp.weixin.qq.com/s/T4ubn_nCr2fkW8jui3anSA)

[开源项目在线化 中文繁简体转换/敏感词/拼音/分词/汉字相似度/markdown 目录](https://mp.weixin.qq.com/s/8eEvUtW0xS9rPijzoDYc7w)

# 需求

有时候我们并不是需要返回两个字的相似，而是需要返回一个汉字的相似列表。

## 实现思路

我们可以分别计算所有的汉字之间的相似度，然后保留最大的前100个，放在字典中。

然后实时查询这个字典即可。

## 实现方式

`bihuashu_2w.txt` 中我们主要需要的是对应的 2W 常见汉字。

`hanzi_similar_list.txt` 用来存放汉字和相似字的映射关系。

### 数据初始化

```java
public static void main(String[] args) {
    final String path = "D:\\code\\coin\\nlp-hanzi-similar\\src\\main\\resources\\hanzi_similar_list.txt";
    // 读取列表
    List<String> lines = FileUtil.readAllLines("D:\\code\\coin\\nlp-hanzi-similar\\src\\main\\resources\\nlp\\bihuashu_2w.txt");
    // 所有的单词
    Set<String> allWordSet = new HashSet<>();
    for(String line : lines) {
        String word = line.split(" ")[0];
        allWordSet.add(word);
    }
    // 循环对比
    for(String word : allWordSet) {
        List<String> list = getSimilarListData(word, allWordSet);
        String line = word +" " + StringUtil.join(list, "");
        FileUtil.append(path, line);
    }
}
```

- 优先级队列取前 100 个

我们通过优先级队列存储：

```java
private static List<String> getSimilarListData(String word, Set<String> wordSet) {
    PriorityQueue<SimilarListDataItem> items = new PriorityQueue<>(new Comparator<SimilarListDataItem>() {
        @Override
        public int compare(SimilarListDataItem o1, SimilarListDataItem o2) {
            // 相似度大的放在前面
            return -o1.getRate().compareTo(o2.getRate());
        }
    });
    for(String other : wordSet) {
        if(word.equals(other)) {
            continue;
        }
        // 对比
        double rate = HanziSimilarHelper.similar(word.charAt(0), other.charAt(0));
        SimilarListDataItem item = new SimilarListDataItem(other, rate);
        items.add(item);
    }
    final int limit = 100;
    List<String> wordList = new ArrayList<>();
    for(SimilarListDataItem item : items) {
        wordList.add(item.getWord());
        if(wordList.size() >= limit) {
            break;
        }
    }
    return wordList;
}
```

### 相似字的获取

初始化好数据之后，一切就变得非常简单：

- 接口定义

```java
/**
 * 数据接口-相似列表
 * @author binbin.hou
 * @since 1.3.0
 */
public interface IHanziSimilarListData {

    /**
     * 返回数据信息
     * @param word 单词
     * @return 结果
     * @since 1.3.0
     */
    List<String> similarList(String word);

}
```

- 数据获取

```java
public class HanziSimilarListData implements IHanziSimilarListData {

    private static volatile Map<String, List<String>> map = Guavas.newHashMap();


    @Override
    public List<String> similarList(String word) {
        if(MapUtil.isEmpty(map)) {
            initDataMap();
        }

        return map.get(word);
    }

    private void initDataMap() {
        if(MapUtil.isNotEmpty(map)) {
            return;
        }

        //DLC
        synchronized (map) {
            if(MapUtil.isEmpty(map)) {
                List<String> lines = StreamUtil.readAllLines("/hanzi_similar_list.txt");

                for(String line : lines) {
                    String[] words = line.split(" ");
                    // 后面的100个相近词
                    List<String> list = StringUtil.toCharStringList(words[1]);
                    map.put(words[0], list);
                }
            }
        }
    }

}
```

### 便利性

为了用户使用方便，我们在 `HanziSimilarHelper` 中添加 2 个工具类方法：

```java
/**
 * 相似的列表
 * @param hanziOne 汉字一
 * @param limit 大小
 * @return 结果
 * @since 1.3.0
 */
public static List<String> similarList(char hanziOne, int limit) {
    return HanziSimilarBs.newInstance().similarList(hanziOne, limit);
}
/**
 * 相似的列表
 * @param hanziOne 汉字一
 * @return 结果
 * @since 1.3.0
 */
public static List<String> similarList(char hanziOne) {
    return similarList(hanziOne, 10);
}
```

### 测试效果

我们使用看一下效果：

我们来看一下【爱】的形近字。

```java
List<String> list = HanziSimilarHelper.similarList('爱');
Assert.assertEquals("[爰, 爯, 受, 爭, 妥, 憂, 李, 爳, 叐, 雙]", list.toString());
```

# 开源地址

为了便于大家使用学习，项目已开源。

> [https://github.com/houbb/nlp-hanzi-similar](https://github.com/houbb/nlp-hanzi-similar)

# 小结

一个字的形近字可以做很多有趣的事情，这个要看大家的想象力。

实现方式也不难，最核心的还是相似度的计算。

我是老马，期待与你的下次重逢。

* any list
{:toc}