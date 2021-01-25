---
layout: post
title:  web 实战-10-HTTP post 请求发送文件信息
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

前面几节谈到，通过前端指定 form 表单，然后后端直接解析。

前后端分离的时候，这个问题就会变得比较麻烦。

不过这里又有了一个新的问题，如果我想通过 post 请求调用其他服务器，传递文件信息，应该怎么办呢？

# 思路1

前端通过 jsp 或者 contoroller，将文件上传到文件服务器。

然后通过比较简单的参数传递调用后端。

# 思路2：HTTP 请求模拟

如果要用java.net.HttpURLConnection来实现文件上传，还真有点搞头，实现思路和具体步骤就是模拟页面的请求，页面发出的格式如下：

## 前端 form 

```html
<form enctype="multipart/form-data" action="http://192.168.29.65/UploadFile" method=post>
    load multi files :<br>
    <input name="userfile1" type="file"><br>
    <input name="userfile2" type="file"><br>
    <input name="userfile3" type="file"><br>
    <input name="userfile4" type="file"><br>
    text field :<input type="text" name="text" value="text"><br>
    <input type="submit" value="提交"><input type=reset>
</form>
```

## 客户端发送内容构造

假设接受文件的网页程序位于 http://192.168.29.65/upload_file/UploadFile.

假设我们要发送一个二进制文件、一个文本框表单项、一个密码框表单项。

文件名为 E:\s ，其内容如下：（其中的XXX代表二进制数据，如 01 02 03）

```
a
bb
XXX
ccc
```

## 发送请求

### 基础知识

客户端应该向 192.168.29.65 发送如下内容：

```
POST /upload_file/UploadFile HTTP/1.1
Accept: text/plain, */*
Accept-Language: zh-cn
Host: 192.168.29.65:80
Content-Type:multipart/form-data;boundary=---------------------------7d33a816d302b6
User-Agent: Mozilla/4.0 (compatible; OpenOffice.org)
Content-Length: 424
Connection: Keep-Alive
-----------------------------7d33a816d302b6
Content-Disposition: form-data; name="userfile1"; filename="E:\s"
Content-Type: application/octet-stream
a
bb
XXX
ccc
-----------------------------7d33a816d302b6
Content-Disposition: form-data; name="text1"
foo
-----------------------------7d33a816d302b6
Content-Disposition: form-data; name="password1"
bar
-----------------------------7d33a816d302b6--
```

此内容必须一字不差，包括最后的回车。

注意：Content-Length: 424 这里的424是红色内容的总长度（包括最后的回车）

注意这一行：

```
Content-Type: multipart/form-data; boundary=---------------------------7d33a816d302b6
```

根据 rfc1867, multipart/form-data是必须的.---------------------------7d33a816d302b6 是分隔符，分隔多个文件、表单项。

其中33a816d302b6 是即时生成的一个数字以确保整个分隔符不会在文件或表单项的内容中出现。

前面的 ---------------------------7d 是 IE 特有的标志。 

Mozila 为---------------------------71。

注意 `enctype="multipart/form-data", method=post, type="file"` 。

根据 rfc1867, 这三个属性是必须的。multipart/form-data 是新增的编码类型，以提高二进制文件的传输效率。

具体的解释请参阅 rfc1867。

## 后端接受代码

现在第三方的 http upload file 工具库很多。

Jarkata 项目本身就提供了fileupload 包http://jakarta.apache.org/commons/fileupload/ 。

文件上传、表单项处理、效率问题基本上都考虑到了。

在 struts 中就使用了这个包，不过是用 struts 的方式另行封装了一次。这里我们直接使用 fileupload 包

。至于struts 中的用法，请参阅 struts 相关文档。

这个处理文件上传的 servelet 主要代码如下：

