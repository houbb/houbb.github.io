---
layout: post
title: CentOS7 安装 node 笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---


# 说明 

cenos7 安装 node

# 准备工作

## wget

如果已经安装，则可以跳过。

```
yum install -y wget
```

## 找到需要的版本

[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

比如：https://nodejs.org/dist/v16.13.1/node-v16.13.1.tar.gz


# 安装

## 下载

```
$   wget https://nodejs.org/dist/v16.13.1/node-v16.13.1-linux-x64.tar.xz
```

## 解压

```
$   xz -d node-v16.13.1-linux-x64.tar.xz
$   tar -xf node-v16.13.1-linux-x64.tar
```

我的目录信息如下：

```
# pwd
/root/tool/nodejs

# ls
node-v16.13.1-linux-x64  node-v16.13.1-linux-x64.tar
```

## 配置

配置 node 和 npm。

```
sudo ln -s /root/tool/nodejs/node-v16.13.1-linux-x64/bin/node /usr/bin/node
sudo ln -s /root/tool/nodejs/node-v16.13.1-linux-x64/bin/npm /usr/bin/npm
```

## 版本确认

```
# node -v
v16.13.1

# npm -v
8.1.2
```

# cnpm 

因为国内网络问题，设置淘宝镜像。

> https://npmmirror.com/

## 安装

```
$   npm install -g cnpm --registry=https://registry.npmmirror.com
```

## 软连接

安装之后你会发现用 cnpm 命令会提示找不到，要建立软链接

```
sudo ln -s /root/tool/nodejs/node-v16.13.1-linux-x64/bin/cnpm /usr/bin/cnpm
```

## 版本确认

```
# cnpm -v
cnpm@7.1.0 (/root/tool/nodejs/node-v16.13.1-linux-x64/lib/node_modules/cnpm/lib/parse_argv.js)
npm@6.14.15 (/root/tool/nodejs/node-v16.13.1-linux-x64/lib/node_modules/cnpm/node_modules/npm/lib/npm.js)
node@16.13.1 (/root/tool/nodejs/node-v16.13.1-linux-x64/bin/node)
npminstall@5.3.1 (/root/tool/nodejs/node-v16.13.1-linux-x64/lib/node_modules/cnpm/node_modules/npminstall/lib/index.js)
prefix=/root/tool/nodejs/node-v16.13.1-linux-x64 
linux x64 3.10.0-1160.45.1.el7.x86_64 
registry=https://registry.npmmirror.com
```

# 参考资料

[CentOS7安装NodeJS](https://www.jianshu.com/p/657d58a149d0)

[Linux 下面解压.tar.gz 和.gz文件解压的方式](https://www.cnblogs.com/wangshouchang/p/7748527.html)

[CentOS7 安装 node](https://blog.csdn.net/just4you/article/details/109144298)

[Centos7 安装 Nodejs](https://www.swack.cn/wiki/001557409799713ca16fa7271334e4cadbf9cc76fd0d933000/00155745442953023424095c3a14a67a93b350c375950d3000)

https://nodejs.org/en/download/package-manager/#centos-fedora-and-red-hat-enterprise-linux

http://www.manongjc.com/article/56930.html

* any list
{:toc}