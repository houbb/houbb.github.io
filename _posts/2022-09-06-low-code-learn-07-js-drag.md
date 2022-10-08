---
layout: post
title:  低代码开源源码学习-05-js H5 原生 Drag
date:  2022-09-06 21:23:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 拖放

拖放（drap && drop）在我们平时的工作中，经常遇到。

它表示：抓取对象以后拖放到另一个位置。目前，它是HTML5标准的一部分。我从几个方面学习并实践这个功能。

# 拖放的流程对应的事件

我们先看下拖放的流程：

```
选中 --->  拖动  ---> 释放
```

然后，我们一步步看下这个过程中，会发生的事情。

选中在HTML5标准中，为了使元素可拖动，把draggable属性设置为true。

文本、图片和链接是默认可以拖放的，它们的draggable属性自动被设置成了true。

图片和链接按住鼠标左键选中，就可以拖放。

文本只有在被选中的情况下才能拖放。

如果显示设置文本的draggable属性为true，按住鼠标左键也可以直接拖放。

draggable属性：设置元素是否可拖动。

语法：`<element draggable="true | false | auto" >`

true: 可以拖动 

false: 禁止拖动  

auto: 跟随浏览器定义是否可以拖动

## 拖动

每一个可拖动的元素，在拖动过程中，都会经历三个过程，拖动开始-->拖动过程中--> 拖动结束。

### 被拖动的元素

dragstart	在元素开始被拖动时候触发

drag	在元素被拖动时反复触发

dragend	在拖动操作完成时触发

### 目的地对象	

dragenter	当被拖动元素进入目的地元素所占据的屏幕空间时触发

dragover	当被拖动元素在目的地元素内时触发

dragleave	当被拖动元素没有放下就离开目的地元素时触发

dragenter和dragover事件的默认行为是拒绝接受任何被拖放的元素。

因此，我们必须阻止浏览器这种默认行为。`e.preventDefault()`;

## 释放 drop

到达目的地之后，释放元素事件。

drop 事件，当被拖动元素在目的地元素里放下时触发，一般需要**取消浏览器的默认行为**。

## 选中拖动释放例子

```html
<!DOCTYPE HTML>
<html>

<head>
    <title>拖放示例-文本</title>
</head>
<style>
.src {
    display: flex;
}

.dropabled {
    flex: 1;
}

.txt {
    color: green;
}

.img {
    width: 100px;
    height: 100px;
    border: 1px solid gray;
}

.target {
    width: 200px;
    height: 200px;
    line-height: 200px;
    text-align: center;
    border: 1px solid gray;
    color: red;
}
</style>

<body>
    <div class="src">
        <div class="dragabled">
            <div class="txt" id="txt">
                所有的文字都可拖拽。
                <p draggable="true">此段文字设置了属性draggable="true"</p>  
            </div>
            <div class="url" id="url">
                <a href="http://weiqinl.com" target="_blank">我是url:http://weiqinl.com</a>
            </div>
            <img class="img" id="tupian1" src="img1.png" alt="图片1" />
            <img class="img" id="tupian2" src="img2.png" alt="图片2" />
        </div>
        <div id='target' class="dropabled target">Drop Here</div>
    </div>
    <script>
        var dragSrc = document.getElementById('txt')
        var target = document.getElementById('target')

        dragSrc.ondragstart = handle_start
        dragSrc.ondrag = handle_drag
        dragSrc.ondragend = handle_end

        function handle_start(e) {
          console.log('dragstart-在元素开始被拖动时候触发')
        }

      function handle_drag() {
            console.log('drag-在元素被拖动时候反复触发')
        }

      function handle_end() {
            console.log('dragend-在拖动操作完成时触发')
        }


        target.ondragenter = handle_enter
        target.ondragover = handle_over
        target.ondragleave = handle_leave

        target.ondrop = handle_drop

        function handle_enter(e) {
            console.log('handle_enter-当元素进入目的地时触发')
            // 阻止浏览器默认行为
            e.preventDefault()
        }

        function handle_over(e) {
            console.log('handle_over-当元素在目的地时触发')
            // 阻止浏览器默认行为
            e.preventDefault()
        }

        function handle_leave(e) {
            console.log('handle_leave-当元素离开目的地时触发')
            // 阻止浏览器默认行为
            // e.preventDefault()
        }

        function handle_drop(e) {
            console.log('handle_drop-当元素在目的地放下时触发')
            var t = Date.now()
            target.innerHTML = ''
            target.append(t + '-拖放触发的事件。')
            e.preventDefault()
        }
    </script>
</body>

</html>
```

