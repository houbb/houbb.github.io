---
layout: post
title:  Vue-07-vue resource 使用简介
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 使用方式

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="./node_modules/vue/dist/vue.js"></script>
    <script src="./node_modules/vue-resource/dist/vue-resource.js"></script>
    <!--路径为本地路径-->
</head>
<body>
    <div id="app"></div>
    <script>
       var vm = new Vue({    // 创建新的 vue 实例
           el = "#app",      // 获取id
           data = {},        // 数据对象
           // 发起请求
           getInfo () { // 发起 get 请求
            this.$http.get(url, {params: {JSONdata} }.then(function(result){
                 console.log(result) 
                 console.log(result.body)// 通过 result.body 拿到服务器返回内容
               })） 
             },
           postInfo () {
                  // 第一个是地址，第二个是提交数据，第三个是格式 为普通表单
                  this.$http.post('url', {}, {emulateJSON: true}).then( 
                      result=>{
                          console.log(result.body)
                      }
                  )
              },
        })
    </script>

</body>
</html>
```

# emulateJSON 配置

emulateJSON: true 将请求认为是表单

如果你想传输 json 到后台，将这个值设置为 false 即可。

# 拓展阅读

[NPM-node.js 的包管理工具](https://houbb.github.io/2018/04/24/npm)

[webpack](https://houbb.github.io/2018/04/23/webpack-01-quick-start)

# 参考资料

[vue-resource](https://github.com/keepfool/vue-tutorials/tree/master/03.Ajax/vue-resource)

* any list
{:toc}