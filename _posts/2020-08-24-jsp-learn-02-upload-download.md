---
layout: post
title:  jsp 学习笔记-02-JSP 实现文件上传下载
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 基础知识

现在看来使用JSP+Servlet实现文件的上传与下载已经是有些落后了，现在能很方便实现文件的上传与下载插件和工具有很多，常用的有SmartUpload插件、Struts2框架以及富文本编辑器等等。
 
但是作为一个合格的程序员，我认为还是有必要了解一下使用JSP+Servlet最原始的读取文件流来实现文件的上传与下载。

## enctype 属性

要使用JSP通过表单实现文件的上传与下载，首先就必须要了解 enctye 这个属性，enctype 属性是规定在发送到服务器之前应该如何对表单数据进行编码。

enctype常用的属性值有3个：

第一个是 `application/x-www-form-urlencoded`, 这是默认的编码方式，它只处理表单域里的value属性值，采用这种编码方式的表单会将表单域的值处理成URL编码方式。

第二种是 `multipart/form-data`，这种编码方式的表单会以二进制流的方式来处理表单数据，同时，这种编码方式也会把文件域指定文件的内容封装到请求参数里，

第三种就是text/plain，这种方式主要适合用于直接通过表单发送邮件的方式。
 
## 上传下载

我们要使用JSP实现文件的上传和下载，这里的enctype属性的属性值一定要选 `multipart/form-data`，让表单提交的数据以二进制编码的方式提交，在接收此请求的Servlet中用二进制流来获取内容，就可以取得上传文件的内容，从而实现文件的上传。

## 上传例子

- 首页代码

```java
/**
 * 实现文件上传
 *
 * @param request  请求
 * @param response 响应
 * @return
 */
@GetMapping(value = "/file")
public String index(HttpServletRequest request,
                    HttpServletResponse response) {
    return "file";
}
```

- file.jsp

跳转到的对应页面内容为：

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 实现文件上传和下载</title>
</head>
<body>
<form action="upload" method="post" enctype="multipart/form-data" >
    请选择文件：
    <input id="file" name="file" type="file" />
    <input type="submit" value="上传"/>
    上传结果：${result}
</form>

下载：<a href="download?filename=新建文本文档.txt">新建文本文档.txt</a>

</body>
</html>
```

- 上传核心代码

```java
package com.github.houbb.jsp.learn.hello.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class FileController {

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @GetMapping(value = "/file")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "file";
    }

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @PostMapping(value = "/file2")
    public String file2(HttpServletRequest request,
                        HttpServletResponse response) {
        return "file";
    }


    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return 页面
     */
    @PostMapping(value = "/upload")
    public String upload(HttpServletRequest request,
                         HttpServletResponse response) throws IOException, ServletException {
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

}
```

### 校验

这里可以对文件的类型，大小等做一定程度的校验。

### stream 构建的形式

这里是借助 spring 的 MultipartFile 封装，其实也可以使用 apache-commons，后续会讲解。

这里直接通过 `multipartFile.getBytes()` 获取文件内容，也可以通过流的方式构建：

```java
//从request中获取文本输入流信息
InputStream fileSourceStream = request.getInputStream();
//设置临时文件，保存待上传的文本输入流
File tempFile = new File("F:/tempFile/temp.txt");

//outputStram文件输出流指向这个tempFile
FileOutputStream outputStream = new FileOutputStream(tempFile);

//读取文件流
byte temp[] = new byte[1024];
int n;
while((n = fileSourceStream.read(temp)) != -1){
	outputStream.write(temp, 0, n);
}
outputStream.close();
fileSourceStream.close();
```

当然，这里建议使用 TWR 替代这种写法，此处不展开讨论。

- forward 

这里为了和 post 请求保持一致，所以写了一个 forward 的方法，也是返回 file.jsp

```java
/**
 * 实现文件上传
 *
 * @param request  请求
 * @param response 响应
 * @return
 */
@PostMapping(value = "/file2")
public String file2(HttpServletRequest request,
                    HttpServletResponse response) {
    return "file";
}
```

## 下载

相对上传，下载要简单的多。

`<a href="download?filename=新建文本文档.txt">新建文本文档.txt</a>`

这里就是一个简单的 get 请求

```java
/**
 * 实现文件下载
 *
 * @param request  请求
 * @param response 响应
 */