在整个拖放过程中，我们以上说的是表面现象，事件过程内部还会发生什么事情呢？请看下面👇的DataTransfer对象。

# DataTransfer对象

与拖放操作所触发的事件同时派发的对象是DragEvent，它派生于MouseEvent，具有Event与MouseEvent对象的所有功能，并增加了dataTransfer属性。

该属性用于保存拖放的数据和交互信息，返回DataTransfer对象。

```js
// DataTransfer dataTransfer = DragEvent.dataTransferDataTransfer
```

对象定义的属性和方法有很多种，我们看下列入标准的几个。

| 属性 | 说明 |
|:----|:----|
| types | 只读属性。它返回一个我们在dragstart事件中设置的拖动数据格式的数组。 格式顺序与拖动操作中包含的数据顺序相同。IE10+、Edge、safari3.1、Firefox3.5+ 和Chrome4以上支持该属性 | 
| files | 返回拖动操作中的文件列表。包含一个在数据传输上所有可用的本地文件列表。如果拖动操作不涉及拖动文件，此属性是一个空列表。 | 
| [dropEffect](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect) | 获取当前选定的拖放操作的类型或将操作设置为新类型。它应该始终设置成effectAllowed的可能值之一【none、move、copy、link】。dragover事件处理程序中针对放置目标来设置dropEffect。 | 
| effectAllowed | 指定拖放操作所允许的效果。必须是其中之一【 none, copy, copyLink, copyMove, link, linkMove, move, all, uninitialized】默认为uninitialized 表示允许所有的效果。ondragstart处理程序中设置effectAllowed属性 | 

| 方法 | 说明 |
|:---|:---|
| void setData(format, data) | 将拖动操作的拖动数据设置为指定的数据和类型。format可以是MIME类型 |
| String getData(format) | 返回指定格式的数据，format与setData()中一致 |
| void clearData([format]) | 删除给定类型的拖动操作的数据。如果给定类型的数据不存在，此方法不执行任何操作。如果不给定参数，则删除所有类型的数据。 |
| void setDragImage(img, xOffset, yOffset) | 指定一副图像，当拖动发生时，显示在光标下方。大多数情况下不用设置，因为被拖动的节点被创建成默认图片。x,y参数分别指示图像的水平、垂直偏移量 |

```js
//IE10及之前版本，不支持扩展的MIME类型名
//Firefox 5版本之前，不能正确的将url和text映射为text/uri-list 和text/plain
var dataTransfer = event.dataTransfer;
//读取文本,
var text = dataTransfer.getData("Text");
//读取URL,
var url = dataTransfer.getData("url") || dataTransfer.getData("text/uri-list");
```

# 浏览器支持程度说了这么多，如果浏览器不支持，也是白扯。

Method of easily dragging and dropping elements on a page, requiring minimal JavaScript.

要求最少的js，实现拖拽页面元素的简单方法

> [drag之浏览器支持程度--caniuse](https://caniuse.com/?search=drag)

# 总结

原生HTML5拖拽API，drag && drop 在实际工作中，还是有很多情况下会遇到的。

以上，我只介绍了部分常用API。API不复杂，多看会儿，实践就知道了。

各个浏览器，可能会在表现上，稍有不同，但我相信大家还是会向着标准发展的。

# 参考资料

https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer

[HTML5原生拖拽/拖放 Drag & Drop 详解](https://juejin.cn/post/6844903513491767303)

* any list
{:toc}
