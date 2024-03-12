---
layout: post
title: linux Shell 命令行-06-flow control 流程控制
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

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}