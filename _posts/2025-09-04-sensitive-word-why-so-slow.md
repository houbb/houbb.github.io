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
        String demo1 = "产品尺寸参数§60mn§50mm§210枚/包§160枚/包§名称A4银色不干胶§规格60mm*40mm 送配套模板§规格70mm*50mm 送配套模板§数量每大张21枚一包10张总计210枚§数量每大张16枚一包10张总计160枚§适用激光打印机打印油性笔书写§95mm§100mn§55mm§100枚/包§80枚/包§名称 A4银色不干胶§规格95mm*55mm 送配套模板§规格100mm*70mm 送配套模板§数量每大张10枚一包10张总计100枚§数量 每大张8枚一包10张 总计80枚§100mm§120枚/包§140枚/包§规格80mm*50mm 送配套模板§规格100mm*40mm 送配套模板§数量每大张12枚一包10张总计120枚§数量§每大张14枚包10张总计140枚§适用 激光打印机打印油性笔书写§40mm§65mm§70mm§35mm§200枚/包§240枚/包§规格70mm*40mm送配套模板§规格§65mm*35mm 送配套模板§数量 每大张20枚一包10张总计200枚§每大张24枚包10张总计240枚§适 激光打印机打印油性笔书写§适用§激光打印机打印油性笔书写§40mn§280枚/包§360枚/包§规格50mm*40mm 送配套模板§规格40mm*30mm 送配套模板§数量每大张28枚一包10张总计280枚§数量每大张36枚一包10张总计360枚§45.7mm§38.1mm§400枚/包§650枚/包§45.7mm*25.4mm送配套模板§38.1mm*21.2mm 送配套模板§每大张40枚一包10张总计400枚§数量每大张65枚一包10张总计650枚§30mm§25mr§20mm§840枚/包§1260枚/包§规格 30mm*20mm 送配套模板§规格25mm*13mm 送配套模板§数量每张84枚包10张总计840枚§数量每大张126枚一包10张总计1260枚§46mm§意制§任§1000枚/包§定§名称定制A4内割银不胶§规格46mm*11.1mm送配套模板§任意规格定制§每大张100枚包10张总计1000枚§包10张满5包送专属模板§适激光打印机打印油性笔书写§产品实拍§8格打印实拍展示(100mm*70mm)§上海荠骞文化用品固定资产标识卡§资产编号：§规格型号：§资产名称：§使用状态：§资产类别：§资产原值§存放地点§生产厂家：§使用人§备§注：§*请爱护公司财产，不要随意撕毁此标签§16格全内容打印实拍展示§固定资产标识卡§资产名称§四层货架（平板）§资产编号§3F跑菜区§规格型号§1800×500×1500§使用部门§财务部§使用时间§2019-04-26§李强§21格手写款打印展示 (60mm*40mm)§固定资标识卡§36格打印实拍展示(40mm*30mm)§固定资产标签§名称:§编号:§部门:§40格打印实拍展示(45.7mm*25.4mm)§固定资§名称：电脑§编号：20210§部门：财务部§20210201§使用人：我最强§八：找最强§编号：20210201§65格打印实拍展示(38mm*21mm)§名称：§编号：§数量：§数量:§100格打印实拍展示(46mm*11.1mm)§客服电话：159 9569 3815§: 159 9569 3815§.§客服电话：159 9569§客服电话：1599§客服电话§服电话：159 9569 3815§话：159 9569 3815§客服电话：1599569 3815§电话：159 9569 3815§9569 3815§159 9569 3815§客服电话：§低值易耗品标识牌(70mm*50mm)§购买日期§保管部门§责任人§生产厂家§不要随意撕毁此标牌*§*请爱护公司财产，不要随意撕导§品标识牌§低值易耗品标识牌§随意撕毁此标牌*§*请爱护公司财产，不要随意撕毁此标牌*§三人沙发§行政酒廊§2200*860*900§2018-07-23§应用范围§多用于产品信息固有资产登记航空仓库管理 医疗政府机构等§Mainly used for product information inherent assets registration, aviation warehouse management, medi§cal government institutions, etc§政府单位§企业办公§仓储行业§医疗器械§教育单位§耐用品§电子产品包装§商城卖场";

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


# 针对 toCharArray 的改进

## 思路

