---
layout: post 
title: Reddit 视频制作机器人 🎥
date: 2026-04-08 21:01:55 +0800
categories: [AI]
tags: [ai, llm, video]
published: true
---

# Reddit 视频制作机器人 🎥

整个过程**无需**视频编辑或素材整理。纯粹是✨编程魔法✨。

由 Lewis Menelaws 与 [TMRRW](https://tmrrwinc.ca) 制作

<a target="_blank" href="https://tmrrwinc.ca">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/6053155/170528535-e274dc0b-7972-4b27-af22-637f8c370133.png">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/6053155/170528582-cb6671e7-5a2f-4bd4-a048-0e6cfa54f0f7.png">
  <img src="https://user-images.githubusercontent.com/6053155/170528582-cb6671e7-5a2f-4bd4-a048-0e6cfa54f0f7.png" width="350">
</picture>
</a>

## 视频讲解

[![lewisthumbnail](https://user-images.githubusercontent.com/6053155/173631669-1d1b14ad-c478-4010-b57d-d79592a789f2.png)](https://www.youtube.com/watch?v=3gjcY_00U1w)

## 动机 🤔

这类视频在 TikTok、YouTube 和 Instagram 上能获得**数百万**的播放量，而且几乎不需要什么投入。
唯一原创的部分就是剪辑和素材收集……

……但如果我们能把这个过程自动化呢？🤔

## 免责声明 🚨

- **目前**，本仓库不会尝试通过机器人自动上传这些内容。它会生成一个文件，你需要**手动**上传。这是为了避免触犯任何社区准则问题。

## 环境要求

- Python 3.10
- Playwright（安装时会自动安装）

## 安装步骤 👩‍💻

1. 克隆本仓库：
    ```sh
    git clone https://github.com/elebumm/RedditVideoMakerBot.git
    cd RedditVideoMakerBot
    ```

2. 创建并激活虚拟环境：
    - **Windows**：
        ```sh
        python -m venv ./venv
        .\venv\Scripts\activate
        ```
    - **macOS 和 Linux**：
        ```sh
        python3 -m venv ./venv
        source ./venv/bin/activate
        ```

3. 安装所需依赖：
    ```sh
    pip install -r requirements.txt
    ```

4. 安装 Playwright 及其依赖：
    ```sh
    python -m playwright install
    python -m playwright install-deps
    ```

---

**实验性功能！！！**

   - 在 macOS 和 Linux（Debian、Arch、Fedora、CentOS 及其衍生版）上，你可以运行一个安装脚本，自动完成第 1 至第 3 步。（需要 bash）
   - `bash <(curl -sL https://raw.githubusercontent.com/elebumm/RedditVideoMakerBot/master/install.sh)`
   - 此脚本也可用于更新安装

---

5. 运行机器人：
    ```sh
    python main.py
    ```

6. 访问 [Reddit 应用页面](https://www.reddit.com/prefs/apps)，创建一个“脚本”类型的应用。在重定向 URL 字段中粘贴任意 URL，例如：`https://jasoncameron.dev`。

7. 机器人会提示你填写相关信息以连接 Reddit API，并根据你的喜好配置机器人。

8. 尽情享受吧 😎

9. 如果需要重新配置机器人，只需打开 `config.toml` 文件，删除需要更改的行。下次运行机器人时，它会帮助你重新配置这些选项。

（注意：如果在安装或运行机器人时遇到任何错误，请尝试使用 `python3` 或 `pip3` 而不是 `python` 或 `pip`。）

关于机器人的更详细指南，请参考[文档](https://reddit-video-maker-bot.netlify.app/)。

## 视频

https://user-images.githubusercontent.com/66544866/173453972-6526e4e6-c6ef-41c5-ab40-5d275e724e7c.mp4

## 贡献与改进方向 📈

在当前状态下，这个机器人已经完成了它需要做的事情。不过，总可以做得更好！

我已尽量简化代码，让任何人都能阅读并开始贡献，无论技术水平如何。别害羞，来贡献吧！

- [ ] 编写更好的文档，并添加命令行界面。
- [x] 允许用户为视频选择背景音乐。
- [x] 允许用户选择特定的 Reddit 帖子，而不是随机选取。
- [x] 允许用户选择其他背景，而不是 Minecraft 背景。
- [x] 允许用户选择任意子版块。
- [x] 允许用户更换语音。
- [x] 检查视频是否已生成过。
- [x] 浅色和深色模式。
- [x] NSFW 帖子过滤器。

请阅读我们的[贡献指南](CONTRIBUTING.md)以获取更详细的信息。

### 如有任何问题或需要支持，请加入 [Discord](https://discord.gg/qfQSx45xCV) 服务器

## 开发者和维护者

Elebumm (Lewis#6305) - https://github.com/elebumm (创始人)

Jason Cameron - https://github.com/JasonLovesDoggo (维护者)

Simon (OpenSourceSimon) - https://github.com/OpenSourceSimon

CallumIO (c.#6837) - https://github.com/CallumIO

Verq (Verq#2338) - https://github.com/CordlessCoder

LukaHietala (Pix.#0001) - https://github.com/LukaHietala

Freebiell (Freebie#3263) - https://github.com/FreebieII

Aman Raza (electro199#8130) - https://github.com/electro199

Cyteon (cyteon) - https://github.com/cyteon

## 许可证
[Roboto 字体](https://fonts.google.com/specimen/Roboto/about) 采用 [Apache License V2](https://www.apache.org/licenses/LICENSE-2.0) 许可。

# 参考资料

* any list
{:toc}