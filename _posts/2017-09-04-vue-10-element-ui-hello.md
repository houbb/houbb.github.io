---
layout: post
title:  Vue-08-vue+ element-ui 入门使用
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 监听

```js
<div id="app">
    {{ 3.1415926 | number(2) }}
</div>
 
var vm = null;
window.onload = function(){
    vm = new Vue({
 
       el: "#app",
 
       data: {
           age: "",
           name: "",
           obj: {
              value: "",
              name: ""
           }
       },
 
       watch: {
           age: function(newValue, oldValue){
                console.log("监听年龄修改")
           },
           name: function(newValue, oldValue){
                console.log("监听姓名修改")
           },
           obj: {
                handler: (newValue, oldValue) => {
                    console.log("obj 属性监听");
                },
                // deep: true  表示监听对象的属性变化，执行handler,获取newValue
                // deep: false 关闭监听，看不到属性变化，不执行handler. 数组无需此设置
                deep: true,   
           },
       } 
       
       methods: {
            fun1(){},
            fun2: function(){}
       }
 
    });
}
 
// 全局监听
Vue.$watch("number", function(data){
    return ....
})
```

# 属性获取

```js
<div id="app">
    {{ 3.1415926 | number(2) }}
</div>
 
 
var vm = null;
window.onload = function(){
    vm = new Vue({
 
       el: "#app",
 
       data: {
           age: "",
           name: "",
           obj: {
              value: "",
              name: ""
           }
       },
       name: "aaaa",
       methods: {
            fun1(){},
            fun2: function(){}
       }
 
    });
}
```

# 手动挂载Vue实例

```js
vm.$mount("app");
 
new Vue({}).$mount("app");
```

# 属性增删改

```js
<div id="app">
    {{ 3.1415926 | number(2) }}
</div>
 
var vm = null;
window.onload = function(){
    vm = new Vue({
       el: "#app",
       data: {
           age: "",
           name: "",
           obj: {
              value: "",
              name: ""
           }
       },
       name: "aaaa",
       methods: {
            add(){
                // this.obj.age = 12;  无效
                
                this.$set(this.obj,"age",12);
            },
            del: function(){
                this.$delete(this.obj,"age");
            },
            update(){
                this.obj.age = 20;
            }
       }
 
    });
}
```

# 指令+指令生命周期

```js
<div id="app">
    <input v-focus>
    <p v-hello>12</p>
    <p v-hello:wds>12</p>
    <p v-hello2>12</p>
</div>
 
 
var vm = null;
window.onload = function(){
    vm = new Vue({
 
       el: "#app",
 
       data: {
           age: "",
           name: "",
           obj: {
              value: "",
              name: ""
           }
       },
       name: "aaaa",
       methods: {},
       direactives: {
           focus: {
                inserted(el){ el.focus(); // 页面打开输入框即获得焦点 },
                 
           }
       }
    });
}
 
Vue.directive('hello',{
   bind(el, binding){},
   insert(){}
});
 
Vue.directive('hello2',{
   bind(el, binding){},
   inserted(){},
   update(){}
});
```

# 组件

## 全局写法

- 方式1

```js
var myComponent = Vue.extend({
    template: '<h1>hello</h1>'
});

Vue.component('hello', myComponent);
```

- 方式2

```js
Vue.component('hello', {template: '<h1>hello</h1>'});
```

## 局部组件

### 直接字符串指定 template

有独立data数据

```js
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>权限首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
</head>
<body>
<div id="app">
    <div>
        <hello></hello>
    </div>
</div>

<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script>
    var vm =new Vue({
        el: '#app',
        data: {
        },
        methods: {
        },
        components: {
            'hello': {
                template: '<h1>{{ message }}</h1>',
                data() {
                    return {
                        message: 'hello'
                    }
                }
            }
        }
    })
</script>
</body>
</html>
```


最核心的代码：

```js
components: {
    'hello': {
        template: '<h1>{{ message }}</h1>',
        data() {
            return {
                message: 'hello'
            }
        }
    }
}
```

使用：

```html
<hello></hello>
```

### html 指定 template

template 内容较多时，写在 string 中跟定很麻烦。

直接可以借助 html 元素来实现。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>权限首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <!-- 引入组件库 -->
    <script src="https://unpkg.com/element-ui/lib/index.js"></script>
</head>
<body>
<template id="address">
    <span>
        my address is {{ info }}
    </span>
</template>
<div id="app">
    <my-address></my-address>
</div>
<script>
    var vm =new Vue({
        el: '#app',
        data: {
        },
        methods: {
        },
        components: {
            'my-address': {
                template: '#address',
                data() {
                    return {
                        info: '2133'
                    }
                }
            }
        }
    })