我们尽量避免 toCharArray，使用原始的字符串 string.charAt 替代。

不过这个 charAt 有一点不太好：

```java
public char charAt(int index) {
    if ((index < 0) || (index >= value.length)) {
        throw new StringIndexOutOfBoundsException(index);
    }
    return value[index];
}
```

如果 jdk 能提供一个直接访问的方法将完美，可惜去不得。

## 好处

带来的好处就是节省了 toCharArray 带来的方法+内存消耗。

## 修改点

修改点比较多，涉及到的地方够改掉了。

遗憾的是破坏了两个带 chars 的接口，接口本身设计的不够好。

`ISensitiveWordCharIgnore` 和 `IWordReplace` 

从原始的 chars->text

## 效果

新代码，同样1w次循环，耗时 508.8ms，明细：

```
792
456
449
410
437
```

和 v0.28.0 对比提升了多少倍呢？大概 14 倍

7139.4 ÷ 508.8 ≈ 14.03

## 反思

这个大概率是每次 case 都一样，导致 jvm 优化效果很不错。

## 随机测试

我们来用随机，对比测试一下

### 测试 CASE

```java
    public static void main(String[] args) {
        for(int k = 0; k < 5; k++) {
            // 1W 次
            long start = System.currentTimeMillis();
            for(int i = 0; i < 10000; i++) {
                String randomText = "产品尺寸参数§60mn§50mm§210枚/包§160枚/包§名称A4银色不干胶§规格60mm*40mm 送配套模板§规格70mm*50mm 送配套模板§数量每大张21枚一包10张总计210枚§数量每大张16枚一包10张总计160枚§适用激光打印机打印油性笔书写§95mm§100mn§55mm§100枚/包§80枚/包§名称 A4银色不干胶§规格95mm*55mm 送配套模板§规格100mm*70mm 送配套模板§数量每大张10枚一包10张总计100枚§数量 每大张8枚一包10张 总计80枚§100mm§120枚/包§140枚/包§规格80mm*50mm 送配套模板§规格100mm*40mm 送配套模板§数量每大张12枚一包10张总计120枚§数量§每大张14枚包10张总计140枚§适用 激光打印机打印油性笔书写§40mm§65mm§70mm§35mm§200枚/包§240枚/包§规格70mm*40mm送配套模板§规格§65mm*35mm 送配套模板§数量 每大张20枚一包10张总计200枚§每大张24枚包10张总计240枚§适 激光打印机打印油性笔书写§适用§激光打印机打印油性笔书写§40mn§280枚/包§360枚/包§规格50mm*40mm 送配套模板§规格40mm*30mm 送配套模板§数量每大张28枚一包10张总计280枚§数量每大张36枚一包10张总计360枚§45.7mm§38.1mm§400枚/包§650枚/包§45.7mm*25.4mm送配套模板§38.1mm*21.2mm 送配套模板§每大张40枚一包10张总计400枚§数量每大张65枚一包10张总计650枚§30mm§25mr§20mm§840枚/包§1260枚/包§规格 30mm*20mm 送配套模板§规格25mm*13mm 送配套模板§数量每张84枚包10张总计840枚§数量每大张126枚一包10张总计1260枚§46mm§意制§任§1000枚/包§定§名称定制A4内割银不胶§规格46mm*11.1mm送配套模板§任意规格定制§每大张100枚包10张总计1000枚§包10张满5包送专属模板§适激光打印机打印油性笔书写§产品实拍§8格打印实拍展示(100mm*70mm)§上海荠骞文化用品固定资产标识卡§资产编号：§规格型号：§资产名称：§使用状态：§资产类别：§资产原值§存放地点§生产厂家：§使用人§备§注：§*请爱护公司财产，不要随意撕毁此标签§16格全内容打印实拍展示§固定资产标识卡§资产名称§四层货架（平板）§资产编号§3F跑菜区§规格型号§1800×500×1500§使用部门§财务部§使用时间§2019-04-26§李强§21格手写款打印展示 (60mm*40mm)§固定资标识卡§36格打印实拍展示(40mm*30mm)§固定资产标签§名称:§编号:§部门:§40格打印实拍展示(45.7mm*25.4mm)§固定资§名称：电脑§编号：20210§部门：财务部§20210201§使用人：我最强§八：找最强§编号：20210201§65格打印实拍展示(38mm*21mm)§名称：§编号：§数量：§数量:§100格打印实拍展示(46mm*11.1mm)§客服电话：159 9569 3815§: 159 9569 3815§.§客服电话：159 9569§客服电话：1599§客服电话§服电话：159 9569 3815§话：159 9569 3815§客服电话：1599569 3815§电话：159 9569 3815§9569 3815§159 9569 3815§客服电话：§低值易耗品标识牌(70mm*50mm)§购买日期§保管部门§责任人§生产厂家§不要随意撕毁此标牌*§*请爱护公司财产，不要随意撕导§品标识牌§低值易耗品标识牌§随意撕毁此标牌*§*请爱护公司财产，不要随意撕毁此标牌*§三人沙发§行政酒廊§2200*860*900§2018-07-23§应用范围§多用于产品信息固有资产登记航空仓库管理 医疗政府机构等§"
                        + RandomUtil.randomString("1234567890bcdefghiJKLMNOPQRSTUVWXYZ", 100);
                SensitiveWordHelper.findAll(randomText);
            }
            long end = System.currentTimeMillis();
            System.out.println(end-start);
        }
    }
```

