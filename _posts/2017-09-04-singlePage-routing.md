---
layout: post
title:  Single Page Routing
date:  2017-09-04 19:50:21 +0800
categories: [UI]
tags: [ui]
published: true
---


<style>
#result {
    height: 100px;
    line-height: 100px;
    font-size: 2rem;
    text-align: center;
    color: #fff;
}
</style>

# Single Page Routing

[单页应用有那些优缺点](https://www.zhihu.com/question/20792064)


我觉得只要够酷，就值得一试。

# Page.js

[Page.js](http://visionmedia.github.io/page.js/) Tiny ~1200 byte Express-inspired client-side router.


# Director.js

[Director.js](https://github.com/flatiron/director) is a tiny and isomorphic URL router for JavaScript.


 
# Example
 
<a class="btn-link btn-success" href="#/first">第一页</a>
<a class="btn-link btn-info" href="#/second">第二页</a>
<div id="result"></div>

 
 
 
 
<script type="text/javascript">
    function Router(){
        this.routes = {};
        this.curUrl = '';
        
        this.route = function(path, callback){
            this.routes[path] = callback || function(){};
        };
        
        this.refresh = function(){
            this.curUrl = location.hash.slice(1) || '/';
            this.routes[this.curUrl]();
        };
        
        this.init = function(){
            window.addEventListener('load', this.refresh.bind(this), false);
            window.addEventListener('hashchange', this.refresh.bind(this), false);
        }
    }

    var R = new Router();
    R.init();
    var res = document.getElementById('result');

    R.route('/first', function() {
       res.style.background = 'orange';
    	res.innerHTML = '这是第一页';
    });
    R.route('/second', function() {
       res.style.background = 'black';
    	res.innerHTML = '这是第二页';
    });
</script>




* any list
{:toc}