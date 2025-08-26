---
layout: post
title: Failed to connect to github.com port 443 Timed out 如何解决 git push 
date: 2025-5-13 20:16:25 +0800
categories: [Github]
tags: [github, problem, sh]
published: true
---

# 问题

```
> git push
fatal: unable to access 'https://github.com/houbb/goutong-executor.git/': Failed to connect to github.com port 443 after 21086 ms: Couldn't connect to server
```

个人项目提交报错。自己有 vpn 浏览器可以查看 github

# 问题解决

## 两种情况：

第一种情况自己有vpn，网页可以打开github。说明命令行在拉取/推送代码时并没有使用vpn进行代理

第二种情况没有vpn，这时可以去某些网站上找一些代理ip+port


## 解决办法：

配置http代理Windows、Linux、Mac OS 中 git 命令相同：

配置socks5代理

```
git config --global http.proxy socks5 127.0.0.1:7890
git config --global https.proxy socks5 127.0.0.1:7890
```

配置http代理

```
git config --global http.proxy 127.0.0.1:7890
git config --global https.proxy 127.0.0.1:7890
```


注意：

命令中的主机号（127.0.0.1）是使用的代理的主机号(自己电脑有vpn那么本机可看做访问github的代理主机)，即填入127.0.0.1即可，否则填入代理主机 ip(就是网上找的那个ip)

命令中的端口号（7890）为代理软件(代理软件不显示端口的话，就去Windows中的代理服务器设置中查看)或代理主机的监听IP，可以从代理服务器配置中获得，否则填入网上找的那个端口port 


## 查看代理命令

```
git config --global --get http.proxy
git config --global --get https.proxy
```

## 取消代理命令

```
git config --global --unset http.proxy
git config --global --unset https.proxy
```

# 实际测试

这里我们先只设置一个 http/https，看了一下 vpn 的默认端口是 7897 

实际测试，发现其实设置 http.proxy 就行。保险起见，两个一起设置。

```
git config --global https.proxy 127.0.0.1:7897
git config --global http.proxy 127.0.0.1:7897
```

确认

```
$ git config --global -l
user.email=houbinbin.echo@gmail.com
user.name=houbb
http.proxy=127.0.0.1:7897
```

重新提交

```
> git push
Enumerating objects: 122, done.
Counting objects: 100% (122/122), done.
Delta compression using up to 20 threads
Compressing objects: 100% (57/57), done.
Writing objects: 100% (78/78), 10.28 KiB | 658.00 KiB/s, done.
Total 78 (delta 25), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (25/25), completed with 10 local objects.
To https://github.com/houbb/goutong-executor.git
   f41458e..a650095  master -> master
```

正常解决。

# 参考资料

https://blog.csdn.net/zpf1813763637/article/details/128340109

https://blog.csdn.net/weixin_44223180/article/details/133059575

* any list
{:toc}