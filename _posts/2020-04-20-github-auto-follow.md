---
layout: post
title: Github Auto Follow
date:  2020-4-20 9:43:55 +0800
categories: [Github]
tags: [github, sh]
published: true
---

# 背景

以前被一个 github 用户 follow 了，发现其 follow 了大量的用户。

# Note: Github fixed it so no longer works but someting is kind interesting 🤣

GitHub fixed it by using Base64 encoded timestamp (LOL🤣) page index instead of page number so it is harder to quickly navigate to different pages as predict the excat timestamp is hard.

The page index looks like Base64 to me so I decoded some:

Following:
```
Y3Vyc29yOnYyOpK5MjAxOS0wNi0wOVQxOToyNDo0MC0wNDowMM4Cut97 -> cursor:v2:2019-06-09T19:24:40-04:00{
Y3Vyc29yOnYyOpK5MjAxOS0wNi0yNVQyMTo0NzoxNi0wNDowMM4Cwicz -> cursor:v2:2019-06-25T21:47:16-04:00'3
Y3Vyc29yOnYyOpK5MjAxOS0wNS0yNFQxMDowNDo1OC0wNDowMM4CsqPx -> cursor:v2:2019-05-24T10:04:58-04:00
```

Followers:
```
Y3Vyc29yOnYyOpK5MjAxNy0xMS0xMlQwMTowMToxMy0wNTowMM4Bve -> cursor:v2:2017-11-12T01:01:13-05:00
Y3Vyc29yOnYyOpK5MjAxNy0xMS0xMlQwMDo1ODo1Ny0wNTowMM4Bve9S -> cursor:v2:2017-11-12T00:58:57-05:00R
```

That makes sense because the timestamp is used for pagination now instead of page number (from the timestamp get 20 records).
I'm sure there is another easy way to get around this. Just don't have time to play with it.
Have fun!

## Getting Started

1. add chrome extension `cjs` (add jQuery)
2. add the following code
3. goto followers or following page -> refresh page ... 


```javascript
$(document).ready(function() {
  // 1~2 sec
  var seed = parseInt(Math.random() * 1000) + 1000;
  
  //page 1
  var bt_disabled = $('.pagination span').text() === "Previous";
  
  //last page, not prev/next btn
  var pre_next_btn = $('.pagination a').length;
  
  //users haven't been followed this page
  var users = $('.follow button');

  //ex: "?page=100&tab=following"
  var urlPara = location.search;
  
  var currentPage = location.search.match(/-?\d+\.?\d*/) ? parseInt(location.search.match(/-?\d+\.?\d*/)[0]) : 0;
  
  //remove all unfollow form
  $('.unfollow').remove();

  users.each(function(index, value) {
    let _this = $(this);
    setTimeout(function() {
      _this.trigger('click');
    }, index * seed);
  });
  
  setTimeout(function() {
    if (bt_disabled) {
      $('.pagination a')[0].click();
    } else if (pre_next_btn === 0) {
      console.log('done......');
    } else {
      window.location = window.location.pathname + location.search.replace(currentPage, currentPage + 1);
    }
  }, users.length * seed);
});


```

## ~~What's next?~~

~~Current speed: 12 following / sec (43,000 / hour), it is easy to get 300k following but to scale up to 10 million following this is slow.~~

make sure you know what you are doing... LoL (your account could get suspended 😂😂😂 ...)

# Github 获取邮件信息流程

## 获取用户列表

