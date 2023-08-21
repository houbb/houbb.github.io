---
layout: post
title:  Oracle 系统学习-06-oracle windows install windows 安装 oracle
date:  2018-06-20 10:46:06 +0800
categories: [Oracle]
tags: [oracle, windows, install]
published: true
---

# windows 下如何安装 oracle

要在Windows上安装Oracle数据库，您可以按照以下步骤进行操作：

1. 下载Oracle数据库软件：
   访问Oracle官方网站（https://www.oracle.com/database/technologies/）并下载适用于Windows平台的Oracle数据库软件。选择与您的操作系统版本和位数相匹配的软件。

2. 运行安装程序：
   打开下载的安装程序，并运行它。根据提示选择安装类型，通常选择“Custom”（自定义）以便可以选择安装位置和组件。

3. 设置安装选项：
   在安装向导中，您需要提供一些配置信息，包括安装路径、数据库类型和密码等。请按照向导的指示进行操作。确保记住您设置的数据库密码，因为它将在以后访问数据库时使用。

4. 进行安装：
   点击“Install”（安装）按钮开始安装过程。这可能需要一段时间，具体取决于您的系统性能和所选的组件。

5. 完成安装：
   安装完成后，您将看到安装向导的“Finish”（完成）页面。选中“Create Database”（创建数据库）复选框，然后点击“Finish”（完成）按钮。

6. 配置数据库：
   在“Database Configuration Assistant”（数据库配置助手）中，选择“Create a Database”（创建数据库）选项，并按照向导的指示提供数据库的名称、管理密码和其他配置信息。

7. 启动数据库：
   在安装完成后，您可以在开始菜单中找到Oracle文件夹，并启动“Oracle Database”应用程序。这将启动Oracle数据库实例。

这些步骤仅适用于Oracle数据库的基本安装。如果您需要更详细的配置或特定的设置，建议参考Oracle的官方文档或寻求专业支持。

# windows10 实战笔记

## 下载

[https://download.oracle.com/otn/nt/oracle19c/193000/WINDOWS.X64_193000_db_home.zip](https://download.oracle.com/otn/nt/oracle19c/193000/WINDOWS.X64_193000_db_home.zip)

注意：文件略大，可以放在D盘，注意路径中不能有空格或者中文字符之类的。

or: https://www.oracle.com/rs/database/technologies/oracle19c-windows-downloads.html


## install

关闭所有的杀毒类软件，电脑管家

解压之前的安装包，以管理员身份运行目录下 `D:\tool\oracle\WINDOWS.X64_193000_db_home` 的 setup.exe

1） 选择：创建并配置单实例数据库，然后“下一步”：

![创建并配置单实例数据库](https://img-blog.csdnimg.cn/2c87c2f5c3cd4623a2263dd256ed02e6.png)

2) 选择：桌面类，然后“下一步”：

![桌面类](https://img-blog.csdnimg.cn/daadbfd954e54b34b206538c4a296de8.png)

3) 选择：创建新Windows用户，用户名英文，同时注意口令设置（统一为 Sa23456），尽量包含大小写字母和数字（选择使用Windows内置帐户也可，推荐），选择下一步

![创建](https://img-blog.csdnimg.cn/e1f75a21281e46cea4237316ae1a165c.png)

```
username: oracle
password: Sa23456
```

4) 目录

Oracle基目录选择一个好找的目录，推荐为 `D:\tool\oracle`（自行新建），简单纯英文，无空格

**记住全局数据库名orcl，然后设置口令Sa23456**

“创建为容器数据库”点掉，不要勾选

```
oracle 基本目录：D:\tool\oracle
oracle 数据目录：D:\tool\oracle\oradata
```

![目录](https://img-blog.csdnimg.cn/10bd9763ca7c45fd9482a9c4577a43a3.png)

5) 等待安装

弹出配置检查界面，一般没啥问题，点击“安装”：

![install](https://img-blog.csdnimg.cn/7d28839126c94f91a7517d989a755e7d.png)

![install-2](https://img-blog.csdnimg.cn/c67ea8f91f114d559f68deee663a1fcd.png)

中途可能有防火墙警告，全部允许

在安装过程中，可能会遇到，卡在42%不动的情况，这个一般不要惊慌，等一会儿自动就装好了。

![42%](https://img-blog.csdnimg.cn/21c31c2033b94809a619be02daa43c27.png)

注意：如果进度卡在42%超过半小时以上，就去看一下重要的应用有没有安装完成，若已经完成，把安装页面关掉就行，初学者使用已经够了。

![installed](https://img-blog.csdnimg.cn/3803a77af269430fa4e8d2453222a163.png)

6) 安装完成后，界面如下：

![done](https://img-blog.csdnimg.cn/1792bdcd2efd42e9aad0db43b7b128c5.png)

## 四、安装后检查

打开cmd，输入SQLPLUS，回车

进入到弹出登录提醒，输入conn as sysdba(注意空格），回车，提示输入密码，sysdba是后门进入，不用密码（如果你喜欢有仪式感，输几个你喜欢的数字也可以，但是系统会隐藏掉🙈），回车。

显示如下即成功🎉🎉🎉

![SQLPLUS](https://img-blog.csdnimg.cn/22d159ca2bbf4be791d7f1113be1b805.png)

# 查考资料

https://www.php.cn/faq/485887.html

https://blog.csdn.net/liangmengbk/article/details/125690405

https://blog.csdn.net/weixin_57263771/article/details/128269842

[win10 Oracle数据库的安装(不可错过版）](https://blog.csdn.net/weixin_57263771/article/details/128269842)

* any list
{:toc}







