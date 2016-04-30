/**
 * !
 * Created by houbb, All rights reserved.
 * This is a util js.
 * @type {Util|*|{}}
 */
var Util = Util || {};

/**
 * get thw window height dynamic.
 * @returns {Number|number}
 */
Util.windowHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight;
};

Util.getInfo = function () {
    var s = "";
    s += " 网页可见区域宽："+ document.body.clientWidth;
    s += " 网页可见区域高："+ document.body.clientHeight;
    s += " 网页可见区域宽："+ document.body.offsetWidth + " (包括边线和滚动条的宽)";
    s += " 网页可见区域高："+ document.body.offsetHeight + " (包括边线的宽)";
    s += " 网页正文全文宽："+ document.body.scrollWidth;
    s += " 网页正文全文高："+ document.body.scrollHeight;
    s += " 网页被卷去的高(ff)："+ document.body.scrollTop;
    s += " 网页被卷去的高(ie)："+ document.documentElement.scrollTop;
    s += " 网页被卷去的左："+ document.body.scrollLeft;
    s += " 网页正文部分上："+ window.screenTop;
    s += " 网页正文部分左："+ window.screenLeft;
    s += " 屏幕分辨率的高："+ window.screen.height;
    s += " 屏幕分辨率的宽："+ window.screen.width;
    s += " 屏幕可用工作区高度："+ window.screen.availHeight;
    s += " 屏幕可用工作区宽度："+ window.screen.availWidth;
    s += " 你的屏幕设置是 "+ window.screen.colorDepth +" 位彩色";
    s += " 你的屏幕设置 "+ window.screen.deviceXDPI +" 像素/英寸";
    return s;
};

/**
 * get the number value of width/height
 * @param val
 * @returns {*}
 */
Util.getValPX = function(val) {
    var PX = 'px';
    if(val.indexOf(PX) > -1) {
        return val.split(PX)[0];
    }
    return val;
};

/**
 * browser
 */
Util.isMobile = function() {
    var browser={
        versions:function(){
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language:(navigator.browserLanguage || navigator.language).toLowerCase()
    }

    if(browser.versions.mobile || browser.versions.ios || browser.versions.android ||
        browser.versions.iPhone || browser.versions.iPad){
        return true;
    }
    return false;
};


/**
 * cancel bubble
 */
Util.cancelBubble = function(event) {
    if (event && event.stopPropagation) {event.stopPropagation(); } else { window.event.cancelBubble = true;}
};

/**
 * Get enter code
 * @param event
 * @returns {Number|Object|string}
 */
Util.enterCode = function(event) {
    var theEvent = event || window.event;
    return theEvent.keyCode || theEvent.which || theEvent.charCode;
};