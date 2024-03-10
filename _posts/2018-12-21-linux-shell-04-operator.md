---
layout: post
title: linux Shell 命令行-04-operator Shell 操作符
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

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

# Shell Order

> echo

```
echo [-e] string
```

> printf

just like printf() of ```C```

```
printf  format-string  [arguments...]
```

> test

- test_num.sh

```
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

run

```
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh test_num.sh
两个数相等！
```

- test_str.sh

```
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

run

```
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh test_str.sh
两个字符串相等!
```

- test_file.sh

```
#!/bin/bash

if test -e /bin/bash
then
    echo '文件已存在!'
else
    echo '文件不存在!'
fi
```

run

```
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