---
layout: post
title:  WCF-11-server callback
date:  2017-04-25 22:47:04 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---


# Server Callback

> [回调函数](https://www.zhihu.com/question/19801131)


假设现有服务器端S，客户端A开始连接S并调用相关操作，其中有一个操作，在功能上有些特殊，调用后**无法即时回复**，因为在服务器上要作一些后续，而这些处理也许会消耗一定时间。

我们希望A在处理完成后反馈给服务端S一个结果。这个时候回调就会变得很有必要。



# Simple Demo

一、Server

- ICallback

定义一个回调接口

```c#
public interface ICallback  
{  
    // 回调操作也必须One Way  
    [OperationContract(IsOneWay = true)]  
    void CallClient(int v);  
}
```

- CallbackService.cs

定义服务协定

```c#
[ServiceContract(Namespace = "MyNamespace",
    CallbackContract = typeof(ICallback), /* 标注回调协定 */
    SessionMode = SessionMode.Required /* 要求会话 */
    )]
public interface ICallbackService
{
    // 会话从调用该操作启动  
    [OperationContract(IsOneWay = true, /* 必须 */
        IsInitiating = true, /* 启动会话 */
        IsTerminating = false)]
    void CallServerOp();

    // 调用该操作后，会话结束  
    [OperationContract(IsOneWay = true, /* 使用回调，必须为OneWay */
        IsTerminating = true, /* 该操作标识会话终止 */
        IsInitiating = false)]
    void End();
}

public class CallbackService : ICallbackService, IDisposable
{
    private ICallback m_cb;
    private Timer timer = null;//计时器，定时干活  
    Random rand = null;//生成随机整数  

    public void CallServerOp()
    {
        this.m_cb = OperationContext.Current.GetCallbackChannel<ICallback>();
        rand = new Random();
        // 生成随整数，并回调到客户端  
        // 每隔3秒生成一次  
        timer = new Timer((obj) => m_cb.CallClient(rand.Next()), null, 10, 3000);

    }

    public void Dispose()
    {
        timer.Dispose();
        Console.WriteLine("{0} - 服务实例已释放。", DateTime.Now.ToLongTimeString());
    }


    public void End()  //结束  
    {
        Console.WriteLine("会话即将结束。");
    }
}  
```

CallbackContract属性指向ICallback的Type。因为我要使用计时器每隔3秒钟生成一个随机数，并回调到客户端，故要启用会话。


- Main()

```c#
public static void Exe()
{
    Console.Title = "WCF服务端";
    // 服务器基址  
    Uri baseAddress = new Uri("http://localhost:8008/services");
    // 声明服务器主机  
    using (ServiceHost host = new ServiceHost(typeof(CallbackService), baseAddress))
    {
        // 添加绑定和终结点  
        // tcp绑定支持会话  
        NetTcpBinding binding = new NetTcpBinding();
        binding.Security.Mode = SecurityMode.None;
        host.AddServiceEndpoint(typeof(ICallbackService), binding, "net.tcp://localhost:1211/rr");
        
        // 添加服务描述  
        host.Description.Behaviors.Add(new ServiceMetadataBehavior { HttpGetEnabled = true });
        try
        {
            // 打开服务  
            host.Open();
            Console.WriteLine("服务已启动。");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        Console.ReadKey();
    }
}
```

二、Client

- MyCallback.cs

```c#
/// <summary>  
/// 实现回调接口  
/// </summary>  
public class MyCallback : MS.ICallbackServiceCallback
{
    // 因为该方法是由服务器调用的  
    // 如果希望在客户端能即时作出响应  
    // 应当使用事件  
    public void CallClient(int v)
    {
        if (this.ValueCallbacked != null)
        {
            this.ValueCallbacked(this, v);
        }
    }
    /// <summary>  
    /// 回调引发该事件  
    /// </summary>  
    public event EventHandler<int> ValueCallbacked;
}  
```

- Form

![form](https://raw.githubusercontent.com/houbb/resource/master/img/network/wcf/2017-04-25-wcf-client-callback.png)

- Code

```c#
public partial class Form2 : Form
{
    MS.CallbackServiceClient client = null;
    MyCallback cb = null;  

    public Form2()
    {
        InitializeComponent();
        cb = new MyCallback();
        cb.ValueCallbacked += cbValueCallbacked;  
    }

    void cbValueCallbacked(object sender, int e)
    {
        this.label2.Text = e.ToString();
    }  

    private void button1_Click(object sender, EventArgs e)
    {
        client = new MS.CallbackServiceClient(new System.ServiceModel.InstanceContext(cb));
        client.CallServerOp();

        button1.Enabled = false;
        button2.Enabled = true;  
    }

    private void button2_Click(object sender, EventArgs e)
    {
        client.End();
        button1.Enabled = true;
        button2.Enabled = false; 
    }
}
```

三、Test

运行测试成功。点击【开始】之后，生成的随机数会3秒变化一次。


* any list
{:toc}


