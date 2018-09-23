---
layout: post
title:  Java Net-09-Frame
date:  2018-09-23 09:35:05 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: Java 网络编程之 Frame 帧
---

# Frame

程序间达成的某种包含了信息交换的形式和意义的共识称为协议，用来实现特定应用程序的协议叫做应用程序协议。

大部分应用程序协议是根据由字段序列组成的离散信息定义的，其中每个字段中都包含了一段以位序列编码（即二进制字节编码，也可以使用基于文本编码的方式，但常用协议如：TCP、UDP、HTTP 等在传输数据时，都是以位序列编码的）的特定信息。

应用程序协议中明确定义了信息的发送者应该如何排列和解释这些位序列，同时还要定义接收者应该如何解析，这样才能使信息的接收者能够抽取出每个字段的意义。

TCP/IP 协议唯一的约束：信息必须在块中发送和接收，而块的长度必须是 8 位的倍数，因此，我们可以认为 TCP/IP 协议中传输的信息是字节序列。

由于协议通常处理的是由一组字段组成的离散的信息，因此应用程序协议必须指定消息的接收者如何确定何时消息已被完整接收。

成帧技术就是解决接收端如何定位消息首尾位置问题的，由于协议通常处理的是由一组字段组成的离散的信息，因此应用程序协议必须指定消息的接收者如何确定何时消息已被完整。

## 定位方式

主要有两种技术使接收者能够准确地找到消息的结束位置：

- 基于定界符

消息的结束由一个唯一的标记指出，即发送者在传输完数据后显式添加的一个特定字节序列，这个特殊标记不能在传输的数据中出现（这也不是绝对的，应用填充技术能够对消息中出现的定界符进行修改，从而使接收者不将其识别为定界符）。该方法通常用在以文本方式编码的消息中。

- 显式长度

在变长字段或消息前附加一个固定大小的字段，用来指示该字段或消息中包含了多少字节。该方法主要用在以二进制字节方式编码的消息中。


## UDP 不需要处理

由于 UDP 套接字保留了消息的边界信息，因此不需要进行成帧处理（实际上，主要是 DatagramPacket 负载的数据有一个确定的长度，接收者能够准确地知道消息的结束位置），而 TCP 协议中没有消息边界的概念，因此，在使用 TCP 套接字时，成帧就是一个非常重要的考虑因素（在 TCP 连接中，接收者读取完最后一条消息的最后一个字节后，将受到一个流结束标记，即 read() 返回-1，该标记指示出已经读取到了消息的末尾，非严格意义上来讲，这也算是基于定界符方法的一种特殊情况）。

# 自定义成帧

## 接口 

- Framer.java

```java
public interface Framer {

    /**
     * 用来添加成帧信息并将指定消息输出到指定流
     * @param message 消息
     * @param out 输出流
     * @throws IOException io 异常
     */
    void frameMsg(byte[] message, OutputStream out) throws IOException;

    /**
     * 扫描指定的流，从中抽取出下一条消息。
     * @return 消息
     * @throws IOException io 异常
     */
    byte[] nextMsg() throws IOException;

}
```

## 定界符

下面的代码实现了基于定界符的成帧方法，定界符为换行符 `\n`，frameMsg() 方法并没有实现填充，当成帧的字节序列中包含有定界符时，它只是简单地抛出异常；

nextMsg() 方法扫描刘，直到读取到了定界符，并返回定界符前面所有的字符，如果流为空则返回 null，如果直到流结束也没找到定界符，程序将抛出一个异常来指示成帧错误。

- DelimeterFramer.java

```java
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class DelimeterFramer implements Framer {

    // 数据来源
    private InputStream in;

    // 定界符
    private static final byte DELIMITER = '\n';

    public DelimeterFramer(InputStream in) {
        this.in = in;
    }

    @Override
    public void frameMsg(byte[] message, OutputStream out) throws IOException {
        for (byte b : message) {
            if (b == DELIMITER) {
                //如果在消息中检查到界定符，则抛出异常
                throw new IOException("Message contains delimiter");
            }
        }
        out.write(message);
        out.write(DELIMITER);
        out.flush();
    }

    @Override
    public byte[] nextMsg() throws IOException {
        ByteArrayOutputStream messageBuffer = new ByteArrayOutputStream();
        int nextByte;

        while ((nextByte = in.read()) != DELIMITER) {
            //如果流已经结束还没有读取到定界符
            if (nextByte == -1) {
                //如果读取到的流为空，则返回null
                if (messageBuffer.size() == 0) {
                    return null;
                } else {
                    //如果读取到的流不为空，则抛出异常
                    throw new EOFException("Non-empty message without delimiter");
                }
            }
            messageBuffer.write(nextByte);
        }

        return messageBuffer.toByteArray();
    }
}
```

## 长度

- LengthFramer.java

```java
import java.io.DataInputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class LengthFramer implements Framer {

    public static final int MAXMESSAGELENGTH = 65535;

    public static final int BYTEMASK = 0xff;

    public static final int SHORTMASK = 0xffff;

    public static final int BYTESHIFT = 8;

    private DataInputStream in;

    // 数据来源
    public LengthFramer(InputStream in) throws IOException {
        this.in = new DataInputStream(in);
    }

    @Override
    public void frameMsg(byte[] message, OutputStream out) throws IOException {
        //消息的长度不能超过65535
        if (message.length > MAXMESSAGELENGTH) {
            throw new IOException("message too long");
        }
        out.write((message.length >> BYTESHIFT) & BYTEMASK);
        out.write(message.length & BYTEMASK);
        out.write(message);
        out.flush();
    }

    @Override
    public byte[] nextMsg() throws IOException {
        int length;
        try {
            //该方法读取2个字节，将它们作为big-endian整数进行解释，并以int型整数返回它们的值
            length = in.readUnsignedShort();
        } catch (EOFException e) { // no (or 1 byte) message
            return null;
        }
        // 0 <= length <= 65535
        byte[] msg = new byte[length];
        //该方法处阻塞等待，直到接收到足够的字节来填满指定的数组
        in.readFully(msg);
        return msg;
    }
}
```

# 参考资料

http://wiki.jikexueyuan.com/project/java-socket/application-protocol.html

* any list
{:toc}