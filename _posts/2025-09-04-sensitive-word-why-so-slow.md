---
layout: post
title: java 本地方法调用为何这么慢，如何排查？
date: 2025-8-29 20:40:12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 背景

有一天，群里收到小伙伴提的一个问题，为什么程序第一次执行这么慢?

> [sensitive-word-131](https://github.com/houbb/sensitive-word/issues/131)

# 初步验证

自己本地用 v0.27.1 验证了一下，确实很奇怪，第一次明显很慢。

为了排除一些干扰项，我们把一些配置先关闭。

最简单的我们用 System.nanoTime 输出一下耗时，用 mills 也行。

```java
public static void main(String[] args) {
        final List<String> allWord = Arrays.asList("敏感","最强","定制", "81", "医疗器械");
        String demo1 = "产品尺寸参数xxxxx";

        // 初始化敏感词库
        SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordFailFast(true)
                .wordAllow(WordAllows.empty())
                .wordDeny(new IWordDeny() {
                    @Override
                    public List<String> deny() {
                        return allWord;
                    }
                })
                .ignoreChineseStyle(false)
                .ignoreCase(false)
                .ignoreEnglishStyle(false)
                .ignoreNumStyle(false)
                .ignoreRepeat(false)
                .ignoreWidth(false)
                .wordTag(WordTags.none())
                .init();

        costTimeTest(sensitiveWordBs, demo1);
    }

    private static void costTimeTest(SensitiveWordBs sensitiveWordBs, String demo1) {
        int count = 5;
        for (int i = 0; i < count; i++) {
            long startTime = System.nanoTime();
            List<String> emitWord1 = sensitiveWordBs.findAll(demo1);
            long costTime = System.nanoTime() - startTime;
            System.out.println("cost=" + costTime);
        }
    }
```

输出：

```
cost=27687800
cost=3623000
cost=2764000
cost=4456500
cost=6652700
```

这里是纳秒，看比例也看得出第一次比较慢。

```
long ns = 1_000_000_000L;  // 1 秒 = 1e9 纳秒
long us = 1_000_000L;      // 1 秒 = 1e6 微秒
long ms = 1_000L;          // 1 秒 = 1e3 毫秒
```

## 排除问题

确认了问题之后，就要找到到底慢在哪里。

有一些方法：

1）每个方法加耗时日志，适用性广，但是比较麻烦。如果没有源代码的话，也无法直接修改。

2） 用 Profiling 工具更方便一些。

Java Flight Recorder (JFR)（JDK 自带，jcmd 或 jfr 启动）

VisualVM（免费 GUI，适合初步分析）

Async Profiler + 火焰图（性能瓶颈定位神器）

YourKit / JProfiler（商业工具，功能更全）

## 初步猜想

一些初步的猜想：

1. 第一次执行，初始化加载了一些信息比较慢。

2. 后续执行被 jvm 编译优化了，性能提升。

3. 因为后续执行耗时明显下降，一些场景的比如 IO、锁之类的可以暂时排除。


# idea 中使用 profile

## 说明

本地使用的是 idea 免费社区版本。

## IDEA Ultimate

IDEA Ultimate 自带了对 Java Flight Recorder (JFR) 的支持。启动应用时，点 Run → Profile…，选择 Java Flight Recorder。

## IDEA + Async Profiler 插件

IDEA 提供了 Async Profiler 集成（从 2020.3 开始支持）。

用法：右键 Run 旁边选择 Profile with Async Profiler。

输出直接是 火焰图，更直观地看哪一层方法耗时最多。

当然，这两个方法直接用用一个不足，那就是前面的初始化信息也会被记录，有一定的干扰性。

所以需要次数多一些，比如1W次


## 编码 profile

JDK 11+ 提供了 jdk.jfr API，可以在代码里手动控制录制

```java
import jdk.jfr.Recording;
import java.nio.file.Path;

public class JFRDemo {
    public static void main(String[] args) throws Exception {
        try (Recording recording = new Recording()) {
            recording.start();
            
            // 运行你要分析的代码
            MyUtil.someMethod();
            
            recording.stop();
            recording.dump(Path.of("app.jfr")); // 保存到文件
        }
    }
}
```

我们略微调整

```java
   private static void costTimeTest(SensitiveWordBs sensitiveWordBs, String demo1) throws IOException {
        int count = 5;

        try (Recording recording = new Recording()) {
            recording.start();

            for (int i = 0; i < count; i++) {
                long startTime = System.nanoTime();
                List<String> emitWord1 = sensitiveWordBs.findAll(demo1);
                long costTime = System.nanoTime() - startTime;
                System.out.println("cost=" + costTime);
            }

            recording.stop();
            recording.dump(Path.of("app.jfr")); // 保存到文件
        }
    }
```


执行后可以看到根目录下 app.jfr，发现这个生成 jfr 有问题。

# jfr 文件如何文件如何打开分析呢？

## jmc

JDK 11+ 一般自带 JMC（或者单独下载安装 JMC）

`jmc` 然后选择打开，发现自己的 jdk11 并没有，应该和 jvisual 一样，后续被单独拆开了。

官网下载： https://www.oracle.com/java/technologies/jdk-mission-control.html

或者 OpenJDK 社区版的 JMC： https://github.com/openjdk/jmc

下载后直接运行 JMC GUI，然后打开 .jfr 文件进行分析。

### 下载

可以在 https://www.oracle.com/java/technologies/javase/products-jmc9-downloads.html 页面选择合适自己的安装包。


## firefox profiler

看了一下 Async Profiler 用的应该就是  https://profiler.firefox.com/ 这个页面分析文件的。

如果可以的话，你也可以直接用这个网页。

可以选择本地的 JFR 文件，或者是 URL。

# 整体好事优化

## 1万次

这是一个循环调用 1W 次的例子，可以看到整体的耗时：

可以直接打开这个链接查看： [https://share.firefox.dev/4lZljPd](https://share.firefox.dev/4lZljPd)

整体耗时：7890ms

```java
        long time = System.currentTimeMillis();
        costTimeTest(sensitiveWordBs, demo1);
        long cTime = System.currentTimeMillis() - time;
        System.out.println("---DONE"+cTime);
```

## 慢的点

可以看到比较慢的2个点 

1) `String.toCharArray(): char[]` 54%

2) `InnerWordFormatUtils.formatCharsMapping(String, IWordContext): Map` 11%

