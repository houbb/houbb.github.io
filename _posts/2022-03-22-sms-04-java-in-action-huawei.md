---
layout: post
title: SMS aliyun 华为云之 java 如何实现短信发送？
date: 2022-03-18 21:01:55 +0800 
categories: [TOOL]
tags: [tool, sh]
published: true
---

# java 例子

## 依赖包

```
httpclient、httpcore、commons-codec、commons-logging、org.json
```

## 发送短信（示例1）

```java
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URL;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
//如果JDK版本是1.8,可使用原生Base64类
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

//如果JDK版本低于1.8,请使用三方库提供Base64类
//import org.apache.commons.codec.binary.Base64;

public class SendSms {

    //无需修改,用于格式化鉴权头域,给"X-WSSE"参数赋值
    private static final String WSSE_HEADER_FORMAT = "UsernameToken Username=\"%s\",PasswordDigest=\"%s\",Nonce=\"%s\",Created=\"%s\"";
    //无需修改,用于格式化鉴权头域,给"Authorization"参数赋值
    private static final String AUTH_HEADER_VALUE = "WSSE realm=\"SDP\",profile=\"UsernameToken\",type=\"Appkey\"";

    public static void main(String[] args) throws Exception {

        //必填,请参考"开发准备"获取如下数据,替换为实际值
        String url = "https://smsapi.cn-north-4.myhuaweicloud.com:443/sms/batchSendSms/v1"; //APP接入地址(在控制台"应用管理"页面获取)+接口访问URI
        String appKey = "c8RWg3ggEcyd4D3p94bf3Y7x1Ile"; //APP_Key
        String appSecret = "q4Ii87BhST9vcs8wvrzN80SfD7Al"; //APP_Secret
        String sender = "csms12345678"; //国内短信签名通道号或国际/港澳台短信通道号
        String templateId = "8ff55eac1d0b478ab3c06c3c6a492300"; //模板ID

        //条件必填,国内短信关注,当templateId指定的模板类型为通用模板时生效且必填,必须是已审核通过的,与模板类型一致的签名名称
        //国际/港澳台短信不用关注该参数
        String signature = "华为云短信测试"; //签名名称

        //必填,全局号码格式(包含国家码),示例:+8615123456789,多个号码之间用英文逗号分隔
        String receiver = "+86151****6789,+86152****7890"; //短信接收人号码

        //选填,短信状态报告接收地址,推荐使用域名,为空或者不填表示不接收状态报告
        String statusCallBack = "";

        /**
         * 选填,使用无变量模板时请赋空值 String templateParas = "";
         * 单变量模板示例:模板内容为"您的验证码是${1}"时,templateParas可填写为"[\"369751\"]"
         * 双变量模板示例:模板内容为"您有${1}件快递请到${2}领取"时,templateParas可填写为"[\"3\",\"人民公园正门\"]"
         * 模板中的每个变量都必须赋值，且取值不能为空
         * 查看更多模板和变量规范:产品介绍>模板和变量规范
         */
        String templateParas = "[\"369751\"]"; //模板变量，此处以单变量验证码短信为例，请客户自行生成6位验证码，并定义为字符串类型，以杜绝首位0丢失的问题（例如：002569变成了2569）。

        //请求Body,不携带签名名称时,signature请填null
        String body = buildRequestBody(sender, receiver, templateId, templateParas, statusCallBack, signature);
        if (null == body || body.isEmpty()) {
            System.out.println("body is null.");
            return;
        }

        //请求Headers中的X-WSSE参数值
        String wsseHeader = buildWsseHeader(appKey, appSecret);
        if (null == wsseHeader || wsseHeader.isEmpty()) {
            System.out.println("wsse header is null.");
            return;
        }

        Writer out = null;
        BufferedReader in = null;
        StringBuffer result = new StringBuffer();
        HttpsURLConnection connection = null;
        InputStream is = null;

        
        HostnameVerifier hv = new HostnameVerifier() {

            @Override
            public boolean verify(String hostname, SSLSession session) {
                return true;
            }
        };
        trustAllHttpsCertificates();

        try {
            URL realUrl = new URL(url);
            connection = (HttpsURLConnection) realUrl.openConnection();

            connection.setHostnameVerifier(hv);
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(true);
            //请求方法
            connection.setRequestMethod("POST");
            //请求Headers参数
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("Authorization", AUTH_HEADER_VALUE);
            connection.setRequestProperty("X-WSSE", wsseHeader);

            connection.connect();
            out = new OutputStreamWriter(connection.getOutputStream());
            out.write(body); //发送请求Body参数
            out.flush();
            out.close();

            int status = connection.getResponseCode();
            if (200 == status) { //200
                is = connection.getInputStream();
            } else { //400/401
                is = connection.getErrorStream();
            }
            in = new BufferedReader(new InputStreamReader(is, "UTF-8"));
            String line = "";
            while ((line = in.readLine()) != null) {
                result.append(line);
            }
            System.out.println(result.toString()); //打印响应消息实体
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (null != out) {
                    out.close();
                }
                if (null != is) {
                    is.close();
                }
                if (null != in) {
                    in.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 构造请求Body体
     * @param sender
     * @param receiver
     * @param templateId
     * @param templateParas
     * @param statusCallBack
     * @param signature | 签名名称,使用国内短信通用模板时填写
     * @return
     */
    static String buildRequestBody(String sender, String receiver, String templateId, String templateParas,
            String statusCallBack, String signature) {
        if (null == sender || null == receiver || null == templateId || sender.isEmpty() || receiver.isEmpty()
                || templateId.isEmpty()) {
            System.out.println("buildRequestBody(): sender, receiver or templateId is null.");
            return null;
        }
        Map<String, String> map = new HashMap<String, String>();

        map.put("from", sender);
        map.put("to", receiver);
        map.put("templateId", templateId);
        if (null != templateParas && !templateParas.isEmpty()) {
            map.put("templateParas", templateParas);
        }
        if (null != statusCallBack && !statusCallBack.isEmpty()) {
            map.put("statusCallback", statusCallBack);
        }
        if (null != signature && !signature.isEmpty()) {
            map.put("signature", signature);
        }

        StringBuilder sb = new StringBuilder();
        String temp = "";

        for (String s : map.keySet()) {
            try {
                temp = URLEncoder.encode(map.get(s), "UTF-8");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            sb.append(s).append("=").append(temp).append("&");
        }

        return sb.deleteCharAt(sb.length()-1).toString();
    }

    /**
     * 构造X-WSSE参数值
     * @param appKey
     * @param appSecret
     * @return
     */
    static String buildWsseHeader(String appKey, String appSecret) {
        if (null == appKey || null == appSecret || appKey.isEmpty() || appSecret.isEmpty()) {
            System.out.println("buildWsseHeader(): appKey or appSecret is null.");
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        String time = sdf.format(new Date()); //Created
        String nonce = UUID.randomUUID().toString().replace("-", ""); //Nonce

        MessageDigest md;
        byte[] passwordDigest = null;

        try {
            md = MessageDigest.getInstance("SHA-256");
            md.update((nonce + time + appSecret).getBytes());
            passwordDigest = md.digest();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        //如果JDK版本是1.8,请加载原生Base64类,并使用如下代码
        String passwordDigestBase64Str = Base64.getEncoder().encodeToString(passwordDigest); //PasswordDigest
        //如果JDK版本低于1.8,请加载三方库提供Base64类,并使用如下代码
        //String passwordDigestBase64Str = Base64.encodeBase64String(passwordDigest); //PasswordDigest
        //若passwordDigestBase64Str中包含换行符,请执行如下代码进行修正
        //passwordDigestBase64Str = passwordDigestBase64Str.replaceAll("[\\s*\t\n\r]", "");
        return String.format(WSSE_HEADER_FORMAT, appKey, passwordDigestBase64Str, nonce, time);
    }

    /*** @throws Exception
     */
    static void trustAllHttpsCertificates() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                        return;
                    }
                    public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                        return;
                    }
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                }
        };
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, null);
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
    }
}
```

