if (!window.console || !console.log) {
    try {
        var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
        window.console = {};
        for (var i = 0; i < names.length; ++i) {
            window.console[names[i]] = function () {
            }
        }
    } catch (e) {
    }
}
var Util = Util || {};
Util.windowHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight
};
Util.getValPX = function (val) {
    var PX = "px";
    if (val.indexOf(PX) > -1) {
        return val.split(PX)[0]
    }
    return val
};
Util.isMobile = function () {
    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {
                trident: u.indexOf("Trident") > -1,
                presto: u.indexOf("Presto") > -1,
                webKit: u.indexOf("AppleWebKit") > -1,
                gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1,
                mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1,
                iPhone: u.indexOf("iPhone") > -1,
                iPad: u.indexOf("iPad") > -1,
                webApp: u.indexOf("Safari") == -1
            }
        }(), language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };
    if (browser.versions.mobile || browser.versions.ios || browser.versions.android || browser.versions.iPhone || browser.versions.iPad) {
        return true
    }
    return false
};
Util.cancelBubble = function (event) {
    if (event && event.stopPropagation) {
        event.stopPropagation()
    } else {
        window.event.cancelBubble = true
    }
};
Util.enterCode = function (event) {
    var theEvent = event || window.event;
    return theEvent.keyCode || theEvent.which || theEvent.charCode
};
Util.showMsg = function (msgText, msgType, showSeconds, showShade) {
    var mType = 1;
    mType = (msgType === "warning") ? 0 : mType;
    mType = (msgType === "error") ? 3 : mType;
    var mSeconds = showSeconds || 2;
    var mShade = showShade || false;
    $.layer({
        shade: (mShade === false) ? [0] : [0.5, "#000"],
        shadeClose: false,
        title: false,
        closeBtn: false,
        time: mSeconds,
        dialog: {type: mType, msg: msgText}
    })
};
Util.Regex = {
    _Date: /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/,
    _Url: /^(http|https|ftp|mailto)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~!])*$/i,
    _Mail: /^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
    _Digit: /^[-+]?[0-9]+$/,
    _Number: /^[-+]?\d*\.?\d+$/,
    _Mobile: /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
    _TelDigit: /^[-]?[0-9-]+$/,
    _Text: /^[a-z\d\u4E00-\u9FA5]+$/i,
    _ImageFile: /(\.|\/)(gif|jpe?g|png)$/i,
    _Int: /^-?[1-9]\d*$|0/,
    _IntPositive: /^[1-9]\d*$/,
    _IntNegative: /^-[1-9]\d*$/,
    _IntNotNegative: /^[1-9]\d*|0$/,
    _IntNotPositive: /^-[1-9]\d*|0$/,
    isInt: function (val) {
        return this._Int.test(val)
    },
    isIntPositive: function (val) {
        return this._IntPositive.test(val)
    },
    isIntNegative: function (val) {
        return this._IntNegative.test(val)
    },
    isIntNotNegative: function (val) {
        return this._IntNotNegative.test(val)
    },
    isIntNotPositive: function () {
        return this._IntNotPositive.test(val)
    },
    isDate: function (val) {
        return this._Date.test(val)
    },
    isUrl: function (val) {
        return this._Url.test(val)
    },
    isMail: function (val) {
        return this._Mail.test(val)
    },
    isDigit: function (val) {
        return this._Digit.test(val)
    },
    isNumber: function (val) {
        return this._Number.test(val)
    },
    isNotBlank: function (val) {
        return !val || $.trim(val).length == 0
    },
    isMobile: function (val) {
        return this._Mobile.test(val)
    },
    isTelDigit: function (val) {
        return this._TelDigit.test(val)
    },
    isValidText: function (val) {
        return this._Text.test(val)
    },
    isImageFile: function (val) {
        return this._ImageFile.test(val)
    }
};
$regex = Util.Regex;