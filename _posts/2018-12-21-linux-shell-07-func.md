---
layout: post
title: linux Shell 命令行-07-func 函数
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


# 函数

```
[ function ] 函数名 [()]

{

    动作;

    [返回值;]

}
```

示例

```sh
#!/bin/sh

# 函数演示

firstFunc() {
    echo "这是我的第一个 Shell 函数。"
}

echo "函数开始"
firstFunc
echo "函数结束"
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi function.sh
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x function.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./function.sh
函数开始
这是我的第一个 Shell 函数。
函数结束
```


# 带返回值的函数

```sh
#!/bin/sh


# 带返回值的函数

funcWithReturnVal() {
    echo "输入第一个数字: "
    read firstNum
    echo "输入第二个数字: "
    read secondNum
    return $(($firstNum+$secondNum))
}

echo "带返回值的函数开始:"
funcWithReturnVal
returnVal=$?
echo "结果: $returnVal"
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ ./funcWithReturnVal.sh
带返回值的函数开始:
输入第一个数字:
1
输入第二个数字:
2
结果: 3
```

# 带参数的函数

```sh
#!/bin/sh

# 带参数的函数

hasParam() {
    echo "所有参数为 $*"

    if [ $# -gt 0 ]
    then
    echo "有参数"
    return 1
    else
    echo "没有参数"
    return 0
    fi
}

hasParam 1 2 3
```

运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi funcWithParam.sh
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x funcWithParam.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./funcWithParam.sh
所有参数为 1 2 3
有参数
```

使用```$n```获取参数值，当 n >= 10 时，使用 ```${n}```！


# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}