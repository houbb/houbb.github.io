---
layout: post
title: 一键发布入门概览
date: 2024-03-27 21:01:55 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 登录

https://github.com/xchaoinfo/fuck-login

# 开源工具

## BlogHelper

帮助国内用户写作的托盘助手，一键发布本地文章到主流博客平台（知乎、简书、博客园、CSDN、SegmentFault、掘金、开源中国），剪贴板图片一键上传至图床（新浪、Github、图壳、腾讯云、阿里云、又拍云、七牛云）（欢迎Star，🚫禁止Fork）

https://github.com/onblog/BlogHelper

### 特性

一键发布本地文章到知乎、简书、博客园、CSDN、掘金、SegmentFault(思否)、开源中国等平台。

支持的图床有：新浪、SM.MS、Github、Imgur、七牛云、腾讯云、阿里云、又拍云。

支持快捷键上传剪贴板里第一张图片，更新剪贴板内容为图片链接。

一键将本地文章中引用的本地图片上传到图床并替换为引用链接。

对剪贴板拷贝的代码进行对齐操作，解决粘贴代码左侧留白的苦恼。

一键将HTML文件转换为Markdown文本文件（支持批量）。

对本地文章中的图片进行各种DIY操作，一键网络图片下载，一键本地文章整理。

丰富的工具集，包括一键打开微信文章排版，一键打开图片素材网站等。




## Wechatsync

一键同步文章到多个内容平台，支持今日头条、WordPress、知乎、简书、掘金、CSDN、typecho各大平台，一次发布，多平台同步发布。解放个人生产力

https://github.com/wechatsync/Wechatsync


# 测试代码

## html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简单页面</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wechatsync/article-syncjs@latest/dist/styles.css" />
</head>
<body>
    <h1>欢迎来到我的网页</h1>
    <p>这是一个简单的HTML5页面。</p>
    <script src="https://cdn.jsdelivr.net/gh/wechatsync/article-syncjs@latest/dist/main.js"></script>
    <script>
        window.syncPost && window.syncPost({
            title: 'Ractor 下多线程 Ruby 程序指南',
            desc: '什么是 Ractor? Ractor 是 Ruby 3 新引入的特性。Ractor 顾名思义是 Ruby 和',
            content: 'hello world',
            thumb: 'http://mmbiz.qpic.cn/mmbiz_jpg/CJcVm4ThlNOeib5w5A6MYk4Eg9ErnzZ73dEicribs3gPPUB4cCxiaeRm2ZfNOibHfl4TIo8h6VlFZeBRmLoMKgibvPdw/0?wx_fmt=jpeg'
        });
    </script>
