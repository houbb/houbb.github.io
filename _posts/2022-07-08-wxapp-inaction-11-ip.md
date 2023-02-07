---
layout: post
title:  微信公众号项目开发实战-10-微信公众号订阅与取消订阅 subscribe/unsubscribe
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 如何接入

[微信公众号接入指南](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419318183&token=&lang=zh_CN)

（1）申请消息接口，配置开发必要选项

登录https://mp.weixin.qq.com/ 后，在公众平台后台管理页面 – 开发者中心页，点击“修改配置”按钮，填写URL、Token和EncodingAESKey，其中URL是开发者用来接收微信服务器数据的接口URL。

Token可由开发者可以任意填写，用作生成签名（该Token会和接口URL中包含的Token进行比对，从而验证安全性）。

EncodingAESKey由开发者手动填写或随机生成，将用作消息体加解密密钥。

同时，开发者可选择消息加解密方式：明文模式、兼容模式和安全模式。

模式的选择与服务器配置在提交后都会立即生效，请开发者谨慎填写及选择。

加解密方式的默认状态为明文模式，选择兼容模式和安全模式需要提前配置好相关加解密代码，详情请参考消息体签名及加解密部分的文档。

（2）验证URL有效性（使上述配置生效，保证微信可以请求自己的服务器）

结合下图（验证服务器是否接入微信）

