---
layout: post
title:  微信公众号项目开发实战-13-获取所有的用户列表
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 说明

有时候我们期望获取所有的用户关注列表。

那么，有什么方法可以获取到呢？

# 获取用户列表

公众号可通过本接口来获取帐号的关注者列表，关注者列表由一串OpenID（加密后的微信号，每个用户对每个公众号的 OpenID 是唯一的）组成。

一次拉取调用最多拉取10000个关注者的OpenID，可以通过多次拉取的方式来满足需求。

## 接口调用请求说明

```
http请求方式: GET（请使用 https 协议）
https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID
```

```
参数	是否必须	说明
access_token	是	调用接口凭证
next_openid	是	第一个拉取的OPENID，不填默认从头开始拉取
```

返回说明

正确时返回 JSON 数据包：

```json
{
    "total":2,
    "count":2,
    "data":{
    "openid":["OPENID1","OPENID2"]},
    "next_openid":"NEXT_OPENID"
}
```

```
参数	说明
total	关注该公众账号的总用户数
count	拉取的 OPENID 个数，最大值为10000
data	列表数据，OPENID的列表
next_openid	拉取列表的最后一个用户的OPENID
```

错误时返回 JSON 数据包（示例为无效 AppID 错误）：

```json
{"errcode":40013,"errmsg":"invalid appid"}
```

附：关注者数量超过10000时

当公众号关注者数量超过10000时，可通过填写next_openid的值，从而多次拉取列表的方式来满足需求。

具体而言，就是在调用接口时，将上一次调用得到的返回中的next_openid值，作为下一次调用中的next_openid值。

示例如下：

公众账号 A 拥有23000个关注的人，想通过拉取关注接口获取所有关注的人，那么分别请求 url 如下：https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN 返回结果:

```
{
  "total":23000,
  "count":10000,
  "data":{"
     openid":[
        "OPENID1",
        "OPENID2",
        ...,
        "OPENID10000"
     ]
   },
   "next_openid":"OPENID10000"
}https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID1返回结果:
{
   "total":23000,
   "count":10000,
   "data":{
     "openid":[
       "OPENID10001",
       "OPENID10002",
       ...,
       "OPENID20000"
     ]
   },
   "next_openid":"OPENID20000"
}https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID2返回结果（关注者列表已返回完时，返回next_openid为空）:
{
   "total":23000,
   "count":3000,
   "data":{"
       "openid":[
         "OPENID20001",
         "OPENID20002",
         ...,
         "OPENID23000"
       ]
   },
   "next_openid":"OPENID23000"
}
```

# 开源组件

可以使用基于 wxserv

```java
public interface WxMpUserService {
    void userUpdateRemark(String var1, String var2) throws WxErrorException;

    WxMpUser userInfo(String var1) throws WxErrorException;

    WxMpUser userInfo(String var1, String var2) throws WxErrorException;

    List<WxMpUser> userInfoList(List<String> var1) throws WxErrorException;

    List<WxMpUser> userInfoList(WxMpUserQuery var1) throws WxErrorException;

    WxMpUserList userList(String var1) throws WxErrorException;

    List<WxMpChangeOpenid> changeOpenid(String var1, List<String> var2) throws WxErrorException;
}
```

## 例子

查询所有的，实际可以分页依次处理。

```java
WxMpUserList list = wxMpService.getUserService().userList("");

System.out.println(JSON.toJSON(list));
```

结果：

```json
{"total":16,"count":16,"openids":["000Kc6VD8nnOz_RC3VPPPC-dfBGI","000Kc6bg_WOGsCy4Q8P0oWOrZmBs","000Kc6cGfPhbchLolkXqni0xMjyo","000Kc6RPORnAK94hwQAALHwzo_J8","000Kc6R6-KwnH_LDIsqyplSOAPak","000Kc6VYjK-buG_Xbkg2PF4iV6F8","000Kc6T3XA5eoobRr7PqHmBfdUpY","000Kc6UE42KA65XJiGbpnxL65ESw","000Kc6Vyyw5QU1HiTatlkq-pfzyw","000Kc6RUi_gzfUbSzxhBB3SU1W7o","000Kc6Sl76K95T0SPK3Bn2HdJX4Y","000Kc6WpaGCU6o963vENiEa5FLaw","000Kc6U9N9deUVaXciwJoqNyqk_w","000Kc6cdxX-qGcZgqngRzv1MY7Pc","000Kc6ZBsRic98LDG0gZU-rSe6Lc","000Kc6ckvXambobnkkqTMhCkxc2s"],"nextOpenid":"000Kc6ckvXambobnkkqTMhCkxc2s"}
```

# 参考资料

https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html

https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId

* any list
{:toc}