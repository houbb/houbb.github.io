---
layout: post
title: linux Shell 命令行-10-获取当前时间 date，以及获取执行结果 $?
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

希望每次拷贝文件的不会覆盖。保留文件信息。

并且输出执行的结果。

```sh
# 获取当前时间戳 
timeStr=$(date +%Y%m%d%H%M%S) 
echo "time: $timeStr" 

# 备份文件 cp -f source.jar "bak_${timeStr}.jar" 

# 上一次执行结果 
copyCode=$? 
if [ "$copyCode" -eq 0 ]; then 
      echo 'copy success' 
else 
      echo 'copy failed, copyCode=$copyCode' 
      exit 1 
fi
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}