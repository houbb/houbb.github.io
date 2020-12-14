---
layout: post
title:  web 实战-18-验证码 CAPTCHA
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 九章到来的今天

最近看到国内的量子计算机“九章”的消息，内心不由得感慨万千。

以前看似不可能解决的问题，在恐怖的算力之下，都逐渐变成了可解的问题。

其实计算机算力的提升，带来的确认对于安全问题的忧虑。

今天我们来一起看一下最常见的安全措施——验证码。

试想一下，如果完全没有验证码等限制，计算机完全可以穷举破解出用户的密码。

如果没有验证码的限制，恶意用户注册，可以让我们一天发送几百万的短信，直接破产！


# CAPTCHA 

## 是什么？

CAPTCHA项目是Completely Automated Public Turing Test to Tell Computers and Humans Apart (全自动区分计算机和人类的图灵测试)的简称，卡内基梅隆大学试图将其注册为商标，但2008年请求被驳回。 

CAPTCHA的目的是区分计算机和人类的一种程序算法，是一种区分用户是计算机和人的计算程序，这种程序必须能生成并评价人类能很容易通过但计算机却通不过的测试。

## 为什么需要？

最核心的目的是防止被用户恶意脚本注册，当然登陆中也是类似的。

至少加一个验证码可以提高一点恶意的成本。

# 实现思路

## 前端

（1）前台一个 `<input>` 用于输入验证码；一个 `<img>` 用于展示验证码。

（2）验证码生成以及展示，点击刷新功能，可以为 `<img>` 绑定click事件。

（3）click事件里面写ajax请求，通过后台生成处理好的带噪点的验证码图片。

注意：后台直接返回图片，不是验证码的字符!

若返回字符，则验证码就失去了意义（前台很容易就可以获取验证码字符，进行多次恶意访问了）（这点考虑了系统安全性）

（4）关于返回的图片如何在 `<img>` 标签内展示

直接利用img的src属性，属性值为后台生成验证码的方法请求路径即可。

当点击验证码的时候，再动态设置src属性即可（原访问地址+随机时间戳，防止同一路径浏览器不另作访问的问题）

## 后端

后台思路很简单，利用BufferedImage类创建一张图片，再用Graphics2D对图片进行绘制(生成随机字符，添加噪点，干扰线)即可。

注意生成的验证码字符串要放到session中，用于接下来登陆的验证码验证(当然也是后台)。

## 验证码核心实现

验证码生成的核心是实现代码如下：

```java
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;

import javax.imageio.ImageIO;

public class VerifyCode {
    private int w = 70;
    private int h = 35;
    private Random r = new Random();
     // {"宋体", "华文楷体", "黑体", "华文新魏", "华文隶书", "微软雅黑", "楷体_GB2312"}
    private String[] fontNames  = {"宋体", "华文楷体", "黑体", "华文新魏", "华文隶书", "微软雅黑", "楷体_GB2312"};
    // 可选字符
    private String codes  = "23456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
    // 背景色
    private Color bgColor  = new Color(255, 255, 255);
    // 验证码上的文本
    private String text;

    // 生成随机的颜色
    private Color randomColor () {
        int red = r.nextInt(150);
        int green = r.nextInt(150);
        int blue = r.nextInt(150);
        return new Color(red, green, blue);
    }

    // 生成随机的字体
    private Font randomFont () {
        int index = r.nextInt(fontNames.length);
        String fontName = fontNames[index];//生成随机的字体名称
        int style = r.nextInt(4);//生成随机的样式, 0(无样式), 1(粗体), 2(斜体), 3(粗体+斜体)
        int size = r.nextInt(5) + 24; //生成随机字号, 24 ~ 28
        return new Font(fontName, style, size);
    }

    // 画干扰线
    private void drawLine (BufferedImage image) {
        int num  = 5;//一共画5条
        Graphics2D g2 = (Graphics2D)image.getGraphics();
        for(int i = 0; i < num; i++) {//生成两个点的坐标，即4个值
            int x1 = r.nextInt(w);
            int y1 = r.nextInt(h);
            int x2 = r.nextInt(w);
            int y2 = r.nextInt(h);
            g2.setStroke(new BasicStroke(1.5F));
            g2.setColor(randomColor()); //随机生成干扰线颜色
            g2.drawLine(x1, y1, x2, y2);//画线
        }
    }

    // 随机生成一个字符
    private char randomChar () {
        int index = r.nextInt(codes.length());
        return codes.charAt(index);
    }

    // 创建BufferedImage
    private BufferedImage createImage () {
        BufferedImage image = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = (Graphics2D)image.getGraphics();
        g2.setColor(this.bgColor);
        g2.fillRect(0, 0, w, h);
         return image;
    }

    // 调用这个方法得到验证码
    public BufferedImage getImage () {
        BufferedImage image = createImage();//创建图片缓冲区
        Graphics2D g2 = (Graphics2D)image.getGraphics();//得到绘制环境
        StringBuilder sb = new StringBuilder();//用来装载生成的验证码文本
        // 向图片中画4个字符
        for(int i = 0; i < 4; i++)  {//循环四次，每次生成一个字符
            String s = randomChar() + "";//随机生成一个字母
            sb.append(s); //把字母添加到sb中
            float x = i * 1.0F * w / 4; //设置当前字符的x轴坐标
            g2.setFont(randomFont()); //设置随机字体
            g2.setColor(randomColor()); //设置随机颜色
            g2.drawString(s, x, h-5); //画图
        }
        this.text = sb.toString(); //把生成的字符串赋给了this.text
        drawLine(image); //添加干扰线
        return image;
    }

    // 返回验证码图片上的文本
    public String getText () {
        return text;
    }

    // 保存图片到指定的输出流
    public static void output (BufferedImage image, OutputStream out)
                throws IOException {
        ImageIO.write(image, "JPEG", out);
    }
}
```

