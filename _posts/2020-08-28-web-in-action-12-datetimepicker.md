---
layout: post
title:  web 实战-12-Bootstrap DateTimePicker 日期空间使用记录
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 场景

日期的选择，在控台之中非常的常见。

Bootstrap DateTimePicker 空间是一款非常好用强大的日期控件。

# 快速开始

## 依赖引入

```html
<!--引入 css --><link href="../../assets/common/commonCss.css" rel="stylesheet" />
<link href="../../assets/plugins/bootstrap-datepicker/css/bootstrap-datepicker.css" rel="stylesheet" />
<link href="../../assets/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.css" rel="stylesheet" /><!--  引入js-->
<script src="../../assets/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js"></script>	
<script src="../../assets/plugins/bootstrap-datepicker/locales/bootstrap-datepicker.zh-CN.js"></script>	
<script src="../../assets/plugins/bootstrap-daterangepicker/moment.js"></script>	
<script src="../../assets/plugins/bootstrap-eonasdan-datetimepicker/build/js/bootstrap-datetimepicker.min.js"></script>
```

## 页面使用

```html
<div class="form-group">
    <label>日期</label>
    <input type="text" id="date" class="form-control" placeholder="日期" >
</div>
```

- jQuery 初始化

```js
$('#date').datepicker({
    format: 'yyyy-mm-dd',
    autoclose: true
});
```

format 是显示的格式，autoclose 为选中后自动关闭悬浮框。

## 效果

这里是一个最基本的日期效果

格式为：yyyy-MM-dd

# 常用点

## 时间判断

一般我们会限制时间范围不超过一个月：

```js
/**
 * 日期校验
 *
 * 当一个日期不存在时，直接不做校验。
 * @param beginDate 开始日期
 * @param endDate 结束日期
 * @return {boolean} 是否通过
 */
function validateDate(beginDate, endDate) {
    if (beginDate == null || beginDate.length === 0) {
        return true;
    }
    if (endDate == null || endDate.length === 0) {
        return true;
    }
    var beginDateTime = new Date(beginDate.replace(/\-/g, "\/"));
    var endDateTime = new Date(endDate.replace(/\-/g, "\/"));
    if (beginDateTime > endDateTime) {
        alert("开始日期不能大于结束日期！");
        return false;
    }
    var day31 = 30 * 24 * 60 * 60 * 1000;
    if ((endDateTime.getTime() - beginDateTime.getTime()) > day31) {//1~31 其实是31天，所有日期的区间30天就相当于间隔31天
        alert("日期间隔不能超过31天！");
        return false;
    }
    return true;
}
```

## 如何禁用用户手动输入

页面最佳实践：能不让用户手动输入的地方，就不要让用户手动输入。

因为自主性输入会带来很多问题，比如处理复杂，甚至有恶意攻击的可能性。

禁用：需要禁用用户手动输入，也要禁用复制等操作。

最简单的方式，直接将 input 设置为只读（或者 disabled）：

```html
<input type="text" class="form-control" id="date" readonly="readonly"/></div>
```

设置值后，时间控件依然可以正常使用，不过用户无法手动输入。

## 如何显示年月

需求：我们只希望显示年月，应该怎么办？

- html

```html
<input type="text" class="form-control" id="month"/></div>
```

- js

```js
$("#month").datepicker({
    startView: 'years',  //起始选择范围
    maxViewMode:'years', //最大选择范围
    minViewMode:'months', //最小选择范围
    todayHighlight : true,// 当前时间高亮显示
    autoclose : 'true',// 选择时间后弹框自动消失
    format : 'yyyy-mm',// 时间格式
    language : 'zh-CN',// 汉化
});
```

- 效果

首先选择年，然后选择月份。

# 参考资料

[bootstrap中日历组件只显示年月](https://www.cnblogs.com/kevinZhu/p/7600372.html)

* any list
{:toc}