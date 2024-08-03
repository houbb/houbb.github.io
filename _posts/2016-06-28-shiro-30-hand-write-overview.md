---
layout: post
title: Shiro-30-手写实现 shiro
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# shiro 系列

[shiro-00-overview](https://houbb.github.io/2016/08/11/shiro-00-overview)

[Shiro-01-shiro 是什么?](https://houbb.github.io/2016/08/11/shiro-01-what-is-shiro)

[Shiro-02-shiro 的架构设计详解](https://houbb.github.io/2016/08/11/shiro-02-architecture)

[Shiro-03-5 分钟入门 shiro 安全框架实战笔记](https://houbb.github.io/2016/08/11/shiro-03-5-min-travel)

[Shiro-04-Authentication 身份验证](https://houbb.github.io/2016/08/11/shiro-04-authentication)

[Shiro-05-Authorization 授权](https://houbb.github.io/2016/08/11/shiro-05-authorization)

[Shiro-06-Realms 领域](https://houbb.github.io/2016/08/11/shiro-06-realm)

[Shiro-07-Session Management 会话管理](https://houbb.github.io/2016/08/11/shiro-07-session-management)

[Shiro-08-Cryptography 编码加密](https://houbb.github.io/2016/08/11/shiro-08-Cryptography-intro)

[Shiro-09-web 整合](https://houbb.github.io/2016/08/11/shiro-09-web)

[Shiro-10-caching 缓存](https://houbb.github.io/2016/08/11/shiro-10-caching)

[Shiro-11-test 测试](https://houbb.github.io/2016/08/11/shiro-11-test)

[Shiro-12-subject 主体](https://houbb.github.io/2016/08/11/shiro-12-subject)

[Shiro-20-shiro 整合 spring 实战及源码详解](https://houbb.github.io/2016/08/11/shiro-20-intergrations-spring)

[Shiro-21-shiro 整合 springmvc 实战及源码详解](https://houbb.github.io/2016/08/11/shiro-21-intergrations-springmvc)

[Shiro-22-shiro 整合 springboot 实战](https://houbb.github.io/2016/08/11/shiro-22-intergrations-springboot)

[Shiro-30-手写实现 shiro](https://houbb.github.io/2016/08/11/shiro-30-hand-write-overview)

[Shiro-31-从零手写 shiro 权限校验框架 (1) 基础功能](https://houbb.github.io/2016/08/11/shiro-31-hand-write-basic)


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