## 发送分批短信（示例1）

```java
//如果JDK版本低于1.8,请使用三方库提供Base64类
//import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
//如果JDK版本是1.8,可使用原生Base64类
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class SendDiffSms {

    //无需修改,用于格式化鉴权头域,给"X-WSSE"参数赋值
    private static final String WSSE_HEADER_FORMAT = "UsernameToken Username=\"%s\",PasswordDigest=\"%s\",Nonce=\"%s\",Created=\"%s\"";
    //无需修改,用于格式化鉴权头域,给"Authorization"参数赋值
    private static final String AUTH_HEADER_VALUE = "WSSE realm=\"SDP\",profile=\"UsernameToken\",type=\"Appkey\"";

    public static void main(String[] args) throws Exception{

        //必填,请参考"开发准备"获取如下数据,替换为实际值
        String url = "https://smsapi.cn-north-4.myhuaweicloud.com:443/sms/batchSendDiffSms/v1"; //APP接入地址(在控制台"应用管理"页面获取)+接口访问URI
        String appKey = "c8RWg3ggEcyd4D3p94bf3Y7x1Ile"; //APP_Key
        String appSecret = "q4Ii87BhST9vcs8wvrzN80SfD7Al"; //APP_Secret
        String sender = "csms12345678"; //国内短信签名通道号或国际/港澳台短信通道号
        String templateId1 = "8ff55eac1d0b478ab3c06c3c6a492300"; //模板ID1
        String templateId2 = "8ff55eac1d0b478ab3c06c3c6a492300"; //模板ID2

        //条件必填,国内短信关注,当templateId指定的模板类型为通用模板时生效且必填,必须是已审核通过的,与模板类型一致的签名名称
        //国际/港澳台短信不用关注该参数
        String signature1 = "华为云短信测试"; //签名名称1
        String signature2 = "华为云短信测试"; //签名名称2

        //必填,全局号码格式(包含国家码),示例:+86151****6789,多个号码之间用英文逗号分隔
        String[] receiver1 = {"+8615123456789", "+86152****7890"}; //模板1的接收号码
        String[] receiver2 = {"+8615123456789", "+86152****7890"}; //模板2的接收号码

        //选填,短信状态报告接收地址,推荐使用域名,为空或者不填表示不接收状态报告
        String statusCallBack = "";

        /**
         * 选填,使用无变量模板时请赋空值 String[] templateParas = {};
         * 单变量模板示例:模板内容为"您的验证码是${1}"时,templateParas可填写为{"369751"}
         * 双变量模板示例:模板内容为"您有${1}件快递请到${2}领取"时,templateParas可填写为{"3","人民公园正门"}
         * 模板中的每个变量都必须赋值，且取值不能为空
         * 查看更多模板和变量规范:产品介绍>模板和变量规范
         */
        String[] templateParas1 = {"123456"}; //模板1变量，此处以单变量验证码短信为例，请客户自行生成6位验证码，并定义为字符串类型，以杜绝首位0丢失的问题（例如：002569变成了2569）。
        String[] templateParas2 = {"234567"}; //模板2变量，此处以单变量验证码短信为例，请客户自行生成6位验证码，并定义为字符串类型，以杜绝首位0丢失的问题（例如：002569变成了2569）。

        //smsContent,不携带签名名称时,signature请填null
        List<Map<String, Object>> smsContent = new ArrayList<Map<String, Object>>();
        Map<String, Object> item1 = initDiffSms(receiver1, templateId1, templateParas1, signature1);
        Map<String, Object> item2 = initDiffSms(receiver2, templateId2, templateParas2, signature2);
        if (null != item1 && !item1.isEmpty()) {
            smsContent.add(item1);
        }
        if (null != item2 && !item2.isEmpty()) {
            smsContent.add(item2);
        }

        //请求Body
        String body = buildRequestBody(sender, smsContent, statusCallBack);
        if (null == body || body.isEmpty()) {
            System.out.println("body is null.");
            return;
        }

        //请求Headers中的X-WSSE参数值
        String wsseHeader = buildWsseHeader(appKey, appSecret);
        if (null == wsseHeader || wsseHeader.isEmpty()) {
            System.out.println("wsse header is null.");
            return;
        }

        //如果JDK版本低于1.8,可使用如下代码//CloseableHttpClient client = HttpClients.custom()
        //        .setSSLContext(new SSLContextBuilder().loadTrustMaterial(null, new TrustStrategy() {
        //            @Override
        //            public boolean isTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
        //                return true;
        //            }
        //        }).build()).setSSLHostnameVerifier(new DefaultHostnameVerifier()).build();

        //如果JDK版本是1.8,可使用如下代码
        CloseableHttpClient client = HttpClients.custom()
                    .setSSLContext(new SSLContextBuilder().loadTrustMaterial(null,
                            (x509CertChain, authType) -> true).build())
                    .setSSLHostnameVerifier(new DefaultHostnameVerifier())
                    .build();

        HttpResponse response = client.execute(RequestBuilder.create("POST")//请求方法POST
                    .setUri(url)
                    .addHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                    .addHeader(HttpHeaders.AUTHORIZATION, AUTH_HEADER_VALUE)
                    .addHeader("X-WSSE", wsseHeader)
                    .setEntity(new StringEntity(body)).build());

        System.out.println(response.toString()); //打印响应头域信息
        System.out.println(EntityUtils.toString(response.getEntity())); //打印响应消息实体
    }

    /**
     * 构造smsContent参数值
     * @param receiver
     * @param templateId
     * @param templateParas
     * @param signature | 签名名称,使用国内短信通用模板时填写
     * @return
     */
    static Map<String, Object> initDiffSms(String[] receiver, String templateId, String[] templateParas,
            String signature) {
        if (null == receiver || null == templateId || receiver.length == 0 || templateId.isEmpty()) {
            System.out.println("initDiffSms(): receiver or templateId is null.");
            return null;
        }
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("to", receiver);
        map.put("templateId", templateId);
        if (null != templateParas && templateParas.length > 0) {
            map.put("templateParas", templateParas);
        }
        if (null != signature && !signature.isEmpty()) {
            map.put("signature", signature);
        }

        return map;
    }

    /**
     * 构造请求Body体
     * @param sender
     * @param smsContent
     * @param statusCallbackUrl
     * @return
     */
    static String buildRequestBody(String sender, List<Map<String, Object>> smsContent,
                                   String statusCallbackUrl) {
        if (null == sender || null == smsContent || sender.isEmpty() || smsContent.isEmpty()) {
            System.out.println("buildRequestBody(): sender or smsContent is null.");
            return null;
        }
        JSONArray jsonArr = new JSONArray();

        for(Map<String, Object> it: smsContent){
            jsonArr.put(it);
        }

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("from", sender);
        data.put("smsContent", jsonArr);
        if (null != statusCallbackUrl && !statusCallbackUrl.isEmpty()) {
            data.put("statusCallback", statusCallbackUrl);
        }

        return new JSONObject(data).toString();
    }

    /**
     * 构造X-WSSE参数值
     * @param appKey
     * @param appSecret
     * @return
     */
    static String buildWsseHeader(String appKey, String appSecret) {
        if (null == appKey || null == appSecret || appKey.isEmpty() || appSecret.isEmpty()) {
            System.out.println("buildWsseHeader(): appKey or appSecret is null.");
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        String time = sdf.format(new Date()); //Created
        String nonce = UUID.randomUUID().toString().replace("-", ""); //Nonce

        byte[] passwordDigest = DigestUtils.sha256(nonce + time + appSecret);
        String hexDigest = Hex.encodeHexString(passwordDigest);

        //如果JDK版本是1.8,请加载原生Base64类,并使用如下代码
        String passwordDigestBase64Str = Base64.getEncoder().encodeToString(hexDigest.getBytes()); //PasswordDigest
        //如果JDK版本低于1.8,请加载三方库提供Base64类,并使用如下代码
        //String passwordDigestBase64Str = Base64.encodeBase64String(hexDigest.getBytes(Charset.forName("utf-8"))); //PasswordDigest
        //若passwordDigestBase64Str中包含换行符,请执行如下代码进行修正
        //passwordDigestBase64Str = passwordDigestBase64Str.replaceAll("[\\s*\t\n\r]", "");

        return String.format(WSSE_HEADER_FORMAT, appKey, passwordDigestBase64Str, nonce, time);
    }
}
```

