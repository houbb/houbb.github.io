---
layout: post
title:  web 实战-08-ajax 请求下载文件没有效果
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

使用 ajax 直接下载文件，发现前后端调用都是正常的，但是前端并没有按照预期下载文件。

下面做下记录，避免以后重复采坑。

# 最简单的下载

## 前端

```html
下载：<a href="download?filename=新建文本文档.txt">新建文本文档.txt</a>
```

## 后盾

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

发现可以顺利下载文件。

# ajax 版本

有时候希望做一些参数校验，给用户友好的提示之类的。

于是最简单的就想到使用 ajax 请求去触发。

## 前端

```html
<button id="ajax-one">ajax 下载方式1</button>

<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
<script>
    $(function () {
        $("#ajax-one").on('click', function () {
            // 参数校验之类的
            var fileName = "新建文本文档.txt";
            if(confirm("确认下载吗？年轻人")){
                // 开始下载
                $.ajax({
                    type: "get",
                    url: "download",
                    data: {
                        "filename": fileName
                    },
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            }
        });
    });
</script>
```

## 后端

后端保持不变

## 测试效果

点击之后，并没有下载文件。

而是直接输出了我们文件的内容。。。

## 错误原因

发现原来jQuery的ajax回调已经把response的数据傻瓜式的以字符串的方式解析.

# 解决办法

## 第一种

第一种:将传条件的以表单提交的方式进行(推荐这种)-----这种方式也可以用来页面跳转

```js
$("#queryCourseForm").attr("action",contextPath+"/downCourses.do");//改变表单的提交地址为下载的地址
$("#queryCourseForm").submit();//提交表单
```


## 第二种

第二种:以window.location.href="xxx"的方式请求下载地址

```js
window.location.href=contextPath+"/downCourses.do"
```

这种方法需要自己手动的拼接地址传递参数。get请求携带参数的方式:   xxxx.html?username=xxx&password=xxxx

## 第三种:

动态创建表单加到fbody中，最后删除表单(推荐这种,可以将组合条件的值也动态的加入表单中)

```js
//动态创建表单加到fbody中，最后删除表单
var queryForm = $("#queryCourseForm");
var exportForm = $("<form action='/downCourses.do' method='post'></form>")     
exportForm.html(queryForm.html());
$(document.body).append(exportForm);
exportForm.submit();
exportForm.remove();
```

注意:动态form必须加到DOM树，否则会报异常:Form submission canceled because the form is not connected。而且提交完需要删除元素。

## 个人选择

选择第一种，主要是便于维护。

# 参考资料

[ajax下载文件](https://www.cnblogs.com/qlqwjy/p/8971207.html)

* any list
{:toc}