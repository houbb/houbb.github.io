---
layout: post
title:  Python-02-Python Windows 环境 linux 如何安装 python 3.x？
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---

# 版本验证

```sh
python --version
```

如下：

```
$ python --version
Command 'python' not found, did you mean:
  command 'python3' from deb python3
  command 'python' from deb python-is-python3
```

# 安装

通过命令：

```sh
sudo apt-get install python3
```

如下：

```
$ python3 --version
Python 3.10.12
```

# 升级

如何升级到目前最新的 v3.12.3 呢？

```sh
sudo apt update
sudo apt install python3.12
```


# 移除

```sh
sudo apt-get remove python3
```

# 入门例子

## py 脚本编写

`vi hello.py`

内容：

```py
# hello.py
print("Hello, World!")
```

## 运行

```sh
$ python3 hello.py
Hello, World!
```

# chat

## 安装方式

在 Linux 系统中安装 Python 3.12.3 版本通常涉及以下步骤：

1. **下载 Python 3.12.3 源码包**：
   你可以从 Python 官方网站下载源码包。使用 `wget` 命令可以方便地下载：

   ```bash
   wget https://www.python.org/ftp/python/3.12.3/Python-3.12.3.tgz
   ```

2. **解压下载的源码包**：
   使用 `tar` 命令解压下载的源码包：

   ```bash
   tar -xzf Python-3.12.3.tgz
   ```

3. **安装编译依赖**：
   编译 Python 可能需要一些依赖库。在基于 Red Hat 的系统（如 CentOS）上，可以使用 `yum` 安装这些依赖：

   ```bash
   yum -y install gcc openssl-devel bzip2-devel libffi-devel zlib-devel ncurses-devel readline-devel sqlite-devel
   ```

   对于基于 Debian 的系统（如 Ubuntu），可以使用 `apt-get`：

   ```bash
   sudo apt-get install build-essential zlib1g-dev libffi-dev libssl-dev
   ```

4. **编译并安装 Python**：
   进入解压后的目录，然后配置、编译并安装 Python：

   ```bash
   cd Python-3.12.3
   ./configure --enable-optimizations
   make altinstall
   ```

   使用 `altinstall` 是为了避免覆盖系统默认的 Python 版本。

5. **验证安装**：
   安装完成后，可以通过检查 Python 版本来验证是否安装成功：

   ```bash
   python3.12 --version
   ```

6. **创建软链接**（可选）：
   如果你希望 `python3` 命令指向新安装的 Python 3.12.3，可以创建一个软链接：

   ```bash
   ln -s /usr/local/bin/python3.12 /usr/bin/python3
   ```

   请注意，这可能需要管理员权限，取决于你的系统配置。

7. **安装 pip**（可选）：
   通常，Python 3.12.3 会自带 pip，但如果没有，你可以单独安装它：

   ```bash
   curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
   python3.12 get-pip.py
   ```

8. **更新环境变量**（如果需要）：
   如果你创建了软链接或安装了 pip，可能需要更新你的 `PATH` 环境变量。

以上步骤基于搜索结果，但请根据你的 Linux 发行版和具体情况进行适当调整。在执行这些步骤时，请确保你有足够的权限（可能需要使用 `sudo`），并注意不要影响到系统中依赖特定 Python 版本的其他应用程序。

# 参考资料

[BeginnersGuide](https://wiki.python.org/moin/BeginnersGuide)

http://www.runoob.com/python/python-basic-syntax.html

* any list
{:toc}

