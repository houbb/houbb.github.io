---
layout: post
title: gitnexus-web 类关系的设计
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---


# 基本关系

```
project->package->file


file->
  class
  enum
  interface

class->
  methods
  fields

methods->
  returns
  param
  throws


fields->
  refType  
```

方法间：

```
methods->call->methods
```


# 备注

这个设计比较一般

可以根据实际优化

# 参考资料

* any list
{:toc}