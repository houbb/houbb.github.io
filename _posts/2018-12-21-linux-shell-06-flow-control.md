---
layout: post
title: linux Shell 命令行-06-flow control 流程控制
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---


# 流程控制

# If Else

## if

```sh
if 条件
then
    命令1
    命令2
    ...
    命令N
fi
```

## if else

```sh
if 条件
then
    命令1
    命令2
    ...
    命令N
else
    命令
fi
```

## if else-if else

```sh
if 条件1
then
    命令1
elif 条件2
then
    命令2
else
    命令N
fi
```

演示

```sh
echo "请输入你的年龄"
read age

if [[ $age -le 0 ||  $age -ge 100 ]]
then
echo "这太疯狂了!"

elif [ $age -le 20 ]
then
echo "小孩子"

elif [[ $age -gt 20 &&  $age -le 40 ]]
then
echo "好时光"

else
echo "做自己"

fi
```

# for

```sh
for 循环变量 in "hello" "boy" "see" "you" "sometimes" "somewhere"
do
echo "单词是 $循环变量"
done
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x for.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./for.sh
单词是 hello
单词是 boy
单词是 see
单词是 you
单词是 sometimes
单词是 somewhere
```

# While

```sh
while 条件
do
    命令
done
```

演示

```sh
#!/bin/sh

# while 演示

val=1
while( $val < 5 )
do
    echo "val: $val"
    let "val++"
done
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ ./while.sh
val: 1
val: 2
val: 3
val: 4
```

# case

```sh
case 变量名 in
模式1)
    命令1
    命令2
    ...
    命令N
    ;;
模式2）
    命令1
    命令2
    ...
    命令N
    ;;
esac
```

演示

```sh
#!/bin/sh

# case 演示

echo "请输入一个数字（1-4）"

echo 你输入的是:

read num

case $num in
1)
    echo "输入了一"
    ;;
2)
    echo "输入了二"
    ;;
3)
    echo "输入了三"
    ;;
4)
    echo "输入了四"
    ;;

*)
    echo "你的输入超出范围"
    ;;
esac
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi case.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./case.sh
请输入一个数字（1-4）
你输入的是:
1
输入了一
```


# break

```sh
#!/bin/sh

# break 演示

for num in 1 2 3 4 5
do
    if [ $num -eq 4 ]
    then
    break
    fi
    echo "num is: $num"
done
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ ./break.sh
num is: 1
num is: 2
num is: 3
```

# continue

```sh
#!/bin/sh

# continue 演示

for num in 1 2 3 4 5
do
    if [ $num -eq 4 ]
    then
    continue
    fi
    echo "num is: $num"
done
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ ./continue.sh
num is: 1
num is: 2
num is: 3
num is: 5
```

# Func

```
[ function ] funname [()]

{

    action;

    [return int;]

}
```

demo

```
#!/bin/sh

# function demo

firstFunc() {
    echo "This is my first shell function."
}

echo "function start"
firstFunc
echo "function end"
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ vi function.sh
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x function.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./function.sh
function start
This is my first shell function.
function end
```


- function with return value

```
#!/bin/sh


# func with return val

funcWithReturnVal() {
    echo "enter first num: "
    read firstNum
    echo "enter second num: "
    read secondNum
    return $(($firstNum+$secondNum))
}

echo "function with return value start:"
funcWithReturnVal
returnVal=$?
echo "result: $returnVal"
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ ./funcWithReturnVal.sh
function with return value start:
enter first num:
1
enter second num:
2
result: 3
```

- function with parameters

```
#!/bin/sh

# function with param

hasParam() {
    echo "all param is $*"

    if [ $# -gt 0 ]
    then
    echo "has param"
    return 1
    else
    echo "has no param"
    return 0
    fi
}

hasParam 1 2 3
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ vi funcWithParam.sh
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x funcWithParam.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./funcWithParam.sh
all param is 1 2 3
has param
```

```$n``` to get the param value, when n >= 10, use ```${n}```!

# File Include

- data.sh

```
#!/bin/sh

name="houbinbin"
```

- include.sh

use ```. ./data.sh``` or ```source ./data.sh``` to include the file

```
#!/bin/sh

source ./data.sh

echo "the name is: $name"
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x include.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./include.sh
the name is: houbinbin
```

# Redirect

| Command       |   Desc        |
| :------------ |:----------    |
| command > file  | out->file    |
| command < file  | in->file     |
| command >> file | out append->file |
| n > file        | file descriptor `n` ->file |
| n >> file        | file descriptor `n` append->file |
| n >& m           | out file m&n merge |
| n <& m           | in file m&n merge  |
| << tag           | content between tag for input |

> File descriptor

```
0   //stdIn
1   //stdOut
2   //stdErr
```

- Out Redirect

```
houbinbindeMacBook-Pro:shell houbinbin$ ls > ls_file
houbinbindeMacBook-Pro:shell houbinbin$ cat ls_file
break.sh
case.sh
continue.sh
data.sh
diff_demo.sh
file_test_oper.sh
for.sh
funcWithParam.sh
funcWithReturnVal.sh
function.sh
hello.sh
hello_name.sh
if_else.sh
include.sh
ls_file
num_oper.sh
readonly_var.sh
special_var.sh
test_file.sh
test_num.sh
unset_var.sh
use_var.sh
while.sh
```


- In Redirect

We want to calc the line of file ```ls_file```

```
houbinbindeMacBook-Pro:shell houbinbin$ wc -l ls_file
      23 ls_file
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}