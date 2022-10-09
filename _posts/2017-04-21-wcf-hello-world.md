---
layout: post
title:  WCF-02-hello world2
date:  2017-04-22 22:35:31 +0800
categories: [Network]
tags: [wcf, dotnet]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---


# Hello World

[上一篇](https://houbb.github.io/2017/04/21/wcf)中我们直接使用默认创建的模板尝试了一下WCF。我们这里再手动写一下。

（友情提示：可以跳过。）


一、创建 Server

直接新建命令行程序。

- Program.cs

这里需要添加引用`System.ServiceModel`。


```c#
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.Text;
using System.Threading.Tasks;

namespace Server
{
    /// <summary>
    /// define a contract
    /// </summary>
    [ServiceContract]
    public interface IService
    {
        [OperationContract]
        string TestMethod();
    }

    /// <summary>
    /// the service behavior
    /// </summary>
    public class MyService : IService
    {

        public string TestMethod()
        {
            return "my service test method";
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // 基址URI，必须，HTTP方案  
            Uri baseURI = new Uri("http://localhost:8008/Service");

            using (ServiceHost host = new ServiceHost(typeof(MyService), baseURI))
            {
                // 向服务器添终结点  
                WSHttpBinding binding = new WSHttpBinding();
                // 这里不需要安全验证  
                binding.Security.Mode = SecurityMode.None;
                host.AddServiceEndpoint(typeof(IService), binding, "my");
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
    }
}
```


二、启动服务

直接当前项目【设为启动项目】。然后【Ctrl+F5】执行即可。


三、创建客户端

同样建立一个命令行程序。【引用】=》【添加服务引用】。

和上一篇内容相似，地址填写代码中指定的`http://localhost:8008/Service`。

此处为了代码编写方便，我们修改**命名空间**为**MS**。


- Program.cs

```c#
namespace Client
{
    class Program
    {
        static void Main(string[] args)
        {
            MS.ServiceClient service = new MS.ServiceClient();
            Console.WriteLine(service.TestMethod());
            Console.ReadKey();
        }
    }
}
```


# Extension

> [WCF 难学否](http://blog.csdn.net/tcjiaan/article/details/7792726)

> [三种Binding让你KO80%的业务](http://www.cnblogs.com/huangxincheng/p/4558747.html)

> [config配置](http://www.cnblogs.com/huangxincheng/p/4562239.html)





* any list
{:toc}


