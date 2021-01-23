---
layout: post
title:  web 实战-08-EXCEL 文件导出下载的几种方式
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

对于文件的上传下载是非常常见的需求。

拓展阅读：

[excel 导出最佳实践](https://houbb.github.io/2018/11/07/excel-export)

那么文件下载有哪几种方式呢？

# 方式1：后端同步返回

## 说明

前端调用后端，后端直接获取文件流，然后同步返回。

## 示例代码

```java
@GetMapping(value = "/download")
@CrossOrigin
@ResponseBody
public String download(@RequestParam(value = "fileToken") String fileToken, HttpServletRequest request, HttpServletResponse response){
	File file = null;
	try {
		log.info("开始下载文件 fileToken： {}", fileToken);
		file = service.buildFile(fileToken);
		String fileName = file.getName();
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
		log.info("完成下载文件 fileToken： {}", fileToken);

		// 返回结果
		return success();
	} catch (Exception e) {
		log.error("文件下载遇到错误, fileToken: {}", fileToken, e);
		return fail("99", e.getMessage());
	} finally {
		FileUtils.deleteFile(file);
	}
}
```

`service.buildFile(fileToken);` 是伪代码，可以调整为具体的真实业务。

（1）数据库查询构建文件

（2）从 FTP 等文件服务器下载文件

## 报错

这个页面我在自测的时候是正常的，后来发现有时候会报错

```
UT010029: Stream is closed
java.io.IOException: UT010029: Stream is closed
        at io.undertow.servlet.spec.ServletOutputStreamImpl.write(ServletOutputStreamImpl.java:132)
        at sun.nio.cs.StreamEncoder.writeBytes(StreamEncoder.java:221)
        at sun.nio.cs.StreamEncoder.implFlushBuffer(StreamEncoder.java:291)
        at sun.nio.cs.StreamEncoder.implFlush(StreamEncoder.java:295)
        at sun.nio.cs.StreamEncoder.flush(StreamEncoder.java:141)
        at java.io.OutputStreamWriter.flush(OutputStreamWriter.java:229)
        at org.springframework.util.StreamUtils.copy(StreamUtils.java:119)
```

原因：

在写入文件时调用requestOutputStream.write()方法已将response发出，再在Controller中return时被认为是再发送一次，因而会报错，解决这个问题只需返回null即可。

所以最后还是决定移除返回值，直接返回 void。

如果希望前端有提示，可以不关闭 os 流。

# 方式2：返回页面的方式

这是一种比较秀的方式，以前没接触过，估计只有一些老项目会用到。

## 说明

直接返回一个 JSP 页面，然后业务直接设置对应的 http header，然后获取到对应的信息。

## 代码

### 后端

```java
public String downLoadDetail() {        
    //导出表格名称：
    String fileNameTemp = "导出明细";
    try {         //转码（避免中文乱码）
        String fileName = java.net.URLEncoder.encode(fileNameTemp, "UTF-8");
        getRequest().setAttribute("fileName", fileName);            //查询需要导出的数据：
        List<PrpCommission> prpComList = employeeService.findPrpCommission(downAgentcode, paramYearMonth);
        ActionContext.getContext().put("prpComList", prpComList);
    } catch (Exception e) {
        e.printStackTrace();
        throw new BusinessException("导出时发生异常", false);
    }
    return SUCCESS;
}
```

注意，这里并没有创建文件，而只是查询了数据列表。


### 前端

```jsp
<%@page contentType="text/html;charset=UTF-8"%>
<html>
<head>
    <title>导出</title>
    /* 重点:加如该头文件 */
<%
        response.reset();
        response.setContentType("application/vnd.ms-excel;charset=UTF-8");
        response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", request.getAttribute("fileName").toString()+".xls"));
%>
</head>
<body id="all_title">
    <s:form    action="" namespace="" method="post">
        <table border="1" cellpadding="2" cellspacing="0">
          <tr align="center">
              <td>***</td>
              <td>***</td>
              <td>***</td>
              <td>***</td>
              <td>***</td>
              <td>***</td>
            <td>***</td>
            <td>***</td>
            <td>***</td>
            <td>***</td>
            <td>***</td>
         </tr>
           <s:iterator value="prpComList" id="commission">
               <tr class="sort" align="center">
                   <td><s:property value="#commission.prpSmain.policyNo"/></td>
                   <td><s:property value="#commission.realpolicyid"/></td>
                   <td><s:property value="#commission.prpJpaymentBill.commNo"/></td>
                   <td><s:property value="#commission.companyCode"/></td>
                   <td><s:property value="#commission.companyName"/></td>
                   <td><s:property value="#commission.comCode"/></td>
                   <td><s:property value="#commission.agentCode"/></td>
                   <td><s:property value="#commission.agentName"/></td>
                   <td><s:date name="#commission.generateTime" format="yyyy-MM-dd"/></td>
                   <td><s:property value="#commission.termNum"/></td>
                   <td><s:property value="#commission.agentfee"/></td>
              </tr>
           </s:iterator>
        </table>
    </s:form>
</body>
</html>
```

最核心的就是下面的几行代码：

```java
response.reset();
response.setContentType("application/vnd.ms-excel;charset=UTF-8");
response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", request.getAttribute("fileName").toString(+".xls"));
```

这样访问这个页面，实际上就会直接下载一个 excel 文件。

不过缺点也是有的，实际测试 excel 打开会提示文件损坏之类的，不过不影响使用。

# axios 导出

## 无效的例子

前端实现如下：

```js
download() {
    var req = {
        envName: 'test',
        appName: 'demo',
    }
    // var actualToken = md5(this.form.token);
    axios.post('/config/download', req).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        ELEMENT.Message.error("请求失败");
        console.log(error);
    });
}
```

## 原因

众所周知，Ajax/Axios请求实际上是通过XMLHttpRequest实现的，具体请自行百度。

request请求只是个“字符型”的请求，即请求的内容是以文本类型存放的。

文件的下载是以二进制形式进行，虽然可以读取到返回的response，但只是读取，无法执行。

也就是说前端无法调用到浏览器的下载处理机制和程序。

## 解决方案

通过blob(用来存储二进制大文件)包装ajax（或axios）请求到的data数据，实现下载EXCEL(或其他如图片等)文件。

实现如下：

```js
//案例一
axios：设置返回数据格式为blob或者arraybuffer
如：
    var instance = axios.create({         ... //一些配置
        responseType: 'blob', //返回数据的格式，可选值为arraybuffer,blob,document,json,text,stream，默认值为json
    })
请求时的处理：
　　getExcel().then(res => {
    　　//这里res.data是返回的blob对象    
    　　var blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'}); //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet这里表示xlsx类型
    　　var downloadElement = document.createElement('a');
    　　var href = window.URL.createObjectURL(blob); //创建下载的链接
    　　downloadElement.href = href;
    　　downloadElement.download = 'xxx.xlsx'; //下载后文件名
    　　document.body.appendChild(downloadElement);
    　　downloadElement.click(); //点击下载
    　　document.body.removeChild(downloadElement); //下载完成移除元素
    　　window.URL.revokeObjectURL(href); //释放掉blob对象
　})
//案例二
 
function createDownload(fileName, content){
    var blob = new Blob([content]);
    var link = document.createElement("a");
    link.innerHTML = fileName;
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    document.getElementsByTagName("body")[0].appendChild(link);
}
createDownload("download.txt","download file");
//案例三<br>
function downloadExport(data) {
　　return axios.post(url, data).then((res)=>{
　　　　const content = res
　　　　const blob = new Blob(["\uFEFF" + content.data],{ type: "application/vnd.ms-excel;charset=utf-8"})
　　　　const fileName = '卡密.xls'
　　　　if ('download' in document.createElement('a')) { // 非IE下载
　　　　　　const elink = document.createElement('a')
　　　　　　elink.download = fileName
　　　　　　elink.style.display = 'none'
　　　　　　elink.href = URL.createObjectURL(blob)
　　　　　　document.body.appendChild(elink)
　　　　　　elink.click()
　　　　　　URL.revokeObjectURL(elink.href) // 释放URL 对象
　　　　　　document.body.removeChild(elink)
　　　　} else { // IE10+下载
　　　　　　navigator.msSaveBlob(blob, fileName)
　　　　}
　　});
}
```

## 最简单的方式

使用 a 标签或者 localtion.href 直接修改链接地址。





# 拓展阅读

[compress](http://github.com/houbb/compress)

[excel 导出最佳实践](https://houbb.github.io/2018/11/07/excel-export)

[iexcel 框架](https://github.com/houbb/iexcel)

# 参考资料

[导出excel (返回页面方式)](https://www.cnblogs.com/forever2h/p/6836938.html)

[java.io.IOException:stream closed 异常的原因及处理](https://www.cnblogs.com/mabaishui/archive/2011/07/26/2116987.html)

[Action请求后台出现Response already commited异常解决方法](https://www.cnblogs.com/seedling/p/10011551.html)

[解决Ajax/Axios请求下载无效的问题](https://blog.csdn.net/romestylexn/article/details/100089881)

* any list
{:toc}