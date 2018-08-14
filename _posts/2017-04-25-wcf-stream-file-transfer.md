---
layout: post
title:  WCF-08-stream-file-transfer
date:  2017-04-25 07:29:38 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---


# TransferMode

如果你不喜欢用Socket来传文件，不妨试试WCF，WCF的流模式传输还是相当强大和相当实用的。

因为开启流模式是基于绑定的，所以，它会影响到整个终结点的操作协定。如果你不记得或者说不喜欢背书，不想去记住哪些绑定支持流模式，可以通过以下方法：

因为开启流模式，主要是设置一个叫 **TransferMode** 的属性，所以，你看看哪些 Binding 的派生类有这个属性就可以了。

TransferMode其实是一个举枚，看看它的几个有效值：

- Buffered：缓冲模式，说白了就是在内存中缓冲，一次调用就把整个消息读/写完，也就是我们最常用的方式，就是普通的操作协定的调用方式；

- StreamedRequest：只是在请求的时候使用流，说简单一点就是在传入方法的参数使用流，如 int MyMethod(System.IO.Stream stream);

- StreamedResponse：就是操作协定方法返回一个流，如 Stream MyMethod(string file_name);

一般而言，如果使用流作为传入参数，最好不要使用多个参数，如这样：

```c#
bool TransferFile(Stream stream, string name);
```

