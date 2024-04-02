---
layout: post
title: 搜索引擎-02-分词与全文索引
date:  2017-2-24 09:53:51 +0800
categories: [Search-Engine]
tags: [search-engine, index,  es, lucene, sh]
published: true
---

# 拓展阅读

[搜索引擎-01-概览](https://houbb.github.io/2017/02/24/search-engine-01-overview-01)

[搜索引擎-02-分词与全文索引](https://houbb.github.io/2017/02/24/search-engine-02-fenci-fulltext-02)

[搜索引擎-03-搜索引擎原理](https://houbb.github.io/2017/02/24/search-engine-03-theory-03)

[Crawl htmlunit 模拟浏览器动态 js 爬虫入门使用简介](https://houbb.github.io/2018/08/19/crawl-htmlunit)

[Crawl jsoup 爬虫使用 jsoup 无法抓取动态 js 生成的内容](https://houbb.github.io/2018/08/19/crawl-jsoup)

[Crawl WebMagic 爬虫入门使用简介 webmagic](https://houbb.github.io/2018/08/19/crawl-weblogic)


# 搜索引擎

查询，想必你不会陌生。

如何更好的查询，本文将持续记录一些点滴。

对于大部分不是专门研究搜索引擎的同学，记住以下几点即可：

1) 全网搜索引擎系统由spider， search&index， rank三个子系统构成

2) 站内搜索引擎与全网搜索引擎的差异在于，少了一个spider子系统

3) spider和search&index系统是两个工程系统，rank系统的优化却需要长时间的调优和积累

4) 正排索引（forward index）是由网页url_id快速找到分词后网页内容`list<item>`的过程

5) 倒排索引（inverted index）是由分词item快速寻找包含这个分词的网页list`<url_id>`的过程

6) 用户检索的过程，是先分词，再找到每个item对应的`list<url_id>`，最后进行集合求交集的过程

7) 有序集合求交集的方法有

 a) 二重for循环法，时间复杂度O(n*n)
 
 b) 拉链法，时间复杂度O(n)
 
 c) 水平分桶，多线程并行
 
 d) bitmap，大大提高运算并行度，时间复杂度O(n)
 
 e) 跳表，时间复杂度为O(log(n))
     

# Original Design

原来自己的博客进行检索。采用的是如下方式

分词->拼音->全文检索(MySQL)

友情提示:

1. 本段较长，主要用来日后查看，可自行过滤性查看。

> 分词

