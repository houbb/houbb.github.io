---
layout: post
title:  FTP for Windows 
date:  2017-05-06 14:14:53 +0800
categories: [FTP]
tags: [ftp, windows]
published: true
---


# Quick Start

在 windows 下创建 FTP 服务。

> [在Win7的IIS上搭建FTP服务及用户授权](http://www.cnblogs.com/xuan52rock/p/5203165.html)

> [win7下如何建立ftp服务器](http://jingyan.baidu.com/article/574c5219d466c36c8d9dc138.html)

> [怎样在Win7系统里安装FTP](http://jingyan.baidu.com/article/15622f245afc3afdfcbea5dc.html)

一、 创建 FTP 用户

【我的电脑】右键->【管理】->【本地用户和组】－>【用户】右键 -> 【新建用户】

输入用户名和密码再点创建就行了！

![ftp-user](https://raw.githubusercontent.com/houbb/resource/master/img/ftp/windows/2017-05-06-windows-ftp-user.png)


二、安装 IIS 组件

在开始菜单里—>控制面板—>程序->程序和功能->打开或关闭windows功能->Internet 信息服务->FTP服务器—>确定

这样就把FTP安装在服务器上了！(Web管理工具、万维网工具在根节点选中即可)

![ftp-user](https://raw.githubusercontent.com/houbb/resource/master/img/ftp/windows/2017-05-06-windows-ftp-service.png)


三、配置 FTP 服务器

更新完成后，进入"控制面板" -> "系统和安全"  ->  "管理工具", 双击 "Internet 信息服务(IIS)管理器"。

在弹出的窗体中右键点击你的计算机名称，选择**添加FTP站点**。

在弹出的对话框中输入Ftp站点的名称（例如"myftp"),物理路径（例如"C:\MyFTP"）, 点击 "下一步".

![add server](https://raw.githubusercontent.com/houbb/resource/master/img/ftp/windows/2017-05-06-windows-ftp-add-server.png)



四、绑定和 SSL 设置

IP地址直接下拉选择**本地**地址即可(如192.168.1.120)。SSL 选择**允许SSL**。其他默认。

五、身份验证和授权信息

身份验证：基本

授权 > 允许访问：所有用户

权限：读取;写入


创建完成后可以在机器名成下网站看到刚才创建的 ftp 服务。

六、登录测试

如果本地直接登录是没问题的。比如在浏览器输入本地 FTP 服务地址：

```
ftp://192.168.1.120/
```


会提示输入username/password。

(发现这个一直失败)

也可以最简单的测试，(只是测试)。允许匿名登录。


<label>错误</label>

[用指定的用户名和密码无法登录到该ftp服务器”解决办法](http://blog.csdn.net/auv2009/article/details/5489801)

我试了下这种方式，还是不行。怀疑是不是因为是虚拟机的原因。过会儿换个普通的 Windows 测试一下。 

经测试，直接使用 Windows 是没有问题的。不知道是不是虚拟机缺少了什么配置。暂时不深究。


[win7 创建ftp 如何设置用户名/密码登录](https://zhidao.baidu.com/question/360832479.html)


# FileZilla

[FileZilla](https://filezilla-project.org/) is the free FTP solution.

可以使用这个，操作更方便一些。


# C# Code

```c#
 /// <summary>  
/// 上传文件  
/// </summary>  
/// <param name="fileinfo">需要上传的文件</param>  
/// <param name="targetDir">目标路径</param>  
/// <returns></returns>  
public Boolean UploadFile(System.IO.FileInfo fileInfo, string targetDir)
{
    string hostname = ftpURI;
    string username = ftpUserID; 
    string password = ftpPassword;

    FtpCheckDirectoryExist(targetDir);
    string strExtension = System.IO.Path.GetExtension(fileInfo.FullName);
    string strFileName = "";

    strFileName = fileInfo.Name;    //获取文件的文件名  
    string URI = hostname + targetDir + "/" + strFileName;

    //获取ftp对象  
    System.Net.FtpWebRequest ftp = GetRequest(URI, username, password);

    //设置ftp方法为上传  
    ftp.Method = System.Net.WebRequestMethods.Ftp.UploadFile;

    //制定文件传输的数据类型  
    ftp.UseBinary = true;
    ftp.UsePassive = true;


    //文件大小  
    ftp.ContentLength = fileInfo.Length;
    //缓冲大小设置为2kb  
    const int BufferSize = 2048;

    byte[] content = new byte[BufferSize - 1 + 1];
    int dataRead;

    //打开一个文件流（System.IO.FileStream)去读上传的文件  
    using (System.IO.FileStream fs = fileInfo.OpenRead())
    {
        try
        {
            //把上传的文件写入流  
            using (System.IO.Stream rs = ftp.GetRequestStream())
            {
                do
                {
                    //每次读文件流的2KB  
                    dataRead = fs.Read(content, 0, BufferSize);
                    rs.Write(content, 0, dataRead);
                } while (!(dataRead < BufferSize));
                rs.Close();
                return true;
            }
        }
        catch (Exception ex)
        {
            ftp = null;
            ftp = GetRequest(URI, username, password);
            ftp.Method = System.Net.WebRequestMethods.Ftp.DeleteFile;//删除  
            ftp.GetResponse();

            string msg = string.Format("UploadFile meet ex:{0} for upload {1} into {2}", ex, fileInfo.FullName, targetDir);
            LogService.LogError(msg);

            return false;
        }
        finally
        {
            fs.Close();
        }
    }
}


//判断文件的目录是否存,不存则创建  
/// <summary>
/// 判断文件夹是否存在
/// </summary>
/// <param name="targetDir"></param>
private void FtpCheckDirectoryExist(string targetDir)
{
    string[] dirs = targetDir.Split('/');
    string curDir = ""; //host name 包含最后的分隔符/；所以从cur 开始即可
    for (int i = 0; i < dirs.Length; i++)
    {
        string dir = dirs[i];
        //如果是以/开始的路径,第一个为空    
        if (dir != null && dir.Length > 0)
        {
            try
            {
                curDir += dir + "/";
                string ftpDirFullPath = ftpURI+curDir;
                FtpMakeDir(ftpDirFullPath);
            }
            catch (Exception ex)
            {
                LogService.LogError(String.Format("FtpMakeDir error:{0}", ex));
            }
        }
    }
}

/// <summary>
/// 创建文件夹
/// </summary>
/// <param name="ftpDirFullPath">ftp 上对应文件夹的全路径</param>
/// <returns></returns>
private Boolean FtpMakeDir(string ftpDirFullPath)
{
    //获取ftp对象  
    System.Net.FtpWebRequest req = GetRequest(ftpDirFullPath, ftpUserID, ftpPassword);

    req.Method = WebRequestMethods.Ftp.MakeDirectory;
    try
    {
        FtpWebResponse response = (FtpWebResponse)req.GetResponse();
        response.Close();
    }
    catch (Exception)
    {
        req.Abort();
        return false;
    }
    req.Abort();
    return true;
}  


/// <summary>  
/// 得到ftp对象  
/// </summary>  
/// <param name="URI">ftp地址</param>  
/// <param name="username">ftp用户名</param>  
/// <param name="password">ftp密码</param>  
/// <returns>返回ftp对象</returns>  
private System.Net.FtpWebRequest GetRequest(string URI, string username, string password)
{
    //根据服务器信息FtpWebRequest创建类的对象  
    FtpWebRequest result = (FtpWebRequest)FtpWebRequest.Create(URI);
    //提供身份验证信息  
    result.Credentials = new System.Net.NetworkCredential(username, password);
    //result.Credentials = new System.Net.NetworkCredential();  
    //设置请求完成之后是否保持到FTP服务器的控制连接，默认值为true  
    result.KeepAlive = false;
    return result;
}  
```

* any list
{:toc}
