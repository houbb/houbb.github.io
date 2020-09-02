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

# 拓展阅读

[compress](http://github.com/houbb/compress)

[excel 导出最佳实践](https://houbb.github.io/2018/11/07/excel-export)

[iexcel 框架](https://github.com/houbb/iexcel)

# 参考资料

[导出excel (返回页面方式)](https://www.cnblogs.com/forever2h/p/6836938.html)

* any list
{:toc}