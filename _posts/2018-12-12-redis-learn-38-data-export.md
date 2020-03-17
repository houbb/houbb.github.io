---
layout: post
title: Redis Learn-38-Redis 导出需要的数据
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 业务背景

需要将 redis 特定的 keys 统计下次数。

并且最好能把 key/value 都统计出来。

# 如何统计出现的次数

首先，不能使用 keys，会直接导致阻塞。

这里推荐使用 scan

```
./redis-cli -h xxx -p xxx -a xxx --scan --pattern 'xxx_*'  |  wc -l
```

这里输入你对应的地址，和正则表达式，可以匹配出对应的出现的次数。

## 具体的 key

如果想看具体的值

```
./redis-cli -h xxx -p xxx -a xxx --scan --pattern 'xxx_*' 
```

直接去掉最后一个次数的统计即可。

# 持久化到文件

我想把对应的 keys 直接持久化到文件：

```
./redis-cli -h xxx -p xxx -a xxx --scan --pattern 'xxx_*'  >> temp.log
```

# 如何获取对应的 value

这点需要动一点小技巧，不过性能目前个人感觉不高。

因为要不断的获得连接。

```sh
#/bin/bash
 
printf "*************************************\n"
echo "cat file while read line"
cat temp.log | while read line
do
  echo "get $line" | ./redis-cli -h xxx -p xxx -a xxx  >> temp_value.txt;
done
```

这里是直接遍历每一行的文件内容，然后连上 redis 客户端执行 `get xxx` 的命令，最后将文件输出到 `temp_value.txt` 文件中。

这里有个很大的问题就是执行的次数较多，会导致无法连接。

# 参考资料

[redis命令行导出val到文件](https://blog.csdn.net/qq_27563511/article/details/83625072)

[导出redis中的特定 key值中的结果 并输出到文件](https://blog.csdn.net/lys07962000/article/details/53671350)

* any list
{:toc}