---
layout: post
title:  Linux curl
date:  2018-06-18 16:20:44 +0800
categories: [Linux]
tags: [tool, shell, linux]
published: true
---

# Curl

[Curl](https://curl.haxx.se/) is command line tool and library for transferring data with URLs.


# 入门使用

```
$ curl baidu.com
<html>
<meta http-equiv="refresh" content="0;url=http://www.baidu.com/">
</html>
```


# Windows 使用

## 下载

> [Win64](https://curl.haxx.se/download.html#Win64) 下载对应压缩包，解压

## 配置

### System32

1. 解压下载好的文件，拷贝 `I386/curl.exe` 文件到 `C:\Windows\System32`

2. 然后就可以在DOS窗口中任意位置，使用curl命令了。

### 环境变量配置

- 新建系统变量

```
CURL_HOME=你的curl目录位置\curl-${version}
```

- 设置 Path

path 末尾添加 `;%CURL_HOME%\I386`

* any list
{:toc}







