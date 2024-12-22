---
layout: post
title: NLP 中文拼写检测开源-04-hunspell 拼写纠正算法入门介绍
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

## 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 个人感受

大家好，我是老马。

下面学习整理一些其他优秀小伙伴的设计和开源实现。

# spellcheck

[朴素，但通用的 Spell Check 拼写检查和修复工具，基于 hunspell 实现，适合用于 Objective-C 项目本地和 CI 检查常见的拼写错误](https://github.com/jiyee/spellcheck)

# hunspell

# 关于 Hunspell

Hunspell 是一个免费的拼写检查器和形态分析库及命令行工具，采用 LGPL/GPL/MPL 三重许可协议。

Hunspell 被 LibreOffice 办公套件、自由浏览器（如 Mozilla Firefox 和 Google Chrome）以及其他工具和操作系统（如 Linux 发行版和 macOS）使用。它也是 Linux、类 Unix 系统和其他操作系统的命令行工具。

Hunspell 的设计旨在为具有单词级书写系统的语言（包括具有丰富形态学、复杂单词复合和字符编码的语言）提供快速高效的拼写检查和纠正。

Hunspell 接口：采用 Curses 库的 Ispell 类似终端接口、Ispell 管道接口、C++/C API 和共享库，还支持其他编程语言的现有语言绑定。

Hunspell 的代码库源自 OpenOffice.org 的 MySpell 库，由 Kevin Hendricks 开发（最初是 Geoff Kuenning 的国际 Ispell 的 C++ 重实现，后来扩展了如 n-gram 建议等功能）。

详细信息请参见 [MySpell 3 的下载链接](http://lingucomponent.openoffice.org/MySpell-3.zip) 以及其 README、CONTRIBUTORS 和 license.readme（在这里：license.myspell）文件。

Hunspell 库的主要功能，由 László Németh 开发：

- 支持 Unicode
- 高度可定制的建议：单词部分替换表、词干级的语音学及其他替代转录，以识别并修复所有典型的拼写错误，不建议使用攻击性词汇等
- 复杂形态学：词典和词缀同义词；双重词缀剥离以处理屈折和派生语素组，适用于像阿塞拜疆语、巴斯克语、爱沙尼亚语、芬兰语、匈牙利语、土耳其语等粘着语；64,000 个词缀类，支持任意数量的词缀；条件词缀、复合词缀、歧义语素、零语素、虚拟词典词干、禁止生成词汇等
- 处理复杂复合词（例如芬兰-乌戈尔语、德语和印欧-印度语系语言）：识别由任意数量的单词构成的复合词，处理复合词中的词缀等
- 自定义词典及其词缀
- 词干提取
- 形态学分析（按自定义项目和排列方式）
- 形态学生成
- SPELLML XML API，简化拼写检查、词干提取、形态学生成和自定义带词缀字典的集成
- 语言特定算法，例如阿塞拜疆语或土耳其语中带点的 i 以及德语的锐音符 s 特殊处理，以及匈牙利语的特殊复合规则

Hunspell 命令行工具的主要功能，由 László Németh 开发：

- Geoff Kuenning 的 Ispell 快速交互界面的重实现
- 支持的格式：文本、OpenDocument、TeX/LaTeX、HTML/SGML/XML、nroff/troff
- 可选的自定义词典，指定一个模型词作为词缀
- 多词典使用（例如 `hunspell -d en_US,de_DE,de_medical`）
- 各种过滤选项（好词/坏词或行）
- 形态学分析（选项 -m）
- 词干提取（选项 -s）

完整的手册请参见 `man hunspell`、`man 3 hunspell`、`man 5 hunspell`。

翻译：Hunspell 已经被翻译成多种语言。如果你的语言缺失或不完整，请使用 [Weblate](https://hosted.weblate.org/engage/hunspell/) 来帮助翻译 Hunspell。

<a href="https://hosted.weblate.org/engage/hunspell/">
<img src="https://hosted.weblate.org/widgets/hunspell/-/translations/horizontal-auto.svg" alt="翻译状态" />
</a>

# 依赖项

构建时的依赖项：

- g++ make autoconf automake autopoint libtool

运行时依赖项：

|               | 必选          | 可选            |
|---------------|------------------|------------------|
| libhunspell   |                  |                  |
| hunspell 工具 | libiconv gettext | ncurses readline |

# 在 GNU/Linux 和 Unix 上编译

首先，我们需要下载依赖项。在 Linux 上，`gettext` 和 `libiconv` 是标准库的一部分。在其他 Unix 系统上，我们需要手动安装它们。

对于 Ubuntu：

```
sudo apt install autoconf automake autopoint libtool
```

然后运行以下命令：

```
autoreconf -vfi
./configure
make
sudo make install
sudo ldconfig
```

对于字典开发，使用 `--with-warnings` 选项。

对于 Hunspell 可执行文件的交互式用户界面，使用 `--with-ui` 选项。

可选的开发者包：

- ncurses（需要 `--with-ui`），例如 libncursesw5 用于 UTF-8
- readline（用于高级输入行编辑，配置参数：`--with-readline`）

在 Ubuntu 上，包为：

```
libncurses5-dev libreadline-dev
```

# 在 OSX 和 macOS 上编译

在 macOS 上，始终使用 `clang` 编译器，而不是 `g++`，因为 Homebrew 的依赖项是用 `clang` 构建的。

```
brew install autoconf automake libtool gettext
brew link gettext --force
```

然后运行：

```
autoreconf -vfi
./configure
make
```

# 在 Windows 上编译

## 使用 Mingw64 和 MSYS2 编译

下载并安装 Msys2，更新所有内容并安装以下包：

```
pacman -S base-devel mingw-w64-x86_64-toolchain mingw-w64-x86_64-libtool
```

打开 Mingw-w64 Win64 提示符并按照 Linux 上的步骤编译。

## 在 Cygwin 环境中编译

下载并安装 Cygwin 环境，安装以下额外的包：

- make
- automake
- autoconf
- libtool
- gcc-g++ 开发包
- ncurses，readline（用于用户界面）
- iconv（字符转换）

然后按照 Linux 上的步骤编译。Cygwin 构建依赖于 Cygwin1.dll。

# 调试

建议安装标准库的调试版本：

```
libstdc++6-6-dbg
```

对于调试，我们需要创建一个调试版本，然后启动 `gdb`。

```
./configure CXXFLAGS='-g -O0 -Wall -Wextra'
make
./libtool --mode=execute gdb src/tools/hunspell
```

你也可以直接将 `CXXFLAGS` 传递给 `make`，但我们不推荐在长时间开发过程中使用这种方式。

如果你喜欢在 IDE 中开发和调试，请参见 [IDE 设置文档](https://github.com/hunspell/hunspell/wiki/IDE-Setup)。

# 测试

测试 Hunspell（见 `tests/` 子目录中的测试）：

```
make check
```

或者使用 Valgrind 调试器：

```
make check
VALGRIND=[Valgrind_tool] make check
```

例如：

```
make check
VALGRIND=memcheck make check
```

# 文档

功能和字典格式：

```
man 5 hunspell
man hunspell
hunspell -h
```

[Hunspell 官网](http://hunspell.github.io/)

# 用法

编译并安装后（见 INSTALL），你可以使用 Hunspell 拼写检查器（带用户界面）和 Hunspell 或 Myspell 字典：

```
hunspell -d en_US text.txt
```

或不带界面：

```
hunspell
hunspell -d en_GB -l <text.txt
```

字典由词缀（.aff）和字典（.dic）文件组成，例如，下载 LibreOffice 的美国英语字典文件（旧版本，但有词干提取和形态学生成）：

```
wget -O en_US.aff  https://cgit.freedesktop.org/libreoffice/dictionaries/plain/en/en_US.aff?id=a4473e06b56bfe35187e302754f6baaa8d75e54f
wget -O en_US.dic https://cgit.freedesktop.org/libreoffice/dictionaries/plain/en/en_US.dic?id=a4473e06b56bfe35187e302754f6baaa8d75e54f
```

通过命令行输入和输出，可以快速检查其工作情况，例如输入单词 "example"、"examples"、"teached" 和 "verybaaaaaaaaaaaaaaaaaaaaaad"：

```
$ hunspell -d en_US
Hunspell 1.7.0
example


examples
teached
verybaaaaaaaaaaaaaaaaaaaaaad
```

输出为：

```
$ hunspell -d en_US
example  1: example
examples  1: examples
teached  2: taught, teacher
verybaaaaaaaaaaaaaaaaaaaaaad  1: verybaaaaaaaaaaaaaaaaaaaaaad
```




# 参考资料

https://github.com/jiyee/spellcheck

* any list
{:toc}