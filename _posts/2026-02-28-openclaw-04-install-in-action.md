---
layout: post
title: OpenClaw windows 安装实战笔记
date: 2026-02-28 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---



# 前言


## 准备工作

1) 更新系统

```sh
sudo apt update && sudo apt upgrade -y
```

2) 安装 Node.js（OpenClaw核心依赖）

```sh
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

验证

```sh
$ node -v
v12.22.9

$ npm -v
10.7.0
```

3) 安装 git

```sh
sudo apt install git -y
```

## 安装

命令：

```sh
curl -fsSL https://openclaw.ai/install.sh | bash
```

这个可能会比较慢。

日志：

```
🦞 OpenClaw Installer
  No $999 stand required.

✓ Detected: linux

Install plan
OS: linux
Install method: npm
Requested version: latest

[1/3] Preparing environment
· Node.js v12.22.9 found, upgrading to v22+
· Installing Node.js via NodeSource
· Installing Linux build tools (make/g++/cmake/python3)
✗ Updating package index failed — re-run with --verbose for details
Failed to start apt-news.service: Unit apt-news.service not found.
Failed to start esm-cache.service: Unit esm-cache.service not found.
E: The repository 'https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/debian bookworm Release' no longer has a Release file.



✓ Build tools installed
✓ Node.js v22 installed
· Active Node.js: v12.22.9 (/usr/bin/node)
· Active npm: 10.7.0 (/mnt/d/Program Files/nodejs/npm)

[2/3] Installing OpenClaw
✓ Git already installed
· Configuring npm for user-local installs
✓ npm configured for user installs
· Installing OpenClaw v2026.2.26
! npm install failed for openclaw@latest
  Command: env SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm --loglevel error --silent --no-fund --no-audit install -g openclaw@latest
  Installer log: /tmp/tmp.SRqCfMwamH
! npm install failed; showing last log lines
! npm install failed; retrying



! npm install failed for openclaw@latest
  Command: env SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm --loglevel error --silent --no-fund --no-audit install -g openclaw@latest
  Installer log: /tmp/tmp.0qkbgDUofv
! npm install failed; showing last log lines
```


实际测试会失败

# 参考资料

https://blog.csdn.net/Chixuxunwu/article/details/158234660

* any list
{:toc}