## 发送分批短信（示例2）

```java
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
//如果JDK版本是1.8,可使用原生Base64类
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

//如果JDK版本低于1.8,请使用三方库提供Base64类
//import org.apache.commons.codec.binary.Base64;
import org.json.JSONArray;
import org.json.JSONObject;

public class SendDiffSms {

    //无需修改,用于格式化鉴权头域,给"X-WSSE"参数赋值
    private static final String WSSE_HEADER_FORMAT = "UsernameToken Username=\"%s\",PasswordDigest=\"%s\",Nonce=\"%s\",Created=\"%s\"";
    //无需修改,用于格式化鉴权头域,给"Authorization"参数赋值
    private static final String AUTH_HEADER_VALUE = "WSSE realm=\"SDP\",profile=\"UsernameToken\",type=\"Appkey\"";

    public static void main(String[] args) throws Exception {

        //必填,请参考"开发准备"获取如下数据,替换为实际值
        String url = "https://smsapi.cn-north-4.myhuaweicloud.com:443/sms/batchSendDiffSms/v1"; //APP接入地址(在控制台"应用管理"页面获取)+接口访问URI
        String appKey = "c8RWg3ggEcyd4D3p94bf3Y7x1Ile"; //APP_Key
        String appSecret = "q4Ii87BhST9vcs8wvrzN80SfD7Al"; //APP_Secret
        String sender = "csms12345678"; //国内短信签名通道号或国际/港澳台短信通道号
        String templateId1 = "8ff55eac1d0b478ab3c06c3c6a492300"; //模板ID1
        String templateId2 = "8ff55eac1d0b478ab3c06c3c6a492300"; //模板ID2

        //条件必填,国内短信关注,当templateId指定的模板类型为通用模板时生效且必填,必须是已审核通过的,与模板类型一致的签名名称
        //国际/港澳台短信不用关注该参数
        String signature1 = "华为云短信测试"; //签名名称1
        String signature2 = "华为云短信测试"; //签名名称2

        //必填,全局号码格式(包含国家码),示例:+8615123456789,多个号码之间用英文逗号分隔
        String[] receiver1 = {"+86151****6789", "+86152****7890"}; //模板1的接收号码
        String[] receiver2 = {"+86151****6789", "+86152****7890"}; //模板2的接收号码

        //选填,短信状态报告接收地址,推荐使用域名,为空或者不填表示不接收状态报告
        String statusCallBack = "";

        /**
         * 选填,使用无变量模板时请赋空值 String[] templateParas = {};
         * 单变量模板示例:模板内容为"您的验证码是${1}"时,templateParas可填写为{"369751"}
         * 双变量模板示例:模板内容为"您有${1}件快递请到${2}领取"时,templateParas可填写为{"3","人民公园正门"}
         * ${DATE}${TIME}变量不允许取值为空,${TXT_20}变量可以使用英文空格或点号替代空值,${NUM_6}变量可以使用0替代空值
         * 查看更多模板和变量规范:产品介绍>模板和变量规范
         */
        String[] templateParas1 = {"123456"}; //模板1变量，此处以单变量验证码短信为例，请客户自行生成6位验证码，并定义为字符串类型，以杜绝首位0丢失的问题（例如：002569变成了2569）。
        String[] templateParas2 = {"234567"}; //模板2变量，此处以单变量验证码短信为例，请客户自行生成6位验证码，并定义为字符串类型，以杜绝首位0丢失的问题（例如：002569变成了2569）。

        //smsContent,不携带签名名称时,signature请填null
        List<Map<String, Object>> smsContent = new ArrayList<Map<String, Object>>();
        Map<String, Object> item1 = initDiffSms(receiver1, templateId1, templateParas1, signature1);
        Map<String, Object> item2 = initDiffSms(receiver2, templateId2, templateParas2, signature2);
        if (null != item1 && !item1.isEmpty()) {
            smsContent.add(item1);
        }
        if (null != item2 && !item2.isEmpty()) {
            smsContent.add(item2);
        }

        //请求Body
        String body = buildRequestBody(sender, smsContent, statusCallBack);
        if (null == body || body.isEmpty()) {
            System.out.println("body is null.");
            return;
        }

        //请求Headers中的X-WSSE参数值
        String wsseHeader = buildWsseHeader(appKey, appSecret);
        if (null == wsseHeader || wsseHeader.isEmpty()) {
            System.out.println("wsse header is null.");
        }

        Writer out = null;
        BufferedReader in = null;
        StringBuffer result = new StringBuffer();
        HttpsURLConnection connection = null;
        InputStream is = null;

        HostnameVerifier hv = new HostnameVerifier() {

            @Override
            public boolean verify(String hostname, SSLSession session) {
                return true;
            }
        };
        trustAllHttpsCertificates();

        try {
            URL realUrl = new URL(url);
            connection = (HttpsURLConnection) realUrl.openConnection();

            connection.setHostnameVerifier(hv);
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(true);
            //请求方法
            connection.setRequestMethod("POST");
            //请求Headers参数
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", AUTH_HEADER_VALUE);
            connection.setRequestProperty("X-WSSE", wsseHeader);

            connection.connect();
            out = new OutputStreamWriter(connection.getOutputStream());
            out.write(body); //发送请求Body参数
            out.flush();
            out.close();

            int status = connection.getResponseCode();
            if (200 == status) { //200
                is = connection.getInputStream();
            } else { //400/401
                is = connection.getErrorStream();
            }
            in = new BufferedReader(new InputStreamReader(is, "UTF-8"));
            String line = "";
            while ((line = in.readLine()) != null) {
                result.append(line);
            }
            System.out.println(result.toString()); //打印响应消息实体
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (null != out) {
                    out.close();
                }
                if (null != is) {
                    is.close();
                }
                if (null != in) {
                    in.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 构造smsContent参数值
     * @param receiver
     * @param templateId
     * @param templateParas
     * @param signature | 签名名称,使用国内短信通用模板时填写
     * @return
     */
    static Map<String, Object> initDiffSms(String[] receiver, String templateId, String[] templateParas,
            String signature) {
        if (null == receiver || null == templateId || receiver.length == 0 || templateId.isEmpty()) {
            System.out.println("initDiffSms(): receiver or templateId is null.");
            return null;
        }
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("to", receiver);
        map.put("templateId", templateId);
        if (null != templateParas && templateParas.length > 0) {
            map.put("templateParas", templateParas);
        }
        if (null != signature && !signature.isEmpty()) {
            map.put("signature", signature);
        }

        return map;
    }

    /**
     * 构造请求Body体
     * @param sender
     * @param smsContent
     * @param statusCallBack
     * @return
     */
    static String buildRequestBody(String sender, List<Map<String, Object>> smsContent,
            String statusCallBack) {
        if (null == sender || null == smsContent || sender.isEmpty() || smsContent.isEmpty()) {
            System.out.println("buildRequestBody(): sender or smsContent is null.");
            return null;
        }
        JSONArray jsonArr = new JSONArray();

        for(Map<String, Object> it: smsContent){
            jsonArr.put(it);
        }

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("from", sender);
        data.put("smsContent", jsonArr);
        if (null != statusCallBack && !statusCallBack.isEmpty()) {
            data.put("statusCallback", statusCallBack);
        }

        return new JSONObject(data).toString();
    }

    static String buildWsseHeader(String appKey, String appSecret) {
        if (null == appKey || null == appSecret || appKey.isEmpty() || appSecret.isEmpty()) {
            System.out.println("buildWsseHeader(): appKey or appSecret is null.");
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        String time = sdf.format(new Date()); //Created
        String nonce = UUID.randomUUID().toString().replace("-", ""); //Nonce

        MessageDigest md;
        byte[] passwordDigest = null;

        try {
            md = MessageDigest.getInstance("SHA-256");
            md.update((nonce + time + appSecret).getBytes());
            passwordDigest = md.digest();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        //如果JDK版本是1.8,请加载原生Base64类,并使用如下代码
        String passwordDigestBase64Str = Base64.getEncoder().encodeToString(passwordDigest); //PasswordDigest
        //如果JDK版本低于1.8,请加载三方库提供Base64类,并使用如下代码
        //String passwordDigestBase64Str = Base64.encodeBase64String(passwordDigest); //PasswordDigest
        //若passwordDigestBase64Str中包含换行符,请执行如下代码进行修正
        //passwordDigestBase64Str = passwordDigestBase64Str.replaceAll("[\\s*\t\n\r]", "");
        return String.format(WSSE_HEADER_FORMAT, appKey, passwordDigestBase64Str, nonce, time);
    }

    /**
     * @throws Exception
     */
    static void trustAllHttpsCertificates() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                        return;
                    }
                    public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                        return;
                    }
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                }
        };
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, null);
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
    }
}
```

