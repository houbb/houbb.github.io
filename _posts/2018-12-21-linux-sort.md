---
layout: post
title: linux sort 排序
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [vim, linux, sh]
published: true
---

# 排序功能

我们经常需要对查询的结果进行排序。

sort 命令可以很方便的帮助我们


# 命令

## 用途

## 用法

```
sort [-bcdfimMnr][-o<输出文件>][-t<分隔字符>][+<起始栏位>-<结束栏位>][--help][--verison][文件]
```


## 参数说明：

```
-b 忽略每行前面开始出的空格字符。
-c 检查文件是否已经按照顺序排序。
-d 排序时，处理英文字母、数字及空格字符外，忽略其他的字符。
-f 排序时，将小写字母视为大写字母。
-i 排序时，除了040至176之间的ASCII字符外，忽略其他的字符。
-m 将几个排序好的文件进行合并。
-M 将前面3个字母依照月份的缩写进行排序。
-n 依照数值的大小排序。
-o<输出文件> 将排序后的结果存入指定的文件。
-r 以相反的顺序来排序。
-t<分隔字符> 指定排序时所用的栏位分隔字符。
+<起始栏位>-<结束栏位> 以指定的栏位来排序，范围由起始栏位到结束栏位的前一栏位。
--help 显示帮助。
--version 显示版本信息。
```

# 实际例子

## swap 信息

查看 swap 信息，但是大部分都是 0 

- 命令 

```
$ cat /proc/140850/smaps | grep Swap | sort 
```

- 效果

```
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:               1284 kB
Swap:                  4 kB
Swap:                744 kB
```

## 统计日志耗时

日志中统计了耗时信息，但是又没有入 oracle，产线上怎么统计耗时？

利用正则表达式。参考 [grep](https://houbb.github.io/2018/12/21/linux-grep)

- 命令

```
$egrep -o  'eInteval:[0-9]{1,}ms' application.2019-08-02-*.log | sort -n | uniq  -c
```

其中 sort 进行排序，egrep 进行正则匹配。uniq 保证最后的结果分组，并且记录总数。

效果如下：

```
   1980 eInteval:0ms
      4 eInteval:100ms
      2 eInteval:101ms
      3 eInteval:102ms
      2 eInteval:103ms
      3 eInteval:104ms
      4 eInteval:106ms
      5 eInteval:107ms
      2 eInteval:108ms
    303 eInteval:10ms
    ....
```

## 如何保证按照自然排序

我们发现，这个排序不太符合我们的预期。

# 参考资料

[查看端口占用](https://www.cnblogs.com/hindy/p/7249234.html)

[linux-comm-sort](https://www.runoob.com/linux/linux-comm-sort.html)

[Linux下的sort排序命令详解(一)](https://www.cnblogs.com/longjshz/p/5794590.html)

* any list
{:toc}