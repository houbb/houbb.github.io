---
layout: post
title:  Java Net-05-死锁
date:  2018-09-23 09:35:05 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: Java 网络编程之死锁问题
---

# 基础原理

首先需要明白数据传输的底层实现机制，在上一章中有详细的介绍，我们提到了 SendQ 和 RecvQ 缓冲队列，这两个缓冲区的容量在具体实现时会受一定的限制，虽然它们使用的实际内存大小会动态地增长和收缩，但还是需要一个硬性的限制，以防止行为异常的程序所控制的单一 TCP 连接将系统的内存全部消耗。

正是由于缓冲区的容量有限，它们可能会被填满，事实也正是如此，如果与 TCP 的流量控制机制结合使用，则可能导致一种形式的死锁。

一旦 RecvQ 已满，TCP 流控制机制就会产生作用（使用流控制机制的目的是为了保证发送者不会传输太多数据，从而超出了接收系统的处理能力），它将阻止传输发送端主机的 SendQ 中的任何数据，直到接收者调用输入流的 read() 方法将 RecvQ 中的数据移除一部分到 Delivered 中，从而腾出了空间。

发送端可以持续地写出数据，直到 SendQ 队列被填满，如果 SendQ 队列已满时调用输出流的 write()方法，则会阻塞等待，直到有一些字节被传输到 RecvQ 队列中，如果此时 RecvQ 队列也被填满了，所有的操作都将停止，直到接收端调用了输入流的 read()方法将一些字节传输到了 Delivered 队列中。

# 引出问题

我们假设 SendQ 队列和 RecvQ 队列的大小分别为 SQS 和 RQS。

将一个大小为 n 的字节数组传递给发送端 write()方法调用，其中 n > SQS，直到有至少 n-SQS 字节的数据传递到接收端主机的 RecvQ 队列后，该方法才返回。如果 n 的大小超过了 SQS+RQS，write()方法将在接收端从输入流读取了至少 n-(SQS+RQS)字节后才会返回。

如果接收端没有调用 read() 方法，大数据量的发送是无法成功的。特别是连接的两端同时分别调用它的输出流的 write() 方法，而他们的缓冲区大小又大于 SQS+RQS 时，将会发生死锁：两个 write 操作都不能完成，两个程序都将永远保持阻塞状态。

下面考虑一个具体的例子，即主机 A 上的程序和主机 B 上的程序之间的 TCP 连接。

假设 A 和 B 上的 SQS 和 RQS 都是 500 字节，下图展示了两个程序试图同时发送 1500 字节时的情况。

主机 A 上的程序中的前 500 字节已经传输到另一端，另外 500 字节已经复制到了主机 A 的 SendQ 队列中，余下的 500 字节则无法发送，write()方法将无法返回，直到主机 B 上程序的 RecvQ 队列有空间空出来，然而不幸的是 B 上的程序也遇到了同样的情况，而二者都没有及时调用 read()方法从自己的 RecvQ 队列中读取数据到 Delivered 队列中。

因此，两个程序的 write()方法调用都永远无法返回，产生死锁。因此，在写程序时，要仔细设计协议，以避免在两个方向上传输大量数据时产生死锁。

# 示例分析

## 场景

回顾前面几篇文章中的 TCP 通信的示例代码，基本都是只调用一次 write()方法将所有的数据写出，而且我们测试的数据量也不大。

考虑一个压缩字节的 Demo，客户端从文件中读取字节，发送到服务端，服务端将受到的文件压缩后反馈给客户端。

## 示例代码

这里先给出代码，客户端代码如下：

