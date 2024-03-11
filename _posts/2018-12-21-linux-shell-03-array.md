---
layout: post
title: linux Shell 命令行-03-array Shell 数组
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


# 定义

Shell 仅支持**单维**数组。

```
array=(值1 值2 ... 值n)
```

- array.sh

```shell
#!/bin/sh

# 数组演示
array=(a b "c" d)

# 另一种定义数组的方式

array_two[0]=a
array_two[1]=b
array_two[2]="c"
array_two[3]=d
```

# 读取

您可以这样从数组中读取：

```
${array_name[index]}
```

- read_array.sh

```shell
#!/bin/sh

# 从数组中读取

array=(a b c "d")
echo "第一个元素是 ${array[0]}"
echo "第二个元素是 ${array[1]}"
echo "第三个元素是 ${array[2]}"
echo "最后一个元素是 ${array[-1]}"
```

- 运行

```shell
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# chmod +x read_array.sh 
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# ./read_array.sh 
第一个元素是 a
第二个元素是 b
第三个元素是 c
最后一个元素是 d
```

# 读取所有元素

我们可以使用 ```*``` 或 ```@``` 来获取数组中的所有元素。

- read_all_array.sh

```shell
#!/bin/sh
# 读取数组中的所有元素

array=(a b c d)
echo "数组中的所有元素：${array[*]}"
echo "数组中的所有元素：${array[@]}"
```

- 运行

```shell
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# chmod +x read_all_array.sh 
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# ./read_all_array.sh 
数组中的所有元素：a b c d
数组中的所有元素：a b c d
```

# 数组长度

我们可以使用 ```${#array[*]}``` 或 ```${#array[@]}``` 来获取数组的大小。

- array_length.sh

```shell
!#/bin/sh
# 数组长度

array=(a b c d E)
echo "数组的大小为：${#array[*]}"
echo "数组的大小为：${#array[@]}"
```

- 运行

```shell
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# chmod +x array_length.sh 
root@iZuf60ahcky4k4nfv470juZ:~/code/shell# ./array_length.sh 
数组的大小为：5
数组的大小为：5
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}