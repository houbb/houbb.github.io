---
layout: post
title:  Windows Service
date:  2017-4-21 15:47:49 +0800
categories: [Network]
tags: [windows service]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# Windows Service
 
一个[Windows服务程序](https://msdn.microsoft.com/zh-cn/library/y817hyb6(v=vs.110).aspx)是在Windows操作系统下能完成特定功能的可执行的应用程序。

Windows服务程序虽然是可执行的，但是它不像一般的可执行文件通过双击就能开始运行了，它必须有特定的启动方式。这些启动方式包括了**自动启动**和**手动启动**两种。

# Hello World

## 创建Windows Service项目


- Create

【Visual C#】->【Windows】->【Windows 服务】

- Edit

双击`Service1.cs`，根据页面提示。单击可查看代码，或者右键查看源码。

- Service1.cs

初始化的代码修改如下

```c#
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace WindowsServiceTest
{
    public partial class Service1 : ServiceBase
    {
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            using (System.IO.StreamWriter sw = new System.IO.StreamWriter("D:\\log.txt", true))
            {
                sw.WriteLine(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss ") + " Start.");
            }
        }

        protected override void OnStop()
        {
            using (System.IO.StreamWriter sw = new System.IO.StreamWriter("D:\\log.txt", true))
            {
                sw.WriteLine(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss ") + " Stop.");
            }
        }
    }
}
```

## 创建服务安装程序

- 添加安装程序

双击`Service1.cs`，右键->【添加安装程序】。自动生成如下

![windows-service-installer](https://raw.githubusercontent.com/houbb/resource/master/img/network/windows-service/2017-04-21-windows-service-installer.png)

- 修改安装服务名

右键`serviceInsraller1`，选择属性，将ServiceName的值改为**你想要的服务名**，比如*ServiceTest*。

- 修改安装权限

右键`serviceProcessInsraller1`，选择属性，将Account的值改为**LocalSystem**。


## 编写安装脚本

在项目中添加2个文件如下(必须是**ANSI**或者**UTF-8无BOM格式**)：

(其实脚本放在哪里都行，使用绝对路径即可)


编译一下项目。确定`WindowsServiceTest.exe`的绝对路径。(理论上相对路径是可以的，我试了一下找的却不是当前路径下的。可自行尝试)

- Install.bat

```bat
%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\installutil.exe E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServiceTest.exe
Net Start ServiceTest
sc config ServiceTest start= auto

pause
```
其中:

%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\installutil.exe 为.Net工具地址。

E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServiceTest.exe 是项目**编译后**的运行程序地址

Net Start ServiceTest 为启动服务。

sc config ServiceTest start= auto  为设置服务为自动运行。

最后一行用于调试，暂停的。

- Uninstall.bat

```bat
%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\installutil.exe /u E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServiceTest.exe

pause
```


## 运行尝试

直接以**管理员身份**运行 `Install.bat`, Console 日志如下

```
正在运行事务处理安装。

正在开始安装的“安装”阶段。
查看日志文件的内容以获得 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Releas
e\WindowsServiceTest.exe 程序集的进度。
该文件位于 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServi
ceTest.InstallLog。
正在安装程序集“E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windows
ServiceTest.exe”。
受影响的参数是:
   logtoconsole =
   logfile = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsSer
viceTest.InstallLog
   assemblypath = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windo
wsServiceTest.exe
正在安装服务 ServiceTest...
已成功安装服务 ServiceTest。
正在日志 Application 中创建 EventLog 源 ServiceTest...

“安装”阶段已成功完成，正在开始“提交”阶段。
查看日志文件的内容以获得 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Releas
e\WindowsServiceTest.exe 程序集的进度。
该文件位于 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServi
ceTest.InstallLog。
正在提交程序集“E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windows
ServiceTest.exe”。
受影响的参数是:
   logtoconsole =
   logfile = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsSer
viceTest.InstallLog
   assemblypath = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windo
wsServiceTest.exe

“提交”阶段已成功完成。

已完成事务处理安装。

C:\Windows\system32>Net Start ServiceTest
ServiceTest 服务正在启动 .
ServiceTest 服务已经启动成功。


C:\Windows\system32>sc config ServiceTest start= auto
[SC] ChangeServiceConfig 成功

C:\Windows\system32>pause
请按任意键继续. . .
```

可以在【计算机】->【管理】->【服务】里看到对应的服务。此处为 **ServiceTest**.

此时D盘对应日志文件内容为

```
2017-04-21 16:53:08  Start.
```

## 卸载

以**管理员身份**运行 `Uninstall.bat` 脚本。Console 日志如下

```
正在开始卸载。
查看日志文件的内容以获得 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Releas
e\WindowsServiceTest.exe 程序集的进度。
该文件位于 E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsServi
ceTest.InstallLog。
正在卸载程序集“E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windows
ServiceTest.exe”。
受影响的参数是:
   logtoconsole =
   logfile = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\WindowsSer
viceTest.InstallLog
   assemblypath = E:\LEARN\Socket\NetSocket\WindowsServiceTest\bin\Release\Windo
wsServiceTest.exe
正在移除 EventLog 源 ServiceTest。
正在从系统中移除服务 ServiceTest...
已成功地从系统中移除服务 ServiceTest。
尝试停止服务 ServiceTest。

卸载完成。

C:\Windows\system32>pause
请按任意键继续. . .
```

此时，D盘对应日止文件内容变为

```
2017-04-21 16:53:08  Start.
2017-04-21 17:06:59  Stop.
```

以上。
















# 引用

[C# VS2013 中新建WindowsService定时任务](http://jingyan.baidu.com/article/cd4c2979e9330d756f6e6070.html)

[C# 编写Windows Service（windows服务程序）](http://www.cnblogs.com/bluestorm/p/3510398.html)

[C#创建Windows Service(Windows 服务)基础教程](http://www.cnblogs.com/sorex/archive/2012/05/16/2502001.html)

* any list
{:toc}