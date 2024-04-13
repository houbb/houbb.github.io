---
layout: post
title:  Nuget
date:  2017-05-06 09:17:07 +0800
categories: [Dotnet]
tags: [nuget]
published: true
---


# NuGet

[NuGet](https://www.nuget.org/) is the package manager for the Microsoft development platform including .NET. The NuGet client tools provide the ability to produce and consume packages. 
The NuGet Gallery is the central package repository used by all package authors and consumers.


# 发布自己的 nuget 包

> [如何在nuget上传自己的包+搭建自己公司的NuGet服务器](http://www.cnblogs.com/dunitian/p/6015459.html)

一、项目的编译


项目本身的版本信息可以再 `AssemblyInfo` 文件中进行修改。 

项目在**Release**下编译生成 DLL(在项目对应路径 **bin/release/** 下)。

二、DLL 发布

发布到自己的 Nuget 服务器上。比如 

```
192.168.0.165
```

对应的文件夹。如

```
D:/MdmNuget/packages
```

有三个主要文件： `*.dll`、`*.pdb`、`*.xml`，直接复制到对应位置。


三、升级 nuget 包

任意复制一个旧版本的 nuget 包。比如复制一个 `myproject1.01.nupkg`，然后将上面提到的**三个文件拖拽到 nupkg**中。双击可以编辑版本号信息。直接version+1即可。

右上 编辑 File-》Save As()... 直接名称会自动更新。直接保存即可。

四、删除不需要的文件

文件保存好之后，包已经是最新的了。对应的上面三个文件可以直接删除。



四、 引用自己发布的 nuget 包

在VS中设置自己的**下载源**。



# Nuget 服务器的搭建

> [搭建属于自己的NuGet服务器](http://www.cnblogs.com/lzrabbit/archive/2012/05/01/2477873.html)

> [搭建公司内部的NuGet Server](http://jingyan.baidu.com/article/25648fc18ff6b29190fd0045.html)


TODO: 自己试验一下(并对本博客重新补充图片和细节)


<label class="label label-warning">版本问题</label>

直接使用 VS2013 进行测试。Nuget 下载 **Nuget Server** 包(默认最新)需要4.6。所以需要降低版本。
 
解决方案如下：

VS2013 【工具】-》【Nuget 程序包管理器】-》【程序包管理器控制台】


```
PM >  Install-Package NuGet.Server -Version 2.8.6
```

使用命令行指定下载的版本。具体 **NuGet.Server** 的依赖自己可以去[官网](https://www.nuget.org/packages/NuGet.Server/2.8.6)看看。

具体参数详情，参见[Nuget Shell](https://docs.microsoft.com/zh-cn/nuget/tools/powershell-reference)



一、创建项目

直接创建一个**Web 空项目**。如果版本支持，你可以使用 Nuget 直接安装**NuGet.Server**。如果存在版本依赖问题，就使用上面的方式。

安装日志如下：

```
PM> Install-Package NuGet.Server -Version 2.8.6
正在尝试解析依赖项“NuGet.Core (≥ 2.8.6)”。
正在尝试解析依赖项“Microsoft.Web.Xdt (≥ 2.1.0)”。
正在尝试解析依赖项“elmah (≥ 1.2.2)”。
正在尝试解析依赖项“elmah.corelibrary (≥ 1.2.2)”。
正在尝试解析依赖项“Ninject (≥ 3.0.0.15)”。
正在尝试解析依赖项“RouteMagic (≥ 1.2)”。
正在尝试解析依赖项“WebActivatorEx (≥ 2.0.2)”。
正在尝试解析依赖项“Microsoft.Web.Infrastructure (≥ 1.0.0.0)”。
正在安装“Microsoft.Web.Xdt 2.1.1”。
已成功安装“Microsoft.Web.Xdt 2.1.1”。
正在安装“NuGet.Core 2.8.6”。
已成功安装“NuGet.Core 2.8.6”。
正在安装“elmah.corelibrary 1.2.2”。
已成功安装“elmah.corelibrary 1.2.2”。
正在安装“elmah 1.2.2”。
已成功安装“elmah 1.2.2”。
正在安装“Ninject 3.0.1.10”。
已成功安装“Ninject 3.0.1.10”。
正在安装“RouteMagic 1.2”。
已成功安装“RouteMagic 1.2”。
正在安装“Microsoft.Web.Infrastructure 1.0.0.0”。
已成功安装“Microsoft.Web.Infrastructure 1.0.0.0”。
正在安装“WebActivatorEx 2.0.2”。
已成功安装“WebActivatorEx 2.0.2”。
正在安装“NuGet.Server 2.8.6”。
已成功安装“NuGet.Server 2.8.6”。
正在将“Microsoft.Web.Xdt 2.1.1”添加到 NugetServerWeb。
已成功将“Microsoft.Web.Xdt 2.1.1”添加到 NugetServerWeb。
正在将“NuGet.Core 2.8.6”添加到 NugetServerWeb。
已成功将“NuGet.Core 2.8.6”添加到 NugetServerWeb。
正在将“elmah.corelibrary 1.2.2”添加到 NugetServerWeb。
已成功将“elmah.corelibrary 1.2.2”添加到 NugetServerWeb。
正在将“elmah 1.2.2”添加到 NugetServerWeb。
已成功将“elmah 1.2.2”添加到 NugetServerWeb。
正在将“Ninject 3.0.1.10”添加到 NugetServerWeb。
已成功将“Ninject 3.0.1.10”添加到 NugetServerWeb。
正在将“RouteMagic 1.2”添加到 NugetServerWeb。
已成功将“RouteMagic 1.2”添加到 NugetServerWeb。
正在将“Microsoft.Web.Infrastructure 1.0.0.0”添加到 NugetServerWeb。
已成功将“Microsoft.Web.Infrastructure 1.0.0.0”添加到 NugetServerWeb。
正在将“WebActivatorEx 2.0.2”添加到 NugetServerWeb。
已成功将“WebActivatorEx 2.0.2”添加到 NugetServerWeb。
正在将“NuGet.Server 2.8.6”添加到 NugetServerWeb。
已成功将“NuGet.Server 2.8.6”添加到 NugetServerWeb。
```


二、访问网页

等上面的安装好了之后。直接在文件 `Default.aspx` 右键，选择在浏览器访问。页面内容大致如下：

```
You are running NuGet.Server v2.8.60717.93

Click here to view your packages.

Repository URLs
In the package manager settings, add the following URL to the list of Package Sources:
http://localhost:2779/nuget
To enable pushing packages to this feed using the nuget command line tool (nuget.exe). Set the api key appSetting in web.config.
nuget push {package file} -s http://localhost:2779/ {apikey}
To add packages to the feed put package files (.nupkg files) in the folder "d:\我的文档\visual studio 2013\Projects\NugetServer\NugetServerWeb\Packages".
```

此时，这个服务器就算完成了。(类似于一个项目原型/模板。)至于你想用 IIS，还是其他方式去部署。此处不做讨论。


三、上传 DLL 到你的服务器

- 编写一个 DLL 

新建一个 DLL 项目。里面简单的写一个工具类。内容如下：

```c#
namespace Util
{
    /// <summary>
    /// 字符串工具类
    /// @author ryo
    /// @time 2017-5-6 08:16:25
    /// </summary>
    public class StringUtil
    {
        /// <summary>
        /// 空字符串
        /// </summary>
        public const string EMPTY_STRING = "";

        /// <summary>
        /// 判断字符串是否为空
        /// </summary>
        /// <param name="original">待判断的字符串</param>
        /// <returns>为空，返回TRUE。否则，返回false</returns>
        public static bool IsEmpty(string original)
        {
            return null == original 
                || EMPTY_STRING.Equals(original);
        }
    }

}
```

将此项目在 **release** 状态下编译生成。LOG 如下

```
1>------ 已启动生成:  项目: Util, 配置: Release Any CPU ------
1>  Util -> d:\我的文档\visual studio 2013\Projects\NugetServer\Util\bin\Release\Util.dll
========== 生成:  成功 1 个，失败 0 个，最新 0 个，跳过 0 个 ==========
```


- 上传到服务器

使用可视化的工具——[Nuget Package Exporer](https://npe.codeplex.com/)可以使你上传变得更加方便。

初始化界面如下：

![nuget](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/nuget/2017-05-06-nuget-package-explorer.png)


然后将 **d:\我的文档\visual studio 2013\Projects\NugetServer\Util\bin\Release** 下的文件直接拖拽进去。如下：

![nuget](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/nuget/2017-05-06-nuget-package-add-dll.jpg)

你可以在左上角编辑对应的信息。(比如版本号什么的)

接下来上传有两种方式。

a. 一种是直接点击【File】->【Save as】然后将保存后的文件放在对应的nuget server 包下。放在哪里呢？

其实就是上面服务器网页的一句话

To add packages to the feed put package files (.nupkg files) in the folder 

```
"d:\我的文档\visual studio 2013\Projects\NugetServer\NugetServerWeb\Packages".
```

b. 直接发布。点击【File】-》【Publish】

填好对应的发布URL（服务器地址）和KEY（UID）。

![publish](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/nuget/2017-05-06-nuget-package-publish.png)


有点以外竟然失败了。我们先使用 a 方案。过会解决 b 的问题。


四、使用

随便建个项目用来测试。添加 nuget 包源。

【工具】-》【选项】。设置如下。后续使用和普通 nuget 包没什么区别。（只是程序包源不同。）

![source](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/nuget/2017-05-06-nuget-package-source.png)



* any list
{:toc}




