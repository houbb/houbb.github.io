---
layout: post
title: Claude-Mem-05-安装实战笔记
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, memory, sh]
published: true
---

# 安装命令

```sh
claude plugin marketplace add thedotmack/claude-mem
claude plugin install claude-mem
```

# 安装报错

```
 claude plugin marketplace add thedotmack/claude-mem
Adding marketplace...
SSH not configured, cloning via HTTPS: https://github.com/thedotmack/claude-mem.git
Updating existing marketplace cache…
Update failed, cleaning up and re-cloning…
HTTPS clone failed, retrying with SSH: git@github.com:thedotmack/claude-mem.git
✘ Failed to add marketplace: EBUSY: resource busy or locked, unlink 'C:\Users\dh\.claude\plugins\marketplaces\thedotmack-claude-mem\.git\objects\pack\tmp_pack_UZP0t4'
```


文件夹被锁。

## 解决方式

关闭所有的 IDE，释放锁，

不行的话，就重启一下。

# 参考资料

* any list
{:toc}