### 新代码

实际测试发现这个在文本长的时候，效果更显著。应该是 toCharArray 的代价更高

5次均值 1785.2：

```
2308
1621
1595
1664
1738
```

### v0.28.0

5 次均值：7636.4

```
8438
7463
7404
7436
7441
```

### 总结

这个测试文本量，效果大概提升 4 倍

文本越长，效果越显著。


# 查看一次耗时

## 说明

无论是整体跑，还是单个跑，都会发现第一次明显比较慢。

多次跑应该是 jvm 优化，我们来看一下单词的

我们回到问题的最开始，看的出来平均耗时优化了，但是初始化耗时还是这么慢。

## 跑5次

5 次效果如下：

```
21
1
1
1
1
```

单词跑有个问题，前面的 wordBs 初始化干扰太大，我们暂时用加耗时的方法来处理下。

第二个问题：mills 不够精确，可以用 nanoTime 替代。

## 我们改为 nanoTime 跑5次

看起来 ms 差不多，实际上还是差很多的。

```
13518800
2854600
1836900
1503900
925400
```

我们重点看一下第一次为什么这么慢。

## 子方法耗时拆分

演示一下，二分法：

```java
public <R> List<R> findAll(final String target, final IWordResultHandler<R> handler) {
//        ArgUtil.notNull(handler, "handler");

        long s1 = System.nanoTime();
        List<IWordResult> wordResults = sensitiveWord.findAll(target, context);
        System.out.println(System.nanoTime()-s1);

        long s2 = System.nanoTime();
        List<R> res = CollectionUtil.toList(wordResults, new IHandler<IWordResult, R>() {
            @Override
            public R handle(IWordResult wordResult) {
                return handler.handle(wordResult, context, target);
            }
        });
        System.out.println(System.nanoTime()-s2);
        return res;
    }
```

耗时：

```
17042800  #findAll
 2316800  #handle
22018600  #total
```

不过有一个问题，这个不太稳定。只能看比例。

很离谱的一个点：

中间只隔了下面的方法，耗时 3ms。

```java
public List<String> findAll(final String target) {
    return findAll(target, WordResultHandlers.word());
}
```

## 原因

所以第一次请求，涉及到了

JVM 类和方法还没加载：第一次调用 sensitiveWord.findAll 可能会触发类加载、静态初始化。

JIT（即时编译）没起作用：第一次运行是解释执行，速度慢。

热点优化没完成：JIT 会把频繁调用的方法编译成本地代码，但需要多次调用才会触发。

## 解决方案

其实也不难，可以提前调预热一下。

在 init() 的时候，指定预热策略，简单的触发一下。

避免不太懂的性能测试的伙伴执着于第一次的问题。

策略支持用户自定义。

## 效果

优化后的效果，还是会有一些，不过可以接受。

```java
4520900
2804500
2493600
976000
1011100
```

和 v0.28.0 对比

```
20762000
3903400
3401200
8672000
7852000
```

第一次峰值从 20ms=>5ms 左右。

## 反思

jvm 的内置优化过于强求暂时意义不大，还是推荐性能压测先做预热。


* any list
{:toc}