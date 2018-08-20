---
layout: post
title:  WCF-10-session
date:  2017-4-25 10:25:48 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# Session

[Session](https://en.wikipedia.org/wiki/Session_(computer_science))对象存储特定用户会话所需的属性及配置信息。

这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。

当用户请求来自应用程序的 Web 页时，如果该用户还没有会话，则 Web 服务器将自动创建一个 Session 对象。当会话过期或被放弃后，服务器将终止该会话。

> [深入理解HTTP Session](http://lavasoft.blog.51cto.com/62575/275589/)

# 不支持会话

在 WCF 中，会话的含义与 Web 中的会话概念类似，就是客户端与服务器端在**私聊**，这便是存在会话的调用；那么，没有会话的调用呢，就是**群聊**。

我们写一个例子，看看在不支持会话的绑定上连续调用两个有关联的代码，会发生什么情况。

一、Server

命令行程序。

- Server Service

```c#
namespace Server.Service
{
    [ServiceContract]
    public interface ISessionService
    {
        [OperationContract(IsOneWay = true)]
        void SetValue(int n);
        [OperationContract]
        int GetValue();
    }

    [ServiceBehavior(IncludeExceptionDetailInFaults = true)]
    public class SessionService : ISessionService
    {
        /// <summary>  
        /// 私有字段  
        /// </summary>  
        private int m_Value = int.MinValue;

        public SessionService()
        {
            Console.WriteLine("{0} - 服务被实例化。", DateTime.Now.ToLongTimeString());
        }

        // 在析构函数中也输出信息  
        ~SessionService()
        {
            Console.WriteLine("{0} - 服务实例被释放。", DateTime.Now.ToLongTimeString());
        }


        public void SetValue(int n)
        {
            this.m_Value = n;
            //Console.WriteLine("当前实例的哈希值：{0}", this.GetHashCode().ToString("x"));
            Console.WriteLine("会话ID：{0}\n", OperationContext.Current.SessionId);
        }

        public int GetValue()
        {
            Console.WriteLine("会话ID：{0}", OperationContext.Current.SessionId);
            //Console.WriteLine("当前实例的哈希值：{0}\n", this.GetHashCode().ToString("x"));
            return this.m_Value;
        }
    }  
}
```

- Server Main()

实现服务主机，我们使用不支持的 Bindding。

```c#
static void Main(string[] args)
{
    Console.Title = "WCF服务器端";
    using (ServiceHost host = new ServiceHost(typeof(SessionService), new Uri("http://127.0.0.1:18080/services")))
    {
        // 绑定  
        BasicHttpBinding binding = new BasicHttpBinding();
        binding.Security.Mode = BasicHttpSecurityMode.None;//不需要安全模式  
        host.AddServiceEndpoint(typeof(ISessionService), binding, "/ep");

        // 服务元数据  
        ServiceMetadataBehavior mb = new ServiceMetadataBehavior();
        mb.HttpGetEnabled = true;
        mb.HttpGetUrl = new Uri("http://127.0.0.1:8008/meta");

        host.Description.Behaviors.Add(mb);
        host.Opened += (sender, arg) =>
        {
            Console.WriteLine("服务已启动。");
        };
        try
        {
            host.Open();//打开服务  
            Console.Read();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }  
}
```

二、Client

为了使演示操作更方便，客户端使用Windows Forms项目。界面如下：

![form](https://raw.githubusercontent.com/houbb/resource/master/img/network/wcf/2017-04-25-wcf-session-client-form.png)

我们点击【Call SetVal()】进行设置值。点击【Call GetVal()】进行取值。

代码如下：

```c#
namespace SessionFormsClient
{
    public partial class Form1 : Form
    {
        MS.SessionServiceClient client = null;

        public Form1()
        {
            InitializeComponent();

            // 1. 初始化 client
            client = new MS.SessionServiceClient();

            // 2. 关闭通道  
            this.FormClosing += (frmsender, frmargs) => client.Close();  
        }

        
        /// <summary>
        /// 设置值
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void button1_Click(object sender, EventArgs e)
        {
            int v;
            if (!int.TryParse(this.textBox1.Text, out v))
            {
                return;
            }
            client.SetValue(v);  
        }

        /// <summary>
        /// 读取值
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void button2_Click(object sender, EventArgs e)
        {
            int v = client.GetValue();
            this.label2.Text = v.ToString(); 
        }
    }
}
```

三、测试

- Client

测试结果如下。取值时并不是我们的预期值**100**，而是 **int.MIN_VALUE**;

![test one](https://raw.githubusercontent.com/houbb/resource/master/img/network/wcf/2017-04-25-wcf-session-client-test1.png)

- Server
 
很明显，每调用一次操作，服务类就被实例化一次，意思就是：调用SetValue时是实例A，而调用GetValue时可能是实例B了，所以，私有字段的值没有被保存。
 
```
服务已启动。
13:24:24 - 服务被实例化。
会话ID：

13:24:25 - 服务被实例化。
会话ID：
```

四、分析

那么，如何证明两次调用的操作不属于同一个服务实例呢？还记得`GetHashCode`吗？对的，只要在内存中不是同一个实例的，其哈希值肯定不同。是不是这样呢，我们把上面的服务代码改一下。

- Server Service

```c#
public void SetValue(int n)
{
    this.m_Value = n;
    Console.WriteLine("当前实例的哈希值：{0}", this.GetHashCode().ToString("x"));
    Console.WriteLine("会话ID：{0}\n", OperationContext.Current.SessionId);
}

public int GetValue()
{
    Console.WriteLine("会话ID：{0}", OperationContext.Current.SessionId);
    Console.WriteLine("当前实例的哈希值：{0}\n", this.GetHashCode().ToString("x"));
    return this.m_Value;
}
```

重新部署。测试观察Server命令行LOG如下

```
服务已启动。
13:31:07 - 服务被实例化。
当前实例的哈希值：2edefa
会话ID：

13:31:08 - 服务被实例化。
会话ID：
当前实例的哈希值：3d84a94
```

这个结果证实了我之前的推断，先后调用的两个方法不是同一个实例的。


# 支持会话
 
一、Server

- Server Service

```c#
[ServiceContract(SessionMode = SessionMode.Required)]  
public interface ISessionService  
{  
    //...  
}  
```

- Server Main()

```c#
// 绑定  
//BasicHttpBinding binding = new BasicHttpBinding();  
//binding.Security.Mode = BasicHttpSecurityMode.None;//不需要安全模式  
//host.AddServiceEndpoint(typeof(IService), binding, "/ep");  
NetTcpBinding binding = new NetTcpBinding();  
binding.Security.Mode = SecurityMode.None;  
host.AddServiceEndpoint(typeof(IService), binding, "net.tcp://127.0.0.1:2377/ep"); 
```

二、测试

这次再进行测试。结果和我们预期一致。

- Server Console Log
 
```
服务已启动。
13:41:34 - 服务被实例化。
当前实例的哈希值：249ad04
会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=1

会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=1
当前实例的哈希值：249ad04
```

三、同时开始多个客户端

(client 多运行几次即可)

- Server Console Log

```
服务已启动。
13:41:34 - 服务被实例化。
当前实例的哈希值：249ad04
会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=1

会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=1
当前实例的哈希值：249ad04

13:44:54 - 服务被实例化。
当前实例的哈希值：2dca979
会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=2

会话ID：uuid:62ec7c15-f7b2-4352-a307-722f4f90f5d8;id=2
当前实例的哈希值：2dca979
```

看到那个不同的会话ID，哈希值和实例化时间了吧？

这表明了：**服务器独立维护着与每个客户端的会话**。


# 解决方案调整

一、Server

- Server SessionService.cs

```c#
[ServiceContract(SessionMode = SessionMode.Required)]  
public interface ISessionService  
{  
    [OperationContract(IsOneWay = true,IsInitiating = true, IsTerminating = false)]  
    void SetValue(int n);  
    [OperationContract]  
    int GetValue();  
    [OperationContract(IsInitiating = false, IsTerminating = true)]  
    void EndSession();  
}  

[ServiceBehavior(IncludeExceptionDetailInFaults = true)]
public class SessionService : ISessionService
{
    //...
    public void EndSession()  
    {  
        Console.WriteLine("会话结束。");  
    } 
}
```

看到变化了吗？

我们在使用OperationContractAttribute定义操作协定时，设置了两个属性：

a、IsInitiating：如果为真，则当调用该操作时就启用会话。

b、IsTerminating：如果为真，则说明当该用该操作时终结会话。

所以，上面的例子是，当调用SetValue时开始会话，当调用EndSession方法后会话结束，在选择作为结束会话的方法时，最好使用返回值为void或者单向通讯（One Way）的方法，
这样，不用等待客户结束才结束会话，因为单向通讯，不需要向客户端回复消息，因为它被调用后就可以马上终止会话了。

二、Client

在客户端代码中，我们要取消之前的关闭通道的代码，因为不再需要，会话一旦终结，通道就自动关闭，服务实例就会自动人间消失。

```c#
MS.SessionServiceClient client = null;  
public Form1()  
{  
    InitializeComponent();  
    
    //1. init client 
    client = MS.SessionServiceClient();  
    
    // 2. 关闭通道  
    //this.FormClosing += (frmsender, frmargs) => client.Close();  
}  
```

* any list
{:toc}



