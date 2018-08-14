---
layout: post
title:  WCF-07-message contract
date:  2017-04-24 22:52:37 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---


# Message Contract

> [消息协定](https://msdn.microsoft.com/zh-cn/library/ms751464(v=vs.110).aspx)


# Simple Demo

消息协定的定义和数据协定很像，也是先写一个类，然后附加MessageContractAttribute，而对于类的成员（字段或属性，不管是公共的还是私有的）可以附加MessageHeaderAttribute或MessageBodyMemberAttribute。

其实，MessageHeaderAttribute与MessageBodyMemberAttribute并没有根本的区别，只是一个是消息头，一个是消息正文罢了，这只是针对SOAP消息而言。

- Client MessageModel.cs

```c#
[MessageContract]  
public class CarMessage  
{  
    [MessageBodyMember]  
    public string CarName;  
    [MessageBodyMember]  
    public int MakeYear;  
    [MessageBodyMember]  
    public string SerType;  
}  
  
[MessageContract]  
public class Person  
{  
    [MessageHeader]  
    public string Zip { get; set; }  
    [MessageHeader]  
    public string Address;  
  
    [MessageBodyMember]  
    public int Age { get; set; }  
    [MessageBodyMember]  
    public string Name { get; set; }  
    [MessageBodyMember]  
    public string Email { get; set; }  
}  
 
#region 输入输出消息协定  
[MessageContract]  
public class RequrestMessage  
{  
    [MessageHeader]  
    public int maxNum;  
    [MessageBodyMember]  
    public string CheckName;  
}  
  
[MessageContract]  
public class ResponseMessage  
{  
    [MessageBodyMember]  
    public string Name;  
    [MessageBodyMember]  
    public int CheckResult;  
}  
#endregion 
```

- Client MessageService.cs

```c#
[ServiceContract]  
public interface IService  
{  
    [OperationContract]  
    void PostMessage(CarMessage msg);  
  
    [OperationContract]  
    Person GetPerson();  
  
    [OperationContract]  
    ResponseMessage CheckRenpin(RequrestMessage rqmsg);  
}  
  
public class MyService : IService  
{  
    public void PostMessage(CarMessage msg)  
    {  
        Console.WriteLine("车子名字：{0}", msg.CarName);  
    }  
  
  
    public Person GetPerson()  
    {  
        Person ps = new Person();  
        ps.Name = "鸟人";  
        ps.Age = 107;  
        ps.Email = "nb@niube.com";  
        ps.Zip = "990";  
        ps.Address = "非洲";  
        return ps;  
    }  
  
  
    public ResponseMessage CheckRenpin(RequrestMessage rqmsg)  
    {  
        ResponseMessage respMsg = new ResponseMessage();  
        Random rand = new Random();  
        respMsg.CheckResult = rand.Next(rqmsg.maxNum);  
        respMsg.Name = rqmsg.CheckName;  
        return respMsg;  
    }  
}  
```

到到客户端时。代码会变成：

![service contract](https://raw.githubusercontent.com/houbb/resource/master/img/network/wcf/2017-04-24-message-contract.png)


我们看到，在服务器端定义的消息协定类，在客户端代码中，类的成员都被拆开了。这样就得出这样一个结论：

**作为操作协定的输入消息协定（作为参数）封装了操作方法的所有in参数；作为操作协定的返回值的消息协定（return）封装了out参数和返回值。**


# With Data Contract

演示一个 Service Contract，与 Data Contract 共同使用的例子。


- Server MessageModel.cs

```c#
//...

#region 包含数据协定的消息协定  
[DataContract]  
public class ArtistInfo  
{  
    [DataMember]  
    public string ArtistName;  
    [DataMember]  
    public DateTime CreateTime;  
}  
  
[MessageContract]  
public class Worker  
{  
    [MessageHeader]  
    public ArtistInfo WorkerArtist;  
    [MessageBodyMember]  
    public string WorkerName;  
    [MessageBodyMember]  
    public string WorkerNo;  
    [MessageBodyMember]  
    public int WorkerAge;  
}  
#endregion  
```

- Server MessageService.cs

```c#
//...

[OperationContract]  
void SetWorkerInformation(Worker wk); 

//...
public void SetWorkerInformation(Worker wk)  
{  
    Console.WriteLine("工作名字：{0}",wk.WorkerName);  
    ArtistInfo info = wk.WorkerArtist;  
    Console.WriteLine("工人作品创建时间：{0}", info.CreateTime.ToString("yyyy-MM-dd HH:mm:ss"));  
    Console.WriteLine("工人作品名字：{0}", info.ArtistName);  
}  
```


- Client Main()

```c#
static void Main(string[] args)
{
    MS.ServiceClient client = new MS.ServiceClient();

    MS.ArtistInfo info = new MS.ArtistInfo
    {
        ArtistName = "高级垃圾",
        CreateTime = new DateTime(2018, 7, 17)
    };
    client.SetWorkerInformation(info, 180, "老妖", "NB-117");  

    Console.ReadKey();
}
```

result (in server console)
 
```
服务已启动。
工作名字：老妖
工人作品创建时间：2018-07-17 00:00:00
工人作品名字：高级垃圾
```

* any list
{:toc}

