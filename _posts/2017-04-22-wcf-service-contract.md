---
layout: post
title:  WCF-03-service contract
date:  2017-04-23 09:07:34 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# Service contract

定义和实现服务协议。

```c#
[ServiceContract]
public interface ICalcService
{
    [OperationContract]
    void Add();


    void Sub();

}

public class CalcService : ICalcService
{

    public void Add()
    {
        Console.WriteLine("add");
    }

    public void Sub()
    {
        Console.WriteLine("sub");
    }
}
```

如你所见，只有**Add()**上面添加了属性`OperationContract`。这是如果你在客户端添加服务引用，则只有**Add()**对于客户端可见，而未添加对应属性的不可见。


(ServiceContract也是同样的道理。不过未添加，服务都无法启动。)


# ServiceContract Attribute

(此处我们主要关心 Namespace、Name 这两个，其他的忽略暂时)

- ServiceContractAttribute.cs


```c#
// 摘要: 
//     指示接口或类在 Windows Communication Foundation (WCF) 应用程序中定义服务协定。
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited = false, AllowMultiple = false)]
public sealed class ServiceContractAttribute : Attribute
{
    // 摘要: 
    //     初始化 System.ServiceModel.ServiceContractAttribute 类的新实例。
    public ServiceContractAttribute();

    // ... 
    
    //
    // 摘要: 
    //     获取或设置 Web 服务描述语言 (WSDL) 中的 <portType> 元素的名称。
    //
    // 返回结果: 
    //     默认值为应用了 System.ServiceModel.ServiceContractAttribute 的类或接口的名称。
    //
    // 异常: 
    //   System.ArgumentNullException:
    //     该值为 null。
    //
    //   System.ArgumentOutOfRangeException:
    //     该值是一个空字符串。
    public string Name { get; set; }
    
    //
    // 摘要: 
    //     获取或设置 Web 服务描述语言 (WSDL) 中的 <portType> 元素的命名空间。
    //
    // 返回结果: 
    //     <portType> 元素的 WSDL 命名空间。 默认值为“http://tempuri.org”。
    public string Namespace { get; set; }
    
    //...
}
```

- Namespace

用于设置服务的命名空间，由于避免放到互联网中与其它服务冲突，命名空间必须是**唯一**的（其实就是XML命名空间），
默认是**http://tempuri.org/**。

- Name

可以为服务起一个别名(昵称)。便于调用或者业务的理解。


上文提及的WSDL，你也可以[浏览器](http://localhost:8008/Service?wsdl)中自己查看。


# Extension

> [WSDL](http://www.w3school.com.cn/wsdl/index.asp)


> [client如何知道server提供的功能清单](http://www.cnblogs.com/huangxincheng/p/4567822.html)



# Multi Contract

WCF服务端是先定义服务协定，其实就是一个接口，然后通过实现接口来定义服务类。那么，有一个问题，如果一个服务类同时实现N个接口（也就是有N个协定）呢？结果会如何？

（此处不讨论多个服务。多个服务就是独立的服务引用。互不干涉）


一、 Server Define contracts


```c#
[ServiceContract]
public interface IServiceOne
{
    [OperationContract]
    void sayOne();
}

[ServiceContract]
public interface IServiceTwo
{
    [OperationContract]
    void sayTwo();
}

[ServiceContract]
public interface IServiceThree
{
    [OperationContract]
    void sayThree();
}
```

二、 Server Implements contracts


```c#
public class MultiService : IServiceOne, IServiceTwo, IServiceThree
{
    public void sayOne()
    {
        Console.WriteLine("say one");
    }

    public void sayTwo()
    {
        Console.WriteLine("say two");
    }

    public void sayThree()
    {
        Console.WriteLine("say three");
    }
}
```



三、 Server Main() 

我们仅仅让服务类实现多个协定的接口是不够的，还要把希望对客户端公开的协定添加为终结点，对，一个协定一个终结点，不添加终结点的协定就不公开。

```c#
static void Main(string[] args)
{
    // 基址URI，必须，HTTP方案  
    Uri baseURI = new Uri("http://localhost:8008/Service");

    using (ServiceHost host = new ServiceHost(typeof(MultiService), baseURI))
    {
        // 向服务器添终结点  
        WSHttpBinding binding = new WSHttpBinding();
        
        // 这里不需要安全验证  
        binding.Security.Mode = SecurityMode.None;

        // 添加对应的协议。需要添加多个！
        host.AddServiceEndpoint(typeof(IServiceOne), binding, "my1");
        host.AddServiceEndpoint(typeof(IServiceTwo), binding, "my2");
        host.AddServiceEndpoint(typeof(IServiceThree), binding, "my3");


        // 为了能让VS生成客户端代码，即WSDL文档，故要添加以下行为  
        ServiceMetadataBehavior mdBehavior = new ServiceMetadataBehavior()
        {
            HttpGetEnabled = true
        };
        host.Description.Behaviors.Add(mdBehavior);

        //如果服务顺利启动，则提示，处理Opened事件  
        host.Opened += (sender, e) => Console.WriteLine("服务已启动。");
        // 启动服务器  
        try
        {
            host.Open();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        // 为了让程序不往下执行而结束，故加上这句  
        Console.ReadKey();
        // 关闭服务器  
        host.Close();
    }  
}
```

四、Client
 
每一个协议都会生成一个对应的client。所以客户端调用代码如下:

```c#
static void Main(string[] args)
{
    MultiService.ServiceOneClient oneClient = new MultiService.ServiceOneClient();
    oneClient.sayOne();

    MultiService.ServiceTwoClient twoClient = new MultiService.ServiceTwoClient();
    twoClient.sayTwo();

    MultiService.ServiceThreeClient threeClient = new MultiService.ServiceThreeClient();
    threeClient.sayThree();
}
```



* any list
{:toc}