## 优化方案

针对1，我们尝试优化一下，toCharArray 看 String 源码会重新创建 chars，占用内存，我们尽可能的避免。

```java
    /**
     * Converts this string to a new character array.
     *
     * @return  a newly allocated character array whose length is the length
     *          of this string and whose contents are initialized to contain
     *          the character sequence represented by this string.
     */
    public char[] toCharArray() {
        return isLatin1() ? StringLatin1.toChars(value)
                          : StringUTF16.toChars(value);
    }
```

针对2，用 char[] 数组替代肯定是最好的，但是字符比较复杂，暂时还是 map 适用性更强。

如果不指定格式转换，可以考虑 map 为空，取不到用原始值，减少这一份消耗。

## InnerWordFormatUtils.formatCharsMapping(String, IWordContext): Map 优化

优化方案：新增一个针对整体字符串 format 的处理类 IWordFormatText，如果 IWordFormat 是系统默认的 none，直接返回 emptyMap

限制场景：仅针对不做任何优化的场景有作用。

内存优化：只有映射 c 和 mc 不同，才放入映射 map

实现:

```java
/**
 * 默认实现
 *
 * @author d
 * @since 0.28.0
 */
public class WordFormatTextDefault extends AbstractWordFormatText {

    @Override
    protected Map<Character, Character> doFormat(String text, IWordContext context) {
        // 单个字符串里信息
        final IWordFormat wordFormat = context.wordFormat();
        // 不需要处理的场景
        if(wordFormat.getClass().getName().equals(WordFormatNone.class.getName())) {
            return Collections.emptyMap();
        }

        Map<Character, Character> map = new HashMap<>();
        for(int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            char mc = wordFormat.format(c, context);

            if(c != mc) {
                map.put(c, mc);
            }
        }
        return map;
    }
    
}
```

JFR 对比效果：JFR 为 7571

严谨起见，我们加一下额外项目的测试对比，对比5次

v0.27.1 直接运行1W次，5 次均值：7255 ，明细如下：

```
7613
7166
7156
7176
7164
```

新代码直接运行1W次，均值 7139.4，明细如下：

```
7650
7074
7002
6979
6992
```

看来这个 cpu 火焰图和时间耗时不是严格等价。

这里只提升了 1% 左右的性能。

罢了，看在内存的面子上，我们先发布一个版本。

## 发布

此代码发布，放在 v0.28.0 版本。





























* any list
{:toc}