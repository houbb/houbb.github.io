---
layout: post
title:  Json Path-另一种解析 json 的方式 jsonpath
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# 场景

以前工作中，习惯于将对象转换为 json。并一直感觉这种转换非常的方便。

因为借助 fastjson, gjson, jackson 等工具就是一个方法就搞定。

以前写一些数据的抓取，我也会写一大堆代码，去构建这个对象。

后来知道有 mongo 这种文档型数据库，觉得也挺方便。

但是 xml 有 xmlPath, 我为什么一直都没有想到 json 有 json path 呢？？

# 问题

比如 google 返回的 json 如下

```json
[[["Hello, Li Yinhe. ","你好啊，李银河。",null,null,3],["Beautiful stories are always too far away. ","美丽的故事总是太遥远。",null,null,3],["Grass along the Qingqing River, seeing the Vega.","青青河边草，遥看织女星。",null,null,3],[null,null,null,"Nǐ hǎo a, lǐ yínhé. Měilì de gùshì zǒng shì tài yáoyuǎn. Qīngqīng hé biān cǎo, yáo kàn zhīnǚxīng."]],null,"zh-CN",null,null,[["你好啊，李银河。",null,[["Hello, Li Yinhe.",0,true,false]],[[0,8]],"你好啊，李银河。",0,0],["美丽的故事总是太遥远。",null,[["Beautiful stories are always too far away.",0,true,false],["Beautiful story always too far away.",0,true,false]],[[0,11]],"美丽的故事总是太遥远。",0,0],["青青河边草，遥看织女星。",null,[["Grass along the Qingqing River, seeing the Vega.",0,true,false],["青青河边草, very thick Vega.",0,true,false]],[[0,12]],"青青河边草，遥看织女星。",0,0]],1,null,[["zh-CN"],null,[1],["zh-CN"]]]
```

我构建了半天都感觉这个对象不一般，而且第一个数组是会动态变化的。

我关心的字段信息，只是翻译后的字段信息。

然后就去查了一下，发现了 json path。

# 核心方法介绍

JsonPath表达式始终引用JSON结构，其方式与XPath表达式与XML文档结合使用的方式相同。 

JsonPath中的“根成员对象”始终称为 `$`，无论它是对象还是数组。

## 访问

可以使用点访问符号

```
$.store.book[0].title
```

也可以使用中括号访问

```
$['store']['book'][0]['title']
```

## 操作

| Operator                  | Description                                                        |
| :------------------------ | :----------------------------------------------------------------- |
| `$`                       | The root element to query. This starts all path expressions.       |
| `@`                       | The current node being processed by a filter predicate.            |
| `*`                       | Wildcard. Available anywhere a name or numeric are required.       |
| `..`                      | Deep scan. Available anywhere a name is required.                  |
| `.<name>`                 | Dot-notated child                                                  |
| `['<name>' (, '<name>')]` | Bracket-notated child or children                                  |
| `[<number> (, <number>)]` | Array index or indexes                                             |
| `[start:end]`             | Array slice operator                                               |
| `[?(<expression>)]`       | Filter expression. Expression must evaluate to a boolean value.    |

## 函数

可以在路径的尾端调用函数 - 函数的输入是路径表达式的输出。 

功能输出由功能本身决定。

| Function                  | Description                                                         | Output    |
| :------------------------ | :------------------------------------------------------------------ |-----------|
| min()                     | Provides the min value of an array of numbers                       | Double    |
| max()                     | Provides the max value of an array of numbers                       | Double    |
| avg()                     | Provides the average value of an array of numbers                   | Double    |
| stddev()                  | Provides the standard deviation value of an array of numbers        | Double    |
| length()                  | Provides the length of an array                                     | Integer   |


## 过滤运算符

过滤器是用于过滤数组的逻辑表达式。
 
典型的过滤器是 `[?(@.age > 18)]` ，其中@表示当前正在处理的项目。 

可以使用逻辑运算符 `&&` 和 `||` 创建更复杂的过滤器。 

字符串文字必须用单引号或双引号括起来 (`[?(@.color == 'blue')]` or `[?(@.color == "blue")]`)。

