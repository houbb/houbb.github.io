---
layout: post
title:  web 安全系列-14-path travel 目录穿越
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 简介

目录穿越（也被称为目录遍历/directory traversal/path traversal）是通过使用 `../` 等目录控制序列或者文件的绝对路径来访问存储在文件系统上的任意文件和目录，特别是应用程序源代码、配置文件、重要的系统文件等。

## 危害

为了避免使用者存取到服务器上未经许可的文件，服务器提供两个安全机制：

(1)根目录

(2)文件存取权限

这些安全措施是为了避免黑客执行可执行文件，如Windows系统上的cmd.exe文件，以及避免黑客存取重要的文件，如UNIX系统上的passwd密码文件。

但是黑客可以使用目录穿越攻击，来查找、执行或存取Web应用程序所在的根目录以外的文件夹。如果目录穿越攻击成功，黑客就可以执行破坏性的命令来攻击网站。

目录穿越攻击可能发生在Web应用程序上，也可能发生在Web服务器上。在Web应用程序上发生的目录穿越攻击，是因为Web应用程序要求使用者输入文件名。例如将使用者的账号作为保存文件的名称，当使用者输入账号后，程序会立即查找并打开指定用户名为文件名的文件。

# 攻击载荷

## URL参数

```
../
..\
..;/
```



## Nginx Off by Slash

```
https://vuln.site.com/files../
```

## UNC Bypass

```
\\localhost\c$\windows\win.ini
```

# 过滤绕过

## 单次替换

```
...//
```


## URL编码

16位Unicode编码

```
\u002e
```

点–>%2e 反斜杠–>%2f 正斜杠–>%5c

- 进行16位Unicode编码

点–>%u002e 反斜杠–>%u2215 正斜杠–>%u2216

- 进行双倍URL编码

点–>%252e 反斜杠–>%u252f 正斜杠–>%u255c

## 超长UTF-8编码

```
\%e0%40%ae
```

- 进行超长UTF-8 Unicode编码

点–>%c0%2e %e0$40%ae %c0ae

反斜杠–>%c0af %e0%80af %c0%af

正斜杠–>%c0%5c %c0%80%5c

常用来组合危害最大，比如文件上传后我们可以通过文件穿越获取到文件路径

# 防御

在进行文件操作相关的API前，应该对用户输入做过滤。

较强的规则下可以使用白名单，仅允许纯字母或数字字符等。

若规则允许的字符较多，最好使用当前操作系统路径规范化函数规范化路径后，进行过滤，最后再进行相关调用。

## 一些策略

防范的方法要防范目录穿越与远程文件调用攻击，可以使用下列方法：

(1)不要使用使用者提供的文件名

(2)检查使用者输入的文件名中是否有".."的目录级层的字符

(3)php.ini文件中设置open_basedir来指定可以打开文件的目录

(4)php.ini文件中设置allow_url_fopen为Off，来让Web应用程序不能打开远程文件

(5)realpath与basename函数来处理使用者输入的文件名

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[目录穿越](https://websec.readthedocs.io/zh/latest/vuln/pathtraversal.html)

[目录/文件攻击防范策略研究](https://www.cnblogs.com/milantgh/p/3756726.html)

[CVE-2020-5410 Spring Cloud Config目录穿越漏洞](https://xz.aliyun.com/t/7877)

[CVE-2020-5405 Spring Cloud Config Server 目录穿越](https://www.freebuf.com/news/232744.html)

* any list
{:toc}