## 接收状态报告

```java
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

/**
 * 短信状态报告 短信平台收到短信网关的状态报告，或超过72小时自主构建状态报告消息通过回调地址推送给客户
 */
public class SmsStatusReport {

    public static void main(String[] args) throws Exception {

        // 短信平台上报状态报告数据样例(urlencode)
        // String success_body = "sequence=1&total=1&updateTime=2018-10-31T08%3A43%3A41Z&source=2&smsMsgId=2ea20735-f856-4376-afbf-570bd70a46ee_11840135&status=DELIVRD";
        String failed_body = "sequence=1&total=1&updateTime=2018-10-31T08%3A43%3A41Z&source=2&smsMsgId=2ea20735-f856-4376-afbf-570bd70a46ee_11840135&status=E200027";
        // onSmsStatusReport(success_body);
        onSmsStatusReport(failed_body);
    }

    /**
     * 解析状态报告数据
     * 
     * @param data 短信平台上报的状态报告数据
     */
    static void onSmsStatusReport(String data) {

        if (null == data || data.isEmpty()) {
            System.out.println("onSmsStatusReport(): data is null.");
            return;
        }
        Map<String, String> keyValues = new HashMap<String, String>();
        try {
            // 解析状态报告数据
            String[] params = URLDecoder.decode(data, "UTF-8").split("&");
            String[] temp;
            for (int i = 0; i < params.length; i++) {
                temp = params[i].split("=");
                if (temp.length == 2 && null != temp[1] && temp[1] != "") {
                    keyValues.put(temp[0], temp[1]);
                }
            }

            /**
             * Example: 此处已解析status为例,请按需解析所需参数并自行实现相关处理
             * 
             * 'smsMsgId': 短信唯一标识
             * 'total': 长短信拆分条数
             * 'sequence': 拆分后短信序号
             * 'source': 状态报告来源
             * 'updateTime': 资源更新时间
             * 'status': 状态码
             */
            String status = keyValues.get("status"); // 状态报告枚举值
            // 通过status判断短信是否发送成功
            if ("DELIVRD".equalsIgnoreCase(status)) {
                System.out.println("Send sms success. smsMsgId: " + keyValues.get("smsMsgId"));
            } else {
                // 发送失败,打印status和orgCode
                System.out.println("Send sms failed. smsMsgId: " + keyValues.get("smsMsgId"));
                System.out.println("Failed status: " + status);
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
}
```

