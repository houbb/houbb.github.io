---
layout: post
title:  Java IO-04-流
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: java io 入门系列-04-流
---

# System

## System.in

System.in是一个典型的连接控制台程序和键盘输入的InputStream流。

通常当数据通过命令行参数或者配置文件传递给命令行Java程序的时候，System.in并不是很常用。

图形界面程序通过界面传递参数给程序，这是一块单独的Java IO输入机制。

## System.out

System.out是一个PrintStream流。System.out一般会把你写到其中的数据输出到控制台上。

System.out通常仅用在类似命令行工具的控制台程序上。

System.out也经常用于打印程序的调试信息(尽管它可能并不是获取程序调试信息的最佳方式)。

## System.err

System.err是一个PrintStream流。

System.err与System.out的运行方式类似，但它更多的是用于打印错误文本。

为了让错误信息更加显眼，会将错误信息以红色文本的形式通过System.err输出到控制台上。

## 实例

```java
public static void main(String[] args) {
    Scanner scanner = new Scanner( System.in );
    System.out.print("请输入一个正整数 : ");
    int number = scanner.nextInt();
    if(number >= 0) {
        System.out.println("你输入的是: " + number);
    } else {
        System.err.println("你输入的不合法！");
    }
}
```

## 替换系统流

只需要把一个新的InputStream设置给System.in或者一个新的OutputStream设置给System.out或者System.err，之后的数据都将会在新的流中进行读取、写入。

```java
OutputStream output = new FileOutputStream("system.out.txt");
PrintStream printOut = new PrintStream(output);
System.setOut(printOut);
```

请记住，务必在JVM关闭之前冲刷System.out(调用 `flush()`)，确保System.out把数据输出到了文件中。


# 常见的流相关类

InputStream/OutputStream

FileInputStream/FileOutputStream

PipedInputStream/PipedOutputStream

ObjectInputStream/ObjectOutputStream


# 字节流

## 数组

- ByteArrayInputStream

ByteArrayInputStream允许你从字节数组中读取字节流数据，代码如下：

```java
byte[] bytes = ... //get byte array from somewhere.

InputStream input = new ByteArrayInputStream(bytes);

int data = input.read();
while(data != -1) {
  //do something with data

  data = input.read();
}
input.close(); 
```

如果数据存储在数组中，ByteArrayInputStream可以很方便地读取数据。

如果你有一个InputStream变量，又想从数组中读取数据呢？很简单，只需要把字节数组传递给ByteArrayInputStream的构造函数，在把这个ByteArrayInputStream赋值给InputStream变量就可以了(译者注：InputStream是所有字节输入流流的基类，Reader是所有字符输入流的基类，OutputStream与Writer同理)。

- ByteArrayOutputStream

ByteArrayOutputStream允许你以数组的形式获取写入到该输出流中的数据，代码如下：

```java
ByteArrayOutputStream output = new ByteArrayOutputStream();

//write data to output stream

byte[] bytes = output.toByteArray();
```

## Filter

- FilterInputStream

FilterInputStream是实现自定义过滤输入流的基类，基本上它仅仅只是覆盖了InputStream中的所有方法。

就我自己而言，我没发现这个类明显的用途。

除了构造函数取一个InputStream变量作为参数之外，我没看到FilterInputStream任何对InputStream新增或者修改的地方。

如果你选择继承FilterInputStream实现自定义的类，同样也可以直接继承自InputStream从而避免额外的类层级结构。

```java
FilterInputStream inputStream = new FilterInputStream(new FileInputStream("c:\\myfile.txt"));
```

- FilterOutputStream

同上。


## Buffered

- BufferedInputStream

BufferedInputStream能为输入流提供缓冲区，能提高很多IO的速度。

你可以一次读取一大块的数据，而不需要每次从网络或者磁盘中一次读取一个字节。特别是在访问大量磁盘数据时，缓冲通常会让IO快上许多。

为了给你的输入流加上缓冲，你需要把输入流包装到BufferedInputStream中，代码如下：

```java
InputStream input = new BufferedInputStream(new FileInputStream("c:\\data\\input-file.txt"));
```

很简单，不是吗？你可以给BufferedInputStream的构造函数传递一个值，设置内部使用的缓冲区设置大小(译者注：默认缓冲区大小8 * 1024B)，就像这样：

```java
InputStream input = new BufferedInputStream(new FileInputStream("c:\\data\\input-file.txt"), 8 * 1024);
```

这个例子设置了8KB的缓冲区。最好把缓冲区大小设置成1024字节的整数倍，这样能更高效地利用内置缓冲区的磁盘。

除了能够为输入流提供缓冲区以外，其余方面BufferedInputStream基本与InputStream类似。

