/**
 * 复制
 * https://blog.csdn.net/qq_36509946/article/details/123583237
 *
 * @param data 数据
 */
 function copy(data)
 {
     const url = data;
     const oInput = document.createElement('input');
     oInput.value = url;
     document.body.appendChild(oInput);
     oInput.select(); // 选择对象;
     document.execCommand('Copy'); // 执行浏览器复制命令
     oInput.remove()
 };

function $(id) {
    return document.getElementById(id);
}

// 日期格式化
Date.prototype.formatDate = function (fmt) { 
    "use strict"; 

    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "H+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
} ;


function parseDate(yyyyMMddHHmmss) {
    let date = new Date(yyyyMMddHHmmss.replace('-', '/'));

    return date;
}