![验证URL有效性](https://upload-images.jianshu.io/upload_images/8835491-aa0dd103b580c14d.png?imageMogr2/auto-orient/strip|imageView2/2/w/909/format/webp)

接下来测试配置，是否成功。

![配置](https://upload-images.jianshu.io/upload_images/8835491-8a7199fd68d806e3.png?imageMogr2/auto-orient/strip|imageView2/2/w/903/format/webp)

（3）成为开发者

验证URL有效性成功后即接入生效，成为开发者。如果公众帐号类型为服务号（订阅号只能使用普通消息接口），可以在公众平台网站中申请认证，认证成功的服务号将获得众多接口权限，以满足开发者需求。

此后用户每次向公众帐号发送消息、或者产生自定义菜单点击事件时，响应URL将得到推送。

公众帐号调用各接口时，一般会获得正确的结果，具体结果可见对应接口的说明。返回错误时，可根据返回码来查询错误原因。全局返回码说明

用户向公众帐号发送消息时，公众帐号方收到的消息发送者是一个OpenID，是使用用户微信号加密后的结果，每个用户对每个公众帐号有一个唯一的OpenID。

此外请注意，微信公众帐号接口只支持80接口。

（4）开发其它功能

   a.首先开发，关注/取消关注微信公众号的事件推送（subscribe/unsubscribe订阅）

    切记这一步不要access_token哦！

   参考网上资料/php-sdk文档，有这个详细过程  respondseMsg（）接收微信响应的消息，进行消息类型的判断，从而返回相应的推送消息

参考：关注公众号推送欢迎消息

# 基础消息能力 /接收事件推送

在微信用户和公众号产生交互的过程中，用户的某些操作会使得微信服务器通过事件推送的形式通知到开发者在开发者中心处设置的服务器地址，从而开发者可以获取到该信息。

其中，某些事件推送在发生后，是允许开发者回复用户的，某些则不允许，详细内容如下：

目录

1 关注/取消关注事件

2 扫描带参数二维码事件

3 上报地理位置事件

4 自定义菜单事件

5 点击菜单拉取消息时的事件推送

6 点击菜单跳转链接时的事件推送

# 关注/取消关注事件

用户在关注与取消关注公众号时，微信会把这个事件推送到开发者填写的URL。

方便开发者给用户下发欢迎消息或者做帐号的解绑。

为保护用户数据隐私，开发者收到用户**取消关注事件时需要删除该用户的所有信息**。

微信服务器在五秒内收不到响应会断掉连接，并且重新发起请求，总共重试三次。

关于重试的消息排重，推荐**使用FromUserName + CreateTime 排重**。

假如服务器无法保证在五秒内处理并回复，可以直接回复空串，微信服务器不会对此作任何处理，并且不会发起重试。

推送 XML 数据包示例：

```xml
<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[FromUser]]></FromUserName>
  <CreateTime>123456789</CreateTime>
  <MsgType><![CDATA[event]]></MsgType>
  <Event><![CDATA[subscribe]]></Event>
</xml>
```

> [使用网页调试该接口](https://mp.weixin.qq.com/debug/cgi-bin/apiinfo?t=index&type=%E8%87%AA%E5%AE%9A%E4%B9%89%E8%8F%9C%E5%8D%95&form=%E8%87%AA%E5%AE%9A%E4%B9%89%E8%8F%9C%E5%8D%95%E5%88%9B%E5%BB%BA%E6%8E%A5%E5%8F%A3%20/menu/creat)


# java 实现方式

## 一、需求、思路

需求：用户订阅/取消订阅公众号时接收消息并保存到数据库中以便后续功能的处理。

思路：配置微信推送地址。接收微信推送的订阅消息（此处是加密的）。解密消息进行存储

## 二、文档、配置

微信官方地址：https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html

加解密文档：https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Message_encryption_and_decryption_instructions.html

加解密官方例子：https://wximg.gtimg.com/shake_tv/mpwiki/cryptoDemo.zip

### 配置步骤1

微信公众号后台：设置与开发 》基本配置 》服务器配置，点击"修改配置"按钮；

![配置步骤1](https://img-blog.csdnimg.cn/08bc8129cab741438d50249145505e00.png)

### 配置步骤2

![配置步骤2](https://img-blog.csdnimg.cn/a5c24df5ebc442ec8bac2958ccdb8e54.png)

此处推荐使用安全模式。

URL：是我们用来接收微信消息和事件通知的接口地址（下面会提供代码说明）；

Token：随便给个3~32位的数字+英文就好（如：o3MAytzQ0aZ0yB01BzzDG5f&j5gs），这个用作生成签名（该 Token 会和接口 URL 中包含的 Token 进行比对，从而验证安全性）。

EncodingAESKey：用作消息体加解密密钥，这个点下随机生成就好，如果下面的“消息加解密方式”非安全模式，用不到。

## 三、代码

### 1、引入依赖包

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>30.1.1-jre</version>
</dependency>

<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

### 2、controller

提供Get、Post请求接口

1、Get请求：用于你在微信公众号后台，修改配置 和 启用 “服务器配置” 的时候，验证服务安全性（简单讲就是微信会通过这个地址拿你刚刚设置的Token和你代码里的Token对比）

2、Post请求：后续，微信监控到用户的特定操作，然后通过这个接口通知到你，支持以下事件。

```java
@RestController
@Slf4j
public class MessageController {

    @Value("${wechat1.token}")
    private String wxToken;

    @Value("${wechat1.encodingAesKey}")
    private String wxEncodingAesKey;

    @Value("${wechat1.appid}")
    private String wxAppid;

    @Resource
    private WxOpenService wxOpenService;

    @GetMapping(value = {"/message"})
    @ResponseBody
    public String verification(@RequestParam(value = "signature", required = false) String signature,
                               @RequestParam String timestamp,
                               @RequestParam String nonce,
                               @RequestParam(value = "echostr", required = false) String echostr) {
        if (WxOpenSignatureUtil.check(wxToken, timestamp, nonce, signature)) {
            return echostr;
        } else {
            return "Error";
        }
    }

    @PostMapping(value = {"/message"})
    public void messageEvent(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        try {
            //获取请求体
            String fromXml=req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            WXBizMsgCrypt pc = new WXBizMsgCrypt(wxToken, wxEncodingAesKey, wxAppid);
            //解密
            String msgBody = pc.decryptMsg(req.getParameter("msg_signature"), req.getParameter("timestamp"), req.getParameter("nonce"), fromXml);
            wxOpenService.messageParse(msgBody);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
```

### 3、封装消息对象

WxBaseMessage

```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WxBaseMessage {

    /**
     * 接收方帐号（收到的OpenID）
     */
    @JacksonXmlProperty(localName = "ToUserName")
    private String toUserName;

    /**
     * 开发者微信号
     */
    @JacksonXmlProperty(localName = "FromUserName")
    private String fromUserName;

    /**
     * 消息创建时间 （整型）
     */
    @JacksonXmlProperty(localName = "CreateTime")
    private long createTime;

    /**
     * 消息类型
     */
    @JacksonXmlProperty(localName = "MsgType")
    private String msgType;
}
```

WxEventMessage

```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import lombok.Data;
import net.koalaclass.wx.server.utils.wx.message.WxBaseMessage;

/**
 * 订阅/取消订阅
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WxEventMessage extends WxBaseMessage {

    /**
     * 事件类型
     */
    @JacksonXmlProperty(localName = "Event")
    private String event;

}
```

可以封装更多的消息对象。其他的进行省略

## 4、service、解密

```java
@Override
public void messageParse(String message) throws JsonProcessingException {
    XmlMapper xmlMapper = new XmlMapper();
    ObjectMapper mapper = new ObjectMapper();
    WxBaseMessage baseMessage = xmlMapper.readValue(message, WxBaseMessage.class);
    //判断是否是事件类型
    if(baseMessage.getMsgType().equals("event")){
        WxEventMessage event=xmlMapper.readValue(message, WxEventMessage.class);
        //订阅
        if(event.getEvent().equals("subscribe")){
        }
        //取消订阅
        if(event.getEvent().equals("unsubscribe")){
        }
    } else if (baseMessage.getMsgType().equals("text")){
        //判断为文本消息
    }
}
```

解密WXBizMsgCrypt

其他文件自行下载官方例子

此处有坑：aesKey = Base64.decodeBase64(encodingAesKey + “=”);

官方这样写会报错修改为谷歌的包 aesKey =BaseEncoding.base64().decode(encodingAesKey + “=”);

```java
/**
 * 对公众平台发送给公众账号的消息加解密示例代码.
 * 
 * @copyright Copyright (c) 1998-2014 Tencent Inc.
 */

// ------------------------------------------------------------------------

/**
 * 针对org.apache.commons.codec.binary.Base64，
 * 需要导入架包commons-codec-1.9（或commons-codec-1.8等其他版本）
 * 官方下载地址：http://commons.apache.org/proper/commons-codec/download_codec.cgi
 */
package net.koalaclass.wx.server.utils.aes;

import com.google.common.io.BaseEncoding;
import org.apache.commons.codec.binary.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.Random;

/**
 * 提供接收和推送给公众平台消息的加解密接口(UTF8编码的字符串).
 * <ol>
 * 	<li>第三方回复加密消息给公众平台</li>
 * 	<li>第三方收到公众平台发送的消息，验证消息的安全性，并对消息进行解密。</li>
 * </ol>
 * 说明：异常java.security.InvalidKeyException:illegal Key Size的解决方案
 * <ol>
 * 	<li>在官方网站下载JCE无限制权限策略文件（JDK7的下载地址：
 *      http://www.oracle.com/technetwork/java/javase/downloads/jce-7-download-432124.html</li>
 * 	<li>下载后解压，可以看到local_policy.jar和US_export_policy.jar以及readme.txt</li>
 * 	<li>如果安装了JRE，将两个jar文件放到%JRE_HOME%\lib\security目录下覆盖原来的文件</li>
 * 	<li>如果安装了JDK，将两个jar文件放到%JDK_HOME%\jre\lib\security目录下覆盖原来文件</li>
 * </ol>
 */
public class WXBizMsgCrypt {
	static Charset CHARSET = Charset.forName("utf-8");
	Base64 base64 = new Base64();
	byte[] aesKey;
	String token;
	String appId;

	/**
	 * 构造函数
	 * @param token 公众平台上，开发者设置的token
	 * @param encodingAesKey 公众平台上，开发者设置的EncodingAESKey
	 * @param appId 公众平台appid
	 * 
	 * @throws AesException 执行失败，请查看该异常的错误码和具体的错误信息
	 */
	public WXBizMsgCrypt(String token, String encodingAesKey, String appId) throws AesException {
		if (encodingAesKey.length() != 43) {
			throw new AesException(AesException.IllegalAesKey);
		}

		this.token = token;
		this.appId = appId;
//		aesKey = Base64.decodeBase64(encodingAesKey + "=");
		aesKey =BaseEncoding.base64().decode(encodingAesKey + "=");
	}

	// 生成4个字节的网络字节序
	byte[] getNetworkBytesOrder(int sourceNumber) {
		byte[] orderBytes = new byte[4];
		orderBytes[3] = (byte) (sourceNumber & 0xFF);
		orderBytes[2] = (byte) (sourceNumber >> 8 & 0xFF);
		orderBytes[1] = (byte) (sourceNumber >> 16 & 0xFF);
		orderBytes[0] = (byte) (sourceNumber >> 24 & 0xFF);
		return orderBytes;
	}

	// 还原4个字节的网络字节序
	int recoverNetworkBytesOrder(byte[] orderBytes) {
		int sourceNumber = 0;
		for (int i = 0; i < 4; i++) {
			sourceNumber <<= 8;
			sourceNumber |= orderBytes[i] & 0xff;
		}
		return sourceNumber;
	}

	// 随机生成16位字符串
	String getRandomStr() {
		String base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		Random random = new Random();
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < 16; i++) {
			int number = random.nextInt(base.length());
			sb.append(base.charAt(number));
		}
		return sb.toString();
	}

	/**
	 * 对明文进行加密.
	 * 
	 * @param text 需要加密的明文
	 * @return 加密后base64编码的字符串
	 * @throws AesException aes加密失败
	 */
	String encrypt(String randomStr, String text) throws AesException {
		ByteGroup byteCollector = new ByteGroup();
		byte[] randomStrBytes = randomStr.getBytes(CHARSET);
		byte[] textBytes = text.getBytes(CHARSET);
		byte[] networkBytesOrder = getNetworkBytesOrder(textBytes.length);
		byte[] appidBytes = appId.getBytes(CHARSET);

		// randomStr + networkBytesOrder + text + appid
		byteCollector.addBytes(randomStrBytes);
		byteCollector.addBytes(networkBytesOrder);
		byteCollector.addBytes(textBytes);
		byteCollector.addBytes(appidBytes);

		// ... + pad: 使用自定义的填充方式对明文进行补位填充
		byte[] padBytes = PKCS7Encoder.encode(byteCollector.size());
		byteCollector.addBytes(padBytes);

		// 获得最终的字节流, 未加密
		byte[] unencrypted = byteCollector.toBytes();

		try {
			// 设置加密模式为AES的CBC模式
			Cipher cipher = Cipher.getInstance("AES/CBC/NoPadding");
			SecretKeySpec keySpec = new SecretKeySpec(aesKey, "AES");
			IvParameterSpec iv = new IvParameterSpec(aesKey, 0, 16);
			cipher.init(Cipher.ENCRYPT_MODE, keySpec, iv);

			// 加密
			byte[] encrypted = cipher.doFinal(unencrypted);

			// 使用BASE64对加密后的字符串进行编码
			String base64Encrypted = base64.encodeToString(encrypted);

			return base64Encrypted;
		} catch (Exception e) {
			e.printStackTrace();
			throw new AesException(AesException.EncryptAESError);
		}
	}

	/**
	 * 对密文进行解密.
	 * 
	 * @param text 需要解密的密文
	 * @return 解密得到的明文
	 * @throws AesException aes解密失败
	 */
	String decrypt(String text) throws AesException {
		byte[] original;
		try {
			// 设置解密模式为AES的CBC模式
			Cipher cipher = Cipher.getInstance("AES/CBC/NoPadding");
			SecretKeySpec key_spec = new SecretKeySpec(aesKey, "AES");
			IvParameterSpec iv = new IvParameterSpec(Arrays.copyOfRange(aesKey, 0, 16));
			cipher.init(Cipher.DECRYPT_MODE, key_spec, iv);

			// 使用BASE64对密文进行解码
			byte[] encrypted = Base64.decodeBase64(text);

			// 解密
			original = cipher.doFinal(encrypted);
		} catch (Exception e) {
			e.printStackTrace();
			throw new AesException(AesException.DecryptAESError);
		}

		String xmlContent, from_appid;
		try {
			// 去除补位字符
			byte[] bytes = PKCS7Encoder.decode(original);

			// 分离16位随机字符串,网络字节序和AppId
			byte[] networkOrder = Arrays.copyOfRange(bytes, 16, 20);

			int xmlLength = recoverNetworkBytesOrder(networkOrder);

			xmlContent = new String(Arrays.copyOfRange(bytes, 20, 20 + xmlLength), CHARSET);
			from_appid = new String(Arrays.copyOfRange(bytes, 20 + xmlLength, bytes.length),
					CHARSET);
		} catch (Exception e) {
			e.printStackTrace();
			throw new AesException(AesException.IllegalBuffer);
		}

		// appid不相同的情况
		if (!from_appid.equals(appId)) {
			throw new AesException(AesException.ValidateAppidError);
		}
		return xmlContent;

	}

	/**
	 * 将公众平台回复用户的消息加密打包.
	 * <ol>
	 * 	<li>对要发送的消息进行AES-CBC加密</li>
	 * 	<li>生成安全签名</li>
	 * 	<li>将消息密文和安全签名打包成xml格式</li>
	 * </ol>
	 * 
	 * @param replyMsg 公众平台待回复用户的消息，xml格式的字符串
	 * @param timeStamp 时间戳，可以自己生成，也可以用URL参数的timestamp
	 * @param nonce 随机串，可以自己生成，也可以用URL参数的nonce
	 * 
	 * @return 加密后的可以直接回复用户的密文，包括msg_signature, timestamp, nonce, encrypt的xml格式的字符串
	 * @throws AesException 执行失败，请查看该异常的错误码和具体的错误信息
	 */
	public String encryptMsg(String replyMsg, String timeStamp, String nonce) throws AesException {
		// 加密
		String encrypt = encrypt(getRandomStr(), replyMsg);

		// 生成安全签名
		if (timeStamp == "") {
			timeStamp = Long.toString(System.currentTimeMillis());
		}

		String signature = SHA1.getSHA1(token, timeStamp, nonce, encrypt);

		// System.out.println("发送给平台的签名是: " + signature[1].toString());
		// 生成发送的xml
		String result = XMLParse.generate(encrypt, signature, timeStamp, nonce);
		return result;
	}

	/**
	 * 检验消息的真实性，并且获取解密后的明文.
	 * <ol>
	 * 	<li>利用收到的密文生成安全签名，进行签名验证</li>
	 * 	<li>若验证通过，则提取xml中的加密消息</li>
	 * 	<li>对消息进行解密</li>
	 * </ol>
	 * 
	 * @param msgSignature 签名串，对应URL参数的msg_signature
	 * @param timeStamp 时间戳，对应URL参数的timestamp
	 * @param nonce 随机串，对应URL参数的nonce
	 * @param postData 密文，对应POST请求的数据
	 * 
	 * @return 解密后的原文
	 * @throws AesException 执行失败，请查看该异常的错误码和具体的错误信息
	 */
	public String decryptMsg(String msgSignature, String timeStamp, String nonce, String postData)
			throws AesException {

		// 密钥，公众账号的app secret
		// 提取密文
		Object[] encrypt = XMLParse.extract(postData);

		// 验证安全签名
		String signature = SHA1.getSHA1(token, timeStamp, nonce, encrypt[1].toString());

		// 和URL中的签名比较是否相等
		// System.out.println("第三方收到URL中的签名：" + msg_sign);
		// System.out.println("第三方校验签名：" + signature);
		if (!signature.equals(msgSignature)) {
			throw new AesException(AesException.ValidateSignatureError);
		}

		// 解密
		String result = decrypt(encrypt[1].toString());
		return result;
	}

	/**
	 * 验证URL
	 * @param msgSignature 签名串，对应URL参数的msg_signature
	 * @param timeStamp 时间戳，对应URL参数的timestamp
	 * @param nonce 随机串，对应URL参数的nonce
	 * @param echoStr 随机串，对应URL参数的echostr
	 * 
	 * @return 解密之后的echostr
	 * @throws AesException 执行失败，请查看该异常的错误码和具体的错误信息
	 */
	public String verifyUrl(String msgSignature, String timeStamp, String nonce, String echoStr)
			throws AesException {
		String signature = SHA1.getSHA1(token, timeStamp, nonce, echoStr);

		if (!signature.equals(msgSignature)) {
			throw new AesException(AesException.ValidateSignatureError);
		}

		String result = decrypt(echoStr);
		return result;
	}

}
```

## 5、工具包

WxOpenSignatureUtil

```java
import lombok.extern.slf4j.Slf4j;
import net.koalaclass.wx.server.utils.wx.AccessTokenResponse;
import net.koalaclass.wx.server.utils.wx.JsapiTicketResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
public class WxOpenSignatureUtil {
    public static boolean check(String token, String timestamp, String nonce, String signature) {
        String[] tmpArr = {token, timestamp, nonce};
        tmpArr = Arrays.stream(tmpArr).sorted().collect(Collectors.toList()).toArray(new String[0]);
        String tmpStr = "";
        for (int i = 0; i < tmpArr.length; i++) {
            tmpStr += tmpArr[i];
        }

        tmpStr = sha1(tmpStr);
        if (tmpStr.equals(signature)) {
            return true;
        } else {
            return false;
        }
    }

    public static String sha1(String text) {
        String mySignature = null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA1");
            md.update(text.getBytes());
            byte[] digest = md.digest();

            StringBuffer hexstr = new StringBuffer();
            String shaHex = "";
            for (int i = 0; i < digest.length; i++) {
                shaHex = Integer.toHexString(digest[i] & 0xFF);
                if (shaHex.length() < 2) {
                    hexstr.append(0);
                }
                hexstr.append(shaHex);
            }

            mySignature = hexstr.toString();
        } catch (NoSuchAlgorithmException e) {
            //return "签名验证错误";
        }
        return mySignature;
    }

    public static AccessTokenResponse getAccessToken(String appId, String appSecret) {
        String url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret;
        WebClient.ResponseSpec retrieve = WebClient.create().get().uri(url).retrieve();
        Mono<AccessTokenResponse> resp =retrieve.bodyToMono(AccessTokenResponse.class)
                .timeout(Duration.of(20, ChronoUnit.SECONDS))
                .doOnError(throwable -> {
                    log.info(throwable.getMessage());
                });
        return resp.block();
    }

    public static JsapiTicketResponse getJsapiTicket(String accessToken) {
        String url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + accessToken + "&type=jsapi";
        Mono<JsapiTicketResponse> resp = WebClient.create().get().uri(url).retrieve().bodyToMono(JsapiTicketResponse.class)
                .timeout(Duration.of(20, ChronoUnit.SECONDS))
                .doOnError(throwable -> {
                    log.info(throwable.getMessage());
                });
        return resp.block();
    }

    public static String signJsApiUrl(String url, String timestamp, String nonce, String jsapiTicket) {
        String[] tmpArr = {"url=" + url, "timestamp=" + timestamp, "noncestr=" + nonce, "jsapi_ticket=" + jsapiTicket};
        tmpArr = Arrays.stream(tmpArr).sorted().collect(Collectors.toList()).toArray(new String[0]);
        String tmpStr = "";
        for (int i = 0; i < tmpArr.length; i++) {
            if (i == 0) {
                tmpStr += tmpArr[i];
            } else {
                tmpStr += "&" + tmpArr[i];
            }
        }

        return sha1(tmpStr);
    }
}
```



# 一些安全的问题

## 消息的加密问题

看了下 demo，post 接口应该是有签名的。

因为我们的接口是暴露的，GET 虽然可以验证消息确实来自微信，POST 接口中也可以验证签名。

诚然，我们可以通过加密的方式保障安全性，但是测试环境无法进行验证。测试环境，默认只能测试明文。不得不说，这一点有待改进。

## 其他方式












# 参考资料

https://www.jianshu.com/p/4102a7649063?open_source

[微信公众号开发—关注/取消事件（基于thinkphp3.2.3）](https://blog.csdn.net/John_rush/article/details/80610025)

https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html

[Java 微信关注/取消关注事件](https://blog.csdn.net/qq_43548590/article/details/128022934)

* any list
{:toc}