---
layout: post
title: linux Shell 命令行-09-redirect 重定向
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

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