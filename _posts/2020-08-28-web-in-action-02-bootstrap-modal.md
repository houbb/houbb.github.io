---
layout: post
title:  web 实战-02-如何实现模态框 modal 
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 入门例子

## 依赖

```html
<link rel="stylesheet" href="bootstrap.css"/>
<script type="text/javascript" src="${context_root}/js/jquery.min.js"></script>
<script type="text/javascript" src="${context_root}/js/bootstrap.min.js"></script>
```

## 页面

添加一个元素

```html
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display:none">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
					&times;
				</button>
				<h4 class="modal-title" id="myModalLabel">
					标题
				</h4>
			</div>
			<div class="modal-body">
				内容
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-info" data-dismiss="modal">关闭
				</button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal -->
</div>
```

- 添加一个按钮

```html
<button id="button">触发模态框</button>
```

我们可以通过点击按钮，触发模态框的显示。

## jquery 编写

```js
<script type="text/javascript">

	$(function () {

		$("#button").on("click", function () {
			var btn = $(this);

			// 我们可以动态修改 modal 的标题和内容

			$('#myModal').modal('show');
		});



	});
</script>
```

## 注意

一开始编写的时候，我发现 modal 框看不到，但是页面上的有些元素无法点击。

第一反应就是被遮挡了。

然后 F12 调试了一下，发现 modal 框虽然看不见，但是依然会遮挡后面的元素。

所以添加了样式 `style="display:none"`。

# 参考资料


* any list
{:toc}