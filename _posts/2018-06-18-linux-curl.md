---
layout: post
title:  Linux curl 类似 postman 直接发送 get/post 请求
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

# post 请求 json

## 完整的命令

```sh
curl 'http://localhost:8080/cnd_inke/qc/v2/inke' \
-H "Content-Type:application/json" \
-H 'Authorization:bearer' \
-X POST \
-d '{"Id":"12330245","visitTimes":1,"docType":"散文","docId":"36e5854f5f0e4f80b7ccc6c52c063243"}'
```

curl命令一般在电脑的终端执行，上述代码中的“http://localhost:8080/cnd_inke/qc/v2/inke”为你要请求的目标地址，-H后面为请求头，可以添加多个，curl默认的请求方式是GET，我们要使用POST的话，就得加上“-X POST”，然后关键的来了，我们的请求体，也就是request一般不是json格式的嘛，此时只需要添加-d后，加上单引号，单引号里面添加花括号，然后json格式的key-value添加进去即可。

## post json 文件

如果请求体放在了文件中，比如某个json文件中

```sh
curl 'http://localhost:8080/cnd_inke/qc/v2/inke' \
-H "Content-Type:application/json" \
-H 'Authorization:bearer' \
-X POST \
-d ’@/test.json'
```

## 注意

@后面应该是目标json文件的路径。

--data（即-d）指定的参数必须符合json格式

-H 指定headers头的时候必须单个使用，即一个-H指定一个头字段信息

curl命令所有的符号都得使用英文符号，不能出现汉语符号。

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


# 参考资料

https://blog.csdn.net/weixin_43874301/article/details/120653326


* any list
{:toc}







