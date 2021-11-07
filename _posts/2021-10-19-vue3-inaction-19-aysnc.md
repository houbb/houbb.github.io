---
layout: post
title: Vue-如何使用axios实现同步请求
date: 2021-10-18 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, vue, web, source-code, sh]
published: true
---

# 说明 

在vue项目中我们经常会使用axios来与后台进行数据传输，异步请求可以改善用户体验。

但是在某些特殊情况，我们依然需要使用同步请求来实现交互。

本文将讲解如何在vue项目中使用axios实现同步请求。

# 问题分析

我们知道，在传统的ajax方法中，我们可以使用参数async设置为false来表示同步请求

```js
$.ajax({
    type : "POST", //请求方式
    async: false, // fasle表示同步请求，true表示异步请求
    contentType: "application/json;charset=UTF-8", //请求的媒体类型
    url : "http://127.0.0.1/admin/list/",//请求地址
    data : JSON.stringify(list), //数据，json字符串
    success : function(result) { //请求成功
        console.log(result);
    },
    error : function(e){  //请求失败，包含具体的错误信息
        console.log(e.status);
        console.log(e.responseText);
    }
});
```

但是在axios的文档中，并没有找到类似的参数。

因此单纯的通过axios是实现不了同步数据交互。

在浏览了其它博客后，了解到ES7的异步特性async/await，async修饰的异步方法，需要等待await修饰的语句执行完毕。

这跟我们想要的同步请求效果一样，在执行完A事件，并成功返回后，才会去执行B事件。

还有一种方法就是在vue项目中安装jquery,使用jquery的async属性，但是不太推荐。

# ES7的异步特性 async/await

async用于申明一个函数是异步的，await等待异步请求完成，await只能在async方法中使用。

```js
var fun1 = async function(){
    await axios.get(url,params);
    
    ...
}
```

在调用fun1的方法中我们需要修饰为 async 异步方法，并且 await 修饰fun1方法。

```js
var fun2 = async function(){
    await fun1();
}
```

# 在 Vue 项目中实现

```js
getInfoFn: async function(){
    var that = this;
    await that.$api.scheduleApi.queryScheduleInfoFn(
      {caseNo:  that.basicInfo.caseNo}).then(function (response) {
      if(response.data.code == '200') {
        var result = response.data.result;
      }
    });
},

// 调用getInfoFn()也需要修饰为异步
changeConfigFn: async function(config){
    
    await this.getSheduleInfoFn();
    
    // 执行其它操作
    
}
```







# 例子

手机话费充值，给定一个输入框，当用户输入完号码，输到11位的时候，自动调用获取号码所属地，然后根据所属地列出所有的可充值的面额。

## 普通写法

```js
methods: {
    // 获取所属地
    getLocation(phoneNum) {
        return axois.post('/location', {phoneNum});
    },
    // 根据属地获取充值面额列表
    getFaceList(province, city) {
        return axois.post('/location', {province, city});
    },
    // 采取链式的调用方法
    getFaceResult() {
      this.getLocation(this.phoneNum)
          .then(res => {
              if (res.status === 200 && res.data.success) {
                  let province = res.data.province;
                  let city = res.data.city;
                  this.getFaceList(province, city)
                      .then(res => {
                          if(res.status === 200 && res.data.success) {
                              this.faceList = res.data
                          }
                      })
              }
          })
          .catch(err => {
              console.log(err)
          })  
    }
}
```

## async await写法

```js
methods: {
    // 获取所属地
    getLocation(phoneNum) {
        return axois.post('/location', {phoneNum});
    },
    // 根据属地获取充值面额列表
    getFaceList(province, city) {
        return axois.post('/location', {province, city});
    },
    // 采取async await 方式调用
    async getFaceResult() {
      // 异常需要通过try catch补货  
      try {
          let location = await this.getLocation(this.phoneNum);
          // 程序会等待上一个请求完成才进行下一条的语句执行
          
          if (location.data.success) {
              let province = location.data.province;
              let city = location.data.city;
              let result = await this.getFaceList(province, city);
              if (result.data.success) {
                  this.faceList = result.data;
              }
          }
      } catch(err) {
          console.log(err);
      }
    }
}
```

# 参考资料

https://www.jianshu.com/p/93f011981a47

[Vue--- 中 async与await的使用](https://www.jianshu.com/p/ae425ba31ce7)

* any list
{:toc}
