---
layout: post
title: java 处理声音框架-Sonic
date:  2020-4-2 10:42:15 +0800
categories: [Java]
tags: [java, sound, mp3, video, sh]
published: true
---

# Sonic 

[Sonic](https://github.com/waywardgeek/sonic/blob/master/Sonic.java) is a simple library to speed up or slow down speech.

可以用来给语音加速减速。

# 报错

## 错误

```
javax.sound.sampled.UnsupportedAudioFileException: could not get audio input stream from input file
```

## 原因

无法获取到除了 wav 之外的其他音频，感觉这个非常的不友好。

## 解决方案

首先进行音频的格式转换-wav。

# 开源工具

[audacity-开源跨平台](https://www.audacityteam.org/)

# 开源框架

[github-mp3](https://github.com/search?l=Java&p=1&q=mp3&type=Repositories)

[A java library for reading mp3 files and reading / manipulating the ID3 tags (ID3v1 and ID3v2.2 through ID3v2.4)](https://github.com/mpatric/mp3agic)

[github-音频格式转换](https://github.com/adrielcafe/AndroidAudioConverter)

[A Java-based (Audio Stream Input/Output) ASIO host.](https://github.com/mhroth/jasiohost)

[javalayer-mp3](http://www.javazoom.net/javalayer/javalayer.html)

[mp3spi](http://www.javazoom.net/mp3spi/mp3spi.html)

[JAVE](http://www.sauronsoftware.it/projects/jave/index.php)

[sox-音频处理的瑞士军刀](http://sox.sourceforge.net/)

[音速变换](https://github.com/search?q=%E9%9F%B3%E5%8F%98%E9%80%9F)

# 参考资料

[oracle-sound api](https://docs.oracle.com/javase/tutorial/sound/TOC.html?spm=a2c4e.10696291.0.0.5d1519a4D0Rz2B)

[java使用Sonic 算法对音频变速不变声、变调、调整音量](https://www.cnblogs.com/passedbylove/p/11792253.html)

[使用Java sound播放音频文件出现“文件类型不支持”报错的原因分析](https://blog.csdn.net/qq_25827845/article/details/79026786)

[Java 音频处理技术简介](https://www.jianshu.com/p/3d27058dc377)

[java 声音处理-播放暂停等](https://www.cnblogs.com/zhangdashuai/p/3456375.html)

[推荐一款基于Java的音视频处理开源项目--JAVE](https://blog.csdn.net/softwave/article/details/5819699)

[JAVA音视频解决方案----音视频基础知识](https://blog.csdn.net/cuiyaonan2000/article/details/93179719)

[18个实时音视频开发中会用到开源项目](https://blog.csdn.net/weixin_34261739/article/details/88917741)

## 格式转换

[Java使用ffmpeg进行音频格式转换](https://blog.csdn.net/scropio0zry/article/details/82389203)

[（JAVA）将（acc/m4a）音频转换成Mp3格式](https://my.oschina.net/simpleton/blog/1581907)

[使用jave2将音频wav转换成mp3格式](https://www.cnblogs.com/fanblogs/p/11001731.html)

[java wav文件转换为mp3](https://blog.csdn.net/qq_33129625/article/details/78550691)

## 速度调整

[音频变速、变调Java示例](https://github.com/apomelo/voice-velocity-demo)

[JavaAPI方式语音识别mp3转换为pcm](https://ai.baidu.com/forum/topic/show/496972)

[javaMP3转pcm 百度语音识别](https://segmentfault.com/a/1190000013383967)

* any list
{:toc}