```java
public void doPost( HttpServletRequest request, HttpServletResponse response ) {
    DiskFileUpload diskFileUpload = new DiskFileUpload();
    // 允许文件最大长度
    diskFileUpload.setSizeMax( 100*1024*1024 );
    // 设置内存缓冲大小
    diskFileUpload.setSizeThreshold( 4096 );
    // 设置临时目录
    diskFileUpload.setRepositoryPath( "c:/tmp" );
    List fileItems = diskFileUpload.parseRequest( request );
    Iterator iter = fileItems.iterator();
    for( ; iter.hasNext(); ) {
        FileItem fileItem = (FileItem) iter.next();
        if( fileItem.isFormField() ) {
            // 当前是一个表单项
            out.println( "form field : " + fileItem.getFieldName() + ", " + fileItem.getString() );
        } else {
            // 当前是一个上传的文件
            String fileName = fileItem.getName();
            fileItem.write( new File("c:/uploads/"+fileName) );
        }
    }
}
```

为简略起见，异常处理，文件重命名等细节没有写出。

# JSP 是在服务端运行的吗？

1、客户端在通过浏览器访问服务器端存放的JSP时，JSP中的java代码、标签等是在服务器端运行的，生成普通的html，最终返回客户端的是这些html。

JSP在服务器端是被编译成为servlet的，这些servlet负责提供html的输出，因此说JSP和Servlet一样属于服务器端的技术。但是从地址栏里输入的可能有jsp后缀，并不表示它就是客户端运行的。

2、jsp页面是在web服务器上运行的。

jsp页面需要加载类似tomcat服务器上，通过内部转换成servlet加载执行，返回执行的结果，也就是转换后的html格式的数据，经过浏览器解析，呈现给用户。

# 自己的实现思路

## 模拟请求

首先观察一下参数到底是什么？

```html
<form action="param" method="post" enctype="multipart/form-data" >
    请选择文件：
    <input name="file" type="file" />
    <input name="name" type="text" />
    <input name="password" type="password" />
    <input type="submit" value="参数测试"/>
</form>
```

## 后端解析

```java
/**
 * 实现文件上传
 *
 * @param request  请求
 * @param response 响应
 * @return 页面
 */
@PostMapping(value = "/param")
public String param(HttpServletRequest request,
                    HttpServletResponse response) throws IOException {
    if (request instanceof StandardMultipartHttpServletRequest) {
        StandardMultipartHttpServletRequest sm = (StandardMultipartHttpServletRequest) request;
        MultipartFile multipartFile = sm.getFile("file");
        String filename = multipartFile.getOriginalFilename();
        //设置保存上传文件的路径
        String uploadDir = request.getServletContext().getRealPath("/WEB-INF/upload/");
        File fileUpload = new File(uploadDir + filename);
        //1. 创建文件
        fileUpload.createNewFile();
        // 写入文件
        try (FileOutputStream fos = new FileOutputStream(fileUpload);
             BufferedOutputStream bos = new BufferedOutputStream(fos);) {
            bos.write(multipartFile.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 返回结果页面
        request.setAttribute("result", "文件上传成功");
    } else {
        request.setAttribute("result", "文件上传失败");
    }
    return "forward:/file2";
}
```

## 核心模拟代码

