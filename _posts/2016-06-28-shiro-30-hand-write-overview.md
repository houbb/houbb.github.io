---
layout: post
title: Shiro-30-手写实现 shiro
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 目标


- 基本的使用 DONE

- spring mvc 整合

- springboot web 整合

# web 整合思路

针对 login/logout 需要用户指定对应的 post 请求路径，如果用户不指定，则直接使用默认值。

通过拦截器去调用对应的实现。

# 整合思路

登录-密码验证

权限校验

借鉴一下 spring security。

shiro 确实做了很多事情，但是还是有些复杂了。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}