| Operator                 | Description                                                           |
| :----------------------- | :-------------------------------------------------------------------- |
| ==                       | left is equal to right (note that 1 is not equal to '1')              |
| !=                       | left is not equal to right                                            |
| <                        | left is less than right                                               |
| <=                       | left is less or equal to right                                        |
| >                        | left is greater than right                                            |
| >=                       | left is greater than or equal to right                                |
| =~                       | left matches regular expression  [?(@.name =~ /foo.*?/i)]             |
| in                       | left exists in right [?(@.size in ['S', 'M'])]                        |
| nin                      | left does not exists in right                                         |
| subsetof                 | left is a subset of right [?(@.sizes subsetof ['S', 'M', 'L'])]       |
| anyof                    | left has an intersection with right [?(@.sizes anyof ['M', 'L'])]     |
| noneof                   | left has no intersection with right [?(@.sizes noneof ['M', 'L'])]    |
| size                     | size of left (array or string) should match right                     |
| empty                    | left (array or string) should be empty                                |

# 使用 JsonPath

## maven 引入

```xml
<dependency>
    <groupId>com.jayway.jsonpath</groupId>
    <artifactId>json-path</artifactId>
    <version>2.4.0</version>
</dependency>
```

## 入门案例

```json
{"store":{"book":[{"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95},{"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99},{"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99},{"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}],"bicycle":{"color":"red","price":19.95}},"expensive":10}
```

## 解析

| JsonPath (click link to try)| Result |
| :------- | :----- |
| <a href="http://jsonpath.herokuapp.com/?path=$.store.book[*].author" target="_blank">$.store.book[*].author</a>| The authors of all books     |
| <a href="http://jsonpath.herokuapp.com/?path=$..author" target="_blank">$..author</a>                   | All authors                         |
| <a href="http://jsonpath.herokuapp.com/?path=$.store.*" target="_blank">$.store.*</a>                  | All things, both books and bicycles  |
| <a href="http://jsonpath.herokuapp.com/?path=$.store..price" target="_blank">$.store..price</a>             | The price of everything         |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[2]" target="_blank">$..book[2]</a>                 | The third book                      |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[2]" target="_blank">$..book[-2]</a>                 | The second to last book            |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[0,1]" target="_blank">$..book[0,1]</a>               | The first two books               |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[:2]" target="_blank">$..book[:2]</a>                | All books from index 0 (inclusive) until index 2 (exclusive) |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[1:2]" target="_blank">$..book[1:2]</a>                | All books from index 1 (inclusive) until index 2 (exclusive) |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[-2:]" target="_blank">$..book[-2:]</a>                | Last two books                   |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[2:]" target="_blank">$..book[2:]</a>                | Book number two from tail          |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.isbn)]" target="_blank">$..book[?(@.isbn)]</a>          | All books with an ISBN number         |
| <a href="http://jsonpath.herokuapp.com/?path=$.store.book[?(@.price < 10)]" target="_blank">$.store.book[?(@.price < 10)]</a> | All books in store cheaper than 10  |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.price <= $['expensive'])]" target="_blank">$..book[?(@.price <= $['expensive'])]</a> | All books in store that are not "expensive"  |
| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.author =~ /.*REES/i)]" target="_blank">$..book[?(@.author =~ /.*REES/i)]</a> | All books matching regex (ignore case)  |
| <a href="http://jsonpath.herokuapp.com/?path=$..*" target="_blank">$..*</a>                        | Give me every thing   
| <a href="http://jsonpath.herokuapp.com/?path=$..book.length()" target="_blank">$..book.length()</a>                 | The number of books                      |


# 读取文档

使用JsonPath最简单最直接的方法是通过静态读取API。

```java

List<String> authors = JsonPath.read(json, "$.store.book[*].author");
```

# 个人实战

## 获取所有中文的翻译

很简单的一句话即可：

```java
List<String> stringList = JsonPath.read(json, "$.[0][:-1][0]");
```

信息如下：

```
Hello, Li Yinhe. 
Beautiful stories are always too far away. 
Grass along the Qingqing River, seeing the Vega.
```

## 性能优化

如果我们需要提取 json 中的多个数值，可以首先初始化一下 context，然后再做处理。

```java
final String json = "{}";

// 避免多次解析
final ReadContext jsonContext = JsonPath.parse(json);

// 根据路径获取指定的值
Object value = jsonContext.read(jsonPath);
```


# 参考资料

* any list
{:toc}