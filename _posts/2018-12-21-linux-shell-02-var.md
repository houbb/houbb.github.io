---
layout: post
title: linux Shell 命令行-02-var 变量
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

- **变量名和```=```之间不能有空格**
- 必须以 [a-zA-Z] 开头，变量名可以包含```_```
- **不能包含标点符号**和关键字

```
my_name="houbinbin"
```

# 重新定义

已定义的变量可以重新定义

```
my_name="houbinbin"
my_name="ryo"
```

# 使用

- use_var.sh

```
my_name="houbinbin"
echo $my_name
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi use_var.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh use_var.sh
houbinbin
```

# 只读

```readonly```变量不能被更改。

- readonly_var.sh

```
# !/bin/bash

my_name="houbinbin"
readonly my_name

my_name="new name"
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi readonly_var.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh readonly_var.sh
readonly_var.sh: line 4: my_name: readonly variable
```

# 删除

使用 ```unset``` 来删除定义的变量。

- unset_var.sh

```
#!/bin/bash

my_name="ryo"
unset my_name
echo ${my_name}
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi unset_var.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh unset_var.sh

houbinbindeMacBook-Pro:shell houbinbin$
```

# 特殊变量

| 命令       |   描述        |
| :------------ |:----------    |
|$0	|当前脚本的文件名|
|$n	|传递给脚本或函数的参数。n 是一个数字，表示第几个参数。例如，第一个参数是$1，第二个参数是$2。|
|$#	|传递给脚本或函数的参数个数。|
|$*	|传递给脚本或函数的所有参数。|
|$@	|传递给脚本或函数的所有参数。被双引号(" ")包含时，与 $* 稍有不同，下面将会讲到。|
|$?	|上个命令的退出状态，或函数的返回值。|
|$$	|当前Shell进程ID。对于 Shell 脚本，就是这些脚本所在的进程ID。|


- special_var.sh

```
#!/bin/bash
echo "File Name: $0"
echo "First Parameter : $1"
echo "First Parameter : $2"
echo "Quoted Values: $@"
echo "Quoted Values: $*"
echo "Total Number of Parameters : $#"
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi special_var.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh special_var.sh hello world my
File Name: special_var.sh
First Parameter : hello
First Parameter : world
Quoted Values: hello world my
Quoted Values: hello world my
Total Number of Parameters : 3
```


> ```$*``` 和 ```$@```

```$*``` 和 ```$@``` 都表示传递给函数或脚本的所有参数，不被```""```包含时，都以"$1" "$2" … "$n" 的形式输出所有参数。

但是当它们被```""```包含时，```$*``` 会将所有的参数作为一个整体，以"$1 $2 … $n"的形式输出所有参数；```$@``` 会将各个参数分开，以"$1" "$2" … "$n" 的形式输出所有参数。

- diff_demo.sh

```
#!/bin/bash

# Author:houbinbin

echo "display of \$* "

for i in "$*";
do
    echo $i
done

echo "display of \$@ "
for i in "$@";
do
    echo $i
done
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi diff_demo.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh diff_demo.sh 1 2 3 4
display of $*
1 2 3 4
display of $@
1
2
3
4
houbinbindeMacBook-Pro:shell houbinbin$
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}