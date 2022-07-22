---
layout: post
title:  微信公众号项目开发实战-02-auth 鉴权流程
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 几个模块

微信公众号的鉴权流程+注意点


# 微信配置

## 测试环境 

测试公众号地址：[测试文档地址](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

每个微信可以对应一个测试用户。

## 配置

需要配置对应的域名。

- JS 接口安全域名。（wwww.baidu.com）

- 体验接口权限表-网页服务-网页账号 修改（wwww.baidu.com）

## 菜单

这个页面最上方有对应的 AppId+AppSecret。

（1）获取 accessToken

[获取 accessToken](https://mp.weixin.qq.com/debug/cgi-bin/apiinfo?t=index&type=基础支持&form=获取access_token接口 /token)

（2）设置对应的菜单信息

接口类型选择自定义菜单。

## 生产环境的前端

需要把一个 `MP_verify_xxx.txt` 文件放在域名前端应用的根目录下。

用于微信验证服务属于前端应用。

# 鉴权流程

## FLOW

![鉴权流程](https://img-blog.csdnimg.cn/956a2e01fe764be59b236e4a5ecb18be.png#pic_center)

> [官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#0)

## 后端

### 重定向

```java
/**
 * 查询 code 的重定向地址
 * @param currentUrl 当前路径
 * @return 结果
 */
public String queryCodeRedirectUrl(String currentUrl) {
    final String appId = "${wxAppId}";
    String encodeUrl = URLEncoder.encode(currentUrl);
    String format = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=%s&redirect_uri=%s&response_type=code&scope=snsapi_base&state=SUCCESS#wechat_redirect";

    return String.format(format, appId, encodeUrl);
}
```

这里比较简单，直接根据官网的标准拼接对应的请求地址即可。

### wxCode 鉴权

```java
/**
 * 查询当前公众号 openId
 * @param wxCode 微信随机编码
 * @return 结果
 */
public String queryWxOpenId(String wxCode) {
    String format = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";

    String appId = "${wxAppId}";
    String appSecret = "${wxAppSecret}";

    String url = String.format(format, appId, appSecret, wxCode);
    String respJson = OkHttpUtil.get(url);
    log.info("wxcode {} 对应的鉴权响应 {}", wxCode, respJson);
    //判断是否正常
    if(StringUtils.isBlank(respJson)) {
        log.error("微信响应为空");
        throw new BizException(RespCode.WX_AUTH_FAILED);
    }

    //2. 判断 openId 是否正常
    GetWebAuth2BaseResp resp = JSON.parseObject(respJson, GetWebAuth2BaseResp.class);
    String openId = resp.getOpenid();
    if(StringUtils.isBlank(openId)) {
        log.error("微信返回 openId 为空");
        throw new BizException(RespCode.WX_AUTH_FAILED);
    }
    return openId;
}
```

GetWebAuth2BaseResp 是一个简单的对象：

```java
public class GetWebAuth2BaseResp extends WxmpBaseResp {

    private String access_token;

    private long expires_in;

    private String refresh_token;

    private String openid;

    private String scope;

    //getter & setter
}
```

## 前端

前端应该是是否已经绑定和获取 wxOpenId 的方法分开。

整理流程：

![前端](https://img-blog.csdnimg.cn/f673c058209b4553bd0b31c69631e81d.png)

前端拦截器实现：

```js
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }

  if (to.meta.requireAuth) { // 页面路由需要登录授权
    let token = localStorage.getItem("token") || ''
    localStorage.setItem("currentUrl", window.location.href)//记录当前页面的跳转链接,进入页面登录失效时跳转
    localStorage.removeItem("beforeHrefUrl")  //进入绑定页面之前记录一下地址,绑定成功后再继续跳转,进来先清空

    if (!token) {
      if (localStorage.getItem("isLocationFlag")=='Y') {  //有过跳转记录标识
        let code = '';
        let currentUrl = window.location.href;

        // 避免 wx 不返回 wxCode
        if(currentUrl.indexOf('?') >= 0) {
          // 包含参数
          let urlArr= currentUrl.split('?')[1].split('&')
          let codeArr = urlArr.filter((item) => {
            return item.split('=')[0] === 'code'
          })
          code = codeArr[0].split('=')[1] //从重定向地址地址里面拿到code
        }

        // 根据 wxCode 进行鉴权处理
        store.dispatch('auth', { wxCode: code }).then(res => { //鉴权接口
          console.log(res, '鉴权接口结果')
          localStorage.removeItem("isLocationFlag")
          if (res.respCode === '0000') {
            localStorage.setItem("token", res.result.token)
            localStorage.setItem("wxOpenId", res.result.operatorId)
            // 正常的业务逻辑
          } else {
            Toast({ message: res.respMsg})
          }
        })
      }else{ //没有过跳转记录
        codeRedirect({ currentUrl: window.location.href }).then(res => {
          console.log(res,'重定向接口结果')
          if (res.respCode === '0000') {
            localStorage.setItem("isLocationFlag", 'Y')
            window.location.href = res.result.redirectUrl   //先跳转重定向地址
          } else {
            Toast({ message: res.respMsg})
          }
        })
      }
    } else {
      let token=localStorage.getItem("token")|| ''
      console.log(token,'有token情况下的判断获取的token-------');
      // 正常的业务逻辑处理
    }
  } else {  //不需要登录授权
    next()
  }
})
```

------------------------------------------------------------------------------------------------------------

微信公众号的消息推送

微信公众号的小程序跳转

- 小程序部分机型无法跳转

- 如何兼容环境

- 测试

微信公众号的踩坑指南

公众号 ios12 系统无法接受信息

公众号 

# 参考资料

## 微信缓存问题


https://blog.csdn.net/woyidingshijingcheng/article/details/89926990

浅谈微信页面入口文件被缓存解决方案:  https://www.jb51.net/article/148249.htm

* any list
{:toc}