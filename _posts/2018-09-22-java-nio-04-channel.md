---
layout: post
title:  Java NIO-04-Channel
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, nio, java-base, sf]
published: true
---

# Channel

## vs 流

Java NIO Channel通道和流非常相似，主要有以下几点区别：

1. 通道可以读也可以写，流一般来说是单向的（只能读或者写）。

2. 通道可以异步读写。

3. 通道总是基于缓冲区Buffer来读写。

## 实现

Channel 的实现（Channel Implementations）

下面列出Java NIO中最重要的集中Channel的实现：

- FileChannel

FileChannel 用于文件的数据读写。

- DatagramChannel

DatagramChannel 用于 UDP 的数据读写。

- SocketChannel & ServerSocketChannel
 
ServerSocketChannel允许我们监听TCP链接请求，每个请求会创建会一个SocketChannel。

# 拓展阅读

[nio buffer](https://houbb.github.io/2018/09/22/java-nio-05-buffer)

# FileChannel

Java NIO中的FileChannel是用于连接文件的通道。

通过文件通道可以读、写文件的数据。Java NIO的FileChannel是相对标准Java IO API的可选接口。

FileChannel不可以设置为非阻塞模式，他只能在阻塞模式下运行。

## 基本方法

### 打开文件通道

在使用FileChannel前必须打开通道，打开一个文件通道需要通过输入/输出流或者RandomAccessFile，

下面是通过RandomAccessFile打开文件通道的案例：

```java
RandomAccessFile aFile = new RandomAccessFile("data/nio-data.txt", "rw");
FileChannel inChannel = aFile.getChannel();
```

### 从文件通道内读取数据

```java
ByteBuffer buf = ByteBuffer.allocate(48);
int bytesRead = inChannel.read(buf);
```

首先开辟一个Buffer，从通道中读取的数据会写入Buffer内。

接着就可以调用read方法，read的返回值代表有多少字节被写入了Buffer，返回-1则表示已经读取到文件结尾了。

### 向文件通道写入数据

写数据用write方法，入参是Buffer：

```java
String newData = "New String to write to file..." + System.currentTimeMillis();

ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();
buf.put(newData.getBytes());

buf.flip();

while(buf.hasRemaining()) {
    channel.write(buf);
}
```

### 关闭通道

操作完毕后，需要把通道关闭：

```java
channel.close();    
```

### Position

当操作FileChannel的时候读和写都是基于特定起始位置的（position），获取当前的位置可以用FileChannel的position()方法，设置当前位置可以用带参数的position(long pos)方法。

```java
long pos channel.position();
channel.position(pos + 123);
```

假设我们把当前位置设置为文件结尾之后，那么当我们视图从通道中读取数据时就会发现返回值是-1，表示已经到达文件结尾了。 

如果把当前位置设置为文件结尾之后，在想通道中写入数据，文件会自动扩展以便写入数据，但是这样会导致文件中出现类似空洞，即文件的一些位置是没有数据的。

### Size

size() 方法可以返回FileChannel对应的文件的文件大小：

```java
long fileSize = channel.size();    
```

### Truncate

利用 truncate() 可以截取指定长度的文件：

```java
channel.truncate(1024);
```

### Force

force方法会把所有未写磁盘的数据都强制写入磁盘。

这是因为在操作系统中出于性能考虑回把数据放入缓冲区，所以不能保证数据在调用write写入文件通道后就及时写到磁盘上了，除非手动调用force方法。 

force方法需要一个布尔参数，代表是否把meta data也一并强制写入。

```java
channel.force(true);
```

## 实战代码

- 传统方式复制

```java
/**
 * io 方式复制文件
 *
 * @param source 源文件
 * @param target 目标文件
 */
public static void copyFileIO(File source, File target) {
    try (InputStream inputStream = new BufferedInputStream(new FileInputStream(source));
         OutputStream outputStream = new BufferedOutputStream(new FileOutputStream(target))) {
        byte[] bytes = new byte[1024];
        int i;
        //读取到输入流数据，然后写入到输出流中去，实现复制
        while ((i = inputStream.read(bytes)) != -1) {
            outputStream.write(bytes, 0, i);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

- nio 方式复制

```java
/**
 * nio 方式复制文件
 *
 * @param source 源文件
 * @param target 目标文件
 */
public static void copyFileNio(File source, File target) {
    try (FileInputStream inputStream = new FileInputStream(source);
         FileOutputStream outputStream = new FileOutputStream(target);
         FileChannel fileChannelInput = inputStream.getChannel();
         FileChannel fileChannelOutput = outputStream.getChannel();
    ) {
        //将fileChannelInput通道的数据，写入到fileChannelOutput通道
        fileChannelInput.transferTo(0, fileChannelInput.size(), fileChannelOutput);
    } catch (Exception e) {
        e.printStackTrace();
    }
}    
```


# SocketChannel

在Java NIO体系中，SocketChannel是用于TCP网络连接的套接字接口，相当于Java网络编程中的Socket套接字接口。

创建SocketChannel主要有两种方式，如下：

1. 打开一个SocketChannel并连接网络上的一台服务器。

2. 当ServerSocketChannel接收到一个连接请求时，会创建一个SocketChannel。

## 创建

```java
SocketChannel socketChannel = SocketChannel.open();
socketChannel.connect(new InetSocketAddress("localhost", 18888));  
```

## 关闭

关闭一个SocketChannel只需要调用他的close方法，如下：

```java
socketChannel.close();
```

## 读数据

从一个SocketChannel连接中读取数据，可以通过read()方法，如下：

```java
ByteBuffer buf = ByteBuffer.allocate(48);
int bytesRead = socketChannel.read(buf);
```

首先需要开辟一个Buffer。从SocketChannel中读取的数据将放到Buffer中。

接下来就是调用SocketChannel的read()方法.这个read()会把通道中的数据读到Buffer中。

read()方法的返回值是一个int数据，代表此次有多少字节的数据被写入了Buffer中。

如果返回的是-1,那么意味着通道内的数据已经读取完毕，到底了（链接关闭）。

## 写数据

向SocketChannel中写入数据是通过write()方法，write也需要一个Buffer作为参数。下面看一下具体的示例：

```java
String newData = "New String to write to file...";

ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();
buf.put(newData.getBytes());
buf.flip();

while(buf.hasRemaining()) {
    channel.write(buf);
}
```

仔细观察代码，这里我们把write()的调用放在了while循环中。

这是因为我们无法保证在write的时候实际写入了多少字节的数据，因此我们通过一个循环操作，不断把Buffer中数据写入到SocketChannel中知道Buffer中的数据全部写入为止。

## 非阻塞模式

我们可以吧SocketChannel设置为non-blocking（非阻塞）模式。这样的话在调用connect(), read(), write()时都是异步的。

### connect()

如果我们设置了一个SocketChannel是非阻塞的，那么调用connect()后，方法会在链接建立前就直接返回。

为了检查当前链接是否建立成功，我们可以调用 `finishConnect()`, 如下：

```java
socketChannel.configureBlocking(false);
socketChannel.connect(new InetSocketAddress("localhost", 18888));

while(! socketChannel.finishConnect() ){
    //wait, or do something else...    
}
```

### write()

在非阻塞模式下，调用write()方法不能确保方法返回后写入操作一定得到了执行。

因此我们需要把write()调用放到循环内。这和前面在讲write()时是一样的，此处就不在代码演示。

### read()

在非阻塞模式下，调用read()方法也不能确保方法返回后，确实读到了数据。

因此我们需要自己检查的整型返回值，这个返回值会告诉我们实际读取了多少字节的数据。

# ServerSocketChannel

在Java NIO中，ServerSocketChannel是用于监听TCP链接请求的通道，正如Java网络编程中的ServerSocket一样。

## 打开

打开一个ServerSocketChannel我们需要调用他的open()方法，例如：

```java
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
```

## 关闭

关闭一个ServerSocketChannel我们需要调用他的close()方法，例如：

```java
serverSocketChannel.close();
```

## 监听链接

通过调用accept()方法，我们就开始监听端口上的请求连接。

当accept()返回时，他会返回一个SocketChannel连接实例，实际上accept()是阻塞操作，他会阻塞带去线程知道返回一个连接； 

很多时候我们是不满足于监听一个连接的，因此我们会把accept()的调用放到循环中，就像这样：

```java
while(true){
    SocketChannel socketChannel = serverSocketChannel.accept();
    //do something with socketChannel...
}
```

## 非阻塞模式

实际上ServerSocketChannel是可以设置为非阻塞模式的。

在非阻塞模式下，调用accept()函数会立刻返回，如果当前没有请求的链接，那么返回值为空null。

因此我们需要手动检查返回的SocketChannel是否为空，例如：

```java
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
serverSocketChannel.socket().bind(new InetSocketAddress(9999));
serverSocketChannel.configureBlocking(false);

while(true){
    SocketChannel socketChannel = serverSocketChannel.accept();

    if(socketChannel != null){
        //do something with socketChannel...
    }
}
```

## 实战代码

- NioServer

```java
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

public class NioServer {

    /**
     * 通道管理器
     */
    private Selector selector;

    /**
     * initServer方法中:
     * 1.创建Selector
     * 2.Channelr注册到Selector
     * @param port
     * @throws Exception
     */
    public void initServer(int port) throws Exception {
        // 获得一个ServerSocket通道
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        // 设置通道为非阻塞
        serverChannel.configureBlocking(false);
        // 将该通道对于的serverSocket绑定到port端口
        serverChannel.socket().bind(new InetSocketAddress(port));
        // 获得一个通道管理器(选择器)
        this.selector = Selector.open();
        /*
         * 将通道管理器和该通道绑定，并为该通道注册selectionKey.OP_ACCEPT事件
         * 注册该事件后，当事件到达的时候，selector.select()会返回，
         * 如果事件没有到达selector.select()会一直阻塞
         */
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
    }

    /**
     * 采用轮训的方式监听selector上是否有需要处理的事件，如果有，进行处理
     */
    public void listen() throws Exception {
        System.out.println("start server");
        // 轮询访问selector
        while (true) {
            // 当注册事件到达时，方法返回，否则该方法会一直阻塞
            selector.select();
            // 获得selector中选中的相的迭代器，选中的相为注册的事件
            Iterator ite = this.selector.selectedKeys().iterator();
            while (ite.hasNext()) {
                SelectionKey key = (SelectionKey) ite.next();
                // 删除已选的key以防重负处理
                ite.remove();
                // 客户端请求连接事件
                if (key.isAcceptable()) {
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    // 获得和客户端连接的通道
                    SocketChannel channel = server.accept();
                    // 设置成非阻塞
                    channel.configureBlocking(false);
                    // 在这里可以发送消息给客户端
                    channel.write(ByteBuffer.wrap("hello client".getBytes()));
                    // 在客户端连接成功之后，为了可以接收到客户端的信息，需要给通道设置读的权限
                    channel.register(this.selector, SelectionKey.OP_READ);
                    // 获得了可读的事件
                } else if (key.isReadable()) {
                    read(key);
                }
            }
        }
    }

    /**
     * 处理读取客户端发来的信息事件
     */
    private void read(SelectionKey key) throws Exception {
        // 服务器可读消息，得到事件发生的socket通道
        SocketChannel channel = (SocketChannel) key.channel();
        // 读取的缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(16);
        channel.read(buffer);
        byte[] data = buffer.array();
        String msg = new String(data).trim();
        buffer.flip();
        System.out.println("Server receive from client: " + msg);
        ByteBuffer outBuffer = ByteBuffer.wrap(msg.getBytes());
        channel.write(outBuffer);
    }

    public static void main(String[] args) throws Throwable {
        NioServer server = new NioServer();
        server.initServer(8989);
        server.listen();
    }
}
```

- NioClient

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

public class NioClient {

    // 通道管理器
    private Selector selector;

    /**
     * 获得一个Socket通道，并对该通道做一些初始化的工作
     * @param address 连接服务器ip
     * @param port 连接服务器端口
     * @throws IOException
     */
    public void initClient(String address, int port) throws IOException {
        // 获得一个Socket通道
        SocketChannel channel = SocketChannel.open();
        // 设置通道为非阻塞
        channel.configureBlocking(false);
        // 获得一个通道管理器
        this.selector = Selector.open();
        // 用channel.finishConnect();才能完成连接
        // 客户端连接服务器,其实方法执行并没有实现连接，需要在listen()方法中调
        channel.connect(new InetSocketAddress(address, port));
        // 将通道管理器和该通道绑定，并为该通道注册SelectionKey.OP_CONNECT事件
        channel.register(selector, SelectionKey.OP_CONNECT);
    }

    /**
     * 采用轮询的方式监听selector上是否有需要处理的事件，如果有，则进行处理
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public void listen() throws Exception {
        // 轮询访问selector
        while (true) {
            /*
             * 选择一组可以进行I/O操作的事件，放在selector中,客户端的该方法不会阻塞，
             * selector的wakeup方法被调用，方法返回，而对于客户端来说，通道一直是被选中的
             * 这里和服务端的方法不一样，查看api注释可以知道，当至少一个通道被选中时。
             */
            selector.select();
            // 获得selector中选中的项的迭代器
            Iterator ite = this.selector.selectedKeys().iterator();
            while (ite.hasNext()) {
                SelectionKey key = (SelectionKey) ite.next();
                // 删除已选的key，以防重复处理
                ite.remove();
                // 连接事件发生
                if (key.isConnectable()) {
                    // 如果正在连接，则完成连接
                    SocketChannel channel = (SocketChannel) key.channel();
                    if (channel.isConnectionPending()) {
                        channel.finishConnect();
                    }
                    // 设置成非阻塞
                    channel.configureBlocking(false);
                    // 在这里可以给服务端发送信息哦
                    channel.write(ByteBuffer.wrap("hello server!".getBytes()));
                    // 在和服务端连接成功之后，为了可以接收到服务端的信息，需要给通道设置读的权限。
                    // 获得了可读的事件
                    channel.register(this.selector, SelectionKey.OP_READ);
                } else if (key.isReadable()) {
                    read(key);
                }
            }
        }
    }

    private void read(SelectionKey key) throws Exception {
        SocketChannel channel = (SocketChannel) key.channel();
        // 分配缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(16);
        channel.read(buffer);
        byte[] data = buffer.array();
        String msg = new String(data).trim();
        buffer.flip();
        System.out.println("Client receive msg from server:" + msg);
        ByteBuffer outBuffer = ByteBuffer.wrap(msg.getBytes());
        channel.write(outBuffer);
    }

    public static void main(String[] args) throws Exception {
        NioClient client = new NioClient();
        client.initClient("localhost", 8989);
        client.listen();
    }
}
```

# DatagramChannel

一个 Java NIO DatagramChannel 是一个可以发送、接收UDP数据包的通道。

由于UDP是面向无连接的网络协议，我们不可用像使用其他通道一样直接进行读写数据。正确的做法是发送、接收数据包。

## 打开

```java
DatagramChannel channel = DatagramChannel.open();
channel.socket().bind(new InetSocketAddress(9999));
```

## 接收

接收数据，直接调用DatagramChannel的receive()方法：

```java
ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();

channel.receive(buf);
```

receive()方法会把接收到的数据包中的数据拷贝至给定的Buffer中。

如果数据包的内容超过了Buffer的大小，剩余的数据会被**直接丢弃**。

## 发送

发送数据是通过DatagramChannel的send()方法：

```java
String newData = "New String to wrte to file...";
ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();
buf.put(newData.getBytes());
buf.flip();

int byteSent = channel.send(buf, new InetSocketAddress("localhsot", 1888));
```

上述示例会吧一个字符串发送到“localhsot”服务器的UDP端口1888。

目前这个端口没有被任何程序监听，所以什么都不会发生。

当发送了数据后，我们不会收到数据包是否被接收的的通知，这是由于UDP本身不保证任何数据的发送问题。

## 链接特定机器地址

DatagramChannel实际上是可以指定到网络中的特定地址的。

由于UDP是面向无连接的，这种链接方式并不会创建实际的连接，这和TCP通道类似。

确切的说，他会锁定DatagramChannel,这样我们就只能通过特定的地址来收发数据包。

```java
channel.connect(new InetSocketAddress("localhsot", 1888));
```

当连接上后，可以向使用传统的通道那样调用read()和Writer()方法。区别是数据的读写情况得不到保证。

下面示例：

```java
int bytesRead = channel.read(buf);    
int bytesWritten = channel.write(buf);
```

## 代码实战

- UDPServer

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.DatagramChannel;

public class UDPServer {

    public static void main(String[] args) throws IOException {
        // 获取通道
        DatagramChannel datagramChannel = DatagramChannel.open();
        // 绑定端口
        datagramChannel.bind(new InetSocketAddress(8989));
        // 分配Buffer
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        byte b[];
        while(true) {
            // 清空Buffer
            buffer.clear();
            // 接受客户端发送数据
            SocketAddress socketAddress = datagramChannel.receive(buffer);
            if (socketAddress != null) {
                int position = buffer.position();
                b = new byte[position];
                buffer.flip();
                for(int i=0; i<position; ++i) {
                    b[i] = buffer.get();
                }
                System.out.println("receive remote " +  socketAddress.toString() + ":"  + new String(b, "UTF-8"));
                //接收到消息后给发送方回应
                sendReback(socketAddress,datagramChannel);
            }
        }
    }

    public static void sendReback(SocketAddress socketAddress, DatagramChannel datagramChannel) throws IOException {
        String message = "I has receive your message";
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        buffer.put(message.getBytes("UTF-8"));
        buffer.flip();
        datagramChannel.send(buffer, socketAddress);
    }
}
```

- UDPClient

```java
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.DatagramChannel;
import java.util.Scanner;

public class UDPClient {

    public static void main(String[] args) throws IOException {

        final DatagramChannel channel = DatagramChannel.open();
        //接收消息线程
        new Thread(new Runnable() {
            @Override
            public void run() {
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                byte b[];
                while(true) {
                    buffer.clear();
                    SocketAddress socketAddress = null;
                    try {
                        socketAddress = channel.receive(buffer);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    if (socketAddress != null) {
                        int position = buffer.position();
                        b = new byte[position];
                        buffer.flip();
                        for(int i=0; i<position; ++i) {
                            b[i] = buffer.get();
                        }
                        try {
                            System.out.println("receive remote " +  socketAddress.toString() + ":"  + new String(b, "UTF-8"));
                        } catch (UnsupportedEncodingException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }).start();;

        //发送控制台输入消息
        while (true) {
            Scanner sc = new Scanner(System.in);
            String next = sc.next();
            try {
                sendMessage(channel, next);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void sendMessage(DatagramChannel channel, String mes) throws IOException {
        if (mes == null || mes.isEmpty()) {
            return;
        }
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        buffer.clear();
        buffer.put(mes.getBytes("UTF-8"));
        buffer.flip();
        System.out.println("send msg:" + mes);
        int send = channel.send(buffer, new InetSocketAddress("localhost",8989));
    }
}
```

# AsynchronousFileChannel

AsynchronousFileChannel使得数据可以进行异步读写。

## 创建

```java
Path path = Paths.get("data/test.xml");
AsynchronousFileChannel fileChannel = AsynchronousFileChannel.open(path, StandardOpenOption.READ);
```

open()的第一个参数是一个Path实体，指向我们需要操作的文件。 

第二个参数是操作类型。上述示例中我们用的是StandardOpenOption.READ，表示以读的形式操作文件。

## 读取数据

读取AsynchronousFileChannel的数据有两种方式。

每种方法都会调用AsynchronousFileChannel的一个read()接口。

### 通过Future读取数据

```java
Future<Integer> operation = fileChannel.read(buffer, 0);
```

这种方式中，read()接受一个ByteBuffer座位第一个参数，数据会被读取到ByteBuffer中。第二个参数是开始读取数据的位置。

read()方法会立刻返回，即使读操作没有完成。我们可以通过isDone()方法检查操作是否完成。

下面是一个略长的示例：

```java
AsynchronousFileChannel fileChannel = AsynchronousFileChannel.open(path, StandardOpenOption.READ);
ByteBuffer buffer = ByteBuffer.allocate(1024);
long position = 0;

Future<Integer> operation = fileChannel.read(buffer, position);

while(!operation.isDone()) {
    //wait
}

buffer.flip();
byte[] data = new byte[buffer.limit()];
buffer.get(data);
System.out.println(new String(data));
buffer.clear();
```

在这个例子中我们创建了一个AsynchronousFileChannel，然后创建一个ByteBuffer作为参数传给read。

接着我们创建了一个循环来检查是否读取完毕isDone()。

这里的循环操作比较低效，它的意思是我们需要等待读取动作完成。

一旦读取完成后，我们就可以把数据写入ByteBuffer，然后输出。

### 通过CompletionHandler读取数据

这里，一旦读取完成，将会触发CompletionHandler的completed()方法，并传入一个Integer和ByteBuffer。

前面的整形表示的是读取到的字节数大小。

第二个ByteBuffer也可以换成其他合适的对象方便数据写入。 如果读取操作失败了，那么会触发failed()方法。

```java
fileChannel.read(buffer, position, buffer, new CompletionHandler<Integer, ByteBuffer>() {
    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        System.out.println("result = " + result);

        attachment.flip();
        byte[] data = new byte[attachment.limit()];
        attachment.get(data);
        System.out.println(new String(data));
        attachment.clear();
    }

    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {

    }
});
```

## 写数据

和读数据类似某些数据也有两种方式，调动不同的的write()方法。

### 通过Future写数据

```java
Path path = Paths.get("data/test-write.txt");
AsynchronousFileChannel fileChannel = AsynchronousFileChannel.open(path, StandardOpenOption.WRITE);

ByteBuffer buffer = ByteBuffer.allocate(1024);
long position = 0;

buffer.put("test data".getBytes());
buffer.flip();

Future<Integer> operation = fileChannel.write(buffer, position);
buffer.clear();

while(!operation.isDone()) {
    // wait
}
System.out.println("Write done");
```

首先把文件已写方式打开，接着创建一个ByteBuffer座位写入数据的目的地。再把数据进入ByteBuffer。

最后检查一下是否写入完成。 

需要注意的是，这里的文件必须是已经存在的，否者在尝试write数据是会抛出一个java.nio.file.NoSuchFileException.

### 通过CompletionHandler写数据

同样当数据吸入完成后completed()会被调用，如果失败了那么failed()会被调用。

```java
Path path = Paths.get("data/test-write.txt");
if(!Files.exists(path)){
    Files.createFile(path);
}
AsynchronousFileChannel fileChannel = AsynchronousFileChannel.open(path, StandardOpenOption.WRITE);

ByteBuffer buffer = ByteBuffer.allocate(1024);
long position = 0;

buffer.put("test data".getBytes());
buffer.flip();

fileChannel.write(buffer, position, buffer, new CompletionHandler<Integer, ByteBuffer>() {

    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        System.out.println("bytes written: " + result);
    }

    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        System.out.println("Write failed");
        exc.printStackTrace();
    }
});
```

# 通道传输接口

在Java NIO中如果一个channel是FileChannel类型的，那么他可以直接把数据传输到另一个channel。

这个特性得益于 FileChannel 包含的 `transferTo()` 和 `transferFrom()` 两个方法。

## transferFrom

FileChannel.transferFrom方法把数据从通道源传输到FileChannel：

```java
RandomAccessFile fromFile = new RandomAccessFile("fromFile.txt", "rw");
FileChannel      fromChannel = fromFile.getChannel();

RandomAccessFile toFile = new RandomAccessFile("toFile.txt", "rw");
FileChannel      toChannel = toFile.getChannel();

long position = 0;
long count    = fromChannel.size();

toChannel.transferFrom(fromChannel, position, count);
```

transferFrom的参数position和count表示目标文件的写入位置和最多写入的数据量。如

果通道源的数据小于count那么就传实际有的数据量。 

另外，有些SocketChannel的实现在传输时只会传输哪些处于就绪状态的数据，即使SocketChannel后续会有更多可用数据。

因此，这个传输过程可能不会传输整个的数据。

## transferTo

transferTo方法把FileChannel数据传输到另一个channel,下面是案例：

```java
RandomAccessFile fromFile = new RandomAccessFile("fromFile.txt", "rw");
FileChannel      fromChannel = fromFile.getChannel();

RandomAccessFile toFile = new RandomAccessFile("toFile.txt", "rw");
FileChannel      toChannel = toFile.getChannel();

long position = 0;
long count    = fromChannel.size();

fromChannel.transferTo(position, count, toChannel);
```

这段代码和之前介绍transfer时的代码非常相似，区别只在于调用方法的是哪个FileChannel.

SocketChannel的问题也存在与transferTo.SocketChannel的实现可能只在发送的buffer填充满后才发送，并结束。

# 参考资料

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-channel.html

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-filechannel.html

- FileChannel

[oralce jdk7 FileChannel](https://docs.oracle.com/javase/7/docs/api/java/nio/channels/FileChannel.html)

https://javapapers.com/java/java-nio-file-read-write-with-channels/

https://blog.csdn.net/qq_16628781/article/details/70532307

- SocketChannel

https://blog.csdn.net/yhl_jxy/article/details/79335552

- DatagramChannel

http://shift-alt-ctrl.iteye.com/blog/1841460

https://blog.csdn.net/chenxuegui1234/article/details/17981203

https://blog.csdn.net/yhl_jxy/article/details/79336635

* any list
{:toc}