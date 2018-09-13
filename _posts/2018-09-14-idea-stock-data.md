---
layout: post
title: Stock Data
date:  2018-09-14 12:02:42 +0800
categories: [Finance]
tags: [idea, java, stock, finance]
published: true
excerpt: 股票数据
---

# 数据来源

## sina 

- sina

http://hq.sinajs.cn/list=sh601006

- url 

http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=1&num=10&sort=symbol&asc=1&node=hs_a&symbol=&_s_r_a=init

## 雅虎

https://github.com/c0redumb/yahoo_quote_download

## Alpha Vantage API 

[文档](https://www.alphavantage.co/documentation/)

https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=demo&datatype=csv

### 全部以天为单位的信息

https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&symbol=002245&apikey=WQMZTBMHUKY0JF5T&datatype=json

WQMZTBMHUKY0JF5T.

## 国内所有股票信息

[上海](http://quote.eastmoney.com/stocklist.html#sh)

[深圳](http://quote.eastmoney.com/stocklist.html#sz)

- 可以查看对应的详细信息

http://quote.eastmoney.com/szXXXX.html

ps: 这个页面不用抓取。直接跳转(内嵌即可)

# 预期功能

## 相关性

债券的相关性计算

任意 2 只股之间的相关性。

## 投资组合 

基础：相关性

如何多支股票，保证利益最大化。输出最有资产配置表。

## 预测

感觉这个意义不大，人为因素太多。

## 条件限制

比如股票需要1年以上的存在时间。

新股不在考虑范围内。

# 参考资料

http://blog.sina.com.cn/s/blog_afae4ee50102wu8a.html

http://www.the-data-wrangler.com/acquiring-stock-market-data-from-alpha-vantage/

* any list
{:toc}