[分词-知乎](https://www.zhihu.com/question/19578687)

例子：

当用户输入**个人博客**这个关键词检索时，可以在后台进一步分为**个人**、**博客**。

- jar

```xml
<!--结巴分词-->
<dependency>
    <groupId>com.huaban</groupId>
    <artifactId>jieba-analysis</artifactId>
    <version>${jieba.version}</version>
</dependency>
```

- FenCiUtil.java

```java
import com.huaban.analysis.jieba.JiebaSegmenter;
import com.huaban.analysis.jieba.SegToken;
import com.ryo.blog.service.util.constant.AppConstant;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

/**
 * @author houbinbin
 * @since 1.7
 */
public class FenCiUtil {

    /**
     * 分词器
     */
    private static final JiebaSegmenter SEGMENTER = new JiebaSegmenter();

    /**
     * 中文分词, 并转成拼音
     *
     * @param data
     * @return
     */
    public static String process(String data) {
        if (StringUtils.isEmpty(data)) {
            return StringUtils.EMPTY;
        }

        data = data.replaceAll("\\s", AppConstant.BLANK);
        data = data.replaceAll(AppConstant.SINGLE_QUOTES, AppConstant.BLANK);

        List<SegToken> list = SEGMENTER.process(data, JiebaSegmenter.SegMode.INDEX);
        StringBuilder sb = new StringBuilder();
        for(SegToken segToken : list) {
            sb.append(PinYinUtil.converterToSpellWithMuti(segToken.word)).append(AppConstant.COMMA);
        }
        sb.deleteCharAt(sb.lastIndexOf(AppConstant.COMMA));

        return sb.toString();
    }
}
```

- AppConstant.java

```java
/**
 * @author houbinbin
 * @since 1.7
 */
public class AppConstant {

  /**
   * 默认编码格式
   */
  public static final String DEFAULT_CHARSET = "UTF-8";

  /**
   * 逗号
   */
  public static final String COMMA = ",";

  /**
   * 圆点
   */
  public static final String DOT = ".";

  /**
   * 空格
   */
  public static final String BLANK = " ";

  /**
   * 单引号
   */
  public static final String SINGLE_QUOTES = "'";

  /**
   * 下划线
   */
  public static final String UNDERLINE = "_";

}
```



> 拼音

例子:

比如查询用户**老马啸西风**，为了更好的用户体验。用户输入**laomaxiaoxifeng**、**lmxxf**都应该返回对应的结果。

- jar

```xml
<!--拼音4j-->
<dependency>
    <groupId>com.belerweb</groupId>
    <artifactId>pinyin4j</artifactId>
    <version>${pinyin4j.version}</version>
</dependency>
```

- PinYinUtil.java

```java
import com.ryo.blog.service.util.constant.AppConstant;
import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

/**
 * @author houbinbin
 * @since 1.7
 */
public class PinYinUtil {

  /**
   * 汉字转换位汉语拼音首字母，英文字符不变，特殊字符丢失 支持多音字，生成方式如（长沙市长:cssc,zssz,zssc,cssz）
   *
   * @param chines 汉字
   * @return 拼音
   */
  public static String converterToFirstSpell(String chines) {
    StringBuffer pinyinName = new StringBuffer();
    char[] nameChar = chines.toCharArray();
    HanyuPinyinOutputFormat defaultFormat = new HanyuPinyinOutputFormat();
    defaultFormat.setCaseType(HanyuPinyinCaseType.LOWERCASE);
    defaultFormat.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
    for (int i = 0; i < nameChar.length; i++) {
      if (nameChar[i] > 128) {
        try {
          // 取得当前汉字的所有全拼
          String[] strs = PinyinHelper.toHanyuPinyinStringArray(
              nameChar[i], defaultFormat);
          if (strs != null) {
            for (int j = 0; j < strs.length; j++) {
              // 取首字母
              pinyinName.append(strs[j].charAt(0));
              if (j != strs.length - 1) {
                pinyinName.append(AppConstant.COMMA);
              }
            }
          }
          // else {
          // pinyinName.append(nameChar[i]);
          // }
        } catch (BadHanyuPinyinOutputFormatCombination e) {
          e.printStackTrace();
        }
      } else {
        pinyinName.append(nameChar[i]);
      }
      pinyinName.append(AppConstant.BLANK);
    }
    return parseTheChineseByObject(discountTheChinese(pinyinName.toString()));
  }

  /**
   * 汉字转换位汉语全拼，英文字符不变，特殊字符丢失
   * 不支持多音字，生成方式如（重当参:zhongdangcen）
   *
   * @param chines 汉字
   * @return 拼音
   */
  public static String converterToSpell(String chines) {
    StringBuffer pinyinName = new StringBuffer();
    char[] nameChar = chines.toCharArray();
    HanyuPinyinOutputFormat defaultFormat = new HanyuPinyinOutputFormat();
    defaultFormat.setCaseType(HanyuPinyinCaseType.LOWERCASE);
    defaultFormat.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
    for (int i = 0; i < nameChar.length; i++) {
      if (nameChar[i] > 128) {
        try {
          // 取得当前汉字的所有全拼
          String[] strs = PinyinHelper.toHanyuPinyinStringArray(
              nameChar[i], defaultFormat);
          if (strs != null && strs.length > 0) {
            pinyinName.append(strs[0]);
          }
        } catch (BadHanyuPinyinOutputFormatCombination e) {
          e.printStackTrace();
        }
      } else {
        pinyinName.append(nameChar[i]);
      }
      pinyinName.append(AppConstant.BLANK);
    }
    return parseTheChineseByObject(discountTheChinese(pinyinName.toString()));
  }

  /**
   * 汉字转换位汉语全拼，英文字符不变，特殊字符丢失
   * 支持多音字，生成方式如（重当参:zhongdangcen,zhongdangcan,chongdangcen
   * ,chongdangshen,zhongdangshen,chongdangcan）
   *
   * @param chines 汉字
   * @return 拼音
   */
  public static String converterToSpellWithMuti(String chines) {
    StringBuffer pinyinName = new StringBuffer();
    char[] nameChar = chines.toCharArray();
    HanyuPinyinOutputFormat defaultFormat = new HanyuPinyinOutputFormat();
    defaultFormat.setCaseType(HanyuPinyinCaseType.LOWERCASE);
    defaultFormat.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
    for (int i = 0; i < nameChar.length; i++) {
      if (nameChar[i] > 128) {
        try {
          // 取得当前汉字的所有全拼
          String[] strs = PinyinHelper.toHanyuPinyinStringArray(
              nameChar[i], defaultFormat);
          if (strs != null) {
            for (int j = 0; j < strs.length; j++) {
              pinyinName.append(strs[j]);
              if (j != strs.length - 1) {
                pinyinName.append(AppConstant.COMMA);
              }
            }
          }
        } catch (BadHanyuPinyinOutputFormatCombination e) {
          e.printStackTrace();
        }
      } else {
        pinyinName.append(nameChar[i]);
      }
      pinyinName.append(AppConstant.BLANK);
    }
    return parseTheChineseByObject(discountTheChinese(pinyinName.toString()));
  }

  /**
   * 去除多音字重复数据
   *
   * @param theStr
   * @return
   */
  private static List<Map<String, Integer>> discountTheChinese(String theStr) {
    // 去除重复拼音后的拼音列表
    List<Map<String, Integer>> mapList = new ArrayList<Map<String, Integer>>();
    // 用于处理每个字的多音字，去掉重复
    Map<String, Integer> onlyOne = null;
    String[] firsts = theStr.split(AppConstant.BLANK);
    // 读出每个汉字的拼音
    for (String str : firsts) {
      onlyOne = new Hashtable();
      String[] china = str.split(AppConstant.COMMA);
      // 多音字处理
      for (String s : china) {
        Integer count = onlyOne.get(s);
        if (count == null) {
          onlyOne.put(s, NumberUtils.INTEGER_ONE);
        } else {
          onlyOne.remove(s);
          count++;
          onlyOne.put(s, count);
        }
      }
      mapList.add(onlyOne);
    }
    return mapList;
  }

  /**
   * 解析并组合拼音，对象合并方案(推荐使用)
   *
   * @return
   */
  private static String parseTheChineseByObject(
      List<Map<String, Integer>> list) {
    Map<String, Integer> first = null; // 用于统计每一次,集合组合数据
    // 遍历每一组集合
    for (int i = 0; i < list.size(); i++) {
      // 每一组集合与上一次组合的Map
      Map<String, Integer> temp = new Hashtable<String, Integer>();
      // 第一次循环，first为空
      if (first != null) {
        // 取出上次组合与此次集合的字符，并保存
        for (String s : first.keySet()) {
          for (String s1 : list.get(i).keySet()) {
            String str = s + s1;
            temp.put(str, 1);
          }
        }
        // 清理上一次组合数据
        if (temp != null && temp.size() > 0) {
          first.clear();
        }
      } else {
        for (String s : list.get(i).keySet()) {
          String str = s;
          temp.put(str, 1);
        }
      }
      // 保存组合数据以便下次循环使用
      if (temp != null && temp.size() > 0) {
        first = temp;
      }
    }
    String returnStr = StringUtils.EMPTY;
    if (first != null) {
      // 遍历取出组合字符串
      for (String str : first.keySet()) {
        returnStr += (str + AppConstant.COMMA);
      }
    }
    if (returnStr.length() > 0) {
      returnStr = returnStr.substring(0, returnStr.length() - 1);
    }
    return returnStr;
  }
}
```

- 全文检索

1、博客表

原来设计如下的表存储自己写的博客文章

```sql
DROP TABLE IF EXISTS `blog_view`.`article`;
CREATE TABLE `blog_view`.`article`
(
  id            BIGINT(20) AUTO_INCREMENT NOT NULL
  COMMENT '主键, 自增',
  title         VARCHAR(256)              NOT NULL
  COMMENT '标题',
  summary       VARCHAR(512)              NOT NULL         DEFAULT ''
  COMMENT '摘要',
  body          LONGTEXT                  NOT NULL
  COMMENT '内容',
  category_code VARCHAR(16)               NOT NULL
  COMMENT '栏目代码',
  category_name VARCHAR(32)               NOT NULL
  COMMENT '栏目名称',
  created_time  DATETIME                  NOT NULL
  COMMENT '创建时间',
  updated_time  DATETIME                                   DEFAULT NULL
  COMMENT '最后更新时间',
  PRIMARY KEY (`id`)
)
  COMMENT '文章表';
```

2、索引表

为自己的博客表建立对应的索引表

使用方式:

每次修改文章时，对文章的**title**、**summary**、**category_name**、**body** 使用分词分成多个单词，在用拼音工具保存在```article_index```表。


```sql
DROP TABLE IF EXISTS `blog_view`.`article_index`;
CREATE TABLE `blog_view`.`article_index`
(
  id            BIGINT(20) AUTO_INCREMENT NOT NULL
  COMMENT '主键, 自增',
  article_id    BIGINT(20)                NOT NULL
  COMMENT '文章ID',
  title         LONGTEXT                  NOT NULL
  COMMENT '标题',
  summary       LONGTEXT                  NOT NULL DEFAULT ''
  COMMENT '摘要',
  category_name LONGTEXT                  NOT NULL
  COMMENT '栏目名称',
  body          LONGTEXT                  NOT NULL
  COMMENT '内容',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_id` (article_id)
)
  ENGINE = MyISAM
  COMMENT '文章检索表';

