/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Util|*|{}}
 */
var Util = Util || {};
Util.windowHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight;
};

$(document).ready(function() {
    initContentHeight();
});


function initContentHeight() {
    var content = $('.page-content');
    var headHeight = $('.site-header').height();
    var wh = Util.windowHeight();
    content.css('min-height', wh-headHeight);
}
