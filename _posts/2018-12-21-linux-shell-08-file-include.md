---
layout: post
title: linux Shell 命令行-08-file include 文件包含
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


# 文件包含

- data.sh

```bash
#!/bin/sh

name="houbinbin"
```

- include.sh

使用 ```. ./data.sh``` 或者 ```source ./data.sh``` 来包含文件

```bash
#!/bin/sh

source ./data.sh

echo "姓名是: $name"
```

运行

```bash
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x include.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./include.sh
姓名是: houbinbin
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}