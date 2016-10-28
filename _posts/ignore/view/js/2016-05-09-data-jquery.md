---
layout: post
title: attr('data-*') and data
date:  2016-5-10 21:21:00 +0800
categories: [jQuery]
tags: [data]
published: false
---

* any list
{:toc}

<img id="demo" class="img1" src="{{ site.url }}/static/app/img/2016-05-09-animation1.jpeg"/>

## data-*

- attr(name)

Access a property on the **first matched element**. This method makes it easy to retrieve a property value from the first matched element.
If the element does not have an attribute with such a name, **undefined** is returned.

Click the [src] btn, get img src.

```css
$('img').attr('src');
```

<button class="btn btn-define attr-src">src</button>
<span class="text-muted" style="margin-left: 50px;display:none;"></span>

<img id="demo2" class="img2" src="{{ site.url }}/static/app/img/2016-05-09-animation2.jpg"/>


- attr(key,value)

Set a single property to a value, on **all matched elements**.

Click the [(key,value)] btn, add border class. See carefully.

```css
$('img').attr('class', 'gold-img-border');
```
<button class="btn btn-define attr-key-value">(key,value)</button>

- removeAttr(name)

Remove an attribute from **each of the matched elements**.

Click the [remove] btn, remove border class. See carefully.

```css
$('img').removeAttr('class');
```
<button class="btn btn-define removeAttr">removeAttr</button>


## data

- data(name,value)

Stores the value in the named spot and also returns the value.
If the JQuery collection references multiple elements, the data element is **set on all of them**.
This function can be useful for attaching data to elements without having to create a new expando. It also isn't limited to a string. The value can be any format.

- data(name)

Returns value at named data store for the element, as set by data(name, value).
If the JQuery collection references multiple elements, the value returned **refers to the first element**.
This function is used to get stored data on an element without the risk of a circular reference.

Click [data(name,value)]  to add data and click [data(name)] to show.

<button class="btn btn-define data-btn data-name-value">data(name,value)</button>
<input/>

<button class="btn btn-success data-btn data-name">data(name)</button>
<span class="text-muted" style="margin-left: 50px;display:none;"></span>


- removeData(name)

Removes named data store from an element.
This is the complement function to $(...).data(name, value).

<button class="btn btn-danger data-btn removeData">removeData</button>


## data-* and data

Here is a span with attr data-info='001'

```
<span id="two" data-info='001'></span>
```
result is

```
$('#two').attr('data-info');   //001
$('#two').data('info');        //001

$('#two').attr('data-info', '002');
$('#two').attr('data-info');   //002
$('#two').data('info');        //001

$('#two').data('info', '003');
$('#two').attr('data-info');   //002
$('#two').data('info')        //003
```

> Continue...


<script src="{{ site.url }}/static/libs/jQuery/jquery-2.2.3.min.js"></script>
<script>
    $(function() {
        $('.attr-src').on('click', function(event) {
            var val = $('img').attr('src');
            var span = $(this).next('span').text(val);
            span.toggle();
        });

        $('.attr-key-value').on('click', function(event) {
            $('img').attr('class', 'gold-img-border');
        });

        $('.removeAttr').on('click', function(event) {
            $('img').removeAttr('class');
        });


        var nameValue = $('.data-name-value');
        nameValue.on('click', function(event) {
            var val = $(this).next('input').val();
            nameValue.data('val', val);
        });

        $('.data-name').on('click', function(event) {
            var val = nameValue.data('val');
            console.log(val);
            var span = $(this).next('span');
            span.text(val)
            if(!val) {
                span.text('undefined');
            }
            span.toggle();
        });

        $('.removeData').on('click', function(event) {
            nameValue.removeData('val');
        });
    });
</script>









