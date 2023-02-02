---
layout: post 
title: AI DELL-2 绘画入门体验
date: 2022-12-06 21:01:55 +0800
categories: [AI] 
tags: [ai, tool, sh]
published: true
---

# 图像生成测试版

了解如何使用我们的 DALL·E 模型生成或处理图像

## 介绍

图片 API 提供了三种与图片交互的方法：

- 根据文本提示从头开始创建图像

- 根据新文本提示创建现有图像的编辑

- 创建现有图像的变体

本指南涵盖了使用这三个 API 端点的基础知识以及有用的代码示例。 

要查看它们的实际效果，请查看我们的 DALL·E 预览应用程序。

图片 API 处于测试阶段。 

在此期间，API 和模型将根据您的反馈进行改进。 

为确保所有用户都能轻松制作原型，默认速率限制为每分钟 20 张图像，每 5 分钟 50 张。 

如果您想提高速率限制，请查看这篇帮助中心文章。 

随着我们对使用和容量要求的更多了解，我们将提高默认速率限制。

# 用法

## Generations

图像生成端点允许您在给定文本提示的情况下创建原始图像。 

生成的图像的大小可以为 256x256、512x512 或 1024x1024 像素。 

较小的尺寸生成速度更快。 

您可以使用 n 参数一次请求 1-10 张图像。

```py
response = openai.Image.create(
  prompt="a white siamese cat",
  n=1,
  size="1024x1024"
)
image_url = response['data'][0]['url']
```

描述越详细，您就越有可能获得您或您的最终用户想要的结果。 

您可以探索 DALL·E 预览应用程序中的示例以获得更多提示灵感。 

## 编辑

图像编辑端点允许您通过上传蒙版来编辑和扩展图像。 

遮罩的透明区域指示应编辑图像的位置，提示应描述完整的新图像，而不仅仅是擦除区域。 

此端点可以启用类似我们 DALL·E 预览应用程序中的编辑器的体验。

```py
response = openai.Image.create_edit(
  image=open("sunlit_lounge.png", "rb"),
  mask=open("mask.png", "rb"),
  prompt="A sunlit indoor lounge area with a pool containing a flamingo",
  n=1,
  size="1024x1024"
)
image_url = response['data'][0]['url']
```

上传的图片和遮罩必须是小于 4MB 的正方形 PNG 图片，并且必须具有相同的尺寸。 

生成输出时不使用遮罩的非透明区域，因此它们不一定需要像上面的示例那样与原始图像匹配。

## 变化

图像变体端点允许您生成给定图像的变体。

```py
response = openai.Image.create_variation(
  image=open("corgi_and_cat_paw.png", "rb"),
  n=1,
  size="1024x1024"
)
image_url = response['data'][0]['url']
```







# 参考资料

https://beta.openai.com/docs/guides/images

* any list
{:toc}