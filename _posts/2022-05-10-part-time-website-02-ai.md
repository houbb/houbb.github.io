---
layout: post
title:  AI 艺术图片生成网站
date:  2022-05-10 09:22:02 +0800
categories: [Work]
tags: [work, part-time, sh]
published: true
---


# dalle2

[DALL·E 2](https://openai.com/dall-e-2/#demos) is a new AI system that can create realistic images and art from a description in natural language.

# disco diffusion

## 什么是 Disco Diffusion？

Disco Diffusion 是在今年 2 月初开始流行的一个 AI 图像生成程序，它可以根据描述场景的关键词渲染出对应的图像，开发者是艺术家兼程序开发员 @Somnai_dreams 。

这款程序的特点在于：它直接托管在谷歌的 Colaboratory 上的，即整个程序是直接在浏览器中编写和运行代码的。

这也意味着使用 Disco Diffusion 对电脑配置没有要求，因为程序不需要被部署到本地。

Github 地址 👉 https://github.com/alembics/disco-diffusion

## Disco Diffusio 程序的首页

Disco Diffusion 程序的首页不是我们熟悉的用户界面，而是一行行看起来很复杂代码——有点像没有外壳的机器，将线路零件直接呈现在用户面前了。

这些代码就是 Disco Diffusion 整个程序运行下来的所需的全部代码，而且都已经按步骤分类好了。

看起来很深奥，但真正需要我们动手修改参数的地方极少，跟随网站上的教学视频你可以很快就弄懂如何操作。

官方网站：https://colab.research.google.com/github/alembics/disco-diffusion/blob/main/Disco_Diffusion.ipynb

## 人工智能绘画工具 Disco Diffusion 入门教程



# 入门教程

01. 使用浏览器打开 Disco Diffusion v5.2 [w/ VR Mode]（https://colab.research.google.com/github/alembics/disco-diffusion/blob/main/Disco_Diffusion.ipynb）。

02. 点击页面右上角「登录」按钮，登入你的谷歌账号。

03. 点击「复制到云端硬盘」或点击「文件」选择「在云端硬盘中保存一份副本」。 

![cloud](https://i0.hdslb.com/bfs/article/c5b20b56aac0593748afc8c6f06176932643b24e.jpg@942w_542h_progressive.webp)

04. 副本创建完成会出现「笔记本的副本已完成」弹窗，点击「在新标签页中打开」。

05. 单击「“Disco Diffusion v5.2 [w/ VR Mode]”的副本」修改笔记本名称（以下所有代码可视为源文件/源代码，此处是源文件的名称，可按创作主题或其他方式命名，方便后期修改和区分）。 

06. 修改 batch_name（图片保存在云盘的名称）；设置 steps，可按默认值（通常 200 - 300 已经足够，若效果不符合预期可适当调整）；

设置 width_height（图片尺寸，需是 64 的倍数，请勿设置过大尺寸，新手可按默认设置）。 

![width height](https://i0.hdslb.com/bfs/article/784bc46fbde12f1569893def5494ce87096bad94.jpg@942w_542h_progressive.webp)

07. 点击 Extra Settings 前面的小三角，设置 intermediate_saves（设置过程图保存张数，设置为 0 渲染完成只保存最后一张图，设置为 2，渲染完成会得到一张进度 33%、一张 66% 和一张 100% 的图片，数值越大数量越多，不影响渲染速度）。 

![07](https://i0.hdslb.com/bfs/article/80cb8410a6a93df0604a9592e78fea709ebb60a9.jpg@942w_542h_progressive.webp)

08. 设置 Prompts（在这里输入描述画面的语句，格式为"XXXX, XXXX, XXXX."，建议在其他地方编辑好直接粘贴过来，保留最前和最后的引号，使用一个 Prompt 即可，不要求是完整的句子，可以是长短句或单词，可参考默认结构，前置词描述画作类别，中间描述画面内容，后接参考风格的艺术家，另外可以增加整体风格的词汇或者其他内容，emoji 也可以）。 

![promotion](https://i0.hdslb.com/bfs/article/0a4041ac4d0edb5e06427046e5ba7083c1a0efa5.jpg@942w_542h_progressive.webp)

09. 设置 display_rate（渲染预览图的刷新频率，建议设置为 5，每过 5 个 steps 更新一次预览图），设置 n_batches（以这个主题渲染的图片张数，因为每次渲染的结果都是不同的，所以可以设置多张图片，一张渲染完成后会接着渲染下一张，已经渲染完成的会自动保存，可按需要设置）。 

![display_rate](https://i0.hdslb.com/bfs/article/a8e78d18154fa1cad7e1f9873f078df8dc9f7338.jpg@942w_542h_progressive.webp)


10. 点击「代码执行程序」选择「全部运行」。 

![RUN](https://i0.hdslb.com/bfs/article/3dcc6dc4bba5c7df5fa79fcf7b7708ea480e151b.jpg@942w_542h_progressive.webp)

11. 弹出「笔记本需要高 RAM」的窗口，点击「确定」。

12. 弹出「您还在设备面前吗？」的窗口，点击「进行人机身份验证」，按指令进行验证。

13. 弹出「允许此笔记本访问您的 Google 云端硬盘文件吗？」的窗口，点击「连接到 Google 云端硬盘」。

14. 弹出「登录 - Google 账号」窗口，选择你的谷歌账号，点击「允许」。

15. 回到 Disco Diffusion 的页面你会发现每段代码前面都有个中间有个三角形的圆，外面在转圈圈的就是在运行当前的代码，运行完成后前面会出现一个绿色的小勾，第一次运行需要等待几分钟，稍等片刻你会看到在「4. Diffuse!」的末尾会出现一张充满噪点的图，就表示开始渲染了，图片上方的 Batches 会显示你的渲染总进度，下方显示的是当前这张图的渲染进度，后面有预计的渲染时间，网页最下方会显示运行时间计时。 作者：x1ao4 https://www.bilibili.com/read/cv16525687 出处：bilibili

![config](https://i0.hdslb.com/bfs/article/a8dd5697145801919bf1b48e816cdcd8ef2655f1.jpg@942w_999h_progressive.webp)


16. 过几分钟可能还会出现一次「您还在设备面前吗？」的弹窗，点击「进行人机身份验证」，按指令进行验证，之后就可以慢慢渲了。（steps 设置为 250 实际上渲染只到 240，因为默认跳过了 10 个 steps，如果 display_rate 设置为了 5，那么图片下方的进度条每增加 5 个 steps 图片就会刷新一次，在这里右击是可以直接保存当前的图片的，当然按你的设置也会根据进度自动保存图片到你的谷歌云盘）

17. 之后你便可以在 Google Drive（https://drive.google.com）直接查看保存的图片了，在 AI - Disco_Diffusion - images_out 相应的文件夹里，若设置了 intermediate_saves 会多出一个 partials 的子文件夹，里面是过程图。所有的图片都是随着进程实时更新的，每完成一个进度就会自动保存一张，在这里可以把图片下载到本地。Colab Notebooks 这个文件夹里保存的是你的源文件。 

![D](https://i0.hdslb.com/bfs/article/9211e7b194d061f0bf38bf04be0a02fdea00808a.jpg@942w_542h_progressive.webp)

# 进阶教程

除了直接用文字描述的方式，Disco Diffusion 也可以在一张图片的基础上做渲染，你可以选择自己拍摄的照片、涂鸦的画作或是之前渲染的图片作为一个起点，再配合 Prompts 描述变成一个全新的作品。

基础的操作是一致的，我们只需要多一个步骤，就是在 Settings 里写入 init_image。首先我们需要把使用的图片上传到 content 中，这里有两种操作方式。

## 方式一

01. 点击左侧的第四个「文件」图标展开文件窗口。（如果是新建的文件可能会出现入门教程第 11、12 步的弹窗，确定加验证就可以了）

![PIC](https://i0.hdslb.com/bfs/article/6ce6dcc3255b3e6931efd4772357273a5b0878df.jpg@942w_542h_progressive.webp)

02. 点击文件窗口上方第一个「上传到会话存储空间」图标，选择你要上传的图片并点击「打开」，图片就会开始上传（你也可以把图片直接拖进文件窗口的空白处）。 

![02](https://i0.hdslb.com/bfs/article/2b91616ecfcdf50c859771dff23646e2e9c52c71.jpg@942w_542h_progressive.webp)

03. 上传完成后图片会显示在文件窗口的列表中，找到你要使用的图片并点击文件名后方的三个小圆点，选择「复制路径」。

![03](https://i0.hdslb.com/bfs/article/8db84a0edb185f0b1103ff81beb85400e963a0aa.jpg@942w_542h_progressive.webp)

## 方式二

01. 进入 Google Drive 登入你的账号，在云端硬盘左侧依次点击 AI - Disco_Diffusion - init_images 进入文件夹。

![方式二](https://i0.hdslb.com/bfs/article/a8e93f8ed722575280887d63847d04f70b0329e4.jpg@942w_542h_progressive.webp)

02. 把图片直接拖进文件窗口的空白处（你也可以在空白处右击选择上传文件）。

03. 打开或新建 DD 文件，按方式一打开左侧文件窗口，在列表中依次展开 drive - MyDrive - AI - Disco_Diffusion - init_images，找到你要使用的图片并点击文件名后方的三个小圆点，选择「复制路径」。 

![METHOD](https://i0.hdslb.com/bfs/article/e72ce6339723e82dfea37956a67004fc94904629.jpg@942w_542h_progressive.webp)

若在文件窗口找不到 drive 文件夹，请点击文件窗口第三个「装载 Google 云端硬盘」图标，并按提示操作，载入你的 Google 云端硬盘，若文件夹还未出现，请点击文件窗口第二个「刷新」图标。 


# 高阶教程

高阶玩法就是各种摆弄参数了，大家可以参考 Disco Diffusion 内的 Tutorial 部分，这里对部分参数做了一些解释，也可以研究一下 Zippy's Disco Diffusion Cheatsheet v0.3（https://docs.google.com/document/d/1l8s7uS2dGqjztYSjPpzlmXLjl5PM3IGkRWI3IiCuK7g/edit） 这个文档。 



# 参考视频

## 关键字

https://www.bilibili.com/video/BV1Qr4y1p7xX?spm_id_from=333.337.search-card.all.click

加入文中的关键字，画面里会出现特有的风格/标识物/配色：

如加菲猫，吉卜力，宝可梦等等。

截至目前120左右的modifiers。


## 艺术家

https://weirdwonderfulai.art/resources/disco-diffusion-modifiers/

加入文章里的关键字，画风会变成具体某位艺术家的强烈个人风格

截至目前2022年4月，共有400多位艺术家。

## 模型

https://weirdwonderfulai.art/resources/disco-diffusion-70-plus-artist-studies

使用不同艺术家和不同的模型，组合的效果参考

https://remidurant.com/artists/#

# 1. 人工智能艺术生成器 NightCafe Creator

「网站」 https://creator.nightcafe.studio/

NightCafe Creator 是一款人工智能艺术生成器应用程序，可以根据你给出文本提示生成多种风格的艺术作品。创作完成后版权归创作者所有，并可以随心所欲地使用它们。




# AI

NLP AI 等

AI 自动生成 文字、音乐、图画

https://app.wombo.art/  艺术创作

https://wudao.aminer.cn/CogView/  中文生成

https://hi.xingzheai.cn/#/ 音乐


# 


# 参考资料

https://blog.csdn.net/cxyITgc/article/details/124634758

https://blog.csdn.net/flyfor2013/article/details/124030361

https://www.bilibili.com/read/cv16525687

* any list
{:toc}