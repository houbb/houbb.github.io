---
layout: post
title:  JQuery 如何实现弹出确认框
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# JS 版本

最简单的版本：

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
<script>
	function openResult(){    /* 绑定事件 */
		var r = confirm("亲，您确定取消该订单吗？")
		if (r == true) {
            alert("确认");
		} else {
			alert("取消");
		}
	} 
</script>
</head>
<body>
	<input type="button" onclick="openResult()" value="退出"/>
</body>
</html>
```

缺点就是比较丑。


# jquery confirm 删除框


## 依赖

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.css"></link>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.js"></script>
```

## 提示框


```java
$(".btn").on("click", function () {
	var btn = $(this);
	
	$.confirm({
		title: '确认',
        content: '确认进行处理吗？',
		buttons: {
			ok: {
				text: "确认",
				btnClass: 'btn-info',
				action: function(){
					alert("确认");
				}
			},
			cancel: {
				text: "取消",
				btnClass: 'btn-default',
				action: function(){
					// 取消
				}
			}
		}
	});
});
```

## 确认框

# 参考资料

[HTML 弹出确认框](https://blog.csdn.net/abc1498880402/article/details/84313604)

[JQuery Confirm 确认框](https://blog.csdn.net/jnx1142410525/article/details/79271314)

[jqueryConfirm使用教程](https://www.jianshu.com/p/c25da8e83852)

https://github.com/craftpip/jquery-confirm

https://blog.csdn.net/jnx1142410525/article/details/79271314

* any list
{:toc}