- BufferedOutputStream

与BufferedInputStream类似，BufferedOutputStream可以为输出流提供缓冲区。

可以构造一个使用默认大小缓冲区的BufferedOutputStream(译者注：默认缓冲区大小8 * 1024B)，代码如下：

```java
OutputStream output = new BufferedOutputStream(new FileOutputStream("c:\\data\\output-file.txt"));
```

也可以手动设置缓冲区大小，代码如下：

```java
OutputStream output = new BufferedOutputStream(new FileOutputStream("c:\\data\\output-file.txt"), 8 * 1024);
```

为了更好地使用内置缓冲区的磁盘，同样建议把缓冲区大小设置成1024的整数倍。

除了能够为输出流提供缓冲区以外，其余方面BufferedOutputStream基本与OutputStream类似。

唯一不同的时，你需要手动 `flush()` 方法确保写入到此输出流的数据真正写入到磁盘或者网络中。

## Data

- DataInputStream

DataInputStream可以使你从输入流中读取Java基本类型数据，而不必每次读取字节数据。

你可以把InputStream包装到DataInputStream中，然后就可以从此输入流中读取基本类型数据了，代码如下：

```java
DataInputStream input = new DataInputStream(new FileInputStream("binary.data"));
int aByte = input.read();
int anInt = input.readInt();
float aFloat = input.readFloat();
double aDouble = input.readDouble();//etc.
input.close();
```

当你要读取的数据中包含了int，long，float，double这样的基本类型变量时，DataInputStream可以很方便地处理这些数据。

- DataOutputStream

DataOutputStream可以往输出流中写入Java基本类型数据，例子如下：

```java
DataOutputStream output = new DataOutputStream(new FileOutputStream("binary.data"));
output.write(45);
//byte data output.writeInt(4545);
//int data output.writeDouble(109.123);
//double data  output.close();
```

其他方面与DataInputStream类似，不再赘述。

# 字符流

## BufferedReader

BufferedReader能为字符输入流提供缓冲区，可以提高许多IO处理的速度。

你可以一次读取一大块的数据，而不需要每次从网络或者磁盘中一次读取一个字节。特别是在访问大量磁盘数据时，缓冲通常会让IO快上许多。

BufferedReader和BufferedInputStream的主要区别在于，BufferedReader操作字符，而BufferedInputStream操作原始字节。

只需要把Reader包装到BufferedReader中，就可以为Reader添加缓冲区(译者注：默认缓冲区大小为8192字节，即8KB)。代码如下：

```java
Reader input = new BufferedReader(new FileReader("c:\\data\\input-file.txt"));
```

你也可以通过传递构造函数的第二个参数，指定缓冲区大小，代码如下：

```java
Reader input = new BufferedReader(new FileReader("c:\\data\\input-file.txt"), 8 * 1024);
```

这个例子设置了8KB的缓冲区。最好把缓冲区大小设置成1024字节的整数倍，这样能更高效地利用内置缓冲区的磁盘。

除了能够为输入流提供缓冲区以外，其余方面BufferedReader基本与Reader类似。BufferedReader还有一个额外readLine()方法，可以方便地一次性读取一整行字符。

## BufferedWriter

与BufferedReader类似，BufferedWriter可以为输出流提供缓冲区。

可以构造一个使用默认大小缓冲区的BufferedWriter(译者注：默认缓冲区大小8 * 1024B)，代码如下：

```java
Writer writer = new BufferedWriter(new FileWriter("c:\\data\\output-file.txt"));
```

也可以手动设置缓冲区大小，代码如下：

```java
Writer writer = new BufferedWriter(new FileWriter("c:\\data\\output-file.txt"), 8 * 1024);
```

为了更好地使用内置缓冲区的磁盘，同样建议把缓冲区大小设置成1024的整数倍。

除了能够为输出流提供缓冲区以外，其余方面BufferedWriter基本与Writer类似。

类似地，BufferedWriter也提供了writeLine()方法，能够把一行字符写入到底层的字符输出流中。

值得注意是，你需要手动flush()方法确保写入到此输出流的数据真正写入到磁盘或者网络中。

## FilterReader

与FilterInputStream类似，FilterReader是实现自定义过滤输入字符流的基类，基本上它仅仅只是简单覆盖了Reader中的所有方法。

就我自己而言，我没发现这个类明显的用途。除了构造函数取一个Reader变量作为参数之外，我没看到FilterReader任何对Reader新增或者修改的地方。

如果你选择继承FilterReader实现自定义的类，同样也可以直接继承自Reader从而避免额外的类层级结构。

## FilterWriter

内容同FilterReader，不再赘述。

