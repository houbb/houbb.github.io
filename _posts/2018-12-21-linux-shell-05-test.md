---
layout: post
title: linux Shell 命令行-05-test 检查某个条件是否成立
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---


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

# Flow Control

> If Else

- if

```
if condition
then
    command1
    command2
    ...
    commandN
fi
```

- if else

```
if condition
then
    command1
    command2
    ...
    commandN
else
    command
fi
```

- if else-if else

```
if condition1
then
    command1
elif condition2
then
    command2
else
    commandN
fi
```

demo

```
echo "please enter your age"
read age

if [[ $age -le 0 ||  $age -ge 100 ]]
then
echo "that's crazy!"

elif [ $age -le 20 ]
then
echo "little boy"

elif [[ $age -gt 20 &&  $age -le 40 ]]
then
echo "good time"

else
echo "be yourself"

fi
```

> for

```
for loop in "hello" "boy" "see" "you" "sometimes" "somewhere"
do
echo "the word is $loop"
done
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x for.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./for.sh
the word is hello
the word is boy
the word is see
the word is you
the word is sometimes
the word is somewhere
```

> While

```
while condition
do
    command
done
```

demo

```
#!/bin/sh

# while demo

val=1
while( $val < 5 )
do
    echo "val: $val"
    let "val++"
done
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ ./while.sh
val: 1
val: 2
val: 3
val: 4
```

> case

```
case val in
mode1)
    command1
    command2
    ...
    commandN
    ;;
mode2）
    command1
    command2
    ...
    commandN
    ;;
esac
```

demo

```
#!/bin/sh

# case demo

echo "please enter a num(1-4)"

echo you enter:

read num

case $num in
1)
    echo "Enter one"
    ;;
2)
    echo "Enter two"
    ;;
3)
    echo "Enter three"
    ;;
4)
    echo "Enter four"
    ;;

*)
    echo "Your enter is out of range"
    ;;
esac
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ vi case.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./case.sh
please enter a num(1-4)
you enter:
1
Enter one
```


> beak

```
#!/bin/sh

# break demo

for num in 1 2 3 4 5
do
    if [ $num -eq 4 ]
    then
    break
    fi
    echo "num is: $num"
done
```

run

```
houbinbindeMacBook-Pro:shell houbinbin$ ./break.sh
num is: 1
num is: 2
num is: 3
```

> continue

```
#!/bin/sh

# continue demo

for num in 1 2 3 4 5
do
    if [ $num -eq 4 ]
    then
    continue
    fi
    echo "num is: $num"
done
```

run

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