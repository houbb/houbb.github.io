---
layout: post
title: 一键分发多平台方法-wechatSync源码-51cto.js
date: 2024-03-27 21:01:55 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 源码

```js
var _cacheMeta = null

export default class _51CtoAdapter {
  constructor(config) {
    // this.skipReadImage = true
    this.config = config
    this.name = '51cto'
  }

  async getMetaData() {
    var res = await $.get('https://blog.51cto.com/blogger/publish')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var img = htmlDoc.querySelector('li.more.user > a > img')
    var link = img.parentNode.href
    var pie = link.split('/')
    // pie.pop()
    var uid = pie.pop()
    console.log(link)
    var scrs = [].slice
      .call(htmlDoc.querySelectorAll('script'))
      .filter(_ => _.innerText.indexOf('sign') > -1)

    var uploadSign = null;
    if (scrs.length) {
      try {
        var dataStr = scrs[0].innerText
        var rawStr = dataStr.substring(
          dataStr.indexOf('sign'),
          dataStr.indexOf('uploadUrl', dataStr.indexOf('sign'))
        )
        var signStr = rawStr
          .replace('var', '')
          .trim()
          .replace("sign = '", '')
          .replace("';", '')
          .trim()
          uploadSign = signStr
      } catch (e) {
        console.log('51cto', e)
      }
    }
      _cacheMeta = {
        rawStr: rawStr,
        uploadSign: uploadSign,
        csrf: htmlDoc
          .querySelector('meta[name=csrf-token]')
          .getAttribute('content'),
      }
    console.log('51cto', _cacheMeta)
    return {
      uid: uid,
      title: uid,
      avatar: img.src,
      type: '51cto',
      displayName: '51CTO',
      supportTypes: ['markdown', 'html'],
      home: 'https://blog.51cto.com/blogger/publish',
      icon: 'https://blog.51cto.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var postStruct = {}

    if (post.markdown) {
      postStruct = {
        title: post.post_title,
        copy_code: 1,
        is_old: 0,
        content: post.markdown,
        _csrf: _cacheMeta.csrf,
      }
    } else {
      postStruct = {
        blog_type: null,
        title: post.post_title,
        copy_code: 1,
        content: post.post_content,
        pid: '',
        cate_id: '',
        custom_id: '',
        tag: '',
        abstract:'',
        is_hide: 0,
        did: '',
        blog_id: '',
        is_old: 1,
        _csrf: _cacheMeta.csrf,
        // editorValue: null,
      }
    }

    var res = await $.ajax({
      url: 'https://blog.51cto.com/blogger/draft',
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.did,
      draftLink: 'https://blog.51cto.com/blogger/draft/' + res.data.did,
    }
  }

  async uploadFile(file) {
    var src = file.src
    // var csrf = this.config.state.csrf
    var uploadUrl = 'https://upload.51cto.com/index.php?c=upload&m=upimg&orig=b'
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()

    formdata.append('sign', _cacheMeta.uploadSign)
    // formdata.append('file', file)
    formdata.append('file', file, new Date().getTime() + '.jpg')
    formdata.append('type', file.type)
    formdata.append('id', 'WU_FILE_1')
    formdata.append('fileid', `uploadm-` + Math.floor(Math.random() * 1000000))
    // formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', file.size)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.status === false) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    var id = Math.floor(Math.random() * 100000)
    return [
      {
        id: id,
        object_key: id,
        url: `https://s4.51cto.com/` + res.data.data,
        // size: res.data.data.size,
        // images: [res.data],
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      div.html(post.content)
      var doc = div
      // var pres = doc.find("pre");
      tools.processDocCode(div)
      tools.makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }
  }

  // editImg(img, source) {
  //   img.attr('size', source.size)
  // }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
