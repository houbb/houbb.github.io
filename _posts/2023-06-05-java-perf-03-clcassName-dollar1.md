---
layout: post
title: java 类内存看到 xxx.className$1 是怎么回事？
date:  2023-06-05 +0800
categories: [Basic]
tags: [basic, xml, sh]
published: true
---

# 原始代码

定义了一个类，其中没有使用任何的内部类。

有一个方法如下：

```java
@Override
    public String replace(final List<CharsScanMatchItem> charsScanMatchItemList, final String originalString, final CharsScanContext context) {
        // 基本属性
        final char[] oldChars = originalString.toCharArray();
        final ICharsReplaceFactory charsReplaceFactory = context.getCharsReplaceFactory();

        final StringBuilder stringBuilder = new StringBuilder();
        // 排序，理论上是从前往后的。
        // 但是因为策略不同，先做一次排序 Olog(N)
        if(charsScanMatchItemList.size() > 1) {
            Collections.sort(charsScanMatchItemList, new Comparator<CharsScanMatchItem>() {
                @Override
                public int compare(CharsScanMatchItem o1, CharsScanMatchItem o2) {
                    //1. 先使用开始下标
                    int startIndexDiff = o1.getStartIndex() - o2.getStartIndex();
                    if(startIndexDiff != 0) {
                        return startIndexDiff;
                    }
                    //2. 如果相同，则看优先级
                    return o1.getPriority() - o2.getPriority();
                }
            });
        }

        // 其他逻辑

        return stringBuilder.toString();
    }
```

## jvisual 观察

当时把这个类 CharsCore 定义为单例，然后发现每次还是会不断创建新的对象类：

```
xxx.CharsCore$1
```

很奇怪，这个 $1 是一个什么东西？

## idea 查看 target class 文件

idea 直接查看 target class 文件下的信息，发现没有额外的文件信息。

其实是 idea 把 $1 的文件过滤掉了。

## 文件夹查看 class 文件

直接文件夹打开 target 文件。

就可以看到后缀为 `$1` 的 class 文件。

### 查看文件内容

可以把 class 文件直接拖到 idea 中打开：

内容如下：

```java
class CharsCoreCommon$1 implements Comparator<CharsScanMatchItem> {
    CharsCoreCommon$1(CharsCoreCommon this$0) {
        this.this$0 = this$0;
    }

    public int compare(CharsScanMatchItem o1, CharsScanMatchItem o2) {
        int startIndexDiff = o1.getStartIndex() - o2.getStartIndex();
        return startIndexDiff != 0 ? startIndexDiff : o1.getPriority() - o2.getPriority();
    }
}
```

其实就是我们在 Collections.sort 方法中使用了匿名内部类导致的。

所以把这个类单独提取出来，对性能理论上有一定的提升。

# 参考资料

https://juejin.cn/s/char%E6%95%B0%E7%BB%84%E8%BD%ACbyte%E6%95%B0%E7%BB%84

* any list
{:toc}