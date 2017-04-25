---
layout: post
title:  WCF-09-message intercept, modify
date:  2017-4-25 09:08:04 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---

# 基本概念

> [消息拦截与篡改](http://blog.csdn.net/tcjiaan/article/details/8274493)

我们知道，在WCF中，客户端对服务操作方法的每一次调用，都可以被看作是一条消息。

可能我们还会有一个疑问：如何知道客户端与服务器通讯过程中，期间发送和接收的SOAP是什么样子。

当然，也有人是通过借助其他工具来抓取数据包来查看。那，有没有办法让程序自己输出相应的SOAP信息呢？当然有，正式本文讨论主题。

说到**消息拦截**，这个你肯定可以理解，如果你不懂，你可以想一想电话窃听程序，我在你的手机上植入一种木马，可以截取你和MM的通话内容，其实这就是消息拦截。

WCF相关的API比较难寻找，我当初也找了N久，现在，我直接把思路和方法告诉各位，也免得大家太辛苦。

要对SOAP消息进行拦截和修改，我们需要实现两个接口，它们都位于 `System.ServiceModel.Dispatcher` （程序集System.ServiceModel）。下面分别价绍。

接口一：IClientMessageInspector

从名字中我们可以猜测，它是用来拦截客户消息的，而看看它的方法，你就更加肯定当初的猜测了。

- BeforeSendRequest：向服务器发送请求前拦截或修改消息（事前控制）

- AfterReceiveReply：接收到服务器的回复消息后，在调用返回之前拦截或修改消息（事后诸葛亮）

接口二：IDispatchMessageInspector

刚才那个接口是针对客户端的，而这个是针对服务器端的。

- AfterReceiveRequest：接收客户端请求后，在进入操作处理代码之前拦截或修改消息（欺上）

- BeforeSendReply：服务器向客户端发送回复消息之前拦截和修改消息（瞒下）。

虽然实现了这两个接口，但你会有新的疑问，怎么用？把它们放到哪儿才能拦截消息？

因此，下一步就是要实现 `IEndpointBehavior` 接口（System.ServiceModel.Description命名空间，程序集System.ServiceModel），它有四个方法，而我们只需要处理两个就够了。

下面是 [MSDN](https://msdn.microsoft.com/zh-cn/library/system.servicemodel.description.iendpointbehavior(v=vs.110).aspx) 的翻译版本说明：

使用 ApplyClientBehavior 方法可以在客户端应用程序中修改、检查或插入对终结点中的扩展。

使用 ApplyDispatchBehavior 方法可以在服务应用程序中修改、检查或插入对终结点范围执行的扩展。

说白了就是一个在客户拦截和修改消息，另一个在服务器端拦截和修改消息。

在实现这两个方法时，和前面我们实现的 IClientMessageInspector 和 IDispatchMessageInspector 联系起来就OK了。

做完了 IEndpointBehavior 的事情后，把它插入到服务终结点中就行了，无论是服务器端还是客户端，这一步都必须的，因为我们实现的拦截器是包括两个端的，
因此，较好的做法是把这些类写到一个**独立的类库**（dll）中，这样一来，服务器端和客户端都可以引用它。详见后面的示例。

# Simple Demo

一、创建一个DLL

引入 `System.ServiceModel`

- MessageLib.cs

```c#
namespace MessageLib
{
    /// <summary>  
    ///  消息拦截器  
    /// </summary>  
    public class MyMessageInspector : IClientMessageInspector, IDispatchMessageInspector
    {
        void IClientMessageInspector.AfterReceiveReply(ref Message reply, object correlationState)
        {
            Console.WriteLine("客户端接收到的回复：\n{0}", reply.ToString());
        }

        object IClientMessageInspector.BeforeSendRequest(ref Message request, IClientChannel channel)
        {
            Console.WriteLine("客户端发送请求前的SOAP消息：\n{0}", request.ToString());
            return null;
        }

        object IDispatchMessageInspector.AfterReceiveRequest(ref Message request, IClientChannel channel, InstanceContext instanceContext)
        {
            Console.WriteLine("服务器端：接收到的请求：\n{0}", request.ToString());
            return null;
        }

        void IDispatchMessageInspector.BeforeSendReply(ref Message reply, object correlationState)
        {
            Console.WriteLine("服务器即将作出以下回复：\n{0}", reply.ToString());
        }
    }

    /// <summary>  
    /// 插入到终结点的Behavior  
    /// </summary>  
    public class MyEndPointBehavior : IEndpointBehavior
    {
        public void AddBindingParameters(ServiceEndpoint endpoint, BindingParameterCollection bindingParameters)
        {
            // 不需要  
            return;
        }

        public void ApplyClientBehavior(ServiceEndpoint endpoint, ClientRuntime clientRuntime)
        {
            // 植入“偷听器”客户端  
            clientRuntime.ClientMessageInspectors.Add(new MyMessageInspector());
        }

        public void ApplyDispatchBehavior(ServiceEndpoint endpoint, EndpointDispatcher endpointDispatcher)
        {
            // 植入“偷听器” 服务器端  
            endpointDispatcher.DispatchRuntime.MessageInspectors.Add(new MyMessageInspector());
        }

        public void Validate(ServiceEndpoint endpoint)
        {
            // 不需要  
            return;
        }
    }  
}
```

二、Server

引入一创建的DLL。

- MessageModel.cs

```c#
namespace Server.Model
{
    [DataContract]
    public class Student
    {
        [DataMember]
        public string StudentName;
        [DataMember]
        public int StudentAge;
    }

    [MessageContract]
    public class CalcultRequest
    {
        [MessageHeader]
        public string Operation;
        [MessageBodyMember]
        public int NumberA;
        [MessageBodyMember]
        public int NumberB;
    }

    [MessageContract]
    public class CalResultResponse
    {
        [MessageBodyMember]
        public int ComputedResult;
    }  
}
```

- MessageService.cs

```c#
namespace Server.Service
{
    [ServiceContract(Namespace = "MyNamespace")]  
    public interface IMessageService  
    {  
        [OperationContract]  
        int AddInt(int a, int b);  
        [OperationContract]  
        Student GetStudent();  
        [OperationContract]  
        CalResultResponse ComputingNumbers(CalcultRequest inMsg);  
    }  
  
    [ServiceBehavior(IncludeExceptionDetailInFaults = true)]
    public class MessageService : IMessageService  
    {  
        public int AddInt(int a, int b)  
        {  
            return a + b;  
        }  
  
        public Student GetStudent()  
        {  
            Student stu = new Student();  
            stu.StudentName = "小明";  
            stu.StudentAge = 22;  
            return stu;  
        }  
  
        public CalResultResponse ComputingNumbers(CalcultRequest inMsg)  
        {  
            CalResultResponse rmsg = new CalResultResponse();  
            switch (inMsg.Operation)  
            {  
                case "加":  
                    rmsg.ComputedResult = inMsg.NumberA + inMsg.NumberB;  
                    break;  
                case "减":  
                    rmsg.ComputedResult = inMsg.NumberA - inMsg.NumberB;  
                    break;  
                case "乘":  
                    rmsg.ComputedResult = inMsg.NumberA * inMsg.NumberB;  
                    break;  
                case "除":  
                    rmsg.ComputedResult = inMsg.NumberA / inMsg.NumberB;  
                    break;  
                default:  
                    throw new ArgumentException("运算操作只允许加、减、乘、除。");  
            }  
            return rmsg;  
        }  
    }  
}
```

- Main()

```c#
static void Main(string[] args)
{
    // 服务器基址  
    Uri baseAddress = new Uri("http://127.0.0.1:18080/services");
    // 声明服务器主机  
    using (ServiceHost host = new ServiceHost(typeof(MessageService), baseAddress))
    {
        // 添加绑定和终结点  
        WSHttpBinding binding = new WSHttpBinding();

        host.AddServiceEndpoint(typeof(IMessageService), binding, "/test");

        // 添加服务描述  
        host.Description.Behaviors.Add(new ServiceMetadataBehavior { HttpGetEnabled = true });

        // 把自定义的IEndPointBehavior插入到终结点中  
        foreach (var endpont in host.Description.Endpoints)
        {
            endpont.EndpointBehaviors.Add(new MessageLib.MyEndPointBehavior());
        }

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

三、Client

引入一创建的DLL、Service 服务。

- Main()

```c#
static void Main(string[] args)
{
    MS.MessageServiceClient client = new MS.MessageServiceClient();

    // 记得在客户端也要插入IEndPointBehavior  
    client.Endpoint.EndpointBehaviors.Add(new MessageLib.MyEndPointBehavior());

    try
    {
        // 1、调用带元数据参数和返回值的操作  
        Console.WriteLine("\n20和35相加的结果是：{0}", client.AddInt(20, 35));
        
        // 2、调用带有数据协定的操作  
        MS.Student student = client.GetStudent();
        Console.WriteLine("\n学生信息---------------------------");
        Console.WriteLine("姓名：{0}\n年龄：{1}", student.StudentName, student.StudentAge);

        // 3、调用带消息协定的操作  
        Console.WriteLine("\n15乘以70的结果是：{0}", client.ComputingNumbers("乘", 15, 70));
    }
    catch (Exception ex)
    {
        Console.WriteLine("异常：{0}", ex.Message);
    }
    client.Close();  

    Console.ReadKey();
}
```

Main()方法中测试了三种类型。打印的LOG较多。此处选取**1、调用带元数据参数和返回值的操作**如下：

(其他如有兴趣，请自行测试)

```
客户端发送请求前的SOAP消息：
<s:Envelope xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:s="http://www.w
3.org/2003/05/soap-envelope">
  <s:Header>
    <a:Action s:mustUnderstand="1">MyNamespace/IMessageService/AddInt</a:Action>

    <a:MessageID>urn:uuid:6bbd15c8-dd25-463d-b5d5-4a0460213435</a:MessageID>
    <a:ReplyTo>
      <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
    </a:ReplyTo>
  </s:Header>
  <s:Body>
    <AddInt xmlns="MyNamespace">
      <a>20</a>
      <b>35</b>
    </AddInt>
  </s:Body>
</s:Envelope>
客户端接收到的回复：
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://ww
w.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oas
is-200401-wss-wssecurity-utility-1.0.xsd">
  <s:Header>
    <a:Action s:mustUnderstand="1" u:Id="_2">MyNamespace/IMessageService/AddIntR
esponse</a:Action>
    <a:RelatesTo u:Id="_3">urn:uuid:6bbd15c8-dd25-463d-b5d5-4a0460213435</a:Rela
tesTo>
    <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/200
4/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <u:Timestamp u:Id="uuid-6a634229-ab79-46c4-8d91-4b164993b2fa-17">
        <u:Created>2017-04-25T01:36:45.001Z</u:Created>
        <u:Expires>2017-04-25T01:41:45.001Z</u:Expires>
      </u:Timestamp>
      <c:DerivedKeyToken u:Id="uuid-6a634229-ab79-46c4-8d91-4b164993b2fa-15" xml
ns:c="http://schemas.xmlsoap.org/ws/2005/02/sc">
        <o:SecurityTokenReference>
          <o:Reference URI="urn:uuid:082d5f66-ea4c-4f40-82d1-e3c12b7239e0" Value
Type="http://schemas.xmlsoap.org/ws/2005/02/sc/sct" />
        </o:SecurityTokenReference>
        <c:Offset>0</c:Offset>
        <c:Length>24</c:Length>
        <c:Nonce>UvBWBKyPBtJKBssD5Q+nPg==</c:Nonce>
      </c:DerivedKeyToken>
      <c:DerivedKeyToken u:Id="uuid-6a634229-ab79-46c4-8d91-4b164993b2fa-16" xml
ns:c="http://schemas.xmlsoap.org/ws/2005/02/sc">
        <o:SecurityTokenReference>
          <o:Reference URI="urn:uuid:082d5f66-ea4c-4f40-82d1-e3c12b7239e0" Value
Type="http://schemas.xmlsoap.org/ws/2005/02/sc/sct" />
        </o:SecurityTokenReference>
        <c:Nonce>Y5C0z6cpxgr4ZSSbaq/VsQ==</c:Nonce>
      </c:DerivedKeyToken>
      <e:ReferenceList xmlns:e="http://www.w3.org/2001/04/xmlenc#">
        <e:DataReference URI="#_1" />
        <e:DataReference URI="#_4" />
      </e:ReferenceList>
      <e:EncryptedData Id="_4" Type="http://www.w3.org/2001/04/xmlenc#Element" x
mlns:e="http://www.w3.org/2001/04/xmlenc#">
        <e:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-c
bc" />
        <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
          <o:SecurityTokenReference>
            <o:Reference ValueType="http://schemas.xmlsoap.org/ws/2005/02/sc/dk"
 URI="#uuid-6a634229-ab79-46c4-8d91-4b164993b2fa-16" />
          </o:SecurityTokenReference>
        </KeyInfo>
        <e:CipherData>
          <e:CipherValue>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</e:CipherValue>
        </e:CipherData>
      </e:EncryptedData>
    </o:Security>
  </s:Header>
  <s:Body u:Id="_0">
    <AddIntResponse xmlns="MyNamespace">
      <AddIntResult>55</AddIntResult>
    </AddIntResponse>
  </s:Body>
</s:Envelope>

20和35相加的结果是：55
```


# Modify

其实当你可以看到内容时，修改他还会远吗？

一、修改 DLL

注意：在DLL中引入`System.Runtime.Serialization`

创建消息头时，第一个参数是名字，如上面的“u”，第二个参数是命名空间，这个可以自己来定义，比如上面的“valid”，第三个参数就是消息头的内容。

```c#
/// <summary>  
///  消息拦截器  
/// </summary>  
public class MyMessageInspector : IClientMessageInspector, IDispatchMessageInspector
{
    void IClientMessageInspector.AfterReceiveReply(ref Message reply, object correlationState)
    {
        //Console.WriteLine("客户端接收到的回复：\n{0}", reply.ToString());
    }

    object IClientMessageInspector.BeforeSendRequest(ref Message request, IClientChannel channel)
    {
        //Console.WriteLine("客户端发送请求前的SOAP消息：\n{0}", request.ToString());

        // 插入验证信息  
        MessageHeader username = MessageHeader.CreateHeader("u", "valid", "admin");
        MessageHeader password = MessageHeader.CreateHeader("p", "valid", "123");
        request.Headers.Add(username);
        request.Headers.Add(password);  

        return null;
    }

    object IDispatchMessageInspector.AfterReceiveRequest(ref Message request, IClientChannel channel, InstanceContext instanceContext)
    {
        //Console.WriteLine("服务器端：接收到的请求：\n{0}", request.ToString());
        // 检查验证信息  
        string username = request.Headers.GetHeader<string>("u", "valid");
        string password = request.Headers.GetHeader<string>("p", "valid");
        if ("admin".Equals(username)  && "123".Equals(password))
        {
            Console.WriteLine("用户名和密码正确。");
        }
        else
        {
            throw new Exception("验证失败，请重新输入！");
        }  

        return null;
    }

    void IDispatchMessageInspector.BeforeSendReply(ref Message reply, object correlationState)
    {
        //Console.WriteLine("服务器即将作出以下回复：\n{0}", reply.ToString());
    }
}
```

二、调用

重新编译调用。

- Client 

```
20和35相加的结果是：55

学生信息---------------------------
姓名：小明
年龄：22

15乘以70的结果是：1050

```

- Server

每一次调用，都会进行身份验证。

```
服务已启动。
用户名和密码正确。
用户名和密码正确。
用户名和密码正确。
```

* any list
{:toc}






