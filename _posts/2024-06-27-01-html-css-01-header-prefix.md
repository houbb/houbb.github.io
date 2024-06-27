---
layout: post
title: 纯 html 如何实现 Header 旁边弄一个带颜色的竖条?
date: 2024-03-27 21:01:55 +0800
categories: [HTML]
tags: [html, css, sh]
published: true
---

# 纯 html 如何实现 Header 旁边弄一个带颜色的竖条

在纯 HTML 和 CSS 中，你可以通过使用一个带有颜色的垂直边框或者一个带有背景颜色的子元素来实现标题旁边的带颜色竖条效果。

以下是两种方法的示例：

### 方法一：使用带有颜色的垂直边框

你可以使用 `border-left` 属性为标题添加一个带颜色的垂直边框。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Header with Colored Vertical Line</title>
    <style>
        .header {
            border-left: 5px solid #3498db; /* 竖条颜色 */
            padding-left: 10px; /* 竖条与文字的间距 */
            font-size: 24px; /* 标题字体大小 */
        }
    </style>
</head>
<body>
    <h1 class="header">This is a Header</h1>
</body>
</html>
```

实际测试这种方法是有效的。

### 方法二：使用带有背景颜色的子元素

第二种方法看起来更加的自然。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Header with Colored Vertical Line</title>
    <style>
        .header {
            position: relative;
            padding-left: 15px; /* 竖条与文字的间距 */
            font-size: 24px; /* 标题字体大小 */
        }
        .header::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px; /* 竖条宽度 */
            background-color: #3498db; /* 竖条颜色 */
        }
    </style>
</head>
<body>
    <h1 class="header">This is a Header</h1>
</body>
</html>
```

# 小结

css 的解法是比较灵活的。

# chat

## ::before

`::before` 是一个 CSS 伪元素，它允许你在一个元素的内容之前插入内容。与 `::after` 类似，`::before` 伪元素不影响文档的实际 DOM 结构，但可以用来装饰或增强现有元素的视觉效果。下面是关于 `::before` 的详细介绍。

### 基本用法

`::before` 伪元素通常与 `content` 属性一起使用，以定义插入的内容。

```css
.element::before {
    content: "This is before";
}
```

```html
<div class="element">Actual content</div>
```

在上述示例中，`::before` 伪元素在 `.element` 元素的内容之前插入了 "This is before" 文字，因此最终渲染的内容为 "This is beforeActual content"。

### 使用示例

#### 插入装饰内容

`::before` 常用于插入装饰性的图标或其他内容，例如：

```css
.icon::before {
    content: "★";
    color: gold;
    margin-right: 5px;
}
```

```html
<div class="icon">Starred Item</div>
```

在这个示例中，`::before` 伪元素在 `.icon` 元素之前插入了一个星星符号。

#### 创建视觉效果

`::before` 伪元素可以用于创建各种视觉效果，比如带颜色的竖条：

```css
.header {
    position: relative;
    padding-left: 15px;
    font-size: 24px;
}

.header::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background-color: #3498db;
}
```

```html
<h1 class="header">This is a Header</h1>
```

这个示例中，`::before` 伪元素被用来在标题的左侧创建一个蓝色的竖条。

### 属性

#### `content`

`content` 是 `::before` 伪元素的必需属性，用于定义伪元素的内容。它可以是文字、图片（通过 `url()` 函数）、空字符串（用于装饰性目的），甚至是计数器：

```css
.counter::before {
    content: counter(item) ". ";
    counter-increment: item;
}
```

#### 定位和尺寸

与普通元素一样，`::before` 伪元素可以使用各种 CSS 属性来控制其定位和尺寸：

- `position`
- `top`, `right`, `bottom`, `left`
- `width`, `height`
- `margin`, `padding`
- `border`

#### 其他常用属性

- `background`
- `color`
- `font-size`
- `line-height`

### 注意事项

1. **必须设置 `content` 属性**: 如果不设置 `content` 属性，`::before` 伪元素将不会显示。
2. **继承属性**: `::before` 伪元素可以继承父元素的样式属性，但也可以通过单独的选择器进行覆盖。
3. **不影响文档结构**: `::before` 伪元素是纯视觉效果，不会在 DOM 中创建新的节点。
4. **兼容性**: `::before` 是 CSS2.1 引入的特性，现代浏览器都支持该伪元素。

### 综合示例

以下是一个更复杂的示例，展示如何使用 `::before` 创建一个带有图标的按钮：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button with Icon</title>
    <style>
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            background-color: #3498db;
            border: none;
            border-radius: 4px;
            position: relative;
            cursor: pointer;
        }

        .button::before {
            content: '✔';
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
        }
    </style>
</head>
<body>
    <button class="button">Submit</button>
</body>
</html>
```

在这个示例中，`::before` 伪元素被用来在按钮的左侧添加一个勾选图标，使按钮看起来更具吸引力和可用性。

`::before` 是一个强大且灵活的工具，可以用来增强网页的视觉效果和用户体验。

在实际开发中，它常被用来添加装饰性元素、增强交互效果或简化 HTML 结构。

# 参考资料

* any list
{:toc}
