---
layout: post
title: linux Shell 命令行-11-linux 如何顺序执行多个 shell 脚本？ linux 命令？
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


# 场景

希望顺序执行多个 shell 命令。

# 实现方式

在 Linux Shell 脚本中，可以通过使用逻辑操作符 `&&` 来确保只有第一个命令成功后才执行第二个命令。

```sh
#!/bin/bash

# 第一个命令
command1 && command2
```

command1 成功执行（返回值为 0），则执行 command2。

如果 command1 失败（返回值不为 0），则 command2 不会被执行。

# 增强版本

如果需要在 command1 失败时输出错误信息并中断脚本，可以使用以下方式：

```sh
#!/bin/bash

# 第一个命令
command1
if [ $? -ne 0 ]; then
    echo "command1 执行失败，脚本中断。"
    exit 1
fi

# 第二个命令
command2
```

# 换行的方式要怎么写？

在 Linux Shell 脚本中，如果需要用 `&&` 将多个命令换行写，可以使用 反斜杠 `\` 来表示命令未结束，让脚本更整齐易读。

```sh
#!/bin/bash

command1 && \
command2 && \
command3
```

解释：

反斜杠 `\` 用于连接换行的命令，表示当前命令未结束。

每一行的最后都需要加 `\`，除了最后一行。

## 实际案例：

假设你要依次启动三个服务，确保前一个服务启动成功后才启动下一个：

```sh
#!/bin/bash

echo "启动服务1..." && \
service service1 start && \
echo "服务1已启动成功" && \
service service2 start && \
echo "服务2已启动成功" && \
service service3 start && \
echo "服务3已启动成功"
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}