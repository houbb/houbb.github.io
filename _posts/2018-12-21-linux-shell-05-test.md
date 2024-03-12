---
layout: post
title: linux Shell 命令行-05-test 检查某个条件是否成立
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 拓展阅读

[linux Shell 命令行-00-intro 入门介绍](https://houbb.github.io/2018/12/21/linux-shell-01-intro)

[linux Shell 命令行-02-var 变量](https://houbb.github.io/2018/12/21/linux-shell-02-var)

[linux Shell 命令行-03-array 数组](https://houbb.github.io/2018/12/21/linux-shell-03-array)

[linux Shell 命令行-04-operator 操作符](https://houbb.github.io/2018/12/21/linux-shell-04-operator)

[linux Shell 命令行-05-test 验证是否符合条件](https://houbb.github.io/2018/12/21/linux-shell-05-test)

[linux Shell 命令行-06-flow control 流程控制](https://houbb.github.io/2018/12/21/linux-shell-06-flow-control)

[linux Shell 命令行-07-func 函数](https://houbb.github.io/2018/12/21/linux-shell-07-func)

[linux Shell 命令行-08-file include 文件包含](https://houbb.github.io/2018/12/21/linux-shell-08-file-include)

[linux Shell 命令行-09-redirect 重定向](https://houbb.github.io/2018/12/21/linux-shell-09-redirect)


# 基本输出 

## echo

```
echo [-e] 字符串
```

## printf

类似于 ```C``` 的 printf() 函数

```
printf  格式化字符串  [参数...]
```

# test 测试条件是否成立

## 数字

- test_num.sh

```bash
#!/bin/bash

num1=100
num2=100
if test $[num1] -eq $[num2]
then
    echo '两个数相等！'
else
    echo '两个数不相等！'
fi
```

运行

```bash
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh test_num.sh
两个数相等！
```

## 字符串

- test_str.sh

```bash
#!/bin/bash

num1="runoob"
num2="runoob"
if test num1=num2
then
    echo '两个字符串相等!'
else
    echo '两个字符串不相等!'
fi
```

运行

```bash
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh test_str.sh
两个字符串相等!
```

## 文件

- test_file.sh

```bash
#!/bin/bash

if test -e /bin/bash
then
    echo '文件已存在!'
else
    echo '文件不存在!'
fi
```

运行

```bash
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh test_file.sh
文件已存在!
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}