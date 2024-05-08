---
layout: post
title: VUE3-48-语义学
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, vue3, vue-learn, vue3-learn, sh]
published: true
---

# 表单

当创建一个表单，你可能使用到以下几个元素：`<form>、<label>、<input>、<textarea>` 和 `<button>`。

标签通常放置在表单字段的顶部或左侧：

```xml
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <div v-for="item in formItems" :key="item.id" class="form-item">
    <label :for="item.id">${item.label}: </label>
    <input
      :type="item.type"
      :id="item.id"
      :name="item.id"
      v-model="item.value"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

注意如何在表单元素中包含 autocomplete='on'，它将应用于表单中的所有输入。

你也可以为每个输入设置不同的自动完成属性的值。

# 标签

提供标签以描述所有表单控件的用途；链接 for 和 id

```xml
<label for="name">Name</label>
<input type="text" name="name" id="name" v-model="name" />
```

如果你在 chrome 开发工具中检查这个元素，并打开 Elements 选项卡中的 Accessibility 选项卡，你将看到输入是如何从标签中获取其名称的：

Chrome 开发工具显示可从标签输入的可访问名称

## aria-label

你也可以给输入一个带有aria-label 的可访问名称。

```xml
<label for="name">Name</label>
<input
  type="text"
  name="name"
  id="name"
  v-model="name"
  :aria-label="nameLabel"
/>
```

请随意在 Chrome DevTools 中检查此元素，以查看可访问名称是如何更改的：

Chrome Developer Tools showing input accessible name from aria-label

## aria-labelledby

使用 aria-labelledby 类似于 aria-label，除非标签文本在屏幕上可见。它通过 id 与其他元素配对，你可以链接多个 id：

```xml
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

## aria-describedby

aria-describedby 的用法与 aria-labelledby 相同，预期提供了用户可能需要的附加信息的描述。这可用于描述任何输入的标准：

```xml
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Full Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
      aria-describedby="nameDescription"
    />
    <p id="nameDescription">Please provide first and last name.</p>
  </div>
  <button type="submit">Submit</button>
</form>
```

# 占位符

避免使用占位符，因为它们可能会混淆许多用户。

占位符的一个问题是默认情况下它们不符合颜色对比标准；修复颜色对比度会使占位符看起来像输入字段中预填充的数据。

查看以下示例，可以看到满足颜色对比度条件的姓氏占位符看起来像预填充的数据：

最好提供用户在任何输入之外填写表单所需的所有信息。

# 操作指南

为输入字段添加说明时，请确保将其正确链接到输入。

你可以提供附加指令并在 aria-labelledby 内绑定多个 id。这使得设计更加灵活。

```xml
<fieldset>
  <legend>Using aria-labelledby</legend>
  <label id="date-label" for="date">Current Date:</label>
  <input
    type="date"
    name="date"
    id="date"
    aria-labelledby="date-label date-instructions"
  />
  <p id="date-instructions">MM/DD/YYYY</p>
</fieldset>
```

或者，你可以用 aria-describedby 将指令附加到输入。

```xml
<fieldset>
  <legend>Using aria-describedby</legend>
  <label id="dob" for="dob">Date of Birth:</label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">MM/DD/YYYY</p>
</fieldset>
```

# 隐藏内容

通常不建议直观地隐藏标签，即使输入具有可访问的名称。

但是，如果输入的功能可以与周围的内容一起理解，那么我们可以隐藏视觉标签。

让我们看看这个搜索字段：

```xml
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <button type="submit">Search</button>
</form>
```

我们可以这样做，因为搜索按钮将帮助可视化用户识别输入字段的用途。

我们可以使用 CSS 直观地隐藏元素，但可以将它们用于辅助技术：

```css
.hidden-visually {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  height: 1px;
  width: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
}
```

## aria-hidden="true"

添加 aria hidden="true" 将隐藏辅助技术中的元素，但使其在视觉上对其他用户可用。

不要把它用在可聚焦的元素上，纯粹用于装饰性的、复制的或屏幕外的内容上。

```xml
<p>This is not hidden from screen readers.</p>
<p aria-hidden="true">This is hidden from screen readers.</p>
```

# 按钮

在表单中使用按钮时，必须设置类型以防止提交表单。

也可以使用输入创建按钮：

```xml
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <!-- Buttons -->
  <button type="button">Cancel</button>
  <button type="submit">Submit</button>

  <!-- Input buttons -->
  <input type="button" value="Cancel" />
  <input type="submit" value="Submit" />
</form>
```

## 功能图像

你可以使用此技术创建功能图像。

Input 字段

这些图像将作为表单上的提交类型按钮

```xml
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <input
    type="image"
    class="btnImg"
    src="https://img.icons8.com/search"
    alt="Search"
  />
</form>
```

- icon

```xml
<form role="search">
  <label for="searchIcon" class="hidden-visually">Search: </label>
  <input type="text" name="searchIcon" id="searchIcon" v-model="searchIcon" />
  <button type="submit">
    <i class="fas fa-search" aria-hidden="true"></i>
    <span class="hidden-visually">Search</span>
  </button>
</form>
```



# 参考资料

https://vue3js.cn/docs/zh/guide/a11y-semantics.html

* any list
{:toc}