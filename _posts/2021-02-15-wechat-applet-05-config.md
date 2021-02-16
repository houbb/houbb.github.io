---
layout: post
title:  03-微信小程序配置
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 全局配置

小程序根目录下的 app.json 文件用来对微信小程序进行全局配置，决定页面文件的路径、窗口表现、设置网络超时时间、设置多 tab 等。

完整配置项说明请参考 [小程序全局配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)

以下是一个包含了部分常用配置选项的 app.json ：

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/index"
  ],
  "window": {
    "navigationBarTitleText": "Demo"
  },
  "tabBar": {
    "list": [{
      "pagePath": "pages/index/index",
      "text": "首页"
    }, {
      "pagePath": "pages/logs/index",
      "text": "日志"
    }]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": true,
  "navigateToMiniProgramAppIdList": [
    "wxe5f52902cf4de896"
  ]
}
```

# 页面配置

每一个小程序页面也可以使用同名 .json 文件来对本页面的窗口表现进行配置，页面中配置项会覆盖 app.json 的 window 中相同的配置项。

完整配置项说明请参考小程序页面配置

例如：

```json
{
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black",
  "navigationBarTitleText": "微信接口功能演示",
  "backgroundColor": "#eeeeee",
  "backgroundTextStyle": "light"
}
```

# sitemap 配置

微信现已开放小程序内搜索，开发者可以通过 sitemap.json 配置，或者管理后台页面收录开关来配置其小程序页面是否允许微信索引。

当开发者允许微信索引时，微信会通过爬虫的形式，为小程序的页面内容建立索引。

当用户的搜索词条触发该索引时，小程序的页面将可能展示在搜索结果中。 

爬虫访问小程序内页面时，会携带特定的 user-agent：mpcrawler 及场景值：1129。

需要注意的是，若小程序爬虫发现的页面数据和真实用户的呈现不一致，那么该页面将不会进入索引中。

## 具体配置说明

页面收录设置：可对整个小程序的索引进行关闭，小程序管理后台-功能-页面内容接入-页面收录开关；详情

sitemap 配置：可对特定页面的索引进行关闭

小程序根目录下的 sitemap.json 文件用来配置小程序及其页面是否允许被微信索引。

完整配置项说明请参考 [小程序 sitemap 配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html)

## 例子

- 例1：

```json
{
  "rules":[{
    "action": "allow",
    "page": "*"
  }]
}
```

所有页面都会被微信索引（默认情况）

- 例2：

```json
{
  "rules":[{
    "action": "disallow",
    "page": "path/to/page"
  }]
}
```

配置 path/to/page 页面不被索引，其余页面允许被索引

- 例3：

```json
{
  "rules":[{
    "action": "allow",
    "page": "path/to/page"
  }, {
    "action": "disallow",
    "page": "*"
  }]
}
```

配置 path/to/page 页面被索引，其余页面不被索引

- 例4：

```json
{
  "rules":[{
    "action": "allow",
    "page": "path/to/page",
    "params": ["a", "b"],
    "matching": "inclusive"
  }, {
    "action": "allow",
    "page": "*"
  }]
}
```

包含 a 和 b 参数的 path/to/page 页面会被微信优先索引，其他页面都会被索引，例如：

path/to/page?a=1&b=2 => 优先被索引
path/to/page?a=1&b=2&c=3 => 优先被索引
path/to/page => 被索引
path/to/page?a=1 => 被索引
其他页面都会被索引

- 例5：

```json
{
  "rules":[{
    "action": "allow",
    "page": "path/to/page",
    "params": ["a", "b"],
    "matching": "inclusive"
  }, {
    "action": "disallow",
    "page": "*"
  }, {
    "action": "allow",
    "page": "*"
  }]
}
```

path/to/page?a=1&b=2 => 优先被索引
path/to/page?a=1&b=2&c=3 => 优先被索引
path/to/page => 不被索引
path/to/page?a=1 => 不被索引
其他页面由于命中第二条规则，所以不会被索引
由于优先级的问题，第三条规则是没有意义的

注：没有 sitemap.json 则默认所有页面都能被索引

注：{"action": "allow", "page": "*"} 是优先级最低的默认规则，未显式指明 "disallow" 的都默认被索引

## 如何调试

当在小程序项目中设置了 sitemap 的配置文件（默认为 sitemap.json）时,便可在开发者工具控制台上显示当前页面是否被索引的调试信息（ 最新版本的开发者工具支持索引提示）

注：sitemap 的索引提示是默认开启的，如需要关闭 sitemap 的索引提示，可在小程序项目配置文件 project.config.json 的 setting 中配置字段 checkSiteMap 为 false

注: sitemap 文件内容最大为 5120 个 UTF8 字符

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html


* any list
{:toc}