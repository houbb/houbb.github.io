---
layout: post
title: Apache Calcite 源码分析-06-ES schema
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 概述

简单看一下 ES 的查询是如何实现的

# ElasticsearchSchema

## 基本属性

```java
public class ElasticsearchSchema extends AbstractSchema {
	//es client
    private final RestClient client;
    private final ObjectMapper mapper;
    private final Map<String, Table> tableMap;
    private final int fetchSize;
```

## 构造器

基本的创建

```java
	public ElasticsearchSchema(RestClient client, ObjectMapper mapper, String index) {
        this(client, mapper, index, 5196);
    }

    @VisibleForTesting
    ElasticsearchSchema(RestClient client, ObjectMapper mapper, String index, int fetchSize) {
        this.client = (RestClient)Objects.requireNonNull(client, "client");
        this.mapper = (ObjectMapper)Objects.requireNonNull(mapper, "mapper");
        Preconditions.checkArgument(fetchSize > 0, "invalid fetch size. Expected %s > 0", new Object[]{fetchSize});
        this.fetchSize = fetchSize;
        if (index == null) {
            try {
                this.tableMap = this.createTables(this.indicesFromElastic());
            } catch (IOException var6) {
                throw new UncheckedIOException("Couldn't get indices", var6);
            }
        } else {
            this.tableMap = this.createTables(Collections.singleton(index));
        }

    }
```

## 方法

```java
	protected Map<String, Table> getTableMap() {
        return this.tableMap;
    }

    private Map<String, Table> createTables(Iterable<String> indices) {
        ImmutableMap.Builder<String, Table> builder = ImmutableMap.builder();
        Iterator var3 = indices.iterator();

        while(var3.hasNext()) {
            String index = (String)var3.next();
            ElasticsearchTransport transport = new ElasticsearchTransport(this.client, this.mapper, index, this.fetchSize);
			// 创建所有的 ES index => table
            builder.put(index, new ElasticsearchTable(transport));
        }

        return builder.build();
    }

	//向ES服务器,发送GET请求,获得所有的索引库名称
    private Set<String> indicesFromElastic() throws IOException {
        String endpoint = "/_alias";
        Response response = this.client.performRequest(new Request("GET", "/_alias"));
        InputStream is = response.getEntity().getContent();
        Throwable var4 = null;

        HashSet var7;
        try {
            JsonNode root = this.mapper.readTree(is);
            if (!root.isObject() || root.size() <= 0) {
                String message = String.format(Locale.ROOT, "Invalid response for %s/%s Expected object of at least size 1 got %s (of size %d)", response.getHost(), response.getRequestLine(), root.getNodeType(), root.size());
                throw new IllegalStateException(message);
            }

			//获得所有的索引库名称
            Set<String> indices = Sets.newHashSet(root.fieldNames());
            var7 = indices;
        } catch (Throwable var16) {
            var4 = var16;
            throw var16;
        } finally {
            if (is != null) {
                if (var4 != null) {
                    try {
                        is.close();
                    } catch (Throwable var15) {
                        var4.addSuppressed(var15);
                    }
                } else {
                    is.close();
                }
            }

        }

        return var7;
    }
```

代码写了一堆，实际事情非常简单。

发送请求到 ES，然后根据 index 构建对应的 table 信息。

创建表的核心逻辑是下面：

```java
ElasticsearchTransport transport = new ElasticsearchTransport(this.client, this.mapper, index, this.fetchSize);
// 创建所有的 ES index => table
builder.put(index, new ElasticsearchTable(transport));
```

# ElasticsearchTransport

## 基本属性

```java
final class ElasticsearchTransport {
    private static final Logger LOGGER = LoggerFactory.getLogger(ElasticsearchTable.class);

	// 默认 fetch size
    static final int DEFAULT_FETCH_SIZE = 5196;
    private final ObjectMapper mapper;
    private final RestClient restClient;
    final String indexName;
    final ElasticsearchVersion version;
    final ElasticsearchMapping mapping;
    final int fetchSize;
```

## 构造器

```java
	ElasticsearchTransport(RestClient restClient, ObjectMapper mapper, String indexName, int fetchSize) {
        this.mapper = (ObjectMapper)Objects.requireNonNull(mapper, "mapper");
        this.restClient = (RestClient)Objects.requireNonNull(restClient, "restClient");
        this.indexName = (String)Objects.requireNonNull(indexName, "indexName");
        this.fetchSize = fetchSize;
        this.version = this.version();
        this.mapping = this.fetchAndCreateMapping();
    }
```

## search 查询

```java
	Function<ObjectNode, ElasticsearchJson.Result> search() {
        return this.search(Collections.emptyMap());
    }

    Function<ObjectNode, ElasticsearchJson.Result> search(Map<String, String> httpParams) {
        Objects.requireNonNull(httpParams, "httpParams");
        return (query) -> {
            Hook.QUERY_PLAN.run(query);
            String path = String.format(Locale.ROOT, "/%s/_search", this.indexName);

            HttpPost post;
            try {
                URIBuilder builder = new URIBuilder(path);
                httpParams.forEach(builder::addParameter);
				// 这里实际上是封装了 HTTP 请求
                post = new HttpPost(builder.build());

                String json = this.mapper.writeValueAsString(query);
                LOGGER.debug("Elasticsearch Query: {}", json);
                post.setEntity(new StringEntity(json, ContentType.APPLICATION_JSON));
            } catch (URISyntaxException var7) {
                throw new RuntimeException(var7);
            } catch (JsonProcessingException var8) {
                throw new UncheckedIOException(var8);
            }

            return (ElasticsearchJson.Result)this.rawHttp(ElasticsearchJson.Result.class).apply(post);
        };
    }
```

http 封装那一步，就是帮 SQL 转换为 ES 的查询语句：

```
// 把所有的请求参数,转换成:json字符串
// SELECT _MAP['id'],_MAP['title'],_MAP['price'] FROM es.books WHERE _MAP['price'] > 60 LIMIT 2
// {"query":{"constant_score":{"filter":{"range":{"price":{"gt":60}}}}},"_source":["id","title","price"],"size":2}

// SELECT * FROM es.books WHERE _MAP['price'] > 10 offset 0 fetch next 10 rows only
// {"query":{"constant_score":{"filter":{"range":{"price":{"gt":10}}}}},"from":0,"size":10}

// 统计SQL
// SELECT count(*) FROM es.books WHERE _MAP['price'] > 50
// {"query":{"constant_score":{"filter":{"range":{"price":{"gt":50}}}}},"_source":false,"size":0,"stored_fields":"_none_","track_total_hits":true}
```

# 小结

这里个人只有 2 步：

1） SQL 转换为标准的 ES 

2) ES 通过 http 请求，获得响应




# 参考资料

https://www.lixin.help/2021/04/11/Calcite-SQL-ES-Source.html

* any list
{:toc}