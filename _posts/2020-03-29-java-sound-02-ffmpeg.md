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

```
ffmpeg -i test.mp3 -f wav test.wav
```

- 转换wav到mp3：

```
ffmpeg -i test.wav -f mp3 -acodec libmp3lame -y wav2mp3.mp3
```

# 移除静音帧

## 命令模板

```
ffmpeg -i āo.mp3 -af silenceremove=start_periods=1:start_threshold=-0dB:stop_periods=0:stop_threshold=-10dB:start_silence=0.2:stop_silence=1 -y āo2.mp3
```

## 删除 50 分贝以下的读音

```
<<<<<<< HEAD
ffmpeg -i a.mp3 -af silenceremove=1:0:-50dB a_50.mp3
=======
ffmpeg -i āo.mp3 -af silenceremove=1:0:-50dB output.mp3
>>>>>>> a7f5620b7ce8e5246c17597b275931e5d79ab879
```

这消除了沉默

在开头(由第一个参数1表示)

最小长度为零(由第二个参数0表示)

静音被归类为-50分贝以下的任何值(以-50dB表示).

官方文档：[ffmpeg-filters](https://ffmpeg.org/ffmpeg-filters.html)

## 实际例子

```
ffmpeg -i bài.mp3 -af silenceremove=start_periods=1:start_threshold=-30dB:stop_periods=0:stop_threshold=-50dB:start_silence=0.2:stop_silence=1 -y a_2.mp3
```

# 静音消除文档

消除音频开头，中间或结尾的静音。

## 参数

过滤器接受以下选项：

- start_periods

此值用于指示是否应在音频开始时修剪音频。零值表示不应从一开始就修剪静默。指定非零值时，它将修剪音频，直到发现非静音为止。

**通常，从音频开始修剪静音时，start_periods将为1，但可以将其增大为更高的值，以将所有音频修剪到特定的非静音周期数。**

预设值为0。

- start_duration

指定在停止修剪音频之前必须检测到的无声时间。通过增加持续时间，可以将突发的噪声视为静默并消除。预设值为0。

start_threshold

这表明应将哪些采样值视为静音。对于数字音频，值为0可能很好，但对于从模拟录制的音频，您可能希望增加该值以解决背景噪音。

可以以dB（如果在指定值后面附加“ dB”）或幅度比来指定。预设值为0。

- start_silence

指定开始时的最大静音持续时间，微调后将保留该最长持续时间。默认值为0，等于修剪所有检测为静音的样本。

start_mode

指定多声道音频开始时静音结束的检测模式。可以是任何或全部。默认为任何。对于任何样本，任何被检测为非静音的样本都将导致静音调整停止。总而言之，只有将所有通道检测为非静音时，才会导致静音调整停止。

stop_periods

设置从音频结尾处修剪静音的计数。要从文件中间消除静默，请指定一个stop_periods为负数。然后将此值视为正值，并用于指示效果应按start_periods指定的那样重新开始处理，使其适合于消除音频中间的静默时段。预设值为0。

stop_duration

指定不再复制音频之前必须存在的静音持续时间。通过指定较长的持续时间，可以在音频中保留所需的静音。预设值为0。

stop_threshold

这与start_threshold相同，但用于从音频结尾处修剪静音。可以以dB（如果在指定值后面附加“ dB”）或幅度比来指定。预设值为0。

stop_silence

指定结束后将保持的最大静音持续时间。默认值为0，等于修剪所有检测为静音的样本。

stop_mode

指定在多声道音频结束时开始静音检测的模式。可以是任何或全部。默认为任何。对于任何样本，任何被检测为非静音的样本都将导致静音调整停止。总而言之，只有将所有通道检测为非静音时，才会导致静音调整停止。

detection

设置如何检测静音。可以是均方根或峰值。第二个更快，并且在数字静音（正好为0）的情况下效果更好。默认值为rms。

window

设置持续时间（以秒为单位），以秒为单位来计算窗口大小（以样本数量为单位）以检测静音。默认值为0.02。允许范围是0到10。

## 例子

以下示例说明了如何使用此过滤器来开始录制，该录制不包含通常在按下“录制”按钮和演奏开始之间的启动延迟。

```
silenceremove=start_periods=1:start_duration=5:start_threshold=0.02
```

从头到尾修剪音频中超过1秒的所有静音

```
silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-90dB
```

从头到尾使用峰值检测修剪所有数字静音样本，直到音频中的数字静音样本超过0个，并且在流中相同位置的所有通道中检测到数字静音

```
silenceremove=window=0:detection=peak:stop_mode=all:start_mode=all:stop_periods=-1:stop_threshold=0
```

## 实战案例

- 结尾处的小于 30db 的声音

```
ffmpeg -i āo.mp3 -af silenceremove=stop_periods=-1:stop_duration=0.01:stop_threshold=-30dB ao_19.mp3
```

ps: 真实有效。

```
ffmpeg -i abandons.mp3 -af silenceremove=stop_periods=-1:stop_duration=0.01:stop_threshold=-40dB abandons_last3.mp3
```

声音的处理：

有时候一个声音很轻，可能也是有用的。比如：nice 的尾音。

```
ffmpeg -i nice.mp3 -af silenceremove=stop_periods=-1:stop_duration=0.01:stop_threshold=-44dB nice_44.mp3
```

- 同时指定开头

从音频开始修剪静音时，start_periods将为1，但可以将其增大为更高的值，以将所有音频修剪到特定的非静音周期数。

```
ffmpeg -i a.mp3 -af silenceremove=start_periods=1:start_duration=0.05:start_threshold=0.02 a2.mp3
```

这里移除的是开始的播放延迟。

- 移除开头的信息


```
ffmpeg -i a.mp3 -af silenceremove=start_periods=1:start_duration=0.1:start_threshold=-20dB a4.mp3
```

# 音呗大小

```
1分贝 刚能听到的声音
15 分贝以下	感觉安静
30 分贝	耳语的音量大小
40 分贝	冰箱的嗡嗡声
60分贝	正常交谈的声音
70分贝	相当于走在闹市区
85分贝	汽车穿梭的马路上
95分贝	摩托车启动声音
100分贝	装修电钻的声音
110分贝	
卡拉OK、大声播放MP3 的声音
120分贝	
飞机起飞时的声音
150分贝	
燃放烟花爆竹的声音
```


# 截取

这时候就需要一些处理音效的软体，例如之前提过的Audacity。其实还有更简便的方法，只要系统中有安装好的ffmpeg，一行指令就OK了，相当简单。让我们分成两步骤来完成他吧！

第一步先用播放软体将想要处理的音乐档桉听一次，把想独立出来部份的时间记下来，看是几分几秒到几分几秒。

记好后，第一步也就完成了

第二步就是下指令了。

```
ffmpeg -i input.mp3 -ss hh:mm:ss -t hh:mm:ss -acodec copy output.mp3
```

参数说明：

-ss : 指定从那裡开始

-t : 指定到那裡结束

-acodec copy : 编码格式和来源档桉相同（就是mp3）

这方法不只是MP3可以用，其他的许多格式也都适用，只是输出档桉的副档名就要跟着改一改了。

以下举个例子，如果我想把aa.mp3中的1分12秒到1分42秒的地方切出来，然后存成bb.mp3，指令如下

```
ffmpeg -i āo.mp3 -ss 00:00:00.130 -t 00:00:00.450 ao_sub.mp3
```

时间格式如下：

```
"hh:mm:ss[:;.]ff"
```

后面跟的是毫秒。

# 代码处理

# 拓展阅读

[JAVE](http://www.sauronsoftware.it/projects/jave/index.php)

# 参考资料

[阮一峰-FFmpeg 视频处理入门教程](http://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)

[FFmpeg：视频转码、剪切、合并、播放速调整](https://blog.csdn.net/WuLex/article/details/101513018)

[Java使用ffmpeg进行音频格式转换](https://blog.csdn.net/scropio0zry/article/details/82389203)

[FFmpeg 示例音频转码为AAC](https://www.jianshu.com/p/e25d56a67c2e)

[使用ffmpeg 操作音频文件前后部分静音移除.](https://www.cnblogs.com/cainiaodage/p/10234724.html)

[java – 使用FFMPEG和silencedetect删除音频静音](http://www.voidcn.com/article/p-hfvlfpco-btm.html)

* any list
{:toc}