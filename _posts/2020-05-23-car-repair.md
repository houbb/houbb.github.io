---
layout: post
title: 汽车维修
date:  2020-5-23 09:38:42 +0800
categories: [Crawler]
tags: [crawler, sf]
published: false
---

# 背景

所有城市的汽车信息。


# 如何跳过反爬虫

## IP代理(Proxy)

如何设置？config.py中有详细的各个代理设置注释，建议使用PROXY_POOL进行IP代理，可以使用一次一个的接口来获取代理IP。

## UA池

user-agent可以使用settings.py中的UA池，如果你有更多的可用UA，可以自己加进去或者替换掉。

## 用户cookie

如果你需要爬取加密的商铺点评数据（页数>1），则需要添加点评用户的登陆cookie到config.py的COOKIE中。

具体内容为一个字符串，如：‘_lxsdk_cuid=1681d897b62c8;_hc.v=ff4f63f6;thirdtoken=c9792’之类的。

可以在浏览器调试界面获得。

# 参考资料

[车工坊-门店查询](http://www.caremore-sgm.com/store.html)

[汽车之家](https://www.autohome.com.cn/beijing/)

['大众点评爬虫可用API'](https://www.linkin.site/2019/01/14/%E5%A4%A7%E4%BC%97%E7%82%B9%E8%AF%84%E7%88%AC%E8%99%AB%E5%8F%AF%E7%94%A8API/)

[大众点评爬虫](https://github.com/Starbucksstar/Crawler-DZDP)

[点评爬虫](https://github.com/DropsDevopsOrg/ECommerceCrawlers/tree/master/DianpingCrawler)

[易快修](http://www.yikuaixiu.com/page/store.html)

[大众点评-店铺信息](https://github.com/Northxw/Dianping)

## 其他思路

百度地图

google 地图

高德地图

腾讯地图

* any list
{:toc}