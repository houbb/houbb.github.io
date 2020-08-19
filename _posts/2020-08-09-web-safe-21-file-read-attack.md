---
layout: post
title:  web 安全系列-21-文件读取攻击
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

考虑读取可能有敏感信息的文件

# 用户目录下的敏感文件

```
.bash_history
.zsh_history
.profile
.bashrc
.gitconfig
.viminfo
passwd
```

# 应用的配置文件

```
/etc/apache2/apache2.conf
/etc/nginx/nginx.conf
```

# 应用的日志文件

```
/var/log/apache2/access.log
/var/log/nginx/access.log
```

# 站点目录下的敏感文件

```
.svn/entries
.git/HEAD
WEB-INF/web.xml
.htaccess
```

# 特殊的备份文件

```
.swp
.swo
.bak
index.php~
…
```

# Python的Cache

```
pycache_init_.cpython-35.pyc
```

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[文件读取](https://www.bookstack.cn/read/LyleMi-Learn-Web-Hacking/8994b03c03865688.md)

* any list
{:toc}