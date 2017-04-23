---
layout: post
title:  WCF-05-data contract
date:  2017-04-23 12:02:09 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# Data Contract

默认的情况下WCF使用称之为数据协定序列化程序的序列化引擎对数据进行序列化和反序列化，所有的.NET Framework基元类型，如整型、字符串型，以及某些被视为基元的类型，
如DateTime、XmlElement不需要做其他工作就可以被序列化，并被视拥有默认的[数据协定](https://msdn.microsoft.com/zh-cn/library/ee960161(v=vs.110).aspx)。

> [数据协定](http://blog.csdn.net/u011854789/article/details/51945127)


# Simple Demo

- User.cs

```c#
namespace Server.Model
{
    public class User
    {
        public string Name
        {
            get;
            set;
        }

        public int Age
        {
            set;
            get;
        }
    }
}
```

- Server DataService.cs

```c#
namespace Server.Service
{
    [ServiceContract]
    public interface IDataService
    {
        [OperationContract]
        User GetUser();
    }

    public class DataService : IDataService
    {

        public User GetUser()
        {
            return new User { 
                Name = "ryo",
                Age = 11
            };
        }
    }
}
```


- Client Main()

```c#
static void Main(string[] args)
{
    DS.DataServiceClient client = new DS.DataServiceClient();
    User user = client.GetUser();

    Console.WriteLine("Name is:{0}, Age is {1}", user.Name, user.Age);
    Console.ReadKey();
}
```


这个运行时完全正常的。如果此时你在**Client**端查看User的属性。应该如下：

![data]({{ site.url}}/static/app/img/network/data/2017-04-23-wcf-data-model.png)


# User Data Contract

一、初次尝试


- User.cs

需要引入 `using System.Runtime.Serialization;`

```c#
namespace Server.Model
{
    [DataContract]
    public class User
    {
        [DataMember]
        public string Name
        {
            get;
            set;
        }

        public int Age
        {
            set;
            get;
        }
    }
}
```

这时的客户端只能看到 Name 字段。而看不到 Age 字段。

换言之，只是应用了 DataMember 特性的成员才算是数据成员。使用数据协定可以灵活控制哪些成员应该被客户端识别。


二、私有字段

我们在 User 实体类中添加**私有** 字段如下：

```c#
[DataMember]
private string password;
```

此时到 Client 端你会发现，password 字段可见，而且是**共有**的。

```
public string password { set; get; }
Client.ServiceReference1.User 的成员
```

为什么呢?

其实数据协定是通过XML来传输的，你想一想XML序列化的特点就找到些启发了，XML序列化和反序列化只针对公共成员，所以，如果希望让私有的数据成员也能进行序列化，能做的事情就是把数据成员都变成公共成员。
这一点 MSDN 上也有相关说明。


三、移花接木

我们对 Server 的实体稍作修改。

- User.cs

```c#
namespace Server.Model
{
    [DataContract(Name="Worker")]
    public class User
    {
        [DataMember(Name="WorkerName")]
        public string Name
        {
            get;
            set;
        }

        [DataMember(Name = "WorkerAge")]
        public int Age
        {
            set;
            get;
        }

    }
}
```

客户端生成的类，类名、属性名全变了，虽然变成了另一个类，但里面的数据还是从服务器端的 User 类传递的。