## 接收上行短信

```java
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

/**
 * 上行短信通知 短信平台通过客户添加应用时配置的上行短信接收地址推送上行短信通知给客户
 */
public class SmsUpData {
    public static void main(String[] args) throws Exception {

        // 上行短信通知样例(urlencode)
         String upData = "from=%2B86151****6789&to=1069***2019&body=********&smsMsgId=9692b5be-c427-4525-8e73-cf4a6ac5b3f7";
         onSmsUpData(upData);
    }

    /**
     * 解析上行短信通知数据
     * 
     * @param data 短信平台推送的上行短信通知数据
     */
    static void onSmsUpData(String data) {

        if (null == data || data.isEmpty()) {
            System.out.println("onSmsUpData(): data is null.");
            return;
        }
        Map<String, String> keyValues = new HashMap<String, String>();
        try {
            // 解析上行短信通知数据
            String[] params = URLDecoder.decode(data, "UTF-8").split("&");
            String[] temp;
            for (int i = 0; i < params.length; i++) {
                temp = params[i].split("=");
                if (temp.length == 2 && null != temp[1] && temp[1] != "") {
                    keyValues.put(temp[0], temp[1]);
                }
            }

            /**
             * Example: 此处已解析body为例,请按需解析所需参数并自行实现相关处理
             * 
             * 'smsMsgId': 上行短信唯一标识
             * 'from': 上行短信发送方的号码
             * 'to': 上行短信接收方的号码
             * 'body': 上行短信发送的内容
             */
            String body = keyValues.get("body"); // 上行短信发送的内容
            System.out.println("Sms up data. Body: " + body);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
}
```


# 参考资料

https://support.huaweicloud.com/devg-msgsms/sms_04_0002.html

* any list
{:toc}