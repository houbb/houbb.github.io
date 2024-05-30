---
layout: post
title:  Linux curl 类似 postman 直接发送 get/post 请求
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [tool, shell, linux]
published: true
---


# linux 命令基础汇总

| 命令&基础             | 描述                                   | 地址                                              |
|------------------|----------------------------------------|---------------------------------------------------|
| linux curl       | 命令行直接发送 http 请求               | [Linux curl 类似 postman 直接发送 get/post 请求](https://houbb.github.io/2018/12/20/linux-curl) |
| linux ln         | 创建链接（link）的命令               | [创建链接（link）的命令](https://houbb.github.io/2018/12/20/linux-ln) |
| linux link       | linux 软链接介绍               | [linux 软链接介绍](https://houbb.github.io/2018/12/20/linux-link-intro) |
| linux top        | 实时查看系统性能                       | [linux top-linux 内存](https://houbb.github.io/2018/12/21/linux-top)                 |
| linux tar gz     | 解压命令                               | [linux tar gz 解压命令](https://houbb.github.io/2018/12/21/linux-tar-gz)              |
| linux tail       | 显示文件末尾内容                       | [linux tail, linux head](https://houbb.github.io/2018/12/21/linux-tail)               |
| linux rm         | 删除文件或目录                         | [linux rm, mkdir](https://houbb.github.io/2018/12/21/linux-rm)                         |
| linux pwd        | 显示当前目录                           | [linux pwd](https://houbb.github.io/2018/12/21/linux-pwd)                               |
| linux ps         | 显示当前进程信息                       | [linux ps](https://houbb.github.io/2018/12/21/linux-ps)                                 |
| linux port       | 显示端口占用情况                       | [linux port 端口占用](https://houbb.github.io/2018/12/21/linux-port)                   |
| linux ping       | 测试网络连通性                         | [linux ping](https://houbb.github.io/2018/12/21/linux-ping)                             |
| linux mv         | 移动文件或目录                         | [linux mv](https://houbb.github.io/2018/12/21/linux-mv)                                 |
| linux ls         | 列出文件和目录                         | [linux ls](https://houbb.github.io/2018/12/21/linux-ls)                                 |
| linux less, more | 分页显示文件内容                       | [linux less, linux more](https://houbb.github.io/2018/12/21/linux-less)                 |
| linux grep       | 在文件中搜索指定字符串                 | [linux grep](https://houbb.github.io/2018/12/21/linux-grep)                               |
| linux file       | 确定文件类型                           | [linux file 命令](https://houbb.github.io/2018/12/21/linux-file)                         |
| linux diff       | 比较文件的不同                         | [linux diff](https://houbb.github.io/2018/12/21/linux-diff)                               |
| linux chmod      | 修改文件权限                           | [linux chmod](https://houbb.github.io/2018/12/21/linux-chmod)                             |
| linux cd         | 切换当前目录                           | [linux cd](https://houbb.github.io/2018/12/21/linux-cd)                                   |
| linux cat        | 显示文件内容                           | [linux cat](https://houbb.github.io/2018/12/21/linux-cat)                                 |
| linux telnet     | 远程登录                               | [linux telnet](https://houbb.github.io/2018/12/20/linux-telnet)                           |
| linux free       | 显示内存使用情况                       | [linux free-内存统计信息](https://houbb.github.io/2018/12/21/linux-free)                 |
| linux df         | 显示磁盘空间使用情况                   | [linux df-磁盘统计信息](https://houbb.github.io/2018/12/21/linux-df)                     |
| linux netstat   | 显示网络连接、路由表、接口统计等信息 | [linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息](https://houbb.github.io/2018/12/20/linux-netstat) |
| linux load average   | 如何查看 linux 的负载 | [Linux Load AVG linux 平均负载是什么解释说明](https://houbb.github.io/2018/12/20/linux-load-avg) |

# Curl

[Curl](https://curl.haxx.se/) is command line tool and library for transferring data with URLs.


# 入门使用

```
$ curl baidu.com
<html>
<meta http-equiv="refresh" content="0;url=http://www.baidu.com/">
</html>
```

# 发现一个请求浏览器可以，但是命令行不行

比如

```
http://127.0.0.1:8080/query?email=123@qq.com
```

浏览器可以访问，但是 curl 不行。

```sh
curl http://127.0.0.1:8080/query?email=123@qq.com
```

### 为什么？

当使用 `curl` 从命令行发送请求时，特殊字符（如 `?` 和 `@`）可能需要进行 URL 编码或转义，以避免被解释为 shell 元字符。

在你的例子中，`?` 和 `@` 是 URL 中的特殊字符，需要适当处理。以下是解决方法：

### 1. 使用引号

将 URL 包含在引号内，确保整个 URL 作为一个参数传递给 `curl`。

```sh
curl "http://127.0.0.1:8080/query?email=123@qq.com"
```

### 2. URL 编码

将 `@` 编码为 `%40`。

```sh
curl http://127.0.0.1:8080/query?email=123%40qq.com
```

### 3. 转义字符

在 shell 中转义特殊字符 `@` 和 `?` 使用反斜杠 `\`。

```sh
curl http://127.0.0.1:8080/query?email=123\@qq.com
```

### 4. 单引号 (适用于简单的 URL)

在某些情况下，使用单引号可能更简单，因为单引号会完全禁用特殊字符的解释。

```sh
curl 'http://127.0.0.1:8080/query?email=123@qq.com'
```

### 示例总结

以下是一些示例代码来处理你的特定 URL：

```sh
curl "http://127.0.0.1:8080/query?email=123@qq.com"       # 使用双引号
curl 'http://127.0.0.1:8080/query?email=123@qq.com'       # 使用单引号
curl http://127.0.0.1:8080/query?email=123%40qq.com       # 使用 URL 编码
curl http://127.0.0.1:8080/query?email=123\@qq.com        # 使用转义字符
```

选择你认为最方便的一种方法使用，即可解决 `curl` 请求中的特殊字符问题。

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

# linux curl 命令

curl 是一个功能强大的命令行工具，用于在网络上传输数据。

它支持多种协议，包括 HTTP、HTTPS、FTP、FTPS 等，可以用来发送或接收数据，以及执行各种网络操作。

以下是一些 curl 命令的常见用法和选项：

1. **发送 HTTP 请求**：可以使用 curl 发送 HTTP 请求，并显示响应内容。
   ```
   curl [URL]
   ```

2. **保存到文件**：通过 `-o` 选项可以将响应保存到文件中。
   ```
   curl -o [filename] [URL]
   ```

3. **显示响应头信息**：通过 `-i` 选项可以显示响应头信息。
   ```
   curl -i [URL]
   ```

4. **支持 HTTPS**：curl 支持 HTTPS，无需额外配置。
   ```
   curl https://example.com
   ```

5. **使用代理**：通过 `-x` 选项可以指定代理服务器。
   ```
   curl -x [proxy_address:port] [URL]
   ```

6. **基本认证**：通过 `-u` 选项可以指定用户名和密码进行基本认证。
   ```
   curl -u username:password [URL]
   ```

7. **发送 POST 请求**：通过 `-d` 选项可以发送 POST 请求，并指定数据。
   ```
   curl -d "data=value" [URL]
   ```

8. **设置请求头**：通过 `-H` 选项可以设置自定义请求头。
   ```
   curl -H "Content-Type: application/json" [URL]
   ```

9. **限制下载速度**：通过 `--limit-rate` 选项可以限制下载速度。
   ```
   curl --limit-rate 100K [URL]
   ```

10. **跟随重定向**：通过 `-L` 选项可以让 curl 自动跟随重定向。
   ```
   curl -L [URL]
   ```

这只是 curl 命令的一些常见用法和选项，curl 还有很多其他功能和选项，您可以通过 `man curl` 命令查看完整的文档。

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