参见 [search-users](https://developer.github.com/v3/search/#search-users)

```
https://api.github.com/search/users?q=ruanyifeng
```

比如以这个地址为了，可以获取相关的用户列表

```json
{
  "total_count": 3,
  "incomplete_results": false,
  "items": [
    {
      "login": "ruanyifeng",
      "id": 53803693,
      "node_id": "MDQ6VXNlcjUzODAzNjkz",
      "avatar_url": "https://avatars0.githubusercontent.com/u/53803693?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/ruanyifeng",
      "html_url": "https://github.com/ruanyifeng",
      "followers_url": "https://api.github.com/users/ruanyifeng/followers",
      "following_url": "https://api.github.com/users/ruanyifeng/following{/other_user}",
      "gists_url": "https://api.github.com/users/ruanyifeng/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/ruanyifeng/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/ruanyifeng/subscriptions",
      "organizations_url": "https://api.github.com/users/ruanyifeng/orgs",
      "repos_url": "https://api.github.com/users/ruanyifeng/repos",
      "events_url": "https://api.github.com/users/ruanyifeng/events{/privacy}",
      "received_events_url": "https://api.github.com/users/ruanyifeng/received_events",
      "type": "User",
      "site_admin": false,
      "score": 1.0
    }
  ]
}
```

## 获取用户邮箱

在获取到用户列表之后，直接根据 url 属性获取

```
https://api.github.com/users/ruanyf
```

### 浏览器访问

结果如下：

```json
{
  "login": "ruanyf",
  "id": 905434,
  "node_id": "MDQ6VXNlcjkwNTQzNA==",
  "avatar_url": "https://avatars0.githubusercontent.com/u/905434?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/ruanyf",
  "html_url": "https://github.com/ruanyf",
  "followers_url": "https://api.github.com/users/ruanyf/followers",
  "following_url": "https://api.github.com/users/ruanyf/following{/other_user}",
  "gists_url": "https://api.github.com/users/ruanyf/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/ruanyf/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/ruanyf/subscriptions",
  "organizations_url": "https://api.github.com/users/ruanyf/orgs",
  "repos_url": "https://api.github.com/users/ruanyf/repos",
  "events_url": "https://api.github.com/users/ruanyf/events{/privacy}",
  "received_events_url": "https://api.github.com/users/ruanyf/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Ruan YiFeng",
  "company": null,
  "blog": "https://twitter.com/ruanyf",
  "location": "Shanghai, China",
  "email": null,
  "hireable": null,
  "bio": null,
  "public_repos": 63,
  "public_gists": 27,
  "followers": 60135,
  "following": 0,
  "created_at": "2011-07-10T01:07:17Z",
  "updated_at": "2020-04-07T19:23:13Z"
}
```

### 程序访问

这里的邮箱信息为空，因为 github 会有保护措施。

需要我们首先登陆，才能查看邮箱。

```java
Map<String, String> headerMap = new HashMap<>();
headerMap.put("User-Agent", "Mozilla/5.0");
headerMap.put("Authorization", "token 78e380f2e6d1a4b8239d9c3baea026b6d248fe14");
headerMap.put("Content-Type", "application/json");
headerMap.put("method", "GET");
headerMap.put("Accept", "application/json");
OkHttpClient client = new OkHttpClient();
Request request = new Request.Builder()
        .url("https://api.github.com/users/ruanyf")
        .headers(Headers.of(headerMap))
        .build();
Response response = client.newCall(request).execute();
String json =  response.body().string();
System.out.println(json);
```

结果如下：

```json
{
    "login":"ruanyf",
    "id":905434,
    "node_id":"MDQ6VXNlcjkwNTQzNA==",
    "avatar_url":"https://avatars0.githubusercontent.com/u/905434?v=4",
    "gravatar_id":"",
    "url":"https://api.github.com/users/ruanyf",
    "html_url":"https://github.com/ruanyf",
    "followers_url":"https://api.github.com/users/ruanyf/followers",
    "following_url":"https://api.github.com/users/ruanyf/following{/other_user}",
    "gists_url":"https://api.github.com/users/ruanyf/gists{/gist_id}",
    "starred_url":"https://api.github.com/users/ruanyf/starred{/owner}{/repo}",
    "subscriptions_url":"https://api.github.com/users/ruanyf/subscriptions",
    "organizations_url":"https://api.github.com/users/ruanyf/orgs",
    "repos_url":"https://api.github.com/users/ruanyf/repos",
    "events_url":"https://api.github.com/users/ruanyf/events{/privacy}",
    "received_events_url":"https://api.github.com/users/ruanyf/received_events",
    "type":"User",
    "site_admin":false,
    "name":"Ruan YiFeng",
    "company":null,
    "blog":"https://twitter.com/ruanyf",
    "location":"Shanghai, China",
    "email":"yifeng.ruan@gmail.com",
    "hireable":null,
    "bio":null,
    "public_repos":63,
    "public_gists":27,
    "followers":60139,
    "following":0,
    "created_at":"2011-07-10T01:07:17Z",
    "updated_at":"2020-04-07T19:23:13Z"
}
```

如此就可以拿到对应的 email 信息。

# 分页处理

## api

[分页](https://developer.github.com/v3/#pagination)

## 例子

```
curl 'https://api.github.com/user/repos?page=2&per_page=100'
```

默认返回 30 个，最多可以设置为 100 个。

## 时间限制

最多 1min 不登录可以查询 10 次。

1min 登录有可以查询 30 次。

超出的部分会被限流。

# 如何获取 token 

其中用户名加密码的用户方式不是很安全，需要将登录的用户名和密码暴露在代码中。

所以一般采取Token的认证方式比较多。其中token是在Github官网上生成的。

```
settings → Developersettings → Personal access tokens → Generate new token。
```

# url 查看

```
https://api.github.com/search/users?q=houbb%20in:url
```

可以查看 url 中有 `houbb` 的字符串。

name 和 url 应该是严格一一对应的。

ps: 直接查询 in:name 查不到结果。

# 拓展阅读

[https://developer.github.com/v3/](https://developer.github.com/v3/)

# 参考资料

[Github API：爬取Github用户数据](https://blog.csdn.net/qq_25537177/article/details/80561507)

* any list
{:toc}