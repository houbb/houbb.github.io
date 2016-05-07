---
layout: post
title: Thinking in Java (visit privilege)
date:  2016-4-23 17:18:27 +0800
categories: [Java]
tags: [visit privilege]
published: false
---

## Visit privilege
> Just as following

<table  class="table table-bordered table-hover">
    <tr>
        <th></th>
        <th>one class</th>
        <th>one package</th>
        <th>different package children class</th>
        <th>different package not children class</th>
    </tr>
    <tr>
        <td>private</td>
        <td>√</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>default</td>
        <td>√</td>
        <td>√</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>protected</td>
        <td>√</td>
        <td>√</td>
        <td>√</td>
        <td></td>
    </tr>
    <tr>
        <td>public</td>
        <td>√</td>
        <td>√</td>
        <td>√</td>
        <td>√</td>
    </tr>
</table>