```


# 测试

## html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>51CTO Metadata Fetcher</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

<button onclick="getMetaData()">Fetch Metadata</button>

<script>
    async function getMetaData() {
        // 发送 GET 请求获取页面内容
        var res = await $.get('https://blog.51cto.com/blogger/publish');
        // 创建 DOM 解析器
        var parser = new DOMParser();
        // 解析获取的 HTML 内容
        var htmlDoc = parser.parseFromString(res, 'text/html');
        // 查询用户头像图片元素
        var img = htmlDoc.querySelector('li.more.user > a > img');
        // 获取头像链接
        var link = img.parentNode.href;
        // 根据链接获取用户 ID
        var pie = link.split('/');
        var uid = pie.pop();
        // 打印头像链接
        console.log(link);

        // 查询页面中的脚本标签，并过滤包含 'sign' 的脚本
        var scrs = [].slice
            .call(htmlDoc.querySelectorAll('script'))
            .filter(_ => _.innerText.indexOf('sign') > -1);

        var uploadSign = null;
        // 如果找到相关脚本
        if (scrs.length) {
            try {
                // 获取脚本内容
                var dataStr = scrs[0].innerText;
                // 提取 'sign' 和 'uploadUrl' 之间的内容
                var rawStr = dataStr.substring(
                    dataStr.indexOf('sign'),
                    dataStr.indexOf('uploadUrl', dataStr.indexOf('sign'))
                );
                // 处理原始字符串获取签名
                var signStr = rawStr
                    .replace('var', '')
                    .trim()
                    .replace("sign = '", '')
                    .replace("';", '')
                    .trim();
                uploadSign = signStr;
            } catch (e) {
                console.log('51cto', e);
            }
        }

        // 缓存元数据
        var _cacheMeta = {
            rawStr: rawStr,
            uploadSign: uploadSign,
            // 获取 CSRF token
            csrf: htmlDoc.querySelector('meta[name=csrf-token]').getAttribute('content'),
        };
        // 打印缓存的元数据
        console.log('51cto', _cacheMeta);

        // 返回元数据对象
        var metadata = {
            uid: uid,
            title: uid,
            avatar: img.src,
            type: '51cto',
            displayName: '51CTO',
            supportTypes: ['markdown', 'html'],
            home: 'https://blog.51cto.com/blogger/publish',
            icon: 'https://blog.51cto.com/favicon.ico',
        };

        // 输出元数据
        alert(JSON.stringify(metadata));
    }
</script>

</body>
</html>
```

登录后，浏览器打开这个页面。

## 报错

会报错：

```
Access to XMLHttpRequest at 'https://blog.51cto.com/blogger/publish' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
jquery-3.6.0.min.js:2 
        
        
       GET https://blog.51cto.com/blogger/publish net::ERR_FAILED 302 (Moved Temporarily)
send @ jquery-3.6.0.min.js:2
ajax @ jquery-3.6.0.min.js:2
S.<computed> @ jquery-3.6.0.min.js:2
getMetaData @ test.html:15
onclick @ test.html:10
test.html:83 Uncaught (in promise) {readyState: 0, getResponseHeader: ƒ, getAllResponseHeaders: ƒ, setRequestHeader: ƒ, overrideMimeType: ƒ, …}
```

## 原因

跨域资源共享（CORS）策略限制了浏览器从一个源（origin）向另一个源发起跨域请求。

您在本地的HTML文件是从`file://`协议加载的，而目标URL是从`https://`协议加载的，这会触发CORS错误。

要解决这个问题，您可以将HTML文件部署到一个Web服务器上，然后通过Web服务器访问它，或者使用代理来解决这个问题。

下面是两种解决方法的示例：

### 方法1：部署到Web服务器
将HTML文件部署到本地的一个Web服务器（如Apache、Nginx等）上，然后通过Web服务器的URL来访问它。

### 方法2：使用代理
您可以使用一个简单的后端代理来解决这个问题。这个代理可以是一个简单的Node.js应用，用于转发请求。

以下是一个简单的Node.js代理示例：

1. 安装`express`和`axios`：
    ```bash
    npm install express axios
    ```

2. 创建一个`proxy.js`文件并添加以下内容：
    ```javascript
    const express = require('express');
    const axios = require('axios');

    const app = express();
    const PORT = 3000;

    app.use(express.json());

    app.get('/fetch-data', async (req, res) => {
        try {
            const response = await axios.get('https://blog.51cto.com/blogger/publish');
            res.json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json(error.response?.data || 'Internal Server Error');
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    ```

3. 启动代理服务：
    ```bash
    node proxy.js
    ```

4. 修改HTML文件中的请求URL：
    ```javascript
    var res = await $.get('http://localhost:3000/fetch-data');
    ```

