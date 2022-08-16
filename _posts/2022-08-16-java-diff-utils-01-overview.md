---
layout: post
title:  java-diff-utils 文件差异对比工具包简介
date:  2022-08-12 09:22:02 +0800
categories: [Tool]
tags: [compare, differ, sh]
published: true
---

# 差异

举一个最常见的例子，我们使用git进行提交时，通常会使用 `git diff --cached` 来查看这次提交做了哪些改动，这里我们先简单定义一下什么是diff：

diff就是目标文本和源文本之间的区别，也就是将源文本变成目标文本所需要的操作。

## 差异算法

在 Git 中，有四种diff算法，分别是Myers、Minimal、Patience和Histogram，它们用于获取位于两个不同提交中的两个相同文件的差异。

Myers算法由Eugene W.Myers在1986年发表的一篇论文中提出，是一个能在大部分情况产生”最短的直观的“diff的一个算法。

文本差异对比涉及到的算法介绍：

[How different are different diff algorithms in Git](https://link.springer.com/article/10.1007/s10664-019-09772-z)

[Myers Diff 差分算法](https://chenshinan.github.io/2019/05/02/git%E7%94%9F%E6%88%90diff%E5%8E%9F%E7%90%86%EF%BC%9AMyers%E5%B7%AE%E5%88%86%E7%AE%97%E6%B3%95/)

## 对比工具

好用的在线文本对比： [在线文本比较工具](https://chenshinan.github.io/2019/05/02/git%E7%94%9F%E6%88%90diff%E5%8E%9F%E7%90%86%EF%BC%9AMyers%E5%B7%AE%E5%88%86%E7%AE%97%E6%B3%95/)


好用的桌面文本对比软件：

[Meld](https://meld.en.softonic.com/)、

[DiffMerge](http://sourcegear.com/diffmerge/)、

[xxdiff](https://furius.ca/xxdiff/)、

[Diffuse](https://sourceforge.net/projects/diffuse/)、

[Kompare](https://apps.kde.org/kompare/)

## 差异库

1. [java-diff-utils](https://github.com/java-diff-utils/java-diff-utils)

2. [diff-match-patch](https://github.com/google/diff-match-patch)


# 使用例子

## maven 

```xml
<dependency>
  <groupId>io.github.java-diff-utils</groupId>
  <artifactId>java-diff-utils</artifactId>
  <version>4.11</version>
</dependency>
```

## 文本

- test1.txt 和 test3.txt

```js
_this.ispc = function(){
  var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return  flag;
}
window._assignInfo = {};
window._curnodepersons = [];
window.attachmode = '0';
window.isEsignature = false;
window.upList = [];
window.downList = [];
window.billId = '';
window.upProcessIdList = [];
window.downProcessIdList = [];
var urlsplit = window.location.href.split("#");
if(urlsplit.length>1){
  //alert(window.location.href);
 	location.href = urlsplit[0];
}
```

- test2.txt

```js
_this.ispc = function(){
  var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
insert1；
insert2；
            break;
        }
    }
    return  flag;
}
window._assignInfo = {};
window._curnodepersons = [];
window.attachmode = '0';
window.isEsignature = false;


add
window.billId = '';
window.upProcessIdList = [];
window.downProcessIdList = [];
var urlsplit = window.location.href.split("#");
if(urlsplit.length>1){
  //alert(window.location.href);
 	location.href = qazwer[0];
}
```

## 获取两文件的不同点-patch

```java
//原始文件
List<String> original = Files.readAllLines(new File("D:\\test1.txt").toPath());

//对比文件
List<String> revised = Files.readAllLines(new File("D:\\test2.txt").toPath());

//两文件的不同点
Patch<String> patch = DiffUtils.diff(original, revised);
for (AbstractDelta<String> delta : patch.getDeltas()) {
    System.out.println(delta);
}
```

输出：

```
[InsertDelta, position: 9, lines: [insert1；, insert2；]]
[ChangeDelta, position: 18, lines: [window.upList = [];, window.downList = [];] to [, , add]]
[ChangeDelta, position: 26, lines: [ 	location.href = urlsplit[0];] to [ 	location.href = qazwer[0];]]
```

InsertDelta代表插入的，ChangeDelta代表删除的或修改的。position代表第几行，lines代表内容。

## 根据patch生成统一的差异格式unifiedDiff

```java
//原始文件
List<String> original = Files.readAllLines(new File("D:\\test1.txt").toPath());

//对比文件
List<String> revised = Files.readAllLines(new File("D:\\test2.txt").toPath());

//两文件的不同点
Patch<String> patch = DiffUtils.diff(original, revised);

//生成统一的差异格式
List<String> unifiedDiff = UnifiedDiffUtils.generateUnifiedDiff("test1.txt", "test2.txt", original, patch, 0);
unifiedDiff.forEach(System.out::println);
```

输出 diff：

```
--- test1.txt
+++ test2.txt
@@ -10,0 +10,2 @@
+insert1；
+insert2；
@@ -19,2 +21,3 @@
-window.upList = [];
-window.downList = [];
+
+
+add
@@ -27,1 +30,1 @@
- 	location.href = urlsplit[0];
+ 	location.href = qazwer[0];
```

## 前端页面美化输出：

如果想将上面通过Java代码得到的两个文件的差异美化输出可以 参考我另一篇博客：

> [Java+html实现文本对比](https://blog.csdn.net/qq_33697094/article/details/121767084) 实现效果如下：

# 小结

多思考。

# 参考资料

[Java 文本内容差异对比实现介绍](https://blog.csdn.net/qq_33697094/article/details/121681707)

* any list
{:toc}