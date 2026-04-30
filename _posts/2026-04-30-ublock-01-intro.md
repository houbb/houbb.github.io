---
layout: post 
title: uBlock Origin (uBO) 是一款 CPU 和内存高效的[广谱内容拦截器][Blocking]，适用于 Chromium 和 Firefox。
date: 2026-04-30 21:01:55 +0800
categories: [Tool]
tags: [tool]
published: true
---

# uBlock Origin (uBO)

| 浏览器   | 安装来源 ... | 状态 |
| :-------: | ---------------- | ------ |
| <img src="https://github.com/user-attachments/assets/b0136512-56a5-4856-8c50-4971c957a24f" alt="获取 Firefox 版 uBlock Origin"> | <a href="https://addons.mozilla.org/addon/ublock-origin/">Firefox 附加组件</a> | [uBO 在 Firefox 上运行最佳](https://github.com/gorhill/uBlock/wiki/uBlock-Origin-works-best-on-Firefox) |
| <img src="https://github.com/user-attachments/assets/3a7569f8-688b-4eb1-a643-8d0fe173aefe" alt="获取 Microsoft Edge 版 uBlock Origin"> | <a href="https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak">Edge 附加组件</a> |
| <img src="https://github.com/user-attachments/assets/938f080c-fe64-4e48-8b89-4bfceabb56e6" alt="获取 Opera 版 uBlock Origin"> | <a href="https://addons.opera.com/extensions/details/ublock/">Opera 附加组件</a> |
| <img src="https://github.com/user-attachments/assets/5463ef88-873b-4516-8514-5277664cfde7" alt="获取 Chromium 版 uBlock Origin"> | <a href="https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm">Chrome 网上应用店</a> | <a href="https://github.com/uBlockOrigin/uBlock-issues/wiki/About-Google-Chrome's-%22This-extension-may-soon-no-longer-be-supported%22">关于 Google Chrome 的 "此扩展可能很快将不再受支持"</a><br>Chrome 139 后停止支持 |
| <img src="https://github.com/user-attachments/assets/2e9037c4-836d-44c1-a716-ba96e89daaff" alt="获取 Thunderbird 版 uBlock Origin"> | <a href="https://addons.thunderbird.net/thunderbird/addon/ublock-origin/">Thunderbird 附加组件</a> | [不再更新，停留在 1.49.2 版本。](https://github.com/uBlockOrigin/uBlock-issues/issues/2928) 更高版本需通过 "GitHub - Releases" 获取。 |
| <img src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg" height="50" alt="通过 GitHub 获取 uBlock Origin"> | <a href="https://github.com/gorhill/uBlock/releases">GitHub - 发布</a> | 适用于 Firefox、Chromium MV2 和 Thunderbird 的稳定版及开发版。必须手动安装到浏览器中；Chromium 和 Thunderbird 版本通常不会自动更新。 |

***

uBlock Origin (uBO) 是一款 CPU 和内存高效的[广谱内容拦截器][Blocking]，适用于 Chromium 和 Firefox。它默认使用 [EasyList][EasyList]、[EasyPrivacy][EasyPrivacy]、[Peter Lowe's Blocklist][Peter Lowe's Blocklist]、[在线恶意 URL 黑名单][Malicious Blocklist] 和 uBO [过滤规则列表][uBO Filters] 来屏蔽广告、跟踪器、挖矿程序、弹窗、烦人的反拦截脚本、恶意网站等。还有许多其他列表可用于拦截更多内容。hosts 文件也受支持。uBO 使用 EasyList 过滤语法，并[扩展][Extended Syntax]了该语法，以便使用自定义规则和过滤器。

如果您觉得 uBO 拦截过多，可以轻松取消选中的预设过滤列表。作为参考，Adblock Plus 安装时默认仅启用 EasyList、ABP 过滤器和可接受广告。

需要强调的是，使用拦截器**不是**[盗窃行为][Theft]。请不要被这种令人不快的观念所蒙蔽。将“拦截等于盗窃”的逻辑推演到极致，就是将不可剥夺的隐私权定为刑事犯罪。

广告，无论是否“非侵入式”，只是您访问大多数网站时进入浏览器的隐私侵犯手段的可见部分。**uBO 的主要目标是帮助用户化解这些隐私侵犯手段**，并欢迎那些不想使用更具技术性手段的用户。

***

* [文档](#documentation)
* [安装](#installation)
  * [Firefox](#firefox)
  * [Thunderbird](#thunderbird)
  * [Chromium](#chromium)
  * [所有程序](#all-programs)
  * [企业部署](#enterprise-deployment)
* [发布历史](#release-history)
* [翻译](#translations)
* [关于](#about)

## 文档

<table>
    <thead>
        <tr>
            <th>基础模式</th>
            <th>高级模式</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><a href="https://github.com/gorhill/uBlock/wiki/Quick-guide:-popup-user-interface">简洁的弹出用户界面</a>，适合安装后即忘的场景，默认即为最优配置。</td>
            <td><a href="https://github.com/gorhill/uBlock/wiki/Dynamic-filtering:-quick-guide">高级弹出用户界面</a> 包含一个可点击的防火墙，可按网站进行配置。</td>
        </tr>
        <tr>
            <td align="center" valign="top"><a href="https://github.com/gorhill/uBlock/wiki/Quick-guide:-popup-user-interface"><img src="https://user-images.githubusercontent.com/585534/232531044-c4ac4dd5-0b60-4c1e-aabb-914be04b846c.png"/></a></td>
            <td align="center" valign="top"><a href="https://github.com/gorhill/uBlock/wiki/Dynamic-filtering:-quick-guide"><img src="https://user-images.githubusercontent.com/585534/232531439-a8f81cc3-6622-45c4-8b32-7348cecf6e98.png"/></a></td>
        </tr>
    </tbody>
</table>

访问 [Wiki][Wiki] 获取文档。

如需支持、提问或帮助，请访问 [/r/uBlockOrigin][Reddit]。

## 安装

[所需权限][Permissions]

#### Firefox

[Firefox 附加组件][Mozilla]

[开发版本][Beta]

uBO 在 Firefox 上[运行最佳][Works Best]，支持桌面版和 Android 版。

#### Thunderbird

[Thunderbird 附加组件][Thunderbird]

在 Thunderbird 中，uBlock Origin 不会影响电子邮件，仅作用于订阅源。

#### Chromium

[Chrome 网上应用店][Chrome]

[Microsoft Edge 附加组件][Edge]（在 1.62 版本前由 [Nicole Rolls][Nicole Rolls] 发布；1.64 版本已转移所有权。）

[Opera 附加组件][Opera]

[开发版本][Chrome Dev]

uBO 应与任何基于 Chromium 的浏览器兼容。

#### 所有程序

请**不要**将 uBO 与其他任何内容拦截器一起使用。uBO 的[性能][Performance]与大多数流行拦截器相当或更优。其他拦截器可能会阻止 uBO 的隐私或反拦截器-失效防护功能正常工作。

[手动安装][Manual Installation]

#### 企业部署

[部署 uBO][Deployment]

## 发布历史

[发布页面][Releases]

## 翻译

通过 [Crowdin][Crowdin] 帮助翻译 uBO。

## 关于

[宣言][Manifesto]

[隐私政策][Privacy Policy]

[GPLv3 许可证][License]

自由。开源。取之于用户，用之于用户。不寻求捐赠。

若您想贡献些什么，请考虑那些为维护您正在使用的过滤列表而辛勤付出的人们，这些列表免费供所有人使用。

# 参考资料

* any list
{:toc}