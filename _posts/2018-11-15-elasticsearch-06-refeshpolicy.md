---
layout: post
title: Elasticsearch-06-Es分片数据刷新策略（RefreshPolicy） 
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---


# RefreshPolicy-刷新策略

es分片默认刷新频率为1s

刷新频率越高越耗资源（刷新即写入硬盘，并会产生记录），详细参考es的refresh过程

```js
{
  "settings": {},
  "defaults": {
    "index": {
      "refresh_interval": "1s"
    }
  }
}
```

为保证数据实时性，es提供手动刷新方法，以Java为例

org.elasticsearch.action.support.WriteRequest.RefreshPolicy

```java
/**
 * 默认，不刷新
 * 不消耗资源
 * 连续操作容易导致数据不同步 
 */
NONE("false"),
/**
 * 强制刷新，立即刷新数据，刷新成功后结束
 * 保证最终数据同步
 * 耗资源
 */
IMMEDIATE("true"),
/**
 * 延迟刷新数据，刷新成功后结束
 * 保证最终数据同步
 * 耗时（根据refresh_interval配置决定等待时间
 */
WAIT_UNTIL("wait_for");
```


在请求结束后对我们写入的索引调用刷新

# Java操作es刷新案例

```java
//### Rest方式
@Autowired
public ElasticsearchRestTemplate elasticsearchRestTemplate;

BulkOptions.BulkOptionsBuilder builder = BulkOptions.builder();
//设置刷新策略
builder.withRefreshPolicy(WriteRequest.RefreshPolicy.IMMEDIATE);
//1、批量更新
elasticsearchRestTemplate.bulkUpdate(updateQueries, builder.build(),IndexCoordinates.of("索引名称"));

//2、单条更新
elasticsearchRestTemplate.update(updateQueries, builder.build(),IndexCoordinates.of("索引名称"));

//3、通过调整更新参数配置刷新
//此方式不适用于bulk操作 (RefreshPolicy is not supported on an item request. Set it on the BulkRequest instead.;
UpdateQuery updateQuery = builder.withRefresh(UpdateQuery.Refresh.True).withDocument(document).build();


//### Client原生方式
@Autowired
private RestHighLevelClient client;

UpdateByQueryRequest request = new UpdateByQueryRequest("索引名称");
//在请求结束后对我们写入的索引调用刷新
request.setRefresh(true);
client.updateByQueryAsync(request, RequestOptions.DEFAULT,listener);
```

## Es 语法

```
PUT /test/_doc/2?refresh=true
{"test": "test"}
```


# 小结

所事情的第一步，是要确定为什么做？要不要做？

然后是为什么这样做？这样做对不对？有没有更简单的方法？

第三步才是决定做

开始做的时候，一定要局部最小开始处理。避免范围影响太大。

# 参考资料

https://www.jianshu.com/p/76d7564ee180

* any list
{:toc}