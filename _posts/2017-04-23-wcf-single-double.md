---
layout: post
title:  WCF-06-simplex communication, duplex separation
date:  2017-4-24 14:02:19 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# 单工、双工

[单工](https://en.wikipedia.org/wiki/Simplex_communication) 模式的数据传输是单向的。通信双方中，一方固定为发送端，一方则固定为接收端。信息只能沿一个方向传输，使用一根传输线

[双工](https://en.wikipedia.org/wiki/Duplex_(telecommunications)) 指二台通讯设备之间，允许有双向的资料传输。


# 实例

## Case One

没有返回值的单工函数。一切正常。

- Server SingleService.cs

```c#
/// <summary>
/// 单工
/// </summary>
[ServiceContract]
public interface ISingleService
{
    [OperationContract(IsOneWay = true)]
    void DoTestWork(string message);
}

public class SingleService : ISingleService
{

    public void DoTestWork(string message)
    {
        Console.WriteLine("从客户端发来的消息：" + message);  
    }
    
}
```

- Client Main()

```c#
static void Main(string[] args)
{
    MS.SingleServiceClient client = new MS.SingleServiceClient();
    string message = "你好，单工！";
    client.DoTestWork(message);

    Console.ReadKey();
}
```

result

```
服务已启动。
从客户端发来的消息：你好，单工！
```

## Case Two

对 SingleService 修改如下。即为方法添加返回值

- Server SingleService.cs
 
```c#
/// <summary>
/// 单工
/// </summary>
[ServiceContract]
public interface ISingleService
{
    [OperationContract(IsOneWay = true)]
    DateTime DoTestWork(string message);
}


public class SingleService : ISingleService
{

    public DateTime DoTestWork(string message)
    {
        Console.WriteLine("从客户端发来的消息：" + message);
        return DateTime.Now;
    }

}
```

报错如下

```
未经处理的异常:  System.InvalidOperationException: 使用 IsOneWay=true 标记的操作
不得声明输出参数、引用参数或返回值。
...
```

## Case Three

对于上面的报错，有一种解决方案。

就是将 `IsOneWay = false`。这就变回了普通的双工。




* any list
{:toc}