/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Util|*|{}}
 */
var Util = Util || {};
Util.windowHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight;
};
Util.getValPX = function(val) {
    var PX = 'px';
    if(val.indexOf(PX) > -1) {
        return val.split(PX)[0];
    }
    return val;
};

$(document).ready(function() {
    initContentHeight();
    initScrollBar();
});


function initContentHeight() {
    var content = $('.page-content');
    var headHeight = $('.site-header').height();
    var wh = Util.windowHeight();
    content.css('min-height', wh-headHeight);
}

function initScrollBar() {
    //var headHeight = $('.site-header').height();
    var footHeight = $('.site-footer').height();
    var contentMinHeight = $('.page-content').css('min-height');
    var pageContentWarp = $('.page-body-warp');
    pageContentWarp.css('height', footHeight+Util.getValPX(contentMinHeight)).css('overflow-y', 'auto');
    pageContentWarp.perfectScrollbar({
        swipePropagation: false
    });
}
