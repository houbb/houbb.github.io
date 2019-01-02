---
layout: post
title: linux diff
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux diff 命令 对比文件之间的差异
---

# linux diff

Linux diff命令用于比较文件的差异。

diff以逐行的方式，比较文本文件的异同处。如果指定要比较目录，则diff会比较目录中相同文件名的文件，但不会比较其中子目录。

# 命令

# 实际使用

随便创建2个文件，测试了下文件的对比：

```
$   diff 1.txt 2.txt
```

结果如下

```
λ diff 1.txt 2.txt
3c3,4
< eddd
\ No newline at end of file
---
> eddd
> 7879879
\ No newline at end of file
```

## 说明

`|` 表示前后2个文件内容有不同

`<` 表示后面文件比前面文件少了1行内容

`>` 表示后面文件比前面文件多了1行内容

# 拓展思考

linux diff 这个命令很强大，但是不够实用直观方便。

比如 compare2 这个工具，就是日常工作中经常会用到的对比工具。

linux 的每一个命令都非常的经典，我们可以在这个基础上进行拓展优化，让其从方法变成一个产品。

# 参考资料

http://www.runoob.com/linux/linux-comm-diff.html

* any list
{:toc}