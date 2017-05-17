---
layout: post
title:  Bat and C#
date:  2017-5-17 15:14:03 +0800
categories: [C#]
tags: [dotnet, bat]
published: false
---

# 前言

有时候会遇到使用 c# 代码是调用 bat 文件的需求。此文旨在提供一个简单的示例，以后会陆续补充响应内容。

# 示例

一、创建一个命令行运行程序 HelloBat

此处没有直接通过命令行打印内容，而是将当前内容添加到指定的文件中。为了调用不启动窗口也可以证明方法确实执行了。

- Main.cs

```c#
class Program
{
    static void Main(string[] args)
    {
        var nowStr = DateTime.Now.ToString()+"\n";
        string targetFilePath = "E:\\LEARN\\Socket\\HelloBat\\HelloBat\\bin\\Release\\temp.txt";
        File.AppendAllText(targetFilePath, nowStr, Encoding.UTF8); // 也可以指定编码方式 
    }
}
```

二、创建脚本文件

- HelloBat.bat

对上述程序编译。为对应运行程序（`HelloBat.exe`） 编写简单的脚本。内容如下：

```bat
call HelloBat.exe
```

三、测试

编写单元测试方法。（直接写一个Main()方法也可）

- Test

```c#
[TestMethod]
public void TestHelloBat()
{
    using (Process process = new Process())
    {
        string batPath = "E:\\LEARN\\Socket\\HelloBat\\HelloBat\\bin\\Release\\HelloBat.bat";
        FileInfo file = new FileInfo(batPath);
        if (file.Directory != null)
        {
            process.StartInfo.WorkingDirectory = file.Directory.FullName;
        }
        process.StartInfo.FileName = batPath;
        process.StartInfo.UseShellExecute = false;
        process.Start();
        process.WaitForExit();
    }
}
```

执行后可以在对应的写入文本文件（`temp.txt`）中查看内容。

# 总结

暂时写到这里。

后面会有拓展内容，如：想在程序中拿到执行的结果，或者是想传入参数等应该如何处理。

TBC。。。
