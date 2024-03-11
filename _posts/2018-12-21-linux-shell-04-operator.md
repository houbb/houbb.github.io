---
layout: post
title: linux Shell 命令行-04-operator Shell 操作符
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



# 操作符

原始的 bash 不支持数学运算，我们可以使用 ```expr``` 来代替。

注意：

1. 在```expr```中使用 **`**，而不是 **'**
2. 数字之间的运算符应该用空格分隔。

# 数字运算

- num_oper.sh

```shell
#!/bin/bash

# 数值操作

value1=10
value2=20
sum=`expr $value1 + $value2`
echo "数值 $value1 和 $value2 的和是: $sum"
```

- 运行

```shell
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x num_oper.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./ num_oper.sh
数值 10 和 20 的和是: 30
```

# 数学运算符

假设： `$a` 是 10，`$b` 是 20

| 命令       |   描述        | 示例      |
| :------------ |:----------    | :-----    |
|+	|加法         |	`expr $a + $b` 结果为 30|
|-	|减法         |	`expr $a - $b` 结果为 -10|
|*	|乘法         |  `expr $a \* $b` 结果为  200|
|/	|除法         |  `expr $b / $a` 结果为 2|
|%	|取余         |	`expr $b % $a` 结果为 0|
|=	|赋值         |	a=$b 将把变量 b 的值赋给 a|
|==	|用于比较两个数字，相同则返回 true|	[ $a == $b ] 返回 false|
|!=	|用于比较两个数字，不相同则返回 true|	[ $a != $b ] 返回 true|

# 关系运算符

仅支持数字或数字字符串。

假设： `$a` 是 10，`$b` 是 20

| 命令       |   描述        | 示例      |
| :------------ |:----------    | :-----    |
|-eq| 相等        |	[ $a -eq $b ]  false
|-ne| 不相等    |	[ $a -ne $b ]  true
|-gt| 大于    |	[ $a -gt $b ]  false
|-lt| 小于    |	[ $a -lt $b ]  true
|-ge| 大于等于	|   [ $a -ge $b ]  false
|-le| 小于等于	|   [ $a -le $b ]  true

# 布尔运算符

| 命令       |   描述        | 示例          |
| :------------ |:----------    | :---------    |
|   !   | 非       | [ ! false ]  true         |
|   -o  | 或        | [ true -o false ] true    |
|   -a  | 与       | [ true and false ] false  |
|   `&&`  | 与       | [ true and false ] false  |
|   `||`  | 或       | [ true and false ] false  |

# 字符串运算符

假设： `$a` 是 "10"，`$b` 是 "20"

| 命令       |   描述        | 示例          |
| :------------ |:----------    | :---------    |
|=	|检测两个字符串是否相等，相等返回 true|	[ $a = $b ] 返回 false。
|!=	|检测两个字符串是否相等，不相等返回 true|	[ $a != $b ] 返回 true。
|-z	|检测字符串长度是否为0，为0返回 true|	[ -z $a ] 返回 false。
|-n	|检测字符串长度是否为0，不为0返回 true|	[ -n $a ] 返回 true。
|str|	检测字符串是否为空，不为空返回 true|	[ $a ] 返回 true。

# 文件测试运算符

| 命令       |   描述        |
| :------------ |:----------    |
-b file|	检测文件是否是块设备文件，如果是，则返回 true|
-c file|	检测文件是否是字符设备文件，如果是，则返回 true|
-d file|	检测文件是否是目录，如果是，则返回 true|
-f file|	检测文件是否是普通文件（既不是目录，也不是设备文件），如果是，则返回 true|
-g file|	检测文件是否设置了 SGID 位，如果是，则返回 true|
-k file|	检测文件是否设置了粘着位(Sticky Bit)，如果是，则返回 true|
-p file|	检测文件是否是具名管道，如果是，则返回 true|
-u file|	检测文件是否设置了 SUID 位，如果是，则返回 true|
-r file|	检测文件是否可读，如果是，则返回 true|
-w file|	检测文件是否可写，如果是，则返回 true|
-x file|	检测文件是否可执行，如果是，则返回 true|
-s file|	检测文件是否为空（文件大小是否大于0），不为空返回 true|
-e file|	检测文件（包括目录）是否存在，如果是，则返回 true|

- file_test_oper.sh

```shell
#!/bash/sh

# 文件测试运算符

file="/Users/houbinbin/code/shell/file_test_oper.sh"

if [ -r $file ]
then
   echo "文件可读"
else
   echo "文件不可读"
fi
if [ -w $file ]
then
   echo "文件可写"
else
   echo "文件不可写"
fi
if [ -x $file ]
then
   echo "文件可执行"
else
   echo "文件不可执行"
fi
if [ -f $file ]
then
   echo "文件为普通文件"
else
   echo "文件为特殊文件"
fi
if [ -d $file ]
then
   echo "文件是个目录"
else
   echo "文件不是个目录"
fi
if [ -s $file ]
then
   echo "文件不为空"
else
   echo "文件为空"
fi
if [ -e $file ]
then
   echo "文件存在"
else
   echo "文件不存在"
fi
```

- 运行

```shell
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh file_test_oper.sh
文件可读
文件可写
文件不可执行
文件为普通文件
文件不是个目录
文件不为空
文件存在
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}