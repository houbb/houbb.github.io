---
layout: post
title:  如何实现短链服务 short url-03-springboot 中页面重定向方式
date:  2022-06-02 09:22:02 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# springboot 重定向方式

```java
//重定向到其他网站或其他服务器
//通过new ModelAndView对象添加http://xxxx/xxxx即可跳转到第3方网站
@GetMapping(value = "test")
public ModelAndView test(CurrentUser user, HttpServletRequest request){

    //第一种写法，返回参数要用String对象
   //return ”redirect:https://www.baidu.com“ 
    //第二种写法 
   return new ModelAndView("redirect:https://www.baidu.com");
}


//重定向到自己服务器上，去掉http://的方式，采用redirect:/xxxxx/xxxxx
@GetMapping(value = "test")
public ModelAndView test(CurrentUser user, HttpServletRequest request){

    //第一种写法，返回参数要用String对象     
    //return ”redirect/www.baidu.com“
    //第二种写法 
   return new ModelAndView("redirect:/www.baidu.com");
}
```

## Response 重定向

```java
@GetMapping("/redirect/{id}")
public void redirect(@PathVariable("id") String id, HttpServletResponse resp) throws IOException {
    String redirectUri = "http://www.baidu.com";
    resp.sendRedirect(redirectUri);
}
```

# 参考资料

[springboot 中重定向方式](https://blog.csdn.net/m0_54861649/article/details/124441884)

[Spring Boot重定向](https://blog.csdn.net/weixin_38106322/article/details/122974124)

* any list
{:toc}