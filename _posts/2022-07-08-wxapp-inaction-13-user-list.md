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

## 代码实现

```java
package com.github.houbb.wechat.server.service.task;

import cn.hutool.core.collection.CollectionUtil;
import com.github.houbb.heaven.util.util.DateUtil;
import com.github.houbb.wechat.server.dal.entity.WxUserOpenidInfo;
import com.github.houbb.wechat.server.service.extra.WxUserOpenidInfoServiceEx;
import com.github.houbb.wechat.server.service.service.WxUserOpenidInfoService;
import lombok.extern.slf4j.Slf4j;
import me.chanjar.weixin.common.error.WxErrorException;
import me.chanjar.weixin.mp.api.WxMpService;
import me.chanjar.weixin.mp.bean.result.WxMpUserList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class WxUserOpenIdTask {

    @Autowired
    private WxMpService wxMpService;

    @Autowired
    private WxUserOpenidInfoService wxUserOpenidInfoService;

    @Autowired
    private WxUserOpenidInfoServiceEx wxUserOpenidInfoServiceEx;

    /**
     * 分页查询，一次 10000 个
     */
    public void saveAllWxOpenId() {
        // 查询第一次的 10000
        String lastOpenId = null;
        WxMpUserList wxMpUserList = null;

        do {
            try {
                log.info("开始查询微信--------------------------------------------");
                wxMpUserList = wxMpService.getUserService().userList(lastOpenId);
                lastOpenId = wxMpUserList.getNextOpenid();
                log.info("完成查询微信-------------------------------------------- {}", wxMpUserList.getCount());

                // 遍历处理
                List<String> idList = wxMpUserList.getOpenids();
                if(CollectionUtil.isEmpty(idList)) {
                    break;
                }

                for(String wxOpenId : idList) {
                    log.info("开始处理 wx: {}", wxOpenId);
                    boolean containsFlag = wxUserOpenidInfoServiceEx.contains(wxOpenId);
                    if(containsFlag) {
                        log.warn("已经包含标识 {}", wxOpenId);
                        continue;
                    }

                    WxUserOpenidInfo wxUserOpenidInfo = new WxUserOpenidInfo();
                    wxUserOpenidInfo.setWxOpenId(wxOpenId);
                    wxUserOpenidInfo.setAddDate(DateUtil.getCurrentDatePureStr());
                    // 不包含的时候，则插入
                    wxUserOpenidInfoService.insert(wxUserOpenidInfo);
                }
            } catch (WxErrorException e) {
                throw new RuntimeException(e);
            }
        } while (wxMpUserList.getCount() > 0);
    }

}
```

## 说明

用这个方法获取历史数据，基于事件实时获取最新的关注信息。

然后再根据 userInfo 获取用户的信息。

# 限制

## 报错

```
【请求地址】: https://api.weixin.qq.com/cgi-bin/user/get?access_token=66_uSMIp0R8PDGV43xgv1K4E9uNmyO2-yqIUkqjA6jRvzcATP6LHjdYZk7RDiKMcbdVjibMblF0krHK0lqMU37PwDQgFZ0SMSLnxl3gsEs7NVWT4ectS2eaXhDI6OINCEaAAAIXZ
【请求参数】：null
【错误信息】：{"errcode":48001,"errmsg":"api unauthorized rid: 64015252-74a9a21a-7e5122e8"}

java.lang.RuntimeException: me.chanjar.weixin.common.error.WxErrorException: {"errcode":48001,"errmsg":"api unauthorized rid: 64015252-74a9a21a-7e5122e8"}
```

## 接口权限

发现获取用户列表中，个人账户是没有办法通过[【微信认证】](https://mp.weixin.qq.com/acct/wxverifyorder?action=index&token=362163201&lang=zh_CN)的

# 参考资料

https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html

https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId

* any list
{:toc}