# 开源工具

上面的实现基本可以满足我们的需求，不过缺点也是有的，不够灵活，不便于后期拓展。

为了方便后期拓展，我们对上述代码封装为一个工具。

## 开源地址

> [https://github.com/houbb/captcha](https://github.com/houbb/captcha)

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>captcha-core</artifactId>
    <version>0.0.2</version>
</dependency>
```

## 输出验证码到文件

```java
final String path = "1.png";

String text = CaptchaHelper.toFile(path);
System.out.println(text);
```

效果如下：

![ck9k](https://images.gitee.com/uploads/images/2020/1206/124755_d2e4d3aa_508704.png "ck9k.png")

## 灵活指定配置

### 配置项

| 配置 | 说明 | 默认值 |
|:---|:---|:---|
| range | 验证码的文本范围 | 23456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ |
| num | 验证码的文本个数 | 4 |
| width | 图片的宽度 | 100 |
| height | 图片的高度 | 40 |
| degree | 图片旋转度数 | 30 |
| lineNum | 图片干扰线数量 | 5 |
| noiseNum | 图片噪点数量 | 30 |

### 配置案例

```java
final String path = "config.png";

ICaptchaResult captchaResult = CaptchaBs.newInstance()
         .range("1234567890")
         .num(6)
         .degree(20)
         .noiseNum(50)
         .lineNum(6)
         .width(200)
         .height(60)
         .execute();
String text = CaptchaHelper.toStream(captchaResult, new FileOutputStream(path));
System.out.println(text);
```

效果如下图：

![613929](https://images.gitee.com/uploads/images/2020/1206/124908_602f0a35_508704.png "613929.png")

# 实战演练

我们利用上面的开源工具，进行一波实战。

## 后端

可以看到获取验证码的地方只有 2 行代码，非常的简单。

```java
import com.github.houbb.captcha.core.constant.CaptchaConst;
import com.github.houbb.captcha.core.util.CaptchaHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 验证码相关
 * @author 老马啸西风
 * @since 0.0.1
 */
@RequestMapping("/captcha")
@Controller
public class CaptchaController {

    /**
     * 测试页面
     * @return 测试
     */
    @RequestMapping("/")
    public String index() {
        return "captcha/captcha";
    }

    /**
     * 获取验证码
     * @param req 请求
     * @param resp 响应
     * @since 0.0.1
     */
    @RequestMapping("/get")
    public void get(HttpServletRequest req, HttpServletResponse resp) {
        try {
            // 通过ImageIO将图片输出
            String text = CaptchaHelper.toStream(resp.getOutputStream());

            // code 放入 session，用于对比
            req.getSession().setAttribute(CaptchaConst.CAPTCHA, text);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 校验验证码
     * @param req 请求
     * @param resp 响应
     * @since 0.0.1
     */
    @RequestMapping("/verify")
    @ResponseBody
    public String verify(HttpServletRequest req, HttpServletResponse resp) {
        // 获取存放在session中的验证码
        String code = (String) req.getSession().getAttribute(CaptchaConst.CAPTCHA);
        // 获取页面提交的验证码
        String inputCode = req.getParameter("captcha");
        // 验证码不区分大小写
        if(code.equalsIgnoreCase(inputCode)) {
            return "验证通过";
        } else {
            return "验证失败";
        }
    }

}
```

## 前端

这里为了简单，我们使用原生的  js 实现。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>注册页面</title>
    <!-- 引入样式 -->
</head>
<body>

<form action="/captcha/verify" method="post">
    验证码：<input type="text" name="captcha" placeholder="请输入验证码">
    <input type="submit" value="确定">
</form>
<img alt="验证码" id="captcha" src="/captcha/get" >
<a href="#" onclick="javascript:flushCode();">点击刷新</a>

<script>
    // 为了简单，此处使用原生的 js 进行演示。
    function flushCode() {
        // 每次刷新的时候获取当前时间，防止浏览器缓存刷新失败
        var time = new Date();
        document.getElementById("captcha").src = "/captcha/get?time=" + time;
    }
</script>
</body>
</html>
```

效果如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1206/125441_3fc2971f_508704.png "验证码.PNG")

# 分布式系统怎么办？

传统方案：生成验证码的时候放入session，验证的时候进行对比。

集群方案：生成验证码时候生产一个标识放入页面，同时将该唯一标识作为key，验证码作为value放入redis中，设置验证码存活时间，当表单提交到后台时，拿着token去 redis 获取验证码比较，不管校验成功与否，使之当前的token失效。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1206/154544_858a4cc2_508704.png "屏幕截图.png")

# 验证码的安全性

有了验证码就可以高枕无忧了吗？

## 应用场景

我们主要使用在注册/登陆/修改密码等安全认证场景。

一般需要发送短信，每条短信都是要收费的，如果被恶意注册，会导致金钱的浪费。

当然，如果你像 QQ 一样的体量，也可以让用户自己发送短信到指定的服务器。

## 安全隐患

web 安全一直是攻防战。

在深度学习出来之前，CAPTCHA 的定位甚至是人和机器的区分证明。

然后 AI 发展至今，结合 ocr 等技术，破译验证码并没有想象中的那么难，只不过是提升了一个技术门槛而已。

就算没有人工智能，也有各种人工的打码平台，所以安全性还是存在问题。

哪有什么方式可以降低风险呢？

还是有的，最简单最有效的就是**限制次数**。

计算机的强项在于穷举，但是如果一天只允许尝试密码错误 3 次，否则直接冻结账户，这种最简单粗暴。

## 用户体验

我们要始终记得，验证码是为了保护用户账户安全，而不是必须用户输入。

确切地说，如果你能确保用户的账户安全，完全可以不用验证码。

个人理接账户登陆时，第一次输入不需要验证码，如果输入错误，则引入验证码，防止暴力破解。

然后加一个尝试次数的限制，这样可以初步保证用户的账户安全。

验证码的形式也有多种，比如点击指定文字，滑动滑块等等。其中滑动滑块大概使用户体验最好的。



# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

对于验证码你平时有哪些使用心得呢？不妨留言和小伙伴们分享一下。



------------------------------------------------------------------------------------

# 一个简单的需求

又是一个平淡无奇的早晨。

产品经理跑了过来和开发聊了起来：“有一个特别简单的需求，做一个注册的功能，明天上线。我项目模型都给你画好了。”

你看了一眼注册的项目原型，果然很简单。

```
手机号：[ ]
[ ] 【获取验证码】
密码：[ ]
确认密码：[ ]

【登陆】【注册】
```

看起来感觉也没啥问题。

产品经理笑着说，领导说这个赶时间上，你看也不难，我们马上过一下需求吧。

## 需求评审

### 你的想法

你觉得这个产品平时还算认真，至少还画了个原型图。

而不是一句话，参考 xxx 做一个注册功能。

不过你觉得下面的一些问题需要确认下：

（1）手机号和验证码的相关问题

1.1 手机号的合法性校验问题

1.2 手机号应该是全局唯一的吧？如果重复/错误如何提示？

1.3 验证码是 6 位还是几位？验证码发送到用户的模板是什么样的？

1.4 短信发送公司有现有的工具吗？

（2）密码相关问题

2.1 密码合法性有什么要求吗？比如大小写，至少几位，最多几位，强度等等。

2.2 密码的存储方案怎样保证安全。（这个属于设计实现，类似的还有日志脱敏，防止重复提交等，不在产品考虑范围内。）

（3）其他

当然还有一些页面排版，比如对齐。

没有图标，可能对用户不够友好。

### 产品的反馈

产品把你提的几个问题，花了几十分钟也就补全了。

需求文档也比原来多了大半页的文字说明，不过这让你好歹感觉到了安心一些。

“这下都改好了，明天上线没啥问题吧？”，产品经理笑了笑，看向了测试同学。

### 测试的意见

测试同学用中指推了下眼镜，“如果这些场景全部覆盖的话，至少得 1 天的测试时间，开发下班前能提测吗？”

你看了看时间，早晨刚到公司不久就被拉过来过会议，现在也快 11 点了。

这些功能都要全部从零开始实现，因为没有封装好的工具，当然你可以“参考”已有的实现。

小伙伴们，如果是你，你觉得你能今天下班前提测吗？

### 项目经理的反馈

这个时候项目经理发话了，“这个设计可能有安全缺陷，为了防止别人恶意注册，应该加一个验证码。”

然后产品经理花了 5min 把验证码画上了，现在所有人都看向了你。

### 你的工期预估

你有点无语，用中指推了推眼镜。

“我觉得今天肯定来不及，这些功能全部要从零实现，稳妥起见还是 3 天开发时间吧。”

“这个要 3 天吗？多简单的一个功能”，产品经理感觉你在忽悠他，还特意指了指简单的注册项目原型。

“测试这边至少需要一天时间，不考虑压测，注入之类的，只是基本的场景覆盖。”，测试也补充了一下自己的排期。

"这个还是要保证安全，测试充分一些再上线。"，项目经理顿了顿，看向产品：“注册出问题了，还是很麻烦的。”

产品有些无奈，“那好吧，这个功能要 4 天，确实太慢了。要保证没有 BUG 啊！”

经常写 bug 的你，听完嘴角不自觉地抽了一下……

## 详细设计

你想了一些比较重要地，简单地记录了一下。

（1）合法性校验

前后端都需要添加校验，校验规则就按照产品提地需求。

（2）密码存储

你想到了至少需要 md5 加密，为了防止彩虹表，再采用加盐地方式。

这个后面单独一节进行展开。

（3）日志输出

日志输出算是你比较熟练地了，脱敏之类地以前也有一些经验。

（4）防重复提交

防止用户有意或者无意地重复提交。

（5）手机短信发送

你觉得这个肯定有成熟地平台 api 接入。

（6）页面验证码实现

你记得以前用过 CAPTCHA 的封装工具，不过以前没仔细研究过，这次刚好可以自己学习一下。

# 参考资料

[使用深度学习来破解 captcha 验证码](https://zhuanlan.zhihu.com/p/26078299)

[后台 java 实现验证码生成](https://blog.csdn.net/piaoyinluo2316/article/details/83754145)

[Java 实现生成验证码验证](https://blog.csdn.net/anger_zjp/article/details/89046271)

[ JAVA随机生成验证码（一）](https://www.imooc.com/article/16844)

[【Java】生成图形验证码](https://www.cnblogs.com/JonaLin/p/11269528.html)

[Java实现验证码的产生和验证](https://www.cnblogs.com/nanyangke-cjz/p/7049281.html)

[Java生成验证码并进行验证](https://www.jianshu.com/p/6f06faee41c7)

[Java生成验证码小工具](https://www.cnblogs.com/fengmingyue/p/5987814.html)

[百科](https://baike.baidu.com/item/Captcha/9630117?fr=aladdin)

[开源：captcha](https://github.com/anji-plus/captcha)

[表单重复提交和分布式验证码的一些思路](https://www.cnblogs.com/llhhll/p/11202077.html)

* any list
{:toc}