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

![data](https://raw.githubusercontent.com/houbb/resource/master/img/network/data/2017-04-23-wcf-data-model.png)


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


# More Complex Demo

我们来尝试一下一些比较复杂的数据类型。

- Server AddressInfo.cs

```c#
[DataContract]
public class AddressInfo
{
    /// <summary>
    /// 省份
    /// </summary>
    [DataMember]
    public string Province
    {
        set;
        get;
    }

    /// <summary>
    /// 市
    /// </summary>
    [DataMember]
    public string City
    {
        get;
        set;
    }


    /// <summary>
    /// 地址详情
    /// </summary>
    [DataMember]
    public string Detail
    {
        get;
        set;
    }
}
```

- Server User.cs

```c#
[DataContract]
public class User
{
    /// <summary>
    /// 姓名
    /// </summary>
    [DataMember]
    public string Name
    {
        set;
        get;
    }

    /// <summary>
    /// 地址
    /// </summary>
    [DataMember]
    public AddressInfo AddressInfo
    {
        get;
        set;
    }
    
}
```

- Server ComplexService.cs

```c#
[ServiceContract]
public interface IComplexService
{
    [OperationContract]
    User GetUser();   

}

public class ComplexService : IComplexService
{

    public User GetUser()
    {
        AddressInfo address = new AddressInfo();
        address.Province = "安徽";
        address.City = "合肥";
        address.Detail = "不知道";

        User user = new User();
        user.Name = "aQ";
        user.AddressInfo = address;

        return user;
    }
    
}
```

- Client Main()

对于客户端。实体类生成正常，调用也正常。

```c#
MS.ComplexServiceClient client = new MS.ComplexServiceClient();
User user = client.GetUser();

Console.WriteLine(user.AddressInfo.City+" "+user.AddressInfo.Province);
Console.ReadKey();
```



## 对于 Dictionary<> 的测试 

（这个例子比较简单，是为了与后面的 Demo 作对比）

在 User 实体类中添加一个字段成绩。

- Server User.cs

```c#
/// <summary>
/// 成绩
/// </summary>
[DataMember]
public Dictionary<string, float> Scores
{
    get;
    set;
}
```

- Server ComplexService.cs

```c#
public class ComplexService : IComplexService
{
    public User GetUser()
    {
        //...

        Dictionary<string, float> scores = new Dictionary<string,float>();
        scores.Add("Chinese", 96.5f);
        scores.Add("Math", 90.5f);

        //...
        user.Scores = scores;

        //...
    }
}
```

客户端更新服务。

【Service References】=》服务=》【更新服务引用】

- Client Main()

```c#
static void Main(string[] args)
{
    MS.ComplexServiceClient client = new MS.ComplexServiceClient();
    User user = client.GetUser();
    Dictionary<string, float> scores = user.Scores;

    foreach(var item in scores)
    {
        Console.WriteLine("type:{0}, socre:{1}", item.Key, item.Value);
    }

    Console.ReadKey();
}
```

结果

```
type:Chinese, socre:96.5
type:Math, socre:90.5
```

## 对于 Dictionary<> 调整后测试
 
体验了上面的简单正常版本。我们来开启作死之旅。如果我们把成绩字段这样添加：

- Server User.cs

```c#
/// <summary>
/// 成绩
/// </summary>
[DataMember]
public object Scores
{
    get;
    set;
}
```

其他的保持不变。这个时候启动服务是正常的。可是如果 Client 调用的话：

```c#
static void Main(string[] args)
{
    MS.ComplexServiceClient client = new MS.ComplexServiceClient();
    User user = client.GetUser();
    Dictionary<string, float> scores = user.Scores as Dictionary<string, float>;

    foreach(var item in scores)
    {
        Console.WriteLine("type:{0}, socre:{1}", item.Key, item.Value);
    }

    Console.ReadKey();
}
```

报错如下：

```
未经处理的异常:  System.ServiceModel.CommunicationException: 接收对 http://127.0
.0.1:18080/services/test 的 HTTP 响应时发生错误。这可能是由于服务终结点绑定未使
用 HTTP 协议造成的。这还可能是由于服务器中止了 HTTP 请求上下文(可能由于服务关闭)
所致。有关详细信息，请参见服务器日志。 ---> System.Net.WebException: 基础连接已
经关闭: 接收时发生错误。 ---> System.IO.IOException: 无法从传输连接中读取数据:
远程主机强迫关闭了一个现有的连接。。 ---> System.Net.Sockets.SocketException: 远
程主机强迫关闭了一个现有的连接。
...
```

因为我们为 User 类加的成绩属性是 object 类型，而我们在协定方法中给它赋的是 Dictionary<string, float> 类型，这样一来，就算可以序列化也不能被反序列化，因为 Dictionary<string, float> 无法识别。

这里直接给出结果。[这里](http://blog.csdn.net/tcjiaan/article/details/8198716) 查看详细过程。

- Server User.cs

只需要如此修改即可。

```c#
[DataContract]
[KnownType("GetKnowTypes")]  
public class User
{
    //...
    
    /// <summary>
    /// 成绩
    /// </summary>
    [DataMember]
    public object Scores
    {
        get;
        set;
    }

    static Type[] GetKnowTypes()
    {
        return new Type[] { typeof(Dictionary<string, float>) };
    } 
}
```

在一些比较复杂的类型无法反序列化（不能识别类型）的时候，就得考虑使用 `KnownTypeAttribute` 来标注可能涉及到的外部类型，但如果遇到像泛型这些较为复杂的类型，
就要考虑在带数据协定的类中添加一个静态方法，该方法返回 Type 的 IEnumerable，一般是 Type[] 就可以了，而在 KnownTypeAttribute 的构造函数中使用这个方法的名字。

(此处是为了学习。建议尽量不使用object这种类型。真的会存在不知道结构的类型吗？换言之你非要这么写的时候就是时候思考一下，是不是什么地方设计的有问题。)


* any list
{:toc}




