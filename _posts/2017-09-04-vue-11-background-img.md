---
layout: post
title:  Vue-11-vue 如何实现背景图片全屏
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 业务背景

想做一个登录页，本来想把图片放左边，登录表单放在右边。

调整了半天也不满意，直接全屏得了。

# 效果图

![输入图片说明](https://images.gitee.com/uploads/images/2020/0922/220910_e720716c_508704.png)

# 源码实现

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>登录</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
    <style>
        html, body, #app {
            margin: 0;
            padding: 0;
        }

        .background {
            width: 100%;
            height: 100%; /**宽高100%是为了图片铺满屏幕 */
            z-index: -1;
            position: absolute;
            overflow: hidden;
            margin: 0;
        }

        .front {
            z-index: 1;
            position: absolute;
            width: 100%;
            height: 100%;
            text-align: center;
        }
        .box-card {
            width: 400px;
            margin: 0 auto;
            margin-top: 15%;
            background-color: rgba(200,200,200,0.5);
            border-color: rgba(200,200,200,0.5);
            border-radius: 10px;
        }
        .title {
            text-align: center;
            font-size: 24px;
            color: rgba(50,50,50,0.8);
        }
    </style>
</head>
<body>
<div id="app">
    <div class="background">
        <img src="/img/pic1.jpg" width="100%" height="100%" alt=""/>
    </div>

    <div class="front">
        <el-card class="box-card">
            <span slot="header" class="title">P-ADMIN 权限管理</span>

            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item prop="token">
                    <el-input v-model="form.token" type="password" autocomplete="off" prefix-icon="el-icon-lock"></el-input>
                </el-form-item>
                <el-button type="primary" @click="doLogin('form')">登录</el-button>
            </el-form>
        </el-card>
    </div>
</div>

<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script>
    new Vue({
        el: '#app',
        data: {
            asideImg: '/img/pic1.jpg',
            form: {
                token: '',
            },
            rules: {
                token: [
                    {required: true, message: '请输入登录密匙', trigger: 'blur'},
                    {min: 1, max: 256, message: '长度在 1 到 256 个字符', trigger: 'blur'}
                ]
            },
        },
        methods: {
            doLogin(form) {
            }
        }
    })
</script>
</body>
</html>
```


# 参考资料

[【vue/css】如何给vue页面添加背景图片-vue cli3](https://www.cnblogs.com/qxxblogs/p/12388482.html)

* any list
{:toc}