上面的方法就有了两个in参数了，最好别这样，为什么？有空的话，自己试试就知道了。那如果要传入更多的数据，怎么办？还记得[消息协定](https://houbb.github.io/2017/04/24/wcf-message-contract)吗？


# Simple Demo

好的，下面我们来弄一个上传 TXT 文件的实例。实例主要的工作是从客户端上传一个文件到服务器。


一、Server


- FileService.cs


```c#
namespace Server.Service
{
    [ServiceContract(Namespace = "MyNamespace")]
    public interface IFileService
    {
        [OperationContract]
        bool UpLoadFile(System.IO.Stream streamInput);
    }

    public class FileService : IFileService
    {

        public bool UpLoadFile(System.IO.Stream streamInput)
        {
            bool isSuccessed = false;
            try
            {
                using (FileStream outputStream = new FileStream("1.txt", FileMode.OpenOrCreate, FileAccess.Write))
                {
                    // 我们不用对两个流对象进行读写，只要复制流就OK  
                    streamInput.CopyTo(outputStream);
                    outputStream.Flush();
                    isSuccessed = true;
                    Console.WriteLine("在{0}接收到客户端发送的流，已保存到1.txt。", DateTime.Now.ToLongTimeString());
                }
            }
            catch
            {
                isSuccessed = false;
            }
            return isSuccessed;
        }


        public static void Exe()
        {
            // 服务器基址  
            Uri baseAddress = new Uri("http://localhost:8008/services");
            // 声明服务器主机  
            using (ServiceHost host = new ServiceHost(typeof(FileService), baseAddress))
            {
                // 添加绑定和终结点  
                BasicHttpBinding binding = new BasicHttpBinding();
                // 启用流模式  
                binding.TransferMode = TransferMode.StreamedRequest;
                binding.MaxBufferSize = 1024;
                // 接收消息的最大范围为500M  
                binding.MaxReceivedMessageSize = 500 * 1024 * 1024;
                host.AddServiceEndpoint(typeof(IFileService), binding, "/test");
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
    }  
}
```


二、Client

添加【服务引用】

- Form

![client](https://raw.githubusercontent.com/houbb/resource/master/img/network/wcf/2017-04-25-wcf-file-client.png)

- Code

```c#
public partial class Form1 : Form
{
    public Form1()
    {
        InitializeComponent();
    }

    private void Form1_Load(object sender, EventArgs e)
    {

    }

    /// <summary>
    /// 选择文件
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void button1_Click(object sender, EventArgs e)
    {
        OpenFileDialog dlg = new OpenFileDialog();
        dlg.Filter = "文本文件|*.txt";
        if (DialogResult.OK.Equals(dlg.ShowDialog()))
        {
            this.label1.Text = dlg.FileName;
            this.label2.Text = "准备就绪。";
        }  
    }

    /// <summary>
    /// 文件传输
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void button2_Click(object sender, EventArgs e)
    {
        string filePath = this.label1.Text;
        if (!File.Exists(filePath))
        {
            return;
        }

        FileStream fs = new FileStream(this.label1.Text, FileMode.Open, FileAccess.Read);
        MS.FileServiceClient client = new MS.FileServiceClient();

        this.button2.Enabled = false;
        bool res = client.UpLoadFile(fs);
        this.button2.Enabled = true;
        if (res == true)
            this.label2.Text = "上传完成。";  
    }

}
```


三、结果

随便找个文件上传。最后可以在 `Visual Studio 2013\Projects\WcfServiceDemo\Server\bin\Release` 路径下找到复制的文件。


# File Extra

现在又希望上面的例子多一个功能，文件上传后，依然按客户端原文件命名，而不是 `1.txt` ，这就意味着操作方法要传两个参数，前面我提了一下，不要忘了**消息协定**，而这个我们可以通过消息协定来完成。

因此，服务器端代码要改一改了，首先，定义一个消息协定。




一、Server

首先，定义一个消息协定。

- FileExModel.cs

```c#
namespace Server.Model
{

    [MessageContract]
    public class TransferFileMessage
    {
        [MessageHeader]
        public string FileName; //文件名  
       
        [MessageBodyMember]
        public Stream FileStream; //文件流  
    }


    [MessageContract]
    public class ResultMessage
    {
        /// <summary>
        /// 错误信息
        /// </summary>
        [MessageHeader]
        public string ErrorMessage;

        /// <summary>
        /// 是否成功
        /// </summary>
        [MessageBodyMember]
        public bool IsSuccessed;
    }  

}
```

- FileExService.cs

```c#
public interface IFileExService
{
    [OperationContract]
    ResultMessage UpLoadFile(TransferFileMessage fileMessage);
}

public class FileExService : IFileExService
{

    public ResultMessage UpLoadFile(TransferFileMessage fileMessage)
    {
        ResultMessage result = new ResultMessage();
        bool isSuccessed = false;
        try
        {
            string fileName = fileMessage.FileName;
            Stream fileStream = fileMessage.FileStream;

            using (FileStream outputStream = new FileStream(fileName, FileMode.OpenOrCreate, FileAccess.Write))
            {
                // 我们不用对两个流对象进行读写，只要复制流就OK  
                fileStream.CopyTo(outputStream);
                outputStream.Flush();
                isSuccessed = true;
                Console.WriteLine("在{0}接收到客户端发送的流，已保存到{1}",
                    DateTime.Now.ToLongTimeString(), fileName);
            }
        }
        catch(Exception ex)
        {

            isSuccessed = false;
            result.ErrorMessage = ex.Message;
        }
        result.IsSuccessed = isSuccessed;
        return result;
    }
    
}
```

<label class="label label-warning">Warn</label>

1. 也许你注意到了 **UpLoadFile()** 方法的返回值也变了。为什么呢？

如果保持原来的bool类型。启动时会报错如下:

```
无法加载操作“UpLoadFile”，因为它具有类型为 System.ServiceModel.Channels.Messag
e 的参数或返回类型，或具有一个带有 MessageContractAttribute 及其他不同类型参数的
类型。当使用 System.ServiceModel.Channels.Message 或具有 MessageContractAttribut
e 的类型时，方法不应使用任何其他参数类型。
```


问题就在于我们使用了消息协定，在这种前提下，我们的方法就不能随便定义了，使用消息协定的方法，如果：

a、消息协定作为传入参数，则只能有一个参数，以下定义是错误的：

```c#
void Reconcile(BankingTransaction bt1, BankingTransaction bt2);
```

b、除非你返回值为void，如不是，那你**必须返回一个消息协定**。




* any list
{:toc}
