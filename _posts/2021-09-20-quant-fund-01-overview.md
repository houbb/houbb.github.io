---
layout: post
title: 量化交易之基金篇 quant 01 概率
date: 2021-09-09 21:01:55 +0800
categories: [Quant]
tags: [fund, quant, sh]
published: true
---

# 天天基金网

##  基金

所有的基金

http://fund.eastmoney.com/allfund.html

- 基金的详情

http://fund.eastmoney.com/f10/000001.html

- 基金对应的基金经理

http://fundf10.eastmoney.com/jjjl_000001.html

变换最后的基金编码

- 基金的数据

http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000001&sdate=2015-05-05&edate=2018-05-05&per=10

居然还是个动态卷轴，改变地址咒语中的代码code、开始日期sdate、截止日期edate和分页数量per，

https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz&code=000001&sdate=2015-05-05&edate=2018-05-05&per=40&page=1

page 对应的页数

per 最大为 40

## 基金评级

http://api.fund.eastmoney.com/F10/JJPJ/?callback=jQuery18306361654704720274_1632320287852&fundcode=000001&pageIndex=2&pageSize=50&_=1632320302887

http://api.fund.eastmoney.com/F10/JJPJ?fundcode=000001&pageIndex=2&pageSize=50&_=1632320302887

添加对应的 header 信息即可。

## 基金持仓

http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=000001&topline=1000&year=2021&month=12  第四季度

http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=000001&topline=1000&year=2021&month=9  第3季度

http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=000001&topline=1000&year=2021&month=6  第2季度

http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=000001&topline=1000&year=2021&month=6,3  第1季度



https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=000001&topline=1000&year=2019&month=&rt=0.9728810782356063

code 基金代码

topline 前多少个

year 年

month 月份，实际上怎么制定，其他几个月份也会返回，

直接按照年返回即可。



rt? 固定值

## 基金經理

所有：

http://fund.eastmoney.com/manager/#dt14;mcreturnjson;ftall;pn50;pi1;scabbname;stasc

http://fund.eastmoney.com/manager/30634044.html 详情

## 基金公司

所有：

http://fund.eastmoney.com/Company/default.html

http://fund.eastmoney.com/Company/80084302.html

## 托管公司（银行）

银行列表

http://fund.eastmoney.com/bank/default.html

http://fund.eastmoney.com/bank/80001068.html

# 技术选型

java + jsoup + httpclient

存储：json  数据库？ mongodb？

页面展现：Echarts 

交易回测：交易策略回测


已有的数据：https://github.com/fundvis/fund-data



# 参考资料

https://github.com/youngdro/fundSpider

[node基金爬虫，自导自演了解一下？](https://juejin.cn/post/6844903602910150669)

[基金投资策略分析](http://sunshowerc.github.io/fund/#/)

[基金投资策略分析，基金回测工具](https://github.com/SunshowerC/fund-strategy)

[基于Spring boot 实现的股票基金爬虫工具](https://github.com/chingov/istock-fund)

[一个基于spring boot 实现的java股票爬虫(仅支持A股)，如果你❤️请⭐ . V2升级版正在开发中！](https://github.com/kingschan1204/istock)

[爬取天天基金网，辅助对投资基金的选择](https://github.com/Jerry1014/FundCrawler)

[天天基金数据处理](https://github.com/weibycn/fund)

[天天基金网爬虫：北向资金、基金每日净值涨跌、大盘涨跌、基金公司信息](https://github.com/CBJerry993/TT_Fund)

[idea插件，查看基金,股票，虚拟币-java](https://github.com/huage2580/leeks)

[爬取天天基金网的基金信息-python](https://github.com/linoodb/Python_FundCrawler)

[实时获取新浪 / 腾讯 的免费股票行情 / 集思路的分级基金行情](https://github.com/shidenggui/easyquotation)

[Golang实现，财报分析，股票检测，基本面选股，基金检测，基金筛选，4433法则，基金持仓相似度](https://github.com/axiaoxin-com/x-stock)

[基金盯盘](https://github.com/JoysKang/fund_pegging)

[国家自然科学基金查询](https://github.com/suqingdong/nsfc)

[爬虫@nullpointer/fund-crawler所爬取的基金数据，包括基金排名和基金净值，每日更新。](https://github.com/fundvis/fund-data)

[提供同花顺客户端/国金/华泰客户端/雪球的基金、股票自动程序化交易以及自动打新，支持跟踪 joinquant /ricequant 模拟交易 和 实盘雪球组合, 量化交易组件](https://github.com/shidenggui/easytrader)

[Mac端基金管理查看平台](https://github.com/Hurdery/jfc)

[基于历史收益率和夏普率的基金排序](https://github.com/lihao100106/Fund_Rank_based_on_Return_Rate_and_Sharpe_Ratio)

[基金、大盘、股票、虚拟货币状态栏显示小应用,支持 MacOS、Windows、Linux 客户端,数据源来自天天基金,蚂蚁基金,腾讯证券,新浪基金等](https://github.com/1zilc/fishing-funds)

* any list
{:toc}