## PipedReader

PipedReader能够从管道中读取字符流。与PipedInputStream类似，不同的是PipedReader读取的是字符而非字节。

换句话说，PipedReader用于读取管道中的文本。代码如下：

```java
Reader reader = new PipedReader(pipedWriter);
int data = reader.read();
while(data != -1) {
    //do something with data...
    doSomethingWithData(data);
    data = reader.read();
}
reader.close();
```

read()方法返回一个包含了读取到的字符内容的int类型变量(译者注：0~65535)。

如果方法返回-1，表明PipedReader中已经没有剩余可读取字符，此时可以关闭PipedReader。

-1是一个int类型，不是byte或者char类型，这是不一样的。

正如你所看到的例子那样，一个PipedReader需要与一个PipedWriter相关联，当这两种流联系起来时，就形成了一条管道。

## PipedWriter

PipedWriter能够往管道中写入字符流。与PipedOutputStream类似，不同的是PipedWriter处理的是字符而非字节，PipedWriter用于写入文本数据。

代码如下：

```java
PipedWriter writer = new PipedWriter(pipedReader);
while(moreData()) {
    int data = getMoreData();
    writer.write(data);
}
writer.close();
```

PipedWriter的write()方法取一个包含了待写入字节的int类型变量作为参数进行写入，同时也有采用字符串、字符数组作为参数的write()方法。

## CharArrayReader

CharArrayReader能够让你从字符数组中读取字符流。

代码如下：

```java
char[] chars = ... //get char array from somewhere.
Reader reader = new CharArrayReader(chars);
int data = reader.read();
while(data != -1) {
    //do something with data
    data = reader.read();
}
reader.close();
```

如果数据的存储媒介是字符数组，CharArrayReader可以很方便的读取到你想要的数据。

CharArrayReader会包含一个字符数组，然后将字符数组转换成字符流。