```java
import java.io.FileInputStream;  
import java.io.FileOutputStream;  
import java.io.IOException;  
import java.io.InputStream;  
import java.io.OutputStream;  
import java.net.Socket;  

public class CompressClientNoDeadlock {  

  public static final int BUFSIZE = 256;  // Size of read buffer  

  public static void main(String[] args) throws IOException {  

    if (args.length != 3)  // Test for correct #  of args  
      throw new IllegalArgumentException("Parameter(s): <Server> <Port> <File>");  

    String server = args[0];               // Server name or IP address  
    int port = Integer.parseInt(args[1]);  // Server port  
    String filename = args[2];             // File to read data from  

    // Open input and output file (named input.gz)  
    final FileInputStream fileIn = new FileInputStream(filename);  
    FileOutputStream fileOut = new FileOutputStream(filename + ".gz");  

    // Create socket connected to server on specified port  
    final Socket sock = new Socket(server, port);  

    // Send uncompressed byte stream to server  
    Thread thread = new Thread() {  
      public void run() {  
        try {  
          SendBytes(sock, fileIn);  
        } catch (Exception ignored) {}  
      }  
    };  
    thread.start();  

    // Receive compressed byte stream from server  
    InputStream sockIn = sock.getInputStream();  
    int bytesRead;                      // Number of bytes read  
    byte[] buffer = new byte[BUFSIZE];  // Byte buffer  
    while ((bytesRead = sockIn.read(buffer)) != -1) {  
      fileOut.write(buffer, 0, bytesRead);  
      System.out.print("R");   // Reading progress indicator  
    }  
    System.out.println();      // End progress indicator line  

    sock.close();     // Close the socket and its streams  
    fileIn.close();   // Close file streams  
    fileOut.close();  
  }  

  public static void SendBytes(Socket sock, InputStream fileIn)  
      throws IOException {  

    OutputStream sockOut = sock.getOutputStream();  
    int bytesRead;                      // Number of bytes read  
    byte[] buffer = new byte[BUFSIZE];  // Byte buffer  
    while ((bytesRead = fileIn.read(buffer)) != -1) {  
      sockOut.write(buffer, 0, bytesRead);  
      System.out.print("W");   // Writing progress indicator  
    }  
    sock.shutdownOutput();     // Done sending  
  }  
}  
```

## 死锁原因

死锁问题的产生原因在客户端上，因此，服务端的具体代码我们不再给出，服务端采取边读边写的策略。

下面我们边对上面可能产生的问题进行分析。对该示例而言，当需要传递的文件容量不是很大时，程序运行正常，也能得到预期的结果，但如果尝试运行该客户端并传递给它一个大文件，改文件压缩后仍然很大（在此，大的精确定义取决于程序运行的系统，不过压缩后依然超过 2MB 的文件应该就可以使改程序产生死锁问题），那么客户端将打印出一堆 W 后停止，而且不会打印出任何 R，程序也不会终止。

为什么会产生这种情况呢？我们来看程序，客户端很明显是一边读取本地文件中的数据，一边调用输出流的 write()方法，将数据送入客户端主机的 SendQ 队列，直到文件中的数据被读取完，客户端才调用输入流的 read()方法，读取服务端发送回来的数据。

考虑这种情况：客户端和服务端的 SendQ 队列和 RecvQ 队列中都有 500 字节的数据空间，而客户端发送了一个 10000 字节的文件，同时假设对于这个文件，服务端读取 1000 字节并返回 500 字节，即压缩比为 2:1，当客户端发送了 2000 字节后，服务端将最终全部读取这些字节，并发回 1000 字节，由于客户端此时并没有调用输入流的 read()方法从客户端主机的 RecvQ 队列中移出数据到 Delivered，因此，此时客户端的 RecvQ 队列和服务端的 SendQ 队列都被填满了，此时客户端还在继续发送数据，又发送了 1000 字节的数据，并且被服务端全部读取，但此时服务端的 write 操作尝试都已被阻塞，不能继续发送数据给客户端，当客户端再发送了另外的 1000 字节数据后，客户端的 SendQ 队列和服务端的 RecvQ 队列都将被填满，后续的客户端 write 操作也将阻塞，从而形成死锁。

## 解决方案

如何解决这个问题呢？造成死锁产生的原因是因为客户端在发送数据的同时，没有及时读取反馈回来的数据，从而使数据都阻塞在了底层的传输队列中。

方案一是在编写客户端程序时，使客户端一边循环调用输出流的 read()方法向服务端发送数据，一边循环调用输入流的 read()方法读取从服务端反馈回来的数据，但这也不能完全保证不会产生死锁。

更好的解决方案是在不同的线程中执行客户端的 write 循环和 read 循环。

一个线程从文件中反复读取未压缩的字节并将其发送给服务器，直到文件的结尾，然后调用该套接字的 shutdownOutput()方法。另一个线程从服务端的输入流中不断读取压缩后的字节，并将其写入输出文件，直到到达了输入流的结尾（服务器关闭了套接字）。

这样，便可以实现一边发送，一边读取，而且如果一个线程阻塞了，另一个线程仍然可以独立执行。

这样我们可以对客户端代码进行简单的修改，将 SendByes()方法调用放到一个线程中：

```java
Thread thread = new Thread() {  
  public void run() {  
    try {  
      SendBytes(sock, fileIn);  
    } catch (Exception ignored) {}  
  }  
};  
thread.start();  
```

当然，解决这个问题也可以不使用多线程，而是使用 NIO 机制（Channel和Selector）。

# 参考资料

- 死锁问题

http://wiki.jikexueyuan.com/project/java-socket/socket-read-deadlock.html

http://wiki.jikexueyuan.com/project/java-socket/socket-tcp-deadlock.html

* any list
{:toc}