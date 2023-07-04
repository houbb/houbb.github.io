---
layout: post
title: java 性能压测 ArrayList Iter 内存占用问题
date:  2023-06-05 +0800
categories: [Basic]
tags: [basic, xml, sh]
published: true
---

# 测试代码

开启 10 个线程，然后每一个循环 50W 次。

```java
    public void commonThreadTest() throws InterruptedException {
        final String expect = "mobile:130****7777|9FC4D36D63D2B6DC5AE1297544FBC5A2; bankCard:6217***********5024|444F49289B30944AB8C6C856AEA21180, email:mahu*****@qq.com|897915594C94D981BA86C9E83ADD449C, amount:123.00, IdNo:3****************6|F9F05E4ABB3591FC8EA481E8DE1FA4D6, name1:李*|15095D14367F7F02655030D498A4BA03, name2:李**|035E3C0D1A0410367FE6EB8335B2BFDE, name3:李泽**|B87138E5E80AEC87D2581A25CAA3809D, name4:山东***|6F2178D34BC7DD0A07936B5AFF39A16F, birthday:20220517, GPS:**********|E281A9A52DE915154285148D68872CA2, IPV4:127******|F528764D624DB129B32C21FBCA0CB8D6, address:中国上海市徐******|821A601949B1BD18DCBAAE27F2E27147;";

        // 全部
        long start = System.currentTimeMillis();

        //10
        int threadNum = 10;
        final int times = 500000;
        ExecutorService executorService = Executors.newFixedThreadPool(threadNum);
        final CountDownLatch countDownLatch = new CountDownLatch(threadNum);

        for(int i = 0; i < 10; i++) {
            executorService.execute(new Runnable() {
                @Override
                public void run() {
                    //do loop
                    for(int i = 0; i < times; i++) {
                        CharsScanBs charsScanBs = CharsScanBs.newInstance()
                                .charsScanFactory(CharsScans.defaults())
                                .charsReplaceFactory(CharsReplaces.defaults())
                                .charsCore(CharsCores.common())
                                .init();

                        String result = charsScanBs.scanAndReplace(TEST_LOG);
                        Assert.assertEquals(expect, result);
                    }

                    countDownLatch.countDown();
                }
            });
        }

        countDownLatch.await();
        long end = System.currentTimeMillis();

        System.out.println((end-start));
    }
```

## 开启 jvisiual

```
cd C:\Program Files\Java\jdk1.8.0_192\bin
```

执行 `jvisualvm.exe` 运行。

# 大对象

## java.util.ArrayList$Itr

会有这样一个对象比较占内存，就很奇怪。

## 原理

因为 java for 循环增强，比如：

```java
for(ICharsScan charsScan : charsScanList) {
    // 需要判空
    List<CharsScanMatchItem> itemList = charsScan.getMatchList();
    if(CollectionUtil.isNotEmpty(itemList)) {
        resultList.addAll(itemList);
    }
}
```

实际会被编译为 class 文件：

```java
List<CharsScanMatchItem> resultList = new ArrayList();
Iterator var9 = charsScanList.iterator();

while(var9.hasNext()) {
    ICharsScan charsScan = (ICharsScan)var9.next();
    List<CharsScanMatchItem> itemList = charsScan.getMatchList();
    if (CollectionUtil.isNotEmpty(itemList)) {
        resultList.addAll(itemList);
    }
}
```

## Iterator 意味着什么

要理解 `Iterator var9 = charsScanList.iterator();` 做了什么，我们只需要看一下 ArrayList 的源码.

```java
/**
 * Returns an iterator over the elements in this list in proper sequence.
 *
 * <p>The returned iterator is <a href="#fail-fast"><i>fail-fast</i></a>.
 *
 * @return an iterator over the elements in this list in proper sequence
 */
public Iterator<E> iterator() {
    return new Itr();
}
```

这里增强的 for 循环就会创建这样一个对象，如果不希望有这个对象可以使用原始的 for 循环。

# vm option 指定 jvm 大小

```
-Xms2g -Xmx2g
```

或者小一点

```
-Xms256m -Xmx256m
```

# 参考资料

https://blog.csdn.net/xixi8865/article/details/23849125

* any list
{:toc}