---
layout: post
title:  Python v3.12.3 学习-12-Virtual Environments and Packages
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 12.1. 引言

Python 应用程序通常会使用不包含在标准库中的包和模块。应用程序有时需要特定版本的库，因为应用程序可能需要修复特定的错误或应用程序可能使用了库的过时版本的接口。

这意味着一个 Python 安装可能无法满足每个应用程序的要求。如果应用程序 A 需要特定模块的 1.0 版本，但应用程序 B 需要 2.0 版本，那么这些要求就会发生冲突，安装版本 1.0 或 2.0 都会使一个应用程序无法运行。

解决这个问题的方法是创建一个虚拟环境，一个独立的目录树，其中包含特定版本的 Python 安装，以及一些额外的包。

不同的应用程序可以使用不同的虚拟环境。为了解决早期冲突要求的问题，应用程序 A 可以有自己的虚拟环境，其中安装了版本 1.0，而应用程序 B 则有另一个虚拟环境，其中有版本 2.0。如果应用程序 B 需要将库升级到版本 3.0，这将不会影响应用程序 A 的环境。

### 12.2. 创建虚拟环境

用于创建和管理虚拟环境的模块称为 `venv`。`venv` 通常会安装你系统上可用的最新版本的 Python。如果你的系统上有多个 Python 版本，你可以通过运行 `python3` 或你想要的任何版本来选择特定的 Python 版本。

要创建一个虚拟环境，请决定一个你想放置它的目录，并使用该目录路径运行 `venv` 模块作为脚本：

```bash
python -m venv tutorial-env
```

这将创建 `tutorial-env` 目录（如果它不存在），并在其中创建目录，包含 Python 解释器的副本以及各种支持文件。

一个常见的虚拟环境的目录位置是 `.venv`。这个名字让目录在你的 shell 中通常被隐藏，从而不妨碍你，同时给出一个解释该目录存在的名称。它还防止与某些工具支持的 `.env` 环境变量定义文件发生冲突。

创建虚拟环境后，你可以激活它。

在 Windows 上，运行：

```bash
tutorial-env\Scripts\activate
```

在 Unix 或 MacOS 上，运行：

```bash
source tutorial-env/bin/activate
```

（此脚本是为 bash shell 编写的。如果你使用的是 csh 或 fish shell，应使用替代的 `activate.csh` 和 `activate.fish` 脚本。）

激活虚拟环境后，你的 shell 提示符将更改以显示你正在使用的虚拟环境，并修改环境，以便运行 `python` 将获取你那个特定版本和安装的 Python。例如：

```bash
$ source ~/envs/tutorial-env/bin/activate
(tutorial-env) $ python
Python 3.5.1 (default, May  6 2016, 10:59:36)
  ...
>>> import sys
>>> sys.path
['', '/usr/local/lib/python35.zip', ...,
'~/envs/tutorial-env/lib/python3.5/site-packages']
>>>
```

要停用虚拟环境，请在终端中输入：

```bash
deactivate
```

### 12.3. 使用 pip 管理包

你可以使用一个名为 pip 的程序来安装、升级和删除包。默认情况下，pip 会从 Python Package Index 安装包。你可以通过在 Web 浏览器中访问它来浏览 Python Package Index。

pip 有许多子命令：“install”、“uninstall”、“freeze” 等等。（请参阅 Installing Python Modules 指南，获取 pip 的完整文档。）

你可以通过指定包的名称来安装最新版本的包：

```bash
(tutorial-env) $ python -m pip install novas
```

你也可以通过给出包名后跟 == 和版本号来安装特定版本的包：

```bash
(tutorial-env) $ python -m pip install requests==2.6.0
```

如果你重新运行此命令，pip 将注意到所请求的版本已经安装，然后什么也不做。你可以提供一个不同的版本号来获取该版本，或者你可以运行 `python -m pip install --upgrade` 来升级包到最新版本：

```bash
(tutorial-env) $ python -m pip install --upgrade requests
```

`python -m pip uninstall` 后跟一个或多个包名将从虚拟环境中删除这些包。

`python -m pip show` 将显示有关特定包的信息：

```bash
(tutorial-env) $ python -m pip show requests
```

`python -m pip list` 将显示在虚拟环境中安装的所有包：

```bash
(tutorial-env) $ python -m pip list
```

`python -m pip freeze` 将生成一个类似的已安装包列表，但输出使用 `python -m pip install` 期望的格式。一个常见的约定是将这个列表放在一个 `requirements.txt` 文件中：

```bash
(tutorial-env) $ python -m pip freeze > requirements.txt
(tutorial-env) $ cat requirements.txt
```

然后可以将 `requirements.txt` 提交到版本控制并作为应用程序的一部分进行发布。用户可以使用 `install -r` 安装所有必要的包：

```bash
(tutorial-env) $ python -m pip install -r requirements.txt
```

pip 还有许多其他选项。请参阅 Installing Python Modules 指南，获取 pip 的完整文档。

当你编写一个包并希望在 Python Package Index 上提供它时，请参阅 Python packaging 用户指南。

# 参考资料

https://docs.python.org/3.12/tutorial/venv.html

* any list
{:toc}

