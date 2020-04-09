---
layout: post
title: java 处理声音框架-02-ffmpeg 使用入门教程
date:  2020-4-2 10:42:15 +0800
categories: [Java]
tags: [java, sound, mp3, video, sh]
published: true
---

# ffmpeg windows 安装

## 下载

[https://ffmpeg.zeranoe.com/builds/](https://ffmpeg.zeranoe.com/builds/) 点击下载 windows 安装包

就是一个静态的包，直接解压即可。

windows 路径：

```
C:\Users\binbin.hou\Downloads\ffmpeg-20200403-52523b6-win64-static\bin\ffmpeg.exe
```

# 格式转换

## 基本命令

```
ffmpeg -i out.ogv -vcodec h264 out.mp4
```

-i 后面是输入文件名。-vcodec 后面是编码格式，h264 最佳，但 Windows 系统默认不安装。

如果是要插入 ppt 的视频，选择 wmv1 或 wmv2 基本上万无一失。

## mp3 常见转换

- 转换mp3到wav：

```
ffmpeg -i DING.mp3 -f wav test.wav
```

- 转换wav到mp3：

```
ffmpeg -i test.wav -f mp3 -acodec libmp3lame -y wav2mp3.mp3
```

# 移除静音帧

# 代码处理

# 拓展阅读

[JAVE](http://www.sauronsoftware.it/projects/jave/index.php)

# 参考资料

[阮一峰-FFmpeg 视频处理入门教程](http://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)

[FFmpeg：视频转码、剪切、合并、播放速调整](https://blog.csdn.net/WuLex/article/details/101513018)

[Java使用ffmpeg进行音频格式转换](https://blog.csdn.net/scropio0zry/article/details/82389203)

[FFmpeg 示例音频转码为AAC](https://www.jianshu.com/p/e25d56a67c2e)

[使用ffmpeg 操作音频文件前后部分静音移除.](https://www.cnblogs.com/cainiaodage/p/10234724.html)

* any list
{:toc}