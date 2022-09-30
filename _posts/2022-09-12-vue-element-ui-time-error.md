---
layout: post
title:  Element UI 时间控件报错 Prop being mutated placement
date:  2022-09-12 09:22:02 +0800
categories: [VUE]
tags: [js, vue, echarts, sh]
published: true
---

# 现象

element ui 时间控件报错：

```
[Vue warn]: Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: "placement "
```

## 代码实现

```xml
<el-date-picker
  size="mini"
  v-model="emp.birthday"
  type="date"
  placeholder="选择日期"
  value-format="yyyy-MM-dd"
  style="width: 150px"
>
</el-date-picker>
```


# 解决方式1-降低版本

将element-ui的版本降至 2.15.6以下（包含2.15.6）

```
npm install element-ui@2.15.6
```

# 解决方式 2

## 为什么报错？

之前遇到问题时，虽然这个问题暂时并不会影响页面操作，但担心会有其他隐患，关键浏览一直报错，强迫症都犯了。百度后发现网上大部分都是说版本问题，2.15.9 开始的，新版本中加了placement这个变量。旧版本不报错，可以退回旧版本就不会报错，具体退回的步骤可参考其他博客的内容。

但感觉回退版本这种方法治标不治本，测试后发现还是要提供placment的赋值数据，其实在于后面的 `PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left` 这里，组件需要根据align或left属性来赋值，查阅官方文档后发现：

![原因](https://img-blog.csdnimg.cn/ea2c7cf324dd4fc28d96d2f6e7aa2de8.png)

picker有align属性，经过测试后发现果然和align有关，随之问题迎刃而解，只要在组件添加align属性即可。

如这里我添加align="center" ，element UI原生组件获取添加的align属性值来设置props中的placement变量

```xml
<el-form-item label="时间：">
       <el-date-picker
           v-model="value2"
           type="date"
           align="center"
           placeholder="时间选择">
       </el-date-picker>
</el-form-item>
```

添加完成后就再进行测试，浏览器再也没有报错了。

# 参考资料

https://blog.csdn.net/geidongdong/article/details/122561517

https://www.cnblogs.com/myqinyh/p/15743881.html

https://blog.csdn.net/qq_43780761/article/details/126188211

* any list
{:toc}