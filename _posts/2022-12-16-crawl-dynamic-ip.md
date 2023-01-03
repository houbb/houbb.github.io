---
layout: post 
title: 网络爬虫如何避免 ip 封禁？如何获取大量的 IP 
date: 2022-12-16 21:01:55 +0800
categories: [Web] 
tags: [web, crawl, sh]
published: true
---

# 需求

比如我想运行一段爬虫程序，但是我想让他在开始爬之前获得一个随机的IP，然后下次再爬又是一个另外的IP，具体需要怎么做呢？

# 反爬虫策略

爬虫是网络采集数据必不可少的一种技术，当然，对一个网站进行爬取采集其实并不容易。

很多网络为了防止被爬虫而做了反爬虫策略，最常见的反爬虫策略就是根据IP来检测，当相同一个IP在短时间内对网络某个页面进行频繁的访问或者同一个账号短时间内进行相同的操作，网站就会认定是爬虫机制，从而对IP限制访问速度甚至禁止访问。

# 解决方式

## 1、降低访问速度，减小对于目标网站造成的压力。

过快的访问会导致IP被封，我们首先要检测出网站设置的限制速度阈值，这样我们才可以设置合理的访问速度，建议不要设固定的访问速度，可以设置在一个范围之内，因为过于规律而被系统检测到，也会导致IP被封。

有时候平台为了阻止频繁访问，会设置IP在规定时间内的访问次数，超过次数就会禁止访问。

## 2、设置代理IP辅助爬取。

降低访问速度难以避免会影响到爬取效率，如果抓取速度过慢，就失去了使用爬虫抓取的优势了。

这时就可以使用代理IP，来规避网站对IP的检测，通过切换不同的IP爬取内容，让代理服务器去帮我们获得网页内容，然后再转发回我们的电脑。

选择代理时最好选择真实家庭IP地址，不易被网站拦截。

## 3、user_agent 伪装和轮换

不同浏览器的不同版本都有不同的user_agent，是浏览器类型的详细信息，也是浏览器提交Http请求的重要头部信息。

我们可以在每次请求的时候提供不同的user_agent，绕过网站检测客户端的反爬虫机制。

比如说，可以把很多的user_agent放在一个列表中，每次随机选一个用于提交访问请求，你可以找到提供各种user_agent的网站来使用。



# JSOUP 增加代理

## 基于属性增加

给Jsoup增加代理很容易，直接在Connection对象上调用proxy(String, int)方法：

```java
Jsoup.connect("https://spring.io/blog")
  .proxy("127.0.0.1", 1080)
  .get();
```

第一个参数为主机地址，另一个是端口号。

## 基于Proxy类增加

我们也可以通过Proxy类实现，在Connection对象上调用它的proxy(java.net.Proxy)方法：

```java
Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 1080));

Jsoup.connect("https://spring.io/blog")
  .proxy(proxy)
  .get();
```

此方法接受一个Proxy对象，该对象由代理类型(通常为HTTP类型)和InetSocketAddress(封装代理主机名和端口属性的包装类)组成。

# 蘑菇代理的例子

```java
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
import net.sf.json.JSONObject;
 
public class Test {
    //获取代理ip,记得更换，我用的是蘑菇代理的，可以换成其他的网站的
    private final static String GET_IP_URL = "http://piping.mogumiao.com/proxy/api/get_ip_bs?appKey=xxxxx&count=10&format=1";
    public static void main(String[] args) throws InterruptedException {
        List<String> addrs = new LinkedList<String>();
        Map<String,Integer> addr_map = new HashMap<String,Integer>();
        Map<String,String> ipmap = new HashMap<String,String>();
        ExecutorService exe = Executors.newFixedThreadPool(10);
        for (int i=0 ;i<1;i++) {
            Document doc = null;
            try {
                doc = Jsoup.connect(GET_IP_URL).get();
            } catch (IOException e) {
                continue;
            }
            System.out.println(doc.text());
            JSONObject jsonObject = JSONObject.fromObject(doc.text());
            List<Map<String,Object>> list = (List<Map<String,Object>>) jsonObject.get("msg");
            int count = list.size();
 
            for (Map<String,Object> map : list ) {
                String ip = (String)map.get("ip");
                String port = (String)map.get("port") ;
                ipmap.put(ip,"1");
                checkIp a = new checkIp(ip, new Integer(port),count);
                exe.execute(a);
            }
            exe.shutdown();
            Thread.sleep(1000);
        }
    }
}
 
 
class checkIp implements Runnable {
    private static Logger logger = LoggerFactory.getLogger(aaa.class);
    private static int suc=0;
    private static int total=0;
    private static int fail=0;
 
    private String ip ;
    private int port;
    private int count;
    public checkIp(String ip, int port,int count) {
        super();
        this.ip = ip;
        this.port = port;
        this.count = count;
    }
 
    @Override
    public void run() {
        Random r = new Random();
        String[] ua = {"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36 OPR/37.0.2178.32",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586",
                "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
                "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)",
                "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
                "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0)",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 BIDUBrowser/8.3 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36 Core/1.47.277.400 QQBrowser/9.4.7658.400",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 UBrowser/5.6.12150.8 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36 SE 2.X MetaSr 1.0",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36 TheWorld 7",
                "Mozilla/5.0 (Windows NT 6.1; W…) Gecko/20100101 Firefox/60.0"};
        int i = r.nextInt(14);
        logger.info("检测中------ {}:{}",ip,port );
        Map<String,String> map = new HashMap<String,String>();
        map.put("waybillNo","DD1838768852");
        try {
            total ++ ;
            long a = System.currentTimeMillis();
            //爬取的目标网站，url记得换下。。。！！！
            Document doc = Jsoup.connect("http://trace.yto.net.cn:8022/TraceSimple.aspx")
                    .timeout(5000)
                    .proxy(ip, port, null)
                    .data(map)
                    .ignoreContentType(true)
                    .userAgent(ua[i])
                    .header("referer","http://trace.yto.net.cn:8022/gw/index/index.html")//这个来源记得换..
                    .post();
            System.out.println(ip+":"+port+"访问时间:"+(System.currentTimeMillis() -a) + "   访问结果: "+doc.text());
            suc ++ ;
        } catch (IOException e) {
            e.printStackTrace();
            fail ++ ;
        }finally {
            if (total == count ) {
                System.out.println("总次数："+total);
                System.out.println("成功次数："+suc);
                System.out.println("失败次数："+fail);
            }
        }
    }
 
}
```

# 获取动态 IP


```
112.5.56.2:9091
198.49.68.80:80
78.38.28.239:80
103.43.151.36:80
120.237.144.200:9091
180.97.34.35:80
202.108.22.5:80
220.181.111.37:80
61.135.169.121:80
112.80.248.73:80
112.80.248.75:80
118.31.2.38:8999
120.196.188.21:9091
112.6.117.178:8085
117.160.250.133:80 x
```





# 参考资料

[python爬虫如何获得一个动态的IP地址呢？](https://www.zhihu.com/question/368213865)

https://juejin.cn/post/7173959786088661000

https://www.jianshu.com/p/dc8e96e05965

https://www.imooc.com/article/310459

https://blog.csdn.net/neweastsun/article/details/126417220

https://blog.csdn.net/u011066470/article/details/84033869

* any list
{:toc}