# HTTP

> HTTP 请求的 GET 与 POST 方式的区别





> 解释一下什么是 servlet






> 说一说 Servlet 的生命周期


servlet 有良好的生存期的定义,包括加载和实例化、初始化、处理请求以及服务结束。这个生存期由 javax.servlet.Servlet 接口的 init,service 和 destroy 方法表达


Servlet 被服务器实例化后,容器运行其 init 方法,请求到达时运行其 service 方法,service 方法自动派遣运行与请求对应的 doXXX 方法(doGet,doPost)等,当服务器决定将实例 销毁的时候调用其 destroy 方法。
web 容器加载 servlet,生命周期开始。通过调用 servlet 的 init()方法进行 servlet 的初始化。

通过调用 service()方法实现,根据请求的不同调用不同的 do***()方法。结束服务,web 容 器调用 servlet 的 destroy()方法。




> Servlet 的基本架构


```java
public class ServletName extends HttpServlet {
    public void doPost(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
    }
    public void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
    }
}
```


> SERVLET API 中 forward()与 redirect()的区别


答:前者仅是容器中控制权的转向,在客户端浏览器地址栏中不会显示出转向后的地址;后 者则是完全的跳转,浏览器将会得到跳转的地址,并重新发送请求链接。
这样,从浏览器的 地址栏中可以看到跳转后的链接地址。所以,前者更加高效,在前者可以满足需要时,尽量 使用 forward()方法,并且,这样也有助于隐藏实际的链接。
在有些情况下,比如,需要跳 转到一个其它服务器上的资源,则必须使用 sendRedirect() 方法




> 什么情况下调用 doGet()和 doPost()?

Jsp 页面中的 FORM 标签里的 method 属性为 get 时调用 doGet(),为 post 时调用 doPost()。



> Request 对象的主要方法:

setAttribute(String name,Object):设置名字为 name 的 request 的参数值 getAttribute(String name):返回由 name 指定的属性值
getAttributeNames():返回 request 对象所有属性的名字集合,结果是一个枚举的实例 getCookies():返回客户端的所有 Cookie 对象,结果是一个 Cookie 数组 getCharacterEncoding():返回请求中的字符编码方式 getContentLength():返回请求的 Body 的长度
getHeader(String name):获得 HTTP 协议定义的文件头信息
getHeaders(String name):返回指定名字的 request Header 的所有值,结果是一个枚举的
实例
getHeaderNames():返回所以 request Header 的名字,结果是一个枚举的实例
getInputStream():返回请求的输入流,用于获得请求中的数据
getMethod():获得客户端向服务器端传送数据的方法
getParameter(String name):获得客户端传送给服务器端的有 name 指定的参数值
getParameterNames():获得客户端传送给服务器端的所有参数的名字,结果是一个枚举的 实例
getParametervalues(String name):获得有 name 指定的参数的所有值 getProtocol():获取客户端向服务器端传送数据所依据的协议名称 getQueryString():获得查询字符串 getRequestURI():获取发出请求字符串的客户端地址 getRemoteAddr():获取客户端的 IP 地址 getRemoteHost():获取客户端的名字
getSession([Boolean create]):返回和请求相关 Session getServerName():获取服务器的名字 getServletPath():获取客户端所请求的脚本文件的路径 getServerPort():获取服务器的端口号 removeAttribute(String name):删除请求中的一个属性


> forward 和 redirect 的区别


forward 是服务器请求资源,服务器直接访问目标地址的 URL,把那个 URL 的响应内容读 取过来,然后把这些内容再发给浏览器,浏览器根本不知道服务器发送的内容是从哪儿来的, 所以它的地址栏中还是原来的地址。
redirect 就是服务端根据逻辑,发送一个状态码,告诉浏览器重新去请求那个地址,一般来 说浏览器会用刚才请求的所有参数重新请求,所以 session,request 参数都可以获取。



> request.getAttribute()和 request.getParameter()有何区别?



getParameter 得到的都是 String 类型的。或者是 http://a.jsp?id=123 中的 123,或者是某个表 单 交过去的数据。
getAttribute 则可以是对象。
getParameter()是获取 POST/GET 传递的参数值; getAttribute()是获取对象容器中的数据值; getParameter:用于客户端重定向时,即点击了链接或 交按扭时传值用,即用于在用表单 或 url 重定向传值时接收数据用。
getAttribute:用于服务器端重定向时,即在 sevlet 中使用了 forward 函数,或 struts 中使用了 mapping.findForward。getAttribute 只能收到程序用 setAttribute 传过来的值。 getParameter()是获取 POST/GET 传递的参数值;
getAttribute()是获取 SESSION 的值;
另外,可以用 setAttribute,getAttribute 发送接收对象.而 getParameter 显然只能传字符串。 setAttribute 是应用服务器把这个对象放在该页面所对应的一块内存中去,当你的页面服务器 重定向到另一个页面时,应用服务器会把这块内存拷贝另一个页面所对应的内存中。这样 getAttribute 就能取得你所设下的值,当然这种方法可以传对象。session 也一样,只是对象 在内存中的生命周期不一样而已。getParameter 只是应用服务器在分析你送上来的 request 页面的文本时,取得你设在表单或 url 重定向时的值。
getParameter 返回的是 String, 用于读取 交的表单中的值;
getAttribute 返回的是 Object,需进行转换,可用 setAttribute 设置成任意对象,使用很灵活, 可随时用;





