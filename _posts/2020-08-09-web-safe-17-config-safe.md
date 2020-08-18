---
layout: post
title:  web 安全系列-17-config safe 配置安全
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 弱密码

位数过低

字符集小

为常用密码

## 个人信息相关

手机号

生日

姓名

用户名

使用键盘模式做密码

# 敏感文件泄漏

```
.git
.svn
```

# 数据库

Mongo/Redis等数据库无密码且没有限制访问

加密体系

在客户端存储私钥

# 三方库/软件

公开漏洞后没有及时更新

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[配置安全](https://websec.readthedocs.io/zh/latest/vuln/config.html)

* any list
{:toc}