</body>
</html>
```

## 小结

问题是永恒的，但是解法却多是多变的。

在**人类历史的长河中，我们总是在不断地努力接近答案**。

我是老马，期待与你的下次重逢。

# 拓展阅读

[随手写个文章多平台发布脚本](https://juejin.cn/post/7032129362056970254)

[某星球的简单爬取](https://juejin.cn/post/7026000436062584863)

[某站点课程的简单爬取](https://juejin.cn/post/7023659203692593182)

# chat

## 如何实现一键发布平台

实现一个博客一键发布平台涉及到多个方面，包括前端界面设计、后端服务开发、数据库设计、用户认证、内容管理、发布流程、以及部署等。下面我将提供一个概要的步骤指南，帮助你理解整个过程：

### 1. 需求分析
- **确定目标用户**：了解你的用户群体，他们的需求是什么。
- **功能规划**：列出你需要实现的功能，如文章编辑、发布、分类、评论、搜索等。

### 2. 系统设计
- **架构设计**：决定是使用单体应用还是微服务架构。
- **数据库设计**：设计数据模型，考虑如何存储文章、用户信息、评论等。
- **接口设计**：设计前后端交互的API接口。

### 3. 技术选型
- **前端技术**：如React, Vue.js, Angular等。
- **后端技术**：如Node.js, Django, Ruby on Rails等。
- **数据库**：如MySQL, PostgreSQL, MongoDB等。
- **云服务**：如AWS, Azure, Google Cloud等。

### 4. 用户认证
- **注册/登录**：实现用户注册和登录功能。
- **权限管理**：确保不同用户有不同的操作权限。

### 5. 内容管理系统（CMS）
- **文章编辑器**：可以是一个富文本编辑器，如TinyMCE或CKEditor。
- **草稿管理**：允许用户保存草稿，以便后续编辑。
- **内容审核**：如果需要，可以设置内容审核流程。

### 6. 发布流程
- **一键发布**：用户点击发布按钮后，系统将文章发布到博客上。
- **定时发布**：允许用户设置定时发布。

### 7. 部署
- **服务器配置**：配置服务器环境，包括Web服务器和数据库服务器。
- **域名设置**：购买并设置域名。
- **CDN和缓存**：提高网站的访问速度。

### 8. 安全性
- **数据加密**：对敏感数据进行加密。
- **防止SQL注入**：使用参数化查询。
- **XSS和CSRF保护**：防止跨站脚本攻击和跨站请求伪造。

### 9. 测试
- **单元测试**：对每个模块进行测试。
- **集成测试**：测试整个系统的集成情况。
- **性能测试**：确保系统能够承受预期的负载。

### 10. 维护和更新
- **监控系统性能**：使用工具监控系统性能和错误。
- **定期更新**：根据用户反馈和市场变化更新系统。

### 11. 用户反馈和迭代
- **收集用户反馈**：了解用户对平台的使用体验。
- **持续迭代**：根据反馈不断改进平台。

### 示例技术栈
- **前端**：React + Redux
- **后端**：Node.js + Express
- **数据库**：MongoDB
- **用户认证**：JWT + Passport.js
- **部署**：Docker + Kubernetes（如果需要高可用性）

### 注意事项
- **用户体验**：确保平台界面友好，操作简便。
- **可扩展性**：设计时考虑未来可能的功能扩展。
- **遵守法律法规**：确保平台遵守相关的互联网法规和版权法。

这是一个高层次的指南，具体实现时还需要考虑很多细节。如果你需要更详细的帮助，可以进一步提问。

## 如何实现不同平台的登录 cookie 问题？

实现不同平台的登录并处理cookie问题通常涉及到跨域资源共享（CORS）和安全传输身份验证信息的需求。以下是一些关键步骤和方法：

### 1. 理解Cookie的作用域
- **域**：Cookie是与特定域绑定的，浏览器会根据请求的域发送相应的Cookie。
- **路径**：Cookie可以设置特定的路径，只有匹配路径的请求才会携带该Cookie。

### 2. 使用子域
- 如果你的不同平台是在同一主域下的不同子域上（如 `platform1.example.com` 和 `platform2.example.com`），可以通过设置Cookie的域属性为父域（`.example.com`）来实现共享。

### 3. CORS策略
- 当不同平台位于完全不同的域时，需要通过CORS策略来控制不同域间的资源共享。

### 4. 使用JSON Web Tokens (JWT)
- JWT是一种无状态的、基于JSON的对象，可以通过HTTP请求携带，常用于跨域认证。
- 用户登录后，服务器生成一个JWT并将其发送回客户端。
- 客户端将JWT存储在Cookie或LocalStorage中。
- 每次请求时，客户端将JWT附加在HTTP请求的Authorization头中。

### 5. 使用OAuth或OpenID Connect
- 这些是广泛使用的开放标准，允许用户使用第三方服务（如Google、Facebook）登录。
- 这些协议处理了大部分的跨域认证问题。

### 6. 设置Cookie的SameSite属性
- `SameSite`属性可以设置为`Strict`、`Lax`或`None`，以控制Cookie随跨域请求发送的行为。
  - `Strict`：Cookie仅随相同域的请求发送。
  - `Lax`：Cookie仅随顶级域的GET请求发送。
  - `None`：Cookie允许随跨域请求发送，但必须通过`Secure`属性确保HTTPS。

### 7. 使用Secure属性
- 设置Cookie的`Secure`属性，确保只有通过HTTPS协议的请求才会发送Cookie。

### 8. 使用HTTPOnly属性
- 设置`HTTPOnly`属性，使Cookie不会通过JavaScript的`document.cookie`访问，增加安全性。

### 9. 跨域Cookie管理
- 如果需要在多个独立的域之间共享身份验证状态，可以考虑使用中央认证服务器，所有平台都通过该服务器进行用户认证。

### 10. 考虑使用浏览器特性
- 利用浏览器的新特性，如`Window.postMessage`或`Cross-Origin Resource Sharing`（CORS）的`credentials`模式。

### 11. 安全性考虑
- 确保传输过程中使用HTTPS，以避免中间人攻击。
- 定期旋转密钥和实施合理的访问控制策略。

### 12. 测试和调试
- 使用浏览器的开发者工具来检查Cookie的发送和接收。
- 确保在不同的场景下（如不同的域、不同的端口、不同的协议）Cookie的行为符合预期。

### 13. 用户体验
- 确保在处理跨域登录时，用户的体验尽可能无缝和直观。

通过上述方法，你可以实现不同平台间的登录并有效管理Cookie问题。每种方法都有其适用场景和限制，需要根据你的具体需求和架构来选择最合适的方案。

# 参考资料

* any list
{:toc}
