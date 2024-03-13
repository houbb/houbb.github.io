---
layout: post
title: linux Shell 命令行-09-redirect 重定向
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


# 重定向

| 命令         |   描述        |
| :------------ |:----------    |
| command > file  | 输出重定向到文件    |
| command < file  | 输入重定向自文件    |
| command >> file | 输出追加重定向到文件 |
| n > file        | 文件描述符 `n` -> 文件 |
| n >> file       | 文件描述符 `n` 追加 -> 文件 |
| n >& m         | 输出文件 `m` 和 `n` 合并 |
| n <& m         | 输入文件 `m` 和 `n` 合并  |
| << tag         | 输入重定向，标记之间的内容作为输入 |

# 文件描述符

```
0   //标准输入
1   //标准输出
2   //标准错误输出
```

# 输出重定向

```bash
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

# 输入重定向

我们想计算文件 ```ls_file``` 的行数

```bash
houbinbindeMacBook-Pro:shell houbinbin$ wc -l ls_file
      23 ls_file
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}