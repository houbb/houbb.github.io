---
layout: post 
title: MemPalace AI 记忆系统 手动安装
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---


# 背景

直接安装失败

```
> claude plugin marketplace add milla-jovovich/mempalace
Adding marketplace...
SSH not configured, cloning via HTTPS: https://github.com/milla-jovovich/mempalace.git
Cloning repository: https://github.com/milla-jovovich/mempalace.git
HTTPS clone failed, retrying with SSH: git@github.com:milla-jovovich/mempalace.git
Cloning repository: git@github.com:milla-jovovich/mempalace.git
✘ Failed to add marketplace: Failed to clone marketplace repository: Cloning into 'C:\Users\dh\.claude\plugins\marketplaces\milla-jovovich-mempalace'...
PS D:\aicode\openim-plateform>
```

# 手动安装

```
# 1. 进入一个临时目录（例如桌面或你的项目目录）
cd D:\aicode

# 2. 使用 HTTPS 方式 clone 仓库（如果网络正常）
git clone https://github.com/milla-jovovich/mempalace.git

# 如果 HTTPS 失败，可以尝试使用 GitHub 的镜像加速（国内常用）
git clone https://hub.fastgit.xyz/milla-jovovich/mempalace.git

# 或者使用 SSH 方式（前提是你已经配置好 SSH Key）
git clone git@github.com:milla-jovovich/mempalace.git
```

## 实际下载

```
$ git clone git@github.com:milla-jovovich/mempalace.git
Cloning into 'mempalace'...
remote: Enumerating objects: 814, done.
remote: Counting objects: 100% (443/443), done.
remote: Compressing objects: 100% (183/183), done.
remote: Total 814 (delta 355), reused 260 (delta 260), pack-reused 371 (from 3)
Receiving objects: 100% (814/814), 1.14 MiB | 110.00 KiB/s, done.
Resolving deltas: 100% (497/497), done.
```

## 成功后处理

```
# 3. 进入克隆下来的目录
cd mempalace

# 4. 将本地文件夹添加为 Claude 插件市场
claude plugin marketplace add ./

# 或者指定绝对路径
claude plugin marketplace add D:\aicode\mempalace
```

PS: 发现用 git-bash 不行，改为了 command 普通命令行，添加成功

```
D:\aicode>cd mempalace

D:\aicode\mempalace>claude plugin marketplace add ./
Adding marketplace...
√ Successfully added marketplace: mempalace

D:\aicode\mempalace>claude plugin marketplace list
Configured marketplaces:

  > claude-plugins-official
    Source: GitHub (anthropics/claude-plugins-official)

  > superpowers-marketplace
    Source: GitHub (obra/superpowers-marketplace)

  > thedotmack
    Source: GitHub (thedotmack/claude-mem)

  > claude-subconscious
    Source: GitHub (letta-ai/claude-subconscious)

  > mempalace
    Source: Directory (D:\aicode\mempalace)
```

## 安装插件

推荐使用 --scope user 让所有项目都能用

```
> claude plugin install --scope user mempalace
```

安装成功。


## 初始化

重启 claude code 执行下面的命令初始化：

```
/mempalace:init
```

这里其实会触发安装：

```sh
pip install mempalace
```

## 常用命令

```sh
# 搜索记忆
mempalace search "关键词"

# 查看状态
mempalace status

# 挖掘更多文件
mempalace mine "d:\aicode\openim-plateform" --mode projects

# 查看唤醒上下文
mempalace wake-up
```


# 参考资料

* any list
{:toc}