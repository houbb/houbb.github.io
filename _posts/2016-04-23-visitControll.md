---
layout: post
title: Thinking in Java (visit privilege)
date:  2016-4-23 17:18:27 +0800
categories: [Java]
tags: [visit privilege]
---
<style>
    tr th, tr td {
        text-align: center;
    }
</style>


## Visit privilege
> Just as following

<table id="visit-privilege" class="table table-bordered">
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