@GetMapping(value = "/download")
public void download(HttpServletRequest request,
                       HttpServletResponse response) throws IOException, ServletException {
    //设置保存上传文件的路径
    String filename = request.getParameter("filename");
    String uploadDir = request.getServletContext().getRealPath("/WEB-INF/upload/");
    File file = new File(uploadDir + filename);
    // 根据客户端，选择信息
    response.addHeader("content-Type", "application/octet-stream");
    String agent = request.getHeader("User-Agent");
    if (agent.toLowerCase().indexOf("chrome") > 0) {
        response.addHeader("content-Disposition", "attachment;filename=" + new String(filename.getBytes(StandardCharsets.UTF_8),
                "ISO8859-1"));
    } else {
        response.addHeader("content-Disposition", "attachment;filename=" + URLEncoder.encode(filename, "UTF-8"));
    }
    try(InputStream in = new FileInputStream(file);
        ServletOutputStream out = response.getOutputStream();) {
        byte[] bs = new byte[1024];
        int len = -1;
        while ((len = in.read(bs)) != -1) {
            out.write(bs, 0, len);
        }
        out.flush();
    }
}
```


### 报错

一开始，总是报下面的错误。

异常信息：

```
java.lang.IllegalStateException: getOutputStream() has already been called for this response
	at org.apache.catalina.connector.Response.getWriter(Response.java:624) ~[tomcat-embed-core-8.5.29.jar:8.5.29]
