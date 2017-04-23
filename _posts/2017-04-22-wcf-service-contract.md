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


# 拓展

> [WSDL](http://www.w3school.com.cn/wsdl/index.asp)


> [client如何知道server提供的功能清单](http://www.cnblogs.com/huangxincheng/p/4567822.html)


* any list
{:toc}










