---
layout: post
title:  Bat and C#
date:  2017-5-17 15:14:03 +0800
categories: [C#]
tags: [dotnet, bat]
published: true
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


# 执行指定的内容

```c#
 /// <summary>  
/// 执行cmd命令  
/// 多命令请使用批处理命令连接符：  
/// <![CDATA[ 
/// &:同时执行两个命令 
/// |:将上一个命令的输出,作为下一个命令的输入 
/// &&：当&&前的命令成功时,才执行&&后的命令 
/// ||：当||前的命令失败时,才执行||后的命令]]>  
/// 其他请百度  
/// </summary>  
/// <param name="cmd">需要执行的内容</param>  
/// <param name="output">cmd 执行结果</param>  
private static void RunCmd(string cmd, out string output)
{
    cmd = cmd.Trim().TrimEnd('&') + "&exit";//说明：不管命令是否成功均执行exit命令，否则当调用ReadToEnd()方法时，会处于假死状态  
    using (Process p = new Process())
    {
        p.StartInfo.FileName = "cmd.exe";
        p.StartInfo.UseShellExecute = false;        //是否使用操作系统shell启动  
        p.StartInfo.RedirectStandardInput = true;   //接受来自调用程序的输入信息  
        p.StartInfo.RedirectStandardOutput = true;  //由调用程序获取输出信息  
        p.StartInfo.RedirectStandardError = true;   //重定向标准错误输出  
        p.StartInfo.CreateNoWindow = true;          //不显示程序窗口  
        p.Start();//启动程序  

        //向cmd窗口写入命令  
        p.StandardInput.WriteLine(cmd);
        p.StandardInput.AutoFlush = true;

        //获取cmd窗口的输出信息  
        output = p.StandardOutput.ReadToEnd();
        p.WaitForExit();//等待程序执行完退出进程  
        p.Close();
    }
}  
```




# 总结

暂时写到这里。

后面会有拓展内容，如：想在程序中拿到执行的结果，或者是想传入参数等应该如何处理。


# Bat 阻塞问题

这个问题很奇怪。执行 bat 时会导致线程进入假死状态。

具体原因如下：[C#使用Process调用批处理阻塞问题](http://www.cnblogs.com/lowcoders-Blog/archive/2016/05/30/5541516.html)


解决方案：

一、[讨论贴](http://bbs.csdn.net/topics/380135166)

二、[C# Process运行cmd命令的异步回显](http://blog.csdn.net/cuoban/article/details/50739020)


## 情景复现

一、执行 cmd 如下。

```c#
public void ExecuteHelpCmd(string command="help")
{
    Process p = new Process();
    p.StartInfo.FileName = "cmd.exe";
    p.StartInfo.UseShellExecute = false;
    p.StartInfo.CreateNoWindow = true;

    p.StartInfo.RedirectStandardInput = true;
    p.StartInfo.RedirectStandardOutput = true;
    
    p.Start();
    p.StandardInput.WriteLine(command);
    p.StandardInput.WriteLine("exit");

    p.WaitForExit();
    
    FileUtil.WriteLine(p.StandardOutput.ReadToEnd());
    
    p.Close();
}
```

其中 FileUtil 内容如下，只是简单的文件输出：

```c#
public class FileUtil
{
    /// <summary>
    /// 将文件内容写死到固定的文件中。
    /// </summary>
    /// <param name="content"></param>
    public static void WriteLine(string content)
    {
       string currentDate = DateTime.Now.ToString("yyyyMMddHHmmss"); 
       string path = @"E:\1.txt";
       File.AppendAllText(path, currentDate + content);
    }
}
```

调用此方法，程序会卡死。

<label class="label label-info">解决方案</label>


一、简单粗暴

```c#
p.WaitForExit();
```

这段代码修改为 

```c#
p.WaitForExit(5000);
```

其中等待时间单位为毫秒，到时间后会自动kill进程。(这个会不会影响比较长时间的执行，未验证。)


二、异步回显(个人推荐)


```c#
public void ExecuteHelpCmd(string command="help")
{
    Process p = new Process();
    p.StartInfo.FileName = "cmd.exe";
    p.StartInfo.UseShellExecute = false;
    p.StartInfo.CreateNoWindow = true;

    p.StartInfo.RedirectStandardInput = true;  // 重定向输入
    p.StartInfo.RedirectStandardOutput = true; // 重定向标准输出
    p.StartInfo.RedirectStandardError = true;  // 重定向错误输出 

    p.OutputDataReceived += new DataReceivedEventHandler(CmdOutputDataReceived);
    p.ErrorDataReceived += new DataReceivedEventHandler(CmdErrorDataReceived);  

    p.Start();
    p.BeginOutputReadLine();
    p.BeginErrorReadLine();  

    p.StandardInput.WriteLine(command);
    p.StandardInput.WriteLine("exit");
    p.Close();
}

/// <summary>
/// 输出回显
/// </summary>
/// <param name="sendingProcess"></param>
/// <param name="outLine"></param>
private void CmdOutputDataReceived(object sendingProcess,
    DataReceivedEventArgs outLine)
{
    // Collect the sort command output.
    if (!String.IsNullOrEmpty(outLine.Data))
    {
        //output 
        FileUtil.WriteLine(outLine.Data);
    }
}

/// <summary>
/// 错误回显
/// </summary>
/// <param name="sendingProcess"></param>
/// <param name="outLine"></param>
private void CmdErrorDataReceived(object sendingProcess,
    DataReceivedEventArgs outLine)
{
    // Collect the sort command output.
    if (!String.IsNullOrEmpty(outLine.Data))
    {
        //output 
        FileUtil.WriteLine(outLine.Data);
    }
}
```
