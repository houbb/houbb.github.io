---
layout: post
title:  Bootstrap modal usage
date:  2017-12-21 19:08:23 +0800
categories: [HTML]
tags: [js, html, bug]
published: true
---

# 模态框

> [Bootstrap Modal](https://v3.bootcss.com/javascript/#modals)

Bootstrap 的模态框使用 [Bootstrap](https://getbootstrap.com/) 的前端应该都接触过。

本文记录一下今天使用时遇到的 BUG，以便以后查阅和帮助其他遇到同样问题的伙伴们。

# BUG 情景

## 使用场景

触发展现模态框，填写对应的信息，然后 ajax 提交表单信息到后台。

## 简化

点击下面的按钮一次，弹出模态框。点击提交，会直接 `alert("提交")`。点击一次会觉得很正常，但是如果你重复点几次模态框，会发现再次点击**提交**，alert 会出现多次。

<button class="btn btn-info" id="modal-click-error">点击弹出模态框</button>


<div class="modal" tabindex="-1" role="dialog" id="myModal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Modal title</h4>
      </div>
      <div class="modal-body">
        <p>One fine body&hellip;</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary">提交</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->



<script>

$(function() {

    $('#modal-click-error').on('click', function() {
        $('#myModal').modal('show');
        
        $("#myModal .btn-primary").on('click', function() {
            alert("提交");
        });
    });
    
});
    
</script>


代码如下：

```html
<button class="btn btn-info" id="modal-click-error">点击弹出模态框</button>


<div class="modal" tabindex="-1" role="dialog" id="myModal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Modal title</h4>
      </div>
      <div class="modal-body">
        <p>One fine body&hellip;</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary">提交</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
```

```js
$(function() {

    $('#modal-click-error').on('click', function() {
        $('#myModal').modal('show');
        
        $("#myModal .btn-primary").on('click', function() {
            alert("提交");
        });
    });
    
});
```

## 问题修复

上述的 js 代码，每次对于按钮的点击都会为提交按钮添加对应事件。修改如下即可：

```js
$(function() {

    $('#modal-click-error').on('click', function() {
        $('#myModal').modal('show');
    });
    
    $("#myModal .btn-primary").on('click', function() {
        alert("提交");
    });
    
});
```





* any list
{:toc}








   
   
 
 





