---
layout: post 
title: IoT arduino 入门介绍？
date: 2022-12-12 21:01:55 +0800
categories: [IoT] 
tags: [IoT, sh]
published: true
---

# Arduino 

[Arduino](https://www.arduino.cc/) 是一个开源嵌入式硬件平台，用来供用户制作可交互式的嵌入式项目。

此外 Arduino 作为一个开源硬件和开源软件的公司，同时兼有项目和用户社区。该公司负责设计和制造Arduino电路板及相关附件。

这些产品按照GNU宽通用公共许可证（LGPL）或GNU通用公共许可证（GPL）许可的开源硬件和软件分发的，Arduino 允许任何人制造 Arduino 板和软件分发。 

Arduino 板可以以预装的形式商业销售，也可以作为DIY包购买。

Arduino 项目始于2005年，作为意大利伊夫雷亚地区伊夫雷亚交互设计研究所的学生项目，目的是为新手和专业人员提供一种低成本且简单的方法，以创建使用传感器与环境相互作用的设备执行器。适用于初学者爱好者的此类设备的常见示例包括传感器、简单机器人、恒温器和运动检测器。

Arduino 这个名字来自意大利伊夫雷亚的一家酒吧，该项目的一些创始人过去常常会去这家酒吧。

酒吧以伊夫雷亚的 Arduin（Arduin of Ivrea）命名，他是伊夫雷亚边疆伯爵，也是1002年至1014年期间的意大利国王。

## 特色

- 基于知识共享开源的电路图设计。

- 免费下载，也可依需求自己修改，但需遵照姓名标示。您必须按照作者或授权人所指定的方式，表彰其姓名。

- 依相同方式分享，若您改变或转变著作，当散布该派生著作时，您需采用与本著作相同或类似的授权条款。

- Arduino 可使用 ICSP 在线烧入器，将 Bootloader 烧入新的IC芯片。

- 可依据 Arduino 官方网站，获取硬件的设计档，加以调整电路板及组件，以符合自己实际设计的需求。

- 可简单地与传感器，各式各样的电子组件连接，如红外线、超音波、热敏电阻、光敏电阻、伺服马达等。

- 支持多样的交互程序，如Adobe Flash, Max/MSP, VVVV, Pure Data, C, Processing等。

- 使用低价格的微处理控制器（Atmel AVR）（ATMEGA 8,168,328等）。

- USB 接口，不需外接电源。另外有提供直流（DC）电源输入。

# 硬件

## 官方硬件

原始的 Arduino 硬件是从一间意大利公司 Smart Projects 制造有些 Arduino 硬件则是被官方授权由美国公司 SparkFun Electronics 和 Adafruit Industries 设计。

## Shields

“Shields”扩展版能够插入 Arduino 和 Arduino 兼容硬件，用途是增加 Arduino 硬件本身没有的功能，如马达控制、GPS、有线网络、液晶显示器或者是面包板。

用户也可以自己动手做 Shields 扩展版。

# 软件

在 Arduino 上执行的程序可以使用任何能够被编译成 Arduino 机器代码的编程语言编写，Arduino 官方推荐使用集成了 arduino 库的 C++ 进行编程。

多数 Arduino 电路板上 MCU 的制造商 Atmel 公司也提供了数个可以开发 Atmel 微处理机程序的集成开发环境，AVR Studio和更新的 Atmel Studio。

目前微软在其 Visual Studio 也有提供 Arduino 的 SDK，在编译执行上更方便。

## IDE

Arduino 计划也提供了 Arduino Software IDE，一套以 Java 编写的跨平台应用软件。

Arduino Software IDE 源自于 Processing编程语言以及 Wiring 计划的集成开发环境。它是被设计于介绍程序编写给艺术家和不熟悉程序设计的人们，且包含了一个拥有语法高亮、括号匹配、自动缩进和一键编译并将可执行文件烧写入 Arduino 硬件中的编辑器。

Arduino Software IDE 使用与C语言和C++相仿的编程语言，并且提供了包含常见的输入/输出函数的 Wiring 软件库。

在使用GNU toolchain编译和链接后，Arduino Software IDE提供了一个程序“avrdude”用来转换可执行档成为能够烧写入 Arduino 硬件的固件。

## sketch

使用Arduino Software IDE编写的程序被称为“sketch”。

一个典型的 Arduino C/C++ sketch 程序会包含两个函数，它们会在编译后合成为 main() 函数：

setup()：在程序执行开始时会执行一次，用于初始化设置。

loop()：直到Arduino硬件关闭前会重复执行函数放的代码。

# 参考资料

https://zh.wikipedia.org/zh-cn/Arduino

* any list
{:toc}