使用上述代理方法，您可以绕过CORS策略的限制。这样，当您访问部署的HTML文件时，代理将转发请求到目标URL，并将响应返回给您的HTML页面。

### origin 可以在请求的时候设置一下吗？而不是这么麻烦

跨域请求中，设置`Origin`请求头通常是不允许的，因为它是由浏览器自动设置的。

如果您尝试手动设置`Origin`请求头，大多数服务器会拒绝该请求。

但是，如果您只是想在本地测试，您可以使用一些浏览器插件或者在开发工具中禁用CORS。这只是为了开发和测试，不应在生产环境中这样做。

### 使用浏览器插件

您可以使用浏览器插件如`Allow-Control-Allow-Origin`来临时禁用CORS。这样，您可以在本地浏览器中访问并测试您的HTML文件，而不会遇到CORS问题。

### 禁用浏览器CORS

#### Chrome
您可以在启动Chrome时添加`--disable-web-security`标志来禁用CORS检查。

**注意**: 这样做将禁用Chrome的所有安全特性，只适用于开发和测试。

```bash
chrome.exe --disable-web-security --user-data-dir="C:/ChromeDevSession"
```

#### Firefox
在Firefox中，您可以安装一个插件，如`CORS Everywhere`，然后启用它来禁用CORS检查。

**注意**: 同样地，这只是为了开发和测试，不应在生产环境中这样做。

使用上述方法之一，您可以在本地环境中测试和开发，而不会受到CORS限制的影响。

## 禁用 CORS 后测试

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>51CTO Metadata Fetcher</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

<button onclick="getMetaData()">Fetch Metadata</button>

<script>
    async function getMetaData() {
        // 发送 GET 请求获取页面内容
        var res = await $.get('https://blog.51cto.com/blogger/publish');
        // 创建 DOM 解析器
        var parser = new DOMParser();
        // 解析获取的 HTML 内容
        var htmlDoc = parser.parseFromString(res, 'text/html');
        // 查询用户头像图片元素
        <!-- var img = htmlDoc.querySelector('li.more.user > a > img'); -->
        <!-- // 获取头像链接 -->
        <!-- var link = img.parentNode.href; -->
        <!-- // 根据链接获取用户 ID -->
        <!-- var pie = link.split('/'); -->
        <!-- var uid = pie.pop(); -->
        <!-- // 打印头像链接 -->
        <!-- console.log(link); -->

        // 查询页面中的脚本标签，并过滤包含 'sign' 的脚本
        var scrs = [].slice
            .call(htmlDoc.querySelectorAll('script'))
            .filter(_ => _.innerText.indexOf('sign') > -1);

        var uploadSign = null;
        // 如果找到相关脚本
        if (scrs.length) {
            try {
                // 获取脚本内容
                var dataStr = scrs[0].innerText;
                // 提取 'sign' 和 'uploadUrl' 之间的内容
                var rawStr = dataStr.substring(
                    dataStr.indexOf('sign'),
                    dataStr.indexOf('uploadUrl', dataStr.indexOf('sign'))
                );
                // 处理原始字符串获取签名
                var signStr = rawStr
                    .replace('var', '')
                    .trim()
                    .replace("sign = '", '')
                    .replace("';", '')
                    .trim();
                uploadSign = signStr;
            } catch (e) {
                console.log('51cto', e);
            }
        }

        // 缓存元数据
        var _cacheMeta = {
            rawStr: rawStr,
            uploadSign: uploadSign,
            // 获取 CSRF token
            csrf: htmlDoc.querySelector('meta[name=csrf-token]').getAttribute('content'),
        };
        // 打印缓存的元数据
        console.log('51cto', _cacheMeta);

        // 返回元数据对象
        var metadata = {
            <!-- uid: uid, -->
            <!-- title: uid, -->
            <!-- avatar: img.src, -->
            type: '51cto',
            displayName: '51CTO',
            supportTypes: ['markdown', 'html'],
            home: 'https://blog.51cto.com/blogger/publish',
            icon: 'https://blog.51cto.com/favicon.ico',
        };

        // 输出元数据
        alert(JSON.stringify(metadata));
    }
</script>

</body>
</html>
```

确实可以得到这个信息。


## 先 fetch + post


异常，暂时先不动这个了。

# 参考资料


* any list
{:toc}
