---
layout: post
title:  Crawl jsoup 爬虫使用 jsoup 无法抓取动态 js 生成的内容
date:  2018-08-19 11:02:05 +0800
categories: [Tool]
tags: [crawl, tool, web, java, sh]
published: true
---

# Jsoup 

[Jsoup](https://github.com/jhy/jsoup)：Java HTML 解析器，集成了 DOM、CSS 和 jQuery 的优点。

# 使用入门案例

## 引入

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.10.2</version>
</dependency>
```

## 简单使用

```java
Document document = Jsoup.connect(url)
        .timeout(30000)
        .validateTLSCertificates(false)
        .get();

Elements elements = document.select(".book-chapter-list > .cf:last-child > li");
for (Element element : elements) {
    String title = element.text();
    String chapUrl = url + element.select("a").attr("href");

    // 其他构件存储操作
}
```

这里主要是指定一个 url 进行访问，然后通过各种选择器获取我们想要的元素信息。


# 动态 js 内容

## 背景

最近在因为工作需要，开始学习爬虫，对于静态加载的页面，爬取并不难，但是遇到ajax动态加载的页面，就爬去不到动态加载的信息了！

对于ajax动态加载的数据爬去，一般有两种方式：

1.因为js渲染页面的数据也是从后端拿到，而且基本上都是AJAX获取，所以分析AJAX请求，找到对应数据的

请求，也是比较可行的做法。而且相对于页面样式，这种接口变化可能性更小。

缺点就是找到这个请求，并进行模拟，是一个相对困难的过程，也需要相对多的分析经验

2.在抓取阶段，在爬虫中内置一个浏览器内核，执行js渲染页面后，再抓取。这方面对应的工具有Selenium、

HtmlUnit或者PhantomJs。但是这些工具都存在一定的效率问题，同时也不是那么稳定。

好处是编写规则

对于第二种方法，本人测试，只有Selenium可以成功爬去ajax动态加载的页面，但是每次请求页面的时候都会弹出浏览器窗口，对于后期项目部署到浏览器上是很不利的！

所以建议采用第一种方式，代码也是采用的第一种方法。

## htmlunit

## java 模拟 js 执行

```java
ScriptEngineManager manager = new ScriptEngineManager();
ScriptEngine engine = manager.getEngineByName("JavaScript");
engine.eval(new InputStreamReader(Login.class
		.getResourceAsStream("/sha1.js")));
Object t = engine.eval("CryptoJS.SHA1('" + password+ "').toString();");
System.out.println(t);
```

## jsoup 模拟 ajax 请求

```java
//然后就是模拟ajax请求，当然了，根据规律，需要将"datasku"的属性值替换下面链接中的"133537397"和"0000000000"值
Document document1=Jsoup.connect("http://ds.suning.cn/ds/generalForTile/000000000133537397-9173-2-0000000000-1--ds000000000.jsonp")
        .ignoreContentType(true)
        .data("query", "Java")
        .userAgent("Mozilla")
        .cookie("auth", "token")
        .timeout(3000)
        .get();
//打印出模拟ajax请求返回的数据，一个json格式的数据，对它进行解析就可以了
System.out.println(document1.text());
```

## jsoup 抓取页面 js 信息

```java
    /*设置网页抓取响应时间*/
	private static final int TIMEOUT = 10000;
	
	public static Map<String, Object> getSerieExtDetail(int serieId) throws Exception{
		
		/*车系参数配置页面*/
		String serieInfo = "http://car.autohome.com.cn/config/series/"+serieId+".html";
		
		/*用來封裝要保存的参数*/
		Map<String, Object> map = new HashMap<String, Object>();
		
		/*取得车系参数配置页面文档*/
		Document document = Jsoup.connect(serieInfo).timeout(TIMEOUT).get();
		
		/*取得script下面的JS变量*/
		Elements e = document.getElementsByTag("script").eq(6);
		
		/*循环遍历script下面的JS变量*/
		for (Element element : e) {
			
			/*取得JS变量数组*/
			String[] data = element.data().toString().split("var");
			
			/*取得单个JS变量*/
			for(String variable : data){
				
				/*过滤variable为空的数据*/
				if(variable.contains("=")){
					
					/*取到满足条件的JS变量*/
					if(variable.contains("option") || variable.contains("config") 
							|| variable.contains("color") || variable.contains("innerColor")){
						
						String[]  kvp = variable.split("=");
						
						/*取得JS变量存入map*/
						if(!map.containsKey(kvp[0].trim())) 
							map.put(kvp[0].trim(), kvp[1].trim().substring(0, kvp[1].trim().length()-1).toString());
					}
				}
			}
		}
		return map;
	}
```

# 拓展阅读

[webmagic-另一种爬虫选择]()

[okhttp-优雅得请求框架](https://houbb.github.io/2018/03/16/okhttp)


# 参考资料

[获取ajax动态加载的页面](https://blog.csdn.net/a812919698/article/details/52243080)

[java网络爬虫-jsoup抓取js(script)中的变量值](https://blog.csdn.net/weinichendian/article/details/51490503)

* any list
{:toc}