</script>
</body>
</html>
```

注意点：

（1）component 的组件名尽量不要和其他元素重复，会报错

（2）template  的内容需要有 root 元素，纯文本会报错。


# vue 使用 element-ui form valid 校验功能

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>权限首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <!-- 引入组件库 -->
    <script src="https://unpkg.com/element-ui/lib/index.js"></script>
</head>
<body>

<div id="app">
<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <el-form-item label="活动名称" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
    </el-form-item>
    <el-form-item label="活动区域" prop="region">
        <el-select v-model="ruleForm.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
        </el-select>
    </el-form-item>
    <el-form-item label="活动时间" required>
        <el-col :span="11">
            <el-form-item prop="date1">
                <el-date-picker type="date" placeholder="选择日期" v-model="ruleForm.date1" style="width: 100%;"></el-date-picker>
            </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
            <el-form-item prop="date2">
                <el-time-picker placeholder="选择时间" v-model="ruleForm.date2" style="width: 100%;"></el-time-picker>
            </el-form-item>
        </el-col>
    </el-form-item>
    <el-form-item label="即时配送" prop="delivery">
        <el-switch v-model="ruleForm.delivery"></el-switch>
    </el-form-item>
    <el-form-item label="活动性质" prop="type">
        <el-checkbox-group v-model="ruleForm.type">
            <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
            <el-checkbox label="地推活动" name="type"></el-checkbox>
            <el-checkbox label="线下主题活动" name="type"></el-checkbox>
            <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
        </el-checkbox-group>
    </el-form-item>
    <el-form-item label="特殊资源" prop="resource">
        <el-radio-group v-model="ruleForm.resource">
            <el-radio label="线上品牌商赞助"></el-radio>
            <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item label="活动形式" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
    </el-form-item>
    <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
</el-form>
</div>

<script>
    var vm =new Vue({
        el: '#app',
        data() {
            return {
                ruleForm: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                rules: {
                    name: [
                        { required: true, message: '请输入活动名称', trigger: 'blur' },
                        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                    ],
                    region: [
                        { required: true, message: '请选择活动区域', trigger: 'change' }
                    ],
                    date1: [
                        { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
                    ],
                    date2: [
                        { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
                    ],
                    type: [
                        { type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }
                    ],
                    resource: [
                        { required: true, message: '请选择活动资源', trigger: 'change' }
                    ],
                    desc: [
                        { required: true, message: '请填写活动形式', trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        alert('submit!');
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    })
</script>

</body>
</html>
```

或者下面这样也可以:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>权限首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <!-- 引入组件库 -->
    <script src="https://unpkg.com/element-ui/lib/index.js"></script>
    <!--    解决 es6 语法问题-->
    <!--    <script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>-->
    <!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.4.4/babel.min.js"></script>-->
</head>
<body>

<div id="app">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="活动名称" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="活动区域" prop="region">
            <el-select v-model="ruleForm.region" placeholder="请选择活动区域">
                <el-option label="区域一" value="shanghai"></el-option>
                <el-option label="区域二" value="beijing"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="活动时间" required>
            <el-col :span="11">
                <el-form-item prop="date1">
                    <el-date-picker type="date" placeholder="选择日期" v-model="ruleForm.date1"
                                    style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
                <el-form-item prop="date2">
                    <el-time-picker placeholder="选择时间" v-model="ruleForm.date2" style="width: 100%;"></el-time-picker>
                </el-form-item>
            </el-col>
        </el-form-item>
        <el-form-item label="即时配送" prop="delivery">
            <el-switch v-model="ruleForm.delivery"></el-switch>
        </el-form-item>
        <el-form-item label="活动性质" prop="type">
            <el-checkbox-group v-model="ruleForm.type">
                <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
                <el-checkbox label="地推活动" name="type"></el-checkbox>
                <el-checkbox label="线下主题活动" name="type"></el-checkbox>
                <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item label="特殊资源" prop="resource">
            <el-radio-group v-model="ruleForm.resource">
                <el-radio label="线上品牌商赞助"></el-radio>
                <el-radio label="线下场地免费"></el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="活动形式" prop="desc">
            <el-input type="textarea" v-model="ruleForm.desc"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
    </el-form>

    消息：{{ message }}
</div>


<script>
    var vm = new Vue({
        el: '#app',
        data: {
            message: '测试一下',
            ruleForm: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: ''
            },
            rules: {
                name: [
                    {required: true, message: '请输入活动名称', trigger: 'blur'},
                    {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
                ],
                region: [
                    {required: true, message: '请选择活动区域', trigger: 'change'}
                ],
                date1: [
                    {type: 'date', required: true, message: '请选择日期', trigger: 'change'}
                ],
                date2: [
                    {type: 'date', required: true, message: '请选择时间', trigger: 'change'}
                ],
                type: [
                    {type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change'}
                ],
                resource: [
                    {required: true, message: '请选择活动资源', trigger: 'change'}
                ],
                desc: [
                    {required: true, message: '请填写活动形式', trigger: 'blur'}
                ]
            }
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        alert('submit!');
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    })
</script>

</body>
</html>
```

# 参考资料

[vue + element + CDN 的方式使用](https://blog.csdn.net/zjl199303/article/details/87917731)

[关于Vue使用CDN引用ElementUI](https://blog.csdn.net/cheeseC/article/details/107383133)

* any list
{:toc}