-- 只修复索引树
ALTER TABLE `blog_view`.`article_index`
  ADD FULLTEXT INDEX (`title`, `category_name`, `body`, `summary`);
REPAIR TABLE `blog_view`.`article_index` QUICK;
```

- 查询实战

比如用户输入关键词**个人博客**

1、分词

个人 博客

2、变为拼音

geren、boke

3、检索

```sql
SELECT a.id, a.title, a.summary, a.category_code, a.category_name, a.created_time
FROM article a
WHERE 
  AND a.id IN
  (
  SELECT
  ai.article_id
  FROM
  article_index ai
  WHERE match(ai.title, ai.body, ai.category_name, ai.summary) against(#{key} IN BOOLEAN MODE)
  )
ORDER BY
a.id DESC
```

<label class="label label-info">备注</label>

1. 文章的检索表是设定为 ```MyISAM``` 的, 原来我也以为 MySQL只有这个才支持 全文检索。INNODB 在5.6之后是支持的,且自带分词器。

# More

[架构师之路](http://mp.weixin.qq.com/s?src=3&timestamp=1487905680&ver=1&signature=xqjBIqXRrTSrhO9bVfPMKw*Gg90a6ZTGaG2SA1uH4jOUTN1KOorK30nmorj9iQUGvKEdedV09P8oLcTuhYUoK0oc9Aj9xpU3Zd594LBn3S5HuRsDfdfZpw4bVG8OQR94Yq-qiaPwwlHadlETIlTc4JovdsucMTQUPGGOU*2QS0k=)

[MySQL索引背后的数据结构及算法原理](http://blog.codinglabs.org/articles/theory-of-mysql-index.html)

[深入浅出搜索架构引擎、方案与细节（上）](http://qoofan.com/read/LlorpJYwnR.html)

# 个人小结

1. 对于最简单的查询，可以使用 jiebe 进行分词。结合 pinyin 对存储的核心字段的拼音全拼写，简拼写进行存储，然后索引即可。

2. 对于文章等常见信息，如果想使用全文索引，就可以采用数据库自带的全文索引。

* any list
{:toc}



            

