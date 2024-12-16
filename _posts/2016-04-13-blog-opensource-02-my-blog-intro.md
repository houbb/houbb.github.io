---
layout: post
title: blog opensource 开源博客-02-My-Blog 是由 SpringBoot + Mybatis + Thymeleaf 等技术实现的 Java 博客系统，页面美观、功能齐全、部署简单
date: 2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine, opensource]
published: true
---

# 开源地址

https://github.com/ZHENFENG13/My-Blog

# My Blog

![personal-blog](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/personal-blog.png?raw=true)

当前分支的 Spring Boot 版本为 2.7.5，想要学习和使用其它版本可以直接点击下方的分支名称跳转至对应的仓库分支中。

| 分支名称                                                    | Spring Boot Version |
| ------------------------------------------------------------ | ------------------- |
| [spring-boot-2.3.7](https://github.com/ZHENFENG13/My-Blog/tree/spring-boot-2.3.7) | 2.3.7-RELEASE       |
| [main](https://github.com/ZHENFENG13/My-Blog)            | 2.7.5               |
| [spring-boot-3.x](https://github.com/ZHENFENG13/My-Blog/tree/spring-boot-3.x) | 3.1.0       |

- **你可以拿它作为博客模板，因为 My Blog 界面十分美观简洁，满足私人博客的一切要求；**
- **你也可以把它作为 SpringBoot 技术栈的学习项目，My Blog也足够符合要求，且代码和功能完备；**
- **内置三套博客主题模板，主题风格各有千秋，满足大家的选择空间，后续会继续增加，以供大家打造自己的博客；**
- **技术栈新颖且知识点丰富，学习后可以提升大家对于知识的理解和掌握，对于提升你的市场竞争力有一定的帮助。**

> 更多 Spring Boot 实战项目可以关注十三的另一个代码仓库 [spring-boot-projects](https://github.com/ZHENFENG13/spring-boot-projects)，该仓库中主要是 Spring Boot 的入门学习教程以及一些常用的 Spring Boot 实战项目教程，包括 Spring Boot 使用的各种示例代码，同时也包括一些实战项目的项目源码和效果展示，实战项目包括基本的 web 开发以及目前大家普遍使用的前后端分离实践项目等，后续会根据大家的反馈继续增加一些实战项目源码，摆脱各种 hello world 入门案例的束缚，真正的掌握 Spring Boot 开发。

## 注意事项

- **数据库文件目录为```https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/my_blog_db.sql```；**
- **部署后你可以根据自己需求修改版权文案、logo 图片、备案记录等网站基础信息；**
- **My Blog 后台管理系统的默认登陆账号为 admin 默认登陆密码为 123456；**
- **layui 版本的 My-Blog，仓库地址 [My-Blog-layui](https://github.com/ZHENFENG13/My-Blog-layui) ，感兴趣的朋友也可以学习一下；**
- **My Blog 还有一些不完善的地方，鄙人才疏学浅，望见谅；**
- **有任何问题都可以反馈给我，我会尽量完善该项目。**

## 项目演示

- [视频1：My-Blog博客项目简介](https://edu.csdn.net/course/play/29029/406882)
- [视频2：My-Blog博客项目系统演示-1](https://edu.csdn.net/course/play/29029/405864)
- [视频3：My-Blog博客项目系统演示-2](https://edu.csdn.net/course/play/29029/405865)
- [视频4：博客项目预览](https://www.bilibili.com/video/av52551095)

## 效果预览

### 后台管理页面

- 登录页

	![login](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/login.png?raw=true)

- 后台首页

	![dashboard](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/dashboard.png?raw=true)

- 文章管理

	![blog-list](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/blog-list.png?raw=true)

- 文章编辑

	![edit](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/edit.png?raw=true)

- 评论管理

	![comment-list](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/comment-list.png?raw=true)

- 系统配置

	![config](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/config.png?raw=true)

### 博客展示页面

开发时，在项目中**内置了三套博客主题模板，主题风格各有千秋**，效果如下：

#### 模板一

- 首页

	![index01](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/index01.png?raw=true)

- 文章浏览

	![detail01](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/detail01.png?raw=true)

- 友情链接

	![link01](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/link01.png?raw=true)

#### 模板二

- 首页


	![index02](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/index02.png?raw=true)

- 文章浏览

	![detail02](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/detail02.png?raw=true)

- 友情链接

	![link02](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/link02.png?raw=true)

#### 模板三

- 首页

  ![index03](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/index03.png?raw=true)

- 文章浏览

  ![detail03](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/detail03.png?raw=true)

- 友情链接

  ![link03](https://github.com/ZHENFENG13/My-Blog/blob/master/static-files/link03.png?raw=true)

# 参考资料

https://github.com/saysky/ForestBlog/blob/master/README.md

* any list
{:toc}