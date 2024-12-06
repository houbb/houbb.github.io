---
layout: post
title: java 发送邮件-04-java 邮件发送 http 接口如何定义？
date:  2019-12-25 16:57:12 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 邮件系列

[java 如何实现发送邮件 email?](https://houbb.github.io/2019/12/25/java-email)

[java 搭建属于自己的邮件服务器](https://houbb.github.io/2019/12/25/java-email-your-own-server)

[java 发送邮件 css-style 样式丢失错乱问题，有解决方案](https://houbb.github.io/2019/12/25/java-email-css-style)

[java 发送邮件-04-java 邮件发送 http 接口如何定义？](https://houbb.github.io/2019/12/25/java-email-04-java-http)

## 开源项目

[email: 一行代码实现邮件发送](https://github.com/houbb/email)

# 前言

大家好，我是老马。

大家日常开发，对于邮件发送应该能不陌生。本系列就让我们一起学习一下邮件相关的内容。

# 业务背景

如何定义一个好用的 http 接口。

满足统一的 email 请求参数。

# 请求参数

## 基本参数

```
checkum 验签
traceId 跟踪标识
source 来源系统
```

## 业务参数

from 发送邮箱
fromUsername 发送用户
fromPassword 发送密码

可以提供默认值，后2者可以统一收口简化掉。
通过一张配置表，简化用户的使用体验。

toList 收件人
ccList 抄送人

title
content

附件：
attachFileBase64 内容过多，序列化的时候隐藏掉。
attachFileBase64
attachFileName

sendType 更多的 text/html 格式等，考虑默认为 html


------------------------------------------------------------------------

# 他山之石

## 问题

遇到的问题：

一、如何添加附件？

参考链接1   https://www.cnblogs.com/ysocean/p/7666061.html

参考链接2   https://blog.csdn.net/lovecuidong/article/details/92658140

二、因为是微服务项目，所以上传附件的时候，不可能是直接从本地获取，而是在各个微服务模块之间互相传递？

想到的方法：使用接口中使用 @Requestbody MailInfo  @RequestParam MultipartFile file

接下来又出现问题了

由于@RequestBody 的接收的Http请求Header的content-type属性为：application/json

@RequestParam MultipartFile file的接收的Http请求Header的content-type属性为：multipart/form-data

经过分析：MultipartFile这样的multipart/form-data媒体类型优先级会高于application/json，而配置@RequestBody 感觉使用一个低优先级的handle一个高优先级的从而报错。所以在multipart/form-data媒体类型请求时和@RequestBody不能共存

拿怎么解决这个冲突呢？那就只能放弃其中一个了，不过我之前又看到过设置两个请求头的方法，具体在哪我找不到了......

所以说，当我们解决一个问题的时候，这个解决方法又会带来另一种问题（需要对现有代码大改问题），那么我们应该考虑换一种解决方法！

在这里我是采用阿里云OSS对象存储，可以把文件上传到OSS上，因为OSS有提供下载文件流的API，所以我们能够在OSS下载文件流再转换成自己想要File对象，于是新的问题又出现了，在我成功实现发送带附件的邮件时，发现只有文本文件下载完之后能正常打开，这是为什么呢？

首先需要分析一下文件传输的整个过程：

1.从OSS上下载ossObject   
2.ossObject转File   
3.file发送到客户邮箱

所以我现在第二步中直接执行保存到本地，发现非纯文本文件还是无法正常打开，那么可能存在两个原因：

1、ossObject转File的代码有问题
2、ossObject转File正常，但是需要对不用类型文件进行解析或者读取（如Excel文件利用POI的类库进行解析后再读）
以下是我的ossObject转File的代码（这里有个坑，但是我当时候没发现）

```java
private void ossObjectToFile(OSSObject ossObject, File file) throws IOException {
    InputStream inputStream = ossObject.getObjectContent();

    //读取inputstream所含字节数
    byte[] bytes = new byte[inputStream.available()];

    //从InputStream中读出内存到byte[]中
    inputStream.read(bytes);

    //FileOutputStream写入文件
    OutputStream outStream = new FileOutputStream(file);
    outStream.write(bytes);

    //关闭流
    inputStream.close();
    outStream.close();
}
```

过程: 把ossobject转换成Inputstream,  初始化一个大小为Inputstream字节数大小的字节数组，再从InputStream中读出内存到byte[]中然后,使用FileOutputStream写入文件中

理论上看起来这个过程是没问题的，但是这里埋了一个坑（由于自己的知识面不够广，没有认识到 `InputStream.available()` 的局限性

## 关于InputStream类的available()方法

要一次读取多个字节时，经常用到InputStream.available()方法，这个方法可以在读写操作前先得知数据流里有多少个字节可以读取。

需要注意的是，如果这个方法用在从本地文件读取数据时，一般不会遇到问题。

但如果是用于网络操作，就经常会遇到一些麻烦。

比如，Socket通讯时，对方明明发来了1000个字节，但是自己的程序调用available()方法却只得到900，或者100，甚至是0，感觉有点莫名其妙，怎么也找不到原因。

其实，这是因为网络通讯往往是间断性的，一串字节往往分几批进行发送。本地程序调用available()方法有时得到0，这可能是对方还没有响应，也可能是对方已经响应了，但是数据还没有送达本地。对方发送了1000个字节给你，也许分成3批到达，这你就要调用3次available()方法才能将数据总数全部得到。

所以我们应该采用别的方式去将Inputstream转换成file

1、使用Inputstream.read()方法，

```java
private void ossObjectToFile(OSSObject ossObject, File file) throws IOException {
    FileOutputStream out = null;
    InputStream inputStream = ossObject.getObjectContent();
    try {
        out = new FileOutputStream(file);
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    }
    int data;
    try {
        while((data = inputStream.read()) != -1) {
            out.write(data);
        }
        inputStream.close();
        out.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

二、换一种读取inputstream所含字节数大小的方法

```java
private void ossObjectToFile(OSSObject ossObject, File file) throws IOException {
        InputStream inputStream = ossObject.getObjectContent();
 
        //读取inputstream所含字节数，InputStream.available()方法需另外处理
        byte[] bytes = Utils.readInputStream(inputStream);
 
        //从InputStream中读出内存到byte[]中
        inputStream.read(bytes);
 
        //FileOutputStream写入文件
        OutputStream outStream = new FileOutputStream(file);
        outStream.write(bytes);
 
        //关闭流
        inputStream.close();
        outStream.close();
    }
```

```java
public static byte[] readInputStream(InputStream inputStream) throws IOException {
        byte[] buffer = new byte[1024];
        int len = 0;
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        while ((len = inputStream.read(buffer)) != -1) {
            bos.write(buffer, 0, len);
        }
        bos.close();
        return bos.toByteArray();
    }
```





# 传入文件和附件

## 客户端

```java
package cn.httpRequest;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author 天真热
 * @create 2022-05-11 18:36
 * @desc
 **/
public class HttpRequestUtils {
    public static void main(String[] args) throws IOException {
        //=========================================邮箱==================================================
        List<Map<String, Object>> files = new ArrayList<>();
        Map<String, Object> map = new HashMap();
        File file = new File("C:\\Users\\86188\\Desktop\\t1.png");
        map.put("name", "t1.png");
        map.put("file", file);
        files.add(map);

        Map<String, Object> param = new HashMap();
        param.put("data", "data");
        doRequest("http://127.0.0.1:8080/sendReport", files, param, "POST");
    }

    /**
     * 发送附件和文字
     *
     * @param actionUrl
     * @param files
     * @param param
     * @param type
     */
    public static void doRequest(String actionUrl, List<Map<String, Object>> files, Map<String, Object> param, String type) {
        HttpURLConnection conn = null;
        DataOutputStream outStream = null;
        try {
            final String NEWLINE = "\r\n";
            String BOUNDARY = java.util.UUID.randomUUID().toString();
            String PREFIX = "--", LINEND = "\r\n";
            String MULTIPART_FROM_DATA = "multipart/form-data";
            String CHARSET = "UTF-8";
            URL uri = new URL(actionUrl);
            conn = (HttpURLConnection) uri.openConnection();
            conn.setReadTimeout(15 * 1000);
            conn.setDoInput(true);// 允许输入
            conn.setDoOutput(true);// 允许输出
            conn.setUseCaches(false);
            conn.setRequestMethod(type); // Post方式
            conn.setRequestProperty("connection", "keep-alive");
            conn.setRequestProperty("Charsert", "UTF-8");
            conn.setRequestProperty("Accept", "application/json;charset=UTF-8");
            conn.setRequestProperty("Content-Type", MULTIPART_FROM_DATA
                    + ";boundary=" + BOUNDARY);

            outStream = new DataOutputStream(
                    conn.getOutputStream());


            // 获取表单中上传控件之外的控件数据，写入到输出流对象（根据上面分析的抓包的内容格式拼凑字符串）；
            if (param != null && !param.isEmpty()) { // 这时请求中的普通参数，键值对类型的，相当于上面分析的请求中的username，可能有多个
                for (Map.Entry<String, Object> entry : param.entrySet()) {
                    String key = entry.getKey(); // 键，相当于上面分析的请求中的username
                    Object value = param.get(key); // 值，相当于上面分析的请求中的sdafdsa
                    outStream.writeBytes(PREFIX + BOUNDARY + NEWLINE); // 像请求体中写分割线，就是前缀+分界线+换行
                    outStream.writeBytes("Content-Disposition: form-data; "
                            + "name=\"" + key + "\"" + NEWLINE); // 拼接参数名，格式就是Content-Disposition: form-data; name="key" 其中key就是当前循环的键值对的键，别忘了最后的换行
                    outStream.writeBytes(NEWLINE); // 空行，一定不能少，键和值之间有一个固定的空行
                    outStream.write(value.toString().getBytes()); // 将值写入,用字节流防止乱码
                    // 或者写成：dos.write(value.toString().getBytes(charset));
                    outStream.writeBytes(NEWLINE); // 换行
                }
            }

            // 发送文件数据
            if (files != null)
                for (Map<String, Object> file : files) {
                    StringBuilder sb1 = new StringBuilder();
                    sb1.append(PREFIX);
                    sb1.append(BOUNDARY);
                    sb1.append(LINEND);
                    sb1.append("Content-Disposition: form-data; name=\"file\"; filename=\""
                            + file.get("name") + "\"" + LINEND);
                    sb1.append("Content-Type: application/octet-stream; charset="
                            + CHARSET + LINEND);
                    sb1.append(LINEND);
                    outStream.write(sb1.toString().getBytes("utf-8"));    //getBytes()不加utf-8 传输中文名附件时，接收附件的地方解析文件名会乱码

                    InputStream is = new FileInputStream((File) file.get("file"));
                    byte[] buffer = new byte[1024];
                    int len = 0;
                    while ((len = is.read(buffer)) != -1) {
                        outStream.write(buffer, 0, len);
                    }

                    is.close();
                    outStream.write(LINEND.getBytes());
                }

            // 请求结束标志
            byte[] end_data = (PREFIX + BOUNDARY + PREFIX + LINEND).getBytes();
            outStream.write(end_data);
            outStream.flush();

            // 得到响应码
            int res = conn.getResponseCode();
            if (res == 200) {
                InputStream in = conn.getInputStream();
                InputStreamReader isReader = new InputStreamReader(in);
                BufferedReader bufReader = new BufferedReader(isReader);
                String line = "";
                String data = "";
                while ((line = bufReader.readLine()) != null) {
                    data += line;
                }
                outStream.close();
                conn.disconnect();


            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                //关闭流
                outStream.close();
                //关闭连接
                conn.disconnect();
            } catch (IOException e) {
                e.printStackTrace();
            }

        }


    }

}
```

## 服务端

```java
package cn.httpRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.*;

/**
 * @author 天真热
 * @create 2022-05-14 8:30
 * @desc
 **/
public class Receive {
    public void sendReport(HttpServletRequest request, HttpServletResponse response) throws Exception {

        String data = request.getParameter("data");

        //附件集合
        MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) request;
        //获取附件集合
        List<Map<String, Object>> fileList = getFiles(multiRequest, request);
    }

    public List<Map<String, Object>> getFiles(MultipartHttpServletRequest multiRequest, HttpServletRequest
            request) throws Exception {
        List<Map<String, Object>> fileList = new ArrayList<>();
        //解析request，将结果放置在list中
        Map<String, List<MultipartFile>> fileMap = multiRequest.getMultiFileMap();

        for (String key : fileMap.keySet()) {
            List<MultipartFile> files = fileMap.get(key);
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileNamePath = file.getOriginalFilename();
                    String[] params = fileNamePath.split("\\.");
                    String filename = "";
                    int i = 0;
                    for (String str : params) {
                        i = i + 1;
                        if (StringUtils.isNotEmpty(filename)) {
                            if (i == params.length) {
                                filename = filename + "." + str;
                            } else {
                                filename = filename + "/" + str;
                            }
                        } else {
                            filename = str;
                        }
                    }
                    // 文件保存路径
                    String filePath = "C:\\Users\\86188\\Desktop\\reportLog" + "/" + "upload/" + filename;

                    File iFile = new File(filePath);
                    Map map = new HashMap();
                    map.put("name", filename);
                    map.put("file", iFile);
                    fileList.add(map);

                    File iFileParent = iFile.getParentFile();
                    if (!iFileParent.exists()) {
                        iFileParent.mkdirs();
                    }
                    // 转存文件
                    file.transferTo(new File(filePath));

                }
            }
        }


        return fileList;
    }

}
```

# 邮件发送

项目中需要根据物料资质的状况实时给用户发送邮件,然后我就简单学习了SMTP.

电子邮件的在网络中传输和网页一样需要遵从特定的协议，常用的电子邮件协议包括 SMTP，POP3，IMAP。

其中邮件的创建和发送只需要用到 SMTP协议，所以本文也只会涉及到SMTP协议。

SMTP 是 Simple Mail Transfer Protocol 的简称，即简单邮件传输协议。

## 1.导入jar包javax.mail.jar

JavaMail 下载地址: https://github.com/javaee/javamail/releases

特别注意:

本测试用例用的 JavaMail 版本是 1.6.0，如果下载到其他版本的 JavaMail 运行时出现问题，请使用 JavaMail 1.6.0 版本再进行尝试。

使用 JavaMail 1.6.0 要求的 JDK 版本必须是 JDK 1.7 以上（建议使用最新版 JDK）。

不要直接就完完全全复制我的代码，需要 修改一下发送的标题、内容、用户昵称，要不然所有人都直接复制我的代码发送，内容一致，邮箱服务器就可能会检测到这些内容是垃圾广告内容，不让你发送，会返回错误码，查询错误码也能查询到失败原因。

## 2.创建一封简单的电子邮件

首先创建一个 Java 工程，把下载好的 javax.mail.jar 作为类库加入工程

邮件创建步骤:

- 配置连接邮件服务器的参数( 邮件服务器SMTP, 是否需要SMTP验证 )

- 创建一个邮件对象( MimeMessage )

- 设置发件人,收件人 ( 可增加多个收件人,抄送人,密送人 )

- 设置邮件标题, 正文 , 附件等

- 设置显示的发送时间

```java
    public void sendMail() throws Exception{
        System.out.println("sendMailServlet-----start");
 
        //1.创建邮件对象
        Properties properties = new Properties();
        properties.put("mail.smtp.host", "mail.hand-china.com"); // 指定SMTP服务器
        properties.put("mail.smtp.auth", "true"); // 指定是否需要SMTP验证
        Session session = Session.getInstance(properties);
        MimeMessage mimeMessage =new MimeMessage(session);
 
        /*2.设置发件人
        * 其中 InternetAddress 的三个参数分别为: 邮箱, 显示的昵称(只用于显示, 没有特别的要求), 昵称的字符集编码
        * */
        mimeMessage.setFrom(new InternetAddress("xiuhong.chen@hand-china.com","xiuhong","UTF-8"));
        /*3.设置收件人
        To收件人   CC 抄送  BCC密送*/
        mimeMessage.setRecipient(MimeMessage.RecipientType.TO,new InternetAddress("17862***@qq.com","xiuhong","UTF-8"));
        mimeMessage.addRecipient(MimeMessage.RecipientType.TO,new InternetAddress("178622***@qq.com","xiuhong","UTF-8"));
 
        /*4.设置标题和内容*/
        mimeMessage.setSubject("测试邮件","UTF-8");
        mimeMessage.setContent("Test Content:这是一封测试邮件...","text/html;charset=UTF-8");
        mimeMessage.setSentDate(new Date());
 
        /*5.保存邮件*/
        mimeMessage.saveChanges();
 
        Transport transport = session.getTransport("smtp"); //获取邮件传输对象
        transport.connect("mail.hand-china.com","xiuhong.chen@hand-china.com","*******");
        transport.sendMessage(mimeMessage,mimeMessage.getAllRecipients());
        transport.close();
 
        System.out.println("sendMailServlet-----end");
    }
```

某些邮箱服务器要求 SMTP 连接需要使用 SSL 安全认证 (为了提高安全性, 邮箱支持SSL连接, 也可以自己开启),如果无法连接邮件服务器, 仔细查看控制台打印的 log, 如果有有类似 “连接失败, 要求 SSL 安全连接” 等错误,需要开启SSL安全连接,如下代码:

```java
/*SMTP 服务器的端口 (非 SSL 连接的端口一般默认为 25, 可以不添加, 如果开启了 SSL 连接,需要改为对应邮箱的 SMTP 服务器的端口, 具体可查看对应邮箱服务的帮助,
QQ邮箱的SMTP(SLL)端口为465或587, 其他邮箱自行去查看)*/
final String smtpPort = "465";
props.setProperty("mail.smtp.port", smtpPort);
props.setProperty("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
props.setProperty("mail.smtp.socketFactory.fallback", "false");
props.setProperty("mail.smtp.socketFactory.port", smtpPort);
```

## 3.创建一封包含图片和附件的复杂邮件

一封复杂的邮件内容可以看做是由很多节点（或者可以说是“片段”/“部分”/“零件”）组成，文本、图片、附件等都可以看成是邮件内容中的一个节点。

这些节点之间又可以相互关联组合成一个节点。

最终组合成一个大节点就是邮件的正文内容。

比如图片和文字是关联关系related,和简单邮件不同之处在于设置图片节点和文本节点

```java
/*创建复杂邮件*/
    public void sendMail2()throws Exception{
        System.out.println("sendMailServlet-----start2");
 
        //1.创建邮件对象
        Properties properties = new Properties();
        properties.put("mail.smtp.host", "mail.hand-china.com"); // 指定SMTP服务器
        properties.put("mail.smtp.auth", "true"); // 指定是否需要SMTP验证
        Session session = Session.getInstance(properties);
        MimeMessage message =new MimeMessage(session);
 
        /*2.设置发件人
        * 其中 InternetAddress 的三个参数分别为: 邮箱, 显示的昵称(只用于显示, 没有特别的要求), 昵称的字符集编码
        * */
        message.setFrom(new InternetAddress("xiuhong.chen@hand-china.com","xiuhong","UTF-8"));
        /*3.设置收件人
        To收件人   CC 抄送  BCC密送*/
        message.setRecipient(MimeMessage.RecipientType.TO,new InternetAddress("17862****@qq.com","xiuhong","UTF-8"));
        message.addRecipient(MimeMessage.RecipientType.TO,new InternetAddress("17862*****@qq.com","xiuhong","UTF-8"));
 
        /*4.设置标题*/
        message.setSubject("测试邮件","UTF-8");
        //message.setContent("Test Content:这是一封测试邮件...","text/html;charset=UTF-8");
 
        /*5.设置邮件正文*/
 
        //一个Multipart对象包含一个或多个bodypart对象，组成邮件正文
        MimeMultipart multipart = new MimeMultipart();
        //读取本地图片,将图片数据添加到"节点"
        MimeBodyPart image = new MimeBodyPart();
        DataHandler dataHandler1 = new DataHandler(new FileDataSource("C:\\Users\\Chen Xiuhong\\Pictures\\suo.png"));
        image.setDataHandler(dataHandler1);
        image.setContentID("image_suo");
 
        //创建文本节点
        MimeBodyPart text = new MimeBodyPart();
        text.setContent("这张图片是锁<br/><img src='cid:image_suo'/>","text/html;charset=UTF-8");
 
        //将文本和图片添加到multipart
        multipart.addBodyPart(text);
        multipart.addBodyPart(image);
        multipart.setSubType("related");//关联关系
 
        message.setContent(multipart);
 
        message.setSentDate(new Date());
        message.saveChanges();
        Transport transport = session.getTransport("smtp");
        transport.connect("mail.hand-china.com","xiuhong.chen@hand-china.com","******");
        transport.sendMessage(message,message.getAllRecipients());
        transport.close();
 
        System.out.println("sendMailServlet-----end2");
    }
```

## 下边发送一封即有图片文字,又有多个附件的邮件,设置节点关系为混合关系mixed.

```java
public void sendMail2()throws Exception{
        System.out.println("sendMailServlet-----start2");
 
        //1.创建邮件对象
        Properties properties = new Properties();
        properties.put("mail.smtp.host", "mail.hand-china.com"); // 指定SMTP服务器
        properties.put("mail.smtp.auth", "true"); // 指定是否需要SMTP验证
        Session session = Session.getInstance(properties);
        MimeMessage message =new MimeMessage(session);
 
        /*2.设置发件人
        * 其中 InternetAddress 的三个参数分别为: 邮箱, 显示的昵称(只用于显示, 没有特别的要求), 昵称的字符集编码
        * */
        message.setFrom(new InternetAddress("xiuhong.chen@hand-china.com","xiuhong","UTF-8"));
        /*3.设置收件人
        To收件人   CC 抄送  BCC密送*/
        message.setRecipient(MimeMessage.RecipientType.TO,new InternetAddress("178622****@qq.com","xiuhong","UTF-8"));
        message.addRecipient(MimeMessage.RecipientType.TO,new InternetAddress("17862****9@qq.com","xiuhong","UTF-8"));
 
        /*4.设置标题*/
        message.setSubject("测试邮件","UTF-8");
        //message.setContent("Test Content:这是一封测试邮件...","text/html;charset=UTF-8");
 
        /*5.设置邮件正文*/
 
        //一个Multipart对象包含一个或多个bodypart对象，组成邮件正文
        MimeMultipart multipart = new MimeMultipart();
        //读取本地图片,将图片数据添加到"节点"
        MimeBodyPart image = new MimeBodyPart();
        DataHandler dataHandler1 = new DataHandler(new FileDataSource("C:\\Users\\Chen Xiuhong\\Pictures\\suo.png"));
        image.setDataHandler(dataHandler1);
        image.setContentID("image_suo");
 
        //创建文本节点
        MimeBodyPart text = new MimeBodyPart();
        text.setContent("这张图片是��锁<br/><img src='cid:image_suo'/>","text/html;charset=UTF-8");
 
        //创建附件节点  读取本地文件,并读取附件名称
        MimeBodyPart file1 = new MimeBodyPart();
        DataHandler dataHandler2 = new DataHandler(new FileDataSource("C:\\Users\\Chen Xiuhong\\Pictures\\clothes.png"));
        file1.setDataHandler(dataHandler2);
        file1.setFileName(MimeUtility.encodeText(dataHandler2.getName()));
 
        MimeBodyPart file2 = new MimeBodyPart();
        DataHandler dataHandler3 = new DataHandler(new FileDataSource("C:\\Users\\Chen Xiuhong\\Downloads\\list.xlsx"));
        file2.setDataHandler(dataHandler3);
        file2.setFileName(MimeUtility.encodeText(dataHandler3.getName()));
 
        //将文本和图片添加到multipart
        multipart.addBodyPart(text);
        multipart.addBodyPart(image);
        multipart.addBodyPart(file1);
        multipart.addBodyPart(file2);
        multipart.setSubType("mixed");//混合关系
 
        message.setContent(multipart);
 
        message.setSentDate(new Date());
        message.saveChanges();
        Transport transport = session.getTransport("smtp");
        transport.connect("mail.hand-china.com","xiuhong.chen@hand-china.com","*******");
        transport.sendMessage(message,message.getAllRecipients());
        transport.close();
        Boolean isFlag = true;
        logger.info(Calendar.getInstance().getTime()+" : # Send mail to "+" success #");
 
        System.out.println("sendMailServlet-----end2");
    }
```

一般项目中是不会从本地读取文件,需要动态生成文件,这个时候我们可以把生成的文件写入inputStream中,然后传递到sendmail方法中,来创建附件节点,具体代码如下:

```java
MimeBodyPart fileBody = new MimeBodyPart();
DataSource source = new ByteArrayDataSource(inputStream, "application/msexcel");
fileBody.setDataHandler(new DataHandler(source));
fileBody.setFileName(MimeUtility.encodeText(fileName));
```


# JavaMail发送邮件（超详细） 

## 一：邮件发送的基本概念

本文我将阐述使用JavaMail方式发送和接收Email的详细说明，本博客本着以后遇到类似的邮件发送需求可以直接把代码粘过去直接使用，快捷方便省时间，对于刚接触的JavaMail的朋友们还是把文章过一遍，虽然本文不是最好的，但是我可以保证你能成功发送邮件；

关于邮件还有一些基本知识我将在下面简单介绍，关于邮件发送和接收的流程可以参考 邮件基本概念及发送方式

## 1：邮件中的几个名词

```
发件人：
    指的是用哪个邮箱进行发送邮件的人
收件人：
    指的是接收发件人发过来邮件的人，代表这封邮件面向的读者。可以是零个到多个。
抄送人：
    指的是发件人把邮件发送给收件人的同时并抄送一份发给抄送人；此时抄送人可以看到收件人、抄送人的邮箱
密送人：
    指的是发件人把邮件发送给收件人的同时并抄送一份发给密送人；此时抄送人可以看到收件人、抄送人的邮箱，无法看到密送人的邮箱

说明：抄送人和密送人一般用于项目组A给项目组B发送邮件确认流程，这时项目组A还要告知领导我已经把方案流程发送给项目组B了；
    这时我就要把流程方案抄送一份给领导，就可以用到抄送和密送，此邮件领导是不用回复的
```

## 2. 发送方式

[JavaMail 具体使用说明参考Oracle官网给出的API](https://www.oracle.com/java/technologies/javamail-api.html)

[Jakarta Mail 具体使用说明参考Jakarta官方给出的API](https://eclipse-ee4j.github.io/mail/#API_Documentation)

```
1：javax.*
    也是java标准的一部分，但是没有包含在标准库中，一般属于标准库的扩展。通常属于某个特定领域，不是一般性的api。
    所以以扩展的方式提供api，以避免jdk的标准库过大。当然某些早期的javax，后来被并入到标准库中，所有也应该属于新版本JDK的标准库。
    比如jmx，java5以前是以扩展方式提供，但是jdk5以后就做为标准库的一部分了，所有javax.management也是jdk5的标准库的一部分。
2：com.sun.*
    是sun的hotspot虚拟机中java.* 和javax.*的实现类。因为包含在rt中，所以我们也可以调用。但是因为不是sun对外公开承诺的接口，
    所以根据根据实现的需要随时增减，因此在不同版本的hotspot中可能是不同的，而且在其他的jdk实现中是没有的，调用这些类，
　　 可能不会向后兼容，一般不推荐使用

下面介绍的发送邮件的几种方式：
    ①：使用javax.mail的坐标依赖包（导包时看清楚是不是javax.mail的）
        <!--JavaMail基本包-->
        <dependency>
            <groupId>javax.mail</groupId>
            <artifactId>mail</artifactId>
            <version>1.4.7</version>
        </dependency>
        <!--邮件发送的扩展包-->
        <dependency>
            <groupId>javax.activation</groupId>
            <artifactId>activation</artifactId>
            <version>1.1.1</version>
        </dependency>
        注：坐标必须为两个，因为javax.mail没有携带依赖包javax.activation（发送）
    ②：使用com.sun.mail的坐标依赖包（不推荐使用，这里我没讲了，下面是它的坐标，坐标内携带javax.activation依赖）
        <!-- https://mvnrepository.com/artifact/com.sun.mail/javax.mail -->
        <!--使用Sun提供的Email工具包-->
        <dependency>
            <groupId>com.sun.mail</groupId>
            <artifactId>javax.mail</artifactId>
            <version>1.6.2</version>
        </dependency>
    ③：使用Jakarta Mail发送邮件（和javax.mail使用方式基本一样，不过它内部携带了javax.activation依赖包）
        <dependency>
            <groupId>com.sun.mail</groupId>
            <artifactId>jakarta.mail</artifactId>
            <version>1.6.7</version>
        </dependency>
　　③：使用SpringBoot集成邮件发送（跳转此博客）
　　　　注：SpringBoot集成邮件发送底层使用Jakarta Mail技术

注：javax.JavaMail最后一个版本发布于2018年8月，后期发送邮件最好使用Jakarta Mail（它是javaMail的前身）；总结：不借助SpringBoot的情况下使用 javax.JavaMail 或 Jakarta Mail 方式
```

## 二：JavaMailAPI简单说明

### 1：Session类

javax.mail.Session类用于定义整个应用程序所需的环境信息，以及收集客户端与邮件服务器建立网络连接的会话信息，例如邮件服务器的主机名、端口号、采用的邮件发送和接收协议等。

Session 对象根据这些信息构建用于邮件收发的Transport和Store对象，以及为客户端创建Message对象时提供信息支持。

```java
Session getInstance(Properties props)
Session getInstance(Properties props, Authenticator authenticator)
说明：获取一个新的Session对象
    参数：
        props：为Session会话域提供默认值
             mail.store.protocol：接收邮件时分配给协议的名称
             mail.transport.protocol：发送邮件时分配给协议的名称
             mail.host：邮箱服务器地址
             mail.user：发件人名称
             mail.from：发件人邮箱
        authenticator：
            用于在需要用户名和密码时回调应用程序
```

### 2：Message类

　　javax.mail.Message类是创建和解析邮件的核心API，这是一个抽象类，通常使用它的子类javax.mail.internet.MimeMessage类。它的实例对象表示一份电子邮件。客户端程序发送邮件时，首先使用创建邮件的JavaMail API创建出封装了邮件数据的Message对象，然后把这个对象传递给邮件发送API（Transport 类） 发送，客户端程序接收邮件时，邮件接收API把接收到的邮件数据封装在Message类的实例中，客户端程序在使用邮件解析API从这个对象中解析收到的邮件数据。

### 3：Transport类

　　javax.mail.Transport类是发送邮件的核心API类，它的实例对象代表实现了某个邮件发送协议的邮件发送对象，例如SMTP协议，客户端程序创建好Message对象后，只需要使用邮件发送API得到Transport对象，然后把Message对象传递给Transport 对象，并调用它的发送方法，就可以把邮件发送给指定的SMTP服务器。

### 4：Store类

　　javax.mail.Store类是接收邮件的核心API类，它的实例对象代表实现了某个邮件接收协议的邮件接收对象，例如POP3协议，客户端程序接收邮件时，只需要使用邮件接收API得到Store对象，然后调用Store对象的接收方法，就可以从指定的POP3服务器获得邮件数据，并把这些邮件数据封装到表示邮件的 Message 对象中

## 三：使用javax中的JavaMail

### maven 引入

```xml
<!--JavaMail基本包-->
<dependency>
    <groupId>javax.mail</groupId>
    <artifactId>mail</artifactId>
    <version>1.4.7</version>
</dependency>
<!--邮件发送的扩展包-->
<dependency>
    <groupId>javax.activation</groupId>
    <artifactId>activation</artifactId>
    <version>1.1.1</version>
</dependency>
```

### 2：使用JavaMail发送HTML格式邮件

```java
public class JavaxJavaMailClient {

    public String emailHost = "smtp.163.com";       //发送邮件的主机
    public String transportType = "smtp";           //邮件发送的协议
    public String fromUser = "antladdie";           //发件人名称
    public String fromEmail = "antladdie@163.com";  //发件人邮箱
    public String authCode = "xxxxxxxxxxxxxxxx";    //发件人邮箱授权码
    public String toEmail = "xiaofeng504@qq.com";   //收件人邮箱
    public String subject = "电子专票开具";           //主题信息

    @Test
    public void ClientTestA() throws UnsupportedEncodingException, javax.mail.MessagingException {

        //初始化默认参数
        Properties props = new Properties();
        props.setProperty("mail.transport.protocol", transportType);
        props.setProperty("mail.host", emailHost);
        props.setProperty("mail.user", fromUser);
        props.setProperty("mail.from", fromEmail);
        //获取Session对象
        Session session = Session.getInstance(props, null);
        //开启后有调试信息
        session.setDebug(true);

        //通过MimeMessage来创建Message接口的子类
        MimeMessage message = new MimeMessage(session);
        //下面是对邮件的基本设置
        //设置发件人：
        //设置发件人第一种方式：直接显示：antladdie <antladdie@163.com>
        //InternetAddress from = new InternetAddress(sender_username);
        //设置发件人第二种方式：发件人信息拼接显示：蚂蚁小哥 <antladdie@163.com>
        String formName = MimeUtility.encodeWord("蚂蚁小哥") + " <" + fromEmail + ">";
        InternetAddress from = new InternetAddress(formName);
        message.setFrom(from);

        //设置收件人：
        InternetAddress to = new InternetAddress(toEmail);
        message.setRecipient(Message.RecipientType.TO, to);

        //设置抄送人(两个)可有可无抄送人：
        List<InternetAddress> addresses = Arrays.asList(new InternetAddress("1457034247@qq.com"), new InternetAddress("575814158@qq.com"));
        InternetAddress[] addressesArr = (InternetAddress[]) addresses.toArray();
        message.setRecipients(Message.RecipientType.CC, addressesArr);

        //设置密送人 可有可无密送人：
        //InternetAddress toBCC = new InternetAddress(toEmail);
        //message.setRecipient(Message.RecipientType.BCC, toBCC);

        //设置邮件主题
        message.setSubject(subject);

        //设置邮件内容,这里我使用html格式，其实也可以使用纯文本；纯文本"text/plain"
        message.setContent("<h1>蚂蚁小哥祝大家工作顺利！</h1>", "text/html;charset=UTF-8");

        //保存上面设置的邮件内容
        message.saveChanges();

        //获取Transport对象
        Transport transport = session.getTransport();
        //smtp验证，就是你用来发邮件的邮箱用户名密码（若在之前的properties中指定默认值，这里可以不用再次设置）
        transport.connect(null, null, authCode);
        //发送邮件
        transport.sendMessage(message, message.getAllRecipients()); // 发送
    }
}
```

## 3：使用JavaMail发送HTML内携带图片邮件格式

```java
public class JavaxJavaMailClient {

    public String emailHost = "smtp.163.com";       //发送邮件的主机
    public String transportType = "smtp";           //邮件发送的协议
    public String fromUser = "antladdie";           //发件人名称
    public String fromEmail = "antladdie@163.com";  //发件人邮箱
    public String authCode = "xxxxxxxxxxxxxxxx";    //发件人邮箱授权码
    public String toEmail = "xiaofeng504@qq.com";   //收件人邮箱
    public String subject = "电子专票开具";           //主题信息

    @Test
    public void ClientTestB() throws IOException, javax.mail.MessagingException {

        // 1：初始化默认参数
        Properties props = new Properties();
        props.setProperty("mail.transport.protocol", transportType);
        props.setProperty("mail.host", emailHost);
        props.setProperty("mail.user", fromUser);
        props.setProperty("mail.from", fromEmail);
        // 2：获取Session对象
        Session session = Session.getInstance(props, null);
        session.setDebug(true);

        // 3：创建MimeMessage对象
        MimeMessage message = new MimeMessage(session);

        // 4：设置发件人、收件人、主题、（内容后面设置）
        String formName = MimeUtility.encodeWord("蚂蚁小哥") + " <" + fromEmail + ">";
        InternetAddress from = new InternetAddress(formName);
        message.setFrom(from);
        InternetAddress to = new InternetAddress(toEmail);
        message.setRecipient(Message.RecipientType.TO, to);
        //设置邮件主题
        message.setSubject(subject);
        //邮件发送时间
        message.setSentDate(new Date());

        // 5：设置多资源内容
        //=============== 构建邮件内容：多信息片段关联邮件 使用Content-Type:multipart/related ===============//
        // 5.1：构建一个多资源的邮件块 用来把 文本内容资源 和 图片资源关联；；；related代表多资源关联
        MimeMultipart text_img_related = new MimeMultipart("related");
        //text_img_related.setSubType("related");
        //注：这里为什么填写related的请去查阅Multipart类型或者去文章开头跳转我之前上一篇邮件介绍

        // 5.2：创建图片资源
        MimeBodyPart img_body = new MimeBodyPart();
        DataHandler dhImg = new DataHandler(JavaxJavaMailClient.class.getResource("static/b.png"));
        img_body.setDataHandler(dhImg); //设置dhImg图片处理
        img_body.setContentID("imgA");  //设置资源图片名称ID

        // 5.3：创建文本资源，文本资源并引用上面的图片ID（因为这两个资源我做了关联）
        MimeBodyPart text_body = new MimeBodyPart();
        text_body.setContent("<img src='cid:imgA' width=100/> 我是蚂蚁小哥！！","text/html;charset=UTF-8");

        // 5.4：把创建出来的两个资源合并到多资源模块了
        text_img_related.addBodyPart(img_body);
        text_img_related.addBodyPart(text_body);
        //===========================================================================================//

        // 6：设置我们处理好的资源（存放到Message）
        message.setContent(text_img_related);

        // 7：保存上面设置的邮件内容
        message.saveChanges();
        // 8：获取Transport对象
        Transport transport = session.getTransport();
        //9：smtp验证，就是你用来发邮件的邮箱用户名密码（若在之前的properties中指定默认值，这里可以不用再次设置）
        transport.connect(null, null, authCode);
        //10：发送邮件
        transport.sendMessage(message, message.getAllRecipients()); // 发送
    }
}
```

## 4：使用JavaMail发送HTML带图片+附件格式邮件

```java
public class JavaxJavaMailClient {

    public String emailHost = "smtp.163.com";       //发送邮件的主机
    public String transportType = "smtp";           //邮件发送的协议
    public String fromUser = "antladdie";           //发件人名称
    public String fromEmail = "antladdie@163.com";  //发件人邮箱
    public String authCode = "xxxxxxxxxxxxxxxx";    //发件人邮箱授权码
    public String toEmail = "xiaofeng504@qq.com";   //收件人邮箱
    public String subject = "电子专票开具";           //主题信息

    @Test
    public void ClientTestC() throws IOException, javax.mail.MessagingException {

        // 1：初始化默认参数
        Properties props = new Properties();
        props.setProperty("mail.transport.protocol", transportType);
        props.setProperty("mail.host", emailHost);
        props.setProperty("mail.user", fromUser);
        props.setProperty("mail.from", fromEmail);
        // 2：获取Session对象
        Session session = Session.getInstance(props, null);
        session.setDebug(true);

        // 3：创建MimeMessage对象
        MimeMessage message = new MimeMessage(session);

        // 4：设置发件人、收件人、主题、（内容后面设置）
        String formName = MimeUtility.encodeWord("蚂蚁小哥") + " <" + fromEmail + ">";
        InternetAddress from = new InternetAddress(formName);
        message.setFrom(from);
        InternetAddress to = new InternetAddress(toEmail);
        message.setRecipient(Message.RecipientType.TO, to);
        //设置邮件主题
        message.setSubject(subject);
        //邮件发送时间
        message.setSentDate(new Date());
        
        //*****邮件内容携带 附件 + （HTML内容+图片）使用Content-Type:multipart/mixed ******//
        // 5：设置一个多资源混合的邮件块 设置此类型时可以同时存在 附件和邮件内容  mixed代表混合
        MimeMultipart mixed = new MimeMultipart("mixed");

        // 5.1：创建一个附件资源
        MimeBodyPart file_body = new MimeBodyPart();
        DataHandler dhFile = new DataHandler(JavaxJavaMailClient.class.getResource("static/a.zip"));
        file_body.setDataHandler(dhFile); //设置dhFile附件处理
        file_body.setContentID("fileA");  //设置资源附件名称ID
        //file_body.setFileName("拉拉.zip");   //设置中文附件名称（未处理编码）
        file_body.setFileName(MimeUtility.encodeText("一个附件.zip"));   //设置中文附件名称

        // 5.2：先把附件资源混合到 mixed多资源邮件模块里
        mixed.addBodyPart(file_body);

        // 5.3：创建主体内容资源存储对象
        MimeBodyPart content = new MimeBodyPart();　　　　 // 把主体内容混合到资源存储对象里　　　　 mixed.addBodyPart(content);
        // 5.4：设置多资源内容
        //=============== 构建邮件内容：多信息片段邮件 使用Content-Type:multipart/related ===============//
        // 5.4.1：构建一个多资源的邮件块 用来把 文本内容资源 和 图片资源合并；；；related代表多资源关联
        MimeMultipart text_img_related = new MimeMultipart("related");
        //text_img_related.setSubType("related");
        //注：这里为什么填写related的请去查阅Multipart类型或者去文章开头跳转我之前上一篇邮件介绍
        // 5.4.2：把关联的把多资源邮件块 混合到mixed多资源邮件模块里
        content.setContent(text_img_related);

        // 5.4.3：创建图片资源
        MimeBodyPart img_body = new MimeBodyPart();
        DataHandler dhImg = new DataHandler(JavaxJavaMailClient.class.getResource("static/b.png"));
        img_body.setDataHandler(dhImg); //设置dhImg图片处理
        img_body.setContentID("imgA");  //设置资源图片名称ID

        // 5.4.4：创建文本资源，文本资源并引用上面的图片ID（因为这两个资源我做了关联）
        MimeBodyPart text_body = new MimeBodyPart();
        text_body.setContent("<img src='cid:imgA' width=100/> 我是蚂蚁小哥！！","text/html;charset=UTF-8");

        // 5.4.5：把创建出来的两个资源合并到多资源模块了
        text_img_related.addBodyPart(img_body);
        text_img_related.addBodyPart(text_body);
        //===========================================================================================//

        // 6：设置我们处理好的资源（存放到Message）
        message.setContent(mixed);

        // 7：保存上面设置的邮件内容
        message.saveChanges();
        // 8：获取Transport对象
        Transport transport = session.getTransport();
        //9：smtp验证，就是你用来发邮件的邮箱用户名密码（若在之前的properties中指定默认值，这里可以不用再次设置）
        transport.connect(null, null, authCode);
        //10：发送邮件
        transport.sendMessage(message, message.getAllRecipients()); // 发送
    }
}
```

## 5：使用JavaMail和Thymeleaf模板发送HTML内嵌图片格式

下面我将使用JavaMail通过Thymeleaf模板的方式发送HTML内容（HTML内容存在资源图片关联）+附件内容，其实这是方式都是通过2~4小节的慢慢改造，学会这种方式，那么我们发送公司业务上的一些邮件是没有太大压力的；下面我不在展示是全部代码，只把补充的代码展示出来，其它的参照第4节代码

```xml
<!--导入thymeleaf坐标-->
<dependency>
    <groupId>org.thymeleaf</groupId>
    <artifactId>thymeleaf</artifactId>
    <version>3.0.12.RELEASE</version>
</dependency>
```

邮件模板

```html
<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        * {padding: 0;margin: 0;}
        h5 {width: 300px;height: 40px;margin: 10px auto;
            text-align: center;font: normal 500 14px/40px '微软雅黑';
            color: rgba(0, 0, 0, .8);border: 1px dashed #1c8b9e;
            border-radius: 5px;box-shadow: 10px 10px 30px 2px #f00;}
        img {width: 300px;height: 40px;}
        div {text-align: center;border: 1px solid #f00;margin: auto;}
    </style>
</head>
<body>
<h5>感谢<span th:text="${name}"></span>同志对我们的肯定和支持！</h5>
<!--注意这个资源一定要引用邮件发送关联的图片资源-->
<div><img src="cid:imgA" alt=""></div>
</body>
</html>

emailTemplate.html模板代码，就以此模板发送资源
```

版本解析：

```java
/***
 * 模板解析方法，解析出一个String的html返回 
 * @return
 */
public String templateHtml(){
    //设置类加载模板处理器
    ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
    //设置前缀后缀
    resolver.setPrefix("/static/");
    resolver.setSuffix(".html");
    //创建模板引擎处理器
    TemplateEngine engine = new TemplateEngine();
    //设置引擎使用的模板文件
    engine.setTemplateResolver(resolver);
    //创建Context来为模板设置填充数据
    Context context = new Context();
    //填充模板里的数据
    context.setVariable("name","蚂蚁小哥");
    //具体处理，把模板和数据合并成一个新的文本
    //注：文件我直接放在resources/templates文件根目录下，如果有多层目录，需要写明文件位置(或者设置过前缀和后缀)
    return engine.process("emailTemplate", context);
}
```






# 参考资料

https://www.cnblogs.com/antLaddie/p/15583991.html

https://www.cnblogs.com/panchanggui/p/9991213.html

[http接口同时传输参数与附件（客户端+服务端）](https://blog.csdn.net/weixin_40496191/article/details/124763978)

[使用java mail 实现发送带附件的邮件功能（过程回顾和总结）](https://blog.csdn.net/weixin_41480687/article/details/106792539)

https://blog.csdn.net/weixin_41480687/article/details/106792539

https://www.cnblogs.com/antLaddie/p/15583991.html

* any list
{:toc}