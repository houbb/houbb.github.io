---
layout: post
title: 数据分析-06-如何实现前端埋点?  H5 monitor
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---


# PC端、移动端H5数据埋点JSSDK

目前只实现了基本的事件上报设计，更贴合业务的埋点可在此设计基础上扩展，比如上报时间戳、页面停留时长、页面渲染时长等。

## 安装

- // 页面head引入

```html
<script src="./webTrack.js"></script>
```

## 二、配置

track对象中的clientConfig为埋点配置项：

```
serverUrl: 埋点上报地址
version: 当前SDK版本
```


## 生命周期事件上报

默认为页面生命周期添加了事件上报，直接修改webTrack.js中的生命周期函数完成定制上报。 

生命周期函数如下：

```
DOMContentLoaded
load
beforeunload
unload
```

## 自定义事件上报

给window对象注册了 `__TRACK_`，调用 `__TRACK.track()` 方法进行自定义事件上报。

# 源码学习

```js
;(function() {
  const track = {
    // 应用生命周期Id，贯穿本次系统加载
    sessionId: '',

    // 页面生命周期
    pageLife: {
      DOMContentLoaded: function() {
        console.log('DOM is ready')
        const DOMContentLoadedOptions = {}
        track._sendDataToServer(track._parseParam(DOMContentLoadedOptions))
      },
      load: function() {
        console.log('Page loaded')
        const loadOptions = {}
        track._sendDataToServer(track._parseParam(loadOptions))
      },
      beforeunload: function(event) {
        console.log('Page beforeunload')
        const beforeunloadOptions = {}
        track._sendDataToServer(track._parseParam(beforeunloadOptions))
      },
      unload: function() {
        // 在这里可以使用navigator.sendBeacon(url, data)发送异步传输
        console.log('Page unloaded')
        const unloadOptions = {}
        track._sendDataToServer(track._parseParam(unloadOptions))
      }
    },

    // 基础配置
    clientConfig: {
      serverUrl: "",
      version: "1.0.0"
    },

    // 公共参数
    columns: {
      uid: '55555'
    },

    /**
     * 参数编码返回字符串
     */
    _parseParam: function(param) {
      // 公共参数拼接
      const data = Object.assign({sid: this.sessionId}, this.columns, param)
      var params = "";
      for (var e in data) {
        if (e && data[e]) {
          params += encodeURIComponent(e) + "=" + encodeURIComponent(data[e]) + "&";
        }
      }
      if (params) {
        return params.substring(0, params.length - 1);
      } else {
        return params;
      }
    },

    /**
     * 数据上报
     * @param { String } data 
     */
    _sendDataToServer: function(data) {
      // 发送数据data到服务器，其中data是一个字符串
      var that = this;
      var i2 = new Image(1,1);
      i2.onerror = function(){
        // 这里可以进行重试操作
      };
      i2.src = this.clientConfig.serverUrl + "?" + data;
      console.log(i2.src)
    },

    /**
     * 产生uuid
     */
    _generateId: function() {
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var tmpid = [];
      var r;
      tmpid[8] = tmpid[13] = tmpid[18] = tmpid[23] = '-';
      tmpid[14] = '4';

      for (i=0; i<36; i++) {
        if (!tmpid[i]) {
          r = 0| Math.random()*16;
          tmpid[i] = chars[(i==19) ? (r & 0x3) | 0x8 : r];
        }
      }
      return tmpid.join('');
    },

    /**
     * 应用开始
     */
    _startSession() {
      this.sessionId = this._generateId()
    }
  }

  // 绑定页面生命周事件
  Object.keys(track.pageLife).forEach((hook) => {
    window.addEventListener(hook, track.pageLife[hook])
  })

  // 暴露公共方法
  window.__TRACK_ = {
    /**
     * 自定义事件上报
     * @param {*} options 上报数据
     */
    track: function(options) {
      track._sendDataToServer(track._parseParam(options))
    }
  }

  const onload = function onload () {
    track._startSession()
  }

  onload()
})()
```





# 参考资料

https://github.com/BillionChen/bigDataH5SDK

https://github.com/sensorsdata/sa-sdk-javascript

https://github.com/Hugohui/webTrackSdk

* any list
{:toc}