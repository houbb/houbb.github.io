---
layout: post
title:  ElasticSearch知识体系详解-06索引：索引模板(IndexTemplate)详解
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---

# 06 索引：索引模板(Index Template)详解

## 索引模板

索引模板是一种告诉Elasticsearch在创建索引时如何配置索引的方法。

* **使用方式**

在创建索引之前可以先配置模板，这样在创建索引（手动创建索引或通过对文档建立索引）时，模板设置将用作创建索引的基础。

### 模板类型

模板有两种类型：**索引模板**和**组件模板**。

* **组件模板**是可重用的构建块，用于配置映射，设置和别名；它们不会直接应用于一组索引。
* **索引模板**可以包含组件模板的集合，也可以直接指定设置，映射和别名。

### 索引模板中的优先级

* 可组合模板优先于旧模板。如果没有可组合模板匹配给定索引，则旧版模板可能仍匹配并被应用。
* 如果使用显式设置创建索引并且该索引也与索引模板匹配，则创建索引请求中的设置将优先于索引模板及其组件模板中指定的设置。
* 如果新数据流或索引与多个索引模板匹配，则使用优先级最高的索引模板。

### 内置索引模板

Elasticsearch具有内置索引模板，每个索引模板的优先级为100，适用于以下索引模式：

* logs-/*-/*
* metrics-/*-/*
* synthetics-/*-/*

所以在涉及内建索引模板时，要避免索引模式冲突。更多可以参考[这里](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html)

### 案例

* 首先**创建两个索引组件模板**：

```
PUT _component_template/component_template1
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}

PUT _component_template/runtime_component_template
{
  "template": {
    "mappings": {
      "runtime": { 
        "day_of_week": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ROOT))"
          }
        }
      }
    }
  }
}
```

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-1.png)

* **创建使用组件模板的索引模板**

```
PUT _index_template/template_1
{
  "index_patterns": ["bar*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        },
        "created_at": {
          "type": "date",
          "format": "EEE MMM dd HH:mm:ss Z yyyy"
        }
      }
    },
    "aliases": {
      "mydata": { }
    }
  },
  "priority": 500,
  "composed_of": ["component_template1", "runtime_component_template"], 
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}
```


执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-2.png)

* 创建一个匹配bar*的索引bar-test

```
PUT /bar-test
```

然后获取mapping

```
GET /bar-test/_mapping
```

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-3.png)

## 模拟多组件模板

由于模板不仅可以由多个组件模板组成，还可以由索引模板自身组成；那么最终的索引设置将是什么呢？ElasticSearch设计者考虑到这个，提供了API进行模拟组合后的模板的配置。

### 模拟某个索引结果

比如上面的template_1, 我们不用创建bar/*的索引(这里模拟bar-pdai-test)，也可以模拟计算出索引的配置：

```
POST /_index_template/_simulate_index/bar-pdai-test
```

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-4.png)

### 模拟组件模板结果

当然，由于template_1模板是由两个组件模板组合的，我们也可以模拟出template_1被组合后的索引配置：

```
POST /_index_template/_simulate/template_1
```

执行结果如下：

```json
{
  "template" : {
    "settings" : {
      "index" : {
        "number_of_shards" : "1"
      }
    },
    "mappings" : {
      "runtime" : {
        "day_of_week" : {
          "type" : "keyword",
          "script" : {
            "source" : "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ROOT))",
            "lang" : "painless"
          }
        }
      },
      "properties" : {
        "@timestamp" : {
          "type" : "date"
        },
        "created_at" : {
          "type" : "date",
          "format" : "EEE MMM dd HH:mm:ss Z yyyy"
        },
        "host_name" : {
          "type" : "keyword"
        }
      }
    },
    "aliases" : {
      "mydata" : { }
    }
  },
  "overlapping" : [ ]
}
```

### 模拟组件模板和自身模板结合后的结果

* 新建两个模板

```
PUT /_component_template/ct1
{
  "template": {
    "settings": {
      "index.number_of_shards": 2
    }
  }
}

PUT /_component_template/ct2
{
  "template": {
    "settings": {
      "index.number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}
```

模拟在两个组件模板的基础上，添加自身模板的配置

```
POST /_index_template/_simulate
{
  "index_patterns": ["my*"],
  "template": {
    "settings" : {
        "index.number_of_shards" : 3
    }
  },
  "composed_of": ["ct1", "ct2"]
}
```

执行的结果如下

```json
{
  "template" : {
    "settings" : {
      "index" : {
        "number_of_shards" : "3",
        "number_of_replicas" : "0"
      }
    },
    "mappings" : {
      "properties" : {
        "@timestamp" : {
          "type" : "date"
        }
      }
    },
    "aliases" : { }
  },
  "overlapping" : [ ]
}
```

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-5.png)

## 参考文章

[https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html)

[https://www.elastic.co/guide/en/elasticsearch/reference/current/simulate-multi-component-templates.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/simulate-multi-component-templates.html)


# chat

## 详细介绍一下 ES 的 索引模板(Index Template)

Elasticsearch（ES）索引模板（Index Template）是一种用于定义索引设置和映射的机制。

索引模板允许你在创建新索引时自动应用一组预定义的设置和映射，从而确保索引的一致性和规范性。

这对于大规模的数据存储和检索非常有用，特别是当你有许多相似结构的索引时。

以下是关于Elasticsearch索引模板的详细介绍：

### 1. **目的和优势:**
   - **一致性：** 通过使用索引模板，你可以确保在创建新索引时应用相同的设置和映射，保持索引之间的一致性。
   - **自动化：** 索引模板允许你自动应用预定义的规范，减少手动设置的需要，提高系统的自动化程度。
   - **灵活性：** 索引模板可以根据需要包含变量，使其更加灵活，以适应多种数据结构。

### 2. **索引模板的结构:**
   - **模板名称：** 索引模板由一个唯一的名称标识，以便在创建索引时引用。
   - **匹配模式：** 定义了哪些索引应该应用该模板。可以使用通配符进行模式匹配。
   - **设置：** 包括索引的设置，如分片数、副本数等。
   - **映射：** 包含了字段映射，定义了索引中字段的类型、分析器等。

### 3. **创建索引模板的步骤:**
   - **定义模板：** 使用Elasticsearch的API或命令行工具定义索引模板，包括模板名称、匹配模式、设置和映射。
   - **应用模板：** 当创建新索引时，模板将被自动应用于符合匹配模式的索引。

### 4. **例子:**
   ```json
   {
     "index_patterns": ["logs-*"],
     "settings": {
       "number_of_shards": 3,
       "number_of_replicas": 1
     },
     "mappings": {
       "properties": {
         "timestamp": {
           "type": "date"
         },
         "message": {
           "type": "text"
         }
       }
     }
   }
   ```
   上述例子定义了一个模板，适用于所有以"logs-"开头的索引。它设置了分片数和副本数，并定义了两个字段的映射。

### 5. **模板的更新:**
   - 可以随时更新索引模板，新的设置和映射将应用于以后创建的索引。

### 6. **管理模板:**
   - 通过Elasticsearch API或管理工具，可以查看、创建、更新和删除索引模板。

### 7. **动态模板:**
   - 可以使用动态模板来根据索引的一些属性动态地选择要应用的模板。

索引模板是Elasticsearch中一个强大的工具，可以帮助你确保索引的一致性，并简化索引管理的过程。

## 为什么需要索引模板(Index Template)？而不是 ES 默认创建索引，就像 mysql 类似那种

索引模板在Elasticsearch中的引入是为了提供更灵活和自动化的索引管理方式，以满足大规模、动态和多样化的数据存储和检索需求。

相较于像MySQL这样的关系型数据库，Elasticsearch面向全文搜索和复杂查询，因此其数据结构更为灵活，索引模板的引入带来了一些优势：

1. **动态映射：** Elasticsearch索引是无模式的，可以容纳各种不同的数据结构。索引模板允许你定义字段的映射，包括数据类型、分析器等，从而确保新索引的一致性。这对于处理动态数据和不同类型的文档非常重要。

2. **自动化管理：** Elasticsearch索引模板使索引的创建和管理自动化。通过定义模板，你可以在创建新索引时自动应用一组预定义的设置，而无需手动干预。这对于大规模的数据集和频繁创建索引的情况下尤为有用。

3. **灵活性：** 索引模板的存在允许你根据数据的不同特性为不同类型的索引定义不同的设置和映射。这种灵活性是在处理多样化数据时非常有益的，而不同于关系型数据库的表结构。

4. **适应变化：** 在动态环境中，数据的结构可能会不断变化。使用索引模板可以更容易地适应这些变化，而不必每次都手动调整每个索引的设置和映射。

5. **提高效率：** 索引模板可以提高索引的创建效率。当你有大量相似结构的索引时，通过使用索引模板，可以确保这些索引共享相同的规范，减少了手动处理的复杂性。

总体而言，索引模板为Elasticsearch提供了更强大的索引管理工具，使其更适应大规模和动态数据的存储与检索需求。相对于关系型数据库的表结构，Elasticsearch更注重数据的灵活性和动态性，因此索引模板是在这种背景下提供更好的管理和适应性的工具。


# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/06%20%e7%b4%a2%e5%bc%95%ef%bc%9a%e7%b4%a2%e5%bc%95%e6%a8%a1%e6%9d%bf%28Index%20Template%29%e8%af%a6%e8%a7%a3.md

* any list
{:toc}