```

后来发现是，download 我想跳转页面导致的，其实不需要跳转，直接不返回即可。

## 前端 axios 实现

```js
doExport() {
    var req = {
        id: this.queryForm.id,
        roleId: this.queryForm.roleId,
        roleName: this.queryForm.roleName,
        remark: this.queryForm.remark,
        operatorId: this.queryForm.operatorId,
        createTime: this.queryForm.createTime,
        updateTime: this.queryForm.updateTime,
    }

    console.log("请求：" + JSON.stringify(req));
    //axios 中的 this 并不指向 vue
    var _this = this;
    axios({ // 用axios发送post请求
        method: 'post',
        url: '/role/export', // 请求地址
        data: req, // 参数
        responseType: 'blob', // 表明返回服务器返回的数据类型
        headers: {'Content-Type': 'application/json'}
    }).
    then(function (response) {
        let fileName = window.decodeURI(response.headers['content-disposition'].split('=')[1]);
        let link = document.createElement("a");
        const blob =new Blob([response.data]);
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank";
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch(function (error) {
        ELEMENT.Message.error("请求失败");
        console.log(error);
    });
},
```

这种实现还是比较麻烦的，可以使用 `<a>` 标签替代，或者 localtion.href 直接修改链接地址。

# 指定返回值

## 说明

很多例子，导出都是直接导出的，没有给前端任何响应，这里存在一个问题。

如果参数错误等，会导致很麻烦。

## 后端实现

```java
/**
* 导出
* @param pageReq 入参
* @param response 响应
*/
@RequestMapping("/export")
@ResponseBody
@CrossOrigin
public BaseResp export(@RequestBody RolePagePo pageReq, HttpServletResponse response) {
    final String fileName = "文件导出-角色-" + System.currentTimeMillis() + ".xls";
    File file = new File(fileName);
    try {
        if("1".equals(pageReq.getRoleId())) {
            return RespUtil.fail("角色标识禁止为1");
        }


        pageReq.setPageNum(1);
        pageReq.setPageSize(Integer.MAX_VALUE);
        BasePageInfo<Role> pageInfo = roleService.pageQueryList(pageReq);
        // 直接写入到文件
        ExcelHelper.write(file.getAbsolutePath(), pageInfo.getList());
        // 根据客户端，选择信息
        response.addHeader("content-Type", "application/octet-stream");
        response.addHeader("content-Disposition", "attachment;filename=" + URLEncoder.encode(fileName, "UTF-8"));
        try(InputStream in = new FileInputStream(file);
            ServletOutputStream out = response.getOutputStream();) {
            byte[] bs = new byte[1024];
            int len = -1;
            while ((len = in.read(bs)) != -1) {
                out.write(bs, 0, len);
            }
            out.flush();
        }
        return RespUtil.success();
    } catch (Exception e) {
        return RespUtil.fail(e.getMessage());
    } finally {
        FileUtil.deleteFile(file);
    }
}
```

注意，下面的代码是我故意添加的，用来模拟错误的情况。

```java
if("1".equals(pageReq.getRoleId())) {
    return RespUtil.fail("角色标识禁止为1");
}
```

## 前端 axios 实现

参考下面的文章：

```
// https://blog.csdn.net/qq_37246828/article/details/90080614
// https://www.h5w3.com/16051.html
```

实现如下：

```js
//axios 中的 this 并不指向 vue
var _this = this;
axios({ // 用axios发送post请求
    method: 'post',
    url: '/role/export', // 请求地址
    data: req, // 参数
    responseType: 'blob', // 表明返回服务器返回的数据类型
    headers: {'Content-Type': 'application/json'}
}).
then(function (response) {
    console.log(response);
    // https://blog.csdn.net/qq_37246828/article/details/90080614
    // https://www.h5w3.com/16051.html
    let contentType = response.headers['content-type'];
    console.log('内容类型：' + contentType);
    // 或者调整为以 xxx 开始
    // 如果服务器错误返回
    if (response.data.type === 'application/json') {
        let reader = new FileReader();
        reader.readAsText(response.data, 'utf-8');
        reader.onload = function (e) {
            console.log("====",JSON.parse(reader.result));
            console.log("====",JSON.parse(e.target.result));
        }
    } else {
        let fileName = window.decodeURI(response.headers['content-disposition'].split('=')[1]);
        let link = document.createElement("a");
        const blob =new Blob([response.data]);
        link.href = window.URL.createObjectURL(blob);
        link.target = "_blank";
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}).catch(function (error) {
    ELEMENT.Message.error("请求失败");
    console.log(error);
});
```

如果导出正常，那么返回的肯定是 blob 类型。

如果返回的是 `application/json`，则说明异常，可以对其进行 json 转换，获取对应的 json 信息，进行页面展示。

## 兼容 IE10+

上面的代码已经非常完善了，但是依然存在一个问题。

无法在 IE 浏览器执行下载操作。

可以改良如下：

```js
//axios 中的 this 并不指向 vue
var _this = this;
axios({ // 用axios发送post请求
    method: 'post',
    url: '/role/export', // 请求地址
    data: req, // 参数
    responseType: 'blob', // 表明返回服务器返回的数据类型
    headers: {'Content-Type': 'application/json'}
}).
then(function (response) {
    console.log(response);
    // https://blog.csdn.net/qq_37246828/article/details/90080614
    // https://www.h5w3.com/16051.html
    let contentType = response.headers['content-type'];
    console.log('内容类型：' + contentType);
    // 或者调整为以 xxx 开始
    // 如果服务器错误返回
    if (response.data.type === 'application/json') {
        let reader = new FileReader();
        reader.readAsText(response.data, 'utf-8');
        reader.onload = function (e) {
            console.log("====",JSON.parse(reader.result));
            console.log("====",JSON.parse(e.target.result));
        }
    } else {
        let fileName = window.decodeURI(response.headers['content-disposition'].split('=')[1]);

        //  如果支持微软的文件下载方式(ie10+浏览器)
        if (window.navigator.msSaveBlob) {
            try {
                const blobObject = new Blob([response.data]);
                window.navigator.msSaveBlob(blobObject, fileName);
            } catch (e) {
                // 报错误
                console.log(e);
            }
        } else {
            let link = document.createElement("a");
            const blob =new Blob([response.data]);
            link.href = window.URL.createObjectURL(blob);
            link.target = "_blank";
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}).catch(function (error) {
    ELEMENT.Message.error("请求失败");
    console.log(error);
});
```

# commons-fileupload 上传实现

网上最多的还是基于 apache commons 包实现的上传，这里没有真正实践，记录一下：

## 包依赖

需要导入两个包：commons-fileupload-1.2.1.jar,commons-io-1.4.jar

## 上传实现

```java
import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

/**
 * 上传附件
 * @author new
 *
 */
public class UploadAnnexServlet extends HttpServlet {

 private static String path = "";

 public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    doPost(request, response);
 }

 /*
 * post处理
 * (non-Javadoc)
 * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
 */
 public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

 path = this.getServletContext().getRealPath("/upload");

 try {
    DiskFileItemFactory factory = new DiskFileItemFactory();
    ServletFileUpload up = new ServletFileUpload(factory);
    List<FileItem> ls = up.parseRequest(request);

    for (FileItem fileItem : ls) {
    if (fileItem.isFormField()) {
    String FieldName = fileItem.getFieldName();
    //getName()返回的是文件名字 普通域没有文件 返回NULL
    //     String Name = fileItem.getName();
    String Content = fileItem.getString("gbk");
    request.setAttribute(FieldName, Content);
    } else {
    
    String nm = fileItem.getName().substring(
    fileItem.getName().lastIndexOf("\\") + 1);
    File mkr = new File(path, nm);
    if (mkr.createNewFile()) {
    fileItem.write(mkr);//非常方便的方法
    }
    request.setAttribute("result", "上传文件成功！");
    }
    }
    } catch (Exception e) {
    e.printStackTrace();
    request.setAttribute("result", "上传失败，请查找原因，重新再试！");
    }
    request.getRequestDispatcher("/pages/admin/annex-manager.jsp").forward(
    request, response);
    }

}
```

# forward 与 redirect

## 基本概念

forward（转发）：

是服务器请求资源,服务器直接访问目标地址的URL,把那个URL的响应内容读取过来,然后把这些内容再发给浏览器.浏览器根本不知道服务器发送的内容从哪里来的,因为这个跳转过程实在服务器实现的，并不是在客户端实现的所以客户端并不知道这个跳转动作，所以它的地址栏还是原来的地址.

redirect（重定向）：

是服务端根据逻辑,发送一个状态码,告诉浏览器重新去请求那个地址.所以地址栏显示的是新的URL.

转发是服务器行为，重定向是客户端行为。

## 区别：

1. 从地址栏显示来说

forward是服务器请求资源,服务器直接访问目标地址的URL,把那个URL的响应内容读取过来,然后把这些内容再发给浏览器.浏览器根本不知道服务器发送的内容从哪里来的,所以它的地址栏还是原来的地址.

redirect是服务端根据逻辑,发送一个状态码,告诉浏览器重新去请求那个地址.所以地址栏显示的是新的URL.

2. 从数据共享来说

forward:转发页面和转发到的页面可以共享request里面的数据.

redirect:不能共享数据.

3. 从运用地方来说

forward:一般用于用户登陆的时候,根据角色转发到相应的模块.

redirect:一般用于用户注销登陆时返回主页面和跳转到其它的网站等

4. 从效率来说

forward:高.

redirect:低.

## 本质区别：

解释一：

一句话，转发是服务器行为，重定向是客户端行为

。为什么这样说呢，这就要看两个动作的工作流程：

转发过程：客户浏览器发送http请求----》web服务器接受此请求--》调用内部的一个方法在容器内部完成请求处理和转发动作----》将目标资源发送给客户;在这里，转发的路径必须是同一个web容器下的url，其不能转向到其他的web路径上去，中间传递的是自己的容器内的request。在客户浏览器路径栏显示的仍然是其第一次访问的路径，也就是说客户是感觉不到服务器做了转发的。

转发行为是浏览器只做了一次访问请求。

重定向过程：客户浏览器发送http请求----》web服务器接受后发送302状态码响应及对应新的location给客户浏览器--》客户浏览器发现是302响应，则自动再发送一个新的http请求，请求url是新的location地址----》服务器根据此请求寻找资源并发送给客户。在这里 location可以重定向到任意URL，既然是浏览器重新发出了请求，则就没有什么request传递的概念了。在客户浏览器路径栏显示的是其重定向的路径，客户可以观察到地址的变化的。重定向行为是浏览器做了至少两次的访问请求的。

解释二：

重定向，其实是两次request,
第一次，客户端request A,服务器响应，并response回来，告诉浏览器，你应该去B。这个时候IE可以看到地址变了，而且历史的回退按钮也亮了。重定向可以访问自己web应用以外的资源。在重定向的过程中，传输的信息会被丢失。

例子：

请求转发是服务器内部把对一个request/response的处理权，移交给另外一个

对于客户端而言，它只知道自己最早请求的那个A，而不知道中间的B，甚至C、D。 传输的信息不会丢失。

解释三：

转发是服务器行为，重定向是客户端行为。 

## 内部机制

两者的内部机制有很大的区别：   

1 请求转发只能将请求转发给同一个WEB应用中的组件，

而重定向还可以重新定向到同一站点不同应用程序中的资源，甚至可以定向到一绝对的URL。   

2 重定向可以看见目标页面的URL，

转发只能看见第一次访问的页面URL，以后的工作都是有服务器来做的。  

3 请求响应调用者和被调用者之间共享相同的request对象和response对象，

重定向调用者和被调用者属于两个独立访问请求和响应过程。   

4 重定向跳转后必须加上return，要不然页面虽然跳转了，但是还会执行跳转后面的语句，

转发是执行了跳转页面，下面的代码就不会在执行了。

# 参考资料

[用JSP+servlet实现文件的上传与下载](https://blog.csdn.net/weixian52034/article/details/52133543/)

[SpringMvc（4-1）Spring MVC 中的 forward 和 redirect](https://www.cnblogs.com/lexiaofei/p/7044429.html?utm_source=itdadao&utm_medium=referral)

[jsp+servlet实现文件上传与下载功能](https://www.jb51.cc/jsp/497191.html)

[getOutputStream() has already been called for this response 从了解到解决](https://blog.csdn.net/TimerBin/article/details/90295451)

[Cannot create a session after the response has been committed](https://blog.csdn.net/hanchao5272/article/details/80540751)

[SpringMvc（4-1）Spring MVC 中的 forward 和 redirect](https://www.cnblogs.com/lexiaofei/p/7044429.html?utm_source=itdadao&utm_medium=referral)

[请求转发（Forward）和重定向（Redirect）的区别](https://www.cnblogs.com/Qian123/p/5345527.html)

[jsp+servlet实现文件上传与下载功能](http://www.ddpool.cn/article/6187.html)

* any list
{:toc}