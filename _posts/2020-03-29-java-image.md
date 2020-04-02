---
layout: post
title: java 处理图片框架-thumbnailator
date:  2020-4-2 10:42:15 +0800
categories: [Java]
tags: [java, iamge, img, sh]
published: true
---

# Thumbnailator 

Thumbnailator 是一个优秀的图片处理的Google开源Java类库。处理效果远比Java API的好。

从API提供现有的图像文件和图像对象的类中简化了处理过程，两三行代码就能够从现有图片生成处理后的图片，且允许微调图片的生成方式，同时保持了需要写入的最低限度的代码量。还支持对一个目录的所有图片进行批量处理操作。

支持的处理操作：图片缩放，区域裁剪，水印，旋转，保持比例。



# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.8</version>
</dependency>
```

## 指定大小缩放

```java
//size(宽度, 高度) 
 
/* 
 * 若图片横比200小，高比300小，不变 
 * 若图片横比200小，高比300大，高缩小到300，图片比例不变 
 * 若图片横比200大，高比300小，横缩小到200，图片比例不变 
 * 若图片横比200大，高比300大，图片按比例缩小，横为200或高为300 
 */ 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(200, 300) 
  .toFile("c:/a380_200x300.jpg"); 
 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(2560, 2048) 
  .toFile("c:/a380_2560x2048.jpg"); 
```

## 按照比例进行缩放

```java
//scale(比例) 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .scale(0.25f) 
  .toFile("c:/a380_25%.jpg"); 
 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .scale(1.10f) 
  .toFile("c:/a380_110%.jpg"); 
```

## 不按照比例，指定大小进行缩放

```java
//keepAspectRatio(false)默认是按照比例缩放的 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(200,200) 
  .keepAspectRatio(false) 
  .toFile("c:/a380_200x200.jpg"); 
```

## 旋转

```java
//rotate(角度),正数：顺时针负数：逆时针 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .rotate(90) 
  .toFile("c:/a380_rotate+90.jpg"); 
 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .rotate(-90) 
  .toFile("c:/a380_rotate-90.jpg"); 
```

## 水印

```java
//watermark(位置，水印图，透明度) 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .watermark(Positions.BOTTOM_RIGHT,ImageIO.read(newFile("images/watermark.png")),0.5f) 
  .outputQuality(0.8f) 
  .toFile("c:/a380_watermark_bottom_right.jpg"); 
 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .watermark(Positions.CENTER,ImageIO.read(newFile("images/watermark.png")),0.5f) 
  .outputQuality(0.8f) 
  .toFile("c:/a380_watermark_center.jpg"); 
```

ps: 可以把图片放在 QRCODE 的中心。

## 裁剪

```java
//sourceRegion() 
 
//图片中心400*400的区域 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .sourceRegion(Positions.CENTER,400,400) 
  .size(200,200) 
  .keepAspectRatio(false) 
  .toFile("c:/a380_region_center.jpg"); 
 
//图片右下400*400的区域 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .sourceRegion(Positions.BOTTOM_RIGHT,400,400) 
  .size(200,200) 
  .keepAspectRatio(false) 
  .toFile("c:/a380_region_bootom_right.jpg"); 
 
//指定坐标 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .sourceRegion(600,500,400,400) 
  .size(200,200) 
  .keepAspectRatio(false) 
  .toFile("c:/a380_region_coord.jpg"); 
```

## 格式转换

```java
//outputFormat(图像格式) 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .outputFormat("png") 
  .toFile("c:/a380_1280x1024.png"); 
 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .outputFormat("gif") 
  .toFile("c:/a380_1280x1024.gif"); 
```

## 输出到 OutputStreamos

```java
OutputStream os=newFileOutputStream("c:/a380_1280x1024_OutputStream.png"); 
Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .toOutputStream(os); 
```

## 输出到 BufferedImage

```java
//asBufferedImage()返回BufferedImage 
BufferedImagethumbnail=Thumbnails.of("images/a380_1280x1024.jpg") 
  .size(1280,1024) 
  .asBufferedImage(); 
ImageIO.write(thumbnail,"jpg",newFile("c:/a380_1280x1024_BufferedImage.jpg")); 
```

# 其他问题

有时候可能会报错 heap 不足。

可以指定 jvm 启动参数大一些：

```
-Xms1G
```

# 个人思考

所有的工具都应该尽可能的如此简化。

图片的处理还有很多，比如如何将文字与图片结合（表情包，配图，分享图等）

普天的色彩处理等。

需要学习一些 2D 的基本知识。

# 参考资料

[使用说明](https://www.jb51.net/article/113461.htm)

* any list
{:toc}