---
layout: post
title: Github DNS 访问加速
date:  2019-2-25 10:58:55 +0800
categories: [Tool]
tags: [github, sh]
published: true
excerpt: Github
---


# 如何上传本地代码到 github

1、建立git仓库 

```
git init
```

2、添加代码到本地仓库

```
git add .
git commit -m "[Init] init git"
```

3、github 创建自己的项目

不赘述

4、将本地代码和远程仓库关联

```
git remote add origin https://github.com/houbb/XXX
```

5、更新代码

```
git pull origin master
```

6、上传代码

```
git push -u origin master
```

# DNS

## 配置

修改 hosts 文件 c:\windows\system32\drivers\etc

```
# GitHub Start 
192.30.253.112 github.com 
192.30.253.113 github.com 
192.30.253.119 gist.github.com 
151.101.185.194 github.global.ssl.fastly.net
151.101.100.133 assets-cdn.github.com 
151.101.100.133 raw.githubusercontent.com 
151.101.100.133 gist.githubusercontent.com 
151.101.100.133 cloud.githubusercontent.com 
151.101.100.133 camo.githubusercontent.com 
151.101.100.133 avatars0.githubusercontent.com 
151.101.100.133 avatars1.githubusercontent.com 
151.101.100.133 avatars2.githubusercontent.com 
151.101.100.133 avatars3.githubusercontent.com 
151.101.100.133 avatars4.githubusercontent.com 
151.101.100.133 avatars5.githubusercontent.com 
151.101.100.133 avatars6.githubusercontent.com 
151.101.100.133 avatars7.githubusercontent.com 
151.101.100.133 avatars8.githubusercontent.com 
151.101.44.249 github.global.ssl.fastly.net
192.30.253.113 github.com
103.245.222.133 assets-cdn.github.com
23.235.47.133 assets-cdn.github.com
203.208.39.104 assets-cdn.github.com
204.232.175.78 documentcloud.github.com
204.232.175.94 gist.github.com
107.21.116.220 help.github.com
207.97.227.252 nodeload.github.com
199.27.76.130 raw.github.com
107.22.3.110 status.github.com
204.232.175.78 training.github.com
207.97.227.243 www.github.com
185.31.16.184 github.global.ssl.fastly.net
185.31.18.133 avatars0.githubusercontent.com
185.31.19.133 avatars1.githubusercontent.com
# GitHub End
```

## 刷新

改完之后立刻刷新，

- Windows

```
ipconfig /flushdns
```

- Ubuntu

```
sudo systemctl restart nscd
```

## 拓展阅读

[中国网速太慢](https://github.com/chenxuhua/issues-blog/issues/3)

```
# GitHub Start
192.30.253.112 github.com
192.30.253.118 gist.github.com
151.101.112.133 assets-cdn.github.com
151.101.184.133 raw.githubusercontent.com
151.101.112.133 gist.githubusercontent.com
151.101.184.133 cloud.githubusercontent.com
151.101.112.133 camo.githubusercontent.com
151.101.112.133 avatars0.githubusercontent.com
151.101.112.133 avatars1.githubusercontent.com
151.101.184.133 avatars2.githubusercontent.com
151.101.12.133 avatars3.githubusercontent.com
151.101.12.133 avatars4.githubusercontent.com
151.101.184.133 avatars5.githubusercontent.com
151.101.184.133 avatars6.githubusercontent.com
151.101.184.133 avatars7.githubusercontent.com
151.101.12.133 avatars8.githubusercontent.com
# GitHub End
```

# 参考资料 

https://blog.csdn.net/tracy1talent/article/details/82909924

https://www.cnblogs.com/ocean1100/p/9442962.html

[Github 加速访问](https://github.com/chenxuhua/issues-blog/issues/3)

* any list
{:toc}