---
layout: post 
title: Invidious 一个开源的 YouTube 替代前端
date: 2026-04-29 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# Invidious

  <h3>一个开源的 YouTube 替代前端</h3>

  <a href="https://invidious.io/">网站</a>
  &nbsp;•&nbsp;
  <a href="https://instances.invidious.io/">实例列表</a>
  &nbsp;•&nbsp;
  <a href="https://docs.invidious.io/faq/">常见问题</a>
  &nbsp;•&nbsp;
  <a href="https://docs.invidious.io/">文档</a>
  &nbsp;•&nbsp;
  <a href="#contribute">贡献</a>
  &nbsp;•&nbsp;
  <a href="https://invidious.io/donate/">捐赠</a>

## 截图

| 播放器                              | 偏好设置                         | 订阅                         |
|-------------------------------------|-------------------------------------|---------------------------------------|
| ![](screenshots/01_player.png)      | ![](screenshots/02_preferences.png) | ![](screenshots/03_subscriptions.png) |
| ![](screenshots/04_description.png) | ![](screenshots/05_preferences.png) | ![](screenshots/06_subscriptions.png) |


## 功能

**用户功能**
- 轻量级
- 无广告
- 无追踪
- 无需 JavaScript
- 明暗主题
- 可自定义首页
- 独立于 Google 的订阅
- 所有已订阅频道的通知
- 纯音频模式（支持移动端后台播放）
- 支持 Reddit 评论
- [提供多种语言](locales/)，感谢[我们的翻译者](#contribute)

**数据导入/导出**
- 从 YouTube、NewPipe 和 FreeTube 导入订阅
- 从 YouTube 和 NewPipe 导入观看历史
- 导出订阅至 NewPipe 和 FreeTube
- 导入/导出 Invidious 用户数据

**技术特性**
- 嵌入式视频支持
- [开发者 API](https://docs.invidious.io/api/)
- 不使用官方 YouTube API
- 无贡献者许可协议（CLA）


## 快速开始

**使用 Invidious：**

- [从列表中选择一个公共实例](https://instances.invidious.io)，立即开始观看视频！

**托管 Invidious：**

- [遵循安装说明](https://docs.invidious.io/installation/)


## 文档

完整文档可在 https://docs.invidious.io/ 在线获取

文档源代码在此仓库中：
https://github.com/iv-org/documentation

### 扩展

我们强烈推荐使用 [Privacy Redirect](https://github.com/SimonBrazell/privacy-redirect#get)，
这是一个浏览器扩展，可自动将 YouTube URL 重定向到任意 Invidious 实例，并将其他网站上的嵌入式 YouTube 视频替换为 Invidious。

文档中包含我们建议与 Invidious 一起使用的浏览器扩展列表。

更多信息请查看：https://docs.invidious.io/applications/

## 贡献

### 代码

1.  Fork 仓库（ https://github.com/iv-org/invidious/fork ）。
1.  创建你的功能分支（`git checkout -b my-new-feature`）。
1.  暂存文件（`git add .`）。
1.  提交更改（`git commit -m '添加某个功能'`）。
1.  推送到分支（`git push origin my-new-feature`）。
1.  新建一个 Pull Request（ https://github.com/iv-org/invidious/compare ）。

### 翻译

我们使用 [Weblate](https://weblate.org) 来管理 Invidious 的翻译。

你可以在这里提交新的翻译和/或校正建议：https://hosted.weblate.org/engage/invidious/。

创建账号并非必须，但推荐创建，尤其是如果你希望定期贡献。
Weblate 还允许你使用主要的 SSO 提供商（如 GitHub、GitLab、BitBucket、Google 等）登录。


## 使用 Invidious 的项目

可以在文档中找到为 Invidious 开发或利用它的项目和扩展列表：https://docs.invidious.io/applications/

## 责任声明

我们对使用本工具或第三方提供的外部实例不承担任何责任。我们强烈建议您遵守所在国家的有效官方法规。此外，我们拒绝对任何不当使用 Invidious（例如非法下载）的行为承担责任。本工具本着自由、开源软件的精神提供给您。

您可以在[此处](./LICENSE)查看本软件所依据的许可协议。

>   16. 责任限制。
>
> 除非适用法律要求或书面同意，否则任何版权持有人，或按上述允许修改和/或分发本程序的任何其他方，均不对您承担损害赔偿责任，包括因使用或无法使用本程序而引起的任何一般性、特殊性、偶然性或后果性损害（包括但不限于数据丢失或数据不准确，或您或第三方遭受的损失，或本程序无法与任何其他程序协同运行），即使该持有人或其他方已被告知发生此类损害的可能性。


# 参考资料

* any list
{:toc}