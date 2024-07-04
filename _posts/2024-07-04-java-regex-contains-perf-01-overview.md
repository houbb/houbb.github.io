---
layout: post
title: java contains 和 regex 性能对比
date: 2024-07-04 21:01:55 +0800
categories: [java]
tags: [java, perf, sh]
published: true
---

# 场景

如果想验证一个日志文件，是否匹配 error、ERROR、Error 中的任何一个？

到底是 3 次 contains 快，还是直接 "error|ERROR|Error" 更快？

# 实战测试

我们用一个长文本 8k 左右，循环 100W 次。



## 基本变量

```java
public class PerConst {

    public static final int times = 1000000;

    public static final String log =  "8K 长的文本";

}
```

## contains 测试

```java
package org.example;

import java.util.Arrays;
import java.util.List;

public class PerfContainsTest {

    public static void main(String[] args) {
        List<String> wordList = Arrays.asList("error", "Error", "ERROR");

        final long startTime = System.currentTimeMillis();

        int matchCount = 0;
        for(int i = 0; i < PerConst.times; i++) {
            // 次数
            for(String word : wordList) {
                if(PerConst.log.contains(word)) {
                    matchCount++;
                }
            }
        }

        final long costTime = System.currentTimeMillis() - startTime;
        System.out.println("PerfContainsTest 耗时：" + costTime);
        System.out.println("PerfContainsTest matchCount：" + matchCount);
    }

}
```

耗时：

```
PerfContainsTest 耗时：1520
PerfContainsTest matchCount：3000000
```

## regex 测试

```java
package org.example;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PerfRegexTest {

    public static void main(String[] args) {

        // 这种性能不好，提前处理
        // regex.matches(regex);

        String regex = "error|Error|ERROR";
        Pattern pattern = Pattern.compile(regex);

        final long startTime = System.currentTimeMillis();

        int matchCount = 0;
        for(int i = 0; i < PerConst.times; i++) {
            Matcher matcher = pattern.matcher(PerConst.log);
            // 其实可以多次匹配
            if(matcher.find()) {
                matchCount++;
            }
        }

        final long costTime = System.currentTimeMillis() - startTime;
        System.out.println("PerfRegexTest 耗时：" + costTime);
        System.out.println("PerfRegexTest matchCount：" + matchCount);
    }

}
```

耗时：

```
PerfRegexTest 耗时：20454
PerfRegexTest matchCount：1000000
```

# 参考资料

* any list
{:toc}
