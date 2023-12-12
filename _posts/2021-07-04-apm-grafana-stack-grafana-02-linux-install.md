---
layout: post
title: grafana stack grafana-02-grafana linux 基于源码在 linux 环境编译部署
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana, linux]
published: true
---

# windows10 安装笔记

> [开发者参考手册](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

## 说明

上一篇文章介绍了 windows10 的安装笔记。

这里试一下使用 windows10 下 WSL 模拟 linux 安装。

# 准备工作

## git

```
dh@d:~$ git --version
git version 2.34.1
```

## go

- go

```
$ sudo apt-get update
$ sudo apt install golang-go
```

验证：

```
$ go version
go version go1.18.1 linux/amd64
```

## node

- node

```
$  sudo apt install nodejs
```

验证：

```
dh@d:~$ node -v
v12.22.9
```

改为国内镜像：

```
npm config set registry=https://registry.npmmirror.com
```

## yarn

```
$  npm install -g yarn

$ yarn -v
1.22.21
```

# 代码下载

## 下载

```
$  git clone https://github.com/grafana/grafana.git
```

## 编译

```
cd grafana
```

### 前端

```
$  yarn install --immutable

$  yarn start
```

### yarn 比较慢

可以切换为国内的镜像源：

```sh
   #// 查询源
    yarn config get registry

    #// 更换国内源
    yarn config set registry https://registry.npmmirror.com

    #// 恢复官方源
    yarn config set registry https://registry.yarnpkg.com

    #// 删除注册表
    yarn config delete registry
```

#### 报错

```
grafana  

SyntaxError: Unexpected token '.'     at wrapSafe (internal/modules/cjs/loader.js:915:16)     at Module._compile (internal/modules/cjs/loader.js:963:27)     at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)     at Module.l
```

这个主要是因为 Node 版本太低造成的。

解决方式：

卸载：

```
sudo apt-get remove nodejs
sudo apt-get remove npm
```


以下是 Nodejs 18.x的安装，一行代码搞定 `&&\` 的意思是前面的命令执行无误后，再执行后面代码

```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

PS: n 的方式尝试了很多次，各种问题。

报错：

```
Need to get 0 B/28.9 MB of archives.
After this operation, 188 MB of additional disk space will be used.
Selecting previously unselected package nodejs.
(Reading database ... 63291 files and directories currently installed.)
Preparing to unpack .../nodejs_18.17.1-deb-1nodesource1_amd64.deb ...
Unpacking nodejs (18.17.1-deb-1nodesource1) ...
dpkg: error processing archive /var/cache/apt/archives/nodejs_18.17.1-deb-1nodesource1_amd64.deb (--unpack):
 trying to overwrite '/usr/include/node/common.gypi', which is also in package libnode-dev 12.22.9~dfsg-1ubuntu3.2
dpkg-deb: error: paste subprocess was killed by signal (Broken pipe)
Errors were encountered while processing:
 /var/cache/apt/archives/nodejs_18.17.1-deb-1nodesource1_amd64.deb
E: Sub-process /usr/bin/dpkg returned an error code (1)
```

解决方法：


```
sudo dpkg -i --force-overwrite /var/cache/apt/archives/*.deb
```

这条命令的意思是使用sudo权限来强制安装/var/cache/apt/archives/目录下的所有.deb文件。
sudo是一个命令，它可以让您以超级用户（root）的身份执行其他命令。
dpkg是一个工具，它可以用来安装、卸载和管理Debian软件包（.deb文件）。
-i是一个选项，它表示安装指定的软件包。
–force-overwrite是一个选项，它表示强制覆盖已经存在的文件，即使它们属于其他软件包。
/var/cache/apt/archives/是一个目录，它存放了使用apt命令下载的软件包。
*.deb是一个通配符，它表示匹配任何以.deb结尾的文件。


安装完成后使用node -v查看 nodejs 的版本。

```
$ node -v
v18.17.1
```

重新安装 yarn

```
$  yarn -v

4.0.0
```

### 后端


# 参考

## npm install 卡主

```
$ npm config get registry
https://registry.npmjs.org/
```

改为国内镜像：

```
npm config set registry=https://registry.npmmirror.com
```

改回来：

```
npm config set registry=https://registry.npmjs.org
```

## npm install 报错

```
dh@d:~/github/grafana$ sudo npm install -g n
npm ERR! code EBADPLATFORM
npm ERR! notsup Unsupported platform for n@9.2.0: wanted {"os":"!win32"} (current: {"os":"win32"})
npm ERR! notsup Valid os:  !win32
npm ERR! notsup Actual os: win32

npm ERR! A complete log of this run can be found in: C:\Users\dh\AppData\Local\npm-cache\_logs\2023-12-12T09_35_31_424Z-debug-0.log
```

### 解决方式

```
sudo npm install -g n --force 
```

强制安装即可。

这其实主要是因为n模块不适配windows系统，所以虽然可以安装，但是还是需要相办法安装一个“linux”环境。

在运行n 命令时提示使用wsl2



## n stable 报错

```
$ n stable
  installing : node-v20.10.0
       mkdir : /usr/local/n/versions/node/20.10.0
mkdir: cannot create directory ‘/usr/local/n’: Permission denied

  Error: sudo required (or change ownership, or define N_PREFIX)
```

发现使用 `sudo n stable` 提示命令不存在。

于是手动创建对应需要的文件夹；

```
sudo mkdir /usr/local/n
sudo mkdir /usr/local/n/versions
sudo mkdir /usr/local/n/versions/node
```

真坑爹，目录一直没权限。

### 卸载

```
sudo apt-get remove nodejs
sudo apt-get remove npm
```

### 重新安装

```
sudo apt update
sudo apt install nodejs
sudo apt install npm
node -v
```

这样安装的，依然不是最新的。


### 安装 npm，借助 n 

```
sudo apt update	
sudo apt install nodejs

#不自带 npm 需要自行安装
sudo apt install npm
# 升级 npm
sudo npm install npm -g	
```

改为国内镜像：

```
npm config set registry=https://registry.npmmirror.com
```

使用 n Node版本管理工具升级到 最新版

```
sudo npm install n -g

# 下载最新稳定版
sudo n stable
# 下载最新版
sudo n lastest
# 查看已下载的版本
sudo n ls
# 切换 Node 版本
sudo n 18.21.1
```


# 参考资料

chat

https://github.com/grafana/grafana

https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md

[解决Node.js项目报错SyntaxError: Unexpected token ...](https://blog.csdn.net/oHaiKuoTianKong1682/article/details/108524992)

[运行npm install卡住不动的几种解决方案](https://blog.csdn.net/shi450561200/article/details/134354871)

[在Linux系统上更新Node.js到最新版本的3种方法](https://blog.csdn.net/jump_22/article/details/128828608)

* any list
{:toc}