(译者注：CharArrayReader有2个构造函数，一个是CharArrayReader(char[] buf)，将整个字符数组创建成一个字符流。

另外一个是CharArrayReader(char[] buf, int offset, int length)，把buf从offset开始，length个字符创建成一个字符流。

## CharArrayWriter

CharArrayWriter能够把字符写入到字符输出流writer中，并且能够将写入的字符转换成字符数组。

代码如下：

```java
CharArrayWriter writer = new CharArrayWriter();
//write characters to writer.
char[] chars = writer.toCharArray();
```

当你需要以字符数组的形式访问写入到writer中的字符流数据时，CharArrayWriter是个不错的选择。

# 其他流

## PushbackInputStream

PushbackInputStream用于解析InputStream内的数据。

有时候你需要提前知道接下来将要读取到的字节内容，才能判断用何种方式进行数据解析。

PushBackInputStream允许你这么做，你可以把读取到的字节重新推回到InputStream中，以便再次通过 read() 读取。

代码如下：

```java
PushbackInputStream input = new PushbackInputStream(new FileInputStream("c:\\data\\input.txt"));
int data = input.read();
input.unread(data);
```

可以通过PushBackInputStream的构造函数设置推回缓冲区的大小，代码如下：

```java
PushbackInputStream input = new PushbackInputStream(new FileInputStream("c:\\data\\input.txt"), 8);
```

## SequenceInputStream

SequenceInputStream把一个或者多个InputStream整合起来，形成一个逻辑连贯的输入流。

当读取SequenceInputStream时，会先从第一个输入流中读取，完成之后再从第二个输入流读取，以此推类。

代码如下：

```java
InputStream input1 = new FileInputStream("c:\\data\\file1.txt");
InputStream input2 = new FileInputStream("c:\\data\\file2.txt");
InputStream combined = new SequenceInputStream(input1, input2);
```

通过SequenceInputStream，例子中的2个InputStream使用起来就如同只有一个InputStream一样(译者注：SequenceInputStream的read()方法会在读取到当前流末尾时，关闭流，并把当前流指向逻辑链中的下一个流，最后返回新的当前流的read()值)。

## PrintStream

PrintStream允许你把格式化数据写入到底层OutputStream中。

比如，写入格式化成文本的int，long以及其他原始数据类型到输出流中，而非它们的字节数据。

代码如下：

```java
PrintStream output = new PrintStream(outputStream);
output.print(true);
output.print((int) 123);
output.print((float) 123.456);
output.printf(Locale.UK, "Text + data: %1$", 123);
output.close();
```

PrintStream包含2个强大的函数，分别是format()和printf()(这两个函数几乎做了一样的事情，但是C程序员会更熟悉printf())。

```java
public PrintStream printf(String format, Object ... args) {
    return format(format, args);
}
```

## PushbackReader

PushbackReader与PushbackInputStream类似，唯一不同的是PushbackReader处理字符，PushbackInputStream处理字节。

代码如下：

```java
PushbackReader reader = new PushbackReader(new FileReader("c:\\data\\input.txt"));
int data = reader.read();
reader.unread(data);
```

同样可以设置缓冲区大小，代码如下：

```java
PushbackReader reader = new PushbackReader(new FileReader("c:\\data\\input.txt"), 8);
```

## LineNumberReader

LineNumberReader是记录了已读取数据行号的BufferedReader。

默认情况下，行号从0开始，当LineNumberReader读取到行终止符时，行号会递增(译者注：换行\n，回车\r，或者换行回车\n\r都是行终止符)。

你可以通过getLineNumber()方法获取当前行号，通过setLineNumber()方法设置当前行数

(译者注：setLineNumber()仅仅改变LineNumberReader内的记录行号的变量值，不会改变当前流的读取位置。流的读取依然是顺序进行，意味着你不能通过setLineNumber()实现流的跳跃读取)。

代码如下：

```java
LineNumberReader reader = new LineNumberReader(new FileReader("c:\\data\\input.txt"));
int data = reader.read();
while(data != -1){
    char dataChar = (char) data;
    data = reader.read();
    int lineNumber = reader.getLineNumber();
}
```

如果解析的文本有错误，LineNumberReader可以很方便地定位问题。

当你把错误报告给用户时，如果能够同时把出错的行号提供给用户，用户就能迅速发现并且解决问题。

## StreamTokenizer

StreamTokenizer(译者注：请注意不是StringTokenizer)可以把输入流(译者注：InputStream和Reader。

通过InputStream构造StreamTokenizer的构造函数已经在JDK1.1版本过时，推荐将InputStream转化成Reader，再利用此Reader构造StringTokenizer)分解成一系列符号。比如，句子”Mary had a little lamb”的每个单词都是一个单独的符号。

当你解析文件或者计算机语言时，为了进一步的处理，需要将解析的数据分解成符号。通常这个过程也称作分词。

通过循环调用nextToken()可以遍历底层输入流的所有符号。

在每次调用nextToken()之后，StreamTokenizer有一些变量可以帮助我们获取读取到的符号的类型和值。

这些变量是：

ttype 读取到的符号的类型(字符，数字，或者行结尾符)

sval 如果读取到的符号是字符串类型，该变量的值就是读取到的字符串的值

nval 如果读取到的符号是数字类型，该变量的值就是读取到的数字的值

- 代码如下：

```java
StreamTokenizer tokenizer = new StreamTokenizer(new StringReader("Mary had 1 little lamb..."));
while(tokenizer.nextToken() != StreamTokenizer.TT_EOF){
    if(tokenizer.ttype == StreamTokenizer.TT_WORD) {
        System.out.println(tokenizer.sval);
    } else if(tokenizer.ttype == StreamTokenizer.TT_NUMBER) {
        System.out.println(tokenizer.nval);

    } else if(tokenizer.ttype == StreamTokenizer.TT_EOL) {
        System.out.println();
    }
}
```

译者注：TT_EOF表示流末尾，TT_EOL表示行末尾。

StreamTokenizer可以识别标示符，数字，引用的字符串，和多种注释类型。

你也可以指定何种字符解释成空格、注释的开始以及结束等。在StreamTokenizer开始解析之前，所有的功能都可以进行配置。

## PrintWriter

与PrintStream类似，PrintWriter可以把格式化后的数据写入到底层writer中。由于内容相似，不再赘述。

值得一提的是，PrintWriter有更多种构造函数供使用者选择，除了可以输出到文件、Writer以外，还可以输出到OutputStream中(译者注：PrintStream只能把数据输出到文件和OutputStream)。

## StringReader

StringReader能够将原始字符串转换成Reader，代码如下：

```java
Reader reader = new StringReader("input string...");
int data = reader.read();
while(data != -1) {
    //do something with data...
    doSomethingWithData(data);
    data = reader.read();
}
reader.close();
```

## StringWriter

StringWriter能够以字符串的形式从Writer中获取写入到其中数据，代码如下：

```java
StringWriter writer = new StringWriter();
//write characters to writer.
String data = writer.toString();
StringBuffer dataBuffer = writer.getBuffer();
```

toString() 方法能够获取StringWriter中的字符串数据。

getBuffer() 方法能够获取StringWriter内部构造字符串时所使用的StringBuffer对象。

# 参考资料

http://ifeve.com/java-io-system-in-system-out-system-err/

https://blog.csdn.net/euller/article/details/50967096

* any list
{:toc}