```java
    /**
     * 模拟 POST 请求
     * @param requestUrl 请求地址
     * @param textMap 普通属性
     * @param fileName 文件名称
     * @param file 文件
     * @return 响应
     */
    public static String doPostWithFile(String requestUrl,
                                        Map<String, String> textMap,
                                        String fileName,
                                        File file) {
        String res = "";
        HttpURLConnection conn = null;
        DataInputStream in = null;
        // boundary就是request头和上传文件内容的分隔符
        final String BOUNDARY = "----WebKitFormBoundary01";
        try {
            URL url = new URL(requestUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(30000);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.setUseCaches(false);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Charset","UTF-8");
            conn.setRequestProperty("Connection", "Keep-Alive");
            conn.setRequestProperty("Content-Type",
                    "multipart/form-data; boundary=" + BOUNDARY);
            OutputStream out = new DataOutputStream(conn.getOutputStream());
            // 普通字段
            if (textMap != null) {
                StringBuilder strBuf = new StringBuilder();
                for(Map.Entry<String,String> entry : textMap.entrySet()) {
                    String inputName = entry.getKey();
                    String inputValue = entry.getValue();
                    if (inputValue == null) {
                        continue;
                    }
                    strBuf.append("\r\n")
                            .append("--")
                            .append(BOUNDARY)
                            .append("\r\n");
                    strBuf.append("Content-Disposition: form-data; name=\"").append(inputName).append("\"\r\n\r\n").append(inputValue);
                }
                out.write(strBuf.toString().getBytes());
            }
            // file 文件部分
            //没有传入文件类型，默认采用application/octet-stream
            String contentType = "application/octet-stream";
            StringBuilder strBuf = new StringBuilder();
            strBuf.append("\r\n")
                    .append("--")
                    .append(BOUNDARY)
                    .append("\r\n");
            strBuf.append("Content-Disposition: form-data; name=\"").append("file").append("\"; filename=\"").append(fileName).append("\"\r\n");

            strBuf.append("Content-Type:")
                    .append(contentType)
                    .append("\r\n\r\n");
            out.write(strBuf.toString().getBytes());

            // 写入文件内容
            in = new DataInputStream(new FileInputStream(file));
            int bytes = 0;
            byte[] bufferOut = new byte[1024];
            while ((bytes = in.read(bufferOut)) != -1) {
                out.write(bufferOut, 0, bytes);
            }
            in.close();

            // 添加请求的结束
            byte[] endData = ("\r\n--" + BOUNDARY + "--\r\n").getBytes();
            out.write(endData);
            out.flush();
            out.close();

            // 读取返回数据
            StringBuilder respBuilder = new StringBuilder();
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                    conn.getInputStream(), "UTF-8"));
            String line = null;
            while ((line = reader.readLine()) != null) {
                respBuilder.append(line).append("\n");
            }
            res = respBuilder.toString();
            reader.close();
        } catch (Exception e) {
            res = e.getMessage();
            e.printStackTrace();
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
            if(in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return res;
    }
```


## 请求报错

```
Content type ‘multipart/form-data；boundary=---- ；charset=UTF-8‘ not support
```

### 解决办法

一是服务接口的请求类型(Content-Type)指定为表单类型: consumes = MediaType.MULTIPART_FORM_DATA_VALUE

```java
@PostMapping(value = "/form/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
void uploadFile(MultipartFile file, HttpServletResponse response, HttpServletRequest request);
```

二是去掉 `@RequestBody` 注解


经测试，直接去掉 `@RequestBody` 注解即可。

个人理解，mvc 请求，表单会自动设置到对象，而不是 json。

## 前端页面回调


# js 实现表单提交

## 表单

```html
<form action="/test/action" method="get" id="myForm">
    <p>First name: <input type="text" name="fname" /></p>
    <p>Last name: <input type="text" name="lname" /></p>
    <input type="button" οnclick="formSubmit()" value="提交" />
</form>
```

## js 代码

```js
function formSubmit() {
    // 提交表单
    document.getElementById("myForm").submit();
}
```


# 参考资料

[java后台发起上传文件的post请求(http和https)](java后台发起上传文件的post请求(http和https))

[[转载]http以post方式上传一个文件，构造其请求头和消息报文](https://www.cnblogs.com/frustrate2/archive/2012/11/07/2759080.html)

[java、 http模拟post上传文件到服务端 模拟form上传文件](https://blog.csdn.net/alen_en/article/details/79481227)

[jsp文件是客户端还是服务器端？](https://blog.csdn.net/family080205/article/details/81709081)

[JAVA_模拟HTTP表单POST文本或文件](https://blog.csdn.net/vvcumt/article/details/8453675)

[java模拟表单上传文件，java通过模拟post方式提交表单实现图片上传功能实例](https://www.cnblogs.com/zdz8207/p/java-httpclient-file.html)

[Content type ‘multipart/form-data；boundary=---- ；charset=UTF-8‘ not support 异常](https://blog.csdn.net/zjhcxdj/article/details/107819168)


* any list
{:toc}