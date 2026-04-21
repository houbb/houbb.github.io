---
layout: post 
title: YouTube Plus（原名 YTLite） 一款灵活的 iOS 版 YouTube 增强工具，提供上百项可自定义选项。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai]
published: true
---

# YouTube Plus（原名 YTLite）

一款灵活的 iOS 版 YouTube 增强工具，提供上百项可自定义选项。

## 目录
- [截图](#截图)
- [主要功能](#主要功能)
- [常见问题](#常见问题)
- [评价](#评价)
- [如何使用 GitHub Actions 构建 YouTube Plus 应用](#如何使用-github-actions-构建-youtube-plus-应用)
- [支持的 YouTube 版本](#支持的-youtube-版本)
- [插件集成详情](#插件集成详情)


## 主要功能

- 下载视频、音频（含音轨选择）、缩略图、帖子及头像
- 复制视频、评论和帖子信息
- 界面定制：移除 Feed 元素、重新排序标签页、启用 OLED 模式、仅显示 Shorts 模式
- 播放器设置：手势、默认画质、首选音轨
- 保存、加载和恢复设置。一键清除缓存或应用启动时自动清除
- 内置 SponsorBlock
- 还有更多更多功能

**YouTube Plus 的首选项可在 YouTube 设置中找到**

**所有贡献者均列在贡献者部分**
**使用的开源库列在开源库部分**

> [!NOTE]
> 从 5.2 版本开始，YTPlus 需要订阅。  
> 最后一个免费版本是 [5.2b4](https://github.com/dayanch96/YTLite/releases/tag/v5.2b4)。

## 常见问题
- [🇺🇸 英文 FAQ](FAQs/FAQ_EN.md)
- [🇷🇺 俄语 FAQ](FAQs/FAQ_RU.md)
- [🇮🇹 意大利语 FAQ](FAQs/FAQ_IT.md)
- [🇵🇱 波兰语 FAQ](FAQs/FAQ_PL.md)

## 评价
[@qbap](https://github.com/qbap) 在 ONE Jailbreak 上的评价：https://onejailbreak.com/blog/youtube-plus/

## 如何使用 GitHub Actions 构建 YouTube Plus 应用
> [!NOTE]
> 如果你是第一次使用，请在开始前完成以下步骤：
>
> 1. 使用右上角的 fork 按钮复刻此仓库
> 2. 在你的复刻仓库中，前往 **仓库设置** > **Actions**，启用 **读写权限**。

<details>
  <summary>如何构建 YouTube Plus 应用</summary>
  <ol>
    <li>点击 <strong>Sync fork</strong>，如果分支已过时，点击 <strong>Update branch</strong>。</li>
    <li>导航到复刻仓库中的 <strong>Actions 标签页</strong>，选择 <strong>Create YouTube Plus app</strong>。</li>
    <li>点击右侧的 <strong>Run workflow</strong> 按钮。</li>
    <li>勾选或取消勾选你想要集成的插件。更多信息请参见 <a href="#插件集成详情">插件集成详情</a> 部分。</li>
    <li>准备一个已解密的 .ipa 文件 <em>（由于法律原因，我们无法提供此文件）</em>，然后上传到文件提供商（推荐 filebin.net、filemail.com 或 Dropbox）。将解密 IPA 文件的 URL 粘贴到提供的字段中。</li>
    <li><strong>注意：</strong> 请确保提供文件的直接下载链接，而不是网页链接，否则过程将失败。</li>
    <li>输入来自发布页的插件版本（默认选择最新发布版本）。你也可以根据需要修改 BundleID 和显示名称。</li>
    <li>确认所有输入正确，然后点击 <strong>Run workflow</strong> 开始构建过程。</li>
    <li>等待构建完成。你可以从复刻仓库的发布部分下载 YouTube Plus 应用。（如果找不到发布部分，请前往你的复刻仓库并在 URL 后添加 /releases，例如 github.com/user/YTLite/releases。）</li>
  </ol>
</details>

<details>
  <summary>如何使用自己的 YouTube Plus 插件链接构建 YouTube Plus 应用</summary>
  <ol>
    <blockquote>
      <p><strong>注意：</strong> 此选项主要用于基于你拥有的测试版文件构建 YouTube Plus 应用。其他情况下通常不需要。</p>
    </blockquote>
    <li>点击 <strong>Sync fork</strong>，如果分支已过时，点击 <strong>Update branch</strong>。</li>
    <li>导航到复刻仓库中的 <strong>Actions 标签页</strong>，选择 <strong>[BETA] Build YouTube Plus app</strong>。</li>
    <li>点击右侧的 <strong>Run workflow</strong> 按钮。</li>
    <li>勾选或取消勾选你想要集成的插件。更多信息请参见 <a href="#插件集成详情">插件集成详情</a> 部分。</li>
    <li>准备一个已解密的 .ipa 文件 <em>（由于法律原因，我们无法提供此文件）</em>，然后上传到文件提供商（推荐 filebin.net、filemail.com 或 Dropbox）。将解密 IPA 文件的 URL 粘贴到提供的字段中。</li>
    <li>将你的测试版插件文件上传到文件提供商，并将直接链接粘贴到 <strong>URL to the YouTube Plus tweak file</strong> 字段。你也可以根据需要修改 BundleID 和显示名称。</li>
    <li><strong>注意：</strong> 请确保提供文件的直接下载链接，而不是网页链接，否则过程将失败。</li>
    <li>确认所有输入正确，然后点击 <strong>Run workflow</strong> 开始构建过程。</li>
    <li>等待构建完成。你可以从复刻仓库的发布部分下载 YouTube Plus 应用。（如果找不到发布部分，请前往你的复刻仓库并在 URL 后添加 /releases，例如 github.com/user/YTLite/releases。）</li>
  </ol>
</details>

## 支持的 YouTube 版本
<ul>
   <li><strong>最新确认版本：</strong> <em>21.15.5</em></li>
   <li><strong>测试日期：</strong> <em>2026年4月20日</em></li>
   <li><strong>YouTube Plus 版本：</strong> <em>5.2</em></li>
</ul>

## 插件集成详情
<details>
  <summary>YouPiP</summary>
  <p>YouPiP 是由 <a href="https://github.com/PoomSmart">PoomSmart</a> 开发的插件，可为 iOS YouTube 应用中的视频启用原生画中画功能。</p>
  <p><strong>YouPiP 首选项</strong> 可在 <strong>YouTube 设置</strong> 中找到。</p>
  <p>源代码和其他信息请访问 <a href="https://github.com/PoomSmart/YouPiP">PoomSmart 的 GitHub 仓库</a>。</p>
</details>

<details>
  <summary>YTUHD</summary>
  <p>YTUHD 是由 <a href="https://github.com/PoomSmart">PoomSmart</a> 开发的插件，可在 iOS YouTube 应用中解锁 1440p（2K）和 2160p（4K）分辨率。</p>
  <p><strong>YTUHD 首选项</strong> 可在 <strong>YouTube 设置</strong> 下的 <strong>视频画质偏好</strong> 部分找到。</p>
  <p>源代码和其他信息请访问 <a href="https://github.com/PoomSmart/YTUHD">PoomSmart 的 GitHub 仓库</a>。</p>
</details>

<details>
  <summary>Return YouTube Dislikes</summary>
  <p>Return YouTube Dislikes 是由 <a href="https://github.com/PoomSmart">PoomSmart</a> 开发的插件，可在 YouTube 应用中恢复“不喜欢”计数显示。</p>
  <p><strong>Return YouTube Dislikes 首选项</strong> 可在 <strong>YouTube 设置</strong> 中找到。</p>
  <p>源代码和其他信息请访问 <a href="https://github.com/PoomSmart/Return-YouTube-Dislikes">PoomSmart 的 GitHub 仓库</a>。</p>
</details>

<details>
  <summary>YouQuality</summary>
  <p>YouQuality 是由 <a href="https://github.com/PoomSmart">PoomSmart</a> 开发的插件，允许直接在视频叠加层上查看和更改视频画质。</p>
  <p><strong>YouQuality 可在</strong> <strong>YouTube 设置</strong> 下的 <strong>视频叠加层</strong> 部分启用。</p>
  <p>源代码和其他信息请访问 <a href="https://github.com/PoomSmart/YouQuality">PoomSmart 的 GitHub 仓库</a>。</p>
</details>

<details>
  <summary>DontEatMyContent</summary>
  <p>DontEatMyContent 是由 <a href="https://github.com/therealFoxster">therealFoxster</a> 开发的插件，可防止 iOS YouTube 应用中的刘海/灵动岛遮挡 2:1 视频内容。</p>
  <p><strong>DontEatMyContent 首选项</strong> 可在 <strong>YouTube 设置</strong> 中找到。</p>
  <p>源代码和其他信息请访问 <a href="https://github.com/therealFoxster/DontEatMyContent">therealFoxster 的 GitHub 仓库</a>。</p>
</details>

# 参考资料

* any list
{:toc}