---
layout: post
title: Elasticsearch
date:  2016-10-16 09:07:21 +0800
categories: [Tools]
tags: [elasticsearch]
published: true
---

* any list
{:toc}

# Elasticsearch

Search & Analyze Data in Real Time.

Elasticsearch is a distributed, open source search and analytics engine, designed for horizontal scalability, reliability, and easy management.

> [Elasticsearch](https://www.elastic.co/products/elasticsearch)

> [User Guide](https://www.elastic.co/guide/index.html)


# Install in Mac

<uml>
    Download->Unzip:
    Unzip->Run:
    Run->Visit:
</uml>


- Download

[Download](https://www.elastic.co/downloads/elasticsearch) and unzip

```
$   tar -zxf elasticsearch-2.4.1.tar.gz
```

move it into **tools** package

```
$   mv elasticsearch-2.4.1 ~/it/tools/elasticsearch
```


- Run

Run ```bin/elasticsearch``` on Unix, or use ```bin/elasticsearch &``` run background processes.

```
houbinbindeMacBook-Pro:Downloads houbinbin$ cd ~/it/tools/elasticsearch/
houbinbindeMacBook-Pro:elasticsearch houbinbin$ ls
LICENSE.txt	NOTICE.txt	README.textile	bin		config		lib		modules
houbinbindeMacBook-Pro:elasticsearch houbinbin$ cd bin
houbinbindeMacBook-Pro:bin houbinbin$ ls
elasticsearch			elasticsearch-service-x64.exe	elasticsearch.bat		elasticsearch.in.sh		plugin.bat
elasticsearch-service-mgr.exe	elasticsearch-service-x86.exe	elasticsearch.in.bat		plugin				service.bat
houbinbindeMacBook-Pro:bin houbinbin$ ./elasticsearch
[2016-10-16 09:19:27,876][INFO ][node                     ] [Raman] version[2.4.1], pid[4391], build[c67dc32/2016-09-27T18:57:55Z]
[2016-10-16 09:19:27,877][INFO ][node                     ] [Raman] initializing ...
[2016-10-16 09:19:28,321][INFO ][plugins                  ] [Raman] modules [reindex, lang-expression, lang-groovy], plugins [], sites []
[2016-10-16 09:19:28,343][INFO ][env                      ] [Raman] using [1] data paths, mounts [[/ (/dev/disk1)]], net usable_space [122.7gb], net total_space [232.6gb], spins? [unknown], types [hfs]
[2016-10-16 09:19:28,343][INFO ][env                      ] [Raman] heap size [989.8mb], compressed ordinary object pointers [true]
[2016-10-16 09:19:28,343][WARN ][env                      ] [Raman] max file descriptors [10240] for elasticsearch process likely too low, consider increasing to at least [65536]
[2016-10-16 09:19:29,437][INFO ][node                     ] [Raman] initialized
[2016-10-16 09:19:29,437][INFO ][node                     ] [Raman] starting ...
[2016-10-16 09:19:29,498][INFO ][transport                ] [Raman] publish_address {127.0.0.1:9300}, bound_addresses {[fe80::1]:9300}, {[::1]:9300}, {127.0.0.1:9300}
[2016-10-16 09:19:29,503][INFO ][discovery                ] [Raman] elasticsearch/K1AbiuXxQKifwJIqtFoW0A
[2016-10-16 09:19:32,534][INFO ][cluster.service          ] [Raman] new_master {Raman}{K1AbiuXxQKifwJIqtFoW0A}{127.0.0.1}{127.0.0.1:9300}, reason: zen-disco-join(elected_as_master, [0] joins received)
[2016-10-16 09:19:32,548][INFO ][http                     ] [Raman] publish_address {127.0.0.1:9200}, bound_addresses {[fe80::1]:9200}, {[::1]:9200}, {127.0.0.1:9200}
[2016-10-16 09:19:32,548][INFO ][node                     ] [Raman] started
[2016-10-16 09:19:32,566][INFO ][gateway                  ] [Raman] recovered [0] indices into cluster_state
```

- Visit

Input ```localhost:9200``` in browser to visit it, or use ```curl localhost:9200``` to get info

```
houbinbindeMacBook-Pro:~ houbinbin$ curl localhost:9200
{
  "name" : "Raman",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "WFMtdS4GT4m8w7sdHE5i7Q",
  "version" : {
    "number" : "2.4.1",
    "build_hash" : "c67dc32e24162035d18d6fe1e952c4cbcbe79d16",
    "build_timestamp" : "2016-09-27T18:57:55Z",
    "build_snapshot" : false,
    "lucene_version" : "5.5.2"
  },
  "tagline" : "You Know, for Search"
}
```


# Lucene Search

> [search zh_CN](https://segmentfault.com/a/1190000002972420)

- FULLTEXT

Input a word in search input, like ```hello```, use ```"hello world"``` to search a phrase.


- Field

Finite field search:    ```field:value```

Accurate search:    ```field:"value"```

```http.code:404``` doc that *http status code is 404*

```_exists_:http```：result contains *http* field

```_missing_:http```：result not contains *http* field

- Wildcard

```?``` one char

```*``` zero or more char

The two wildcard should't the first char.


- Fuzzy Search

```word~``` matches word

```cromm~0.3``` matches *from* & *chrome*

- Similar Search

```"select where"~3``` means *select* and *where* divide by 3 or less words.

- Range

```length:[100 TO 200]```
```date:{"now-6h" TO "now"}```

```[ ]``` includes endpoint，```{ }``` not includes.

- Logic

```+``` must has this

```-``` must not has this

```+apache -jakarta test``` means must has *apache*, not has *jakarta*

- Special

```
+ - && || ! () {} [] ^" ~ * ? : \
```












